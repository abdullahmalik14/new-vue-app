<script setup>
import { onMounted, reactive, ref, computed } from "vue";
import { useRoute } from "vue-router";
import DashboardWrapperTwoColContainer from "@/components/dashboard/DashboardWrapperTwoColContainer.vue";
import { createStepStateEngine, attachEngineLogging } from "@/utils/stateEngine.js"; // Adjust path if needed

// Import Steps
import OneOnOneBookinStep1 from "./OneOnOneBookinStep1.vue";
import OneOnOneBookinStep2 from "./OneOnOneBookinStep2.vue";
import GroupBookingStep1 from "./GroupBookingStep1.vue";
import GroupBookingStep2 from "./GroupBookingStep2.vue";
import MainCalendar from "@/components/calendar/MainCalendar.vue";
import NotificationCard from "@/components/ui/card/dashboard/NotificationCard.vue";
// import OneOnOneBookingFlowPopup from "@/components/ui/popup/FanBookingFlow/OneOnOneBookingFlow/OneOnOneBookingFlowPopup.vue";

const props = defineProps({
    type: {
        type: String,
        default: "private",
        validator: (value) => ["private", "group"].includes(value),
    }
});

const route = useRoute();

/**
 * Determine the active type.
 * Priority:
 * 1. props.type (if explicitly passed by a parent wrapper like GroupBookingForm)
 * 2. route.query.type (if accessed directly via URL, e.g. ?type=group)
 * 3. Default to 'private'
 */
const currentType = computed(() => {
    // If route query is explicitly present, it takes precedence for direct access
    if (route.query.type === 'group' || route.query.type === 'private') {
        return route.query.type;
    }
    return props.type;
});

// Initialize State Engine
const bookingFlow = createStepStateEngine({
    flowId: 'booking-schedule-flow',
    initialStep: 1,
    urlSync: 'none', // Changed to none to avoid URL clutter for this modal/form
    defaults: {
        eventTitle: "",
        eventDescription: "",
        duration: "",
        maxSessionDuration: "",
        basePrice: "",
        sessionMinimum: "",
        discountPercentage: "",
        bookingFee: "",
        waitlistSpots: "",
        advanceVoid: "",
        offHourSurcharge: "",
        calendarDuration: "",
        remindMeTime: "",
        bufferTime: "",
        maxBookingsPerDay: "",
        waitlistSlots: "",
        rescheduleFee: "",
        cancellationFee: "",
        extendSessionMax: "",
        allowLongerSessions: false,
        enableLongerDiscount: false,
        enableBookingFee: false,
        allowInstantBooking: false,
        disableChatBeforeCall: false,
        enableRescheduleFee: false,
        enableCancellationFee: false,
        allowAdvanceCancellation: false,
        addOffHourSurcharge: false,
        disableChatDuringCall: false,
        requestExtendSession: false,
        setBufferTime: false,
        setMaxBookings: false,
        allowWaitlist: false,

        // Step 2 & Group Defaults
        allowRecording: false,
        recordingPrice: "",
        allowPersonalRequest: false,
        blockedUserSearch: "",
        coPerformerSearch: "",
        xPostLive: false,
        xPostBooked: false,
        xPostInSession: false,
        xPostTipped: false,
        xPostPurchase: false,
        discountEventsCount: "",
        spendingRequirement: "",
        setMaxUsers: false,
        maxUsers: "",
        setReminders: false
    }
});

attachEngineLogging(bookingFlow);

// Sync engine with component to make it reactive for the template
const currentStep = ref(1);
// const oneOnOneBookingFlowPopupOpen = ref(false);

// --- VALIDATION LOGIC ---

// Step 1 Validation
bookingFlow.addFieldRequirement(1, 'eventTitle', { required: true, requiredMessage: "Event Title is required." });
bookingFlow.addFieldRequirement(1, 'basePrice', { required: true, requiredMessage: "Price is required." });

