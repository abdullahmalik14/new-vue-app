import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function sendVoiceMessageFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, mediaUrl } = payload;

  if (!chatId || !mediaUrl) {
    return fail({ code: "SEND_VOICE_MESSAGE_MISSING_FIELDS", message: "chatId and mediaUrl are required." });
  }

  try {
    const response = await api.post(`${baseUrl}/chats/${encodeURIComponent(chatId)}/messages/voice`, { mediaUrl });
    const status = getHttpStatus(response, 201);

    if (response?.ok === false) {
      return fail({ code: "SEND_VOICE_MESSAGE_FAILED", message: response?.error || "Failed to send voice message." }, { flow: "chat.sendVoiceMessage", status });
    }

    return ok({ item: response?.item }, { flow: "chat.sendVoiceMessage", status });
  } catch (error) {
    return asFlowError(error, "SEND_VOICE_MESSAGE_UNEXPECTED");
  }
}
