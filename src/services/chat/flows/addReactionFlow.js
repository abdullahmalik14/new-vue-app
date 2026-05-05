import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function addReactionFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, messageId, emoji, count } = payload;

  if (!chatId || !messageId || !emoji) {
    return fail({ code: "ADD_REACTION_MISSING_FIELDS", message: "chatId, messageId, and emoji are required." });
  }

  try {
    const response = await api.post(`${baseUrl}/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}/reactions`, { emoji, count });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "ADD_REACTION_FAILED", message: response?.error || "Failed to add reaction." }, { flow: "chat.addReaction", status });
    }

    return ok({ result: response?.result }, { flow: "chat.addReaction", status });
  } catch (error) {
    return asFlowError(error, "ADD_REACTION_UNEXPECTED");
  }
}
