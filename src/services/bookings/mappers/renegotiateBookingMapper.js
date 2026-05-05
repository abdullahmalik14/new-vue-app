function resolveBookingId(input = {}) {
  return input?.bookingId
    || input?.event?.bookingId
    || input?.event?.raw?.bookingId
    || input?.booking?.bookingId
    || input?.booking?.raw?.bookingId
    || null;
}

function normalizeRequestedAddOns(input = {}) {
  const source = input?.requestedAddOns !== undefined ? input.requestedAddOns : input?.addons;
  if (source === undefined) return undefined;
  if (!Array.isArray(source)) return source;

  const seen = new Set();
  const normalized = [];
  source.forEach((row) => {
    const title = String(row?.title || row?.name || "").trim();
    if (!title || seen.has(title)) return;
    seen.add(title);
    normalized.push({ title });
  });
  return normalized;
}

export function mapRenegotiateBookingToRequest(input = {}) {
  const requestedAddOns = normalizeRequestedAddOns(input);

  return {
    bookingId: resolveBookingId(input),
    actionType: "renegotiate",
    ...(input?.personalRequestText !== undefined ? { personalRequestText: input.personalRequestText } : {}),
    ...(input?.sessionDurationMinutes !== undefined ? { sessionDurationMinutes: input.sessionDurationMinutes } : {}),
    ...(input?.costTokens !== undefined ? { costTokens: input.costTokens } : {}),
    ...(requestedAddOns !== undefined ? { requestedAddOns } : {}),
    ...(input?.startAtIso !== undefined ? { startAtIso: input.startAtIso } : {}),
    actor: input?.actor || "system",
    args: input?.args && typeof input.args === "object" ? input.args : {},
  };
}
