<template>
  <div :class="wrapperClass">

    <!-- LABEL -->
    <label v-if="label" :for="labelFor" :class="labelClass">
      {{ label }}
    </label>

    <!-- TEXTAREA MODE -->
    <textarea v-if="type === 'textarea'" :placeholder="placeholder" :class="inputClass" :value="modelValue"
      :maxlength="maxLength" :rows="rows" :disabled="disabled" @input="resizeTextarea"
      class="block w-full resize-none overflow-hidden min-h-[65px] leading-6"></textarea>

    <!-- INPUT MODE -->
    <div class="relative w-full">
      <input v-if="type !== 'textarea'" :type="type" :placeholder="placeholder"
        :class="[inputClass, type === 'number' ? 'pr-8' : '']" :value="modelValue" :maxlength="maxLength"
        :disabled="disabled" @input="$emit('update:modelValue', $event.target.value)" />

      <div v-if="type === 'number' && showControls"
        class="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 select-none">
        <button type="button" @click="stepUp" :disabled="disabled"
          class="text-gray-500 hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 5L5 1L9 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </button>
        <button type="button" @click="stepDown" :disabled="disabled"
          class="text-gray-500 hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Counter -->
    <p v-if="maxLength" :class="counterClass">
      {{ modelValue?.length || 0 }}/{{ maxLength }} characters
    </p>
  </div>
</template>

<script>
export default {
  name: "BaseInput",
  props: {
    type: {
      type: String,
      default: "text",
    },
    placeholder: {
      type: String,
      default: "",
    },

    /* 👇 LABEL PROPS */
    label: {
      type: String,
      default: "",
    },
    labelFor: {
      type: String,
      default: "",
    },
    labelClass: {
      type: String,
      default: "",
    },
    inputClass: {
      type: String,
      default:
        "",
    },
    wrapperClass: {
      type: String,
      default: "flex flex-col gap-1",
    },
    counterClass: {
      type: String,
      default: "text-xs text-gray-500",
    },
    modelValue: {
      type: [String, Number],
      default: "",
    },
    maxLength: {
      type: Number,
      default: null,
    },
    rows: {
      type: Number,
      default: 1,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    showControls: {
      type: Boolean,
      default: true,
    },
  },

  methods: {
    resizeTextarea(e) {
      const el = e.target;
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
      this.$emit("update:modelValue", el.value);
    },
    stepUp() {
      if (this.disabled) return;
      const currentVal = Number(this.modelValue) || 0;
      this.$emit("update:modelValue", currentVal + 1);
    },
    stepDown() {
      if (this.disabled) return;
      const currentVal = Number(this.modelValue) || 0;
      if (currentVal > 0) {
        this.$emit("update:modelValue", currentVal - 1);
      }
    }
  },
};
</script>

<style scoped>
/* Hide native spin buttons */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
