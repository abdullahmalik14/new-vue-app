import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function sendTipFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, messageId, amount, currency } = payload;

  if (!chatId || !messageId || !amount) {
    return fail({ code: "SEND_TIP_MISSING_FIELDS", message: "chatId, messageId, and amount are required." });
  }

  try {
    const response = await api.post(`${baseUrl}/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}/tip`, { amount, currency });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "SEND_TIP_FAILED", message: response?.error || "Failed to send tip." }, { flow: "chat.sendTip", status });
    }

    return ok({ result: response?.result }, { flow: "chat.sendTip", status });
  } catch (error) {
    return asFlowError(error, "SEND_TIP_UNEXPECTED");
  }
}
