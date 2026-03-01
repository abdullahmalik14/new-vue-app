<script setup>
import { ref } from 'vue';
import VueDatePicker from '@/components/datePicker/VueDatePicker.vue'; // Adjust path if needed

// --- State Variables for Examples ---

const dateSimple = ref(null);
const dateRange = ref({ start: null, end: null });
const dateThemed = ref(null);
const dateBlocked = ref(null);
const dateTime = ref(null);
const dateSync = ref(null);

// Advanced Styling Refs
const advHeader = ref(null);
const advCompact = ref(null);
const advGreen = ref(null);
const advTransparent = ref(null);
const advSquare = ref(null);

// Time Picker Refs
const timeRange = ref({ start: null, end: null });
const timeFormat = ref(null);
const timeBlocked = ref(null);

// Edge Case Refs
const edgeMaxRange = ref({ start: null, end: null });
const edgeMinDate = ref(null);
const edgeMaxDate = ref(null);
const edgeStartWeek = ref(null);
const edgeDebug = ref(null);

// Client Variations Refs
const varError = ref(null);
const varMono = ref(null);
const varTrip = ref({ start: null, end: null });
const varHistory = ref(null);
const varGlass = ref(null);
const varAppt = ref(null);

// Extra variations (from DemoPage)
const todayBg = ref(null);          // Background today style
const futureOnly = ref(null);       // Min = tomorrow
const rangeBlocked = ref({ start: null, end: null }); // Range + blocked specific dates


// Formatter for debugging events
const lastEvent = ref('');

function onDateSelected(val) {
    lastEvent.value = `Single Select: ${val}`;
}

function onRangeSelected(val) {
    lastEvent.value = `Range Select: ${JSON.stringify(val)}`;
}

</script>

