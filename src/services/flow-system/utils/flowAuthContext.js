let resolveUserIdFn = null;

export function configureFlowAuth({ getUserId } = {}) {
  resolveUserIdFn = typeof getUserId === "function" ? getUserId : null;
}

export function resolveFlowUserId(options = {}) {
  if (options.userId != null && options.userId !== "") {
    return options.userId;
  }
  if (resolveUserIdFn) {
    return resolveUserIdFn() ?? undefined;
  }
  return undefined;
}

export function resetFlowAuthContext() {
  resolveUserIdFn = null;
}
