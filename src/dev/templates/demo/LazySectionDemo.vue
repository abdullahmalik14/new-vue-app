<template>
  <div class="lazy-demo-page">
    <header class="lazy-demo-page__intro">
      <h1>Lazy Section Loading — live demo</h1>
      <p>
        Open DevTools → <strong>Elements</strong> (and optionally
        <strong>Network</strong>), then scroll down slowly. Each section below is
        wrapped in <code>&lt;LazySection&gt;</code>. While off-screen only an empty
        placeholder div exists; as you approach it, the real HTML is created into
        the inspector and its JS chunk is fetched in Network.
      </p>
      <p class="lazy-demo-page__hint">
        Tip: in the Elements panel, watch the
        <code>&lt;div class="lazy-section"&gt;</code> wrappers — the placeholder
        swaps to the real <code>[data-lazy-block]</code> markup on scroll.
      </p>
    </header>

    <div class="lazy-demo-page__spacer">
      <span>Scroll down ↓ (spacer — nothing lazy here)</span>
    </div>

    <div class="lazy-demo-page__slot">
      <LazySection
        :loader="() => import('@/dev/templates/demo/lazy-sections/LazyAlphaSection.vue')"
        root-margin="0px 0px"
      >
        <template #placeholder>
          <div data-lazy-placeholder="alpha" class="lazy-demo-page__placeholder">
            Section A — NOT loaded yet. Scroll here and watch this placeholder turn into real HTML.
          </div>
        </template>
      </LazySection>
    </div>

    <div class="lazy-demo-page__spacer">
      <span>Spacer</span>
    </div>

    <div class="lazy-demo-page__slot">
      <LazySection
        :loader="() => import('@/dev/templates/demo/lazy-sections/LazyBetaSection.vue')"
        root-margin="0px 0px"
      >
        <template #placeholder>
          <div data-lazy-placeholder="beta" class="lazy-demo-page__placeholder">
            Section B — NOT loaded yet. Scroll here and watch this placeholder turn into real HTML.
          </div>
        </template>
      </LazySection>
    </div>

    <div class="lazy-demo-page__spacer">
      <span>Spacer</span>
    </div>

    <div class="lazy-demo-page__spacer">
      <span>Keep scrolling — footer loads near the bottom ↓</span>
    </div>

    <div class="lazy-demo-page__slot">
      <LazySection
        :loader="() => import('@/dev/templates/demo/lazy-sections/LazyGammaSection.vue')"
        root-margin="0px 0px"
      >
        <template #placeholder>
          <div data-lazy-placeholder="gamma" class="lazy-demo-page__placeholder">
            Section C (footer) — NOT loaded yet. Scroll here and watch this placeholder turn into real HTML.
          </div>
        </template>
      </LazySection>
    </div>

    <footer class="lazy-demo-page__end">
      End of demo.
    </footer>
  </div>
</template>

<script setup>
import LazySection from '@/components/lazy/LazySection.vue';
</script>

<style scoped>
.lazy-demo-page {
  min-height: 100vh;
  background: #0b1020;
  color: #e5e7eb;
  padding: 32px 16px 96px;
  font-family: system-ui, sans-serif;
}
.lazy-demo-page__intro {
  max-width: 760px;
  margin: 0 auto 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.lazy-demo-page__intro h1 {
  font-size: 30px;
  font-weight: 800;
}
.lazy-demo-page__intro p {
  font-size: 15px;
  line-height: 1.6;
  opacity: 0.9;
}
.lazy-demo-page__hint {
  font-size: 13px;
  opacity: 0.7;
}
.lazy-demo-page code {
  background: rgba(255, 255, 255, 0.1);
  padding: 1px 6px;
  border-radius: 6px;
  font-size: 0.9em;
}
.lazy-demo-page__spacer {
  max-width: 760px;
  margin: 0 auto;
  height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.45);
  font-size: 14px;
}
.lazy-demo-page__slot {
  max-width: 760px;
  margin: 0 auto;
}
.lazy-demo-page__placeholder {
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
  border: 2px dashed rgba(248, 113, 113, 0.6);
  border-radius: 16px;
  background: rgba(248, 113, 113, 0.08);
  color: #fca5a5;
  font-size: 15px;
  font-weight: 600;
}
.lazy-demo-page__end {
  max-width: 760px;
  margin: 24px auto 0;
  text-align: center;
  opacity: 0.5;
  font-size: 14px;
}
</style>
