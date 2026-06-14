<script setup>
import { ref } from 'vue';

const accordionItems = ref([
    {
        title: '1-on-1 Account Management',
        content: 'A dedicated representation to engage your fan community on your behalf.',
        isOpen: true
    },
    {
        title: 'Production & Promotion',
        content: 'A dedicated representation to engage your fan community on your behalf.',
        isOpen: false
    },
    {
        title: 'Premium Visibility',
        content: 'A dedicated representation to engage your fan community on your behalf.',
        isOpen: false
    }
]);

const toggleAccordion = (index) => {
    accordionItems.value.forEach((item, i) => {
        if (i === index) {
            item.isOpen = !item.isOpen;
        } else {
            item.isOpen = false;
        }
    });
};
</script>

<template>
    <div
        class="w-full bg-[url('https://i.ibb.co.com/5WQ43b48/sample-bg-image-compressed.webp')] bg-cover [background-position:top_center] bg-no-repeat">
        <div
            class="flex flex-col gap-4 w-full h-full px-4 py-12 bg-[linear-gradient(180deg,rgba(251,91,162,0.45)_0%,rgba(255,4,100,0.81)_100%)] relative xl:px-12 xl:py-[4.875rem]">
            <!-- blur-overlay -->
            <div class="absolute inset-0 w-full h-full backdrop-blur-[5px] pointer-events-none z-[-1]"></div>

            <div class="flex flex-col gap-2 md:justify-center md:items-center md:gap-6">
                <!-- title-section (Mobile/Tablet) -->
                <div class="flex flex-col gap-2 py-2.5 drop-shadow-[0_0_4px_#00000040] md:py-0 xl:hidden">
                    <h2
                        class="text-2xl font-semibold text-white md:text-4xl md:leading-[2.75rem] md:-tracking-[0.045rem] dark:text-[#e8e6e3]">
                        Ditch the Agency Middleman</h2>
                    <p class="text-base font-semibold text-white md:text-2xl dark:text-[#e8e6e3]">Your Platform is Now
                        Your Full-Service Team.</p>
                </div>

                <div class="flex flex-col gap-4 pb-2 md:items-center md:flex-row md:gap-0 md:pb-0">
                    <!-- description -->
                    <div class="flex flex-col gap-10 md:flex-1 xl:drop-shadow-[0_0_4px_#00000040]">
                        <div class="flex flex-col gap-6">
                            <!-- title-section (Desktop) -->
                            <div class="hidden xl:flex flex-col gap-2">
                                <h2
                                    class="text-4xl leading-[2.75rem] font-semibold -tracking-[0.045rem] text-white dark:text-[#e8e6e3]">
                                    Ditch the Agency Middleman</h2>
                                <p class="text-2xl font-semibold text-white dark:text-[#e8e6e3]">Your Platform is Now
                                    Your Full-Service Team.</p>
                            </div>

                            <p
                                class="text-base font-medium text-white md:text-xl md:leading-normal dark:text-[#e8e6e3]">
                                Why pay an outside agency when there is a team of agent-level experts in Our Website?
                                Selected creators get 1-on-1 expert support completely free of commission fees or 3rd
                                party charges. Let our in-house support team handle your outreach and growth while you
                                focus on creating. </p>
                        </div>

                        <button
                            class="hidden xl:flex justify-center items-center px-4 py-2.5 w-max bg-[#0C111D] group/button hover:bg-[#07F468] dark:bg-[#0a0e17] dark:hover:bg-[#06c454]">
                            <span
                                class="text-xl leading-normal font-semibold text-[#07F468] group-hover/button:text-[#0C111D] dark:text-[#23f97b] dark:group-hover/button:text-[#dbd8d3]">SIGN
                                UP & GET DISCOVERED</span>
                        </button>
                    </div>

                    <!-- accordion-container -->
                    <div class="flex flex-col md:flex-1 w-full">
                        <div v-for="(item, index) in accordionItems" :key="index"
                            :class="['flex flex-col py-4 border-b border-white group/accordion-item md:px-4 md:py-6 xl:min-h-[7rem] xl:justify-center dark:border-[#303436]', { 'open': item.isOpen }]">
                            <button @click="toggleAccordion(index)"
                                class="flex justify-between items-center w-full outline-none border-none bg-transparent">
                                <span
                                    class="text-lg font-semibold text-left drop-shadow-[0_0_4px_#00000040] text-white md:text-2xl dark:text-[#e8e6e3]">{{
                                    item.title }}</span>

                                <div class="flex justify-center items-center w-6 h-6">
                                    <img v-if="!item.isOpen" loading="lazy"
                                        src="https://i.ibb.co.com/Vpx4ccZ0/plus-square.webp" alt="plus square"
                                        class="w-6 h-6 min-w-[1.5rem]" />
                                    <img v-else loading="lazy" src="https://i.ibb.co.com/VYYz44p3/minus-square.webp"
                                        alt="minus square" class="w-6 h-6 min-w-[1.5rem]" />
                                </div>
                            </button>

                            <div class="pr-8 overflow-hidden transition-all duration-300"
                                :style="{ maxHeight: item.isOpen ? '200px' : '0', opacity: item.isOpen ? '1' : '0', marginTop: item.isOpen ? '1rem' : '0' }">
                                <p class="text-base font-medium text-white dark:text-[#e8e6e3]">{{ item.content }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    class="flex justify-center items-center px-4 py-2.5 bg-[#0C111D] group/button hover:bg-[#07F468] xl:hidden dark:bg-[#0a0e17] dark:hover:bg-[#06c454]">
                    <span
                        class="text-lg font-semibold text-[#07F468] group-hover/button:text-[#0C111D] md:text-xl md:leading-normal dark:text-[#23f97b] dark:group-hover/button:text-[#dbd8d3]">SIGN
                        UP & GET DISCOVERED</span>
                </button>
            </div>
        </div>
    </div>
</template>
