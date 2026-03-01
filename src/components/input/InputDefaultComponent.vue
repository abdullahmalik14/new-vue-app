<template>
  <div v-bind="resolvedAttrs.wrapperAttrs.wrapper1">
    <div v-bind="resolvedAttrs.wrapperAttrs.wrapper2">
      <label v-if="showLabel" v-bind="resolvedAttrs.labelAttrs">
        {{ labelText }}
      </label>
      <span v-if="isOptional" class="text-xs italic text-slate-500">Optional</span>
      <span v-if="requiredDisplay === '*'" class="text-red-500">*</span>
      <span v-else-if="requiredDisplay === 'italic-text'" class="text-[0.625rem] leading-6 text-right italic">
        Required
      </span>
    </div>

    <div v-bind="resolvedAttrs.wrapperAttrs.wrapper3" class="relative" v-for="item in inputItems" :key="item.id">
      <component v-if="leftIcon && type !== 'checkbox' && type !== 'radio'" :is="leftIcon" class="w-4 h-4" />

      <span :class="leftSpanClass" v-if="leftSpan" class="text-sm font-semibold">{{ leftSpanText }}</span>

      <input v-bind="resolvedAttrs.inputAttrs" :id="item.id" :type="type" :value="modelValue" v-if="type !== 'textarea'"
        @input="(e) => $emit('update:modelValue', type === 'number' ? Number(e.target.value) : e.target.value)" 
      />
      
      <img v-if="error" src="https://i.ibb.co.com/yBMzbHWz/alert-circle.webp" alt="alert-circle" class="w-4 h-4 mr-2" />

      <div class="w-full" v-if="type === 'textarea' && !richTextEditor">
        <textarea id="textarea" @input="$emit('update:modelValue', $event.target.value)"
          class="w-full text-sm border-none focus:outline-none bg-transparent placeholder-text min-h-[5.5rem]"
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

      <span v-if="rightSpan" :class="rightSpanClass" class="text-sm whitespace-nowrap">{{ rightSpanText }}</span>

      <component v-if="rightIcon && type !== 'checkbox' && type !== 'radio'" :is="rightIcon"
        class="w-4 h-4 cursor-pointer" />
    </div>

    <p v-if="error && errorMessage" 
       class="text-xs mt-1" 
       :class="errorMessageClass ? errorMessageClass : 'text-red-500'"
    >
      {{ errorMessage }}
    </p>

    <p v-if="description && !error" v-bind="resolvedAttrs.descriptionAttrs" class="text-xs text-slate-500">
      {{ description }}
    </p>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { resolveAllConfigs } from "@/utils/componentRenderingUtils"; // Adjust path as needed
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";

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
              ? "border-b border-border rounded-input bg-white"
              : "flex items-center border-b rounded-input gap-2 focus-within:ring-3 focus-within:ring-primary/20 bg-white",
        
        // ✅ Logic: Agar error hai to Red border, warna normal border
        props.error ? "border-red-500 focus-within:!border-red-500 focus-within:!ring-red-500/20" : "border-border",
        
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
      // Agar props.inputClass mile to wo use kare, warna default black/medium use kare
      props.inputClass ? props.inputClass : "text-[#0C111D] font-medium",
      
      // ✅ Hide Number Spinners Class
      "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",

      (props.leftIcon ? "pl-10" : "pl-3.5"),
      (props.rightIcon ? "pr-10" : "pr-3")
    ].filter(Boolean).join(" "),
    
    addAttributes: {
      type: props.type,
    },
  },
  additionalConfig: {
    label: {
      addClass:
        props.type === "checkbox"
          ? "block text-sm font-medium "
          : props.type === "radio"
            ? "block text-sm font-medium text-gray-700"
            : "block text-sm font-medium ",
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