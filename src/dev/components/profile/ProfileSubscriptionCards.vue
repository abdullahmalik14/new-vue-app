<template>
    <div class="w-full">
        <ul class="relative flex flex-wrap w-full justify-center items-start gap-x-6 gap-y-12 py-8">
            <SubscriptionCard
                v-for="card in cards"
                :key="card.id"
                :card-data="card"
                static
                :is-current="!!card.isCurrentSubscription"
                :current-subscription-price="currentSubscriptionPrice"
            />
        </ul>
    </div>
</template>

<script setup>
import SubscriptionCard from '@/dev/components/profile/SubscriptionCard.vue';
import { useSubscriptionCardsDemo } from '@/dev/composables/useSubscriptionCardsDemo.js';

const { cards, currentSubscriptionPrice } = useSubscriptionCardsDemo();
</script>
