<template>
  <div class="bg-[#F2F4F7] p-4 rounded-[10px] flex flex-col gap-4 font-['Poppins'] shadow-lg w-full max-w-[350px]">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <img :src="headerIcon" alt="icon" class="w-5 h-5" />
        <span class="text-[#344054] text-sm font-semibold">{{ title }}</span>
      </div>
      <button @click="$emit('close')" class="p-1 hover:bg-gray-200 rounded-full transition-colors">
        <img src="https://i.ibb.co/G4Y3BB6c/Icon.png" alt="close" class="w-2.5 h-2.5" />
      </button>
    </div>

    <!-- Type-specific Content -->
    <div v-if="type === 'cancel'" class="flex flex-col gap-6">
      <div class="text-[#475467] text-sm font-normal leading-5">
        {{ description || 'Are you sure you want to cancel this event? Booking Fee will still be deducted from your wallet.' }}
      </div>
      <div class="flex gap-3">
        <button 
          class="flex-1 bg-white border border-[#FF4848] hover:bg-gray-50 text-[#FF4848] font-semibold py-2 px-4 rounded-[4px] text-sm transition-colors"
          @click="$emit('back')"
        >
          Back
        </button>
        <button 
          class="flex-1 bg-[#FF4848] hover:bg-[#D92D20] text-white font-semibold py-2 px-4 rounded-[4px] text-sm transition-colors"
          @click="$emit('confirm')"
        >
          Cancel Call
        </button>
      </div>
    </div>

    <div v-else class="flex flex-col gap-4">
      <!-- Date Section -->
      <div class="flex flex-col gap-1.5">
        <span class="text-[#667085] text-[14px] font-medium">{{ type === 'reschedule' ? 'New event date' : 'Event date' }}</span>
        
        <div v-if="type === 'reschedule'" class="bg-white border border-[#D0D5DD] rounded-[4px] px-3 py-2 flex items-center gap-2">
          <img :src="CalendarIcon" alt="calendar" class="w-4 h-4 opacity-60" />
          <input type="text" :value="eventDate" class="bg-transparent border-none outline-none text-sm font-medium w-full" readonly />
        </div>
        <span v-else class="text-[#000] text-base font-semibold">{{ eventDate }}</span>
        
        <span v-if="type === 'reschedule'" class="text-[#475467] text-xs">Original event date: {{ originalDate }}</span>
      </div>

      <!-- Time Section -->
      <div class="flex flex-col gap-1.5">
        <span class="text-[#667085] text-[14px] font-medium">New start time</span>
        <div class="flex items-center gap-2">
          <div class="bg-white border border-[#D0D5DD] rounded-[4px] px-3 py-2 flex items-center gap-2 flex-grow">
            <input type="text" :value="newTime" class="bg-transparent border-none outline-none text-sm font-medium w-full" readonly />
            <img :src="ChevronDownIcon" alt="chevron" class="w-4 h-4 cursor-pointer" />
          </div>
          <span class="text-[#000000] text-sm font-medium">-{{ endTime }}</span>
        </div>
        <span class="text-[#475467] text-xs">Original start time: {{ originalTime }}</span>
      </div>

      <!-- Action Button -->
      <button 
        class="bg-[#07F468] hover:bg-[#06D65C] text-black font-semibold py-2.5 px-4 rounded-[4px] flex items-center justify-between mt-2 transition-colors group"
        @click="$emit('submit')"
      >
        <span class="flex-grow text-center">Send request to @{{ userName }}</span>
        <img :src="SendIcon" alt="send" class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import ClockPlusIcon from "/images/clock-plus-1.webp";
import CalendarIcon from "/images/calendar-date.webp";
import CancelIcon from "/images/phone-x.webp";
import SendIcon from "/images/send-03.webp";
import ChevronDownIcon from "/images/chevron-down.webp";

const props = defineProps({
  type: {
    type: String,
    default: 'moreTime', // 'moreTime', 'reschedule', 'cancel'
    validator: (v) => ['moreTime', 'reschedule', 'cancel'].includes(v)
  },
  title: String,
  eventDate: { type: String, default: 'April 24, 2025' },
  originalDate: { type: String, default: 'April 24, 2025' },
  newTime: { type: String, default: '9:30pm' },
  endTime: { type: String, default: '10:30pm' },
  originalTime: { type: String, default: '9:15pm' },
  userName: { type: String, default: 'jennyhunny' },
  description: String,
  icon: String
});

defineEmits(['close', 'submit', 'back', 'confirm']);

const headerIcon = computed(() => {
  if (props.icon) return props.icon;
  if (props.type === 'reschedule') return CalendarIcon;
  if (props.type === 'cancel') return CancelIcon;
  return ClockPlusIcon;
});
</script>

<style scoped>
div {
  font-family: 'Poppins', sans-serif;
}
</style>
