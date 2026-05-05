function resolveBookingId(input = {}) {
  return input?.bookingId
    || input?.event?.bookingId
    || input?.event?.raw?.bookingId
    || input?.booking?.bookingId
    || input?.booking?.raw?.bookingId
    || null;
}

export function mapRescheduleBookingToRequest(input = {}) {
  return {
    bookingId: resolveBookingId(input),
    actionType: "reschedule",
    startAtIso: input?.startAtIso || "",
    actor: input?.actor || "system",
    args: input?.args && typeof input.args === "object" ? input.args : {},
  };
}
