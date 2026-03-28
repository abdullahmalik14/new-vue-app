<template>
  <div v-bind="resolvedAttrs.wrapperAttrs.wrapper1">
    <label v-if="showLabel" v-bind="resolvedAttrs.labelAttrs" class="flex justify-between items-center w-full mb-1.5">
      <span class="text-left text-white font-[500] text-[14px]" :class="labelClass">{{
        labelText
      }}</span>

      <span class="text-right">
        <Paragraph v-if="requiredDisplay === 'italic-text'" :text="requiredDisplayText" fontSize="text-xs"
          fontColor="text-gray-500" fontFamily="italic" :class="requiredClass" />
        <span v-else-if="requiredDisplay === '*'" class="text-red-500">*</span>
      </span>
    </label>

    <Paragraph v-if="optionalLabel" :text="optionalLabelText" fontSize="text-sm" fontWeight="font-normal"
      fontColor="text-white " shadow="opacity-70" :class="optionalLabelClass" />

    <!-- Input -->
    <div v-bind="resolvedAttrs.wrapperAttrs.wrapper3" class="">
      <!-- Left icon -->
      <div class="flex-1 w-full">
        <div class="flex items-center w-full">
          <component v-if="leftIcon" :is="leftIcon" class="w-5 h-5 text-white" :class="leftIconClass" />

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

        <textarea v-if="type === 'textarea'" v-bind="resolvedAttrs.inputAttrs" :rows="3" @input="
          $emit(
            'update:modelValue',
            ($event.target as HTMLInputElement).value
          )
          " :class="inputClass"></textarea>
      </div>

      <div>
        <!-- Right icon -->
        <div v-if="rightIcon" @click="clickableRightIcon ? $emit('rightIconClick') : null"
          :class="[clickableRightIcon ? 'cursor-pointer transition-colors' : '', 'text-white/70 hover:text-white', rightIconClass]">
          <component :is="rightIcon" class="w-5 h-5" />
        </div>

        <!-- right span -->
        <Paragraph v-if="rightSpan" :text="rightSpanText" :class="rightSpanClass" fontSize="text-base"
          fontWeight="font-medium" fontColor="" layoutClass="px-3 whitespace-nowrap" />
      </div>
    </div>

    <!-- Description -->

    <Paragraph v-if="description" :text="description" fontSize="text-sm" fontColor="text-white/80" :class="['mt-1', descriptionClass].filter(Boolean).join(' ')" />

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
          class="flex items-center w-full gap-[.4375rem] text-white" :class="successClass">
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
  labelClass: { type: String, default: "" },
  inputClass: { type: String, default: "" },
  descriptionClass: { type: String, default: "" },
  errorClass: { type: String, default: "" },
  successClass: { type: String, default: "" },
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
          : "flex flex-col",
      addAttributes: { "data-wrapper": "wrapper1" },
    },
    {
      targetAttribute: "wrapper2",
      addClass: "flex flex-col",
      addAttributes: { "data-wrapper": "wrapper2" },
    },
    {
      targetAttribute: "wrapper3",
      addClass:
        props.type === "textarea"
          ? `w-full px-4 py-3 h-[5.5rem] border rounded-xl border-white/20 bg-white/5 shadow-sm text-white transition-all overflow-hidden ${props.wrapperClass}`
          : `flex w-full items-center px-4 py-2 min-h-[3rem] border rounded-xl border-white/20 bg-white/5 shadow-sm gap-2.5 text-white transition-all overflow-hidden ${props.wrapperClass}`,
      addAttributes: { "data-wrapper": "wrapper3" },
    },
  ],
  elm: {
    addClass:
      props.type === "textarea"
        ? "w-full text-base font-normal text-white bg-transparent border-none focus:outline-none placeholder-white/50 placeholder:text-base placeholder:leading-6 placeholder:font-normal"
        : "flex-1 w-full text-base font-normal text-white bg-transparent border-none focus:outline-none placeholder-white/50 placeholder:text-base placeholder:leading-6 placeholder:font-normal",
    addAttributes: {
      type: props.type === "textarea" ? "textarea" : "text",
    },
  },
  additionalConfig: {
    label: {
      addClass:
        props.requiredDisplay === "italic-text"
          ? "flex items-center justify-between block text-[14px] font-[400] text-white italic"
          : "block text-[14px] font-[400] text-white ",
      addAttributes: {
        for: "input-id",
      },
    },
    description: {
      addClass: "text-sm text-white/80",
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
