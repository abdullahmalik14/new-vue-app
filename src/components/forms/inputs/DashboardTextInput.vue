<template>
  <div v-bind="resolvedAttrs.wrapperAttrs.wrapper1" class="gap-1.5 w-full">
    <label v-if="showLabel" v-bind="resolvedAttrs.labelAttrs" class="flex justify-between items-center w-full ">
      <span class="text-left font-[500] text-[14px]" :class="labelClass">{{
        labelText
      }}</span>

      <span class="text-right flex items-center">
        <BaseParagraph v-if="requiredDisplay === 'italic-text'" :text="resolvedRequiredDisplayText" fontSize="text-xs"
          fontColor="text-gray-500" fontFamily="italic" :class="requiredClass" />
        <span v-else-if="requiredDisplay === '*'" class="text-red-500">*</span>
        <span v-if="optionalLabel" class="text-xs leading-normal italic text-[#667085] dark:text-[#9e9589]" :class="optionalLabelClass">
          {{ resolvedOptionalLabelText }}
        </span>
      </span>
    </label>


    <!-- Input -->
    <div v-bind="resolvedAttrs.wrapperAttrs.wrapper2" class="">
      <!-- Left icon -->
      <div class="flex-1 w-full">
        <div class="flex items-center w-full gap-2">
          <img v-if="leftIcon && typeof leftIcon === 'string'" :src="leftIcon" alt="" class="w-5 h-5 shrink-0" :class="leftIconClass" />
          <component v-else-if="leftIcon" :is="leftIcon" class="w-5 h-5 shrink-0" :class="leftIconClass" />

          <!-- left span -->

          <BaseParagraph v-if="leftSpan" :text="leftSpanText" :class="leftSpanClass" fontSize="text-base"
            fontWeight="font-bold" fontColor="" layoutClass="whitespace-nowrap" />
          <div v-if="type !== 'textarea'" class="relative flex-1 min-w-0">
            <input v-bind="resolvedAttrs.inputAttrs" :id="addId || resolvedAttrs.inputAttrs.id" :value="modelValue"
              :type="type" :maxlength="maxLength" :disabled="disabled" @input="
                $emit(
                  'update:modelValue',
                  ($event.target as HTMLInputElement).value
                )
                " :class="[leftIcon ? 'pl-1' : 'pl-0', numberInputPaddingClass, inputClass, autofillClass, disabled ? 'opacity-50 cursor-not-allowed' : '']" />
            <div v-if="showNumberControls"
              class="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 select-none">
              <button type="button" @click="stepUp" :disabled="disabled"
                class="text-gray-500 hover:text-[#101828] dark:hover:text-[#d6d3cd] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                tabindex="-1" aria-label="Increase value">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                  <path d="M1 5L5 1L9 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </button>
              <button type="button" @click="stepDown" :disabled="disabled"
                class="text-gray-500 hover:text-[#101828] dark:hover:text-[#d6d3cd] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                tabindex="-1" aria-label="Decrease value">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <textarea v-if="type === 'textarea'" v-bind="resolvedAttrs.inputAttrs" :rows="textAreaRows" :maxlength="maxLength" :disabled="disabled" @input="
          $emit(
            'update:modelValue',
            ($event.target as HTMLInputElement).value
          )
          " :class="[inputClass, autofillClass, disabled ? 'opacity-50 cursor-not-allowed' : '']"></textarea>
      </div>

      <div v-if="hasTrailingSlot" class="flex items-center gap-2 shrink-0">
        <!-- Tooltip (DropdownMenu floating layer — see DemoDropdowns.vue) -->
        <div v-if="showTooltip" class="flex items-center justify-center min-w-[1rem]">
          <div ref="tooltipAnchor"
            class="cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
            tabindex="0"
            :aria-label="tooltipText || 'More information'">
            <img v-if="typeof tooltipIcon === 'string'" :src="tooltipIcon" alt="" class="w-4 h-4">
            <component v-else :is="tooltipIcon" class="w-4 h-4" />
          </div>
          <DropdownMenu :anchor="tooltipAnchor" :config="tooltipMenuConfig" @repositioned="onTooltipRepositioned">
            <div class="relative p-1">
              <div v-if="actualTooltipPlacement === 'top'"
                class="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#101828B2] dark:border-t-[rgba(14,19,32,0.9)]">
              </div>
              <div v-if="actualTooltipPlacement === 'bottom'"
                class="absolute left-1/2 -translate-x-1/2 -top-2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-[#101828B2] dark:border-b-[rgba(14,19,32,0.9)]">
              </div>
              <p class="text-xs leading-normal font-medium text-white dark:text-[#dbd8d3]">
                {{ tooltipText }}
              </p>
            </div>
          </DropdownMenu>
        </div>

        <!-- Right icon -->
        <div v-if="rightIcon" @click="clickableRightIcon ? $emit('rightIconClick') : null"
          :class="[clickableRightIcon ? 'cursor-pointer transition-colors' : '', isRightIconAsset ? '' : 'opacity-70 hover:opacity-100', rightIconClass]">
          <img v-if="isRightIconAsset" :src="rightIcon as string" alt="" class="w-5 h-5" />
          <component v-else :is="rightIcon" class="w-5 h-5" />
        </div>

        <!-- right span -->
        <BaseParagraph v-if="rightSpan" :text="rightSpanText" :class="rightSpanClass" fontSize="text-base"
          fontWeight="font-medium" fontColor="" layoutClass="px-3 whitespace-nowrap" />
      </div>
    </div>

    <!-- Description -->

    <BaseParagraph v-if="description" :text="description" fontSize="text-sm" fontColor="" :class="['mt-1 opacity-80', descriptionClass].filter(Boolean).join(' ')" />

    <BaseParagraph v-if="characterCountText" :text="characterCountText" fontSize="text-sm" fontColor="" :class="['mt-1', descriptionClass].filter(Boolean).join(' ')" />

    <!-- required-error-text -->
    <BaseParagraph v-if="requiredDisplay === 'required-text-error'" text="This field is required." fontSize="text-xs"
      fontColor="text-[#FF4405]" layoutClass="inline-flex items-center leading-loose" />

    <!-- error-fields-container -->
    <div class="flex flex-col items-start self-stretch gap-1 pt-1 pb-2" v-if="showErrors && errors.length">
      <div class="flex flex-col gap-1 w-full">
        <div v-for="(errorObj, index) in errors" :key="index"
          class="flex items-center w-full gap-[.4375rem] text-[#ff7c1e]" :class="errorClass">
          <component v-if="errorObj.icon" :is="errorObj.icon" class="w-[1.125rem] h-[1.125rem] flex-shrink-0" />
          <HexagonExclamationIcon v-else class="w-[1.125rem] h-[1.125rem] flex-shrink-0" />
          <p class="text-[12px] sm:text-[14px] font-normal">
            {{ errorObj.error || errorObj.message || errorObj }}
          </p>
        </div>
      </div>
    </div>

    <!-- success-fields-container -->
    <div class="flex flex-col items-start self-stretch gap-1 pt-1 pb-2" v-if="onSuccess && success.length">
      <div class="flex flex-col gap-1 w-full">
        <div v-for="(successObj, index) in success" :key="index"
          class="flex items-center w-full " :class="successClass">
          <component v-if="successObj.icon" :is="successObj.icon" class="w-[1.125rem] h-[1.125rem] flex-shrink-0" />
          <CheckIcon v-else class="w-[1.125rem] h-[1.125rem] flex-shrink-0" />
          <p class="text-[12px] sm:text-[14px] font-normal">
            {{ successObj.message || successObj.text || successObj }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component, ref } from "vue";
