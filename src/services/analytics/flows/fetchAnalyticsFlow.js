import { fail, ok } from "@/services/flow-system/flowTypes.js";

/**
 * Flow to fetch the analytics data bundle.
 * Simple 5-minute polling without ETag.
 *
 * @param {Object} params
 * @param {Object} params.payload - Input parameters (source)
 * @param {Object} params.context - Pipeline context
 */
export async function fetchAnalyticsFlow({ payload, context }) {
  const source = payload?.source || "full";
  const bundleFile =
    source === "empty" ? "/chartsData.empty.json" : "/api/charts/456?nocache=1";

  console.log(`[Polling] ⏰ Fetching latest analytics data from ${bundleFile}...`);

  try {
    const response = await fetch(bundleFile, {
      signal: context.signal,
      cache: 'no-store'
    });

    if (!response.ok) {
      return fail({
        code: "FETCH_ANALYTICS_FAILED",
        message: `Failed to fetch analytics bundle (${response.status})`,
      });
    }

    const data = await response.json();
    data.dataSource = source;
    
    console.log(`[Polling] ✅ Successfully fetched new analytics data.`);

    return ok(data, {
      flow: "analytics.fetch",
      status: response.status,
      fetchedAt: Date.now(),
    });
  } catch (error) {
    return fail({
      code: "FETCH_ANALYTICS_UNEXPECTED",
      message: "An unexpected error occurred while fetching analytics.",
      details: error.message,
    });
  }
}
