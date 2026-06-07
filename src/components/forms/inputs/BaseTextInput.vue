<template>
  <div v-bind="resolvedAttrs.wrapperAttrs.wrapper1">
    <div v-bind="resolvedAttrs.wrapperAttrs.wrapper2">
      <label v-if="showLabel" v-bind="resolvedAttrs.labelAttrs">
        {{ labelText }}
      </label>
      <span v-if="isOptional" class="text-xs italic text-white/70">Optional</span>
      <span v-if="requiredDisplay === '*'" class="text-red-500">*</span>
      <span v-else-if="requiredDisplay === 'italic-text'" class="text-[0.625rem] leading-6 text-right italic text-white/70">
        Required
      </span>
    </div>

    <div v-bind="resolvedAttrs.wrapperAttrs.wrapper3" class="relative" v-for="item in inputItems" :key="item.id">
      <component v-if="leftIcon && type !== 'checkbox' && type !== 'radio'" :is="leftIcon" class="w-5 h-5 text-white/70 shrink-0" />

      <span :class="leftSpanClass" v-if="leftSpan" class="text-sm font-semibold text-white">{{ leftSpanText }}</span>

      <input v-bind="resolvedAttrs.inputAttrs" :id="item.id" :type="type" :value="modelValue" v-if="type !== 'textarea'"
        @input="(e) => $emit('update:modelValue', type === 'number' ? Number(e.target.value) : e.target.value)" 
      />
      
      <img v-if="error" src="https://i.ibb.co.com/yBMzbHWz/alert-circle.webp" alt="alert-circle" class="w-5 h-5 shrink-0" />

      <div class="w-full flex" v-if="type === 'textarea' && !richTextEditor">
        <textarea id="textarea" @input="$emit('update:modelValue', $event.target.value)"
          class="w-full text-sm border-transparent focus:border-transparent focus:ring-0 bg-transparent outline-none text-white placeholder-white/50 min-h-[5.5rem] py-2.5 px-0 m-0 resize-y"
          placeholder="Enter multiline text"></textarea>
      </div>

      <div class="" v-if="type === 'textarea' && richTextEditor">
        <QuillEditor theme="snow" @input="$emit('update:modelValue', $event.target.value)"
          class="w-full text-sm border-none focus:outline-none bg-transparent placeholder-text min-h-[5.5rem]" />
      </div>

      <label v-if="['radio', 'checkbox'].includes(type)" :for="item.id" v-bind="resolvedAttrs.labelAttrs">
        <span v-if="type === 'checkbox'" :class="item.badge
            ? 'text-sm cursor-pointer flex items-baseline  '
            : 'text-sm cursor-pointer '
          ">
          <span>
            {{ item.label }}
          </span>
          <div v-if="item.badge"
            class="h-[1.125rem] flex justify-center items-center px-1.5 rounded-tag bg-published ml-2">
            <span class="text-xs font-medium">{{ item.badgeText }}</span>
          </div>
        </span>
        <span v-else>
          {{ item.label }}
        </span>
      </label>

      <span v-if="rightSpan" :class="rightSpanClass" class="text-sm whitespace-nowrap text-white">{{ rightSpanText }}</span>

      <component v-if="rightIcon && type !== 'checkbox' && type !== 'radio'" :is="rightIcon"
        class="w-5 h-5 text-white/70 cursor-pointer shrink-0" />
    </div>

    <!-- Validation Messages -->
    <div v-if="(showErrors && errors.length) || (onSuccess && success.length)" class="flex flex-col items-start self-stretch mt-1">
      <!-- Success List -->
      <div v-if="onSuccess && success.length" class="flex flex-col gap-1 w-full">
        <div v-for="(successObj, index) in success" :key="`success-${index}`"
          class="flex items-center w-full gap-[.4375rem] text-white">
          <component v-if="successObj.icon" :is="successObj.icon" class="w-[1.125rem] h-[1.125rem] flex-shrink-0" />
          <CheckIcon v-else class="w-[1.125rem] h-[1.125rem] flex-shrink-0 text-white" />
          <p class="text-[12px] sm:text-[14px] font-normal text-white">
            {{ successObj.message || successObj.text || successObj }}
          </p>
        </div>
      </div>

      <!-- Errors List -->
      <div v-if="showErrors && errors.length" class="flex flex-col gap-1 w-full" :class="onSuccess && success.length ? 'mt-2' : ''">
        <div v-for="(errorObj, index) in errors" :key="`error-${index}`"
          class="flex items-center w-full gap-[.4375rem] text-[#ff7c1e]">
          <component v-if="errorObj.icon" :is="errorObj.icon" class="w-[1.125rem] h-[1.125rem] flex-shrink-0" />
          <HexagonExclamationIcon v-else class="w-[1.125rem] h-[1.125rem] flex-shrink-0 text-[#ff7c1e]" />
          <p class="text-[12px] sm:text-[14px] font-normal text-[#ff7c1e]">
            {{ errorObj.error || errorObj.message || errorObj }}
          </p>
        </div>
      </div>
    </div>

    <!-- Legacy single error/desc -->
    <p v-if="error && errorMessage && !(showErrors && errors.length)" 
       class="text-xs mt-1" 
       :class="errorMessageClass ? errorMessageClass : 'text-[#ff7c1e]'"
    >
      {{ errorMessage }}
    </p>

    <p v-if="description && !error && !(showErrors && errors.length)" v-bind="resolvedAttrs.descriptionAttrs" class="text-xs text-white/80">
      {{ description }}
    </p>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { resolveAllConfigs } from "@/utils/componentRenderingUtils";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import HexagonExclamationIcon from "@/components/icons/HexagonExclamationIcon.vue";
import { CheckIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  modelValue: [String, Number, Boolean],
  version: String,
  badgeText: String,
  badge: Boolean,
  radioOptions: { type: Array, default: () => [] },
  addId: String,
  removeId: Boolean,
  addClass: String,
  removeClass: Boolean,
  addAttributes: Object,
  removeAttributes: { type: Array, default: () => [] },
  name: String,
  type: { type: String, default: "text" },
  placeholder: String,
  required: Boolean,
  autocomplete: String,
  showLabel: Boolean,
  labelText: { type: String, default: "Label" },
  requiredDisplay: String,
  isOptional: Boolean,
  richTextEditor: Boolean,
  description: String,
  leftIcon: [String, Object, Function],
  rightIcon: [String, Object, Function],
  rightSpan: Boolean,
  rightSpanText: String,
  rightSpanClass: String,
  leftSpan: Boolean,
  leftSpanText: String,
  leftSpanClass: String,
  radioValue: String,
  wrapperOverrides: { type: Array, default: () => [] },
  wrapper3Class: String,
  // ✅ New Props for Error Handling
  error: Boolean,
  errorMessage: String,
  errorMessageClass: String, // Dynamic class for error msg
  
  showErrors: Boolean,
  errors: {
    type: Array,
    default: () => [],
  },
  onSuccess: Boolean,
  success: {
    type: Array,
    default: () => [],
  },

  // ✅ New Prop for Text styling (optional override)
  inputClass: String
});

const inputConfig = {
  wrappers: [
    {
      targetAttribute: "wrapper1",
      addClass:
        props.type === "checkbox"
          ? "flex flex-col gap-1.5"
          : props.type === "radio"
            ? "flex flex-col gap-[0.375rem] flex-1 self-stretch"
            : "flex flex-col gap-1.5",
      addAttributes: { "data-wrapper": "wrapper1" },
    },
    {
      targetAttribute: "wrapper2",
      addClass:
        props.type === "checkbox"
          ? "flex flex-col gap-4"
          : props.type === "radio"
            ? "flex flex-col gap-2"
            : props.isOptional
              ? "flex justify-between items-center"
              : "flex gap-2",
      addAttributes: { "data-wrapper": "wrapper2" },
    },
    {
      targetAttribute: "wrapper3",
      addClass: [
        props.type === "checkbox"
          ? "flex items-start gap-2"
          : props.type === "radio"
            ? "flex items-center gap-2 relative"
            : props.richTextEditor
              ? "border border-white/20 rounded-xl bg-white/5 overflow-hidden text-white shadow-sm"
              : "flex items-center min-h-[3rem] px-4 py-2 border border-white/20 rounded-xl gap-2.5 focus-within:ring-2 focus-within:ring-[#07f468]/50 focus-within:border-[#07f468] bg-white/5 shadow-sm transition-all overflow-hidden text-white",
        
        // ✅ Logic: Agar error hai to Orange border, warna normal border
        props.error || (props.showErrors && props.errors.length) ? "!border-[#ff7c1e] focus-within:!border-[#ff7c1e] focus-within:!ring-[#ff7c1e]/20" : "border-white/20",
        
        props.wrapper3Class
      ].filter(Boolean).join(" "),
      addAttributes: { "data-wrapper": "wrapper3" },
    },
  ],
  elm: {
    addClass: [
      props.type === "checkbox"
        ? "w-4 min-w-4 h-4 cursor-pointer accent-primary"
        : props.type === "radio"
          ? "relative pl-8 cursor-pointer text-[0.938rem] font-medium leading-6 text-gray-900 "
          : "flex-1 border-none focus:outline-none bg-transparent placeholder-text",
      
      // ✅ Added default text color and weight styling (Dynamic)
      // Agar props.inputClass mile to wo use kare, warna default white/medium use kare
      props.inputClass ? props.inputClass : "text-white font-medium py-2.5",
      
      // ✅ Hide Number Spinners Class
      "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-w-0"

    ].filter(Boolean).join(" "),
    
    addAttributes: {
      type: props.type,
    },
  },
  additionalConfig: {
    label: {
      addClass:
        props.type === "checkbox"
          ? "block text-sm font-medium text-white"
          : props.type === "radio"
            ? "block text-sm font-medium text-white/80"
            : "block text-sm font-medium text-white",
      addAttributes: {
        for: "input-id",
      },
    },
    description: {
      addClass: "text-xs text-slate-500",
      addAttributes: {
        "data-description": "true",
      },
    },
  },
};

const resolvedAttrs = computed(() =>
  resolveAllConfigs(inputConfig, props.version, props)
);

const inputItems = computed(() => {
  if (
    (props.type === "radio" || props.type === "checkbox") &&
    props.radioOptions?.length
  ) {
    return props.radioOptions.map((option) => ({
      label: option.label,
      value: option.value,
      badge: option.badge,
      badgeText: option.badgeText,
      id: `${props.addId || resolvedAttrs.value.inputAttrs.id}-${option.value}`,
    }));
  }

  return [
    {
      label: props.labelText || "",
      value: props.modelValue,
      badge: props.badge,
      badgeText: props.badgeText,
      id: props.addId || resolvedAttrs.value.inputAttrs.id,
    },
  ];
});
</script>