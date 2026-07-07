<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useMediaUploaderAssets } from "@/dev/composables/useMediaUploaderAssets.js";

const props = defineProps({
  src: { type: String, required: true },
  type: { type: String, default: "image" },
  label: { type: String, default: "" },
});

const emit = defineEmits(["preview-delete"]);
const { t } = useI18n();
const { assets } = useMediaUploaderAssets();

const displayLabel = computed(() => props.label || t("mediaUploader.thumbnail.label"));

function isVideo(url) {
  if (!url) return false;
  return url.startsWith('blob:') || url.toLowerCase().includes('video') ||
         ['.mp4', '.mov', '.avi', '.webm'].some(ext => url.toLowerCase().includes(ext));
}
</script>

<template>
  <div class="relative w-full h-60 rounded-sm overflow-hidden bg-gray-200 group border border-border-light shadow-sm">
    <div class="w-full h-full">
      <video
        v-if="type === 'video'"
        :src="src"
        class="w-full h-full object-cover"
        autoplay
        loop
        muted
        playsinline
      ></video>
      <img
        v-else
        :src="src"
        class="w-full h-full object-cover"
      />
    </div>

    <button
      @click="emit('preview-delete')"
      class="absolute top-0 right-0 w-6 h-6 flex items-center justify-center bg-error hover:bg-error-light transition-all z-10"
    >
      <img :src="assets.deleteIcon" alt="delete" class="w-5 h-5" />
    </button>

    <div class="absolute bottom-2 left-2 z-10">
      <div v-if="type === 'video'" class="w-6 h-6 bg-black rounded-sm flex items-center justify-center">
         <div class="w-0 h-0 border-t-[4px] border-t-transparent border-l-[7px] border-l-[#07f468] border-b-[4px] border-b-transparent ml-0.5"></div>
      </div>
      <div v-else class="w-6 h-6 flex items-center justify-center">
         <img :src="assets.expandIcon" alt="expand" class="w-5 h-5" />
      </div>
    </div>

    <div class="absolute bottom-0 right-0 bg-black text-white text-[10px] font-bold py-1 px-3 z-10">
      {{ displayLabel }}
    </div>
  </div>
</template>

<style scoped>
/* Optional styling if needed */
</style>
