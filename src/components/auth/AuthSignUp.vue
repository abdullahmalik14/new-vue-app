<template>
  <!-- signup-container -->
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
      <Heading :text="t('auth.register.button')" tag="h2" theme="AuthHeading" />

      <form @submit.prevent="handleSignUp" class="flex flex-col gap-8">
        <div class="flex items-center gap-1">
          <Paragraph :text="t('auth.register.haveAccount')" font-size="text-base" font-weight="font-medium"
            font-color="text-white" />

          <!-- Log in link — popup-aware -->
          <component :is="popupNavHandler ? 'button' : RouterLink"
            v-bind="popupNavHandler ? { type: 'button' } : { to: '/log-in' }"
            @click="popupNavHandler ? popupNavHandler('/log-in') : undefined"
            class="text-base font-medium leading-6 text-[#f06]"
            :class="{ 'opacity-50 pointer-events-none': isLoading }">
            {{ t("auth.login.button") }}
          </component>
        </div>

        <div class="flex flex-col gap-4">
          <!-- Email input -->
          <InputAuthComponent :model-value="email" @update:model-value="handleEmailInput"
            :placeholder="t('auth.register.emailPlaceholder')" id="email" show-label
            :label-text="t('auth.register.emailAddress')" data-required="true" required-display="italic-text"
            type="text" :show-errors="emailErrors.length > 0" :errors="emailErrors" :disabled="isLoading" />

          <!-- Password input -->
          <InputAuthComponent :model-value="password" @update:model-value="handlePasswordInput"
            :placeholder="t('auth.register.passwordPlaceholder')" id="password" show-label
            :label-text="t('auth.register.passwordLabel')" data-required="true" required-display="italic-text"
            :type="passwordInputType" :right-icon="passwordIcon" :show-errors="passwordErrors.length > 0"
            :errors="passwordErrors" :on-success="passwordSuccess.length > 0" :success="passwordSuccess"
            @click:right-icon="togglePasswordVisibility" :disabled="isLoading" />

          <!-- Confirm Password input -->
          <InputAuthComponent :model-value="confirmPassword" @update:model-value="handleConfirmPasswordInput"
            :placeholder="t('auth.register.confirmPasswordPlaceholder')" id="confirmPassword" show-label
            :label-text="t('auth.register.confirmPasswordLabel')" data-required="true" required-display="italic-text"
            :type="confirmPasswordInputType" :right-icon="confirmPasswordIcon"
            :show-errors="confirmPasswordErrors.length > 0" :errors="confirmPasswordErrors"
            :on-success="confirmPasswordSuccess.length > 0" :success="confirmPasswordSuccess"
            @click:right-icon="toggleConfirmPasswordVisibility" :disabled="isLoading" />
        </div>

        <!-- Signup button -->
        <ButtonComponent :text="buttonText" variant="authPink" size="lg" :disabled="isLoading || !isCognitoScriptReady"
          type="submit" />

        <!-- Continue with X button -->
        <ButtonComponent :text="t('auth.login.continueWithX')" variant="authTransparent" size="lg" :leftIcon="xIcon"
          leftIconClass="w-8 h-8" :disabled="isLoading" @click="handleTwitterLogin" />

        <ButtonComponent :text="t('auth.login.continueWithTelegram')" variant="authTransparent" size="lg"
          :leftIcon="telegramIcon" leftIconClass="w-8 h-8" :disabled="isLoading" @click="handleTelegramLogin" />
      </form>

      <!-- Error message -->
      <div v-if="error"
        class="flex items-center gap-3 bg-gradient-to-r from-[#5d1906] to-[#0e0401] border-l-4 border-l-[#e8723e] px-2 py-3 shadow-lg relative">
        <div class="relative flex-shrink-0 w-10 h-10 flex items-center justify-center">
          <div class="absolute inset-0 bg-[#2a0f08] rounded-xl"></div>
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
import { authHandler, getCurrentAuthMode } from "@/utils/auth/authHandler";
import { useAuthStore } from "@/stores/useAuthStore";
import { getAssetUrl } from "@/utils/assets/assetLibrary";
import { createAssetHandler } from "@/utils/assets/assetHandlerFactory.js";
import { interactionsEngine } from "@/utils/validation/interactionsEngine.js";
import {
  InformationCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";
import { ExclamationCircleIcon } from "@heroicons/vue/24/solid";
import InputAuthComponent from "@/components/input/InputAuthComponent.vue";
import Heading from "@/components/default/Heading.vue";
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import Paragraph from "@/components/default/Paragraph.vue";
import { initiateTwitterLogin } from "@/utils/auth/socialAuthHandler.js";
import { initiateTelegramLogin } from "@/utils/auth/telegramAuthHandler.js";
import { authenticateOrSignUpTelegramUser } from "@/utils/auth/telegramCognitoHandler.js";

const { t, locale: i18nLocale } = useI18n();
const route = useRoute();
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const error = ref("");
const isLoading = ref(false);
const xIcon = ref("");
const telegramIcon = ref("");
const isCognitoScriptReady = ref(false);
const router = useRouter();
const assetHandler = ref(null);
const auth = useAuthStore();
const popupNavHandler = inject('popupNavHandler', null);
const popupGoBack = inject('popupGoBack', null);

onMounted(() => {
  if (route.query.error === 'user_not_found') {
    error.value = t('User not found. Please create an account.');
    // Or just a hardcoded message if translation key missing
    if (error.value === 'User not found. Please create an account.') {
      error.value = "Account not found. Please sign up first.";
    }
  }
});

const twitterPopupRef = ref(null);
const twitterOAuthState = ref(null);
const twitterPopupCheckInterval = ref(null);
const telegramPopupRef = ref(null);
const telegramAuthState = ref(null);
const telegramPopupCheckInterval = ref(null);

// Validation scope
const SCOPE_ID = "signupForm";

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
    rules: [
      {
        type: "minLength",
        param: 8,
        message: t("auth.validation.passwordMinLength"),
      },
      { type: "hasUpper", message: t("auth.validation.passwordHasUpper") },
      { type: "hasLower", message: t("auth.validation.passwordHasLower") },
      { type: "hasNumber", message: t("auth.validation.passwordHasNumber") },
      // { type: 'hasSpecial', message: t('auth.validation.passwordHasSpecial') }
    ],
  },
  validateOnInput: true,
  ui: {
    dynamicType: "password",
    visibilityMetaKey: "passwordVisible",
  },
}));

