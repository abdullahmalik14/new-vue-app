import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getCartApiBaseUrl, asFlowError } from "../cartApiUtils.js";
import { SafeUtils } from "@/utils/SafeUtils";

/**
 * applyCouponFlow
 * Applies a discount coupon to the cart.
 */
export async function applyCouponFlow({ payload, context, api }) {
  const baseUrl = getCartApiBaseUrl(context);
  const sessionId = payload?.sessionId || localStorage.getItem("sessionId") || "guest";
  const couponCode = SafeUtils.ensureString(payload?.couponCode);

  if (!couponCode) {
    return fail({ code: "MISSING_COUPON", message: "Coupon code is required" });
  }

  const url = `${baseUrl}/cart/${sessionId}/coupons`;

  try {
    const response = await api.post(url, { couponCode }, {
      headers: context.requestHeaders,
      signal: context.signal,
    });

    if (response?.ok === false) {
      return fail({
        code: "APPLY_COUPON_FAILED",
        message: response?.error || "Failed to apply coupon",
      });
    }

    return ok(response, { flow: "cart.applyCoupon", couponCode });
  } catch (error) {
    return asFlowError(error, "APPLY_COUPON_UNEXPECTED", "Unexpected error.");
  }
}
