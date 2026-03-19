import { fail } from "../flow-system/flowTypes.js";
import { normalizeUnknownError } from "../flow-system/flowErrors.js";

function getFallbackBaseUrl() {
  // If Vite env isn't defined, default to local backend
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_SCYLLADB_API_URL) {
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

export function asFlowError(error, defaultCode = "CHAT_API_ERROR", defaultMessage = "A chat API error occurred.") {
  const norm = normalizeUnknownError(error);
  return fail({
    code: norm.error?.code || defaultCode,
    message: norm.error?.message || defaultMessage,
    details: norm.error?.details || error,
  });
}
