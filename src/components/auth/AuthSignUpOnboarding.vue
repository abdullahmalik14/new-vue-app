<template>
  <!-- signup-onboarding-container -->
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
      <Heading :text="t('auth.register.Onboarding.title')" tag="h2" theme="AuthHeading" />
      <Paragraph :text="t('auth.register.Onboarding.description')" font-size="text-base" font-weight="font-medium"
        font-color="text-white" />

      <form @submit.prevent="completeOnboarding" class="flex flex-col gap-8">
        <!-- input-wrapper (Role) -->
        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center w-full">
            <label for="role" class="text-sm leading-6 tracking-[0.009rem] text-[#ffffff]">
              {{ t('auth.register.Onboarding.roleLabel') }}
            </label>
            <span class="text-[0.625rem] leading-6 text-right italic text-[#ffffff]">
              Required
            </span>
          </div>
          <div class="relative" ref="dropdownContainer">
            <div @click="toggleDropdown"
              class="relative rounded-[0.625rem] border border-border bg-input min-h-10 gap-2.5 pt-3 pb-3 px-2.5 flex justify-between items-center self-stretch cursor-pointer hover:bg-white/10 transition-colors"
              :class="{ 'border-white/40': isDropdownOpen }">

              <span :class="selectedRole ? 'text-white' : 'text-white/60'">
                {{ selectedRole ?
                  getRoleLabel(selectedRole) : (t('auth.register.Onboarding.rolePlaceholder') ||
                    'Selectyour role') }}
              </span>

              <!-- Custom dropdown arrow -->
              <svg class="w-5 h-5 text-white transition-transform duration-200"
                :class="{ 'rotate-180': isDropdownOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <!-- Custom Dropdown Menu -->
            <div v-if="isDropdownOpen"
              class="absolute z-50 w-full mt-1 overflow-hidden rounded-lg border border-gray-500/30 bg-[#181a1b]/80 backdrop-blur-xl shadow-xl">
              <div class="flex flex-col py-1">
                <div v-for="role in roles" :key="role.value" @click="selectRole(role.value)"
                  class="px-4 py-3 text-white cursor-pointer transition-colors hover:bg-white/10 flex items-center justify-between group"
                  :class="{ 'bg-white/5': selectedRole === role.value }">
                  <span class="font-medium">{{ role.label }}</span>
                  <svg v-if="selectedRole === role.value" class="w-4 h-4 text-accent-pink-light" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Hidden native select for form submission/validation compatibility if needed -->
            <select v-show="false" :value="selectedRole" id="role" data-required="true">
              <option value="" disabled>{{ t('auth.register.Onboarding.rolePlaceholder') }}</option>
              <option v-for="role in roles" :key="role.value" :value="role.value">{{ role.label }}</option>
            </select>
          </div>
          <p v-if="roleErrors.length > 0" class="text-xs text-red-300 mt-1 px-2">
            <span v-for="(error, index) in roleErrors" :key="index">{{ error.error }}<br
                v-if="index < roleErrors.length - 1" /></span>
          </p>
        </div>

        <!-- input-wrapper (username) -->
        <InputAuthComponent :model-value="username" @update:model-value="handleUsernameInput"
          :placeholder="t('auth.register.Onboarding.usernamePlaceholder')" id="username" show-label
          :label-text="t('auth.register.Onboarding.usernameLabel')" data-required="true" required-display="italic-text"
          type="text" :show-errors="usernameErrors.length > 0" :errors="usernameErrors" />

        <!-- Error message -->
        <p v-if="error" class="text-sm text-red-300 bg-red-900/30 border border-red-500/40 rounded-md px-3 py-2">
          {{ error }}
        </p>

        <!-- Signup button -->
        <ButtonComponent :text="buttonText" variant="authPink" size="lg" type="submit"
          :disabled="isLoading || !isCognitoScriptReady || usernameChecking" />
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount, watch, inject } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "@/stores/useAuthStore"
import { authHandler } from "@/utils/auth/authHandler"
import { createAssetHandler } from "@/utils/assets/assetHandlerFactory.js"
import { interactionsEngine } from "@/utils/validation/interactionsEngine.js"
import { InformationCircleIcon } from "@heroicons/vue/24/outline"
import { useI18n } from "vue-i18n"
import { getActiveLocale } from "@/utils/translation/localeManager.js"
import { loadTranslationsForSection } from "@/utils/translation/translationLoader.js"
import Heading from "@/components/default/Heading.vue"
import Paragraph from "@/components/default/Paragraph.vue"
import InputAuthComponent from "@/components/input/InputAuthComponent.vue"
import ButtonComponent from "@/components/button/ButtonComponent.vue"
import apiWrapper from "@/lib/mock-api-demo/apiWrapper.js"
import { userIdUtility } from "@/lib/mock-api-demo/utilities/userId.js"

