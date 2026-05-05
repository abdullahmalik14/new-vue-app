import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus, getEtag, isApiNotModified } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getBookingsApiBaseUrl, asFlowError, toNumber } from "@/services/bookings/bookingsApiUtils.js";

function normalizeUserRole(value) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (normalized === "fan" || normalized === "creator") return normalized;
  return normalized;
}

function buildCreatorEventParams(payload = {}) {
  return {
    creatorId: payload.creatorId,
    status: payload.status || "active",
    limit: payload.limit,
    next: payload.next,
  };
}

function buildIdsEventParams(eventIds = [], payload = {}) {
  return {
    ids: eventIds.join(","),
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

function resolveBookedSlotsEndpoint(baseUrl, payload = {}) {
  const creatorId = toNumber(payload.creatorId, null);
  const fanId = toNumber(payload.fanId, null);
  const userRole = normalizeUserRole(payload.userRole);

  if (userRole === "fan") {
    return `${baseUrl}/bookings/fans/${fanId}/booked-slots`;
  }

  return `${baseUrl}/bookings/creators/${creatorId}/booked-slots`;
}

function readCachedRawEvents(context) {
  const engine = context?.stateEngine;
  if (!engine || typeof engine.getState !== "function") return [];

  const cached = engine.getState("events.rawEvents");
  return Array.isArray(cached) ? cached : [];
}

function resolveCombinedStatus(eventsStatus, eventsNotModified, bookedSlotsResponse) {
  return eventsNotModified
    ? getHttpStatus(bookedSlotsResponse, 200)
    : eventsStatus;
}

function extractUniqueEventIdsFromSlots(slots = []) {
  const ids = [];
  const seen = new Set();

  (Array.isArray(slots) ? slots : []).forEach((slot) => {
    const eventId = String(slot?.eventId || "").trim();
    if (!eventId || seen.has(eventId)) return;
    seen.add(eventId);
    ids.push(eventId);
  });

  return ids;
}

async function fetchCreatorDashboardContext({ payload, context, api, baseUrl, headers }) {
  if (payload?.creatorId == null || payload?.creatorId === "") {
    return fail({
      code: "MISSING_CREATOR_ID",
      message: "creatorId is required to fetch dashboard booking context.",
    });
  }

  const eventsResponse = await api.get(`${baseUrl}/events`, {
    params: buildCreatorEventParams(payload),
    headers,
    signal: context.signal,
    timeoutMs: context.requestTimeoutMs,
  });

  const eventsStatus = getHttpStatus(eventsResponse, 200);
  const etag = getEtag(eventsResponse);

  if (eventsResponse?.ok === false) {
    return fail({
      code: "FETCH_DASHBOARD_EVENTS_FAILED",
      message: eventsResponse?.error || "Failed to fetch dashboard events.",
      details: eventsResponse,
    });
  }

  const eventsNotModified = isApiNotModified(eventsResponse);
  const rawEvents = eventsNotModified
    ? readCachedRawEvents(context)
    : (Array.isArray(eventsResponse?.items) ? eventsResponse.items : []);

  const bookedSlotsResponse = await api.get(resolveBookedSlotsEndpoint(baseUrl, payload), {
    params: buildBookedSlotParams(payload, { includeEventId: true }),
    signal: context.signal,
    timeoutMs: context.requestTimeoutMs,
  });

  if (bookedSlotsResponse?.ok === false) {
    return fail({
      code: "FETCH_DASHBOARD_BOOKED_SLOTS_FAILED",
      message: bookedSlotsResponse?.error || "Failed to fetch dashboard booked slots.",
      details: bookedSlotsResponse,
    });
  }

  return ok(
    {
      rawEvents,
      bookedSlots: Array.isArray(bookedSlotsResponse?.slots) ? bookedSlotsResponse.slots : [],
      stats: bookedSlotsResponse?.stats || {},
    },
    {
      flow: "bookings.fetchDashboardBookingContext",
      status: resolveCombinedStatus(eventsStatus, eventsNotModified, bookedSlotsResponse),
      etag,
      eventsNotModified,
      fetchedAt: Date.now(),
      mode: "creator",
    }
  );
}

async function fetchFanDashboardContext({ payload, context, api, baseUrl }) {
  if (payload?.fanId == null || payload?.fanId === "") {
    return fail({
      code: "MISSING_FAN_ID",
      message: "fanId is required to fetch fan dashboard booking context.",
    });
  }

  const bookedSlotsResponse = await api.get(resolveBookedSlotsEndpoint(baseUrl, payload), {
    params: buildBookedSlotParams(payload),
    signal: context.signal,
    timeoutMs: context.requestTimeoutMs,
  });

  if (bookedSlotsResponse?.ok === false) {
    return fail({
      code: "FETCH_DASHBOARD_BOOKED_SLOTS_FAILED",
      message: bookedSlotsResponse?.error || "Failed to fetch fan booked slots.",
      details: bookedSlotsResponse,
    });
  }

  const bookedSlots = Array.isArray(bookedSlotsResponse?.slots) ? bookedSlotsResponse.slots : [];
  const eventIds = extractUniqueEventIdsFromSlots(bookedSlots);

  if (eventIds.length === 0) {
    return ok(
      {
        rawEvents: [],
        bookedSlots,
        stats: bookedSlotsResponse?.stats || {},
      },
      {
        flow: "bookings.fetchDashboardBookingContext",
        status: getHttpStatus(bookedSlotsResponse, 200),
        etag: null,
        eventsNotModified: false,
        fetchedAt: Date.now(),
        mode: "fan",
      }
    );
  }

  const eventsResponse = await api.get(`${baseUrl}/events`, {
    params: buildIdsEventParams(eventIds, payload),
    headers: context.requestHeaders || {},
    signal: context.signal,
    timeoutMs: context.requestTimeoutMs,
  });

  const eventsStatus = getHttpStatus(eventsResponse, 200);
  const etag = getEtag(eventsResponse);

  if (eventsResponse?.ok === false) {
    return fail({
      code: "FETCH_DASHBOARD_EVENTS_FAILED",
      message: eventsResponse?.error || "Failed to fetch dashboard events.",
      details: eventsResponse,
    });
  }

  const eventsNotModified = isApiNotModified(eventsResponse);
  const rawEvents = eventsNotModified
    ? readCachedRawEvents(context)
    : (Array.isArray(eventsResponse?.items) ? eventsResponse.items : []);

  return ok(
    {
      rawEvents,
      bookedSlots,
      stats: bookedSlotsResponse?.stats || {},
    },
    {
      flow: "bookings.fetchDashboardBookingContext",
      status: resolveCombinedStatus(eventsStatus, eventsNotModified, bookedSlotsResponse),
      etag,
      eventsNotModified,
      fetchedAt: Date.now(),
      mode: "fan",
    }
  );
}

export async function fetchDashboardBookingContextFlow({ payload, context, api }) {
  const baseUrl = getBookingsApiBaseUrl(context);
  const headers = context.requestHeaders || {};
  const userRole = normalizeUserRole(payload?.userRole);

  try {
    if (userRole === "fan") {
      return await fetchFanDashboardContext({ payload, context, api, baseUrl, headers });
    }

    if (userRole === "creator") {
      return await fetchCreatorDashboardContext({ payload, context, api, baseUrl, headers });
    }

    return fail({
      code: "UNSUPPORTED_DASHBOARD_USER_ROLE",
      message: "Unsupported dashboard user role.",
    });
  } catch (error) {
    return asFlowError(
      error,
      "FETCH_DASHBOARD_BOOKING_CONTEXT_UNEXPECTED",
      "Unexpected error while loading dashboard booking context."
    );
  }
}
