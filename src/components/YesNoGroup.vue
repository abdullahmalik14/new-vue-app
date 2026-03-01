<template>
  <div class="row" style="gap:0.5rem; align-items:center;">
    <span v-if="label" class="muted">{{ label }}:</span>
    <button
      type="button"
      class="btn small"
      :class="{ active: modelValue === true }"
      @click="$emit('update:modelValue', true)"
    >
      Yes
    </button>
    <button
      type="button"
      class="btn small"
      :class="{ active: modelValue === false }"
      @click="$emit('update:modelValue', false)"
    >
      No
    </button>
    <button
      type="button"
      class="btn small"
      :class="{ active: modelValue === null }"
      @click="$emit('update:modelValue', null)"
    >
      Clear
    </button>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  modelValue: [Boolean, null]
});

defineEmits(['update:modelValue']);
</script>
