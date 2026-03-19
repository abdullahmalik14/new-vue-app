import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getBookingsApiBaseUrl, asFlowError } from "@/services/bookings/bookingsApiUtils.js";

export async function getTemporaryHoldStatusFlow({ payload, context, api }) {
  const baseUrl = getBookingsApiBaseUrl(context);
  const headers = context.requestHeaders || {};
  const temporaryHoldId = String(payload?.temporaryHoldId || "").trim();

  if (!temporaryHoldId) {
    return fail({
      code: "GET_TEMPORARY_HOLD_STATUS_MISSING_ID",
      message: "temporaryHoldId is required.",
      details: payload,
    });
  }

  try {
    const response = await api.get(`${baseUrl}/temporary-holds/${temporaryHoldId}`, {
      headers,
      signal: context.signal,
      timeoutMs: context.requestTimeoutMs,
    });

    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({
        code: "GET_TEMPORARY_HOLD_STATUS_FAILED",
        message: response?.message || response?.error || "Failed to fetch temporary hold status.",
        details: response,
      });
    }

    const hold = response?.temporaryHold || null;
    return ok(
      {
        temporaryHoldId: hold?.temporaryHoldId || temporaryHoldId,
        status: hold?.status || null,
        expiresAt: hold?.expiresAt || null,
        secondsRemaining: Number(hold?.secondsRemaining || 0),
        temporaryHold: hold,
      },
      {
        flow: "bookings.getTemporaryHoldStatus",
        status,
      },
    );
  } catch (error) {
    return asFlowError(
      error,
      "GET_TEMPORARY_HOLD_STATUS_UNEXPECTED",
      "Unexpected error while fetching temporary hold status.",
    );
  }
}
