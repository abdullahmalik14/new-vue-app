import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus, getEtag, isApiNotModified } from "@/services/flow-system/runtime/httpMetaRuntime.js";

/**
 * fetchOrdersFlow
 * 
 * Flow for fetching orders for the dashboard with pagination and filtering.
 * Supports ETag-based caching for efficiency.
 * 
 * @param {Object} params
 * @param {Object} params.payload - Input filters (ownerId, customerId, status, type, page, etc.)
 * @param {Object} params.context - Pipeline context (headers, signal, etc.)
 * @param {Object} params.api - API client
 */
export async function fetchOrdersFlow({ payload, context, api }) {
  const isReceived = payload.ownerId; // "Orders Received" view if ownerId is present
  const endpoint = isReceived ? "/orders/received" : "/orders/purchased";
  
  try {
    const response = await api.get(endpoint, {
      params: {
        page: payload.page || 1,
        per_page: payload.per_page || 10,
        status: payload.status,
        type: payload.type,
        search: payload.search,
        ownerId: payload.ownerId,
        customerId: payload.customerId,
      },
      headers: context.requestHeaders || {},
      signal: context.signal,
      timeoutMs: context.requestTimeoutMs || 12000,
    });

    if (response?.ok === false) {
      return fail({
        code: "FETCH_ORDERS_FAILED",
        message: response?.error || "Failed to fetch orders. Please try again later.",
        details: response,
      });
    }

    const status = getHttpStatus(response, 200);
    const etag = getEtag(response);
    const notModified = isApiNotModified(response);

    return ok(
      {
        items: response?.items || [],
        totalCount: response?.totalCount || 0,
        pagination: response?.pagination || {},
        etag: etag,
      },
      {
        flow: "orders.fetch",
        status,
        etag,
        notModified,
        fetchedAt: Date.now(),
      }
    );
  } catch (error) {
    return fail({
      code: "FETCH_ORDERS_UNEXPECTED",
      message: error?.message || "An unexpected error occurred while fetching orders.",
      details: error,
    });
  }
}
