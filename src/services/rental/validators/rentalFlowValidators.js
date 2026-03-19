function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function hasArray(value) {
  return Array.isArray(value);
}

export function validateFetchCatalogPayload(payload = {}) {
  const errors = [];

  if (!isNonEmptyString(payload.creatorId)) {
    errors.push("creatorId is required.");
  }

  if (payload.limit !== undefined) {
    const limit = toNumber(payload.limit);
    if (limit == null || limit <= 0 || limit > 100) {
      errors.push("limit must be between 1 and 100.");
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function validateFetchCatalogResponse(response = {}) {
  const errors = [];

  if (!hasArray(response.items)) {
    errors.push("items must be an array.");
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function validateFetchAvailabilityPayload(payload = {}) {
  const errors = [];

  if (!isNonEmptyString(payload.rentalId)) {
    errors.push("rentalId is required.");
  }

  if (!isNonEmptyString(payload.date)) {
    errors.push("date is required.");
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function validateFetchAvailabilityResponse(response = {}) {
  const errors = [];

  if (!hasArray(response.slots)) {
    errors.push("slots must be an array.");
  }

  if (!hasArray(response.blockedSlots)) {
    errors.push("blockedSlots must be an array.");
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function validateCreateReservationPayload(payload = {}) {
  const errors = [];

  if (!isNonEmptyString(payload.rentalId)) {
    errors.push("rentalId is required.");
  }

  if (!isNonEmptyString(payload.creatorId)) {
    errors.push("creatorId is required.");
  }

  if (!isNonEmptyString(payload.date)) {
    errors.push("date is required.");
  }

  if (!isNonEmptyString(payload.startTime)) {
    errors.push("startTime is required.");
  }

  const sessionMinutes = toNumber(payload.sessionMinutes);
  if (sessionMinutes == null || sessionMinutes <= 0) {
    errors.push("sessionMinutes must be greater than 0.");
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function validateCreateReservationResponse(response = {}) {
  const errors = [];

  if (!isNonEmptyString(response.reservationId)) {
    errors.push("reservationId is required in response.");
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function validateConfirmReservationPayload(payload = {}) {
  const errors = [];
  if (!isNonEmptyString(payload.reservationId)) {
    errors.push("reservationId is required.");
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function validateCancelReservationPayload(payload = {}) {
  const errors = [];
  if (!isNonEmptyString(payload.reservationId)) {
    errors.push("reservationId is required.");
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}
