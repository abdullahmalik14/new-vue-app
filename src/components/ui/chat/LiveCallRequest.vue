<template>
    <div class="w-full py-2 inline-flex flex-col justify-start items-start gap-2">
        <div class="w-full text-center justify-start text-slate-700 text-sm font-normal font-['Poppins'] leading-5">
            {{ message.senderName }} has just sent you a live call request:
        </div>
        <div
            class="w-full pr-2 relative bg-white rounded inline-flex justify-start items-start gap-1.5 overflow-hidden shadow-sm border border-zinc-100">
            <div class="w-1 self-stretch relative bg-indigo-600/25"></div>
            <div class="flex-1 py-2 inline-flex flex-col justify-start items-start gap-3">
                <div class="self-stretch flex flex-col justify-start items-start gap-2">
                    <div class="self-stretch inline-flex justify-between items-center">
                        <div
                            class="flex-1 justify-center text-slate-700 text-base font-semibold font-['Poppins'] leading-6">
                            {{ message.text }}
                        </div>
                        <img src="/images/exp-icon.png" alt="" class="w-4 h-4" v-if="!isFanView">
                    </div>
                    <div class="self-stretch inline-flex justify-start items-start gap-1">
                        <div class="justify-center text-slate-700 text-sm font-medium font-['Poppins'] leading-5">April
                            24, 2025</div>
                        <div class="justify-center text-slate-700 text-sm font-medium font-['Poppins'] leading-5">
                            2:15pm-9:30pm</div>
                    </div>
                </div>

                <!-- Actions: Model View vs Fan View -->
                <div class="self-stretch inline-flex justify-between items-center w-full">

                    <!-- MODEL VIEW (Accept / Decline / Adjust) -->
                    <template v-if="!isFanView">
                        <div class="flex-1 flex justify-start items-center gap-1">
                            <button
                                class="px-2 py-[3px] bg-green-500 hover:bg-green-600 rounded flex justify-start items-center gap-1 transition-colors cursor-pointer">
                                <div class="justify-start text-white text-sm font-semibold font-['Poppins'] leading-5">
                                    Accept</div>
                            </button>
                            <button
                                class="px-2 py-[3px] rounded outline outline-1 outline-offset-[-1px] outline-orange-600 hover:bg-orange-50 flex justify-start items-center gap-1 transition-colors cursor-pointer">
                                <div
                                    class="justify-start text-orange-600 text-sm font-semibold font-['Poppins'] leading-5">
                                    Decline</div>
                            </button>
                        </div>
                        <div
                            class="flex justify-start items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity">
                            <img src="/images/edit-icon.png" alt="" class="w-3.5 h-3.5">
                            <div class="justify-start text-indigo-600 text-xs font-medium font-['Poppins'] leading-4">
                                Adjust Request and Price</div>
                        </div>
                    </template>

                    <!-- FAN VIEW (Waiting for response) -->
                    <template v-if="isFanView">
                        <div class="flex items-center gap-1">
                            <!-- Fallback svg if hourglass img is missing -->
                            <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <div class="justify-start text-gray-500 text-xs font-normal font-['Poppins'] leading-4">
                                waiting for response</div>
                        </div>
                        <div
                            class="flex-1 flex justify-end items-center gap-0.5 cursor-pointer hover:opacity-80 transition-opacity">
                            <div class="justify-start text-indigo-600 text-xs font-medium font-['Poppins'] leading-4">
                                View Details</div>
                            <svg class="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14">
                                </path>
                            </svg>
                        </div>
                    </template>

                </div>
            </div>

            <!-- Three dots menu (top right for both) -->
            <div
                class="w-4 h-4 absolute top-2 right-2 cursor-pointer hover:bg-zinc-100 rounded flex items-center justify-center">
                <svg class="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path
                        d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z">
                    </path>
                </svg>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    message: { type: Object, required: true },
    isFanView: { type: Boolean, default: false } // True for Fan, False for Model
})
</script>