import { resolveAllConfigs } from "@/utils/componentRenderingUtils";
import BaseParagraph from "../../ui/typography/BaseParagraph.vue";
import HexagonExclamationIcon from "@/components/icons/HexagonExclamationIcon.vue";
import { CheckIcon, InformationCircleIcon } from "@heroicons/vue/24/outline";
import DropdownMenu from "@/components/ui/dropdowns/DropdownMenu.vue";

const props = defineProps({
  modelValue: [String, Number],
  version: { type: String, default: "" },

  // Input attributes
  addId: String,
  removeId: Boolean,
  addClass: String,
  removeClass: Boolean,
  addAttributes: Object,
  removeAttributes: { type: Array as () => string[], default: () => [] },

  // Standard HTML input props
  type: { type: String, default: "text" },
  name: String,
  placeholder: String,
  required: Boolean,
  autocomplete: String,
  disabled: { type: Boolean, default: false },
  showControls: { type: Boolean, default: true },
  numberStep: { type: Number, default: 1 },
  numberMin: { type: Number, default: 0 },

  // Label
  showLabel: Boolean,
  labelText: { type: String, default: "Label" },
  requiredDisplay: { type: String, default: "" }, // "*" or "italic-text"
  requiredDisplayText: { type: String, default: "" },

  optionalLabel: { type: Boolean, default: false },
  optionalLabelText: { type: String, default: "" },

  showErrors: Boolean,
  errors: {
    type: Array as () => {
      error?: string;
      message?: string;
      icon?: String | Object | Function | Component;
    }[],
    required: false,
    default: () => [],
  },

  onSuccess: Boolean,
  success: {
    type: Array as () => {
      message?: string;
      text?: string;
      icon?: String | Object | Function | Component;
    }[],
    required: false,
    default: () => [],
  },

  // Description
  description: String,

  // Icons
  leftIcon: [String, Object, Function],
  leftIconClass: { type: String, default: "" },
  rightIcon: [String, Object, Function],
  rightIconClass: { type: String, default: "" },
  clickableRightIcon: { type: Boolean, default: false },

  // Tooltip
  showTooltip: { type: Boolean, default: false },
  tooltipText: { type: String, default: "" },
  tooltipIcon: { type: [String, Object, Function], default: () => InformationCircleIcon },
  tooltipPlacement: { type: String, default: "top" },
  tooltipHoverIntentMs: { type: Number, default: 80 },

  //spans
  rightSpan: { type: Boolean, default: false },
  rightSpanText: { type: String, default: "" },
  rightSpanClass: { type: String, default: "" },
  leftSpan: { type: Boolean, default: false },
  leftSpanText: { type: String, default: "" },
  leftSpanClass: { type: String, default: "" },

  // New Class overriders
  labelClass: { type: String, default: "text-sm font-medium text-[#667085] dark:text-[#9e9589]" },
  inputClass: { type: String, default: "w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans" },
  descriptionClass: { type: String, default: "text-xs leading-normal text-[#475467] md:text-sm dark:text-[#b1aba0]" },
  errorClass: { type: String, default: "" },
  successClass: { type: String, default: "gap-[.4375rem]  text-success" },
  requiredClass: { type: String, default: "" },
  optionalLabelClass: { type: String, default: "" },
  wrapperClass: { type: String, default: "" },

  textAreaRows: { type: String, default: "3" },
  maxLength: { type: Number, default: undefined },

  // Wrapper overrides
  wrapperOverrides: { type: Array as () => any[], default: () => [] },
});

