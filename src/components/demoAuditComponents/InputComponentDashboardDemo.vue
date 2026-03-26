<template>
    <div class="min-h-screen bg-gradient-to-br from-[#710A0A] to-[#200000] py-10 px-4 font-sans">
        <div class="max-w-6xl mx-auto flex flex-col gap-16">
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="InputComponentDashboard" class="text-white" />
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 text-white">
                    <!-- 1. Default -->
                    <DemoCard label="Default" dark :code="codeExamples.default">
                        <InputComponentDashboard v-model="vals.icd1" placeholder="Enter text..." showLabel
                            labelText="Username" />
                    </DemoCard>
                    <!-- 2. With left icon -->
                    <DemoCard label="With Left Icon" dark :code="codeExamples.leftIcon">
                        <InputComponentDashboard v-model="vals.icd2" placeholder="Search..." showLabel
                            labelText="Search" :leftIcon="MagnifyingGlassIcon" />
                    </DemoCard>
                    <!-- 3. With right icon -->
                    <DemoCard label="With Right Icon" dark :code="codeExamples.rightIcon">
                        <InputComponentDashboard v-model="vals.icd3" placeholder="Email..." showLabel labelText="Email"
                            :rightIcon="EnvelopeIcon" />
                    </DemoCard>
                    <!-- 4. Required (*) -->
                    <DemoCard label="Required (*)" dark :code="codeExamples.requiredAsterisk">
                        <InputComponentDashboard v-model="vals.icd4" placeholder="Required field" showLabel
                            labelText="Full Name" requiredDisplay="*" />
                    </DemoCard>
                    <!-- 5. Required italic text -->
                    <DemoCard label="Required (italic-text)" dark :code="codeExamples.requiredItalic">
                        <InputComponentDashboard v-model="vals.icd5" placeholder="Enter..." showLabel labelText="Email"
                            requiredDisplay="italic-text" requiredDisplayText="Required" />
                    </DemoCard>
                    <!-- 6. With description -->
                    <DemoCard label="With Description" dark :code="codeExamples.withDesc">
                        <InputComponentDashboard v-model="vals.icd6" placeholder="your@email.com" showLabel
                            labelText="Email" description="We'll never share your email." />
                    </DemoCard>
                    <!-- 7. Dynamic Errors -->
                    <DemoCard label="Dynamic Errors" dark :code="codeExamples.dynamicErrors">
                        <InputComponentDashboard v-model="vals.icd7" placeholder="Enter strong password..." showLabel
                            labelText="Password" 
                            :type="showDynamicPassword ? 'text' : 'password'"
                            :rightIcon="showDynamicPassword ? EyeSlashIcon : EyeIcon"
                            clickableRightIcon
                            @rightIconClick="showDynamicPassword = !showDynamicPassword"
                            :showErrors="passwordErrors.length > 0" :errors="passwordErrors"
                            :onSuccess="passwordSuccess.length > 0" :success="passwordSuccess" />
                    </DemoCard>
                    <!-- 8. Username Availability -->
                    <DemoCard label="Username Availability" dark :code="codeExamples.dynamicSuccess">
                        <InputComponentDashboard v-model="vals.icd8" placeholder="Type jane_doe or admin..." showLabel
                            labelText="Username" 
                            :onSuccess="usernameSuccess.length > 0" :success="usernameSuccess"
                            :showErrors="usernameErrors.length > 0" :errors="usernameErrors" />
                    </DemoCard>
                    <!-- 9. Left span (prefix) -->
                    <DemoCard label="Left Span (Prefix)" dark :code="codeExamples.leftSpan">
                        <InputComponentDashboard v-model="vals.icd9" placeholder="amount" showLabel labelText="Price"
                            leftSpan leftSpanText="USD" leftSpanClass="text-white/70 bg-transparent pr-2" />
                    </DemoCard>
                    <!-- 10. Right span (suffix) -->
                    <DemoCard label="Right Span (Suffix)" dark :code="codeExamples.rightSpan">
                        <InputComponentDashboard v-model="vals.icd10" placeholder="0.00" showLabel labelText="Weight"
                            rightSpan rightSpanText="kg" rightSpanClass="text-white/70 bg-transparent pl-2" />
                    </DemoCard>
                    <!-- 11. Textarea -->
                    <DemoCard label="Textarea" dark :code="codeExamples.textarea">
                        <InputComponentDashboard v-model="vals.icd11" type="textarea" showLabel labelText="Bio"
                            placeholder="Write something..." />
                    </DemoCard>
                    <!-- 12. Required error text -->
                    <DemoCard label="Phone Validation logic" dark :code="codeExamples.requiredErrorText">
                        <InputComponentDashboard v-model="vals.icd12" placeholder="Enter..." showLabel labelText="Phone"
                            :showErrors="phoneErrors.length > 0" :errors="phoneErrors"
                            :onSuccess="phoneSuccess.length > 0" :success="phoneSuccess" />
                    </DemoCard>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue';
