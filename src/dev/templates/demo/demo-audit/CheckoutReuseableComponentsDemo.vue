<template>
    <section class="flex flex-col gap-6">
        <DemoSectionHeader :title="t('demo.checkoutReuseable.sectionTitle')" />

        <div class=" bg-[#272727] font-sans p-6 flex flex-col gap-10 ">
            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReuseable.sections.mediaPreview') }}</p>
                <CheckoutMediaPreview
                    :image="ASSETS.featuredMediaBg"
                    :creator-name="t('demo.checkoutReuseable.mediaPreview.creatorName')"
                    :creator-handle="t('demo.checkoutReuseable.mediaPreview.creatorHandle')"
                    :is-verified="true"
                    :description="t('demo.checkoutReuseable.mediaPreview.description')"
                />
                <ShowCodeToggle :code="code.mediaPreview" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReuseable.sections.sectionHeader') }}</p>
                <SectionHeader
                    :title="t('demo.checkoutReuseable.sectionHeader.title')"
                    :icon="ASSETS.communicationIcon"
                    :show-close="true"
                />
                <ShowCodeToggle :code="code.sectionHeader" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReuseable.sections.orderSummaryToggle') }}</p>
                <SectionToggleHeader
                    :title="t('demo.checkoutReuseable.orderSummary.title')"
                    :icon="ASSETS.generalIcon"
                    v-model="orderSummaryOpen"
                >
                    <OrderSummary :items="cartItems" />
                </SectionToggleHeader>
                <ShowCodeToggle :code="code.orderSummaryToggle" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReuseable.sections.paymentToggle') }}</p>
                <SectionToggleHeader
                    :title="t('demo.checkoutReuseable.payment.title')"
                    :icon="ASSETS.paymentIcon"
                    v-model="paymentOpen"
                    :show-chevron="false"
                    :toggleable="false"
                >
                    <PaymentMethodLoggedIn
                        :holder-name="t('demo.checkoutReuseable.payment.holderName')"
                        :card-number="DEMO_CARD.number"
                        :expiry="DEMO_CARD.expiry"
                    />
                </SectionToggleHeader>
                <ShowCodeToggle :code="code.paymentToggle" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReuseable.sections.addressCard') }}</p>
                <AddressCard :address="t('demo.checkoutReuseable.address.cart')" />
                <ShowCodeToggle :code="code.addressCard" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReuseable.sections.planDropdown') }}</p>
                <div class="flex items-center gap-2">
                    <BasePlanDropdown
                        variant="checkout"
                        :label="t('demo.checkoutReuseable.planDropdown.country')"
                        :options="countryOptions"
                        v-model="selectedCountry"
                    />
                    <BasePlanDropdown
                        variant="checkout"
                        :label="t('demo.checkoutReuseable.planDropdown.state')"
                        :options="stateOptions"
                        v-model="selectedState"
                        placeholder=""
                    />
                </div>
                <ShowCodeToggle :code="code.planDropdown" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReuseable.sections.orderSummary') }}</p>
                <OrderSummary :items="cartItems" />
                <ShowCodeToggle :code="code.orderSummary" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReuseable.sections.paymentCompact') }}</p>
                <PaymentMethodLoggedIn
                    :holder-name="t('demo.checkoutReuseable.payment.holderName')"
                    :card-number="DEMO_CARD.number"
                    :expiry="DEMO_CARD.expiry"
                />
                <ShowCodeToggle :code="code.paymentCompact" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReuseable.sections.paymentLarge') }}</p>
                <PaymentMethodLoggedIn
                    variant="large"
                    :holder-name="t('demo.checkoutReuseable.payment.holderName')"
                    :card-number="DEMO_CARD.number"
                    :expiry="DEMO_CARD.expiry"
                />
                <ShowCodeToggle :code="code.paymentLarge" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReuseable.sections.paymentNotLoggedIn') }}</p>
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
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReuseable.sections.subscriptionDefault') }}</p>
                <SubscriptionPlanCard
                    :title="t('demo.checkoutReuseable.subscription.title')"
                    :price="t('demo.checkoutReuseable.subscription.priceMonthly')"
                    :background-image="ASSETS.featuredMediaBg"
                    accent-color="#FFCC01"
                    :footer-text="t('demo.checkoutReuseable.subscription.footerBillingCycle')"
                />
                <ShowCodeToggle :code="code.subscriptionDefault" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReuseable.sections.subscriptionUpdate') }}</p>
                <SubscriptionPlanCard
                    :title="t('demo.checkoutReuseable.subscription.title')"
                    :price="t('demo.checkoutReuseable.subscription.priceMonthly')"
                    :background-image="ASSETS.featuredMediaBg"
                    accent-color="#667085"
                />
                <SubscriptionPlanCard
                    :title="t('demo.checkoutReuseable.subscription.title')"
                    :price="t('demo.checkoutReuseable.subscription.priceMonthly')"
                    :background-image="ASSETS.featuredMediaBg"
                    accent-color="#FF0066"
                    :footer-text="t('demo.checkoutReuseable.subscription.footerBillingCycle')"
                    footer-color="#ffffff"
                />
                <ShowCodeToggle :code="code.subscriptionUpdate" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReuseable.sections.subscriptionNew') }}</p>
                <SubscriptionPlanCard
                    variant="new"
                    :title="t('demo.checkoutReuseable.subscription.title')"
                    :price="t('demo.checkoutReuseable.subscription.price')"
                    period="/mo"
                    :background-image="ASSETS.profileSlideinBg"
                    accent-color="#667085"
                    footer-text=""
                    :logo-image="ASSETS.planLogo"
                    left-section-gradient="linear-gradient(0deg,rgba(0,0,0,0.5),rgba(0,0,0,0.5)),linear-gradient(0deg,rgba(102,112,133,0.50),rgba(102,112,133,0.50))"
                />
                <SubscriptionPlanCard
                    variant="new"
                    :title="t('demo.checkoutReuseable.subscription.title')"
                    :price="t('demo.checkoutReuseable.subscription.price')"
                    period="/mo"
                    :background-image="ASSETS.profileSlideinBg"
                    accent-color="#ff0066"
                    :footer-text="t('demo.checkoutReuseable.subscription.footerBillingCycle')"
                    :logo-image="ASSETS.planLogo"
                    left-section-gradient="linear-gradient(0deg,rgba(0,0,0,0.5),rgba(0,0,0,0.5)),linear-gradient(0deg,rgba(255,0,102,0.50),rgba(255,0,102,0.50))"
                />
                <SubscriptionPlanCard
                    variant="new"
                    :title="t('demo.checkoutReuseable.subscription.title')"
                    :price="t('demo.checkoutReuseable.subscription.price')"
                    period="/mo"
                    :background-image="ASSETS.profileSlideinBg"
                    accent-color="#d8af0d"
                    :footer-text="t('demo.checkoutReuseable.subscription.footerCheckoutStart')"
                    :logo-image="ASSETS.planLogo"
                />
                <ShowCodeToggle :code="code.subscriptionNew" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReuseable.sections.notesWithAvatars') }}</p>
                <CheckoutNotes :show-avatars="true" v-model="notesWithAvatars" />
                <ShowCodeToggle :code="code.notesWithAvatars" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReuseable.sections.notesWithoutAvatars') }}</p>
                <CheckoutNotes :show-avatars="false" v-model="notesWithoutAvatars" />
                <ShowCodeToggle :code="code.notesWithoutAvatars" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReuseable.sections.notesGuest') }}</p>
                <CheckoutNotes :show-avatars="true" v-model="orderNotes" />
                <ShowCodeToggle :code="code.notesGuest" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#98A2B3]">{{ t('demo.checkoutReuseable.sections.totalAmount') }}</p>
                <TotalAmountRow :amount="t('demo.checkoutReuseable.total.amount')" />
                <ShowCodeToggle :code="code.totalAmount" />
            </div>
        </div>

        <div class=" flex flex-col gap-10">
            

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkoutReuseable.sections.topUpPayment') }}</p>
                <SectionToggleHeader
                    :title="t('demo.checkoutReuseable.payment.title')"
                    title-color="text-[#344054]"
                    icon-color="bg-[#344054]"
                    :icon="ASSETS.paymentIcon"
                    v-model="topUpPaymentOpen"
                    :show-chevron="true"
                    :toggleable="true"
                >
                    <PaymentMethodLoggedIn
                        :holder-name="t('demo.checkoutReuseable.payment.holderName')"
                        :card-number="DEMO_CARD.number"
                        :expiry="DEMO_CARD.expiry"
                    />
                </SectionToggleHeader>
                <ShowCodeToggle :code="code.topUpPayment" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkoutReuseable.sections.addressTopUp') }}</p>
                <AddressCard :address="t('demo.checkoutReuseable.address.topUp')" />
                <ShowCodeToggle :code="code.addressTopUp" />
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import AddressCard from '@/dev/components/checkout/reuseable/AddressCard.vue';
import BasePlanDropdown from '@/dev/components/plan/parts/BasePlanDropdown.vue';
import CheckoutMediaPreview from '@/dev/components/checkout/reuseable/CheckoutMediaPreview.vue';
import CheckoutNotes from '@/dev/components/checkout/reuseable/CheckoutNotes.vue';
import OrderSummary from '@/dev/components/checkout/reuseable/OrderSummary.vue';
import PaymentMethodLoggedIn from '@/dev/components/checkout/reuseable/PaymentMethodLoggedIn.vue';
import PaymentMethodNotLoggedIn from '@/dev/components/checkout/reuseable/PaymentMethodNotLoggedIn.vue';
import SectionHeader from '@/dev/components/checkout/reuseable/SectionHeader.vue';
import SectionToggleHeader from '@/dev/components/checkout/reuseable/SectionToggleHeader.vue';
import SubscriptionPlanCard from '@/dev/components/checkout/reuseable/SubscriptionPlanCard.vue';
import TotalAmountRow from '@/dev/components/checkout/reuseable/TotalAmountRow.vue';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';