<template>
    <div class="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
        <div class="max-w-7xl mx-auto space-y-12">

            <!-- Header -->
            <div class="text-center">
                <h1 class="text-4xl font-extrabold text-indigo-900 mb-2">Vue DatePicker Showcase</h1>
                <p class="text-gray-500">Demonstrating the monolithic, potentially-styled DatePicker component.</p>
            </div>

            <!-- Grid Layout -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">

                <!-- Example 1: Basic Single Date -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                        <span class="w-2 h-6 bg-indigo-500 rounded-full"></span>
                        Basic Single Date
                    </h3>
                    <p class="text-sm text-gray-500 mb-6">Default configuration. Click to select.</p>

                    <div class="flex flex-col gap-4 items-center">
                        <VueDatePicker v-model="dateSimple" :config="{
                            style: { debug: true }
                        }" @date-selected="onDateSelected" />
                        <div class="w-full bg-gray-100 p-3 rounded text-sm">
                            <strong>v-model:</strong> {{ dateSimple }}
                        </div>
                    </div>
                </div>

                <!-- Example 2: Date Range -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                        <span class="w-2 h-6 bg-purple-500 rounded-full"></span>
                        Range Selection
                    </h3>
                    <p class="text-sm text-gray-500 mb-6">Select Start and End dates. Max range 7 days.</p>

                    <div class="flex flex-col gap-4 items-center">
                        <VueDatePicker v-model="dateRange" :config="{
                            mode: 'range',
                            maxRangeDays: 7,
                            blockedDates: ['2026-02-14'],
                            style: { theme: 'indigo' }
                        }" @range-selected="onRangeSelected" />
                        <div class="w-full bg-gray-100 p-3 rounded text-sm">
                            <strong>v-model:</strong> {{ dateRange }}
                        </div>
                    </div>
                </div>

                <!-- Example 3: Theming & Styling -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                        <span class="w-2 h-6 bg-green-500 rounded-full"></span>
                        Theming (Green) + Today Circle
                    </h3>
                    <p class="text-sm text-gray-500 mb-6">Green theme, circle today style.</p>

                    <div class="flex flex-col gap-4 items-center">
                        <VueDatePicker v-model="dateThemed" :config="{
                            style: {
                                theme: 'green',
                                todayStyle: 'circle',
                                shadow: 'shadow-2xl'
                            }
                        }" />
                    </div>
                </div>

                <!-- NEW: Background Today Style -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                        <span class="w-2 h-6 bg-blue-500 rounded-full"></span>
                        Background Today Style (Blue)
                    </h3>
                    <p class="text-sm text-gray-500 mb-6">Today cell highlighted with a filled background.</p>
                    <div class="flex flex-col gap-4 items-center">
                        <VueDatePicker v-model="todayBg"
                            :config="{ style: { theme: 'blue', todayStyle: 'background' } }" />
                        <div class="w-full bg-gray-100 p-3 rounded text-sm"><strong>v-model:</strong> {{ todayBg }}
                        </div>
                    </div>
                </div>

                <!-- Example 4: Blocked Dates & Validation -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                        <span class="w-2 h-6 bg-red-500 rounded-full"></span>
                        Blocked Dates
                    </h3>
                    <p class="text-sm text-gray-500 mb-6">Specific dates are blocked (e.g., Today + 2 days).</p>

                    <div class="flex flex-col gap-4 items-center">
                        <VueDatePicker v-model="dateBlocked" :config="{
                            style: { theme: 'red' },
                            blockedDates: [
                                new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0],
                                new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0]
                            ]
                        }" />
                    </div>
                </div>

                <!-- Example 5: Time Picker -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                        <span class="w-2 h-6 bg-orange-500 rounded-full"></span>
                        With Time Picker
                    </h3>
                    <p class="text-sm text-gray-500 mb-6">Enable optional time selection.</p>

                    <div class="flex flex-col gap-4 items-center">
                        <VueDatePicker v-model="dateTime" :config="{
                            enableTime: true,
                            format: 'DD/MM/YYYY HH:mm',
                            style: { theme: 'dark' }
                        }" />
                        <div class="w-full bg-gray-100 p-3 rounded text-sm">
                            <strong>Output:</strong> {{ dateTime }}
                        </div>
                    </div>
                </div>

            </div>

            <!-- Section: Advanced Styling & Layout -->
            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">Advanced Styling & Layout</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    <div class="bg-white p-4 rounded shadow-sm border">
                        <h4 class="font-bold mb-2 text-gray-500">Custom Header Color (Teal)</h4>
                        <VueDatePicker v-model="advHeader" :config="{
                            style: {
                                headerClass: 'bg-teal-600 text-white',
                                theme: 'blue'
                            }
                        }" />
                        <div class="mt-2 text-xs text-gray-400 bg-gray-50 p-1 rounded">Val: {{ advHeader }}</div>
                    </div>

                    <div class="bg-white p-4 rounded shadow-sm border">
                        <h4 class="font-bold mb-2 text-gray-500">Compact Layout (Small Text)</h4>
                        <VueDatePicker v-model="advCompact" :config="{
                            style: {
                                customClass: 'text-xs',
                                rounded: 'rounded-sm',
                                shadow: 'shadow-none border border-gray-300'
                            }
                        }" />
                        <div class="mt-2 text-xs text-gray-400 bg-gray-50 p-1 rounded">Val: {{ advCompact }}</div>
                    </div>

                    <div class="bg-white p-4 rounded shadow-sm border">
                        <h4 class="font-bold mb-2 text-gray-500">Large Rounded + Green Theme</h4>
                        <VueDatePicker v-model="advGreen" :config="{
                            style: {
                                theme: 'green',
                                rounded: 'rounded-3xl',
                                shadow: 'shadow-2xl'
                            }
                        }" />
                        <div class="mt-2 text-xs text-gray-400 bg-gray-50 p-1 rounded">Val: {{ advGreen }}</div>
                    </div>

                    <div class="bg-white p-4 rounded shadow-sm border">
                        <h4 class="font-bold mb-2 text-gray-500">Transparent Border (Floaty)</h4>
                        <VueDatePicker v-model="advTransparent" :config="{
                            style: {
                                border: 'border-0',
                                shadow: 'shadow-xl'
                            }
                        }" />
                        <div class="mt-2 text-xs text-gray-400 bg-gray-50 p-1 rounded">Val: {{ advTransparent }}</div>
                    </div>

                    <div class="bg-white p-4 rounded shadow-sm border">
                        <h4 class="font-bold mb-2 text-gray-500">Square Theme (Sharp Edges)</h4>
                        <VueDatePicker v-model="advSquare" :config="{
                            style: {
                                rounded: 'rounded-none',
                                todayStyle: 'background'
                            }
                        }" />
                        <div class="mt-2 text-xs text-gray-400 bg-gray-50 p-1 rounded">Val: {{ advSquare }}</div>
                    </div>

                </div>
            </div>

            <!-- Section: Time Picker Variations -->
            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">Time Picker Combinations</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    <div class="bg-white p-4 rounded shadow-sm border">
                        <h4 class="font-bold mb-2 text-gray-500">Range + Time Enabled</h4>
                        <p class="text-xs text-gray-400 mb-2">Start & End dates with default time.</p>
                        <VueDatePicker v-model="timeRange" :config="{
                            mode: 'range',
                            enableTime: true,
                            style: { theme: 'indigo' }
                        }" />
                        <div class="mt-2 text-xs text-gray-400 bg-gray-50 p-1 rounded">Val: {{ timeRange }}</div>
                    </div>

                    <div class="bg-white p-4 rounded shadow-sm border">
                        <h4 class="font-bold mb-2 text-gray-500">Time + Custom Format</h4>
                        <p class="text-xs text-gray-400 mb-2">Format: MM/DD/YYYY @ HH:mm</p>
                        <VueDatePicker v-model="timeFormat" :config="{
                            enableTime: true,
                            format: 'MM/DD/YYYY @ HH:mm',
                            style: { theme: 'red' }
                        }" />
                        <div class="mt-2 text-xs text-gray-400 bg-gray-50 p-1 rounded">Val: {{ timeFormat }}</div>
                    </div>

                    <div class="bg-white p-4 rounded shadow-sm border">
                        <h4 class="font-bold mb-2 text-gray-500">Time + Blocked Dates</h4>
                        <VueDatePicker v-model="timeBlocked" :config="{
                            enableTime: true,
                            blockedDates: ['2026-02-15', '2026-02-16'],
                            style: { theme: 'dark' }
                        }" />
                        <div class="mt-2 text-xs text-gray-400 bg-gray-50 p-1 rounded">Val: {{ timeBlocked }}</div>
                    </div>

                </div>
            </div>

            <!-- Section: Extreme Edge Cases -->
            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">Edge Cases & Validation</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    <div class="bg-white p-4 rounded shadow-sm border">
                        <h4 class="font-bold mb-2 text-gray-500">Max Range: 1 Day (Strict)</h4>
                        <VueDatePicker v-model="edgeMaxRange" :config="{
                            mode: 'range',
                            maxRangeDays: 1,
                            style: { theme: 'red' }
                        }" />
                        <div class="mt-2 text-xs text-gray-400 bg-gray-50 p-1 rounded">Val: {{ edgeMaxRange }}</div>
                    </div>

                    <div class="bg-white p-4 rounded shadow-sm border">
                        <h4 class="font-bold mb-2 text-gray-500">Min Date: 2026-01-01</h4>
                        <VueDatePicker v-model="edgeMinDate" :config="{
                            minDate: '2026-01-01',
                            placeholder: 'Try selecting 2025...'
                        }" />
                        <div class="mt-2 text-xs text-gray-400 bg-gray-50 p-1 rounded">Val: {{ edgeMinDate }}</div>
                    </div>

                    <div class="bg-white p-4 rounded shadow-sm border">
                        <h4 class="font-bold mb-2 text-gray-500">Max Date: 2026-12-31</h4>
                        <VueDatePicker v-model="edgeMaxDate" :config="{
                            maxDate: '2026-12-31',
                            placeholder: 'No 2027 allowed'
                        }" />
                        <div class="mt-2 text-xs text-gray-400 bg-gray-50 p-1 rounded">Val: {{ edgeMaxDate }}</div>
                    </div>

                    <div class="bg-white p-4 rounded shadow-sm border">
                        <h4 class="font-bold mb-2 text-gray-500">Start Week: Monday (ISO)</h4>
                        <VueDatePicker v-model="edgeStartWeek" :config="{
                            startOfWeek: 1,
                            style: { theme: 'blue' }
                        }" />
                        <div class="mt-2 text-xs text-gray-400 bg-gray-50 p-1 rounded">Val: {{ edgeStartWeek }}</div>
                    </div>

                    <div class="bg-white p-4 rounded shadow-sm border">
                        <h4 class="font-bold mb-2 text-gray-500">Debug Mode Enabled</h4>
                        <VueDatePicker v-model="edgeDebug" :config="{
                            style: { debug: true }
                        }" />
                        <div class="mt-2 text-xs text-gray-400 bg-gray-50 p-1 rounded">Val: {{ edgeDebug }}</div>
                    </div>

                    <!-- NEW: Future Only -->
                    <div class="bg-white p-4 rounded shadow-sm border">
                        <h4 class="font-bold mb-2 text-gray-500">Future Only (Min = Tomorrow)</h4>
                        <p class="text-xs text-gray-400 mb-2">Cannot select today or past dates.</p>
                        <VueDatePicker v-model="futureOnly" :config="{
                            minDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                            placeholder: 'Future dates only'
                        }" />
                        <div class="mt-2 text-xs text-gray-400 bg-gray-50 p-1 rounded">Val: {{ futureOnly }}</div>
                    </div>

                </div>
            </div>

            <!-- Section: Client Special Requests / Advanced Themes -->
            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">Business Use Cases & Effects</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    <!-- 1. Validation Error State -->
                    <div class="bg-white p-4 rounded shadow-sm border">
                        <h4 class="font-bold mb-2 text-red-600">Simulated Error State</h4>
                        <p class="text-xs text-gray-400 mb-2">Using border styling to show invalid state.</p>
                        <VueDatePicker v-model="varError" :config="{
                            style: {
                                border: 'border-2 border-red-500',
                                shadow: 'shadow-red-50',
                                rounded: 'rounded-md'
                            },
                            placeholder: 'Required Field!'
                        }" />
                        <div class="mt-2 text-xs text-gray-400 bg-gray-50 p-1 rounded">Val: {{ varError }}</div>
                    </div>

                    <!-- 2. Minimalist Mono -->
                    <div class="bg-white p-4 rounded shadow-sm border">
                        <h4 class="font-bold mb-2 text-gray-800">Minimalist Mono</h4>
                        <p class="text-xs text-gray-400 mb-2">High contrast, sharp edges.</p>
                        <VueDatePicker v-model="varMono" :config="{
                            style: {
                                theme: 'dark',
                                rounded: 'rounded-none',
                                shadow: 'shadow-none border-2 border-black',
                                headerClass: 'bg-black text-white'
                            }
                        }" />
                        <div class="mt-2 text-xs text-gray-400 bg-gray-50 p-1 rounded">Val: {{ varMono }}</div>
                    </div>

                    <!-- 3. Trip Planner (Future) -->
                    <div class="bg-white p-4 rounded shadow-sm border">
                        <h4 class="font-bold mb-2 text-indigo-600">Trip Planner (Next 30 Days)</h4>
                        <p class="text-xs text-gray-400 mb-2">Range, Min Date: Tomorrow.</p>
                        <VueDatePicker v-model="varTrip" :config="{
                            mode: 'range',
                            minDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                            maxAnalysisDays: 14,
                            style: { theme: 'indigo', rounded: 'rounded-xl' }
                        }" />
                        <div class="mt-2 text-xs text-gray-400 bg-gray-50 p-1 rounded">Val: {{ varTrip }}</div>
                    </div>

                    <!-- 4. Historical Records -->
                    <div class="bg-white p-4 rounded shadow-sm border">
                        <h4 class="font-bold mb-2 text-gray-600">Historical / Past Only</h4>
                        <p class="text-xs text-gray-400 mb-2">Max Date: Yesterday.</p>
                        <VueDatePicker v-model="varHistory" :config="{
                            maxDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                            style: { theme: 'dark', cellClass: 'text-xs' },
                            placeholder: 'Select past date...'
                        }" />
                        <div class="mt-2 text-xs text-gray-400 bg-gray-50 p-1 rounded">Val: {{ varHistory }}</div>
                    </div>

                    <!-- 5. Glassmorphism Effect -->
                    <div class="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded shadow-sm border">
                        <h4 class="font-bold mb-2 text-white">Glassmorphism</h4>
                        <VueDatePicker v-model="varGlass" :config="{
                            style: {
                                customClass: 'bg-white/20 backdrop-blur-lg border border-white/30 text-white',
                                headerClass: 'bg-transparent text-white border-white/20',
                                shadow: 'shadow-2xl',
                                theme: 'blue'
                            }
                        }" />
                        <div class="mt-2 text-xs text-white/80 bg-black/20 p-1 rounded">Val: {{ varGlass }}</div>
                    </div>

                    <!-- 6. Appointment Scheduler -->
                    <div class="bg-white p-4 rounded shadow-sm border">
                        <h4 class="font-bold mb-2 text-blue-600">Appointment Slot</h4>
                        <p class="text-xs text-gray-400 mb-2">Specific Time Format.</p>
                        <VueDatePicker v-model="varAppt" :config="{
                            enableTime: true,
                            format: 'MMM DD, YYYY at HH:mm A',
                            style: { theme: 'blue', rounded: 'rounded-2xl' }
                        }" />
                        <div class="mt-2 text-xs text-gray-400 bg-gray-50 p-1 rounded">Val: {{ varAppt }}</div>
                    </div>

                    <!-- NEW: Range + Blocked Specific Weekends -->
                    <div class="bg-white p-4 rounded shadow-sm border">
                        <h4 class="font-bold mb-2 text-green-700">Range + Blocked Weekends</h4>
                        <p class="text-xs text-gray-400 mb-2">Max 30 days, specific blocked weekend dates.</p>
                        <VueDatePicker v-model="rangeBlocked" :config="{
                            mode: 'range',
                            maxRangeDays: 30,
                            blockedDates: ['2026-03-07', '2026-03-08', '2026-03-14', '2026-03-15'],
                            style: { theme: 'green' }
                        }" />
                        <div class="mt-2 text-xs text-gray-400 bg-gray-50 p-1 rounded">Val: {{ rangeBlocked }}</div>
                    </div>

                </div>
            </div>

            <!-- Example 6: Target Input Sync -->
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                    <span class="w-2 h-6 bg-cyan-500 rounded-full"></span>
                    Sync with External Input
                </h3>
                <p class="text-sm text-gray-500 mb-6">Updates the input below automatically via Selector.</p>

                <div class="flex flex-col gap-4 items-center">
                    <VueDatePicker v-model="dateSync" targetInputSelector="#my-external-input" />

                    <div class="w-full">
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">External Input:</label>
                        <input id="my-external-input" type="text" class="w-full border border-gray-300 rounded p-2"
                            placeholder="I will update automatically..." />
                    </div>
                </div>
            </div>

        </div>

        <!-- Events Log -->
        <div
            class="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-sm text-xs font-mono z-50 opacity-90 hover:opacity-100 transition-opacity">
            <div class="font-bold border-b border-gray-700 pb-2 mb-2">Event Log</div>
            <div>{{ lastEvent || 'Waiting for interaction...' }}</div>
        </div>

    </div>
</template>
