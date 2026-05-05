import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function attachTaskToMessageFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, messageId, taskId } = payload;

  if (!chatId || !messageId || !taskId) {
    return fail({ code: "ATTACH_TASK_MISSING_FIELDS", message: "chatId, messageId, and taskId are required." });
  }

  try {
    const response = await api.post(`${baseUrl}/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}/task`, { taskId });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "ATTACH_TASK_FAILED", message: response?.error || "Failed to attach task to message." }, { flow: "chat.attachTaskToMessage", status });
    }

    return ok({ result: response?.result }, { flow: "chat.attachTaskToMessage", status });
  } catch (error) {
    return asFlowError(error, "ATTACH_TASK_UNEXPECTED");
  }
}
