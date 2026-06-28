<template>
   <div class="w-full border-l-[4px] border-[#5549FF] bg-[#F9FAFB] rounded shadow-lg inline-flex items-start overflow-hidden font-['Poppins']">
      <div class="w-full p-2 flex items-start">
         <div class="self-stretch inline-flex flex-col justify-start items-start gap-3 flex-1">
            <div class="self-stretch flex flex-col justify-start items-start gap-2">
               <div class="w-full inline-flex justify-between items-center">
                  <div class="text-gray-700 text-xl font-semibold font-['Poppins'] leading-tight pr-4">
                     {{ t('calendar.callSoon.title') }}
                  </div>
                  <button type="button" class="inline-flex w-6 h-6 items-center justify-center rounded hover:bg-gray-100 text-[#98A2B3] p-1 -mt-1 -mr-2">
                     <img :src="dotsIconUrl" :alt="t('calendar.callSoon.icons.dots')" class="w-4 h-4">
                  </button>
               </div>
               <div class="self-stretch inline-flex justify-start items-start gap-1">
                  <div class="justify-center text-slate-700 text-sm font-medium font-['Poppins'] leading-5">{{ t('calendar.callSoon.date') }}</div>
                  <div class="justify-center text-slate-700 text-sm font-medium font-['Poppins'] leading-5">{{ t('calendar.callSoon.timeRange') }}</div>
               </div>
               <div class="inline-flex justify-start items-center gap-1">
                <div data-svg-wrapper>
                    <div class="w-1.5 h-1.5 rounded-full bg-[#FF0066]"></div>
                </div>
                <div class="justify-start text-rose-600 text-xs font-medium font-['Poppins'] leading-4">{{ t('calendar.callSoon.startsIn') }}</div>
                </div>
                <div class="self-stretch inline-flex justify-start items-center gap-2">
                <div class="flex-1 px-2 py-[3px] bg-indigo-600 rounded-sm outline outline-1 outline-offset-[-1px] outline-indigo-600 flex justify-center items-center gap-1 cursor-pointer">
                    <div >
                    <img :src="phoneIncomingIconUrl" :alt="t('calendar.callSoon.icons.phoneIncoming')" class="w-4 h-4">
                    </div>
                    <div class="justify-start text-white text-xs font-semibold font-['Poppins'] leading-4">{{ t('calendar.callSoon.joinCall') }}</div>
                </div>
                <div class="flex-1 px-2 py-[3px] bg-white rounded-sm outline outline-1 outline-offset-[-0.50px] outline-indigo-600 flex justify-center items-center gap-1 cursor-pointer">
                    <div >
                    <img :src="dotsHorizontalIconUrl" :alt="t('calendar.callSoon.icons.dotsHorizontal')" class="w-4 h-4">
                    </div>
                    <div class="justify-start text-indigo-600 text-xs font-semibold font-['Poppins'] leading-4">{{ t('calendar.callSoon.otherOptions') }}</div>
                </div>
                </div>
            </div>
         </div>
      </div>
   </div>

   <br>
   <br>

   <div class="w-40 bg-white rounded-xs shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] inline-flex flex-col justify-start items-start">
  <div class="self-stretch p-2 bg-gray-200 inline-flex justify-start items-center gap-2">
    <div >
      <img :src="clockPlusIconUrl" :alt="t('booking.moreOptions.icons.clock')" class="w-4 h-4">
    </div>
    <div class="justify-start text-slate-700 text-xs font-semibold font-['Poppins'] leading-4">{{ t('booking.moreOptions.moreTime') }}</div>
  </div>
  <div class="self-stretch p-2 inline-flex justify-start items-center gap-2">
    <div >
      <img :src="calendarIconUrl" :alt="t('booking.moreOptions.icons.calendar')" class="w-4 h-4">
    </div>
    <div class="justify-start text-slate-700 text-xs font-semibold font-['Poppins'] leading-4">{{ t('booking.moreOptions.reschedule') }}</div>
  </div>
  <div class="self-stretch p-2 inline-flex justify-start items-center gap-2">
    <div >
      <img :src="phoneCancelIconUrl" :alt="t('booking.moreOptions.icons.cancel')" class="w-4 h-4">
    </div>
    <div class="justify-start text-[#FF4405] text-xs font-semibold font-['Poppins'] leading-4">{{ t('booking.moreOptions.cancelCall') }}</div>
  </div>
</div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { t } = useI18n();
const { url: dotsIconUrl } = useAssetUrl('icon.calendar.dotsVertical');
const { url: phoneIncomingIconUrl } = useAssetUrl('icon.calendar.phoneIncoming');
const { url: dotsHorizontalIconUrl } = useAssetUrl('icon.calendar.dotsHorizontal');
const { url: clockPlusIconUrl } = useAssetUrl('icon.booking.clockPlus');
const { url: calendarIconUrl } = useAssetUrl('icon.booking.calendar');
const { url: phoneCancelIconUrl } = useAssetUrl('icon.booking.phoneCancel');
</script>
