import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getCartApiBaseUrl, asFlowError } from "../cartApiUtils.js";

/**
 * setAsDefaultFlow
 * Sets a cart as the primary default for the user.
 */
export async function setAsDefaultFlow({ payload, context, api }) {
  const baseUrl = getCartApiBaseUrl(context);
  const sessionId = payload?.sessionId || localStorage.getItem("sessionId") || "guest";
  const url = `${baseUrl}/cart/${sessionId}/default`;

  try {
    const response = await api.post(url, {}, {
      headers: context.requestHeaders,
      signal: context.signal,
    });

    if (response?.ok === false) {
      return fail({
        code: "SET_DEFAULT_FAILED",
        message: "Failed to set cart as default",
      });
    }

    return ok(response, { flow: "cart.setDefault", sessionId });
  } catch (error) {
    return asFlowError(error, "SET_DEFAULT_UNEXPECTED", "Unexpected error.");
  }
}
