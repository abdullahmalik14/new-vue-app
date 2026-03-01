<template>
  <!-- lost-password-container -->
  <div class="flex flex-col w-full relative gap-6 z-[5]">
    <div class="flex flex-col w-full gap-6">
      <!-- heading -->
      <!-- Back button (popup only) -->
      <button v-if="popupGoBack" @click="popupGoBack" type="button"
        class="flex items-center gap-2 text-white/70 hover:text-white transition-colors w-fit mb-2 group">
        <svg class="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor"
          stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span class="text-sm font-medium">Back</span>
      </button>
      <Heading :text="t('auth.reset.title')" tag="h2" theme="AuthHeading" />

      <Paragraph :text="t('auth.reset.subtitle')" font-size="text-base" font-weight="font-medium"
        font-color="text-white" />

      <form @submit.prevent="handleForgot" class="flex flex-col gap-8" novalidate>
        <!-- input-wrapper (email) -->
        <InputAuthComponent :model-value="email" @update:model-value="handleEmailInput"
          :placeholder="t('auth.register.emailPlaceholder')" id="email" show-label
          :label-text="t('auth.register.emailLabel')" data-required="true" required-display="italic-text" type="text"
          :show-errors="emailErrors.length > 0" :errors="emailErrors" />

        <!-- Error message -->
        <p v-if="error" class="text-sm text-red-300 bg-red-900/30 border border-red-500/40 rounded-md px-3 py-2">
          {{ error }}
        </p>

        <!-- Success message -->
        <p v-if="message"
          class="text-sm text-emerald-300 bg-emerald-900/30 border border-emerald-500/40 rounded-md px-3 py-2">
          {{ message }}
        </p>

        <!-- submit button -->
        <ButtonComponent :text="buttonText" variant="authPink" size="lg" :disabled="isLoading || !isCognitoScriptReady"
          type="submit" />
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount, watch, inject } from "vue"
import { useRouter, useRoute } from "vue-router"
import { useI18n } from "vue-i18n"
import { getActiveLocale } from "@/utils/translation/localeManager.js"
import { loadTranslationsForSection } from "@/utils/translation/translationLoader.js"
import { authHandler } from "@/utils/auth/authHandler"
import { createAssetHandler } from "@/utils/assets/assetHandlerFactory.js"
import { interactionsEngine } from "@/utils/validation/interactionsEngine.js"
import { InformationCircleIcon } from "@heroicons/vue/24/outline"
import Heading from "@/components/default/Heading.vue"
import Paragraph from "@/components/default/Paragraph.vue"
import ButtonComponent from "@/components/button/ButtonComponent.vue"
import InputAuthComponent from "@/components/input/InputAuthComponent.vue"

const { t, locale: i18nLocale } = useI18n()
const route = useRoute()
const router = useRouter()

const email = ref("")
const message = ref("")
const error = ref("")
const isLoading = ref(false)
const isCognitoScriptReady = ref(false)
const assetHandler = ref(null)
const popupNavHandler = inject('popupNavHandler', null)
const popupGoBack = inject('popupGoBack', null)

// Validation scope
const SCOPE_ID = 'lostPasswordForm'

// Track if form has been submitted to control when to show errors
const hasAttemptedSubmit = ref(false)

// Field configuration with translated validation messages
const emailConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'email',
  validation: {
    required: true,
    requiredMessage: t('auth.validation.emailRequired'),
    rules: [
      { type: 'isEmail', message: t('auth.validation.emailInvalid') }
    ]
  },
  validateOnInput: false
}))

// Get field state from the engine
const emailState = computed(() => interactionsEngine.getFieldState(emailConfig.value))

// Map validation errors to InputAuthComponent format
// Only show errors after submit has been attempted
const emailErrors = computed(() => {
  if (!hasAttemptedSubmit.value) return []
  if (!emailState.value || emailState.value.isValid) return []
  return emailState.value.failedRules.map(rule => ({
    error: rule.message,
    icon: InformationCircleIcon
  }))
})

// Get active locale from localeManager
const locale = computed(() => getActiveLocale())

