import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function storeChatMessageFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, ...messagePayload } = payload;

  if (!chatId) {
    return fail({ code: "STORE_CHAT_MESSAGE_MISSING_CHAT_ID", message: "chatId is required." });
  }

  try {
    const response = await api.post(`${baseUrl}/chats/${encodeURIComponent(chatId)}/messages/store`, messagePayload);
    const status = getHttpStatus(response, 201);

    if (response?.ok === false) {
      return fail({ code: "STORE_CHAT_MESSAGE_FAILED", message: response?.error || "Failed to store message." }, { flow: "chat.storeChatMessage", status });
    }

    return ok({ item: response?.item }, { flow: "chat.storeChatMessage", status });
  } catch (error) {
    return asFlowError(error, "STORE_CHAT_MESSAGE_UNEXPECTED");
  }
}
