import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus, getEtag, isApiNotModified } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getEventsApiBaseUrl, asFlowError, toNumberOr } from "@/services/events/eventsApiUtils.js";

function buildParams(payload = {}) {
  return {
    creatorId: payload.creatorId,
    status: payload.status,
    limit: payload.limit,
    next: payload.next,
  };
}

export async function fetchCreatorEventsFlow({ payload, context, api }) {
  const baseUrl = getEventsApiBaseUrl(context);
  const headers = context.requestHeaders || {};

  if (payload?.creatorId == null || payload?.creatorId === "") {
    return fail({
      code: "MISSING_CREATOR_ID",
      message: "creatorId is required to fetch creator events.",
    });
  }

  try {
    const response = await api.get(`${baseUrl}/events`, {
      params: buildParams(payload),
      headers,
      signal: context.signal,
      timeoutMs: context.requestTimeoutMs,
    });

    const status = getHttpStatus(response, 200);
    const etag = getEtag(response);

    if (isApiNotModified(response)) {
      return ok(
        { items: [], next: payload?.next ?? null, total: 0 },
        {
          flow: "events.fetchCreatorEvents",
          status,
          notModified: true,
          etag,
        }
      );
    }

    if (response?.ok === false) {
      return fail({
        code: "FETCH_CREATOR_EVENTS_FAILED",
        message: response?.error || "Failed to fetch creator events.",
        details: response,
      });
    }

    const items = Array.isArray(response?.items) ? response.items : [];
    const limit = toNumberOr(payload?.limit, null);

    return ok(
      {
        items,
        next: response?.next ?? null,
        total: Number.isFinite(Number(response?.total))
          ? Number(response.total)
          : items.length,
        limit,
      },
      {
        flow: "events.fetchCreatorEvents",
        status,
        etag,
      }
    );
  } catch (error) {
    return asFlowError(
      error,
      "FETCH_CREATOR_EVENTS_UNEXPECTED",
      "Unexpected error while fetching creator events."
    );
  }
}