// Watch locale changes and update validation configs
watch(i18nLocale, async (newLocale, oldLocale) => {
  if (!oldLocale || newLocale === oldLocale) return // Skip initial or no-op changes

  console.log(`[LOST PASSWORD] Locale changed from '${oldLocale}' to '${newLocale}'`)

  // Reload translations for the new locale
  try {
    await loadTranslationsForSection('auth', newLocale)
  } catch (err) {
    console.error('[LOST PASSWORD] Failed to reload translations:', err)
  }

  // Update validation configs in field states
  const emailState = interactionsEngine.getFieldState(emailConfig.value)

  if (emailState) {
    // Clear any existing browser validation message
    if (emailState.element && emailState.element.setCustomValidity) {
      emailState.element.setCustomValidity('')
    }
    emailState.validationConfig = emailConfig.value.validation
    // Re-validate if field was already validated to update error messages
    if (hasAttemptedSubmit.value && !emailState.isValid) {
      interactionsEngine.validateField(emailConfig.value)
      // Update browser error message if field is still invalid
      if (!emailState.isValid && emailState.element) {
        const firstError = emailState.failedRules?.[0]
        if (firstError?.message && emailState.element.setCustomValidity) {
          emailState.element.setCustomValidity(firstError.message)
        }
      }
    }
  }
})

// Computed button text based on loading and script availability
const buttonText = computed(() => {
  const getLoadingText = () => {
    // Try multiple translation keys with fallback
    const text1 = t('common.loading')
    if (text1 && text1 !== 'common.loading') return text1

    const text2 = t('auth.common.loading')
    if (text2 && text2 !== 'auth.common.loading') return text2

    return 'Loading...' // Final fallback
  }

  if (isLoading.value) {
    return getLoadingText()
  }
  if (!isCognitoScriptReady.value) {
    return getLoadingText()
  }
  return t('auth.reset.sendCode')
})

// Preload auth section translations and wait for Cognito script
onMounted(async () => {
  console.log(`[LOST PASSWORD] Component mounted, current locale: ${locale.value}`)

  // Define assets configuration
  const assetsConfig = [
    {
      name: 'cognito-sdk',
      flag: 'script.cognito',
      type: 'script',
      critical: true,
      priority: 'critical',
      retry: 2
    },
    {
      name: 'auth-styles',
      url: '/css/auth.css',
      type: 'css',
      critical: true,
      priority: 'high'
    },
    {
      name: 'auth-bg',
      flag: 'auth.background',
      type: 'image',
      priority: 'normal'
    }
  ]

  // Initialize AssetHandler using factory
  assetHandler.value = await createAssetHandler(assetsConfig, {
    name: 'AuthLostPassword',
    debug: true
  })

  // Load translations for auth section
  try {
    await loadTranslationsForSection('auth', locale.value)
  } catch (err) {
    console.error('[LOST PASSWORD] Failed to load translations:', err)
  }

  // Load critical assets using AssetHandler
  try {
    console.log('[LOST PASSWORD] Loading assets via AssetHandler...')
    const result = await assetHandler.value.ensureAssetDependencies(
      assetsConfig.map(a => a.name),
      { strict: true }
    )

    console.log('[LOST PASSWORD] Assets loaded:', result)

    // Check if Cognito is ready (AssetHandler ensures load, but we verify global)
    if (typeof window.AmazonCognitoIdentity !== 'undefined') {
      isCognitoScriptReady.value = true
      console.log('[LOST PASSWORD] Cognito script ready')
    } else {
      // Fallback check if needed, but ensureAssetDependencies should have handled it
      console.warn('[LOST PASSWORD] Cognito loaded but global not found?')
      isCognitoScriptReady.value = true // Assuming load success means it's there
    }
  } catch (assetError) {
    console.error('[LOST PASSWORD] Asset loading failed:', assetError)
    error.value = 'Failed to load required resources. Please refresh.'
  }

  // Register field with validation engine
  const emailElement = document.getElementById('email')
  interactionsEngine.register(emailConfig.value, email.value, emailElement)

  // Prevent browser's native invalid event from showing popup during typing
  // We only want to show browser validation on submit via showBrowserError
  if (emailElement) {
    // Prevent invalid event from showing browser popup before submit
    emailElement.addEventListener('invalid', (e) => {
      // Only prevent if we haven't attempted submit yet
      // After submit, we want showBrowserError to control the message
      if (!hasAttemptedSubmit.value) {
        e.preventDefault()
        // Clear any browser validation state
        emailElement.setCustomValidity('')
      }
    }, { capture: true })

    // Also prevent browser validation on blur (some browsers validate on blur)
    emailElement.addEventListener('blur', () => {
      if (!hasAttemptedSubmit.value && emailElement.setCustomValidity) {
        emailElement.setCustomValidity('')
      }
    })
  }

  console.log('[LOST PASSWORD] Validation engine initialized')
})

// Cleanup AssetHandler
onBeforeUnmount(() => {
  if (assetHandler.value) {
    assetHandler.value.dispose()
  }
})

