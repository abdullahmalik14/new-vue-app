<template>
  <li class="relative aspect-video [box-shadow:0_0_10px_-34px_rgba(0,0,0,0.10)] group">
    
    <a
      class="block transition-all duration-150 ease-in-out absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible shadow-[0_0_10px_-34px_rgba(0,0,0,0.10)] w-full h-full bg-no-repeat bg-center bg-cover group-hover:delay-[150ms] group-hover:z-[2] xl:group-hover:w-[26.25rem] xl:group-hover:h-[21.875rem] xl:group-hover:shrink-0 xl:group-hover:rounded-[0.313rem] xl:group-hover:shadow-[0_0_0.625rem_-2.125rem_rgba(0,0,0,0.10)] outline-none"
      @mouseenter="playVideo"
      @mouseleave="pauseVideo"
    >
      <div v-if="media.type === 'gallery'" class="absolute w-full h-full z-[10011]">
        <div class="flex relative w-full h-full justify-end items-end">
          <div 
            class="w-1/2 h-full flex justify-center items-center bg-center bg-cover bg-no-repeat"
            :style="{ backgroundImage: `url(${media.poster})` }"
          ></div>
          <div class="absolute right-0 top-0 w-1/2 h-full flex flex-col justify-center items-center bg-black/50 backdrop-blur-sm">
            <span class="text-xl leading-6 md:text-3xl md:leading-9 text-center text-[#EAECF0]">{{ media.galleryCount }}+</span>
            <span class="text-sm leading-normal md:text-lg md:leading-normal text-center text-[#EAECF0]">images</span>
          </div>
        </div>
      </div>

      <div class="w-full h-full block bg-cover bg-center bg-no-repeat overflow-hidden relative z-[10010] after:content-[''] after:absolute after:inset-0 after:w-full after:h-full after:rounded-none after:bg-[linear-gradient(180deg,rgba(0,0,0,0.6)_-24.72%,rgba(0,0,0,0)_41.92%,rgba(0,0,0,0.6)_108.57%)] after:z-[10010]">
        <div class="w-full h-full flex justify-center items-center">
          <video
            v-if="media.type === 'video'"
            ref="videoRef"
            muted
            class="object-cover w-full h-full"
            :src="media.videoUrl"
          ></video>
          <img 
            v-else
            :src="media.poster"
            alt="bg"
            class="w-full h-full object-cover"
          />
        </div>
      </div>

      <div class="flex justify-between items-center w-full absolute left-0 pl-1 top-1 z-[99999]">
        <div class="flex justify-center items-center gap-[0.188rem] px-1 py-0.5 rounded bg-[rgba(24,34,48,0.50)] drop-shadow-[0_0_20px_rgba(0,0,0,0.25)]">
          <img :src="mediaIcon" class="w-4 h-4" />
          <span v-if="media.type === 'video'" class="text-xs text-white leading-normal tracking-[0.008rem]">{{ media.duration }}</span>
        </div>

        <div class="flex items-center gap-2 px-[0.625rem] drop-shadow-[0_0_20px_rgba(0,0,0,0.25)]">
          <span class="flex justify-center items-center gap-1 filter drop-shadow-[0_0_.313rem_#000]">
            <span class="text-xs leading-none whitespace-nowrap text-white tracking-[0.01875rem]">{{ media.timeAgo }}</span>
          </span>
          <div class="flex items-center gap-[0.813rem] px-1 opacity-70">
            <span class="flex justify-center items-center gap-[0.188rem] filter drop-shadow-[0_0_.313rem_#000]">
              <img src="https://i.ibb.co.com/7tbwzFsQ/heart.webp" class="w-[0.75rem] brightness-100 saturate-0" />
              <span class="text-xs leading-normal font-medium text-white tracking-[0.008rem]">{{ media.likes }}</span>
            </span>
            <span class="flex justify-center items-center gap-[0.1875rem] filter drop-shadow-[0_0_.313rem_#000]">
              <img src="https://i.ibb.co.com/Kjv16vLZ/eye.webp" class="w-[0.75rem] brightness-100 saturate-0" />
              <span class="text-xs leading-normal font-medium text-white tracking-[0.0075rem]">{{ media.views }}</span>
            </span>
          </div>
        </div>
      </div>

      <div v-if="media.showTag" class="flex xl:group-hover:hidden absolute left-0 bottom-0 z-[99999]">
        <span 
          class="flex justify-center items-center px-[0.625rem] gap-1 py-1"
          :class="tagClasses"
        >
          <span class="text-white text-xs leading-[.875rem]">{{ media.tagText }}</span>
        </span>
      </div>

      <div class="hidden group-hover:xl:flex [will-change:transform] [transform:translateZ(0)] [backface-visibility:hidden] [perspective:1000px] opacity-0 xl:group-hover:opacity-100 transition-opacity duration-150 ease-in-out overflow-hidden p-2 z-[10100] gap-[0.875rem] absolute inset-0 w-full h-full flex-col justify-end items-start">
        
        <div v-if="media.isLocked" class="flex justify-center items-center w-full h-full absolute left-0 top-0">
          <img src="https://i.ibb.co.com/5WgkFsdY/locked-icon.webp" alt="locked-icon" class="w-[8.125rem] h-[8.125rem]" />
        </div>

        <span 
          v-if="media.showTag"
          class="flex justify-center items-center px-[0.625rem] gap-1 py-1 transition-opacity duration-150 ease-in-out"
          :class="tagClasses"
        >
          <span class="text-white text-xs leading-[.875rem]">{{ media.tagText }}</span>
        </span>

        <span class="text-sm line-clamp-1 text-white [text-shadow:0px_0px_4px_rgba(0,0,0,0.5)] line-clamp-2 transition-opacity duration-150 ease-in-out">
          {{ media.title }}
        </span>
      </div>

    </a>
  </li>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  media: {
    type: Object,
    required: true
  }
});

const videoRef = ref(null);

const playVideo = () => {
  if (props.media.type === 'video' && videoRef.value) {
    videoRef.value.play().catch(e => console.log('Autoplay blocked', e));
  }
};

const pauseVideo = () => {
  if (props.media.type === 'video' && videoRef.value) {
    videoRef.value.pause();
    videoRef.value.currentTime = 0;
  }
};

const mediaIcon = computed(() => {
  if (props.media.type === 'video') return 'https://i.ibb.co.com/wN978Hjm/video.webp';
  return 'https://i.ibb.co.com/tP25fy0Z/image-icon.png';
});

// Dynamic class for Pink vs Green tag
const tagClasses = computed(() => {
  if (props.media.tagColor === 'pink') {
    return 'bg-[#fb0464]';
  }
  // Default green
  return 'bg-[#07f468]';
});
</script>