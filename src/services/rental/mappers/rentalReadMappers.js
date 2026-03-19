function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeCatalogItem(item = {}) {
  return {
    rentalId: item.rentalId || item.id || null,
    creatorId: item.creatorId || null,
    title: item.title || "",
    description: item.description || "",
    coverImageUrl: item.coverImageUrl || item.imageUrl || "",
    category: item.category || "general",
    baseTokens: asNumber(item.baseTokens, 0),
    minMinutes: asNumber(item.minMinutes, 15),
    maxMinutes: asNumber(item.maxMinutes, 60),
    addOns: Array.isArray(item.addOns) ? item.addOns : [],
    raw: item,
  };
}

function normalizeSlot(slot = {}) {
  return {
    start: slot.start || slot.startTime || null,
    end: slot.end || slot.endTime || null,
    available: slot.available !== false,
    remaining: asNumber(slot.remaining, 1),
    raw: slot,
  };
}

export function mapRentalCatalogFromResponse(responseData = {}) {
  const items = Array.isArray(responseData.items) ? responseData.items : [];
  const normalizedItems = items.map((item) => normalizeCatalogItem(item));

  return {
    items: normalizedItems,
    meta: {
      page: asNumber(responseData.page, 1),
      total: asNumber(responseData.total, normalizedItems.length),
      nextCursor: responseData.nextCursor || null,
    },
  };
}

export function mapRentalAvailabilityFromResponse(responseData = {}) {
  return {
    rentalId: responseData.rentalId || null,
    date: responseData.date || null,
    timezone: responseData.timezone || null,
    slots: Array.isArray(responseData.slots)
      ? responseData.slots.map((slot) => normalizeSlot(slot))
      : [],
    blockedSlots: Array.isArray(responseData.blockedSlots) ? responseData.blockedSlots : [],
    bookedSlots: Array.isArray(responseData.bookedSlots) ? responseData.bookedSlots : [],
  };
}