const { t } = useI18n();

const ASSETS = {
  featuredMediaBg: 'https://i.ibb.co.com/70sHrpv/featured-media-bg.webp',
  creatorAvatar: 'https://i.ibb.co.com/67B4Cz6d/Frame-1410098582.webp',
  profileSlideinBg: 'https://i.ibb.co.com/LXPfFX03/profile-slidein-bg.webp',
  planLogo: 'https://i.ibb.co.com/p6RVnpkx/logo-1.webp',
  communicationIcon: 'https://i.ibb.co.com/LX2mCL2d/Communication.webp',
  generalIcon: 'https://i.ibb.co.com/xSK3W1w6/General.webp',
  paymentIcon: 'https://i.ibb.co.com/m5nstLw2/svgviewer-png-output-30.png',
  mailIcon: 'https://i.ibb.co.com/XfdvLvLC/mail.webp',
};

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
  name: t('demo.checkoutReuseable.cart.itemName'),
  image: ASSETS.featuredMediaBg,
  creatorName: t('demo.checkoutReuseable.cart.creatorName'),
  creatorAvatar: ASSETS.creatorAvatar,
  isVerified: true,
  price: t('demo.checkoutReuseable.cart.price'),
  oldPrice: t('demo.checkoutReuseable.cart.oldPrice'),
})));

