<template>
  <div class="border-b border-transparent">
    <!-- Header -->
    <div class="flex justify-between items-center cursor-pointer"
      :class="toggleable ? 'cursor-pointer' : 'cursor-default'" @click="handleClick">
      <div class="flex items-center gap-2">
        <div class="flex justify-center items-center w-5 h-5">
          <div class="w-5 h-5 transition-colors duration-200" :class="iconColor" :style="{
            maskImage: `url(${icon})`,
            webkitMaskImage: `url(${icon})`,
            maskSize: 'contain',
            webkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            webkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            webkitMaskPosition: 'center'
          }"></div>
        </div>

        <h3 class="text-base font-semibold" :class="titleColor">
          {{ title }}
        </h3>
      </div>

      <div v-if="showChevron" class="flex justify-center items-center w-6 h-6">
        <img src="https://i.ibb.co.com/qLW7tf3T/Arrows.webp" alt="chevron" class="transition-transform duration-300"
          :class="isOpen ? 'rotate-180' : 'rotate-0'" />
      </div>
    </div>

    <!-- Dropdown Content -->
    <div v-if="isOpen" class="mt-3">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  titleColor: {
    type: String,
    default: "text-[#F9FAFB] dark:text-[#e5e3df]", // ✅ default to white
  },
  icon: {
    type: String,
    required: true,
  },
  iconColor: {
    type: String,
    default: "bg-[#F9FAFB] dark:bg-[#e5e3df]", // ✅ default to white bg
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
  showChevron: {
    type: Boolean,
    default: true, // ✅ default show
  },
  toggleable: {
    type: Boolean,
    default: true, // ✅ default behavior unchanged
  },
});

const emit = defineEmits(["update:modelValue"]);

const isOpen = computed(() => props.modelValue);

const handleClick = () => {
  if (!props.toggleable) return; // 🚫 toggle disabled
  emit("update:modelValue", !props.modelValue);
};
</script>
