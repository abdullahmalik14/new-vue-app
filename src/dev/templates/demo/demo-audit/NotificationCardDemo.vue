<template>
    <section class="flex flex-col gap-6">
        <DemoSectionHeader :title="t('demo.notificationCard.sectionTitle')" />
        <div class="flex flex-col gap-10 max-w-3xl">
            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.notificationCard.sections.devDemo') }}</p>
                <div v-for="item in devDemoItems" :key="item.key" class="flex flex-col gap-3">
                    <NotificationCard
                        v-model="open[item.key]"
                        :variant="item.variant"
                        :title="item.titleKey ? t(item.titleKey) : ''"
                        :description="item.descriptionKey ? t(item.descriptionKey) : ''"
                        :link-label="item.linkLabelKey ? t(item.linkLabelKey) : ''"
                        :link-href="item.linkHref || ''"
                        :icon="item.icon || undefined"
                        :show-icon="item.showIcon !== false"
                    />
                    <ShowCodeToggle :code="code[item.key]" />
                </div>
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.notificationCard.sections.mediaPublish') }}</p>
                <NotificationCard
                    v-model="open.mediaPublishConnectX"
                    variant="notice"
                    :title="t('demo.notificationCard.mediaPublish.connectXTitle')"
                    link-href="#"
                    :show-icon="false"
                    :closable="false"
                >
                    <button class="py-1 px-2 w-max bg-[#22CCEE] text-[12px] text-[#FFFFFF]">
                        {{ t('demo.notificationCard.mediaPublish.connectXButton') }}
                    </button>
                </NotificationCard>
                <ShowCodeToggle :code="code.mediaPublishConnectX" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.notificationCard.sections.mediaSubmit') }}</p>
                <NotificationCard
                    v-model="open.mediaSubmitWarning"
                    variant="warning"
                    :icon="ExclamationTriangleIcon"
                    :description="t('demo.notificationCard.mediaSubmit.warningDescription')"
                />
                <ShowCodeToggle :code="code.mediaSubmitWarning" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.notificationCard.sections.mediaPreviewToast') }}</p>
                <div class="w-[350px]">
                    <NotificationCard
                        v-model="open.mediaPreviewToast"
                        variant="success-teal"
                        :title="t('demo.notificationCard.mediaPreviewToast.uploadedTitle')"
                        :closable="false"
                        :icon="CheckCircleIcon"
                    />
                </div>
                <ShowCodeToggle :code="code.mediaPreviewToast" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.notificationCard.sections.bookingCalendar') }}</p>
                <NotificationCard
                    v-model="open.bookingCalendarView"
                    variant="alert"
                    :show-icon="false"
                    :title="t('demo.notificationCard.bookingCalendar.title')"
                    :description="t('demo.notificationCard.bookingCalendar.description')"
                />
                <ShowCodeToggle :code="code.bookingCalendarView" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.notificationCard.sections.planDetail') }}</p>
                <NotificationCard
                    v-model="open.planDetailFeatured"
                    variant="alert"
                    :show-icon="false"
                    :closable="false"
                    :title="t('demo.notificationCard.planDetail.featuredTierTitle')"
                    :description="t('demo.notificationCard.planDetail.featuredTierDescription')"
                />
                <ShowCodeToggle :code="code.planDetailFeatured" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.notificationCard.sections.tipStep2') }}</p>
                <div class="w-full relative">
                    <NotificationCard
                        v-model="open.tipLimitExceeded"
                        variant="limit-exceeded"
                        :show-icon="false"
                        :closable="false"
                        class="w-full"
                    >
                        <template #default>
                            <div class="relative w-full flex gap-4">
                                <div class="relative">
                                    <img
                                        :src="alertIconUrl"
                                        alt="alert-icon"
                                        class="h-10"
                                    />
                                </div>
                                <div class="flex flex-col w-full">
                                    <p class="text-sm font-semibold text-[#ff4405]">
                                        {{ t('demo.notificationCard.tipStep2.limitExceededTitle') }}
                                    </p>
                                    <div class="flex justify-end items-end w-full">
                                        <button
                                            type="button"
                                            class="flex items-center gap-1 p-0 bg-transparent outline-none border-none cursor-pointer"
                                        >
                                            <span class="text-xs leading-normal font-medium text-[#ff4405]">
                                                {{ t('demo.notificationCard.tipStep2.setToMax') }}
                                            </span>
                                            <img
                                                :src="chevronLeftIconUrl"
                                                alt="chevron-left"
                                                class="w-4 h-4 [filter:brightness(100)] rotate-180"
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </NotificationCard>
                </div>
                <ShowCodeToggle :code="code.tipLimitExceeded" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.notificationCard.sections.editProfileUnsaved') }}</p>
                <NotificationCard
                    v-model="open.editProfileUnsaved"
                    variant="notice"
                    :title="t('demo.notificationCard.editProfile.unsavedTitle')"
                    :description="t('demo.notificationCard.editProfile.unsavedDescription')"
                    :icon="smileyFaceIconUrl"
                    :badge-icon="infoSquareIconUrl"
                />
                <ShowCodeToggle :code="code.editProfileUnsaved" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.notificationCard.sections.editProfileGallery') }}</p>
                <NotificationCard
                    v-model="open.editProfileGallery"
                    variant="success-teal"
                    :title="t('demo.notificationCard.editProfile.galleryTitle')"
                    :description="t('demo.notificationCard.editProfile.galleryDescription')"
                    :badge-icon="tickMarkIconUrl"
                />
                <ShowCodeToggle :code="code.editProfileGallery" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.notificationCard.sections.mediaPreviewSettings') }}</p>
                <NotificationCard
                    v-model="open.mediaPreviewTrailerReview"
                    variant="alert"
                    :show-icon="false"
                    :title="t('demo.notificationCard.mediaPreviewSettings.trailerReviewTitle')"
                    description=""
                />
                <ShowCodeToggle :code="code.mediaPreviewTrailerReview" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.notificationCard.sections.bookingUnified') }}</p>
                <NotificationCard
                    v-model="open.bookingUnifiedAlert"
                    variant="alert"
                    :show-icon="false"
                    :title="t('demo.notificationCard.bookingUnified.activeSubscribersTitle')"
                    :description="t('demo.notificationCard.bookingUnified.activeSubscribersDescription')"
                />
                <ShowCodeToggle :code="code.bookingUnifiedAlert" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.notificationCard.sections.bookingStep1') }}</p>
                <NotificationCard
                    v-model="open.bookingStep1Error"
                    variant="error"
                    :title="t('demo.notificationCard.bookingStep1.validationTitle')"
                    :description="t('demo.notificationCard.bookingStep1.validationDescription')"
                />
                <ShowCodeToggle :code="code.bookingStep1Error" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.notificationCard.sections.withdrawEarnings') }}</p>
                <NotificationCard
                    v-model="open.withdrawPayoutAccepted"
                    variant="success-teal"
                    :title="t('demo.notificationCard.withdrawEarnings.payoutAcceptedTitle')"
                    :icon="checkCircleIconUrl"
                    :closable="false"
                />
                <ShowCodeToggle :code="code.withdrawPayoutAccepted" />
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/solid';
import NotificationCard from '@/components/ui/card/dashboard/NotificationCard.vue';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { t } = useI18n();

