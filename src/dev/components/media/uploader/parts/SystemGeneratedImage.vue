<script setup>
import { computed } from "vue";
import { useMediaUploaderAssets } from "@/dev/composables/useMediaUploaderAssets.js";

const { assets } = useMediaUploaderAssets();

const backgroundStyle = computed(() => ({
  backgroundImage: assets.value.slideImage ? `url('${assets.value.slideImage}')` : undefined,
}));
</script>

<template>
  <div class="relative w-full">
    <div class="flex overflow-hidden">
      <input
        type="checkbox"
        class="relative appearance-none w-3 h-3 border border-[#999] rounded-[2px] hidden"
      />
      <div
        class="aspect-[16/9] w-full bg-no-repeat bg-center bg-cover"
        :style="backgroundStyle"
      ></div>
    </div>

    <div
      class="absolute bottom-[-1px] left-[-2px] rounded-bl-sm cursor-pointer z-20 transition-all active:scale-95"
    >
      <img
        :src="assets.videoIcon"
        alt="video"
        class="w-5 h-5"
      />
    </div>
  </div>
</template>
