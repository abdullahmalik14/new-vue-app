import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getEventsApiBaseUrl, asFlowError } from "@/services/events/eventsApiUtils.js";

export async function fetchEventFlow({ payload, context, api }) {
  const baseUrl = getEventsApiBaseUrl(context);
  const headers = context.requestHeaders || {};

  const eventId = payload?.eventId;
  if (!eventId) {
    return fail({ code: "MISSING_EVENT_ID", message: "eventId is required." });
  }

  try {
    const response = await api.get(`${baseUrl}/events/${eventId}`, {
      headers,
      signal: context.signal,
      timeoutMs: context.requestTimeoutMs,
    });

    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({
        code: "FETCH_EVENT_FAILED",
        message: response?.error || "Failed to fetch event.",
        details: response,
      });
    }

    return ok(
      { item: response?.item || null },
      { flow: "events.fetchEvent", status }
    );
  } catch (error) {
    return asFlowError(error, "FETCH_EVENT_UNEXPECTED", "Unexpected error while fetching event.");
  }
}
