<template>
  <div class="min-h-screen bg-gradient-to-br from-[#710A0A] to-[#200000] py-10 px-4 font-sans">
    <div class="max-w-6xl mx-auto flex flex-col gap-16">
      <section class="flex flex-col gap-6">
        <DemoSectionHeader title="InputAuthComponent (Real Validation)" class="text-white" />
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10">
          
          <!-- 1. Username Field -->
          <DemoCard label="Username Validation" dark :code="codeExamples.username">
            <InputAuthComponent 
              :model-value="username" 
              @update:model-value="handleUsernameInput"
              placeholder="Enter username   " 
              id="demo-username" 
              show-label 
              labelText="Username"
              data-required="true"
              required-display="italic-text"
              type="text"
              :show-errors="usernameErrors.length > 0" 
              :errors="usernameErrors" 
              :on-success="usernameSuccess.length > 0" 
              :success="usernameSuccess"
            />
          </DemoCard>
          
          <!-- 2. Email Field -->
          <DemoCard label="Email Validation" dark :code="codeExamples.email">
            <InputAuthComponent 
              :model-value="email" 
              @update:model-value="handleEmailInput"
              placeholder="Enter email..." 
              id="demo-email" 
              show-label 
              labelText="Email Address"
              data-required="true"
              required-display="italic-text"
              type="text"
              :show-errors="emailErrors.length > 0" 
              :errors="emailErrors" 
            />
          </DemoCard>
          
          <!-- 2. Password Field -->
          <DemoCard label="Password Validation" dark :code="codeExamples.password">
            <InputAuthComponent 
              :model-value="password" 
              @update:model-value="handlePasswordInput"
              :type="passwordInputType" 
              placeholder="••••••••" 
              id="demo-password" 
              show-label 
              labelText="Password" 
              data-required="true"
              required-display="italic-text"
              :right-icon="passwordIcon" 
              @click:right-icon="togglePasswordVisibility"
              :show-errors="passwordErrors.length > 0" 
              :errors="passwordErrors" 
              :on-success="passwordSuccess.length > 0" 
              :success="passwordSuccess"
            />
          </DemoCard>
          
          <!-- 3. Confirm Password -->
          <DemoCard label="Confirm Password" dark :code="codeExamples.confirmPassword">
            <InputAuthComponent 
              :model-value="confirmPassword" 
              @update:model-value="handleConfirmPasswordInput"
              :type="confirmPasswordInputType" 
              placeholder="••••••••" 
              id="demo-confirmPassword" 
              show-label 
              labelText="Confirm Password" 
              data-required="true"
              required-display="italic-text"
              :right-icon="confirmPasswordIcon" 
              @click:right-icon="toggleConfirmPasswordVisibility"
              :show-errors="confirmPasswordErrors.length > 0" 
              :errors="confirmPasswordErrors" 
              :on-success="confirmPasswordSuccess.length > 0" 
              :success="confirmPasswordSuccess"
            />
          </DemoCard>

          <!-- Submit Button to Trigger Required Errors -->
          <DemoCard label="Trigger Form Submit" dark code="<ButtonComponent @click='handleSubmit' text='Submit Form' variant='authPink' size='lg' />">
            <div class="flex flex-col gap-4 h-full justify-center">
               <p class="text-xs text-gray-400">Clicking submit triggers full scope validation ("hasAttemptedSubmit = true").</p>
               <ButtonComponent text="Submit Form" variant="authPink" size="lg" @click="handleSubmit" />
            </div>
          </DemoCard>

          <!-- Keep simple examples -->
          <!-- 4. Default -->
          <DemoCard label="Default" dark :code="codeExamples.default">
            <InputAuthComponent v-model="vals.ia1" placeholder="Enter text..." />
          </DemoCard>

          <!-- 5. Both Icons -->
          <DemoCard label="Left & Right Icons" dark :code="codeExamples.bothIcons">
            <InputAuthComponent v-model="vals.ia4" placeholder="Username" showLabel labelText="Username"
              :leftIcon="UserIcon" :rightIcon="CheckCircleIcon" />
          </DemoCard>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import InputAuthComponent from '@/components/input/InputAuthComponent.vue';
import DemoSectionHeader from '@/templates/dev/DemoSectionHeader.vue';
import DemoCard from '@/templates/dev/DemoCard.vue';
import ButtonComponent from '@/components/button/ButtonComponent.vue';
import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';
import { 
  InformationCircleIcon, 
  CheckCircleIcon, 
  EyeIcon, 
  EyeSlashIcon,
  UserIcon
} from '@heroicons/vue/24/outline';

const SCOPE_ID = "demoAuthScope";

const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const hasAttemptedSubmit = ref(false);

const vals = reactive({ ia1: '', ia4: '' });

