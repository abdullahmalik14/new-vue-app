function resolveBookingId(input = {}) {
  return input?.bookingId
    || input?.event?.bookingId
    || input?.event?.raw?.bookingId
    || input?.booking?.bookingId
    || input?.booking?.raw?.bookingId
    || null;
}

export function mapUpdateBookingMetaToRequest(input = {}) {
  return {
    bookingId: resolveBookingId(input),
    actionType: "update_meta",
    meta: input?.meta && typeof input.meta === "object" ? input.meta : {},
    actor: input?.actor || "system",
    args: input?.args && typeof input.args === "object" ? input.args : {},
  };
}
