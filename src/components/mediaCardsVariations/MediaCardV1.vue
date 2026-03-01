<template>
  <div :class="[
    'flex flex-col relative',
    variant === 'latest' ? 'bg-[#f2f2f2] rounded w-[17.5rem] sm:w-[19.3rem] p-0' : 'w-full gap-2',
    variant === 'grid' ? 'hover:overflow-visible hover:z-[9999]' : '',
    { 'group': true }
  ]">

    <div class="video-container cursor-pointer w-full transition-all duration-300 ease-out" :class="[
      variant === 'latest' ? 'relative aspect-video rounded-t max-h-[9.9rem] sm:max-h-[unset] overflow-hidden' : '',
      variant === 'resume' ? 'relative aspect-video w-[25.75rem] overflow-hidden' : '',
      variant === 'purchased' || variant === 'default' ? 'relative aspect-video overflow-hidden' : '',
      variant === 'grid' ? 'relative aspect-video overflow-visible xl:group-hover:scale-125 xl:group-hover:z-[9999] xl:group-hover:shadow-xl after:content-[\'\'] after:absolute after:inset-0 after:w-full after:h-full after:rounded-none after:bg-[linear-gradient(180deg,rgba(0,0,0,0.6)_-24.72%,rgba(0,0,0,0)_41.92%,rgba(0,0,0,0.6)_108.57%)] after:z-[-1]' : ''
    ]" @mouseenter="playVideo" @mouseleave="pauseVideo">
      <div v-if="variant === 'latest'"
        class="absolute inset-0 w-full h-full pointer-events-none z-[1] bg-[linear-gradient(180deg,rgba(0,0,0,0.01)_-100%,rgba(0,0,0,0)_67.92%,rgba(0,0,0,0.02)_75.57%)]">
      </div>
      <div v-else-if="variant === 'resume' || variant === 'purchased'"
        class="absolute inset-0 w-full h-full pointer-events-none z-[1] bg-[linear-gradient(180deg,rgba(0,0,0,0.6)_-24.72%,rgba(0,0,0,0)_41.92%,rgba(0,0,0,0.6)_108.57%)]">
      </div>

      <div v-if="variant === 'grid' && media.type === 'gallery'" class="absolute w-full h-full z-[2]">
        <div class="flex relative w-full h-full justify-end items-end">
          <div class="w-1/2 h-full flex flex-col justify-center items-center bg-black/50 backdrop-blur-sm">
            <span class="text-xl leading-6 md:text-3xl md:leading-9 text-center text-[#EAECF0]">7+</span>
            <span class="text-sm leading-normal md:text-lg md:leading-normal text-center text-[#EAECF0]">images</span>
          </div>
        </div>
      </div>

      <div class="w-full h-full bg-cover bg-center bg-no-repeat relative">
        <div class="w-full h-full flex justify-center items-center">

          <video v-if="media.type === 'video' || !media.type" ref="videoRef" :poster="media.poster"
            class="object-cover w-full h-full" muted loop playsinline>
            <source :src="media.videoUrl" type="video/mp4">
          </video>

          <img v-else :src="media.poster || media.videoUrl" alt="sample-bg-image" class="w-full h-full object-cover" />
        </div>
      </div>

      <div class="flex justify-between items-center w-full absolute left-0 top-0 p-1"
        :class="variant === 'grid' ? 'z-[10000]' : 'z-[20]'">
        <div v-if="variant === 'grid'" class="px-1 py-[0.0625rem] rounded bg-[rgba(24,34,48,0.50)]">
          <span class="flex items-center gap-1">
            <span class="pb-[0.0625rem]">
              <img :src="mediaTypeIcon" alt="icon" class="w-4 h-4" />
            </span>
            <span v-if="media.type === 'video'" class="text-xs text-white leading-normal tracking-[0.0075rem]">{{
              media.duration }}</span>
          </span>
        </div>

        <div v-else
          class="flex justify-center items-center gap-[0.188rem] px-1 py-0.5 rounded bg-[rgba(24,34,48,0.50)] drop-shadow-[0_0_20px_rgba(0,0,0,0.25)]">
          <img src="https://i.ibb.co.com/wN978Hjm/video.webp" alt="video" class="w-4 h-4" />
          <span class="text-xs text-white leading-[1rem] tracking-[0.008rem]">{{ media.duration }}</span>
        </div>

        <div class="flex items-center gap-[0.813rem] px-1 opacity-70"
          :class="variant !== 'grid' ? 'drop-shadow-[0_0_20px_rgba(0,0,0,0.25)]' : ''">
          <span class="flex justify-center items-center gap-[0.1875rem] filter drop-shadow-[0_0_.313rem_#000]">
            <span class="text-xs leading-normal font-medium text-white tracking-[0.0075rem]">{{ media.timeAgo }}</span>
          </span>

          <span class="flex justify-center items-center gap-[0.1875rem] filter drop-shadow-[0_0_.313rem_#000]">
            <img src="https://i.ibb.co.com/7tbwzFsQ/heart.webp" alt="heart"
              class="w-[0.75rem] brightness-100 saturate-0" />
            <span class="text-xs leading-normal font-medium text-white tracking-[0.0075rem]">{{ media.likes }}</span>
          </span>

          <span class="flex justify-center items-center gap-[0.1875rem] filter drop-shadow-[0_0_.313rem_#000]">
            <img src="https://i.ibb.co.com/Kjv16vLZ/eye.webp" alt="eye" class="w-[0.75rem] brightness-100 saturate-0" />
            <span class="text-xs leading-normal font-medium text-white tracking-[0.0075rem]">{{ media.views }}</span>
          </span>
        </div>
      </div>

      <div v-if="variant === 'default'" class="flex absolute left-0 bottom-0 z-[20]">
        <span class="flex justify-center items-center p-1 gap-2 backdrop-blur-[10px] bg-[#07f468]">
          <img src="https://i.ibb.co.com/bMFQRqBP/upload.webp" alt="upload" class="w-4 h-4" />
        </span>
        <span
          class="text-[#07f468] text-xs font-medium leading-[1.125rem] flex justify-center items-center gap-2 px-[.375rem] py-[0.188rem] bg-black">Published</span>
      </div>

      <template v-if="variant === 'resume' || variant === 'purchased'">
        <div class="flex justify-center items-center absolute top-0 left-0 w-full h-full overflow-hidden z-[10]">
          <div class="flex justify-center items-center bg-black/10 rounded-full backdrop-blur-[5px] w-20 h-20">
            <img src="https://i.ibb.co.com/BVS7xsrK/video-icon.webp" alt="play"
              class="w-9 h-9 opacity-60 filter brightness-0 saturate-100 invert-[68%] sepia-[3%] hue-rotate-[317deg] contrast-[101%]" />
          </div>
        </div>
        <div class="absolute bottom-0 right-0 z-[20]">
          <img src="https://i.ibb.co.com/3m62Qzvz/site-logo.webp"
            class="flex w-16 h-16 pointer-events-none filter brightness-0 saturate-100 invert-[100%] sepia-[11%] hue-rotate-[341deg] contrast-[95%]" />
        </div>
        <div v-if="variant === 'resume'" class="absolute bottom-0 left-0 z-[20]">
          <div
            class="flex justify-center items-center gap-[0.188rem] px-[0.625rem] py-0.5 bg-[#ff4848] drop-shadow-[0_0_20px_rgba(0,0,0,0.25)]">
            <img src="https://i.ibb.co.com/BVS7xsrK/video-icon.webp"
              class="w-3 h-3 [filter:brightness(100)_saturate(0)]" />
            <span class="text-sm text-white leading-normal tracking-[0.008rem]">Resume</span>
          </div>
        </div>
      </template>

      <template v-if="variant === 'latest'">
        <div
          class="flex flex-col justify-end absolute bottom-0 left-0 w-full h-max overflow-hidden z-[20] gap-2 [background:linear-gradient(180deg,rgba(255,255,255,0)_50%,rgba(0,0,0,.80)_100%)]">
          <div class="flex flex-col gap-2 p-2">
            <h3 class="text-base text-[#edeff3] font-medium line-clamp-1">{{ media.title }}</h3>
            <div class="flex items-center gap-1">
              <div class="flex items-center relative w-5 h-5">
                <span class="flex justify-center items-center rounded-full relative w-5 h-5 overflow-hidden opacity-80">
                  <img :src="media.avatar" class="w-full h-full object-cover" />
                </span>
              </div>
              <span class="text-xs leading-normal text-[#edeff3]">{{ media.creatorName }}</span>
            </div>
          </div>
        </div>
      </template>

      <template v-if="variant === 'grid'">
        <div class="flex group-hover:hidden absolute left-0 bottom-0 z-[10000]">
          <!-- Buy Label -->
          <span v-if="buyLabel"
            class="flex justify-center items-center px-2.5 py-1 gap-1 backdrop-filter backdrop-blur-[20px]"
            :style="{ backgroundColor: buyBgColor }">
            <span class="text-white text-xs font-medium leading-[.875rem]">{{ buyLabel }}</span>
          </span>
          <!-- Action Label -->
          <span class="flex justify-center items-center px-[0.4rem] gap-1 backdrop-filter backdrop-blur-[20px]"
            :style="{ backgroundColor: actionBgColor }">
            <span class="text-black text-[0.58rem] font-medium leading-[.875rem]">{{ actionLabel }}</span>
          </span>
        </div>

        <div class="hidden group-hover:flex flex-col items-start gap-3 absolute left-0 bottom-0 z-[10000] pb-2 pl-2">
          <div class="flex items-center">
            <!-- Buy Label -->
            <span v-if="buyLabel"
              class="flex justify-center items-center px-2.5 py-1 gap-1 backdrop-filter backdrop-blur-[20px]"
              :style="{ backgroundColor: buyBgColor }">
              <span class="text-white text-xs   backdrop-blur-[10px] font-medium leading-[.875rem]">{{ buyLabel
                }}</span>
            </span>
            <!-- Action Label -->
            <span class="flex justify-center items-center px-[0.4rem] gap-1 backdrop-filter backdrop-blur-[20px]"
              :style="{ backgroundColor: actionBgColor }">
              <span class="text-black text-[0.58rem] font-medium leading-[.875rem]">{{ actionLabel }}</span>
            </span>
          </div>
          <span class="text-[0.58rem] font-medium flex-grow line-clamp-1 text-white">{{ media.title }}</span>
        </div>

        <div class="absolute bottom-0 right-0 z-[10000]">
          <img src="https://i.ibb.co.com/3m62Qzvz/site-logo.webp"
            class="flex w-16 h-16 pointer-events-none [filter:brightness(0)_saturate(100%)_invert(100%)_sepia(11%)_saturate(3489%)_hue-rotate(341deg)_brightness(93%)_contrast(95%)]" />
        </div>
      </template>

    </div>

    <div v-if="variant === 'default' || variant === 'purchased'" class="flex flex-col gap-1 w-full">
      <div class="flex items-start gap-1">
        <span class="text-sm font-medium flex-grow line-clamp-2" :style="{ color: titleColor }"
          :class="variant === 'default' ? 'h-10' : 'line-clamp-1'">
          {{ media.title }}
        </span>
        <div class="relative cursor-pointer" ref="dropdownRef">
          <div class="media-select cursor-pointer rounded-[0.5rem] border-none" @click.stop="toggleDropdown">
            <div class="dash-select__trigger">
              <span
                class="cursor-pointer w-6 h-6 rounded-[0.313rem] flex justify-center items-center hover:bg-[rgba(41,112,255,0.2)]">
                <img src="https://i.ibb.co.com/bgGv5xSL/3-dots.webp" class="w-4 h-4" />
              </span>
            </div>
            <transition enter-active-class="transition-all duration-200 ease-out origin-top"
              enter-from-class="scale-95 opacity-0 h-0" enter-to-class="scale-100 opacity-100 h-auto"
              leave-active-class="transition-all duration-200 ease-out origin-top"
              leave-from-class="scale-100 opacity-100 h-auto" leave-to-class="scale-95 opacity-0 h-0">
              <div v-if="isDropdownOpen"
                class="dash-options-container w-full absolute z-[30] right-[8px] w-max overflow-hidden shadow-lg rounded-[0.625rem]"
                :class="dropdownPositionClass">
                <div
                  class="border border-[rgba(186,188,203,0.5)] rounded-[0.625rem] bg-white overflow-hidden py-1 md:py-0">
                  <div v-for="(option, index) in menuOptions" :key="index"
                    class="option flex items-center justify-center gap-[0.5rem] hover:bg-[#f2f4f7] h-[4.25rem] md:h-max px-[0.625rem] md:px-2 py-[0.625rem]"
                    :class="{ 'border-t border-[#dee5ec]': option.divider }"
                    @click.stop="handleOptionClick(option.value)">
                    <div class="option-inner-container flex items-center flex-1 gap-6 md:gap-[0.75rem]">
                      <img :src="option.icon" class="w-4 h-4" :class="[
                        { 'md:w-6 md:h-6': variant === 'default' },
                        option.value === 'profile' ? 'rounded-full' : ''
                      ]" />
                      <div class="flex items-center justify-between md:justify-start gap-[0.625rem] w-full">
                        <span class="font-medium capitalize text-balance"
                          :class="[option.danger ? 'text-[#ff4405]' : 'text-[#0c111d]', variant === 'purchased' ? 'text-[0.875rem]' : 'text-base']">
                          {{ option.label }}
                        </span>
                        <img v-if="option.hasArrow" src="https://i.ibb.co.com/4bwSScz/svgviewer-png-output-51.webp"
                          class="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
      <div v-if="variant === 'purchased'" class="flex items-end gap-1 flex-grow">
        <div class="flex justify-center items-center gap-2 py-1">
          <div class="w-6 h-6 overflow-hidden rounded-full">
            <img :src="media.avatar" alt="avatar" class="w-full h-full object-cover" />
          </div>
          <div class="flex flex-col">
            <a class="flex items-center gap-1 outline-none">
              <span class="text-xs leading-normal font-medium truncate text-[#667085]">{{ media.creatorName }}</span>
              <img src="https://i.ibb.co.com/nMhY8CpS/svgviewer-png-output-22.webp" class="h-[0.625rem]" />
            </a>
            <div class="flex items-start gap-3 flex-grow">
              <div class="flex items-center gap-1">
                <img src="https://i.ibb.co.com/Kjv16vLZ/eye.webp" alt="eye" class="w-[0.875rem]" />
                <span class="text-xs leading-normal text-[#667085]">{{ media.views }}</span>
              </div>
              <div class="flex items-center gap-1 cursor-pointer">
                <img src="https://i.ibb.co.com/7tbwzFsQ/heart.webp" alt="heart" class="w-[0.875rem]" />
                <span class="text-xs leading-normal text-[#667085]">{{ media.likes }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="variant === 'grid' && showFooter" class="h-20 flex flex-col gap-1 w-full">
      <div class="flex items-start gap-1">
        <span class="text-sm font-medium flex-grow line-clamp-2" :style="{ color: titleColor }">
          {{ media.title }}
        </span>
        <div class="relative cursor-pointer" ref="dropdownRef">
          <div class="media-select cursor-pointer rounded-[0.5rem] border-none" @click.stop="toggleDropdown">
            <div class="dash-select__trigger">
              <span class="cursor-pointer w-6 h-6 flex justify-center items-center">
                <img src="https://i.ibb.co.com/9khFy274/three-dots-vertical.webp" class="w-full h-full" />
              </span>
            </div>
            <transition enter-active-class="transition-all duration-200 ease-out origin-top"
              enter-from-class="scale-95 opacity-0 h-0" enter-to-class="scale-100 opacity-100 h-auto"
              leave-active-class="transition-all duration-200 ease-out origin-top"
              leave-from-class="scale-100 opacity-100 h-auto" leave-to-class="scale-95 opacity-0 h-0">
              <div v-if="isDropdownOpen"
                class="dash-options-container absolute left-auto right-0 top-[calc(100%+0.5rem)] z-[9999] w-max overflow-hidden shadow-lg rounded-[0.625rem]"
                :class="dropdownPositionClass">
                <div class="border border-[hsla(233,14%,76%,1)] rounded-[0.625rem] bg-white overflow-hidden">
                  <div v-for="(option, index) in menuOptions" :key="index"
                    class="option flex items-center justify-center gap-[0.5rem] hover:bg-[#f2f4f7] h-[4.25rem] md:h-max px-[0.625rem] md:px-2 py-[0.625rem]"
                    :class="{ 'border-t border-[#dee5ec]': option.divider }"
                    @click.stop="handleOptionClick(option.value)">
                    <div class="option-inner-container flex items-center flex-1 gap-[0.5rem]">
                      <img :src="option.icon" class="w-4 h-4 object-cover"
                        :class="option.value === 'profile' ? 'rounded-full' : ''" />
                      <span class="text-[0.875rem] leading-[1.5rem] text-[#0c111d] capitalize text-balance">
                        {{ option.label }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <div class="flex items-end gap-1 flex-grow">
        <div class="flex justify-center items-center gap-2 py-1">
          <div class="w-6 h-6 overflow-hidden rounded-full">
            <img :src="media.avatar" alt="avatar" class="w-full h-full object-cover" />
          </div>
          <div class="flex flex-col">
            <a class="flex items-center gap-1">
              <span class="text-xs leading-normal font-medium truncate text-[#fff]">{{ media.creatorName }}</span>
              <img src="https://i.ibb.co.com/nMhY8CpS/svgviewer-png-output-22.webp" class="h-[0.625rem]" />
            </a>
            <div class="flex items-start gap-3 flex-grow">
              <div class="flex items-center gap-1">
                <img src="https://i.ibb.co.com/Kjv16vLZ/eye.webp" alt="eye" class="w-[0.875rem]" />
                <span class="text-xs leading-normal text-[#fff]">{{ media.views }}</span>
              </div>
              <div class="flex items-center gap-1">
                <img src="https://i.ibb.co.com/7tbwzFsQ/heart.webp" alt="heart" class="w-[0.875rem]" />
                <span class="text-xs leading-normal text-[#fff]">{{ media.likes }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  media: {
    type: Object,
    required: true
  },
  // Variants: 'default', 'resume', 'latest', 'purchased', 'grid'
  variant: {
    type: String,
    default: 'default'
  },
  // ✅ NEW PROPS: Dynamic styling
  titleColor: {
    type: String,
    default: '#0c111d' // Default dark color
  },
  actionLabel: {
    type: String,
    default: 'Subscribe or Buy'
  },
  actionBgColor: {
    type: String,
    default: '#fb0464'
  },
  // ✅ NEW PROPS: Secondary Action (e.g., Buy Now)
  buyLabel: {
    type: String,
    default: null
  },
  buyBgColor: {
    type: String,
    default: '#ffffff'
  },
  showFooter: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['menu-action']);

// --- Video Control Logic ---
const videoRef = ref(null);

const playVideo = () => {
  // Only play if it's a video type
  if (videoRef.value && (props.media.type === 'video' || !props.media.type)) {
    videoRef.value.play();
  }
};

const pauseVideo = () => {
  if (videoRef.value && (props.media.type === 'video' || !props.media.type)) {
    videoRef.value.pause();
    videoRef.value.currentTime = 0;
  }
};

// --- Icon Logic for Grid Variant ---
const mediaTypeIcon = computed(() => {
  if (props.media.type === 'video' || !props.media.type) return 'https://i.ibb.co.com/wN978Hjm/video.webp';
  return 'https://i.ibb.co.com/tP25fy0Z/image-icon.png';
});

// --- Dropdown Logic ---
const isDropdownOpen = ref(false);
const dropdownRef = ref(null);
const dropdownPositionClass = ref(""); // Default positioning logic within components

const toggleDropdown = () => {
  if (!isDropdownOpen.value) {
    if (dropdownRef.value) {
      // Simplified spacing check
      const rect = dropdownRef.value.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // You can add 'bottom-[calc(100%+0.5rem)]' logic here if needed
    }
    isDropdownOpen.value = true;
  } else {
    isDropdownOpen.value = false;
  }
};

const closeDropdown = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isDropdownOpen.value = false;
  }
};

