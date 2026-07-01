import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getAssetUrl } from '@/systems/assets/assetLibrary.js';
import {
    SUBSCRIPTION_CARDS_DEMO_ENTRIES,
    SUBSCRIPTION_CARD_FEATURE_KEYS,
} from '@/dev/assets/data/subscriptionCardsDemoConfig.js';

export function useSubscriptionCardsDemo() {
    const { t } = useI18n();
    const imageUrls = ref({});

    onMounted(async () => {
        const resolved = await Promise.all(
            SUBSCRIPTION_CARDS_DEMO_ENTRIES.map(async (entry) => {
                try {
                    const url = await getAssetUrl(entry.imageKey);
                    return [entry.imageKey, url];
                } catch (error) {
                    console.warn('[useSubscriptionCardsDemo] Failed to load card background', entry.imageKey, error);
                    return [entry.imageKey, ''];
                }
            }),
        );
        imageUrls.value = Object.fromEntries(resolved);
    });

    const cards = computed(() => SUBSCRIPTION_CARDS_DEMO_ENTRIES.map((entry) => ({
        id: entry.id,
        title: t(entry.titleKey),
        price: entry.price,
        oldPrice: entry.oldPrice,
        followers: entry.followers,
        videos: entry.videos,
        photos: entry.photos,
        mediaCount: entry.mediaCount,
        isFeatured: entry.isFeatured,
        isCurrentSubscription: entry.isCurrentSubscription,
        image: imageUrls.value[entry.imageKey] || '',
        features: SUBSCRIPTION_CARD_FEATURE_KEYS.map((key) => t(key)),
        fullDescription: t(entry.descriptionKey),
    })));

    const currentSubscriptionPrice = computed(() => {
        const current = cards.value.find((card) => card.isCurrentSubscription);
        return parseFloat(current?.price || 0);
    });

    return {
        entries: SUBSCRIPTION_CARDS_DEMO_ENTRIES,
        cards,
        currentSubscriptionPrice,
    };
}
