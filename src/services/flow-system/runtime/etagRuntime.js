import { buildPayloadHash, resolveStorage } from "@/services/flow-system/runtime/cacheRuntime.js";

const ETAG_PREFIX = "__flow_etag__:";
const memoryEtag = new Map();

export function buildEtagKey(flowName, payload, config = {}) {
  const varyByPayload = config.varyByPayload !== false;
  const payloadPart = varyByPayload ? buildPayloadHash(payload) : "shared";
  return `${ETAG_PREFIX}${flowName}:${payloadPart}`;
}

export function loadEtag({ storage, key }) {
  if (storage) return storage.getItem(key) || null;
  return memoryEtag.get(key) || null;
}

export function saveEtag({ storage, key, etag }) {
  if (!etag) return;
  if (storage) {
    storage.setItem(key, String(etag));
    return;
  }
  memoryEtag.set(key, String(etag));
}

export function attachIfNoneMatch(headers = {}, etag) {
  if (!etag) return headers;
  return { ...headers, "If-None-Match": etag };
}

export function resolveEtagStorage(explicitStorage) {
  return resolveStorage(explicitStorage);
}

export function extractEtag(flowResult) {
  return (
    flowResult?.meta?.etag ||
    flowResult?.meta?.headers?.etag ||
    flowResult?.meta?.headers?.ETag ||
    flowResult?.data?.etag ||
    null
  );
}

export function isNotModifiedResult(flowResult) {
  return (
    flowResult?.meta?.notModified === true ||
    Number(flowResult?.meta?.status) === 304 ||
    Number(flowResult?.meta?.httpStatus) === 304
  );
}

