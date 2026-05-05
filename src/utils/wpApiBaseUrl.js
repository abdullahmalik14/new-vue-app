function normalizeWpSiteBaseUrl(value) {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) return "";

  const lowered = normalized.toLowerCase();
  if (lowered === "undefined" || lowered === "null") return "";

  return normalized.replace(/\/+$/, "");
}

function getConfiguredWpSiteBaseUrl() {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_WEB_BASE_URL) {
    return import.meta.env.VITE_WEB_BASE_URL;
  }

  return "";
}

function getBrowserOrigin() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  if (typeof globalThis !== "undefined" && globalThis.location?.origin) {
    return globalThis.location.origin;
  }

  return "";
}

export function resolveWpSiteBaseUrl(options = {}) {
  const configured = normalizeWpSiteBaseUrl(
    options.envValue !== undefined ? options.envValue : getConfiguredWpSiteBaseUrl(),
  );
  if (configured) return configured;

  const browserOrigin = normalizeWpSiteBaseUrl(
    options.origin !== undefined ? options.origin : getBrowserOrigin(),
  );
  if (browserOrigin) return browserOrigin;

  return "";
}

export function buildWpApiUrl(path = "", options = {}) {
  const baseUrl = resolveWpSiteBaseUrl(options);
  const normalizedPath = String(path || "").replace(/^\/+/, "");
  const apiRoot = baseUrl ? `${baseUrl}/wp-json/api` : "/wp-json/api";

  if (!normalizedPath) return apiRoot;
  return `${apiRoot}/${normalizedPath}`;
}

export { normalizeWpSiteBaseUrl };
