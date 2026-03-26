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
              <div class="flex flex-col gap-1">
                <InputAuthComponent :model-value="loginEmail" @update:model-value="handleLoginEmailInput"
                  placeholder="linden@codelinden.com" id="login-email" show-label label-text="Email Address"
                  data-required="true" required-display="italic-text" type="text"
                  :show-errors="loginEmailErrors.length > 0" :errors="loginEmailErrors" />
                <ShowCodeToggle :code="codeSnippets.loginEmail" />
              </div>

              <!-- Password -->
              <div class="flex flex-col gap-1">
                <InputAuthComponent :model-value="loginPassword" @update:model-value="handleLoginPasswordInput"
                  placeholder="********" id="login-password" show-label label-text="Password" data-required="true"
                  required-display="italic-text" :type="loginPasswordInputType" :right-icon="loginPasswordIcon"
                  :show-errors="loginPasswordErrors.length > 0" :errors="loginPasswordErrors"
                  @click:right-icon="toggleLoginPasswordVisibility" />
                <ShowCodeToggle :code="codeSnippets.loginPassword" />
              </div>

              <!-- Remember Me checkbox -->
              <div class="flex flex-col gap-1">
                <Checkbox v-model="loginRememberMe" label="Remember me"
                  checkboxClass="m-0 border border-checkboxBorder [appearance:none] w-[0.75rem] h-[0.75rem] rounded-[2px] bg-transparent relative cursor-pointer checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.2rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45"
                  labelClass="text-[0.875rem] leading-6 text-text cursor-pointer"
                  wrapperClass="flex items-center gap-2" />
                <ShowCodeToggle :code="codeSnippets.loginCheckbox" />
              </div>

              <div>
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
              <div class="flex flex-col gap-1">
                <InputAuthComponent :model-value="signupEmail" @update:model-value="handleSignupEmailInput"
                  placeholder="linden@codelinden.com" id="signup-email" show-label label-text="Email Address"
                  data-required="true" required-display="italic-text" type="text"
                  :show-errors="signupEmailErrors.length > 0" :errors="signupEmailErrors" />
                <ShowCodeToggle :code="codeSnippets.signupEmail" />
              </div>

              <!-- Password -->
              <div class="flex flex-col gap-1">
                <InputAuthComponent :model-value="signupPassword" @update:model-value="handleSignupPasswordInput"
                  placeholder="********" id="signup-password" show-label label-text="Password" data-required="true"
                  required-display="italic-text" :type="signupPasswordInputType" :right-icon="signupPasswordIcon"
                  :show-errors="signupPasswordErrors.length > 0" :errors="signupPasswordErrors"
                  :on-success="signupPasswordSuccess.length > 0" :success="signupPasswordSuccess"
                  @click:right-icon="toggleSignupPasswordVisibility" />
                <ShowCodeToggle :code="codeSnippets.signupPassword" />
              </div>

              <!-- Confirm Password -->
              <div class="flex flex-col gap-1">
                <InputAuthComponent :model-value="signupConfirmPassword"
                  @update:model-value="handleSignupConfirmPasswordInput" placeholder="********"
                  id="signup-confirmPassword" show-label label-text="Confirm Password" data-required="true"
                  required-display="italic-text" :type="signupConfirmPasswordInputType"
                  :right-icon="signupConfirmPasswordIcon" :show-errors="signupConfirmPasswordErrors.length > 0"
                  :errors="signupConfirmPasswordErrors" :on-success="signupConfirmPasswordSuccess.length > 0"
                  :success="signupConfirmPasswordSuccess" @click:right-icon="toggleSignupConfirmPasswordVisibility" />
                <ShowCodeToggle :code="codeSnippets.signupConfirmPassword" />
              </div>

              <div>
                <ButtonComponent text="Create Account" variant="authPink" size="lg" type="submit" />
              </div>
            </form>
          </div>
        </div>

      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineComponent, h } from 'vue';
