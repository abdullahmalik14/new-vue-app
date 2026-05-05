import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function archiveChatFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, userId } = payload;

  if (!chatId || !userId) {
    return fail({ code: "ARCHIVE_CHAT_MISSING_FIELDS", message: "chatId and userId are required." });
  }

  try {
    const response = await api.post(`${baseUrl}/chats/${encodeURIComponent(chatId)}/archive`, { userId });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "ARCHIVE_CHAT_FAILED", message: response?.error || "Failed to archive chat." }, { flow: "chat.archiveChat", status });
    }

    return ok({ archivedAt: response?.archivedAt }, { flow: "chat.archiveChat", status });
  } catch (error) {
    return asFlowError(error, "ARCHIVE_CHAT_UNEXPECTED");
  }
}