const confirmPasswordConfig = computed(() => ({
  scope: SCOPE_ID,
  id: "confirmPassword",
  validation: {
    required: true,
    requiredMessage: t("auth.validation.confirmPasswordRequired"),
    rules: [
      {
        type: "matchValue",
        param: "password",
        message: t("auth.validation.confirmPasswordMatch"),
      },
    ],
  },
  validateOnInput: true,
  ui: {
    dynamicType: "password",
    visibilityMetaKey: "confirmPasswordVisible",
  },
}));

// Get field states from the engine
const emailState = computed(() =>
  interactionsEngine.getFieldState(emailConfig.value)
);
const passwordState = computed(() =>
  interactionsEngine.getFieldState(passwordConfig.value)
);
const confirmPasswordState = computed(() =>
  interactionsEngine.getFieldState(confirmPasswordConfig.value)
);

// Map validation errors to InputAuthComponent format
// Show all errors, but filter required errors to only show after submit
const emailErrors = computed(() => {
  if (!emailState.value || emailState.value.isValid) return [];

  // Filter: show required errors only after submit, show all other errors always
  return emailState.value.failedRules
    .filter((rule) => rule.type !== "required" || hasAttemptedSubmit.value)
    .map((rule) => ({
      error: rule.message,
      icon: InformationCircleIcon,
    }));
});

// Helper to get validation success messages (for password fields showing what's valid)
const getValidationSuccess = (fieldState, fieldConfig, fieldId) => {
  if (!fieldState || !fieldConfig) return [];

  const rules =
    (fieldState.validationConfig || fieldConfig.validation || {}).rules || [];
  const failedTypes = new Set(
    (fieldState.failedRules || []).map((r) => r.type)
  );
  const success = [];

  rules.forEach((rule) => {
    const isFailed = failedTypes.has(rule.type);
    if (!isFailed) {
      success.push({
        message: rule.message,
        icon: CheckCircleIcon,
        iconColor: "text-[#07f468]",
        textColor: "text-[12px] sm:text-[14px] text-[#07f468]",
      });
    }
  });

  return success;
};

