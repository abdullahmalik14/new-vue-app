<template>
    <!-- alert-container -->
    <div class="w-full relative z-[2]">
        <NotificationCard 
            variant="success-teal" 
            title="Your payout request has been accepted." 
            icon="https://i.ibb.co.com/dJkc0WbZ/check-circle.webp" 
            :closable="false"
        />
    </div>

    <!-- main-section -->
    <div class="flex flex-col gap-6 px-2 pt-2 pb-4 min-h-0 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] z-[2] md:p-4">
        <!-- header -->
        <div class="flex justify-between items-center">
            <h2 class="text-sm font-semibold text-[#344054] dark:text-[#bdb8af]"></h2>

            <button @click="$emit('close')" class="flex justify-center items-center w-6 h-6 md:w-10 md:h-10 cursor-pointer hover:opacity-80">
                <img src="https://i.ibb.co.com/Q3RfM295/close.webp" alt="close" class="w-full h-full [filter:brightness(0)_saturate(100%)_invert(73%)_sepia(11%)_saturate(425%)_hue-rotate(179deg)_brightness(87%)_contrast(89%)]">
            </button>
        </div>

        <div class="flex flex-col justify-center items-center gap-6 text-center my-auto">
            <div class="flex justify-center items-center w-[12.5rem] h-[12.5rem]">
                <img src="https://i.ibb.co.com/TMyYVxdV/pay-deposited.webp" alt="pay deposited" class="w-full h-full drop-shadow-[0px_0px_32px_#FFFFFF,0px_0px_12px_#2C2C2C80,0px_0px_4px_#00000080]">
            </div>
            <h2 class="text-2xl font-medium text-[#0C111D] md:text-3xl md:leading-[2.375rem] dark:text-[#dbd8d3]">
                <span class="text-3xl leading-[2.375rem] font-semibold text-[#0C111D] md:text-4xl md:leading-[2.75rem] md:tracking-[0.045rem] dark:text-[#dbd8d3]">USD${{ withdrawAmount }}</span><br>
                will be deposited into your account within 3-5 business days.
            </h2>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import NotificationCard from '@/components/ui/card/dashboard/NotificationCard.vue';

const props = defineProps({
  engine: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close']);

const withdrawAmount = computed(() => props.engine.state.amount || '120.00');
</script>
