<template>
    <li class="w-[21.4375rem] h-[32.625rem] absolute flex flex-col items-start rounded-sm transition-all duration-500 left-1/2 sm:h-[41.0625rem] md:w-96 md:h-[37.625rem] group"
        :class="[
            orderClass,
            { 'is-current !backdrop-blur-0 !blur-0': isCurrent }
        ]" @click="$emit('card-click')">
        <div v-if="cardData.isFeatured || cardData.isCurrentSubscription"
            class="absolute -top-2 -left-2 flex justify-center items-center w-max h-8 pl-2 pr-[1.15625rem] z-[2] transition-colors duration-300"
            :class="cardData.isCurrentSubscription ? 'bg-[#FF0066]' : 'bg-[linear-gradient(90deg,#909090_0%,#AEAEAE_100%)]'"
            style="clip-path: polygon(100% 0%, 100% 0%, calc(100% - 12.5px) 100%, 0% 100%, 0% 0%);">
            <span class="text-lg font-semibold text-white uppercase">
                {{ cardData.isCurrentSubscription ? 'Current Subscription' : 'FEATURED' }}
            </span>
        </div>
        <div class="flex flex-col w-full h-full rounded-sm border-[1.5px] border-[#7E7E7E] group-[.is-current]:border-[#FF0066] dark:border-[#5f676b] dark:group-[.is-current]:border-[#cc0052] overflow-hidden relative bg-cover bg-center bg-no-repeat"
            :style="cardBackgroundStyle">

            <!-- Badge/Button Container (Replaces Followers) -->
            <div v-if="!cardData.isCurrentSubscription" @click.stop="$emit('trigger-action', cardData)"
                class="absolute -bottom-[1.73px] right-0 flex justify-center items-center w-max h-[2.829rem] pl-[1.509rem] pr-[0.404rem] cursor-pointer transition-colors duration-200 [clip-path:polygon(19.6875px_0%,100%_0%,100%_100%,0%_100%,19.6875px_0%)] shadow-[3.23px_3.23px_0px_0px_#000000] z-[2]"
                :class="isUpgrade ? 'bg-[#07F468] hover:bg-[#06c454]' : 'bg-[#E9E5D3] hover:bg-[#dcd8c0]'">
                <span class="text-[1.35rem] leading-[1.8rem] font-semibold uppercase"
                    :class="isUpgrade ? 'text-black' : 'text-black/60'">
                    {{ actionText }}
                </span>
            </div>
