function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asTrimmedString(value, fallback = "") {
  if (value == null) return fallback;
  return String(value).trim();
}

function normalizeAddOns(addOns) {
  if (!Array.isArray(addOns)) return [];
  return addOns
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      id: asTrimmedString(item.id),
      qty: asNumber(item.qty, 1),
      tokens: asNumber(item.tokens, 0),
    }));
}

export function mapCreateReservationToRequest(payload = {}) {
  return {
    rentalId: payload.rentalId,
    creatorId: payload.creatorId,
    fanId: payload.fanId,
    date: payload.date,
    startTime: payload.startTime,
    sessionMinutes: asNumber(payload.sessionMinutes, 15),
    addOns: normalizeAddOns(payload.addOns),
    notes: asTrimmedString(payload.notes),
    paymentMethodId: payload.paymentMethodId || null,
    idempotencyKey: payload.idempotencyKey,
  };
}

export function mapConfirmReservationToRequest(payload = {}) {
  return {
    reservationId: payload.reservationId,
    paymentReference: payload.paymentReference || null,
    acceptedPolicyVersion: payload.acceptedPolicyVersion || null,
    idempotencyKey: payload.idempotencyKey,
  };
}

export function mapCancelReservationToRequest(payload = {}) {
  return {
    reservationId: payload.reservationId,
    reason: asTrimmedString(payload.reason, "user_cancelled"),
    idempotencyKey: payload.idempotencyKey,
  };
}
