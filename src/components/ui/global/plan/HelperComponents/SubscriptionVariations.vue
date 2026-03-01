<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  plan: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['edit', 'remove']);
</script>

<template>
  <div class="flex flex-col gap-4 px-3 py-4 bg-white/25 border-b border-[#D0D5DD] rounded-md md:py-6 md:rounded-none md:bg-transparent dark:bg-[#181a1b40] dark:border-[#3b4043] md:dark:bg-transparent">
    <div class="flex flex-col gap-2">
      <h3 class="text-base font-semibold text-[#0C111D] md:text-lg dark:text-[#dbd8d3]">
        {{ plan.title }}
      </h3>
      
      <div class="flex flex-col gap-1 sm:flex-row-reverse sm:justify-between sm:items-center sm:flex-wrap">
        
        <div class="flex justify-center items-center gap-1 self-end w-max px-2.5 py-0.5 rounded-[3.125rem] bg-[#F2F4F7] sm:self-center dark:bg-[#1e2022]">
          
          <template v-if="plan.isUnlimited">
            <img src="https://i.ibb.co.com/wFzbBWk2/infinite.webp" alt="infinite" class="w-4 h-4">
            <span class="text-sm text-[#344054] dark:text-[#bdb8af]">unlimited usage</span>
          </template>

          <template v-else>
            <span class="text-sm text-[#344054] dark:text-[#bdb8af]">
              {{ plan.usageStart }}<span class="text-sm font-semibold text-[#344054] dark:text-[#bdb8af]">/{{ plan.usageLimit }}</span> usage
            </span>
          </template>

        </div>

        <div class="flex items-center gap-2 w-max">
          <div class="inline-flex items-end">
            <span class="text-base font-medium align-middle text-[#0C111D] dark:text-[#dbd8d3]">{{ plan.currency }}</span>
            <span class="text-3xl leading-[2.375rem] font-semibold align-baseline text-[#0C111D] dark:text-[#dbd8d3]">{{ plan.price }}</span>
          </div>

          <div class="flex justify-center items-center px-1 py-0.5 bg-[#FCE40D] dark:bg-[#a19102]">
            <span class="text-xs leading-normal font-semibold text-[#0C111D] dark:text-[#dbd8d3]">{{ plan.discount }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
      <div class="flex gap-4 flex-wrap gap-y-2 sm:pt-1">
        
        <div class="flex items-center gap-1">
          <img src="https://i.ibb.co.com/GQFhzHdh/logo-bg.webp" alt="logo bg" class="w-4 h-4">
          <span class="text-sm text-[#344054] dark:text-[#bdb8af]">{{ plan.audience }}</span>
        </div>

        <div class="flex items-center gap-1">
          <img src="https://i.ibb.co.com/zWDYxDdt/calendar-01.webp" alt="calendar 01" class="w-4 h-4">
          <span class="text-sm text-[#344054] dark:text-[#bdb8af]">{{ plan.dateRange }}</span>
        </div>

        <div class="flex items-center gap-1">
          <img src="https://i.ibb.co.com/nsMDfjWJ/dollar-01.webp" alt="dollar 01" class="w-4 h-4">
          <span class="text-sm text-[#344054] dark:text-[#bdb8af]">{{ plan.minSpending }}</span>
        </div>
      </div>

      <div class="flex justify-end items-center gap-4 sm:grow">
        <button @click="emit('edit', plan)" class="flex justify-center items-center gap-0.5 outline-none cursor-pointer">
          <img src="https://i.ibb.co.com/d01w6NWF/pen.webp" alt="pen" class="w-5 h-5">
          <span class="text-sm font-medium text-[#155EEF] dark:text-[#2c8df1]">EDIT</span>
        </button>

        <button @click="emit('remove', plan)" class="flex justify-center items-center gap-0.5 outline-none cursor-pointer">
          <img src="https://i.ibb.co.com/7twNxfc1/trash.webp" alt="trash" class="w-5 h-5">
          <span class="text-sm font-medium text-[#FF0066] dark:text-[#ff1a76]">REMOVE</span>
        </button>
      </div>
    </div>
  </div>
</template>