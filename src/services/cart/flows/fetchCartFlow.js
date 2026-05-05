import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus, getEtag, isApiNotModified } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getCartApiBaseUrl, asFlowError } from "../cartApiUtils.js";

/**
 * Flow to fetch the current user's cart including items and summary.
 * Implements ETag support for efficient polling.
 * 
 * @param {Object} params
 * @param {Object} params.payload - Input parameters (sessionId, userId, etc.)
 * @param {Object} params.context - Pipeline context (headers, signal, etc.)
 * @param {Object} params.api - API client
 */
export async function fetchCartFlow({ payload, context, api }) {
  const baseUrl = getCartApiBaseUrl(context);
  const sessionId = payload?.sessionId || localStorage.getItem("sessionId") || "guest";
  const endpoint = `${baseUrl}/cart/${sessionId}`;

  try {
    const response = await api.get(endpoint, {
      headers: context.requestHeaders || {},
      signal: context.signal,
      timeoutMs: context.requestTimeoutMs,
    });

    if (response?.ok === false) {
      return fail({
        code: "FETCH_CART_FAILED",
        message: response?.error || "Failed to fetch cart. Please try again later.",
        details: response,
      });
    }

    const status = getHttpStatus(response, 200);
    const etag = getEtag(response);
    const notModified = isApiNotModified(response);

    // If 304, the pipeline runtime (readPipeline.js) handles merging from cache if configured.
    // For manual handling, you'd extract cached data here if needed.
    
    return ok(
      {
        items: response?.items || [],
        summary: response?.summary || {},
        etag: etag, // Passed along to update store metadata
      },
      {
        flow: "cart.fetch",
        status,
        etag,
        notModified,
        fetchedAt: Date.now(),
      }
    );
  } catch (error) {
    return asFlowError(
      error,
      "FETCH_CART_UNEXPECTED",
      "An unexpected error occurred while fetching your cart."
    );
  }
}
