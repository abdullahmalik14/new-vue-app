<template>
    <div class="bg-white rounded-tl-[10px] outline-none rounded-tr-[10px] flex flex-col w-full h-full 
        overflow-y-auto  box-border">
        <div class="w-full p-2 flex gap-2 flex-shrink-0">
            <div @click="$emit('set-view', 'day')"
                class="w-full cursor-pointer p-2 rounded-2xl inline-flex flex-col justify-center items-center transition-all duration-200"
                :class="view === 'day' ? 'bg-pink-500/75' : 'bg-white/20 outline outline-1 outline-offset-[-1px] outline-pink-500'">
                <div class="w-16 px-3 py-1 border-gray-300 flex flex-col justify-center items-center gap-2">
                    <div class="w-6 h-6 relative overflow-hidden">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M9 3V21M15 3V21M7.8 3H16.2C17.8802 3 18.7202 3 19.362 3.32698C19.9265 3.6146 20.3854 4.07354 20.673 4.63803C21 5.27976 21 6.11984 21 7.8V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V7.8C3 6.11984 3 5.27976 3.32698 4.63803C3.6146 4.07354 4.07354 3.6146 4.63803 3.32698C5.27976 3 6.11984 3 7.8 3Z"
                                :stroke="view === 'day' ? 'black' : '#FB5BA2'" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <div class="justify-start text-sm font-semibold font-['Poppins'] leading-5"
                        :class="view === 'day' ? 'text-black' : 'text-pink-500'">Day</div>
                </div>
            </div>

            <div @click="$emit('set-view', 'week')"
                class="w-full cursor-pointer p-2 rounded-2xl inline-flex flex-col justify-center items-center transition-all duration-200"
                :class="view === 'week' ? 'bg-pink-500/75' : 'bg-white/20 outline outline-1 outline-offset-[-1px] outline-pink-500'">
                <div class="px-3 py-1 border-gray-300 inline-flex flex-col justify-center items-center gap-2">
                    <div class="relative inline-flex justify-start items-center gap-2">
                        <div class="w-6 h-6 relative overflow-hidden">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M21 10H3M16 2V6M8 2V6M7.8 22H16.2C17.8802 22 18.7202 22 19.362 21.673C19.9265 21.3854 20.3854 20.9265 20.673 20.362C21 19.7202 21 18.8802 21 17.2V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22Z"
                                    :stroke="view === 'week' ? 'black' : '#FB5BA2'" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </div>
                        <div class="left-[9px] top-[6.73px] absolute justify-start text-[10px] font-semibold font-['Poppins'] leading-4"
                            :class="view === 'week' ? 'text-black' : 'text-pink-500'">7</div>
                    </div>
                    <div class="justify-start text-sm font-semibold font-['Poppins'] leading-5"
                        :class="view === 'week' ? 'text-black' : 'text-pink-500'">Week</div>
                </div>
            </div>

            <div @click="$emit('set-view', 'month')"
                class="w-full cursor-pointer p-2 rounded-2xl inline-flex flex-col justify-center items-center transition-all duration-200"
                :class="view === 'month' ? 'bg-pink-500/75' : 'bg-white/20 outline outline-1 outline-offset-[-1px] outline-pink-500'">
                <div class="px-3 py-1 border-gray-300 inline-flex flex-col justify-center items-center gap-2">
                    <div class="w-6 h-6 relative overflow-hidden">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M21 10H3M16 2V6M8 2V6M7.8 22H16.2C17.8802 22 18.7202 22 19.362 21.673C19.9265 21.3854 20.3854 20.9265 20.673 20.362C21 19.7202 21 18.8802 21 17.2V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22Z"
                                :stroke="view === 'month' ? 'black' : '#FB5BA2'" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <div class="justify-start text-sm font-semibold font-['Poppins'] leading-5"
                        :class="view === 'month' ? 'text-black' : 'text-pink-500'">Month</div>
                </div>
            </div>
        </div>

        <div class="w-full p-2 border-t border-black/20 mb-[100px]">
            <EventsWidget :sections="eventsData" @join-click="$emit('join-click', $event)"
                @reply-click="$emit('reply-click', $event)" />
        </div>

        <div class="p-4 mt-auto flex-shrink-0">
            <ButtonComponent @click="$emit('open-new-events')" text="NEW EVENTS" variant="none"
                customClass="group w-full h-12 min-h-10 px-4 py-2 text-base font-semibold bg-black rounded-[48px] inline-flex justify-center items-center gap-2 text-[#07F468] hover:text-black hover:bg-[#07F468]"
                :leftIcon="'https://i.ibb.co.com/RpWmJkcb/plus.webp'"
                :leftIconClass="`w-6 h-6 transition duration-200 group-hover:[filter:brightness(0)_saturate(100%)]`" />
        </div>
    </div>
</template>

<script setup>
import ButtonComponent from '../dev/button/ButtonComponent.vue';
import EventsWidget from './EventsWidget.vue';

defineProps({
    view: {
        type: String,
        required: true
    },
    eventsData: {
        type: Array,
        default: () => []
    }
});

defineEmits(['set-view', 'join-click', 'reply-click', 'open-new-events']);
</script>
