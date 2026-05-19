import { fail, ok } from "@/services/flow-system/flowTypes.js";

/**
 * Flow to fetch the analytics data bundle.
 * Implements ETag support for efficient polling if the server provides it.
 * 
 * @param {Object} params
 * @param {Object} params.payload - Input parameters (source)
 * @param {Object} params.context - Pipeline context
 */
export async function fetchAnalyticsFlow({ payload, context }) {
  const source = payload?.source || 'full';
  const bundleFile = source === 'empty' ? '/chartsData.empty.json' : '/chartsData.bundle.json';

  console.log(`[ETag Debug] ⏰ Fetching analytics data (Checking ETag)...`);

  try {
    const headers = { ...context.requestHeaders };
    
    const response = await fetch(bundleFile, {
      headers,
      signal: context.signal,
      cache: 'no-cache', // Force browser to revalidate ETag
    });

    if (!response.ok && response.status !== 304) {
      return fail({
        code: "FETCH_ANALYTICS_FAILED",
        message: `Failed to fetch analytics bundle (${response.status})`,
      });
    }

    const etag = response.headers.get("etag") || null;
    if (etag) {
      console.log(`[ETag Debug] Server provided ETag: ${etag}`);
    }
    
    // If we're using raw fetch, a 304 will usually just transparently return the cached 200 response by the browser.
    // However, if we sent If-None-Match manually and the server responds 304, fetch() exposes it.
    const notModified = response.status === 304;

    if (notModified) {
      console.log(`[ETag Debug] 🟢 ETag matched! Server returned 304 Not Modified. Bypassing payload download.`);
    } else {
      console.log(`[ETag Debug] 🟡 ETag did not match (or first fetch). Downloading new payload...`);
    }

    let data = null;
    if (!notModified) {
      data = await response.json();
      data.etag = etag; // Embed etag in the payload for pinia action
      data.dataSource = source;
    }

    return ok(
      data,
      {
        flow: "analytics.fetch",
        status: response.status,
        etag: etag,
        notModified: notModified,
        fetchedAt: Date.now(),
      }
    );
  } catch (error) {
    return fail({
      code: "FETCH_ANALYTICS_UNEXPECTED",
      message: "An unexpected error occurred while fetching analytics.",
      details: error.message,
    });
  }
}
