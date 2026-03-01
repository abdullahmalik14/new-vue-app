<template>
    <div class="flex flex-col w-full bg-white text-black p-2 select-none h-[300px]">
        <!-- Header -->
        <div class="flex items-center justify-between mb-2">
            <div class="text-lg font-semibold text-gray-900 hidden">Select Date</div>
            <!-- Hidden title to match screenshot style if needed, or we can keep it clean -->
        </div>

        <!-- Picker Container -->
        <div class="relative flex-1 flex w-full h-[200px] overflow-hidden">
            <!-- Highlight Bar (Center Overlay) -->
            <div
                class="absolute top-1/2 left-0 w-full h-[40px] -translate-y-1/2 z-10 pointer-events-none border-t border-b border-gray-200 bg-gray-50/30">
            </div>

            <!-- Gradient Overlays for Fading Effect -->
            <div
                class="absolute top-0 left-0 w-full h-[30%] bg-gradient-to-b from-white via-white/80 to-transparent z-20 pointer-events-none">
            </div>
            <div
                class="absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-t from-white via-white/80 to-transparent z-20 pointer-events-none">
            </div>

            <!-- Month Column -->
            <div class="flex-1 h-full overflow-y-scroll snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                ref="monthScroller" @scroll="handleScroll('month')">
                <div class="h-[80px]"></div> <!-- Padding top -->
                <div v-for="(m, i) in monthNames" :key="m"
                    class="h-[40px] flex items-center justify-center snap-center text-lg transition-all duration-200 cursor-pointer"
                    :class="selectedMonth === i ? 'font-semibold text-pink-500 scale-110' : 'text-gray-400 font-medium'"
                    @click="scrollTo(i, 'month')">
                    {{ m }}
                </div>
                <div class="h-[80px]"></div> <!-- Padding bottom -->
            </div>

            <!-- Year Column -->
            <div class="flex-1 h-full overflow-y-scroll snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                ref="yearScroller" @scroll="handleScroll('year')">
                <div class="h-[80px]"></div> <!-- Padding top -->
                <div v-for="y in years" :key="y"
                    class="h-[40px] flex items-center justify-center snap-center text-lg transition-all duration-200 cursor-pointer"
                    :class="selectedYear === y ? 'font-semibold text-pink-500 scale-110' : 'text-gray-400 font-medium'"
                    @click="scrollTo(y, 'year')">
                    {{ y }}
                </div>
                <div class="h-[80px]"></div> <!-- Padding bottom -->
            </div>
        </div>

        <!-- Done Button -->
        <div class="mt-4">
            <button @click="confirmDate"
                class="w-full py-3 bg-[#FF0066] outline-none text-white rounded-xl font-semibold text-lg hover:bg-pink-600 transition-colors active:scale-95 shadow-md">
                Done
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';

const props = defineProps({
    currentDate: {
        type: Date,
        default: () => new Date()
    }
});

const emit = defineEmits(['update:date', 'close']);

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Generate years (current year +/- 50 or custom range)
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 50 }, (_, i) => currentYear - 5 + i);

const selectedMonth = ref(props.currentDate.getMonth());
const selectedYear = ref(props.currentDate.getFullYear());

const monthScroller = ref(null);
const yearScroller = ref(null);

const itemHeight = 40; // px

const scrollTo = (val, type) => {
    if (type === 'month') {
        selectedMonth.value = val;
        if (monthScroller.value) {
            monthScroller.value.scrollTo({
                top: val * itemHeight,
                behavior: 'smooth'
            });
        }
    } else if (type === 'year') {
        selectedYear.value = val;
        const index = years.indexOf(val);
        if (index !== -1 && yearScroller.value) {
            yearScroller.value.scrollTo({
                top: index * itemHeight,
                behavior: 'smooth'
            });
        }
    }
};

let scrollTimeout = null;

const handleScroll = (type) => {
    const el = type === 'month' ? monthScroller.value : yearScroller.value;
    if (!el) return;

    clearTimeout(scrollTimeout);

    // Calculate center item
    const scrollTop = el.scrollTop;
    const index = Math.round(scrollTop / itemHeight);

    if (type === 'month') {
        if (index >= 0 && index < monthNames.length) {
            // Don't set immediately to avoid jitter, just update visual if needed
            // ensuring we clamp values
            const safeIndex = Math.max(0, Math.min(index, monthNames.length - 1));
            if (Math.abs(el.scrollTop - (safeIndex * itemHeight)) < 5) { // Snapped
                selectedMonth.value = safeIndex;
            }
        }
    } else {
        if (index >= 0 && index < years.length) {
            const safeIndex = Math.max(0, Math.min(index, years.length - 1));
            if (Math.abs(el.scrollTop - (safeIndex * itemHeight)) < 5) { // Snapped
                selectedYear.value = years[safeIndex];
            }
        }
    }

    // Debounce final setting
    scrollTimeout = setTimeout(() => {
        const finalIndex = Math.round(el.scrollTop / itemHeight);
        if (type === 'month') selectedMonth.value = Math.max(0, Math.min(finalIndex, monthNames.length - 1));
        else selectedYear.value = years[Math.max(0, Math.min(finalIndex, years.length - 1))];
    }, 100);
};

// Initial scroll position
const initializeScroll = () => {
    // Small delay to ensure popup animation/transitions don't prevent scroll setting
    setTimeout(() => {
        nextTick(() => {
            if (monthScroller.value) {
                monthScroller.value.scrollTop = selectedMonth.value * itemHeight;
            }
            if (yearScroller.value) {
                const yearIndex = years.indexOf(selectedYear.value);
                if (yearIndex !== -1) {
                    yearScroller.value.scrollTop = yearIndex * itemHeight;
                }
            }
        });
    }, 50);
};

onMounted(() => {
    initializeScroll();
});

watch(() => props.currentDate, (newVal) => {
    selectedMonth.value = newVal.getMonth();
    selectedYear.value = newVal.getFullYear();
    initializeScroll();
});

const confirmDate = () => {
    const newDate = new Date(selectedYear.value, selectedMonth.value, 1);
    emit('update:date', newDate);
    emit('close');
};
</script>
