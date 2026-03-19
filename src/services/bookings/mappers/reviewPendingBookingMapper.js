export function mapReviewPendingBookingToRequest(input = {}) {
  const bookingId = input?.bookingId
    || input?.event?.bookingId
    || input?.event?.raw?.bookingId
    || null;

  const decisionRaw = input?.decision || input?.action || "";
  const decision = String(decisionRaw).trim().toLowerCase();

  return {
    bookingId,
    decision,
    actor: input?.actor || "creator",
    reason: input?.reason || "",
    args: input?.args && typeof input.args === "object" ? input.args : {},
  };
}

