<template>
  <PopupHandler
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    :config="avatarPopupConfig"
  >
        <div class="flex flex-col backdrop-blur-[50px] bg-white/70 dark:bg-background-dark-app  md:rounded-[0.3125rem] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] h-full">
          
          <div class="flex justify-between items-center p-4">
            <h1 class="text-xl leading-normal font-semibold opacity-70 text-[#344054] dark:text-text">
              Choose Avatar
            </h1>
            <img
              @click="emit('update:modelValue', false)"
              src="https://i.ibb.co.com/zWwvfc1B/close-btn.webp"
              alt="close-btn"
              class="w-6 h-6 cursor-pointer hover:opacity-80 dark:[filter:brightness(0)_invert(100%)]"
            />
          </div>

          <div class="flex justify-center items-center w-full h-[14.375rem] sm:mt-[-1.1rem]">
            <div 
              class="w-[12.1875rem] aspect-square rounded-full relative transition-colors duration-300"
              :style="{ backgroundColor: currentBgColor }"
            >
              <img
                :src="currentAvatarSrc"
                alt="selected-avatar"
                class="w-full h-full object-cover rounded-full"
              />
              <button class="absolute bottom-0 right-0 w-12 h-12 flex justify-center items-center rounded-full bg-[#07F468] group/button hover:bg-black">
                <img
                  src="https://i.ibb.co.com/LzBLyfyn/upload-01.webp"
                  class="w-8 h-8 group-hover/button:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(43%)_saturate(4479%)_hue-rotate(92deg)_brightness(109%)_contrast(95%)]"
                />
              </button>
            </div>
          </div>

          <div class="flex flex-col gap-6 pt-1 pb-6 md:gap-4 md:py-6 xl:px-4 xl:gap-6">
            
            <div class="flex flex-col gap-2 md:py-2 xl:px-4">
              <h3 class="text-base font-medium px-4 text-[#0C111D] dark:text-text xl:px-0">Avatar</h3>
              <div class="w-full flex overflow-x-scroll [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none]">
                <div class="flex justify-center items-center gap-2 w-max md:flex-col xl:w-full">
                  
                  <AvatarSelector 
                    :avatars="avatarListRow1" 
                    v-model="selectedAvatarId" 
                  />

                  <AvatarSelector 
                    :avatars="avatarListRow2" 
                    v-model="selectedAvatarId" 
                  />

                </div>
              </div>
            </div>

            <div class="flex flex-col gap-2 md:py-2">
              <h3 class="text-base font-medium px-4 text-[#0C111D] dark:text-text">Background</h3>
              
              <BackgroundSelector 
                :backgrounds="backgroundList"
                v-model="selectedBgId"
              />

            </div>
          </div>

          <div class="flex justify-between items-center gap-4 p-4">
            <button @click="emit('update:modelValue', false)" class="w-full h-10 flex justify-center items-center px-2 py-1 cursor-pointer">
              <span class="text-lg font-medium text-[#0C111D] dark:text-text">CANCEL</span>
            </button>
            <button class="w-full h-10 flex justify-center items-center bg-black dark:bg-background-dark-app px-2 py-1 group/button cursor-pointer hover:bg-[#07F468] dark:hover:bg-[#07F468]">
              <span class="text-lg font-medium text-[#07F468] group-hover/button:text-black">SAVE</span>
            </button>
          </div>

        </div>
  </PopupHandler>
</template>

<script setup>
import { ref, computed } from "vue";
import PopupHandler from "./PopupHandler.vue";
import AvatarSelector from "@/components/AvatarSelector.vue";        
import BackgroundSelector from "@/components/BackgroundSelector.vue"; 

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue"]);

// --- Data ---
const selectedAvatarId = ref(1);
const selectedBgId = ref(106);

