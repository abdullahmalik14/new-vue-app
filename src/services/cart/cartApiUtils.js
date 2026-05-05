import { fail } from "@/services/flow-system/flowTypes.js";

export function getCartApiBaseUrl(context) {
  // Use VITE_CART_API_BASE_URL if available, then fallback to general API base
  return import.meta.env.VITE_CART_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || "/api";
}

export function asFlowError(error, fallbackCode, fallbackMessage) {
  if (error?.ok === false && error?.error) {
    return error;
  }

  return fail({
    code: error?.code || fallbackCode,
    message: error?.message || fallbackMessage,
    details: error?.details || error,
  });
}
