import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function updateChatNotificationsFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, userId, settings } = payload;

  if (!chatId || !userId || !settings) {
    return fail({ code: "UPDATE_CHAT_NOTIFICATIONS_MISSING_FIELDS", message: "chatId, userId, and settings are required." });
  }

  try {
    const response = await api.patch(`${baseUrl}/chats/${encodeURIComponent(chatId)}/notifications`, { userId, settings });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "UPDATE_CHAT_NOTIFICATIONS_FAILED", message: response?.error || "Failed to update notification settings." }, { flow: "chat.updateChatNotifications", status });
    }

    return ok({ result: response?.result }, { flow: "chat.updateChatNotifications", status });
  } catch (error) {
    return asFlowError(error, "UPDATE_CHAT_NOTIFICATIONS_UNEXPECTED");
  }
}
