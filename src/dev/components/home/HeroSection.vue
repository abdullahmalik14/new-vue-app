<script setup>
import { Splide, SplideSlide } from '@splidejs/vue-splide';
import '@splidejs/vue-splide/css';
import { defineEmits, onMounted, ref } from 'vue';

const emit = defineEmits(['slideChange']);
const splideRef = ref(null);

const splideOptions = {
    type: 'fade',
    autoplay: true,
    interval: 5000,
    speed: 1000,
    rewind: true,
    pauseOnHover: false,
    pagination: false,
    arrows: false,
};

// Handle both move and moved for reliability across Splide versions
const onMove = (splide, newIndex) => {
    // If newIndex is not provided (e.g. from mounted event), use the splide's current index
    const index = (typeof newIndex === 'number') ? newIndex : splide.index;
    emit('slideChange', index);
};

onMounted(() => {
    // Initial sync immediately on mount
    emit('slideChange', 0);
});
</script>

<template>
    <header
        class="flex flex-col items-center gap-6 min-h-[calc(100vh-3.5rem)] px-4 pb-12 md:pb-4 lg:min-h-[calc(100vh-4.375rem)] lg:flex-row-reverse xl:px-12">
        <!-- hero-section__image-slider -->
        <div class="w-full flex justify-center items-center lg:min-h-[15.625rem]">
            <div
                class="w-[20rem] h-full aspect-[1.228659/1] p-0.5 md:w-[45rem] lg:w-[24.75rem] lg:min-h-[28rem] xl:w-[37rem] xl:h-[40rem]">
                <Splide ref="splideRef" :options="splideOptions" @splide:move="onMove" @splide:mounted="onMove"
                    @splide:moved="onMove" class="w-full h-full">
                    <!-- Slide 0 -->
                    <SplideSlide class="overflow-visible group/splide-item">
                        <div
                            class="relative w-full h-full flex justify-center items-center pointer-events-none group-[.is-active]/splide-item:pointer-events-auto group-[.is-active]/splide-item:animate-profileCrossfade">
                            <div
                                class="w-[7.829rem] h-[13.925rem] md:w-[17.578rem] md:h-[31.266rem] lg:w-[12.235rem] lg:h-[21.76rem] xl:w-[17.578rem] xl:h-[31.2656rem]">
                                <img loading="lazy"
                                    class="absolute z-[1] bottom-0 left-0 w-[6.18rem] h-[3.51rem] object-cover rounded-[0.2225rem] shadow-[0_1.78px_7.13px_0_#00000040] transition-[opacity,transform] group-[.is-active]/splide-item:animate-driftLeft md:w-[13.875rem] md:h-[7.875rem] md:rounded-lg md:shadow-[0_4px_16px_0_#00000040] lg:w-[9.6575rem] lg:h-[6.699rem] lg:rounded-[0.348rem] lg:shadow-[0_2.78px_11.14px_0_#00000040] lg:group-[.is-active]/splide-item:animate-driftLeftDesktop xl:w-[13.875rem] xl:h-[9.625rem] xl:rounded-lg xl:shadow-[0_4px_16px_0_#00000040]"
                                    src="https://i.ibb.co.com/j9b5wvYV/hero-bg-image-2-2.webp" />
                                <img loading="lazy"
                                    class="relative z-0 w-[7.829rem] h-[13.925rem] object-cover rounded-[0.42rem] shadow-[0_0_21.38px_-3.56px_#00000066] md:w-[17.578rem] md:h-[31.266rem] md:shadow-[0_0_48px_-8px_#00000066] md:rounded-[0.9375rem] lg:w-[12.235rem] lg:h-[21.76rem] lg:rounded-[0.6525rem] lg:shadow-[0_0_33.41px_-5.57px_#00000066] xl:w-[17.578rem] xl:h-[31.2656rem] xl:rounded-[0.9375rem] xl:shadow-[0_0_48px_-8px_#00000066]"
                                    src="https://i.ibb.co.com/H65C6Tk/hero-bg-video-1.webp" />
                                <img loading="lazy"
                                    class="absolute z-[1] top-12 right-0 w-[4.345rem] h-[6.263rem] object-cover rounded-[0.2225rem] shadow-[0_1.78px_7.13px_0_#00000040] transition-[opacity,transform] group-[.is-active]/splide-item:animate-driftRight md:top-24 md:w-[9.75rem] md:h-[14.0625rem] md:rounded-lg md:shadow-[0_4px_16px_0_#00000040] lg:w-[6.788rem] lg:h-[9.786rem] lg:rounded-[0.348rem] lg:shadow-[0_2.78px_11.14px_0_#00000040] lg:group-[.is-active]/splide-item:animate-driftRightDesktop xl:top-[8rem] xl:w-[9.75rem] xl:h-[14.0625rem] xl:rounded-lg xl:shadow-[0_4px_16px_0_#00000040]"
                                    src="https://i.ibb.co.com/PJL8PSv/hero-bg-image-0-1.webp" />
                            </div>
                        </div>
                    </SplideSlide>

                    <!-- Slide 1 -->
                    <SplideSlide class="overflow-visible group/splide-item">
                        <div
                            class="relative w-full h-full flex justify-center items-center pointer-events-none group-[.is-active]/splide-item:pointer-events-auto group-[.is-active]/splide-item:animate-profileCrossfade">
                            <div
                                class="w-[7.829rem] h-[13.925rem] md:w-[17.578rem] md:h-[31.266rem] lg:w-[12.235rem] lg:h-[21.76rem] xl:w-[17.578rem] xl:h-[31.2656rem]">
                                <img loading="lazy"
                                    class="absolute z-[1] bottom-0 left-0 w-[6.18rem] h-[3.51rem] object-cover rounded-[0.2225rem] shadow-[0_1.78px_7.13px_0_#00000040] transition-[opacity,transform] group-[.is-active]/splide-item:animate-driftLeft md:w-[13.875rem] md:h-[7.875rem] md:rounded-lg md:shadow-[0_4px_16px_0_#00000040] lg:w-[9.6575rem] lg:h-[6.699rem] lg:rounded-[0.348rem] lg:shadow-[0_2.78px_11.14px_0_#00000040] lg:group-[.is-active]/splide-item:animate-driftLeftDesktop xl:w-[13.875rem] xl:h-[9.625rem] xl:rounded-lg xl:shadow-[0_4px_16px_0_#00000040]"
                                    src="https://i.ibb.co.com/S4vnSYPw/hero-bg-image-1-2.webp" />
                                <img loading="lazy"
                                    class="relative z-0 w-[7.829rem] h-[13.925rem] object-cover rounded-[0.42rem] shadow-[0_0_21.38px_-3.56px_#00000066] md:w-[17.578rem] md:h-[31.266rem] md:shadow-[0_0_48px_-8px_#00000066] md:rounded-[0.9375rem] lg:w-[12.235rem] lg:h-[21.76rem] lg:rounded-[0.6525rem] lg:shadow-[0_0_33.41px_-5.57px_#00000066] xl:w-[17.578rem] xl:h-[31.2656rem] xl:rounded-[0.9375rem] xl:shadow-[0_0_48px_-8px_#00000066]"
                                    src="https://i.ibb.co.com/nMgQC5R7/hero-bg-video-2.webp" />
                                <img loading="lazy"
                                    class="absolute z-[1] top-12 right-0 w-[4.345rem] h-[6.263rem] object-cover rounded-[0.2225rem] shadow-[0_1.78px_7.13px_0_#00000040] transition-[opacity,transform] group-[.is-active]/splide-item:animate-driftRight md:top-24 md:w-[9.75rem] md:h-[14.0625rem] md:rounded-lg md:shadow-[0_4px_16px_0_#00000040] lg:w-[6.788rem] lg:h-[9.786rem] lg:rounded-[0.348rem] lg:shadow-[0_2.78px_11.14px_0_#00000040] lg:group-[.is-active]/splide-item:animate-driftRightDesktop xl:top-[8rem] xl:w-[9.75rem] xl:h-[14.0625rem] xl:rounded-lg xl:shadow-[0_4px_16px_0_#00000040]"
                                    src="https://i.ibb.co.com/M5Q8qb4F/hero-bg-image-2-1.webp" />
                            </div>
                        </div>
                    </SplideSlide>

                    <!-- Slide 2 -->
                    <SplideSlide class="overflow-visible group/splide-item">
                        <div
                            class="relative w-full h-full flex justify-center items-center pointer-events-none group-[.is-active]/splide-item:pointer-events-auto group-[.is-active]/splide-item:animate-profileCrossfade">
                            <div
                                class="w-[7.829rem] h-[13.925rem] md:w-[17.578rem] md:h-[31.266rem] lg:w-[12.235rem] lg:h-[21.76rem] xl:w-[17.578rem] xl:h-[31.2656rem]">
                                <img loading="lazy"
                                    class="absolute z-[1] bottom-0 left-0 w-[6.18rem] h-[3.51rem] object-cover rounded-[0.2225rem] shadow-[0_1.78px_7.13px_0_#00000040] transition-[opacity,transform] group-[.is-active]/splide-item:animate-driftLeft md:w-[13.875rem] md:h-[7.875rem] md:rounded-lg md:shadow-[0_4px_16px_0_#00000040] lg:w-[9.6575rem] lg:h-[6.699rem] lg:rounded-[0.348rem] lg:shadow-[0_2.78px_11.14px_0_#00000040] lg:group-[.is-active]/splide-item:animate-driftLeftDesktop xl:w-[13.875rem] xl:h-[9.625rem] xl:rounded-lg xl:shadow-[0_4px_16px_0_#00000040]"
                                    src="https://i.ibb.co.com/vxMgZvJD/hero-bg-image-1-1.webp" />
                                <img loading="lazy"
                                    class="relative z-0 w-[7.829rem] h-[13.925rem] object-cover rounded-[0.42rem] shadow-[0_0_21.38px_-3.56px_#00000066] md:w-[17.578rem] md:h-[31.266rem] md:shadow-[0_0_48px_-8px_#00000066] md:rounded-[0.9375rem] lg:w-[12.235rem] lg:h-[21.76rem] lg:rounded-[0.6525rem] lg:shadow-[0_0_33.41px_-5.57px_#00000066] xl:w-[17.578rem] xl:h-[31.2656rem] xl:rounded-[0.9375rem] xl:shadow-[0_0_48px_-8px_#00000066]"
                                    src="https://i.ibb.co.com/qFYHhCb7/hero-bg-video-3.webp" />
                                <img loading="lazy"
                                    class="absolute z-[1] top-12 right-0 w-[4.345rem] h-[6.263rem] object-cover rounded-[0.2225rem] shadow-[0_1.78px_7.13px_0_#00000040] transition-[opacity,transform] group-[.is-active]/splide-item:animate-driftRight md:top-24 md:w-[9.75rem] md:h-[14.0625rem] md:rounded-lg md:shadow-[0_4px_16px_0_#00000040] lg:w-[6.788rem] lg:h-[9.786rem] lg:rounded-[0.348rem] lg:shadow-[0_2.78px_11.14px_0_#00000040] lg:group-[.is-active]/splide-item:animate-driftRightDesktop xl:top-[8rem] xl:w-[9.75rem] xl:h-[14.0625rem] xl:rounded-lg xl:shadow-[0_4px_16px_0_#00000040]"
                                    src="https://i.ibb.co.com/wNtVT4r0/hero-bg-image-0-2.webp" />
                            </div>
                        </div>
                    </SplideSlide>
                </Splide>
            </div>
        </div>

        <!-- hero-section__text-section -->
        <div class="flex flex-col gap-6 w-full">
            <!-- text-container -->
            <div class="flex flex-col gap-2 md:gap-5 md:max-w-[36.375rem]">
                <!-- title -->
                <section class="flex flex-col gap-1 md:gap-2">
                    <h1
                        class="text-4xl leading-[2.75rem] font-semibold italic -tracking-[0.045rem] drop-shadow-[0_4px_9.6px_#00000040] text-white md:text-[3.25rem] md:leading-[3.75rem] md:-tracking-[0.065rem] dark:text-[#e8e6e3]">
                        Make money</h1>
                    <p
                        class="text-base font-semibold italic text-white dark:text-[#e8e6e3] md:text-3xl md:leading-[2.375rem] md:font-medium md:not-italic">
                        with the best all in one social platform.</p>
                </section>

                <p class="text-sm opacity-90 pr-0.5 text-white md:text-base dark:text-[#e8e6e3]">Our website puts
                    everything you sell-Videos, image gallery, Audio clips, merch, products, even paid calls—into one
                    platform so fans can buy in seconds and you get paid fast.</p>
            </div>

            <!-- input-container -->
            <div class="flex flex-col gap-5 md:gap-6">
                <div class="flex flex-col gap-5 md:max-w-[37.25rem] md:flex-row md:gap-0">
                    <!-- username-input -->
                    <div class="h-12 overflow-visible md:grow">
                        <div
                            class="relative flex justify-center items-center gap-2 px-3 h-[3.25rem] backdrop-blur-[6px] rounded-md overflow-hidden border border-[#d0d5dd]/50 bg-white/10 md:rounded-l-md md:rounded-r-none dark:border-[#3b4043]/50 dark:bg-[#181a1b]/10">
                            <input type="text"
                                class="bg-transparent border-none outline-none grow peer text-lg text-[#F9FAFB] dark:text-[#e5e3df]">
                            <div
                                class="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none peer-focus:hidden peer-not-placeholder-shown:hidden">
                                <span class="text-lg text-[#F9FAFB] dark:text-[#e5e3df]">ourwebsite.app/@</span>
                                <span class="text-lg opacity-70 text-[#07F468] dark:[#23f97b]">username</span>
                            </div>
                        </div>
                    </div>

                    <!-- join-button -->
                    <button
                        class="flex justify-center items-center w-full px-4 py-2.5 bg-[#07F468] group/button hover:bg-[#1D2334] md:w-max md:h-[3.25rem] md:rounded-r-md dark:bg-[#0aff78] dark:hover:bg-[#242b40]">
                        <span
                            class="text-lg font-semibold text-[#1D2334] group-hover/button:text-[#07F468] md:text-xl md:leading-normal dark:text-[#cfcac4] dark:group-hover/button:text-[#23f97b]">JOIN
                            AS CREATOR</span>
                    </button>
                </div>

                <!-- sign-up-as-fan button -->
                <button
                    class="flex justify-center items-center px-2 py-0.5 mx-auto w-max bg-transparent border-none outline-none opacity-95 md:ml-0">
                    <p class="text-xl leading-normal underline text-[#D0D5DD] dark:text-[#cfcac4]">Sign up as Fan</p>
                </button>
            </div>
        </div>
    </header>
</template>
