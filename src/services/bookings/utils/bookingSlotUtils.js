import {
  extractDateIso,
  localDateTimeToHkt,
  hktDateTimeToLocalDate,
  toHm,
} from "@/services/events/eventsApiUtils.js";

const DAY_NAME_TO_INDEX = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  tues: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6,
};

function pad2(value) {
  return String(value).padStart(2, "0");
}

function addDays(dateIso, days) {
  const base = new Date(`${dateIso}T00:00:00`);
  if (Number.isNaN(base.getTime())) return dateIso;
  base.setDate(base.getDate() + days);
  return `${base.getFullYear()}-${pad2(base.getMonth() + 1)}-${pad2(base.getDate())}`;
}

function daysDiff(fromDateIso, toDateIso) {
  const from = new Date(`${fromDateIso}T00:00:00`);
  const to = new Date(`${toDateIso}T00:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;
  return Math.floor((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));
}

function parseDateParts(dateIso) {
  const match = String(dateIso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  return { year, month, day };
}

function getLastDayOfMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function hmToLabel(hm = "00:00") {
  const [hourRaw = "0", minuteRaw = "0"] = String(hm).split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  const safeHour = Number.isFinite(hour) ? hour : 0;
  const safeMinute = Number.isFinite(minute) ? minute : 0;
  const period = safeHour >= 12 ? "pm" : "am";
  const twelveHour = safeHour % 12 === 0 ? 12 : safeHour % 12;
  return `${twelveHour}:${pad2(safeMinute)}${period}`;
}

function formatLocalDateIso(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function formatLocalHm(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function toSlotDateTimeMs(localDateIso, hm) {
  const parsed = new Date(`${localDateIso}T${toHm(hm, "00:00")}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
}

function normalizePositiveMinutes(value, fallback = 15) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

function sliceWindowIntoSessionSlots(windowSlot, sessionMinutes, bufferMinutes = 0) {
  const rows = [];
  const segmentMs = normalizePositiveMinutes(sessionMinutes, 15) * 60 * 1000;
  const bufferMs = normalizePositiveMinutes(bufferMinutes, 0) * 60 * 1000;
  const stepMs = segmentMs + bufferMs;

  if (!windowSlot || !Number.isFinite(windowSlot.startMs) || !Number.isFinite(windowSlot.endMs)) {
    return rows;
  }

  let cursorMs = windowSlot.startMs;
  while ((cursorMs + segmentMs) <= windowSlot.endMs) {
    const startDate = new Date(cursorMs);
    const endDate = new Date(cursorMs + segmentMs);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) break;

    const localDateIso = formatLocalDateIso(startDate);
    const startHm = formatLocalHm(startDate);
    const endHm = formatLocalHm(endDate);
    if (!localDateIso || !startHm || !endHm) break;

    rows.push({
      localDateIso,
      startHm,
      endHm,
      offHours: !!windowSlot.offHours,
      startMs: startDate.getTime(),
      endMs: endDate.getTime(),
      windowEndMs: windowSlot.endMs,
      value: startHm,
      label: hmToLabel(startHm),
    });

    cursorMs += stepMs;
  }

  return rows;
}

function isOverlappingBookedRange(startMs, endMs, bookedRows = []) {
  if (!Array.isArray(bookedRows) || bookedRows.length === 0) return false;
  return bookedRows.some((booked) => startMs < booked.endMs && endMs > booked.startMs);
}

