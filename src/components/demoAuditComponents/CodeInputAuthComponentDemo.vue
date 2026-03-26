<template>
    <div class="min-h-screen bg-gradient-to-br from-[#710A0A] to-[#200000] py-10 px-4 font-sans">
        <div class="max-w-6xl mx-auto flex flex-col gap-16">
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="CodeInputAuthComponent" class="text-white" />
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 text-white">
                    <!-- 1. Default -->
                    <DemoCard label="Default" dark :code="codeExamples.default">
                        <CodeInputAuthComponent v-model="vals.ci1" />
                    </DemoCard>
                    <!-- 2. With label -->
                    <DemoCard label="With Label" dark :code="codeExamples.withLabel">
                        <CodeInputAuthComponent v-model="vals.ci2" showLabel labelText="Enter OTP" />
                    </DemoCard>
                    <!-- 3. Required display -->
                    <DemoCard label="Required (*)" dark :code="codeExamples.requiredAsterisk">
                        <CodeInputAuthComponent v-model="vals.ci3" showLabel labelText="Verification Code"
                            requiredDisplay="*" 
                            :showErrors="ci3Errors.length > 0" :errors="ci3Errors"
                            :onSuccess="ci3Success.length > 0" :success="ci3Success" />
                    </DemoCard>
                    <!-- 4. Disabled -->
                    <DemoCard label="Disabled" dark :code="codeExamples.disabled">
                        <CodeInputAuthComponent v-model="vals.ci4" showLabel labelText="Disabled" :disabled="true" />
                    </DemoCard>
                    <!-- 5. With dynamic errors -->
                    <DemoCard label="Dynamic Errors" dark :code="codeExamples.withErrors">
                        <CodeInputAuthComponent v-model="vals.ci5" showLabel labelText="Enter 123456"
                            :showErrors="ci5Errors.length > 0" :errors="ci5Errors"
                            :onSuccess="ci5Success.length > 0" :success="ci5Success" />
                        <p class="mt-2 text-xs text-gray-400">Type "123456" to see the error disappear. Otherwise it shows an error.</p>
                    </DemoCard>
                    <!-- 6. Toggle Submitting state -->
                    <DemoCard label="Toggle Submitting State" dark :code="codeExamples.submitting">
                        <CodeInputAuthComponent v-model="vals.ci6" showLabel labelText="Verifying..."
                            :isSubmitting="isSubmitting" />
                        <button @click="toggleSubmit" class="mt-4 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
                            {{ isSubmitting ? 'Stop Submitting' : 'Trigger Submitting' }}
                        </button>
                    </DemoCard>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
import CodeInputAuthComponent from '@/components/input/CodeInputAuthComponent.vue';
import DemoSectionHeader from '@/templates/dev/DemoSectionHeader.vue';
import DemoCard from '@/templates/dev/DemoCard.vue';

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
    default: `<CodeInputAuthComponent 
  v-model="val" 
/>`,
    withLabel: `<CodeInputAuthComponent 
  v-model="val" 
  showLabel 
  labelText="Enter OTP" 
/>`,
    requiredAsterisk: `<CodeInputAuthComponent 
  v-model="val" 
  showLabel 
  labelText="Verification Code"
  requiredDisplay="*" 
  :showErrors="ci3Errors.length > 0" 
  :errors="ci3Errors"
  :onSuccess="ci3Success.length > 0"
  :success="ci3Success"
/>`,
    disabled: `<CodeInputAuthComponent 
  v-model="val" 
  showLabel 
  labelText="Disabled" 
  :disabled="true" 
/>`,
    withErrors: `<CodeInputAuthComponent 
  v-model="val" 
  showLabel 
  labelText="Enter Code" 
  :showErrors="ci5Errors.length > 0" 
  :errors="ci5Errors" 
  :onSuccess="ci5Success.length > 0"
  :success="ci5Success"
/>`,
    submitting: `<CodeInputAuthComponent 
  v-model="val" 
  showLabel 
  labelText="Verifying..."
  :isSubmitting="isSubmitting" 
/>\n\n<button @click="isSubmitting = !isSubmitting">Toggle</button>`
};
</script>
