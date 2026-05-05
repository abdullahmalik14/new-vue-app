import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { getCartApiBaseUrl, asFlowError } from "../cartApiUtils.js";
import { SafeUtils } from "@/utils/SafeUtils";

/**
 * renameCartFlow
 * Updates the label of a specific cart.
 */
export async function renameCartFlow({ payload, context, api }) {
  const baseUrl = getCartApiBaseUrl(context);
  const sessionId = payload?.sessionId || localStorage.getItem("sessionId") || "guest";
  const label = SafeUtils.ensureString(payload?.label);

  // Security: Input length limit (Audit 2.4 / 3.21)
  if (label.length > 100) {
    return fail({
      code: "LABEL_TOO_LONG",
      message: "Cart label exceeds maximum length (100 characters)",
    });
  }

  if (!label.trim()) {
    return fail({
      code: "EMPTY_LABEL",
      message: "Label cannot be empty",
    });
  }

  const url = `${baseUrl}/cart/${sessionId}/label`;

  try {
    const response = await api.patch(url, { label }, {
      headers: context.requestHeaders || {},
      signal: context.signal,
    });

    if (response?.ok === false) {
      return fail({
        code: "RENAME_FAILED",
        message: response?.error || "Failed to rename cart",
      });
    }

    return ok(response, { flow: "cart.rename", label });
  } catch (error) {
    return asFlowError(error, "RENAME_UNEXPECTED", "An unexpected error occurred.");
  }
}
