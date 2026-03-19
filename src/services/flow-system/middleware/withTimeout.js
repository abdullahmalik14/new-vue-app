import { fail } from "../flowTypes.js";

export function withTimeout(next) {
  return async (args) => {
    const timeoutMs = Number(args?.context?.timeoutMs || 15000);
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

    const flowPromise = next(args);
    const result = await Promise.race([flowPromise, timeoutPromise]);
    clearTimeout(timer);
    return result;
  };
}

