import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getCartApiBaseUrl, asFlowError } from "../cartApiUtils.js";

/**
 * Flow to update item quantity in the shopping cart.
 */
export async function updateItemQuantityFlow({ payload, context, api }) {
  const baseUrl = getCartApiBaseUrl(context);
  const sessionId = payload?.sessionId || localStorage.getItem("sessionId") || "guest";
  const url = `${baseUrl}/cart/${sessionId}/items/${payload.productId}/quantity`;

  if (payload?.productId == null || payload?.productId === "") {
    return fail({
      code: "MISSING_PRODUCT_ID",
      message: "productId is required to update quantity.",
    });
  }

  const quantity = Number(payload?.quantity);
  if (isNaN(quantity) || quantity < 0) {
    return fail({
      code: "INVALID_QUANTITY",
      message: "A valid positive quantity is required.",
    });
  }

  try {
    const response = await api.patch(url, {
      quantity: quantity,
    }, {
      headers: context.requestHeaders || {},
      signal: context.signal,
      timeoutMs: context.requestTimeoutMs,
    });

    if (response?.ok === false) {
      return fail({
        code: "UPDATE_QUANTITY_FAILED",
        message: response?.error || "Failed to update item quantity.",
        details: response,
      });
    }

    return ok(
      {
        items: response?.items || [],
        summary: response?.summary || {},
      },
      {
        flow: "cart.updateQuantity",
        status: response?.status || 200,
        updatedAt: Date.now(),
      }
    );
  } catch (error) {
    return asFlowError(
      error,
      "UPDATE_QUANTITY_UNEXPECTED",
      "An unexpected error occurred while updating the quantity."
    );
  }
}
