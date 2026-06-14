<script setup>
import { ref, defineProps } from 'vue';
import { Splide, SplideSlide } from '@splidejs/vue-splide';
import '@splidejs/vue-splide/css';

const props = defineProps({
    title: String,
    icon: String,
    mediaItems: Array
});

const splide1 = ref(null);
const splide2 = ref(null);

const options = {
    type: 'loop',
    gap: '1rem',
    arrows: false,
    pagination: false,
    focus: 'center',
    perMove: 1,
    fixedWidth: '20rem',
    mediaQuery: 'min',
    breakpoints: {
        768: { fixedWidth: '22.5rem' },
        1280: { fixedWidth: '24.444rem' },
    },
};

const next = () => {
    if (splide1.value) splide1.value.go('>');
};

const prev = () => {
    if (splide1.value) splide1.value.go('<');
};
</script>

<template>
    <div class="flex flex-col gap-10 pt-10 relative  md:gap-16 overflow-hidden">
        <!-- blur-overlay -->
        <div class="absolute inset-0 w-full h-full backdrop-blur-[50px] pointer-events-none z-[-1]"></div>

        <!-- slides-wrapper -->
        <div class="flex flex-col gap-4 md:gap-6">
            <!-- title-section -->
            <div class="flex justify-between items-center gap-2 px-4 xl:px-12">
                <div class="flex items-center gap-2 md:gap-4">
                    <img loading="lazy" :src="icon" alt="icon"
                        class="w-6 h-6 min-w-[1.5rem] md:w-8 md:h-8 md:min-w-[2rem]">
                    <h2
                        class="text-xl leading-normal font-semibold text-[#344054] md:text-3xl md:leading-[2.375rem] dark:text-[#bdb8af]">
                        {{ title }}</h2>
                </div>

                <!-- arrow-buttons -->
                <div class="flex items-center gap-2 slider-arrows md:gap-4">
                    <button @click="prev"
                        class="flex justify-center items-center w-10 h-10 rounded-full border border-black/50 backdrop-blur-[10px] cursor-pointer group/button md:w-12 md:h-12 dark:border-[#363b3d]/50">
                        <img loading="lazy" src="https://i.ibb.co.com/wvMNs1P/chevron-right.webp" alt="chevron right"
                            class="h-7 rotate-180 md:h-9">
                    </button>

                    <button @click="next"
                        class="flex justify-center items-center w-10 h-10 rounded-full border border-black/50 backdrop-blur-[10px] cursor-pointer group/button md:w-12 md:h-12 dark:border-[#363b3d]/50">
                        <img loading="lazy" src="https://i.ibb.co.com/wvMNs1P/chevron-right.webp" alt="chevron right"
                            class="h-7 md:h-9">
                    </button>
                </div>
            </div>

            <div class="flex flex-col gap-4">
                <!-- Row 1 -->
                <Splide :options="options" ref="splide1" :has-track="false">
                    <div class="splide__track">
                        <ul class="splide__list">
                            <SplideSlide v-for="(item, idx) in mediaItems" :key="idx"
                                class="aspect-[16/9] rounded-lg bg-cover bg-center bg-no-repeat overflow-hidden cursor-pointer"
                                :style="{ backgroundImage: `url(${item.bg})` }">
                                <div
                                    class="flex flex-col justify-between gap-2 p-2 w-full h-full bg-[linear-gradient(180deg,rgba(0,0,0,0)_50%,rgba(0,0,0,0.5)_100%)] md:p-3">
                                    <div
                                        class="flex justify-center items-center gap-[0.1875rem] w-max px-1 py-[0.0625rem] rounded bg-[#182230]/50 dark:bg-[#1f2c3f]/50">
                                        <img loading="lazy" :src="item.typeIcon" alt="type" class="w-4 h-4" />
                                        <span
                                            class="text-xs leading-normal align-middle text-white dark:text-[#e8e6e3]">{{
                                            item.meta }}</span>
                                    </div>

                                    <div class="flex items-center gap-2">
                                        <div
                                            class="flex justify-center items-center w-9 h-9 min-w-[2.25rem] rounded-full overflow-hidden md:w-12 md:h-12 md:min-w-[3rem]">
                                            <img loading="lazy" :src="item.avatar" alt="avatar"
                                                class="w-full h-full object-cover">
                                        </div>
                                        <div class="flex flex-col justify-between">
                                            <h3
                                                class="text-sm font-medium line-clamp-2 text-[#F2F4F7] md:text-base dark:text-[#e1dfdb]">
                                                {{ item.name }}</h3>
                                            <div class="flex items-center gap-1">
                                                <span
                                                    class="text-xs leading-normal font-medium line-clamp-1 text-[#FCFCFD] dark:text-[#e6e4e1]">{{
                                                    item.handle }}</span>
                                                <img loading="lazy"
                                                    src="https://i.ibb.co.com/nMhY8CpS/svgviewer-png-output-22.webp"
                                                    alt="verified" class="w-3 h-3" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SplideSlide>
                        </ul>
                    </div>
                </Splide>

                <!-- Row 2 -->
                <Splide :options="options" ref="splide2" :has-track="false">
                    <div class="splide__track md:!pl-[25rem]">
                        <ul class="splide__list">
                            <SplideSlide v-for="(item, idx) in [...mediaItems].reverse()" :key="idx"
                                class="aspect-[16/9] rounded-lg bg-cover bg-center bg-no-repeat overflow-hidden cursor-pointer"
                                :style="{ backgroundImage: `url(${item.bg})` }">
                                <div
                                    class="flex flex-col justify-between gap-2 p-2 w-full h-full bg-[linear-gradient(180deg,rgba(0,0,0,0)_50%,rgba(0,0,0,0.5)_100%)] md:p-3">
                                    <div
                                        class="flex justify-center items-center gap-[0.1875rem] w-max px-1 py-[0.0625rem] rounded bg-[#182230]/50 dark:bg-[#1f2c3f]/50">
                                        <img loading="lazy" :src="item.typeIcon" alt="type" class="w-4 h-4" />
                                        <span
                                            class="text-xs leading-normal align-middle text-white dark:text-[#e8e6e3]">{{
                                            item.meta }}</span>
                                    </div>

                                    <div class="flex items-center gap-2">
                                        <div
                                            class="flex justify-center items-center w-9 h-9 min-w-[2.25rem] rounded-full overflow-hidden md:w-12 md:h-12 md:min-w-[3rem]">
                                            <img loading="lazy" :src="item.avatar" alt="avatar"
                                                class="w-full h-full object-cover">
                                        </div>
                                        <div class="flex flex-col justify-between">
                                            <h3
                                                class="text-sm font-medium line-clamp-2 text-[#F2F4F7] md:text-base dark:text-[#e1dfdb]">
                                                {{ item?.name }}</h3>
                                            <div class="flex items-center gap-1">
                                                <span
                                                    class="text-xs leading-normal font-medium line-clamp-1 text-[#FCFCFD] dark:text-[#e6e4e1]">{{
                                                    item?.handle }}</span>
                                                <img loading="lazy"
                                                    src="https://i.ibb.co.com/nMhY8CpS/svgviewer-png-output-22.webp"
                                                    alt="verified" class="w-3 h-3" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SplideSlide>
                        </ul>
                    </div>
                </Splide>
            </div>
        </div>
    </div>
</template>
