const SENSITIVE_CONTEXT_KEYS = new Set(["backendJwtToken", "csrfToken"]);
const SENSITIVE_FLOW_SECURITY_KEYS = new Set(["csrfToken"]);

export function resolveCsrfToken(options = {}) {
  const fromOptions = typeof options.csrfToken === "string"
    ? options.csrfToken.trim()
    : "";
  const fromContext = typeof options.context?.csrfToken === "string"
    ? options.context.csrfToken.trim()
    : "";
  const fromFlowSecurity = typeof options.flowSecurity?.csrfToken === "string"
    ? options.flowSecurity.csrfToken.trim()
    : "";
  return fromOptions || fromContext || fromFlowSecurity || "";
}

export function applyCsrfToRequestHeaders(requestHeaders, token, { flowKind } = {}) {
  if (flowKind === "write" && token) {
    requestHeaders["X-CSRF-Token"] = token;
  }
  return requestHeaders;
}

export function resolveBackendJwtToken(options = {}) {
  const fromOptions = typeof options.backendJwtToken === "string"
    ? options.backendJwtToken.trim()
    : "";
  const fromContext = typeof options.context?.backendJwtToken === "string"
    ? options.context.backendJwtToken.trim()
    : "";
  return fromOptions || fromContext || "";
}

export function applyBackendJwtToRequestHeaders(requestHeaders, token) {
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }
  return requestHeaders;
}

export function stripSensitiveContextOverrides(contextOverrides = {}) {
  if (!contextOverrides || typeof contextOverrides !== "object") {
    return {};
  }

  const next = { ...contextOverrides };
  SENSITIVE_CONTEXT_KEYS.forEach((key) => {
    delete next[key];
  });

  if (next.requestHeaders && typeof next.requestHeaders === "object") {
    next.requestHeaders = redactAuthorizationHeader(next.requestHeaders);
  }

  return next;
}

export function redactAuthorizationHeader(headers = {}) {
  if (!headers || typeof headers !== "object") {
    return headers;
  }

  const copy = { ...headers };
  if ("Authorization" in copy) copy.Authorization = "[REDACTED]";
  if ("authorization" in copy) copy.authorization = "[REDACTED]";
  if ("X-CSRF-Token" in copy) copy["X-CSRF-Token"] = "[REDACTED]";
  if ("x-csrf-token" in copy) copy["x-csrf-token"] = "[REDACTED]";
  return copy;
}

export function redactFlowSensitiveValue(value, seen = new WeakSet()) {
  if (value == null) {
    return value;
  }

  if (typeof value === "string") {
    return value.startsWith("Bearer ") ? "[REDACTED]" : value;
  }

  if (typeof value !== "object") {
    return value;
  }

  if (seen.has(value)) {
    return value;
  }
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => redactFlowSensitiveValue(item, seen));
  }

  const out = {};
  Object.entries(value).forEach(([key, nested]) => {
    if (SENSITIVE_CONTEXT_KEYS.has(key)) {
      out[key] = "[REDACTED]";
      return;
    }
    if (key === "requestHeaders" && nested && typeof nested === "object") {
      out[key] = redactAuthorizationHeader(nested);
      return;
    }
    if (key === "flowSecurity" && nested && typeof nested === "object") {
      const redactedSecurity = { ...nested };
      SENSITIVE_FLOW_SECURITY_KEYS.forEach((securityKey) => {
        if (securityKey in redactedSecurity) redactedSecurity[securityKey] = "[REDACTED]";
      });
      out[key] = redactedSecurity;
      return;
    }
    out[key] = redactFlowSensitiveValue(nested, seen);
  });
  return out;
}