function sliceWindowIntoSessionSlotsWithPostBookedBuffer(
  windowSlot,
  sessionMinutes,
  bookedRows = [],
  bufferMinutes = 0,
) {
  const rows = [];
  const segmentMs = normalizePositiveMinutes(sessionMinutes, 15) * 60 * 1000;
  const bufferMs = normalizePositiveMinutes(bufferMinutes, 0) * 60 * 1000;

  if (!windowSlot || !Number.isFinite(windowSlot.startMs) || !Number.isFinite(windowSlot.endMs)) {
    return rows;
  }

  let cursorMs = windowSlot.startMs;
  let pendingBufferBeforeNextSlot = false;

  while ((cursorMs + segmentMs) <= windowSlot.endMs) {
    if (pendingBufferBeforeNextSlot && bufferMs > 0) {
      cursorMs += bufferMs;
      pendingBufferBeforeNextSlot = false;
      if ((cursorMs + segmentMs) > windowSlot.endMs) break;
    }

    const slotStartMs = cursorMs;
    const slotEndMs = slotStartMs + segmentMs;
    const startDate = new Date(slotStartMs);
    const endDate = new Date(slotEndMs);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) break;

    const localDateIso = formatLocalDateIso(startDate);
    const startHm = formatLocalHm(startDate);
    const endHm = formatLocalHm(endDate);
    if (!localDateIso || !startHm || !endHm) break;

    rows.push({
      localDateIso,
      startHm,
      endHm,
      offHours: !!windowSlot.offHours,
      startMs: slotStartMs,
      endMs: slotEndMs,
      windowEndMs: windowSlot.endMs,
      value: startHm,
      label: hmToLabel(startHm),
    });

    const slotIsBooked = isOverlappingBookedRange(slotStartMs, slotEndMs, bookedRows);
    const nextSlotStartMs = slotEndMs;
    const nextSlotEndMs = nextSlotStartMs + segmentMs;
    const nextSlotIsBooked = isOverlappingBookedRange(nextSlotStartMs, nextSlotEndMs, bookedRows);

    if (slotIsBooked && !nextSlotIsBooked && bufferMs > 0) {
      pendingBufferBeforeNextSlot = true;
    }

    cursorMs = slotEndMs;
  }

  return rows;
}

function normalizeWeeklySlots(rawSlots = []) {
  const normalized = [];

  rawSlots.forEach((slot) => {
    if (!slot || typeof slot !== "object") return;
    if (!slot.day) return;

    const dayIndex = DAY_NAME_TO_INDEX[String(slot.day).toLowerCase()];
    if (!Number.isFinite(dayIndex)) return;

    normalized.push({
      kind: "weekly",
      dayIndex,
      startTime: toHm(slot.startTime, "15:00"),
      endTime: toHm(slot.endTime, "16:00"),
      offHours: !!slot.offHours,
    });
  });

  return normalized;
}

function normalizeOneTimeSlots(rawSlots = []) {
  const normalized = [];

  rawSlots.forEach((dateEntry) => {
    if (!dateEntry || typeof dateEntry !== "object") return;
    const hktDate = extractDateIso(dateEntry.date, null);
    if (!hktDate) return;

    const times = Array.isArray(dateEntry.times) ? dateEntry.times : [];
    if (times.length === 0) return;

    times.forEach((timeEntry) => {
      if (!timeEntry || typeof timeEntry !== "object") return;

      const startHm = toHm(timeEntry.startTime, "15:00");
      const endHm = toHm(timeEntry.endTime, "16:00");

      normalized.push({
        kind: "one-time",
        hktDate,
        startTime: startHm,
        endTime: endHm,
        offHours: !!timeEntry.offHours,
      });
    });
  });

  return normalized;
}

function normalizeMonthlySlots(rawSlots = []) {
  const normalized = [];

  rawSlots.forEach((slot) => {
    if (!slot || typeof slot !== "object") return;
    const startHm = toHm(slot.startTime, "");
    const endHm = toHm(slot.endTime, "");
    if (!startHm || !endHm) return;

    normalized.push({
      kind: "monthly",
      startTime: startHm,
      endTime: endHm,
      offHours: !!slot.offHours,
    });
  });

  return normalized;
}

function shouldIncludeWeeklyDate({ repeatRule, repeatX, dateFrom, candidateHktDateIso, slotDayIndex }) {
  const weekday = new Date(`${candidateHktDateIso}T00:00:00`).getDay();
  if (weekday !== slotDayIndex) return false;

  if (repeatRule !== "everyXWeeks") return true;

  const baseDate = extractDateIso(dateFrom, candidateHktDateIso);
  const gapDays = daysDiff(baseDate, candidateHktDateIso);
  if (gapDays == null || gapDays < 0) return false;

  const interval = Number.isFinite(Number(repeatX)) && Number(repeatX) > 0 ? Number(repeatX) : 2;
  const gapWeeks = Math.floor(gapDays / 7);
  return gapWeeks % interval === 0;
}

