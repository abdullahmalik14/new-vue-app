<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
  options: {
    type: Array,
    required: true,
  },
  variant: {
    type: String,
    default: "plan",
    validator: (value) => ["plan", "checkout"].includes(value),
  },
  widthClass: {
    type: String,
    default: "w-full",
  },
  placeholder: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: "",
  },
  labelClass: {
    type: String,
    default: "text-[#F9FAFB]",
  },
  selectedValueClass: {
    type: String,
    default: "text-[#F9FAFB]",
  },
  iconColor: {
    type: String,
    default: "bg-[#F9FAFB]",
  },
});

const emit = defineEmits(["update:modelValue"]);

const isOpen = ref(false);
const dropdownRef = ref(null);
const triggerWrapperRef = ref(null);
const openUpwards = ref(false);

const isCheckoutVariant = computed(() => props.variant === "checkout");

const resolvedPlaceholder = computed(() => {
  if (props.placeholder) return props.placeholder;
  return isCheckoutVariant.value ? "Select option" : "Select Option";
});

const selectedLabel = computed(() => {
  const selected = props.options.find((opt) => opt.value === props.modelValue);
  return selected ? selected.label : resolvedPlaceholder.value;
});

const toggleDropdown = () => {
  if (isOpen.value) {
    isOpen.value = false;
    return;
  }

  const positionRef = isCheckoutVariant.value ? triggerWrapperRef.value : dropdownRef.value;
  if (positionRef) {
    const rect = positionRef.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    openUpwards.value = spaceBelow < 250 && spaceAbove > spaceBelow;
  } else {
    openUpwards.value = false;
  }

  isOpen.value = true;
};

const selectOption = (option) => {
  emit("update:modelValue", option.value);
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

const handleResize = () => {
  if (isOpen.value) isOpen.value = false;
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <!-- Checkout variant (replaces BaseSelect) -->
  <div
    v-if="isCheckoutVariant"
    ref="dropdownRef"
    class="flex flex-col gap-1.5"
    :class="widthClass"
  >
    <label v-if="label" class="text-sm font-medium" :class="labelClass">
      {{ label }}
    </label>

    <div ref="triggerWrapperRef" class="relative w-full">
      <div
        class="dash-select__trigger w-full h-10 flex items-center gap-2 py-2 px-3 border-b border-[#D0D5DD] bg-white/10 shadow-[0_1px_2px_0_#1018280D] cursor-pointer"
        @click="toggleDropdown"
      >
        <span class="text-base flex-grow capitalize text-balance" :class="selectedValueClass">
          {{ selectedLabel }}
        </span>
        <div
          class="h-4 w-4 transition-transform duration-200 select-arrow shrink-0"
          :class="[{ 'rotate-180': isOpen }, iconColor]"
          :style="{
            maskImage: `url('https://i.ibb.co.com/qLW7tf3T/Arrows.webp')`,
            webkitMaskImage: `url('https://i.ibb.co.com/qLW7tf3T/Arrows.webp')`,
            maskSize: 'contain',
            webkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            webkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            webkitMaskPosition: 'center',
          }"
        ></div>
      </div>

      <div
        class="dash-options-container absolute left-0 right-0 z-50 w-full min-w-[15rem] shadow-lg transition-[opacity,transform] duration-200 ease-out"
        :class="[
          isOpen
            ? 'scale-100 opacity-100 pointer-events-auto visible'
            : 'scale-95 opacity-0 pointer-events-none invisible',
          openUpwards ? 'bottom-full mb-2 origin-bottom' : 'top-full mt-2 origin-top',
        ]"
      >
        <div class="rounded-[0.125rem] border border-[rgba(186,188,203,0.5)] bg-white">
          <div
            v-for="option in options"
            :key="option.value"
            @click.stop="selectOption(option)"
            class="option flex items-center justify-center gap-[0.625rem] hover:bg-white p-[0.75rem] cursor-pointer"
          >
            <div class="option-inner-container flex flex-1 gap-[0.625rem] px-[0.625rem] py-[0.563rem]">
              <span
                class="text-[0.875rem] font-medium leading-[1.25rem] text-[#0c111d] capitalize tracking-[0.01875rem] text-balance"
              >
                {{ option.label }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Plan variant (original BasePlanDropdown UI) -->
  <div
    v-else
    ref="dropdownRef"
    class="relative h-11 flex-shrink-0"
    :class="widthClass"
  >
    <div class="dash-select cursor-pointer" @click="toggleDropdown">
      <div
        class="dash-select__trigger h-11 flex items-center justify-between w-full px-3.5 border-r border-b border-b-[#EAECF0] rounded-t-sm bg-white/50 shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b80] dark:border-b-[#353a3c] border-r-[#D0D5DD] dark:border-r-[#3b4043]"
      >
        <span class="text-base font-medium text-[#0c111d] dark:text-[#dbd8d3]">
          {{ selectedLabel }}
        </span>
        <img
          src="https://i.ibb.co/2mXMQ5F/chevron-down.webp"
          alt="chevron-down"
          class="select-arrow w-5 h-5 transition-transform duration-300 ease-in-out transform"
          :class="{ 'rotate-180': isOpen }"
        />
      </div>

      <div
        class="dash-options-container absolute w-full transition-all duration-300 z-10 shadow-none border-none"
        :class="
          isOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'
        "
        :style="openUpwards ? { bottom: 'calc(100% + 0.5rem)', top: 'auto' } : { top: 'calc(100% + 0.5rem)', bottom: 'auto' }"
      >
        <div
          class="dash-options rounded-[2px] bg-white/70 backdrop-blur-[25px] max-h-[200px] overflow-y-auto dark:bg-[#181a1bb3]"
        >
          <div
            v-for="option in options"
            :key="option.value"
            @click.stop="selectOption(option)"
            class="dash-option flex items-center gap-2 h-12 px-3 border-b border-[#EAECF0] cursor-pointer hover:bg-white dark:hover:bg-[#181a1b] dark:border-[#353a3c]"
            :class="{ 'bg-white dark:bg-[#181a1b] selected': modelValue === option.value }"
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
