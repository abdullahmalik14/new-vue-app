import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function setChatParticipantRoleFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, userId, role } = payload;

  if (!chatId || !userId || !role) {
    return fail({ code: "SET_CHAT_PARTICIPANT_ROLE_MISSING_FIELDS", message: "chatId, userId, and role are required." });
  }

  try {
    const response = await api.patch(`${baseUrl}/chats/${encodeURIComponent(chatId)}/participants/${encodeURIComponent(userId)}/role`, { role });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "SET_CHAT_PARTICIPANT_ROLE_FAILED", message: response?.error || "Failed to set participant role." }, { flow: "chat.setChatParticipantRole", status });
    }

    return ok({ result: response?.result }, { flow: "chat.setChatParticipantRole", status });
  } catch (error) {
    return asFlowError(error, "SET_CHAT_PARTICIPANT_ROLE_UNEXPECTED");
  }
}
