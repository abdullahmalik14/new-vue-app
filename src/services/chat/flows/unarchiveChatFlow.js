import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function unarchiveChatFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, userId } = payload;

  if (!chatId || !userId) {
    return fail({ code: "UNARCHIVE_CHAT_MISSING_FIELDS", message: "chatId and userId are required." });
  }

  try {
    const response = await api.post(`${baseUrl}/chats/${encodeURIComponent(chatId)}/unarchive`, { userId });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "UNARCHIVE_CHAT_FAILED", message: response?.error || "Failed to unarchive chat." }, { flow: "chat.unarchiveChat", status });
    }

    return ok({ chatId: response?.chatId, archived: response?.archived, unarchivedAt: response?.unarchivedAt }, { flow: "chat.unarchiveChat", status });
  } catch (error) {
    return asFlowError(error, "UNARCHIVE_CHAT_UNEXPECTED");
  }
}
