<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 font-sans">
        <div class="max-w-6xl mx-auto flex flex-col gap-16">
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="CheckboxSwitch" />
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- 1. Default OFF -->
                    <DemoCard label="Default (Off)">
                        <CheckboxSwitch v-model="vals.cs1" label="Dark mode" id="cs1" version="" />
                    </DemoCard>
                    <!-- 2. Default ON -->
                    <DemoCard label="Default (On)">
                        <CheckboxSwitch v-model="vals.cs2" label="Notifications" id="cs2" version="" />
                    </DemoCard>
                    <!-- 3. With wrapper label -->
                    <DemoCard label="With Wrapper Label">
                        <CheckboxSwitch v-model="vals.cs3" label="Enable feature" id="cs3" version="" showWrapperLabel
                            wrapperLabel="Feature Settings" />
                    </DemoCard>
                    <!-- 4. Custom track color -->
                    <DemoCard label="Custom Track (Green)">
                        <CheckboxSwitch v-model="vals.cs4" label="Active" id="cs4" version=""
                            trackClass="top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full peer-checked:bg-green-500"
                            knobClass="w-3 h-3 left-[0.125rem] rounded-full shadow peer-checked:translate-x-[1rem]" />
                    </DemoCard>
                    <!-- 5. Custom track color Blue -->
                    <DemoCard label="Custom Track (Blue)">
                        <CheckboxSwitch v-model="vals.cs5" label="Sync" id="cs5" version=""
                            trackClass="top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full peer-checked:bg-blue-500"
                            knobClass="w-3 h-3 left-[0.125rem] rounded-full shadow peer-checked:translate-x-[1rem]" />
                    </DemoCard>
                    <!-- 6. Custom track color Red -->
                    <DemoCard label="Custom Track (Red)">
                        <CheckboxSwitch v-model="vals.cs6" label="Alert mode" id="cs6" version=""
                            trackClass="top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full peer-checked:bg-red-500"
                            knobClass="w-3 h-3 left-[0.125rem] rounded-full shadow peer-checked:translate-x-[1rem]" />
                    </DemoCard>
                    <!-- 7. Large size -->
                    <DemoCard label="Large Switch">
                        <CheckboxSwitch v-model="vals.cs7" label="Large toggle" id="cs7" version=""
                            switchWrapperClass="w-12 h-6"
                            trackClass="top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full peer-checked:bg-[#101828]"
                            knobClass="w-5 h-5 left-[0.125rem] rounded-full shadow peer-checked:translate-x-[1.5rem]" />
                    </DemoCard>
                    <!-- 8. Custom label style -->
                    <DemoCard label="Custom Label Style">
                        <CheckboxSwitch v-model="vals.cs8" label="Premium feature" id="cs8" version=""
                            labelClass="text-purple-600 font-semibold text-sm" />
                    </DemoCard>
                    <!-- 9. Multiple switches -->
                    <DemoCard label="Multiple Switches">
                        <div class="flex flex-col gap-3">
                            <CheckboxSwitch v-model="vals.cs9a" label="Email alerts" id="cs9a" version="" />
                            <CheckboxSwitch v-model="vals.cs9b" label="SMS alerts" id="cs9b" version="" />
                            <CheckboxSwitch v-model="vals.cs9c" label="Push alerts" id="cs9c" version="" />
                        </div>
                    </DemoCard>
                    <!-- 10. With bold label -->
                    <DemoCard label="Bold Label">
                        <CheckboxSwitch v-model="vals.cs10" label="Auto-renew subscription" id="cs10" version=""
                            labelClass="text-gray-800 font-bold text-sm" />
                    </DemoCard>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { reactive } from 'vue';
import CheckboxSwitch from '@/components/checkbox/CheckboxSwitch.vue';
import DemoSectionHeader from '@/templates/dev/DemoSectionHeader.vue';
import DemoCard from '@/templates/dev/DemoCard.vue';

const vals = reactive({
    cs1: false, cs2: true, cs3: false, cs4: true, cs5: false, cs6: true, cs7: false, cs8: true,
    cs9a: true, cs9b: false, cs9c: true, cs10: false,
});
</script>