const countryOptions = computed(() => ([
  { label: t('demo.checkoutReuseable.options.hongKong'), value: 'hong-kong' },
  { label: t('demo.checkoutReuseable.options.australia'), value: 'australia' },
  { label: t('demo.checkoutReuseable.options.usa'), value: 'usa' },
]));

const stateOptions = computed(() => ([
  { label: t('demo.checkoutReuseable.options.florida'), value: 'florida' },
  { label: t('demo.checkoutReuseable.options.hawaii'), value: 'hawaii' },
  { label: t('demo.checkoutReuseable.options.newYork'), value: 'new-york' },
]));

const code = computed(() => ({
  mediaPreview: `import CheckoutMediaPreview from '@/dev/components/checkout/reuseable/CheckoutMediaPreview.vue';

<CheckoutMediaPreview
  :image="featuredMediaBgUrl"
  :creator-name="t('demo.checkoutReuseable.mediaPreview.creatorName')"
  :creator-handle="t('demo.checkoutReuseable.mediaPreview.creatorHandle')"
  :is-verified="true"
  :description="t('demo.checkoutReuseable.mediaPreview.description')"
/>`,
  sectionHeader: `import SectionHeader from '@/dev/components/checkout/reuseable/SectionHeader.vue';

<SectionHeader
  :title="t('demo.checkoutReuseable.sectionHeader.title')"
  :icon="communicationIconUrl"
  :show-close="true"
/>`,
  orderSummaryToggle: `import SectionToggleHeader from '@/dev/components/checkout/reuseable/SectionToggleHeader.vue';
import OrderSummary from '@/dev/components/checkout/reuseable/OrderSummary.vue';

<SectionToggleHeader
  :title="t('demo.checkoutReuseable.orderSummary.title')"
  :icon="generalIconUrl"
  v-model="orderSummaryOpen"
>
  <OrderSummary :items="cartItems" />
</SectionToggleHeader>`,
  paymentToggle: `import SectionToggleHeader from '@/dev/components/checkout/reuseable/SectionToggleHeader.vue';
import PaymentMethodLoggedIn from '@/dev/components/checkout/reuseable/PaymentMethodLoggedIn.vue';

<SectionToggleHeader
  :title="t('demo.checkoutReuseable.payment.title')"
  :icon="paymentIconUrl"
  v-model="paymentOpen"
  :show-chevron="false"
  :toggleable="false"
>
  <PaymentMethodLoggedIn
    :holder-name="t('demo.checkoutReuseable.payment.holderName')"
    card-number="${DEMO_CARD.number}"
    expiry="${DEMO_CARD.expiry}"
  />
</SectionToggleHeader>`,
  addressCard: `import AddressCard from '@/dev/components/checkout/reuseable/AddressCard.vue';

<AddressCard :address="t('demo.checkoutReuseable.address.cart')" />`,
  planDropdown: `import BasePlanDropdown from '@/dev/components/plan/parts/BasePlanDropdown.vue';

<BasePlanDropdown
  variant="checkout"
  :label="t('demo.checkoutReuseable.planDropdown.country')"
  :options="countryOptions"
  v-model="selectedCountry"
/>
<BasePlanDropdown
  variant="checkout"
  :label="t('demo.checkoutReuseable.planDropdown.state')"
  :options="stateOptions"
  v-model="selectedState"
  placeholder=""
/>`,
  orderSummary: `import OrderSummary from '@/dev/components/checkout/reuseable/OrderSummary.vue';

<OrderSummary :items="cartItems" />`,
  paymentCompact: `import PaymentMethodLoggedIn from '@/dev/components/checkout/reuseable/PaymentMethodLoggedIn.vue';

<PaymentMethodLoggedIn
  :holder-name="t('demo.checkoutReuseable.payment.holderName')"
  card-number="${DEMO_CARD.number}"
  expiry="${DEMO_CARD.expiry}"
/>`,
  paymentLarge: `import PaymentMethodLoggedIn from '@/dev/components/checkout/reuseable/PaymentMethodLoggedIn.vue';

<PaymentMethodLoggedIn
  variant="large"
  :holder-name="t('demo.checkoutReuseable.payment.holderName')"
  card-number="${DEMO_CARD.number}"
  expiry="${DEMO_CARD.expiry}"
/>`,
  paymentNotLoggedIn: `import PaymentMethodNotLoggedIn from '@/dev/components/checkout/reuseable/PaymentMethodNotLoggedIn.vue';

<PaymentMethodNotLoggedIn
  wrapper-class="max-w-[29.6875rem]"
  v-model:card-number="cardNumber"
  v-model:expiry="expiry"
  v-model:card-holder="cardHolder"
  v-model:cvv="cvv"
  v-model:save-card="saveCard"
/>`,
  subscriptionDefault: `import SubscriptionPlanCard from '@/dev/components/checkout/reuseable/SubscriptionPlanCard.vue';

<SubscriptionPlanCard
  :title="t('demo.checkoutReuseable.subscription.title')"
  :price="t('demo.checkoutReuseable.subscription.priceMonthly')"
  :background-image="featuredMediaBgUrl"
  accent-color="#FFCC01"
  :footer-text="t('demo.checkoutReuseable.subscription.footerBillingCycle')"
/>`,
  subscriptionUpdate: `import SubscriptionPlanCard from '@/dev/components/checkout/reuseable/SubscriptionPlanCard.vue';

<SubscriptionPlanCard
  :title="t('demo.checkoutReuseable.subscription.title')"
  :price="t('demo.checkoutReuseable.subscription.priceMonthly')"
  :background-image="featuredMediaBgUrl"
  accent-color="#667085"
/>
<SubscriptionPlanCard
  :title="t('demo.checkoutReuseable.subscription.title')"
  :price="t('demo.checkoutReuseable.subscription.priceMonthly')"
  :background-image="featuredMediaBgUrl"
  accent-color="#FF0066"
  :footer-text="t('demo.checkoutReuseable.subscription.footerBillingCycle')"
  footer-color="#ffffff"
/>`,
  subscriptionNew: `import SubscriptionPlanCard from '@/dev/components/checkout/reuseable/SubscriptionPlanCard.vue';

<SubscriptionPlanCard
  variant="new"
  :title="t('demo.checkoutReuseable.subscription.title')"
  :price="t('demo.checkoutReuseable.subscription.price')"
  period="/mo"
  :background-image="profileSlideinBgUrl"
  accent-color="#667085"
  footer-text=""
  :logo-image="planLogoUrl"
  left-section-gradient="linear-gradient(0deg,rgba(0,0,0,0.5),rgba(0,0,0,0.5)),linear-gradient(0deg,rgba(102,112,133,0.50),rgba(102,112,133,0.50))"
/>`,
  notesWithAvatars: `import CheckoutNotes from '@/dev/components/checkout/reuseable/CheckoutNotes.vue';

<CheckoutNotes :show-avatars="true" v-model="notesWithAvatars" />`,
  notesWithoutAvatars: `import CheckoutNotes from '@/dev/components/checkout/reuseable/CheckoutNotes.vue';

<CheckoutNotes :show-avatars="false" v-model="notesWithoutAvatars" />`,
  notesGuest: `import CheckoutNotes from '@/dev/components/checkout/reuseable/CheckoutNotes.vue';

<CheckoutNotes :show-avatars="true" v-model="orderNotes" />`,
  totalAmount: `import TotalAmountRow from '@/dev/components/checkout/reuseable/TotalAmountRow.vue';

<TotalAmountRow :amount="t('demo.checkoutReuseable.total.amount')" />`,
  accountEmail: `import SectionToggleHeader from '@/dev/components/checkout/reuseable/SectionToggleHeader.vue';

<SectionToggleHeader
  :title="t('demo.checkoutReuseable.sectionHeader.title')"
  title-color="text-[#344054]"
  icon-color="bg-[#344054]"
  :icon="mailIconUrl"
  v-model="accountEmailOpen"
  :show-chevron="false"
  :toggleable="false"
/>`,
  topUpPayment: `import SectionToggleHeader from '@/dev/components/checkout/reuseable/SectionToggleHeader.vue';
import PaymentMethodLoggedIn from '@/dev/components/checkout/reuseable/PaymentMethodLoggedIn.vue';

<SectionToggleHeader
  :title="t('demo.checkoutReuseable.payment.title')"
  title-color="text-[#344054]"
  icon-color="bg-[#344054]"
  :icon="paymentIconUrl"
  v-model="topUpPaymentOpen"
  :show-chevron="true"
  :toggleable="true"
>
  <PaymentMethodLoggedIn
    :holder-name="t('demo.checkoutReuseable.payment.holderName')"
    card-number="${DEMO_CARD.number}"
    expiry="${DEMO_CARD.expiry}"
  />
</SectionToggleHeader>`,
  addressTopUp: `import AddressCard from '@/dev/components/checkout/reuseable/AddressCard.vue';

<AddressCard :address="t('demo.checkoutReuseable.address.topUp')" />`,
}));
</script>
