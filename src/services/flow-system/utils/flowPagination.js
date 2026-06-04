import { fail } from "@/services/flow-system/flowTypes.js";

/**
 * Paginated flow runs (FEAT-09).
 *
 * Example — `orders.fetchOrders` (page + per_page query fields):
 * ```js
 * await FlowHandler.run('orders.fetchOrders', { ownerId: 'creator-1' }, {
 *   paginate: {
 *     pageField: 'page',
 *     perPageField: 'per_page',
 *     perPage: 10,
 *     maxPages: 20,
 *   },
 * });
 * ```
 * Merged result: `data.items` appended across pages; `meta.pagesFetched` set.
 */

function defaultHasMore(result, page, config) {
  const pagination = result?.data?.pagination;
  if (pagination && Number.isFinite(Number(pagination.totalPages))) {
    return page < Number(pagination.totalPages);
  }

  const items = result?.data?.items;
  if (Array.isArray(items)) {
    const perPage = Number(config.perPage) || items.length || 0;
    return perPage > 0 && items.length >= perPage;
  }

  return false;
}

function defaultMergePages(accumulated, pageResult) {
  const prevItems = accumulated?.data?.items || [];
  const nextItems = pageResult?.data?.items || [];
  return {
    ...pageResult,
    data: {
      ...(pageResult?.data || {}),
      items: [...prevItems, ...nextItems],
      pagination: pageResult?.data?.pagination || accumulated?.data?.pagination,
      totalCount: pageResult?.data?.totalCount ?? accumulated?.data?.totalCount,
    },
    meta: {
      ...(pageResult?.meta || {}),
      pagesFetched: (accumulated?.meta?.pagesFetched || 1) + 1,
    },
  };
}

export function resolvePaginateConfig(options = {}) {
  const paginate = options.paginate;
  if (!paginate || typeof paginate !== "object") return null;

  return {
    startPage: Number.isFinite(Number(paginate.startPage)) ? Number(paginate.startPage) : 1,
    maxPages: Math.max(1, Number(paginate.maxPages) || 20),
    pageField: paginate.pageField || "page",
    perPageField: paginate.perPageField || "per_page",
    perPage: Number.isFinite(Number(paginate.perPage)) ? Number(paginate.perPage) : 10,
    hasMore: typeof paginate.hasMore === "function" ? paginate.hasMore : defaultHasMore,
    mergePages: typeof paginate.mergePages === "function" ? paginate.mergePages : defaultMergePages,
    buildPayload: typeof paginate.buildPayload === "function"
      ? paginate.buildPayload
      : (basePayload, page, config) => ({
        ...basePayload,
        [config.pageField]: page,
        [config.perPageField]: config.perPage,
      }),
  };
}

export async function runPaginatedFlow(runOnce, { flowName, payload, options }) {
  const config = resolvePaginateConfig(options);
  if (!config) {
    return fail({
      code: "PAGINATE_CONFIG_INVALID",
      message: `Flow '${flowName}' paginate options are invalid.`,
    });
  }

  let page = config.startPage;
  let accumulated = null;
  let pagesFetched = 0;

  while (pagesFetched < config.maxPages) {
    const pagePayload = config.buildPayload(payload, page, config);
    const result = await runOnce(pagePayload, { ...options, paginate: undefined });
    pagesFetched += 1;

    if (!result?.ok) {
      return {
        ...result,
        meta: { ...(result.meta || {}), pagesFetched, lastPage: page },
      };
    }

    accumulated = accumulated ? config.mergePages(accumulated, result) : result;
    accumulated.meta = { ...(accumulated.meta || {}), pagesFetched, lastPage: page };

    if (!config.hasMore(result, page, config)) {
      break;
    }

    page += 1;
  }

  return accumulated;
}

/** Convenience wrapper for orders.fetchOrders pagination (page / per_page). */
export function runOrdersFetchPaginated(FlowHandler, payload = {}, options = {}) {
  return FlowHandler.run("orders.fetchOrders", payload, {
    ...options,
    paginate: {
      pageField: "page",
      perPageField: "per_page",
      perPage: 10,
      maxPages: 20,
      ...options.paginate,
    },
  });
}
