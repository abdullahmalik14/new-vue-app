import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function startChatTrialFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, userId, trialDays } = payload;

  if (!chatId || !userId) {
    return fail({ code: "START_CHAT_TRIAL_MISSING_FIELDS", message: "chatId and userId are required." });
  }

  try {
    const response = await api.post(`${baseUrl}/chats/${encodeURIComponent(chatId)}/trial`, { userId, trialDays });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "START_CHAT_TRIAL_FAILED", message: response?.error || "Failed to start chat trial." }, { flow: "chat.startChatTrial", status });
    }

    return ok({ result: response?.result }, { flow: "chat.startChatTrial", status });
  } catch (error) {
    return asFlowError(error, "START_CHAT_TRIAL_UNEXPECTED");
  }
}