const router = useRouter()
const auth = useAuthStore()
const { t, locale: i18nLocale } = useI18n()
const error = ref("")
const username = ref("")
const selectedRole = ref("")
const isLoading = ref(false)
const isCognitoScriptReady = ref(false)
const assetHandler = ref(null)
const usernameChecking = ref(false)
const usernameTaken = ref(false)
let usernameDebounceTimer = null
const popupNavHandler = inject('popupNavHandler', null)
const popupGoBack = inject('popupGoBack', null)

// Dropdown state
const isDropdownOpen = ref(false)
const dropdownContainer = ref(null)

const roles = computed(() => [
  { value: 'creator', label: t('auth.register.Onboarding.roles.creator') },
  { value: 'fan', label: t('auth.register.Onboarding.roles.fan') },
  { value: 'vendor', label: t('auth.register.Onboarding.roles.vendor') },
  { value: 'agent', label: t('auth.register.Onboarding.roles.agent') }
])

const getRoleLabel = (value) => {
  const role = roles.value.find(r => r.value === value)
  return role ? role.label : value
}

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const selectRole = (value) => {
  selectedRole.value = value
  isDropdownOpen.value = false

  // Trigger validation manually since we're not using native change event
  const state = interactionsEngine.getFieldState(roleConfig.value)
  if (state) {
    state.value = selectedRole.value
  }
  if (state?.element && state.element.setCustomValidity) {
    state.element.setCustomValidity('')
  }
  if (hasAttemptedSubmit.value) {
    interactionsEngine.validateField(roleConfig.value)
    if (state?.isValid && state?.element) {
      state.element.classList.remove('first-invalid')
    }
  }
}

const handleClickOutside = (event) => {
  if (dropdownContainer.value && !dropdownContainer.value.contains(event.target)) {
    isDropdownOpen.value = false
  }
}

// Validation scope
const SCOPE_ID = 'onboardingForm'
const hasAttemptedSubmit = ref(false)

// Field configurations with translated validation messages
const roleConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'role',
  validation: {
    required: true,
    requiredMessage: t('auth.validation.roleRequired'),
    rules: [
      { type: 'isSelect', message: t('auth.validation.roleSelect') }
    ]
  },
  validateOnInput: false
}))

const usernameConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'username',
  validation: {
    required: true,
    requiredMessage: t('auth.validation.usernameRequired'),
    rules: [
      { type: 'minLength', param: 4, message: t('auth.validation.usernameMinLength') },
      { type: 'maxLength', param: 20, message: t('auth.validation.usernameMaxLength') },
      {
        type: 'custom',
        param: () => !usernameTaken.value,
        message: t('auth.validation.usernameTaken') || 'Username is already taken'
      }
    ]
  },
  validateOnInput: false
}))

// Sync config and trigger validation when usernameTaken changes
watch(usernameConfig, (newConfig) => {
  const state = interactionsEngine.getFieldState(newConfig)
  if (state) {
    state.validationConfig = newConfig.validation
    // Always validate to reflect taken status or clear it
    // Only if we have a value to avoid premature required errors (though validateOnInput=false helps)
    if (state.value) {
      interactionsEngine.validateField(newConfig)
    }
  }
})

// Get field states
const roleState = computed(() => interactionsEngine.getFieldState(roleConfig.value))
const usernameState = computed(() => interactionsEngine.getFieldState(usernameConfig.value))

// Map validation errors
const roleErrors = computed(() => {
  if (!hasAttemptedSubmit.value) return []
  if (!roleState.value || roleState.value.isValid) return []
  return roleState.value.failedRules.map(rule => ({
    error: rule.message,
    icon: InformationCircleIcon
  }))
})

const usernameErrors = computed(() => {
  if (!usernameState.value || usernameState.value.isValid) return []

  const errors = usernameState.value.failedRules.map(rule => ({
    error: rule.message,
    icon: InformationCircleIcon,
    type: rule.type
  }))

  if (hasAttemptedSubmit.value) return errors

  // If not submitted, only show 'custom' (taken) error
  return errors.filter(e => e.type === 'custom').map(e => ({ ...e, icon: null }))
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
  return t('auth.register.Onboarding.button')
})

