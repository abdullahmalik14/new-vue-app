import { mapCreateBookingToRequest } from "@/services/bookings/mappers/createBookingMapper.js";

export function mapCreateTemporaryHoldToRequest(state = {}, context = {}) {
  const bookingPayload = mapCreateBookingToRequest(state, context);
  const isGuestHold = context?.isGuestHold === true || Number(context?.fanId ?? bookingPayload.userId) <= 0;

  return {
    eventId: bookingPayload.eventId,
    userId: isGuestHold ? 0 : bookingPayload.userId,
    creatorId: bookingPayload.creatorId,
    startIso: bookingPayload.startIso,
    endIso: bookingPayload.endIso,
    guestSessionId: isGuestHold ? context?.guestSessionId : null,
  };
}
