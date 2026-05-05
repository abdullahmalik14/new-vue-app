import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getBookingsApiBaseUrl, asFlowError } from "@/services/bookings/bookingsApiUtils.js";

export async function fetchBookingFlow({ payload, context, api }) {
  const baseUrl = getBookingsApiBaseUrl(context);
  const bookingId = payload?.bookingId ? String(payload.bookingId).trim() : "";

  if (!bookingId) {
    return fail({
      code: "FETCH_BOOKING_MISSING_ID",
      message: "bookingId is required.",
      details: payload,
    });
  }

  try {
    const response = await api.get(`${baseUrl}/bookings/${encodeURIComponent(bookingId)}`, {
      headers: context.requestHeaders || {},
      signal: context.signal,
      timeoutMs: context.requestTimeoutMs,
    });

    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({
        code: "FETCH_BOOKING_FAILED",
        message: response?.error || "Could not fetch booking.",
        details: response,
      });
    }

    return ok(
      { item: response?.item || response || null },
      { flow: "bookings.fetchBooking", status }
    );
  } catch (error) {
    return asFlowError(error, "FETCH_BOOKING_UNEXPECTED", "Unexpected error while fetching booking.");
  }
}