// Password errors: show all non-required errors on input change, required errors only after submit
const passwordErrors = computed(() => {
  if (!passwordState.value || passwordState.value.isValid) return [];

  // Filter: show required errors only after submit, show all other errors always
  return passwordState.value.failedRules
    .filter((rule) => rule.type !== "required" || hasAttemptedSubmit.value)
    .map((rule) => ({
      error: rule.message,
      icon: InformationCircleIcon,
    }));
});

const passwordSuccess = computed(() => {
  if (!password.value?.trim()) return [];
  return getValidationSuccess(
    passwordState.value,
    passwordConfig.value,
    "password"
  );
});

// Confirm password errors: show all non-required errors on input change, required errors only after submit
const confirmPasswordErrors = computed(() => {
  if (!confirmPasswordState.value || confirmPasswordState.value.isValid)
    return [];

  // Filter: show required errors only after submit, show all other errors always
  return confirmPasswordState.value.failedRules
    .filter((rule) => rule.type !== "required" || hasAttemptedSubmit.value)
    .map((rule) => ({
      error: rule.message,
      icon: InformationCircleIcon,
    }));
});

const confirmPasswordSuccess = computed(() => {
  if (!confirmPassword.value?.trim() || !password.value?.trim()) return [];
  return getValidationSuccess(
    confirmPasswordState.value,
    confirmPasswordConfig.value,
    "confirmPassword"
  );
});

// Computed properties for dynamic input types (password visibility)
const passwordInputType = computed(() => {
  return interactionsEngine.getInputType(passwordConfig.value, "password");
});

const confirmPasswordInputType = computed(() => {
  return interactionsEngine.getInputType(
    confirmPasswordConfig.value,
    "password"
  );
});

// Computed properties for dynamic password icons (eye/eye-slash)
const passwordIcon = computed(() => {
  if (!password.value) return null;
  const isPasswordVisible = passwordInputType.value === "text";
  return isPasswordVisible ? EyeIcon : EyeSlashIcon;
});

const confirmPasswordIcon = computed(() => {
  if (!confirmPassword.value) return null;
  const isPasswordVisible = confirmPasswordInputType.value === "text";
  return isPasswordVisible ? EyeIcon : EyeSlashIcon;
});

// Computed properties for password toggle text
const passwordToggleText = computed(() => {
  const isPasswordVisible = passwordInputType.value === "text";
  return isPasswordVisible
    ? t("auth.common.hidePassword")
    : t("auth.common.showPassword");
});

const confirmPasswordToggleText = computed(() => {
  const isPasswordVisible = confirmPasswordInputType.value === "text";
  return isPasswordVisible
    ? t("auth.common.hidePassword")
    : t("auth.common.showPassword");
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
  return t("auth.register.button");
});

// Get active locale from localeManager
const locale = computed(() => getActiveLocale());

