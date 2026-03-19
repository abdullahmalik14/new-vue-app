import {
  hktDateTimeToLocalIso,
  hktDateTimeToLocalDate,
  nextDateIso,
  toHm,
  addMinutesToHm,
  extractDateIso,
  extractHm,
} from "@/services/events/eventsApiUtils.js";

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeString(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0" || normalized === "") return false;
  }
  return fallback;
}

function firstArrayItem(value) {
  return Array.isArray(value) && value.length > 0 ? value[0] : null;
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function formatLocalDateIso(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function formatLocalHm(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function toLocalDateIsoFromHktDate(hktDateLike, fallback = null) {
  const dateIso = extractDateIso(hktDateLike, null);
  if (!dateIso) return fallback;

  const localDate = hktDateTimeToLocalDate(dateIso, "00:00");
  if (!localDate) return fallback;

  return formatLocalDateIso(localDate) || fallback;
}

function buildSlotFromWeekly(item) {
  const firstSlot = firstArrayItem(item?.slots);
  if (!firstSlot) return null;

  if (firstSlot.day && firstSlot.startTime && firstSlot.endTime) {
    const dateIso = extractDateIso(item?.dateFrom, null) || nextDateIso(1);
    return {
      dateIso,
      endDateIso: dateIso,
      startHm: toHm(firstSlot.startTime, "15:00"),
      endHm: toHm(firstSlot.endTime, "16:00"),
    };
  }

  if (firstSlot.date && Array.isArray(firstSlot.times) && firstSlot.times.length > 0) {
    const firstTime = firstSlot.times[0] || {};
    return {
      dateIso: extractDateIso(firstSlot.date, null) || nextDateIso(1),
      endDateIso: extractDateIso(firstTime.endTime, null) || extractDateIso(firstSlot.date, null) || nextDateIso(1),
      startHm: toHm(firstTime.startTime, "15:00"),
      endHm: toHm(firstTime.endTime, "16:00"),
    };
  }

  return null;
}

function buildSlotFromEventTime(item) {
  const eventTime = item?.eventTime;
  if (!eventTime?.start || !eventTime?.end) return null;

  const dateIso = extractDateIso(eventTime.start, null) || extractDateIso(item?.dateFrom, null) || nextDateIso(1);
  const endDateIso = extractDateIso(eventTime.end, null) || dateIso;
  const startHm = extractHm(eventTime.start, "15:00");
  const endHm = extractHm(eventTime.end, "16:00");

  return {
    dateIso,
    endDateIso,
    startHm,
    endHm,
  };
}

function buildFallbackSlot(item) {
  const dateIso = extractDateIso(item?.dateFrom, null) || nextDateIso(1);
  const duration = normalizeNumber(item?.sessionDurationMinutes, 15);
  const startHm = "15:00";
  return {
    dateIso,
    endDateIso: dateIso,
    startHm,
    endHm: addMinutesToHm(startHm, duration),
  };
}

function normalizeEventItem(item = {}) {
  const slot = buildSlotFromEventTime(item) || buildSlotFromWeekly(item) || buildFallbackSlot(item);
  const start = hktDateTimeToLocalIso(slot.dateIso, slot.startHm);
  const end = hktDateTimeToLocalIso(slot.endDateIso || slot.dateIso, slot.endHm);
  const startDate = new Date(start);
  const endDate = new Date(end);

  const stableId = item.eventId || item.id || `${item.creatorId || "creator"}_${slot.dateIso}_${slot.startHm}`;

  return {
    id: stableId,
    eventId: item.eventId || null,
    creatorId: item.creatorId || null,
    type: item.type || "1on1-call",
    status: item.status || "active",
    title: normalizeString(item.title, "Untitled Event"),
    description: normalizeString(item.description, ""),
    sessionDurationMinutes: normalizeNumber(item.sessionDurationMinutes, 15),
    basePriceTokens: normalizeNumber(item.basePriceTokens, 0),
    allowLongerSessions: normalizeBoolean(item.allowLongerSessions, false),
    eventColorSkin: item.eventColorSkin || "#5549FF",
    start,
    end,
    localDateIso: formatLocalDateIso(startDate),
    localStartHm: formatLocalHm(startDate),
    localEndHm: formatLocalHm(endDate),
    dateFrom: toLocalDateIsoFromHktDate(item?.dateFrom, null),
    dateTo: toLocalDateIsoFromHktDate(item?.dateTo, null),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    slot: item.type === "group-event" ? "custom2" : "event",
    raw: item,
  };
}

export function mapFetchCreatorEventsFromResponse(responseData = {}) {
  const items = Array.isArray(responseData.items) ? responseData.items : [];
  const mappedItems = items.map((item) => normalizeEventItem(item));

  return {
    items: mappedItems,
    next: responseData.next ?? null,
    total: normalizeNumber(responseData.total, mappedItems.length),
    meta: {
      receivedAt: Date.now(),
      count: mappedItems.length,
    },
  };
}

export function mapSingleEventFromResponse(item = {}) {
  return normalizeEventItem(item);
}
