import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getEventsApiBaseUrl, asFlowError } from "@/services/events/eventsApiUtils.js";
import { mapSingleEventFromResponse } from "@/services/events/mappers/fetchCreatorEventsMapper.js";

export async function createEventFlow({ payload, context, api }) {
  const baseUrl = getEventsApiBaseUrl(context);
  const headers = context.requestHeaders || {};

  try {
    const response = await api.post(`${baseUrl}/events`, payload, {
      headers,
      signal: context.signal,
      timeoutMs: context.requestTimeoutMs,
    });

    const status = getHttpStatus(response, 201);

    if (response?.ok === false) {
      return fail({
        code: "CREATE_EVENT_FAILED",
        message: response?.error || "Failed to create event.",
        details: response,
      });
    }

    const eventId = response?.eventId || response?.item?.eventId || null;
    const mappedItem = response?.item ? mapSingleEventFromResponse(response.item) : null;

    return ok(
      {
        eventId,
        item: mappedItem,
        rawItem: response?.item || null,
      },
      {
        flow: "events.createEvent",
        status,
      }
    );
  } catch (error) {
    return asFlowError(
      error,
      "CREATE_EVENT_UNEXPECTED",
      "Unexpected error while creating event."
    );
  }
}
