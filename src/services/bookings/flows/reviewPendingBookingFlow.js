import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getBookingsApiBaseUrl, asFlowError } from "@/services/bookings/bookingsApiUtils.js";
import { getEventsApiBaseUrl } from "@/services/events/eventsApiUtils.js";
import {
  fireAndForgetCreateScheduleNotify,
  getCreateScheduleNotifyPayload,
  shouldFireCreateScheduleAfterApproval,
} from "@/utils/bookingScheduleNotify.js";

function resolveEventForApprovalNotification(originalPayload = {}, responseItem = null, freshEvent = null) {
  return (
    freshEvent
    || originalPayload?.event
    || originalPayload?.sourceEvent
    || responseItem?.eventCurrent
    || responseItem?.eventSnapshot
    || responseItem
    || null
  );
}

async function fetchFreshEventForApprovalNotification({ api, context, headers, eventId }) {
  const normalizedEventId = typeof eventId === "string" ? eventId.trim() : String(eventId || "").trim();
  if (!normalizedEventId) return null;

  try {
    const baseUrl = getEventsApiBaseUrl(context);
    const response = await api.get(`${baseUrl}/events/${encodeURIComponent(normalizedEventId)}`, {
      headers,
      signal: context.signal,
      timeoutMs: context.requestTimeoutMs,
    });

    if (response?.ok === false) {
      return null;
    }

    return response?.item || null;
  } catch (_) {
    return null;
  }
}

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

    if (decision === "approve") {
      try {
        const approvedBooking = response?.item || null;
        const freshEvent = await fetchFreshEventForApprovalNotification({
          api,
          context,
          headers,
          eventId: approvedBooking?.eventId || context?.originalPayload?.eventId,
        });
        const approvedEvent = resolveEventForApprovalNotification(
          context?.originalPayload || {},
          approvedBooking,
          freshEvent,
        );

        if (shouldFireCreateScheduleAfterApproval(approvedEvent)) {
          const notify = getCreateScheduleNotifyPayload({
            event: approvedEvent,
            booking: approvedBooking,
            bookingId: approvedBooking?.bookingId || bookingId,
            eventId: approvedBooking?.eventId || approvedEvent?.eventId || approvedEvent?.raw?.eventId || null,
            startIso: approvedBooking?.startAtIso || approvedBooking?.startIso || approvedBooking?.start || context?.originalPayload?.event?.start || "",
            fanId: approvedBooking?.userId || context?.originalPayload?.event?.raw?.userId || "",
            creatorId: approvedBooking?.creatorId || approvedEvent?.creatorId || approvedEvent?.raw?.creatorId || "",
            participantCount: approvedBooking?.guestCount || 1,
          });

          if (notify.shouldFire && notify.payload) {
            fireAndForgetCreateScheduleNotify(notify.payload);
          }
        }
      } catch (notifyError) {
        console.warn("[reviewPendingBookingFlow] create schedule notify skipped", {
          bookingId,
          error: notifyError?.message || String(notifyError),
        });
      }
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
