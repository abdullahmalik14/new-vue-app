<template>
  <!-- confirm-email-container -->
  <div class="flex flex-col w-full relative gap-6 z-[5]">
    <div class="flex flex-col w-full gap-6">
      <!-- Heading -->
      <!-- Back button (popup only) -->
      <button v-if="popupGoBack" @click="popupGoBack" type="button"
        class="flex items-center gap-2 text-white/70 hover:text-white transition-colors w-fit mb-2 group">
        <svg class="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor"
          stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span class="text-sm font-medium">Back</span>
      </button>
      <Heading :text="t('auth.confirmEmail.title')" tag="h2" theme="AuthHeading" />

      <form @submit.prevent="handleConfirm" class="flex flex-col gap-8">
        <!-- <Paragraph :text="t('auth.confirmEmail.subtitle')" font-size="text-base" font-weight="font-medium"
          font-color="text-white" /> -->

        <!-- Email input -->
        <div v-if="isEmailMissing">
          <InputAuthComponent :model-value="email" @update:model-value="handleEmailInput"
            :placeholder="t('auth.confirmEmail.emailPlaceholder')" id="email" show-label
            :label-text="t('auth.confirmEmail.emailLabel')" data-required="true" required-display="italic-text"
            type="email" :show-errors="emailErrors.length > 0" :errors="emailErrors" />
        </div>

        <!-- Confirmation Code input -->
        <div class="flex flex-col gap-2">
          <!-- Hidden input for validation engine -->
          <input type="hidden" id="code" :value="code" />

          <CodeInputAuthComponent ref="codeInputRef" :model-value="code" @update:model-value="handleCodeInput"
            @update:is-valid="handleCodeValidityChange" @auto-submit="handleAutoSubmit" show-label
            :label-text="t('auth.confirmEmail.codeLabel')" data-required="true" required-display="italic-text"
            :show-errors="codeErrors.length > 0" :errors="codeErrors" :disabled="isSubmitting"
            :is-submitting="isSubmitting" />

          <!-- Resend Code Button -->
          <div class="flex justify-start">
            <button type="button" @click="handleResendCode" :disabled="isResending || isLoading || isSubmitting"
              class="text-sm text-white/80 hover:text-white underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {{ resendButtonText }}
            </button>
          </div>

          <!-- Resend Success Message -->
          <p v-if="resendSuccess"
            class="text-sm text-green-300 bg-green-900/30 border border-green-500/40 rounded-md px-3 py-2">
            {{ resendSuccess }}
          </p>
        </div>

        <!-- Confirm button -->
        <ButtonComponent :text="buttonText" variant="authPink" size="lg"
          :disabled="isLoading || isSubmitting || !isCognitoScriptReady || !isCodeValid" type="submit" />
      </form>

      <!-- Error message -->
      <p v-if="error" class="text-sm text-red-300 bg-red-900/30 border border-red-500/40 rounded-md px-3 py-2">
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onBeforeUnmount, inject } from "vue"
import { useRouter, useRoute } from "vue-router"
import { useI18n } from "vue-i18n"
import { getActiveLocale } from "@/utils/translation/localeManager.js"
import { loadTranslationsForSection } from "@/utils/translation/translationLoader.js"
import { authHandler } from "@/utils/auth/authHandler"
import { useAuthStore } from "@/stores/useAuthStore"
import { createAssetHandler } from "@/utils/assets/assetHandlerFactory.js"
import { interactionsEngine } from "@/utils/validation/interactionsEngine.js"
import { InformationCircleIcon } from "@heroicons/vue/24/outline"
import InputAuthComponent from "@/components/input/InputAuthComponent.vue"
import CodeInputAuthComponent from "@/components/input/CodeInputAuthComponent.vue"
import Heading from "@/components/default/Heading.vue"
import ButtonComponent from "@/components/button/ButtonComponent.vue"
import Paragraph from "@/components/default/Paragraph.vue"
import apiWrapper from "@/lib/mock-api-demo/apiWrapper.js"
import { userIdUtility } from "@/lib/mock-api-demo/utilities/userId.js"

const { t, locale: i18nLocale } = useI18n()
const email = ref("")
const code = ref("")
const error = ref("")
const isLoading = ref(false)
const isSubmitting = ref(false)
const isCodeValid = ref(false)
const isResending = ref(false)
const resendSuccess = ref("")
const isCognitoScriptReady = ref(false)
const isEmailMissing = ref(false)
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const assetHandler = ref(null)
const codeInputRef = ref(null)
const popupNavHandler = inject('popupNavHandler', null)
const popupGoBack = inject('popupGoBack', null)

// Get active locale from localeManager
const locale = computed(() => getActiveLocale())

