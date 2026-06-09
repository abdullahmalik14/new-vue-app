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
import SubscriptionCard from './SubscriptionCard.vue';
import UpgradeTierPopup from "@/components/ui/popup/purchase/UpgradeTierPopup.vue";

const cards = ref([
    {
        id: 1,
        title: 'FEATURED library of LOREM LPSUM ATIER dolor sit amet, consectetur adipiscing elit.',
        price: '30.99',
        oldPrice: '999.99',
        followers: '30',
        videos: '12',
        photos: '45',
        mediaCount: '5',
        image: 'https://i.ibb.co.com/5WQ43b48/sample-bg-image-compressed.webp',
        features: [
            '<span class="font-semibold text-[#FF0066]">10 free tokens</span> each month',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Merchandise',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Custom Request',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Pay to View videos'
        ],
        fullDescription: `Watch all of my mango eating content! content update weekly!<br><br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing`,
    },
    {
        id: 2,
        title: 'FEATURED library of LOREM LPSUM ATIER dolor sit amet, consectetur adipiscing elit.',
        price: '499.99',
        oldPrice: '999.99',
        followers: 'No',
        videos: '0',
        photos: '0',
        mediaCount: '5',
        isFeatured: true,
        image: 'https://i.ibb.co.com/Kx9QDc68/auth-bg-compressed.webp',
        features: [
            '<span class="font-semibold text-[#FF0066]">10 free tokens</span> each month',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Merchandise',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Custom Request',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Pay to View videos'
        ],
        fullDescription: `Watch all of my mango eating content! content update weekly!<br><br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing`,
    },
    {
        id: 3,
        title: 'Library of LOREM LPSUM ATIER dolor sit amet, consectetur adipiscing elit.',
        price: '99.99',
        oldPrice: '999.99',
        followers: '30',
        videos: '0',
        photos: '0',
        mediaCount: '5',
        isCurrentSubscription: true,
        image: 'https://i.ibb.co.com/LXPfFX03/profile-slidein-bg.webp',
        features: [
            '<span class="font-semibold text-[#FF0066]">10 free tokens</span> each month',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Merchandise',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Custom Request',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Pay to View videos'
        ],
        fullDescription: `Watch all of my mango eating content! content update weekly!<br><br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing`,
    },
    {
        id: 4,
        title: 'FEATURED library of LOREM LPSUM ATIER dolor sit amet, consectetur adipiscing elit.',
        price: '30.99',
        oldPrice: '999.99',
        followers: '30',
        videos: '0',
        photos: '0',
        mediaCount: '5',
        image: 'https://i.ibb.co.com/SwFy98RJ/checkout-header.webp',
        features: [
            '<span class="font-semibold text-[#FF0066]">10 free tokens</span> each month',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Merchandise',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Custom Request',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Pay to View videos'
        ],
        fullDescription: `Watch all of my mango eating content! content update weekly!<br><br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing`,
    },
    {
        id: 5,
        title: 'FEATURED library of LOREM LPSUM ATIER dolor sit amet, consectetur adipiscing elit.',
        price: '30.99',
        oldPrice: '999.99',
        followers: '30',
        videos: '0',
        photos: '0',
        mediaCount: '5',
        image: 'https://i.ibb.co.com/7sWfvWC/hero-image-blue.webp',
        features: [
            '<span class="font-semibold text-[#FF0066]">10 free tokens</span> each month',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Merchandise',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Custom Request',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Pay to View videos'
        ],
        fullDescription: `Watch all of my mango eating content! content update weekly!<br><br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing`,
    }
]);

const currentIndex = ref(2); // Beech wala card start mein
const orders = ref([1, 2, 3, 4, 5]);

// Cards ko rearrange karne ki logic (SLIDER LOGIC)
const assignOrders = (index) => {
    const n = cards.value.length;
    const newOrders = new Array(n);
    for (let i = 0; i < n; i++) {
        // Ye formula card ko cyclic order mein rotate karta hai
        const pos = (i - index + 2 + n) % n;
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
    if (Math.abs(diff) < 50) return; // Chote move ko ignore karein
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