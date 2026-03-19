import { fail } from "./flowTypes.js";

export function normalizeUnknownError(error, fallbackCode = "UNEXPECTED_ERROR") {
  if (error && error.ok === false && error.error) return error;

  return fail({
    code: error?.code || fallbackCode,
    message: error?.message || "Unexpected error",
    details: error?.details || error || null,
  });
}

