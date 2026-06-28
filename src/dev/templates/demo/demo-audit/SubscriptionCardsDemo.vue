<template>
    <section class="flex flex-col gap-6">
        <DemoSectionHeader :title="t('demo.subscriptionCards.sectionTitle')" />
        <div class="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-x-8 gap-y-12">
            <div
                v-for="entry in entries"
                :key="entry.id"
                class="flex flex-col gap-4"
            >
                <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t(entry.labelKey) }}</span>
                <SubscriptionCard
                    v-if="cardMap[entry.id]"
                    :card-data="cardMap[entry.id]"
                    static
                    :is-current="!!entry.isCurrentSubscription"
                    :current-subscription-price="currentSubscriptionPrice"
                />
                <ShowCodeToggle :code="codeExamples[entry.id]" />
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import SubscriptionCard from '@/dev/components/profile/SubscriptionCard.vue';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';
import { useSubscriptionCardsDemo } from '@/dev/composables/useSubscriptionCardsDemo.js';

const { t } = useI18n();
const { entries, cards, currentSubscriptionPrice } = useSubscriptionCardsDemo();

const cardMap = computed(() => Object.fromEntries(
    cards.value.map((card) => [card.id, card]),
));

function buildCardCode(entry) {
    const optionalLines = [
        entry.isFeatured ? '  isFeatured: true,' : '',
        entry.isCurrentSubscription ? '  isCurrentSubscription: true,' : '',
    ].filter(Boolean).join('\n');

    return `<!-- Template -->
<SubscriptionCard
  :card-data="card"
  static
  :is-current="${Boolean(entry.isCurrentSubscription)}"
  :current-subscription-price="currentSubscriptionPrice"
  @trigger-action="onSubscriptionAction"
/>

<!-- Script -->
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import SubscriptionCard from '@/dev/components/profile/SubscriptionCard.vue';

const { t } = useI18n();
const { url: cardImageUrl } = useAssetUrl('${entry.imageKey}');
const currentSubscriptionPrice = 99.99;

const card = computed(() => ({
  id: ${entry.id},
  title: t('${entry.titleKey}'),
  price: '${entry.price}',
  oldPrice: '${entry.oldPrice}',
  followers: '${entry.followers}',
  videos: '${entry.videos}',
  photos: '${entry.photos}',
  mediaCount: '${entry.mediaCount}',
${optionalLines}
  image: cardImageUrl.value,
  features: [
    t('demo.subscriptionCards.features.freeTokens'),
    t('demo.subscriptionCards.features.merchandise'),
    t('demo.subscriptionCards.features.customRequest'),
    t('demo.subscriptionCards.features.payToView'),
  ],
  fullDescription: t('${entry.descriptionKey}'),
}));`;
}

const codeExamples = computed(() => Object.fromEntries(
    entries.map((entry) => [entry.id, buildCardCode(entry)]),
));
</script>
