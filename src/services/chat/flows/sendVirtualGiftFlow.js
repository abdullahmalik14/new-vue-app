import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function sendVirtualGiftFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, messageId, giftData } = payload;

  if (!chatId || !messageId || !giftData) {
    return fail({ code: "SEND_VIRTUAL_GIFT_MISSING_FIELDS", message: "chatId, messageId, and giftData are required." });
  }

  try {
    const response = await api.post(`${baseUrl}/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}/gift`, { giftData });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "SEND_VIRTUAL_GIFT_FAILED", message: response?.error || "Failed to send virtual gift." }, { flow: "chat.sendVirtualGift", status });
    }

    return ok({ result: response?.result }, { flow: "chat.sendVirtualGift", status });
  } catch (error) {
    return asFlowError(error, "SEND_VIRTUAL_GIFT_UNEXPECTED");
  }
}
