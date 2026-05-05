import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function getChatStatsFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId } = payload;

  if (!chatId) {
    return fail({ code: "GET_CHAT_STATS_MISSING_CHAT_ID", message: "chatId is required." });
  }

  try {
    const response = await api.get(`${baseUrl}/chats/${encodeURIComponent(chatId)}/stats`);
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "GET_CHAT_STATS_FAILED", message: response?.error || "Failed to fetch chat stats." }, { flow: "chat.getChatStats", status });
    }

    return ok({ stats: response?.stats }, { flow: "chat.getChatStats", status });
  } catch (error) {
    return asFlowError(error, "GET_CHAT_STATS_UNEXPECTED");
  }
}
