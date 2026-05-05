import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function updateMessageFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, messageId, updates } = payload;

  if (!chatId || !messageId) {
    return fail({ code: "UPDATE_MESSAGE_MISSING_FIELDS", message: "chatId and messageId are required." });
  }
  if (!updates || typeof updates !== "object") {
    return fail({ code: "UPDATE_MESSAGE_MISSING_UPDATES", message: "updates object is required." });
  }

  try {
    const response = await api.patch(
      `${baseUrl}/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}`,
      updates
    );
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail(
        { code: "UPDATE_MESSAGE_FAILED", message: response?.error || "Failed to update message." },
        { flow: "chat.updateMessage", status }
      );
    }

    return ok({ item: response?.item }, { flow: "chat.updateMessage", status });
  } catch (error) {
    return asFlowError(error, "UPDATE_MESSAGE_UNEXPECTED");
  }
}
