import { fail, ok } from "@/services/flow-system/flowTypes.js";
import { useDashboardAnalyticsStore } from "@/stores/useDashboardAnalyticsStore.js";

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
    source === "empty"
      ? "/api/charts/456?nocache=1"
      : "/api/charts/456?nocache=1";

  console.log(
    `[Polling] ⏰ Fetching latest analytics data from ${bundleFile}...`,
  );
// await new Promise((resolve) => setTimeout(resolve, 1500));
  try {
    const response = await fetch(bundleFile, {
      signal: context.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      try {
        useDashboardAnalyticsStore().bundleLoaded = true;
      } catch (e) {}
      return fail({
        code: "FETCH_ANALYTICS_FAILED",
        message: `Failed to fetch analytics bundle (${response.status})`,
      });
    }

    const data = await response.json();
    
    // Test empty subscriptions
    // data.subscriptions = {};
    
    // MOCK: Simulating API returning 0 data
    // data = {
    //   subscriptions: [],
    //   earnings: [],
    //   recentOrders: [],
    //   fans: [],
    //   fanInsights: [],
    //   likes: [],
    //   trendingMedia: [],
    //   trendingMerch: [],
    //   trendingTags: [],
    //   countries: [],
    //   trendingCountries: [],
    //   contributors: [],
    // };
    data.dataSource = source;

    console.log(`[Polling] ✅ Successfully fetched new analytics data.`);

    return ok(data, {
      flow: "analytics.fetch",
      status: response.status,
      fetchedAt: Date.now(),
    });
  } catch (error) {
    try {
      useDashboardAnalyticsStore().bundleLoaded = true;
    } catch (e) {}
    return fail({
      code: "FETCH_ANALYTICS_UNEXPECTED",
      message: "An unexpected error occurred while fetching analytics.",
      details: error.message,
    });
  }
}
