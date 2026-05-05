import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function updateBookingRequestMessageFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, messageId, action, slotDate, eventTitle, text, meta } = payload;

  if (!chatId || !messageId) {
    return fail({ code: "UPDATE_BOOKING_REQUEST_MISSING_FIELDS", message: "chatId and messageId are required." });
  }

  if (action && !["pending", "accepted", "declined", "counter_offer"].includes(action)) {
    return fail({ code: "UPDATE_BOOKING_REQUEST_INVALID_ACTION", message: "action must be \"pending\", \"accepted\", \"declined\", or \"counter_offer\"." });
  }

  try {
    const response = await api.patch(
      `${baseUrl}/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}/booking`,
      { action, slotDate, eventTitle, text, meta }
    );
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail(
        { code: "UPDATE_BOOKING_REQUEST_FAILED", message: response?.error || "Failed to update booking request message." },
        { flow: "chat.updateBookingRequestMessage", status }
      );
    }

    return ok({ item: response?.item }, { flow: "chat.updateBookingRequestMessage", status });
  } catch (error) {
    return asFlowError(error, "UPDATE_BOOKING_REQUEST_UNEXPECTED");
  }
}
