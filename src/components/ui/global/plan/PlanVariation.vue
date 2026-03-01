<script setup>
import { ref } from 'vue';
import SubscriptionVariations from './HelperComponents/SubscriptionVariations.vue';
import LuckyDrawSection from './HelperComponents/LuckyDrawSection.vue';

// Reactive Data Source 
const subscriptionPlans = ref([
  {
    id: 1,
    title: '2 MONTH SUBSCRIPTION',
    isUnlimited: true, // Shows infinite icon
    currency: 'USD$',
    price: '24.86',
    discount: '-20%',
    audience: 'Everyone',
    dateRange: 'No End Date',
    minSpending: 'No Min. spending'
  },
  {
    id: 2,
    title: '6 MONTH SUBSCRIPTION',
    isUnlimited: false, // Shows 0/100 style
    usageStart: '0',
    usageLimit: '100',
    currency: 'USD$',
    price: '55.86',
    discount: '-40%',
    audience: 'Everyone',
    dateRange: '23 APR 2025-24 APR 2026',
    minSpending: 'No Min. spending'
  },
  {
    id: 3,
    title: '1 YEAR SUBSCRIPTION',
    isUnlimited: true,
    currency: 'USD$',
    price: '240.34',
    discount: '-60%',
    audience: 'Everyone',
    dateRange: '23 APR 2025-24 APR 2026',
    minSpending: 'USD$100 Min. spending'
  }
]);

// Handlers
const handleEdit = (plan) => {
  console.log('Edit clicked for:', plan.title);
};

const handleRemove = (plan) => {
  console.log('Remove clicked for:', plan.title);
  // Remove logic example:
  subscriptionPlans.value = subscriptionPlans.value.filter(p => p.id !== plan.id);
};

// Scenario 1:  (this si the data of Filled view of luckyDraw)
const activeDraws = ref([
  {
    id: 1,
    audience: 'Everyone',
    dateRange: '23 APR 2025-24 APR 2026',
    minSpending: 'USD$100 Min. spending',
   items: [
    { label: '90% off 1 YEAR', tokens: '1/1 Left' },
    { label: '90% off 6 months', tokens: '5/5 Left' },
    { label: 'FREE 1 month!', tokens: '50/50 Left' },
    { label: 'Lifetime 50% off~', tokens: '1/1 Left' },
    { label: 'FREE 6 months!', tokens: '10/10 Left' }
  ]
  },
  {
    id: 2,
    audience: 'Subscribers Only',
    dateRange: '01 MAY 2025-01 JUN 2025',
    minSpending: 'No Min. spending',
   items: [
    { label: '90% off 1 YEAR', tokens: '1/1 Left' },
    { label: '90% off 6 months', tokens: '5/5 Left' },
    { label: 'FREE 1 month!', tokens: '50/50 Left' },
    { label: 'Lifetime 50% off~', tokens: '1/1 Left' },
    { label: 'FREE 6 months!', tokens: '10/10 Left' }
  ]
  }
]);

// ------------------------------------
// SCENARIO 2: Empty View (this is the view for empty luckyDraw)
// ------------------------------------
// Uncomment this activeDraws variable to see the empty
// const activeDraws = ref([]); // Empty Array

// Handlers
const handleCreate = () => {
    console.log("Create clicked! Add default item to array.");
    activeDraws.value.push({
        id: Date.now(),
        audience: 'Everyone',
        dateRange: 'Pending',
        minSpending: 'None',
        items: [
    { label: '90% off 1 YEAR', tokens: '1/1 Left' },
    { label: '90% off 6 months', tokens: '5/5 Left' },
    { label: 'FREE 1 month!', tokens: '50/50 Left' },
    { label: 'Lifetime 50% off~', tokens: '1/1 Left' },
    { label: 'FREE 6 months!', tokens: '10/10 Left' }
  ]
    });
};

const handleLuckyDrawEdit = (draw) => console.log("Edit clicked for ID:", draw.id);
const handleLuckyDrawRemove = (draw) => {
    console.log("Remove clicked for ID:", draw.id);
    activeDraws.value = activeDraws.value.filter(d => d.id !== draw.id);
};
</script>

<template>
<!-- content-container -->
                <div class="flex flex-col gap-6 grow md:gap-8 md:pb-6 xl:pb-20">
                    <!-- subscription-variations-section -->
                    <div class="flex flex-col gap-4 px-2 py-4 bg-white/25 backdrop-blur-[25px] md:p-4 dark:bg-[#181a1b40]">
                        <!-- title-section -->
                        <div class="flex flex-col gap-2">
                            <!-- title-section -->
                            <div class="flex items-center gap-2">
                                <h2 class="text-xl leading-normal font-semibold text-[#667085] dark:text-[#9e9689]">Subscription Variations</h2>
                                <span class="text-xs leading-normal font-medium italic text-[#0C111D] dark:text-[#dbd8d3]">Optional</span>
                            </div>

                            <p class="text-sm text-[#344054] dark:text-[#bdb8af]">Award those who are loyal to you! Offer discounted plans when they subscribe for longer period of time! You may add up to 3 plan variations. Final discounted price are calculated based on your Subscription Base Price in <span class="text-sm underline text-[#344054] dark:text-[#bdb8af]">Tier Detail</span>.</p>
                        </div>

                        <!-- subscription-plans-section -->
                        <div class="flex flex-col gap-2">
                            <SubscriptionVariations
                            v-for="plan in subscriptionPlans" 
                            :key="plan.id" 
                            :plan="plan"
                            @edit="handleEdit"
                            @remove="handleRemove"
                            />
                            <!-- add-plan-button -->
                        <button 
                         v-if="subscriptionPlans.length === 0"
                        class="flex items-center gap-0.5 cursor-pointer">
                            <img src="https://i.ibb.co/TD3jgrGK/plus-square.webp" alt="plus-square" class="w-5 h-5">
                            <span class="text-sm font-medium text-[#155EEF] dark:text-[#2c8df1]">ADD PLAN</span>
                        </button>
                        </div>
                    </div>

                    <!-- lucky-draw section -->
                    <LuckyDrawSection 
                    :draws="activeDraws"
                    @create="handleCreate"
                    @edit="handleLuckyDrawEdit"
                    @remove="handleLuckyDrawRemove"
                />

                </div>
</template>