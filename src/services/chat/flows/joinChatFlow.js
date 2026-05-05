import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function joinChatFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, userId } = payload;

  if (!chatId || !userId) {
    return fail({ code: "JOIN_CHAT_MISSING_FIELDS", message: "chatId and userId are required." });
  }

  try {
    const response = await api.post(`${baseUrl}/chats/${encodeURIComponent(chatId)}/join`, { userId });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "JOIN_CHAT_FAILED", message: response?.error || "Failed to join chat." }, { flow: "chat.joinChat", status });
    }

    return ok({}, { flow: "chat.joinChat", status });
  } catch (error) {
    return asFlowError(error, "JOIN_CHAT_UNEXPECTED");
  }
}
