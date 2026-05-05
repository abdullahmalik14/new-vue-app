import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function linkPollToMessageFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, messageId, pollId } = payload;

  if (!chatId || !messageId || !pollId) {
    return fail({ code: "LINK_POLL_MISSING_FIELDS", message: "chatId, messageId, and pollId are required." });
  }

  try {
    const response = await api.post(`${baseUrl}/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}/poll`, { pollId });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "LINK_POLL_FAILED", message: response?.error || "Failed to link poll to message." }, { flow: "chat.linkPollToMessage", status });
    }

    return ok({ result: response?.result }, { flow: "chat.linkPollToMessage", status });
  } catch (error) {
    return asFlowError(error, "LINK_POLL_UNEXPECTED");
  }
}
