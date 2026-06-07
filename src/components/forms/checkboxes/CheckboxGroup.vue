<template>
  <label class="cursor-pointer" :class="wrapperClass">
    <div class="flex items-center gap-2 flex-1 min-w-0">
      <input
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        class="flex-shrink-0"
        :class="checkboxClass"
        @change="$emit('update:modelValue', $event.target.checked)"
      />

      <img v-if="midImg" :src="midImg" alt="">
      
      <span :class="labelClass">
        <slot>
          {{ label }}
        </slot>
      </span>

      <span class="inline-flex items-center gap-2" v-if="tags && tags.length > 0">
        <div
          v-for="(tag, key) in tags"
          :key="key"
          :style="{ backgroundColor: tag.variant || '#ffffff' }"
          class="text-right font-medium text-xs leading-[1.125rem] inline-flex px-1.5 justify-center items-center gap-2.5 rounded-[3.125rem] dark:bg-dark-dash-published whitespace-nowrap"
          :class="tag.class || 'text-[#101828] dark:text-dark-dash-text'"
        >
          {{ tag.text }}
        </div>
      </span>
    </div>

    <span v-if="metaText" class="text-xs leading-normal font-medium whitespace-nowrap text-[#667085] dark:text-[#9e9689] ml-auto">
      {{ metaText }}
    </span>
    
  </label>
</template>

<script>
export default {
  name: "CheckboxGroup",
  props: {
    modelValue: { type: Boolean, default: false },
    label: { type: String, default: "" },
    disabled: { type: Boolean, default: false },
    checkboxClass: { type: String, default: "" },
    labelClass: { type: String, default: "" },
    wrapperClass: { type: String, default: "" },
    tags: { type: Array, default: () => [] },
    metaText: { type: String, default: "" } ,
    midImg: { type: String, default: "" }
  },
  emits: ["update:modelValue"],
};
</script>