import InputComponentDashboard from '@/components/input/InputComponentDashboard.vue';
import DemoSectionHeader from '@/templates/dev/DemoSectionHeader.vue';
import DemoCard from '@/templates/dev/DemoCard.vue';
import { MagnifyingGlassIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline';

const showDynamicPassword = ref(false);

const vals = reactive({
    icd1: '', icd2: '', icd3: '', icd4: '', icd5: '', icd6: '',
    icd7: 'short', icd8: 'jane_doe', icd9: '', icd10: '', icd11: '', icd12: ''
});

const passwordErrors = computed(() => {
    const errors = [];
    if (vals.icd7.length < 8) errors.push({ error: 'At least 8 characters long' });
    if (!/[A-Z]/.test(vals.icd7)) errors.push({ error: 'Contain at least 1 uppercase letter' });
    if (!/[a-z]/.test(vals.icd7)) errors.push({ error: 'Contain at least 1 lowercase letter' });
    if (!/\d/.test(vals.icd7)) errors.push({ error: 'Contain at least 1 number' });
    return errors;
});

const passwordSuccess = computed(() => {
    const successes = [];
    if (vals.icd7.length >= 8) successes.push({ message: 'At least 8 characters long' });
    if (/[A-Z]/.test(vals.icd7)) successes.push({ message: 'Contain at least 1 uppercase letter' });
    if (/[a-z]/.test(vals.icd7)) successes.push({ message: 'Contain at least 1 lowercase letter' });
    if (/\d/.test(vals.icd7)) successes.push({ message: 'Contain at least 1 number' });
    return successes;
});

const usernameSuccess = computed(() => {
    return vals.icd8.length >= 4 && vals.icd8.toLowerCase() !== 'admin' ? [{ message: 'Username is available!' }] : [];
});

const usernameErrors = computed(() => {
    if (vals.icd8.trim().length === 0) {
        return [{ error: 'Username is required' }];
    }
    if (vals.icd8.toLowerCase() === 'admin') {
        return [{ error: 'Username is taken' }];
    }
    return [];
});

const phoneErrors = computed(() => {
    if (vals.icd12.trim().length === 0) {
        return [{ error: 'This field is required.' }];
    }
    const isNum = /^[0-9+\-\s()]+$/.test(vals.icd12);
    if (!isNum) {
        return [{ error: 'Must be a valid phone number.' }];
    }
    return [];
});

const phoneSuccess = computed(() => {
    if (vals.icd12.trim().length > 0 && phoneErrors.value.length === 0) {
        return [{ message: 'Valid phone number!' }];
    }
    return [];
});

const codeExamples = {
    default: `<InputComponentDashboard 
  v-model="val" 
  placeholder="Enter text..." 
  showLabel
  labelText="Username" 
/>`,
    leftIcon: `<InputComponentDashboard 
  v-model="val" 
  placeholder="Search..." 
  showLabel
  labelText="Search" 
  :leftIcon="MagnifyingGlassIcon" 
/>`,
    rightIcon: `<InputComponentDashboard 
  v-model="val" 
  placeholder="Email..." 
  showLabel 
  labelText="Email"
  :rightIcon="EnvelopeIcon" 
/>`,
    requiredAsterisk: `<InputComponentDashboard 
  v-model="val" 
  placeholder="Required field" 
  showLabel
  labelText="Full Name" 
  requiredDisplay="*" 
/>`,
    requiredItalic: `<InputComponentDashboard 
  v-model="val" 
  placeholder="Enter..." 
  showLabel 
  labelText="Email"
  requiredDisplay="italic-text" 
  requiredDisplayText="Required" 
/>`,
    withDesc: `<InputComponentDashboard 
  v-model="val" 
  placeholder="your@email.com" 
  showLabel
  labelText="Email" 
  description="We'll never share your email." 
/>`,
    dynamicErrors: `<InputComponentDashboard 
  v-model="val" 
  placeholder="Enter strong password..." 
  showLabel
  labelText="Password" 
  :type="showPassword ? 'text' : 'password'"
  :rightIcon="showPassword ? EyeSlashIcon : EyeIcon"
  clickableRightIcon
  @rightIconClick="showPassword = !showPassword"
  :showErrors="passwordErrors.length > 0"
  :errors="passwordErrors" 
  :onSuccess="passwordSuccess.length > 0"
  :success="passwordSuccess"
/>`,
    dynamicSuccess: `<InputComponentDashboard 
  v-model="val" 
  placeholder="Type jane_doe or admin..." 
  showLabel
  labelText="Username" 
  :onSuccess="usernameSuccess.length > 0" 
  :success="usernameSuccess" 
  :showErrors="usernameErrors.length > 0"
  :errors="usernameErrors"
/>`,
    leftSpan: `<InputComponentDashboard 
  v-model="val" 
  placeholder="amount" 
  showLabel 
  labelText="Price"
  leftSpan 
  leftSpanText="USD" 
  leftSpanClass="text-white/70 bg-transparent pr-2" 
/>`,
    rightSpan: `<InputComponentDashboard 
  v-model="val" 
  placeholder="0.00" 
  showLabel 
  labelText="Weight"
  rightSpan 
  rightSpanText="kg" 
  rightSpanClass="text-white/70 bg-transparent pl-2" 
/>`,
    textarea: `<InputComponentDashboard 
  v-model="val" 
  type="textarea" 
  showLabel 
  labelText="Bio"
  placeholder="Write something..." 
/>`,
    requiredErrorText: `<InputComponentDashboard 
  v-model="val" 
  placeholder="Enter..." 
  showLabel 
  labelText="Phone"
  :showErrors="phoneErrors.length > 0"
  :errors="phoneErrors"
  :onSuccess="phoneSuccess.length > 0"
  :success="phoneSuccess"
/>`
};
</script>
