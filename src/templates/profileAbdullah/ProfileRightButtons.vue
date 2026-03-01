<script setup>
import { ref } from 'vue';
import ProfileCallPopup from './popups/ProfileCallPopup.vue';
import TipPopup from './popups/TipPopup.vue';

const isCallPopupOpen = ref(false);
const isTipPopupOpen = ref(false);
</script>

<template>
  <div
    class="flex flex-col gap-4 absolute top-0 right-2 z-[999] mt-32 sm:mt-[4.09375rem] md:top-[10.313rem] md:right-4 xl:right-12">
    <div class="relative flex flex-col gap-2 lg:gap-4">
      <div
      @click="isTipPopupOpen = true"
       class="flex items-end relative w-12 sm:w-15 md:w-[5.34375rem] cursor-pointer">
        <!--group animate-slidefromleft hover:animate-slidefromright-->
        <img data-src="/images/token.webp" alt="tip-token" class="lazyload w-12 sm:w-15 md:w-[5.25rem]" />
      </div>

      <div class="flex items-end relative w-12 sm:w-15 md:w-[5.34375rem] cursor-pointer"
        @click="isCallPopupOpen = true">
        <!--group animate-slidefromleft hover:animate-slidefromright-->
        <img data-src="/images/call.webp" alt="call" class="lazyload w-12 sm:w-15 md:w-[5.25rem]" />
        <img data-src="/images/online-dot.webp" alt="online-dot"
          class="lazyload absolute top-1 right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 md:hidden" />
      </div>

      <div class="flex items-end relative w-12 sm:w-15 md:w-[5.34375rem] cursor-pointer">
        <!--group animate-slidefromleft hover:animate-slidefromright-->
        <img data-src="/images/message.webp" alt="message" class="lazyload w-12 sm:w-15 md:w-[5.25rem]" />
        <img data-src="/images/online-dot.webp" alt="online-dot"
          class="lazyload absolute top-1 right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 md:hidden" />
      </div>
    </div>
  </div>

  <ProfileCallPopup v-model="isCallPopupOpen" />
  <TipPopup v-model="isTipPopupOpen" />
  
</template>