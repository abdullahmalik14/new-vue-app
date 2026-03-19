import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function sendMessageFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const headers = context.requestHeaders || {};
  const { chatId, type, ...restPayload } = payload;

  if (!chatId) {
    return fail({ code: "SEND_MESSAGE_MISSING_CHAT_ID", message: "chatId is required." });
  }

  const messagePayload = {
    ...restPayload,
    contentType: type || "text"
  };

  try {
    const response = await api.post(`${baseUrl}/chats/${chatId}/messages`, messagePayload);
    
    const status = getHttpStatus(response, 201);
    if (response?.ok === false) {
      return fail({ code: "SEND_MESSAGE_FAILED", message: response?.error || "Failed to send message" }, { flow: "chat.sendMessage", status });
    }
    
    return ok({ item: response?.item, chatId }, { flow: "chat.sendMessage", status });
  } catch (error) {
    return asFlowError(error, "SEND_MESSAGE_UNEXPECTED");
  }
}