// Watch locale changes
watch(i18nLocale, (newLocale, oldLocale) => {
  console.log(`[CONFIRM_EMAIL] Locale changed from '${oldLocale}' to '${newLocale}'`)
}, { immediate: true })

// Computed button text based on loading and script availability
const buttonText = computed(() => {
  const getLoadingText = () => {
    // Try multiple translation keys with fallback
    const text1 = t('common.loading')
    if (text1 && text1 !== 'common.loading') return text1

    const text2 = t('auth.common.loading')
    if (text2 && text2 !== 'auth.common.loading') return text2

    const text3 = t('auth.confirmEmail.buttonLoading')
    if (text3 && text3 !== 'auth.confirmEmail.buttonLoading') return text3

    return 'Loading...' // Final fallback
  }

  if (isLoading.value || isSubmitting.value) {
    return getLoadingText()
  }
  if (!isCognitoScriptReady.value) {
    return getLoadingText()
  }
  return t('auth.confirmEmail.button')
})

// Computed resend button text with proper translation fallback
const resendButtonText = computed(() => {
  if (isResending.value) {
    const text = t('auth.confirmEmail.resending')
    if (text && text !== 'auth.confirmEmail.resending') return text
    return 'Resending...'
  }
  const text = t('auth.confirmEmail.resendCode')
  if (text && text !== 'auth.confirmEmail.resendCode') return text
  return 'Resend Code'
})

// Validation scope
const SCOPE_ID = 'confirmEmailForm'
const hasAttemptedSubmit = ref(false)

// Field configurations
const emailConfig = {
  scope: SCOPE_ID,
  id: 'email',
  validation: {
    required: true,
    requiredMessage: 'Email is required',
    rules: [
      { type: 'isEmail', message: 'Please enter a valid email address' }
    ]
  },
  validateOnInput: false
}

const codeConfig = {
  scope: SCOPE_ID,
  id: 'code',
  validation: {
    required: true,
    requiredMessage: 'Confirmation code is required',
    rules: [
      { type: 'minLength', param: 6, message: 'Code must be 6 digits' },
      { type: 'maxLength', param: 6, message: 'Code must be 6 digits' }
    ]
  },
  validateOnInput: false
}

// Get field states
const emailState = computed(() => interactionsEngine.getFieldState(emailConfig))
const codeState = computed(() => interactionsEngine.getFieldState(codeConfig))

// Map validation errors
const emailErrors = computed(() => {
  if (!hasAttemptedSubmit.value) return []
  if (!emailState.value || emailState.value.isValid) return []
  return emailState.value.failedRules.map(rule => ({
    error: rule.message,
    icon: InformationCircleIcon
  }))
})

const codeErrors = computed(() => {
  if (!hasAttemptedSubmit.value) return []
  if (!codeState.value || codeState.value.isValid) return []
  return codeState.value.failedRules.map(rule => ({
    error: rule.message,
    icon: InformationCircleIcon
  }))
})

// Preload auth section translations and wait for Cognito script
onMounted(async () => {
  console.log(`[CONFIRM_EMAIL] Component mounted, current locale: ${locale.value}`)

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
    name: 'AuthConfirmEmail',
    debug: true
  })

  // Load translations for auth section
  try {
    await loadTranslationsForSection('auth', locale.value)
  } catch (translationError) {
    console.error('[CONFIRM_EMAIL] Failed to load translations:', translationError)
  }

  // Pre-fill email from sessionStorage or URL query
  const pendingEmail = sessionStorage.getItem('pendingSignupEmail') || route.query.email
  if (pendingEmail) {
    email.value = pendingEmail
  } else {
    isEmailMissing.value = true
  }

  // Ensure email has a value for validation (even if empty, it won't be required)
  if (!email.value) {
    email.value = '' // Set empty string so validation doesn't fail
  }

  // Load critical assets using AssetHandler
  try {
    console.log('[CONFIRM_EMAIL] Loading assets via AssetHandler...')
    const result = await assetHandler.value.ensureAssetDependencies(
      assetsConfig.map(a => a.name),
      { strict: true }
    )

    console.log('[CONFIRM_EMAIL] Assets loaded:', result)

    // Check if Cognito is ready (AssetHandler ensures load, but we verify global)
    if (typeof window.AmazonCognitoIdentity !== 'undefined') {
      isCognitoScriptReady.value = true
      console.log('[CONFIRM_EMAIL] Cognito script ready')
    } else {
      // Fallback check if needed, but ensureAssetDependencies should have handled it
      console.warn('[CONFIRM_EMAIL] Cognito loaded but global not found?')
      isCognitoScriptReady.value = true // Assuming load success means it's there
    }
  } catch (assetError) {
    console.error('[CONFIRM_EMAIL] Asset loading failed:', assetError)
    error.value = 'Failed to load required resources. Please refresh.'
  }

  // Register fields with validation engine
  if (isEmailMissing.value) {
    const emailElement = document.getElementById('email')
    interactionsEngine.register(emailConfig, email.value, emailElement)
  }

  const codeElement = document.getElementById('code')
  interactionsEngine.register(codeConfig, code.value || '', codeElement)
  console.log('[CONFIRM_EMAIL] Validation engine initialized')
})

