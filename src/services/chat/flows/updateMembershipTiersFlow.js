import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function updateMembershipTiersFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, tiers } = payload;

  if (!chatId || !Array.isArray(tiers)) {
    return fail({ code: "UPDATE_MEMBERSHIP_TIERS_MISSING_FIELDS", message: "chatId and tiers (array) are required." });
  }

  try {
    const response = await api.patch(`${baseUrl}/chats/${encodeURIComponent(chatId)}/membership-tiers`, { tiers });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "UPDATE_MEMBERSHIP_TIERS_FAILED", message: response?.error || "Failed to update membership tiers." }, { flow: "chat.updateMembershipTiers", status });
    }

    return ok({ result: response?.result }, { flow: "chat.updateMembershipTiers", status });
  } catch (error) {
    return asFlowError(error, "UPDATE_MEMBERSHIP_TIERS_UNEXPECTED");
  }
}
