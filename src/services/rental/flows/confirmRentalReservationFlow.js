import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getRentalApiBaseUrl, asFlowError } from "@/services/rental/rentalApiUtils.js";

export async function confirmRentalReservationFlow({ payload, context, api }) {
  const baseUrl = getRentalApiBaseUrl(context);
  const headers = context.requestHeaders || {};

  if (!payload?.reservationId) {
    return fail({
      code: "MISSING_RESERVATION_ID",
      message: "reservationId is required to confirm rental reservation.",
    });
  }

  try {
    const response = await api.post(
      `${baseUrl}/rentals/reservations/${payload.reservationId}/confirm`,
      payload,
      {
        headers,
        signal: context.signal,
        timeoutMs: context.requestTimeoutMs,
      }
    );

    if (!response?.ok || !response?.reservationId) {
      return fail({
        code: "CONFIRM_RENTAL_RESERVATION_FAILED",
        message: response?.error || "Rental reservation confirmation failed.",
        details: response,
      });
    }

    return ok(
      {
        reservationId: response.reservationId,
        status: response?.status || "confirmed",
        sessionLink: response?.sessionLink || null,
        confirmedAt: response?.confirmedAt || null,
      },
      {
        flow: "rental.confirmReservation",
        status: "success",
      }
    );
  } catch (error) {
    return asFlowError(
      error,
      "CONFIRM_RENTAL_RESERVATION_UNEXPECTED",
      "Unexpected error while confirming rental reservation."
    );
  }
}
