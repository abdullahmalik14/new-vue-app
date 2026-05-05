import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function sendChatActivityLogFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, senderId, text, meta } = payload;

  if (!chatId) {
    return fail({ code: "SEND_ACTIVITY_LOG_MISSING_CHAT_ID", message: "chatId is required." });
  }
  if (!text) {
    return fail({ code: "SEND_ACTIVITY_LOG_MISSING_TEXT", message: "text is required." });
  }

  try {
    const response = await api.post(
      `${baseUrl}/chats/${encodeURIComponent(chatId)}/messages`,
      {
        contentType: "activity_log",
        senderId,
        text,
        ...(meta && typeof meta === "object" ? { meta } : {}),
      }
    );

    const status = getHttpStatus(response, 201);

    if (response?.ok === false) {
      return fail(
        { code: "SEND_ACTIVITY_LOG_FAILED", message: response?.error || "Failed to send activity log." },
        { flow: "chat.sendChatActivityLog", status }
      );
    }

    const raw = response?.item || {};
    const item = {
      ...raw,
      senderId: raw.sender_id,
      text: raw.content?.text ?? raw.text ?? text,
      status: "sent",
    };

    return ok({ item, chatId }, { flow: "chat.sendChatActivityLog", status });
  } catch (error) {
    return asFlowError(error, "SEND_ACTIVITY_LOG_UNEXPECTED");
  }
}
