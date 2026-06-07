<template>
  <section class="flex flex-col gap-6">
    <DemoSectionHeader title="Unified rules.js — live validation" class="text-white" />
    <p class="text-sm text-white/70 max-w-3xl">
      These fields use the same canonical rules as production forms (<code class="text-white/90">src/utils/validation/rules.js</code>
      via <code class="text-white/90">v-interactions</code>). Try the sample values in the hints, then click Validate all.
    </p>

    <div id="rules-showcase-form" interaction-container class="flex flex-col gap-10">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <!-- Email (strict isEmail) -->
        <div class="flex flex-col gap-4">
          <h3 class="text-lg text-white font-semibold border-b border-white/10 pb-2">Email formats</h3>
          <p class="text-xs text-white/60">
            Valid: <span class="text-white/90">user+tag@sub.example.co.uk</span> —
            Invalid: <span class="text-white/90">bad@@mail.com</span>,
            <span class="text-white/90">user name@example.com</span>,
            <span class="text-white/90">.user@example.com</span>
          </p>
          <div class="flex flex-col gap-1">
            <AuthTextInput
              v-model="showcaseEmail"
              id="showcase-email"
              show-label
              label-text="Email (isEmail)"
              type="text"
              placeholder="user+tag@sub.example.co.uk"
              data-required="true"
              required-display="italic-text"
              :interactions-config="showcaseEmailInteractions"
            />
            <div id="showcase-email-format-err" class="flex items-center gap-1.5 [&[hidden]]:!hidden" hidden>
              <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
              <p class="text-[#ff7c1e] text-sm font-medium">Enter a valid email (RFC-style local + domain checks).</p>
            </div>
          </div>
        </div>

        <!-- URL -->
        <div class="flex flex-col gap-4">
          <h3 class="text-lg text-white font-semibold border-b border-white/10 pb-2">URL</h3>
          <p class="text-xs text-white/60">
            Valid: <span class="text-white/90">https://example.com/path</span> —
            Invalid: <span class="text-white/90">example.com</span> (protocol required)
          </p>
          <div class="flex flex-col gap-1">
            <AuthTextInput
              v-model="showcaseUrl"
              id="showcase-url"
              show-label
              label-text="Website (isUrl)"
              type="text"
              placeholder="https://example.com"
              :interactions-config="showcaseUrlInteractions"
            />
            <div id="showcase-url-err" class="flex items-center gap-1.5 [&[hidden]]:!hidden" hidden>
              <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
              <p class="text-[#ff7c1e] text-sm font-medium">Enter a full http:// or https:// URL with a valid host.</p>
            </div>
          </div>
        </div>

        <!-- Numeric -->
        <div class="flex flex-col gap-4">
          <h3 class="text-lg text-white font-semibold border-b border-white/10 pb-2">Numbers</h3>
          <p class="text-xs text-white/60">
            Valid: <span class="text-white/90">42</span>, <span class="text-white/90">-12.5</span> —
            Invalid: <span class="text-white/90">-</span> (bare minus),
            <span class="text-white/90">12abc</span>
          </p>
          <div class="flex flex-col gap-1">
            <AuthTextInput
              v-model="showcaseAmount"
              id="showcase-amount"
              show-label
              label-text="Amount (isNumeric)"
              type="text"
              placeholder="12.5"
              :interactions-config="showcaseAmountInteractions"
            />
            <div id="showcase-amount-err" class="flex items-center gap-1.5 [&[hidden]]:!hidden" hidden>
              <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
              <p class="text-[#ff7c1e] text-sm font-medium">Enter a valid number (optional minus, digits, optional decimal).</p>
            </div>
          </div>
        </div>

        <!-- Min / max -->
        <div class="flex flex-col gap-4">
          <h3 class="text-lg text-white font-semibold border-b border-white/10 pb-2">Numeric range</h3>
          <p class="text-xs text-white/60">
            Rule: age between <span class="text-white/90">18</span> and <span class="text-white/90">120</span> (minNum / maxNum)
          </p>
          <div class="flex flex-col gap-1">
            <AuthTextInput
              v-model="showcaseAge"
              id="showcase-age"
              show-label
              label-text="Age"
              type="text"
              placeholder="25"
              :interactions-config="showcaseAgeInteractions"
            />
            <div id="showcase-age-min-err" class="flex items-center gap-1.5 [&[hidden]]:!hidden" hidden>
              <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
              <p class="text-[#ff7c1e] text-sm font-medium">Minimum age is 18.</p>
            </div>
            <div id="showcase-age-max-err" class="flex items-center gap-1.5 [&[hidden]]:!hidden" hidden>
              <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
              <p class="text-[#ff7c1e] text-sm font-medium">Maximum age is 120.</p>
            </div>
            <div id="showcase-age-nan-err" class="flex items-center gap-1.5 [&[hidden]]:!hidden" hidden>
              <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
              <p class="text-[#ff7c1e] text-sm font-medium">Age must be a valid number.</p>
            </div>
          </div>
        </div>

        <!-- Full password policy -->
        <div class="flex flex-col gap-4 lg:col-span-2">
          <h3 class="text-lg text-white font-semibold border-b border-white/10 pb-2">Password (isSecurePassword)</h3>
          <p class="text-xs text-white/60">
            One rule: upper + lower + digit + special + 8+ chars.
            Try <span class="text-white/90">Abcdef12</span> (fails) vs <span class="text-white/90">Abcd12!@</span> (passes).
          </p>
          <div class="flex flex-col gap-1 max-w-md">
            <AuthTextInput
              v-model="showcaseSecurePassword"
              id="showcase-secure-password"
              show-label
              label-text="Password"
              type="password"
              placeholder="••••••••"
              :interactions-config="showcaseSecurePasswordInteractions"
            />
            <div id="showcase-secure-password-err" class="flex items-center gap-1.5 [&[hidden]]:!hidden" hidden>
              <InformationCircleIcon class="w-4 h-4 text-[#ff7c1e]" />
              <p class="text-[#ff7c1e] text-sm font-medium">
                Use 8+ characters with upper, lower, number, and a special character.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <PrimaryButton
          text="Validate all fields"
          variant="authPink"
          size="lg"
          v-interactions="rulesShowcaseSubmitInteractions"
        />
        <p v-if="lastValidateMessage" class="text-sm text-white/80">{{ lastValidateMessage }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { InformationCircleIcon } from '@heroicons/vue/24/outline';
import AuthTextInput from '@/components/forms/inputs/AuthTextInput.vue';
import DemoSectionHeader from '@/templates/dev/DemoSectionHeader.vue';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton.vue';
import { registerAllowedScript, unregisterAllowedScript } from '@/interactions';

const showcaseEmail = ref('user+tag@sub.example.co.uk');
const showcaseUrl = ref('example.com');
const showcaseAmount = ref('-');
const showcaseAge = ref('10');
const showcaseSecurePassword = ref('');
const lastValidateMessage = ref('');

const showcaseEmailInteractions = [
  {
    triggerEvents: ['input', 'blur'],
    rules: [{ type: 'isEmail' }],
    onInvalid: { actionType: 'show', targetSelector: '#showcase-email-format-err' },
    onValid: { actionType: 'hide', targetSelector: '#showcase-email-format-err' },
  },
];

const showcaseUrlInteractions = [
  {
    triggerEvents: ['input', 'blur'],
    rules: [{ type: 'isUrl' }],
    onInvalid: { actionType: 'show', targetSelector: '#showcase-url-err' },
    onValid: { actionType: 'hide', targetSelector: '#showcase-url-err' },
  },
];

const showcaseAmountInteractions = [
  {
    triggerEvents: ['input', 'blur'],
    rules: [{ type: 'isNumeric' }],
    onInvalid: { actionType: 'show', targetSelector: '#showcase-amount-err' },
    onValid: { actionType: 'hide', targetSelector: '#showcase-amount-err' },
  },
];

const showcaseAgeInteractions = [
  {
    triggerEvents: ['input', 'blur'],
    rules: [{ type: 'isNumeric' }],
    onInvalid: { actionType: 'show', targetSelector: '#showcase-age-nan-err' },
    onValid: { actionType: 'hide', targetSelector: '#showcase-age-nan-err' },
  },
  {
    triggerEvents: ['input', 'blur'],
    rules: [{ type: 'minNum', param: 18 }],
    onInvalid: { actionType: 'show', targetSelector: '#showcase-age-min-err' },
    onValid: { actionType: 'hide', targetSelector: '#showcase-age-min-err' },
  },
  {
    triggerEvents: ['input', 'blur'],
    rules: [{ type: 'maxNum', param: 120 }],
    onInvalid: { actionType: 'show', targetSelector: '#showcase-age-max-err' },
    onValid: { actionType: 'hide', targetSelector: '#showcase-age-max-err' },
  },
];

const showcaseSecurePasswordInteractions = [
  {
    triggerEvents: ['input', 'blur', 'focus'],
    rules: [{ type: 'isSecurePassword' }],
    onInvalid: { actionType: 'show', targetSelector: '#showcase-secure-password-err' },
    onValid: { actionType: 'hide', targetSelector: '#showcase-secure-password-err' },
  },
];

const rulesShowcaseSubmitInteractions = [
  {
    triggerEvents: ['click'],
    actionType: 'validateScope',
    scope: '#rules-showcase-form',
    options: { focusFirst: true },
  },
  {
    triggerEvents: ['click'],
    actionType: 'script',
    functionName: 'rulesShowcaseAfterValidate',
  },
];

function updateValidateSummary() {
  const form = document.getElementById('rules-showcase-form');
  const invalid = form?.querySelectorAll('[interaction-config][validated="false"]') ?? [];
  lastValidateMessage.value = invalid.length
    ? `${invalid.length} field(s) still invalid — fix the highlighted errors above.`
    : 'All showcase fields passed validation.';
}

onMounted(() => {
  registerAllowedScript('rulesShowcaseAfterValidate', updateValidateSummary);
});

onUnmounted(() => {
  unregisterAllowedScript('rulesShowcaseAfterValidate');
});
</script>
