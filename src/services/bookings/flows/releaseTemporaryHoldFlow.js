import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getBookingsApiBaseUrl, asFlowError } from "@/services/bookings/bookingsApiUtils.js";

export async function releaseTemporaryHoldFlow({ payload, context, api }) {
  const baseUrl = getBookingsApiBaseUrl(context);
  const headers = context.requestHeaders || {};
  const temporaryHoldId = String(payload?.temporaryHoldId || "").trim();

  if (!temporaryHoldId) {
    return fail({
      code: "RELEASE_TEMPORARY_HOLD_MISSING_ID",
      message: "temporaryHoldId is required.",
      details: payload,
    });
  }

  try {
    const response = await api.delete(`${baseUrl}/temporary-holds/${temporaryHoldId}`, {
      headers,
      signal: context.signal,
      timeoutMs: context.requestTimeoutMs,
    });

    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({
        code: "RELEASE_TEMPORARY_HOLD_FAILED",
        message: response?.message || response?.error || "Failed to release temporary hold.",
        details: response,
      });
    }

    return ok(
      {
        temporaryHoldId,
      },
      {
        flow: "bookings.releaseTemporaryHold",
        status,
      },
    );
  } catch (error) {
    return asFlowError(
      error,
      "RELEASE_TEMPORARY_HOLD_UNEXPECTED",
      "Unexpected error while releasing temporary hold.",
    );
  }
}
