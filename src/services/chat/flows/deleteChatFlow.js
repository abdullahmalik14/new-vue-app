import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function deleteChatFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId } = payload;

  if (!chatId) {
    return fail({ code: "DELETE_CHAT_MISSING_CHAT_ID", message: "chatId is required." });
  }

  try {
    const response = await api.delete(`${baseUrl}/chats/${encodeURIComponent(chatId)}`);
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "DELETE_CHAT_FAILED", message: response?.error || "Failed to delete chat." }, { flow: "chat.deleteChat", status });
    }

    return ok({}, { flow: "chat.deleteChat", status });
  } catch (error) {
    return asFlowError(error, "DELETE_CHAT_UNEXPECTED");
  }
}
