import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getBookingsApiBaseUrl, asFlowError } from "@/services/bookings/bookingsApiUtils.js";

export async function reviewPendingBookingFlow({ payload, context, api }) {
  const baseUrl = getBookingsApiBaseUrl(context);
  const headers = context.requestHeaders || {};
  const bookingId = payload?.bookingId ? String(payload.bookingId).trim() : "";
  const decision = payload?.decision ? String(payload.decision).trim().toLowerCase() : "";

  if (!bookingId) {
    return fail({
      code: "REVIEW_BOOKING_MISSING_ID",
      message: "bookingId is required for approval action.",
      details: payload,
    });
  }

  if (!["approve", "reject"].includes(decision)) {
    return fail({
      code: "REVIEW_BOOKING_INVALID_DECISION",
      message: "decision must be approve or reject.",
      details: payload,
    });
  }

  try {
    const response = await api.post(`${baseUrl}/bookings/${encodeURIComponent(bookingId)}/approval`, {
      decision,
      actor: payload?.actor || "creator",
      reason: payload?.reason || "",
      args: payload?.args && typeof payload.args === "object" ? payload.args : {},
    }, {
      headers,
      signal: context.signal,
      timeoutMs: context.requestTimeoutMs,
    });

    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({
        code: "REVIEW_BOOKING_FAILED",
        message: response?.error || "Could not review booking.",
        details: response,
      });
    }

    return ok(
      {
        bookingId: response?.bookingId || bookingId,
        decision: response?.decision || decision,
        item: response?.item || null,
        reverse: response?.reverse || null,
      },
      {
        flow: "bookings.reviewPendingBooking",
        status,
      },
    );
  } catch (error) {
    return asFlowError(
      error,
      "REVIEW_BOOKING_UNEXPECTED",
      "Unexpected error while reviewing booking.",
    );
  }
}

