import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function createChimeChatFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);

  if (!payload?.createdBy || !payload?.participants) {
    return fail({ code: "CREATE_CHIME_CHAT_MISSING_FIELDS", message: "createdBy and participants are required." });
  }

  try {
    const response = await api.post(`${baseUrl}/chats/chime`, payload);
    const status = getHttpStatus(response, 201);

    if (response?.ok === false) {
      return fail({ code: "CREATE_CHIME_CHAT_FAILED", message: response?.error || "Failed to create chime chat." }, { flow: "chat.createChimeChat", status });
    }

    return ok({ chatId: response?.chatId }, { flow: "chat.createChimeChat", status });
  } catch (error) {
    return asFlowError(error, "CREATE_CHIME_CHAT_UNEXPECTED");
  }
}