function buildLocalSlotFromHkt({ hktDateIso, startHm, endHm, offHours = false }) {
  const startDate = hktDateTimeToLocalDate(hktDateIso, startHm);

  let endHktDateIso = hktDateIso;
  const startMinutes = Number(startHm.slice(0, 2)) * 60 + Number(startHm.slice(3, 5));
  const endMinutes = Number(endHm.slice(0, 2)) * 60 + Number(endHm.slice(3, 5));
  if (endMinutes <= startMinutes) {
    endHktDateIso = addDays(hktDateIso, 1);
  }

  const endDate = hktDateTimeToLocalDate(endHktDateIso, endHm);

  if (!startDate || !endDate) return null;

  const localDateIso = formatLocalDateIso(startDate);
  const localStartHm = formatLocalHm(startDate);
  const localEndHm = formatLocalHm(endDate);

  if (!localDateIso || !localStartHm || !localEndHm) return null;

  return {
    localDateIso,
    startHm: localStartHm,
    endHm: localEndHm,
    offHours: !!offHours,
    startMs: startDate.getTime(),
    endMs: endDate.getTime(),
    value: localStartHm,
    label: hmToLabel(localStartHm),
  };
}

export function buildCandidateSlotsForEventDate(event = {}, localDateIso, options = {}) {
  const raw = event?.raw || {};
  const repeatRule = String(raw.repeatRule || "weekly");
  const eventId = options.eventId || event?.eventId || event?.id;
  const bookedSlotsIndex = options.bookedSlotsIndex || {};
  const applyBufferAfterBooked = options.applyBufferAfterBooked !== false;
  const sessionMinutes = normalizePositiveMinutes(
    raw.sessionDurationMinutes ?? event?.sessionDurationMinutes,
    15,
  );
  const bufferMinutes = (
    !!raw.enableBufferTime && Number(raw.bookingBufferMinutes) > 0
  )
    ? normalizePositiveMinutes(raw.bookingBufferMinutes, 0)
    : 0;
  const bookedRowsForDate = (
    eventId
    && localDateIso
    && bookedSlotsIndex?.[eventId]
    && Array.isArray(bookedSlotsIndex[eventId][localDateIso])
  )
    ? [...bookedSlotsIndex[eventId][localDateIso]].sort((left, right) => left.startMs - right.startMs)
    : [];
  const rawSlots = Array.isArray(raw.slots) ? raw.slots : [];
  let hasExplicitScheduleSlots = false;

  if (!localDateIso) return [];

  const selectedHktContext = localDateTimeToHkt(localDateIso, "12:00");
  const centerHktDateIso = extractDateIso(selectedHktContext?.dateIso, null);
  if (!centerHktDateIso) return [];

  const hktDateCandidates = [
    addDays(centerHktDateIso, -1),
    centerHktDateIso,
    addDays(centerHktDateIso, 1),
  ];

  const built = [];

  if (repeatRule === "doesNotRepeat") {
    const oneTimeSlots = normalizeOneTimeSlots(rawSlots);
    hasExplicitScheduleSlots = oneTimeSlots.length > 0;

    oneTimeSlots.forEach((slot) => {
      const mapped = buildLocalSlotFromHkt({
        hktDateIso: slot.hktDate,
        startHm: slot.startTime,
        endHm: slot.endTime,
        offHours: slot.offHours,
      });
      if (!mapped) return;
      if (mapped.localDateIso !== localDateIso) return;
      built.push(mapped);
    });
  } else if (repeatRule === "monthly") {
    const monthlySlots = normalizeMonthlySlots(rawSlots);
    hasExplicitScheduleSlots = monthlySlots.length > 0;

    const anchorDate = extractDateIso(raw.dateFrom, null);
    const anchorParts = parseDateParts(anchorDate);
    const fallbackParts = parseDateParts(centerHktDateIso);
    const anchorDay = anchorParts?.day || fallbackParts?.day || 1;

    monthlySlots.forEach((slot) => {
      hktDateCandidates.forEach((candidateHktDateIso) => {
        const parts = parseDateParts(candidateHktDateIso);
        if (!parts) return;

        const targetDay = Math.min(anchorDay, getLastDayOfMonth(parts.year, parts.month));
        if (parts.day !== targetDay) return;

        const mapped = buildLocalSlotFromHkt({
          hktDateIso: candidateHktDateIso,
          startHm: slot.startTime,
          endHm: slot.endTime,
          offHours: slot.offHours,
        });

        if (!mapped) return;
        if (mapped.localDateIso !== localDateIso) return;
        built.push(mapped);
      });
    });
  } else {
    const weeklySlots = normalizeWeeklySlots(rawSlots);
    hasExplicitScheduleSlots = weeklySlots.length > 0;
    const expanded = repeatRule === "daily"
      ? weeklySlots.map((slot) => ({ ...slot, dayIndex: null }))
      : weeklySlots;

    expanded.forEach((slot) => {
      hktDateCandidates.forEach((candidateHktDateIso) => {
        if (repeatRule !== "daily") {
          const include = shouldIncludeWeeklyDate({
            repeatRule,
            repeatX: raw.repeatX,
            dateFrom: raw.dateFrom,
            candidateHktDateIso,
            slotDayIndex: slot.dayIndex,
          });
          if (!include) return;
        }

        const mapped = buildLocalSlotFromHkt({
          hktDateIso: candidateHktDateIso,
          startHm: slot.startTime,
          endHm: slot.endTime,
          offHours: slot.offHours,
        });

        if (!mapped) return;
        if (mapped.localDateIso !== localDateIso) return;
        built.push(mapped);
      });
    });
  }

  const segmented = [];
  built.forEach((slotWindow) => {
    const parts = (applyBufferAfterBooked && bufferMinutes > 0)
      ? sliceWindowIntoSessionSlotsWithPostBookedBuffer(
          slotWindow,
          sessionMinutes,
          bookedRowsForDate,
          bufferMinutes,
        )
      : sliceWindowIntoSessionSlots(slotWindow, sessionMinutes, 0);
    if (parts.length > 0) {
      segmented.push(...parts);
    } else {
      segmented.push(slotWindow);
    }
  });

  const dedupe = new Map();
  segmented.forEach((slot) => {
    const key = `${slot.localDateIso}_${slot.startHm}_${slot.endHm}`;
    if (!dedupe.has(key)) dedupe.set(key, slot);
  });

  if (dedupe.size === 0) {
    const fallbackStart = toHm(event?.localStartHm, "");
    const fallbackEnd = toHm(event?.localEndHm, "");
    const canUseFallback = !hasExplicitScheduleSlots
      && fallbackStart
      && fallbackEnd
      && (event?.localDateIso === localDateIso || repeatRule !== "doesNotRepeat");

    if (canUseFallback) {
      const startMs = toSlotDateTimeMs(localDateIso, fallbackStart);
      let endDateIso = localDateIso;
      const startMinutes = Number(fallbackStart.slice(0, 2)) * 60 + Number(fallbackStart.slice(3, 5));
      const endMinutes = Number(fallbackEnd.slice(0, 2)) * 60 + Number(fallbackEnd.slice(3, 5));
      if (endMinutes <= startMinutes) endDateIso = addDays(localDateIso, 1);
      const endMs = toSlotDateTimeMs(endDateIso, fallbackEnd);

      if (startMs != null && endMs != null) {
        const fallbackWindow = {
          localDateIso,
          startHm: fallbackStart,
          endHm: fallbackEnd,
          offHours: false,
          startMs,
          endMs,
          value: fallbackStart,
          label: hmToLabel(fallbackStart),
        };

        const fallbackParts = sliceWindowIntoSessionSlots(fallbackWindow, sessionMinutes, 0);
        const fallbackRows = (applyBufferAfterBooked && bufferMinutes > 0)
          ? sliceWindowIntoSessionSlotsWithPostBookedBuffer(
              fallbackWindow,
              sessionMinutes,
              bookedRowsForDate,
              bufferMinutes,
            )
          : fallbackParts;
        if (fallbackRows.length > 0) {
          fallbackRows.forEach((part) => {
            dedupe.set(`${part.localDateIso}_${part.startHm}_${part.endHm}`, part);
          });
        } else {
          dedupe.set(`${localDateIso}_${fallbackStart}_${fallbackEnd}`, fallbackWindow);
        }
      }
    }
  }

  return Array.from(dedupe.values()).sort((a, b) => a.startMs - b.startMs);
}

