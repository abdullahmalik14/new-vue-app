import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getCartApiBaseUrl, asFlowError } from "../cartApiUtils.js";

/**
 * mergeGuestCartFlow
 * Merges a guest cart into a user's account cart.
 */
export async function mergeGuestCartFlow({ payload, context, api }) {
  const baseUrl = getCartApiBaseUrl(context);
  const { guestSessionId, userId } = payload || {};

  if (!guestSessionId || !userId) {
    return fail({
      code: "MISSING_MERGE_DATA",
      message: "Both guestSessionId and userId are required to merge",
    });
  }

  const url = `${baseUrl}/cart/merge`;

  try {
    const response = await api.post(url, { sessionId: guestSessionId, userId }, {
      headers: context.requestHeaders,
      signal: context.signal,
    });

    if (response?.ok === false) {
      return fail({
        code: "MERGE_FAILED",
        message: "Failed to merge guest cart",
      });
    }

    return ok(response, { flow: "cart.mergeGuest" });
  } catch (error) {
    return asFlowError(error, "MERGE_UNEXPECTED", "Unexpected error.");
  }
}
