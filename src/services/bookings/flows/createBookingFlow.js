import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getBookingsApiBaseUrl, asFlowError } from "@/services/bookings/bookingsApiUtils.js";

export async function createBookingFlow({ payload, context, api }) {
  const baseUrl = getBookingsApiBaseUrl(context);
  const headers = context.requestHeaders || {};

  const requiredFields = ["eventId", "userId", "creatorId", "startIso", "endIso"];
  const missingFields = requiredFields.filter((field) => !payload?.[field]);

  if (missingFields.length > 0) {
    return fail({
      code: "CREATE_BOOKING_MISSING_REQUIRED_FIELDS",
      message: `Missing required fields: ${missingFields.join(", ")}.`,
      details: {
        missingFields,
        payload,
      },
    });
  }

  try {
    const response = await api.post(`${baseUrl}/bookings`, payload, {
      headers,
      signal: context.signal,
      timeoutMs: context.requestTimeoutMs,
    });

    const status = getHttpStatus(response, 201);

    if (response?.ok === false) {
      return fail({
        code: "CREATE_BOOKING_FAILED",
        message: response?.error || "Failed to create booking.",
        details: response,
      });
    }

    const item = response?.item || null;

    return ok(
      {
        bookingId: response?.bookingId || item?.bookingId || null,
        item,
        validation: response?.validation || null,
      },
      {
        flow: "bookings.createBooking",
        status,
      }
    );
  } catch (error) {
    return asFlowError(
      error,
      "CREATE_BOOKING_UNEXPECTED",
      "Unexpected error while creating booking."
    );
  }
}
