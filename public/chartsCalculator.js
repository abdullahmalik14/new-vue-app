/* Version: 2026-01-30T00:00:00.000Z */
DebugLogger.log(
  "chartsCalculator.js",
  "version",
  "INFO",
  { version: "2026-01-30T00:00:00.000Z" },
  { flags: ["IMPORTANT"] },
);

window.ChartsCalculator = (function () {
    "use strict";

  const DEFAULT_URL = "chartsData.bundle.json";
  const VALID_PERIODS = ["daily", "weekly", "monthly", "yearly", "alltime"];
  const ALLOWED_BUNDLE_URL_PATTERN = /^[\w\-./]+\.json$/;
  const DEBUG_TABLE = false;
  let bundlePromise = null;
  let ready = false;
  let readyDetail = null;
  let readyDispatched = false;

  function dispatchReady(detail) {
    if (readyDispatched) {
      return;
    }
    readyDispatched = true;
    if (typeof window !== "undefined" && window?.dispatchEvent) {
      window.dispatchEvent(
        new CustomEvent("ChartsCalculator:ready", {
          detail,
        }),
      );
    }
  }

  function init(bundleUrl = DEFAULT_URL) {
    if (!ALLOWED_BUNDLE_URL_PATTERN.test(bundleUrl)) {
      throw new Error(`ChartsCalculator: invalid bundleUrl "${bundleUrl}"`);
    }
    if (bundlePromise) {
      return bundlePromise;
    }
    bundlePromise = fetch(bundleUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `ChartsCalculator failed to load ${bundleUrl} (status ${response.status})`,
          );
        }
        return response.json();
      })
      .then((json) => {
        ready = true;
        readyDetail = {
          bundleUrl,
          readyAt: new Date().toISOString(),
        };
        dispatchReady(readyDetail);
        return json;
      })
      .catch((error) => {
        bundlePromise = null;
        readyDispatched = false;
        ready = false;
        DebugLogger.error(
          "chartsCalculator.js",
          "init",
          "ERROR",
          {
            bundleUrl,
            message: error?.message,
            stack: error?.stack,
          },
          { flags: ["DEBUG_CALCULATION"] },
        );
        throw error;
      });
    return bundlePromise;
  }

  function toSafeNumber(val) {
    if (val == null) return 0;
    if (typeof val === "number") return isFinite(val) ? val : 0;
    const cleaned = String(val).replace(/[^0-9.\-]/g, "");
    const n = parseFloat(cleaned);
    return isFinite(n) ? n : 0;
  }

  function normalizeRow(row) {
    const normalized = {
      month: row?.month ?? "",
      subscription: toSafeNumber(row?.subscription),
      paytoview: toSafeNumber(row?.paytoview),
      merch: toSafeNumber(row?.merch),
      wishtender: toSafeNumber(row?.wishtender),
      customrequest: toSafeNumber(row?.customrequest),
      total: toSafeNumber(row?.total),
    };
    normalized.totalNumeric = normalized.total;
    return normalized;
  }

  function dispatchTotals(detail) {
    if (typeof window !== "undefined" && window?.dispatchEvent) {
      window.dispatchEvent(
        new CustomEvent("analytics:totals-updated", {
          detail,
        }),
      );
    }
  }

  async function computeTotals(period, options = {}) {
    const periodLower = (period && String(period).toLowerCase()) || "";
    if (!VALID_PERIODS.includes(periodLower)) {
      throw new Error(`ChartsCalculator: unknown period "${period}"`);
    }
    const reason = options.reason || `Totals computed for ${period}`;
    const bundleUrl = options.bundleUrl || DEFAULT_URL;
    const datasetKey = options.datasetKey || "earnings";
    let bundle;
    try {
      bundle = await init(bundleUrl);
    } catch (error) {
      DebugLogger.warn(
        "chartsCalculator.js",
        "computeTotals",
        "WARN",
        {
          bundleUrl,
          message: error?.message,
          stack: error?.stack,
        },
        { flags: ["DEBUG_CALCULATION"] },
      );
      const failDetail = { period: periodLower, total: 0, rows: [], reason, fetchFailed: true };
      dispatchTotals(failDetail);
      return failDetail;
    }

    let rawRows;
    if (periodLower === "alltime") {
      rawRows = (bundle?.[datasetKey]?.yearly || []).slice();
    } else {
      rawRows = (bundle?.[datasetKey]?.[periodLower] || []).slice();
    }
    const rows = rawRows.map(normalizeRow);
    const total = rows.reduce((sum, row) => sum + row.totalNumeric, 0);

    DebugLogger.log(
      "chartsCalculator.js",
      "computeTotals",
      "INFO",
      {
        datasetKey,
        period,
        reason,
        total,
        rowCount: rows.length,
      },
      { flags: ["CRITICAL", "DEBUG_CALCULATION"] },
    );
    if (DEBUG_TABLE) {
      DebugLogger.table(
        "chartsCalculator.js",
        "computeTotals",
        "DEBUG_CALCULATION",
        rows,
        { flags: ["CRITICAL", "DEBUG_CALCULATION"] },
      );
    }

    const detail = {
      period: periodLower,
      total,
      rows,
      reason,
      fetchFailed: false,
    };
    dispatchTotals(detail);
    return detail;
  }

  return {
    init,
    computeTotals,
    isReady() {
      return ready;
    },
    getReadyDetail() {
      return readyDetail;
    },
  };
})();
