import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function searchMessagesFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, text, senderIds, types, since, until, limit = 20, offset = 0, sort } = payload;

  if (!chatId) {
    return fail({ code: "SEARCH_MESSAGES_MISSING_CHAT_ID", message: "chatId is required." });
  }

  try {
    const query = { text, senderIds, types, since, until, limit, offset, sort };
    const response = await api.get(`${baseUrl}/chats/${encodeURIComponent(chatId)}/messages/search`, { params: query });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "SEARCH_MESSAGES_FAILED", message: response?.error || "Failed to search messages." }, { flow: "chat.searchMessages", status });
    }

    return ok({ items: response?.items || [], nextOffset: response?.nextOffset, total: response?.total }, { flow: "chat.searchMessages", status });
  } catch (error) {
    return asFlowError(error, "SEARCH_MESSAGES_UNEXPECTED");
  }
}
