import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus, getEtag, isApiNotModified } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getBookingsApiBaseUrl, asFlowError, toNumber } from "@/services/bookings/bookingsApiUtils.js";

function buildEventsParams(payload = {}) {
  return {
    creatorId: payload.creatorId,
    status: payload.status || "active",
    limit: payload.limit,
    next: payload.next,
  };
}

function buildBookedSlotParams(payload = {}) {
  return {
    fromIso: payload.fromIso,
    toIso: payload.toIso,
    periodMonths: payload.periodMonths,
    limit: payload.slotLimit,
    statusIn: payload.statusIn,
  };
}

function readCachedRawEvents(context) {
  const engine = context?.stateEngine;
  if (!engine || typeof engine.getState !== "function") return [];

  const cached = engine.getState("fanBooking.catalog.rawEvents");
  return Array.isArray(cached) ? cached : [];
}

export async function fetchCreatorBookingContextFlow({ payload, context, api }) {
  const baseUrl = getBookingsApiBaseUrl(context);
  const headers = context.requestHeaders || {};

  if (payload?.creatorId == null || payload?.creatorId === "") {
    return fail({
      code: "MISSING_CREATOR_ID",
      message: "creatorId is required to fetch booking context.",
    });
  }

  try {
    // Required order: events first, then booked slots.
    const eventsResponse = await api.get(`${baseUrl}/events`, {
      params: buildEventsParams(payload),
      headers,
      signal: context.signal,
      timeoutMs: context.requestTimeoutMs,
    });

    const eventsStatus = getHttpStatus(eventsResponse, 200);
    const etag = getEtag(eventsResponse);

    if (eventsResponse?.ok === false) {
      return fail({
        code: "FETCH_CREATOR_EVENTS_FAILED",
        message: eventsResponse?.error || "Failed to fetch creator events.",
        details: eventsResponse,
      });
    }

    const eventsNotModified = isApiNotModified(eventsResponse);
    const rawEvents = eventsNotModified
      ? readCachedRawEvents(context)
      : (Array.isArray(eventsResponse?.items) ? eventsResponse.items : []);

    const creatorId = toNumber(payload.creatorId, null);
    const bookedSlotsResponse = await api.get(`${baseUrl}/bookings/creators/${creatorId}/booked-slots`, {
      params: buildBookedSlotParams(payload),
      signal: context.signal,
      timeoutMs: context.requestTimeoutMs,
    });

    if (bookedSlotsResponse?.ok === false) {
      return fail({
        code: "FETCH_CREATOR_BOOKED_SLOTS_FAILED",
        message: bookedSlotsResponse?.error || "Failed to fetch creator booked slots.",
        details: bookedSlotsResponse,
      });
    }

    const bookedSlots = Array.isArray(bookedSlotsResponse?.slots) ? bookedSlotsResponse.slots : [];

    return ok(
      {
        rawEvents,
        bookedSlots,
        stats: bookedSlotsResponse?.stats || {},
      },
      {
        flow: "bookings.fetchCreatorBookingContext",
        status: eventsStatus,
        etag,
        eventsNotModified,
        fetchedAt: Date.now(),
      }
    );
  } catch (error) {
    return asFlowError(
      error,
      "FETCH_CREATOR_BOOKING_CONTEXT_UNEXPECTED",
      "Unexpected error while loading booking context."
    );
  }
}
