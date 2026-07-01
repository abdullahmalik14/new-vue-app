<template>
    <section class="flex flex-col gap-6">
        <DemoSectionHeader :title="t('demo.checkoutReusable.sectionTitle')" />

        <div class=" bg-[#272727] font-sans p-6 flex flex-col gap-10 ">
            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReusable.sections.mediaPreview') }}</p>
                <CheckoutMediaPreview
                    :image="assets.featuredMediaBg"
                    :creator-name="t('demo.checkoutReusable.mediaPreview.creatorName')"
                    :creator-handle="t('demo.checkoutReusable.mediaPreview.creatorHandle')"
                    :is-verified="true"
                    :description="t('demo.checkoutReusable.mediaPreview.description')"
                />
                <ShowCodeToggle :code="code.mediaPreview" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReusable.sections.sectionHeader') }}</p>
                <SectionHeader
                    :title="t('demo.checkoutReusable.sectionHeader.title')"
                    :icon="assets.communicationIcon"
                    :show-close="true"
                />
                <ShowCodeToggle :code="code.sectionHeader" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReusable.sections.orderSummaryToggle') }}</p>
                <SectionToggleHeader
                    :title="t('demo.checkoutReusable.orderSummary.title')"
                    :icon="assets.generalIcon"
                    v-model="orderSummaryOpen"
                >
                    <OrderSummary :items="cartItems" />
                </SectionToggleHeader>
                <ShowCodeToggle :code="code.orderSummaryToggle" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReusable.sections.paymentToggle') }}</p>
                <SectionToggleHeader
                    :title="t('demo.checkoutReusable.payment.title')"
                    :icon="assets.paymentIcon"
                    v-model="paymentOpen"
                    :show-chevron="false"
                    :toggleable="false"
                >
                    <PaymentMethodLoggedIn
                        :holder-name="t('demo.checkoutReusable.payment.holderName')"
                        :card-number="DEMO_CARD.number"
                        :expiry="DEMO_CARD.expiry"
                    />
                </SectionToggleHeader>
                <ShowCodeToggle :code="code.paymentToggle" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReusable.sections.addressCard') }}</p>
                <AddressCard :address="t('demo.checkoutReusable.address.cart')" />
                <ShowCodeToggle :code="code.addressCard" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReusable.sections.planDropdown') }}</p>
                <div class="flex items-center gap-2">
                    <BasePlanDropdown
                        variant="checkout"
                        :label="t('demo.checkoutReusable.planDropdown.country')"
                        :options="countryOptions"
                        v-model="selectedCountry"
                    />
                    <BasePlanDropdown
                        variant="checkout"
                        :label="t('demo.checkoutReusable.planDropdown.state')"
                        :options="stateOptions"
                        v-model="selectedState"
                        placeholder=""
                    />
                </div>
                <ShowCodeToggle :code="code.planDropdown" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReusable.sections.orderSummary') }}</p>
                <OrderSummary :items="cartItems" />
                <ShowCodeToggle :code="code.orderSummary" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReusable.sections.paymentCompact') }}</p>
                <PaymentMethodLoggedIn
                    :holder-name="t('demo.checkoutReusable.payment.holderName')"
                    :card-number="DEMO_CARD.number"
                    :expiry="DEMO_CARD.expiry"
                />
                <ShowCodeToggle :code="code.paymentCompact" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReusable.sections.paymentLarge') }}</p>
                <PaymentMethodLoggedIn
                    variant="large"
                    :holder-name="t('demo.checkoutReusable.payment.holderName')"
                    :card-number="DEMO_CARD.number"
                    :expiry="DEMO_CARD.expiry"
                />
                <ShowCodeToggle :code="code.paymentLarge" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReusable.sections.paymentNotLoggedIn') }}</p>
                <PaymentMethodNotLoggedIn
                    wrapper-class="max-w-[29.6875rem]"
                    v-model:card-number="cardNumber"
                    v-model:expiry="expiry"
                    v-model:card-holder="cardHolder"
                    v-model:cvv="cvv"
                    v-model:save-card="saveCard"
                />
                <ShowCodeToggle :code="code.paymentNotLoggedIn" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReusable.sections.subscriptionDefault') }}</p>
                <SubscriptionPlanCard
                    :title="t('demo.checkoutReusable.subscription.title')"
                    :price="t('demo.checkoutReusable.subscription.priceMonthly')"
                    :background-image="assets.featuredMediaBg"
                    accent-color="#FFCC01"
                    :footer-text="t('demo.checkoutReusable.subscription.footerBillingCycle')"
                />
                <ShowCodeToggle :code="code.subscriptionDefault" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReusable.sections.subscriptionUpdate') }}</p>
                <SubscriptionPlanCard
                    :title="t('demo.checkoutReusable.subscription.title')"
                    :price="t('demo.checkoutReusable.subscription.priceMonthly')"
                    :background-image="assets.featuredMediaBg"
                    accent-color="#667085"
                />
                <SubscriptionPlanCard
                    :title="t('demo.checkoutReusable.subscription.title')"
                    :price="t('demo.checkoutReusable.subscription.priceMonthly')"
                    :background-image="assets.featuredMediaBg"
                    accent-color="#FF0066"
                    :footer-text="t('demo.checkoutReusable.subscription.footerBillingCycle')"
                    footer-color="#ffffff"
                />
                <ShowCodeToggle :code="code.subscriptionUpdate" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReusable.sections.subscriptionNew') }}</p>
                <SubscriptionPlanCard
                    variant="new"
                    :title="t('demo.checkoutReusable.subscription.title')"
                    :price="t('demo.checkoutReusable.subscription.price')"
                    period="/mo"
                    :background-image="assets.profileSlideinBg"
                    accent-color="#667085"
                    footer-text=""
                    :logo-image="assets.planLogo"
                    left-section-gradient="linear-gradient(0deg,rgba(0,0,0,0.5),rgba(0,0,0,0.5)),linear-gradient(0deg,rgba(102,112,133,0.50),rgba(102,112,133,0.50))"
                />
                <SubscriptionPlanCard
                    variant="new"
                    :title="t('demo.checkoutReusable.subscription.title')"
                    :price="t('demo.checkoutReusable.subscription.price')"
                    period="/mo"
                    :background-image="assets.profileSlideinBg"
                    accent-color="#ff0066"
                    :footer-text="t('demo.checkoutReusable.subscription.footerBillingCycle')"
                    :logo-image="assets.planLogo"
                    left-section-gradient="linear-gradient(0deg,rgba(0,0,0,0.5),rgba(0,0,0,0.5)),linear-gradient(0deg,rgba(255,0,102,0.50),rgba(255,0,102,0.50))"
                />
                <SubscriptionPlanCard
                    variant="new"
                    :title="t('demo.checkoutReusable.subscription.title')"
                    :price="t('demo.checkoutReusable.subscription.price')"
                    period="/mo"
                    :background-image="assets.profileSlideinBg"
                    accent-color="#d8af0d"
                    :footer-text="t('demo.checkoutReusable.subscription.footerCheckoutStart')"
                    :logo-image="assets.planLogo"
                />
                <ShowCodeToggle :code="code.subscriptionNew" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReusable.sections.notesWithAvatars') }}</p>
                <CheckoutNotes :show-avatars="true" v-model="notesWithAvatars" />
                <ShowCodeToggle :code="code.notesWithAvatars" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReusable.sections.notesWithoutAvatars') }}</p>
                <CheckoutNotes :show-avatars="false" v-model="notesWithoutAvatars" />
                <ShowCodeToggle :code="code.notesWithoutAvatars" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReusable.sections.notesGuest') }}</p>
                <CheckoutNotes :show-avatars="true" v-model="orderNotes" />
                <ShowCodeToggle :code="code.notesGuest" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReusable.sections.totalAmount') }}</p>
                <TotalAmountRow :amount="t('demo.checkoutReusable.total.amount')" />
                <ShowCodeToggle :code="code.totalAmount" />
            </div>
        </div>

        <div class=" flex flex-col gap-10">
            

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkoutReusable.sections.topUpPayment') }}</p>
                <SectionToggleHeader
                    :title="t('demo.checkoutReusable.payment.title')"
                    title-color="text-[#344054]"
                    icon-color="bg-[#344054]"
                    :icon="assets.paymentIcon"
                    v-model="topUpPaymentOpen"
                    :show-chevron="true"
                    :toggleable="true"
                >
                    <PaymentMethodLoggedIn
                        :holder-name="t('demo.checkoutReusable.payment.holderName')"
                        :card-number="DEMO_CARD.number"
                        :expiry="DEMO_CARD.expiry"
                    />
                </SectionToggleHeader>
                <ShowCodeToggle :code="code.topUpPayment" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkoutReusable.sections.addressTopUp') }}</p>
                <AddressCard :address="t('demo.checkoutReusable.address.topUp')" />
                <ShowCodeToggle :code="code.addressTopUp" />
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import AddressCard from '@/dev/components/checkout/reusable/AddressCard.vue';
import BasePlanDropdown from '@/dev/components/plan/parts/BasePlanDropdown.vue';
import CheckoutMediaPreview from '@/dev/components/checkout/reusable/CheckoutMediaPreview.vue';
import CheckoutNotes from '@/dev/components/checkout/reusable/CheckoutNotes.vue';
import OrderSummary from '@/dev/components/checkout/reusable/OrderSummary.vue';
import PaymentMethodLoggedIn from '@/dev/components/checkout/reusable/PaymentMethodLoggedIn.vue';
import PaymentMethodNotLoggedIn from '@/dev/components/checkout/reusable/PaymentMethodNotLoggedIn.vue';
import SectionHeader from '@/dev/components/checkout/reusable/SectionHeader.vue';
import SectionToggleHeader from '@/dev/components/checkout/reusable/SectionToggleHeader.vue';
import SubscriptionPlanCard from '@/dev/components/checkout/reusable/SubscriptionPlanCard.vue';
import TotalAmountRow from '@/dev/components/checkout/reusable/TotalAmountRow.vue';
import { useCheckoutDemoAssets } from '@/dev/composables/useCheckoutDemoAssets.js';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';

