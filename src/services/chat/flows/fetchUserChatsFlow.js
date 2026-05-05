import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function fetchUserChatsFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const headers = context.requestHeaders || {};
  const { userId, limit = 500, cursor } = payload;

  if (!userId) {
    return fail({
      code: "FETCH_USER_CHATS_MISSING_USER_ID",
      message: "userId is required.",
    });
  }

  const params = { limit };
  if (cursor) params.cursor = cursor;

  try {
    const response = await api.get(
      `${baseUrl}/chats/user/${encodeURIComponent(userId)}`,
      { params },
      { headers, signal: context.signal }
    );
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail(
        { code: "FETCH_USER_CHATS_FAILED", message: response?.error || "Failed to fetch chats." },
        { flow: "chat.fetchUserChats", status }
      );
    }

    const items = (response?.items || []).map((c) => ({
      ...c,
      participants: c.participants || [],
    }));

    return ok(
      { items, userId, nextCursor: response?.nextCursor ?? null, append: !!cursor },
      { flow: "chat.fetchUserChats", status }
    );
  } catch (error) {
    return asFlowError(error, "FETCH_USER_CHATS_UNEXPECTED", "An unexpected error occurred while fetching chats.");
  }
}
