import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getCartApiBaseUrl, asFlowError } from "../cartApiUtils.js";

/**
 * applyFeesFlow
 * Adds fees (like service fees) to the cart.
 */
export async function applyFeesFlow({ payload, context, api }) {
  const baseUrl = getCartApiBaseUrl(context);
  const sessionId = payload?.sessionId || localStorage.getItem("sessionId") || "guest";
  const { fees } = payload || {};

  if (!fees || typeof fees !== 'object') {
    return fail({ code: "INVALID_FEES", message: "Fees object is required" });
  }

  const url = `${baseUrl}/cart/${sessionId}/fees`;

  try {
    const response = await api.post(url, fees, {
      headers: context.requestHeaders,
      signal: context.signal,
    });

    if (response?.ok === false) {
      return fail({
        code: "APPLY_FEES_FAILED",
        message: response?.error || "Failed to apply fees",
      });
    }

    return ok(response, { flow: "cart.applyFees" });
  } catch (error) {
    return asFlowError(error, "APPLY_FEES_UNEXPECTED", "Unexpected error.");
  }
}
