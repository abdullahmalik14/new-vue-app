import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { asFlowError } from "@/services/chat/chatApiUtils.js";

function getWpBaseUrl() {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_WEB_BASE_URL) {
    return import.meta.env.VITE_WEB_BASE_URL;
  }
  return "";
}

export async function fetchGroupUserIdsFlow({ payload, context, api }) {
  const { creatorId, section, tierId } = payload || {};

  if (!creatorId || !section) {
    return fail({ code: "FETCH_GROUP_USER_IDS_MISSING_FIELDS", message: "creatorId and section are required." });
  }

  const baseUrl = getWpBaseUrl();
  const headers = context?.requestHeaders || {};

  const params = { creator_id: creatorId, section };
  if (tierId) params.tier_id = tierId;

  try {
    const response = await api.get(
      `${baseUrl}/wp-json/api/chat/new-message-users/group-ids`,
      { params },
      { headers, signal: context?.signal }
    );
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail(
        { code: "FETCH_GROUP_USER_IDS_FAILED", message: response?.error || "Failed to fetch group user IDs." },
        { flow: "chat.fetchGroupUserIds", status }
      );
    }

    return ok({ userIds: response?.user_ids || [] }, { flow: "chat.fetchGroupUserIds", status });
  } catch (error) {
    return asFlowError(error, "FETCH_GROUP_USER_IDS_UNEXPECTED", "An unexpected error occurred while fetching group user IDs.");
  }
}
