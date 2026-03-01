<template>
  <!-- reset-password-container -->
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

      <Paragraph :text="t('auth.reset.subtitleConfirm')" font-size="text-base" font-weight="font-medium"
        font-color="text-white" />

      <form @submit.prevent="handleReset" class="flex flex-col gap-8">
        <!-- input-wrapper (email) -->
        <InputAuthComponent :model-value="email" @update:model-value="handleEmailInput"
          :placeholder="t('auth.register.emailPlaceholder')" id="email" show-label
          :label-text="t('auth.register.emailLabel')" data-required="true" required-display="italic-text" type="text"
          :show-errors="emailErrors.length > 0" :errors="emailErrors" />

        <!-- input-wrapper (code) -->
        <InputAuthComponent :model-value="code" @update:model-value="handleCodeInput"
          :placeholder="t('auth.reset.codePlaceholder')" id="code" show-label :label-text="t('auth.reset.codeLabel')"
          data-required="true" required-display="italic-text" type="text" :show-errors="codeErrors.length > 0"
          :errors="codeErrors" />

        <!-- input-wrapper (new password) -->
        <InputAuthComponent :model-value="newPassword" @update:model-value="handleNewPasswordInput"
          :placeholder="t('auth.register.passwordPlaceholder')" id="newPassword" show-label
          :label-text="t('auth.register.passwordLabel')" data-required="true" required-display="italic-text"
          :type="passwordInputType" :right-icon="passwordIcon" :show-errors="passwordErrors.length > 0"
          :errors="passwordErrors" :on-success="passwordSuccess.length > 0" :success="passwordSuccess"
          @click:right-icon="togglePasswordVisibility" />

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
        <ButtonComponent :text="buttonText" variant="authPink" size="lg" :disabled="!isCognitoScriptReady"
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
import { getAssetUrl } from "@/utils/assets/assetLibrary"
import { createAssetHandler } from "@/utils/assets/assetHandlerFactory.js"
import { interactionsEngine } from "@/utils/validation/interactionsEngine.js"
import { InformationCircleIcon, CheckCircleIcon } from "@heroicons/vue/24/outline"
import Heading from "@/components/default/Heading.vue"
import Paragraph from "@/components/default/Paragraph.vue"
import ButtonComponent from "@/components/button/ButtonComponent.vue"
import InputAuthComponent from "@/components/input/InputAuthComponent.vue"

const { t, locale: i18nLocale } = useI18n()
const route = useRoute()
const router = useRouter()

// Optional email prop for popup context (popup passes email from lost-password step)
const props = defineProps({
  prefilledEmail: { type: String, default: '' }
})

const email = ref(route.query.email ? String(route.query.email) : (props.prefilledEmail || ""))
const code = ref("")
const newPassword = ref("")
const message = ref("")
const error = ref("")
const passwordIcon = ref("")
const isCognitoScriptReady = ref(false)
const assetHandler = ref(null)
const popupNavHandler = inject('popupNavHandler', null)
const popupGoBack = inject('popupGoBack', null)

// Validation scope
const SCOPE_ID = 'resetPasswordForm'
const hasAttemptedSubmit = ref(false)

// Field configurations with translated validation messages
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

const codeConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'code',
  validation: {
    required: true,
    requiredMessage: t('auth.validation.codeRequired')
  },
  validateOnInput: false
}))

const passwordConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'newPassword',
  validation: {
    required: true,
    requiredMessage: t('auth.validation.passwordRequired'),
    rules: [
      { type: 'minLength', param: 8, message: t('auth.validation.passwordMinLength') },
      { type: 'hasUpper', message: t('auth.validation.passwordHasUpper') },
      { type: 'hasLower', message: t('auth.validation.passwordHasLower') },
      { type: 'hasNumber', message: t('auth.validation.passwordHasNumber') },
      { type: 'hasSpecial', message: t('auth.validation.passwordHasSpecial') }
    ]
  },
  validateOnInput: true,
  ui: {
    dynamicType: 'password',
    visibilityMetaKey: 'passwordVisible'
  }
}))

// Get field states
const emailState = computed(() => interactionsEngine.getFieldState(emailConfig.value))
const codeState = computed(() => interactionsEngine.getFieldState(codeConfig.value))
const passwordState = computed(() => interactionsEngine.getFieldState(passwordConfig.value))

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

