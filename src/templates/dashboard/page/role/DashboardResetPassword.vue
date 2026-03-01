<template>
  <div class="w-full max-w-md mx-auto p-6">
    <div class="flex flex-col gap-6">
      <Heading :text="t('auth.resetPassword.title', 'Reset Password')" tag="h1" theme="AuthHeading" />

      <Paragraph
        :text="t('auth.resetPassword.subtitle', 'Enter your current password and a new password to update your credentials.')"
        font-size="text-base" font-color="text-gray-400" />

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-6">
        <!-- Current Password - Only show if standard user -->
        <InputAuthComponent v-if="!isSystemPassword" :model-value="currentPassword"
          @update:model-value="handleCurrentPasswordInput"
          :placeholder="t('auth.fields.currentPasswordPlaceholder', 'Current Password')" id="currentPassword" show-label
          :label-text="t('auth.fields.currentPasswordLabel', 'Current Password')" :type="currentPasswordInputType"
          :right-icon="currentPasswordIcon" @click:right-icon="toggleCurrentPasswordVisibility" data-required="true"
          required-display="italic-text" :show-errors="currentPasswordErrors.length > 0" :errors="currentPasswordErrors"
          :text-color="inputTextColor" :placeholder-color="inputPlaceholderColor" :label-color="inputLabelColor" />

        <!-- New Password -->
        <InputAuthComponent :model-value="newPassword" @update:model-value="handleNewPasswordInput"
          :placeholder="t('auth.fields.newPasswordPlaceholder', 'New Password')" id="newPassword" show-label
          :label-text="t('auth.fields.newPasswordLabel', 'New Password')" data-required="true"
          required-display="italic-text" :type="newPasswordInputType" :right-icon="newPasswordIcon"
          :show-errors="newPasswordErrors.length > 0" :errors="newPasswordErrors"
          :on-success="newPasswordSuccess.length > 0" :success="newPasswordSuccess"
          @click:right-icon="toggleNewPasswordVisibility" :text-color="inputTextColor"
          :placeholder-color="inputPlaceholderColor" :label-color="inputLabelColor" />

        <!-- Confirm New Password -->
        <InputAuthComponent :model-value="confirmPassword" @update:model-value="handleConfirmPasswordInput"
          :placeholder="t('auth.fields.confirmNewPasswordPlaceholder', 'Confirm New Password')" id="confirmPassword"
          show-label :label-text="t('auth.fields.confirmNewPasswordLabel', 'Confirm New Password')" data-required="true"
          required-display="italic-text" :type="confirmPasswordInputType" :right-icon="confirmPasswordIcon"
          :show-errors="confirmPasswordErrors.length > 0" :errors="confirmPasswordErrors"
          :on-success="confirmPasswordSuccess.length > 0" :success="confirmPasswordSuccess"
          @click:right-icon="toggleConfirmPasswordVisibility" :text-color="inputTextColor"
          :placeholder-color="inputPlaceholderColor" :label-color="inputLabelColor" />

        <!-- Submit Button -->
        <ButtonComponent :text="buttonText" variant="authPink" size="lg" :disabled="isLoading || !isFormValid"
          type="submit" />
      </form>

      <!-- Success Message -->
      <div v-if="successMessage"
        class="flex items-center gap-3 bg-green-900/40 border-l-4 border-green-500 px-4 py-3 rounded shadow-lg">
        <CheckCircleIcon class="w-6 h-6 text-green-500 flex-shrink-0" />
        <p class="text-green-100 text-sm font-medium">
          {{ successMessage }}
        </p>
      </div>

      <!-- Error Message -->
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
          class="text-white/70 hover:text-white transition-all duration-200 flex-shrink-0 hover:scale-110">
          <XMarkIcon class="w-5 h-5 stroke-2" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { interactionsEngine } from "@/utils/validation/interactionsEngine.js";
