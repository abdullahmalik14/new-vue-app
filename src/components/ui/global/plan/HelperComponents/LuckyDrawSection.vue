<script setup>
import { defineProps, defineEmits } from 'vue';

// Props
defineProps({
  draws: {
    type: Array,
    default: () => [] 
  }
});

// Events
const emit = defineEmits(['create', 'edit', 'remove']);
</script>

<template>
  <div v-if="draws && draws.length > 0" class="flex flex-col gap-4 px-2 py-4 bg-white/25 md:p-4 dark:bg-[#181a1b40]">
    
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-1">
        <h2 class="text-xl leading-normal font-semibold text-[#667085] dark:text-[#9e9689]">Lucky Draw</h2>
        <span class="text-xs leading-normal font-medium italic text-[#0C111D] dark:text-[#dbd8d3]">Optional</span>
      </div>
      <p class="text-base text-[#344054] dark:text-[#bdb8af]">Customise discount for the selected special ones. Create lucky draw for your followers, invite specific fans and more.</p>
    </div>

    <div class="flex flex-col gap-2">
      
      <div class="flex gap-1 h-[1.875rem]">
        <h3 class="text-base font-semibold align-middle text-[#0C111D] md:text-lg dark:text-[#dbd8d3]">Active Lucky Draw</h3>
        <span class="text-[0.6em] leading-normal font-semibold align-super text-[#0C111D] dark:text-[#dbd8d3]">{{ draws.length }}</span>
      </div>

      <div v-for="(draw, index) in draws" :key="draw.id || index" class="rounded-[.3125rem] border border-transparent [background:linear-gradient(180deg,rgba(255,255,255,0.6),rgba(255,255,255,0.6))_padding-box,linear-gradient(90deg,rgba(180,84,211,0.1),rgba(254,127,54,0.1),rgba(254,212,47,0.1),rgba(38,201,201,0.1),rgba(41,114,218,0.1))_border-box,linear-gradient(90deg,#B454D3,#FE7F36,#FED42F,#26C9C9,#2972DA)_border-box]">
        <div class="flex flex-col gap-4 p-3 rounded bg-white/50 sm:p-4 md:gap-3">
          
          <div class="flex gap-2 sm:items-center md:gap-4 md:items-start lg:items-center">
            <img src="https://i.ibb.co.com/DfZPXfv9/money-cat.webp" alt="money cat" class="w-32 h-32">

            <div data-lucky-draw-info-wrapper class="flex flex-col sm:gap-3">
              <div class="flex flex-col gap-2">
                <h3 class="text-lg font-semibold text-[#0C111D] dark:text-[#dbd8d3]">Lucky Draw</h3>
                
                <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4 sm:gap-y-2 sm:gap-1">
                  <div class="flex items-center gap-1">
                    <img src="https://i.ibb.co.com/GQFhzHdh/logo-bg.webp" alt="logo bg" class="w-4 h-4">
                    <span class="text-sm text-[#344054] dark:text-[#bdb8af]">{{ draw.audience }}</span>
                  </div>

                  <div class="flex items-center gap-1">
                    <img src="https://i.ibb.co.com/zWDYxDdt/calendar-01.webp" alt="calendar 01" class="w-4 h-4">
                    <span class="text-sm text-[#344054] dark:text-[#bdb8af]">{{ draw.dateRange }}</span>
                  </div>

                  <div class="flex items-center gap-1">
                    <img src="https://i.ibb.co.com/nsMDfjWJ/dollar-01.webp" alt="dollar 01" class="w-4 h-4">
                    <span class="text-sm text-[#344054] dark:text-[#bdb8af]">{{ draw.minSpending }}</span>
                  </div>
                </div>
              </div>

              <div class="flex flex-col gap-1 sm:flex-row sm:flex-wrap">
              
              <div v-for="(item, i) in draw.items" :key="i" class="flex items-center w-full h-9 flex rounded-[3.125rem] overflow-hidden sm:max-w-[17.8125rem] md:max-w-[19.0625rem] xl:max-w-[19.59375rem]">
                <div class="h-full flex items-center gap-1 px-3 py-[0.0625rem] grow bg-[#0C111D] dark:bg-[#dbd8d3]">
                  <span class="text-base font-semibold text-[#07F468] dark:text-[#06c454]">{{ item.label }}</span>
                </div>

                <div class="h-9 flex justify-center items-center gap-1 px-2 py-[0.0625rem] bg-[#07F468] dark:bg-[#06c454]">
                  <div class="flex justify-center items-center h-5">
                    <img src="https://i.ibb.co.com/S4vSFgKK/token.webp" alt="token" class="w-4 h-4">
                  </div>
                  <span class="text-sm font-semibold text-[#0C111D] dark:text-[#dbd8d3]">{{ item.tokens }}</span>
                </div>
              </div>

            </div>
            </div>
          </div>

          <div data-lucky-draw-bottom-section class="flex flex-col gap-3">
            

            <div class="flex justify-end items-center gap-4 sm:grow">
              <button @click="$emit('edit', draw)" class="flex justify-center items-center gap-0.5 outline-none cursor-pointer">
                <img src="https://i.ibb.co.com/d01w6NWF/pen.webp" alt="pen" class="w-5 h-5">
                <span class="text-sm font-medium text-[#155EEF] dark:text-[#2c8df1]">EDIT</span>
              </button>

              <button @click="$emit('remove', draw)" class="flex justify-center items-center gap-0.5 outline-none cursor-pointer">
                <img src="https://i.ibb.co.com/7twNxfc1/trash.webp" alt="trash" class="w-5 h-5">
                <span class="text-sm font-medium text-[#FF0066] dark:text-[#ff1a76]">REMOVE</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="flex flex-col gap-4 px-2 py-4 bg-white/25 md:p-4 md:gap-6 dark:bg-[#181a1b40]">
    
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-1">
        <h2 class="text-xl leading-normal font-semibold text-[#667085] dark:text-[#9e9689]">Lucky Draw</h2>
        <span class="text-xs leading-normal font-medium italic text-[#344054] dark:text-[#bdb8af]">Optional</span>
      </div>

      <p class="text-sm text-[#344054] dark:text-[#bdb8af]">Improve your engagement with your fans! Add Discountal events to boost visibility to your subscription plans</p>
    </div>

    <div class="rounded-[.3125rem] border border-transparent [background:linear-gradient(white,white)_padding-box,linear-gradient(90deg,rgba(180,84,211,0.5)_0%,rgba(254,127,54,0.5)_20.67%,rgba(254,212,47,0.5)_48.56%,rgba(38,201,201,0.5)_73.08%,rgba(41,114,218,0.5)_100%)_border-box]">
      <div class="flex items-center gap-4 p-4 rounded bg-white/50">
        <img src="https://i.ibb.co.com/DfZPXfv9/money-cat.webp" alt="money cat" class="w-32 h-32">

        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-1">
            <h3 class="text-lg font-semibold text-[#0C111D] dark:text-[#dbd8d3]">Lucky Draw</h3>
            <p class="text-sm text-[#667085] dark:text-[#9e9689]">Lucky Draw description Lucky Draw description Lucky Draw description. </p>
          </div>

          <button @click="$emit('create')" class="flex items-center gap-0.5 cursor-pointer">
            <img src="https://i.ibb.co/TD3jgrGK/plus-square.webp" alt="plus-square" class="w-5 h-5">
            <span class="text-sm font-medium text-[#155EEF] dark:text-[#2c8df1]"> CREATE EVENT</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>