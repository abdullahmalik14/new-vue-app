import {
  resolveCreatorId,
  toNumberOr,
  stringToArray,
  buildIdempotencyKey,
  nextDateIso,
  toHm,
  addMinutesToHm,
  localDateTimeToHkt,
} from "@/services/events/eventsApiUtils.js";

const HKT_TIMEZONE = "Asia/Hong_Kong";

const DAY_KEY_TO_INDEX = {
  sun: 0,
  sunday: 0,
  mon: 1,
  monday: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  wed: 3,
  wednesday: 3,
  thu: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
};

function asBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return fallback;
}

function nonEmptyString(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function pickNumeric(value, fallback = null) {
  const numeric = toNumberOr(value, null);
  return numeric == null ? fallback : numeric;
}

function deriveEventType(payload = {}) {
  if (payload.type === "group-event" || payload.eventType === "group-event") {
    return "group-event";
  }

  if (payload.type === "1on1-call" || payload.eventType === "1on1-call") {
    return "1on1-call";
  }

  if (payload.type === "group" || payload.eventType === "group") {
    return "group-event";
  }

  return "1on1-call";
}

function hmToMinutes(value) {
  const [hours = "0", minutes = "0"] = String(value || "00:00").split(":");
  const parsedHours = Number(hours);
  const parsedMinutes = Number(minutes);
  if (!Number.isFinite(parsedHours) || !Number.isFinite(parsedMinutes)) return 0;
  return (parsedHours * 60) + parsedMinutes;
}

function addDaysToDateIso(dateIso, days) {
  const [year, month, day] = String(dateIso || "").split("-").map((part) => Number(part));
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return dateIso;

  const next = new Date(year, month - 1, day);
  if (Number.isNaN(next.getTime())) return dateIso;
  next.setDate(next.getDate() + days);

  const y = String(next.getFullYear());
  const m = String(next.getMonth() + 1).padStart(2, "0");
  const d = String(next.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function localDateIsoToHktDateIso(localDateIso, anchorHm = "12:00") {
  const converted = localDateTimeToHkt(localDateIso, anchorHm);
  return converted?.dateIso || localDateIso;
}

function normalizeRepeatRule(value) {
  const allowed = new Set(["doesNotRepeat", "weekly", "everyXWeeks", "daily", "monthly"]);
  if (!allowed.has(value)) return "weekly";
  return value;
}

function resolveDayIndex(dayLike) {
  const normalized = nonEmptyString(dayLike, "").toLowerCase();
  if (!normalized) return null;
  return DAY_KEY_TO_INDEX[normalized] ?? null;
}

function getWeekdayIndexFromDateIso(dateIso) {
  const parsed = new Date(`${dateIso}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return 0;
  return parsed.getDay();
}

function resolveDateForWeekday(baseDateIso, targetDayIndex) {
  const baseDayIndex = getWeekdayIndexFromDateIso(baseDateIso);
  const safeTargetDayIndex = Number.isFinite(targetDayIndex) ? targetDayIndex : baseDayIndex;
  const shift = ((safeTargetDayIndex - baseDayIndex) + 7) % 7;
  return addDaysToDateIso(baseDateIso, shift);
}

function derivePrimarySlot(payload = {}, duration) {
  const selectedDateLocal = nonEmptyString(payload.selectedDate, "")
    || nonEmptyString(payload.dateFrom, "")
    || nextDateIso(1);

  const startTimeLocal = toHm(payload.selectedStartTime || payload.startTime, "15:00");
  const endTimeLocal = toHm(
    payload.selectedEndTime || payload.endTime,
    addMinutesToHm(startTimeLocal, duration)
  );

  const explicitEndDateLocal = nonEmptyString(payload.selectedEndDate || payload.endDate, "");
  const inferredEndDateLocal = hmToMinutes(endTimeLocal) <= hmToMinutes(startTimeLocal)
    ? addDaysToDateIso(selectedDateLocal, 1)
    : selectedDateLocal;
  const endDateLocal = explicitEndDateLocal || inferredEndDateLocal;

  const startHkt = localDateTimeToHkt(selectedDateLocal, startTimeLocal);
  const endHkt = localDateTimeToHkt(endDateLocal, endTimeLocal);

  return {
    local: {
      dateIso: selectedDateLocal,
      endDateIso: endDateLocal,
      startTime: startTimeLocal,
      endTime: endTimeLocal,
    },
    hkt: {
      dateIso: startHkt.dateIso,
      endDateIso: endHkt.dateIso,
      eventTime: {
        start: startHkt.iso,
        end: endHkt.iso,
      },
      slot: {
        day: startHkt.weekday,
        startTime: startHkt.hm,
        endTime: endHkt.hm,
      },
    },
  };
}

function buildWeeklySlotsInHkt(payload = {}, primarySlot = {}, duration = 15) {
  const availability = Array.isArray(payload.weeklyAvailability) ? payload.weeklyAvailability : [];

  if (availability.length === 0) {
    return [primarySlot?.hkt?.slot].filter(Boolean);
  }

  const baseDateIso = primarySlot?.local?.dateIso || nextDateIso(1);
  const fallbackStart = primarySlot?.local?.startTime || "15:00";
  const fallbackEnd = primarySlot?.local?.endTime || addMinutesToHm(fallbackStart, duration);
  const slots = [];

  availability.forEach((dayEntry) => {
    if (!dayEntry || dayEntry.unavailable) return;

    const dayIndex = resolveDayIndex(dayEntry.key || dayEntry.name);
    if (dayIndex == null) return;

    const localDateIso = resolveDateForWeekday(baseDateIso, dayIndex);
    const daySlots = Array.isArray(dayEntry.slots) && dayEntry.slots.length > 0
      ? dayEntry.slots
      : [{ startTime: fallbackStart, endTime: fallbackEnd }];

    daySlots.forEach((slotEntry) => {
      const startLocalHm = toHm(slotEntry?.startTime, fallbackStart);
      const endLocalHm = toHm(slotEntry?.endTime, fallbackEnd);
      const endDateIso = hmToMinutes(endLocalHm) <= hmToMinutes(startLocalHm)
        ? addDaysToDateIso(localDateIso, 1)
        : localDateIso;

      const startHkt = localDateTimeToHkt(localDateIso, startLocalHm);
      const endHkt = localDateTimeToHkt(endDateIso, endLocalHm);

      slots.push({
        day: startHkt.weekday,
        startTime: startHkt.hm,
        endTime: endHkt.hm,
        offHours: asBoolean(slotEntry?.offHours, asBoolean(dayEntry?.offHours, false)),
      });
    });
  });

  return slots.length > 0 ? slots : [primarySlot?.hkt?.slot].filter(Boolean);
}

function buildOneTimeSlotsInHkt(payload = {}, primarySlot = {}, duration = 15) {
  const inputDates = Array.isArray(payload.oneTimeAvailability) ? payload.oneTimeAvailability : [];
  const outputMap = new Map();

  const fallbackDate = primarySlot?.local?.dateIso || nextDateIso(1);
  const fallbackStart = primarySlot?.local?.startTime || "12:00";
  const fallbackEnd = primarySlot?.local?.endTime || addMinutesToHm(fallbackStart, duration);

  const normalizedDates = inputDates.length > 0
    ? inputDates
    : [{ date: fallbackDate, slots: [{ startTime: fallbackStart, endTime: fallbackEnd }] }];

  normalizedDates.forEach((entry) => {
    const localDate = nonEmptyString(entry?.date, fallbackDate);
    const localSlots = Array.isArray(entry?.slots) && entry.slots.length > 0
      ? entry.slots
      : [{ startTime: fallbackStart, endTime: fallbackEnd }];

    localSlots.forEach((slot) => {
      const startLocalHm = toHm(slot?.startTime, fallbackStart);
      const endLocalHm = toHm(slot?.endTime, fallbackEnd);
      const endLocalDate = hmToMinutes(endLocalHm) <= hmToMinutes(startLocalHm)
        ? addDaysToDateIso(localDate, 1)
        : localDate;

      const startHkt = localDateTimeToHkt(localDate, startLocalHm);
      const endHkt = localDateTimeToHkt(endLocalDate, endLocalHm);
      const dateKey = startHkt.dateIso;

      if (!outputMap.has(dateKey)) {
        outputMap.set(dateKey, { date: dateKey, times: [] });
      }

      outputMap.get(dateKey).times.push({
        startTime: startHkt.hm,
        endTime: endHkt.hm,
        offHours: asBoolean(slot?.offHours, false),
      });
    });
  });

  return Array.from(outputMap.values());
}

function buildMonthlySlotsInHkt(payload = {}, primarySlot = {}, duration = 15) {
  const source = Array.isArray(payload.monthlyAvailability) ? payload.monthlyAvailability : [];
  const fallbackStart = primarySlot?.local?.startTime || "15:00";
  const fallbackEnd = primarySlot?.local?.endTime || addMinutesToHm(fallbackStart, duration);
  const anchorDate = nonEmptyString(payload.dateFrom, "")
    || primarySlot?.local?.dateIso
    || nextDateIso(1);

  const monthlyRows = source.length > 0 ? source : [{ startTime: fallbackStart, endTime: fallbackEnd, offHours: false }];

  return monthlyRows
    .map((slot) => {
      const startLocalHm = toHm(slot?.startTime, fallbackStart);
      const endLocalHm = toHm(slot?.endTime, fallbackEnd);
      const endLocalDate = hmToMinutes(endLocalHm) <= hmToMinutes(startLocalHm)
        ? addDaysToDateIso(anchorDate, 1)
        : anchorDate;

      const startHkt = localDateTimeToHkt(anchorDate, startLocalHm);
      const endHkt = localDateTimeToHkt(endLocalDate, endLocalHm);

      return {
        startTime: startHkt.hm,
        endTime: endHkt.hm,
        offHours: asBoolean(slot?.offHours, false),
      };
    })
    .filter((slot) => slot.startTime && slot.endTime);
}

function buildRepeatSlots(repeatRule, payload = {}, primarySlot = {}, duration = 15) {
  if (repeatRule === "doesNotRepeat") {
    return buildOneTimeSlotsInHkt(payload, primarySlot, duration);
  }

  if (repeatRule === "monthly") {
    return buildMonthlySlotsInHkt(payload, primarySlot, duration);
  }

  const weeklySlots = buildWeeklySlotsInHkt(payload, primarySlot, duration);

  if (repeatRule === "daily") {
    const byTime = new Map();
    weeklySlots.forEach((slot) => {
      const key = `${slot.startTime}-${slot.endTime}`;
      if (!byTime.has(key)) {
        byTime.set(key, {
          startTime: slot.startTime,
          endTime: slot.endTime,
          offHours: asBoolean(slot?.offHours, false),
        });
        return;
      }
      const existing = byTime.get(key);
      existing.offHours = asBoolean(existing.offHours, false) || asBoolean(slot?.offHours, false);
    });

    const uniqueSlots = Array.from(byTime.values());
    return uniqueSlots.length > 0
      ? uniqueSlots
      : [{
        startTime: primarySlot?.hkt?.slot?.startTime,
        endTime: primarySlot?.hkt?.slot?.endTime,
        offHours: false,
      }];
  }

  return weeklySlots;
}

function deriveDateRange(payload = {}, primarySlot = {}) {
  const oneTimeDates = Array.isArray(payload.oneTimeAvailability)
    ? payload.oneTimeAvailability
      .map((entry) => nonEmptyString(entry?.date, ""))
      .filter(Boolean)
      .sort()
    : [];

  const localDateFrom = nonEmptyString(payload.dateFrom, "")
    || oneTimeDates[0]
    || primarySlot?.local?.dateIso;
  const explicitLocalDateTo = nonEmptyString(payload.dateTo, "");
  const localDateTo = explicitLocalDateTo || null;

  return {
    localDateFrom,
    localDateTo,
    hktDateFrom: localDateIsoToHktDateIso(localDateFrom, primarySlot?.local?.startTime || "12:00"),
    hktDateTo: localDateTo
      ? localDateIsoToHktDateIso(localDateTo, primarySlot?.local?.endTime || "12:00")
      : null,
  };
}

function buildSocialAutoPost(payload = {}) {
  return {
    onScheduleLive: asBoolean(payload.xPostLive, false),
    onBookingReceived: asBoolean(payload.xPostBooked, false),
    onInSession: asBoolean(payload.xPostInSession, false),
    onTipped: asBoolean(payload.xPostTipped, false),
    onPurchased: asBoolean(payload.xPostPurchase, false),
  };
}

function withOptionalField(target, key, value) {
  if (value === undefined || value === null || value === "") return;
  target[key] = value;
}

function applyAudienceConstraints(mapped, payload = {}) {
  if (mapped.whoCanBook === "subscribersOnly") {
    mapped.subscriptionTiers = stringToArray(payload.subscriptionTiers);
  }

  if (mapped.whoCanBook === "inviteOnly") {
    mapped.invitedUsers = stringToArray(payload.invitedUsers);
    withOptionalField(mapped, "inviteSecret", nonEmptyString(payload.inviteSecret, ""));
  }
}

function applySpendingConstraints(mapped, payload = {}) {
  if (mapped.spendingRequirement === "minSpend") {
    withOptionalField(mapped, "minSpendTokens", pickNumeric(payload.minSpendTokens, 0));
  }

  if (mapped.spendingRequirement === "mustOwnProducts") {
    const source = Array.isArray(payload.requiredProducts) ? payload.requiredProducts : [];
    const normalized = [];
    const seen = new Set();

    source.forEach((item) => {
      if (!item || typeof item !== "object") return;
      const id = toNumberOr(item.id, null);
      const type = nonEmptyString(item.type, "").toLowerCase();
      if (id == null || !type) return;

      const key = `${type}:${id}`;
      if (seen.has(key)) return;
      seen.add(key);

      const normalizedItem = {
        id,
        type,
        title: nonEmptyString(item.title, `Product ${id}`),
        tags: Array.isArray(item.tags)
          ? item.tags.map((tag) => nonEmptyString(tag, "")).filter(Boolean)
          : [],
      };

      const buyPrice = pickNumeric(item?.buyPrice, null);
      if (buyPrice != null) {
        normalizedItem.buyPrice = buyPrice;
      }

      const subscribePrice = pickNumeric(item?.subscribePrice, null);
      if (subscribePrice != null) {
        normalizedItem.subscribePrice = subscribePrice;
      }

      const thumbnailUrl = nonEmptyString(item.thumbnailUrl, "");
      if (thumbnailUrl) {
        normalizedItem.thumbnailUrl = thumbnailUrl;
      }

      normalized.push(normalizedItem);
    });

    mapped.requiredProducts = normalized;
  }
}

function normalizeAddOns(addOns = []) {
  const source = Array.isArray(addOns) ? addOns : [];
  const normalized = [];

  source.forEach((item) => {
    if (!item || typeof item !== "object") return;

    const title = nonEmptyString(item.title || item.name, "");
    const description = typeof item.description === "string"
      ? item.description.trim()
      : "";
    const priceTokens = pickNumeric(item.priceTokens ?? item.tokens ?? item.price, null);

    const hasAnyValue = title || description || priceTokens !== null;
    if (!hasAnyValue) return;
    if (!title) return;
    if (priceTokens === null || priceTokens < 0) return;

    normalized.push({
      title,
      description,
      priceTokens,
    });
  });

  return normalized;
}

function buildLateStartPolicy(payload = {}) {
  const action = nonEmptyString(payload.lateStartAction, "reschedule");
  const policy = { action };

  if (action === "nextDiscount") {
    withOptionalField(policy, "discountPercent", pickNumeric(payload.lateStartDiscountPercent, 0));
  }

  return policy;
}

function mapBasePayload(payload = {}, context = {}) {
  const creatorId = resolveCreatorId(payload, context);
  const type = deriveEventType(payload);
  const duration = pickNumeric(payload.duration ?? payload.sessionDurationMinutes, 15);
  const basePrice = pickNumeric(payload.basePrice ?? payload.basePriceTokens, 0);
  const primarySlot = derivePrimarySlot(payload, duration);
  const repeatRule = normalizeRepeatRule(nonEmptyString(payload.repeatRule, "weekly"));
  const dateRange = deriveDateRange(payload, primarySlot);

  const mapped = {
    creatorId,
    type,
    title: nonEmptyString(payload.eventTitle || payload.title, "Untitled Event"),
    description: nonEmptyString(payload.eventDescription || payload.description, "No description provided"),
    eventColorSkin: nonEmptyString(payload.eventColorSkin, "#5549FF"),
    eventCallType: nonEmptyString(payload.eventCallType, "video"),
    eventRingtoneUrl: nonEmptyString(payload.eventRingtoneUrl, "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"),
    sessionDurationMinutes: duration,
    basePriceTokens: basePrice,
    whoCanBook: nonEmptyString(payload.whoCanBook, "everyone"),
    spendingRequirement: nonEmptyString(payload.spendingRequirement, "none"),
    repeatRule,
    slots: buildRepeatSlots(repeatRule, payload, primarySlot, duration),

    allowLongerSessions: asBoolean(payload.allowLongerSessions, false),
    enableDiscountForLonger: asBoolean(payload.enableLongerDiscount, false),
    enableBookingFee: asBoolean(payload.enableBookingFee, false),
    allowInstantBooking: asBoolean(payload.allowInstantBooking, false),
    disableChatBeforeCall: asBoolean(payload.disableChatBeforeCall, false),
    enableRescheduleFee: asBoolean(payload.enableRescheduleFee, false),
    enableCancellationFee: asBoolean(payload.enableCancellationFee, false),
    allowAdvanceCancelToAvoidMinCharge: asBoolean(payload.allowAdvanceCancellation, false),
    offHourSurcharge: asBoolean(payload.addOffHourSurcharge, false),
    disableChatDuringCall: asBoolean(payload.disableChatDuringCall, false),
    fanCanRequestExtend: asBoolean(payload.requestExtendSession, false),
    enableBufferTime: asBoolean(payload.setBufferTime, false),
    enableMaxBookingsPerDay: asBoolean(payload.setMaxBookings, false),
    waitlistEnabled: asBoolean(payload.allowWaitlist, false),

    socialAutoPost: buildSocialAutoPost(payload),
    blockedUsers: stringToArray(payload.blockedUsers || payload.blockedUserSearch),
    coHosts: stringToArray(payload.coHosts || payload.coPerformerSearch),
    addOns: normalizeAddOns(payload.addOns),

    allowFanRecordingEnabled: asBoolean(payload.allowRecording, false),
    allowPersonalRequestRequired: asBoolean(payload.allowPersonalRequest, false),
    lateStartPolicy: buildLateStartPolicy(payload),

    idempotencyKey: nonEmptyString(payload.idempotencyKey, "") || buildIdempotencyKey("create_event"),
  };

  if (repeatRule === "everyXWeeks") {
    withOptionalField(mapped, "repeatX", pickNumeric(payload.repeatX, 2));
  }

  withOptionalField(mapped, "dateFrom", dateRange.hktDateFrom);
  withOptionalField(mapped, "dateTo", dateRange.hktDateTo);
  withOptionalField(mapped, "eventImageUrl", nonEmptyString(payload.eventImageUrl || payload.imageUrl, ""));
  withOptionalField(mapped, "mediaId", pickNumeric(payload.mediaId, null));

  applyAudienceConstraints(mapped, payload);
  applySpendingConstraints(mapped, payload);

  if (mapped.allowLongerSessions) {
    withOptionalField(mapped, "maxSessionMinutes", pickNumeric(payload.maxSessionDuration || payload.maxSessionMinutes, duration));
  }

  if (mapped.enableDiscountForLonger) {
    withOptionalField(mapped, "discountMinSessions", pickNumeric(payload.sessionMinimum || payload.discountMinSessions || payload.discountEventsCount, 2));
    withOptionalField(mapped, "discountPercentOfBase", pickNumeric(payload.discountPercentage || payload.discountPercentOfBase, 0));
  }

  if (mapped.enableBookingFee) {
    withOptionalField(mapped, "bookingFeeTokens", pickNumeric(payload.bookingFee || payload.bookingFeeTokens, 0));
  }

  if (mapped.enableRescheduleFee) {
    withOptionalField(mapped, "rescheduleFeeTokens", pickNumeric(payload.rescheduleFee || payload.rescheduleFeeTokens, 0));
  }

  if (mapped.enableCancellationFee) {
    withOptionalField(mapped, "cancellationFeeTokens", pickNumeric(payload.cancellationFee || payload.cancellationFeeTokens, 0));
  }

  if (mapped.allowAdvanceCancelToAvoidMinCharge) {
    withOptionalField(mapped, "advanceCancelWindowQuantity", pickNumeric(payload.advanceVoid || payload.advanceCancelWindowQuantity, 1));
    withOptionalField(mapped, "advanceCancelWindowUnit", nonEmptyString(payload.advanceCancelWindowUnit, "day"));
  }

  if (mapped.offHourSurcharge) {
    withOptionalField(mapped, "offHourSurchargePercent", pickNumeric(payload.offHourSurchargePercent || payload.offHourSurcharge, 0));
  }

  if (mapped.fanCanRequestExtend) {
    withOptionalField(mapped, "extendMaxSessionMinutes", pickNumeric(payload.extendSessionMax || payload.extendMaxSessionMinutes, duration));
  }

  const reminderEnabled = asBoolean(payload.setReminders ?? payload.enableCallReminderMinutesBefore, false);
  const reminderMinutes = pickNumeric(payload.remindMeTime || payload.callReminderMinutesBefore, null);
  if (reminderEnabled && reminderMinutes != null) {
    mapped.enableCallReminderMinutesBefore = true;
    mapped.callReminderMinutesBefore = reminderMinutes;
  } else {
    mapped.enableCallReminderMinutesBefore = false;
  }

  if (mapped.enableBufferTime) {
    withOptionalField(mapped, "bookingBufferMinutes", pickNumeric(payload.bufferTime || payload.bookingBufferMinutes, 5));
  }

  if (mapped.enableMaxBookingsPerDay) {
    withOptionalField(mapped, "maxBookingsPerDay", pickNumeric(payload.maxBookingsPerDay, 1));
  }

  if (mapped.waitlistEnabled) {
    withOptionalField(mapped, "waitlistSpots", pickNumeric(payload.waitlistSpots || payload.waitlistSlots, 1));
  }

  if (mapped.allowFanRecordingEnabled) {
    withOptionalField(mapped, "allowFanRecordingTokens", pickNumeric(payload.recordingPrice || payload.allowFanRecordingTokens, 0));
  }

  if (type === "group-event") {
    mapped.priceSetting = nonEmptyString(payload.priceSetting, "fixedPricePerUser");
    mapped.enableMaxUsersInGroup = asBoolean(payload.setMaxUsers || payload.enableMaxUsersInGroup, false);

    if (mapped.enableMaxUsersInGroup) {
      withOptionalField(mapped, "maxUsersInGroup", pickNumeric(payload.maxUsers || payload.maxUsersInGroup, 2));
    }

    mapped.enableDiscountForRecurring = asBoolean(payload.enableLongerDiscount || payload.enableDiscountForRecurring, false);

    if (mapped.enableDiscountForRecurring) {
      withOptionalField(mapped, "minEventsForRecurringDiscount", pickNumeric(payload.discountEventsCount || payload.minEventsForRecurringDiscount, 2));
      withOptionalField(mapped, "recurringDiscountPercentOfBase", pickNumeric(payload.discountPercentage || payload.recurringDiscountPercentOfBase, 0));
    }

    mapped.eventTime = {
      start: primarySlot.hkt.eventTime.start,
      end: primarySlot.hkt.eventTime.end,
      timezone: HKT_TIMEZONE,
    };
  }

  return mapped;
}

export function createEventMapper(payload = {}, context = {}) {
  return mapBasePayload(payload, context);
}
