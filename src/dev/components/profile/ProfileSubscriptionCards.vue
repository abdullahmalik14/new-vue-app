<template>
    <div class="w-full overflow-hidden min-h-screen relative flex items-center justify-center">
        <div class="w-full relative cursor-grab active:cursor-grabbing" @mousedown="startDrag" @touchstart="startTouch"
            @touchend="endTouch">
            <ul class="relative flex w-full justify-center items-center min-h-[42rem]">
                <SubscriptionCard v-for="(card, index) in cards" :key="card.id" :card-data="card" :order="orders[index]"
                    :is-current="currentIndex === index"
                    :current-subscription-price="parseFloat(currentSubscription?.price || 0)"
                    @card-click="moveToCenter(index)" @trigger-action="handleCardAction" />
            </ul>

            <div class="flex justify-center gap-2.5 mt-10">
                <span v-for="(card, index) in cards" :key="'dot-' + index" @click="moveToCenter(index)"
                    class="h-[0.6875rem] rounded-full transition-all duration-300 cursor-pointer" :class="currentIndex === index
                        ? 'bg-[#07F468] w-8 opacity-100'
                        : 'bg-[#E9E5D3] w-[0.6875rem] opacity-50'"></span>
            </div>
        </div>

        <!-- UPGRADE TIER POPUP -->
        <UpgradeTierPopup v-model="upgradeTierPopupOpen" :currentSubscription="currentSubscription"
            :newSubscription="selectedSubscription" :isUpgrade="isUpgrade" />
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import SubscriptionCard from './SubscriptionCard.vue';
import UpgradeTierPopup from "@/dev/components/ui/popups/profile/UpgradeTierPopup.vue";

const INITIAL_CENTER_INDEX = 2;
const CAROUSEL_CENTER_OFFSET = 2;
const SWIPE_THRESHOLD_PX = 50;

const { t } = useI18n();
const { url: bg1Url } = useAssetUrl('subscriptionCard.demo.bg1');
const { url: bg2Url } = useAssetUrl('subscriptionCard.demo.bg2');
const { url: bg3Url } = useAssetUrl('subscriptionCard.demo.bg3');
const { url: bg4Url } = useAssetUrl('subscriptionCard.demo.bg4');
const { url: bg5Url } = useAssetUrl('subscriptionCard.demo.bg5');

const cardFeatures = () => [
    t('demo.subscriptionCards.features.freeTokens'),
    t('demo.subscriptionCards.features.merchandise'),
    t('demo.subscriptionCards.features.customRequest'),
    t('demo.subscriptionCards.features.payToView'),
];

const cards = computed(() => [
    {
        id: 1,
        title: t('demo.subscriptionCards.cards.1.title'),
        price: '30.99',
        oldPrice: '999.99',
        followers: '30',
        videos: '12',
        photos: '45',
        mediaCount: '5',
        image: bg1Url.value,
        features: cardFeatures(),
        fullDescription: t('demo.subscriptionCards.cards.description'),
    },
    {
        id: 2,
        title: t('demo.subscriptionCards.cards.2.title'),
        price: '499.99',
        oldPrice: '999.99',
        followers: 'No',
        videos: '0',
        photos: '0',
        mediaCount: '5',
        isFeatured: true,
        image: bg2Url.value,
        features: cardFeatures(),
        fullDescription: t('demo.subscriptionCards.cards.description'),
    },
    {
        id: 3,
        title: t('demo.subscriptionCards.cards.3.title'),
        price: '99.99',
        oldPrice: '999.99',
        followers: '30',
        videos: '0',
        photos: '0',
        mediaCount: '5',
        isCurrentSubscription: true,
        image: bg3Url.value,
        features: cardFeatures(),
        fullDescription: t('demo.subscriptionCards.cards.description'),
    },
    {
        id: 4,
        title: t('demo.subscriptionCards.cards.4.title'),
        price: '30.99',
        oldPrice: '999.99',
        followers: '30',
        videos: '0',
        photos: '0',
        mediaCount: '5',
        image: bg4Url.value,
        features: cardFeatures(),
        fullDescription: t('demo.subscriptionCards.cards.description'),
    },
    {
        id: 5,
        title: t('demo.subscriptionCards.cards.5.title'),
        price: '30.99',
        oldPrice: '999.99',
        followers: '30',
        videos: '0',
        photos: '0',
        mediaCount: '5',
        image: bg5Url.value,
        features: cardFeatures(),
        fullDescription: t('demo.subscriptionCards.cards.description'),
    },
]);

const currentIndex = ref(INITIAL_CENTER_INDEX); // Beech wala card start mein
const orders = ref([1, 2, 3, 4, 5]);

// Cards ko rearrange karne ki logic (SLIDER LOGIC)
const assignOrders = (index) => {
    const n = cards.value.length;
    const newOrders = new Array(n);
    for (let i = 0; i < n; i++) {
        // Ye formula card ko cyclic order mein rotate karta hai
        const pos = (i - index + CAROUSEL_CENTER_OFFSET + n) % n;
        newOrders[i] = pos + 1;
    }
    orders.value = newOrders;
};

const moveToCenter = (index) => {
    currentIndex.value = index;
    assignOrders(index);
};

// --- DRAG / SWIPE LOGIC ---
let startX = 0;

const startDrag = (e) => {
    startX = e.clientX;
    window.addEventListener('mouseup', endDrag);
};

const endDrag = (e) => {
    const diff = e.clientX - startX;
    handleGesture(diff);
    window.removeEventListener('mouseup', endDrag);
};

const startTouch = (e) => { startX = e.touches[0].clientX; };
const endTouch = (e) => {
    const diff = e.changedTouches[0].clientX - startX;
    handleGesture(diff);
};

const handleGesture = (diff) => {
    if (Math.abs(diff) < SWIPE_THRESHOLD_PX) return; // Chote move ko ignore karein
    if (diff > 0) { // Right swipe -> Previous card
        const prev = (currentIndex.value - 1 + cards.value.length) % cards.value.length;
        moveToCenter(prev);
    } else { // Left swipe -> Next card
        const next = (currentIndex.value + 1) % cards.value.length;
        moveToCenter(next);
    }
};

// --- POPUP LOGIC ---
const upgradeTierPopupOpen = ref(false);
const selectedSubscription = ref(null);
const isUpgrade = ref(false);

const currentSubscription = computed(() => {
    return cards.value.find(c => c.isCurrentSubscription);
});

const handleCardAction = (card) => {
    selectedSubscription.value = card;
    const currentPrice = parseFloat(currentSubscription.value?.price || 0);
    const newPrice = parseFloat(card.price || 0);

    // Logic: If new price > current price => Upgrade, else Downgrade
    isUpgrade.value = newPrice > currentPrice;

    upgradeTierPopupOpen.value = true;
};

onMounted(() => assignOrders(currentIndex.value));
</script>