const { t } = useI18n();
const { assets } = useCheckoutDemoAssets();

const DEMO_CARD = {
  number: '4242424242423507',
  expiry: '02/30',
};

const orderSummaryOpen = ref(true);
const paymentOpen = ref(true);
const accountEmailOpen = ref(true);
const topUpPaymentOpen = ref(true);

const notesWithAvatars = ref('');
const notesWithoutAvatars = ref('');
const orderNotes = ref('');

const selectedCountry = ref('hong-kong');
const selectedState = ref('florida');

const cardNumber = ref('');
const expiry = ref('');
const cardHolder = ref('');
const cvv = ref('');
const saveCard = ref(false);

const cartItems = computed(() => Array.from({ length: 3 }, () => ({
  name: t('demo.checkoutReusable.cart.itemName'),
  image: assets.value.featuredMediaBg,
  creatorName: t('demo.checkoutReusable.cart.creatorName'),
  creatorAvatar: assets.value.creatorAvatar,
  isVerified: true,
  price: t('demo.checkoutReusable.cart.price'),
  oldPrice: t('demo.checkoutReusable.cart.oldPrice'),
})));

const countryOptions = computed(() => ([
  { label: t('demo.checkoutReusable.options.hongKong'), value: 'hong-kong' },
  { label: t('demo.checkoutReusable.options.australia'), value: 'australia' },
  { label: t('demo.checkoutReusable.options.usa'), value: 'usa' },
]));

