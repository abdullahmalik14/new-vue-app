import { fail } from "@/services/flow-system/flowTypes.js";

const HKT_TIMEZONE = "Asia/Hong_Kong";
const HKT_OFFSET_SUFFIX = "+08:00";

export function getEventsApiBaseUrl(context) {
  return context.apiBaseUrl || import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
}

export function asFlowError(error, fallbackCode, fallbackMessage) {
  if (error?.ok === false && error?.error) {
    return error;
  }

  return fail({
    code: error?.code || fallbackCode,
    message: error?.message || fallbackMessage,
    details: error?.details || error,
  });
}

export function toNumberOr(value, fallback = null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function resolveCreatorId(input = {}, context = {}) {
  const candidates = [
    input.creatorId,
    context.creatorId,
    context.route?.query?.creatorId,
    context.userId,
    typeof window !== "undefined" ? window.localStorage?.getItem("creatorId") : null,
  ];

  for (let index = 0; index < candidates.length; index += 1) {
    const numeric = toNumberOr(candidates[index], null);
    if (numeric != null) {
      return numeric;
    }
  }

  return 1;
}

export function buildIdempotencyKey(prefix = "evt") {
  const randomPart = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  return `${prefix}_${randomPart}`;
}

export function stringToArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function splitDateIso(dateIso) {
  const normalized = String(dateIso || "").slice(0, 10);
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

function splitHm(hm) {
  const normalized = toHm(hm, "");
  const match = normalized.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;

  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
  };
}

function parseHktDateTimeToUtcMillis(dateIso, hm) {
  const dateParts = splitDateIso(dateIso);
  const timeParts = splitHm(hm);
  if (!dateParts || !timeParts) return null;

  // HKT is fixed UTC+08 with no daylight saving.
  return Date.UTC(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day,
    timeParts.hour - 8,
    timeParts.minute,
    0,
    0,
  );
}

function getPartsInHkt(date) {
  try {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: HKT_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      weekday: "long",
    });

    const parts = formatter.formatToParts(date);
    const partMap = {};
    parts.forEach((part) => {
      if (part?.type) {
        partMap[part.type] = part.value;
      }
    });

    return {
      year: partMap.year,
      month: partMap.month,
      day: partMap.day,
      hour: partMap.hour,
      minute: partMap.minute,
      second: partMap.second || "00",
      weekday: (partMap.weekday || "").toLowerCase(),
    };
  } catch (error) {
    return null;
  }
}

function buildLocalDateFromDateAndHm(dateIso, hm) {
  const dateParts = splitDateIso(dateIso);
  const timeParts = splitHm(hm);
  if (!dateParts || !timeParts) return null;

  const localDate = new Date(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day,
    timeParts.hour,
    timeParts.minute,
    0,
    0,
  );
  if (Number.isNaN(localDate.getTime())) return null;
  return localDate;
}

export function toHm(value, fallback = "15:00") {
  if (typeof value === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(value.trim())) {
    return value.trim().slice(0, 5);
  }

  return fallback;
}

export function addMinutesToHm(hm, minutesToAdd = 15) {
  const [rawHours = "0", rawMinutes = "0"] = String(hm || "00:00").split(":");
  const baseHours = Number(rawHours);
  const baseMinutes = Number(rawMinutes);
  const safeMinutesToAdd = Number.isFinite(Number(minutesToAdd)) ? Number(minutesToAdd) : 0;

  const totalMinutes = (baseHours * 60) + baseMinutes + safeMinutesToAdd;
  const normalized = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const nextHours = Math.floor(normalized / 60);
  const nextMinutes = normalized % 60;

  return `${pad2(nextHours)}:${pad2(nextMinutes)}`;
}

export function nextDateIso(daysAhead = 1) {
  const now = new Date();
  now.setDate(now.getDate() + daysAhead);
  return now.toISOString().slice(0, 10);
}

export function weekdayFromDateIso(dateIso) {
  const date = new Date(`${dateIso}T00:00:00`);
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  return weekday;
}

export function makeIsoDateTime(dateIso, hm, useUtcSuffix = false) {
  const normalizedDate = dateIso || nextDateIso(1);
  const normalizedTime = toHm(hm, "15:00");
  const suffix = useUtcSuffix ? "Z" : "";
  return `${normalizedDate}T${normalizedTime}:00${suffix}`;
}

export function hktDateTimeToLocalIso(dateIso, hm) {
  const utcMillis = parseHktDateTimeToUtcMillis(dateIso, hm);
  if (utcMillis == null) {
    return makeIsoDateTime(dateIso, hm, false);
  }
  return new Date(utcMillis).toISOString();
}

export function hktDateTimeToLocalDate(dateIso, hm) {
  const utcMillis = parseHktDateTimeToUtcMillis(dateIso, hm);
  if (utcMillis == null) return null;
  return new Date(utcMillis);
}

export function localDateTimeToHkt(dateIso, hm) {
  const localDate = buildLocalDateFromDateAndHm(dateIso, hm);
  if (!localDate) {
    const fallbackDate = dateIso || nextDateIso(1);
    const fallbackHm = toHm(hm, "15:00");
    return {
      dateIso: fallbackDate,
      hm: fallbackHm,
      weekday: weekdayFromDateIso(fallbackDate),
      iso: `${fallbackDate}T${fallbackHm}:00${HKT_OFFSET_SUFFIX}`,
      utcIso: makeIsoDateTime(fallbackDate, fallbackHm, true),
    };
  }

  const hktParts = getPartsInHkt(localDate);
  if (!hktParts) {
    const fallbackDate = dateIso || nextDateIso(1);
    const fallbackHm = toHm(hm, "15:00");
    return {
      dateIso: fallbackDate,
      hm: fallbackHm,
      weekday: weekdayFromDateIso(fallbackDate),
      iso: `${fallbackDate}T${fallbackHm}:00${HKT_OFFSET_SUFFIX}`,
      utcIso: makeIsoDateTime(fallbackDate, fallbackHm, true),
    };
  }

  const hktDateIso = `${hktParts.year}-${hktParts.month}-${hktParts.day}`;
  const hktHm = `${hktParts.hour}:${hktParts.minute}`;
  return {
    dateIso: hktDateIso,
    hm: hktHm,
    weekday: hktParts.weekday,
    iso: `${hktDateIso}T${hktHm}:${hktParts.second}${HKT_OFFSET_SUFFIX}`,
    utcIso: makeIsoDateTime(hktDateIso, hktHm, true),
  };
}

export function extractDateIso(value, fallback = null) {
  if (typeof value !== "string") return fallback;
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : fallback;
}

export function extractHm(value, fallback = "15:00") {
  if (typeof value !== "string") return toHm(fallback, "15:00");
  const match = value.match(/T?(\d{2}:\d{2})(?::\d{2})?/);
  if (match) return toHm(match[1], fallback);
  return toHm(fallback, "15:00");
}