const emit = defineEmits(['update:modelValue', 'rightIconClick']);

const tooltipAnchor = ref<HTMLElement | null>(null);
const actualTooltipPlacement = ref(props.tooltipPlacement || 'top');

const resolvedRequiredDisplayText = computed(() =>
  props.requiredDisplayText || 'Required',
);

const resolvedOptionalLabelText = computed(() => {
  if (!props.optionalLabel) return '';
  return props.optionalLabelText || 'Optional';
});

const characterCountText = computed(() => {
  if (!props.maxLength) return null;
  const length = String(props.modelValue ?? '').length;
  return `${length}/${props.maxLength} characters`;
});

const isRightIconAsset = computed(() => typeof props.rightIcon === 'string');

const showNumberControls = computed(
  () => props.type === 'number' && props.showControls,
);

const hasTrailingSlot = computed(
  () => Boolean(props.rightIcon || props.showTooltip || props.rightSpan),
);

const numberInputPaddingClass = computed(() => {
  if (showNumberControls.value) {
    // ~10px stepper at right-0; wrapper pr-3 mirrors pl-3
    return 'pr-5';
  }
  return 'pr-0';
});

const tooltipMenuConfig = computed(() => ({
  trigger: 'hover',
  hoverIntentMs: props.tooltipHoverIntentMs,
  layer: 'tooltip',
  theme: 'tooltip-dark',
  width: 250,
  offset: 12,
  positionMode:
    props.tooltipPlacement === 'top'
      ? 'above'
      : props.tooltipPlacement === 'bottom'
        ? 'below'
        : 'adaptive',
  align: 'center',
  flipOnOverflow: true,
  ariaRole: 'tooltip',
  scrollEnabled: false,
  closeOnScroll: false,
  animation: 'fade',
}));

