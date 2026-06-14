<script setup>
import { ref, onMounted } from 'vue';

const faqItems = ref([
    {
        question: 'Who can join our website?',
        answer: 'A dedicated representation to engage your fan community on your behalf.',
        isOpen: false
    },
    {
        question: 'How does our website protect my personal data and intellectual property?',
        answer: 'A dedicated representation to engage your fan community on your behalf.',
        isOpen: false
    },
    {
        question: 'Can I customize the FAQ layout?',
        answer: 'A dedicated representation to engage your fan community on your behalf.',
        isOpen: false
    },
    {
        question: 'Is there a mobile app available?',
        answer: 'A dedicated representation to engage your fan community on your behalf.',
        isOpen: false
    },
    {
        question: 'How can I contact support?',
        answer: 'A dedicated representation to engage your fan community on your behalf.',
        isOpen: false
    }
]);

const toggleFaq = (index) => {
    const item = faqItems.value[index];
    const prevState = item.isOpen;

    // Close all
    faqItems.value.forEach(i => i.isOpen = false);

    // Toggle clicked
    item.isOpen = !prevState;
};
</script>

<template>
    <div
        class="flex flex-col px-4 py-10 backdrop-blur-[25px] bg-[#EAECF0] bg-[linear-gradient(180deg,rgba(255,255,255,0.75)_70%,rgba(255,255,255,0)_100%)] md:py-20 xl:px-12 dark:bg-[#222526]">
        <div class="flex flex-col gap-12">
            <h2
                class="text-2xl font-semibold text-center text-[#344054] md:text-4xl md:leading-[2.75rem] md:-tracking-[0.045rem] dark:text-[#bdb8af]">
                Frequently Asked Questions</h2>

            <!-- accordion-container -->
            <div class="flex flex-col">
                <!-- Accordion Item -->
                <div v-for="(item, index) in faqItems" :key="index"
                    :class="['flex flex-col py-6 border-t-[1.5px] border-[#344054]/20 group/accordion-item dark:border-[#323e52]/20', { 'open': item.isOpen }]">
                    <button @click="toggleFaq(index)"
                        class="flex justify-between items-center gap-2 w-full outline-none border-none bg-transparent">
                        <span
                            class="text-base font-semibold text-left text-[#344054] md:text-xl md:leading-normal dark:text-[#bdb8af]">{{
                            item.question }}</span>

                        <div class="flex justify-center items-center w-6 h-6">
                            <img loading="lazy" src="https://i.ibb.co.com/hx7V3xst/chevron-down.webp" alt="chevron down"
                                :class="['w-6 h-6 min-w-[1.5rem] transition-transform duration-300', { 'rotate-180': item.isOpen }]" />
                        </div>
                    </button>

                    <div class="overflow-hidden transition-all duration-300"
                        :style="{ maxHeight: item.isOpen ? '200px' : '0', opacity: item.isOpen ? '1' : '0', marginTop: item.isOpen ? '1rem' : '0' }">
                        <p class="text-base font-medium text-[#101828] dark:text-[#d6d3cd]">{{ item.answer }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
