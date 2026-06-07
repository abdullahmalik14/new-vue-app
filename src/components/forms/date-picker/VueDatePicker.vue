<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';

const props = defineProps({
    modelValue: {
        type: [String, Object, Array, Date], // Single: string/Date, Range: {start, end} or [start, end]
        default: null
    },
    config: {
        type: Object,
        default: () => ({})
    },
    // Optional: Selector to sync value to an external input
    targetInputSelector: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:modelValue', 'date-selected', 'range-selected', 'range-changing']);

// --- Internal Helpers (No external imports) ---
const utils = {
    pad: (n) => n < 10 ? `0${n}` : `${n}`,

    isValidDate: (d) => d instanceof Date && !isNaN(d),

    // Create date at noon to avoid timezone edge cases for simple date picking
    dateFromStr: (str) => {
        if (!str) return null;
        if (str instanceof Date) return str;

        // Handle potential ISO strings or custom formats with time
        // We only care about YYYY-MM-DD for the Date object logic
        let datePart = str;
        if (typeof str === 'string' && str.includes(' ')) {
            datePart = str.split(' ')[0];
        } else if (typeof str === 'string' && str.includes('T')) {
            datePart = str.split('T')[0];
        }

        const [y, m, d] = datePart.split('-').map(Number);

        if (!y || isNaN(m) || isNaN(d)) return null;

        return new Date(y, m - 1, d, 12, 0, 0);
    },

    formatDate: (date, format = 'YYYY-MM-DD') => {
        if (!date) return '';
        const y = date.getFullYear();
        const m = utils.pad(date.getMonth() + 1);
        const d = utils.pad(date.getDate());
        const h = utils.pad(date.getHours());
        const min = utils.pad(date.getMinutes());

        return format
            .replace('YYYY', y)
            .replace('MM', m)
            .replace('DD', d)
            .replace('HH', h)
            .replace('mm', min);
    },

    daysInMonth: (month, year) => new Date(year, month + 1, 0).getDate(),

    firstDayOfMonth: (month, year) => new Date(year, month, 1).getDay(),

    isSameDate: (d1, d2) => {
        if (!d1 || !d2) return false;
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    },

    isBetween: (target, start, end) => {
        if (!target || !start || !end) return false;
        const t = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
        const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
        const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
        return t > s && t < e;
    },

    addDays: (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },

    diffInDays: (d1, d2) => {
        const t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
        const t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();
        return Math.abs(Math.round((t2 - t1) / (1000 * 60 * 60 * 24)));
    }
};

// --- Config Defaults ---
const defaultConfig = {
    mode: 'single', // 'single' | 'range'
    format: 'YYYY-MM-DD',
    enableTime: false,
    minDate: null, // 'YYYY-MM-DD'
    maxDate: null,
    blockedDates: [], // Array of 'YYYY-MM-DD'
    maxRangeDays: null,

    // UI / Theme
    placeholder: 'Select Date',
    style: {
        theme: 'blue', // blue, red, green, dark, etc.
        rounded: 'rounded-lg',
        shadow: 'shadow-lg',
        border: 'border border-gray-200',
        headerClass: 'bg-white text-gray-900',
        cellClass: '', // Day cell override
        selectedClass: 'bg-indigo-600 text-white',
        rangeClass: 'bg-indigo-100 text-indigo-900',
        todayStyle: 'underline', // 'underline' | 'background' | 'circle'
        debug: false // Show hidden inputs
    },

    startOfWeek: 0 // 0=Sun, 1=Mon
};

const options = computed(() => {
    // Deep merge would be better, but simple spread works for shallow nesting
    return {
        ...defaultConfig,
        ...props.config,
        style: { ...defaultConfig.style, ...props.config.style },
        // Auto-fix format if time is enabled but format is default
        format: (props.config.enableTime && (!props.config.format || props.config.format === 'YYYY-MM-DD'))
            ? 'YYYY-MM-DD HH:mm'
            : (props.config.format || defaultConfig.format)
    };
});

// --- State ---
const now = new Date();
const view = ref('day'); // 'day', 'month', 'year'
const currentMonth = ref(now.getMonth());
const currentYear = ref(now.getFullYear());
const hoverDate = ref(null);

// Selection State
const singleDate = ref(null);
const startDate = ref(null);
const endDate = ref(null);

// Time State
const time = ref({
    hours: 12,
    minutes: 0,
    period: 'PM'
});

// --- Output & Sync ---


// Watch time changes to emit updates immediately
watch(time, () => {
    if (options.value.mode === 'single' && singleDate.value) {
        emitValue();
    }
}, { deep: true });

// --- Initialization ---
watch(() => props.modelValue, (val, oldVal) => {
    // Parse incoming value
    // Ideally prevent infinite loops if we emit update immediately
    if (JSON.stringify(val) === JSON.stringify(oldVal)) return;
    initFromValue(val);
}, { immediate: true });

function initFromValue(val) {
    if (!val) {
        // defaults
        singleDate.value = null;
        startDate.value = null;
        endDate.value = null;
        return;
    }

    if (options.value.mode === 'single') {
        singleDate.value = utils.dateFromStr(val);
        if (singleDate.value) {
            currentMonth.value = singleDate.value.getMonth();
            currentYear.value = singleDate.value.getFullYear();

            // Extract time if enabled
            if (options.value.enableTime && typeof val === 'string' && val.includes(' ')) {
                const timePart = val.split(' ')[1]; // assumes "YYYY-MM-DD HH:mm"
                if (timePart && timePart.includes(':')) {
                    const [h, min] = timePart.split(':').map(Number);
                    if (!isNaN(h) && !isNaN(min)) {
                        // Convert 24h to 12h for the picker state
                        let period = 'PM';
                        let hours12 = h;

                        if (h < 12) {
                            period = 'AM';
                            hours12 = h === 0 ? 12 : h;
                        } else {
                            period = 'PM';
                            hours12 = h === 12 ? 12 : h - 12;
                        }

                        // Sync time state without triggering watcher loops ideally
                        time.value.hours = hours12;
                        time.value.minutes = min;
                        time.value.period = period;
                    }
                }
            }
        }
    } else {
        // Range
        if (val.start) startDate.value = utils.dateFromStr(val.start);
        if (val.end) endDate.value = utils.dateFromStr(val.end);

        const d = startDate.value || endDate.value;
        if (d) {
            currentMonth.value = d.getMonth();
            currentYear.value = d.getFullYear();
        }
    }
}

// --- Navigation ---
function prevMonth() {
    if (currentMonth.value === 0) {
        currentMonth.value = 11;
        currentYear.value--;
    } else {
        currentMonth.value--;
    }
}

function nextMonth() {
    if (currentMonth.value === 11) {
        currentMonth.value = 0;
        currentYear.value++;
    } else {
        currentMonth.value++;
    }
}

function switchView(v) {
    view.value = v;
}

function setMonth(m) {
    currentMonth.value = m;
    view.value = 'day';
}

function setYear(y) {
    currentYear.value = y;
    view.value = 'day'; // Or 'month' if you prefer drilling down
}

// --- Grid Generation ---
const daysOfWeek = computed(() => {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    if (options.value.startOfWeek === 1) {
        return [...days.slice(1), days[0]];
    }
    return days;
});

const calendarGrid = computed(() => {
    const m = currentMonth.value;
    const y = currentYear.value;
    const totalDays = utils.daysInMonth(m, y);
    const firstDay = utils.firstDayOfMonth(m, y); // 0 = Sun

    const offset = (firstDay - options.value.startOfWeek + 7) % 7;

    const days = [];

    // Previous Month Padding
    const prevMonthDays = utils.daysInMonth(m === 0 ? 11 : m - 1, m === 0 ? y - 1 : y);
    for (let i = offset - 1; i >= 0; i--) {
        days.push({
            date: new Date(m === 0 ? y - 1 : y, m === 0 ? 11 : m - 1, prevMonthDays - i),
            isCurrentMonth: false,
            isToday: false // simplified
        });
    }

    // Current Month
    for (let i = 1; i <= totalDays; i++) {
        const d = new Date(y, m, i);
        days.push({
            date: d,
            isCurrentMonth: true,
            isToday: utils.isSameDate(d, now)
        });
    }

    // Next Month Padding (to fill 6 rows = 42 cells)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
        days.push({
            date: new Date(m === 11 ? y + 1 : y, m === 11 ? 0 : m + 1, i),
            isCurrentMonth: false,
            isToday: false
        });
    }

    return days;
});

// --- Date Interaction ---
function handleDateClick(day) {
    if (isDisabled(day.date)) return;

    if (options.value.mode === 'single') {
        singleDate.value = day.date;
        emitValue();
        emit('date-selected', day.date);
    } else {
        // Range Mode
        if (!startDate.value || (startDate.value && endDate.value)) {
            // Start fresh
            startDate.value = day.date;
            endDate.value = null;
        } else if (startDate.value && !endDate.value) {
            if (day.date < startDate.value) {
                // User clicked earlier date, treat as new start
                startDate.value = day.date;
            } else {
                // Valid end date? check max range
                if (options.value.maxRangeDays) {
                    const diff = utils.diffInDays(startDate.value, day.date);
                    if (diff > options.value.maxRangeDays) {
                        // Too long
                        // Optional: visual feedback or alert?
                        return;
                    }
                }
                endDate.value = day.date;
                emit('range-selected', { start: startDate.value, end: endDate.value });
            }
        }
        emitValue();
    }
}

function handleDateHover(day) {
    if (options.value.mode === 'range' && startDate.value && !endDate.value) {
        hoverDate.value = day.date;
        emit('range-changing', { start: startDate.value, end: day.date });
    } else {
        hoverDate.value = null;
    }
}

function isDisabled(date) {
    // Configured bounds
    if (options.value.minDate && date < utils.dateFromStr(options.value.minDate)) return true;
    if (options.value.maxDate && date > utils.dateFromStr(options.value.maxDate)) return true;

    // Configured blocked dates
    if (options.value.blockedDates.some(blocked => utils.isSameDate(utils.dateFromStr(blocked), date))) return true;

    // Range Logic: prevent selecting beyond maxRange from start (during selection)
    // This is tricky, usually we disabled dates that are too far if start is selected
    if (options.value.mode === 'range' && startDate.value && !endDate.value && options.value.maxRangeDays) {
        const diff = utils.diffInDays(startDate.value, date);
        // Only disable if it's AFTER start AND exceeds range
        if (date > startDate.value && diff > options.value.maxRangeDays) return true;

        // Also, usually we disable dates BEFORE start if we want to enforce forward selection, 
        // BUT user might want to pick a start, then realize their click was actually End, so they click before.
        // My logic in handleDateClick handles "click before = new start", so we don't strictly disable it.
    }

    return false;
}

// --- Styling Helpers ---
const themeColors = computed(() => {
    const t = options.value.style.theme || 'blue';
    const colors = {
        blue: { select: 'bg-blue-600', range: 'bg-blue-100 text-blue-900', today: 'text-blue-600', border: 'border-blue-600', text: 'text-blue-700' },
        indigo: { select: 'bg-indigo-600', range: 'bg-indigo-100 text-indigo-900', today: 'text-indigo-600', border: 'border-indigo-600', text: 'text-indigo-700' },
        red: { select: 'bg-red-600', range: 'bg-red-100 text-red-900', today: 'text-red-600', border: 'border-red-600', text: 'text-red-700' },
        green: { select: 'bg-green-600', range: 'bg-green-100 text-green-900', today: 'text-green-600', border: 'border-green-600', text: 'text-green-700' },
        dark: { select: 'bg-gray-800', range: 'bg-gray-200 text-gray-800', today: 'text-gray-900', border: 'border-gray-900', text: 'text-gray-900' },
    };
    return colors[t] || colors.blue;
});

function getDayClasses(day) {
    const base = "h-9 w-9 flex items-center justify-center text-sm font-medium rounded-full transition-colors cursor-pointer relative z-10 ";
    if (isDisabled(day.date)) {
        return base + " text-gray-300 cursor-not-allowed decoration-slice";
    }

    const isSelected = isDaySelected(day.date);
    const inRange = isDayInRange(day.date);
    const isStart = isRangeStart(day.date);
    const isEnd = isRangeEnd(day.date);

    if (isSelected || isStart || isEnd) {
        return base + ` ${themeColors.value.select} text-white hover:opacity-90`;
    }

    if (inRange) {
        // Range middle styling - square corners for connection
        return "h-9 w-9 flex items-center justify-center text-sm font-medium transition-colors cursor-pointer " +
            `${themeColors.value.range} rounded-none`;
    }

    // Standard day
    let classes = base + " hover:bg-gray-100 ";
    if (!day.isCurrentMonth) classes += " text-gray-400 ";
    else classes += " text-gray-700 ";

    // Today styling
    if (day.isToday) {
        if (options.value.style.todayStyle === 'background') {
            classes += " bg-gray-100 font-bold ";
        } else if (options.value.style.todayStyle === 'circle') {
            classes += ` border ${themeColors.value.border} font-bold `;
        } else {
            // underline default
            classes += ` underline decoration-2 underline-offset-4 ${themeColors.value.today} font-bold `;
        }
    }

    return classes;
}

function isDaySelected(date) {
    if (options.value.mode === 'single') {
        return singleDate.value && utils.isSameDate(date, singleDate.value);
    }
    return false;
}

function isRangeStart(date) {
    return options.value.mode === 'range' && startDate.value && utils.isSameDate(date, startDate.value);
}

function isRangeEnd(date) {
    if (options.value.mode !== 'range') return false;
    if (endDate.value && utils.isSameDate(date, endDate.value)) return true;
    // Preview
    if (startDate.value && !endDate.value && hoverDate.value) {
        return utils.isSameDate(date, hoverDate.value) && date > startDate.value;
    }
    return false;
}

function isDayInRange(date) {
    if (options.value.mode !== 'range' || !startDate.value) return false;

    const end = endDate.value || (hoverDate.value && hoverDate.value > startDate.value ? hoverDate.value : null);
    if (!end) return false;

    return utils.isBetween(date, startDate.value, end);
}

// --- Output & Sync ---
const formattedOutput = computed(() => {
    const fmt = options.value.format;
    if (options.value.mode === 'single') {
        if (!singleDate.value) return '';
        const d = new Date(singleDate.value);
        if (options.value.enableTime) {
            d.setHours(time.value.period === 'PM' && time.value.hours !== 12 ? time.value.hours + 12 : (time.value.period === 'AM' && time.value.hours === 12 ? 0 : time.value.hours));
            d.setMinutes(time.value.minutes);
        }
        return utils.formatDate(d, fmt);
    } else {
        // Range
        // Returns object usually, but for input string maybe "Start - End"
        if (!startDate.value) return '';
        const s = utils.formatDate(startDate.value, fmt.split(' ')[0]); // usually don't want time in range keys unless specified
        const e = endDate.value ? utils.formatDate(endDate.value, fmt.split(' ')[0]) : '...';
        return `${s} | ${e}`;
    }
});

function emitValue() {
    let val;
    if (options.value.mode === 'single') {
        val = formattedOutput.value; // String? Or Date object? Standard usually ISO string or Date.
        // Let's prefer standard YYYY-MM-DD or configured format string
    } else {
        val = {
            start: startDate.value ? utils.formatDate(startDate.value, options.value.format) : null,
            end: endDate.value ? utils.formatDate(endDate.value, options.value.format) : null
        };
    }
    emit('update:modelValue', val);

    // Target Sync
    if (props.targetInputSelector) {
        nextTick(() => {
            const el = document.querySelector(props.targetInputSelector);
            if (el) {
                el.value = typeof val === 'object' ? JSON.stringify(val) : val;
                el.dispatchEvent(new Event('input'));
            }
        });
    }
}

// --- Time Picker Logic ---
// (Simple Selects for HM)
const hours = Array.from({ length: 12 }, (_, i) => i + 1);
const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10...


function updateTime() {
    if (options.value.mode === 'single' && singleDate.value) {
        emitValue();
    }
}

</script>

<template>
    <div class="vue-date-picker inline-block bg-white transition-all overflow-hidden" :class="[
        options.style.rounded,
        options.style.shadow,
        options.style.border,
        options.style.customClass
    ]">
        <!-- Navbar / Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100"
            :class="options.style.headerClass">
            <button @click="prevMonth" class="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
            </button>

            <div class="flex gap-2 font-semibold text-gray-800">
                <button @click="view === 'month' ? switchView('day') : switchView('month')"
                    class="hover:bg-gray-100 px-2 py-1 rounded transition-colors">
                    {{ new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' }) }}
                </button>
                <button @click="view === 'year' ? switchView('day') : switchView('year')"
                    class="hover:bg-gray-100 px-2 py-1 rounded transition-colors">
                    {{ currentYear }}
                </button>
            </div>

            <button @click="nextMonth" class="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
            </button>
        </div>

        <!-- View: Day Grid -->
        <div v-if="view === 'day'" class="p-4">
            <!-- Weekday Headers -->
            <div class="grid grid-cols-7 mb-2">
                <div v-for="day in daysOfWeek" :key="day" class="text-center text-xs font-semibold text-gray-500 py-1">
                    {{ day }}
                </div>
            </div>

            <!-- Days -->
            <div class="grid grid-cols-7 gap-y-1">
                <div v-for="(day, idx) in calendarGrid" :key="idx" class="flex justify-center relative"
                    @mouseenter="handleDateHover(day)">
                    <!-- Special styling for Range Connectors (Start/End background extension) -->
                    <div v-if="options.mode === 'range' && isDayInRange(day.date)" class="absolute inset-y-0 w-full"
                        :class="[
                            themeColors.range,
                            isRangeStart(day.date) ? 'left-1/2 w-1/2 rounded-l-none' : '',
                            isRangeEnd(day.date) ? 'right-1/2 w-1/2 rounded-r-none' : '',
                            !isRangeStart(day.date) && !isRangeEnd(day.date) ? 'w-full' : ''
                        ]"></div>

                    <button @click.stop="handleDateClick(day)" :class="getDayClasses(day)"
                        :disabled="isDisabled(day.date)">
                        {{ day.date.getDate() }}
                    </button>
                </div>
            </div>
        </div>

        <!-- View: Month Selection -->
        <div v-else-if="view === 'month'" class="p-4 grid grid-cols-3 gap-2 h-[280px] overflow-y-auto">
            <button v-for="(m, i) in 12" :key="i" @click="setMonth(i)"
                class="p-2 rounded hover:bg-gray-100 text-sm font-medium"
                :class="i === currentMonth ? themeColors.text + ' bg-gray-50' : 'text-gray-700'">
                {{ new Date(2000, i).toLocaleString('default', { month: 'short' }) }}
            </button>
        </div>

        <!-- View: Year Selection -->
        <div v-else-if="view === 'year'" class="p-4 grid grid-cols-4 gap-2 h-[280px] overflow-y-auto">
            <button v-for="y in 20" :key="y" @click="setYear(currentYear - 10 + y)"
                class="p-2 rounded hover:bg-gray-100 text-sm font-medium"
                :class="(currentYear - 10 + y) === currentYear ? themeColors.text + ' bg-gray-50' : 'text-gray-700'">
                {{ currentYear - 10 + y }}
            </button>
        </div>

        <!-- Optional: Time Picker -->
        <div v-if="options.enableTime && view === 'day'"
            class="border-t border-gray-100 p-3 bg-gray-50 flex items-center justify-center gap-2">
            <select v-model="time.hours" @change="updateTime"
                class="bg-white border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500">
                <option v-for="h in hours" :key="h" :value="h">{{ utils.pad(h) }}</option>
            </select>
            <span class="text-gray-400">:</span>
            <select v-model="time.minutes" @change="updateTime"
                class="bg-white border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500">
                <option v-for="m in minutes" :key="m" :value="m">{{ utils.pad(m) }}</option>
            </select>
            <select v-model="time.period" @change="updateTime"
                class="bg-white border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500">
                <option value="AM">AM</option>
                <option value="PM">PM</option>
            </select>
        </div>

        <!-- Debug / Inputs -->
        <div v-if="options.style.debug" class="p-2 bg-gray-900 text-gray-200 text-xs font-mono">
            DEBUG MODE <br />
            Raw Model: {{ modelValue }} <br />
            Output: {{ formattedOutput }}
        </div>

        <!-- Hidden Input for Forms -->
        <input type="hidden" class="vue-datepicker-input"
            :value="typeof formattedOutput === 'object' ? JSON.stringify(formattedOutput) : formattedOutput" />
    </div>
</template>

<style scoped>
/* Scrollbar hiding if needed */
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
