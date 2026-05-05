import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function getUnreadCountFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, userId } = payload;

  if (!chatId || !userId) {
    return fail({ code: "GET_UNREAD_COUNT_MISSING_FIELDS", message: "chatId and userId are required." });
  }

  try {
    const response = await api.get(`${baseUrl}/chats/${encodeURIComponent(chatId)}/unread`, { params: { userId } });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "GET_UNREAD_COUNT_FAILED", message: response?.error || "Failed to fetch unread count." }, { flow: "chat.getUnreadCount", status });
    }

    return ok({ count: response?.count ?? 0 }, { flow: "chat.getUnreadCount", status });
  } catch (error) {
    return asFlowError(error, "GET_UNREAD_COUNT_UNEXPECTED");
  }
}
