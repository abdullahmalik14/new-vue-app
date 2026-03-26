<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 font-sans">
        <div class="max-w-6xl mx-auto flex flex-col gap-16">
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="CheckboxSwitch" />
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- 1. Default OFF -->
                    <DemoCard label="Default (Off)" :code="codeExamples.defaultOff">
                        <CheckboxSwitch v-model="vals.cs1" label="Dark mode" id="cs1" />
                        <p class="text-xs text-gray-400 mt-2">Active: {{ vals.cs1 }}</p>
                    </DemoCard>
                    <!-- 2. Default ON -->
                    <DemoCard label="Default (On)" :code="codeExamples.defaultOn">
                        <CheckboxSwitch v-model="vals.cs2" label="Notifications" id="cs2" />
                        <p class="text-xs text-gray-400 mt-2">Active: {{ vals.cs2 }}</p>
                    </DemoCard>
                    <!-- 3. With wrapper label -->
                    <DemoCard label="With Wrapper Label" :code="codeExamples.wrapperLabel">
                        <CheckboxSwitch v-model="vals.cs3" label="Enable feature" id="cs3" showWrapperLabel
                            wrapperLabel="Feature Settings" />
                        <p class="text-xs text-gray-400 mt-2">Active: {{ vals.cs3 }}</p>
                    </DemoCard>
                    <!-- 4. Custom track color -->
                    <DemoCard label="Custom Track (Green)" :code="codeExamples.customTrackGreen">
                        <CheckboxSwitch v-model="vals.cs4" label="Active" id="cs4"
                            trackClass="top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors"
                            knobClass="w-3 h-3 left-[0.125rem] rounded-full shadow peer-checked:translate-x-[1rem] transition-transform" />
                        <p class="text-xs text-gray-400 mt-2">Active: {{ vals.cs4 }}</p>
                    </DemoCard>
                    <!-- 5. Custom track color Blue -->
                    <DemoCard label="Custom Track (Blue)" :code="codeExamples.customTrackBlue">
                        <CheckboxSwitch v-model="vals.cs5" label="Sync" id="cs5"
                            trackClass="top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition-colors"
                            knobClass="w-3 h-3 left-[0.125rem] rounded-full shadow peer-checked:translate-x-[1rem] transition-transform" />
                        <p class="text-xs text-gray-400 mt-2">Active: {{ vals.cs5 }}</p>
                    </DemoCard>
                    <!-- 6. Custom track color Red -->
                    <DemoCard label="Custom Track (Red)" :code="codeExamples.customTrackRed">
                        <CheckboxSwitch v-model="vals.cs6" label="Alert mode" id="cs6"
                            trackClass="top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full peer-checked:bg-red-500 transition-colors"
                            knobClass="w-3 h-3 left-[0.125rem] rounded-full shadow peer-checked:translate-x-[1rem] transition-transform" />
                        <p class="text-xs text-gray-400 mt-2">Active: {{ vals.cs6 }}</p>
                    </DemoCard>
                    <!-- 7. Large size -->
                    <DemoCard label="Large Switch" :code="codeExamples.largeSwitch">
                        <CheckboxSwitch v-model="vals.cs7" label="Large toggle" id="cs7"
                            switchWrapperClass="w-12 h-6"
                            trackClass="top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full peer-checked:bg-[#101828] transition-colors"
                            knobClass="w-5 h-5 left-[0.125rem] rounded-full shadow peer-checked:translate-x-[1.5rem] transition-transform" />
                        <p class="text-xs text-gray-400 mt-2">Active: {{ vals.cs7 }}</p>
                    </DemoCard>
                    <!-- 8. Custom label style -->
                    <DemoCard label="Custom Label Style" :code="codeExamples.customLabelStyle">
                        <CheckboxSwitch v-model="vals.cs8" label="Premium feature" id="cs8"
                            labelClass="text-purple-600 font-semibold text-sm" />
                        <p class="text-xs text-gray-400 mt-2">Active: {{ vals.cs8 }}</p>
                    </DemoCard>
                    <!-- 9. Multiple switches -->
                    <DemoCard label="Multiple Switches" :code="codeExamples.multiple">
                        <div class="flex flex-col gap-3">
                            <CheckboxSwitch v-model="vals.cs9a" label="Email alerts" id="cs9a" />
                            <CheckboxSwitch v-model="vals.cs9b" label="SMS alerts" id="cs9b" />
                            <CheckboxSwitch v-model="vals.cs9c" label="Push alerts" id="cs9c" />
                        </div>
                        <p class="text-xs text-gray-400 mt-2">Email: {{ vals.cs9a }} | SMS: {{ vals.cs9b }} | Push: {{ vals.cs9c }}</p>
                    </DemoCard>
                    <!-- 10. With bold label -->
                    <DemoCard label="Bold Label" :code="codeExamples.boldLabel">
                        <CheckboxSwitch v-model="vals.cs10" label="Auto-renew subscription" id="cs10"
                            labelClass="text-gray-800 dark:text-gray-200 font-bold text-sm" />
                        <p class="text-xs text-gray-400 mt-2">Active: {{ vals.cs10 }}</p>
                    </DemoCard>
                    <!-- 11. Expandable Section Logic -->
                    <DemoCard label="Expandable Section Logic" :code="codeExamples.expandable">
                        <CheckboxSwitch v-model="vals.cs11" label="Show advanced settings" id="cs11" />
                        <div v-show="vals.cs11" class="mt-4 p-4 bg-gray-700 rounded-lg text-sm text-gray-300">
                            <strong>Advanced Options</strong>
                            <p class="mt-1">This panel dynamically expands only when the switch above is toggled ON, simulating conditional UI logic.</p>
                        </div>
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
    cs9a: true, cs9b: false, cs9c: true, cs10: false, cs11: false
});