// Handle input changes - only update values, validation happens on submit
const handleEmailInput = (value) => {
  email.value = value
  // Update field state value without triggering validation
  const state = interactionsEngine.getFieldState(emailConfig.value)
  if (state) {
    state.value = value
  }

  // Always clear browser validation when user types (to reset any previous validation message)
  // This prevents browser's native HTML5 validation from showing during typing
  if (state?.element && state.element.setCustomValidity) {
    state.element.setCustomValidity('')
  }

  // Re-validate only if submit was already attempted
  if (hasAttemptedSubmit.value) {
    interactionsEngine.validateField(emailConfig.value)
    // Remove first-invalid class if field becomes valid
    if (state?.isValid && state?.element) {
      state.element.classList.remove('first-invalid')
    }
  }
}

async function handleForgot() {
  if (isLoading.value) return

  error.value = ""
  message.value = ""

  // Mark that submit has been attempted (this will show validation errors)
  hasAttemptedSubmit.value = true

  // Validate entire form using validation engine
  const validationResult = interactionsEngine.validateScope(SCOPE_ID)

  // CRITICAL: Do not proceed if validation fails - prevent API call
  if (!validationResult || !validationResult.isValid) {
    console.log('[LOST PASSWORD] Form validation failed - blocking API call:', validationResult?.invalidFields || 'No validation result')

    // Find first invalid field - check fields in order, only move to next if current is fully valid
    let firstInvalidField = null
    const fieldOrder = ['email'] // Check fields in this order

    for (const fieldId of fieldOrder) {
      const fieldState = interactionsEngine.getFieldState({ scope: SCOPE_ID, id: fieldId })
      if (fieldState && !fieldState.isValid) {
        // Found first invalid field - stop checking
        firstInvalidField = { fieldId }
        break
      }
      // If field is valid, continue to next field
    }

    if (firstInvalidField) {
      const firstInvalidFieldId = firstInvalidField.fieldId
      const firstInvalidFieldState = interactionsEngine.getFieldState({ scope: SCOPE_ID, id: firstInvalidFieldId })

      if (firstInvalidFieldState?.element) {
        const element = firstInvalidFieldState.element

        // Remove 'first-invalid' class from all fields first
        const allFields = ['email']
        allFields.forEach(fieldId => {
          const fieldElement = document.getElementById(fieldId)
          if (fieldElement) {
            fieldElement.classList.remove('first-invalid')
          }
        })

        // Add 'first-invalid' class to first invalid field
        element.classList.add('first-invalid')

        // Get first non-required error if available, otherwise use first error
        const nonRequiredError = firstInvalidFieldState.failedRules?.find(rule => rule.type !== 'required')
        const firstError = nonRequiredError || firstInvalidFieldState.failedRules?.[0]
        // Use the custom message from the validation rule
        const errorMessage = firstError?.message || 'Please fix this field'

        // Clear any existing browser validation before showing our custom error
        // This ensures our custom message is shown instead of browser's default
        if (element.setCustomValidity) {
          element.setCustomValidity('')
        }

        // Use interactionsEngine's showBrowserError action to show custom message
        // This function handles changing type to text, setting custom validity, and showing popup
        interactionsEngine.runInteractions(
          [{
            type: 'showBrowserError',
            message: errorMessage
          }],
          emailConfig.value
        )

        // Scroll to first invalid field
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.focus()

        console.log('[LOST PASSWORD] First invalid field:', firstInvalidFieldId, element, 'Custom message:', errorMessage)
      }
    }

    // Validation errors are shown under each input field, no need for general error message
    // Ensure we don't set loading state if validation fails
    isLoading.value = false
    return // Exit early - do NOT call authHandler.forgotPassword
  }

  // Only proceed if validation passed - set loading state
  console.log('[LOST PASSWORD] Form validation passed, proceeding with forgot password')
  isLoading.value = true

  try {
    await authHandler.forgotPassword(email.value)
    message.value = t('auth.reset.codeSent') || "Reset code sent to your email."
    // Redirect to reset-password with prefilled email
    if (popupNavHandler) {
      popupNavHandler(`/reset-password?email=${encodeURIComponent(email.value)}`)
    } else {
      setTimeout(() => router.push({ path: "/reset-password", query: { email: email.value } }), 600)
    }
  } catch (err) {
    console.error("[LOST PASSWORD] Forgot password failed:", err)
    error.value = err.message || t('auth.reset.sendCodeError') || "Failed to send code"
    isLoading.value = false
  }
}
</script>

<script>
export const assets = {
  critical: ["/css/auth.css"],
  high: [],
  normal: ["/images/auth-bg.jpg"],
}
</script>
