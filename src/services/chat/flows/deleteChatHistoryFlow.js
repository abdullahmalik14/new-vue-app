import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function deleteChatHistoryFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, hardDelete, range } = payload;

  if (!chatId) {
    return fail({ code: "DELETE_CHAT_HISTORY_MISSING_CHAT_ID", message: "chatId is required." });
  }

  try {
    const response = await api.delete(`${baseUrl}/chats/${encodeURIComponent(chatId)}/history`, { hardDelete, range });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "DELETE_CHAT_HISTORY_FAILED", message: response?.error || "Failed to delete chat history." }, { flow: "chat.deleteChatHistory", status });
    }

    return ok({ deletedCount: response?.deletedCount, hardDelete: response?.hardDelete }, { flow: "chat.deleteChatHistory", status });
  } catch (error) {
    return asFlowError(error, "DELETE_CHAT_HISTORY_UNEXPECTED");
  }
}
