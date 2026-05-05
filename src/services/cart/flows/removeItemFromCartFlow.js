import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getCartApiBaseUrl, asFlowError } from "../cartApiUtils.js";

/**
 * Flow to remove an item from the shopping cart.
 */
export async function removeItemFromCartFlow({ payload, context, api }) {
  const baseUrl = getCartApiBaseUrl(context);
  const sessionId = payload?.sessionId || localStorage.getItem("sessionId") || "guest";
  const url = `${baseUrl}/cart/${sessionId}/items/${payload.productId}`;

  if (payload?.productId == null || payload?.productId === "") {
    return fail({
      code: "MISSING_PRODUCT_ID",
      message: "productId is required to remove an item from the cart.",
    });
  }

  try {
    const response = await api.delete(url, {
      headers: context.requestHeaders || {},
      signal: context.signal,
      timeoutMs: context.requestTimeoutMs,
    });

    if (response?.ok === false) {
      return fail({
        code: "REMOVE_ITEM_FAILED",
        message: response?.error || "Failed to remove item from cart.",
        details: response,
      });
    }

    return ok(
      {
        items: response?.items || [],
        summary: response?.summary || {},
      },
      {
        flow: "cart.removeItem",
        status: response?.status || 200,
        removedAt: Date.now(),
      }
    );
  } catch (error) {
    return asFlowError(
      error,
      "REMOVE_ITEM_UNEXPECTED",
      "An unexpected error occurred while removing the item."
    );
  }
}
