import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getBookingsApiBaseUrl, asFlowError } from "@/services/bookings/bookingsApiUtils.js";

export async function createTemporaryHoldFlow({ payload, context, api }) {
  const baseUrl = getBookingsApiBaseUrl(context);
  const headers = context.requestHeaders || {};

  const requiredFields = ["eventId", "userId", "creatorId", "startIso", "endIso"];
  const missingFields = requiredFields.filter((field) => !payload?.[field]);

  if (missingFields.length > 0) {
    return fail({
      code: "CREATE_TEMPORARY_HOLD_MISSING_REQUIRED_FIELDS",
      message: `Missing required fields: ${missingFields.join(", ")}.`,
      details: { missingFields, payload },
    });
  }

  try {
    const response = await api.post(`${baseUrl}/temporary-holds`, payload, {
      headers,
      signal: context.signal,
      timeoutMs: context.requestTimeoutMs,
    });

    const status = getHttpStatus(response, 201);

    if (response?.ok === false) {
      return fail({
        code: "CREATE_TEMPORARY_HOLD_FAILED",
        message: response?.message || response?.error || "Failed to create temporary hold.",
        details: response,
      });
    }

    const temporaryHold = response?.temporaryHold || response?.item || null;
    return ok(
      {
        temporaryHoldId: response?.temporaryHoldId || temporaryHold?.temporaryHoldId || null,
        expiresAt: response?.expiresAt || temporaryHold?.expiresAt || null,
        temporaryHold,
      },
      {
        flow: "bookings.createTemporaryHold",
        status,
      },
    );
  } catch (error) {
    return asFlowError(
      error,
      "CREATE_TEMPORARY_HOLD_UNEXPECTED",
      "Unexpected error while creating temporary hold.",
    );
  }
}
