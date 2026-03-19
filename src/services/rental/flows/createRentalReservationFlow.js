import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getRentalApiBaseUrl, asFlowError } from "@/services/rental/rentalApiUtils.js";

export async function createRentalReservationFlow({ payload, context, api }) {
  const baseUrl = getRentalApiBaseUrl(context);
  const headers = context.requestHeaders || {};

  try {
    const response = await api.post(`${baseUrl}/rentals/reservations`, payload, {
      headers,
      signal: context.signal,
      timeoutMs: context.requestTimeoutMs,
    });

    const reservationIdRaw = response?.reservationId || response?.id || null;
    const reservationId = reservationIdRaw == null ? null : String(reservationIdRaw);
    if (!reservationId) {
      return fail({
        code: "CREATE_RENTAL_RESERVATION_FAILED",
        message: response?.error || "Rental reservation creation failed.",
        details: response,
      });
    }

    return ok(
      {
        reservationId,
        status: response?.status || "pending",
        amountTokens: Number(response?.amountTokens || payload?.amountTokens || 0),
        paymentReference: response?.paymentReference || null,
        holdExpiresAt: response?.holdExpiresAt || null,
      },
      {
        flow: "rental.createReservation",
        status: "success",
      }
    );
  } catch (error) {
    return asFlowError(
      error,
      "CREATE_RENTAL_RESERVATION_UNEXPECTED",
      "Unexpected error while creating rental reservation."
    );
  }
}
