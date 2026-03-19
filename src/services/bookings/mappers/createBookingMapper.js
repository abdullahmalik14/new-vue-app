import {
  addMinutesToHm,
  buildIdempotencyKey,
  localDateTimeToHkt,
  toHm,
} from "@/services/events/eventsApiUtils.js";
import { formatLocalDateIso } from "@/services/bookings/utils/bookingSlotUtils.js";

function safeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toWholeTokens(value) {
  const numeric = safeNumber(value, 0);
  return Math.ceil(numeric);
}

function hmToMinutes(value) {
  const hm = toHm(value, "00:00");
  const hours = safeNumber(hm.slice(0, 2), 0);
  const minutes = safeNumber(hm.slice(3, 5), 0);
  return (hours * 60) + minutes;
}

function inferDurationFromSlot(startHm, endHm) {
  const start = hmToMinutes(startHm);
  const end = hmToMinutes(endHm);
  if (end > start) return end - start;
  if (end < start) return (24 * 60) - start + end;
  return 0;
}

function toDateIso(value) {
  if (value instanceof Date) return formatLocalDateIso(value);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return formatLocalDateIso(parsed);
  }
  return formatLocalDateIso(new Date());
}

function addDays(dateIso, days) {
  const base = new Date(`${dateIso}T00:00:00`);
  if (Number.isNaN(base.getTime())) return dateIso;
  base.setDate(base.getDate() + days);
  return formatLocalDateIso(base);
}

function resolveSlotRange(state = {}) {
  const bookingDetails = state.bookingDetails || {};
  const fanSelection = state.fanBooking?.selection || {};

  const slot = bookingDetails.selectedTime || fanSelection.selectedSlot || {};
  const localDateIso = slot.localDateIso
    || fanSelection.selectedDate
    || toDateIso(bookingDetails.selectedDate);

  const startHm = toHm(slot.startHm || slot.value || bookingDetails?.selectedTime?.value, "15:00");
  const selectedDuration = safeNumber(
    bookingDetails?.selectedDuration?.value || fanSelection?.selectedDurationMinutes,
    0,
  );
  const slotDerivedDuration = inferDurationFromSlot(startHm, slot.endHm);
  const duration = selectedDuration > 0
    ? selectedDuration
    : (slotDerivedDuration > 0 ? slotDerivedDuration : 15);
  // End time must follow selected session length, not full availability window.
  const endHm = addMinutesToHm(startHm, duration);

  const startMinutes = safeNumber(startHm.slice(0, 2), 0) * 60 + safeNumber(startHm.slice(3, 5), 0);
  const endMinutes = safeNumber(endHm.slice(0, 2), 0) * 60 + safeNumber(endHm.slice(3, 5), 0);
  const endDateIso = endMinutes <= startMinutes ? addDays(localDateIso, 1) : localDateIso;

  return {
    localDateIso,
    endDateIso,
    startHm,
    endHm,
    duration,
  };
}

function resolveSelectedEvent(state = {}) {
  return state.fanBooking?.context?.selectedEvent || {};
}

function resolveSelectedSlot(state = {}) {
  return state?.bookingDetails?.selectedTime
    || state?.fanBooking?.selection?.selectedSlot
    || {};
}

function resolvePersonalRequestText(state = {}) {
  const bookingText = state?.bookingDetails?.otherRequest;
  const selectionText = state?.fanBooking?.selection?.personalRequestText;
  const chosen = bookingText ?? selectionText ?? "";
  return String(chosen).trim();
}

function resolveAddOnSelections(state = {}) {
  const addOns = Array.isArray(state?.bookingDetails?.addons)
    ? state.bookingDetails.addons
    : (Array.isArray(state?.fanBooking?.selection?.selectedAddOns) ? state.fanBooking.selection.selectedAddOns : []);

  return addOns.map((row) => ({
    title: row?.name || row?.title || "",
    price: safeNumber(row?.price, 0),
  })).filter((row) => row.title);
}

function isRecordingSelected(addons = []) {
  return addons.some((row) => String(row.title).toLowerCase().includes("record"));
}

function toBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0" || normalized === "") return false;
  }
  return fallback;
}

function computeSessionSubtotal({ basePriceTokens, baseSessionMinutes, durationMinutes }) {
  const basePrice = safeNumber(basePriceTokens, 0);
  const baseMinutes = safeNumber(baseSessionMinutes, 0);
  const duration = safeNumber(durationMinutes, 0);

  if (basePrice <= 0) return 0;
  if (baseMinutes <= 0 || duration <= 0) return toWholeTokens(basePrice);

  const perMinute = basePrice / baseMinutes;
  return toWholeTokens(perMinute * duration);
}

function computeLongerDiscount({ raw = {}, durationMinutes = 0, sessionSubtotal = 0, baseSessionMinutes = 0 }) {
  if (!toBoolean(raw.enableDiscountForLonger, false)) return { percent: 0, discountTokens: 0 };

  const percent = safeNumber(raw.discountPercentOfBase, 0);
  if (percent <= 0 || sessionSubtotal <= 0) return { percent, discountTokens: 0 };

  const minSessions = safeNumber(raw.discountMinSessions, NaN);
  const legacyMinMinutes = safeNumber(raw.discountMinSessionMinutes, NaN);

  let minimumMinutes = legacyMinMinutes;
  if (Number.isFinite(minSessions) && minSessions > 0 && baseSessionMinutes > 0) {
    minimumMinutes = baseSessionMinutes * minSessions;
  }

  if (!Number.isFinite(minimumMinutes) || minimumMinutes <= 0) {
    return { percent, discountTokens: 0 };
  }

  if (safeNumber(durationMinutes, 0) < minimumMinutes) {
    return { percent, discountTokens: 0 };
  }

  return {
    percent,
    discountTokens: toWholeTokens(sessionSubtotal * percent / 100),
  };
}

