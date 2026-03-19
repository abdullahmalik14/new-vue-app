import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getRentalApiBaseUrl, asFlowError } from "@/services/rental/rentalApiUtils.js";

export async function cancelRentalReservationFlow({ payload, context, api }) {
  const baseUrl = getRentalApiBaseUrl(context);
  const headers = context.requestHeaders || {};

  if (!payload?.reservationId) {
    return fail({
      code: "MISSING_RESERVATION_ID",
      message: "reservationId is required to cancel rental reservation.",
    });
  }

  try {
    const response = await api.post(
      `${baseUrl}/rentals/reservations/${payload.reservationId}/cancel`,
      {
        reason: payload.reason || "user_cancelled",
      },
      {
        headers,
        signal: context.signal,
        timeoutMs: context.requestTimeoutMs,
      }
    );

    if (!response?.ok) {
      return fail({
        code: "CANCEL_RENTAL_RESERVATION_FAILED",
        message: response?.error || "Rental reservation cancel failed.",
        details: response,
      });
    }

    return ok(
      {
        reservationId: payload.reservationId,
        status: response?.status || "cancelled",
        cancelledAt: response?.cancelledAt || null,
      },
      {
        flow: "rental.cancelReservation",
        status: "success",
      }
    );
  } catch (error) {
    return asFlowError(
      error,
      "CANCEL_RENTAL_RESERVATION_UNEXPECTED",
      "Unexpected error while cancelling rental reservation."
    );
  }
}
