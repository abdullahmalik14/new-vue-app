<template>
    <div class="min-h-screen bg-gradient-to-br from-[#710A0A] to-[#200000] py-10 px-4 font-sans">
        <div class="max-w-6xl mx-auto flex flex-col gap-16">
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="BaseTextInput" class="text-white" />
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 text-white">
                    <!-- 1. Default -->
                    <div class="flex flex-col gap-4">
                        <h3 class="text-lg font-semibold text-white/90">Default</h3>

                        <BaseTextInput v-model="vals.id1" placeholder="Enter text..." showLabel
                            labelText="Name" />
                        <ShowCodeToggle :code="codeExamples.default" />
                    </div>
                    <!-- 2. With left icon -->
                    <div class="flex flex-col gap-4">
                        <h3 class="text-lg font-semibold text-white/90">With Left Icon</h3>

                        <BaseTextInput v-model="vals.id2" placeholder="Search..." showLabel labelText="Search"
                            :leftIcon="MagnifyingGlassIcon" />
                        <ShowCodeToggle :code="codeExamples.leftIcon" />
                    </div>
                    <!-- 3. With right icon -->
                    <div class="flex flex-col gap-4">
                        <h3 class="text-lg font-semibold text-white/90">With Right Icon</h3>

                        <BaseTextInput v-model="vals.id3" placeholder="Email..." showLabel labelText="Email"
                            :rightIcon="EnvelopeIcon" />
                        <ShowCodeToggle :code="codeExamples.rightIcon" />
                    </div>
                    <!-- 4. Dynamic Error state -->
                    <div class="flex flex-col gap-4">
                        <h3 class="text-lg font-semibold text-white/90">Array Validations</h3>

                        <BaseTextInput v-model="vals.id4" placeholder="Enter valid email" showLabel labelText="Email"
                            :showErrors="emailErrors.length > 0" :errors="emailErrors"
                            :onSuccess="emailSuccess.length > 0" :success="emailSuccess" />
                        <ShowCodeToggle :code="codeExamples.errorState" />
                    </div>
                    <!-- 5. Required -->
                    <div class="flex flex-col gap-4">
                        <h3 class="text-lg font-semibold text-white/90">Required (*)</h3>

                        <BaseTextInput v-model="vals.id5" placeholder="Required" showLabel
                            labelText="Required Field" requiredDisplay="*" 
                            :error="vals.id5.trim() === ''" errorMessage="This field is required." />
                        <ShowCodeToggle :code="codeExamples.required" />
                    </div>
                    <!-- 6. Optional label -->
                    <div class="flex flex-col gap-4">
                        <h3 class="text-lg font-semibold text-white/90">Optional Label</h3>

                        <BaseTextInput v-model="vals.id6" placeholder="Optional..." showLabel
                            labelText="Nickname" isOptional />
                        <ShowCodeToggle :code="codeExamples.optionalLabel" />
                    </div>
                    <!-- 7. Textarea -->
                    <div class="flex flex-col gap-4">
                        <h3 class="text-lg font-semibold text-white/90">Textarea</h3>

                        <BaseTextInput v-model="vals.id7" type="textarea" showLabel labelText="Description" />
                        <ShowCodeToggle :code="codeExamples.textarea" />
                    </div>
                    <!-- 8. Number type -->
                    <div class="flex flex-col gap-4">
                        <h3 class="text-lg font-semibold text-white/90">Number Type</h3>

                        <BaseTextInput v-model="vals.id8" type="number" showLabel labelText="Amount"
                            placeholder="0" />
                        <ShowCodeToggle :code="codeExamples.numberType" />
                    </div>
                    <!-- 9. Left span prefix -->
                    <div class="flex flex-col gap-4">
                        <h3 class="text-lg font-semibold text-white/90">Left Span Prefix</h3>

                        <BaseTextInput v-model="vals.id9" placeholder="0.00" showLabel labelText="Price"
                            leftSpan leftSpanText="$" leftSpanClass="text-white/70 bg-transparent pr-2" />
                        <ShowCodeToggle :code="codeExamples.leftSpan" />
                    </div>
                    <!-- 10. With description -->
                    <div class="flex flex-col gap-4">
                        <h3 class="text-lg font-semibold text-white/90">With Description</h3>

                        <BaseTextInput v-model="vals.id10" placeholder="username" showLabel labelText="Username"
                            description="Only letters and numbers allowed." />
                        <ShowCodeToggle :code="codeExamples.withDescription" />
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { reactive, computed } from 'vue';
import BaseTextInput from '@/components/forms/inputs/BaseTextInput.vue';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';
import { MagnifyingGlassIcon, EnvelopeIcon } from '@heroicons/vue/24/outline';

const vals = reactive({
    id1: '', id2: '', id3: '', id4: 'bademail', id5: '', id6: '', id7: '', id8: 0, id9: '', id10: ''
});

const emailErrors = computed(() => {
    const errors = [];
    if (!vals.id4.includes('@')) errors.push({ error: 'Must contain an @ symbol' });
    if (!vals.id4.includes('.')) errors.push({ error: 'Must contain a domain root' });
    return errors;
});

const emailSuccess = computed(() => {
    const successes = [];
    if (vals.id4.includes('@')) successes.push({ message: 'Contains @ symbol' });
    if (vals.id4.includes('.')) successes.push({ message: 'Contains domain root' });
    return successes;
});

const codeExamples = {
    default: `<BaseTextInput 
  v-model="val" 
  placeholder="Enter text..." 
  showLabel 
  labelText="Name" 
/>`,
    leftIcon: `<BaseTextInput 
  v-model="val" 
  placeholder="Search..." 
  showLabel 
  labelText="Search"
  :leftIcon="MagnifyingGlassIcon" 
/>`,
    rightIcon: `<BaseTextInput 
  v-model="val" 
  placeholder="Email..." 
  showLabel 
  labelText="Email"
  :rightIcon="EnvelopeIcon" 
/>`,
    errorState: `<BaseTextInput 
  v-model="val" 
  placeholder="Enter valid email" 
  showLabel 
  labelText="Email"
  :showErrors="emailErrors.length > 0" 
  :errors="emailErrors" 
  :onSuccess="emailSuccess.length > 0"
  :success="emailSuccess"
/>`,
    required: `<BaseTextInput 
  v-model="val" 
  placeholder="Required" 
  showLabel
  labelText="Required Field" 
  requiredDisplay="*" 
  :error="val.trim() === ''"
  errorMessage="This field is required."
/>`,
    optionalLabel: `<BaseTextInput 
  v-model="val" 
  placeholder="Optional..." 
  showLabel
  labelText="Nickname" 
  isOptional 
/>`,
    textarea: `<BaseTextInput 
  v-model="val" 
  type="textarea" 
  showLabel 
  labelText="Description" 
/>`,
    numberType: `<BaseTextInput 
  v-model="val" 
  type="number" 
  showLabel 
  labelText="Amount"
  placeholder="0" 
/>`,
    leftSpan: `<BaseTextInput 
  v-model="val" 
  placeholder="0.00" 
  showLabel 
  labelText="Price"
  leftSpan 
  leftSpanText="$" 
/>`,
    withDescription: `<BaseTextInput 
  v-model="val" 
  placeholder="username" 
  showLabel 
  labelText="Username"
  description="Only letters and numbers allowed." 
/>`
};
</script>
