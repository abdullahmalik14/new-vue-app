import { fail } from "@/services/flow-system/flowTypes.js";

export function getRentalApiBaseUrl(context) {
  return context.apiBaseUrl || import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
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
