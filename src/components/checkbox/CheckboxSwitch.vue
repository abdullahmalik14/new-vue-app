<template>
  <div v-bind="resolvedAttrs.wrapperAttrs.wrapper1">
    <label v-if="showWrapperLabel" class="block text-sm font-medium text-gray-900">
      {{ wrapperLabel }}
    </label>

    <div class="flex gap-4">
      <label :class="['relative inline-block mt-1 shrink-0', switchWrapperClass || 'w-8 h-4 ']">
        <input
          type="checkbox"
          class="peer h-0 w-0 opacity-0"
          :id="id"
          :checked="modelValue"
          @change="toggle"
        />
        
        <span
          :class="[
            'absolute cursor-pointer transition-all duration-100 ease-in-out', // Structural Classes (Fixed)
            trackClass || 'top-0 left-0 right-0 bottom-0 bg-[#98A2B3] rounded-[0.75rem] peer-checked:bg-[#101828]' // Default Visuals (Overridable)
          ]"
        ></span>

        <span
          :class="[
            'absolute top-1/2 bg-white transition-all duration-100 ease-in-out transform -translate-y-1/2', // Structural Classes (Fixed)
            knobClass || 'w-3 h-3 left-[0.125rem] rounded-full shadow-dash-toggle peer-checked:translate-x-[1rem]' // Default Visuals (Overridable)
          ]"
        ></span>
      </label>

      <label
        :for="id"
        :class="[
          'cursor-pointer',
          labelClass || 'text-sm sm:text-base font-medium  text-dash-gray-900',
        ]"
      >
        {{ label }}
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { resolveAllConfigs } from "@/utils/componentRenderingUtils";

const props = defineProps<{
  modelValue: boolean;
  label?: string;
  id?: string;
  showWrapperLabel?: boolean;
  wrapperLabel?: string;
  version: string;
  
  // Styling Props
  trackClass?: string;
  knobClass?: string;
  labelClass?: string;
  switchWrapperClass?: string; 
  
  // Standard props...
  addId?: string;
  removeId?: boolean;
  addClass?: string;
  removeClass?: boolean;
  addAttributes?: object;
  removeAttributes?: string[];
  wrapperOverrides?: any[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const toggle = () => {
  emit("update:modelValue", !props.modelValue);
};

// Wrapper config same as before
const inputConfig = {
  wrappers: [
    { targetAttribute: "wrapper1", addClass: "flex flex-col gap-[0.375rem] self-stretch", addAttributes: { "data-wrapper": "wrapper1" } },
    { targetAttribute: "wrapper2", addClass: "flex items-center gap-2", addAttributes: { "data-wrapper": "wrapper2" } },
  ],
  elm: { addClass: "opacity-0 w-0 h-0 peer" },
  additionalConfig: {
    label: { addClass: "text-base font-medium text-gray-900 cursor-pointer", addAttributes: { for: "input-id" } },
  },
};

const resolvedAttrs = computed(() => resolveAllConfigs(inputConfig, props.version, props));
</script>