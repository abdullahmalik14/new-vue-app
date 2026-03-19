import { mapSingleEventFromResponse } from "@/services/events/mappers/fetchCreatorEventsMapper.js";
import { buildBookedSlotsIndex } from "@/services/bookings/utils/bookingSlotUtils.js";

export function mapFetchCreatorBookingContextFromResponse(responseData = {}) {
  const rawEvents = Array.isArray(responseData.rawEvents) ? responseData.rawEvents : [];
  const bookedSlots = Array.isArray(responseData.bookedSlots) ? responseData.bookedSlots : [];

  const events = rawEvents.map((item) => mapSingleEventFromResponse(item));
  const bookedSlotsIndex = buildBookedSlotsIndex(bookedSlots);

  return {
    events,
    rawEvents,
    bookedSlots,
    bookedSlotsIndex,
    stats: responseData?.stats || {},
    meta: {
      fetchedAt: Date.now(),
      eventsCount: events.length,
      bookedSlotsCount: bookedSlots.length,
    },
  };
}
