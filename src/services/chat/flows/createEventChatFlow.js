import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function createEventChatFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);

  if (!payload?.createdBy || !payload?.participants || !payload?.eventId || payload?.eventPrice == null) {
    return fail({ code: "CREATE_EVENT_CHAT_MISSING_FIELDS", message: "createdBy, participants, eventId, and eventPrice are required." });
  }

  try {
    const response = await api.post(`${baseUrl}/chats/event`, payload);
    const status = getHttpStatus(response, 201);

    if (response?.ok === false) {
      return fail({ code: "CREATE_EVENT_CHAT_FAILED", message: response?.error || "Failed to create event chat." }, { flow: "chat.createEventChat", status });
    }

    return ok({ chatId: response?.chatId }, { flow: "chat.createEventChat", status });
  } catch (error) {
    return asFlowError(error, "CREATE_EVENT_CHAT_UNEXPECTED");
  }
}
