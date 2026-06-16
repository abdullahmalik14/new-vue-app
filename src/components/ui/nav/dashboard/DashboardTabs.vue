<template>
  <div class="relative">
    <!-- Desktop Tabs -->
    <div
      class="hidden md:flex w-full lg:w-auto bg-white/30 rounded-lg justify-start items-start overflow-hidden border border-gray-200"
    >
      <div
        v-for="tab in tabs"
        :key="tab"
        @click="selectTab(tab)"
        :data-value="tab"
        :class="[
          'flex-1 lg:flex-initial whitespace-nowrap cursor-pointer h-full px-4 py-2 flex justify-center items-center gap-2 transition-all font-[\'Poppins\'] text-sm outline-none border-r border-gray-200 last:border-r-0',
          modelValue === tab ? 'bg-gray-50 text-gray-800 font-bold' : 'bg-transparent text-gray-500 font-medium hover:bg-gray-50'
        ]"
      >
        {{ tab }}
      </div>
    </div>

    <!-- Mobile Dropdown -->
    <div class="md:hidden relative w-full sm:w-auto">
      <button
        @click="isDropdownOpen = !isDropdownOpen"
        class="w-full sm:w-[200px] px-4 py-2 bg-white/70 backdrop-blur-md border border-gray-200 rounded-lg flex justify-center gap-2 items-center outline-none hover:bg-white/90 transition-colors"
      >
        <span class="text-gray-900 font-semibold text-sm">{{ modelValue }}</span>
        <div
          class="w-4 h-4 flex items-center justify-center transition-transform"
          :class="{ 'rotate-180': isDropdownOpen }"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#667085" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </button>

      <div
        v-if="isDropdownOpen"
        class="absolute right-0 z-20 w-full sm:w-[200px] top-full mt-1.5 bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        <div
          v-for="tab in tabs"
          :key="tab"
          @click="selectTab(tab)"
          :class="[
            'px-4 py-3 text-sm transition-colors cursor-pointer text-center',
            modelValue === tab ? 'bg-blue-50/80 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50/80'
          ]"
        >
          {{ tab }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  tabs: {
    type: Array,
    required: true
  },
  modelValue: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const isDropdownOpen = ref(false)

const selectTab = (tab) => {
  emit('update:modelValue', tab)
  isDropdownOpen.value = false
}
</script>
