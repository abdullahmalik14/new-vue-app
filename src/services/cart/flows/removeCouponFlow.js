import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getCartApiBaseUrl, asFlowError } from "../cartApiUtils.js";

/**
 * removeCouponFlow
 */
export async function removeCouponFlow({ payload, context, api }) {
  const baseUrl = getCartApiBaseUrl(context);
  const sessionId = payload?.sessionId || localStorage.getItem("sessionId") || "guest";
  const url = `${baseUrl}/cart/${sessionId}/coupons`;

  try {
    const response = await api.delete(url, {
      headers: context.requestHeaders,
      signal: context.signal,
    });

    if (response?.ok === false) {
      return fail({
        code: "REMOVE_COUPON_FAILED",
        message: "Failed to remove coupon",
      });
    }

    return ok(response, { flow: "cart.removeCoupon" });
  } catch (error) {
    return asFlowError(error, "REMOVE_COUPON_UNEXPECTED", "Unexpected error.");
  }
}
