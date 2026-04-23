<template>
  <div class="bg-white rounded-lg shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden w-full max-w-[280px] font-['Poppins']">
    <div class="flex flex-col">
      <!-- Ask for more time -->
      <button 
        class="flex items-center gap-4 px-4 py-4 hover:bg-[#F2F4F7] transition-colors text-left group"
        @click="$emit('select', 'moreTime')"
      >
        <div class="flex-shrink-0">
          <img :src="ClockPlusIcon" alt="clock" class="w-6 h-6 object-contain" />
        </div>
        <span class="text-[#344054] text-lg font-semibold">Ask for more time</span>
      </button>

      <!-- Ask to reschedule -->
      <button 
        class="flex items-center gap-4 px-4 py-4 hover:bg-[#F2F4F7] transition-colors text-left group"
        @click="$emit('select', 'reschedule')"
      >
        <div class="flex-shrink-0">
          <img :src="CalendarIcon" alt="calendar" class="w-6 h-6 object-contain" />
        </div>
        <span class="text-[#344054] text-lg font-semibold">Ask to reschedule</span>
      </button>

      <!-- Cancel Call -->
      <button 
        class="flex items-center gap-4 px-4 py-4 hover:bg-[#F2F4F7] transition-colors text-left group"
        @click="$emit('select', 'cancel')"
      >
        <div class="flex-shrink-0">
          <img :src="CancelIcon" alt="cancel" class="w-6 h-6 object-contain" />
        </div>
        <span class="text-[#FF4848] text-lg font-semibold">Cancel Call</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import ClockPlusIcon from "/images/clock-plus-1.webp";
import CalendarIcon from "/images/calendar-date.webp";
import CancelIcon from "/images/phone-x.webp";

defineEmits(['select']);
</script>

<style scoped>
div {
  font-family: 'Poppins', sans-serif;
}
</style>