// Helper to get validation messages (errors and success)
const getValidationMessages = (fieldState, fieldConfig) => {
  if (!fieldState || !fieldConfig) return { errors: [], success: [] }

  const rules = (fieldState.validationConfig || fieldConfig.validation || {}).rules || []
  const failedTypes = new Set((fieldState.failedRules || []).map(r => r.type))
  const errors = [], success = []

  rules.forEach(rule => {
    const isFailed = failedTypes.has(rule.type)
    if (isFailed && (rule.type !== 'required' || hasAttemptedSubmit.value)) {
      errors.push({ error: rule.message, icon: InformationCircleIcon })
    } else if (!isFailed) {
      success.push({ message: rule.message, icon: CheckCircleIcon, iconColor: 'text-[#07f468]', textColor: 'text-[12px] sm:text-[14px] text-[#07f468]' })
    }
  })

  return { errors, success }
}

const passwordErrors = computed(() => getValidationMessages(passwordState.value, passwordConfig.value).errors)
const passwordSuccess = computed(() => {
  if (!newPassword.value?.trim()) return []
  return getValidationMessages(passwordState.value, passwordConfig.value).success
})

const passwordInputType = computed(() => {
  return interactionsEngine.getInputType(passwordConfig.value, 'password')
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

  if (!isCognitoScriptReady.value) {
    return getLoadingText()
  }
  return t('auth.reset.resetButton')
})

// Get active locale from localeManager
const locale = computed(() => getActiveLocale())

// Watch locale changes and update validation configs
watch(i18nLocale, async (newLocale, oldLocale) => {
  if (!oldLocale || newLocale === oldLocale) return // Skip initial or no-op changes

  console.log(`[RESET PASSWORD] Locale changed from '${oldLocale}' to '${newLocale}'`)

  // Reload translations for the new locale
  try {
    await loadTranslationsForSection('auth', newLocale)
  } catch (err) {
    console.error('[RESET PASSWORD] Failed to reload translations:', err)
  }

  // Update validation configs in field states
  const emailState = interactionsEngine.getFieldState(emailConfig.value)
  const codeState = interactionsEngine.getFieldState(codeConfig.value)
  const passwordState = interactionsEngine.getFieldState(passwordConfig.value)

  if (emailState) {
    // Clear any existing browser validation message
    if (emailState.element && emailState.element.setCustomValidity) {
      emailState.element.setCustomValidity('')
    }
    emailState.validationConfig = emailConfig.value.validation
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

  if (codeState) {
    // Clear any existing browser validation message
    if (codeState.element && codeState.element.setCustomValidity) {
      codeState.element.setCustomValidity('')
    }
    codeState.validationConfig = codeConfig.value.validation
    if (hasAttemptedSubmit.value && !codeState.isValid) {
      interactionsEngine.validateField(codeConfig.value)
      // Update browser error message if field is still invalid
      if (!codeState.isValid && codeState.element) {
        const firstError = codeState.failedRules?.[0]
        if (firstError?.message && codeState.element.setCustomValidity) {
          codeState.element.setCustomValidity(firstError.message)
        }
      }
    }
  }

  if (passwordState) {
    // Clear any existing browser validation message
    if (passwordState.element && passwordState.element.setCustomValidity) {
      passwordState.element.setCustomValidity('')
    }
    passwordState.validationConfig = passwordConfig.value.validation
    if (!passwordState.isValid) {
      interactionsEngine.validateField(passwordConfig.value)
      // Update browser error message if field is still invalid
      if (!passwordState.isValid && passwordState.element) {
        const firstError = passwordState.failedRules?.[0]
        if (firstError?.message && passwordState.element.setCustomValidity) {
          passwordState.element.setCustomValidity(firstError.message)
        }
      }
    }
  }
})

// Preload auth section translations and wait for Cognito script
onMounted(async () => {
  console.log(`[RESET PASSWORD] Component mounted, current locale: ${locale.value}`)

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
    name: 'AuthResetPassword',
    debug: true
  })

  // Load icons independently (dynamic)
  passwordIcon.value = await getAssetUrl('icon.input.right')

  // Load translations for auth section
  try {
    await loadTranslationsForSection('auth', locale.value)
  } catch (err) {
    console.error('[RESET PASSWORD] Failed to load translations:', err)
  }

  // Load critical assets using AssetHandler
  try {
    console.log('[RESET PASSWORD] Loading assets via AssetHandler...')
    const result = await assetHandler.value.ensureAssetDependencies(
      assetsConfig.map(a => a.name),
      { strict: true }
    )

    console.log('[RESET PASSWORD] Assets loaded:', result)

    // Check if Cognito is ready (AssetHandler ensures load, but we verify global)
    if (typeof window.AmazonCognitoIdentity !== 'undefined') {
      isCognitoScriptReady.value = true
      console.log('[RESET PASSWORD] Cognito script ready')
    } else {
      // Fallback check if needed, but ensureAssetDependencies should have handled it
      console.warn('[RESET PASSWORD] Cognito loaded but global not found?')
      isCognitoScriptReady.value = true // Assuming load success means it's there
    }
  } catch (assetError) {
    console.error('[RESET PASSWORD] Asset loading failed:', assetError)
    error.value = 'Failed to load required resources. Please refresh.'
  }

  // Register fields with validation engine
  const emailElement = document.getElementById('email')
  const codeElement = document.getElementById('code')
  const passwordElement = document.getElementById('newPassword')
  interactionsEngine.register(emailConfig.value, email.value, emailElement)
  interactionsEngine.register(codeConfig.value, code.value, codeElement)
  interactionsEngine.register(passwordConfig.value, newPassword.value, passwordElement)
  console.log('[RESET PASSWORD] Validation engine initialized')
})

