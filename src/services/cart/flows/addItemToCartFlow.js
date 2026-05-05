import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getCartApiBaseUrl, asFlowError } from "../cartApiUtils.js";

/**
 * Flow to add an item to the shopping cart.
 * 
 * @param {Object} params
 * @param {Object} params.payload - Input parameters (productId, quantity, etc.)
 */
export async function addItemToCartFlow({ payload, context, api }) {
  const baseUrl = getCartApiBaseUrl(context);
  const sessionId = payload?.sessionId || localStorage.getItem("sessionId") || "guest";
  const url = `${baseUrl}/cart/${sessionId}/items`;

  // Validation: Check for required fields
  if (payload?.productId == null || payload?.productId === "") {
    return fail({
      code: "MISSING_PRODUCT_ID",
      message: "productId is required to add an item to the cart.",
    });
  }

  // Handle "Fallback to Admin" logic on frontend as requested by user
  // This is a temporary frontend implementation and will be migrated to backend later.
  const vendorId = payload?.vendorId || "admin";

  try {
    const response = await api.post(url, {
      productId: payload.productId,
      quantity: payload.quantity || 1,
      type: payload.type || "standard",
      vendor: vendorId,
    }, {
      headers: context.requestHeaders || {},
      signal: context.signal,
      timeoutMs: context.requestTimeoutMs,
    });

    if (response?.ok === false) {
      return fail({
        code: "ADD_ITEM_FAILED",
        message: response?.error || "Failed to add item to cart.",
        details: response,
      });
    }

    return ok(
      {
        items: response?.items || [],
        summary: response?.summary || {},
      },
      {
        flow: "cart.addItem",
        status: response?.status || 200,
        addedAt: Date.now(),
      }
    );
  } catch (error) {
    return asFlowError(
      error,
      "ADD_ITEM_UNEXPECTED",
      "An unexpected error occurred while adding the item."
    );
  }
}
