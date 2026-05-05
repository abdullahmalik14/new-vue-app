import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getBookingsApiBaseUrl, asFlowError } from "@/services/bookings/bookingsApiUtils.js";

export async function updateTemporaryHoldUserFlow({ payload, context, api }) {
  const baseUrl = getBookingsApiBaseUrl(context);
  const headers = context.requestHeaders || {};
  const temporaryHoldId = String(payload?.temporaryHoldId || "").trim();
  const userId = payload?.userId;

  if (!temporaryHoldId) {
    return fail({
      code: "UPDATE_TEMPORARY_HOLD_USER_MISSING_ID",
      message: "temporaryHoldId is required.",
      details: payload,
    });
  }

  try {
    const response = await api.patch(
      `${baseUrl}/temporary-holds/${encodeURIComponent(temporaryHoldId)}/user`,
      { userId },
      { headers, signal: context.signal, timeoutMs: context.requestTimeoutMs },
    );

    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({
        code: "UPDATE_TEMPORARY_HOLD_USER_FAILED",
        message: response?.message || response?.error || "Failed to update temporary hold user.",
        details: response,
      });
    }

    return ok({ temporaryHoldId, userId: response?.userId || userId || null }, { flow: "bookings.updateTemporaryHoldUser", status });

  } catch (error) {
    return asFlowError(
      error,
      "UPDATE_TEMPORARY_HOLD_USER_UNEXPECTED",
      "Unexpected error while updating temporary hold user.",
    );
  }
}
