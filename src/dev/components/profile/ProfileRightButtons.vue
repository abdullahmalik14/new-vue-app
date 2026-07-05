<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import ProfileCallPopup from '@/dev/components/ui/popups/profile/ProfileCallPopup.vue';
import TipPopup from '@/dev/components/ui/popups/profile/TipPopup.vue';

const { t } = useI18n();
const { url: tokenUrl } = useAssetUrl('profile.icon.token');
const { url: callUrl } = useAssetUrl('profile.icon.call');
const { url: onlineDotUrl } = useAssetUrl('profile.icon.onlineDot');
const { url: messageUrl } = useAssetUrl('profile.icon.message');

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
        <img :src="tokenUrl" :alt="t('profile.alt.token')" class="w-12 sm:w-15 md:w-[5.25rem]" />
      </div>

      <div class="flex items-end relative w-12 sm:w-15 md:w-[5.34375rem] cursor-pointer"
        @click="isCallPopupOpen = true">
        <!--group animate-slidefromleft hover:animate-slidefromright-->
        <img :src="callUrl" :alt="t('profile.alt.call')" class="w-12 sm:w-15 md:w-[5.25rem]" />
        <img :src="onlineDotUrl" :alt="t('profile.alt.onlineDot')"
          class="absolute top-1 right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 md:hidden" />
      </div>

      <div class="flex items-end relative w-12 sm:w-15 md:w-[5.34375rem] cursor-pointer">
        <!--group animate-slidefromleft hover:animate-slidefromright-->
        <img :src="messageUrl" :alt="t('profile.alt.message')" class="w-12 sm:w-15 md:w-[5.25rem]" />
        <img :src="onlineDotUrl" :alt="t('profile.alt.onlineDot')"
          class="absolute top-1 right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 md:hidden" />
      </div>
    </div>
  </div>

  <ProfileCallPopup v-model="isCallPopupOpen" />
  <TipPopup v-model="isTipPopupOpen" />
  
</template>
