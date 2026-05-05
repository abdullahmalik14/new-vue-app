import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function updateMessageStatusFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, messageId, status: messageStatus } = payload;

  if (!chatId || !messageId || !messageStatus) {
    return fail({ code: "UPDATE_MESSAGE_STATUS_MISSING_FIELDS", message: "chatId, messageId, and status are required." });
  }

  if (!["sent", "delivered", "read"].includes(messageStatus)) {
    return fail({ code: "UPDATE_MESSAGE_STATUS_INVALID", message: "status must be \"sent\", \"delivered\", or \"read\"." });
  }

  try {
    const response = await api.post(`${baseUrl}/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}/status`, { status: messageStatus });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "UPDATE_MESSAGE_STATUS_FAILED", message: response?.error || "Failed to update message status." }, { flow: "chat.updateMessageStatus", status });
    }

    return ok({ result: response?.result }, { flow: "chat.updateMessageStatus", status });
  } catch (error) {
    return asFlowError(error, "UPDATE_MESSAGE_STATUS_UNEXPECTED");
  }
}