const handleOptionClick = (action) => {
  emit('menu-action', action);
  isDropdownOpen.value = false;
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdown);
});

// Options based on variant
const menuOptions = computed(() => {
  if (props.variant === 'purchased' || props.variant === 'grid') {
    return [
      { label: "Go to Creator's Profile", value: 'profile', icon: 'https://i.ibb.co.com/jk1F8MqJ/featured-media-bg.webp' },
      { label: 'Share', value: 'share', icon: 'https://i.ibb.co.com/XrnHtvx2/share.webp' },
      { label: 'Report', value: 'report', icon: 'https://i.ibb.co.com/1G7k3mG5/report.webp' },
    ];
  }
  // Default Creator Options
  return [
    { label: 'Edit Details', value: 'edit', icon: 'https://i.ibb.co.com/wZgQbKp9/svgviewer-png-output-49.webp' },
    { label: 'Add To Subscription Tier', value: 'subscription-tier', icon: 'https://i.ibb.co.com/Z1cw0ZpJ/svgviewer-png-output-50.webp', hasArrow: true },
    { label: 'Unpublish', value: 'unpublish', icon: 'https://i.ibb.co.com/k2GVhBwd/svgviewer-png-output-52.webp' },
    { label: 'Delete Media', value: 'delete', icon: 'https://i.ibb.co.com/wH3Wh66/svgviewer-png-output-53.webp', danger: true, divider: true },
  ];
});
</script>