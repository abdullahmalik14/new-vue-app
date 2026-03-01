<template>
  <div v-bind="resolvedAttrs.wrapperAttrs.wrapper1">
    <div v-bind="resolvedAttrs.wrapperAttrs.wrapper2">
      <input :id="id" type="radio" :name="name" :value="value" :checked="modelValue === value"
        @change="$emit('update:modelValue', value)" class="hidden peer" :class="resolvedAttrs.inputAttrs.class" />
      <label v-if="label" :for="id" :class="[resolvedAttrs.labelAttrs.class, radioLabelClass]">
        {{ label }}
      </label>
    </div>
  </div>
</template>

<script setup>
import { resolveAllConfigs } from "@/utils/componentRenderingUtils";
import { computed } from "vue";

const props = defineProps({
  modelValue: [String, Number],
  value: [String, Number],
  name: String,
  label: String,
  id: String,
  radioLabelClass: String,
  version: String,
  addId: String,
  removeId: Boolean,
  addClass: String,
  removeClass: Boolean,
  addAttributes: Object,
  removeAttributes: Array,
  wrapperOverrides: Array,
});

const inputConfig = {
  wrappers: [
    {
      targetAttribute: "wrapper1",
      addClass:
        props.version === "dashboard"
          ? "flex flex-col gap-2" // untouched
          : props.version === "auth"
            ? "flex flex-col gap-[0.375rem] flex-1 self-stretch"
            : "flex flex-col gap-1.5",
      addAttributes: { "data-wrapper": "wrapper1" },
    },
    {
      targetAttribute: "wrapper2",
      addClass:
        props.version === "dashboard"
          ? "flex items-center gap-2" // removed relative
          : props.version === "auth"
            ? "flex flex-col gap-2"
            : "flex gap-2",
      addAttributes: { "data-wrapper": "wrapper2" },
    },
  ],
  elm: {
    addClass: "cursor-pointer", // sr-only, peer, pseudo-elements hata di
    addAttributes: {
      type: "radio", // always radio
      name: props.name, // ensure group works
    },
  },
  additionalConfig: {
    label: {
      addClass:
        props.version === "dashboard"
          ? "cursor-pointer" // removed pseudo-element styling
          : props.version === "auth"
            ? "block "
            : "block ",
      addAttributes: {
        for: props.id,
      },
    },
    description: {
      addClass: "text-xs text-slate-500 dark:text-dark-text",
      addAttributes: {
        "data-description": "true",
      },
    },
  },
};

const resolvedAttrs = computed(() =>
  resolveAllConfigs(inputConfig, props.version, props)
);

defineEmits(["update:modelValue"]);
</script>