<!-- 
            <div v-else
                class="absolute -bottom-[1.73px] right-0 flex justify-center items-center w-max h-[2.829rem] pl-[1.509rem] pr-[0.404rem] bg-[#7E7E7E] [clip-path:polygon(19.6875px_0%,100%_0%,100%_100%,0%_100%,19.6875px_0%)] shadow-[3.23px_3.23px_0px_0px_#000000] z-[2]">
                <span class="text-[1.35rem] leading-[1.8rem] font-semibold text-black">
                    Current
                </span>
            </div> -->

            <section
                class="w-full h-full flex flex-col gap-4 px-6 pt-8 pb-[4.25rem] rounded-sm relative overflow-hidden"
                style="background: linear-gradient(0deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 100%);">
                <div class="absolute inset-0 w-full h-full backdrop-blur-[5px] pointer-events-none z-[-1]"></div>

                <div class="w-full z-[5] relative drop-shadow-[0px_4px_18px_#00000080]">
                    <h2 class="text-3xl leading-[2.375rem] font-semibold line-clamp-2 text-white uppercase">
                        {{ cardData.title }}
                    </h2>
                </div>

                <div class="flex items-center gap-2.5 drop-shadow-[0px_2px_12px_#000000BF]">
                    <div class="flex items-center gap-[0.0625rem]">
                        <span class="text-base text-white">{{ cardData.videos || 0 }}</span>
                        <img src="https://i.ibb.co.com/PGgG4sNS/play-square.webp" alt="videos" class="w-5 h-5">
                    </div>
                    <div class="h-[0.188rem] w-[0.188rem] bg-white block rounded-full"></div>
                    <div class="flex items-center gap-[0.0625rem]">
                        <span class="text-base text-white">{{ cardData.photos || 0 }}</span>
                        <img src="https://i.ibb.co.com/nN9TqnGb/image-03.webp" alt="photos" class="w-5 h-5">
                    </div>
                    <div class="h-[0.188rem] w-[0.188rem] bg-white block rounded-full"></div>
                    <div class="flex items-center gap-[0.0625rem]">
                        <span class="text-base text-white">{{ cardData.mediaCount || 0 }}</span>
                        <img src="https://i.ibb.co.com/9HmCysxn/media.webp" alt="media" class="w-5 h-5">
                    </div>
                </div>

                <div class="flex gap-1">
                    <div class="flex items-baseline" :class="isCurrent ? 'text-[#FFCD29]' : 'text-[#949494]'">
                        <span class="text-xl font-semibold">USD$</span>
                        <span class="text-5xl font-semibold tracking-tighter">{{ cardData.price }}</span>
                    </div>
                    <div class="flex flex-col justify-between pt-[0.0625rem] pb-[0.625rem]">
                        <div class="flex justify-center items-center w-max px-[0.3125rem] py-0.5 h-5 font-bold text-sm text-black"
                            :class="isCurrent ? 'bg-[#FFCD29]' : 'bg-[#949494]'">
                            -80%
                        </div>
                        <div class="flex items-end gap-1.5">
                            <span class="text-base leading-5 font-medium line-through"
                                :class="isCurrent ? 'text-[#FFCD29]' : 'text-[#949494]'">
                                ${{ cardData.oldPrice }}
                            </span>
                            <span class="text-[0.625rem] leading-[0.8125rem]"
                                :class="isCurrent ? 'text-[#FFCD29]' : 'text-[#949494]'">/mo</span>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-1 flex-1 pt-1 min-h-0 overflow-hidden">
                    <p class="text-sm text-white drop-shadow-[0px_2px_4px_#1018280F] overflow-hidden"
                        style="display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 7;"
                        v-html="cardData.fullDescription"></p>
                    <button class="flex items-center gap-0.5 w-max">
                        <span class="text-xs font-medium text-[#07F468]">...Read more</span>
                    </button>
                </div>



                <ul class="flex flex-col gap-2 mt-auto">
                    <li v-for="(f, i) in cardData.features" :key="i" class="flex items-center gap-4">
                        <div
                            class="w-3 min-w-[0.75rem] h-3 bg-[#FF0066] rounded-[4px] relative after:content-[''] after:absolute after:left-1 after:top-[1px] after:w-[3px] after:h-[6px] after:border-white after:border-b-2 after:border-r-2 after:rotate-45">
                        </div>
                        <span class="text-base text-white" v-html="f"></span>
                    </li>
                </ul>

            </section>
        </div>
    </li>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    cardData: {
        type: Object,
        required: true
    },
    order: {
        type: Number,
        required: true
    },
    isCurrent: {
        type: Boolean,
        default: false
    },
    currentSubscriptionPrice: {
        type: Number,
        default: 0
    }
});

defineEmits(['card-click', 'trigger-action']);

// Dynamic Background style with Gradient and Image
const cardBackgroundStyle = computed(() => ({
    backgroundImage: `linear-gradient(0deg, rgba(77, 32, 255, 0.25), rgba(77, 32, 255, 0.25)), url(${props.cardData.image})`
}));

// Slider Positioning logic
const orderClass = computed(() => {
    const mapping = {
        1: 'opacity-70 z-[3] translate-x-[-180%] scale-[0.8] blur-[0.118rem]',
        2: 'opacity-70 z-[4] translate-x-[-121%] scale-[0.9] blur-[0.118rem]',
        3: 'opacity-100 z-[5] translate-x-[-50%] scale-100 blur-0',
        4: 'opacity-70 z-[4] translate-x-[21%] scale-[0.9] blur-[0.118rem]',
        5: 'opacity-70 z-[3] translate-x-[80%] scale-[0.8] blur-[0.118rem]'
    };
    return mapping[props.order] || '';
});

const isUpgrade = computed(() => {
    const cardPrice = parseFloat(props.cardData.price || 0);
    const currentPrice = props.currentSubscriptionPrice;
    return cardPrice > currentPrice;
});

const actionText = computed(() => {
    return isUpgrade.value ? 'Upgrade' : 'Downgrade';
});
</script>

<style scoped>
/* Ensuring text clamping works across browsers */
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>