const codeExamples = {
    defaultOff: `<CheckboxSwitch 
  v-model="val" 
  label="Dark mode" 
  id="cs1" 
/>`,
    defaultOn: `<CheckboxSwitch 
  v-model="val" 
  label="Notifications" 
  id="cs2" 
/>`,
    wrapperLabel: `<CheckboxSwitch 
  v-model="val" 
  label="Enable feature" 
  id="cs3" 
  showWrapperLabel
  wrapperLabel="Feature Settings" 
/>`,
    customTrackGreen: `<CheckboxSwitch 
  v-model="val" 
  label="Active" 
  id="cs4"
  trackClass="... bg-gray-300 peer-checked:bg-green-500"
  knobClass="... peer-checked:translate-x-[1rem]" 
/>`,
    customTrackBlue: `<CheckboxSwitch 
  v-model="val" 
  label="Sync" 
  id="cs5"
  trackClass="... peer-checked:bg-blue-500"
  knobClass="... peer-checked:translate-x-[1rem]" 
/>`,
    customTrackRed: `<CheckboxSwitch 
  v-model="val" 
  label="Alert mode" 
  id="cs6"
  trackClass="... peer-checked:bg-red-500"
  knobClass="... peer-checked:translate-x-[1rem]" 
/>`,
    largeSwitch: `<CheckboxSwitch 
  v-model="val" 
  label="Large toggle" 
  id="cs7"
  switchWrapperClass="w-12 h-6"
  trackClass="... peer-checked:bg-[#101828]"
  knobClass="w-5 h-5 ... peer-checked:translate-x-[1.5rem]" 
/>`,
    customLabelStyle: `<CheckboxSwitch 
  v-model="val" 
  label="Premium feature" 
  id="cs8"
  labelClass="text-purple-600 font-semibold text-sm" 
/>`,
    multiple: `<div class="flex flex-col gap-3">
  <CheckboxSwitch v-model="valA" label="Email alerts" id="cs9a" />
  <CheckboxSwitch v-model="valB" label="SMS alerts" id="cs9b" />
  <CheckboxSwitch v-model="valC" label="Push alerts" id="cs9c" />
</div>`,
    boldLabel: `<CheckboxSwitch 
  v-model="val" 
  label="Auto-renew subscription" 
  id="cs10"
  labelClass="text-gray-800 font-bold text-sm" 
/>`,
    expandable: `<CheckboxSwitch 
  v-model="showAdvanced" 
  label="Show advanced settings" 
/>
<div v-show="showAdvanced" class="mt-4 p-4 bg-gray-700 rounded-lg">
  <strong>Advanced Options</strong>
  <p>This panel dynamically expands only when the switch above is toggled ON.</p>
</div>`
};
</script>
