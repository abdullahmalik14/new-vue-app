<template>
  <div class="flex flex-col gap-2 w-full">
    <div
      class="w-full relative aspect-video after:content-[''] 
      after:absolute after:inset-0 after:w-full after:h-full after:rounded-none 
      after:bg-[linear-gradient(180deg,rgba(0,0,0,0.6)_-24.72%,rgba(0,0,0,0)_41.92%,rgba(0,0,0,0.6)_108.57%)] cursor-pointer"
    >
      <div
        class="w-full h-full bg-cover bg-center bg-no-repeat aspect-video overflow-hidden relative"
      >
        <div class="w-full h-full flex justify-center items-center">
          <video
            class="object-cover w-full h-full"
            :src="videoSrc"
            muted
            playsinline
          ></video>
        </div>
      </div>

      <div
        class="flex justify-between items-center w-full absolute left-1 top-1 z-[99999]"
      >
        <div
          class="flex justify-center items-center gap-[0.188rem] px-1 py-0.5 rounded bg-[rgba(24,34,48,0.50)] dark:bg-[rgba(31,44,63,0.50)] drop-shadow-[0_0_20px_rgba(0,0,0,0.25)]"
        >
          <img
            src="https://i.ibb.co.com/wN978Hjm/video.webp"
            alt="video"
            class="w-4 h-4"
          />
          <span
            class="text-xs text-white leading-normal tracking-[0.008rem]  dark:text-[#e8e6e3]"
            >{{ duration }}</span
          >
        </div>

        <div
          class="flex items-center gap-[0.813rem] px-1 drop-shadow-[0_0_20px_rgba(0,0,0,0.25)] opacity-70"
        >
          <div class="flex items-center gap-[0.813rem] px-1">
            <span
              class="flex justify-center items-center gap-[0.188rem] filter drop-shadow-[0_0_.313rem_#000]"
            >
              <img
                src="https://i.ibb.co.com/7tbwzFsQ/heart.webp"
                alt="heart"
                class="w-[0.75rem] [filter:brightness(100)_saturate(0)]"
              />
              <span
                class="text-xs leading-normal font-medium text-white tracking-[0.008rem]"
                >{{ likes }}</span
              >
            </span>
            <span
              class="flex justify-center items-center gap-[0.1875rem] filter drop-shadow-[0_0_.313rem_#000]"
            >
              <img
                src="https://i.ibb.co.com/Kjv16vLZ/eye.webp"
                alt="eye"
                class="w-[0.75rem] [filter:brightness(100)_saturate(0)]"
              />
              <span
                class="text-xs leading-normal font-medium text-white tracking-[0.0075rem] dark:text-[#e8e6e3]"
                >{{ views }}</span
              >
            </span>
          </div>
        </div>
      </div>

      <div
        v-if="discount"
        class="flex justify-center items-center absolute left-0 bottom-0 z-[99999] bg-[#F093FB] h-[1.064rem] px-[0.4rem]"
      >
        <span
          class="text-[0.58rem] leading-normal font-medium text-black dark:text-text"
          >{{ discount }}</span
        >
      </div>

      <div class="absolute bottom-0 right-0 z-[10000]">
        <img
          src="https://i.ibb.co.com/3m62Qzvz/site-logo.webp"
          alt="site-logo"
          class="flex w-16 h-16 pointer-events-none [filter:brightness(0)_saturate(100%)_invert(100%)_sepia(11%)_saturate(3489%)_hue-rotate(341deg)_brightness(93%)_contrast(95%)]"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  videoSrc: {
    type: String,
    default: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  },
  duration: {
    type: String,
    default: "14:55:09"
  },
  likes: {
    type: [String, Number],
    default: 0
  },
  views: {
    type: [String, Number],
    default: 0
  },
  discount: {
    type: String,
    default: "10% OFF"
  }
});
</script>