import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function updateChatMetadataFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, ...metadata } = payload;

  if (!chatId) {
    return fail({ code: "UPDATE_CHAT_METADATA_MISSING_CHAT_ID", message: "chatId is required." });
  }

  try {
    const response = await api.patch(`${baseUrl}/chats/${encodeURIComponent(chatId)}/metadata`, metadata);
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "UPDATE_CHAT_METADATA_FAILED", message: response?.error || "Failed to update chat metadata." }, { flow: "chat.updateChatMetadata", status });
    }

    return ok({ result: response?.result }, { flow: "chat.updateChatMetadata", status });
  } catch (error) {
    return asFlowError(error, "UPDATE_CHAT_METADATA_UNEXPECTED");
  }
}
