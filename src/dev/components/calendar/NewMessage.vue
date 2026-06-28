<template>
  <div class="w-52 p-2 bg-white rounded-tl-[10px] rounded-tr-[10px] inline-flex justify-between items-center">
    <div class="size- relative flex justify-start items-center gap-2">
      <div data-svg-wrapper class="relative">
        <img
          :src="messageTextIconUrl"
          :alt="t('calendar.newMessage.icons.message')"
          class="w-6 h-6 filter brightness-0 cursor-pointer"
        />
      </div>
      <div data-color="Default" data-count="true" data-leading-icon="false" data-size="Default" data-state="Default" data-tag="false" class="size- flex justify-start items-center gap-1">
        <div class="justify-start text-gray-500 text-sm font-medium font-['Poppins'] leading-5">{{ t('calendar.newMessage.badge', { count: 4 }) }}</div>
        <div class="self-stretch inline-flex flex-col justify-start items-center gap-2.5"></div>
      </div>
      <div data-svg-wrapper class="left-[18px] top-0 absolute">
        <div class="size-1.5 rounded-full bg-[#FF0464]"></div>
      </div>
    </div>
    <div data-svg-wrapper class="relative">
      <img
        :src="closeIconUrl"
        :alt="t('calendar.newMessage.icons.close')"
        class="w-2.5 h-2.5 cursor-pointer"
      >
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { t } = useI18n();
const { url: messageTextIconUrl } = useAssetUrl('icon.calendar.messageText');
const { url: closeIconUrl } = useAssetUrl('icon.calendar.close');
</script>
