import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getCartApiBaseUrl, asFlowError } from "../cartApiUtils.js";

/**
 * attachLiveDataFlow
 * Syncs the current cart items with live product database prices and titles.
 */
export async function attachLiveDataFlow({ payload, context, api }) {
  const baseUrl = getCartApiBaseUrl(context);
  const sessionId = payload?.sessionId || localStorage.getItem("sessionId") || "guest";
  const url = `${baseUrl}/cart/${sessionId}/live-data`;

  try {
    const response = await api.post(url, {}, {
      headers: context.requestHeaders,
      signal: context.signal,
    });

    if (response?.ok === false) {
      return fail({
        code: "LIVE_DATA_FAILED",
        message: "Failed to attach live data",
      });
    }

    return ok(response, { flow: "cart.attachLiveData", sessionId });
  } catch (error) {
    return asFlowError(error, "LIVE_DATA_UNEXPECTED", "Unexpected error.");
  }
}
