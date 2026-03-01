export function preloadIcons(urls) {
  urls.forEach(url => {
    const img = new Image();
    img.src = url;
     img.onload = () => console.log("🔥 Preloaded:", url);
    img.onerror = () => console.warn("❌ Failed to preload:", url);
  });
}