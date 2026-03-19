function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function validateFetchCreatorEventsPayload(payload = {}) {
  const errors = [];

  if (toNumber(payload.creatorId) == null) {
    errors.push("creatorId is required.");
  }

  if (payload.limit !== undefined) {
    const limit = toNumber(payload.limit);
    if (limit == null || limit <= 0 || limit > 200) {
      errors.push("limit must be between 1 and 200.");
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function validateFetchCreatorEventsResponse(response = {}) {
  const errors = [];

  if (!Array.isArray(response.items)) {
    errors.push("items must be an array.");
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function validateCreateEventPayload(payload = {}) {
  const errors = [];

  if (toNumber(payload.creatorId) == null) {
    errors.push("creatorId is required.");
  }

  if (!isNonEmptyString(payload.title)) {
    errors.push("title is required.");
  }

  if (!isNonEmptyString(payload.type)) {
    errors.push("type is required.");
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function validateCreateEventResponse(response = {}) {
  const errors = [];

  if (!isNonEmptyString(response.eventId)) {
    errors.push("eventId is required in create response.");
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}
