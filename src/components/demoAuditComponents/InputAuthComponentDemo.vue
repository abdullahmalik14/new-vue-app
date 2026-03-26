<template>
  <div class="min-h-screen bg-gradient-to-br from-[#710A0A] to-[#200000] py-10 px-4 font-sans">
    <div class="max-w-6xl mx-auto flex flex-col gap-16">
      <section class="flex flex-col gap-6">
        <DemoSectionHeader title="InputAuthComponent — Live Demo" class="text-white" />

        <!-- Two columns: Login | SignUp -->
        <div class="flex flex-col lg:flex-row gap-8 items-start">

          <!-- ===== LOGIN SECTION ===== -->
          <div class="flex-1 flex flex-col gap-6">
            <h3 class="text-xl text-white font-semibold border-b border-white/10 pb-3">Login</h3>

            <form @submit.prevent="handleLoginSubmit" class="flex flex-col gap-4 w-full">
              <!-- Email -->
              <InputAuthComponent
                :model-value="loginEmail"
                @update:model-value="handleLoginEmailInput"
                placeholder="Enter your email"
                id="login-email"
                show-label
                label-text="Email Address"
                data-required="true"
                required-display="italic-text"
                type="text"
                :show-errors="loginEmailErrors.length > 0"
                :errors="loginEmailErrors"
              />

              <!-- Password -->
              <InputAuthComponent
                :model-value="loginPassword"
                @update:model-value="handleLoginPasswordInput"
                placeholder="••••••••"
                id="login-password"
                show-label
                label-text="Password"
                data-required="true"
                required-display="italic-text"
                :type="loginPasswordInputType"
                :right-icon="loginPasswordIcon"
                :show-errors="loginPasswordErrors.length > 0"
                :errors="loginPasswordErrors"
                @click:right-icon="toggleLoginPasswordVisibility"
              />

              <div class="mt-2">
                <ButtonComponent text="Log In" variant="authPink" size="lg" type="submit" />
              </div>
            </form>
          </div>

          <!-- Divider -->
          <div class="hidden lg:block w-px bg-white/10 self-stretch" />

          <!-- ===== SIGN UP SECTION ===== -->
          <div class="flex-1 flex flex-col gap-6">
            <h3 class="text-xl text-white font-semibold border-b border-white/10 pb-3">Sign Up</h3>

            <form @submit.prevent="handleSignupSubmit" class="flex flex-col gap-4 w-full">
              <!-- Email -->
              <InputAuthComponent
                :model-value="signupEmail"
                @update:model-value="handleSignupEmailInput"
                placeholder="Enter your email"
                id="signup-email"
                show-label
                label-text="Email Address"
                data-required="true"
                required-display="italic-text"
                type="text"
                :show-errors="signupEmailErrors.length > 0"
                :errors="signupEmailErrors"
              />

              <!-- Password -->
              <InputAuthComponent
                :model-value="signupPassword"
                @update:model-value="handleSignupPasswordInput"
                placeholder="••••••••"
                id="signup-password"
                show-label
                label-text="Password"
                data-required="true"
                required-display="italic-text"
                :type="signupPasswordInputType"
                :right-icon="signupPasswordIcon"
                :show-errors="signupPasswordErrors.length > 0"
                :errors="signupPasswordErrors"
                :on-success="signupPasswordSuccess.length > 0"
                :success="signupPasswordSuccess"
                @click:right-icon="toggleSignupPasswordVisibility"
              />

              <!-- Confirm Password -->
              <InputAuthComponent
                :model-value="signupConfirmPassword"
                @update:model-value="handleSignupConfirmPasswordInput"
                placeholder="••••••••"
                id="signup-confirmPassword"
                show-label
                label-text="Confirm Password"
                data-required="true"
                required-display="italic-text"
                :type="signupConfirmPasswordInputType"
                :right-icon="signupConfirmPasswordIcon"
                :show-errors="signupConfirmPasswordErrors.length > 0"
                :errors="signupConfirmPasswordErrors"
                :on-success="signupConfirmPasswordSuccess.length > 0"
                :success="signupConfirmPasswordSuccess"
                @click:right-icon="toggleSignupConfirmPasswordVisibility"
              />

              <div class="mt-2">
                <ButtonComponent text="Create Account" variant="authPink" size="lg" type="submit" />
              </div>
            </form>
          </div>
        </div>

        <!-- Code Reference Sections -->
        <div class="bg-[#1e1e1e] rounded-xl border border-white/10 p-6 flex flex-col gap-4">
          <h3 class="text-xl text-white font-semibold">1. Template Usage</h3>
          <p class="text-white/70 text-sm">Drop inputs in a <code>flex flex-col gap-4</code> form. No DemoCard wrappers needed.</p>
          <pre class="bg-black/50 p-4 rounded-lg overflow-x-auto text-sm text-green-400"><code>{{ templateCode }}</code></pre>
        </div>

        <div class="bg-[#1e1e1e] rounded-xl border border-white/10 p-6 flex flex-col gap-4">
          <h3 class="text-xl text-white font-semibold">2. Script — Interactions & Validation Wiring</h3>
          <p class="text-white/70 text-sm">Full script pattern to register fields with the engine, handle inputs, show/hide errors and success messages.</p>
          <pre class="bg-black/50 p-4 rounded-lg overflow-x-auto text-sm text-[#ce9178]"><code>{{ scriptCode }}</code></pre>
        </div>

      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import InputAuthComponent from '@/components/input/InputAuthComponent.vue';
