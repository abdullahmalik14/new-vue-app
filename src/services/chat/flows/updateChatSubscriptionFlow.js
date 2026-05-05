import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function updateChatSubscriptionFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, subscriptionRequired } = payload;

  if (!chatId || subscriptionRequired == null) {
    return fail({ code: "UPDATE_CHAT_SUBSCRIPTION_MISSING_FIELDS", message: "chatId and subscriptionRequired are required." });
  }

  try {
    const response = await api.patch(`${baseUrl}/chats/${encodeURIComponent(chatId)}/subscription`, { subscriptionRequired });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "UPDATE_CHAT_SUBSCRIPTION_FAILED", message: response?.error || "Failed to update subscription flag." }, { flow: "chat.updateChatSubscription", status });
    }

    return ok({ result: response?.result }, { flow: "chat.updateChatSubscription", status });
  } catch (error) {
    return asFlowError(error, "UPDATE_CHAT_SUBSCRIPTION_UNEXPECTED");
  }
}
