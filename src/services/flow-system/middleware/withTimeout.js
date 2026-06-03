import { fail } from "../flowTypes.js";

export function withTimeout(next) {
  return async (args) => {
    const timeoutMs = Number(args?.context?.timeoutMs ?? 15000);
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
      return next(args);
    }

    const controller = new AbortController();
    args.context.signal = controller.signal;

    let timer = null;
    const timeoutPromise = new Promise((resolve) => {
      timer = setTimeout(() => {
        controller.abort();
        resolve(
          fail({
            code: "FLOW_TIMEOUT",
            message: `Flow timed out after ${timeoutMs}ms`,
          })
        );
      }, timeoutMs);
    });

    try {
      const flowPromise = next(args);
      return await Promise.race([flowPromise, timeoutPromise]);
    } finally {
      clearTimeout(timer);
    }
  };
}