// 1. Configs
const usernameConfig = computed(() => ({
  scope: SCOPE_ID,
  id: "demo-username",
  validation: {
    required: true,
    requiredMessage: "Username is required."
  },
  validateOnInput: true,
}));

const emailConfig = computed(() => ({
  scope: SCOPE_ID,
  id: "demo-email",
  validation: {
    required: true,
    requiredMessage: "Email is required.",
    rules: [{ type: "isEmail", message: "wrong email" }],
  },
  validateOnInput: false,
}));

const passwordConfig = computed(() => ({
  scope: SCOPE_ID,
  id: "demo-password",
  validation: {
    required: true,
    requiredMessage: "Password is required.",
    rules: [
      { type: "minLength", param: 8, message: "At least 8 characters long" },
      { type: "hasUpper", message: "Contain at least 1 uppercase letter" },
      { type: "hasLower", message: "Contain at least 1 lowercase letter" },
      { type: "hasNumber", message: "Contain at least 1 number" },
    ],
  },
  validateOnInput: true,
  ui: { dynamicType: "password", visibilityMetaKey: "passwordVisible" },
}));

const confirmPasswordConfig = computed(() => ({
  scope: SCOPE_ID,
  id: "demo-confirmPassword",
  validation: {
    required: true,
    requiredMessage: "Please confirm your password.",
    rules: [
      { type: "matchValue", param: "demo-password", message: "passwords do not match" },
    ],
  },
  validateOnInput: true,
  ui: { dynamicType: "password", visibilityMetaKey: "confirmPasswordVisible" },
}));

// 2. State
const usernameState = computed(() => interactionsEngine.getFieldState(usernameConfig.value));
const emailState = computed(() => interactionsEngine.getFieldState(emailConfig.value));
const passwordState = computed(() => interactionsEngine.getFieldState(passwordConfig.value));
const confirmPasswordState = computed(() => interactionsEngine.getFieldState(confirmPasswordConfig.value));

// 3. Mount Registration
onMounted(() => {
  const usernameEl = document.getElementById("demo-username");
  const emailEl = document.getElementById("demo-email");
  const passwordEl = document.getElementById("demo-password");
  const confirmPasswordEl = document.getElementById("demo-confirmPassword");

  interactionsEngine.register(usernameConfig.value, username.value, usernameEl);

  interactionsEngine.register(emailConfig.value, email.value, emailEl);
  interactionsEngine.register(passwordConfig.value, password.value, passwordEl);
  interactionsEngine.register(confirmPasswordConfig.value, confirmPassword.value, confirmPasswordEl);
});

// 4. Input Handlers
const handleUsernameInput = (value) => {
  username.value = value;
  const state = interactionsEngine.getFieldState(usernameConfig.value);
  if (state) state.value = value;
  if (state?.element && state.element.setCustomValidity) state.element.setCustomValidity("");
  interactionsEngine.validateField(usernameConfig.value);
  if (state?.isValid && state?.element) state.element.classList.remove("first-invalid");
};

const handleEmailInput = (value) => {
  email.value = value;
  const state = interactionsEngine.getFieldState(emailConfig.value);
  if (state) state.value = value;
  if (state?.element && state.element.setCustomValidity) state.element.setCustomValidity("");
  if (hasAttemptedSubmit.value) {
    interactionsEngine.validateField(emailConfig.value);
    if (state?.isValid && state?.element) state.element.classList.remove("first-invalid");
  }
};

const handlePasswordInput = (value) => {
  password.value = value;
  const state = interactionsEngine.getFieldState(passwordConfig.value);
  if (state) state.value = value;
  if (state?.element && state.element.setCustomValidity) state.element.setCustomValidity("");
  interactionsEngine.validateField(passwordConfig.value);
  if (state?.isValid && state?.element) state.element.classList.remove("first-invalid");
};

const handleConfirmPasswordInput = (value) => {
  confirmPassword.value = value;
  const state = interactionsEngine.getFieldState(confirmPasswordConfig.value);
  if (state) state.value = value;
  if (state?.element && state.element.setCustomValidity) state.element.setCustomValidity("");
  interactionsEngine.validateField(confirmPasswordConfig.value);
  if (state?.isValid && state?.element) state.element.classList.remove("first-invalid");
};

// 5. Submit Handler
const handleSubmit = () => {
  hasAttemptedSubmit.value = true;
  interactionsEngine.validateScope(SCOPE_ID);
};

// 6. Errors Processing
const usernameErrors = computed(() => {
  if (username.value.trim() === '') {
    return [{ error: 'Username is required', icon: InformationCircleIcon }];
  }
  if (username.value.toLowerCase() === 'admin') {
    return [{ error: 'Username is taken', icon: InformationCircleIcon }];
  }
  return [];
});

