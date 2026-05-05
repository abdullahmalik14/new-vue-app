import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getCartApiBaseUrl, asFlowError } from "../cartApiUtils.js";

/**
 * remindAbandonedCartsFlow
 * Simulates a background check for abandoned carts and triggers a reminder.
 */
export async function remindAbandonedCartsFlow({ payload, context, api }) {
  const baseUrl = getCartApiBaseUrl(context);
  const sessionId = payload?.sessionId || localStorage.getItem("sessionId") || "guest";
  const url = `${baseUrl}/cart/${sessionId}/remind`;

  try {
    const response = await api.post(url, {}, {
      headers: context.requestHeaders,
      signal: context.signal,
    });

    if (response?.ok === false) {
      return fail({
        code: "REMIND_FAILED",
        message: "Failed to trigger reminder check",
      });
    }

    return ok(response, { flow: "cart.remind", sessionId });
  } catch (error) {
    return asFlowError(error, "REMIND_UNEXPECTED", "Unexpected error.");
  }
}