// Get active locale from localeManager
const locale = computed(() => getActiveLocale())

// Watch locale changes and update validation configs
watch(i18nLocale, async (newLocale, oldLocale) => {
  if (!oldLocale || newLocale === oldLocale) return // Skip initial or no-op changes

  console.log(`[ONBOARDING] Locale changed from '${oldLocale}' to '${newLocale}'`)

  // Reload translations for the new locale
  try {
    await loadTranslationsForSection('auth', newLocale)
  } catch (err) {
    console.error('[ONBOARDING] Failed to reload translations:', err)
  }

  // Update validation configs in field states
  const roleState = interactionsEngine.getFieldState(roleConfig.value)
  const usernameState = interactionsEngine.getFieldState(usernameConfig.value)

  if (roleState) {
    // Clear any existing browser validation message
    if (roleState.element && roleState.element.setCustomValidity) {
      roleState.element.setCustomValidity('')
    }
    roleState.validationConfig = roleConfig.value.validation
    if (hasAttemptedSubmit.value && !roleState.isValid) {
      interactionsEngine.validateField(roleConfig.value)
      // Update browser error message if field is still invalid
      if (!roleState.isValid && roleState.element) {
        const firstError = roleState.failedRules?.[0]
        if (firstError?.message && roleState.element.setCustomValidity) {
          roleState.element.setCustomValidity(firstError.message)
        }
      }
    }
  }

  if (usernameState) {
    // Clear any existing browser validation message
    if (usernameState.element && usernameState.element.setCustomValidity) {
      usernameState.element.setCustomValidity('')
    }
    usernameState.validationConfig = usernameConfig.value.validation
    if (hasAttemptedSubmit.value && !usernameState.isValid) {
      interactionsEngine.validateField(usernameConfig.value)
      // Update browser error message if field is still invalid
      if (!usernameState.isValid && usernameState.element) {
        const firstError = usernameState.failedRules?.[0]
        if (firstError?.message && usernameState.element.setCustomValidity) {
          usernameState.element.setCustomValidity(firstError.message)
        }
      }
    }
  }
})

// Preload auth section translations
onMounted(async () => {
  console.log(`[ONBOARDING] Component mounted, current locale: ${locale.value}`)

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
      name: 'onboarding-styles',
      url: '/css/onboarding.css',
      type: 'css',
      critical: true,
      priority: 'high'
    },
    {
      name: 'kyc-bg',
      url: '/images/kyc-status-bg.jpg',
      type: 'image',
      priority: 'normal'
    }
  ]

  // Initialize AssetHandler using factory
  assetHandler.value = await createAssetHandler(assetsConfig, {
    name: 'AuthOnboarding',
    debug: true
  })

  // Load translations for auth section
  try {
    await loadTranslationsForSection('auth', locale.value)
  } catch (err) {
    console.error('[ONBOARDING] Failed to load translations:', err)
  }

  // Load critical assets using AssetHandler
  try {
    console.log('[ONBOARDING] Loading assets via AssetHandler...')
    const result = await assetHandler.value.ensureAssetDependencies(
      assetsConfig.map(a => a.name),
      { strict: true }
    )

    console.log('[ONBOARDING] Assets loaded:', result)

    // Check if Cognito is ready (AssetHandler ensures load, but we verify global)
    if (typeof window.AmazonCognitoIdentity !== 'undefined') {
      isCognitoScriptReady.value = true
      console.log('[ONBOARDING] Cognito script ready')
    } else {
      // Fallback check if needed, but ensureAssetDependencies should have handled it
      console.warn('[ONBOARDING] Cognito loaded but global not found?')
      isCognitoScriptReady.value = true // Assuming load success means it's there
    }
  } catch (assetError) {
    console.error('[ONBOARDING] Asset loading failed:', assetError)
    error.value = 'Failed to load required resources. Please refresh.'
  }

  // Register fields with validation engine
  const roleElement = document.getElementById('role')
  const usernameElement = document.getElementById('username')
  interactionsEngine.register(roleConfig.value, selectedRole.value, roleElement)
  interactionsEngine.register(usernameConfig.value, username.value, usernameElement)
  console.log('[ONBOARDING] Validation engine initialized')

  // Add click outside listener
  document.addEventListener('click', handleClickOutside)
})

// Cleanup AssetHandler
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  if (assetHandler.value) {
    assetHandler.value.dispose()
  }
})

