<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 font-sans">
        <div class="max-w-6xl mx-auto flex flex-col gap-16">
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="CodeInputAuthComponent" />
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-800 p-6 rounded-xl">
                    <!-- 1. Default -->
                    <DemoCard label="Default" dark>
                        <CodeInputAuthComponent v-model="vals.ci1" />
                    </DemoCard>
                    <!-- 2. With label -->
                    <DemoCard label="With Label" dark>
                        <CodeInputAuthComponent v-model="vals.ci2" showLabel labelText="Enter OTP" />
                    </DemoCard>
                    <!-- 3. Required display -->
                    <DemoCard label="Required (*)" dark>
                        <CodeInputAuthComponent v-model="vals.ci3" showLabel labelText="Verification Code"
                            requiredDisplay="*" />
                    </DemoCard>
                    <!-- 4. Disabled -->
                    <DemoCard label="Disabled" dark>
                        <CodeInputAuthComponent v-model="vals.ci4" showLabel labelText="Disabled" :disabled="true" />
                    </DemoCard>
                    <!-- 5. With errors -->
                    <DemoCard label="With Errors" dark>
                        <CodeInputAuthComponent v-model="vals.ci5" showLabel labelText="Enter Code" showErrors
                            :errors="[{ error: 'Invalid OTP code. Please try again.' }]" />
                    </DemoCard>
                    <!-- 6. Submitting state -->
                    <DemoCard label="Submitting State" dark>
                        <CodeInputAuthComponent v-model="vals.ci6" showLabel labelText="Verifying..."
                            :isSubmitting="true" />
                    </DemoCard>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { reactive } from 'vue';
import CodeInputAuthComponent from '@/components/input/CodeInputAuthComponent.vue';
import DemoSectionHeader from '@/templates/dev/DemoSectionHeader.vue';
import DemoCard from '@/templates/dev/DemoCard.vue';

const vals = reactive({
    ci1: '', ci2: '', ci3: '', ci4: '', ci5: '', ci6: ''
});
</script>
