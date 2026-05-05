import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function removeChatParticipantFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, userId, by, reason } = payload;

  if (!chatId || !userId) {
    return fail({ code: "REMOVE_CHAT_PARTICIPANT_MISSING_FIELDS", message: "chatId and userId are required." });
  }

  try {
    const response = await api.delete(`${baseUrl}/chats/${encodeURIComponent(chatId)}/participants/${encodeURIComponent(userId)}`, { by, reason });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "REMOVE_CHAT_PARTICIPANT_FAILED", message: response?.error || "Failed to remove participant." }, { flow: "chat.removeChatParticipant", status });
    }

    return ok({ removed: response?.removed }, { flow: "chat.removeChatParticipant", status });
  } catch (error) {
    return asFlowError(error, "REMOVE_CHAT_PARTICIPANT_UNEXPECTED");
  }
}
