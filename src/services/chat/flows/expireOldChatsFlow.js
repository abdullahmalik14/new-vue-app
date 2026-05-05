import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function expireOldChatsFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);

  try {
    const response = await api.post(`${baseUrl}/chats/admin/expire`, {});
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "EXPIRE_OLD_CHATS_FAILED", message: response?.error || "Failed to expire old chats." }, { flow: "chat.expireOldChats", status });
    }

    return ok({ result: response?.result }, { flow: "chat.expireOldChats", status });
  } catch (error) {
    return asFlowError(error, "EXPIRE_OLD_CHATS_UNEXPECTED");
  }
}
