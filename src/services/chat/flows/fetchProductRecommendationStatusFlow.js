import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getHttpStatus } from "@/services/flow-system/runtime/httpMetaRuntime.js";
import { asFlowError } from "@/services/chat/chatApiUtils.js";
import { buildWpApiUrl } from "@/utils/wpApiBaseUrl.js";
import {
  normalizeProductForChat,
  normalizeProductRecommendationStatus,
  resolveChatFanUid,
} from "@/utils/chatProductRecommendation.js";

function endpointForProduct(product = {}) {
  if (product.type === "media") {
    return {
      path: "/media/get",
      params: { media_id: product.id },
    };
  }

  if (product.type === "subscription") {
    return {
      path: "/subscriptions/get-tier",
      params: { tier_id: product.id },
    };
  }

  if (product.type === "product") {
    return {
      path: "/products/get",
      params: { merch_id: product.id },
    };
  }

  return null;
}

export async function fetchProductRecommendationStatusFlow({ payload, context, api }) {
  const product = normalizeProductForChat(payload?.product || payload);
  if (!product) {
    return fail({
      code: "FETCH_PRODUCT_RECOMMENDATION_STATUS_MISSING_PRODUCT",
      message: "A product recommendation is required.",
    });
  }

  const endpoint = endpointForProduct(product);
  if (!endpoint) {
    return fail({
      code: "FETCH_PRODUCT_RECOMMENDATION_STATUS_UNSUPPORTED_TYPE",
      message: "Product recommendation type is not supported.",
    });
  }

  const fanUid = String(payload?.fanUid || resolveChatFanUid()).trim();
  if (!fanUid) {
    return fail({
      code: "FETCH_PRODUCT_RECOMMENDATION_STATUS_MISSING_FAN_UID",
      message: "Fan UID is required to check product access.",
    });
  }

  try {
    const response = await api.get(buildWpApiUrl(endpoint.path), {
      params: {
        ...endpoint.params,
        uid: fanUid,
      },
      headers: context.requestHeaders || {},
      signal: context.signal,
      timeoutMs: context.requestTimeoutMs,
    });
    const status = getHttpStatus(response, 200);

    if (response?.ok === false) {
      return fail({
        code: "FETCH_PRODUCT_RECOMMENDATION_STATUS_FAILED",
        message: response?.error || "Failed to check product access.",
        details: response,
      }, { flow: "chat.fetchProductRecommendationStatus", status });
    }

    return ok(
      normalizeProductRecommendationStatus({ product, response }),
      { flow: "chat.fetchProductRecommendationStatus", status }
    );
  } catch (error) {
    return asFlowError(
      error,
      "FETCH_PRODUCT_RECOMMENDATION_STATUS_UNEXPECTED",
      "Unexpected error while checking product access."
    );
  }
}
