import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function addChatParticipantFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, userId, userIds, role, invitedBy } = payload;

  const isMulti = Array.isArray(userIds) && userIds.length > 0;
  if (!chatId || (!userId && !isMulti)) {
    return fail({ code: "ADD_CHAT_PARTICIPANT_MISSING_FIELDS", message: "chatId and userId or userIds are required." });
  }

  try {
    const body = isMulti ? { userIds, role, invitedBy } : { userId, role, invitedBy };
    const response = await api.post(`${baseUrl}/chats/${encodeURIComponent(chatId)}/participants`, body);
    const status = getHttpStatus(response, 201);

    if (response?.ok === false) {
      return fail({ code: "ADD_CHAT_PARTICIPANT_FAILED", message: response?.error || "Failed to add participant." }, { flow: "chat.addChatParticipant", status });
    }

    if (response?.results) {
      return ok({ chatId, results: response.results }, { flow: "chat.addChatParticipant", status });
    }
    return ok({ chatId: response?.chatId, userId: response?.userId, added: response?.added, role: response?.role }, { flow: "chat.addChatParticipant", status });
  } catch (error) {
    return asFlowError(error, "ADD_CHAT_PARTICIPANT_UNEXPECTED");
  }
}