export function buildBookedSlotsIndex(slots = []) {
  const index = {};

  (Array.isArray(slots) ? slots : []).forEach((slot) => {
    const eventId = slot?.eventId;
    const startIso = slot?.startIso;
    const endIso = slot?.endIso;
    if (!eventId || !startIso || !endIso) return;

    const startDate = new Date(startIso);
    const endDate = new Date(endIso);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return;

    const localDateIso = formatLocalDateIso(startDate);
    if (!localDateIso) return;

    if (!index[eventId]) index[eventId] = {};
    if (!index[eventId][localDateIso]) index[eventId][localDateIso] = [];

    index[eventId][localDateIso].push({
      bookingId: slot.bookingId || null,
      startIso,
      endIso,
      startMs: startDate.getTime(),
      endMs: endDate.getTime(),
      startHm: formatLocalHm(startDate),
      endHm: formatLocalHm(endDate),
      status: slot.status || null,
    });
  });

  return index;
}

export function isSlotBooked({ eventId, localDateIso, slot, bookedSlotsIndex = {} }) {
  if (!eventId || !localDateIso || !slot) return false;

  const rows = bookedSlotsIndex?.[eventId]?.[localDateIso];
  if (!Array.isArray(rows) || rows.length === 0) return false;

  return rows.some((booked) => slot.startMs < booked.endMs && slot.endMs > booked.startMs);
}

