<script setup>
import MiniCalendar from '@/components/calendar/MiniCalendar.vue';
import OneOnOneBookingFlowHeader from '../HelperComponents/OneOnOneBookingFlowHeader.vue'; 
import { ref, reactive, computed, onMounted } from 'vue';
import { addMonths, monthNames } from '@/utils/calendarHelpers.js';

const props = defineProps({
  engine: {
    type: Object,
    required: true
  }
});

// --- CALENDAR LOGIC ---
const now = new Date();
const y = now.getFullYear();
const m = now.getMonth();

const state = reactive({
  focus: new Date(y, m, 23),
  selected: null
});

const header = computed(() => {
  return `${monthNames[state.focus.getMonth()]} ${state.focus.getFullYear()}`;
});

const shiftMonth = (n) => {
  state.focus = addMonths(state.focus, n);
};

const theme1 = {
  mini: {
    wrapper: 'flex flex-col w-full font-medium text-gray-500 mt-[10px] gap-[0.625rem] rounded-xl ',
    header: 'text-lg font-medium text-white',
    dayBase: 'w-[37.43px] h-[37px] rounded-full flex flex-col items-center justify-center focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 hover:bg-gray-50',
    outside: 'opacity-0',
    expired: 'opacity-100',
    today: 'bg-gray-500 font-medium text-white hover:bg-gray-600',
    selected: 'rounded-full',
    dot: 'mt-[2rem] w-1.5 h-1.5 rounded-full absolute'
  }
};

const events1 = ref([
  { id: 'e1', title: 'Group Call1', start: new Date(y, m, 11, 15, 30), end: new Date(y, m, 11, 17, 15), slot: 'custom' },
  { id: 'e2', title: 'Live Call2', start: new Date(y, m, 12, 12, 0), end: new Date(y, m, 12, 14, 0), slot: 'alt' },
]);

const onSelectFromMini = (date) => {
  state.selected = new Date(date);
  state.focus = new Date(date);
};

// --- FORM LOGIC ---

const timeSlots = [
  { label: '12:00am', value: '00:00' },
  { label: '2:00pm', value: '14:00' },
  { label: '3:00pm', value: '15:00', isSpecial: true }, 
  { label: '4:00pm', value: '16:00' },
];

const durationOptions = [
  { value: 15, price: 500 },
  { value: 30, price: 1000 },
  { value: 45, price: 1500 },
  { value: 60, price: 2000 },
];

const addons = reactive([
  { id: 1, name: 'Record our session', price: 50, selected: false },
  { id: 2, name: 'Call you sensei', price: 50, selected: false },
  { id: 3, name: 'Call you senpai', price: 50, selected: false },
  { id: 4, name: 'Be extra kawaii', price: 50, selected: false },
  { id: 5, name: 'Topless', price: 500, selected: false },
]);

const selectedTime = ref(timeSlots[3]); 
const selectedDurationObj = ref(durationOptions[0]); 

// --- STATE PERSISTENCE (LOAD EXISTING DATA) ---
onMounted(() => {
  const existing = props.engine.getState('bookingDetails');
  if (existing) {
    if (existing.selectedDate) {
      state.selected = new Date(existing.selectedDate);
      state.focus = new Date(existing.selectedDate);
    }
    if (existing.selectedTime) {
      selectedTime.value = timeSlots.find(s => s.value === existing.selectedTime.value) || timeSlots[3];
    }
    if (existing.selectedDuration) {
      selectedDurationObj.value = durationOptions.find(d => d.value === existing.selectedDuration.value) || durationOptions[0];
    }
    if (existing.addons) {
      existing.addons.forEach(savedAddon => {
        const addon = addons.find(a => a.id === savedAddon.id);
        if (addon) addon.selected = true;
      });
    }
  }
});

const addMinutesToTime = (timeValue, minutesToAdd) => {
  if (!timeValue) return '';
  const [hours, minutes] = timeValue.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  date.setMinutes(date.getMinutes() + minutesToAdd);
  
  let h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12;
  h = h ? h : 12; 
  const mStr = m < 10 ? '0' + m : m;
  return `${h}:${mStr}${ampm}`;
};

const formattedTimeRange = computed(() => {
  if (!state.selected || !selectedTime.value) return '-';
  const startTime = selectedTime.value.label.toLowerCase(); 
  const endTime = addMinutesToTime(selectedTime.value.value, selectedDurationObj.value.value);
  return `${startTime}-${endTime}`;
});

const currentDuration = computed(() => {
  return state.selected ? selectedDurationObj.value.value : 0;
});

const selectedDateDisplay = computed(() => {
  if (!state.selected) return '';
  return state.selected.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
});

