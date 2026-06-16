<template>
  <div class="min-h-screen bg-cover bg-no-repeat bg-lightgray xl:bg-center lg:bg-center md:bg-left sm:bg-[position:-100px] max-[479px]:bg-[position:-290px] relative overflow-x-hidden"
  :style="{ backgroundImage: bgUrl ? `url(${bgUrl})` : undefined }">
    
    <!-- Full-screen blur overlay -->
    <div class="fixed inset-0 bg-black/30 backdrop-blur-[50px] z-0"></div>

    <div class="relative z-10 p-10 flex flex-col gap-16 font-sans">
      <section class="flex flex-col gap-6">
        <DemoSectionHeader title="AuthTextInput — Live Demo" class="text-white" />

        <!-- Two columns: Login | SignUp -->
        <div class="flex flex-col lg:flex-row gap-8 items-start">

          <!-- ===== LOGIN SECTION ===== -->
          <div class="flex-1 flex flex-col gap-6">
            <h3 class="text-xl text-white font-semibold border-b border-white/10 pb-3">Login</h3>

            <form id="login-form" interaction-container @submit.prevent class="flex flex-col gap-4 w-full">

              <!-- Email -->
              <div class="flex flex-col gap-1">
                <AuthTextInput v-model="loginEmail" placeholder="linden@codelinden.com" id="login-email"
                  show-label label-text="Email" data-required="true" required-display="italic-text" type="text"
                  :interactions-config="loginEmailInteractions" />
                
                <!-- Errors -->
                <div id="login-email-required-err" class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>
                  <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
                  <p class="text-[#ff7c1e] text-sm font-medium">Email is required.</p>
                </div>
                <div id="login-email-format-err" class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>
                  <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
                  <p class="text-[#ff7c1e] text-sm font-medium">Please enter a valid email address.</p>
                </div>

                <ShowCodeToggle :code="codeSnippets.loginEmail" />
              </div>

              <!-- Password -->
              <div class="flex flex-col gap-1">
                <AuthTextInput v-model="loginPassword" placeholder="********" id="login-password"
                  show-label label-text="Password" data-required="true" required-display="italic-text" type="password"
                  :interactions-config="loginPasswordInteractions" />

                <!-- Errors -->
                <div id="login-password-required-err" class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>
                  <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
                  <p class="text-[#ff7c1e] text-sm font-medium">Password is required.</p>
                </div>

                <ShowCodeToggle :code="codeSnippets.loginPassword" />
              </div>

              <div class="flex flex-col gap-1">
                <Checkbox v-model="loginRememberMe" label="Remember me"
                  :checkboxClass="checkboxClass"
                  labelClass="text-[0.875rem] leading-6 text-text cursor-pointer"
                  wrapperClass="flex items-center gap-2" />
                <ShowCodeToggle :code="codeSnippets.loginCheckbox" />
              </div>

              <div>
                <DashboardPrimaryButton text="Log In" variant="authPink" size="lg" v-interactions="loginSubmitInteractions" />
              </div>
            </form>
          </div>

          <!-- Divider -->
          <div class="hidden lg:block w-px bg-white/10 self-stretch" />

          <!-- ===== SIGN UP SECTION ===== -->
          <div class="flex-1 flex flex-col gap-6">
            <h3 class="text-xl text-white font-semibold border-b border-white/10 pb-3">Sign Up</h3>

            <form id="signup-form" interaction-container @submit.prevent class="flex flex-col gap-4 w-full">

              <!-- Email -->
              <div class="flex flex-col gap-1">
                <AuthTextInput v-model="signupEmail" placeholder="linden@codelinden.com" id="signup-email"
                  show-label label-text="Email address" data-required="true" required-display="italic-text" type="text"
                  :interactions-config="signupEmailInteractions" />

                <!-- Errors -->
                <div id="signup-email-required-err" class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>
                  <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
                  <p class="text-[#ff7c1e] text-sm font-medium">Email is required.</p>
                </div>
                <div id="signup-email-format-err" class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>
                  <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
                  <p class="text-[#ff7c1e] text-sm font-medium">Please enter a valid email address.</p>
                </div>

                <ShowCodeToggle :code="codeSnippets.signupEmail" />
              </div>

              <!-- Password -->
              <div class="flex flex-col gap-1">
                <AuthTextInput v-model="signupPassword" placeholder="********" id="signup-password"
                  show-label label-text="Password" data-required="true" required-display="italic-text" type="password"
                  :interactions-config="signupPasswordInteractions" />

                <!-- Errors -->
                <div id="signup-password-min8-err" class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>
                  <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
                  <p class="text-[#ff7c1e] text-sm font-medium">Use 8 or more characters</p>
                </div>
                <div id="signup-password-upper-err" class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>
                  <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
                  <p class="text-[#ff7c1e] text-sm font-medium">Use upper case letters</p>
                </div>
                <div id="signup-password-lower-err" class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>
                  <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
                  <p class="text-[#ff7c1e] text-sm font-medium">Use lower case letters</p>
                </div>
                <div id="signup-password-num-err" class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>
                  <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
                  <p class="text-[#ff7c1e] text-sm font-medium">Use numbers</p>
                </div>

                <ShowCodeToggle :code="codeSnippets.signupPassword" />
              </div>

              <!-- Confirm Password -->
              <div class="flex flex-col gap-1">
                <AuthTextInput v-model="signupConfirmPassword" placeholder="••••••••" id="signup-confirmPassword"
                  show-label label-text="Confirm Password" data-required="true" required-display="italic-text"
                  type="password" :interactions-config="signupConfirmPasswordInteractions" />

                <!-- Errors -->
                <div id="signup-confirm-match-err" class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>
                  <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
                  <p class="text-[#ff7c1e] text-sm font-medium">Passwords do not match.</p>
                </div>

                <ShowCodeToggle :code="codeSnippets.signupConfirmPassword" />
              </div>

              <div>
                <DashboardPrimaryButton text="Sign up" variant="authPink" size="lg" v-interactions="signupSubmitInteractions" />
              </div>

              <DashboardPrimaryButton :text="'Continue with X (twitter)'" variant="authTransparent" size="lg" :leftIcon="xIcon"
                leftIconClass="w-8 h-8" />

              <DashboardPrimaryButton :text="'Continue with Telegram'" variant="authTransparent" size="lg" />

            </form>
          </div>
        </div>

      </section>

      <section class="flex flex-col gap-6">
        <DemoSectionHeader title="Verification (OTP)" class="text-white" />

        <div class="flex flex-col lg:flex-row gap-8 items-start">
          <!-- ===== VERIFICATION SECTION ===== -->
          <div class="flex-1 flex flex-col gap-6">
            <h3 class="text-xl text-white font-semibold border-b border-white/10 pb-3">Email Verification</h3>

            <div id="verification-form" interaction-container class="flex flex-col gap-4 w-full">
              <div class="flex flex-col gap-2">
                <AuthCodeInput v-model="verificationCode" id="verification-code" show-label label-text="Verification Code"
                  data-required="true" required-display="italic-text" :disabled="isVerifying"
                  :is-submitting="isVerifying" :interactions-config="verificationCodeInteractions" />

                <!-- Errors -->
                <div id="verification-code-err" class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>
                  <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
                  <p class="text-[#ff7c1e] text-sm font-medium">Code must be 6 digits.</p>
                </div>
              </div>

              <div>
                <DashboardPrimaryButton text="Confirm" variant="authPink" size="lg" @click="handleVerify" />
              </div>

              <ShowCodeToggle :code="codeSnippets.verificationCode" />
            </div>
          </div>

          <!-- Divider -->
          <div class="hidden lg:block w-px bg-white/10 self-stretch" />

          <!-- Placeholder for other auth components -->
          <div class="flex-1 flex flex-col gap-6 opacity-40">
          </div>
        </div>
      </section>

      <!-- ===== ONBOARDING SECTION ===== -->
      <section class="flex flex-col gap-6">
        <DemoSectionHeader title="Onboarding — Role & Username" class="text-white" />

        <div class="flex flex-col lg:flex-row gap-8 items-start">

          <!-- Role Selector -->
          <div class="flex-1 flex flex-col gap-6">
            <h3 class="text-xl text-white font-semibold border-b border-white/10 pb-3">Select Your Role</h3>

            <div id="onboarding-form" interaction-container class="flex flex-col gap-4 w-full">

              <!-- Custom role dropdown -->
              <div class="flex flex-col gap-2" ref="roleDropdownRef">
                <!-- Label row -->
                <div class="flex justify-between items-center w-full">
                  <label class="text-sm leading-6 tracking-[0.009rem] text-white">Role</label>
                  <span class="text-[10px] leading-6 text-right italic text-white">Required</span>
                </div>

                <!-- Trigger -->
                <div @click="demoToggleRoleDropdown"
                  class="relative rounded-xl border border-white/30 bg-white/20 min-h-12 gap-2.5 py-3 px-2.5 flex justify-between items-center self-stretch cursor-pointer hover:bg-white/30 transition-colors shadow-sm"
                  :class="{ 'border-white/60': demoRoleOpen }">
                  <span :class="demoSelectedRole ? 'text-white' : 'text-white/50 poppins-medium text-sm'">{{ demoSelectedRole ? demoRoleLabel : 'Select your role' }}</span>
                  <svg class="w-5 h-5 text-white transition-transform duration-200" :class="{ 'rotate-180': demoRoleOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                <!-- Dropdown menu -->
                <div v-if="demoRoleOpen" class="relative z-50 w-full mt-[-4px] overflow-hidden rounded-lg border border-gray-500/30 bg-[#181a1b]/90 backdrop-blur-xl shadow-xl">
                  <div class="flex flex-col py-1">
                    <div v-for="role in demoRoles" :key="role.value"
                      @click="demoSelectRole(role.value)"
                      class="px-4 py-3 text-white cursor-pointer transition-colors hover:bg-white/10 flex items-center justify-between"
                      :class="{ 'bg-white/5': demoSelectedRole === role.value }">
                      <span class="poppins-medium text-sm">{{ role.label }}</span>
                      <svg v-if="demoSelectedRole === role.value" class="w-4 h-4 text-[#fb5ba2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Hidden input that drives Interactions Engine -->
                <input id="onboarding-role" type="text" :value="demoSelectedRole" class="hidden" readonly
                  v-interactions="onboardingRoleInteractions" />

                <!-- Error -->
                <div id="onboarding-role-err" class="flex items-center gap-1.5 [&[hidden]]:!hidden" hidden>
                  <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
                  <p class="text-[#ff7c1e] text-sm font-medium">Please select a role.</p>
                </div>

                <ShowCodeToggle :code="codeSnippets.onboardingRole" />
              </div>

              <div>
                <DashboardPrimaryButton text="Continue" variant="authPink" size="lg" v-interactions="onboardingSubmitInteractions" />
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="hidden lg:block w-px bg-white/10 self-stretch" />

          <!-- Username Field -->
          <div class="flex-1 flex flex-col gap-6">
            <h3 class="text-xl text-white font-semibold border-b border-white/10 pb-3">Username</h3>

            <div id="onboarding-username-form" interaction-container class="flex flex-col gap-4 w-full">
              <div class="flex flex-col gap-1">
                <AuthTextInput v-model="demoUsername" placeholder="e.g. codelinden" id="onboarding-username"
                  show-label label-text="Username" data-required="true" required-display="italic-text" type="text"
                  :interactions-config="onboardingUsernameInteractions" />

                <!-- Errors -->
                <div id="onboarding-username-required-err" class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>
                  <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
                  <p class="text-[#ff7c1e] text-sm font-medium">Username is required.</p>
                </div>
                <div id="onboarding-username-min-err" class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>
                  <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
                  <p class="text-[#ff7c1e] text-sm font-medium">Username must be at least 4 characters.</p>
                </div>
                <div id="onboarding-username-max-err" class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>
                  <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
                  <p class="text-[#ff7c1e] text-sm font-medium">Username must be 20 characters or fewer.</p>
                </div>

                <ShowCodeToggle :code="codeSnippets.onboardingUsername" />
              </div>

              <div>
                <DashboardPrimaryButton text="Continue" variant="authPink" size="lg" v-interactions="onboardingUsernameSubmitInteractions" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <ValidationRulesShowcase />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineComponent, h } from 'vue';
