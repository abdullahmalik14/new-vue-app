import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { asFlowError } from "@/services/chat/chatApiUtils.js";

function getWpBaseUrl() {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_WEB_BASE_URL) {
    return import.meta.env.VITE_WEB_BASE_URL;
  }
  return "";
}

export async function fetchChatUsersDataFlow({ payload, context, api }) {
  const { userIds } = payload;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return fail({ code: "FETCH_CHAT_USERS_MISSING_IDS", message: "userIds array is required." });
  }

  const baseUrl = getWpBaseUrl();
  const headers = context.requestHeaders || {};
  const userIdsParam = userIds.join(",");

  try {
    const response = await api.get(
      `${baseUrl}/wp-json/api/chat/get-users-data?user_ids=${encodeURIComponent(userIdsParam)}`,
      {},
      { headers, signal: context.signal }
    );
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail(
        { code: "FETCH_CHAT_USERS_FAILED", message: response?.error || "Failed to fetch user data." },
        { flow: "chat.fetchChatUsersData", status }
      );
    }

    const users = response?.users || {};
    return ok({ users }, { flow: "chat.fetchChatUsersData", status });
  } catch (error) {
    return asFlowError(error, "FETCH_CHAT_USERS_UNEXPECTED", "An unexpected error occurred while fetching chat user data.");
  }
}
