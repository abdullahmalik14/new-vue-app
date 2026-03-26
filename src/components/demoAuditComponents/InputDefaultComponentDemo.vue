<template>
    <div class="min-h-screen bg-gradient-to-br from-[#710A0A] to-[#200000] py-10 px-4 font-sans">
        <div class="max-w-6xl mx-auto flex flex-col gap-16">
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="InputDefaultComponent" class="text-white" />
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 text-white">
                    <!-- 1. Default -->
                    <DemoCard label="Default" dark :code="codeExamples.default">
                        <InputDefaultComponent v-model="vals.id1" placeholder="Enter text..." showLabel
                            labelText="Name" />
                    </DemoCard>
                    <!-- 2. With left icon -->
                    <DemoCard label="With Left Icon" dark :code="codeExamples.leftIcon">
                        <InputDefaultComponent v-model="vals.id2" placeholder="Search..." showLabel labelText="Search"
                            :leftIcon="MagnifyingGlassIcon" />
                    </DemoCard>
                    <!-- 3. With right icon -->
                    <DemoCard label="With Right Icon" dark :code="codeExamples.rightIcon">
                        <InputDefaultComponent v-model="vals.id3" placeholder="Email..." showLabel labelText="Email"
                            :rightIcon="EnvelopeIcon" />
                    </DemoCard>
                    <!-- 4. Dynamic Error state -->
                    <DemoCard label="Array Validations" dark :code="codeExamples.errorState">
                        <InputDefaultComponent v-model="vals.id4" placeholder="Enter valid email" showLabel labelText="Email"
                            :showErrors="emailErrors.length > 0" :errors="emailErrors"
                            :onSuccess="emailSuccess.length > 0" :success="emailSuccess" />
                    </DemoCard>
                    <!-- 5. Required -->
                    <DemoCard label="Required (*)" dark :code="codeExamples.required">
                        <InputDefaultComponent v-model="vals.id5" placeholder="Required" showLabel
                            labelText="Required Field" requiredDisplay="*" 
                            :error="vals.id5.trim() === ''" errorMessage="This field is required." />
                    </DemoCard>
                    <!-- 6. Optional label -->
                    <DemoCard label="Optional Label" dark :code="codeExamples.optionalLabel">
                        <InputDefaultComponent v-model="vals.id6" placeholder="Optional..." showLabel
                            labelText="Nickname" isOptional />
                    </DemoCard>
                    <!-- 7. Textarea -->
                    <DemoCard label="Textarea" dark :code="codeExamples.textarea">
                        <InputDefaultComponent v-model="vals.id7" type="textarea" showLabel labelText="Description" />
                    </DemoCard>
                    <!-- 8. Number type -->
                    <DemoCard label="Number Type" dark :code="codeExamples.numberType">
                        <InputDefaultComponent v-model="vals.id8" type="number" showLabel labelText="Amount"
                            placeholder="0" />
                    </DemoCard>
                    <!-- 9. Left span prefix -->
                    <DemoCard label="Left Span Prefix" dark :code="codeExamples.leftSpan">
                        <InputDefaultComponent v-model="vals.id9" placeholder="0.00" showLabel labelText="Price"
                            leftSpan leftSpanText="$" leftSpanClass="text-white/70 bg-transparent pr-2" />
                    </DemoCard>
                    <!-- 10. With description -->
                    <DemoCard label="With Description" dark :code="codeExamples.withDescription">
                        <InputDefaultComponent v-model="vals.id10" placeholder="username" showLabel labelText="Username"
                            description="Only letters and numbers allowed." />
                    </DemoCard>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { reactive, computed } from 'vue';
import InputDefaultComponent from '@/components/input/InputDefaultComponent.vue';
import DemoSectionHeader from '@/templates/dev/DemoSectionHeader.vue';
import DemoCard from '@/templates/dev/DemoCard.vue';
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
    default: `<InputDefaultComponent 
  v-model="val" 
  placeholder="Enter text..." 
  showLabel 
  labelText="Name" 
/>`,
    leftIcon: `<InputDefaultComponent 
  v-model="val" 
  placeholder="Search..." 
  showLabel 
  labelText="Search"
  :leftIcon="MagnifyingGlassIcon" 
/>`,
    rightIcon: `<InputDefaultComponent 
  v-model="val" 
  placeholder="Email..." 
  showLabel 
  labelText="Email"
  :rightIcon="EnvelopeIcon" 
/>`,
    errorState: `<InputDefaultComponent 
  v-model="val" 
  placeholder="Enter valid email" 
  showLabel 
  labelText="Email"
  :showErrors="emailErrors.length > 0" 
  :errors="emailErrors" 
  :onSuccess="emailSuccess.length > 0"
  :success="emailSuccess"
/>`,
    required: `<InputDefaultComponent 
  v-model="val" 
  placeholder="Required" 
  showLabel
  labelText="Required Field" 
  requiredDisplay="*" 
  :error="val.trim() === ''"
  errorMessage="This field is required."
/>`,
    optionalLabel: `<InputDefaultComponent 
  v-model="val" 
  placeholder="Optional..." 
  showLabel
  labelText="Nickname" 
  isOptional 
/>`,
    textarea: `<InputDefaultComponent 
  v-model="val" 
  type="textarea" 
  showLabel 
  labelText="Description" 
/>`,
    numberType: `<InputDefaultComponent 
  v-model="val" 
  type="number" 
  showLabel 
  labelText="Amount"
  placeholder="0" 
/>`,
    leftSpan: `<InputDefaultComponent 
  v-model="val" 
  placeholder="0.00" 
  showLabel 
  labelText="Price"
  leftSpan 
  leftSpanText="$" 
/>`,
    withDescription: `<InputDefaultComponent 
  v-model="val" 
  placeholder="username" 
  showLabel 
  labelText="Username"
  description="Only letters and numbers allowed." 
/>`
};
</script>
