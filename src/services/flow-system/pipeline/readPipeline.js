import { ok } from "@/services/flow-system/flowTypes.js";
import { blockedByConcurrency, mergeMeta, normalizeExecutionError } from "@/services/flow-system/pipeline/pipelineResult.js";
import { executeWithRetry } from "@/services/flow-system/runtime/retryRuntime.js";
import { buildConcurrencyKey, acquireRunSlot } from "@/services/flow-system/runtime/concurrencyRuntime.js";
import {
  buildCacheKey,
  resolveStorage,
  readCacheEntry,
  writeCacheEntry,
  migrateCacheEntry,
} from "@/services/flow-system/runtime/cacheRuntime.js";
import {
  buildEtagKey,
  resolveEtagStorage,
  loadEtag,
  saveEtag,
  attachIfNoneMatch,
  extractEtag,
  isNotModifiedResult,
} from "@/services/flow-system/runtime/etagRuntime.js";
import { applyDestinations } from "@/services/flow-system/runtime/destinationRuntime.js";
import {
  resolveReadFromConfig,
  readConfiguredSourceSnapshots,
  selectBestSourceSnapshot,
  isFreshSnapshot,
  writeFreshnessMetaToDestinations,
} from "@/services/flow-system/runtime/readSourceRuntime.js";

async function runReadOnce(context) {
  const result = await context.executeFlow({ payload: context.payload, context });
  return mergeMeta(result, { source: "network" });
}

function applyFromResponseMapper(flowResult, context) {
  const fromResponse = context?.mapper?.fromResponse;
  if (typeof fromResponse !== "function") return flowResult;

  try {
    const mappedData = fromResponse(flowResult.data, context, flowResult);
    flowResult.data = mappedData;
    flowResult.meta = { ...(flowResult.meta || {}), mappedBy: "fromResponse" };
    return flowResult;
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "MAPPER_FROM_RESPONSE_FAILED",
        message: `fromResponse mapper failed for flow '${context.flowName}'.`,
        details: error,
      },
      meta: { flow: context.flowName, runId: context.runId },
    };
  }
}

function isReadHitDestinationSafeByDefault(dest = {}) {
  const type = dest.type;
  const mode = dest.mode || "set";

  // Destinations with explicit static/runtime value are often side-effect writes
  // (for example @now metadata/audit entries). Skip by default on read-hit hydration.
  if (dest.value !== undefined) return false;

  if (type === "stateEngine") {
    return mode === "set" || mode === "merge";
  }

  if (type === "piniaAction") {
    return !!dest.action;
  }

  if (type === "piniaPatch") {
    // Function patches can include non-idempotent side effects.
    return typeof dest.patch !== "function";
  }

  return false;
}

function resolveReadHitDestinations(destinations = []) {
  if (!Array.isArray(destinations)) return [];

  return destinations.filter((dest) => {
    if (dest?.hydrateOnReadHit === true) return true;
    if (dest?.hydrateOnReadHit === false) return false;
    return isReadHitDestinationSafeByDefault(dest);
  });
}

function hydrateReadHitDestinations(context, data, sourceMeta = {}) {
  if (context.runtimeOptions.skipDestinations) {
    return data;
  }

  const syntheticResult = {
    ok: true,
    data,
    meta: { flow: context.flowName, runId: context.runId, ...sourceMeta },
  };

  const destinationResult = applyDestinations({
    context,
    flowResult: syntheticResult,
    destinations: resolveReadHitDestinations(context.pipeline?.destinations || []),
  });

  if (destinationResult.returnData !== undefined) {
    return destinationResult.returnData;
  }

  return syntheticResult.data;
}

function buildDestinationHitResult(snapshot, context, { stale, backgroundRefreshStarted = false }) {
  const hydratedData = hydrateReadHitDestinations(context, snapshot.data, {
    source: "destination",
    destinationType: snapshot.destinationType,
  });

  return ok(hydratedData, {
    flow: context.flowName,
    runId: context.runId,
    source: "destination",
    destinationType: snapshot.destinationType,
    stale: !!stale,
    backgroundRefreshStarted: !!backgroundRefreshStarted,
  });
}