const autofillClass =
  'autofill:shadow-[inset_0_0_0_1000px_rgba(255,255,255,0.5)] autofill:[-webkit-text-fill-color:#101828] dark:autofill:shadow-[inset_0_0_0_1000px_rgba(24,26,27,0.5)] dark:autofill:[-webkit-text-fill-color:#d6d3cd]';

function onTooltipRepositioned(event: any) {
  actualTooltipPlacement.value = event.placement;
}

function stepUp() {
  if (props.disabled) return;
  const currentVal = Number(props.modelValue) || 0;
  emit('update:modelValue', currentVal + props.numberStep);
}

function stepDown() {
  if (props.disabled) return;
  const currentVal = Number(props.modelValue) || 0;
  const nextVal = currentVal - props.numberStep;
  if (nextVal >= props.numberMin) {
    emit('update:modelValue', nextVal);
  }
}

// Input component config for dashboard styling
const inputConfig = {
  wrappers: [
    {
      targetAttribute: "wrapper1",
      addClass:
        props.type === "textarea"
          ? "flex flex-col gap-[0.375rem] flex-1 self-stretch"
          : "flex flex-col ",
      addAttributes: { "data-wrapper": "wrapper1" },
    },
    {
      targetAttribute: "wrapper2",
      addClass: `flex ${props.type === 'textarea' ? 'items-start' : 'items-center h-11'} gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 pl-3 pr-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] ${props.disabled ? 'opacity-60 pointer-events-none' : ''} ${props.wrapperClass}`,
      addAttributes: { "data-wrapper": "wrapper2" },
    },
  ],
  elm: {
    addClass:
      props.type === "textarea"
        ? "w-full text-base font-normal bg-transparent border-none focus:outline-none placeholder:text-base placeholder:leading-6 placeholder:font-normal"
        : "flex-1 w-full text-base font-normal bg-transparent border-none focus:outline-none placeholder:text-base placeholder:leading-6 placeholder:font-normal",
    addAttributes: {
      type: props.type === "textarea" ? "textarea" : props.type,
    },
  },
  additionalConfig: {
    label: {
      addClass:
        props.requiredDisplay === "italic-text"
          ? "flex items-center justify-between block text-[14px] font-[400] italic"
          : "block text-[14px] font-[400]",
      addAttributes: {
        for: "input-id",
      },
    },
    description: {
      addClass: "text-sm",
      addAttributes: {
        "data-description": "true",
      },
    },
  },
};

// Resolve attributes with utility function
const resolvedAttrs = computed(() =>
  resolveAllConfigs(inputConfig, props.version, props)
);
</script>

<style scoped>
/* Hide native spin buttons — custom stepper used instead (BaseInput pattern) */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}

input[type="number"]::-webkit-textfield-decoration-container {
  display: none;
}
</style>