import DemoSectionHeader from '@/templates/dev/DemoSectionHeader.vue';
import ButtonComponent from '@/components/button/ButtonComponent.vue';
import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';
import {
  InformationCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/vue/24/outline';

// ─────────────────────────────────────────────
// LOGIN scope
// ─────────────────────────────────────────────
const LOGIN_SCOPE = "demo-loginScope";

const loginEmail = ref("");
const loginPassword = ref("");
const loginHasAttemptedSubmit = ref(false);

const loginEmailConfig = computed(() => ({
  scope: LOGIN_SCOPE,
  id: "login-email",
  validation: {
    required: true,
    requiredMessage: "Email is required.",
    rules: [{ type: "isEmail", message: "Please enter a valid email address." }],
  },
  validateOnInput: false,
}));

const loginPasswordConfig = computed(() => ({
  scope: LOGIN_SCOPE,
  id: "login-password",
  validation: {
    required: true,
    requiredMessage: "Password is required.",
  },
  validateOnInput: false,
  ui: { dynamicType: "password", visibilityMetaKey: "loginPasswordVisible" },
}));

const loginEmailState = computed(() => interactionsEngine.getFieldState(loginEmailConfig.value));
const loginPasswordState = computed(() => interactionsEngine.getFieldState(loginPasswordConfig.value));

const loginEmailErrors = computed(() => {
  if (!loginEmailState.value || loginEmailState.value.isValid) return [];
  return loginEmailState.value.failedRules
    .filter((r) => r.type !== "required" || loginHasAttemptedSubmit.value)
    .map((r) => ({ error: r.message, icon: InformationCircleIcon }));
});

const loginPasswordErrors = computed(() => {
  if (!loginPasswordState.value || loginPasswordState.value.isValid) return [];
  return loginPasswordState.value.failedRules
    .filter((r) => r.type !== "required" || loginHasAttemptedSubmit.value)
    .map((r) => ({ error: r.message, icon: InformationCircleIcon }));
});

const loginPasswordInputType = computed(() =>
  interactionsEngine.getInputType(loginPasswordConfig.value, "password")
);
const loginPasswordIcon = computed(() =>
  loginPasswordInputType.value === "text" ? EyeIcon : EyeSlashIcon
);
const toggleLoginPasswordVisibility = () => {
  interactionsEngine.runInteractions(
    [{ type: "toggleFieldMeta", metaKey: "loginPasswordVisible" }],
    loginPasswordConfig.value
  );
};

const handleLoginEmailInput = (value) => {
  loginEmail.value = value;
  const state = interactionsEngine.getFieldState(loginEmailConfig.value);
  if (state) state.value = value;
  if (state?.element) state.element.setCustomValidity?.("");
  if (loginHasAttemptedSubmit.value) {
    interactionsEngine.validateField(loginEmailConfig.value);
    if (state?.isValid && state?.element) state.element.classList.remove("first-invalid");
  }
};

const handleLoginPasswordInput = (value) => {
  loginPassword.value = value;
  const state = interactionsEngine.getFieldState(loginPasswordConfig.value);
  if (state) state.value = value;
  if (state?.element) state.element.setCustomValidity?.("");
  if (loginHasAttemptedSubmit.value) {
    interactionsEngine.validateField(loginPasswordConfig.value);
    if (state?.isValid && state?.element) state.element.classList.remove("first-invalid");
  }
};

const handleLoginSubmit = () => {
  loginHasAttemptedSubmit.value = true;
  interactionsEngine.validateScope(LOGIN_SCOPE);
};

// ─────────────────────────────────────────────
// SIGNUP scope
// ─────────────────────────────────────────────
const SIGNUP_SCOPE = "demo-signupScope";

const signupEmail = ref("");
const signupPassword = ref("");
const signupConfirmPassword = ref("");
const signupHasAttemptedSubmit = ref(false);

const signupEmailConfig = computed(() => ({
  scope: SIGNUP_SCOPE,
  id: "signup-email",
  validation: {
    required: true,
    requiredMessage: "Email is required.",
    rules: [{ type: "isEmail", message: "Please enter a valid email address." }],
  },
  validateOnInput: false,
}));

const signupPasswordConfig = computed(() => ({
  scope: SIGNUP_SCOPE,
  id: "signup-password",
  validation: {
    required: true,
    requiredMessage: "Password is required.",
    rules: [
      { type: "minLength", param: 8, message: "Use 8 or more characters" },
      { type: "hasUpper", message: "Use upper case letters" },
      { type: "hasLower", message: "Use lower case letters" },
      { type: "hasNumber", message: "Use numbers" },
    ],
  },
  validateOnInput: true,
  ui: { dynamicType: "password", visibilityMetaKey: "signupPasswordVisible" },
}));

const signupConfirmPasswordConfig = computed(() => ({
  scope: SIGNUP_SCOPE,
  id: "signup-confirmPassword",
  validation: {
    required: true,
    requiredMessage: "Please confirm your password.",
    rules: [
      { type: "matchValue", param: "signup-password", message: "Passwords do not match." },
    ],
  },
  validateOnInput: true,
  ui: { dynamicType: "password", visibilityMetaKey: "signupConfirmPasswordVisible" },
}));

const signupEmailState = computed(() => interactionsEngine.getFieldState(signupEmailConfig.value));
const signupPasswordState = computed(() => interactionsEngine.getFieldState(signupPasswordConfig.value));
const signupConfirmPasswordState = computed(() => interactionsEngine.getFieldState(signupConfirmPasswordConfig.value));

// Helper
const getValidationSuccess = (fieldState, fieldConfig) => {
  if (!fieldState || !fieldConfig) return [];
  const rules = (fieldState.validationConfig || fieldConfig.validation || {}).rules || [];
  const failedTypes = new Set((fieldState.failedRules || []).map((r) => r.type));
  return rules
    .filter((r) => !failedTypes.has(r.type))
    .map((r) => ({ message: r.message, icon: CheckCircleIcon }));
};

const signupEmailErrors = computed(() => {
  if (!signupEmailState.value || signupEmailState.value.isValid) return [];
  return signupEmailState.value.failedRules
    .filter((r) => r.type !== "required" || signupHasAttemptedSubmit.value)
    .map((r) => ({ error: r.message, icon: InformationCircleIcon }));
});

const signupPasswordErrors = computed(() => {
  if (!signupPasswordState.value || signupPasswordState.value.isValid) return [];
  return signupPasswordState.value.failedRules
    .filter((r) => r.type !== "required" || signupHasAttemptedSubmit.value)
    .map((r) => ({ error: r.message, icon: InformationCircleIcon }));
});

const signupPasswordSuccess = computed(() => {
  if (!signupPassword.value?.trim()) return [];
  return getValidationSuccess(signupPasswordState.value, signupPasswordConfig.value);
});

const signupConfirmPasswordErrors = computed(() => {
  if (!signupConfirmPasswordState.value || signupConfirmPasswordState.value.isValid) return [];
  return signupConfirmPasswordState.value.failedRules
    .filter((r) => r.type !== "required" || signupHasAttemptedSubmit.value)
    .map((r) => ({ error: r.message, icon: InformationCircleIcon }));
});

const signupConfirmPasswordSuccess = computed(() => {
  if (!signupConfirmPassword.value?.trim() || !signupPassword.value?.trim()) return [];
  return getValidationSuccess(signupConfirmPasswordState.value, signupConfirmPasswordConfig.value);
});

const signupPasswordInputType = computed(() =>
  interactionsEngine.getInputType(signupPasswordConfig.value, "password")
);
const signupConfirmPasswordInputType = computed(() =>
  interactionsEngine.getInputType(signupConfirmPasswordConfig.value, "password")
);
const signupPasswordIcon = computed(() =>
  signupPasswordInputType.value === "text" ? EyeIcon : EyeSlashIcon
);
const signupConfirmPasswordIcon = computed(() =>
  signupConfirmPasswordInputType.value === "text" ? EyeIcon : EyeSlashIcon
);
const toggleSignupPasswordVisibility = () => {
  interactionsEngine.runInteractions(
    [{ type: "toggleFieldMeta", metaKey: "signupPasswordVisible" }],
    signupPasswordConfig.value
  );
};
const toggleSignupConfirmPasswordVisibility = () => {
  interactionsEngine.runInteractions(
    [{ type: "toggleFieldMeta", metaKey: "signupConfirmPasswordVisible" }],
    signupConfirmPasswordConfig.value
  );
};

const handleSignupEmailInput = (value) => {
  signupEmail.value = value;
  const state = interactionsEngine.getFieldState(signupEmailConfig.value);
  if (state) state.value = value;
  if (state?.element) state.element.setCustomValidity?.("");
  if (signupHasAttemptedSubmit.value) {
    interactionsEngine.validateField(signupEmailConfig.value);
    if (state?.isValid && state?.element) state.element.classList.remove("first-invalid");
  }
};

const handleSignupPasswordInput = (value) => {
  signupPassword.value = value;
  const state = interactionsEngine.getFieldState(signupPasswordConfig.value);
  if (state) state.value = value;
  if (state?.element) state.element.setCustomValidity?.("");
  interactionsEngine.validateField(signupPasswordConfig.value);
  if (state?.isValid && state?.element) state.element.classList.remove("first-invalid");
};

const handleSignupConfirmPasswordInput = (value) => {
  signupConfirmPassword.value = value;
  const state = interactionsEngine.getFieldState(signupConfirmPasswordConfig.value);
  if (state) state.value = value;
  if (state?.element) state.element.setCustomValidity?.("");
  interactionsEngine.validateField(signupConfirmPasswordConfig.value);
  if (state?.isValid && state?.element) state.element.classList.remove("first-invalid");
};

const handleSignupSubmit = () => {
  signupHasAttemptedSubmit.value = true;
  interactionsEngine.validateScope(SIGNUP_SCOPE);
};

// ─────────────────────────────────────────────
// Register fields on mount
// ─────────────────────────────────────────────
onMounted(() => {
  interactionsEngine.register(loginEmailConfig.value, loginEmail.value, document.getElementById("login-email"));
  interactionsEngine.register(loginPasswordConfig.value, loginPassword.value, document.getElementById("login-password"));

  interactionsEngine.register(signupEmailConfig.value, signupEmail.value, document.getElementById("signup-email"));
  interactionsEngine.register(signupPasswordConfig.value, signupPassword.value, document.getElementById("signup-password"));
  interactionsEngine.register(signupConfirmPasswordConfig.value, signupConfirmPassword.value, document.getElementById("signup-confirmPassword"));
});

// ─────────────────────────────────────────────
// Code showcase strings
// ─────────────────────────────────────────────
const templateCode = `<form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
  <InputAuthComponent
    :model-value="email"
    @update:model-value="handleEmailInput"
    placeholder="Enter your email"
    id="email"
    show-label label-text="Email Address"
    data-required="true" required-display="italic-text"
    type="text"
    :show-errors="emailErrors.length > 0" :errors="emailErrors"
  />

  <InputAuthComponent
    :model-value="password"
    @update:model-value="handlePasswordInput"
    placeholder="••••••••"
    id="password"
    show-label label-text="Password"
    data-required="true" required-display="italic-text"
    :type="passwordInputType" :right-icon="passwordIcon"
    :show-errors="passwordErrors.length > 0" :errors="passwordErrors"
    :on-success="passwordSuccess.length > 0" :success="passwordSuccess"
    @click:right-icon="togglePasswordVisibility"
  />

  <!-- (SignUp only) Confirm Password -->
  <InputAuthComponent
    :model-value="confirmPassword"
    @update:model-value="handleConfirmPasswordInput"
    placeholder="••••••••"
    id="confirmPassword"
    show-label label-text="Confirm Password"
    data-required="true" required-display="italic-text"
    :type="confirmPasswordInputType" :right-icon="confirmPasswordIcon"
    :show-errors="confirmPasswordErrors.length > 0" :errors="confirmPasswordErrors"
    :on-success="confirmPasswordSuccess.length > 0" :success="confirmPasswordSuccess"
    @click:right-icon="toggleConfirmPasswordVisibility"
  />

  <ButtonComponent text="Submit" variant="authPink" size="lg" type="submit" />
</form>`;

const scriptCode = `import { ref, computed, onMounted } from 'vue';
import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';
import { InformationCircleIcon, CheckCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline';

const SCOPE_ID = "authScope";

const email = ref(""); const password = ref(""); const confirmPassword = ref("");
const hasAttemptedSubmit = ref(false);

// --- 1. Configs ---
const passwordConfig = computed(() => ({
  scope: SCOPE_ID, id: "password",
  validation: {
    required: true, requiredMessage: "Password is required.",
    rules: [
      { type: "minLength", param: 8, message: "Use 8 or more characters" },
      { type: "hasUpper", message: "Use upper case letters" },
      { type: "hasLower", message: "Use lower case letters" },
      { type: "hasNumber", message: "Use numbers" },
    ],
  },
  validateOnInput: true,
  ui: { dynamicType: "password", visibilityMetaKey: "passwordVisible" },
}));

const confirmPasswordConfig = computed(() => ({
  scope: SCOPE_ID, id: "confirmPassword",
  validation: {
    required: true, requiredMessage: "Please confirm your password.",
    rules: [{ type: "matchValue", param: "password", message: "Passwords do not match." }],
  },
  validateOnInput: true,
  ui: { dynamicType: "password", visibilityMetaKey: "confirmPasswordVisible" },
}));

// --- 2. Field States ---
const passwordState = computed(() => interactionsEngine.getFieldState(passwordConfig.value));

// --- 3. Register on Mount ---
onMounted(() => {
  interactionsEngine.register(passwordConfig.value, password.value, document.getElementById("password"));
  interactionsEngine.register(confirmPasswordConfig.value, confirmPassword.value, document.getElementById("confirmPassword"));
});

// --- 4. Input Handlers ---
const handlePasswordInput = (value) => {
  password.value = value;
  const state = interactionsEngine.getFieldState(passwordConfig.value);
  if (state) state.value = value;
  if (state?.element) state.element.setCustomValidity?.("");
  interactionsEngine.validateField(passwordConfig.value); // validateOnInput: true
};

// --- 5. Errors / Success ---
const passwordErrors = computed(() => {
  if (!passwordState.value || passwordState.value.isValid) return [];
  return passwordState.value.failedRules
    .filter((r) => r.type !== "required" || hasAttemptedSubmit.value)
    .map((r) => ({ error: r.message, icon: InformationCircleIcon }));
});

// --- 6. Eye Toggle ---
const passwordInputType = computed(() => interactionsEngine.getInputType(passwordConfig.value, "password"));
const passwordIcon = computed(() => passwordInputType.value === "text" ? EyeIcon : EyeSlashIcon);
const togglePasswordVisibility = () => {
  interactionsEngine.runInteractions([{ type: "toggleFieldMeta", metaKey: "passwordVisible" }], passwordConfig.value);
};

// --- 7. Form Submit ---
const handleSubmit = () => {
  hasAttemptedSubmit.value = true;
  interactionsEngine.validateScope(SCOPE_ID);
};`;
</script>

<style scoped>
</style>