import { changeUserPassword, getUserAttributes, adminSetUserPassword } from "@/utils/auth/awsCognitoHandler.js";
import InputAuthComponent from "@/components/input/InputAuthComponent.vue";
import Heading from "@/components/default/Heading.vue";
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import Paragraph from "@/components/default/Paragraph.vue";
import {
  InformationCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";
import { ExclamationCircleIcon } from "@heroicons/vue/24/solid";

const { t } = useI18n();

// State
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const error = ref("");
const successMessage = ref("");
const isLoading = ref(false);
const hasAttemptedSubmit = ref(false);
const isSystemPassword = ref(false); // True if password was created by system (social login)

const SCOPE_ID = "resetPasswordForm";

// Styles for white background visibility
const inputTextColor = "text-gray-900";
const inputPlaceholderColor = "placeholder:text-gray-500";
const inputLabelColor = "text-gray-700";

// Configs
const currentPasswordConfig = computed(() => ({
  scope: SCOPE_ID,
  id: "currentPassword",
  validation: {
    required: !isSystemPassword.value, // Only required if NOT system password
    requiredMessage: t("auth.validation.passwordRequired", "Password is required"),
  },
  validateOnInput: true,
  ui: {
    dynamicType: "password",
    visibilityMetaKey: "currentPasswordVisible",
  },
}));

const newPasswordConfig = computed(() => ({
  scope: SCOPE_ID,
  id: "newPassword",
  validation: {
    required: true,
    requiredMessage: t("auth.validation.passwordRequired", "Password is required"),
    rules: [
      {
        type: "minLength",
        param: 8,
        message: t("auth.validation.passwordMinLength", "Min 8 characters"),
      },
      { type: "hasUpper", message: t("auth.validation.passwordHasUpper", "Upper case letter") },
      { type: "hasLower", message: t("auth.validation.passwordHasLower", "Lower case letter") },
      { type: "hasNumber", message: t("auth.validation.passwordHasNumber", "Number") },
    ],
  },
  validateOnInput: true,
  ui: {
    dynamicType: "password",
    visibilityMetaKey: "newPasswordVisible",
  },
}));

const confirmPasswordConfig = computed(() => ({
  scope: SCOPE_ID,
  id: "confirmPassword",
  validation: {
    required: true,
    requiredMessage: t("auth.validation.confirmPasswordRequired", "Confirm password is required"),
    rules: [
      {
        type: "matchValue",
        param: "newPassword",
        message: t("auth.validation.confirmPasswordMatch", "Passwords must match"),
      },
    ],
  },
  validateOnInput: true,
  ui: {
    dynamicType: "password",
    visibilityMetaKey: "confirmPasswordVisible",
  },
}));

// Engine States
const currentPasswordState = computed(() => interactionsEngine.getFieldState(currentPasswordConfig.value));
const newPasswordState = computed(() => interactionsEngine.getFieldState(newPasswordConfig.value));
const confirmPasswordState = computed(() => interactionsEngine.getFieldState(confirmPasswordConfig.value));

// Icons & Visibility
const currentPasswordInputType = computed(() => interactionsEngine.getInputType(currentPasswordConfig.value, "password"));
const newPasswordInputType = computed(() => interactionsEngine.getInputType(newPasswordConfig.value, "password"));
const confirmPasswordInputType = computed(() => interactionsEngine.getInputType(confirmPasswordConfig.value, "password"));

const currentPasswordIcon = computed(() => (currentPasswordInputType.value === "text" ? EyeIcon : EyeSlashIcon));
const newPasswordIcon = computed(() => (newPasswordInputType.value === "text" ? EyeIcon : EyeSlashIcon));
const confirmPasswordIcon = computed(() => (confirmPasswordInputType.value === "text" ? EyeIcon : EyeSlashIcon));

function toggleCurrentPasswordVisibility() {
  interactionsEngine.runInteractions(
    [{ type: "toggleFieldMeta", metaKey: "currentPasswordVisible" }],
    currentPasswordConfig.value
  );
}
function toggleNewPasswordVisibility() {
  interactionsEngine.runInteractions(
    [{ type: "toggleFieldMeta", metaKey: "newPasswordVisible" }],
    newPasswordConfig.value
  );
}
function toggleConfirmPasswordVisibility() {
  interactionsEngine.runInteractions(
    [{ type: "toggleFieldMeta", metaKey: "confirmPasswordVisible" }],
    confirmPasswordConfig.value
  );
}

// Errors
const currentPasswordErrors = computed(() => {
  if (!currentPasswordState.value || currentPasswordState.value.isValid) return [];
  if (!hasAttemptedSubmit.value) return [];
  return currentPasswordState.value.failedRules.map(r => ({ error: r.message, icon: InformationCircleIcon }));
});

const newPasswordErrors = computed(() => {
  if (!newPasswordState.value || newPasswordState.value.isValid) return [];
  return newPasswordState.value.failedRules
    .filter(r => r.type !== 'required' || hasAttemptedSubmit.value)
    .map(r => ({ error: r.message, icon: InformationCircleIcon }));
});

const confirmPasswordErrors = computed(() => {
  if (!confirmPasswordState.value || confirmPasswordState.value.isValid) return [];
  return confirmPasswordState.value.failedRules
    .filter(r => r.type !== 'required' || hasAttemptedSubmit.value)
    .map(r => ({ error: r.message, icon: InformationCircleIcon }));
});

// Success indicators
function getValidationSuccess(fieldState, fieldConfig) {
  if (!fieldState || !fieldConfig) return [];
  const rules = (fieldConfig.validation || {}).rules || [];
  const failedTypes = new Set((fieldState.failedRules || []).map(r => r.type));
  const success = [];
  rules.forEach(rule => {
    if (!failedTypes.has(rule.type)) {
      success.push({
        message: rule.message,
        icon: CheckCircleIcon,
        iconColor: "text-[#07f468]",
        textColor: "text-[12px] sm:text-[14px] text-[#07f468]",
      });
    }
  });
  return success;
}

const newPasswordSuccess = computed(() => {
  if (!newPassword.value) return [];
  return getValidationSuccess(newPasswordState.value, newPasswordConfig.value);
});

const confirmPasswordSuccess = computed(() => {
  if (!confirmPassword.value || !newPassword.value) return [];
  return getValidationSuccess(confirmPasswordState.value, confirmPasswordConfig.value);
});

// Inputs
function handleCurrentPasswordInput(val) {
  currentPassword.value = val;
  interactionsEngine.processFieldChange(currentPasswordConfig.value, val);
}
function handleNewPasswordInput(val) {
  newPassword.value = val;
  interactionsEngine.processFieldChange(newPasswordConfig.value, val);
}
function handleConfirmPasswordInput(val) {
  confirmPassword.value = val;
  interactionsEngine.processFieldChange(confirmPasswordConfig.value, val);
}

// Button State
const buttonText = computed(() => {
  if (isLoading.value) return t('common.loading', 'Loading...');
  return isSystemPassword.value
    ? t('auth.resetPassword.setNewPassword', 'Set Password')
    : t('auth.resetPassword.button', 'Reset Password');
});

const isFormValid = computed(() => {
  if (isSystemPassword.value) {
    return newPassword.value && confirmPassword.value;
  }
  return currentPassword.value && newPassword.value && confirmPassword.value;
});

// Init & Attribute Check
onMounted(async () => {
  interactionsEngine.register(currentPasswordConfig.value, currentPassword.value);
  interactionsEngine.register(newPasswordConfig.value, newPassword.value);
  interactionsEngine.register(confirmPasswordConfig.value, confirmPassword.value);

  // Check if user has system-generated password
  try {
    console.log("Fetching user attributes...");
    const attrs = await getUserAttributes();
    console.log("User attributes fetched:", attrs);
    if (attrs['custom:password_source'] === 'system') {
      console.log("System password detected. Hiding current password field.");
      isSystemPassword.value = true;
    } else {
      console.log("User password detected (or attribute missing).");
    }
  } catch (e) {
    console.error("Failed to fetch user attributes", e);
  }
});

// Submit
async function handleSubmit() {
  hasAttemptedSubmit.value = true;
  error.value = "";
  successMessage.value = "";

  // Force validation
  let isValid = true;

  // Validate current password ONLY if not system password
  if (!isSystemPassword.value) {
    const v1 = interactionsEngine.validateField(currentPasswordConfig.value);
    if (!v1.isValid) isValid = false;
  }

  const v2 = interactionsEngine.validateField(newPasswordConfig.value);
  const v3 = interactionsEngine.validateField(confirmPasswordConfig.value);

  if (!isValid || !v2.isValid || !v3.isValid) {
    error.value = t('auth.error.fixErrors', "Please fix the errors above.");
    return;
  }

  isLoading.value = true;

  try {
    if (isSystemPassword.value) {
      // Admin set password (mocked backend for now)
      await adminSetUserPassword(newPassword.value);
      // After setting password, they are now a standard user with a known password
      isSystemPassword.value = false;
    } else {
      // Standard change password
      await changeUserPassword(currentPassword.value, newPassword.value);
    }

    successMessage.value = t('auth.resetPassword.success', "Password successfully updated.");

    // Clear fields
    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
    hasAttemptedSubmit.value = false;

    // Reset validation states
    interactionsEngine.processFieldChange(currentPasswordConfig.value, "");
    interactionsEngine.processFieldChange(newPasswordConfig.value, "");
    interactionsEngine.processFieldChange(confirmPasswordConfig.value, "");

  } catch (err) {
    console.error("Password reset failure:", err);
    error.value = err.message || t('auth.error.unknown', "An error occurred.");
  } finally {
    isLoading.value = false;
  }
}
</script>