const stateOptions = computed(() => ([
  { label: t('demo.checkoutReusable.options.florida'), value: 'florida' },
  { label: t('demo.checkoutReusable.options.hawaii'), value: 'hawaii' },
  { label: t('demo.checkoutReusable.options.newYork'), value: 'new-york' },
]));

const code = computed(() => ({
  mediaPreview: `import CheckoutMediaPreview from '@/dev/components/checkout/reusable/CheckoutMediaPreview.vue';
import { useCheckoutDemoAssets } from '@/dev/composables/useCheckoutDemoAssets.js';

const { assets } = useCheckoutDemoAssets();

<CheckoutMediaPreview
  :image="assets.featuredMediaBg"
  :creator-name="t('demo.checkoutReusable.mediaPreview.creatorName')"
  :creator-handle="t('demo.checkoutReusable.mediaPreview.creatorHandle')"
  :is-verified="true"
  :description="t('demo.checkoutReusable.mediaPreview.description')"
/>`,
  sectionHeader: `import SectionHeader from '@/dev/components/checkout/reusable/SectionHeader.vue';
import { useCheckoutDemoAssets } from '@/dev/composables/useCheckoutDemoAssets.js';

const { assets } = useCheckoutDemoAssets();

<SectionHeader
  :title="t('demo.checkoutReusable.sectionHeader.title')"
  :icon="assets.communicationIcon"
  :show-close="true"
/>`,
  orderSummaryToggle: `import SectionToggleHeader from '@/dev/components/checkout/reusable/SectionToggleHeader.vue';
import OrderSummary from '@/dev/components/checkout/reusable/OrderSummary.vue';
import { useCheckoutDemoAssets } from '@/dev/composables/useCheckoutDemoAssets.js';

const { assets } = useCheckoutDemoAssets();

<SectionToggleHeader
  :title="t('demo.checkoutReusable.orderSummary.title')"
  :icon="assets.generalIcon"
  v-model="orderSummaryOpen"
>
  <OrderSummary :items="cartItems" />
</SectionToggleHeader>`,
  paymentToggle: `import SectionToggleHeader from '@/dev/components/checkout/reusable/SectionToggleHeader.vue';
import PaymentMethodLoggedIn from '@/dev/components/checkout/reusable/PaymentMethodLoggedIn.vue';
import { useCheckoutDemoAssets } from '@/dev/composables/useCheckoutDemoAssets.js';

const { assets } = useCheckoutDemoAssets();

<SectionToggleHeader
  :title="t('demo.checkoutReusable.payment.title')"
  :icon="assets.paymentIcon"
  v-model="paymentOpen"
  :show-chevron="false"
  :toggleable="false"
>
  <PaymentMethodLoggedIn
    :holder-name="t('demo.checkoutReusable.payment.holderName')"
    card-number="${DEMO_CARD.number}"
    expiry="${DEMO_CARD.expiry}"
  />
</SectionToggleHeader>`,
  addressCard: `import AddressCard from '@/dev/components/checkout/reusable/AddressCard.vue';

<AddressCard :address="t('demo.checkoutReusable.address.cart')" />`,
  planDropdown: `import BasePlanDropdown from '@/dev/components/plan/parts/BasePlanDropdown.vue';

<BasePlanDropdown
  variant="checkout"
  :label="t('demo.checkoutReusable.planDropdown.country')"
  :options="countryOptions"
  v-model="selectedCountry"
/>
<BasePlanDropdown
  variant="checkout"
  :label="t('demo.checkoutReusable.planDropdown.state')"
  :options="stateOptions"
  v-model="selectedState"
  placeholder=""
/>`,
  orderSummary: `import OrderSummary from '@/dev/components/checkout/reusable/OrderSummary.vue';

<OrderSummary :items="cartItems" />`,
  paymentCompact: `import PaymentMethodLoggedIn from '@/dev/components/checkout/reusable/PaymentMethodLoggedIn.vue';

<PaymentMethodLoggedIn
  :holder-name="t('demo.checkoutReusable.payment.holderName')"
  card-number="${DEMO_CARD.number}"
  expiry="${DEMO_CARD.expiry}"
/>`,
  paymentLarge: `import PaymentMethodLoggedIn from '@/dev/components/checkout/reusable/PaymentMethodLoggedIn.vue';

<PaymentMethodLoggedIn
  variant="large"
  :holder-name="t('demo.checkoutReusable.payment.holderName')"
  card-number="${DEMO_CARD.number}"
  expiry="${DEMO_CARD.expiry}"
/>`,
  paymentNotLoggedIn: `import PaymentMethodNotLoggedIn from '@/dev/components/checkout/reusable/PaymentMethodNotLoggedIn.vue';

<PaymentMethodNotLoggedIn
  wrapper-class="max-w-[29.6875rem]"
  v-model:card-number="cardNumber"
  v-model:expiry="expiry"
  v-model:card-holder="cardHolder"
  v-model:cvv="cvv"
  v-model:save-card="saveCard"
/>`,
  subscriptionDefault: `import SubscriptionPlanCard from '@/dev/components/checkout/reusable/SubscriptionPlanCard.vue';
import { useCheckoutDemoAssets } from '@/dev/composables/useCheckoutDemoAssets.js';

const { assets } = useCheckoutDemoAssets();

<SubscriptionPlanCard
  :title="t('demo.checkoutReusable.subscription.title')"
  :price="t('demo.checkoutReusable.subscription.priceMonthly')"
  :background-image="assets.featuredMediaBg"
  accent-color="#FFCC01"
  :footer-text="t('demo.checkoutReusable.subscription.footerBillingCycle')"
/>`,
  subscriptionUpdate: `import SubscriptionPlanCard from '@/dev/components/checkout/reusable/SubscriptionPlanCard.vue';
import { useCheckoutDemoAssets } from '@/dev/composables/useCheckoutDemoAssets.js';

const { assets } = useCheckoutDemoAssets();

<SubscriptionPlanCard
  :title="t('demo.checkoutReusable.subscription.title')"
  :price="t('demo.checkoutReusable.subscription.priceMonthly')"
  :background-image="assets.featuredMediaBg"
  accent-color="#667085"
/>
<SubscriptionPlanCard
  :title="t('demo.checkoutReusable.subscription.title')"
  :price="t('demo.checkoutReusable.subscription.priceMonthly')"
  :background-image="assets.featuredMediaBg"
  accent-color="#FF0066"
  :footer-text="t('demo.checkoutReusable.subscription.footerBillingCycle')"
  footer-color="#ffffff"
/>`,
  subscriptionNew: `import SubscriptionPlanCard from '@/dev/components/checkout/reusable/SubscriptionPlanCard.vue';
import { useCheckoutDemoAssets } from '@/dev/composables/useCheckoutDemoAssets.js';

const { assets } = useCheckoutDemoAssets();

<SubscriptionPlanCard
  variant="new"
  :title="t('demo.checkoutReusable.subscription.title')"
  :price="t('demo.checkoutReusable.subscription.price')"
  period="/mo"
  :background-image="assets.profileSlideinBg"
  accent-color="#667085"
  footer-text=""
  :logo-image="assets.planLogo"
  left-section-gradient="linear-gradient(0deg,rgba(0,0,0,0.5),rgba(0,0,0,0.5)),linear-gradient(0deg,rgba(102,112,133,0.50),rgba(102,112,133,0.50))"
/>`,
  notesWithAvatars: `import CheckoutNotes from '@/dev/components/checkout/reusable/CheckoutNotes.vue';

<CheckoutNotes :show-avatars="true" v-model="notesWithAvatars" />`,
  notesWithoutAvatars: `import CheckoutNotes from '@/dev/components/checkout/reusable/CheckoutNotes.vue';

<CheckoutNotes :show-avatars="false" v-model="notesWithoutAvatars" />`,
  notesGuest: `import CheckoutNotes from '@/dev/components/checkout/reusable/CheckoutNotes.vue';

<CheckoutNotes :show-avatars="true" v-model="orderNotes" />`,
  totalAmount: `import TotalAmountRow from '@/dev/components/checkout/reusable/TotalAmountRow.vue';

<TotalAmountRow :amount="t('demo.checkoutReusable.total.amount')" />`,
  accountEmail: `import SectionToggleHeader from '@/dev/components/checkout/reusable/SectionToggleHeader.vue';
import { useCheckoutDemoAssets } from '@/dev/composables/useCheckoutDemoAssets.js';

const { assets } = useCheckoutDemoAssets();

<SectionToggleHeader
  :title="t('demo.checkoutReusable.sectionHeader.title')"
  title-color="text-[#344054]"
  icon-color="bg-[#344054]"
  :icon="assets.mailIcon"
  v-model="accountEmailOpen"
  :show-chevron="false"
  :toggleable="false"
/>`,
  topUpPayment: `import SectionToggleHeader from '@/dev/components/checkout/reusable/SectionToggleHeader.vue';
import PaymentMethodLoggedIn from '@/dev/components/checkout/reusable/PaymentMethodLoggedIn.vue';
import { useCheckoutDemoAssets } from '@/dev/composables/useCheckoutDemoAssets.js';

const { assets } = useCheckoutDemoAssets();

<SectionToggleHeader
  :title="t('demo.checkoutReusable.payment.title')"
  title-color="text-[#344054]"
  icon-color="bg-[#344054]"
  :icon="assets.paymentIcon"
  v-model="topUpPaymentOpen"
  :show-chevron="true"
  :toggleable="true"
>
  <PaymentMethodLoggedIn
    :holder-name="t('demo.checkoutReusable.payment.holderName')"
    card-number="${DEMO_CARD.number}"
    expiry="${DEMO_CARD.expiry}"
  />
</SectionToggleHeader>`,
  addressTopUp: `import AddressCard from '@/dev/components/checkout/reusable/AddressCard.vue';

<AddressCard :address="t('demo.checkoutReusable.address.topUp')" />`,
}));
</script>