import InputAuthComponent from '@/components/input/InputAuthComponent.vue';
import DemoSectionHeader from '@/templates/dev/DemoSectionHeader.vue';
import ButtonComponent from '@/components/button/ButtonComponent.vue';
import Checkbox from '@/components/checkbox/CheckboxGroup.vue';
import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';
import {
  InformationCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/vue/24/outline';

// ─────────────────────────────────────────────
// Inline ShowCode toggle component (no external file needed)
// ─────────────────────────────────────────────
const ShowCodeToggle = defineComponent({
  props: { code: { type: String, default: '' } },
  setup(props) {
    const open = ref(false);
    const copied = ref(false);
    const copy = async () => {
      await navigator.clipboard.writeText(props.code).catch(() => {});
      copied.value = true;
      setTimeout(() => (copied.value = false), 2000);
    };
    return () => h('div', { class: 'flex flex-col gap-0' }, [
      h('button', {
        type: 'button',
        onClick: () => (open.value = !open.value),
        class: 'self-start flex items-center gap-1.5 text-[0.7rem] font-medium text-white/50 hover:text-white/80 transition-colors mt-1 px-0 py-0',
      }, [
        h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', 'stroke-width': '1.8', stroke: 'currentColor', class: 'w-3 h-3' },
          [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5' })]),
        open.value ? 'Hide Code' : 'Show Code',
      ]),
      open.value && h('div', { class: 'mt-2 rounded-lg overflow-hidden bg-[#1a1a1a]' }, [
        h('div', { class: 'flex justify-between items-center px-3 py-1.5 bg-[#252525]' }, [
          h('span', { class: 'text-[0.6rem] font-mono text-white/30 uppercase tracking-wider' }, 'Vue'),
          h('button', { type: 'button', onClick: copy, class: 'text-[0.65rem] text-white/40 hover:text-white/70 transition-colors' }, copied.value ? '✓ Copied' : 'Copy'),
        ]),
        h('pre', { class: 'p-3 overflow-x-auto text-[0.72rem] leading-relaxed text-[#d4d4d4] font-mono' },
          h('code', {}, props.code)),
      ]),
    ]);
  },
});

// ─────────────────────────────────────────────
// LOGIN scope
// ─────────────────────────────────────────────
const LOGIN_SCOPE = "demo-loginScope";

const loginEmail = ref("");
const loginPassword = ref("");
const loginRememberMe = ref(false);
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
  loginPassword.value ? (loginPasswordInputType.value === "text" ? EyeIcon : EyeSlashIcon) : null
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
  signupPassword.value ? (signupPasswordInputType.value === "text" ? EyeIcon : EyeSlashIcon) : null
);
const signupConfirmPasswordIcon = computed(() =>
  signupConfirmPassword.value ? (signupConfirmPasswordInputType.value === "text" ? EyeIcon : EyeSlashIcon) : null
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
// Per-input code snippets
// ─────────────────────────────────────────────
const codeSnippets = {
  loginEmail: [
    '<!-- Template -->',
    '<InputAuthComponent',
    '  :model-value="email"',
    '  @update:model-value="handleEmailInput"',
    '  placeholder="linden@codelinden.com"',
    '  id="email" show-label label-text="Email"',
    '  data-required="true" required-display="italic-text"',
    '  type="text"',
    '  :show-errors="emailErrors.length > 0"',
    '  :errors="emailErrors"',
    '/>',
    '',
    '<!-- Interactions (script) -->',
    'const emailConfig = computed(() => ({',
    '  scope: SCOPE_ID, id: "email",',
    '  validation: {',
    '    required: true, requiredMessage: "Email is required.",',
    '    rules: [{ type: "isEmail", message: "Please enter a valid email." }],',
    '  },',
    '  validateOnInput: false,',
    '}));',
    'const emailState = computed(() => interactionsEngine.getFieldState(emailConfig.value));',
    'const emailErrors = computed(() => {',
    '  if (!emailState.value || emailState.value.isValid) return [];',
    '  return emailState.value.failedRules',
    '    .filter((r) => r.type !== "required" || hasAttemptedSubmit.value)',
    '    .map((r) => ({ error: r.message, icon: InformationCircleIcon }));',
    '});',
    'const handleEmailInput = (value) => {',
    '  email.value = value;',
    '  const state = interactionsEngine.getFieldState(emailConfig.value);',
    '  if (state) state.value = value;',
    '  if (hasAttemptedSubmit.value) interactionsEngine.validateField(emailConfig.value);',
    '};',
    'onMounted(() => {',
    '  interactionsEngine.register(emailConfig.value, email.value, document.getElementById("email"));',
    '});',
  ].join('\n'),

  loginPassword: [
    '<!-- Template -->',
    '<InputAuthComponent',
    '  :model-value="password"',
    '  @update:model-value="handlePasswordInput"',
    '  placeholder="********"',
    '  id="password" show-label label-text="Password"',
    '  data-required="true" required-display="italic-text"',
    '  :type="passwordInputType"',
    '  :right-icon="passwordIcon"',
    '  :show-errors="passwordErrors.length > 0"',
    '  :errors="passwordErrors"',
    '  @click:right-icon="togglePasswordVisibility"',
    '/>',
    '',
    '<!-- Interactions (script) -->',
    'const passwordConfig = computed(() => ({',
    '  scope: SCOPE_ID, id: "password",',
    '  validation: { required: true, requiredMessage: "Password is required." },',
    '  validateOnInput: false,',
    '  ui: { dynamicType: "password", visibilityMetaKey: "passwordVisible" },',
    '}));',
    'const passwordInputType = computed(() =>',
    '  interactionsEngine.getInputType(passwordConfig.value, "password")',
    ');',
    '// Icon only shows when field has content',
    'const passwordIcon = computed(() =>',
    '  password.value ? (passwordInputType.value === "text" ? EyeIcon : EyeSlashIcon) : null',
    ');',
    'const togglePasswordVisibility = () => {',
    '  interactionsEngine.runInteractions(',
    '    [{ type: "toggleFieldMeta", metaKey: "passwordVisible" }],',
    '    passwordConfig.value',
    '  );',
    '};',
  ].join('\n'),

  loginCheckbox: [
    '<!-- Template -->',
    '<Checkbox',
    '  v-model="rememberMe"',
    '  label="Remember me"',
    '  checkboxClass="m-0 border border-checkboxBorder [appearance:none]',
    '    w-[0.75rem] h-[0.75rem] rounded-[2px] bg-transparent relative cursor-pointer',
    '    checked:bg-checkbox checked:border-checkbox',
    '    checked:[&::after]:content-[\'\'] checked:[&::after]:absolute',
    '    checked:[&::after]:left-[0.2rem] checked:[&::after]:w-[0.25rem]',
    '    checked:[&::after]:h-[0.5rem] checked:[&::after]:border',
    '    checked:[&::after]:border-solid checked:[&::after]:border-white',
    '    checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px]',
    '    checked:[&::after]:border-t-0 checked:[&::after]:border-l-0',
    '    checked:[&::after]:rotate-45"',
    '  labelClass="text-[0.875rem] leading-6 text-text cursor-pointer"',
    '  wrapperClass="flex items-center gap-2"',
    '/>',
    '',
    '<!-- Interactions (script) -->',
    '// Simple boolean — no engine registration needed.',
    'const rememberMe = ref(false);',
  ].join('\n'),

  signupEmail: [
    '<!-- Template (same as Login email, different id/scope) -->',
    '<InputAuthComponent',
    '  :model-value="email"',
    '  @update:model-value="handleEmailInput"',
    '  placeholder="linden@codelinden.com"',
    '  id="email" show-label label-text="Email Address"',
    '  data-required="true" required-display="italic-text"',
    '  type="text"',
    '  :show-errors="emailErrors.length > 0"',
    '  :errors="emailErrors"',
    '/>',
    '',
    '<!-- Interactions: same pattern as Login email above -->',
  ].join('\n'),

  signupPassword: [
    '<!-- Template -->',
    '<InputAuthComponent',
    '  :model-value="password"',
    '  @update:model-value="handlePasswordInput"',
    '  placeholder="********"',
    '  id="password" show-label label-text="Password"',
    '  data-required="true" required-display="italic-text"',
    '  :type="passwordInputType" :right-icon="passwordIcon"',
    '  :show-errors="passwordErrors.length > 0" :errors="passwordErrors"',
    '  :on-success="passwordSuccess.length > 0" :success="passwordSuccess"',
    '  @click:right-icon="togglePasswordVisibility"',
    '/>',
    '',
    '<!-- Interactions (script) -->',
    'const passwordConfig = computed(() => ({',
    '  scope: SCOPE_ID, id: "password",',
    '  validation: {',
    '    required: true, requiredMessage: "Password is required.",',
    '    rules: [',
    '      { type: "minLength", param: 8, message: "Use 8 or more characters" },',
    '      { type: "hasUpper", message: "Use upper case letters" },',
    '      { type: "hasLower", message: "Use lower case letters" },',
    '      { type: "hasNumber", message: "Use numbers" },',
    '    ],',
    '  },',
    '  validateOnInput: true, // validates on every keystroke',
    '  ui: { dynamicType: "password", visibilityMetaKey: "passwordVisible" },',
    '}));',
    '',
    '// Errors: show rule failures live; required only after submit',
    'const passwordErrors = computed(() => {',
    '  if (!passwordState.value || passwordState.value.isValid) return [];',
    '  return passwordState.value.failedRules',
    '    .filter((r) => r.type !== "required" || hasAttemptedSubmit.value)',
    '    .map((r) => ({ error: r.message, icon: InformationCircleIcon }));',
    '});',
    '',
    '// Success: show green ticks for passing rules',
    'const passwordSuccess = computed(() => {',
    '  if (!password.value?.trim()) return [];',
    '  const rules = (passwordConfig.value.validation || {}).rules || [];',
    '  const failed = new Set((passwordState.value?.failedRules || []).map((r) => r.type));',
    '  return rules.filter((r) => !failed.has(r.type)).map((r) => ({ message: r.message }));',
    '});',
  ].join('\n'),

  signupConfirmPassword: [
    '<!-- Template -->',
    '<InputAuthComponent',
    '  :model-value="confirmPassword"',
    '  @update:model-value="handleConfirmPasswordInput"',
    '  placeholder="********"',
    '  id="confirmPassword" show-label label-text="Confirm Password"',
    '  data-required="true" required-display="italic-text"',
    '  :type="confirmPasswordInputType" :right-icon="confirmPasswordIcon"',
    '  :show-errors="confirmPasswordErrors.length > 0" :errors="confirmPasswordErrors"',
    '  :on-success="confirmPasswordSuccess.length > 0" :success="confirmPasswordSuccess"',
    '  @click:right-icon="toggleConfirmPasswordVisibility"',
    '/>',
    '',
    '<!-- Interactions (script) -->',
    'const confirmPasswordConfig = computed(() => ({',
    '  scope: SCOPE_ID, id: "confirmPassword",',
    '  validation: {',
    '    required: true, requiredMessage: "Please confirm your password.",',
    '    rules: [{ type: "matchValue", param: "password", message: "Passwords do not match." }],',
    '  },',
    '  validateOnInput: true,',
    '  ui: { dynamicType: "password", visibilityMetaKey: "confirmPasswordVisible" },',
    '}));',
    '',
    '// "matchValue" compares against the sibling field with id="password"',
    '// registered in the same scope — no custom logic needed.',
  ].join('\n'),
};
</script>

<style scoped></style>
