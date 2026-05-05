import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function fetchMessagesByUserFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, userId, since, until, limit = 20, sort } = payload;

  if (!chatId || !userId) {
    return fail({ code: "FETCH_MESSAGES_BY_USER_MISSING_FIELDS", message: "chatId and userId are required." });
  }

  try {
    const response = await api.get(`${baseUrl}/chats/${encodeURIComponent(chatId)}/messages/by-user/${encodeURIComponent(userId)}`, { params: { since, until, limit, sort } });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "FETCH_MESSAGES_BY_USER_FAILED", message: response?.error || "Failed to fetch messages by user." }, { flow: "chat.fetchMessagesByUser", status });
    }

    return ok({ items: response?.items || [] }, { flow: "chat.fetchMessagesByUser", status });
  } catch (error) {
    return asFlowError(error, "FETCH_MESSAGES_BY_USER_UNEXPECTED");
  }
}
