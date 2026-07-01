<template>
  <div class="lazy-sizes-demo min-h-screen bg-slate-50 text-slate-900 font-sans">
    <header class="lazy-sizes-demo__intro mx-auto max-w-3xl px-6 py-12">
      <h1 class="text-3xl md:text-4xl font-bold tracking-tight">
        {{ t('demo.lazySizes.pageTitle') }}
      </h1>
      <p class="mt-4 text-slate-600 leading-relaxed">
        {{ t('demo.lazySizes.intro') }}
      </p>
      <p class="mt-3 text-sm text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3">
        {{ t('demo.lazySizes.networkHint') }}
      </p>
    </header>

    <div class="lazy-sizes-demo__spacer">
      <span>{{ t('demo.lazySizes.scrollHint') }}</span>
    </div>

    <div class="lazy-sizes-demo__spacer">
      <span>{{ t('demo.lazySizes.spacer') }}</span>
    </div>

    <section class="mx-auto max-w-3xl px-6 pb-8 flex flex-col gap-10">
      <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-xl font-semibold">{{ t('demo.lazySizes.lazyImageTitle') }}</h2>
        <p class="mt-2 text-sm text-slate-500">{{ t('demo.lazySizes.lazyImageDescription') }}</p>
        <LazyImage
          v-if="posterUrl"
          :src="posterUrl"
          :alt="t('demo.lazySizes.lazyImageAlt')"
          root-class="mt-4 h-64 rounded-xl ring-2 ring-indigo-200 ring-offset-2"
        />
        <p class="mt-2 text-xs font-medium text-indigo-600">{{ t('demo.lazySizes.contentImageLabel') }}</p>
        <p class="mt-3 text-xs font-mono text-slate-400">assetMap: lazyImageDemo.poster (local /images)</p>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-xl font-semibold">{{ t('demo.lazySizes.lazyBackgroundTitle') }}</h2>
        <p class="mt-2 text-sm text-slate-500">{{ t('demo.lazySizes.lazyBackgroundDescription') }}</p>
        <LazyBackground
          v-if="sampleBgUrl"
          :src="sampleBgUrl"
          root-class="mt-4 h-72 rounded-xl border border-slate-100 shadow-lg"
        >
          <span class="mb-2 inline-flex w-max rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
            {{ t('demo.lazySizes.backgroundBadge') }}
          </span>
          <h3 class="text-2xl font-bold leading-tight drop-shadow-sm">
            {{ t('demo.lazySizes.backgroundOverlayTitle') }}
          </h3>
          <p class="mt-2 max-w-md text-sm text-white/90 drop-shadow-sm">
            {{ t('demo.lazySizes.backgroundOverlaySubtitle') }}
          </p>
          <span class="mt-4 inline-flex w-max rounded-lg bg-[#07f468] px-4 py-2 text-sm font-semibold text-black">
            {{ t('demo.lazySizes.backgroundCta') }}
          </span>
        </LazyBackground>
        <p class="mt-3 text-xs font-mono text-slate-400">assetMap: lazyImageDemo.sampleBg (local /images)</p>
      </article>
    </section>

    <footer class="mx-auto max-w-3xl px-6 py-12 text-center text-sm text-slate-500">
      {{ t('demo.lazySizes.footer') }}
    </footer>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import LazyImage from '@/dev/lazyimagedemo/LazyImage.vue';
import LazyBackground from '@/dev/lazyimagedemo/LazyBackground.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { t } = useI18n();
const { url: posterUrl } = useAssetUrl('lazyImageDemo.poster');
const { url: sampleBgUrl } = useAssetUrl('lazyImageDemo.sampleBg');
</script>

<style scoped>
.lazy-sizes-demo__spacer {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  margin: 0 1.5rem;
  border: 2px dashed #cbd5e1;
  border-radius: 1rem;
  color: #64748b;
  font-size: 0.875rem;
  text-align: center;
  padding: 2rem;
}

.lazy-sizes-demo__intro code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.85em;
  background: #f1f5f9;
  padding: 0.1rem 0.35rem;
  border-radius: 0.25rem;
}
</style>
