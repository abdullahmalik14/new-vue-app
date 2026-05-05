import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function updateChatModeFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, mode, maxParticipants } = payload;

  if (!chatId || !mode) {
    return fail({ code: "UPDATE_CHAT_MODE_MISSING_FIELDS", message: "chatId and mode are required." });
  }

  try {
    const response = await api.patch(`${baseUrl}/chats/${encodeURIComponent(chatId)}/mode`, { mode, maxParticipants });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "UPDATE_CHAT_MODE_FAILED", message: response?.error || "Failed to update chat mode." }, { flow: "chat.updateChatMode", status });
    }

    return ok({ result: response?.result }, { flow: "chat.updateChatMode", status });
  } catch (error) {
    return asFlowError(error, "UPDATE_CHAT_MODE_UNEXPECTED");
  }
}
