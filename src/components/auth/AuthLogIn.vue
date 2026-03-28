<template>
  <!-- login-container -->
  <div class="flex flex-col w-full relative gap-6 z-[5]">
    <div class="flex flex-col w-full gap-6">
      <!-- Heading -->
      <Heading :text="t('auth.login.button')" tag="h2" theme="AuthHeading" />

      <form @submit.prevent="handleLogin" class="flex flex-col gap-8">
        <div class="flex items-center gap-1">
          <Paragraph :text="t('auth.login.noAccount')" font-size="text-base" font-weight="font-medium"
            font-color="text-white" />

          <!-- Sign Up link — popup-aware -->
          <component :is="popupNavHandler ? 'button' : RouterLink"
            v-bind="popupNavHandler ? { type: 'button' } : { to: '/sign-up' }"
            @click="popupNavHandler ? popupNavHandler('/sign-up') : undefined"
            class="text-base font-medium leading-6 text-[#f06]"
            :class="{ 'opacity-50 pointer-events-none': isLoading }">
            {{ t("auth.register.button") }}
          </component>
        </div>

        <div class="flex flex-col gap-4">
          <InputAuthComponent :model-value="email" @update:model-value="handleEmailInput"
            :placeholder="t('auth.login.emailPlaceholder')" id="email" show-label
            :label-text="t('auth.login.emailLabel')" data-required="true" required-display="italic-text" type="text"
            :show-errors="emailErrors.length > 0" :errors="emailErrors" :disabled="isLoading" />

          <div class="flex flex-col gap-4">
            <InputAuthComponent :model-value="password" @update:model-value="handlePasswordInput"
              :placeholder="t('auth.login.passwordPlaceholder')" id="password" show-label
              :label-text="t('auth.login.passwordLabel')" data-required="true" required-display="italic-text"
              type="password"
              :show-errors="passwordErrors.length > 0" :errors="passwordErrors"
              :disabled="isLoading" />
            <!-- Forgot password link — popup-aware -->
            <component :is="popupNavHandler ? 'button' : RouterLink"
              v-bind="popupNavHandler ? { type: 'button' } : { to: '/lost-password' }"
              @click="popupNavHandler ? popupNavHandler('/lost-password') : undefined"
              class="w-fit opacity-70 text-xs capitalize text-text font-normal"
              :class="{ 'opacity-50 pointer-events-none': isLoading }">
              {{ t("auth.login.forgotPassword") }}
            </component>
          </div>
        </div>

        <Checkbox v-model="rememberMe" :label="t('auth.login.rememberMe')"
          checkboxClass="m-0 border border-checkboxBorder [appearance:none] w-[0.75rem] h-[0.75rem] rounded-[2px] bg-transparent relative cursor-pointer checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.2rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45 "
          labelClass="text-[0.875rem] leading-6 text-text cursor-pointer" wrapperClass="flex items-center gap-2"
          :disabled="isLoading" />

        <ButtonComponent :text="buttonText" variant="authPink" size="lg" :disabled="isLoading || !isCognitoScriptReady"
          type="submit" />

        <ButtonComponent :text="t('auth.login.continueWithX')" variant="authTransparent" size="lg" :leftIcon="xIcon"
          leftIconClass="w-8 h-8" :disabled="isLoading" @click="handleTwitterLogin" />

        <ButtonComponent :text="t('auth.login.continueWithTelegram')" variant="authTransparent" size="lg"
          :leftIcon="telegramIcon" leftIconClass="w-8 h-8" :disabled="isLoading" @click="handleTelegramLogin" />
      </form>

      <!-- Error message -->
      <div v-if="error"
        class="flex items-center gap-3 bg-gradient-to-r from-[#5d1906] to-[#0e0401] border-l-4 border-l-[#e8723e] px-2 py-3 shadow-lg relative">
        <div class="relative flex-shrink-0 w-10 h-10 flex items-center justify-center">
          <div class="absolute inset-0 bg-[#6b1d06] rounded-xl"></div>
          <div class="absolute inset-0 bg-[#e8723e]/20 rounded-full blur-md"></div>
          <ExclamationCircleIcon class="w-6 h-6 text-[#ff6535] relative z-10" />
        </div>
        <p class="text-white text-[15px] font-normal leading-relaxed flex-1">
          {{ error }}
        </p>
        <button @click="error = ''" type="button"
          class="text-white/70 hover:text-white transition-all duration-200 flex-shrink-0 hover:scale-110"
          aria-label="Close error message">
          <XMarkIcon class="w-5 h-5 stroke-2" />
        </button>
      </div>
    </div>
    <!-- Loading overlay -->

  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, onBeforeUnmount, inject } from "vue";