// Watch locale changes and update validation configs
watch(i18nLocale, async (newLocale, oldLocale) => {
  if (!oldLocale || newLocale === oldLocale) return; // Skip initial or no-op changes

  console.log(`[SIGNUP] Locale changed from '${oldLocale}' to '${newLocale}'`);

  // Reload translations for the new locale
  try {
    await loadTranslationsForSection("auth", newLocale);
  } catch (err) {
    console.error("[SIGNUP] Failed to reload translations:", err);
  }

  // Update validation configs in field states
  const emailState = interactionsEngine.getFieldState(emailConfig.value);
  const passwordState = interactionsEngine.getFieldState(passwordConfig.value);
  const confirmPasswordState = interactionsEngine.getFieldState(
    confirmPasswordConfig.value
  );

  if (emailState) {
    // Clear any existing browser validation message
    if (emailState.element && emailState.element.setCustomValidity) {
      emailState.element.setCustomValidity("");
    }
    emailState.validationConfig = emailConfig.value.validation;
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
    if (!passwordState.isValid) {
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

  if (confirmPasswordState) {
    // Clear any existing browser validation message
    if (
      confirmPasswordState.element &&
      confirmPasswordState.element.setCustomValidity
    ) {
      confirmPasswordState.element.setCustomValidity("");
    }
    confirmPasswordState.validationConfig =
      confirmPasswordConfig.value.validation;
    if (!confirmPasswordState.isValid) {
      interactionsEngine.validateField(confirmPasswordConfig.value);
      // Update browser error message if field is still invalid
      if (!confirmPasswordState.isValid && confirmPasswordState.element) {
        const firstError = confirmPasswordState.failedRules?.[0];
        if (
          firstError?.message &&
          confirmPasswordState.element.setCustomValidity
        ) {
          confirmPasswordState.element.setCustomValidity(firstError.message);
        }
      }
    }
  }
});

// Preload auth section translations
onMounted(async () => {
  console.log(`[SIGNUP] Component mounted, current locale: ${locale.value}`);

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
    name: "AuthSignUp",
    debug: true,
  });

  // Load icons independently (dynamic)
  xIcon.value = await getAssetUrl("icon.social.x");
  telegramIcon.value = await getAssetUrl("icon.social.telegram");

  // Load translations for auth section
  try {
    await loadTranslationsForSection("auth", locale.value);
  } catch (error) {
    console.error("[SIGNUP] Failed to load translations:", error);
  }

  // Load critical assets using AssetHandler
  try {
    console.log("[SIGNUP] Loading assets via AssetHandler...");
    const result = await assetHandler.value.ensureAssetDependencies(
      assetsConfig.map((a) => a.name),
      { strict: true }
    );

    console.log("[SIGNUP] Assets loaded:", result);

    // Check if Cognito is ready (AssetHandler ensures load, but we verify global)
    if (typeof window.AmazonCognitoIdentity !== "undefined") {
      isCognitoScriptReady.value = true;
      console.log("[SIGNUP] Cognito script ready");
    } else {
      // Fallback check if needed, but ensureAssetDependencies should have handled it
      console.warn("[SIGNUP] Cognito loaded but global not found?");
      isCognitoScriptReady.value = true; // Assuming load success means it's there
    }
  } catch (assetError) {
    console.error("[SIGNUP] Asset loading failed:", assetError);
    error.value = "Failed to load required resources. Please refresh.";
  }

  // Register fields with validation engine
  const emailElement = document.getElementById("email");
  const passwordElement = document.getElementById("password");
  const confirmPasswordElement = document.getElementById("confirmPassword");

  interactionsEngine.register(emailConfig.value, email.value, emailElement);
  interactionsEngine.register(
    passwordConfig.value,
    password.value,
    passwordElement
  );
  interactionsEngine.register(
    confirmPasswordConfig.value,
    confirmPassword.value,
    confirmPasswordElement
  );

  console.log("[SIGNUP] Validation engine initialized");
});

