<template>
  <div class="bg-white p-4 rounded-[10px] flex flex-col gap-4 font-['Poppins'] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)] border border-gray-100 w-full max-w-[350px]">
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <img
          v-if="headerIcon"
          :src="headerIcon"
          :alt="t('booking.adjustment.icons.header')"
          class="w-5 h-5"
        />
        <span class="text-[#344054] text-sm font-semibold">{{ displayTitle }}</span>
      </div>
      <button type="button" @click="$emit('close')" class="p-1 hover:bg-gray-200 rounded-full transition-colors">
        <img
          v-if="closeIconUrl"
          :src="closeIconUrl"
          :alt="t('booking.adjustment.icons.close')"
          class="w-2.5 h-2.5"
        />
      </button>
    </div>

    <div v-if="type === 'cancel'" class="flex flex-col gap-6">
      <div class="text-[#475467] text-sm font-normal leading-5">
        {{ description || t('booking.adjustment.cancel.description') }}
      </div>
      <div class="flex gap-3">
        <button
          type="button"
          class="flex-1 bg-white border border-[#FF4848] hover:bg-gray-50 text-[#FF4848] font-semibold py-2 px-4 rounded-[4px] text-sm transition-colors"
          @click="$emit('back')"
        >
          {{ t('booking.adjustment.cancel.back') }}
        </button>
        <button
          type="button"
          class="flex-1 bg-[#FF4848] hover:bg-[#D92D20] text-white font-semibold py-2 px-4 rounded-[4px] text-sm transition-colors"
          @click="$emit('confirm')"
        >
          {{ t('booking.adjustment.cancel.confirm') }}
        </button>
      </div>
    </div>

    <div v-else class="flex flex-col gap-4">
      <div class="flex flex-col gap-1.5">
        <span class="text-[#667085] text-[14px] font-medium">
          {{ type === 'reschedule' ? t('booking.adjustment.newEventDate') : t('booking.adjustment.eventDate') }}
        </span>

        <div v-if="type === 'reschedule'" class="bg-white border border-[#D0D5DD] rounded-[4px] px-3 py-2 flex items-center gap-2">
          <img
            v-if="calendarIconUrl"
            :src="calendarIconUrl"
            :alt="t('booking.adjustment.icons.calendar')"
            class="w-4 h-4 opacity-60"
          />
          <input type="text" :value="eventDate" class="bg-transparent border-none outline-none text-sm font-medium w-full" readonly />
        </div>
        <span v-else class="text-[#000] text-base font-semibold">{{ eventDate }}</span>

        <span v-if="type === 'reschedule'" class="text-[#475467] text-xs">
          {{ t('booking.adjustment.originalEventDate', { date: originalDate }) }}
        </span>
      </div>

      <div class="flex flex-col gap-1.5">
        <span class="text-[#667085] text-[14px] font-medium">{{ t('booking.adjustment.newStartTime') }}</span>
        <div class="flex items-center gap-2">
          <div class="bg-white border border-[#D0D5DD] rounded-[4px] px-3 py-2 flex items-center gap-2 flex-grow">
            <input type="text" :value="newTime" class="bg-transparent border-none outline-none text-sm font-medium w-full" readonly />
            <img
              v-if="chevronDownIconUrl"
              :src="chevronDownIconUrl"
              :alt="t('booking.adjustment.icons.chevron')"
              class="w-4 h-4 cursor-pointer"
            />
          </div>
          <span class="text-[#000000] text-sm font-medium">-{{ endTime }}</span>
        </div>
        <span class="text-[#475467] text-xs">
          {{ t('booking.adjustment.originalStartTime', { time: originalTime }) }}
        </span>
      </div>

      <button
        type="button"
        class="bg-[#07F468] hover:bg-[#06D65C] text-black font-semibold py-2.5 px-4 rounded-[4px] flex items-center justify-between mt-2 transition-colors group"
        @click="$emit('submit')"
      >
        <span class="flex-grow text-center">{{ sendRequestLabel }}</span>
        <img
          v-if="sendIconUrl"
          :src="sendIconUrl"
          :alt="t('booking.adjustment.icons.send')"
          class="w-5 h-5 group-hover:translate-x-1 transition-transform"
        />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const props = defineProps({
  type: {
    type: String,
    default: 'moreTime',
    validator: (v) => ['moreTime', 'reschedule', 'cancel'].includes(v),
  },
  title: String,
  eventDate: { type: String, default: '' },
  originalDate: { type: String, default: '' },
  newTime: { type: String, default: '' },
  endTime: { type: String, default: '' },
  originalTime: { type: String, default: '' },
  userName: { type: String, default: 'jennyhunny' },
  description: String,
  icon: String,
});

defineEmits(['close', 'submit', 'back', 'confirm']);

const { t } = useI18n();
const { url: clockPlusIconUrl } = useAssetUrl('icon.booking.clockPlus');
const { url: calendarIconUrl } = useAssetUrl('icon.booking.calendar');
const { url: cancelIconUrl } = useAssetUrl('icon.booking.phoneCancel');
const { url: sendIconUrl } = useAssetUrl('icon.booking.send');
const { url: chevronDownIconUrl } = useAssetUrl('icon.booking.chevronDown');
const { url: closeIconUrl } = useAssetUrl('icon.booking.close');

const displayTitle = computed(() => {
  if (props.title) return props.title;
  return t(`booking.adjustment.titles.${props.type}`);
});

const sendRequestLabel = computed(() => `${t('booking.adjustment.sendRequest')} @${props.userName}`);

const headerIcon = computed(() => {
  if (props.icon) return props.icon;
  if (props.type === 'reschedule') return calendarIconUrl.value;
  if (props.type === 'cancel') return cancelIconUrl.value;
  return clockPlusIconUrl.value;
});
</script>

<style scoped>
div {
  font-family: 'Poppins', sans-serif;
}
</style>