// Cleanup AssetHandler
onBeforeUnmount(() => {
  if (assetHandler.value) {
    assetHandler.value.dispose()
  }
})

const handleEmailInput = (value) => {
  email.value = value
  const state = interactionsEngine.getFieldState(emailConfig)
  if (state) {
    state.value = value
  }
  if (state?.element && state.element.setCustomValidity) {
    state.element.setCustomValidity('')
  }
  if (hasAttemptedSubmit.value) {
    interactionsEngine.validateField(emailConfig)
    if (state?.isValid && state?.element) {
      state.element.classList.remove('first-invalid')
    }
  }
}

const handleCodeInput = (value) => {
  code.value = value

  // Update the hidden input value for validation engine
  const hiddenInput = document.getElementById('code')
  if (hiddenInput) {
    hiddenInput.value = value
    // Trigger input event to notify validation engine
    hiddenInput.dispatchEvent(new Event('input', { bubbles: true }))
  }

  // Update field state value without triggering validation
  const state = interactionsEngine.getFieldState(codeConfig)
  if (state) {
    state.value = value
  }

  // Always clear browser validation when user types (to reset any previous validation message)
  if (state?.element && state.element.setCustomValidity) {
    state.element.setCustomValidity('')
  }

  // Re-validate only if submit was already attempted
  if (hasAttemptedSubmit.value) {
    interactionsEngine.validateField(codeConfig)
    // Remove first-invalid class if field becomes valid
    if (state?.isValid && state?.element) {
      state.element.classList.remove('first-invalid')
    }
  }
}

const handleCodeValidityChange = (valid) => {
  isCodeValid.value = valid
}

const handleAutoSubmit = async (codeValue) => {
  if (isSubmitting.value || isLoading.value) return

  console.log('[CONFIRM_EMAIL] Auto-submit triggered with code:', codeValue)
  code.value = codeValue

  // Set submitting state to disable inputs
  isSubmitting.value = true

  // Trigger the confirmation
  await performConfirmation()
}

const handleResendCode = async () => {
  if (isResending.value || isLoading.value || isSubmitting.value) return

  // Clear previous messages
  error.value = ""
  resendSuccess.value = ""

  // Validate email exists
  if (!email.value || !email.value.trim()) {
    error.value = t('auth.confirmEmail.emailRequired') || 'Please enter your email address'
    return
  }

  isResending.value = true

  try {
    console.log('[CONFIRM_EMAIL] Resending confirmation code to:', email.value.trim())

    await authHandler.resendConfirmationCode(email.value.trim())

    console.log('[CONFIRM_EMAIL] Confirmation code resent successfully')
    resendSuccess.value = t('auth.confirmEmail.resendSuccess') || 'Confirmation code sent! Check your email.'

    // Clear success message after 5 seconds
    setTimeout(() => {
      resendSuccess.value = ""
    }, 5000)
  } catch (err) {
    console.error('[CONFIRM_EMAIL] Resend error:', err)
    error.value = err?.message || t('auth.confirmEmail.resendError') || 'Failed to resend code. Please try again.'
  } finally {
    isResending.value = false
  }
}

