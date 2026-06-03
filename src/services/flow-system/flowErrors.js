import { fail } from "./flowTypes.js";
import { redactFlowSensitiveValue } from "./utils/flowAuthSecrets.js";

export function normalizeUnknownError(error, fallbackCode = "UNEXPECTED_ERROR") {
  if (error && error.ok === false && error.error) {
    return {
      ...error,
      error: {
        ...error.error,
        details: redactFlowSensitiveValue(error.error.details),
      },
    };
  }

  return fail({
    code: error?.code || fallbackCode,
    message: error?.message || "Unexpected error",
    details: redactFlowSensitiveValue(error?.details || error || null),
  });
}

