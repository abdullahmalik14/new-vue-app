import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function autoArchiveChatsFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);

  try {
    const response = await api.post(`${baseUrl}/chats/admin/auto-archive`, {});
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "AUTO_ARCHIVE_CHATS_FAILED", message: response?.error || "Failed to auto-archive chats." }, { flow: "chat.autoArchiveChats", status });
    }

    return ok({ result: response?.result }, { flow: "chat.autoArchiveChats", status });
  } catch (error) {
    return asFlowError(error, "AUTO_ARCHIVE_CHATS_UNEXPECTED");
  }
}
