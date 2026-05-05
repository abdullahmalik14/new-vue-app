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

function buildBookedSlotParams(payload = {}, { includeEventId = false } = {}) {
  const eventId = payload.eventId == null ? "" : String(payload.eventId).trim();
  const params = {
    fromIso: payload.fromIso,
    toIso: payload.toIso,
    periodMonths: payload.periodMonths,
    limit: payload.slotLimit,
    statusIn: payload.statusIn,
  };

  if (includeEventId && eventId) {
    params.eventId = eventId;
  }

  return params;
}

function shouldUseFanBookedSlotsEndpoint(payload = {}) {
  const fanId = toNumber(payload.fanId, null);
  const userRole = typeof payload.userRole === "string"
    ? payload.userRole.trim().toLowerCase()
    : "";

  return userRole === "fan" && fanId != null;
}

function resolveBookedSlotsEndpoint(baseUrl, payload = {}) {
  const creatorId = toNumber(payload.creatorId, null);
  const fanId = toNumber(payload.fanId, null);

  if (shouldUseFanBookedSlotsEndpoint(payload)) {
    return `${baseUrl}/bookings/fans/${fanId}/booked-slots`;
  }

  return `${baseUrl}/bookings/creators/${creatorId}/booked-slots`;
}

function readCachedRawEvents(context) {
  const engine = context?.stateEngine;
  if (!engine || typeof engine.getState !== "function") return [];

  const cached = engine.getState("fanBooking.catalog.rawEvents");
  return Array.isArray(cached) ? cached : [];
}

function resolveCombinedStatus(eventsStatus, eventsNotModified, bookedSlotsResponse) {
  return eventsNotModified
    ? getHttpStatus(bookedSlotsResponse, 200)
    : eventsStatus;
}

function shouldFetchFirstTimeDiscountStatus(payload = {}) {
  const creatorId = toNumber(payload.creatorId, null);
  const fanId = toNumber(payload.fanId, null);
  return creatorId != null && fanId != null && fanId > 0;
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

    const bookedSlotsResponse = await api.get(resolveBookedSlotsEndpoint(baseUrl, payload), {
      params: buildBookedSlotParams(payload, {
        includeEventId: !shouldUseFanBookedSlotsEndpoint(payload),
      }),
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
    let isFirstBookingForCreator = null;

    const creatorId = toNumber(payload.creatorId, null);
    const fanId = toNumber(payload.fanId, null);
    if (fanId === 0) {
      isFirstBookingForCreator = true;
    } else if (shouldFetchFirstTimeDiscountStatus(payload)) {
      const eligibilityResponse = await api.get(
        `${baseUrl}/bookings/creators/${creatorId}/fans/${fanId}/first-time-discount-status`,
        {
          signal: context.signal,
          timeoutMs: context.requestTimeoutMs,
        },
      );

      if (eligibilityResponse?.ok === false) {
        return fail({
          code: "FETCH_FIRST_TIME_DISCOUNT_STATUS_FAILED",
          message: eligibilityResponse?.error || "Failed to fetch first-time discount status.",
          details: eligibilityResponse,
        });
      }

      isFirstBookingForCreator = Boolean(eligibilityResponse?.isFirstBookingForCreator);
    }

    return ok(
      {
        rawEvents,
        bookedSlots,
        isFirstBookingForCreator,
        stats: bookedSlotsResponse?.stats || {},
      },
      {
        flow: "bookings.fetchCreatorBookingContext",
        status: resolveCombinedStatus(eventsStatus, eventsNotModified, bookedSlotsResponse),
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
