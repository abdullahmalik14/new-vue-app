import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function editMessageFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, messageId, text, metadata } = payload;

  if (!chatId || !messageId) {
    return fail({ code: "EDIT_MESSAGE_MISSING_FIELDS", message: "chatId and messageId are required." });
  }

  try {
    const response = await api.patch(`${baseUrl}/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}`, { text, metadata });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "EDIT_MESSAGE_FAILED", message: response?.error || "Failed to edit message." }, { flow: "chat.editMessage", status });
    }

    return ok({}, { flow: "chat.editMessage", status });
  } catch (error) {
    return asFlowError(error, "EDIT_MESSAGE_UNEXPECTED");
  }
}
