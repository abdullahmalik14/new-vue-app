<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 font-sans">
        <div class="max-w-6xl mx-auto flex flex-col gap-16">
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="BaseInput" />
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- 1. Default text -->
                    <DemoCard label="Default Text">
                        <BaseInput v-model="vals.bi1" placeholder="Enter text..." label="Name"
                            labelClass="block text-sm font-medium text-gray-700"
                            inputClass="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </DemoCard>
                    <!-- 2. With label -->
                    <DemoCard label="With Label">
                        <BaseInput v-model="vals.bi2" placeholder="john@example.com" label="Email Address"
                            labelFor="email-base"
                            inputClass="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </DemoCard>
                    <!-- 3. Disabled -->
                    <DemoCard label="Disabled">
                        <BaseInput v-model="vals.bi3" placeholder="Disabled input" label="Disabled" :disabled="true"
                            inputClass="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-400 cursor-not-allowed" />
                    </DemoCard>
                    <!-- 4. Number with controls -->
                    <DemoCard label="Number with Controls">
                        <BaseInput v-model="vals.bi4" type="number" label="Quantity" :showControls="true"
                            inputClass="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none" />
                    </DemoCard>
                    <!-- 5. With max length counter -->
                    <DemoCard label="With Character Counter">
                        <BaseInput v-model="vals.bi5" placeholder="Max 50 chars..." label="Title" :maxLength="50"
                            inputClass="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none" />
                    </DemoCard>
                    <!-- 6. Textarea mode -->
                    <DemoCard label="Textarea Mode">
                        <BaseInput v-model="vals.bi6" type="textarea" label="Description"
                            placeholder="Enter description..." :rows="3"
                            inputClass="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none resize-none" />
                    </DemoCard>
                    <!-- 7. Textarea with max length -->
                    <DemoCard label="Textarea + Counter">
                        <BaseInput v-model="vals.bi7" type="textarea" label="Bio" placeholder="Your bio..." :rows="3"
                            :maxLength="200"
                            inputClass="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none resize-none" />
                    </DemoCard>
                    <!-- 8. Error style -->
                    <DemoCard label="Error State">
                        <BaseInput v-model="vals.bi8" placeholder="Wrong value" label="Email"
                            inputClass="w-full border border-red-400 bg-red-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                    </DemoCard>
                    <!-- 9. Success style -->
                    <DemoCard label="Success State">
                        <BaseInput v-model="vals.bi9" placeholder="valid@email.com" label="Email"
                            inputClass="w-full border border-green-400 bg-green-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                    </DemoCard>
                    <!-- 10. Number no controls -->
                    <DemoCard label="Number (No Controls)">
                        <BaseInput v-model="vals.bi10" type="number" label="Age" :showControls="false"
                            inputClass="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none" />
                    </DemoCard>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { reactive } from 'vue';
import BaseInput from '@/components/input/BaseInput.vue';
import DemoSectionHeader from '@/templates/dev/DemoSectionHeader.vue';
import DemoCard from '@/templates/dev/DemoCard.vue';

const vals = reactive({
    bi1: '', bi2: '', bi3: 'Readonly Text', bi4: 5, bi5: '', bi6: '', bi7: '', bi8: 'bad@', bi9: 'good@email.com', bi10: ''
});
</script>
