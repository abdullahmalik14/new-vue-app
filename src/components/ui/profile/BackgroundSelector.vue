<template>
  <ul 
    class="flex flex-wrap justify-center items-center gap-2 px-2 md:gap-4 md:px-4 xl:justify-between xl:gap-0"
  >
    <li
      v-for="bg in backgrounds"
      :key="bg.id"
      @click="$emit('update:modelValue', bg.id)"
      class="flex justify-center items-center w-[3.125rem] h-[3.125rem] rounded-full cursor-pointer md:w-[4.625rem] md:h-[4.625rem] md:p-1 transition-all"
      :class="{ 'border-[3px] border-[#98A2B3]': modelValue === bg.id }"
    >
      <div
        class="w-[2.375rem] h-[2.375rem] rounded-full md:w-full md:h-full"
        :style="{ backgroundColor: bg.color }"
      ></div>
    </li>
  </ul>
</template>

<script setup>
defineProps({
  backgrounds: {
    type: Array,
    required: true
  },
  modelValue: { // Selected Background ID
    type: [Number, String],
    default: null
  }
});

defineEmits(['update:modelValue']);
</script>