import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function getChatParticipantsFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, asObjects, includeRoles } = payload;

  if (!chatId) {
    return fail({ code: "GET_CHAT_PARTICIPANTS_MISSING_CHAT_ID", message: "chatId is required." });
  }

  try {
    const response = await api.get(`${baseUrl}/chats/${encodeURIComponent(chatId)}/participants`, { params: { asObjects, includeRoles } });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "GET_CHAT_PARTICIPANTS_FAILED", message: response?.error || "Failed to fetch participants." }, { flow: "chat.getChatParticipants", status });
    }

    return ok({ participants: response?.participants || [] }, { flow: "chat.getChatParticipants", status });
  } catch (error) {
    return asFlowError(error, "GET_CHAT_PARTICIPANTS_UNEXPECTED");
  }
}