function resolveNotModifiedData({ context, storage, useLocalCache, cacheKey, cacheConfig, readFromConfig, fallbackData }) {
  if (readFromConfig?.enabled) {
    const snapshots = readConfiguredSourceSnapshots(context, readFromConfig);
    const bestSnapshot = selectBestSourceSnapshot(snapshots, readFromConfig.priority);
    if (bestSnapshot?.hit && bestSnapshot.data !== undefined && bestSnapshot.data !== null) {
      return bestSnapshot.data;
    }
  }

  if (useLocalCache) {
    const cached = readCacheEntry({
      storage,
      key: cacheKey,
      version: cacheConfig.version,
    });
    if (cached.hit) {
      return cached.record.data;
    }
  }

  return fallbackData;
}

function getSnapshotTtlMs(snapshot, readFromConfig) {
  const sourceTtlMs = Number(snapshot?.source?.ttlMs);
  if (Number.isFinite(sourceTtlMs)) {
    return sourceTtlMs;
  }
  return readFromConfig.ttlMs;
}

function startBackgroundRevalidate(context) {
  if (context.runtimeOptions.backgroundRevalidate) return false;
  if (typeof context.rerunFlow !== "function") return false;

  setTimeout(() => {
    context.rerunFlow({
      forceRefresh: true,
      skipDestinationRead: true,
      backgroundRevalidate: true,
    }).catch(() => {});
  }, 0);

  return true;
}

