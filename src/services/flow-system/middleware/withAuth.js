import { fail } from "../flowTypes.js";

export function withAuth(next) {
  return async (args) => {
    const requireAuth = args?.context?.requireAuth !== false;
    if (!requireAuth) return next(args);

    if (!args?.context?.userId) {
      return fail({
        code: "AUTH_REQUIRED",
        message: "You must be logged in to run this flow.",
      });
    }

    return next(args);
  };
}