// Twitter OAuth popup message handler (same as login page)
function handleTwitterAuthMessage(event) {
  const data = event?.data;
  if (!data || typeof data !== "object") return;

  const popup = twitterPopupRef.value;
  const expectedState = twitterOAuthState.value;

  const isFromPopup = !!popup && event.source === popup;
  const hasExpectedState = !!expectedState && data.state === expectedState;
  if (!isFromPopup) return;

  if (data.type === "TWITTER_OAUTH_CODE") {
    const { code, state } = data;

    // Clear popup check interval since we got a response
    if (twitterPopupCheckInterval.value) {
      clearInterval(twitterPopupCheckInterval.value);
      twitterPopupCheckInterval.value = null;
    }

    if (!code || !state || !hasExpectedState) {
      error.value = "Twitter login failed: Invalid state";
      isLoading.value = false;

      // Clear popup check interval on state mismatch
      if (twitterPopupCheckInterval.value) {
        clearInterval(twitterPopupCheckInterval.value);
        twitterPopupCheckInterval.value = null;
      }
      twitterPopupRef.value = null;
      twitterOAuthState.value = null;
      return;
    }

    if (event.source) {
      event.source.postMessage({ type: "TWITTER_OAUTH_ACK", success: true, state }, event.origin || "*");
    }

    handleTwitterOAuthCode(code, state)
      .then(() => {
        window.removeEventListener("message", handleTwitterAuthMessage);
        // Clear popup check interval
        if (twitterPopupCheckInterval.value) {
          clearInterval(twitterPopupCheckInterval.value);
          twitterPopupCheckInterval.value = null;
        }
        twitterPopupRef.value = null;
        twitterOAuthState.value = null;
      })
      .catch((err) => {
        if (err.message && err.message.includes('Account exists')) {
          error.value = "Account exists with this email but is not linked to Twitter. Please login with email.";
          isLoading.value = false;
          return;
        }
        error.value = "Twitter signup failed: " + (err.message || "Unknown error");
        isLoading.value = false;

        // Clear popup check interval on error
        if (twitterPopupCheckInterval.value) {
          clearInterval(twitterPopupCheckInterval.value);
          twitterPopupCheckInterval.value = null;
        }
        twitterPopupRef.value = null;
        twitterOAuthState.value = null;
      });
  } else if (data.type === "TWITTER_AUTH_ERROR") {
    if (!hasExpectedState) return;
    error.value = data.error || "Twitter login failed";
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

async function handleTwitterOAuthCode(code, state) {
  const { handleTwitterCallback } = await import("@/utils/auth/socialAuthHandler.js");
  const tokens = await handleTwitterCallback(code, state, 'auth', 'signup');

  localStorage.setItem("idToken", tokens.idToken);
  localStorage.setItem("accessToken", tokens.accessToken);
  localStorage.setItem("refreshToken", tokens.refreshToken);

  auth.setTokenAndDecode(tokens.idToken);
  auth.startTokenRefreshLoop();
  // RouteGuard will handle redirects based on dependencies (onboarding/KYC)
  // NOTE: Do NOT set isLoading = false here. Maintain loading state during transition.
  if (popupNavHandler) {
    popupNavHandler('/dashboard');
  } else {
    await router.push("/dashboard");
  }

  console.log("[SIGNUP] Twitter OAuth flow completed successfully");
}

async function handleTwitterLogin() {
  if (isLoading.value) return;
  error.value = "";
  isLoading.value = true;

  try {
    window.removeEventListener("message", handleTwitterAuthMessage);
    window.addEventListener("message", handleTwitterAuthMessage, { once: false });

    const { popup, state } = await initiateTwitterLogin();
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
        twitterPopupRef.value = null;
        twitterOAuthState.value = null;
        isLoading.value = false; // Restore interactivity if user closes popup
        window.removeEventListener("message", handleTwitterAuthMessage);
        console.log("[SIGNUP] Twitter popup was closed by user");
      }
    }, 500); // Check every 500ms
  } catch (err) {
    error.value = "Failed to start Twitter login: " + (err.message || "Unknown error");
    isLoading.value = false;
    window.removeEventListener("message", handleTwitterAuthMessage);
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
    return;
  }

  if (data.type === "TELEGRAM_AUTH_SUCCESS") {
    // Clear popup check interval since we got a response
    if (telegramPopupCheckInterval.value) {
      clearInterval(telegramPopupCheckInterval.value);
      telegramPopupCheckInterval.value = null;
    }

    if (event.source) {
      event.source.postMessage({ type: "TELEGRAM_AUTH_ACK", success: true, state: data.state }, event.origin || "*");
    }
    handleTelegramUser(data.user)
      .then(() => {
        window.removeEventListener("message", handleTelegramAuthMessage);
        telegramPopupRef.value = null;
        telegramAuthState.value = null;
      })
      .catch((err) => {
        error.value = "Telegram login failed: " + (err.message || "Unknown error");
        isLoading.value = false;
        telegramPopupRef.value = null;
        telegramAuthState.value = null;
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
  const tokens = await authenticateOrSignUpTelegramUser(telegramUser, 'signup');

  localStorage.setItem("idToken", tokens.idToken);
  localStorage.setItem("accessToken", tokens.accessToken);
  localStorage.setItem("refreshToken", tokens.refreshToken);

  auth.setTokenAndDecode(tokens.idToken);
  auth.startTokenRefreshLoop();
  // RouteGuard will handle redirects based on dependencies (onboarding/KYC)
  // NOTE: Do NOT set isLoading = false here. Maintain loading state during transition.
  if (popupNavHandler) {
    popupNavHandler('/dashboard');
  } else {
    await router.push("/dashboard");
  }
}

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
        telegramPopupRef.value = null;
        telegramAuthState.value = null;
        isLoading.value = false; // Restore interactivity if user closes popup
        window.removeEventListener("message", handleTelegramAuthMessage);
        console.log("[SIGNUP] Telegram popup was closed by user");
      }
    }, 500); // Check every 500ms
  } catch (err) {
    error.value = "Failed to start Telegram login: " + (err.message || "Unknown error");
    isLoading.value = false;
    window.removeEventListener("message", handleTelegramAuthMessage);
    if (telegramPopupCheckInterval.value) {
      clearInterval(telegramPopupCheckInterval.value);
      telegramPopupCheckInterval.value = null;
    }
  }
}

