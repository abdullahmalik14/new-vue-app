<template>
  <div class="flex flex-row flex-wrap items-start justify-start gap-6 rounded-2xl" style="max-width: 53.9125rem">
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
            label="Blur thumbnail" 
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
import CheckboxSwitch from "@/components/dev/checkbox/CheckboxSwitch.vue";
import ThumbnailSelector from "./ThumbnailSelector.vue";
import BlurEffect from './BlurEffect.vue';

const props = defineProps({
  uploader: {
    type: Object,
    required: true,
  }
});

const thumbnails = [
  "/images/slide-2.webp",
  "/images/thumb1.jpg",
  "/images/thumb2.jpg",
  "/images/thumb3.jpg",
  "/images/thumb4.jpg",
  "/images/thumb2.jpg",
  "/images/thumb6.jpg",
  "/images/thumb7.jpg",
  "/images/thumb3.jpg",
];

const isLoading = ref(false);

// ===========================================
// STATE CONNECTIONS
// ===========================================

const currentThumbnailUrl = computed(() => {
  return props.uploader.state.thumbnailUrl || thumbnails[0];
});

const currentIndex = computed(() => {
  const idx = thumbnails.indexOf(currentThumbnailUrl.value);
  return idx === -1 ? 0 : idx;
});

// 1. Blur ON/OFF Toggle
const blurModel = computed({
  get: () => props.uploader.state.blurThumbnail || false,
  set: (val) => {
    props.uploader.setState("blurThumbnail", val, { reason: "user:toggleBlur" });
  }
});

// 2. Blur Level (e.g., '20px')
const blurLevelModel = computed({
  get: () => props.uploader.state.blurThumbnailLevel || '20px', // Default fallback
  set: (val) => {
    props.uploader.setState("blurThumbnailLevel", val, { reason: "user:setBlurLevel" });
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
  
  // Agar ON hai, toh selected pixel value use karo
  return {
    filter: `blur(${blurLevelModel.value})`,
    '-webkit-filter': `blur(${blurLevelModel.value})` // Safari support
  };
});

// ===========================================
// REST OF THE LOGIC
// ===========================================

const onThumbnailSelect = (index) => {
  const selectedUrl = thumbnails[index];
  if (!preloadedImages.value.has(selectedUrl)) {
    isLoading.value = true;
  }
  props.uploader.setState("thumbnailUrl", selectedUrl, { reason: "user:selectThumbnail" });
};

const preloadedImages = ref(new Set());
const preloadImages = () => {
  thumbnails.forEach((src) => {
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
  if (!props.uploader.state.thumbnailUrl) {
    props.uploader.setState("thumbnailUrl", thumbnails[0], { reason: "init:default" });
  }
  
  // Ensure default blur level is set if missing
  if (!props.uploader.state.blurThumbnailLevel) {
     props.uploader.setState("blurThumbnailLevel", '20px', { reason: "init:blurDefault" });
  }

  setTimeout(() => {
    preloadImages();
  }, 100);
});
</script>