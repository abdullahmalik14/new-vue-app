<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 font-sans">
        <div class="max-w-6xl mx-auto flex flex-col gap-16">
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="CheckboxGroup" />
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- 1. Default -->
                    <DemoCard label="Default">
                        <CheckboxGroup v-model="vals.cg1" label="Subscribe to newsletter" />
                    </DemoCard>
                    <!-- 2. Checked -->
                    <DemoCard label="Checked">
                        <CheckboxGroup v-model="vals.cg2" label="I agree to terms" />
                    </DemoCard>
                    <!-- 3. Disabled -->
                    <DemoCard label="Disabled">
                        <CheckboxGroup v-model="vals.cg3" label="Disabled option" :disabled="true" />
                    </DemoCard>
                    <!-- 4. With meta text -->
                    <DemoCard label="With Meta Text">
                        <CheckboxGroup v-model="vals.cg4" label="Premium feature" metaText="Pro only" />
                    </DemoCard>
                    <!-- 5. With tags -->
                    <DemoCard label="With Tags">
                        <CheckboxGroup v-model="vals.cg5" label="New feature"
                            :tags="[{ text: 'NEW', variant: '#07f468', class: 'text-black' }]" />
                    </DemoCard>
                    <!-- 6. Custom styles -->
                    <DemoCard label="Custom Styles">
                        <CheckboxGroup v-model="vals.cg6" label="Remember me" checkboxClass="accent-purple-600"
                            labelClass="text-purple-700 font-medium" />
                    </DemoCard>
                    <!-- 7. With image -->
                    <DemoCard label="With Mid Image">
                        <CheckboxGroup v-model="vals.cg7" label="Visa"
                            midImg="https://i.ibb.co.com/nMhY8CpS/svgviewer-png-output-22.webp" />
                    </DemoCard>
                    <!-- 8. Multiple items group -->
                    <DemoCard label="Multiple Checkboxes">
                        <div class="flex flex-col gap-2">
                            <CheckboxGroup v-model="vals.cg8a" label="Option A" />
                            <CheckboxGroup v-model="vals.cg8b" label="Option B" />
                            <CheckboxGroup v-model="vals.cg8c" label="Option C" />
                        </div>
                    </DemoCard>
                    <!-- 9. Wrapper class (row layout) -->
                    <DemoCard label="Row Layout">
                        <CheckboxGroup v-model="vals.cg9" label="Enable notifications"
                            wrapperClass="flex items-center justify-between p-3 border border-gray-200 rounded-lg" />
                    </DemoCard>
                    <!-- 10. Two tags -->
                    <DemoCard label="Multiple Tags">
                        <CheckboxGroup v-model="vals.cg10" label="Beta feature"
                            :tags="[{ text: 'BETA', variant: '#3B82F6', class: 'text-white' }, { text: 'FREE', variant: '#07f468', class: 'text-black' }]" />
                    </DemoCard>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { reactive } from 'vue';
import CheckboxGroup from '@/components/checkbox/CheckboxGroup.vue';
import DemoSectionHeader from '@/templates/dev/DemoSectionHeader.vue';
import DemoCard from '@/templates/dev/DemoCard.vue';

const vals = reactive({
    cg1: false, cg2: true, cg3: false, cg4: true, cg5: false, cg6: false, cg7: true,
    cg8a: true, cg8b: false, cg8c: true, cg9: false, cg10: false,
});
</script>
