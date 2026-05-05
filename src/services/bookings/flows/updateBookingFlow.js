import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getBookingsApiBaseUrl, asFlowError } from "@/services/bookings/bookingsApiUtils.js";

export async function updateBookingFlow({ payload, context, api }) {
  const baseUrl = getBookingsApiBaseUrl(context);
  const headers = context.requestHeaders || {};
  const bookingId = payload?.bookingId ? String(payload.bookingId).trim() : "";
  const actionType = payload?.actionType ? String(payload.actionType).trim().toLowerCase() : "";

  if (!bookingId) {
    return fail({
      code: "BOOKING_UPDATE_MISSING_ID",
      message: "bookingId is required for booking update.",
      details: payload,
    });
  }

  if (!["renegotiate", "reschedule", "update_meta"].includes(actionType)) {
    return fail({
      code: "BOOKING_UPDATE_INVALID_ACTION",
      message: "actionType must be renegotiate or reschedule.",
      details: payload,
    });
  }

  const {
    bookingId: _bookingId,
    addons,
    ...requestBody
  } = payload || {};

  if (requestBody.requestedAddOns === undefined && addons !== undefined) {
    requestBody.requestedAddOns = addons;
  }

  try {
    const response = await api.post(
      `${baseUrl}/bookings/${encodeURIComponent(bookingId)}/update`,
      requestBody,
      {
        headers,
        signal: context.signal,
        timeoutMs: context.requestTimeoutMs,
      },
    );

    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({
        code: "BOOKING_UPDATE_FAILED",
        message: response?.message || response?.error || "Could not update booking.",
        details: response,
      });
    }

    return ok(
      {
        bookingId: response?.item?.bookingId || bookingId,
        actionType: response?.actionType || actionType,
        item: response?.item || null,
      },
      {
        flow: "bookings.updateBooking",
        status,
      },
    );
  } catch (error) {
    return asFlowError(
      error,
      "BOOKING_UPDATE_UNEXPECTED",
      "Unexpected error while updating booking.",
    );
  }
}
