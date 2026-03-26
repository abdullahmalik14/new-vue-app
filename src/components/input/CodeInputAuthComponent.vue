<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import Paragraph from '../default/Paragraph.vue'
import HexagonExclamationIcon from "@/components/icons/HexagonExclamationIcon.vue";
import { CheckIcon } from "@heroicons/vue/24/outline";

const emit = defineEmits(['update:modelValue', 'update:is-valid', 'update:is-submitting', 'auto-submit'])

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  showLabel: {
    type: Boolean,
    default: false
  },
  labelText: {
    type: String,
    default: ''
  },
  labelClass: {
    type: String,
    default: "text-[#ffffff]",
  },
  required: {
    type: Boolean,
    default: false
  },
  requiredDisplay: {
    type: [String, Array],
    default: ''
  },
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
  disabled: {
    type: Boolean,
    default: false
  },
  isSubmitting: {
    type: Boolean,
    default: false
  }
})

// State for 6 individual inputs
const inputs = ref(['', '', '', '', '', ''])
const inputRefs = ref([])
const isPasting = ref(false)

// Computed properties
const requiredDisplayValues = computed(() => {
  if (!props.requiredDisplay) return [];
  return Array.isArray(props.requiredDisplay)
    ? props.requiredDisplay
    : [props.requiredDisplay];
})

const isCodeComplete = computed(() => {
  return inputs.value.every(digit => digit !== '')
})

const isCodeValid = computed(() => {
  if (!isCodeComplete.value) return false
  return inputs.value.every(digit => /^\d$/.test(digit))
})

const fullCode = computed(() => inputs.value.join(''))

// Watch for changes and emit events
watch(fullCode, (newValue) => {
  emit('update:modelValue', newValue)
})

watch(isCodeValid, (newValue) => {
  emit('update:is-valid', newValue)
})

// Handle input for each digit
const handleInput = (index, event) => {
  if (props.disabled || props.isSubmitting) {
    event.preventDefault()
    return
  }

  const value = event.target.value
  // Strip all non-numeric characters and keep only the last digit
  const digit = value.replace(/\D/g, '').slice(-1)

  // Only update if we have a valid digit
  if (digit) {
    inputs.value[index] = digit

    // Auto-focus to next input if digit was entered and next input exists
    if (index < 5) {
      nextTick(() => {
        inputRefs.value[index + 1]?.focus()
      })
    }
  } else {
    // If no valid digit, clear the input
    inputs.value[index] = ''
  }
}

// Handle keypress to prevent non-numeric input
const handleKeypress = (index, event) => {
  if (props.disabled || props.isSubmitting) {
    event.preventDefault()
    return
  }

  // Allow Ctrl/Cmd + A, C, V, X (for copy/paste)
  if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) {
    return
  }

  // Only allow numeric digits (0-9)
  if (!/^[0-9]$/.test(event.key)) {
    event.preventDefault()
    return
  }
}

// Handle keydown for backspace behavior and navigation
const handleKeydown = (index, event) => {
  if (props.disabled || props.isSubmitting) {
    event.preventDefault()
    return
  }

  // Allow: backspace, delete, tab, escape, enter, arrow keys
  const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']

  if (allowedKeys.includes(event.key)) {
    // Handle backspace
    if (event.key === 'Backspace') {
      event.preventDefault()

      if (inputs.value[index] !== '') {
        // If input has value, clear it
        inputs.value[index] = ''
      } else if (index > 0) {
        // If input is empty, move to previous and clear that
        inputs.value[index - 1] = ''
        nextTick(() => {
          inputRefs.value[index - 1]?.focus()
        })
      }
    }
    return
  }

  // Allow Ctrl/Cmd + A, C, V, X (for copy/paste)
  if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) {
    return
  }
}

// Handle paste behavior
const handlePaste = async (index, event) => {
  if (props.disabled || props.isSubmitting) {
    event.preventDefault()
    return
  }

  event.preventDefault()
  isPasting.value = true

  const pastedText = (event.clipboardData || window.clipboardData).getData('text')

  // Strip everything except digits
  const digits = pastedText.replace(/\D/g, '')

  if (digits.length === 0) {
    isPasting.value = false
    return
  }

  // Check if pasted content has more than 6 characters
  if (pastedText.length > 6) {
    alert(`Check your code — it contains ${pastedText.length} characters.`)
  }

  // Handle different digit counts
  if (digits.length === 6) {
    // A. Exactly 6 digits - fill and auto-submit
    for (let i = 0; i < 6; i++) {
      inputs.value[i] = digits[i]
    }

    await nextTick()

    // Auto-submit after paste
    if (isCodeValid.value) {
      emit('auto-submit', fullCode.value)
    }
  } else if (digits.length < 6) {
    // B. Fewer than 6 digits - fill left to right, rest empty
    for (let i = 0; i < 6; i++) {
      inputs.value[i] = i < digits.length ? digits[i] : ''
    }

    // Focus on next empty input
    await nextTick()
    const nextEmptyIndex = inputs.value.findIndex(d => d === '')
    if (nextEmptyIndex !== -1) {
      inputRefs.value[nextEmptyIndex]?.focus()
    }
  } else {
    // C. More than 6 characters - use first 6 digits
    for (let i = 0; i < 6; i++) {
      inputs.value[i] = digits[i]
    }

    await nextTick()

    // Check if first 6 are all digits (they should be since we filtered)
    if (isCodeValid.value) {
      emit('auto-submit', fullCode.value)
    }
  }

  isPasting.value = false
}