export function isRangeBooked({ eventId, startMs, endMs, bookedSlotsIndex = {} }) {
  if (!eventId || !Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
    return false;
  }

  const byDate = bookedSlotsIndex?.[eventId];
  if (!byDate || typeof byDate !== "object") return false;

  return Object.values(byDate).some((rows) => {
    if (!Array.isArray(rows) || rows.length === 0) return false;
    return rows.some((booked) => startMs < booked.endMs && endMs > booked.startMs);
  });
}

export function computeNextAvailableSlot(event = {}, bookedSlotsIndex = {}, daysAhead = 30) {
  const today = new Date();
  for (let offset = 0; offset <= daysAhead; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const localDateIso = formatLocalDateIso(date);
    if (!localDateIso) continue;

    const candidates = buildCandidateSlotsForEventDate(event, localDateIso, {
      eventId: event.eventId,
      bookedSlotsIndex,
      applyBufferAfterBooked: true,
    });
    const firstFree = candidates.find((slot) => !isSlotBooked({
      eventId: event.eventId,
      localDateIso,
      slot,
      bookedSlotsIndex,
    }));

    if (firstFree) {
      return {
        dateIso: localDateIso,
        label: `${localDateIso} @ ${firstFree.label}`,
        slot: firstFree,
      };
    }
  }

  return null;
}

export function createSlotUiModel({ eventId, localDateIso, slot, bookedSlotsIndex }) {
  const disabled = isSlotBooked({ eventId, localDateIso, slot, bookedSlotsIndex });
  return {
    ...slot,
    disabled,
  };
}

function toCalendarSlotType(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "pending" || normalized === "pending_hold") return "custom";
  if (normalized === "confirmed" || normalized === "completed") return "event";
  if (normalized.startsWith("cancelled")) return "alt";
  return "custom2";
}

