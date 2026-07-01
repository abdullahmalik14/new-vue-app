<script setup>
import { ref } from 'vue';

defineProps({
  title: {
    type: String,
    default: 'ORDER SUMMARY'
  },
  items: {
    type: Array,
    default: () => []
  }
});

const isOpen = ref(true);

// Toggle function
const toggleSection = () => {
  isOpen.value = !isOpen.value;
};
</script>

<template>
  <div class="w-full flex flex-col gap-5">

    <transition
      enter-active-class="transition-all duration-300 ease-out overflow-hidden"
      leave-active-class="transition-all duration-300 ease-in overflow-hidden"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-[500px]"
      leave-from-class="opacity-100 max-h-[500px]"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-show="isOpen" class="flex flex-col gap-5">
        
        <div class="flex flex-col gap-3">
          <div class="flex justify-between items-center">
            <span class="text-sm leading-6 tracking-[0.0044rem] text-[#F9FAFB] flex-grow opacity-50">
              Product
            </span>
            <span class="text-sm leading-6 tracking-[0.0044rem] text-[#F9FAFB] flex-grow opacity-50 text-right">
              Subtotal
            </span>
          </div>

          <div v-for="(item, index) in items" :key="index" class="flex gap-2 h-12">
            
            <div class="flex gap-1.5 flex-grow">
              <div class="w-12 h-12 min-w-[3rem] rounded-lg overflow-hidden">
                <img
                  :src="item.image"
                  :alt="item.name"
                  class="w-full h-full object-cover"
                />
              </div>

              <div class="flex flex-col">
                <h3 class="text-base font-semibold text-[#F9FAFB]">
                  {{ item.name }}
                </h3>

                <div class="flex items-center gap-1 py-1 h-6">
                  <div class="flex justify-center items-center w-6 h-6">
                    <img
                      :src="item.creatorAvatar"
                      alt="avatar"
                      class="h-[1.375rem]"
                    />
                  </div>
                  <div class="flex items-center gap-1">
                    <h3 class="text-xs leading-normal font-medium text-[#98A2B3]">
                      {{ item.creatorName }}
                    </h3>
                    <img v-if="item.isVerified"
                      src="https://i.ibb.co.com/nMhY8CpS/svgviewer-png-output-22.webp"
                      alt="verified-tick"
                      class="w-2.5 h-2.5"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <span class="text-base font-semibold text-[#F9FAFB] text-right tracking-[0.01rem]">
                {{ item.price }}
              </span>
              <span v-if="item.oldPrice" class="text-xs leading-normal font-medium text-[#98A2B3] line-through text-right tracking-[0.0075rem]">
                {{ item.oldPrice }}
              </span>
            </div>
          </div>
          </div>
      </div>
    </transition>
    
  </div>
</template>