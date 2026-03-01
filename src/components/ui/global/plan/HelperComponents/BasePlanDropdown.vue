<script setup>
import { ref, onMounted, onUnmounted, defineProps, defineEmits } from 'vue';

const props = defineProps({
  // v-model support
  modelValue: {
    type: [String, Number],
    default: ''
  },
  // Array of objects: { label: 'Per month', value: 'month' }
  options: {
    type: Array,
    required: true
  },
  // Custom width class (default to w-full if not provided)
  widthClass: {
    type: String,
    default: 'w-full'
  },
  placeholder: {
    type: String,
    default: 'Select Option'
  }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const dropdownRef = ref(null);

// Toggle dropdown
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

// Select option logic
const selectOption = (option) => {
  emit('update:modelValue', option.value);
  isOpen.value = false;
};

// Close when clicking outside
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

// Helper to get label for current value
const currentLabel = () => {
  const selected = props.options.find(opt => opt.value === props.modelValue);
  return selected ? selected.label : props.placeholder;
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div ref="dropdownRef" class="relative h-11 flex-shrink-0" :class="widthClass">
    <div class="dash-select cursor-pointer" @click="toggleDropdown">
      
      <div 
        class="dash-select__trigger h-11 flex items-center justify-between w-full px-3.5 border-r border-b border-b-[#EAECF0] rounded-t-sm bg-white/50 shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b80] dark:border-b-[#353a3c]"
        :class="{ 'border-r-[#D0D5DD] dark:border-r-[#3b4043]': true }" 
      >
        <span class="text-base font-medium text-[#0c111d] dark:text-[#dbd8d3]">
          {{ currentLabel() }}
        </span>
        <img 
          src="https://i.ibb.co/2mXMQ5F/chevron-down.webp" 
          alt="chevron-down" 
          class="select-arrow w-5 h-5 transition-transform duration-300 ease-in-out transform"
          :class="{ 'rotate-180': isOpen }"
        >
      </div>

      <div 
        class="dash-options-container absolute w-full transition-all duration-300 z-10 top-[calc(100%+0.5rem)] shadow-none border-none"
        :class="isOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'"
      >
        <div class="dash-options rounded-[2px] bg-white/70 backdrop-blur-[25px] max-h-[200px] overflow-y-auto dark:bg-[#181a1bb3]">
          
          <div 
            v-for="option in options" 
            :key="option.value"
            @click.stop="selectOption(option)"
            class="dash-option flex items-center gap-2 h-12 px-3 border-b border-[#EAECF0] cursor-pointer hover:bg-white dark:hover:bg-[#181a1b] dark:border-[#353a3c]"
            :class="{ 
              'bg-white dark:bg-[#181a1b] selected': modelValue === option.value 
            }"
          >
            <span class="text-sm font-medium text-[#0c111d] dark:text-[#dbd8d3]">
              {{ option.label }}
            </span>
          </div>

        </div>
      </div>

    </div>
    
    <select class="dash-real-select hidden" :name="`dash-select-${Math.random()}`" :value="modelValue">
        <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
  </div>
</template>