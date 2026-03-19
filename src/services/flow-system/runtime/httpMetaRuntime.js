import { extractEtag } from "@/services/flow-system/runtime/etagRuntime.js";

export function getHttpStatus(response, fallback = 200) {
  return Number(response?.__meta?.status || fallback);
}

export function getEtag(response) {
  return extractEtag({
    data: response,
    meta: {
      etag: response?.etag,
      headers: response?.__meta?.headers || {},
    },
  });
}

export function isApiNotModified(response) {
  return getHttpStatus(response, 200) === 304 || response?.notModified === true;
}
