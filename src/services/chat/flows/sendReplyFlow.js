import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function sendReplyFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, messageId, contentType, text, senderId } = payload;

  if (!chatId || !messageId) {
    return fail({ code: "SEND_REPLY_MISSING_FIELDS", message: "chatId and messageId are required." });
  }

  try {
    const response = await api.post(`${baseUrl}/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}/replies`, { contentType, text, senderId });
    const status = getHttpStatus(response, 201);

    if (response?.ok === false) {
      return fail({ code: "SEND_REPLY_FAILED", message: response?.error || "Failed to send reply." }, { flow: "chat.sendReply", status });
    }

    return ok({ chatId: response?.chatId, parentMessageId: response?.parentMessageId, messageId: response?.messageId, message: response?.message }, { flow: "chat.sendReply", status });
  } catch (error) {
    return asFlowError(error, "SEND_REPLY_UNEXPECTED");
  }
}
