import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function sendMixedMessageFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, elements, senderId } = payload;

  if (!chatId || !Array.isArray(elements)) {
    return fail({ code: "SEND_MIXED_MESSAGE_MISSING_FIELDS", message: "chatId and elements (array) are required." });
  }

  try {
    const response = await api.post(`${baseUrl}/chats/${encodeURIComponent(chatId)}/messages/mixed`, { elements, senderId });
    const status = getHttpStatus(response, 201);

    if (response?.ok === false) {
      return fail({ code: "SEND_MIXED_MESSAGE_FAILED", message: response?.error || "Failed to send mixed message." }, { flow: "chat.sendMixedMessage", status });
    }

    return ok({ item: response?.item }, { flow: "chat.sendMixedMessage", status });
  } catch (error) {
    return asFlowError(error, "SEND_MIXED_MESSAGE_UNEXPECTED");
  }
}
