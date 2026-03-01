<template>
    <div
        class="w-full sm:w-[492px] border-l-[4px] border-[#5549FF] bg-gray-50 rounded shadow-[0px_0px_8px_0px_rgba(99,88,255,0.50)] inline-flex items-start overflow-hidden">
        <div class="w-1 relative bg-indigo-600" />
        <div class="w-full p-4 flex items-start gap-1">
            <div class="flex-1 inline-flex flex-col items-start gap-6">
                <div class="w-full inline-flex justify-between items-center">
                    <div class="justify-center text-indigo-600 text-2xl font-semibold font-['Poppins'] leading-8">
                        {{ event.title || 'Live Call' }}
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="flex items-center gap-1">
                            <div class="w-1.5 h-1.5 bg-red-500 rounded-full" />
                            <div class="text-gray-500 text-xs font-medium font-['Poppins'] leading-4">in 5 min</div>
                        </div>
                        <div class="px-2 py-[3px] bg-indigo-600 rounded flex items-center gap-1 cursor-pointer">
                            <div class="w-4 h-4 relative overflow-hidden">
                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M10.9998 1L8.66645 3.33333M8.66645 3.33333L10.9998 5.66667M8.66645 3.33333H13.9998M6.8178 8.24205C6.01675 7.44099 5.38422 6.53523 4.92022 5.56882C4.88031 5.48569 4.86036 5.44413 4.84503 5.39154C4.79054 5.20463 4.82968 4.97513 4.94302 4.81684C4.97491 4.7723 5.01302 4.7342 5.08923 4.65799C5.3223 4.42492 5.43883 4.30838 5.51502 4.1912C5.80235 3.74927 5.80235 3.17955 5.51502 2.73762C5.43883 2.62044 5.3223 2.5039 5.08923 2.27083L4.95931 2.14092C4.60502 1.78662 4.42787 1.60947 4.23762 1.51324C3.85924 1.32186 3.4124 1.32186 3.03402 1.51324C2.84377 1.60947 2.66662 1.78662 2.31233 2.14092L2.20724 2.24601C1.85416 2.59909 1.67762 2.77563 1.54278 3.01565C1.39317 3.28199 1.2856 3.69565 1.2865 4.00113C1.28732 4.27643 1.34073 4.46458 1.44753 4.84087C2.02151 6.86314 3.10449 8.77138 4.69648 10.3634C6.28847 11.9554 8.19671 13.0383 10.219 13.6123C10.5953 13.7191 10.7834 13.7725 11.0587 13.7733C11.3642 13.7743 11.7779 13.6667 12.0442 13.5171C12.2842 13.3822 12.4608 13.2057 12.8138 12.8526L12.9189 12.7475C13.2732 12.3932 13.4504 12.2161 13.5466 12.0258C13.738 11.6474 13.738 11.2006 13.5466 10.8222C13.4504 10.632 13.2732 10.4548 12.9189 10.1005L12.789 9.97062C12.5559 9.73755 12.4394 9.62101 12.3222 9.54482C11.8803 9.25749 11.3106 9.2575 10.8687 9.54482C10.7515 9.62102 10.6349 9.73755 10.4019 9.97062C10.3257 10.0468 10.2875 10.0849 10.243 10.1168C10.0847 10.2302 9.85521 10.2693 9.66831 10.2148C9.61572 10.1995 9.57415 10.1795 9.49103 10.1396C8.52461 9.67562 7.61885 9.0431 6.8178 8.24205Z"
                                        stroke="white" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </div>
                            <div class="text-white text-xs font-semibold font-['Poppins'] leading-4">Join call</div>
                        </div>
                        <svg width="4" height="12" viewBox="0 0 4 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M2.00004 6.6665C2.36823 6.6665 2.66671 6.36803 2.66671 5.99984C2.66671 5.63165 2.36823 5.33317 2.00004 5.33317C1.63185 5.33317 1.33337 5.63165 1.33337 5.99984C1.33337 6.36803 1.63185 6.6665 2.00004 6.6665Z"
                                stroke="#98A2B3" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
                            <path
                                d="M2.00004 1.99984C2.36823 1.99984 2.66671 1.70136 2.66671 1.33317C2.66671 0.964981 2.36823 0.666504 2.00004 0.666504C1.63185 0.666504 1.33337 0.964981 1.33337 1.33317C1.33337 1.70136 1.63185 1.99984 2.00004 1.99984Z"
                                stroke="#98A2B3" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
                            <path
                                d="M2.00004 11.3332C2.36823 11.3332 2.66671 11.0347 2.66671 10.6665C2.66671 10.2983 2.36823 9.99984 2.00004 9.99984C1.63185 9.99984 1.33337 10.2983 1.33337 10.6665C1.33337 11.0347 1.63185 11.3332 2.00004 11.3332Z"
                                stroke="#98A2B3" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>

                    </div>
                </div>
                <div class="flex flex-col items-start gap-4">
                    <div class="inline-flex items-start gap-4">
                        <div class="w-6 h-6 relative overflow-hidden">
                            <img src="/images/alarmIcon.png" alt="" class="filter grayscale brightness-75 opacity-100">
                        </div>
                        <div class="inline-flex flex-col justify-center items-start gap-2">
                            <div class="justify-center text-gray-900 text-sm font-semibold font-['Poppins'] leading-5">
                                {{ formattedDate }}
                            </div>
                            <div class="inline-flex items-start gap-2">
                                <div
                                    class="justify-center text-gray-900 text-sm font-medium font-['Poppins'] leading-5">
                                    {{ formattedTimeRange }}
                                </div>
                                <div
                                    class="justify-center text-gray-400 text-sm font-medium font-['Poppins'] leading-5">
                                    {{ duration }} minutes
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="inline-flex items-start gap-4">
                        <div class="w-6 h-6 relative overflow-hidden">
                            <img src="/images/profile.webp" alt="" class="filter grayscale brightness-75 opacity-100">
                        </div>
                        <div class="inline-flex flex-col justify-center items-start gap-2">
                            <div class="justify-center text-gray-900 text-sm font-semibold font-['Poppins'] leading-5">1
                                guest</div>
                            <div class="flex flex-col justify-center items-start gap-1">
                                <div data-alignment="H" data-last-updated="false" data-likes-follower-count="false"
                                    data-media-count="true" data-online-indicator="false" data-shape="1" data-size="xxs"
                                    data-verified-account="false" class="inline-flex justify-center items-center gap-2">
                                    <div class="w-6 h-6 relative">
                                        <img class="w-5 h-5 left-[1.17px] top-[1px] absolute"
                                            src="/images/mangoes.png" />
                                    </div>
                                    <div class="inline-flex flex-col justify-center items-start">
                                        <div class="inline-flex items-center gap-1">
                                            <div
                                                class="text-gray-900 text-sm font-normal font-['Poppins'] leading-5 line-clamp-1">
                                                Mangoes
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="inline-flex items-start gap-4">
                        <div class="w-6 h-6 relative overflow-hidden">
                            <img src="/images/dotpoints.png" alt="">
                        </div>
                        <div class="inline-flex flex-col items-start gap-2">
                            <div class="justify-center text-gray-900 text-sm font-semibold font-['Poppins'] leading-5">
                                Additional
                                request</div>
                            <div class="justify-center text-gray-900 text-sm font-normal font-['Poppins'] leading-5">
                                record live
                                call</div>
                            <div class="justify-center text-gray-900 text-sm font-normal font-['Poppins'] leading-5">
                                Roleplay</div>
                        </div>
                    </div>
                    <div class="inline-flex items-start gap-4">
                        <div class="w-6 h-6 relative overflow-hidden">
                            <img src="/images/dollar.png" alt="">
                        </div>
                        <div class="inline-flex flex-col items-start gap-2">
                            <div class="justify-center text-gray-900 text-sm font-semibold font-['Poppins'] leading-5">
                                Minimum charge
                            </div>
                            <div class="justify-center text-gray-900 text-sm font-normal font-['Poppins'] leading-5">
                                USD$ 15</div>
                        </div>
                    </div>
                    <div class="inline-flex items-center gap-4">
                        <div class="w-6 h-6 relative overflow-hidden">
                            <img src="/images/bell-1.webp" alt="" class="filter grayscale brightness-75 opacity-100">
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="justify-center text-gray-900 text-sm font-normal font-['Poppins'] leading-5">5
                                minutes before
                            </div>
                        </div>
                    </div>
                    <div class="inline-flex w-full items-center gap-4 ">
                        <div class="w-6 h-6 relative overflow-hidden">
                            <img src="/images/message-dots.png" alt="">
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="flex items-center gap-0.5">
                                <div
                                    class="justify-center text-gray-900 text-sm font-semibold font-['Poppins'] leading-5 cursor-pointer">
                                    Open chat</div>

                                <svg width="15" height="32" viewBox="0 0 32 32" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M9.3335 22.6666L22.6668 9.33331M22.6668 9.33331H9.3335M22.6668 9.33331V22.6666"
                                        stroke="#000" stroke-width="2.5" stroke-linecap="round"
                                        stroke-linejoin="round" />
                                </svg>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { hhmm } from '@/utils/calendarHelpers.js';

const props = defineProps({
    event: {
        type: Object,
        default: () => ({})
    }
});

const formattedDate = computed(() => {
    if (!props.event.start) return 'Wed April 23,2025'; // Fallback
    const d = new Date(props.event.start);
    const options = { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' };
    return d.toLocaleDateString('en-US', options);
});

const formattedTimeRange = computed(() => {
    if (!props.event.start || !props.event.end) return '2:30pm-2:45pm'; // Fallback
    return `${hhmm(props.event.start)} - ${hhmm(props.event.end)}`;
});

const duration = computed(() => {
    if (!props.event.start || !props.event.end) return 15;
    const diff = new Date(props.event.end) - new Date(props.event.start);
    return Math.floor(diff / 1000 / 60);
});
</script>