async function performConfirmation() {
  error.value = ""

  // Ensure we have an email address
  if (!email.value || !email.value.trim()) {
    error.value = "Email address is missing. Please sign up again."
    isLoading.value = false
    isSubmitting.value = false
    return
  }

  try {
    console.log("[CONFIRM_EMAIL] Confirming email:", email.value.trim())

    // Get user ID (might need to fetch if not in cookies/local storage yet)
    const userId = await userIdUtility.getUserId()

    // Confirm email with code and track in parallel
    await Promise.all([
      authHandler.confirmSignUp(email.value.trim(), code.value.trim()),
      apiWrapper.post('/users/confirm-email', {
        userId: userId,
        action: 'confirmEmail'
      })
    ])

    console.log("[CONFIRM_EMAIL] Email confirmed and tracked successfully")

    // Check if we have a stored password from signup flow
    const storedPassword = sessionStorage.getItem('pendingSignupPassword')
    const storedEmail = sessionStorage.getItem('pendingSignupEmail')

    if (storedPassword && storedEmail && storedEmail.toLowerCase() === email.value.trim().toLowerCase()) {
      console.log("[CONFIRM_EMAIL] Auto-login after email confirmation")

      try {
        // Auto-login with stored credentials
        const { idToken, accessToken, refreshToken } = await authHandler.login(
          email.value.trim(),
          storedPassword
        )

        // Store tokens
        localStorage.setItem("idToken", idToken)
        localStorage.setItem("accessToken", accessToken)
        localStorage.setItem("refreshToken", refreshToken)

        // Decode token and set user
        auth.setTokenAndDecode(idToken)
        auth.startTokenRefreshLoop()

        // Clear stored password for security
        sessionStorage.removeItem('pendingSignupPassword')
        sessionStorage.removeItem('pendingSignupEmail')

        console.log("[CONFIRM_EMAIL] Auto-login successful, redirecting to dashboard")
        // RouteGuard will handle redirects based on dependencies (onboarding/KYC)
        if (popupNavHandler) {
          popupNavHandler('/dashboard')
        } else {
          await router.push("/dashboard")
        }
      } catch (loginErr) {
        console.error("[CONFIRM_EMAIL] Auto-login failed:", loginErr)
        // If auto-login fails, clear stored password and redirect to login
        sessionStorage.removeItem('pendingSignupPassword')
        sessionStorage.removeItem('pendingSignupEmail')
        error.value = t('auth.confirmEmail.autoLoginError')
        isLoading.value = false
        isSubmitting.value = false

        // Clear code inputs on error
        if (codeInputRef.value) {
          codeInputRef.value.clearInputs()
        }

        // Still redirect to login after a short delay
        setTimeout(() => {
          if (popupNavHandler) {
            popupNavHandler('/log-in')
          } else {
            router.push("/log-in")
          }
        }, 2000)
      }
    } else {
      // No stored password (user came directly to confirm-email page)
      console.log("[CONFIRM_EMAIL] No stored password, redirecting to login")
      isLoading.value = false
      isSubmitting.value = false
      if (popupNavHandler) {
        popupNavHandler('/log-in')
      } else {
        await router.push("/log-in")
      }
    }
  } catch (err) {
    console.error("[CONFIRM_EMAIL] Confirmation error:", err)

    // Re-enable inputs and clear code
    isLoading.value = false
    isSubmitting.value = false

    // Clear code inputs on error
    if (codeInputRef.value) {
      codeInputRef.value.clearInputs()
    }

    // Show error message
    error.value = err?.message || t('auth.confirmEmail.error') || 'Invalid code, try again'
  }
}

async function handleConfirm() {
  if (isLoading.value || isSubmitting.value) return

  error.value = ""
  hasAttemptedSubmit.value = true

  // Validate form using validation engine
  const validationResult = interactionsEngine.validateScope(SCOPE_ID)

  // CRITICAL: Do not proceed if validation fails - prevent API call
  if (!validationResult || !validationResult.isValid) {
    console.log('[CONFIRM_EMAIL] Form validation failed - blocking API call:', validationResult?.invalidFields || 'No validation result')

    // Find first invalid field - check fields in order, only move to next if current is fully valid
    let firstInvalidField = null
    const fieldOrder = isEmailMissing.value ? ['email', 'code'] : ['code']

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
        const allFields = isEmailMissing.value ? ['email', 'code'] : ['code']
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
        // For email validation errors, always use the standard message
        let errorMessage = firstError?.message || 'Please fix this field'
        if (firstInvalidFieldId === 'email' && firstError?.type === 'isEmail') {
          errorMessage = 'Please enter a valid email address'
        }

        // Get the correct field config based on fieldId
        const fieldConfig = firstInvalidFieldId === 'email' ? emailConfig : codeConfig

        // Use interactionsEngine's showBrowserError action
        interactionsEngine.runInteractions(
          [{
            type: 'showBrowserError',
            message: errorMessage
          }],
          fieldConfig
        )

        // Scroll to first invalid field
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.focus()

        console.log('[CONFIRM_EMAIL] First invalid field:', firstInvalidFieldId, element)
      }
    }

    // Ensure we don't set loading state if validation fails
    isLoading.value = false
    return // Exit early
  }

  // Only proceed if validation passed - set loading state
  console.log('[CONFIRM_EMAIL] Form validation passed, proceeding with confirmation')

  // For manual submit, only set loading (not submitting, so inputs stay enabled)
  isLoading.value = true

  await performConfirmation()
}
</script>

<script>
export const assets = {
  critical: ["/css/auth.css"],
  high: [],
  normal: ["/images/auth-bg.jpg"],
}
</script>
