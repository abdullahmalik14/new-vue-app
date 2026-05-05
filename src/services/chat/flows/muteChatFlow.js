import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function muteChatFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, userId, durationMs, reason } = payload;

  if (!chatId || !userId) {
    return fail({ code: "MUTE_CHAT_MISSING_FIELDS", message: "chatId and userId are required." });
  }

  try {
    const response = await api.post(`${baseUrl}/chats/${encodeURIComponent(chatId)}/mute`, { userId, durationMs, reason });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "MUTE_CHAT_FAILED", message: response?.error || "Failed to mute chat." }, { flow: "chat.muteChat", status });
    }

    return ok({ muted: response?.muted, until: response?.until }, { flow: "chat.muteChat", status });
  } catch (error) {
    return asFlowError(error, "MUTE_CHAT_UNEXPECTED");
  }
}
