import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function flagMessageUrgentFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, messageId, isUrgent } = payload;

  if (!chatId || !messageId || isUrgent == null) {
    return fail({ code: "FLAG_MESSAGE_URGENT_MISSING_FIELDS", message: "chatId, messageId, and isUrgent are required." });
  }

  try {
    const response = await api.post(`${baseUrl}/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}/urgent`, { isUrgent });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "FLAG_MESSAGE_URGENT_FAILED", message: response?.error || "Failed to flag message as urgent." }, { flow: "chat.flagMessageUrgent", status });
    }

    return ok({ result: response?.result }, { flow: "chat.flagMessageUrgent", status });
  } catch (error) {
    return asFlowError(error, "FLAG_MESSAGE_URGENT_UNEXPECTED");
  }
}
