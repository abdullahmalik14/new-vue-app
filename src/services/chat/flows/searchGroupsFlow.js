import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function searchGroupsFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { q } = payload;

  if (!q) {
    return fail({ code: "SEARCH_GROUPS_MISSING_QUERY", message: "q (search query) is required." });
  }

  try {
    const response = await api.get(`${baseUrl}/chats/groups/search`, { params: { q } });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "SEARCH_GROUPS_FAILED", message: response?.error || "Failed to search groups." }, { flow: "chat.searchGroups", status });
    }

    return ok({ items: response?.items || [] }, { flow: "chat.searchGroups", status });
  } catch (error) {
    return asFlowError(error, "SEARCH_GROUPS_UNEXPECTED");
  }
}
