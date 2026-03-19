export function mapCancelBookingToRequest(input = {}) {
  const bookingId = input?.bookingId
    || input?.event?.bookingId
    || input?.event?.raw?.bookingId
    || null;

  return {
    bookingId,
    actor: input?.actor || "creator",
    reason: input?.reason || "",
    waiveFees: !!input?.waiveFees,
    args: input?.args && typeof input.args === "object" ? input.args : {},
  };
}
