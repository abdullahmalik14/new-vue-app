<template>
    <section class="flex flex-col gap-10">
        <DemoSectionHeader :title="t('demo.profileComponents.sectionTitle')" />
        <p class="text-xs text-slate-500/80 -mt-6 max-w-3xl">
            {{ t('demo.profileComponents.sectionDescription') }}
        </p>

        <!-- ===== GROUP: Header Cluster ===== -->
        <div class="flex flex-col gap-8">
            <p class="text-sm font-semibold text-[#344054] uppercase tracking-wider">{{ t('demo.profileComponents.groups.header') }}</p>

            <!-- ProfileHeader -->
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-[#344054]">{{ t('demo.profileComponents.items.profileHeader') }}</span>
                    <span :class="badgeClass">{{ t('demo.profileComponents.badges.always') }}</span>
                </div>
                <div class="flex justify-between">
                    <ProfileHeader />
                    <div></div>
                </div>
                <ShowCodeToggle :code="code.profileHeader" />
            </div>

            <!-- ProfileHeaderActions -->
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-[#344054]">{{ t('demo.profileComponents.items.profileHeaderActions') }}</span>
                    <span :class="badgeClass">{{ t('demo.profileComponents.badges.always') }}</span>
                </div>
                <div class="flex justify-between">
                    <ProfileHeaderActions />
                    <div></div>
                </div>
                <ShowCodeToggle :code="code.profileHeaderActions" />
            </div>

            <!-- ProfileHeaderOptionButtons -->
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-[#344054]">{{ t('demo.profileComponents.items.profileHeaderOptionButtons') }}</span>
                    <span :class="badgeClass">{{ t('demo.profileComponents.badges.desktop') }}</span>
                </div>
                <div class="flex justify-between">
                    <ProfileHeaderOptionButtons />
                    <div></div>
                </div>
                <ShowCodeToggle :code="code.profileHeaderOptionButtons" />
            </div>

            <!-- ProfileHeaderUserDesktop -->
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-[#344054]">{{ t('demo.profileComponents.items.profileHeaderUserDesktop') }}</span>
                    <span :class="badgeClass">{{ t('demo.profileComponents.badges.always') }}</span>
                </div>
                <div class="flex justify-between">
                    <ProfileHeaderUserDesktop />
                    <div></div>
                </div>
                <ShowCodeToggle :code="code.profileHeaderUserDesktop" />
            </div>

            <!-- ProfileHeaderUserResponsive -->
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-[#344054]">{{ t('demo.profileComponents.items.profileHeaderUserResponsive') }}</span>
                    <span :class="badgeClassMobile">{{ t('demo.profileComponents.badges.mobileOnly') }}</span>
                </div>
                <p class="text-xs text-slate-500/70">{{ t('demo.profileComponents.notes.mobileOnly') }}</p>
                <div class="flex justify-between">
                    <ProfileHeaderUserResponsive />
                    <div></div>
                </div>
                <ShowCodeToggle :code="code.profileHeaderUserResponsive" />
            </div>
        </div>

        <!-- ===== GROUP: Hero / Meta Cluster ===== -->
        <div class="flex flex-col gap-8">
            <p class="text-sm font-semibold text-[#344054] uppercase tracking-wider">{{ t('demo.profileComponents.groups.hero') }}</p>

            <!-- ProfileMeta -->
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-[#344054]">{{ t('demo.profileComponents.items.profileMeta') }}</span>
                    <span :class="badgeClass">{{ t('demo.profileComponents.badges.desktop') }}</span>
                </div>
                <div class="flex justify-between">
                    <ProfileMeta />
                    <div></div>
                </div>
                <ShowCodeToggle :code="code.profileMeta" />
            </div>

            <!-- ProfileMetaResponsive -->
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-[#344054]">{{ t('demo.profileComponents.items.profileMetaResponsive') }}</span>
                    <span :class="badgeClassMobile">{{ t('demo.profileComponents.badges.mobileOnly') }}</span>
                </div>
                <p class="text-xs text-slate-500/70">{{ t('demo.profileComponents.notes.mobileOnly') }}</p>
                <div class="flex justify-between">
                    <ProfileMetaResponsive />
                    <div></div>
                </div>
                <ShowCodeToggle :code="code.profileMetaResponsive" />
            </div>

            <!-- ProfileRightButtons (absolute-positioned; kept in a relative box so it renders in place) -->
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-[#344054]">{{ t('demo.profileComponents.items.profileRightButtons') }}</span>
                    <span :class="badgeClass">{{ t('demo.profileComponents.badges.always') }}</span>
                </div>
                <div class="relative min-h-[24rem]">
                    <ProfileRightButtons />
                </div>
                <ShowCodeToggle :code="code.profileRightButtons" />
            </div>
        </div>

        <!-- ===== GROUP: Description & Sharing ===== -->
        <div class="flex flex-col gap-8">
            <p class="text-sm font-semibold text-[#344054] uppercase tracking-wider">{{ t('demo.profileComponents.groups.sharing') }}</p>

            <!-- ProfileDescription -->
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-[#344054]">{{ t('demo.profileComponents.items.profileDescription') }}</span>
                    <span :class="badgeClass">{{ t('demo.profileComponents.badges.always') }}</span>
                </div>
                <div class="flex justify-between">
                    <ProfileDescription />
                    <div></div>
                </div>
                <ShowCodeToggle :code="code.profileDescription" />
            </div>

            <!-- ProfileSharing -->
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-[#344054]">{{ t('demo.profileComponents.items.profileSharing') }}</span>
                    <span :class="badgeClass">{{ t('demo.profileComponents.badges.desktop') }}</span>
                </div>
                <div class="flex justify-between">
                    <ProfileSharing />
                    <div></div>
                </div>
                <ShowCodeToggle :code="code.profileSharing" />
            </div>

            <!-- ProfileSharingResponsive -->
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-[#344054]">{{ t('demo.profileComponents.items.profileSharingResponsive') }}</span>
                    <span :class="badgeClassMobile">{{ t('demo.profileComponents.badges.mobileOnly') }}</span>
                </div>
                <p class="text-xs text-slate-500/70">{{ t('demo.profileComponents.notes.mobileOnly') }}</p>
                <div class="flex justify-between">
                    <ProfileSharingResponsive />
                    <div></div>
                </div>
                <ShowCodeToggle :code="code.profileSharingResponsive" />
            </div>
        </div>

        <!-- ===== GROUP: Subscribe & Right Actions ===== -->
        <div class="flex flex-col gap-8">
            <p class="text-sm font-semibold text-[#344054] uppercase tracking-wider">{{ t('demo.profileComponents.groups.cta') }}</p>

            <!-- ProfileSubscribeCta -->
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-[#344054]">{{ t('demo.profileComponents.items.profileSubscribeCta') }}</span>
                    <span :class="badgeClass">{{ t('demo.profileComponents.badges.desktop') }}</span>
                </div>
                <p class="text-xs text-slate-500/70">{{ t('demo.profileComponents.notes.wide') }}</p>
                <div class="flex justify-between overflow-x-auto">
                    <ProfileSubscribeCta />
                    <div></div>
                </div>
                <ShowCodeToggle :code="code.profileSubscribeCta" />
            </div>
        </div>

        <!-- ===== GROUP: Media Tabs & Cards ===== -->
        <div class="flex flex-col gap-8">
            <p class="text-sm font-semibold text-[#344054] uppercase tracking-wider">{{ t('demo.profileComponents.groups.cards') }}</p>

            <!-- ProfileMediaTabHeading -->
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-[#344054]">{{ t('demo.profileComponents.items.profileMediaTabHeading') }}</span>
                    <span :class="badgeClass">{{ t('demo.profileComponents.badges.always') }}</span>
                </div>
                <div class="flex flex-col gap-4">
                    <!-- with count -->
                    <div class="flex justify-between">
                        <ProfileMediaTabHeading :title="t('demo.profileComponents.data.mediaTabPayToView')" :count="11" />
                        <div></div>
                    </div>
                    <!-- without count -->
                    <div class="flex justify-between">
                        <ProfileMediaTabHeading :title="t('demo.profileComponents.data.mediaTabSubscription')" />
                        <div></div>
                    </div>
                </div>
                <ShowCodeToggle :code="code.profileMediaTabHeading" />
            </div>

            <!-- FeedPollCard -->
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-[#344054]">{{ t('demo.profileComponents.items.feedPollCard') }}</span>
                    <span :class="badgeClass">{{ t('demo.profileComponents.badges.always') }}</span>
                </div>
                <div class="flex justify-between">
                    <div class="w-full max-w-[20rem]">
                        <FeedPollCard
                            day="31"
                            suffix="st"
                            :title="t('demo.profileComponents.data.pollTitle')"
                            :options="pollOptions"
                            :totalVotes="400"
                            :timeLeft="t('demo.profileComponents.data.pollTimeLeft')"
                        />
                    </div>
                    <div></div>
                </div>
                <ShowCodeToggle :code="code.feedPollCard" />
            </div>

            <!-- FeedMediaCard -->
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-[#344054]">{{ t('demo.profileComponents.items.feedMediaCard') }}</span>
                    <span :class="badgeClass">{{ t('demo.profileComponents.badges.always') }}</span>
                </div>
                <div class="flex justify-between">
                    <div class="w-full max-w-[20rem]">
                        <FeedMediaCard
                            day="31"
                            suffix="st"
                            :description="t('demo.profileComponents.data.feedDescription')"
                            :likes="205"
                            :comments="16"
                            :bgImage="feedBgUrl"
                            :hoverBg="feedHoverBgUrl"
                        />
                    </div>
                    <div></div>
                </div>
                <ShowCodeToggle :code="code.feedMediaCard" />
            </div>

            <!-- MediaCardV2 grid (reusable media card in a responsive grid) -->
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-[#344054]">{{ t('demo.profileComponents.items.profileMediaGrid') }}</span>
                    <span :class="badgeClass">{{ t('demo.profileComponents.badges.always') }}</span>
                </div>
                <ul data-media-list-container class="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-4">
                    <MediaCardV2
                        v-for="(entry, index) in mediaGridCards"
                        :key="index"
                        :media="entry.card"
                        aspect-class="aspect-[2/1.1522]"
                        class="cursor-pointer"
                        @click="openMediaPopup(entry.source)"
                    />
                </ul>
                <ShowCodeToggle :code="code.profileMediaGrid" />
            </div>

            <!-- MerchCard -->
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-[#344054]">{{ t('demo.profileComponents.items.merchCard') }}</span>
                    <span :class="badgeClass">{{ t('demo.profileComponents.badges.always') }}</span>
                </div>
                <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                    <!-- pre-order (default / white overlay) -->
                    <MerchCard
                        :bgImage="merchBgUrl"
                        :title="t('demo.profileComponents.data.merchTitle')"
                        currency="USD"
                        price="$25"
                        finalPrice="$25"
                        :description="t('demo.profileComponents.data.merchDescription')"
                        :overlayBg="merchOverlayBg"
                        :overlayHoverBg="merchOverlayHoverBg"
                        @click="openMerchPopup('pre-order')"
                    />
                    <!-- discount (yellow overlay + 10% OFF tag) -->
                    <MerchCard
                        :bgImage="merchBgUrl"
                        :title="t('demo.profileComponents.data.merchTitle')"
                        currency="USD"
                        price="$25"
                        finalPrice="$25"
                        :discountText="t('demo.profileComponents.data.merchDiscount')"
                        :description="t('demo.profileComponents.data.merchDescription')"
                        :overlayBg="merchDiscountOverlayBg"
                        :overlayHoverBg="merchDiscountOverlayHoverBg"
                        @click="openMerchPopup('regular')"
                    />
                    <!-- out-of-stock -->
                    <MerchCard
                        :bgImage="merchBgUrl"
                        :title="t('demo.profileComponents.data.merchTitleOutOfStock')"
                        currency="USD"
                        price="$25"
                        finalPrice="$25"
                        :description="t('demo.profileComponents.data.merchDescriptionOutOfStock')"
                        :overlayBg="merchOverlayBg"
                        :overlayHoverBg="merchOverlayHoverBg"
                        @click="openMerchPopup('out-of-stock')"
                    />
                </div>
                <ShowCodeToggle :code="code.merchCard" />
            </div>
        </div>

        <!-- ===== GROUP: Subscription Carousel ===== -->
        <div class="flex flex-col gap-8">
            <p class="text-sm font-semibold text-[#344054] uppercase tracking-wider">{{ t('demo.profileComponents.groups.subscription') }}</p>

            <!-- ProfileSubscriptionCards -->
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-[#344054]">{{ t('demo.profileComponents.items.profileSubscriptionCards') }}</span>
                    <span :class="badgeClass">{{ t('demo.profileComponents.badges.always') }}</span>
                </div>
                <p class="text-xs text-slate-500/70">{{ t('demo.profileComponents.notes.tall') }}</p>
                <div>
                    <ProfileSubscriptionCards />
                </div>
                <ShowCodeToggle :code="code.profileSubscriptionCards" />
            </div>
        </div>

        <!-- Popups wired exactly like ProfileWrapper.vue for the card examples -->
        <ProfileMediaDetailsPopup v-model="profileMediaDetailsPopupOpen" :media="selectedMedia" />
        <ProfileMerchPopup v-model="profileMerchPopupOpen" :variant="selectedMerchVariant" />
    </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';

import ProfileHeader from '@/dev/components/profile/ProfileHeader.vue';
import ProfileHeaderActions from '@/dev/components/profile/ProfileHeaderActions.vue';
import ProfileHeaderOptionButtons from '@/dev/components/profile/ProfileHeaderOptionButtons.vue';
import ProfileHeaderUserDesktop from '@/dev/components/profile/ProfileHeaderUserDesktop.vue';
import ProfileHeaderUserResponsive from '@/dev/components/profile/ProfileHeaderUserResponsive.vue';
import ProfileMeta from '@/dev/components/profile/ProfileMeta.vue';
import ProfileMetaResponsive from '@/dev/components/profile/ProfileMetaResponsive.vue';
import ProfileRightButtons from '@/dev/components/profile/ProfileRightButtons.vue';
import ProfileDescription from '@/dev/components/profile/ProfileDescription.vue';
import ProfileSharing from '@/dev/components/profile/ProfileSharing.vue';
import ProfileSharingResponsive from '@/dev/components/profile/ProfileSharingResponsive.vue';
import ProfileSubscribeCta from '@/dev/components/profile/ProfileSubscribeCta.vue';
import ProfileMediaTabHeading from '@/dev/components/profile/ProfileMediaTabHeading.vue';
import ProfileSubscriptionCards from '@/dev/components/profile/ProfileSubscriptionCards.vue';

import FeedPollCard from '@/dev/components/ui/card/dashboard/FeedPollCard.vue';
import FeedMediaCard from '@/dev/components/ui/card/dashboard/FeedMediaCard.vue';
import MediaCardV2 from '@/components/ui/media/media-cards/MediaCardV2.vue';
import MerchCard from '@/dev/components/ui/card/dashboard/MerchCard.vue';

import ProfileMediaDetailsPopup from '@/components/ui/popups/ProfileMediaDetailsPopup.vue';
import ProfileMerchPopup from '@/dev/components/ui/popups/profile/ProfileMerchPopup.vue';

const SAMPLE_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

const { t } = useI18n();

const { url: feedBgUrl } = useAssetUrl('subscriptionCard.demo.bg4');
const { url: feedHoverBgUrl } = useAssetUrl('subscriptionCard.demo.bg1');
const { url: merchBgUrl } = useAssetUrl('subscriptionCard.demo.bg4');
const { url: mediaImg1Url } = useAssetUrl('subscriptionCard.demo.bg1');
const { url: mediaImg2Url } = useAssetUrl('subscriptionCard.demo.bg2');
const { url: mediaImg3Url } = useAssetUrl('subscriptionCard.demo.bg3');

const badgeClass = 'text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 uppercase tracking-wider';
const badgeClassMobile = 'text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 uppercase tracking-wider';

const pollOptions = computed(() => [
    { label: t('demo.profileComponents.data.pollOptionOrange'), percent: 70, votes: 25, checked: true },
    { label: t('demo.profileComponents.data.pollOptionApple'), percent: 20, votes: 25 },
    { label: t('demo.profileComponents.data.pollOptionChicken'), percent: 10, votes: 25 },
]);

const mediaGridCards = computed(() =>
    [mediaImg1Url, mediaImg2Url, mediaImg3Url, mediaImg1Url, mediaImg2Url, mediaImg3Url].map((imageRef, index) => {
        const source = {
            image: imageRef.value,
            alt: t('demo.profileComponents.data.mediaAlt', { n: index + 1 }),
            duration: '14:09',
            timeAgo: '2h ago',
            likes: '0',
            views: '0',
            video: SAMPLE_VIDEO_URL,
            title: t('demo.profileComponents.data.mediaTitle'),
        };
        return {
            source,
            card: {
                type: 'video',
                poster: source.image,
                videoUrl: source.video,
                duration: source.duration,
                timeAgo: source.timeAgo,
                likes: source.likes,
                views: source.views,
                title: source.title,
                showTag: true,
                tagText: t('profile.labels.subscribeOrBuy'),
                tagColor: 'pink',
            },
        };
    }),
);

const merchOverlayBg = 'linear-gradient(0deg, rgba(255,255,255,0.68) -3.06%, rgba(255,255,255,0) 144.5%), linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1))';
const merchOverlayHoverBg = 'linear-gradient(0deg, rgba(255,255,255,0.9) -3.06%, rgba(255,255,255,0) 144.5%), linear-gradient(0deg, rgba(0,0,0,0.25), rgba(0,0,0,0.25))';
const merchDiscountOverlayBg = 'linear-gradient(0deg, rgba(255,205,41,0.68) -3.06%, rgba(255,205,41,0) 117.35%), linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1))';
const merchDiscountOverlayHoverBg = 'linear-gradient(0deg, rgba(255,205,41,0.9) -3.06%, rgba(255,205,41,0) 117.35%), linear-gradient(0deg, rgba(0,0,0,0.25), rgba(0,0,0,0.25))';

// --- Popup wiring (same as ProfileWrapper.vue) ---
const profileMediaDetailsPopupOpen = ref(false);
const selectedMedia = ref({});
const profileMerchPopupOpen = ref(false);
const selectedMerchVariant = ref('regular');

const openMediaPopup = (media) => {
    selectedMedia.value = media;
    profileMediaDetailsPopupOpen.value = true;
};

const openMerchPopup = (variant) => {
    selectedMerchVariant.value = variant;
    profileMerchPopupOpen.value = true;
};

// --- Real usage snippets (as used in ProfileWrapper.vue) ---
const code = {
    profileHeader: `import ProfileHeader from '@/dev/components/profile/ProfileHeader.vue';

<!-- Logo bar + header actions. Renders on the profile hero. -->
<ProfileHeader />`,
    profileHeaderActions: `import ProfileHeaderActions from '@/dev/components/profile/ProfileHeaderActions.vue';

<!-- Cart / notifications / language / avatar. Nested inside ProfileHeader. -->
<ProfileHeaderActions />`,
    profileHeaderOptionButtons: `import ProfileHeaderOptionButtons from '@/dev/components/profile/ProfileHeaderOptionButtons.vue';

<!-- Desktop header: tip / call / message icon buttons -->
<div class="hidden md:flex justify-end items-center gap-4 flex-wrap py-2 xl:justify-[unset]">
  <ProfileHeaderOptionButtons />
  <ProfileHeaderUserDesktop />
</div>`,
    profileHeaderUserDesktop: `import ProfileHeaderUserDesktop from '@/dev/components/profile/ProfileHeaderUserDesktop.vue';

<!-- Desktop user info block (handle, stats, actions, avatar) -->
<ProfileHeaderUserDesktop />`,
    profileHeaderUserResponsive: `import ProfileHeaderUserResponsive from '@/dev/components/profile/ProfileHeaderUserResponsive.vue';

<!-- Mobile header user row (md:hidden) -->
<ProfileHeaderUserResponsive />`,
    profileMeta: `import ProfileMeta from '@/dev/components/profile/ProfileMeta.vue';

<!-- Desktop hero meta: followers / likes / subscribers + avatar -->
<ProfileMeta />`,
    profileMetaResponsive: `import ProfileMetaResponsive from '@/dev/components/profile/ProfileMetaResponsive.vue';

<!-- Mobile hero meta row (md:hidden) -->
<ProfileMetaResponsive />`,
    profileRightButtons: `import ProfileRightButtons from '@/dev/components/profile/ProfileRightButtons.vue';

<!-- Absolute-positioned tip / call / message column (self-contains its popups) -->
<ProfileRightButtons />`,
    profileDescription: `import ProfileDescription from '@/dev/components/profile/ProfileDescription.vue';

<!-- Bio text with "Read more" (opens ProfileSeeMorePopup) -->
<ProfileDescription />`,
    profileSharing: `import ProfileSharing from '@/dev/components/profile/ProfileSharing.vue';

<!-- Desktop share row: heart / link / more -->
<ProfileSharing />`,
    profileSharingResponsive: `import ProfileSharingResponsive from '@/dev/components/profile/ProfileSharingResponsive.vue';

<!-- Mobile share row incl. Tip button (md:hidden) -->
<ProfileSharingResponsive />`,
    profileSubscribeCta: `import ProfileSubscribeCta from '@/dev/components/profile/ProfileSubscribeCta.vue';

<!-- Two-part subscribe/buy CTA (opens ProfileSubscriptionPopup) -->
<ProfileSubscribeCta />`,
    profileMediaTabHeading: `import ProfileMediaTabHeading from '@/dev/components/profile/ProfileMediaTabHeading.vue';

<!-- with count -->
<ProfileMediaTabHeading title="Pay to View" :count="11" />

<!-- without count -->
<ProfileMediaTabHeading title="Subscription" />`,
    feedPollCard: `import FeedPollCard from '@/dev/components/ui/card/dashboard/FeedPollCard.vue';

<FeedPollCard
  day="31"
  suffix="st"
  title="What Should I eat for tonight's live stream?"
  :options="[
    { label: 'Orange', percent: 70, votes: 25, checked: true },
    { label: 'Apple', percent: 20, votes: 25 },
    { label: 'Chicken', percent: 10, votes: 25 },
  ]"
  :totalVotes="400"
  timeLeft="24 hours left to vote"
/>`,
    feedMediaCard: `import FeedMediaCard from '@/dev/components/ui/card/dashboard/FeedMediaCard.vue';
import checkoutHeader from '/images/checkout-header.webp';
import sampleBg from '/images/slide-2.webp';

<FeedMediaCard
  day="31"
  suffix="st"
  description="Jenny is back! Tonight I will eat mostly fruits. -> 8pm EST time 👅!"
  :likes="205"
  :comments="16"
  :bgImage="checkoutHeader"
  :hoverBg="sampleBg"
/>`,
    profileMediaGrid: `import MediaCardV2 from '@/components/ui/media/media-cards/MediaCardV2.vue';

<!-- Reusable MediaCardV2 in the profile media grid -->
<ul class="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-4">
  <MediaCardV2
    v-for="(entry, index) in mediaGridCards"
    :key="index"
    :media="entry.card"
    aspect-class="aspect-[2/1.1522]"
    class="cursor-pointer"
    @click="openMediaPopup(entry.source)"
  />
</ul>

// entry.card shape (MediaCardV2):
// { type:'video', poster, videoUrl, duration, timeAgo, likes, views,
//   title, showTag:true, tagText:'Subscribe or Buy', tagColor:'pink' }`,
    merchCard: `import MerchCard from '@/dev/components/ui/card/dashboard/MerchCard.vue';

<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
  <!-- 1. pre-order (white overlay) -->
  <MerchCard
    bgImage="/images/checkout-header.webp"
    title="My top (washed) Get Jenny's favourite Mangoes!"
    currency="USD" price="$25" finalPrice="$25"
    description="Get Jenny's favourite Mangoes! Buy them while supply last !"
    :overlayBg="whiteOverlayBg"
    :overlayHoverBg="whiteOverlayHoverBg"
    @click="openMerchPopup('pre-order')"
  />

  <!-- 2. discount (yellow overlay + 10% OFF) -->
  <MerchCard
    bgImage="/images/checkout-header.webp"
    title="My top (washed) Get Jenny's favourite Mangoes!"
    currency="USD" price="$25" finalPrice="$25"
    discountText="10% OFF"
    description="Get Jenny's favourite Mangoes! Buy them while supply last !"
    :overlayBg="yellowOverlayBg"
    :overlayHoverBg="yellowOverlayHoverBg"
    @click="openMerchPopup('regular')"
  />

  <!-- 3. out-of-stock -->
  <MerchCard
    bgImage="/images/checkout-header.webp"
    title="Out of Stock Item"
    currency="USD" price="$25" finalPrice="$25"
    description="This item is out of stock."
    :overlayBg="whiteOverlayBg"
    :overlayHoverBg="whiteOverlayHoverBg"
    @click="openMerchPopup('out-of-stock')"
  />
</div>`,
    profileSubscriptionCards: `import ProfileSubscriptionCards from '@/dev/components/profile/ProfileSubscriptionCards.vue';

<!-- Draggable/swipeable carousel of SubscriptionCard (self-contains UpgradeTierPopup) -->
<ProfileSubscriptionCards />`,
};
</script>
