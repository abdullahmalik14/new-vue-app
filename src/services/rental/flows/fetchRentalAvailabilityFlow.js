import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus, getEtag, isApiNotModified } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getRentalApiBaseUrl, asFlowError } from "@/services/rental/rentalApiUtils.js";

function buildParams(payload = {}) {
  return {
    date: payload.date,
    timezone: payload.timezone,
    sessionMinutes: payload.sessionMinutes,
  };
}

export async function fetchRentalAvailabilityFlow({ payload, context, api }) {
  const baseUrl = getRentalApiBaseUrl(context);
  const headers = context.requestHeaders || {};

  if (!payload?.rentalId) {
    return fail({
      code: "MISSING_RENTAL_ID",
      message: "rentalId is required to fetch availability.",
    });
  }

  if (!payload?.date) {
    return fail({
      code: "MISSING_DATE",
      message: "date is required to fetch availability.",
    });
  }

  try {
    const response = await api.get(`${baseUrl}/rentals/catalog/${payload.rentalId}/availability`, {
      params: buildParams(payload),
      headers,
      signal: context.signal,
      timeoutMs: context.requestTimeoutMs,
    });

    const status = getHttpStatus(response, 200);
    const etag = getEtag(response);

    if (isApiNotModified(response)) {
      return ok(
        {
          rentalId: payload.rentalId,
          date: payload.date,
          timezone: payload.timezone || null,
          slots: [],
          blockedSlots: [],
          bookedSlots: [],
        },
        {
          flow: "rental.fetchAvailability",
          status,
          notModified: true,
          etag,
        }
      );
    }

    if (!response?.ok) {
      return fail({
        code: "FETCH_RENTAL_AVAILABILITY_FAILED",
        message: response?.error || "Failed to fetch rental availability.",
        details: response,
      });
    }

    return ok(
      {
        rentalId: response?.rentalId || payload.rentalId,
        date: response?.date || payload.date,
        timezone: response?.timezone || payload.timezone || null,
        slots: Array.isArray(response?.slots) ? response.slots : [],
        blockedSlots: Array.isArray(response?.blockedSlots) ? response.blockedSlots : [],
        bookedSlots: Array.isArray(response?.bookedSlots) ? response.bookedSlots : [],
      },
      {
        flow: "rental.fetchAvailability",
        status,
        etag,
      }
    );
  } catch (error) {
    return asFlowError(
      error,
      "FETCH_RENTAL_AVAILABILITY_UNEXPECTED",
      "Unexpected error while fetching rental availability."
    );
  }
}
