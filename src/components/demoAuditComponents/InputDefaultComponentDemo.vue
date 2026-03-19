<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 font-sans">
        <div class="max-w-6xl mx-auto flex flex-col gap-16">
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="InputDefaultComponent" />
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- 1. Default -->
                    <DemoCard label="Default">
                        <InputDefaultComponent v-model="vals.id1" placeholder="Enter text..." showLabel
                            labelText="Name" />
                    </DemoCard>
                    <!-- 2. With left icon -->
                    <DemoCard label="With Left Icon">
                        <InputDefaultComponent v-model="vals.id2" placeholder="Search..." showLabel labelText="Search"
                            :leftIcon="MagnifyingGlassIcon" />
                    </DemoCard>
                    <!-- 3. With right icon -->
                    <DemoCard label="With Right Icon">
                        <InputDefaultComponent v-model="vals.id3" placeholder="Email..." showLabel labelText="Email"
                            :rightIcon="EnvelopeIcon" />
                    </DemoCard>
                    <!-- 4. Error state -->
                    <DemoCard label="Error State">
                        <InputDefaultComponent v-model="vals.id4" placeholder="Enter email" showLabel labelText="Email"
                            :error="true" errorMessage="Invalid email address." />
                    </DemoCard>
                    <!-- 5. Required -->
                    <DemoCard label="Required (*)">
                        <InputDefaultComponent v-model="vals.id5" placeholder="Required" showLabel
                            labelText="Required Field" requiredDisplay="*" />
                    </DemoCard>
                    <!-- 6. Optional label -->
                    <DemoCard label="Optional Label">
                        <InputDefaultComponent v-model="vals.id6" placeholder="Optional..." showLabel
                            labelText="Nickname" isOptional />
                    </DemoCard>
                    <!-- 7. Textarea -->
                    <DemoCard label="Textarea">
                        <InputDefaultComponent v-model="vals.id7" type="textarea" showLabel labelText="Description" />
                    </DemoCard>
                    <!-- 8. Number type -->
                    <DemoCard label="Number Type">
                        <InputDefaultComponent v-model="vals.id8" type="number" showLabel labelText="Amount"
                            placeholder="0" />
                    </DemoCard>
                    <!-- 9. Left span prefix -->
                    <DemoCard label="Left Span Prefix">
                        <InputDefaultComponent v-model="vals.id9" placeholder="0.00" showLabel labelText="Price"
                            leftSpan leftSpanText="$" />
                    </DemoCard>
                    <!-- 10. With description -->
                    <DemoCard label="With Description">
                        <InputDefaultComponent v-model="vals.id10" placeholder="username" showLabel labelText="Username"
                            description="Only letters and numbers allowed." />
                    </DemoCard>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { reactive } from 'vue';
import InputDefaultComponent from '@/components/input/InputDefaultComponent.vue';
import DemoSectionHeader from '@/templates/dev/DemoSectionHeader.vue';
import DemoCard from '@/templates/dev/DemoCard.vue';
import { MagnifyingGlassIcon, EnvelopeIcon } from '@heroicons/vue/24/outline';

const vals = reactive({
    id1: '', id2: '', id3: '', id4: 'bademail', id5: '', id6: '', id7: '', id8: 0, id9: '', id10: ''
});
</script>
