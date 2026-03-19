import { mapCreateBookingToRequest } from "@/services/bookings/mappers/createBookingMapper.js";

export function mapCreateTemporaryHoldToRequest(state = {}, context = {}) {
  const bookingPayload = mapCreateBookingToRequest(state, context);

  return {
    eventId: bookingPayload.eventId,
    userId: bookingPayload.userId,
    creatorId: bookingPayload.creatorId,
    startIso: bookingPayload.startIso,
    endIso: bookingPayload.endIso,
  };
}