const headerDateDisplay = computed(() => {
  if (!state.selected) return '';
  const selected = new Date(state.selected);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const isSameDay = (d1, d2) => 
    d1.getDate() === d2.getDate() && 
    d1.getMonth() === d2.getMonth() && 
    d1.getFullYear() === d2.getFullYear();

  let prefix = '';
  if (isSameDay(selected, today)) prefix = 'Today';
  else if (isSameDay(selected, tomorrow)) prefix = 'Tomorrow';

  const dateStr = selected.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return prefix ? `${prefix} ${dateStr}` : dateStr;
});

const totalPrice = computed(() => {
  if (!state.selected) return 0;
  const basePrice = selectedDurationObj.value.price;
  const addonsPrice = addons.reduce((sum, item) => item.selected ? sum + item.price : sum, 0);
  return basePrice + addonsPrice;
});

const selectTime = (slot) => { selectedTime.value = slot; };
const selectDuration = (option) => { selectedDurationObj.value = option; };
const toggleAddon = (index) => { addons[index].selected = !addons[index].selected; };

const goToNextStep = () => {
  const bookingData = {
    selectedDate: state.selected,
    selectedTime: selectedTime.value,
    selectedDuration: selectedDurationObj.value,
    addons: addons.filter(a => a.selected),
    formattedTimeRange: formattedTimeRange.value, 
    selectedDateDisplay: selectedDateDisplay.value,
    headerDateDisplay: headerDateDisplay.value,
    totalPrice: totalPrice.value
  };

  props.engine.setState('bookingDetails', bookingData);
  props.engine.goToStep(3);
};
</script>

