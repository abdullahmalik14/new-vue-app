<script setup>
import { ref, computed } from "vue";
import CheckboxGroup from '@/components/forms/checkboxes/CheckboxGroup.vue';
import { useMediaUploaderStore } from "@/stores/useMediaUploaderStore";
import { useMediaUploaderAssets } from "@/dev/composables/useMediaUploaderAssets.js";

const uploaderStore = useMediaUploaderStore();
const { assets } = useMediaUploaderAssets();
const videoRef = ref(null);
const isPlaying = ref(false);
const trailerChecked = ref(false);

const previewUrl = computed(() => {
  return uploaderStore.form.previewTrailerUrl || assets.value.slideImage;
});

const isMaybeVideo = computed(() => {
  const file = uploaderStore.form.uploadedTrailerFile;
  const url = uploaderStore.form.previewTrailerUrl;

  if (file && file.type && file.type.startsWith('video/')) return true;

  if (typeof url === 'string') {
    return url.match(/\.(mp4|webm|ogg|mov)$/i);
  }

  return false;
});

const backgroundStyle = computed(() => {
  if (isMaybeVideo.value) return {};
  return {
    backgroundImage: `url('${previewUrl.value}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
});

function togglePlay() {
  if (!videoRef.value) return;
  if (videoRef.value.paused) {
    videoRef.value.play();
  } else {
    videoRef.value.pause();
  }
}

function removeTrailer() {
  uploaderStore.updateFormField("previewTrailerUrl", null);
  uploaderStore.updateFormField("uploadedTrailerFile", null);
  isPlaying.value = false;

  if (uploaderStore.form.mediaUrl === uploaderStore.form.previewTrailerUrl) {
    uploaderStore.updateFormField("mediaUrl", null);
    uploaderStore.updateFormField("mediaFile", null);
  }
}
</script>

<template>
  <div class="relative w-full">
    <div class="flex overflow-hidden rounded-lg border border-gray-200 bg-black cursor-pointer group/video" @click="togglePlay">
      <CheckboxGroup
        v-model="trailerChecked"
        checkbox-class="relative appearance-none w-3 h-3 border border-[#999] rounded-[2px]"
        label-class="hidden"
        wrapper-class="hidden !mb-0"
      />

      <video
        ref="videoRef"
        v-if="isMaybeVideo"
        :key="previewUrl"
        :src="previewUrl"
        class="aspect-[16/9] w-full object-cover"
        autoplay
        loop
        muted
        playsinline
        @play="isPlaying = true"
        @pause="isPlaying = false"
      ></video>

      <div
        v-else
        class="aspect-[16/9] w-full bg-no-repeat bg-center bg-cover"
        :style="backgroundStyle"
      ></div>
    </div>

    <span
      class="absolute top-[1px] right-[1px] cursor-pointer  transition-all z-20"
      @click.stop="removeTrailer"
    >
      <img :src="assets.deleteIcon" alt="delete" class="w-4 h-4 rounded-tr-sm" />
    </span>

    <span
      class="absolute bottom-[1px] left-[-2px] rounded-bl-sm cursor-pointer z-20 transition-all active:scale-95"
      @click.stop="togglePlay"
    >
      <img
        :src="assets.videoIcon"
        alt="play"
        class="w-6 h-6"
      />
    </span>
  </div>
</template>
