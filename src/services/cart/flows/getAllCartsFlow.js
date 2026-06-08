import api from "@/lib/mock-api-demo/apiWrapper";
import { SafeUtils } from "@/utils/SafeUtils.js";
import { buildFlowRequestOptions } from "@/services/flow-system/utils/buildFlowRequestOptions.js";

/**
 * getAllCartsFlow
 * Retrieves all carts associated with a user ID.
 *
 * @param {Object} payload
 * @param {string} payload.userId - The authenticated user ID.
 * @param {number} payload.limit - Pagination limit (default: 100).
 */
export const getAllCartsFlow = async (payload) => {
  const userId = SafeUtils.ensureString(payload?.userId);
  const limit = SafeUtils.ensureNumber(payload?.limit, 100);

  // Security: Format check (Audit 3.19)
  const USER_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
  if (!USER_ID_PATTERN.test(userId)) {
    throw new Error("Invalid User ID format.");
  }

  // Business Logic: Pagination limit (Audit 2.8)
  const safeLimit = Math.min(Math.max(limit, 1), 1000);

  const response = await api.get(`/api/carts/user/${userId}`, {
    params: { limit: safeLimit },
  });

  if (!response.ok) {
    throw new Error(response.error?.message || "Failed to retrieve user carts");
  }

  return response;
};