<template>
  <div
    class="rounded-[20px] h-[556px] max-h-full lg:w-[852px] overflow-hidden" 
    style="background-image: url('/images/background.png'); background-size: cover; background-repeat: no-repeat; background-position: left 50% center;"
  >
    <div class="backdrop-blur-[10px] h-full rounded-[20px] bg-[#0C111D96]">
      <div class="rounded-b-[20px] h-full rounded-t-[20px] flex flex-col bg-black/50">

        <OneOnOneBookingFlowHeader 
          :time-display="formattedTimeRange"
          :date-display="headerDateDisplay"
          :subtotal="totalPrice"
          :duration="currentDuration"
        />

        <div class="flex-1 flex w-full lg:flex-row flex-col justify-between min-h-0 overflow-y-auto lg:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none]">

          <div class="flex-1 flex-col w-full p-4 lg:overflow-hidden">
             <div class="flex items-center justify-between w-full mb-2">
              <span class="flex items-center gap-2">
                <div :class="theme1.mini.header">{{ header }}</div>
                <div class="flex items-center gap-1">
                  <button class="w-[2rem] h-[2rem] flex items-center justify-center rounded-full hover:bg-gray-100" @click="shiftMonth(-1)">
                    <svg width="7" height="13" viewBox="0 0 7 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.13092 11.4181L1.21289 6.50006L6.13092 1.58203" stroke="#6B7280" stroke-width="1.63934" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </button>
                  <button class="w-[2rem] h-[2rem] flex items-center justify-center rounded-full hover:bg-gray-100" @click="shiftMonth(1)">
                    <svg width="7" height="13" viewBox="0 0 7 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 11.4181L5.91803 6.50006L1 1.58203" stroke="#6B7280" stroke-width="1.63934" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </button>
                </div>
              </span>
              <div class="flex text-[9.02px] text-gray-500 font-medium items-center gap-[6.56px]">
                <p>GMT+08:00</p>
                <button class="flex items-center justify-center w-[8.2px] h-[8.2px]"><svg width="6" height="3" viewBox="0 0 6 3" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.07373 0.472656L3.12291 2.52184L5.17209 0.472656" stroke="#9CA3AF" stroke-width="0.819672" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
              </div>
            </div>

            <mini-calendar
              class="w-full"
              :month-date="state.focus"
              :selected-date="state.selected || state.focus"
              :events="events1"
              :theme="theme1"
              :data-attrs="{ 'data-calendar':'mini' }"
              @date-selected="onSelectFromMini"
            />
          </div>

          <div v-if="!state.selected" class="flex-1 flex flex-col justify-center items-center gap-8 h-full">
            <p class="text-sm flex justify-center leading-20 text-center py-16 px-8 items-center text-gray-400">
              Select a date from calendar to see available time slots.
            </p>
          </div>

          <div
            v-else
            class="flex-1 flex-col p-[1.5rem_1rem] gap-2 bg-gray-950/10 lg:overflow-hidden lg:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none]"
          >
            <div class="flex flex-col gap-2 md:mt-0 mt-5">
              <h3 class="text-sm text-[#22CCEE] font-semibold leading-[20px]">SELECT CALL START TIME</h3>
              <div class="flex flex-col w-full gap-2">
                <div 
                  v-for="(slot, index) in timeSlots" 
                  :key="index"
                  @click="selectTime(slot)"
                  class="flex justify-center items-center p-[0.625rem] rounded-[0.625rem] grow relative cursor-pointer transition-colors"
                  :class="[
                    selectedTime?.value === slot.value 
                      ? 'bg-[#07F468] border border-[#07F468]' 
                      : (slot.isSpecial ? 'border border-[#FF0066]' : 'border-[0.5px] border-white')
                  ]"
                >
                  <p 
                    class="text-sm font-medium leading-[20px]"
                    :class="[
                      selectedTime?.value === slot.value 
                        ? 'text-black font-semibold' 
                        : (slot.isSpecial ? 'text-[#FF0066]' : 'text-[#F9FAFB]')
                    ]"
                  >
                    {{ slot.label }}
                  </p>
                  <div v-if="slot.isSpecial && selectedTime?.value !== slot.value" class="absolute right-[1rem]">
                    <img src="/images/cloud-moon.svg" alt="peak-icon" />
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-2 md:mt-0 mt-5">
              <h3 class="text-sm text-[#22CCEE] font-semibold leading-[20px]">SELECT LENGTH</h3>
              <div class="border-[3px] border-[rgba(255,255,255,0.15)] rounded-[3.125rem]">
                <div class="w-full flex bg-[#FFFFFF26] rounded-[3.125rem]">
                  <div 
                    v-for="(opt, index) in durationOptions" 
                    :key="index"
                    @click="selectDuration(opt)"
                    class="rounded-[3.125rem] flex justify-center items-center grow p-[0.375rem_0.675rem] cursor-pointer transition-colors"
                    :class="selectedDurationObj.value === opt.value ? 'bg-[#07F468]' : ''"
                  >
                    <p 
                      class="text-xs leading-[18px] font-medium"
                      :class="selectedDurationObj.value === opt.value ? 'text-[#0C111D]' : 'text-white'"
                    >
                      {{ opt.value }} MIN
                    </p>
                  </div>
                </div>
              </div>
              <p class="text-sm leading-[20px] text-[#07F468]">
                Your session will be on {{ selectedDateDisplay }} {{ formattedTimeRange !== '-' ? formattedTimeRange : '' }}
              </p>
            </div>

            <div class="flex flex-col gap-2 md:mt-0 mt-5">
              <h3 class="text-sm text-[#22CCEE] font-semibold leading-[20px]">ADD-ON SERVICE</h3>
              <div class="flex flex-col w-full gap-2">
                <div 
                  v-for="(addon, index) in addons" 
                  :key="addon.id"
                  @click="toggleAddon(index)"
                  class="flex flex-row justify-between text-white py-[0.25rem] cursor-pointer"
                >
                  <div class="flex flex-row items-center gap-2">
                    <div 
                      class="flex justify-center items-center w-[0.9375rem] h-[0.9375rem] p-[0.15625rem] rounded-[0.25rem]"
                      :class="addon.selected ? 'border border-[#07F468] bg-[#07F468]' : 'border-2 border-[#667085]'"
                    >
                      <img v-if="addon.selected" src="/images/check.svg" alt="check-icon" class="w-[0.46875rem] h-[0.3125rem]" />
                    </div>
                    <p class="text-sm leading-[20px] font-medium">{{ addon.name }}</p>
                  </div>
                  <div class="flex flex-row justify-end items-center gap-0.5">
                    <p class="text-sm leading-[20px] font-semibold">+</p>
                    <div class="flex justify-center items-center w-[1.25rem] h-[1.25rem]">
                      <img src="/images/token.svg" alt="token-icon" />
                    </div>
                    <p class="text-sm leading-[20px] font-semibold">{{ addon.price }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-2 md:mt-0 mt-5">
              <h3 class="text-sm text-[#22CCEE] font-semibold leading-[20px]">OTHER REQUEST</h3>
              <div class="desc">
                <p class="text-sm leading-[20px] text-[#F2F4F7]">
                  If you have other personal request you would like Princess
                  Carrot Pop to know, please write down here. All additional
                  request are subject to additional charges.
                </p>
              </div>
              <div class="example">
                <p class="leading-[24px] text-white break-words rounded-t-[0.25rem] bg-black/50 p-[0.75rem_0.675rem] border-b border-solid border-[#07F468]">
                  Can you buy this cake in this cake shop and eat in front of me
                  while you feed me
                  http://www.mapcrunch.com/p/55.89162_-3.622838_344.75_5.64_1
                </p>
              </div>
            </div>
          </div>

        </div>

        <div v-if="state.selected" class="flex-none flex justify-end">
          <button @click="goToNextStep"> 
            <div class="relative w-[14.625rem] p-[12px] rounded-br-[20px] flex justify-center items-center gap-2 bg-[#07F468] after:content-[''] after:absolute after:right-full after:top-0 after:w-0 after:h-0 after:border-t-[3.3125rem] after:border-t-transparent after:border-r-[1rem] after:border-r-[#07F468] after:border-b-0">
              <p class="text-lg leading-[28px] text-black text-center font-medium">PAYMENT</p>
              <div class="w-6 h-6 flex justify-center items-center">
                <img src="/images/arrow-right.svg" alt="arrow-right-icon" />
              </div>
            </div>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>