import AuthTextInput from '@/components/forms/inputs/AuthTextInput.vue';
import AuthCodeInput from '@/components/forms/inputs/AuthCodeInput.vue';
import ValidationRulesShowcase from '@/dev/templates/demo/demo-audit/ValidationRulesShowcase.vue';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import Checkbox from '@/components/forms/checkboxes/CheckboxGroup.vue';
import {
  InformationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/vue/24/outline';
import { getAssetUrl } from '@/systems/assets/assetLibrary'

const bgUrl = ref('')

onMounted(async () => {
  bgUrl.value = await getAssetUrl('auth.background')
})

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
// Interaction Configurations
// ─────────────────────────────────────────────

/** Login Interactions */
const loginEmailInteractions = [
  {
    triggerEvents: ['input', 'blur'],
    rules: [{ type: 'required' }],
    onInvalid: { actionType: 'show', targetSelector: '#login-email-required-err' },
    onValid: { actionType: 'hide', targetSelector: '#login-email-required-err' }
  },
  {
    triggerEvents: ['input', 'blur'],
    rules: [{ type: 'isEmail' }],
    onInvalid: { actionType: 'show', targetSelector: '#login-email-format-err' },
    onValid: { actionType: 'hide', targetSelector: '#login-email-format-err' }
  }
];

const loginPasswordInteractions = [
  {
    triggerEvents: ['input', 'blur'],
    rules: [{ type: 'required' }],
    onInvalid: { actionType: 'show', targetSelector: '#login-password-required-err' },
    onValid: { actionType: 'hide', targetSelector: '#login-password-required-err' }
  }
];

/** Signup Interactions */
const signupEmailInteractions = [
  {
    triggerEvents: ['input', 'blur'],
    rules: [{ type: 'required' }],
    onInvalid: { actionType: 'show', targetSelector: '#signup-email-required-err' },
    onValid: { actionType: 'hide', targetSelector: '#signup-email-required-err' }
  },
  {
    triggerEvents: ['input', 'blur'],
    rules: [{ type: 'isEmail' }],
    onInvalid: { actionType: 'show', targetSelector: '#signup-email-format-err' },
    onValid: { actionType: 'hide', targetSelector: '#signup-email-format-err' }
  }
];

const signupPasswordInteractions = [
  {
    triggerEvents: ['input', 'focus'],
    rules: [{ type: 'minLength', param: 8 }],
    onInvalid: { actionType: 'show', targetSelector: '#signup-password-min8-err' },
    onValid: { actionType: 'hide', targetSelector: '#signup-password-min8-err' }
  },
  {
    triggerEvents: ['input', 'focus'],
    rules: [{ type: 'hasUpper' }],
    onInvalid: { actionType: 'show', targetSelector: '#signup-password-upper-err' },
    onValid: { actionType: 'hide', targetSelector: '#signup-password-upper-err' }
  },
  {
    triggerEvents: ['input', 'focus'],
    rules: [{ type: 'hasLower' }],
    onInvalid: { actionType: 'show', targetSelector: '#signup-password-lower-err' },
    onValid: { actionType: 'hide', targetSelector: '#signup-password-lower-err' }
  },
  {
    triggerEvents: ['input', 'focus'],
    rules: [{ type: 'hasNumber' }],
    onInvalid: { actionType: 'show', targetSelector: '#signup-password-num-err' },
    onValid: { actionType: 'hide', targetSelector: '#signup-password-num-err' }
  }
];

const signupConfirmPasswordInteractions = [
  {
    triggerEvents: ['input', 'blur'],
    rules: [{ type: 'matchValue', param: '#signup-password' }],
    onInvalid: { actionType: 'show', targetSelector: '#signup-confirm-match-err' },
    onValid: { actionType: 'hide', targetSelector: '#signup-confirm-match-err' }
  }
];

const verificationCodeInteractions = [
  {
    triggerEvents: ['input', 'submit'],
    rules: [{ type: 'minLength', param: 6 }],
    onInvalid: { actionType: 'show', targetSelector: '#verification-code-err' },
    onValid: { actionType: 'hide', targetSelector: '#verification-code-err' }
  }
];

const loginSubmitInteractions = [
  {
    triggerEvents: ['click'],
    actionType: 'validateScope',
    scope: '#login-form',
    options: { focusFirst: true }
  },
  {
    triggerEvents: ['click'],
    actionType: 'script',
    functionName: 'dispatchScopeInteractionInputs',
  }
];

const signupSubmitInteractions = [
  {
    triggerEvents: ['click'],
    actionType: 'validateScope',
    scope: '#signup-form',
    options: { focusFirst: true }
  },
  {
    triggerEvents: ['click'],
    actionType: 'script',
    functionName: 'dispatchScopeInteractionInputs',
  }
];

// ─────────────────────────────────────────────
// LOGIN scope
// ─────────────────────────────────────────────
const loginEmail = ref("");
const loginPassword = ref("");
const loginRememberMe = ref(false);

const verificationCode = ref("");
const isVerifying = ref(false);

const checkboxClass = "m-0 border border-checkboxBorder [appearance:none] w-[0.75rem] h-[0.75rem] rounded-[2px] bg-transparent relative cursor-pointer checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.2rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45";
const xIcon = ref("");

// Load icons independently
getAssetUrl("icon.social.x").then(url => xIcon.value = url);

const handleVerify = () => {
  // Manual trigger for demo purposes if needed, but validateScope handles it
  isVerifying.value = true;
  setTimeout(() => {
    isVerifying.value = false;
    alert("Email verified successfully (Demo)!");
  }, 1500);
};

// ─────────────────────────────────────────────
// SIGNUP scope
// ─────────────────────────────────────────────
const signupEmail = ref("");
const signupPassword = ref("");
const signupConfirmPassword = ref("");

onMounted(() => {
  // No manual registration needed for v-interactions
});

// ─────────────────────────────────────────────
// ONBOARDING scope
// ─────────────────────────────────────────────
const demoUsername = ref('');
const demoSelectedRole = ref('');
const demoRoleOpen = ref(false);
const roleDropdownRef = ref(null);

const demoRoles = [
  { value: 'creator', label: 'Creator' },
  { value: 'fan', label: 'Fan' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'agent', label: 'Agent' },
];

const demoRoleLabel = computed(() => {
  const found = demoRoles.find(r => r.value === demoSelectedRole.value);
  return found ? found.label : '';
});

const demoToggleRoleDropdown = () => { demoRoleOpen.value = !demoRoleOpen.value; };
const demoSelectRole = (val) => {
  demoSelectedRole.value = val;
  demoRoleOpen.value = false;
  // Set el.value directly so engine reads the new value synchronously
  // (Vue's :value binding updates the DOM async on next tick)
  const el = document.getElementById('onboarding-role');
  if (el) {
    el.value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
};

const onboardingRoleInteractions = [
  {
    triggerEvents: ['input', 'change'],
    rules: [{ type: 'isSelect', param: '' }],
    onInvalid: { actionType: 'show', targetSelector: '#onboarding-role-err' },
    onValid: { actionType: 'hide', targetSelector: '#onboarding-role-err' },
  },
];

const onboardingUsernameInteractions = [
  {
    triggerEvents: ['input', 'blur'],
    rules: [{ type: 'hasContent' }],
    onInvalid: { actionType: 'show', targetSelector: '#onboarding-username-required-err' },
    onValid: { actionType: 'hide', targetSelector: '#onboarding-username-required-err' },
  },
  {
    triggerEvents: ['input'],
    rules: [{ type: 'minLength', param: 4 }],
    onInvalid: { actionType: 'show', targetSelector: '#onboarding-username-min-err' },
    onValid: { actionType: 'hide', targetSelector: '#onboarding-username-min-err' },
  },
  {
    triggerEvents: ['input'],
    rules: [{ type: 'maxLength', param: 20 }],
    onInvalid: { actionType: 'show', targetSelector: '#onboarding-username-max-err' },
    onValid: { actionType: 'hide', targetSelector: '#onboarding-username-max-err' },
  },
];

const onboardingSubmitInteractions = [
  {
    triggerEvents: ['click'],
    actionType: 'validateScope',
    scope: '#onboarding-form',
    options: { focusFirst: true }
  },
];

const onboardingUsernameSubmitInteractions = [
  {
    triggerEvents: ['click'],
    actionType: 'validateScope',
    scope: '#onboarding-username-form',
    options: { focusFirst: true }
  },
];

// ─────────────────────────────────────────────
// Per-input code snippets (full actual usage)
// ─────────────────────────────────────────────
const codeSnippets = {
  loginEmail: [
    '<!-- Template -->',
    '<div class="flex flex-col gap-1">',
    '  <AuthTextInput',
    '    v-model="loginEmail"',
    '    placeholder="linden@codelinden.com"',
    '    id="login-email"',
    '    show-label',
    '    label-text="Email"',
    '    data-required="true"',
    '    required-display="italic-text"',
    '    type="text"',
    '    :interactions-config="loginEmailInteractions"',
    '  />',
    '',
    '  <!-- Required error -->',
    '  <div id="login-email-required-err"',
    '    class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>',
    '    <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />',
    '    <p class="text-[#ff7c1e] text-sm font-medium">Email is required.</p>',
    '  </div>',
    '  <!-- Format error -->',
    '  <div id="login-email-format-err"',
    '    class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>',
    '    <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />',
    '    <p class="text-[#ff7c1e] text-sm font-medium">Please enter a valid email address.</p>',
    '  </div>',
    '</div>',
    '',
    '<!-- Script -->',
    'const loginEmail = ref("");',
    '',
    'const loginEmailInteractions = [',
    '  {',
    '    triggerEvents: ["input", "blur"],',
    '    rules: [{ type: "hasContent" }],',
    '    onInvalid: { actionType: "show", targetSelector: "#login-email-required-err" },',
    '    onValid:   { actionType: "hide", targetSelector: "#login-email-required-err" },',
    '  },',
    '  {',
    '    triggerEvents: ["input", "blur"],',
    '    rules: [{ type: "isEmail" }],',
    '    onInvalid: { actionType: "show", targetSelector: "#login-email-format-err" },',
    '    onValid:   { actionType: "hide", targetSelector: "#login-email-format-err" },',
    '  },',
    '];',
  ].join('\n'),

  loginPassword: [
    '<!-- Template -->',
    '<div class="flex flex-col gap-1">',
    '  <AuthTextInput',
    '    v-model="loginPassword"',
    '    placeholder="••••••••"',
    '    id="login-password"',
    '    show-label',
    '    label-text="Password"',
    '    data-required="true"',
    '    required-display="italic-text"',
    '    type="password"',
    '    :interactions-config="loginPasswordInteractions"',
    '  />',
    '',
    '  <!-- Required error -->',
    '  <div id="login-password-required-err"',
    '    class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>',
    '    <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />',
    '    <p class="text-[#ff7c1e] text-sm font-medium">Password is required.</p>',
    '  </div>',
    '</div>',
    '',
    '<!-- Script -->',
    'const loginPassword = ref("");',
    '',
    'const loginPasswordInteractions = [',
    '  {',
    '    triggerEvents: ["input", "blur"],',
    '    rules: [{ type: "hasContent" }],',
    '    onInvalid: { actionType: "show", targetSelector: "#login-password-required-err" },',
    '    onValid:   { actionType: "hide", targetSelector: "#login-password-required-err" },',
    '  },',
    '];',
  ].join('\n'),

  loginCheckbox: [
    '<!-- Template -->',
    '<Checkbox',
    '  v-model="loginRememberMe"',
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
    '<!-- Script -->',
    'const loginRememberMe = ref(false);',
    '// No engine registration needed — plain boolean ref.',
  ].join('\n'),

  signupEmail: [
    '<!-- Template -->',
    '<div class="flex flex-col gap-1">',
    '  <AuthTextInput',
    '    v-model="signupEmail"',
    '    placeholder="linden@codelinden.com"',
    '    id="signup-email"',
    '    show-label',
    '    label-text="Email"',
    '    data-required="true"',
    '    required-display="italic-text"',
    '    type="text"',
    '    :interactions-config="signupEmailInteractions"',
    '  />',
    '',
    '  <!-- Required error -->',
    '  <div id="signup-email-required-err"',
    '    class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>',
    '    <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />',
    '    <p class="text-[#ff7c1e] text-sm font-medium">Email is required.</p>',
    '  </div>',
    '  <!-- Format error -->',
    '  <div id="signup-email-format-err"',
    '    class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>',
    '    <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />',
    '    <p class="text-[#ff7c1e] text-sm font-medium">Please enter a valid email address.</p>',
    '  </div>',
    '</div>',
    '',
    '<!-- Script -->',
    'const signupEmail = ref("");',
    '',
    'const signupEmailInteractions = [',
    '  {',
    '    triggerEvents: ["input", "blur"],',
    '    rules: [{ type: "hasContent" }],',
    '    onInvalid: { actionType: "show", targetSelector: "#signup-email-required-err" },',
    '    onValid:   { actionType: "hide", targetSelector: "#signup-email-required-err" },',
    '  },',
    '  {',
    '    triggerEvents: ["input", "blur"],',
    '    rules: [{ type: "isEmail" }],',
    '    onInvalid: { actionType: "show", targetSelector: "#signup-email-format-err" },',
    '    onValid:   { actionType: "hide", targetSelector: "#signup-email-format-err" },',
    '  },',
    '];',
  ].join('\n'),

  signupPassword: [
    '<!-- Template -->',
    '<div class="flex flex-col gap-1">',
    '  <AuthTextInput',
    '    v-model="signupPassword"',
    '    placeholder="••••••••"',
    '    id="signup-password"',
    '    show-label',
    '    label-text="Password"',
    '    data-required="true"',
    '    required-display="italic-text"',
    '    type="password"',
    '    :interactions-config="signupPasswordInteractions"',
    '  />',
    '',
    '  <!-- Complexity errors (show/hide per rule) -->',
    '  <div id="signup-password-min8-err"',
    '    class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>',
    '    <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />',
    '    <p class="text-[#ff7c1e] text-sm font-medium">Use 8 or more characters</p>',
    '  </div>',
    '  <div id="signup-password-upper-err"',
    '    class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>',
    '    <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />',
    '    <p class="text-[#ff7c1e] text-sm font-medium">Use upper case letters</p>',
    '  </div>',
    '  <div id="signup-password-lower-err"',
    '    class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>',
    '    <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />',
    '    <p class="text-[#ff7c1e] text-sm font-medium">Use lower case letters</p>',
    '  </div>',
    '  <div id="signup-password-num-err"',
    '    class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>',
    '    <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />',
    '    <p class="text-[#ff7c1e] text-sm font-medium">Use numbers</p>',
    '  </div>',
    '</div>',
    '',
    '<!-- Script -->',
    'const signupPassword = ref("");',
    '',
    'const signupPasswordInteractions = [',
    '  {',
    '    triggerEvents: ["input", "focus"],',
    '    rules: [{ type: "minLength", param: 8 }],',
    '    onInvalid: { actionType: "show", targetSelector: "#signup-password-min8-err" },',
    '    onValid:   { actionType: "hide", targetSelector: "#signup-password-min8-err" },',
    '  },',
    '  {',
    '    triggerEvents: ["input", "focus"],',
    '    rules: [{ type: "hasUpper" }],',
    '    onInvalid: { actionType: "show", targetSelector: "#signup-password-upper-err" },',
    '    onValid:   { actionType: "hide", targetSelector: "#signup-password-upper-err" },',
    '  },',
    '  {',
    '    triggerEvents: ["input", "focus"],',
    '    rules: [{ type: "hasLower" }],',
    '    onInvalid: { actionType: "show", targetSelector: "#signup-password-lower-err" },',
    '    onValid:   { actionType: "hide", targetSelector: "#signup-password-lower-err" },',
    '  },',
    '  {',
    '    triggerEvents: ["input", "focus"],',
    '    rules: [{ type: "hasNumber" }],',
    '    onInvalid: { actionType: "show", targetSelector: "#signup-password-num-err" },',
    '    onValid:   { actionType: "hide", targetSelector: "#signup-password-num-err" },',
    '  },',
    '];',
  ].join('\n'),

  signupConfirmPassword: [
    '<!-- Template -->',
    '<div class="flex flex-col gap-1">',
    '  <AuthTextInput',
    '    v-model="signupConfirmPassword"',
    '    placeholder="••••••••"',
    '    id="signup-confirmPassword"',
    '    show-label',
    '    label-text="Confirm Password"',
    '    data-required="true"',
    '    required-display="italic-text"',
    '    type="password"',
    '    :interactions-config="signupConfirmPasswordInteractions"',
    '  />',
    '',
    '  <!-- Mismatch error -->',
    '  <div id="signup-confirm-match-err"',
    '    class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>',
    '    <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />',
    '    <p class="text-[#ff7c1e] text-sm font-medium">Passwords do not match.</p>',
    '  </div>',
    '</div>',
    '',
    '<!-- Script -->',
    'const signupConfirmPassword = ref("");',
    '',
    'const signupConfirmPasswordInteractions = [',
    '  {',
    '    triggerEvents: ["input", "blur"],',
    '    rules: [{ type: "matchValue", param: "password", scope: "signup-form" }],',
    '    onInvalid: { actionType: "show", targetSelector: "#signup-confirm-match-err" },',
    '    onValid:   { actionType: "hide", targetSelector: "#signup-confirm-match-err" },',
    '  },',
    '];',
  ].join('\n'),

  verificationCode: [
    '<!-- Template -->',
    '<div class="flex flex-col gap-2">',
    '  <AuthCodeInput',
    '    v-model="verificationCode"',
    '    id="verification-code"',
    '    show-label',
    '    label-text="Verification Code"',
    '    data-required="true"',
    '    required-display="italic-text"',
    '    :interactions-config="verificationCodeInteractions"',
    '  />',
    '',
    '  <!-- Length error -->',
    '  <div id="verification-code-err"',
    '    class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>',
    '    <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />',
    '    <p class="text-[#ff7c1e] text-sm font-medium">Code must be 6 digits.</p>',
    '  </div>',
    '</div>',
    '',
    '<!-- Script -->',
    'const verificationCode = ref("");',
    '',
    'const verificationCodeInteractions = [',
    '  {',
    '    triggerEvents: ["input"],',
    '    rules: [{ type: "minLength", param: 6 }],',
    '    onInvalid: { actionType: "show", targetSelector: "#verification-code-err" },',
    '    onValid:   { actionType: "hide", targetSelector: "#verification-code-err" },',
    '  },',
    '];',
  ].join('\n'),

  onboardingRole: [
    '<!-- Template -->',
    '',
    '<!-- 1. Custom dropdown trigger (your own UI) -->',
    '<div @click="toggleDropdown"',
    '  class="rounded-xl border border-white/30 bg-white/20 min-h-12 py-3 px-2.5',
    '         flex justify-between items-center cursor-pointer">',
    '  <span>{{ selectedRole || "Select your role" }}</span>',
    '  <svg class="w-5 h-5" ...> ... </svg>',
    '</div>',
    '',
    '<!-- 2. Dropdown menu (v-if) -->',
    '<div v-if="isOpen" class="absolute z-50 w-full ...">',
    '  <div v-for="role in roles" @click="selectRole(role.value)">',
    '    {{ role.label }}',
    '  </div>',
    '</div>',
    '',
    '<!-- 3. Hidden input — the engine watches this -->',
    '<input',
    '  id="onboarding-role"',
    '  type="text"',
    '  :value="selectedRole"',
    '  class="hidden"',
    '  readonly',
    '  v-interactions="roleInteractions"',
    '/>',
    '',
    '<!-- 4. Error div -->',
    '<div id="onboarding-role-err"',
    '  class="flex items-center gap-1.5 [&[hidden]]:!hidden" hidden>',
    '  <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />',
    '  <p class="text-[#ff7c1e] text-sm font-medium">Please select a role.</p>',
    '</div>',
    '',
    '<!-- Script -->',
    'const selectedRole = ref("");',
    'const isOpen = ref(false);',
    '',
    'const selectRole = (val) => {',
    '  selectedRole.value = val;',
    '  isOpen.value = false;',
    '  // Notify the engine that the hidden input value changed',
    '  const el = document.getElementById("onboarding-role");',
    '  if (el) el.dispatchEvent(new Event("input", { bubbles: true }));',
    '};',
    '',
    'const roleInteractions = [',
    '  {',
    '    triggerEvents: ["input"],',
    '    rules: [{ type: "isSelect" }],',
    '    onInvalid: { actionType: "show", targetSelector: "#onboarding-role-err" },',
    '    onValid:   { actionType: "hide", targetSelector: "#onboarding-role-err" },',
    '  },',
    '];',
  ].join('\n'),

  onboardingUsername: [
    '<!-- Template -->',
    '<div class="flex flex-col gap-1">',
    '  <AuthTextInput',
    '    v-model="username"',
    '    placeholder="e.g. codelinden"',
    '    id="onboarding-username"',
    '    show-label',
    '    label-text="Username"',
    '    data-required="true"',
    '    required-display="italic-text"',
    '    type="text"',
    '    :interactions-config="usernameInteractions"',
    '  />',
    '',
    '  <!-- Required error -->',
    '  <div id="onboarding-username-required-err"',
    '    class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>',
    '    <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />',
    '    <p class="text-[#ff7c1e] text-sm font-medium">Username is required.</p>',
    '  </div>',
    '  <!-- Min length error -->',
    '  <div id="onboarding-username-min-err"',
    '    class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>',
    '    <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />',
    '    <p class="text-[#ff7c1e] text-sm font-medium">Username must be at least 4 characters.</p>',
    '  </div>',
    '  <!-- Max length error -->',
    '  <div id="onboarding-username-max-err"',
    '    class="flex items-center gap-1.5 mt-1 [&[hidden]]:!hidden" hidden>',
    '    <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />',
    '    <p class="text-[#ff7c1e] text-sm font-medium">Username must be 20 characters or fewer.</p>',
    '  </div>',
    '</div>',
    '',
    '<!-- Script -->',
    'const username = ref("");',
    '',
    'const usernameInteractions = [',
    '  {',
    '    triggerEvents: ["input", "blur"],',
    '    rules: [{ type: "hasContent" }],',
    '    onInvalid: { actionType: "show", targetSelector: "#onboarding-username-required-err" },',
    '    onValid:   { actionType: "hide", targetSelector: "#onboarding-username-required-err" },',
    '  },',
    '  {',
    '    triggerEvents: ["input"],',
    '    rules: [{ type: "minLength", param: 4 }],',
    '    onInvalid: { actionType: "show", targetSelector: "#onboarding-username-min-err" },',
    '    onValid:   { actionType: "hide", targetSelector: "#onboarding-username-min-err" },',
    '  },',
    '  {',
    '    triggerEvents: ["input"],',
    '    rules: [{ type: "maxLength", param: 20 }],',
    '    onInvalid: { actionType: "show", targetSelector: "#onboarding-username-max-err" },',
    '    onValid:   { actionType: "hide", targetSelector: "#onboarding-username-max-err" },',
    '  },',
    '];',
  ].join('\n'),
};
</script>

<style scoped></style>
