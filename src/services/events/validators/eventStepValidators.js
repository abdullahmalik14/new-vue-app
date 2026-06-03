function asNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function asError(field, message) {
  return { field, message };
}

const MAX_EVENT_TITLE_LENGTH = 200;
const MAX_DURATION_MINUTES = 480;
const MAX_BASE_PRICE = 10000;

function hasAnyValidSlots(slots) {
  if (!Array.isArray(slots)) return false;
  return slots.some((slot) => {
    const start = typeof slot?.startTime === "string" ? slot.startTime.trim() : "";
    const end = typeof slot?.endTime === "string" ? slot.endTime.trim() : "";
    if (start.length === 0 || end.length === 0) return false;
    // Time strings are HH:mm in this flow; lexical compare is safe for ordering.
    return end > start;
  });
}

function hasAtLeastOneWeeklySlot(state = {}) {
  const weekly = Array.isArray(state?.weeklyAvailability) ? state.weeklyAvailability : [];
  return weekly.some((day) => {
    if (day?.unavailable) return false;
    return hasAnyValidSlots(day?.slots);
  });
}

function hasAtLeastOneOneTimeSlot(state = {}) {
  const oneTime = Array.isArray(state?.oneTimeAvailability) ? state.oneTimeAvailability : [];
  return oneTime.some((entry) => hasAnyValidSlots(entry?.slots));
}

function hasAtLeastOneMonthlySlot(state = {}) {
  const monthly = Array.isArray(state?.monthlyAvailability) ? state.monthlyAvailability : [];
  return hasAnyValidSlots(monthly);
}

function asArray(value) {
  if (Array.isArray(value)) return value.filter((item) => item !== null && item !== undefined && item !== "");
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function hasAnyAddonValue(addOn = {}) {
  const title = typeof addOn?.title === "string" ? addOn.title.trim() : "";
  const description = typeof addOn?.description === "string" ? addOn.description.trim() : "";
  const priceRaw = addOn?.priceTokens;
  const hasPrice = priceRaw !== null && priceRaw !== undefined && String(priceRaw).trim() !== "";
  return Boolean(title || description || hasPrice);
}

export function step1Validator(state = {}) {
  const errors = [];

  const eventTitle = typeof state?.eventTitle === "string" ? state.eventTitle.trim() : "";
  if (eventTitle.length === 0) {
    errors.push(asError("eventTitle", "Event title is required."));
  } else if (eventTitle.length > MAX_EVENT_TITLE_LENGTH) {
    errors.push(asError("eventTitle", `Event title must be ${MAX_EVENT_TITLE_LENGTH} characters or fewer.`));
  }

  const duration = asNumber(state?.duration);
  if (duration == null || duration < 5) {
    errors.push(asError("duration", "Session duration must be at least 5 minutes."));
  } else if (duration > MAX_DURATION_MINUTES) {
    errors.push(asError("duration", `Session duration cannot exceed ${MAX_DURATION_MINUTES} minutes.`));
  }

  const basePrice = asNumber(state?.basePrice);
  if (basePrice == null || basePrice < 0) {
    errors.push(asError("basePrice", "Base price must be 0 or higher."));
  } else if (basePrice > MAX_BASE_PRICE) {
    errors.push(asError("basePrice", `Base price cannot exceed ${MAX_BASE_PRICE}.`));
  }

  const repeatRule = state?.repeatRule ?? "weekly";
  if (repeatRule === "") {
    errors.push(asError("repeatRule", "Please choose a repeat rule."));
  } else if (repeatRule === "doesNotRepeat") {
    if (!hasAtLeastOneOneTimeSlot(state)) {
      errors.push(asError("oneTimeAvailability", "Add at least one available slot before continuing."));
    }
  } else if (repeatRule === "monthly") {
    if (!state?.dateFrom || String(state.dateFrom).trim().length === 0) {
      errors.push(asError("dateFrom", "Start date is required for monthly repeat."));
    }
    if (!hasAtLeastOneMonthlySlot(state)) {
      errors.push(asError("monthlyAvailability", "Add at least one monthly slot before continuing."));
    }
  } else if (!hasAtLeastOneWeeklySlot(state)) {
    errors.push(asError("weeklyAvailability", "Add at least one available slot before continuing."));
  }

  return { errors };
}

export function step2Validator(state = {}) {
  const errors = [];

  if (state?.allowRecording) {
    const recordingPrice = asNumber(state?.recordingPrice);
    if (recordingPrice == null || recordingPrice < 0) {
      errors.push(asError("recordingPrice", "Recording price must be 0 or higher."));
    }
  }

  if (state?.enableCancellationFee) {
    const cancellationFee = asNumber(state?.cancellationFee);
    if (cancellationFee == null || cancellationFee < 0) {
      errors.push(asError("cancellationFee", "Cancellation fee must be 0 or higher."));
    }
  }

  if (state?.whoCanBook === "subscribersOnly") {
    const tiers = asArray(state?.subscriptionTiers);
    if (tiers.length === 0) {
      errors.push(asError("subscriptionTiers", "Please select at least one subscription tier."));
    }
  }

  if (state?.whoCanBook === "inviteOnly") {
    const inviteSecret = typeof state?.inviteSecret === "string"
      ? state.inviteSecret.trim()
      : "";
    if (!inviteSecret) {
      errors.push(asError("inviteSecret", "Invite link is not ready yet. Please try again."));
    }
  }

  if (state?.spendingRequirement === "mustOwnProducts") {
    const requiredProducts = Array.isArray(state?.requiredProducts)
      ? state.requiredProducts.filter((item) => item && item.id && item.type)
      : [];
    if (requiredProducts.length === 0) {
      errors.push(asError("requiredProducts", "Please add at least one product for spending requirement."));
    }
  }

  const addOns = Array.isArray(state?.addOns) ? state.addOns : [];
  addOns.forEach((addOn, index) => {
    if (!hasAnyAddonValue(addOn)) return;

    const title = typeof addOn?.title === "string" ? addOn.title.trim() : "";
    if (!title) {
      errors.push(asError(`addOns.${index}.title`, `Add-on service ${index + 1} title is required.`));
    }

    const price = asNumber(addOn?.priceTokens);
    if (price == null || price < 0) {
      errors.push(asError(`addOns.${index}.priceTokens`, `Add-on service ${index + 1} price must be 0 or higher.`));
    }
  });

  return { errors };
}
