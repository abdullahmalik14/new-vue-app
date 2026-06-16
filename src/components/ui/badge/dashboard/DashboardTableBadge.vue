<template>
  <div v-if="type === 'rank'" class="w-5 h-5 bg-black flex justify-center items-center shrink-0">
    <span class="text-white text-sm font-bold font-['Poppins']">{{ text }}</span>
  </div>
  <div v-else-if="type === 'tag'" class="px-1.5 py-0.5 bg-gray-200 rounded-md border border-gray-200 flex justify-start items-center">
    <span :data-value="text" class="text-slate-700 text-xs font-medium font-['Poppins']">{{ text }}</span>
  </div>
  <div v-else class="px-1.5 py-0.5 bg-gray-200 rounded-md border border-gray-200 flex justify-start items-center">
    <span :data-value="text" class="text-slate-700 text-xs font-medium font-['Poppins']">{{ text }}</span>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: [String, Number],
    required: true
  },
  type: {
    type: String,
    default: 'rank',
    validator: (value) => ['rank', 'tag'].includes(value)
  }
})
</script>
