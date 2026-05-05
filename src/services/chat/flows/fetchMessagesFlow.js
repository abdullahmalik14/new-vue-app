import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import {
  getChatApiBaseUrl,
  asFlowError,
} from "@/services/chat/chatApiUtils.js";

export async function fetchMessagesFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const headers = context.requestHeaders || {};
  const { chatId, limit = 20, pagingState, currentUserId } = payload;

  if (!chatId) {
    return fail({
      code: "FETCH_MESSAGES_MISSING_CHAT_ID",
      message: "chatId is required.",
    });
  }

  let url = `${baseUrl}/chats/${encodeURIComponent(chatId)}/messages`;
  let query = { limit };
  if (pagingState) {
    query.pagingState = JSON.stringify(pagingState);
  }

  try {
    const response = await api.get(url, { params: query });

    const status = getHttpStatus(response, 200);
    if (response?.ok === false) {
      return fail(
        {
          code: "FETCH_MESSAGES_FAILED",
          message: response?.error || "Failed to fetch messages",
        },
        { flow: "chat.fetchMessages", status },
      );
    }

    const rawMessages = response?.messages || [];
    const items = rawMessages.map((m) => {
      const receipts = Array.isArray(m.read_receipts) ? m.read_receipts : [];
      const alreadyRead =
        currentUserId &&
        receipts.some((r) => String(r.user_id) === String(currentUserId));
      return {
        ...m,
        senderId: m.sender_id,
        text: m.content?.text ?? m.text ?? "",
        status: alreadyRead ? "read" : m.status || "sent",
      };
    });

    return ok(
      {
        items,
        pagingState: response?.pagingState,
        chatId,
      },
      { flow: "chat.fetchMessages", status },
    );
  } catch (error) {
    return asFlowError(error, "FETCH_MESSAGES_UNEXPECTED");
  }
}
