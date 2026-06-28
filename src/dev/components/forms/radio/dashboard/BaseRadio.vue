<template>
  <div v-bind="resolvedAttrs.wrapperAttrs.wrapper1">
    <div v-bind="resolvedAttrs.wrapperAttrs.wrapper2">
      <input
        :id="id"
        :type="multiple ? 'checkbox' : 'radio'"
        :name="multiple ? undefined : name"
        :value="value"
        :checked="isChecked"
        class="hidden peer"
        :class="resolvedAttrs.inputAttrs.class"
        @change="onChange"
      />
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
  modelValue: [String, Number, Array],
  value: [String, Number],
  name: String,
  label: String,
  id: String,
  radioLabelClass: String,
  version: String,
  multiple: {
    type: Boolean,
    default: false,
  },
  addId: String,
  removeId: Boolean,
  addClass: String,
  removeClass: Boolean,
  addAttributes: Object,
  removeAttributes: Array,
  wrapperOverrides: Array,
});

const emit = defineEmits(["update:modelValue"]);

const isChecked = computed(() => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.includes(props.value);
  }
  return props.modelValue === props.value;
});

function onChange(event) {
  if (props.multiple) {
    const current = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    const index = current.indexOf(props.value);

    if (event.target.checked) {
      if (index === -1) current.push(props.value);
    } else if (index >= 0) {
      current.splice(index, 1);
    }

    emit("update:modelValue", current);
    return;
  }

  emit("update:modelValue", props.value);
}

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
    addClass: "hidden peer",
    addAttributes: {
      type: "radio", // always radio
      name: props.name, // ensure group works
    },
  },
  additionalConfig: {
    label: {
      addClass:
        props.version === "dashboard"
          ? `relative text-[0.938rem] font-medium leading-6 text-black pl-8 cursor-pointer
             before:content-[''] before:w-5 before:h-5 before:rounded-full before:border before:border-radio-border before:bg-white
             before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 peer-checked:before:bg-black
             after:content-[''] after:w-[0.375rem] after:h-[0.375rem] after:rounded-full after:bg-success
             after:absolute after:left-[0.4375rem] after:top-1/2 after:-translate-y-1/2
             peer-checked:after:block after:hidden`
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
</script>
