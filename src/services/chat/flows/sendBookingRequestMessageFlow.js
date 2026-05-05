import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function sendBookingRequestMessageFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, bookingId, action, senderId, slotDate, start_at, end_at, eventId, eventTitle, text, meta } = payload;

  if (!chatId || !bookingId || !action) {
    return fail({ code: "SEND_BOOKING_REQUEST_MISSING_FIELDS", message: "chatId, bookingId, and action are required." });
  }

  if (!["pending", "accepted", "declined", "counter_offer"].includes(action)) {
    return fail({ code: "SEND_BOOKING_REQUEST_INVALID_ACTION", message: "action must be \"pending\", \"accepted\", \"declined\", or \"counter_offer\"." });
  }

  try {
    const response = await api.post(`${baseUrl}/chats/${encodeURIComponent(chatId)}/messages/booking`, { bookingId, action, senderId, start_at, end_at, slotDate, eventId, eventTitle, text, meta });
    const status = getHttpStatus(response, 201);

    if (response?.ok === false) {
      return fail({ code: "SEND_BOOKING_REQUEST_FAILED", message: response?.error || "Failed to send booking request message." }, { flow: "chat.sendBookingRequestMessage", status });
    }

    return ok({ item: response?.item }, { flow: "chat.sendBookingRequestMessage", status });
  } catch (error) {
    return asFlowError(error, "SEND_BOOKING_REQUEST_UNEXPECTED");
  }
}
