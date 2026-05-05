/**
 * mockMediaBackend.js
 * 
 * Intercepts media-related API calls (simulating S3/Cloudflare uploads)
 * and multi-step uploader submissions.
 */

export const initMockMediaApi = () => {
  const originalFetch = window.fetch;

  window.fetch = async (url, options = {}) => {
    const urlStr = url.toString();

    // Only intercept media endpoints
    if (!urlStr.includes("/media/")) return originalFetch(url, options);

    const method = options.method || "GET";

    console.group(
      `%c🎥 [MockMediaAPI] ${method} ${urlStr}`,
      "color: #8b5cf6; font-weight: bold;"
    );

    if (method === "POST" && urlStr.includes("/upload")) {
      // Simulate payload processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockUrl = `https://s3.mock-storage.com/media/temp_${Math.random().toString(36).substring(7)}.mp4`;
      
      console.log("Simulating file upload... Done.");
      console.log("Mock S3 URL:", mockUrl);
      console.groupEnd();

      return new Response(
        JSON.stringify({
          ok: true,
          data: {
            url: mockUrl,
            mediaId: `vid_${Date.now()}`,
            size: 1024 * 1024 * 50, // 50MB
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (method === "POST" && urlStr.includes("/submit")) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log("Processing multi-step uploader submission...");
        console.groupEnd();

        return new Response(
            JSON.stringify({
                ok: true,
                message: "Media successfully queued for processing.",
                id: `media_${Date.now()}`
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    }

    console.groupEnd();
    return originalFetch(url, options);
  };
};