// --- Row 1 Data ---
const avatarListRow1 = [
  { id: 1, src: "https://i.ibb.co.com/kVD0Tgpx/avatar-1.webp", alt: "avatar-1" },
  { id: 2, src: "https://i.ibb.co.com/yFPYB4Xy/avatar-2.webp", alt: "avatar-2" },
  { id: 3, src: "https://i.ibb.co.com/Gfjkz91c/avatar-3.webp", alt: "avatar-3" },
  { id: 4, src: "https://i.ibb.co.com/4Zc67ChD/avatar-4.webp", alt: "avatar-4" },
  { id: 5, src: "https://i.ibb.co.com/TD734VQ0/avatar-5.webp", alt: "avatar-5" },
  { id: 6, src: "https://i.ibb.co.com/kVD0Tgpx/avatar-1.webp", alt: "avatar-1" },
  { id: 7, src: "https://i.ibb.co.com/yFPYB4Xy/avatar-2.webp", alt: "avatar-2" },
  { id: 8, src: "https://i.ibb.co.com/Gfjkz91c/avatar-3.webp", alt: "avatar-3" },
  { id: 9, src: "https://i.ibb.co.com/4Zc67ChD/avatar-4.webp", alt: "avatar-4" },
  { id: 10, src: "https://i.ibb.co.com/TD734VQ0/avatar-5.webp", alt: "avatar-5" },
];

// --- Row 2 Data ---
const avatarListRow2 = [
 { id: 11, src: "https://i.ibb.co.com/kVD0Tgpx/avatar-1.webp", alt: "avatar-11" },
  { id: 12, src: "https://i.ibb.co.com/yFPYB4Xy/avatar-2.webp", alt: "avatar-12" },
  { id: 13, src: "https://i.ibb.co.com/Gfjkz91c/avatar-3.webp", alt: "avatar-13" },
  { id: 14, src: "https://i.ibb.co.com/4Zc67ChD/avatar-4.webp", alt: "avatar-14" },
  { id: 15, src: "https://i.ibb.co.com/TD734VQ0/avatar-5.webp", alt: "avatar-15" },
  { id: 16, src: "https://i.ibb.co.com/kVD0Tgpx/avatar-1.webp", alt: "avatar-16" },
  { id: 17, src: "https://i.ibb.co.com/yFPYB4Xy/avatar-2.webp", alt: "avatar-17" },
  { id: 18, src: "https://i.ibb.co.com/Gfjkz91c/avatar-3.webp", alt: "avatar-18" },
  { id: 19, src: "https://i.ibb.co.com/4Zc67ChD/avatar-4.webp", alt: "avatar-19" },
  { id: 20, src: "https://i.ibb.co.com/TD734VQ0/avatar-5.webp", alt: "avatar-20" },
];

const backgroundList = [
  { id: 101, color: "#F72485" },
  { id: 102, color: "#680EEB" },
  { id: 103, color: "#3A0BA3" },
  { id: 104, color: "#4361EE" },
  { id: 105, color: "#55AACF" },
  { id: 106, color: "#55CFCD" },
  { id: 107, color: "#4CC9F0" },
  { id: 108, color: "#8569FA" },
  { id: 109, color: "#AE4AEF" },
  { id: 110, color: "#FF76DD" },
  { id: 111, color: "#89FAD3" },
  { id: 112, color: "#78F0F5" },
];

// --- Preview Logic ---
const allAvatars = [...avatarListRow1, ...avatarListRow2];

const currentAvatarSrc = computed(() => {
  const found = allAvatars.find(a => a.id === selectedAvatarId.value);
  return found ? found.src : allAvatars[0].src;
});

const currentBgColor = computed(() => {
  const found = backgroundList.find(b => b.id === selectedBgId.value);
  return found ? found.color : '#FFFFFF';
});

// Config
const avatarPopupConfig = {
  actionType: "popup",
  position: "center",
  customEffect: "scale", 
  offset: "0px",
  speed: "250ms",
  effect: "ease-in-out",
  showOverlay: false,
  closeOnOutside: true,
  lockScroll: false,
  escToClose: true,
  width: { default: "90%", "<768": "100%" },
  height: { default: "90%", "<768": "100%" },
  scrollable: true,
  closeSpeed: "250ms",
  closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
};
</script>