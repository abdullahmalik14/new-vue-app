import { toNumberOr } from "@/services/events/eventsApiUtils.js";

function normalizeType(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "media" || normalized === "product" || normalized === "subscription") {
    return normalized;
  }
  return "product";
}

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toStringValue(value, fallback = "") {
  if (value === undefined || value === null) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function toNumericId(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toTags(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => toStringValue(item, ""))
    .filter(Boolean);
}

function mediaToProduct(row = {}) {
  const buyPrice = asNumber(row?.p2v?.price, 0);
  const subscribePrice = asNumber(row?.subscription?.price, 0);

  return {
    id: toNumericId(row?.id),
    type: "media",
    title: toStringValue(row?.title, "Untitled Media"),
    buyPrice: buyPrice > 0 ? buyPrice : null,
    subscribePrice: subscribePrice > 0 ? subscribePrice : null,
    thumbnailUrl: toStringValue(row?.thumbnail_url, ""),
    tags: toTags(row?.tags),
    raw: row,
  };
}

function productToProduct(row = {}) {
  const buyPrice = asNumber(row?.price, 0);
  const subscribePrice = asNumber(row?.subscribe_data?.price, 0);

  return {
    id: toNumericId(row?.id),
    type: "product",
    title: toStringValue(row?.title, "Untitled Product"),
    buyPrice: buyPrice > 0 ? buyPrice : null,
    subscribePrice: subscribePrice > 0 ? subscribePrice : null,
    thumbnailUrl: toStringValue(Array.isArray(row?.gallery) ? row.gallery[0] : "", ""),
    tags: toTags(row?.tags),
    raw: row,
  };
}

function subscriptionToProduct(row = {}) {
  const sourceRow = row?.raw || row;
  const fallbackTitle = toStringValue(sourceRow?.name, "Subscription Tier");
  const price = asNumber(sourceRow?.price, 0);

  return {
    id: toNumericId(sourceRow?.id),
    type: "subscription",
    title: toStringValue(sourceRow?.title || sourceRow?.name, fallbackTitle),
    buyPrice: null,
    subscribePrice: price > 0 ? price : null,
    thumbnailUrl: toStringValue(sourceRow?.background_image || sourceRow?.thumbnail_url || "", ""),
    tags: toTags(sourceRow?.tags),
    raw: sourceRow,
  };
}

function normalizeItem(type, row = {}) {
  if (type === "media") return mediaToProduct(row);
  if (type === "product") return productToProduct(row);
  if (type === "subscription") return subscriptionToProduct(row);
  return null;
}

export function mapFetchSpendingRequirementItemsFromResponse(responseData = {}) {
  const type = normalizeType(responseData?.type);
  const rows = Array.isArray(responseData?.results) ? responseData.results : [];
  const items = rows
    .map((row) => normalizeItem(type, row))
    .filter((item) => item && Number.isFinite(Number(item.id)));

  const dedupedItemsMap = new Map();
  items.forEach((item) => {
    const key = `${item.type}:${item.id}`;
    if (!dedupedItemsMap.has(key)) {
      dedupedItemsMap.set(key, item);
    }
  });
  const dedupedItems = Array.from(dedupedItemsMap.values());

  const count = Math.max(1, toNumberOr(responseData?.count, 20));
  const offset = Math.max(0, toNumberOr(responseData?.offset, 0));
  const totalCountRaw = toNumberOr(responseData?.totalCount, null);
  const totalCount = totalCountRaw == null ? null : Math.max(0, totalCountRaw);
  const nextOffset = offset + dedupedItems.length;
  const hasMore = totalCount == null ? dedupedItems.length >= count : nextOffset < totalCount;

  return {
    type,
    items: dedupedItems,
    count,
    offset,
    nextOffset,
    totalCount,
    hasMore,
    source: responseData?.source || null,
    meta: {
      receivedAt: Date.now(),
      count: dedupedItems.length,
    },
  };
}
