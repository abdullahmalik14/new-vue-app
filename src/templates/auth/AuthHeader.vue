<template>
  <!-- Translation icon & Logo header -->
  <div class="flex justify-between items-start w-full">
    <!-- Translation dropdown -->
    <div class="flex flex-col w-1/2 gap-8 sm:gap-6">
      <img class="w-8 h-8 opacity-70" :src="globeIcon || FALLBACK_GLOBE_ICON" alt="globe" />
    </div>

    <!-- Logo -->
    <a href="/">
      <img :src="logoUrl || FALLBACK_LOGO" class="w-16 h-16" alt="logo" />
    </a>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAssetUrl } from '@/utils/assets/assetLibrary';

const globeIcon = ref('');
const logoUrl = ref('');

// Fallback URLs in case asset library doesn't find them
const FALLBACK_GLOBE_ICON = 'https://i.ibb.co.com/mF9x2JG0/svgviewer-png-output-85.webp';
const FALLBACK_LOGO = 'https://i.ibb.co/jZQNHC2t/svgviewer-png-output-4.webp';

onMounted(async () => {
  try {
    const globe = await getAssetUrl('icon.globe');
    globeIcon.value = globe || FALLBACK_GLOBE_ICON;

    const logo = await getAssetUrl('logo.main');
    logoUrl.value = logo || FALLBACK_LOGO;

    // Debug logging
    if (!globe) {
      console.warn('[AuthHeader] icon.globe not found in asset map, using fallback');
    }
    if (!logo) {
      console.warn('[AuthHeader] logo.main not found in asset map, using fallback');
    }
  } catch (error) {
    console.error('[AuthHeader] Error loading assets:', error);
    // Use fallbacks on error
    globeIcon.value = FALLBACK_GLOBE_ICON;
    logoUrl.value = FALLBACK_LOGO;
  }
});
</script>
