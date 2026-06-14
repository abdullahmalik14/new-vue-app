<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isMobileMenuOpen = ref(false);
const isScrolling = ref(false);

const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const handleScroll = () => {
    isScrolling.value = window.scrollY > 0;
};

onMounted(() => {
    window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
    <nav :class="[
        'sticky md:relative top-0 left-0 flex justify-between items-center gap-6 p-2 w-full bg-[linear-gradient(180deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0)_100%)] z-[100] transition-all duration-300 md:px-6 md:py-4',
        { 'bg-black/20 backdrop-blur-[10px]': isScrolling }
    ]">
        <div class="flex items-center gap-[3.375rem] opacity-70">
            <!-- logo -->
            <div class="flex justify-center items-center w-max opacity-80 h-10 md:h-auto">
                <img loading="lazy" src="https://i.ibb.co.com/27Gt3hwK/website-logo.webp" alt="website-logo"
                    class="w-full [filter:brightness(0)_saturate(100%)_invert(96%)_sepia(93%)_saturate(12%)_hue-rotate(312deg)_brightness(92%)_contrast(97%)]">
            </div>

 
            <ul class="hidden md:flex items-center gap-[3.375rem]">
                <li class="flex justify-center items-center w-max">
                    <a href="#"
                        class="text-xl leading-normal tracking-[0.0025rem] text-[#E7E5E4] dark:text-[#d8d5cf]">Model</a>
                </li>
                <li class="flex justify-center items-center w-max">
                    <a href="#"
                        class="text-xl leading-normal tracking-[0.0025rem] text-[#E7E5E4] dark:text-[#d8d5cf]">Discover</a>
                </li>
                <li class="flex justify-center items-center w-max">
                    <a href="#"
                        class="text-xl leading-normal tracking-[0.0025rem] text-[#E7E5E4] dark:text-[#d8d5cf]">Live</a>
                </li>
            </ul>
        </div>

        <!-- login-buttons -->
        <div class="hidden md:flex items-center gap-2">
            <button
                class="flex justify-center items-center px-1.5 bg-transparent outline-none border-none cursor-pointer">
                <span class="text-lg font-semibold text-[#07F468] dark:[#23f97b]">LOGIN</span>
            </button>

            <button
                class="flex justify-center items-center px-[1.375rem] py-1 [clip-path:polygon(0_0,calc(100%-14.6px)_0,100%_100%,14.6px_100%)] bg-[#07F468] group/button hover:bg-[#1D2334] dark:bg-[#0aff78] dark:hover:bg-[#242b40]">
                <span
                    class="text-lg font-semibold text-[#1D2334] group-hover/button:text-[#07F468] dark:text-[#cfcac4] dark:group-hover/button:text-[#23f97b]">SIGN
                    UP</span>
            </button>
        </div>

        <!-- hamburger-menu -->
        <div @click="toggleMobileMenu"
            class="flex md:hidden justify-center items-center w-8 h-8 opacity-70 cursor-pointer z-[100]">
            <img v-if="!isMobileMenuOpen" loading="lazy" src="https://i.ibb.co.com/5XY9bx19/menu-04.webp" alt="menu 04"
                class="w-full h-full [filter:brightness(0)_saturate(100%)_invert(93%)_sepia(8%)_saturate(79%)_hue-rotate(181deg)_brightness(102%)_contrast(91%)]">
            <img v-else loading="lazy" src="https://i.ibb.co.com/DfT6Sg5g/x-close.webp" alt="x close"
                class="w-full h-full [filter:brightness(0)_saturate(100%)_invert(93%)_sepia(8%)_saturate(79%)_hue-rotate(181deg)_brightness(102%)_contrast(91%)]">
        </div>

        <!-- mobile-menu -->
        <div v-if="isMobileMenuOpen"
            class="fixed top-0 left-0 w-full h-screen flex-col justify-end items-center z-[99] flex md:hidden">
            <div
                class="flex flex-col gap-6 justify-end items-center w-full min-h-[9.296rem] bg-[#121212e6] backdrop-blur-[5px] dark:bg-[#222526e6]">
                <div class="flex items-center gap-2 w-full">
                    <button
                        class="flex-1 flex justify-center items-center px-1.5 h-[4.25rem] bg-transparent outline-none border-none cursor-pointer">
                        <span class="text-lg font-semibold text-[#07F468] dark:[#23f97b]">LOGIN</span>
                    </button>

                    <button
                        class="flex-1 flex justify-center items-center px-[1.375rem] py-1 h-[4.25rem] [clip-path:polygon(0_0,100%_0,100%_100%,14.6px_100%)] bg-[#07F468] group/button hover:bg-[#1D2334] dark:bg-[#0aff78] dark:hover:bg-[#242b40]">
                        <span
                            class="text-lg font-semibold text-[#1D2334] group-hover/button:text-[#07F468] dark:text-[#cfcac4] dark:group-hover/button:text-[#23f97b]">SIGN
                            UP</span>
                    </button>
                </div>
            </div>
        </div>
    </nav>
</template>
