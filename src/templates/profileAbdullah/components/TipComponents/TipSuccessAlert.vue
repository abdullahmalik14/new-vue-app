<script setup lang="ts">
defineProps({
    amount: {
        type: Number,
        default: 0
    },
    currency: {
        type: String, // 'tokens' | 'USD'
        default: 'tokens'
    }
});
</script>

<template>
    <!-- alert-container -->
    <div data-dashboard-toast="notice"
        class="fixed w-[calc(100%-1rem)] top-2 left-2 md:top-0 md:left-0 md:w-full lg:relative lg:w-auto z-50">
        <div class="w-full border-b-[0.5px] border-[#EAECF0] flex relative">
            <div class="hidden md:block w-[0.188rem] block bg-[#07F468]"></div>
            <div
                class="flex gap-4 py-3 px-2 flex-1 min-w-0 min-h-0 [background:linear-gradient(0deg,rgba(255,255,255,0.9),rgba(255,255,255))] before:absolute before:content-[''] before:top-0 before:left-0 before:w-full before:h-full before:bg-gradient-to-r before:from-[rgba(46,211,183,0.15)] before:to-[rgba(255,255,255,0.9)] relative">
                <div class="relative w-full flex items-center gap-4">
                    <div class="relative">
                        <div
                            class="w-10 h-10 relative rounded-full bg-[url('https://i.ibb.co.com/bjGQxr5S/sample-bg-image.webp')] bg-cover bg-center">
                            <div
                                class="absolute -bottom-2 -right-2 w-[1.375rem] h-[1.375rem] flex justify-center items-center">
                                <img src="https://i.ibb.co.com/VprH7dBg/token-tip-svg.webp" alt="token-tip-svg"
                                    class="w-[1.375rem]">
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col flex-1 min-w-0 min-h-0 pr-[1.125rem] md:pr-0">
                        <div class="flex flex-col gap-2">
                            <div class="flex justify-between items-center pt-1 pr-1 pb-2">
                                <span class="text-sm font-semibold text-[#107569]">You have sent {{ currency === 'USD' ?
                                    `USD$ ${amount}` : `${amount} tokens` }} to
                                    Jenny.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
