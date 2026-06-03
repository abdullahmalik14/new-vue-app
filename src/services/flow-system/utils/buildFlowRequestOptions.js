/**
 * Standard HTTP options for flow handlers (headers, abort signal, timeout).
 */
export function buildFlowRequestOptions(context, extra = {}) {
  const headers = {
    ...(context?.requestHeaders || {}),
    ...(extra.headers || {}),
  };

  const options = {
    headers,
    ...extra,
  };

  if (context?.signal && options.signal == null) {
    options.signal = context.signal;
  }

  const timeoutMs = extra.timeoutMs ?? context?.requestTimeoutMs ?? context?.timeoutMs;
  if (timeoutMs != null && options.timeoutMs == null) {
    options.timeoutMs = timeoutMs;
  }

  return options;
}
