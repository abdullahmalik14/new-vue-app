<template>
    <div class="min-h-screen bg-gradient-to-br from-[#710A0A] to-[#200000] py-10 px-4 font-sans">
        <div class="max-w-6xl mx-auto flex flex-col gap-16">
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="BaseInput" class="text-white" />
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 text-white">
                    <!-- 1. Default text -->
                    <DemoCard label="Default Text" dark :code="codeExamples.defaultText">
                        <BaseInput v-model="vals.bi1" placeholder="Enter text..." label="Name"
                            :labelClass="labelGlassClass"
                            :inputClass="inputGlassClass" />
                    </DemoCard>
                    <!-- 2. With label -->
                    <DemoCard label="With Label" dark :code="codeExamples.withLabel">
                        <BaseInput v-model="vals.bi2" placeholder="john@example.com" label="Email Address"
                            labelFor="email-base" :labelClass="labelGlassClass"
                            :inputClass="inputGlassClass" />
                    </DemoCard>
                    <!-- 3. Disabled -->
                    <DemoCard label="Disabled" dark :code="codeExamples.disabled">
                        <BaseInput v-model="vals.bi3" placeholder="Disabled input" label="Disabled" :disabled="true"
                            :labelClass="labelGlassClass"
                            inputClass="w-full border border-white/10 bg-white/5 rounded-xl px-4 py-2.5 min-h-[3rem] text-sm text-white/50 cursor-not-allowed" />
                    </DemoCard>
                    <!-- 4. Number with controls -->
                    <DemoCard label="Number with Controls" dark :code="codeExamples.numberControls">
                        <BaseInput v-model="vals.bi4" type="number" label="Quantity" :showControls="true"
                            :labelClass="labelGlassClass"
                            :inputClass="inputGlassClass" />
                    </DemoCard>
                    <!-- 5. With max length counter -->
                    <DemoCard label="With Character Counter" dark :code="codeExamples.charCounter">
                        <BaseInput v-model="vals.bi5" placeholder="Max 50 chars..." label="Title" :maxLength="50"
                            :labelClass="labelGlassClass"
                            :inputClass="inputGlassClass" counterClass="text-xs text-white/60 mt-1" />
                    </DemoCard>
                    <!-- 6. Textarea mode -->
                    <DemoCard label="Textarea Mode" dark :code="codeExamples.textarea">
                        <BaseInput v-model="vals.bi6" type="textarea" label="Description"
                            placeholder="Enter description..." :rows="3"
                            :labelClass="labelGlassClass"
                            :inputClass="inputGlassClass" />
                    </DemoCard>
                    <!-- 7. Textarea with max length -->
                    <DemoCard label="Textarea + Counter" dark :code="codeExamples.textareaCounter">
                        <BaseInput v-model="vals.bi7" type="textarea" label="Bio" placeholder="Your bio..." :rows="3"
                            :maxLength="200" :labelClass="labelGlassClass"
                            :inputClass="inputGlassClass" counterClass="text-xs text-white/60 mt-1" />
                    </DemoCard>
                    <!-- 8. Dynamic Array Validation -->
                    <DemoCard label="Array Validations" dark :code="codeExamples.errorState">
                        <BaseInput v-model="vals.bi8" placeholder="Type valid email..." label="Email"
                            :labelClass="labelGlassClass"
                            :inputClass="errorClassBi8" 
                            :showErrors="emailErrors.length > 0" :errors="emailErrors"
                            :onSuccess="emailSuccess.length > 0" :success="emailSuccess" />
                    </DemoCard>
                    <!-- 9. Number no controls -->
                    <DemoCard label="Number (No Controls)" dark :code="codeExamples.numberNoControls">
                        <BaseInput v-model="vals.bi10" type="number" label="Age" :showControls="false"
                            :labelClass="labelGlassClass"
                            :inputClass="inputGlassClass" />
                    </DemoCard>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { reactive, computed } from 'vue';
import BaseInput from '@/components/input/BaseInput.vue';
import DemoSectionHeader from '@/templates/dev/DemoSectionHeader.vue';
import DemoCard from '@/templates/dev/DemoCard.vue';

const vals = reactive({
    bi1: '', bi2: '', bi3: 'Readonly Text', bi4: 5, bi5: '', bi6: '', bi7: '', bi8: 'bademail', bi9: 'good@email.com', bi10: ''
});

const inputGlassClass = "w-full border border-white/20 rounded-xl px-4 py-2.5 min-h-[3rem] text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#07f468]/50 focus:border-[#07f468] bg-white/5 shadow-sm transition-all";
const labelGlassClass = "block text-sm font-medium text-white mb-1";

const emailErrors = computed(() => {
    const errors = [];
    if (!vals.bi8.includes('@')) errors.push({ error: 'Must contain an @ symbol' });
    if (!vals.bi8.includes('.')) errors.push({ error: 'Must contain a domain root' });
    return errors;
});

const emailSuccess = computed(() => {
    const successes = [];
    if (vals.bi8.includes('@')) successes.push({ message: 'Contains @ symbol' });
    if (vals.bi8.includes('.')) successes.push({ message: 'Contains domain root' });
    return successes;
});

const errorClassBi8 = computed(() => {
    const isError = emailErrors.value.length > 0;
    return isError
      ? "w-full border border-[#ff7c1e] bg-white/5 rounded-xl px-4 py-2.5 min-h-[3rem] text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#ff7c1e]/20 transition-all"
      : inputGlassClass;
});

const codeExamples = {
    defaultText: `<BaseInput 
  v-model="val" 
  placeholder="Enter text..." 
  label="Name"
  labelClass="block text-sm font-medium text-gray-700"
  inputClass="w-full border rounded-md px-3 py-2 text-sm" 
/>`,
    withLabel: `<BaseInput 
  v-model="val" 
  placeholder="john@example.com" 
  label="Email Address"
  labelFor="email-base"
  inputClass="w-full border rounded-md px-3 py-2 text-sm" 
/>`,
    disabled: `<BaseInput 
  v-model="val" 
  placeholder="Disabled input" 
  label="Disabled" 
  :disabled="true"
  inputClass="w-full border bg-gray-100 cursor-not-allowed text-gray-400" 
/>`,
    numberControls: `<BaseInput 
  v-model="val" 
  type="number" 
  label="Quantity" 
  :showControls="true"
  inputClass="w-full border rounded-md px-3 py-2 text-sm" 
/>`,
    charCounter: `<BaseInput 
  v-model="val" 
  placeholder="Max 50 chars..." 
  label="Title" 
  :maxLength="50"
  inputClass="w-full border rounded-md px-3 py-2 text-sm" 
/>`,
    textarea: `<BaseInput 
  v-model="val" 
  type="textarea" 
  label="Description"
  placeholder="Enter description..." 
  :rows="3"
  inputClass="w-full border rounded-md px-3 py-2 resize-none" 
/>`,
    textareaCounter: `<BaseInput 
  v-model="val" 
  type="textarea" 
  label="Bio" 
  placeholder="Your bio..." 
  :rows="3"
  :maxLength="200"
  inputClass="w-full border rounded-md resize-none" 
/>`,
    errorState: `<BaseInput 
  v-model="val" 
  placeholder="Type valid email..." 
  label="Email"
  :inputClass="errorClassBi8" 
  :showErrors="emailErrors.length > 0"
  :errors="emailErrors"
  :onSuccess="emailSuccess.length > 0"
  :success="emailSuccess"
/>`,
    numberNoControls: `<BaseInput 
  v-model="val" 
  type="number" 
  label="Age" 
  :showControls="false"
  :inputClass="inputGlassClass" 
/>`
};
</script>
