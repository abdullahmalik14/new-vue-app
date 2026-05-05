function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toString(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function toTags(value) {
  return Array.isArray(value) ? value.map((tag) => toString(tag)).filter(Boolean) : [];
}

function parseProductId(value) {
  const raw = toString(value);
  const parts = raw.split(":");
  if (parts.length < 2) return { type: "", id: null };
  const id = toNumber(parts[1], null);
  return {
    type: toString(parts[0]).toLowerCase(),
    id: Number.isFinite(id) ? id : null,
  };
}

function normalizeProductType(value) {
  const type = toString(value).toLowerCase();
  if (type === "merch") return "product";
  return type;
}

function getNested(source, path) {
  return path.reduce((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return current[key];
  }, source);
}

function inferPreviewType(url, hint = "") {
  const value = toString(url).toLowerCase();
  const safeHint = toString(hint).toLowerCase();
  if (!value) return null;
  if (safeHint.includes("audio") || /\.(mp3|m4a|wav|aac|ogg)(\?|#|$)/.test(value)) return "audio";
  if (safeHint.includes("video") || safeHint.includes("trailer") || /\.(mp4|webm|mov|m4v)(\?|#|$)/.test(value)) return "video";
  return null;
}

function findPreview(source = {}) {
  const candidates = [
    { path: ["preview", "url"], hint: source?.preview?.type || "preview" },
    { path: ["previewUrl"], hint: "preview" },
    { path: ["preview_url"], hint: "preview" },
    { path: ["trailerUrl"], hint: "trailer" },
    { path: ["trailer_url"], hint: "trailer" },
    { path: ["videoPreviewUrl"], hint: "video" },
    { path: ["video_preview_url"], hint: "video" },
    { path: ["audioPreviewUrl"], hint: "audio" },
    { path: ["audio_preview_url"], hint: "audio" },
    { path: ["mediaPreviewUrl"], hint: "preview" },
    { path: ["media_preview_url"], hint: "preview" },
    { path: ["raw", "preview", "url"], hint: source?.raw?.preview?.type || "preview" },
    { path: ["raw", "previewUrl"], hint: "preview" },
    { path: ["raw", "preview_url"], hint: "preview" },
    { path: ["raw", "trailerUrl"], hint: "trailer" },
    { path: ["raw", "trailer_url"], hint: "trailer" },
    { path: ["raw", "videoPreviewUrl"], hint: "video" },
    { path: ["raw", "video_preview_url"], hint: "video" },
    { path: ["raw", "audioPreviewUrl"], hint: "audio" },
    { path: ["raw", "audio_preview_url"], hint: "audio" },
  ];

  for (const candidate of candidates) {
    const url = toString(getNested(source, candidate.path));
    const type = inferPreviewType(url, candidate.hint);
    if (url && type) return { type, url };
  }

  return { type: null, url: "" };
}

export function normalizeProductForChat(item = {}, { senderId = null } = {}) {
  if (!item || typeof item !== "object") return null;

  const parsedProductId = parseProductId(item.productId);
  const id = Number.isFinite(Number(item.id)) ? Number(item.id) : parsedProductId.id;
  const type = normalizeProductType(item.type || parsedProductId.type);
  if (!type || !Number.isFinite(Number(id))) return null;

  const title = toString(item.title || item.name, `${type} ${id}`);
  const thumbnailUrl = toString(item.thumbnailUrl || item.imageUrl);
  const buyPrice = toNumber(item.buyPrice, 0);
  const subscribePrice = toNumber(item.subscribePrice, 0);
  const price = toNumber(item.price, buyPrice || subscribePrice || 0);
  const preview = findPreview(item);

  return {
    id: Number(id),
    type,
    title,
    buyPrice,
    subscribePrice,
    thumbnailUrl,
    tags: toTags(item.tags),
    name: title,
    productId: `${type}:${Number(id)}`,
    price,
    imageUrl: thumbnailUrl,
    currency: toString(item.currency, "USD"),
    preview: {
      type: preview.type,
      url: preview.url,
      posterUrl: toString(item.preview?.posterUrl || item.preview?.poster_url || thumbnailUrl),
    },
    ...(senderId !== null && senderId !== undefined ? { senderId: String(senderId) } : {}),
  };
}

export function extractProductRecommendation(message = {}) {
  const content = message?.content || {};
  return normalizeProductForChat(
    content.product_recommendation || content.productRecommendation || message.product_recommendation || {}
  );
}

export function productPriceLabel(product = {}) {
  const buyPrice = toNumber(product.buyPrice, 0);
  const subscribePrice = toNumber(product.subscribePrice, 0);
  if (buyPrice > 0 && subscribePrice > 0) return `Subscribe $${subscribePrice} or Buy $${buyPrice}`;
  if (subscribePrice > 0) return `Subscribe $${subscribePrice}`;
  if (buyPrice > 0) return `Buy $${buyPrice}`;
  return "FREE";
}

export function resolveChatFanUid({ windowRef = typeof window !== "undefined" ? window : null } = {}) {
  const candidates = [
    windowRef?.__fsChatFanUid,
    windowRef?.userData?.fanUid,
    windowRef?.userData?.fan_uid,
    windowRef?.userData?.encryptedUid,
    windowRef?.userData?.encrypted_uid,
    windowRef?.userData?.uid,
    windowRef?.userData?.user?.fanUid,
    windowRef?.userData?.user?.fan_uid,
    windowRef?.userData?.user?.encryptedUid,
    windowRef?.userData?.user?.encrypted_uid,
    windowRef?.userData?.user?.uid,
  ];

  if (windowRef?.location?.search) {
    const params = new URLSearchParams(windowRef.location.search);
    candidates.push(
      params.get("fanUid"),
      params.get("fan_uid"),
      params.get("encryptedUid"),
      params.get("encrypted_uid"),
      params.get("uid")
    );
  }

  for (const candidate of candidates) {
    const value = toString(candidate);
    if (value) return value;
  }

  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    return toString(import.meta.env.VITE_TEST_FS_FAN_UID);
  }

  return "";
}

function getResultPayload(response = {}) {
  if (response?.result && typeof response.result === "object") return response.result;
  if (response?.data?.result && typeof response.data.result === "object") return response.data.result;
  if (response?.data && typeof response.data === "object") return response.data;
  return response && typeof response === "object" ? response : {};
}

function isFutureDate(value, now = Date.now()) {
  const text = toString(value);
  if (!text) return false;
  const timestamp = Date.parse(text);
  return Number.isFinite(timestamp) && timestamp > now;
}

function toBoolean(value) {
  if (value === true || value === 1) return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }
  return false;
}

function toNullableValue(value) {
  return value === undefined ? null : value;
}

function subscriptionPayloadFields(detail = {}) {
  return {
    subscription_id: toNullableValue(detail?.subscription_id),
    item_line_number: toNullableValue(detail?.item_line_number),
    subscribed_tier_id: toNullableValue(detail?.subscribed_tier_id),
  };
}

function toPlainCloneable(value, seen = new WeakSet()) {
  if (value === null || value === undefined) return value ?? null;
  const type = typeof value;

  if (type === "string" || type === "number" || type === "boolean") {
    return Number.isNaN(value) ? null : value;
  }

  if (type === "bigint") return value.toString();
  if (type === "function" || type === "symbol") return undefined;
  if (value instanceof Date) return value.toISOString();

  if (type !== "object") return undefined;
  if (seen.has(value)) return undefined;
  seen.add(value);

  if (Array.isArray(value)) {
    return value
      .map((item) => toPlainCloneable(item, seen))
      .filter((item) => item !== undefined);
  }

  const output = {};
  for (const key of Object.keys(value)) {
    if (key.startsWith("__v_")) continue;
    const cloned = toPlainCloneable(value[key], seen);
    if (cloned !== undefined) output[key] = cloned;
  }
  return output;
}

export function toCloneSafeProductPayload(value) {
  return toPlainCloneable(value);
}

export function normalizeProductRecommendationStatus({ product, response, now = Date.now() } = {}) {
  const normalizedProduct = normalizeProductForChat(product);
  const type = normalizeProductType(normalizedProduct?.type || product?.type);
  const detail = getResultPayload(response);

  if (type === "media") {
    const hasAccess = toBoolean(detail?.stats?.has_access);
    return {
      type,
      detail,
      hasAccess,
      canBuy: !hasAccess,
      cta: hasAccess ? "watch" : "buy",
    };
  }

  if (type === "subscription") {
    const hasAccess = toBoolean(detail?.stats?.is_subscribed);
    return {
      type,
      detail,
      hasAccess,
      canBuy: !hasAccess,
      cta: hasAccess ? "subscribed" : "subscribe",
      ctaLabel: toString(detail?.action_text),
    };
  }

  if (type === "product") {
    const canPreorder = isFutureDate(detail?.publish_date, now) && toBoolean(detail?.can_preorder);
    const canBuy = toBoolean(detail?.can_buy) || canPreorder;
    return {
      type,
      detail,
      hasAccess: false,
      canBuy,
      cta: canBuy ? "buy" : "unavailable",
    };
  }

  return {
    type,
    detail,
    hasAccess: false,
    canBuy: false,
    cta: "retry",
  };
}

export function productRecommendationMessageKey(message = {}) {
  const messageId = toString(message.message_id || message.id);
  if (messageId) return `message:${messageId}`;

  const product = extractProductRecommendation(message);
  return product ? `product:${product.productId}` : "";
}

export function productRefreshMatchesMessage(message = {}, payload = {}) {
  const product = extractProductRecommendation(message);
  if (!product) return false;

  const payloadMessageId = toString(payload.messageId || payload.message_id);
  const messageId = toString(message.message_id || message.id);
  if (payloadMessageId && messageId && payloadMessageId !== messageId) return false;

  const payloadChatId = toString(payload.chatId || payload.chat_id);
  const chatId = toString(message.chat_id || message.chatId);
  if (payloadChatId && chatId && payloadChatId !== chatId) return false;

  const payloadProductId = toString(payload.productId || payload.product_id);
  if (payloadProductId) return payloadProductId === product.productId;

  const payloadType = normalizeProductType(payload.type);
  const payloadId = toNumber(payload.id, null);
  if (payloadType || Number.isFinite(payloadId)) {
    return (!payloadType || payloadType === product.type)
      && (!Number.isFinite(payloadId) || payloadId === product.id);
  }

  return Boolean(payloadMessageId || payloadChatId);
}

export function productActionFromCta(cta) {
  if (cta === "watch") return "watch";
  if (cta === "subscribe") return "subscribe";
  if (cta === "buy") return "buy";
  return "";
}

export function productCtaLabel(cta) {
  if (cta === "watch") return "Watch";
  if (cta === "subscribed") return "Subscribed";
  if (cta === "subscribe") return "Subscribe";
  if (cta === "buy") return "Buy now";
  if (cta === "retry") return "Retry";
  if (cta === "loading") return "Checking...";
  return "Unavailable";
}

export function productStatusCtaLabel(status = {}) {
  const customLabel = toString(status?.ctaLabel);
  return customLabel || productCtaLabel(status?.cta);
}

export function isProductCtaDisabled(cta) {
  return cta === "subscribed" || cta === "unavailable" || cta === "loading";
}

export function buildProductSelectedPayload({ message = {}, chatId = "", product, status = {}, action = "" } = {}) {
  const normalizedProduct = normalizeProductForChat(product) || extractProductRecommendation(message);
  if (!normalizedProduct) return null;

  const productDetail = toCloneSafeProductPayload(status?.detail || null);
  const resolvedAction = productActionFromCta(action) || productActionFromCta(status?.cta) || "";
  const payload = {
    chatId: message.chat_id || message.chatId || chatId,
    messageId: message.message_id || message.id,
    senderId: message.sender_id || message.senderId || null,
    product: toCloneSafeProductPayload(normalizedProduct),
    productDetail,
    ...(resolvedAction ? { action: resolvedAction } : {}),
    source: "chat_product_recommendation",
  };

  if (normalizedProduct.type === "subscription") {
    Object.assign(payload, subscriptionPayloadFields(productDetail || {}));
  }

  return toCloneSafeProductPayload(payload);
}
