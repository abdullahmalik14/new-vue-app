import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function sendExclusiveContentFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, contentId, tier, senderId, previewText } = payload;

  if (!chatId || !contentId || !tier) {
    return fail({ code: "SEND_EXCLUSIVE_CONTENT_MISSING_FIELDS", message: "chatId, contentId, and tier are required." });
  }

  try {
    const response = await api.post(`${baseUrl}/chats/${encodeURIComponent(chatId)}/messages/exclusive`, { contentId, tier, senderId, previewText });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "SEND_EXCLUSIVE_CONTENT_FAILED", message: response?.error || "Failed to send exclusive content." }, { flow: "chat.sendExclusiveContent", status });
    }

    return ok({ result: response?.result }, { flow: "chat.sendExclusiveContent", status });
  } catch (error) {
    return asFlowError(error, "SEND_EXCLUSIVE_CONTENT_UNEXPECTED");
  }
}