const { url: smileyFaceIconUrl } = useAssetUrl('icon.notification.smileyFace');
const { url: infoSquareIconUrl } = useAssetUrl('icon.notification.infoSquare');
const { url: tickMarkIconUrl } = useAssetUrl('icon.notification.tickMark');
const { url: checkCircleIconUrl } = useAssetUrl('icon.notification.checkCircle');
const { url: alertIconUrl } = useAssetUrl('icon.notification.alertIcon');
const { url: chevronLeftIconUrl } = useAssetUrl('icon.notification.chevronLeft');

const devDemoItems = [
    {
        key: 'devNotice',
        variant: 'notice',
        titleKey: 'demo.notificationCard.devDemo.activeSubscribersTitle',
        descriptionKey: 'demo.notificationCard.devDemo.activeSubscribersDescription',
        linkLabelKey: 'demo.notificationCard.devDemo.learnMore',
        linkHref: '#',
    },
    {
        key: 'devAlert',
        variant: 'alert',
        showIcon: false,
        titleKey: 'demo.notificationCard.devDemo.activeSubscribersTitle',
        descriptionKey: 'demo.notificationCard.devDemo.activeSubscribersDescription',
    },
    {
        key: 'devSuccess',
        variant: 'success',
        icon: CheckCircleIcon,
        titleKey: 'demo.notificationCard.devDemo.successTitle',
        descriptionKey: 'demo.notificationCard.devDemo.successDescription',
    },
    {
        key: 'devError',
        variant: 'error',
        titleKey: 'demo.notificationCard.devDemo.errorTitle',
        descriptionKey: 'demo.notificationCard.devDemo.errorDescription',
    },
    {
        key: 'devInfo',
        variant: 'info',
        titleKey: 'demo.notificationCard.devDemo.infoTitle',
        descriptionKey: 'demo.notificationCard.devDemo.infoDescription',
    },
    {
        key: 'devWarning',
        variant: 'warning',
        icon: ExclamationTriangleIcon,
        descriptionKey: 'demo.notificationCard.mediaSubmit.warningDescription',
    },
];

