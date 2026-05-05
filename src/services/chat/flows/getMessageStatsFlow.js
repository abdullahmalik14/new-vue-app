import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function getMessageStatsFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, messageId } = payload;

  if (!chatId || !messageId) {
    return fail({ code: "GET_MESSAGE_STATS_MISSING_FIELDS", message: "chatId and messageId are required." });
  }

  try {
    const response = await api.get(`${baseUrl}/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}/stats`);
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "GET_MESSAGE_STATS_FAILED", message: response?.error || "Failed to fetch message stats." }, { flow: "chat.getMessageStats", status });
    }

    return ok({
      reactionsCount: response?.reactionsCount,
      readByCount: response?.readByCount,
      replyCount: response?.replyCount,
      pinned: response?.pinned,
      isImportant: response?.isImportant,
      isUrgent: response?.isUrgent,
    }, { flow: "chat.getMessageStats", status });
  } catch (error) {
    return asFlowError(error, "GET_MESSAGE_STATS_UNEXPECTED");
  }
}
