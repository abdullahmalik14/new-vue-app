<template>
  <div class="w-full flex flex-row flex-wrap items-start justify-start gap-6 rounded-2xl">
    <div class="flex w-full flex-col md:flex-row flex-wrap justify-end rounded-3xl gap-2 md:gap-0">
      
      <div class="flex w-full items-start justify-start overflow-hidden md:w-1/2">
        <div class="relative w-full rounded overflow-hidden bg-gray-100">
          <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
            <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>

          <img 
            :src="currentThumbnailUrl" 
            alt="selected"
            class="w-full aspect-[16/9] object-cover rounded transition-all duration-300"
            :class="isLoading ? 'opacity-0' : 'opacity-100'" 
            :style="imageBlurStyle"
            loading="eager" 
            decoding="async" 
            fetchpriority="high"
            @load="isLoading = false" 
          />
        </div>
      </div>

      <div class="flex w-full flex-col justify-between md:w-1/2 gap-4 md:pl-2">
        <div class="flex w-full flex-col gap-6">
          <ThumbnailSelector 
            :thumbnails="thumbnails" 
            :selectedIndex="currentIndex"
            @update:selectedIndex="onThumbnailSelect" 
          />
        </div>
        
        <div class="flex items-center gap-2">
          <CheckboxSwitch 
            :label="t('mediaUploader.thumbnail.blurToggle')" 
            showWrapperLabel 
            id="blur-thumbnail-toggle" 
            v-model="blurModel" 
          />

          <div :class="{ 'opacity-50 pointer-events-none': !blurModel }">
             <BlurEffect v-model="blurLevelModel" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import CheckboxSwitch from '@/components/forms/checkboxes/CheckboxSwitch.vue';
import ThumbnailSelector from "./ThumbnailSelector.vue";
import BlurEffect from './BlurEffect.vue';
import { useMediaUploaderStore } from "@/stores/useMediaUploaderStore";
import { useMediaUploaderAssets } from "@/dev/composables/useMediaUploaderAssets.js";

const { t } = useI18n();
const uploaderStore = useMediaUploaderStore();
const { assets } = useMediaUploaderAssets();

const thumbnails = computed(() => {
  const { slideImage, thumbA, thumbB } = assets.value;
  return [
    slideImage,
    thumbA,
    thumbB,
    thumbA,
    thumbB,
    thumbA,
    thumbB,
    thumbA,
    thumbB,
    thumbB,
    thumbB,
    thumbB,
  ].filter(Boolean);
});

const isLoading = ref(false);

// ===========================================
// STATE CONNECTIONS
// ===========================================

const currentThumbnailUrl = computed(() => {
  return uploaderStore.form.thumbnailUrl || thumbnails.value[0] || '';
});

const currentIndex = computed(() => {
  const idx = thumbnails.value.indexOf(currentThumbnailUrl.value);
  return idx === -1 ? 0 : idx;
});

// 1. Blur ON/OFF Toggle
const blurModel = computed({
  get: () => uploaderStore.form.blurThumbnail || false,
  set: (val) => {
    uploaderStore.updateFormField("blurThumbnail", val);
  }
});

// 2. Blur Level (e.g., 'low', 'medium', 'high')
const blurLevelModel = computed({
  get: () => uploaderStore.form.blurThumbnailLevel || 'low', // Default fallback
  set: (val) => {
    uploaderStore.updateFormField("blurThumbnailLevel", val);
  }
});

// ===========================================
// VISUAL LOGIC (CSS Filter)
// ===========================================

// 3. Final Style Calculation
const imageBlurStyle = computed(() => {
  // Agar Checkbox OFF hai, toh blur mat lagao
  if (!blurModel.value) {
    return {};
  }
  
  // Map labels to pixel values
  const blurMap = {
    '20px': '8px',
    '50px': '20px',
    '100px': '40px'
  };
  
  const blurValue = blurMap[blurLevelModel.value] || '8px';

  return {
    filter: `blur(${blurValue})`,
    '-webkit-filter': `blur(${blurValue})` // Safari support
  };
});

// ===========================================
// REST OF THE LOGIC
// ===========================================

const onThumbnailSelect = (index) => {
  const selectedUrl = thumbnails.value[index];
  if (!preloadedImages.value.has(selectedUrl)) {
    isLoading.value = true;
  }
  uploaderStore.updateFormField("thumbnailUrl", selectedUrl);
};

const preloadedImages = ref(new Set());
const preloadImages = () => {
  thumbnails.value.forEach((src) => {
    if (!preloadedImages.value.has(src)) {
      const img = new Image();
      img.src = src;
      img.onload = () => { preloadedImages.value.add(src); };
    }
  });
};

watch(currentThumbnailUrl, () => {
  if (preloadedImages.value.has(currentThumbnailUrl.value)) {
    isLoading.value = false;
  }
});

onMounted(() => {
  if (!uploaderStore.form.thumbnailUrl && thumbnails.value[0]) {
    uploaderStore.updateFormField("thumbnailUrl", thumbnails.value[0]);
  }
  
  // Ensure default blur level is set if missing
  if (!uploaderStore.form.blurThumbnailLevel) {
    uploaderStore.updateFormField("blurThumbnailLevel", '20px');
  }

  // Preload immediately without delay
  preloadImages();
});
</script>