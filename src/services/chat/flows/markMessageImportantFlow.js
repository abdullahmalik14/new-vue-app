import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function markMessageImportantFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, messageId, important = true } = payload;

  if (!chatId || !messageId) {
    return fail({ code: "MARK_MESSAGE_IMPORTANT_MISSING_FIELDS", message: "chatId and messageId are required." });
  }

  try {
    const response = await api.post(`${baseUrl}/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}/important`, { important });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "MARK_MESSAGE_IMPORTANT_FAILED", message: response?.error || "Failed to mark message as important." }, { flow: "chat.markMessageImportant", status });
    }

    return ok({ result: response?.result }, { flow: "chat.markMessageImportant", status });
  } catch (error) {
    return asFlowError(error, "MARK_MESSAGE_IMPORTANT_UNEXPECTED");
  }
}
