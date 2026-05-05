import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function markMessageDeliveredFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, messageId } = payload;

  if (!chatId || !messageId) {
    return fail({ code: "MARK_MESSAGE_DELIVERED_MISSING_FIELDS", message: "chatId and messageId are required." });
  }

  try {
    const response = await api.post(`${baseUrl}/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}/delivered`);
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "MARK_MESSAGE_DELIVERED_FAILED", message: response?.error || "Failed to mark message as delivered." }, { flow: "chat.markMessageDelivered", status });
    }

    return ok({ result: response?.result }, { flow: "chat.markMessageDelivered", status });
  } catch (error) {
    return asFlowError(error, "MARK_MESSAGE_DELIVERED_UNEXPECTED");
  }
}
