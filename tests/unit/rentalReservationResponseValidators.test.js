import { describe, expect, it } from "vitest";

import {
  validateConfirmReservationResponse,
  validateCancelReservationResponse,
} from "@/services/rental/validators/rentalFlowValidators.js";

describe("rental reservation response validators (FEAT-05)", () => {
  it("validateConfirmReservationResponse requires reservationId", () => {
    expect(validateConfirmReservationResponse({}).ok).toBe(false);
    expect(validateConfirmReservationResponse({ reservationId: "r1", status: "confirmed" }).ok).toBe(true);
  });

  it("validateCancelReservationResponse requires reservationId", () => {
    expect(validateCancelReservationResponse({}).ok).toBe(false);
    expect(validateCancelReservationResponse({ reservationId: "r1", status: "cancelled" }).ok).toBe(true);
  });
});