const open = reactive({
    devNotice: true,
    devAlert: true,
    devSuccess: true,
    devError: true,
    devInfo: true,
    devWarning: true,
    mediaPublishConnectX: true,
    mediaSubmitWarning: true,
    mediaPreviewToast: true,
    bookingCalendarView: true,
    planDetailFeatured: true,
    tipLimitExceeded: true,
    editProfileUnsaved: true,
    editProfileGallery: true,
    mediaPreviewTrailerReview: true,
    bookingUnifiedAlert: true,
    bookingStep1Error: true,
    withdrawPayoutAccepted: true,
});

const importLine = "import NotificationCard from '@/components/ui/card/dashboard/NotificationCard.vue';";
const heroiconsImport = "import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/solid';";

const code = computed(() => ({
    devNotice: `${importLine}

<NotificationCard
  variant="notice"
  title="You have 3 active subscriber in this tier"
  description="Changing detail of this plan might affect current subscriber's subscription fee and benefits."
  link-label="Learn more"
  link-href="#"
/>`,
    devAlert: `${importLine}

<NotificationCard
  variant="alert"
  :show-icon="false"
  title="You have 3 active subscriber in this tier"
  description="Changing detail of this plan might affect current subscriber's subscription fee and benefits."
/>`,
    devSuccess: `${heroiconsImport}
${importLine}

<NotificationCard
  variant="success"
  :icon="CheckCircleIcon"
  title="Action completed successfully"
  description="All systems are now up and running."
/>`,
    devError: `${importLine}

<NotificationCard
  variant="error"
  title="Payment failed"
  description="Please update your billing information to continue."
/>`,
    devInfo: `${importLine}

<NotificationCard
  variant="info"
  title="Heads up"
  description="We updated our terms of service."
/>`,
    devWarning: `${heroiconsImport}
${importLine}

<NotificationCard
  variant="warning"
  :icon="ExclamationTriangleIcon"
  description="WARNING: Uploading (or attempting to upload) content that violates..."
/>`,
    mediaPublishConnectX: `${importLine}

<NotificationCard
  variant="notice"
  title="You must connect to your X account before using auto repost feature."
  link-href="#"
  :show-icon="false"
  :closable="false"
>
  <button class="py-1 px-2 w-max bg-[#22CCEE] text-[12px] text-[#FFFFFF]">
    Connect X account
  </button>
</NotificationCard>

<!-- Same as MediaUploaderStepPublishAndSharing.vue -->`,
    mediaSubmitWarning: `${heroiconsImport}
${importLine}

<NotificationCard
  variant="warning"
  :icon="ExclamationTriangleIcon"
  :description="WARNING_DESCRIPTION"
/>

<!-- Same as MediaUploaderStepSubmit.vue -->`,
    mediaPreviewToast: `${heroiconsImport}
${importLine}

<div class="w-[350px]">
  <NotificationCard
    variant="success-teal"
    title="Successfully uploaded new video."
    :closable="false"
    :icon="CheckCircleIcon"
  />
</div>`,
    bookingCalendarView: `${importLine}

<NotificationCard
  variant="alert"
  :show-icon="false"
  title="Your are now viewing your booking setting in personal event calendar view."
  description="To preview how your booking schedule will look like on your profile, go to preview booking schedule."
/>`,
    planDetailFeatured: `${importLine}

<NotificationCard
  variant="alert"
  :show-icon="false"
  :closable="false"
  title="Your 'VIP Lounge tier' will not longer be a featured tier."
  description="This tier will be updated as the feature tier in your profile after saving."
/>

<!-- Same as PlanDetail.vue -->`,
    tipLimitExceeded: `${importLine}

<div class="w-full relative">
  <NotificationCard
    variant="limit-exceeded"
    :show-icon="false"
    :closable="false"
    class="w-full"
  >
    <template #default>
      <div class="relative w-full flex gap-4">
        <div class="relative">
          <img :src="alertIconUrl" alt="alert-icon" class="h-10" />
        </div>
        <div class="flex flex-col w-full">
          <p class="text-sm font-semibold text-[#ff4405]">
            Input value exceeds maximum allowance (14,000 tokens)
          </p>
          <div class="flex justify-end items-end w-full">
            <button type="button" class="flex items-center gap-1 p-0 bg-transparent outline-none border-none cursor-pointer">
              <span class="text-xs leading-normal font-medium text-[#ff4405]">Set to Max</span>
              <img :src="chevronLeftIconUrl" alt="chevron-left" class="w-4 h-4 [filter:brightness(100)] rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </template>
  </NotificationCard>
</div>

<!-- Same as TipStep2.vue -->`,
    editProfileUnsaved: `${importLine}

<NotificationCard
  v-model="showNotification"
  variant="notice"
  title="You have unsaved changes"
  description="You have made changes to your profile since your last saved. Remember to click 'SAVE' to publish your changes."
  icon="SMILEY_FACE_ICON_URL"
  badge-icon="INFO_SQUARE_ICON_URL"
/>

<!-- Same as EditProfilePage.vue -->`,
    editProfileGallery: `${importLine}

triggerNotification({
  variant: 'success-teal',
  title: \`\${count} files uploaded to your free gallery successfully.\`,
  description: "Click 'Save' on header to update change.",
  badgeIcon: 'TICK_MARK_ICON_URL',
});

<!-- Same as EditProfilePage.vue gallery upload toast -->`,
    mediaPreviewTrailerReview: `${importLine}

<NotificationCard
  variant="alert"
  :show-icon="false"
  title="Your media will be under review because you have uploaded a new trailer."
  description=""
/>

<!-- Same as MediaUploaderStepPreviewSettings.vue -->`,
    bookingUnifiedAlert: `${importLine}

<NotificationCard
  variant="alert"
  :show-icon="false"
  title="You have 3 active subscriber in this tier"
  description="Changing detail of this plan might affect current subscriber's subscription fee and benefits."
/>

<!-- Same as UnifiedBookingForm.vue -->`,
    bookingStep1Error: `${importLine}

<NotificationCard
  v-model="showTitleError"
  variant="error"
  title="Validation Error"
  :description="titleErrorMessage"
/>

<!-- Same as OneOnOneBookingStep1.vue -->`,
    withdrawPayoutAccepted: `${importLine}

<NotificationCard
  variant="success-teal"
  title="Your payout request has been accepted."
  icon="CHECK_CIRCLE_ICON_URL"
  :closable="false"
/>

<!-- Same as WithdrawEarningsStep5.vue -->`,
}));
</script>
