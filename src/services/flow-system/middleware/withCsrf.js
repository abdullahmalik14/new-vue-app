import { applyCsrfToRequestHeaders, resolveCsrfToken } from "@/services/flow-system/utils/flowAuthSecrets.js";

export function withCsrf(next) {
  return async (args) => {
    const context = args?.context;
    if (context?.flowKind === "write") {
      const token = resolveCsrfToken({ flowSecurity: context.flowSecurity });
      context.requestHeaders = applyCsrfToRequestHeaders(
        context.requestHeaders || {},
        token,
        { flowKind: "write" },
      );
    }
    return next(args);
  };
}
