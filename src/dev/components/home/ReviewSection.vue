<script setup>
import { Splide, SplideSlide } from '@splidejs/vue-splide';
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll';
import '@splidejs/vue-splide/css';

const reviews = [
    {
        bg: 'https://i.ibb.co.com/vxMgZvJD/hero-bg-image-1-1.webp',
        avatar: 'https://i.ibb.co.com/70sHrpv/featured-media-bg.webp',
        handle: '@lylaaaboo',
        text: "Having a dedicated account manager at Our website means I always have someone in my corner. They plan my long-term goals and celebrate my wins. It's more than a service; it's a true partnership."
    },
    {
        bg: 'https://i.ibb.co.com/wNtVT4r0/hero-bg-image-0-2.webp',
        avatar: 'https://i.ibb.co.com/70sHrpv/featured-media-bg.webp',
        handle: '@pictureuna',
        text: "The ‘full-service’ promise is real. I have a dedicated account manager, a content strategist, and a promo team. Our website handle the analytics so I can handle the art. My content is authentic because I’m not burnt out on the business side."
    },
    {
        bg: 'https://i.ibb.co.com/j9b5wvYV/hero-bg-image-2-2.webp',
        avatar: 'https://i.ibb.co.com/70sHrpv/featured-media-bg.webp',
        handle: '@pictureuna',
        text: "Having a strategist, a manager, and a promo expert dedicated to my success makes all the difference. I'm not just using a platform; I'm part of an ecosystem that wants me to win. 🏆"
    }
];

const splideOptions = {
    type: 'loop',
    fixedWidth: '15rem',
    fixedHeight: '19.919rem',
    gap: '1rem',
    arrows: false,
    pagination: false,
    drag: 'free',
    focus: 'center',
    direction: 'ltr',
    pauseOnHover: true,
    pauseOnFocus: false,
    mediaQuery: 'min',
    breakpoints: {
        768: {
            fixedWidth: '17.5rem',
            fixedHeight: '22.169rem',
        },
        1280: {
            fixedWidth: '21.875rem',
            fixedHeight: '19.919rem',
        }
    },
    autoScroll: {
        speed: 1,
    },
};

const extensions = { AutoScroll };
</script>

<template>
    <div
        class="w-full flex flex-col gap-6 bg-[#EAECF0] bg-[linear-gradient(180deg,rgba(255,255,255,0.75)_70%,rgba(255,255,255,0)_100%)] py-16 md:gap-10 md:py-20 dark:bg-[#222526] relative overflow-hidden">
        <!-- blur-overlay -->
        <div class="absolute inset-0 w-full h-full backdrop-blur-[25px] pointer-events-none z-[-1]"></div>

        <!-- title-container -->
        <div class="px-4 py-2.5">
            <h2
                class="text-2xl font-semibold text-center text-[#344054] md:text-4xl md:leading-[2.75rem] md:-tracking-[0.045rem] dark:text-[#bdb8af]">
                Real Creators. Real Success.</h2>
        </div>

        <Splide :options="splideOptions" :extensions="extensions">
            <SplideSlide v-for="(review, index) in reviews" :key="index" class="cursor-pointer">
                <div class="w-full h-full flex flex-col justify-between gap-4 p-4 rounded-[0.625rem] overflow-hidden bg-cover bg-center bg-no-repeat xl:p-6"
                    :style="{ backgroundImage: `linear-gradient(180deg,rgba(24,34,48,0.52) 0%,rgba(24,34,48,0.8) 100%), url(${review.bg})` }">
                    <div class="flex flex-col gap-4">
                        <img loading="lazy" src="https://i.ibb.co.com/kgq8zCfd/quote-green.webp" alt="quote green"
                            class="w-6">
                        <p
                            class="text-sm line-clamp-[9] text-[#F2F4F7] md:text-base xl:line-clamp-[7] dark:text-[#e1dfdb]">
                            {{ review.text }}</p>
                    </div>

                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12">
                            <img loading="lazy" :src="review.avatar" alt="avatar"
                                class="w-full h-full object-cover rounded-full">
                        </div>
                        <span class="text-base font-medium text-[#F2F4F7] dark:text-[#e1dfdb]">{{ review.handle
                        }}</span>
                    </div>
                </div>
            </SplideSlide>
        </Splide>
    </div>
</template>
