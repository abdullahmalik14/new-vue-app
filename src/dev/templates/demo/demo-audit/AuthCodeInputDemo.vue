<template>
    <div class="min-h-screen bg-gradient-to-br from-[#710A0A] to-[#200000] py-10 px-4 font-sans">
        <div class="max-w-6xl mx-auto flex flex-col gap-16">
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="AuthCodeInput" class="text-white" />
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 text-white">
                    <!-- 1. Default -->
                    <div class="flex flex-col gap-4">
                        <h3 class="text-lg font-semibold text-white/90">Default</h3>

                        <AuthCodeInput v-model="vals.ci1" />
                        <ShowCodeToggle :code="codeExamples.default" />
                    </div>
                    <!-- 2. With label -->
                    <div class="flex flex-col gap-4">
                        <h3 class="text-lg font-semibold text-white/90">With Label</h3>

                        <AuthCodeInput v-model="vals.ci2" showLabel labelText="Enter OTP" />
                        <ShowCodeToggle :code="codeExamples.withLabel" />
                    </div>
                    <!-- 3. Required display -->
                    <div class="flex flex-col gap-4">
                        <h3 class="text-lg font-semibold text-white/90">Required (*)</h3>

                        <AuthCodeInput v-model="vals.ci3" showLabel labelText="Verification Code"
                            requiredDisplay="*" 
                            :showErrors="ci3Errors.length > 0" :errors="ci3Errors"
                            :onSuccess="ci3Success.length > 0" :success="ci3Success" />
                        <ShowCodeToggle :code="codeExamples.requiredAsterisk" />
                    </div>
                    <!-- 4. Disabled -->
                    <div class="flex flex-col gap-4">
                        <h3 class="text-lg font-semibold text-white/90">Disabled</h3>

                        <AuthCodeInput v-model="vals.ci4" showLabel labelText="Disabled" :disabled="true" />
                        <ShowCodeToggle :code="codeExamples.disabled" />
                    </div>
                    <!-- 5. With dynamic errors -->
                    <div class="flex flex-col gap-4">
                        <h3 class="text-lg font-semibold text-white/90">Dynamic Errors</h3>

                        <AuthCodeInput v-model="vals.ci5" showLabel labelText="Enter 123456"
                            :showErrors="ci5Errors.length > 0" :errors="ci5Errors"
                            :onSuccess="ci5Success.length > 0" :success="ci5Success" />
                        <p class="mt-2 text-xs text-gray-400">Type "123456" to see the error disappear. Otherwise it shows an error.</p>
                        <ShowCodeToggle :code="codeExamples.withErrors" />
                    </div>
                    <!-- 6. Toggle Submitting state -->
                    <div class="flex flex-col gap-4">
                        <h3 class="text-lg font-semibold text-white/90">Toggle Submitting State</h3>

                        <AuthCodeInput v-model="vals.ci6" showLabel labelText="Verifying..."
                            :isSubmitting="isSubmitting" />
                        <button @click="toggleSubmit" class="mt-4 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
                            {{ isSubmitting ? 'Stop Submitting' : 'Trigger Submitting' }}
                        </button>
                        <ShowCodeToggle :code="codeExamples.submitting" />
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
import AuthCodeInput from '@/components/forms/inputs/AuthCodeInput.vue';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';

const vals = reactive({
    ci1: '', ci2: '', ci3: '', ci4: '123456', ci5: '000000', ci6: '678901'
});

const isSubmitting = ref(true);
const toggleSubmit = () => isSubmitting.value = !isSubmitting.value;

const ci3Errors = computed(() => {
    return vals.ci3.length < 6 
      ? [{ error: 'Verification code is required.' }] 
      : [];
});

const ci3Success = computed(() => {
    return vals.ci3.length === 6 
      ? [{ message: 'Code fully entered.' }] 
      : [];
});

const ci5Errors = computed(() => {
    return vals.ci5 !== '123456' 
      ? [{ error: 'Invalid OTP code. Must be 123456.' }] 
      : [];
});

const ci5Success = computed(() => {
    return vals.ci5 === '123456' 
      ? [{ message: 'Valid OTP code!' }] 
      : [];
});

const codeExamples = {
    default: `<AuthCodeInput 
  v-model="val" 
/>`,
    withLabel: `<AuthCodeInput 
  v-model="val" 
  showLabel 
  labelText="Enter OTP" 
/>`,
    requiredAsterisk: `<AuthCodeInput 
  v-model="val" 
  showLabel 
  labelText="Verification Code"
  requiredDisplay="*" 
  :showErrors="ci3Errors.length > 0" 
  :errors="ci3Errors"
  :onSuccess="ci3Success.length > 0"
  :success="ci3Success"
/>`,
    disabled: `<AuthCodeInput 
  v-model="val" 
  showLabel 
  labelText="Disabled" 
  :disabled="true" 
/>`,
    withErrors: `<AuthCodeInput 
  v-model="val" 
  showLabel 
  labelText="Enter Code" 
  :showErrors="ci5Errors.length > 0" 
  :errors="ci5Errors" 
  :onSuccess="ci5Success.length > 0"
  :success="ci5Success"
/>`,
    submitting: `<AuthCodeInput 
  v-model="val" 
  showLabel 
  labelText="Verifying..."
  :isSubmitting="isSubmitting" 
/>\n\n<button @click="isSubmitting = !isSubmitting">Toggle</button>`
};
</script>