// Handle input changes
// Replaced by selectRole for custom dropdown, keeping this for reference if needed or if logic differs
/*
const handleRoleChange = (e) => {
  selectedRole.value = e.target.value
  const state = interactionsEngine.getFieldState(roleConfig.value)
  if (state) {
    state.value = selectedRole.value
  }
  // ...
}
*/

const handleUsernameInput = (value) => {
  username.value = value
  usernameTaken.value = false // Reset taken status on input
  const state = interactionsEngine.getFieldState(usernameConfig.value)
  if (state) {
    state.value = value
  }
  if (state?.element && state.element.setCustomValidity) {
    state.element.setCustomValidity('')
  }
  if (hasAttemptedSubmit.value) {
    interactionsEngine.validateField(usernameConfig.value)
    if (state?.isValid && state?.element) {
      state.element.classList.remove('first-invalid')
    }
  }

  // Debounced Username Check
  if (usernameDebounceTimer) clearTimeout(usernameDebounceTimer)

  if (value && value.length >= 3) {
    usernameChecking.value = true
    usernameDebounceTimer = setTimeout(async () => {
      try {
        console.log("[ONBOARDING] Username input:", value)
        const result = await apiWrapper.get('/users/username-exists', { username: value })

        console.log("[ONBOARDING] Username check result:", result)

        if (result.exists) {
          // Show error if username exists
          // Note: API returns partial matches too, logic depends on strict requirement
          // Assuming exact match here for simplicity or handled by backend scenarios
          if (result.matches && result.matches.some(u => u.toLowerCase() === value.toLowerCase())) {
            console.warn("[ONBOARDING] Username exists")
            usernameTaken.value = true
          }
        }
      } catch (err) {
        console.error("[ONBOARDING] Username check failed:", err)
      } finally {
        usernameChecking.value = false

        // Always re-validate to update UI immediately
        interactionsEngine.validateField(usernameConfig.value)
      }
    }, 500) // 500ms debounce
  }
}

async function completeOnboarding() {
  if (isLoading.value) return

  error.value = ""
  hasAttemptedSubmit.value = true

  // Validate entire form
  const validationResult = interactionsEngine.validateScope(SCOPE_ID)
  if (!validationResult || !validationResult.isValid) {
    console.log('[ONBOARDING] Form validation failed:', validationResult?.invalidFields)

    // Find first invalid field
    let firstInvalidField = null
    const fieldOrder = ['role', 'username']
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
        const errorMessage = firstError?.message || t('auth.validation.roleRequired')

        const fieldConfig = firstInvalidField.fieldId === 'role' ? roleConfig.value : usernameConfig.value
        interactionsEngine.runInteractions([{ type: 'showBrowserError', message: errorMessage }], fieldConfig)
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.focus()
      }
    }
    return
  }

  isLoading.value = true

  try {
    console.log("[ONBOARDING] Updating user attributes:", {
      role: selectedRole.value,
      username: username.value
    })

    const userId = await userIdUtility.getUserId()

    // Update attributes in Cognito/dev shim AND call API in parallel
    await Promise.all([
      authHandler.updateProfileAttributes({
        'custom:role': selectedRole.value,
        'custom:username': username.value
      }),
      apiWrapper.post('/users/sign-up/onboarding', {
        userId: userId,
        jwtToken: auth.idToken, // Assuming current session token
        role: selectedRole.value,
        username: username.value,
        action: 'signUpOnboarding'
      })
    ])

    // Optionally keep the chosen username locally for later profile use
    auth.updateUserAttributesLocally({ username: username.value })

    console.log("[ONBOARDING] Role saved, marking local onboardingPassed=true and refreshing session")

    // Mark step1 complete locally per spec
    auth.updateUserAttributesLocally({ onboardingPassed: true })

    // Refresh token (may now include role)
    const { idToken } = await authHandler.restoreSession()
    auth.setTokenAndDecode(idToken)

    // RouteGuard will handle redirects - creators will be redirected to KYC if needed
    if (popupNavHandler) {
      popupNavHandler('/dashboard')
    } else {
      router.push('/dashboard')
    }
  } catch (err) {
    console.error("[ONBOARDING] Failed to complete onboarding:", err)
    error.value = "Failed to complete onboarding: " + (err.message || "Unknown error")
    isLoading.value = false
  }
}
</script>

<script>
export const assets = {
  critical: ["/css/onboarding.css"],
  high: [],
  normal: ["/images/kyc-status-bg.jpg"],
}
</script>

<style scoped>
/* Custom styling for transitions if needed, but Tailwind classes usually suffice */
</style>
