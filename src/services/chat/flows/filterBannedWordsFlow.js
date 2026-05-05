import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function filterBannedWordsFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { text } = payload;

  if (!text) {
    return fail({ code: "FILTER_BANNED_WORDS_MISSING_FIELDS", message: "text is required." });
  }

  try {
    const response = await api.post(`${baseUrl}/chats/filter/banned-words`, { text });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "FILTER_BANNED_WORDS_FAILED", message: response?.error || "Failed to filter banned words." }, { flow: "chat.filterBannedWords", status });
    }

    return ok({ result: response?.result }, { flow: "chat.filterBannedWords", status });
  } catch (error) {
    return asFlowError(error, "FILTER_BANNED_WORDS_UNEXPECTED");
  }
}
