import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus, getEtag, isApiNotModified } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { getRentalApiBaseUrl, asFlowError } from "@/services/rental/rentalApiUtils.js";

function buildParams(payload = {}) {
  return {
    creatorId: payload.creatorId,
    city: payload.city,
    category: payload.category,
    page: payload.page,
    limit: payload.limit,
    sortBy: payload.sortBy,
  };
}

export async function fetchRentalCatalogFlow({ payload, context, api }) {
  const baseUrl = getRentalApiBaseUrl(context);
  const headers = context.requestHeaders || {};

  if (payload?.creatorId == null || payload?.creatorId === "") {
    return fail({
      code: "MISSING_CREATOR_ID",
      message: "creatorId is required to fetch rental catalog.",
    });
  }

  try {
    const response = await api.get(`${baseUrl}/rentals/catalog`, {
      params: buildParams(payload),
      headers,
      signal: context.signal,
      timeoutMs: context.requestTimeoutMs,
    });

    const status = getHttpStatus(response, 200);
    const etag = getEtag(response);

    if (isApiNotModified(response)) {
      return ok(
        {
          items: [],
          page: payload?.page || 1,
          total: 0,
          nextCursor: null,
        },
        {
          flow: "rental.fetchCatalog",
          status,
          notModified: true,
          etag,
        }
      );
    }

    if (!response?.ok) {
      return fail({
        code: "FETCH_RENTAL_CATALOG_FAILED",
        message: response?.error || "Failed to fetch rental catalog.",
        details: response,
      });
    }

    return ok(
      {
        items: Array.isArray(response?.items) ? response.items : [],
        page: Number(response?.page || payload?.page || 1),
        total: Number(response?.total || 0),
        nextCursor: response?.nextCursor || null,
      },
      {
        flow: "rental.fetchCatalog",
        status,
        etag,
      }
    );
  } catch (error) {
    return asFlowError(
      error,
      "FETCH_RENTAL_CATALOG_UNEXPECTED",
      "Unexpected error while fetching rental catalog."
    );
  }
}