function buildPaymentAndSelections(event = {}, durationMinutes = 15, selectedAddOns = [], selectedSlot = {}) {
  const raw = event?.raw || {};

  const basePrice = safeNumber(raw.basePriceTokens ?? event.basePriceTokens, 0);
  const baseSessionMinutes = safeNumber(raw.sessionDurationMinutes ?? event.sessionDurationMinutes, 0);
  const sessionSubtotal = computeSessionSubtotal({
    basePriceTokens: basePrice,
    baseSessionMinutes,
    durationMinutes,
  });
  const lines = [{ code: "base", label: "Base Price", amount: sessionSubtotal }];

  if (raw.enableBookingFee) {
    lines.push({
      code: "booking_fee",
      label: "Booking Fee",
      amount: safeNumber(raw.bookingFeeTokens, 0),
    });
  }

  const addOnCatalog = Array.isArray(raw.addOns) ? raw.addOns : [];
  const recordingRequested = !!raw.allowFanRecordingEnabled && isRecordingSelected(selectedAddOns);
  const requestedAddOns = [];

  if (recordingRequested) {
    lines.push({
      code: "recording",
      label: "Recording",
      amount: safeNumber(raw.allowFanRecordingTokens, 0),
    });
  }

  selectedAddOns.forEach((selection) => {
    const match = addOnCatalog.find((item) => String(item?.title) === String(selection.title));
    if (!match) return;
    requestedAddOns.push({ title: String(match.title) });
    lines.push({
      code: "addon",
      label: `Add-on: ${match.title}`,
      amount: safeNumber(match.priceTokens, 0),
    });
  });

  const longerDiscount = computeLongerDiscount({
    raw,
    durationMinutes,
    sessionSubtotal,
    baseSessionMinutes,
  });
  if (longerDiscount.discountTokens > 0) {
    lines.push({
      code: "discount",
      label: `Longer Session Discount (${longerDiscount.percent}%)`,
      amount: -1 * longerDiscount.discountTokens,
    });
  }

  const offHoursSelected = toBoolean(selectedSlot?.offHours, false);
  const offHourSurchargeEnabled = toBoolean(raw.offHourSurcharge, false);
  const offHourSurchargePercent = safeNumber(raw.offHourSurchargePercent, 0);
  if (offHoursSelected && offHourSurchargeEnabled && offHourSurchargePercent > 0) {
    const subtotalBeforeSurcharge = Number(lines.reduce((sum, row) => sum + safeNumber(row.amount, 0), 0).toFixed(2));
    const surcharge = toWholeTokens(subtotalBeforeSurcharge * offHourSurchargePercent / 100);
    if (surcharge > 0) {
      lines.push({
        code: "off_hour_surcharge",
        label: `Off-hour Surcharge (${offHourSurchargePercent}%)`,
        amount: surcharge,
      });
    }
  }

  const total = toWholeTokens(lines.reduce((sum, row) => sum + safeNumber(row.amount, 0), 0));

  return {
    payment: {
      currency: "TOKENS",
      lines,
      total,
    },
    requestedAddOns,
    additionalRequests: {
      recording: recordingRequested,
      offHours: offHoursSelected,
    },
  };
}

export function mapCreateBookingToRequest(state = {}, context = {}) {
  const event = resolveSelectedEvent(state);
  const fanUserId = safeNumber(
    state?.fanBooking?.context?.fanUserId
      ?? context?.fanUserId
      ?? context?.userId,
    0,
  );

  const creatorId = safeNumber(
    event?.creatorId
      ?? state?.fanBooking?.context?.creatorId
      ?? context?.creatorId,
    0,
  );

  const eventId = event?.eventId || event?.id || null;
  const { localDateIso, endDateIso, startHm, endHm, duration } = resolveSlotRange(state);

  const startHkt = localDateTimeToHkt(localDateIso, startHm);
  const endHkt = localDateTimeToHkt(endDateIso, endHm);
  const selectedAddOns = resolveAddOnSelections(state);
  const selectedSlot = resolveSelectedSlot(state);
  const computed = buildPaymentAndSelections(event, duration, selectedAddOns, selectedSlot);

  return {
    eventId,
    userId: fanUserId,
    creatorId,
    startIso: startHkt.iso,
    endIso: endHkt.iso,
    durationMinutes: duration,
    requestedAddOns: computed.requestedAddOns,
    additionalRequests: computed.additionalRequests,
    personalRequestText: resolvePersonalRequestText(state),
    payment: computed.payment,
    temporaryHoldId: state?.fanBooking?.temporaryHold?.temporaryHoldId || null,
    idempotencyKey: state?.fanBooking?.booking?.idempotencyKey || buildIdempotencyKey("fan_booking"),
  };
}
