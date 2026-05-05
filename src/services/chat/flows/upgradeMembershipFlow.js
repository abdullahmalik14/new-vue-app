import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getChatApiBaseUrl, asFlowError } from "@/services/chat/chatApiUtils.js";

export async function upgradeMembershipFlow({ payload, context, api }) {
  const baseUrl = getChatApiBaseUrl(context);
  const { chatId, userId, newTier } = payload;

  if (!chatId || !userId || !newTier) {
    return fail({ code: "UPGRADE_MEMBERSHIP_MISSING_FIELDS", message: "chatId, userId, and newTier are required." });
  }

  try {
    const response = await api.post(`${baseUrl}/chats/${encodeURIComponent(chatId)}/membership/upgrade`, { userId, newTier });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({ code: "UPGRADE_MEMBERSHIP_FAILED", message: response?.error || "Failed to upgrade membership." }, { flow: "chat.upgradeMembership", status });
    }

    return ok({ result: response?.result }, { flow: "chat.upgradeMembership", status });
  } catch (error) {
    return asFlowError(error, "UPGRADE_MEMBERSHIP_UNEXPECTED");
  }
}
