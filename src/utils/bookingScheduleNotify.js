function toBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0' || normalized === '') return false;
  }
  return fallback;
}

function pickNumber(...values) {
  for (const value of values) {
    const num = Number(value);
    if (Number.isFinite(num)) return num;
  }
  return null;
}

function pickString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function normalizeBaseUrl(baseUrl = import.meta.env.VITE_WEB_BASE_URL) {
  return typeof baseUrl === 'string' ? baseUrl.trim().replace(/\/+$/, '') : '';
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function formatWithOffset(date, offsetMinutes) {
  const shifted = new Date(date.getTime() + (offsetMinutes * 60 * 1000));
  const year = shifted.getUTCFullYear();
  const month = pad(shifted.getUTCMonth() + 1);
  const day = pad(shifted.getUTCDate());
  const hours = pad(shifted.getUTCHours());
  const minutes = pad(shifted.getUTCMinutes());
  const seconds = pad(shifted.getUTCSeconds());
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absolute = Math.abs(offsetMinutes);
  const offsetHours = pad(Math.floor(absolute / 60));
  const offsetMins = pad(absolute % 60);
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMins}`;
}

function extractOffsetMinutes(isoString) {
  if (typeof isoString !== 'string') return null;
  const trimmed = isoString.trim();
  if (!trimmed) return null;
  if (trimmed.endsWith('Z')) return 0;
  const match = trimmed.match(/([+-])(\d{2}):(\d{2})$/);
  if (!match) return null;
  const sign = match[1] === '-' ? -1 : 1;
  return sign * ((Number(match[2]) * 60) + Number(match[3]));
}

function computeRemindAtIso(startIso, reminderMinutes) {
  const startDate = new Date(startIso);
  if (Number.isNaN(startDate.getTime())) return '';
  const remindAt = new Date(startDate.getTime() - (reminderMinutes * 60 * 1000));
  if (Number.isNaN(remindAt.getTime())) return '';
  const offsetMinutes = extractOffsetMinutes(startIso);
  if (offsetMinutes === null) {
    return remindAt.toISOString();
  }
  return formatWithOffset(remindAt, offsetMinutes);
}

export function getCreateScheduleNotifyPayload({
  event = null,
  booking = null,
  bookingId = null,
  eventId = null,
  startIso = '',
  fanId = '',
  creatorId = '',
  participantCount = 1,
} = {}) {
  const eventSnapshot = event && typeof event === 'object'
    ? {
        ...(event.raw?.eventCurrent || {}),
        ...(event.raw?.eventSnapshot || {}),
        ...(event.raw || {}),
        ...event,
      }
    : {};

  const bookingSnapshot = booking && typeof booking === 'object' ? booking : {};
  const reminderEnabled = toBoolean(
    eventSnapshot.enableCallReminderMinutesBefore
      ?? eventSnapshot.setReminders,
    false,
  );

  const reminderMinutes = Math.round(
    pickNumber(
      eventSnapshot.callReminderMinutesBefore,
      eventSnapshot.remindBeforeMinutes,
      bookingSnapshot.reminderMinutes,
    ) || 0
  );

  if (!reminderEnabled || !Number.isFinite(reminderMinutes) || reminderMinutes <= 0) {
    return { shouldFire: false, payload: null };
  }

  const resolvedStartIso = pickString(
    startIso,
    bookingSnapshot.startAtIso,
    bookingSnapshot.startIso,
    bookingSnapshot.start,
    event?.start,
  );

  if (!resolvedStartIso) {
    return { shouldFire: false, payload: null };
  }

  const remindAt = computeRemindAtIso(resolvedStartIso, reminderMinutes);
  if (!remindAt) {
    return { shouldFire: false, payload: null };
  }

  const payload = {
    session_type: pickString(eventSnapshot.eventCallType, eventSnapshot.callType, 'video'),
    event_type: pickString(eventSnapshot.type, eventSnapshot.eventType, '1on1-call'),
    event_duration: Math.round(
      pickNumber(
        bookingSnapshot.durationMinutes,
        eventSnapshot.sessionDurationMinutes,
      ) || 0
    ),
    start_at: resolvedStartIso,
    event_name: pickString(eventSnapshot.title, bookingSnapshot.eventTitle, 'Untitled Event'),
    booking_id: pickString(bookingId, bookingSnapshot.bookingId),
    event_id: pickString(eventId, bookingSnapshot.eventId, eventSnapshot.eventId),
    number_of_participants: Math.max(1, Math.round(Number(participantCount || 1))),
    fan_id: pickNumber(fanId, bookingSnapshot.userId),
    creator_id: pickNumber(creatorId, bookingSnapshot.creatorId, eventSnapshot.creatorId),
    remind_at: remindAt,
    reminder_minutes: reminderMinutes,
  };

  if (!payload.booking_id || !payload.event_id || !payload.fan_id || !payload.creator_id) {
    return { shouldFire: false, payload: null };
  }

  return { shouldFire: true, payload };
}

export function shouldFireCreateScheduleForInstantBooking(event = null) {
  const snapshot = event && typeof event === 'object'
    ? {
        ...(event.raw?.eventCurrent || {}),
        ...(event.raw?.eventSnapshot || {}),
        ...(event.raw || {}),
        ...event,
      }
    : {};

  return toBoolean(snapshot.allowInstantBooking, false)
    && toBoolean(snapshot.enableCallReminderMinutesBefore ?? snapshot.setReminders, false);
}

export function shouldFireCreateScheduleAfterApproval(event = null) {
  const snapshot = event && typeof event === 'object'
    ? {
        ...(event.raw?.eventCurrent || {}),
        ...(event.raw?.eventSnapshot || {}),
        ...(event.raw || {}),
        ...event,
      }
    : {};

  return !toBoolean(snapshot.allowInstantBooking, false)
    && toBoolean(snapshot.enableCallReminderMinutesBefore ?? snapshot.setReminders, false);
}

export function fireAndForgetCreateScheduleNotify(payload, baseUrl = import.meta.env.VITE_WEB_BASE_URL) {
  if (!payload || typeof payload !== 'object') return false;

  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  if (!normalizedBaseUrl) return false;

  const endpoint = `${normalizedBaseUrl}/wp-json/api/bookings/create-schedule`;

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      const queued = navigator.sendBeacon(endpoint, blob);
      if (queued) return true;
    }
  } catch (_) {
    // Fire-and-forget endpoint; ignore transport errors.
  }

  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Fire-and-forget endpoint; ignore transport errors.
  });

  return true;
}
