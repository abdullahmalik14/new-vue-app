import { fail } from "../flow-system/flowTypes.js";
import { normalizeUnknownError } from "../flow-system/flowErrors.js";
export { buildFlowRequestOptions } from "@/services/flow-system/utils/buildFlowRequestOptions.js";

function getFallbackBaseUrl() {
  // If Vite env isn't defined, default to local backend
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_SCYLLADB_API_URL
  ) {
    return import.meta.env.VITE_SCYLLADB_API_URL;
  }
  return "http://localhost:3001";
}

export function getChatApiBaseUrl(context) {
  if (context?.baseUrl) {
    return context.baseUrl;
  }
  return getFallbackBaseUrl();
}

/** RFC 3986 path segment — use for chatId, messageId, userId, etc. */
export function encodePathSegment(value) {
  if (value == null || value === "") {
    return "";
  }
  return encodeURIComponent(String(value));
}

/**
 * Join base URL with path segments; each segment is encodeURIComponent-encoded.
 * @param {string} baseUrl
 * @param {...(string|number|null|undefined)} segments
 */
export function buildChatApiUrl(baseUrl, ...segments) {
  const base = String(baseUrl ?? "").replace(/\/+$/, "");
  const path = segments
    .map((segment) => encodePathSegment(segment))
    .filter((segment) => segment !== "")
    .join("/");
  return path ? `${base}/${path}` : base;
}

export function asFlowError(
  error,
  defaultCode = "CHAT_API_ERROR",
  defaultMessage = "A chat API error occurred.",
) {
  const norm = normalizeUnknownError(error);
  return fail({
    code: norm.error?.code || defaultCode,
    message: norm.error?.message || defaultMessage,
    details: norm.error?.details || error,
  });
}