// Clear all inputs (for error handling)
const clearInputs = () => {
  inputs.value = ['', '', '', '', '', '']
  nextTick(() => {
    inputRefs.value[0]?.focus()
  })
}

// Focus first input on mount
onMounted(() => {
  nextTick(() => {
    inputRefs.value[0]?.focus()
  })
})

// Expose clearInputs method
defineExpose({
  clearInputs
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- Label -->
    <div v-if="showLabel" class="flex justify-between items-center w-full">
      <label :class="labelClass || 'text-sm leading-6 tracking-[0.009rem] text-[#ffffff]'">
        {{ labelText }}
      </label>
      <span v-if="requiredDisplayValues.includes('*')" class="text-red-500">*</span>
      <span v-if="requiredDisplayValues.includes('italic-text')"
        class="text-[0.625rem] leading-6 text-right italic text-[#ffffff]">
        Required
      </span>
    </div>

    <!-- Code Inputs Wrapper -->
    <div class="flex gap-2 sm:gap-3 justify-start items-center w-full">
      <div v-for="(digit, index) in inputs" :key="index"
        class="relative rounded-xl border border-white/20 bg-white/5 shadow-sm min-h-14 sm:min-h-16 flex justify-center items-center flex-1 max-w-[60px] sm:max-w-[70px]">
        <input :ref="el => { if (el) inputRefs[index] = el }" type="text" inputmode="numeric" pattern="[0-9]*"
          maxlength="1" :value="digit" :disabled="disabled || isSubmitting"
          class="w-full h-full text-white bg-transparent outline-none text-center text-2xl sm:text-3xl font-semibold focus:outline-none focus:ring-0 focus:border-none disabled:opacity-50 disabled:cursor-not-allowed"
          @input="handleInput(index, $event)" @keydown="handleKeydown(index, $event)"
          @keypress="handleKeypress(index, $event)" @paste="handlePaste(index, $event)" />
      </div>
    </div>

    <!-- Required Error Text -->
    <Paragraph v-if="requiredDisplayValues.includes('required-text-error')" :text="'This field is required.'"
      fontSize="text-xs" fontColor="text-[#FF4405]" />

    <!-- Validation Messages -->
    <div v-if="(showErrors && errors.length) || (onSuccess && success.length)" class="flex flex-col items-start self-stretch mt-1">
      <!-- Success List -->
      <div v-if="onSuccess && success.length" class="flex flex-col gap-1 w-full">
        <div v-for="(successObj, index) in success" :key="`success-${index}`"
          class="flex w-full items-center gap-[.4375rem]">
          <component v-if="successObj.icon" :is="successObj.icon" class="w-[1.125rem] h-[1.125rem] flex-shrink-0 text-white" />
          <CheckIcon v-else class="w-[1.125rem] h-[1.125rem] flex-shrink-0 text-white" />
          <p class="text-white text-[12px] sm:text-[14px] font-normal">
            {{ successObj.message || successObj.text || successObj }}
          </p>
        </div>
      </div>

      <!-- Errors List -->
      <div v-if="showErrors && errors.length" class="flex flex-col gap-1 w-full" :class="onSuccess && success.length ? 'mt-2' : ''">
        <div v-for="(errorObj, index) in errors" :key="`error-${index}`"
          class="flex w-full items-center gap-[.4375rem]">
          <component v-if="errorObj.icon" :is="errorObj.icon" class="w-[1.125rem] h-[1.125rem] flex-shrink-0 text-[#ff7c1e]" />
          <HexagonExclamationIcon v-else class="w-[1.125rem] h-[1.125rem] flex-shrink-0 text-[#ff7c1e]" />
          <p class="text-[#ff7c1e] text-[12px] sm:text-[14px] font-normal">
            {{ errorObj.error || errorObj.message || errorObj }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Remove all focus borders and outlines - override global pink focus style */
input:focus,
input:focus-visible,
input:active {
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
}

/* Ensure wrapper doesn't change border on input focus */
div:has(input:focus) {
  border-color: inherit !important;
}

/* Hide number input spinners */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
