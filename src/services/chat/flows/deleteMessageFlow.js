import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function deleteMessageFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, messageId } = payload;

  if (!chatId || !messageId) {
    return fail({ code: "DELETE_MESSAGE_MISSING_FIELDS", message: "chatId and messageId are required." });
  }

  try {
    const response = await api.delete(`${baseUrl}/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}`);
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "DELETE_MESSAGE_FAILED", message: response?.error || "Failed to delete message." }, { flow: "chat.deleteMessage", status });
    }

    return ok({}, { flow: "chat.deleteMessage", status });
  } catch (error) {
    return asFlowError(error, "DELETE_MESSAGE_UNEXPECTED");
  }
}
