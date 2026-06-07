<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    required: true,
    // Format: [{ label: 'Hong Kong', value: 'hong-kong' }, ...]
  },
  modelValue: {
    type: [String, Number],
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Select option',
  },
  labelClass: {
    type: String,
    default: 'text-[#F9FAFB]',
  },
  selectedValueClass: {
    type: String,
    default: 'text-[#F9FAFB]',
  },
  iconColor: {
    type: String,
    default: 'bg-[#F9FAFB]',
  }
});

const emit = defineEmits(['update:modelValue']);

// State variables
const isOpen = ref(false);
const dropdownRef = ref(null);
const optionsRef = ref(null);
const openUpwards = ref(false); // To handle positioning

// Computed property to show selected label
const selectedLabel = computed(() => {
  const selected = props.options.find(opt => opt.value === props.modelValue);
  return selected ? selected.label : props.placeholder;
});

const toggleDropdown = async () => {
  if (isOpen.value) {
    isOpen.value = false;
    return;
  }

  if (dropdownRef.value && optionsRef.value) {

    const rect = dropdownRef.value.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < 250 && spaceAbove > spaceBelow) {
      openUpwards.value = true;
    } else {
      openUpwards.value = false;
    }
  }

  isOpen.value = true;
};

const selectOption = (value) => {
  emit('update:modelValue', value);
  isOpen.value = false;
};

// Click Outside Logic
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', () => { if (isOpen.value) isOpen.value = false; });
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', () => { });
});
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium" :class="labelClass">
        {{ label }}
      </label>

      <div ref="dropdownRef" class="select-dropdown relative z-[10000] flex w-full">
        <div class="country-select w-full cursor-pointer border-none" @click="toggleDropdown">
          <div
            class="dash-select__trigger w-full h-10 flex items-center gap-2 py-2 px-3 border-b border-[#D0D5DD] bg-white/10 shadow-[0_1px_2px_0_#1018280D]">
            <span class="text-base flex-grow capitalize text-balance" :class="selectedValueClass">
              {{ selectedLabel }}
            </span>
            <div class="h-4 w-4 transition-transform duration-200 select-arrow"
              :class="[{ 'rotate-180': isOpen }, iconColor]" :style="{
                maskImage: `url('https://i.ibb.co.com/qLW7tf3T/Arrows.webp')`,
                webkitMaskImage: `url('https://i.ibb.co.com/qLW7tf3T/Arrows.webp')`,
                maskSize: 'contain',
                webkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                webkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                webkitMaskPosition: 'center'
              }"></div>
          </div>
          <div ref="optionsRef"
            class="dash-options-container absolute left-auto right-0 z-[9999] w-full min-w-[15rem] origin-top shadow-lg transition-[opacity,transform] duration-200 ease-out [transform-origin:50%_0]"
            :class="[
              isOpen ? 'scale-100 opacity-100 pointer-events-auto h-auto overflow-auto' : 'scale-95 opacity-0 pointer-events-none h-0 overflow-hidden',
              openUpwards ? 'bottom-[calc(100%+0.5rem)] top-auto' : 'top-[calc(100%+0.5rem)] bottom-auto'
            ]">
            <div class="rounded-[0.125rem] border border-[rgba(186,188,203,0.5)] bg-white">

              <div v-for="(option, index) in options" :key="index" @click.stop="selectOption(option.value)"
                class="option flex items-center justify-center gap-[0.625rem] hover:bg-white p-[0.75rem]">
                <div class="option-inner-container flex flex-1 gap-[0.625rem] px-[0.625rem] py-[0.563rem]">
                  <span
                    class="text-[0.875rem] font-medium leading-[1.25rem] text-[#0c111d] capitalize tracking-[0.01875rem] text-balance">
                    {{ option.label }}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>