// Cleanup AssetHandler
onBeforeUnmount(() => {
  if (assetHandler.value) {
    assetHandler.value.dispose()
  }
})

// Handle input changes
const handleEmailInput = (value) => {
  email.value = value
  const state = interactionsEngine.getFieldState(emailConfig.value)
  if (state) {
    state.value = value
  }
  if (state?.element && state.element.setCustomValidity) {
    state.element.setCustomValidity('')
  }
  if (hasAttemptedSubmit.value) {
    interactionsEngine.validateField(emailConfig.value)
    if (state?.isValid && state?.element) {
      state.element.classList.remove('first-invalid')
    }
  }
}

const handleCodeInput = (value) => {
  code.value = value
  const state = interactionsEngine.getFieldState(codeConfig.value)
  if (state) {
    state.value = value
  }
  if (state?.element && state.element.setCustomValidity) {
    state.element.setCustomValidity('')
  }
  if (hasAttemptedSubmit.value) {
    interactionsEngine.validateField(codeConfig.value)
    if (state?.isValid && state?.element) {
      state.element.classList.remove('first-invalid')
    }
  }
}

const handleNewPasswordInput = (value) => {
  newPassword.value = value
  interactionsEngine.processFieldChange(passwordConfig.value, value)
  const state = interactionsEngine.getFieldState(passwordConfig.value)
  if (state?.element && state.element.setCustomValidity) {
    state.element.setCustomValidity('')
  }
  if (state?.isValid && state?.element) {
    state.element.classList.remove('first-invalid')
  }
}

const togglePasswordVisibility = () => {
  interactionsEngine.runInteractions(
    [{ type: 'toggleFieldMeta', metaKey: 'passwordVisible' }],
    passwordConfig.value
  )
}

async function handleReset() {
  error.value = ""
  message.value = ""
  hasAttemptedSubmit.value = true

  // Validate entire form
  const validationResult = interactionsEngine.validateScope(SCOPE_ID)
  if (!validationResult || !validationResult.isValid) {
    console.log('[RESET PASSWORD] Form validation failed:', validationResult?.invalidFields)

    // Find first invalid field
    let firstInvalidField = null
    const fieldOrder = ['email', 'code', 'newPassword']
    for (const fieldId of fieldOrder) {
      const fieldState = interactionsEngine.getFieldState({ scope: SCOPE_ID, id: fieldId })
      if (fieldState && !fieldState.isValid) {
        firstInvalidField = { fieldId }
        break
      }
    }

    if (firstInvalidField) {
      const firstInvalidFieldState = interactionsEngine.getFieldState({ scope: SCOPE_ID, id: firstInvalidField.fieldId })
      if (firstInvalidFieldState?.element) {
        const element = firstInvalidFieldState.element
        element.classList.add('first-invalid')

        const nonRequiredError = firstInvalidFieldState.failedRules?.find(rule => rule.type !== 'required')
        const firstError = nonRequiredError || firstInvalidFieldState.failedRules?.[0]
        // Use the translated message from the validation rule
        const errorMessage = firstError?.message || t('auth.validation.emailRequired')

        let fieldConfig
        if (firstInvalidField.fieldId === 'email') fieldConfig = emailConfig.value
        else if (firstInvalidField.fieldId === 'code') fieldConfig = codeConfig.value
        else if (firstInvalidField.fieldId === 'newPassword') fieldConfig = passwordConfig.value

        if (fieldConfig) {
          interactionsEngine.runInteractions([{ type: 'showBrowserError', message: errorMessage }], fieldConfig)
        }
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.focus()
      }
    }
    return
  }

  try {
    await authHandler.confirmPassword(email.value, code.value, newPassword.value)
    message.value = t('auth.reset.success') || "Password reset successful. Please log in."
    if (popupNavHandler) {
      setTimeout(() => popupNavHandler('/log-in'), 800)
    } else {
      setTimeout(() => router.push("/log-in"), 800)
    }
  } catch (err) {
    error.value = err.message || t('auth.reset.error') || "Reset failed"
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
