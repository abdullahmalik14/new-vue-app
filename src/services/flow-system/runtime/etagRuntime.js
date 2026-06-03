import { buildPayloadHash, resolveStorage } from "@/services/flow-system/runtime/cacheRuntime.js";

const ETAG_PREFIX = "__flow_etag__:";
const ETAG_NONCE_KEY = "__flow_etag_nonce__";
const ETAG_RECORD_VERSION = 1;
const memoryEtag = new Map();
let memorySessionNonce = null;

function hashStableString(raw) {
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  return String(hash >>> 0);
}

function resolveEtagSessionNonce(storage) {
  if (storage && typeof storage.getItem === "function") {
    try {
      let nonce = storage.getItem(ETAG_NONCE_KEY);
      if (!nonce) {
        nonce = `${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
        storage.setItem(ETAG_NONCE_KEY, nonce);
      }
      return nonce;
    } catch {
      // fall through to memory nonce
    }
  }
  if (!memorySessionNonce) {
    memorySessionNonce = `${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  }
  return memorySessionNonce;
}

function buildEtagDigest({ nonce, key, etag }) {
  return hashStableString(`${nonce}|${key}|${etag}`);
}

export function sealEtagRecord({ nonce, key, etag }) {
  const digest = buildEtagDigest({ nonce, key, etag: String(etag) });
  return JSON.stringify({ v: ETAG_RECORD_VERSION, etag: String(etag), digest });
}

export function unsealEtagRecord(raw, { nonce, key }) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.v !== ETAG_RECORD_VERSION || !parsed.etag || !parsed.digest) {
      return null;
    }
    const expected = buildEtagDigest({ nonce, key, etag: parsed.etag });
    if (parsed.digest !== expected) return null;
    return parsed.etag;
  } catch {
    return null;
  }
}

export function buildEtagKey(flowName, payload, config = {}) {
  const varyByPayload = config.varyByPayload !== false;
  const payloadPart = varyByPayload ? buildPayloadHash(payload) : "shared";
  return `${ETAG_PREFIX}${flowName}:${payloadPart}`;
}

export function loadEtag({ storage, key }) {
  const nonce = resolveEtagSessionNonce(storage);
  if (storage) {
    const raw = storage.getItem(key);
    return unsealEtagRecord(raw, { nonce, key });
  }
  const raw = memoryEtag.get(key);
  return unsealEtagRecord(raw, { nonce, key });
}

export function saveEtag({ storage, key, etag }) {
  if (!etag) return;
  const nonce = resolveEtagSessionNonce(storage);
  const sealed = sealEtagRecord({ nonce, key, etag });
  if (storage) {
    storage.setItem(key, sealed);
    return;
  }
  memoryEtag.set(key, sealed);
}

export function attachIfNoneMatch(headers = {}, etag) {
  if (!etag) return headers;
  return { ...headers, "If-None-Match": etag };
}

export function resolveEtagStorage(explicitStorage) {
  return resolveStorage(explicitStorage);
}

export function extractEtag(flowResult) {
  return (
    flowResult?.meta?.etag ||
    flowResult?.meta?.headers?.etag ||
    flowResult?.meta?.headers?.ETag ||
    flowResult?.data?.etag ||
    null
  );
}

export function isNotModifiedResult(flowResult) {
  return (
    flowResult?.meta?.notModified === true ||
    Number(flowResult?.meta?.status) === 304 ||
    Number(flowResult?.meta?.httpStatus) === 304
  );
}

