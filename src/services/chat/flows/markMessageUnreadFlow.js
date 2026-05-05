import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function markMessageUnreadFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, messageId, userId } = payload;

  if (!chatId || !messageId || !userId) {
    return fail({ code: "MARK_MESSAGE_UNREAD_MISSING_FIELDS", message: "chatId, messageId, and userId are required." });
  }

  try {
    const response = await api.post(`${baseUrl}/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}/unread`, { userId });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "MARK_MESSAGE_UNREAD_FAILED", message: response?.error || "Failed to mark message as unread." }, { flow: "chat.markMessageUnread", status });
    }

    return ok({ result: response?.result }, { flow: "chat.markMessageUnread", status });
  } catch (error) {
    return asFlowError(error, "MARK_MESSAGE_UNREAD_UNEXPECTED");
  }
}
