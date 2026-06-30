import { analyticsTestState } from '../state.js';

/**
 * @param {{ name: string, method?: string, url: string, body?: unknown }} step
 */
export async function runApiStep({ name, method = 'POST', url, body }) {
  const startedAt = Date.now();
  const entry = {
    name,
    method,
    url,
    request: body ?? null,
    response: null,
    status: null,
    ok: false,
    durationMs: 0,
    at: new Date().toISOString(),
    error: null,
  };

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body != null ? JSON.stringify(body) : undefined,
    });
    entry.status = response.status;
    const text = await response.text();
    try {
      entry.response = JSON.parse(text);
    } catch {
      entry.response = text;
    }
    entry.ok = response.ok;
  } catch (error) {
    entry.error = error instanceof Error ? error.message : String(error);
  }

  entry.durationMs = Date.now() - startedAt;
  analyticsTestState.apiLog.push(entry);

  if (body != null) {
    analyticsTestState.sentPayloads.push({
      step: name,
      at: entry.at,
      payload: body,
      response: entry.response,
      ok: entry.ok,
    });
  }

  return entry;
}
