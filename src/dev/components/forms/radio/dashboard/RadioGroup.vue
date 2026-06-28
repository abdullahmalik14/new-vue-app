<template>
  <div class="space-y-3">
    <label v-if="label" class="block text-sm mb-2" :class="labelClass">
      {{ label }}
    </label>
    <div class="space-y-2">
      <BaseRadio
        v-for="option in options"
        :key="option.value"
        :model-value="modelValue"
        :value="option.value"
        :name="name"
        :label="option.label"
        :id="`${name}-${option.value}`"
        :version="version"
        :multiple="multiple"
        :radio-label-class="radioLabelClass"
        @update:model-value="$emit('update:modelValue', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import BaseRadio from './BaseRadio.vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Array],
    required: true,
  },
  name: {
    type: String,
    required: true
  },
  label: {
    type: String,
    default: ""
  },
  options: {
    type: Array,
    required: true
  },
  version: {
    type: String,
    required: true
  },
  radioLabelClass: {
    type: String,
    default: ""
  },
  labelClass: {
    type: String,
    default: "",
  },
  multiple: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue'])
</script>