const usernameSuccess = computed(() => {
  if (username.value.trim().length >= 4 && username.value.toLowerCase() !== 'admin') {
    return [{ message: 'Username is available!', icon: CheckCircleIcon }];
  }
  return [];
});

const emailErrors = computed(() => {
  if (!emailState.value || emailState.value.isValid) return [];
  return emailState.value.failedRules
    .filter((rule) => rule.type !== "required" || hasAttemptedSubmit.value)
    .map((rule) => ({ error: rule.message, icon: InformationCircleIcon }));
});

const getValidationSuccess = (fieldState, fieldConfig) => {
  if (!fieldState || !fieldConfig) return [];
  const rules = (fieldState.validationConfig || fieldConfig.validation || {}).rules || [];
  const failedTypes = new Set((fieldState.failedRules || []).map((r) => r.type));
  const success = [];
  rules.forEach((rule) => {
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
};

const passwordErrors = computed(() => {
  if (!passwordState.value) return [];
  return passwordState.value.failedRules
    .filter((rule) => rule.type !== "required" || hasAttemptedSubmit.value)
    .map((rule) => ({ error: rule.message, icon: InformationCircleIcon }));
});

const passwordSuccess = computed(() => {
  if (!passwordState.value) return [];
  return getValidationSuccess(passwordState.value, passwordConfig.value);
});

const confirmPasswordErrors = computed(() => {
  if (!confirmPasswordState.value) return [];
  return confirmPasswordState.value.failedRules
    .filter((rule) => rule.type !== "required" || hasAttemptedSubmit.value)
    .map((rule) => ({ error: rule.message, icon: InformationCircleIcon }));
});

const confirmPasswordSuccess = computed(() => {
  if (!confirmPasswordState.value) return [];
  return getValidationSuccess(confirmPasswordState.value, confirmPasswordConfig.value);
});

// 7. Dynamic Icons & Visibility
const passwordInputType = computed(() => interactionsEngine.getInputType(passwordConfig.value, "password"));
const confirmPasswordInputType = computed(() => interactionsEngine.getInputType(confirmPasswordConfig.value, "password"));

const passwordIcon = computed(() => {
  return passwordInputType.value === "text" ? EyeSlashIcon : EyeIcon;
});

const confirmPasswordIcon = computed(() => {
  return confirmPasswordInputType.value === "text" ? EyeSlashIcon : EyeIcon;
});

const togglePasswordVisibility = () => {
  interactionsEngine.runInteractions([{ type: "toggleFieldMeta", metaKey: "passwordVisible" }], passwordConfig.value);
};

const toggleConfirmPasswordVisibility = () => {
  interactionsEngine.runInteractions([{ type: "toggleFieldMeta", metaKey: "confirmPasswordVisible" }], confirmPasswordConfig.value);
};

const codeExamples = {
    email: `<InputAuthComponent 
  :model-value="email" 
  @update:model-value="handleEmailInput"
  placeholder="Enter email..." 
  id="demo-email" 
  show-label 
  labelText="Email Address"
  data-required="true"
  required-display="italic-text"
  type="text"
  :show-errors="emailErrors.length > 0" 
  :errors="emailErrors" 
/>`,
    password: `<InputAuthComponent 
  :model-value="password" 
  @update:model-value="handlePasswordInput"
  :type="passwordInputType" 
  placeholder="••••••••" 
  id="demo-password" 
  show-label 
  labelText="Password" 
  data-required="true"
  required-display="italic-text"
  :right-icon="passwordIcon" 
  @click:right-icon="togglePasswordVisibility"
  :show-errors="passwordErrors.length > 0" 
  :errors="passwordErrors" 
  :on-success="passwordSuccess.length > 0" 
  :success="passwordSuccess"
/>`,
    confirmPassword: `<InputAuthComponent 
  :model-value="confirmPassword" 
  @update:model-value="handleConfirmPasswordInput"
  :type="confirmPasswordInputType" 
  placeholder="••••••••" 
  id="demo-confirmPassword" 
  show-label 
  labelText="Confirm Password" 
  data-required="true"
  required-display="italic-text"
  :right-icon="confirmPasswordIcon" 
  @click:right-icon="toggleConfirmPasswordVisibility"
  :show-errors="confirmPasswordErrors.length > 0" 
  :errors="confirmPasswordErrors" 
  :on-success="confirmPasswordSuccess.length > 0" 
  :success="confirmPasswordSuccess"
/>`,
    default: `<InputAuthComponent v-model="val" placeholder="Enter text..." />`,
    bothIcons: `<InputAuthComponent 
  v-model="val" 
  placeholder="Username" 
  showLabel 
  labelText="Username" 
  :leftIcon="UserIcon" 
  :rightIcon="CheckCircleIcon"
/>`
};
</script>
