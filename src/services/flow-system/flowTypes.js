export function ok(data = {}, meta = {}) {
  return { ok: true, status: "success", data, meta };
}

export function fail(error = {}, meta = {}) {
  return {
    ok: false,
    status: "error",
    error: {
      code: error.code || "FLOW_ERROR",
      message: error.message || "Flow failed",
      details: error.details || null,
    },
    meta,
  };
}

export function cancelled(reason = "cancelled", meta = {}) {
  return {
    ok: false,
    status: "cancelled",
    error: {
      code: "FLOW_CANCELLED",
      message: "Flow was cancelled",
      details: { reason },
    },
    meta: { ...meta, cancelled: true, reason },
  };
}

export function isFlowResult(value) {
  return !!value && typeof value === "object" && typeof value.ok === "boolean";
}
