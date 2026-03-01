<template>
  <div class="space-y-3">
    <label v-if="label" class="block text-sm mb-2" :class="labelClass">
      {{ label }}
    </label>
    <div class="space-y-2">
      <Radio v-for="option in options" :key="option.value" :model-value="modelValue" :value="option.value" :name="name"
        :label="option.label" :id="`${name}-${option.value}`" :version="version" :radio-label-class="radioLabelClass"
        @update:model-value="$emit('update:modelValue', $event)" />
    </div>
  </div>
</template>

<script setup>
import Radio from './Radio.vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true
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
    default: ""
  }
})

defineEmits(['update:modelValue'])
</script>
