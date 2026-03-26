<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 font-sans">
        <div class="max-w-6xl mx-auto flex flex-col gap-16">
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="CheckboxGroup" />
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- 1. Default -->
                    <DemoCard label="Default" :code="codeExamples.default">
                        <CheckboxGroup v-model="vals.cg1" label="Subscribe to newsletter" />
                        <p class="text-xs text-gray-400 mt-2">Value: {{ vals.cg1 }}</p>
                    </DemoCard>
                    <!-- 2. Checked -->
                    <DemoCard label="Checked" :code="codeExamples.checked">
                        <CheckboxGroup v-model="vals.cg2" label="I agree to terms" />
                        <p class="text-xs text-gray-400 mt-2">Value: {{ vals.cg2 }}</p>
                    </DemoCard>
                    <!-- 3. Disabled -->
                    <DemoCard label="Disabled" :code="codeExamples.disabled">
                        <CheckboxGroup v-model="vals.cg3" label="Disabled option" :disabled="true" />
                        <p class="text-xs text-gray-400 mt-2">Value: {{ vals.cg3 }}</p>
                    </DemoCard>
                    <!-- 4. With meta text -->
                    <DemoCard label="With Meta Text" :code="codeExamples.metaText">
                        <CheckboxGroup v-model="vals.cg4" label="Premium feature" metaText="Pro only" />
                        <p class="text-xs text-gray-400 mt-2">Value: {{ vals.cg4 }}</p>
                    </DemoCard>
                    <!-- 5. With tags -->
                    <DemoCard label="With Tags" :code="codeExamples.withTags">
                        <CheckboxGroup v-model="vals.cg5" label="New feature"
                            :tags="[{ text: 'NEW', variant: '#07f468', class: 'text-black' }]" />
                        <p class="text-xs text-gray-400 mt-2">Value: {{ vals.cg5 }}</p>
                    </DemoCard>
                    <!-- 6. Custom styles -->
                    <DemoCard label="Custom Styles" :code="codeExamples.customStyles">
                        <CheckboxGroup v-model="vals.cg6" label="Remember me" checkboxClass="accent-purple-600 focus:ring-purple-500"
                            labelClass="text-purple-700 font-medium" />
                        <p class="text-xs text-gray-400 mt-2">Value: {{ vals.cg6 }}</p>
                    </DemoCard>
                    <!-- 7. With image -->
                    <DemoCard label="With Mid Image" :code="codeExamples.withMidImg">
                        <CheckboxGroup v-model="vals.cg7" label="Visa"
                            midImg="https://i.ibb.co.com/nMhY8CpS/svgviewer-png-output-22.webp" />
                        <p class="text-xs text-gray-400 mt-2">Value: {{ vals.cg7 }}</p>
                    </DemoCard>
                    <!-- 8. Multiple items group -->
                    <DemoCard label="Multiple Checkboxes" :code="codeExamples.multiple">
                        <div class="flex flex-col gap-2">
                            <CheckboxGroup v-model="vals.cg8a" label="Option A" />
                            <CheckboxGroup v-model="vals.cg8b" label="Option B" />
                            <CheckboxGroup v-model="vals.cg8c" label="Option C" />
                        </div>
                        <p class="text-xs text-gray-400 mt-2">A: {{ vals.cg8a }} | B: {{ vals.cg8b }} | C: {{ vals.cg8c }}</p>
                    </DemoCard>
                    <!-- 9. Wrapper class (row layout) -->
                    <DemoCard label="Row Layout" :code="codeExamples.rowLayout">
                        <CheckboxGroup v-model="vals.cg9" label="Enable notifications"
                            wrapperClass="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg" />
                        <p class="text-xs text-gray-400 mt-2">Value: {{ vals.cg9 }}</p>
                    </DemoCard>
                    <!-- 10. Two tags -->
                    <DemoCard label="Multiple Tags" :code="codeExamples.twoTags">
                        <CheckboxGroup v-model="vals.cg10" label="Beta feature"
                            :tags="[{ text: 'BETA', variant: '#3B82F6', class: 'text-white' }, { text: 'FREE', variant: '#07f468', class: 'text-black' }]" />
                        <p class="text-xs text-gray-400 mt-2">Value: {{ vals.cg10 }}</p>
                    </DemoCard>
                    <!-- 11. Conditional UI Logic -->
                    <DemoCard label="Conditional UI Logic" :code="codeExamples.expandable">
                        <CheckboxGroup v-model="vals.cg11" label="I have a referral code" />
                        <div v-show="vals.cg11" class="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-lg flex flex-col gap-2 transition-all">
                            <label class="text-xs text-gray-400">Enter Referral Code</label>
                            <input type="text" class="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white outline-none focus:border-[#07f468]" placeholder="e.g. FRIEND50" />
                        </div>
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
    cg8a: true, cg8b: false, cg8c: true, cg9: false, cg10: false, cg11: false
});

const codeExamples = {
    default: `<CheckboxGroup 
  v-model="val" 
  label="Subscribe to newsletter" 
/>`,
    checked: `<CheckboxGroup 
  v-model="val" 
  label="I agree to terms" 
/>`,
    disabled: `<CheckboxGroup 
  v-model="val" 
  label="Disabled option" 
  :disabled="true" 
/>`,
    metaText: `<CheckboxGroup 
  v-model="val" 
  label="Premium feature" 
  metaText="Pro only" 
/>`,
    withTags: `<CheckboxGroup 
  v-model="val" 
  label="New feature"
  :tags="[{ text: 'NEW', variant: '#07f468', class: 'text-black' }]" 
/>`,
    customStyles: `<CheckboxGroup 
  v-model="val" 
  label="Remember me" 
  checkboxClass="accent-purple-600 focus:ring-purple-500"
  labelClass="text-purple-700 font-medium" 
/>`,
    withMidImg: `<CheckboxGroup 
  v-model="val" 
  label="Visa"
  midImg="https://i.ibb.co.com/nMhY8CpS/svgviewer-png-output-22.webp" 
/>`,
    multiple: `<div class="flex flex-col gap-2">
  <CheckboxGroup v-model="val1" label="Option A" />
  <CheckboxGroup v-model="val2" label="Option B" />
  <CheckboxGroup v-model="val3" label="Option C" />
</div>`,
    rowLayout: `<CheckboxGroup 
  v-model="val" 
  label="Enable notifications"
  wrapperClass="flex items-center justify-between p-3 border rounded-lg" 
/>`,
    twoTags: `<CheckboxGroup 
  v-model="val" 
  label="Beta feature"
  :tags="[
    { text: 'BETA', variant: '#3B82F6', class: 'text-white' }, 
    { text: 'FREE', variant: '#07f468', class: 'text-black' }
  ]" 
/>`,
    expandable: `<CheckboxGroup 
  v-model="hasReferral" 
  label="I have a referral code" 
/>
<div v-show="hasReferral" class="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
  <input type="text" placeholder="Enter code..." class="..." />
</div>`
};
</script>