bookingFlow.addValidator(1, (state) => {
    // 1. Conditional Validations (One-on-One)
    if (state.enableLongerDiscount) {
        if (!state.sessionMinimum) return "Minimum session duration for discount is required.";
        if (!state.discountPercentage) return "Discount percentage is required.";
    }
    if (state.enableBookingFee && !state.bookingFee) return "Booking fee amount is required.";
    if (state.enableRescheduleFee && !state.rescheduleFee) return "Reschedule fee amount is required.";
    if (state.enableCancellationFee && !state.cancellationFee) return "Cancellation fee amount is required.";
    if (state.allowAdvanceCancellation && !state.advanceVoid) return "Advance cancellation time limit is required.";
    // if (state.addOffHourSurcharge && !state.offHourSurcharge) return "Off-hour surcharge amount is required.";
    if (state.setBufferTime && !state.bufferTime) return "Buffer time is required.";
    if (state.setMaxBookings && !state.maxBookingsPerDay) return "Maximum booking limit is required.";
    if (state.allowWaitlist && !state.waitlistSpots) return "Waitlist spots count is required.";

// Step 2 Validation
bookingFlow.addFieldRequirement(2, 'recordingPrice', {
    rules: [{
        type: 'bypassValidation', // Just demonstrating bridge usage
    }],
    required: true,
    requiredMessage: "Recording price is required.",
    // Note: In a real scenario, we'd check state.allowRecording here too.
    // For now, we'll keep the conditional one below for accuracy.
});

bookingFlow.addValidator(2, (state) => {
    // 1. One-on-One Specific
    if (state.allowRecording && !state.recordingPrice) return "Recording price is required.";

    // 2. Group Specific (if any unique mandatory fields exist)

    return true;
});

// Init
onMounted(() => {
    bookingFlow.initialize();

    // Listen to engine changes to update UI
    bookingFlow.on('step:changed', ({ next }) => {
        currentStep.value = next;
    });
});

const now = new Date();
const y = now.getFullYear();
const m = now.getMonth();

// CHANGE: Helper to generate ISO Strings (JSON format)
// Example output: "2026-01-14T10:00:00"
const getIsoString = (dayOfMonth, hour, minute) => {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${y}-${pad(m + 1)}-${pad(dayOfMonth)}T${pad(hour)}:${pad(minute)}:00`;
};

// --- THEME 2 ---
const theme2 = {
    mini: {},
    main: {
        wrapper: 'relative flex flex-col gap-[0px] overflow-hidden rounded-xl',
        title: ' text-[16px] font-semibold text-slate-800 ',
        xHeader: '',
        axisXLabel: 'flex flex-col justify-end pb-[0.75rem] w-[4.875rem]',
        axisXDay: 'py-1 text-center h-[63.92px] text-slate-500 font-medium',
        axisXToday: 'bg-gray-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto',
        axisYRow: 'h-[62.62px] text-right pr-4 w-[2.4rem] uppercase text-slate-400 text-[11px] font-medium leading-4 pt-1',
        colBase: 'relative bg-white/20 border-l border-white/50 overflow-hidden',
        gridRow: 'h-[62.61px] border-b border-white/50',
        eventBase: 'absolute mx-1 rounded-md p-2 text-xs shadow-sm'
    },
    month: {}
};

// These start/end values are now ISO STRINGS, not Date objects.
const events2 = ref([
    { id: 'e1', title: 'High School Life Simulator', start: getIsoString(11, 10, 0), end: getIsoString(11, 21, 0), slot: 'event' },
    { id: 'e1-dup', title: 'Maid Cafe Simulator', start: getIsoString(11, 0, 0), end: getIsoString(11, 11, 0), slot: 'alt' },
    { id: 'e2', title: 'Event Title', start: getIsoString(12, 0, 0), end: getIsoString(12, 4, 0), slot: 'custom' },
    { id: 'e3', title: 'Maid Cafe Simulator', start: getIsoString(12, 1, 0), end: getIsoString(12, 11, 0), slot: 'alt' },
    { id: 'e4', title: 'Event Title', start: getIsoString(13, 0, 0), end: getIsoString(13, 4, 0), slot: 'custom' },
    { id: 'e5', title: 'Event Title', start: getIsoString(14, 22, 0), end: getIsoString(14, 23, 0), slot: 'custom' },
    { id: 'e6', title: 'Maid Cafe Simulator', start: getIsoString(14, 0, 0), end: getIsoString(14, 4, 0), slot: 'alt' },
    { id: 'e7', title: 'Event Title', start: getIsoString(15, 0, 0), end: getIsoString(15, 8, 0), slot: 'custom' },
    { id: 'e8', title: 'Event Title', start: getIsoString(16, 2, 0), end: getIsoString(16, 8, 0), slot: 'custom' },
    { id: 'e9', title: 'Maid Cafe Simulator', start: getIsoString(16, 0, 0), end: getIsoString(16, 21, 0), slot: 'alt' },
    { id: 'e10', title: 'Event Title', start: getIsoString(17, 0, 0), end: getIsoString(17, 5, 0), slot: 'custom' },
    { id: 'e11', title: 'Event Title', start: getIsoString(17, 22, 0), end: getIsoString(17, 23, 0), slot: 'custom' },
    { id: '12', title: 'High School Life Simulator', start: getIsoString(17, 8, 0), end: getIsoString(17, 20, 0), slot: 'event' },
    { id: 'e13', title: 'J&B’s Cooking show', start: getIsoString(13, 5, 0), end: getIsoString(13, 9, 0), slot: 'custom2' },
]);

const state = reactive({
    focus: new Date(y, m, 23),
    selected: null,
    view: 'week'
});

const onSelectFromMain = (date) => {
    state.selected = new Date(date);
};

const onDebugSubmit = () => {
    console.log("Submit Clicked. Current State:", JSON.parse(JSON.stringify(bookingFlow.state)));
    alert("Submitted! Check console for full state object.");
};

// Helper for title
const formTitle = computed(() => {
    return currentType.value === 'group' ? 'Group Event Settings' : 'Private Booking Settings';
});
</script>

<template>
    <DashboardWrapperTwoColContainer>
        <div class="flex w-full">
            <div
                class="flex h-full flex-col gap-6 relative w-full md:w-[500px] md:min-w-[500px] bg-white/50 shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03)] backdrop-blur-xl">

                <div class="px-6 pt-6 pb-2 bg-white/20 flex justify-between items-center">
                    <div class="justify-start text-slate-700 text-base font-semibold leading-6">
                        {{ formTitle }}
                    </div>
                    <div class="w-2.5 h-2.5 relative overflow-hidden">
                        <img src="https://i.ibb.co/G4Y3BB6c/Icon.png" alt="" />
                    </div>
                </div>

                <div class="w-full">
                    <!-- Private Form -->
                    <template v-if="currentType === 'private'">
                        <OneOnOneBookinStep1 v-if="currentStep === 1" :engine="bookingFlow" />

                        <OneOnOneBookinStep2 v-if="currentStep === 2" :engine="bookingFlow" />
                    </template>

                    <!-- Group Form -->
                    <template v-else-if="currentType === 'group'">
                        <GroupBookingStep1 v-if="currentStep === 1" :engine="bookingFlow" />

                        <GroupBookingStep2 v-if="currentStep === 2" :engine="bookingFlow" />
                    </template>
                </div>

            </div>

            <div class="w-full">
                <NotificationCard variant="alert" :showIcon="false" title="You have 3 active subscriber in this tier"
                    description="Changing detail of this plan might affect current subscriber's subscription fee and benefits." />
                <MainCalendar class="w-full px-6 pt-6" variant="theme2" :focus-date="state.focus" :events="events2"
                    :theme="theme2" :data-attrs="{ 'data-calendar': 'main-2' }" :console-overlaps="true"
                    :highlight-today-column="true" time-start="00:00" time-end="23:00" :slot-minutes="60"
                    :row-height-px="64" :min-event-height-px="0" @date-selected="onSelectFromMain"
                    >
                    <!-- @preview-schedule="oneOnOneBookingFlowPopupOpen = true" -->

                    <template #event="{ event, style, onClick }">
                        <div class="absolute py-1 px-2 border-b border-blue-600 text-xs bg-blue-300/25 text-emerald-700 shadow-sm overflow-hidden"
                            :style="style" @click.stop="onClick(event)">
                            <div class="flex items-center gap-1 text-blue-600 font-normal truncate ">
                                <svg width="11" height="12" viewBox="0 0 11 12" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M10.2898 5H1.28979M7.78979 1V3M3.78979 1V3M3.68979 11H7.88979C8.72987 11 9.14991 11 9.47078 10.8365C9.75302 10.6927 9.98249 10.4632 10.1263 10.181C10.2898 9.86012 10.2898 9.44008 10.2898 8.6V4.4C10.2898 3.55992 10.2898 3.13988 10.1263 2.81901C9.98249 2.53677 9.75302 2.3073 9.47078 2.16349C9.14991 2 8.72987 2 7.8898 2H3.6898C2.84972 2 2.42968 2 2.10881 2.16349C1.82657 2.3073 1.5971 2.53677 1.45329 2.81901C1.28979 3.13988 1.28979 3.55992 1.28979 4.4V8.6C1.28979 9.44008 1.28979 9.86012 1.45329 10.181C1.5971 10.4632 1.82657 10.6927 2.10881 10.8365C2.42968 11 2.84972 11 3.68979 11Z"
                                        stroke="#5555e8" stroke-width="1.25" stroke-linecap="round"
                                        stroke-linejoin="round" />
                                </svg>
                                <span class="mt-1 truncate">{{ event.title }}</span>
                            </div>
                        </div>
                    </template>

                    <template #event-custom="{ event, style, onClick }">
                        <div class="absolute py-1 px-2 border-b border-[#FF0066] text-xs text-[#FF0066] shadow-sm overflow-hidden"
                            :style="style"
                            style="background: repeating-linear-gradient(-45deg, #EBBACC, #EBBACC 2px, #E9CFD7 3px, #E9CFD7 10px);"
                            @click.stop="onClick(event)">
                            <div class="flex items-center gap-1 font-normal leading-4 truncate">
                                <svg width="11" height="12" viewBox="0 0 11 12" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M10.2898 5H1.28979M7.78979 1V3M3.78979 1V3M3.68979 11H7.88979C8.72987 11 9.14991 11 9.47078 10.8365C9.75302 10.6927 9.98249 10.4632 10.1263 10.181C10.2898 9.86012 10.2898 9.44008 10.2898 8.6V4.4C10.2898 3.55992 10.2898 3.13988 10.1263 2.81901C9.98249 2.53677 9.75302 2.3073 9.47078 2.16349C9.14991 2 8.72987 2 7.8898 2H3.6898C2.84972 2 2.42968 2 2.10881 2.16349C1.82657 2.3073 1.5971 2.53677 1.45329 2.81901C1.28979 3.13988 1.28979 3.55992 1.28979 4.4V8.6C1.28979 9.44008 1.28979 9.86012 1.45329 10.181C1.5971 10.4632 1.82657 10.6927 2.10881 10.8365C2.42968 11 2.84972 11 3.68979 11Z"
                                        stroke="#ff123b" stroke-width="1.25" stroke-linecap="round"
                                        stroke-linejoin="round" />
                                </svg>
                                <span class="mt-1 truncate">{{ event.title }}</span>
                            </div>
                        </div>
                    </template>

                    <template #event-alt="{ event, style, onClick }">
                        <div class="absolute py-1 px-2  bg-teal-300/25 border-b border-[#15B79E] text-teal-500 text-xs shadow-sm"
                            :style="style" @click.stop="onClick(event)">
                            <div class="flex items-center gap-1 font-normal truncate">
                                <svg class="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                <span class="mt-1 truncate">{{ event.title }}</span>
                            </div>
                        </div>
                    </template>

                    <template #event-custom2="{ event, style, onClick }">
                        <div class="absolute py-1 px-2 bg-fuchsia-300/25 border-b border-[#AE4AEF] text-purple-700 text-xs shadow-sm"
                            :style="style" @click.stop="onClick(event)">
                            <div class="flex items-center gap-1 font-normal text-[#AE4AEF]">
                                <svg class="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                                </svg>
                                <span class="mt-1 truncate">{{ event.title }}</span>
                            </div>
                        </div>
                    </template>

                </MainCalendar>
            </div>

        </div>
    </DashboardWrapperTwoColContainer>

    <!-- Debug Section (as requested) -->
    <div class="mt-8 p-6 bg-gray-100 dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-gray-700">
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">Debug / State Manager</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Flow State Panel -->
            <div
                class="bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                <h4
                    class="text-sm font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-2 mb-3">
                    Current Flow State
                </h4>
                <pre
                    class="max-h-80 overflow-auto bg-slate-950 text-emerald-400 p-3 rounded text-xs leading-relaxed font-mono">
                {{ JSON.stringify(bookingFlow.state, null, 2) }}</pre>
            </div>

            <!-- Flow Logs Panel -->
            <div
                class="bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                <h4
                    class="text-sm font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-2 mb-3">
                    Engine Logs
                </h4>
                <pre
                    class="max-h-80 overflow-auto bg-slate-950 text-blue-300 p-3 rounded text-xs leading-relaxed font-mono">
                {{ bookingFlow.logs.slice(-20).join("\n") }}</pre>
            </div>
        </div>
    </div>

    <!-- <OneOnOneBookingFlowPopup v-model="oneOnOneBookingFlowPopupOpen" /> -->
</template>