// Cleanup AssetHandler
onBeforeUnmount(() => {
  if (assetHandler.value) {
    assetHandler.value.dispose();
  }

  window.removeEventListener("message", handleTwitterAuthMessage);
  window.removeEventListener("message", handleTelegramAuthMessage);
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
  // Use processFieldChange to validate on input (but required errors are filtered in computed)
  interactionsEngine.processFieldChange(passwordConfig.value, value);

  // Always clear browser validation when user types (to reset any previous validation message)
  const state = interactionsEngine.getFieldState(passwordConfig.value);
  if (state?.element && state.element.setCustomValidity) {
    state.element.setCustomValidity("");
  }

  // Remove first-invalid class if field becomes valid
  if (state?.isValid && state?.element) {
    state.element.classList.remove("first-invalid");
  }

  // Re-validate confirm password since it depends on password
  if (confirmPassword.value) {
    interactionsEngine.processFieldChange(
      confirmPasswordConfig.value,
      confirmPassword.value
    );
    // Also clear browser validation for confirm password when password changes
    const confirmState = interactionsEngine.getFieldState(
      confirmPasswordConfig.value
    );
    if (confirmState?.element && confirmState.element.setCustomValidity) {
      confirmState.element.setCustomValidity("");
    }
  }
};

const handleConfirmPasswordInput = (value) => {
  confirmPassword.value = value;
  // Use processFieldChange to validate on input (but required errors are filtered in computed)
  interactionsEngine.processFieldChange(confirmPasswordConfig.value, value);

  // Always clear browser validation when user types (to reset any previous validation message)
  const state = interactionsEngine.getFieldState(confirmPasswordConfig.value);
  if (state?.element && state.element.setCustomValidity) {
    state.element.setCustomValidity("");
  }

  // Remove first-invalid class if field becomes valid
  if (state?.isValid && state?.element) {
    state.element.classList.remove("first-invalid");
  }
};

// Toggle password visibility
const togglePasswordVisibility = () => {
  interactionsEngine.runInteractions(
    [{ type: "toggleFieldMeta", metaKey: "passwordVisible" }],
    passwordConfig.value
  );
};

const toggleConfirmPasswordVisibility = () => {
  interactionsEngine.runInteractions(
    [{ type: "toggleFieldMeta", metaKey: "confirmPasswordVisible" }],
    confirmPasswordConfig.value
  );
};

async function handleSignUp() {
  if (isLoading.value) return;

  error.value = "";

  // Mark that submit has been attempted (this will show validation errors)
  hasAttemptedSubmit.value = true;

  // Validate entire form using validation engine
  const validationResult = interactionsEngine.validateScope(SCOPE_ID);

  // CRITICAL: Do not proceed if validation fails - prevent API call
  if (!validationResult || !validationResult.isValid) {
    console.log(
      "[SIGNUP] Form validation failed - blocking API call:",
      validationResult?.invalidFields || "No validation result"
    );
    console.log(
      "[SIGNUP] All validation errors:",
      validationResult?.invalidFields
    );

    // NOTE: All errors are automatically displayed under each input field via computed properties
    // (emailErrors, passwordErrors, confirmPasswordErrors) - they show ALL failedRules
    // The browser popup below is just for UX (focus/scroll to first invalid field)

    // Find first invalid field from validation result, checking in desired order
    // Use the validation result's invalidFields array to ensure we have fresh validation state
    const fieldOrder = ["email", "password", "confirmPassword"]; // Check fields in this order
    let firstInvalidFieldInfo = null;

    // Create a map of invalid fields for quick lookup
    const invalidFieldsMap = new Map();
    if (validationResult?.invalidFields) {
      validationResult.invalidFields.forEach((invalidField) => {
        invalidFieldsMap.set(invalidField.fieldId, invalidField);
      });
    }

    // Find first invalid field in our desired order
    for (const fieldId of fieldOrder) {
      if (invalidFieldsMap.has(fieldId)) {
        firstInvalidFieldInfo = invalidFieldsMap.get(fieldId);
        break;
      }
    }

    // Show browser popup for first invalid field only (for UX focus/scroll)
    if (firstInvalidFieldInfo) {
      const firstInvalidFieldId = firstInvalidFieldInfo.fieldId;
      const firstInvalidFieldState = interactionsEngine.getFieldState({
        scope: SCOPE_ID,
        id: firstInvalidFieldId,
      });

      // Get the element - use field state element or fallback to document.getElementById
      const element =
        firstInvalidFieldState?.element ||
        document.getElementById(firstInvalidFieldId);

      if (element) {
        // Remove 'first-invalid' class from all fields first
        const allFields = ["email", "password", "confirmPassword"];
        allFields.forEach((fieldId) => {
          const fieldElement = document.getElementById(fieldId);
          if (fieldElement) {
            fieldElement.classList.remove("first-invalid");
          }
        });

        // Add 'first-invalid' class to first invalid field
        element.classList.add("first-invalid");

        // Get first non-required error if available, otherwise use first error
        // Use failedRules from validation result to ensure we have fresh error messages
        const failedRules =
          firstInvalidFieldInfo.failedRules ||
          firstInvalidFieldState.failedRules ||
          [];
        const nonRequiredError = failedRules.find(
          (rule) => rule.type !== "required"
        );
        const firstError = nonRequiredError || failedRules[0];
        // Use the translated message from the validation rule
        const errorMessage =
          firstError?.message || t("auth.validation.emailRequired");

        // Get the correct field config based on fieldId
        let fieldConfig;
        if (firstInvalidFieldId === "email") {
          fieldConfig = emailConfig.value;
        } else if (firstInvalidFieldId === "password") {
          fieldConfig = passwordConfig.value;
        } else if (firstInvalidFieldId === "confirmPassword") {
          fieldConfig = confirmPasswordConfig.value;
        }

        // Use interactionsEngine's showBrowserError action (UX popup for focus)
        if (fieldConfig) {
          interactionsEngine.runInteractions(
            [
              {
                type: "showBrowserError",
                message: errorMessage,
              },
            ],
            fieldConfig
          );
        }

        // Scroll to first invalid field
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();

        console.log(
          "[SIGNUP] First invalid field:",
          firstInvalidFieldId,
          element
        );
      }
    }

    // All validation errors are shown under each input field via computed properties
    // Ensure we don't set loading state if validation fails
    isLoading.value = false;
    return; // Exit early - do NOT call authHandler.register
  }

  // Only proceed if validation passed - set loading state
  console.log("[SIGNUP] Form validation passed, proceeding with registration");
  isLoading.value = true;

  try {
    console.log("[SIGNUP] Attempting signup with:", { email: email.value });

    await authHandler.register(email.value.trim(), password.value, {
      email: email.value.trim(),
      name: email.value.trim(),
    });

    const mode =
      typeof getCurrentAuthMode === "function"
        ? getCurrentAuthMode()
        : window.APP?.getCurrentAuthMode?.();

    if (mode === "cognito") {
      // Store password temporarily for auto-login after email confirmation
      sessionStorage.setItem("pendingSignupPassword", password.value);
      sessionStorage.setItem("pendingSignupEmail", email.value.trim());
      console.log(
        "[SIGNUP] Cognito mode → storing password for auto-login, redirecting to /confirm-email"
      );
      if (popupNavHandler) {
        popupNavHandler('/confirm-email');
      } else {
        await router.push("/confirm-email");
      }
    } else {
      console.log("[SIGNUP] Dev shim mode → redirecting to /log-in");
      if (popupNavHandler) {
        popupNavHandler('/log-in');
      } else {
        await router.push("/log-in");
      }
    }
  } catch (err) {
    console.error("[SIGNUP] Signup error:", err);
    error.value = err?.message || "Sign up failed. Please try again.";
    isLoading.value = false;
  }
}
</script>

<script>
export const assets = {
  critical: ["/css/auth.css"],
  high: [],
  normal: ["/images/auth-bg.jpg"],
};
</script>