import { RouterLink, useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { getActiveLocale } from "@/utils/translation/localeManager.js";
import { loadTranslationsForSection } from "@/utils/translation/translationLoader.js";
import { useAuthStore } from "@/stores/useAuthStore";
import { authHandler } from "@/utils/auth/authHandler";
import { getAssetUrl } from "@/utils/assets/assetLibrary";
import { createAssetHandler } from "@/utils/assets/assetHandlerFactory.js";
import { interactionsEngine } from "@/utils/validation/interactionsEngine.js";
import {
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";
import { ExclamationCircleIcon } from "@heroicons/vue/24/solid";
import InputAuthComponent from "@/components/input/InputAuthComponent.vue";
import Heading from "@/components/default/Heading.vue";
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import Checkbox from "@/components/checkbox/CheckboxGroup.vue";
import Paragraph from "@/components/default/Paragraph.vue";
import apiWrapper from "@/lib/mock-api-demo/apiWrapper.js";
import { userIdUtility } from "@/lib/mock-api-demo/utilities/userId.js";
import { ipUtility } from "@/lib/mock-api-demo/utilities/ipHelper.js";
import { browserUtility } from "@/lib/mock-api-demo/utilities/browserHelper.js";
import { initiateTwitterLogin } from "@/utils/auth/socialAuthHandler.js";
import { initiateTelegramLogin } from "@/utils/auth/telegramAuthHandler.js";
import { authenticateOrSignUpTelegramUser } from "@/utils/auth/telegramCognitoHandler.js";

const { t, locale: i18nLocale } = useI18n();
const route = useRoute();
const rememberMe = ref(false);
const email = ref("");
const password = ref("");
const error = ref("");
const router = useRouter();
const auth = useAuthStore();
const isLoading = ref(false);
const popupNavHandler = inject('popupNavHandler', null);
const xIcon = ref("");
const telegramIcon = ref("");
const isCognitoScriptReady = ref(false);
const assetHandler = ref(null);
const twitterPopupRef = ref(null);
const twitterOAuthState = ref(null);
const twitterPopupCheckInterval = ref(null);
const telegramPopupRef = ref(null);
const telegramAuthState = ref(null);
const telegramPopupCheckInterval = ref(null);

// Validation scope
const SCOPE_ID = "loginForm";

// Track if form has been submitted to control when to show errors
const hasAttemptedSubmit = ref(false);

// Field configurations with translated validation messages
const emailConfig = computed(() => ({
  scope: SCOPE_ID,
  id: "email",
  validation: {
    required: true,
    requiredMessage: t("auth.validation.emailRequired"),
    rules: [{ type: "isEmail", message: t("auth.validation.emailInvalid") }],
  },
  validateOnInput: false,
}));

const passwordConfig = computed(() => ({
  scope: SCOPE_ID,
  id: "password",
  validation: {
    required: true,
    requiredMessage: t("auth.validation.passwordRequired"),
  },
  validateOnInput: false,
}));

// Get field states from the engine
const emailState = computed(() =>
  interactionsEngine.getFieldState(emailConfig.value)
);
const passwordState = computed(() =>
  interactionsEngine.getFieldState(passwordConfig.value)
);

// Map validation errors to InputAuthComponent format
// Only show errors after submit has been attempted
const emailErrors = computed(() => {
  if (!hasAttemptedSubmit.value) return [];
  if (!emailState.value || emailState.value.isValid) return [];
  return emailState.value.failedRules.map((rule) => ({
    error: rule.message,
    icon: InformationCircleIcon,
  }));
});

const passwordErrors = computed(() => {
  if (!hasAttemptedSubmit.value) return [];
  if (!passwordState.value || passwordState.value.isValid) return [];
  return passwordState.value.failedRules.map((rule) => ({
    error: rule.message,
    icon: InformationCircleIcon,
  }));
});

// Computed button text based on loading and script availability
const buttonText = computed(() => {
  const getLoadingText = () => {
    // Try multiple translation keys with fallback
    const text1 = t("common.loading");
    if (text1 && text1 !== "common.loading") return text1;

    const text2 = t("auth.common.loading");
    if (text2 && text2 !== "auth.common.loading") return text2;

    return "Loading..."; // Final fallback
  };

  if (isLoading.value) {
    return getLoadingText();
  }
  if (!isCognitoScriptReady.value) {
    return getLoadingText();
  }
  return t("auth.login.button");
});

// Get active locale from localeManager
const locale = computed(() => getActiveLocale());

// Watch locale changes and update validation configs
watch(i18nLocale, async (newLocale, oldLocale) => {
  if (!oldLocale || newLocale === oldLocale) return; // Skip initial or no-op changes

  console.log(`[LOGIN] Locale changed from '${oldLocale}' to '${newLocale}'`);

  // Reload translations for the new locale
  try {
    await loadTranslationsForSection("auth", newLocale);
  } catch (err) {
    console.error("[LOGIN] Failed to reload translations:", err);
  }

  // Update validation configs in field states (validationConfig is stored at registration)
  const emailState = interactionsEngine.getFieldState(emailConfig.value);
  const passwordState = interactionsEngine.getFieldState(passwordConfig.value);

  if (emailState) {
    // Clear any existing browser validation message
    if (emailState.element && emailState.element.setCustomValidity) {
      emailState.element.setCustomValidity("");
    }
    emailState.validationConfig = emailConfig.value.validation;
    // Re-validate if field was already validated to update error messages
    if (hasAttemptedSubmit.value && !emailState.isValid) {
      interactionsEngine.validateField(emailConfig.value);
      // Update browser error message if field is still invalid
      if (!emailState.isValid && emailState.element) {
        const firstError = emailState.failedRules?.[0];
        if (firstError?.message && emailState.element.setCustomValidity) {
          emailState.element.setCustomValidity(firstError.message);
        }
      }
    }
  }

  if (passwordState) {
    // Clear any existing browser validation message
    if (passwordState.element && passwordState.element.setCustomValidity) {
      passwordState.element.setCustomValidity("");
    }
    passwordState.validationConfig = passwordConfig.value.validation;
    // Re-validate if field was already validated to update error messages
    if (hasAttemptedSubmit.value && !passwordState.isValid) {
      interactionsEngine.validateField(passwordConfig.value);
      // Update browser error message if field is still invalid
      if (!passwordState.isValid && passwordState.element) {
        const firstError = passwordState.failedRules?.[0];
        if (firstError?.message && passwordState.element.setCustomValidity) {
          passwordState.element.setCustomValidity(firstError.message);
        }
      }
    }
  }
});

// Preload auth section translations and wait for Cognito script
onMounted(async () => {
  console.log(`[LOGIN] Component mounted, current locale: ${locale.value}`);

  // Define assets configuration
  const assetsConfig = [
    {
      name: "cognito-sdk",
      flag: "script.cognito",
      type: "script",
      critical: true,
      priority: "critical",
      retry: 2,
    },
    {
      name: "auth-styles",
      url: "/css/auth.css",
      type: "css",
      critical: true,
      priority: "high",
    },
    {
      name: "auth-bg",
      flag: "auth.background",
      type: "image",
      priority: "normal",
    },
  ];

  // Initialize AssetHandler using factory
  assetHandler.value = await createAssetHandler(assetsConfig, {
    name: "AuthLogin",
    debug: true,
  });

  // Load icons independently (dynamic)
  xIcon.value = await getAssetUrl("icon.social.x");
  telegramIcon.value = await getAssetUrl("icon.social.telegram");

  // Load translations for auth section
  try {
    await loadTranslationsForSection("auth", locale.value);
  } catch (translationError) {
    console.error("[LOGIN] Failed to load translations:", translationError);
  }

  // Load critical assets using AssetHandler
  try {
    console.log("[LOGIN] Loading assets via AssetHandler...");
    const result = await assetHandler.value.ensureAssetDependencies(
      assetsConfig.map((a) => a.name),
      { strict: true }
    );

    console.log("[LOGIN] Assets loaded:", result);

    // Check if Cognito is ready (AssetHandler ensures load, but we verify global)
    if (typeof window.AmazonCognitoIdentity !== "undefined") {
      isCognitoScriptReady.value = true;
      console.log("[LOGIN] Cognito script ready");
    } else {
      // Fallback check if needed, but ensureAssetDependencies should have handled it
      console.warn("[LOGIN] Cognito loaded but global not found?");
      isCognitoScriptReady.value = true; // Assuming load success means it's there
    }
  } catch (assetError) {
    console.error("[LOGIN] Asset loading failed:", assetError);
    error.value = "Failed to load required resources. Please refresh.";
  }

  // Register fields with validation engine
  const emailElement = document.getElementById("email");
  const passwordElement = document.getElementById("password");

  interactionsEngine.register(emailConfig.value, email.value, emailElement);
  interactionsEngine.register(
    passwordConfig.value,
    password.value,
    passwordElement
  );

  console.log("[LOGIN] Validation engine initialized");
});

// Handle input changes - only update values, validation happens on submit
const handleEmailInput = (value) => {
  email.value = value;
  // Update field state value without triggering validation
  const state = interactionsEngine.getFieldState(emailConfig.value);
  if (state) {
    state.value = value;
  }

  // Always clear browser validation when user types (to reset any previous validation message)
  if (state?.element && state.element.setCustomValidity) {
    state.element.setCustomValidity("");
  }

  // Re-validate only if submit was already attempted
  if (hasAttemptedSubmit.value) {
    interactionsEngine.validateField(emailConfig.value);
    // Remove first-invalid class if field becomes valid
    if (state?.isValid && state?.element) {
      state.element.classList.remove("first-invalid");
    }
  }
};

const handlePasswordInput = (value) => {
  password.value = value;
  // Update field state value without triggering validation
  const state = interactionsEngine.getFieldState(passwordConfig.value);
  if (state) {
    state.value = value;
  }

  // Always clear browser validation when user types (to reset any previous validation message)
  if (state?.element && state.element.setCustomValidity) {
    state.element.setCustomValidity("");
  }

  // Re-validate only if submit was already attempted
  if (hasAttemptedSubmit.value) {
    interactionsEngine.validateField(passwordConfig.value);
    // Remove first-invalid class if field becomes valid
    if (state?.isValid && state?.element) {
      state.element.classList.remove("first-invalid");
    }
  }
};

// Cleanup Assets
onBeforeUnmount(() => {
  if (assetHandler.value) {
    assetHandler.value.dispose();
  }
});

async function handleLogin() {
  if (isLoading.value) return;

  error.value = "";

  // Mark that submit has been attempted (this will show validation errors)
  hasAttemptedSubmit.value = true;

  // Validate entire form using validation engine
  const validationResult = interactionsEngine.validateScope(SCOPE_ID);

  // CRITICAL: Do not proceed if validation fails - prevent API call
  if (!validationResult || !validationResult.isValid) {
    console.log(
      "[LOGIN] Form validation failed - blocking API call:",
      validationResult?.invalidFields || "No validation result"
    );

    // Find first invalid field - check fields in order, only move to next if current is fully valid
    let firstInvalidField = null;
    const fieldOrder = ["email", "password"]; // Check fields in this order

    for (const fieldId of fieldOrder) {
      const fieldState = interactionsEngine.getFieldState({
        scope: SCOPE_ID,
        id: fieldId,
      });
      if (fieldState && !fieldState.isValid) {
        // Found first invalid field - stop checking
        firstInvalidField = { fieldId };
        break;
      }
      // If field is valid, continue to next field
    }

    if (firstInvalidField) {
      const firstInvalidFieldId = firstInvalidField.fieldId;
      const firstInvalidFieldState = interactionsEngine.getFieldState({
        scope: SCOPE_ID,
        id: firstInvalidFieldId,
      });

      if (firstInvalidFieldState?.element) {
        const element = firstInvalidFieldState.element;

        // Remove 'first-invalid' class from all fields first
        const allFields = ["email", "password"];
        allFields.forEach((fieldId) => {
          const fieldElement = document.getElementById(fieldId);
          if (fieldElement) {
            fieldElement.classList.remove("first-invalid");
          }
        });

        // Add 'first-invalid' class to first invalid field
        element.classList.add("first-invalid");

        // Get first non-required error if available, otherwise use first error
        const nonRequiredError = firstInvalidFieldState.failedRules?.find(
          (rule) => rule.type !== "required"
        );
        const firstError =
          nonRequiredError || firstInvalidFieldState.failedRules?.[0];
        // Use the translated message from the validation rule
        const errorMessage =
          firstError?.message || t("auth.validation.emailRequired");

        // Get the correct field config based on fieldId
        const fieldConfig =
          firstInvalidFieldId === "email"
            ? emailConfig.value
            : passwordConfig.value;

        // Use interactionsEngine's showBrowserError action
        interactionsEngine.runInteractions(
          [
            {
              type: "showBrowserError",
              message: errorMessage,
            },
          ],
          fieldConfig
        );

        // Scroll to first invalid field
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();

        console.log(
          "[LOGIN] First invalid field:",
          firstInvalidFieldId,
          element
        );
      }
    }

    // Validation errors are shown under each input field, no need for general error message
    // Ensure we don't set loading state if validation fails
    isLoading.value = false;
    return; // Exit early - do NOT call authHandler.login
  }

  // Only proceed if validation passed - set loading state
  console.log("[LOGIN] Form validation passed, proceeding with login");
  isLoading.value = true;

  try {
    console.log("[LOGIN] Attempting login with:", email.value);
    const { idToken, accessToken, refreshToken } = await authHandler.login(
      email.value,
      password.value
    );

    localStorage.setItem("idToken", idToken);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    // Decode token and set user
    auth.setTokenAndDecode(idToken);
    auth.startTokenRefreshLoop();

    // Tracking: New Sign Up (Silent)
    // Gather tracking data
    const userId = auth.currentUser?.sub || (await userIdUtility.getUserId());
    const ip = ipUtility.getCurrentIp() || (await ipUtility.fetchIP());
    const browserInfo = browserUtility.getBrowserInfo();

    console.log("[LOGIN] Tracking new sign-up:", { userId, ip });

    // Fire and forget (silent background call)
    apiWrapper
      .post("/users/new-sign-up", {
        userId: userId,
        email: email.value,
        action: "signUp",
        ip: ip,
        browser: JSON.stringify(browserInfo),
      })
      .then((res) => {
        console.log("[LOGIN] Tracking success:", res);
      })
      .catch((err) => {
        console.error("[LOGIN] Tracking failed:", err);
      });

    console.log("[LOGIN] Login successful, redirecting to dashboard");
    // RouteGuard will handle redirects based on dependencies (onboarding/KYC)
    // NOTE: Do NOT set isLoading = false here. We want the spinner to persist
    // until the router actually navigates away.
    if (popupNavHandler) {
      popupNavHandler('/dashboard');
    } else {
      await router.push("/dashboard");
    }
  } catch (err) {
    console.error("[LOGIN] Login failed:", err);
    error.value = "Login failed: " + (err.message || "Unknown error");
    isLoading.value = false;
  }
}

// Twitter OAuth popup message handler
function handleTwitterAuthMessage(event) {
  // Only accept messages from the popup we opened + matching OAuth state.
  // This is more reliable than strict origin matching, because the popup may complete on
  // a different origin (e.g., ngrok) while still being the same window reference.
  const data = event?.data;
  if (!data || typeof data !== "object") return;

  const popup = twitterPopupRef.value;
  const expectedState = twitterOAuthState.value;

  const isFromPopup = !!popup && event.source === popup;
  const hasExpectedState = !!expectedState && data.state === expectedState;

  // Ignore any unrelated postMessage traffic (Vite HMR, other widgets, etc.)
  if (!isFromPopup) return;

  console.log("[LOGIN] Received message from Twitter popup:", {
    type: data.type,
    origin: event.origin,
    hasExpectedState,
    expectedState,
    receivedState: data.state,
  });

  if (data.type === 'TWITTER_OAUTH_CODE') {
    console.log("[LOGIN] Processing Twitter OAuth code from popup");
    // Popup sent authorization code - handle it in parent window
    const { code, state } = data;

    // Clear popup check interval since we got a response
    if (twitterPopupCheckInterval.value) {
      clearInterval(twitterPopupCheckInterval.value);
      twitterPopupCheckInterval.value = null;
    }

    if (!code || !state) {
      console.error("[LOGIN] Missing code or state in message:", { code: !!code, state: !!state });
      error.value = "Twitter login failed: Missing authorization data";
      isLoading.value = false;

      // Send acknowledgment back to popup
      if (event.source) {
        event.source.postMessage({ type: 'TWITTER_OAUTH_ACK', success: false, state }, event.origin || "*");
      }
      return;
    }

    // Require state match before processing
    if (!hasExpectedState) {
      console.error("[LOGIN] State mismatch from popup message:", {
        expectedState,
        receivedState: state,
      });
      error.value = "Twitter login failed: Invalid state";
      isLoading.value = false;

      // Clear popup check interval on state mismatch
      if (twitterPopupCheckInterval.value) {
        clearInterval(twitterPopupCheckInterval.value);
        twitterPopupCheckInterval.value = null;
      }
      twitterPopupRef.value = null;
      twitterOAuthState.value = null;

      if (event.source) {
        event.source.postMessage(
          { type: "TWITTER_OAUTH_ACK", success: false, state, error: "state_mismatch" },
          event.origin || "*"
        );
      }
      return;
    }

    // Send acknowledgment that we received the message
    if (event.source) {
      event.source.postMessage({ type: 'TWITTER_OAUTH_ACK', success: true, state }, event.origin || "*");
    }

    handleTwitterOAuthCode(code, state)
      .then(() => {
        // Remove listener after successful completion
        window.removeEventListener('message', handleTwitterAuthMessage);
        // Cleanup the test listener if it was enabled
        if (window.__twitterTestListener) {
          window.removeEventListener('message', window.__twitterTestListener);
          delete window.__twitterTestListener;
        }
        // Clear popup check interval
        if (twitterPopupCheckInterval.value) {
          clearInterval(twitterPopupCheckInterval.value);
          twitterPopupCheckInterval.value = null;
        }
        twitterPopupRef.value = null;
        twitterOAuthState.value = null;
      })
      .catch((err) => {
        console.error("[LOGIN] Twitter OAuth processing failed:", err);
        console.error("[LOGIN] Error stack:", err.stack);
        error.value = "Twitter login failed: " + (err.message || "Unknown error");
        isLoading.value = false;

        // Clear popup check interval on error
        if (twitterPopupCheckInterval.value) {
          clearInterval(twitterPopupCheckInterval.value);
          twitterPopupCheckInterval.value = null;
        }
        twitterPopupRef.value = null;
        twitterOAuthState.value = null;

        // Send error acknowledgment to popup
        if (event.source) {
          event.source.postMessage({
            type: 'TWITTER_OAUTH_ACK',
            success: false,
            error: err.message,
            state
          }, event.origin || "*");
        }
      });
  } else if (data.type === 'TWITTER_AUTH_ERROR') {
    // State-check this too (prevents unrelated windows from spamming errors)
    if (!hasExpectedState) return;
    console.error("[LOGIN] Popup reported error:", data.error);
    error.value = data.error || 'Twitter login failed';
    isLoading.value = false;

    // Clear popup check interval on error
    if (twitterPopupCheckInterval.value) {
      clearInterval(twitterPopupCheckInterval.value);
      twitterPopupCheckInterval.value = null;
    }
    twitterPopupRef.value = null;
    twitterOAuthState.value = null;
  }
}

// Handle Twitter OAuth code (called in parent window)
async function handleTwitterOAuthCode(code, state) {
  console.log("[LOGIN] handleTwitterOAuthCode called with:", { hasCode: !!code, hasState: !!state, state });

  try {
    // Import here to avoid circular dependency
    const { handleTwitterCallback } = await import('@/utils/auth/socialAuthHandler.js');
    console.log("[LOGIN] Imported handleTwitterCallback, calling it...");

    // Handle callback in parent window (has access to code_verifier in memory)
    // Pass 'login' intent
    const tokens = await handleTwitterCallback(code, state, 'auth', 'login');
    console.log("[LOGIN] Received tokens from handleTwitterCallback:", {
      hasIdToken: !!tokens.idToken,
      hasAccessToken: !!tokens.accessToken,
      hasRefreshToken: !!tokens.refreshToken
    });

    // Store tokens same way as regular login
    localStorage.setItem('idToken', tokens.idToken);
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    console.log("[LOGIN] Tokens stored in localStorage");

    // Decode token and set user
    auth.setTokenAndDecode(tokens.idToken);
    auth.startTokenRefreshLoop();
    console.log("[LOGIN] User authenticated, redirecting to dashboard");
    // RouteGuard will handle redirects based on dependencies (onboarding/KYC)
    // NOTE: Do NOT set isLoading = false here. Maintain loading state during transition.
    if (popupNavHandler) {
      popupNavHandler('/dashboard');
    } else {
      await router.push('/dashboard');
    }

    console.log("[LOGIN] Twitter OAuth flow completed successfully");
  } catch (err) {
    console.error("[LOGIN] Twitter OAuth processing failed:", err);
    console.error("[LOGIN] Error details:", {
      message: err.message,
      stack: err.stack,
      name: err.name
    });

    if (err.message && (err.message.includes('User not found') || err.message.includes('UserNotFoundException'))) {
      console.log("[LOGIN] User not found, redirecting to sign-up");
      if (popupNavHandler) {
        popupNavHandler('/sign-up?error=user_not_found');
      } else {
        await router.push('/sign-up?error=user_not_found');
      }
      return;
    }

    if (err.message && err.message.includes('Account exists')) {
      error.value = "Account exists but is not linked. Please log in with email.";
      isLoading.value = false;
      return;
    }

    error.value = "Twitter login failed: " + (err.message || "Unknown error");
    isLoading.value = false;
    throw err;
  }
}

// Telegram popup message handler
function handleTelegramAuthMessage(event) {
  const data = event?.data;
  if (!data || typeof data !== "object") return;

  const popup = telegramPopupRef.value;
  const expectedState = telegramAuthState.value;

  const isFromPopup = !!popup && event.source === popup;
  if (!isFromPopup) return;

  const hasExpectedState = !!expectedState && data.state === expectedState;

  console.log("[LOGIN] Received message from Telegram popup:", {
    type: data.type,
    origin: event.origin,
    hasExpectedState,
    expectedState,
    receivedState: data.state
  });

  if (!hasExpectedState) {
    // Clear popup check interval on state mismatch
    if (telegramPopupCheckInterval.value) {
      clearInterval(telegramPopupCheckInterval.value);
      telegramPopupCheckInterval.value = null;
    }
    error.value = "Telegram login failed: Invalid state";
    isLoading.value = false;
    telegramPopupRef.value = null;
    telegramAuthState.value = null;
    if (event.source) {
      event.source.postMessage(
        { type: "TELEGRAM_AUTH_ACK", success: false, state: data.state, error: "state_mismatch" },
        event.origin || "*"
      );
    }
    return;
  }

  if (data.type === "TELEGRAM_AUTH_SUCCESS") {
    // Clear popup check interval since we got a response
    if (telegramPopupCheckInterval.value) {
      clearInterval(telegramPopupCheckInterval.value);
      telegramPopupCheckInterval.value = null;
    }

    // Ack receipt to allow popup to close fast
    if (event.source) {
      event.source.postMessage(
        { type: "TELEGRAM_AUTH_ACK", success: true, state: data.state },
        event.origin || "*"
      );
    }

    handleTelegramUser(data.user)
      .then(() => {
        window.removeEventListener("message", handleTelegramAuthMessage);
        telegramPopupRef.value = null;
        telegramAuthState.value = null;
      })
      .catch((err) => {
        console.error("[LOGIN] Telegram processing failed:", err);
        error.value = "Telegram login failed: " + (err.message || "Unknown error");
        isLoading.value = false;
        telegramPopupRef.value = null;
        telegramAuthState.value = null;
        if (event.source) {
          event.source.postMessage(
            { type: "TELEGRAM_AUTH_ACK", success: false, state: data.state, error: err.message },
            event.origin || "*"
          );
        }
      });
  } else if (data.type === "TELEGRAM_AUTH_ERROR") {
    // Clear popup check interval on error
    if (telegramPopupCheckInterval.value) {
      clearInterval(telegramPopupCheckInterval.value);
      telegramPopupCheckInterval.value = null;
    }
    error.value = data.error || "Telegram login failed";
    isLoading.value = false;
    telegramPopupRef.value = null;
    telegramAuthState.value = null;
  }
}

async function handleTelegramUser(telegramUser) {
  try {
    const tokens = await authenticateOrSignUpTelegramUser(telegramUser, 'login');

    localStorage.setItem("idToken", tokens.idToken);
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);

    auth.setTokenAndDecode(tokens.idToken);
    auth.startTokenRefreshLoop();
    // RouteGuard will handle redirects based on dependencies (onboarding/KYC)
    // NOTE: Do NOT set isLoading = false here. Maintain loading state during transition.
    await router.push("/dashboard");

  } catch (err) {
    if (err.message && (err.message.includes('User not found') || err.message.includes('UserNotFoundException'))) {
      console.log("[LOGIN] User not found (Telegram), redirecting to sign-up");
      await router.push('/sign-up?error=user_not_found');
      return;
    }
    throw err;
  }
}

// Handle Twitter login button click
async function handleTwitterLogin() {
  if (isLoading.value) return;

  error.value = "";
  isLoading.value = true;

  try {
    console.log("[LOGIN] Initiating Twitter OAuth");
    console.log("[LOGIN] Current origin:", window.location.origin);

    // Set up message listener for popup communication
    // Use capture phase and make sure it's not already added
    window.removeEventListener('message', handleTwitterAuthMessage); // Remove any existing first
    window.addEventListener('message', handleTwitterAuthMessage, { once: false });

    console.log("[LOGIN] Message listener registered. Listening for messages...");

    // Optional debug listener (disabled by default to avoid noise)
    // window.__twitterTestListener = (e) => console.log("[LOGIN] DEBUG message:", e);
    // window.addEventListener("message", window.__twitterTestListener, { once: false });

    // Open Twitter OAuth popup (stores code_verifier in parent window memory)
    const { popup, state } = await initiateTwitterLogin();
    console.log("[LOGIN] Popup opened:", { popup: !!popup, state });

    // Store popup reference to check if it's still open
    twitterPopupRef.value = popup;
    twitterOAuthState.value = state;

    // Check if popup is closed by user (polling)
    twitterPopupCheckInterval.value = setInterval(() => {
      if (popup.closed) {
        // Popup was closed by user
        clearInterval(twitterPopupCheckInterval.value);
        twitterPopupCheckInterval.value = null;
        twitterPopupRef.value = null;
        twitterOAuthState.value = null;
        twitterOAuthState.value = null;
        isLoading.value = false; // Restore interactivity if user closes popup
        window.removeEventListener('message', handleTwitterAuthMessage);
        console.log("[LOGIN] Twitter popup was closed by user");
      }
    }, 500); // Check every 500ms

    // Note: We don't set isLoading to false here because the popup will
    // send a message when done (success or error)
  } catch (err) {
    console.error("[LOGIN] Twitter login initiation failed:", err);
    error.value = "Failed to start Twitter login: " + (err.message || "Unknown error");
    isLoading.value = false;
    window.removeEventListener('message', handleTwitterAuthMessage);
  }
}

// Handle Telegram login button click
async function handleTelegramLogin() {
  if (isLoading.value) return;

  error.value = "";
  isLoading.value = true;

  try {
    window.removeEventListener("message", handleTelegramAuthMessage);
    window.addEventListener("message", handleTelegramAuthMessage, { once: false });

    const { popup, state } = await initiateTelegramLogin();
    telegramPopupRef.value = popup;
    telegramAuthState.value = state;

    // Check if popup is closed by user (polling)
    telegramPopupCheckInterval.value = setInterval(() => {
      if (popup.closed) {
        // Popup was closed by user
        clearInterval(telegramPopupCheckInterval.value);
        telegramPopupCheckInterval.value = null;
        telegramPopupRef.value = null;
        telegramAuthState.value = null;
        telegramAuthState.value = null;
        isLoading.value = false; // Restore interactivity if user closes popup
        window.removeEventListener("message", handleTelegramAuthMessage);
        console.log("[LOGIN] Telegram popup was closed by user");
      }
    }, 500); // Check every 500ms
  } catch (err) {
    console.error("[LOGIN] Telegram login initiation failed:", err);
    error.value = "Failed to start Telegram login: " + (err.message || "Unknown error");
    isLoading.value = false;
    window.removeEventListener("message", handleTelegramAuthMessage);
    if (telegramPopupCheckInterval.value) {
      clearInterval(telegramPopupCheckInterval.value);
      telegramPopupCheckInterval.value = null;
    }
  }
}


// Cleanup message listener on unmount
onBeforeUnmount(() => {
  window.removeEventListener('message', handleTwitterAuthMessage);
  window.removeEventListener("message", handleTelegramAuthMessage);
  if (window.__twitterTestListener) {
    window.removeEventListener('message', window.__twitterTestListener);
    delete window.__twitterTestListener;
  }
  // Cleanup Twitter popup check interval
  if (twitterPopupCheckInterval.value) {
    clearInterval(twitterPopupCheckInterval.value);
    twitterPopupCheckInterval.value = null;
  }
  // Cleanup Telegram popup check interval
  if (telegramPopupCheckInterval.value) {
    clearInterval(telegramPopupCheckInterval.value);
    telegramPopupCheckInterval.value = null;
  }
});
</script>

<script>
export const assets = {
  critical: ["/css/auth.css"],
  high: [],
  normal: ["/images/auth-bg.jpg"],
};
</script>
