import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function lockMessageRepliesFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, messageId, lock = true } = payload;

  if (!chatId || !messageId) {
    return fail({ code: "LOCK_MESSAGE_REPLIES_MISSING_FIELDS", message: "chatId and messageId are required." });
  }

  try {
    const response = await api.post(`${baseUrl}/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}/lock`, { lock });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "LOCK_MESSAGE_REPLIES_FAILED", message: response?.error || "Failed to lock message replies." }, { flow: "chat.lockMessageReplies", status });
    }

    return ok({ result: response?.result }, { flow: "chat.lockMessageReplies", status });
  } catch (error) {
    return asFlowError(error, "LOCK_MESSAGE_REPLIES_UNEXPECTED");
  }
}
