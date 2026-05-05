import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function pinMessageFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, messageId, pin = true } = payload;

  if (!chatId || !messageId) {
    return fail({ code: "PIN_MESSAGE_MISSING_FIELDS", message: "chatId and messageId are required." });
  }

  try {
    const response = await api.post(`${baseUrl}/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}/pin`, { pin });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "PIN_MESSAGE_FAILED", message: response?.error || "Failed to pin message." }, { flow: "chat.pinMessage", status });
    }

    return ok({ result: response?.result }, { flow: "chat.pinMessage", status });
  } catch (error) {
    return asFlowError(error, "PIN_MESSAGE_UNEXPECTED");
  }
}