export async function runReadPipeline(context) {
  const pipeline = context.pipeline || {};
  const concurrencyConfig = pipeline.concurrency || {};
  const concurrencyKey = buildConcurrencyKey(context.flowName, context.payload, concurrencyConfig);
  const slot = acquireRunSlot({
    key: concurrencyKey,
    policy: concurrencyConfig.policy || "latestWins",
    dedupe: !!concurrencyConfig.dedupe,
  });

  if (slot.mode === "deduped") {
    return slot.promise;
  }

  if (slot.mode === "blocked") {
    return blockedByConcurrency(context.flowName, concurrencyKey);
  }

  context.signal = slot.abortController.signal;

  const runPromise = (async () => {
    try {
      const storage = resolveStorage(context.storage);
      const cacheConfig = pipeline.localCache || {};
      const useLocalCache = !!cacheConfig.enabled;
      const cacheKey = buildCacheKey(context.flowName, context.payload, cacheConfig);
      const readFromConfig = resolveReadFromConfig(context);
      const shouldTryDestinationRead = (
        readFromConfig.enabled &&
        !context.runtimeOptions.forceRefresh &&
        !context.runtimeOptions.skipDestinationRead
      );

      if (shouldTryDestinationRead) {
        const nowMs = Date.now();
        const snapshots = readConfiguredSourceSnapshots(context, readFromConfig);

        if (snapshots.length > 0) {
          const freshSnapshots = snapshots.filter((snapshot) => (
            isFreshSnapshot(snapshot, getSnapshotTtlMs(snapshot, readFromConfig), nowMs)
          ));
          const freshSnapshot = selectBestSourceSnapshot(freshSnapshots, readFromConfig.priority);

          if (freshSnapshot) {
            return buildDestinationHitResult(freshSnapshot, context, { stale: false });
          }

          const staleSnapshot = selectBestSourceSnapshot(snapshots, readFromConfig.priority);
          const shouldServeStale = (
            staleSnapshot &&
            readFromConfig.mode === "staleWhileRevalidate" &&
            !context.runtimeOptions.backgroundRevalidate
          );

          if (shouldServeStale) {
            const backgroundRefreshStarted = startBackgroundRevalidate(context);
            return buildDestinationHitResult(staleSnapshot, context, {
              stale: true,
              backgroundRefreshStarted,
            });
          }
        }
      }

      if (useLocalCache && !context.runtimeOptions.forceRefresh) {
        let cached = readCacheEntry({
          storage,
          key: cacheKey,
          version: cacheConfig.version,
        });
        if (!cached.hit && cached.reason === "version_mismatch" && typeof cacheConfig.migrate === "function") {
          const migrated = migrateCacheEntry({
            storage,
            key: cacheKey,
            record: cached.record,
            version: cacheConfig.version,
            migrate: cacheConfig.migrate,
          });
          if (migrated?.migrated) {
            cached = readCacheEntry({
              storage,
              key: cacheKey,
              version: cacheConfig.version,
            });
          }
        }
        if (cached.hit) {
          const hydratedData = hydrateReadHitDestinations(context, cached.record.data, {
            source: "cache",
            cacheKey,
          });

          return ok(hydratedData, {
            flow: context.flowName,
            source: "cache",
            cacheKey,
            runId: context.runId,
          });
        }
      }

      const etagConfig = pipeline.etag || {};
      let loadedEtag = null;
      if (etagConfig.enabled && !context.runtimeOptions.bypassEtag) {
        const etagStorage = resolveEtagStorage(context.storage);
        const etagKey = buildEtagKey(context.flowName, context.payload, etagConfig);
        loadedEtag = loadEtag({ storage: etagStorage, key: etagKey });
        context.requestHeaders = attachIfNoneMatch(context.requestHeaders, loadedEtag);
      }

      const result = await executeWithRetry({
        operation: () => runReadOnce(context),
        retry: pipeline.retry,
        fallbackAttempts: context.retryAttempts,
      });

      if (!result?.ok) {
        return mergeMeta(result, { flow: context.flowName, runId: context.runId });
      }

      if (isNotModifiedResult(result)) {
        const resolvedData = resolveNotModifiedData({
          context,
          storage,
          useLocalCache,
          cacheKey,
          cacheConfig,
          readFromConfig,
          fallbackData: result.data,
        });
        result.data = hydrateReadHitDestinations(context, resolvedData, {
          source: "notModified",
          notModified: true,
        });

        if (!context.runtimeOptions.skipDestinations) {
          applyDestinations({
            context,
            flowResult: result,
            destinations: pipeline.onNotModified || [],
          });
        }
        const resolvedEtag = extractEtag(result) || loadedEtag || null;
        writeFreshnessMetaToDestinations(context, resolvedEtag, Date.now());
        return mergeMeta(result, { flow: context.flowName, runId: context.runId, notModified: true });
      }

      const mappedResult = applyFromResponseMapper(result, context);
      if (!mappedResult?.ok) {
        return mappedResult;
      }

      const freshUpdatedAt = Date.now();
      const nextEtag = extractEtag(result);

      if (etagConfig.enabled) {
        const etagStorage = resolveEtagStorage(context.storage);
        const etagKey = buildEtagKey(context.flowName, context.payload, etagConfig);
        saveEtag({ storage: etagStorage, key: etagKey, etag: nextEtag });
      }

      if (!context.runtimeOptions.skipDestinations) {
        const destinationResult = applyDestinations({
          context,
          flowResult: result,
          destinations: pipeline.destinations || [],
        });
        if (destinationResult.returnData !== undefined) {
          result.data = destinationResult.returnData;
        }
      }

      if (useLocalCache) {
        writeCacheEntry({
          storage,
          key: cacheKey,
          data: result.data,
          ttlMs: cacheConfig.ttlMs,
          version: cacheConfig.version,
          meta: { flow: context.flowName, runId: context.runId, etag: nextEtag || undefined, updatedAt: freshUpdatedAt },
        });
      }

      writeFreshnessMetaToDestinations(context, nextEtag || null, freshUpdatedAt);

      return mergeMeta(result, { flow: context.flowName, runId: context.runId, concurrencyKey });
    } catch (error) {
      return mergeMeta(normalizeExecutionError(error, "READ_PIPELINE_FAILED"), {
        flow: context.flowName,
        runId: context.runId,
      });
    }
  })();

  slot.registerPromise(runPromise);
  return runPromise.finally(() => slot.release());
}
