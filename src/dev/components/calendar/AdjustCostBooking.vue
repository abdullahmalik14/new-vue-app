<template>
   <div class="w-full border-l-[4px] border-[#5549FF] bg-[#F9FAFB] rounded shadow-lg inline-flex items-start overflow-hidden font-['Poppins']">
      <div class="w-full p-2 flex items-start">
         <div class="self-stretch inline-flex flex-col justify-start items-start gap-3">
            <div class="self-stretch flex flex-col justify-start items-start gap-2">
               <div class="w-full inline-flex justify-between items-center">
                  <div class="text-gray-700 text-xl font-semibold font-['Poppins'] leading-tight pr-4">
                     {{ t('calendar.adjustCost.title') }}
                  </div>
                  <button type="button" class="inline-flex w-6 h-6 items-center justify-center rounded hover:bg-gray-100 text-[#98A2B3] p-1 -mt-1 -mr-2">
                     <img :src="dotsIconUrl" :alt="t('calendar.adjustCost.icons.dots')" class="w-4 h-4">
                  </button>
               </div>
               <div class="self-stretch inline-flex justify-start items-start gap-1">
                  <div class="justify-center text-slate-700 text-sm font-medium font-['Poppins'] leading-5">{{ t('calendar.adjustCost.date') }}</div>
                  <div class="justify-center text-slate-700 text-sm font-medium font-['Poppins'] leading-5">{{ t('calendar.adjustCost.timeRange') }}</div>
               </div>
               <div class="self-stretch inline-flex justify-start items-start gap-2">
                  <div class="justify-center text-gray-500 text-base font-semibold font-['Poppins'] line-through leading-6">{{ t('calendar.adjustCost.originalPrice') }}</div>
                  <div class="justify-center text-indigo-600 text-base font-semibold font-['Poppins'] leading-6">{{ t('calendar.adjustCost.adjustedPrice') }}</div>
               </div>
            </div>
            <div class="self-stretch flex flex-col justify-start items-start gap-1">
               <div class="w-44 justify-start text-gray-500 text-xs font-normal font-['Poppins'] leading-4">{{ t('calendar.adjustCost.remarksLabel') }}</div>
               <div class="self-stretch justify-start text-indigo-600 text-sm font-normal font-['Poppins'] leading-5 line-clamp-2">{{ t('calendar.adjustCost.remarks') }}</div>
            </div>
            <div class="self-stretch inline-flex justify-start items-center gap-1">
               <div class="flex justify-start items-center gap-1">
                  <div data-svg-wrapper class="relative">
                     <img :src="hourglassIconUrl" :alt="t('calendar.adjustCost.icons.hourglass')" class="w-4 h-4">
                  </div>
                  <div class="w-44 justify-start text-gray-500 text-xs font-normal font-['Poppins'] leading-4">{{ t('calendar.adjustCost.waitingForResponse') }}</div>
               </div>
               <div class="flex-1 flex justify-end items-center gap-0.5">
                  <div class="justify-start text-indigo-600 text-xs font-medium font-['Poppins'] leading-4">{{ t('calendar.adjustCost.viewDetails') }}</div>
                  <div >
                     <img :src="arrowRightIconUrl" :alt="t('calendar.adjustCost.icons.arrowRight')" class="w-4 h-4">
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { t } = useI18n();
const { url: dotsIconUrl } = useAssetUrl('icon.calendar.dotsVertical');
const { url: hourglassIconUrl } = useAssetUrl('icon.calendar.hourglass');
const { url: arrowRightIconUrl } = useAssetUrl('icon.calendar.arrowUpRight');
</script>
