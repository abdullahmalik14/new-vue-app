<script setup>
import { computed, ref } from "vue";
import Paragraph from "../default/Paragraph.vue";
import { CheckIcon } from "@heroicons/vue/24/outline";
import HexagonExclamationIcon from "@/components/icons/HexagonExclamationIcon.vue";

const emit = defineEmits(["update:modelValue", "click:right-icon"]);

const props = defineProps({
  modelValue: [String, Number],
  placeholder: String,
  type: { type: String, default: "text" },
  id: String,
  showLabel: { type: Boolean, default: false },
  labelText: { type: String, default: "" },
  labelClass: {
    type: String,
    default: "text-[#ffffff]",
  },  
  required: { type: Boolean, default: false },
  requiredDisplay: { type: [String, Array], default: "" },
  rightIcon: String,
  rightIconText: String,
  leftIcon: String,
  description: String,
  showErrors: Boolean,
  errors: {
    default: () => [],
  },
  onSuccess: Boolean,
  success: {
    type: Array,
    default: () => [],
  },
  textColor: {
    type: String,
    default: "text-white",
  },
  placeholderColor: {
    type: String,
    default: "placeholder:text-white",
  },
  labelColor: {
    type: String,
    default: "text-[#ffffff]",
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

// Track focus state
const isFocused = ref(false);

// Handle focus - hide placeholder
const handleFocus = () => {
  isFocused.value = true;
};

// Handle blur - show placeholder
const handleBlur = () => {
  isFocused.value = false;
};

// Computed placeholder that returns empty string when focused
const activePlaceholder = computed(() => {
  return isFocused.value ? "" : props.placeholder;
});

const requiredDisplayValues = computed(() => {
  if (!props.requiredDisplay) return [];
  return Array.isArray(props.requiredDisplay)
    ? props.requiredDisplay
    : [props.requiredDisplay];
});
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- Label -->
    <div v-if="showLabel" class="flex justify-between items-center w-full">
      <label :for="id" :class="[
        'text-sm leading-6 tracking-[0.009rem]',
        labelColor,
        labelClass !== 'text-[#ffffff]' ? labelClass : ''
      ]">
        {{ labelText }}
      </label>
      <span v-if="requiredDisplayValues.includes('*')" class="text-red-500">*</span>
      <span v-if="requiredDisplayValues.includes('italic-text')" class="text-[0.625rem] leading-6 text-right italic"
        :class="labelColor">
        Required
      </span>
    </div>

    <!-- Input Wrapper -->
    <div
      class="relative rounded-xl border border-white/20 bg-white/5 min-h-[3rem] gap-2.5 pt-3 pb-3 px-4 flex justify-center items-center self-stretch shadow-sm"
      :class="{ 'opacity-50 pointer-events-none': disabled }">
      <component v-if="leftIcon" :is="typeof leftIcon === 'string' ? 'img' : leftIcon"
        :src="typeof leftIcon === 'string' ? leftIcon : undefined" alt="icon"
        class="absolute left-2 top-[50%] transform -translate-y-1/2 pointer-events-none w-5 h-5" :class="textColor" />

      <input :id="id" :type="type" :value="modelValue" :placeholder="activePlaceholder" :required="required"
        :data-required="$attrs['data-required']" :disabled="disabled"
        class="w-full bg-transparent outline-none focus:outline-none focus:ring-0 focus:border-none poppins-medium transition-all"
        :class="[textColor, placeholderColor, leftIcon ? 'pl-8' : 'pl-1', rightIcon ? (rightIconText ? 'pr-16' : 'pr-8') : 'pr-3']" @input="$emit('update:modelValue', $event.target.value)"
        @focus="handleFocus" @blur="handleBlur" />

      <div v-if="rightIcon"
        class="absolute right-2 top-[50%] transform -translate-y-1/2 flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
        @click="$emit('click:right-icon')">
        <span v-if="rightIconText" class="text-xs font-medium poppins-medium" :class="textColor">{{ rightIconText
        }}</span>
        <component :is="typeof rightIcon === 'string' ? 'img' : rightIcon"
          :src="typeof rightIcon === 'string' ? rightIcon : undefined" alt="icon" class="w-5 h-5" :class="textColor" />
      </div>
    </div>

    <!-- Description -->
    <Paragraph v-if="description" :text="description" fontSize="text-sm" fontColor="text-white/80" class="mt-1" />

    <!-- Required Error Text -->
    <Paragraph v-if="requiredDisplayValues.includes('required-text-error')" :text="'This field is required.'"
      fontSize="text-xs" fontColor="text-[#FF4405]" />

    <!-- Validation Messages (Errors and Success combined) -->
    <div v-if="(showErrors && errors.length) || (onSuccess && success.length)"
      class="flex flex-col items-start self-stretch">
      <!-- Success List -->
      <div v-if="onSuccess && success.length" class="flex flex-col gap-1 w-full">
        <div v-for="(successObj, index) in success" :key="`success-${index}`"
          class="flex w-full items-center gap-[.4375rem]">
          <CheckIcon class="w-[1.125rem] h-[1.125rem] text-white flex-shrink-0" />
          <p class="text-white text-[12px] sm:text-[14px] font-normal">
            {{ successObj.message || successObj.text || successObj }}
          </p>
        </div>
      </div>

      <!-- Errors List -->
      <div v-if="showErrors && errors.length" :class="[
        'flex flex-col gap-1 w-full',
        onSuccess && success.length ? 'mt-2' : '',
      ]">
        <div v-for="(errorObj, index) in errors" :key="`error-${index}`"
          class="flex w-full items-center gap-[.4375rem]">
          <HexagonExclamationIcon />
          <p class="text-[#ff7c1e] text-[12px] sm:text-[14px] font-normal">
            {{ errorObj.error || errorObj.message || errorObj }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hide browser's default password reveal button for all browsers */
input[type="password"]::-webkit-credentials-auto-fill-button {
  display: none !important;
  visibility: hidden !important;
}

input[type="password"]::-ms-reveal {
  display: none !important;
  visibility: hidden !important;
}

input[type="password"]::-ms-clear {
  display: none !important;
  visibility: hidden !important;
}

/* Remove all focus borders and outlines - override global pink focus style */
input:focus,
input:focus-visible,
input:active {
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
}

/* Ensure wrapper doesn't change border on input focus */
div:has(input:focus) {
  border-color: inherit !important;
}
</style>
