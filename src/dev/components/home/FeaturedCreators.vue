<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Splide, SplideSlide } from '@splidejs/vue-splide';
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll';
import '@splidejs/vue-splide/css';

const featuredCreators = [
    { name: 'Yanice*', username: '@yanice', image: 'https://i.ibb.co.com/vxMgZvJD/hero-bg-image-1-1.webp' },
    { name: 'Yana Zein', username: '@yana', image: 'https://i.ibb.co.com/j9b5wvYV/hero-bg-image-2-2.webp' },
    { name: 'Yanice*', username: '@yanice', image: 'https://i.ibb.co.com/PJL8PSv/hero-bg-image-0-1.webp' },
    { name: 'Yana Zein', username: '@yana', image: 'https://i.ibb.co.com/wNtVT4r0/hero-bg-image-0-2.webp' },
];

const topSliderOptions = {
    type: 'loop',
    fixedWidth: '10.858rem',
    gap: '.5rem',
    arrows: false,
    pagination: false,
    drag: 'free',
    focus: 'center',
    direction: 'ltr',
    pauseOnHover: true,
    pauseOnFocus: false,
    autoScroll: {
        speed: 1,
    },
    breakpoints: {
        768: { fixedWidth: '13.75rem' },
        1280: { fixedWidth: '16.71rem' }
    }
};

const bottomSliderOptions = {
    ...topSliderOptions,
    autoScroll: {
        speed: -1,
    }
};

// Custom Cursor Logic
const creatorSection = ref(null);
const customCursor = ref(null);
const isInside = ref(false);
const cursorX = ref(0);
const cursorY = ref(0);

const handleMouseEnter = () => {
    isInside.value = true;
    document.body.style.cursor = 'none';
};

const handleMouseLeave = () => {
    isInside.value = false;
    document.body.style.cursor = '';
};

const handleMouseMove = (e) => {
    if (!creatorSection.value) return;
    const bounds = creatorSection.value.getBoundingClientRect();
    cursorX.value = e.clientX - bounds.left;
    cursorY.value = e.clientY - bounds.top;
};

const extensions = { AutoScroll };
</script>

<template>
    <div ref="creatorSection" class="flex flex-col gap-6 py-12 relative md:gap-10 md:py-16 xl:py-20 overflow-hidden"
        @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave" @mousemove="handleMouseMove">
        <!-- blur-overlay -->
        <div class="absolute inset-0 w-full h-full backdrop-blur-[25px] pointer-events-none z-[-1]"></div>

        <!-- custom-cursor -->
        <div ref="customCursor"
            :class="['absolute hidden md:flex flex-col justify-center items-center w-[5.5rem] h-[5.5rem] bg-[#07F468] rounded-full transition-opacity duration-150 pointer-events-none z-[100] dark:hover:bg-[#242b40]', { 'opacity-100 !flex': isInside, 'opacity-0': !isInside }]"
            :style="{ transform: `translate(${cursorX - 44}px, ${cursorY - 44}px)` }">
            <img loading="lazy" src="https://i.ibb.co.com/r2G9ggZ2/arrow-right.webp" alt="arrow-right" class="w-8 h-8">
            <span class="text-base font-medium text-black dark:text-[#e8e6e3]">Profile</span>
        </div>

        <!-- title-section -->
        <div class="flex flex-col text-center gap-2 py-2.5 z-[1] md:gap-6">
            <h2
                class="text-2xl font-semibold text-[#344054] md:text-4xl md:leading-[2.75rem] md:-tracking-[0.045rem] dark:text-[#bdb8af]">
                Featured Creator</h2>
            <p class="text-base font-semibold text-[#344054] md:text-xl md:leading-[1.875rem] dark:text-[#bdb8af]">100+
                content creator have already join us</p>
        </div>

        <!-- featured-creator-card-row-wrapper -->
        <div class="flex flex-col gap-2 z-[1]">
            <Splide :options="topSliderOptions" :extensions="extensions">
                <SplideSlide v-for="(creator, index) in featuredCreators" :key="index" class="aspect-[0.7636]">
                    <div :style="{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1),rgba(255,255,255,0.1)), url(${creator.image})` }"
                        class="w-full h-full opacity-90 rounded-[0.9375rem] flex flex-col justify-end items-center bg-cover bg-center bg-no-repeat md:rounded-[1.25rem]">
                        <div class="flex flex-col p-3 w-full md:gap-1 md:p-4 lg:px-3 xl:px-4">
                            <div class="flex flex-col drop-shadow-[0_4px_18px_#00000040] md:gap-1">
                                <h3
                                    class="text-base font-semibold text-white dark:text-[#e8e6e3] md:text-xl md:leading-normal xl:text-3xl xl:leading-[2.375rem]">
                                    {{ creator?.name }}</h3>
                                <span class="text-sm text-white xl:text-base xl:font-medium dark:text-[#e8e6e3]">{{
                                    creator?.username }}</span>
                            </div>
                        </div>
                    </div>
                </SplideSlide>
            </Splide>

            <Splide :options="bottomSliderOptions" :extensions="extensions">
                <SplideSlide v-for="(creator, index) in featuredCreators" :key="index" class="aspect-[0.7636]">
                    <div :style="{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1),rgba(255,255,255,0.1)), url(${creator.image})` }"
                        class="w-full h-full opacity-90 rounded-[0.625rem] flex flex-col justify-end items-center bg-cover bg-center bg-no-repeat md:rounded-[1.25rem]">
                        <div class="flex flex-col p-3 w-full md:gap-1 md:p-4 lg:px-3 xl:px-4">
                            <div class="flex flex-col drop-shadow-[0_4px_18px_#00000040] md:gap-1">
                                <h3
                                    class="text-base font-semibold text-left text-white dark:text-[#e8e6e3] md:text-xl md:leading-normal xl:text-3xl xl:leading-[2.375rem]">
                                    {{ creator.name }}</h3>
                                <span
                                    class="text-sm text-left text-white xl:text-base xl:font-medium dark:text-[#e8e6e3]">{{
                                    creator.username }}</span>
                            </div>
                        </div>
                    </div>
                </SplideSlide>
            </Splide>
        </div>
    </div>
</template>