export function mapBookedSlotsToCalendarEvents(slots = [], options = {}) {
  const {
    includeStatuses = null,
    titleFallback = "Booked Slot",
  } = options;

  const includeSet = Array.isArray(includeStatuses) && includeStatuses.length > 0
    ? new Set(includeStatuses.map((value) => String(value).toLowerCase()))
    : null;

  return (Array.isArray(slots) ? slots : [])
    .map((slot) => {
      const start = slot?.startIso;
      const end = slot?.endIso;
      const status = String(slot?.status || "").toLowerCase();

      const startDate = new Date(start);
      const endDate = new Date(end);
      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return null;

      if (includeSet && !includeSet.has(status)) return null;

      const eventId = slot?.eventId || "event";
      const bookingId = slot?.bookingId || `${eventId}_${start}`;

      return {
        id: `booking_${bookingId}`,
        bookingId: slot?.bookingId || null,
        eventId,
        title: slot?.eventTitle || titleFallback,
        start,
        end,
        status,
        type: slot?.eventType || null,
        slot: toCalendarSlotType(status),
        raw: slot,
      };
    })
    .filter(Boolean)
    .sort((left, right) => {
      const leftTime = new Date(left.start).getTime();
      const rightTime = new Date(right.start).getTime();
      return leftTime - rightTime;
    });
}

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function addDaysToDate(date, days) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

function toLocalDateIsoFromDate(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function mergeContiguousSlots(slots = []) {
  if (!Array.isArray(slots) || slots.length === 0) return [];

  const sorted = [...slots].sort((left, right) => left.startMs - right.startMs);
  const merged = [];

  sorted.forEach((slot) => {
    const current = merged[merged.length - 1];
    if (!current) {
      merged.push({
        startMs: slot.startMs,
        endMs: slot.endMs,
      });
      return;
    }

    if (slot.startMs <= current.endMs) {
      current.endMs = Math.max(current.endMs, slot.endMs);
      return;
    }

    merged.push({
      startMs: slot.startMs,
      endMs: slot.endMs,
    });
  });

  return merged;
}

export function mapAvailabilityToCalendarEvents(events = [], options = {}) {
  const {
    bookedSlotsIndex = {},
    focusDate = new Date(),
    rangeDaysBefore = 14,
    rangeDaysAfter = 56,
  } = options;

  const start = addDaysToDate(startOfDay(focusDate), -Math.max(0, Number(rangeDaysBefore) || 0));
  const end = addDaysToDate(startOfDay(focusDate), Math.max(0, Number(rangeDaysAfter) || 0));

  const blocks = [];
  const dedupe = new Set();

  (Array.isArray(events) ? events : []).forEach((event) => {
    const eventId = String(event?.eventId || event?.id || "");
    if (!eventId) return;

    const status = String(event?.status || "").toLowerCase();
    if (status && status !== "active") return;

    const dateFrom = event?.dateFrom || null;
    const dateTo = event?.dateTo || null;
    const callType = String(event?.eventCallType || event?.raw?.eventCallType || "").toLowerCase();

    for (let day = new Date(start); day <= end; day = addDaysToDate(day, 1)) {
      const localDateIso = toLocalDateIsoFromDate(day);
      if (dateFrom && localDateIso < dateFrom) continue;
      if (dateTo && localDateIso > dateTo) continue;

      const candidates = buildCandidateSlotsForEventDate(event, localDateIso, {
        eventId,
        bookedSlotsIndex,
        applyBufferAfterBooked: true,
      });

      const freeSlots = candidates.filter((slot) => !isSlotBooked({
        eventId,
        localDateIso,
        slot,
        bookedSlotsIndex,
      }));

      if (freeSlots.length === 0) continue;

      const merged = mergeContiguousSlots(freeSlots);
      merged.forEach((windowSlot) => {
        const key = `${eventId}_${windowSlot.startMs}_${windowSlot.endMs}`;
        if (dedupe.has(key)) return;
        dedupe.add(key);

        blocks.push({
          id: `availability_${key}`,
          eventId,
          eventType: event?.type || event?.raw?.type || null,
          eventCallType: callType,
          title: "",
          start: new Date(windowSlot.startMs).toISOString(),
          end: new Date(windowSlot.endMs).toISOString(),
          status: "available",
          slot: "availability",
          isAvailabilityBlock: true,
          raw: {
            eventId,
            eventCallType: callType,
            eventColorSkin: event?.eventColorSkin || event?.raw?.eventColorSkin || null,
          },
        });
      });
    }
  });

  return blocks.sort((left, right) => {
    const leftTime = new Date(left.start).getTime();
    const rightTime = new Date(right.start).getTime();
    return leftTime - rightTime;
  });
}

export { hmToLabel, formatLocalDateIso, toSlotDateTimeMs };
