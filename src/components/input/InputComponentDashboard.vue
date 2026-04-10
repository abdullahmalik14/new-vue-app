<template>
  <div v-bind="resolvedAttrs.wrapperAttrs.wrapper1" class="gap-1.5">
    <label v-if="showLabel" v-bind="resolvedAttrs.labelAttrs" class="flex justify-between items-center w-full ">
      <span class="text-left font-[500] text-[14px]" :class="labelClass">{{
        labelText
      }}</span>

      <span class="text-right">
        <Paragraph v-if="requiredDisplay === 'italic-text'" :text="requiredDisplayText" fontSize="text-xs"
          fontColor="text-gray-500" fontFamily="italic" :class="requiredClass" />
        <span v-else-if="requiredDisplay === '*'" class="text-red-500">*</span>
      </span>
    </label>

    <Paragraph v-if="optionalLabel" :text="optionalLabelText" fontSize="text-sm" fontWeight="font-normal"
      fontColor="" shadow="opacity-70" :class="optionalLabelClass" />

    <!-- Input -->
    <div v-bind="resolvedAttrs.wrapperAttrs.wrapper2" class="">
      <!-- Left icon -->
      <div class="flex-1 w-full">
        <div class="flex items-center w-full">
          <component v-if="leftIcon" :is="leftIcon" class="w-5 h-5" :class="leftIconClass" />

          <!-- left span -->

          <Paragraph v-if="leftSpan" :text="leftSpanText" :class="leftSpanClass" fontSize="text-base"
            fontWeight="font-bold" fontColor="" layoutClass="whitespace-nowrap" />
          <input v-bind="resolvedAttrs.inputAttrs" :id="addId || resolvedAttrs.inputAttrs.id" :value="modelValue"
            :type="type" v-if="type !== 'textarea'" @input="
              $emit(
                'update:modelValue',
                ($event.target as HTMLInputElement).value
              )
              " :class="[leftIcon ? 'pl-1' : 'pl-0', rightIcon ? 'pr-1' : 'pr-0', inputClass]" />
        </div>

        <textarea v-if="type === 'textarea'" v-bind="resolvedAttrs.inputAttrs" :rows="textAreaRows" @input="
          $emit(
            'update:modelValue',
            ($event.target as HTMLInputElement).value
          )
          " :class="inputClass"></textarea>
      </div>

      <div>
        <!-- Right icon -->
        <div v-if="rightIcon" @click="clickableRightIcon ? $emit('rightIconClick') : null"
          :class="[clickableRightIcon ? 'cursor-pointer transition-colors' : '', 'opacity-70 hover:opacity-100', rightIconClass]">
          <component :is="rightIcon" class="w-5 h-5" />
        </div>

        <!-- right span -->
        <Paragraph v-if="rightSpan" :text="rightSpanText" :class="rightSpanClass" fontSize="text-base"
          fontWeight="font-medium" fontColor="" layoutClass="px-3 whitespace-nowrap" />
      </div>
    </div>

    <!-- Description -->

    <Paragraph v-if="description" :text="description" fontSize="text-sm" fontColor="" :class="['mt-1 opacity-80', descriptionClass].filter(Boolean).join(' ')" />

    <!-- required-error-text -->
    <Paragraph v-if="requiredDisplay === 'required-text-error'" text="This field is required." fontSize="text-xs"
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
import { computed, type Component } from "vue";
import { resolveAllConfigs } from "@/utils/componentRenderingUtils";
import Paragraph from "../default/Paragraph.vue";
import HexagonExclamationIcon from "@/components/icons/HexagonExclamationIcon.vue";
import { CheckIcon } from "@heroicons/vue/24/outline";

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

  // Label
  showLabel: Boolean,
  labelText: { type: String, default: "Label" },
  requiredDisplay: { type: String, default: "" }, // "*" or "italic-text"
  requiredDisplayText: { type: String, default: "" },

  optionalLabel: { type: Boolean, default: "" },
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

  // Wrapper overrides
  wrapperOverrides: { type: Array as () => any[], default: () => [] },
});

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
      addClass: `flex ${props.type === 'textarea' ? 'items-start pt-2' : 'items-center h-10'} gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] ${props.wrapperClass}`,
      addAttributes: { "data-wrapper": "wrapper2" },
    },
  ],
  elm: {
    addClass:
      props.type === "textarea"
        ? "w-full text-base font-normal bg-transparent border-none focus:outline-none placeholder:text-base placeholder:leading-6 placeholder:font-normal"
        : "flex-1 w-full text-base font-normal bg-transparent border-none focus:outline-none placeholder:text-base placeholder:leading-6 placeholder:font-normal",
    addAttributes: {
      type: props.type === "textarea" ? "textarea" : "text",
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
