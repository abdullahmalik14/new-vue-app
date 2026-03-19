<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 font-sans">
        <div class="max-w-6xl mx-auto flex flex-col gap-16">
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="InputComponentDashboard" />
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- 1. Default -->
                    <DemoCard label="Default">
                        <InputComponentDashboard v-model="vals.icd1" placeholder="Enter text..." showLabel
                            labelText="Username" />
                    </DemoCard>
                    <!-- 2. With left icon -->
                    <DemoCard label="With Left Icon">
                        <InputComponentDashboard v-model="vals.icd2" placeholder="Search..." showLabel
                            labelText="Search" :leftIcon="MagnifyingGlassIcon" />
                    </DemoCard>
                    <!-- 3. With right icon -->
                    <DemoCard label="With Right Icon">
                        <InputComponentDashboard v-model="vals.icd3" placeholder="Email..." showLabel labelText="Email"
                            :rightIcon="EnvelopeIcon" />
                    </DemoCard>
                    <!-- 4. Required (*) -->
                    <DemoCard label="Required (*)">
                        <InputComponentDashboard v-model="vals.icd4" placeholder="Required field" showLabel
                            labelText="Full Name" requiredDisplay="*" />
                    </DemoCard>
                    <!-- 5. Required italic text -->
                    <DemoCard label="Required (italic-text)">
                        <InputComponentDashboard v-model="vals.icd5" placeholder="Enter..." showLabel labelText="Email"
                            requiredDisplay="italic-text" requiredDisplayText="Required" />
                    </DemoCard>
                    <!-- 6. With description -->
                    <DemoCard label="With Description">
                        <InputComponentDashboard v-model="vals.icd6" placeholder="your@email.com" showLabel
                            labelText="Email" description="We'll never share your email." />
                    </DemoCard>
                    <!-- 7. With errors -->
                    <DemoCard label="With Errors">
                        <InputComponentDashboard v-model="vals.icd7" placeholder="Enter..." showLabel
                            labelText="Password" showErrors
                            :errors="[{ error: 'Must be at least 8 characters' }, { error: 'Must contain a number' }]" />
                    </DemoCard>
                    <!-- 8. With success -->
                    <DemoCard label="With Success">
                        <InputComponentDashboard v-model="vals.icd8" placeholder="Enter..." showLabel
                            labelText="Username" onSuccess :success="[{ message: 'Username is available!' }]" />
                    </DemoCard>
                    <!-- 9. Left span (prefix) -->
                    <DemoCard label="Left Span (Prefix)">
                        <InputComponentDashboard v-model="vals.icd9" placeholder="amount" showLabel labelText="Price"
                            leftSpan leftSpanText="USD" leftSpanClass="text-gray-500" />
                    </DemoCard>
                    <!-- 10. Right span (suffix) -->
                    <DemoCard label="Right Span (Suffix)">
                        <InputComponentDashboard v-model="vals.icd10" placeholder="0.00" showLabel labelText="Weight"
                            rightSpan rightSpanText="kg" rightSpanClass="text-gray-500" />
                    </DemoCard>
                    <!-- 11. Textarea -->
                    <DemoCard label="Textarea">
                        <InputComponentDashboard v-model="vals.icd11" type="textarea" showLabel labelText="Bio"
                            placeholder="Write something..." />
                    </DemoCard>
                    <!-- 12. Required error text -->
                    <DemoCard label="Required Error Text">
                        <InputComponentDashboard v-model="vals.icd12" placeholder="Enter..." showLabel labelText="Phone"
                            requiredDisplay="required-text-error" />
                    </DemoCard>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { reactive } from 'vue';
import InputComponentDashboard from '@/components/input/InputComponentDashboard.vue';
import DemoSectionHeader from '@/templates/dev/DemoSectionHeader.vue';
import DemoCard from '@/templates/dev/DemoCard.vue';
import { MagnifyingGlassIcon, EnvelopeIcon } from '@heroicons/vue/24/outline';

const vals = reactive({
    icd1: '', icd2: '', icd3: '', icd4: '', icd5: '', icd6: '',
    icd7: '', icd8: '', icd9: '', icd10: '', icd11: '', icd12: ''
});
</script>
