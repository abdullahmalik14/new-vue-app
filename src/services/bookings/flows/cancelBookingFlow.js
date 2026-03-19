import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getBookingsApiBaseUrl, asFlowError } from "@/services/bookings/bookingsApiUtils.js";

export async function cancelBookingFlow({ payload, context, api }) {
  const baseUrl = getBookingsApiBaseUrl(context);
  const headers = context.requestHeaders || {};
  const bookingId = payload?.bookingId ? String(payload.bookingId).trim() : "";

  if (!bookingId) {
    return fail({
      code: "CANCEL_BOOKING_MISSING_ID",
      message: "bookingId is required to cancel booking.",
      details: payload,
    });
  }

  try {
    const response = await api.post(
      `${baseUrl}/bookings/${encodeURIComponent(bookingId)}/cancel`,
      {
        actor: payload?.actor || "creator",
        reason: payload?.reason || "",
        waiveFees: !!payload?.waiveFees,
        args: payload?.args && typeof payload.args === "object" ? payload.args : {},
      },
      {
        headers,
        signal: context.signal,
        timeoutMs: context.requestTimeoutMs,
      },
    );

    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({
        code: "CANCEL_BOOKING_FAILED",
        message: response?.error || "Could not cancel booking.",
        details: response,
      });
    }

    return ok(
      {
        bookingId: response?.bookingId || response?.item?.bookingId || bookingId,
        item: response?.item || null,
        reverse: response?.reverse || null,
      },
      {
        flow: "bookings.cancelBooking",
        status,
      },
    );
  } catch (error) {
    return asFlowError(
      error,
      "CANCEL_BOOKING_UNEXPECTED",
      "Unexpected error while cancelling booking.",
    );
  }
}
