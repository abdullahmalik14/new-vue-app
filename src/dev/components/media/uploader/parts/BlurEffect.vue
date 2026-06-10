<template>
  <div class="h-[1.375rem] w-max cursor-pointer relative">
    <div
      class="cursor-pointer rounded-[0.8rem] border border-light-border"
      @click="toggleDropdown"
    >
      <div class="flex items-center justify-between gap-2 border-none p-[0.2rem_0.5rem]">
        <div class="flex max-w-fit flex-1 items-center gap-1">
          <div class="flex">
            <img
              src="https://i.ibb.co/RG1fv2YR/svgviewer-png-output-4.webp"
              alt="blur"
              class="h-4 w-4 "
            />
          </div>

          <div class="flex flex-1 flex-col overflow-hidden">
            <span class="flex flex-1 flex-col truncate text-center font-poppins text-xs font-normal leading-4 tracking-[0.01875rem] text-[#344054] capitalize">
              {{ modelValue }}
            </span>
          </div>
        </div>

        <div class="flex h-3 w-3 items-center justify-center">
          <img
            src="https://i.ibb.co/s93QRv59/svgviewer-png-output-5.webp"
            alt="dropdown arrow"
            class="h-3 w-3 transform transition-transform duration-200"
            :class="[isOpen ? 'rotate-0' : 'rotate-180', '']"
          />
        </div>
      </div>
    </div>

    <transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 transform scale-95"
      enter-to-class="opacity-100 transform scale-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 transform scale-100"
      leave-to-class="opacity-0 transform scale-95"
    >
      <div
        v-if="isOpen"
        class="blur-select-dropdown-menu absolute left-0 bottom-full mb-1 z-[9999] h-auto w-[5.3125rem] overflow-hidden rounded-lg border border-[rgba(186,188,203,0.5)] bg-white shadow-none transition-all duration-200 md:max-h-[8rem] md:overflow-y-auto"
      >
        <div class="flex w-full flex-col-reverse rounded-inherit">
          <div class="max-h-[24rem] overflow-y-auto rounded-sm bg-[#ececec] shadow-[0_0_12px_0_rgba(0,0,0,0.2)] backdrop-blur-[25px]">
            <div
              v-for="option in options"
              :key="option"
              class="blur-select-option flex items-center justify-center gap-2.5 self-stretch bg-[rgba(255,255,255,0.5)] p-0 hover:bg-transparent cursor-pointer"
              @click="selectOption(option)"
            >
              <div class="flex w-full flex-1 p-3 hover:rounded-none hover:bg-white">
                <div class="flex flex-1 flex-col overflow-hidden text-ellipsis whitespace-nowrap">
                  <span
                    class="blur-select-option-text text-center font-poppins text-xs font-medium leading-[1.125rem] text-[#344054] hover:text-darker-text"
                    :class="{ 'font-semibold': modelValue === option }"
                  >
                    {{ option }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '20px'
  }
});

const emit = defineEmits(['update:modelValue']);

const options = ['20px', '50px', '100px'];
const isOpen = ref(false);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (option) => {
  // 👇 Emit logic change ki hai
  emit('update:modelValue', option);
  isOpen.value = false;
};

// Click outside to close
const handleClickOutside = (event) => {
  const dropdown = event.target.closest('.blur-select-dropdown-menu');
  const trigger = event.target.closest('.cursor-pointer');
  
  if (!dropdown && !trigger && isOpen.value) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>