<script setup>
import { computed, ref, watch } from "vue";
import BaseParagraph from "../../ui/typography/BaseParagraph.vue";
import { CheckIcon } from "@heroicons/vue/24/outline";
import EyeIcon from "@heroicons/vue/24/outline/EyeIcon";
import EyeSlashIcon from "@heroicons/vue/24/outline/EyeSlashIcon";
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
  },
  interactionsConfig: {
    type: [Object, Array],
    default: undefined
  },
  rightIconInteractionsConfig: {
    type: [Object, Array],
    default: undefined
  }
});

// Track focus state
const isFocused = ref(false);

// Password visibility (Vue-bound type — avoids DOM toggleDisplay fighting :type prop)
const isPasswordVisible = ref(false);

watch(
  () => props.type,
  () => {
    isPasswordVisible.value = false;
  }
);

const resolvedInputType = computed(() => {
  if (props.type === "password" && isPasswordVisible.value) return "text";
  return props.type;
});

function handleRightIconClick() {
  if (props.type === "password" && !props.rightIconInteractionsConfig) {
    isPasswordVisible.value = !isPasswordVisible.value;
  }
  emit("click:right-icon");
}

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

// ─────────────────────────────────────────────
// Internal v-interactions config for password fields
// ─────────────────────────────────────────────
const internalEyeVisibilityConfig = computed(() => {
  if (props.type !== "password" || !props.id) return undefined;
  return Object.freeze([
    {
      triggerEvents: ["input"],
      rules: [{ type: "hasContent" }],
      onValid: { actionType: "show", targetSelector: `#${props.id}-eye` },
      onInvalid: { actionType: "hide", targetSelector: `#${props.id}-eye` },
    },
  ]);
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
      <span v-if="requiredDisplayValues.includes('italic-text')" class="text-[10px] leading-6 text-right italic"
        :class="labelColor">
        Required
      </span>
    </div>

    <!-- Input Wrapper -->
    <div
      class="relative rounded-xl border border-dee5ec bg-white/20 min-h-12 gap-2.5 py-3 px-2.5 flex justify-center items-center self-stretch shadow-sm focus-within:border-dee5ec"
      :class="{ 'opacity-50 pointer-events-none': disabled }">
      <component v-if="leftIcon" :is="typeof leftIcon === 'string' ? 'img' : leftIcon"
        :src="typeof leftIcon === 'string' ? leftIcon : undefined" alt="icon"
        class="absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none w-5 h-5" :class="textColor" />

      <input :id="id" :type="resolvedInputType" :value="modelValue" :placeholder="activePlaceholder" :required="required"
        :data-required="$attrs['data-required']" :disabled="disabled"
        class="w-full bg-transparent outline-none focus:outline-none focus:ring-0 focus:border-none placeholder:font-[400] [&::-webkit-credentials-auto-fill-button]:!hidden [&::-ms-reveal]:!hidden [&::-ms-clear]:!hidden"
        :class="[textColor, placeholderColor, leftIcon ? 'pl-8' : 'pl-1', rightIcon ? (rightIconText ? 'pr-16' : 'pr-8') : '', 'poppins-medium']"
        @input="$emit('update:modelValue', $event.target.value)" @focus="handleFocus" @blur="handleBlur"
        v-interactions="interactionsConfig || internalEyeVisibilityConfig" />

      <div v-if="rightIcon || $slots['right-icon'] || type === 'password'" :id="`${id}-eye`"
        class="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity [&[hidden]]:!hidden"
        v-interactions="rightIconInteractionsConfig || undefined"
        @click="handleRightIconClick">
        <span v-if="rightIconText" class="text-xs font-medium" :class="textColor">{{ rightIconText
        }}</span>
        <slot name="right-icon">
          <!-- Password icons default: shown if no slot is provided and type is password -->
          <template v-if="type === 'password' && !rightIcon">
            <span v-show="!isPasswordVisible" :id="`${id}-eye-icon`">
              <EyeSlashIcon class="w-5 h-5" :class="textColor" />
            </span>
            <span v-show="isPasswordVisible" :id="`${id}-eyeslash-icon`">
              <EyeIcon class="w-5 h-5" :class="textColor" />
            </span>
          </template>

          <component v-else-if="rightIcon" :is="typeof rightIcon === 'string' ? 'img' : rightIcon"
            :src="typeof rightIcon === 'string' ? rightIcon : undefined" alt="icon" class="w-5 h-5"
            :class="textColor" />
        </slot>
      </div>
    </div>

    <!-- Description -->
    <BaseParagraph v-if="description" :text="description" fontSize="text-sm" fontColor="text-white/80" class="mt-1" />

    <!-- Required Error Text -->
    <BaseParagraph v-if="requiredDisplayValues.includes('required-text-error')" :text="'This field is required.'"
      fontSize="text-xs" fontColor="text-[#FF4405]" />

    </div>
</template>
