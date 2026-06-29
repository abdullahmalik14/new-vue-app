<template>
    <section class="flex flex-col gap-6">
        <DemoSectionHeader :title="t('demo.checkboxSwitch.sectionTitle')" />
        <div class="flex flex-col gap-10 max-w-3xl">
            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkboxSwitch.sections.mediaPublish') }}</p>
                <div v-for="item in mediaPublishItems" :key="item.key" class="flex flex-col gap-3">
                    <CheckboxSwitch
                        v-model="checked[item.key]"
                        :label="t(item.labelKey)"
                        :id="item.id"
                    />
                    <ShowCodeToggle :code="code[item.key]" />
                </div>
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkboxSwitch.sections.mediaSubscription') }}</p>
                <div v-for="item in mediaSubscriptionItems" :key="item.key" class="flex flex-col gap-3">
                    <CheckboxSwitch
                        v-model="checked[item.key]"
                        :label="t(item.labelKey)"
                        :id="item.id"
                    />
                    <ShowCodeToggle :code="code[item.key]" />
                </div>
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkboxSwitch.sections.trailerSettings') }}</p>
                <CheckboxSwitch
                    v-model="checked.showPreviewToggle"
                    :label="t('demo.checkboxSwitch.trailer.showPreview')"
                    id="show-preview-toggle"
                />
                <ShowCodeToggle :code="code.showPreviewToggle" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkboxSwitch.sections.videoThumbnail') }}</p>
                <CheckboxSwitch
                    v-model="checked.blurThumbnailToggle"
                    :label="t('demo.checkboxSwitch.thumbnail.blur')"
                    show-wrapper-label
                    id="blur-thumbnail-toggle"
                />
                <ShowCodeToggle :code="code.blurThumbnailToggle" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkboxSwitch.sections.planDetail') }}</p>
                <CheckboxSwitch
                    v-model="checked.featuredTier"
                    :label="t('demo.checkboxSwitch.planDetail.featuredTier')"
                    id="featured-tier"
                    :track-class="PLAN_TRACK_CLASS"
                    :knob-class="PLAN_KNOB_CLASS"
                    label-class="text-base font-semibold text-black dark:text-[#e8e6e3]"
                    switch-wrapper-class="w-9 h-5"
                />
                <ShowCodeToggle :code="code.featuredTier" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkboxSwitch.sections.planSharing') }}</p>
                <CheckboxSwitch
                    v-model="checked.postToX"
                    :label="t('demo.checkboxSwitch.planSharing.postToX')"
                    id="post-to-x"
                    :track-class="PLAN_TRACK_CLASS"
                    :knob-class="PLAN_KNOB_CLASS"
                    label-class="text-base font-medium text-black dark:text-[#e8e6e3]"
                    switch-wrapper-class="w-9 h-5"
                />
                <ShowCodeToggle :code="code.postToX" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkboxSwitch.sections.editProfile') }}</p>
                <CheckboxSwitch
                    v-model="checked.editProfilePostToX"
                    id="post-to-x-tips"
                    :label="t('demo.checkboxSwitch.editProfile.postToXTips')"
                    :switch-wrapper-class="EDIT_PROFILE_SWITCH_WRAPPER_CLASS"
                    :track-class="EDIT_PROFILE_TRACK_CLASS"
                    :knob-class="EDIT_PROFILE_KNOB_CLASS"
                    :label-class="EDIT_PROFILE_LABEL_CLASS"
                />
                <ShowCodeToggle :code="code.editProfilePostToX" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkboxSwitch.sections.profileViewAll') }}</p>
                <div v-for="item in profileItems" :key="item.key" class="flex flex-col gap-3">
                    <div class="bg-black/90 p-4 rounded-[3.125rem] inline-flex w-fit">
                        <CheckboxSwitch
                            v-model="checked[item.key]"
                            :label="t(item.labelKey)"
                            :id="item.id"
                            version="v1"
                            :track-class="PROFILE_TRACK_CLASS"
                            :knob-class="PROFILE_KNOB_CLASS"
                            :label-class="PROFILE_LABEL_CLASS"
                            switch-wrapper-class="w-9 h-5"
                        />
                    </div>
                    <ShowCodeToggle :code="code[item.key]" />
                </div>
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkboxSwitch.sections.bookingXRepost') }}</p>
                <div v-for="item in bookingItems" :key="item.key" class="flex flex-col gap-3">
                    <CheckboxSwitch
                        v-model="checked[item.key]"
                        :label="t(item.labelKey)"
                        version="dashboard"
                        :wrapper-label="t('demo.checkboxSwitch.wrapperLabels.darkMode')"
                    />
                    <ShowCodeToggle :code="code[item.key]" />
                </div>
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkboxSwitch.sections.twitterRepostPopup') }}</p>
                <CheckboxSwitch
                    v-model="checked.twitterRepostToggle"
                    :label="t('demo.checkboxSwitch.booking.xPostLive')"
                    version="dashboard"
                    :wrapper-label="t('demo.checkboxSwitch.wrapperLabels.darkMode')"
                />
                <ShowCodeToggle :code="code.twitterRepostToggle" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkboxSwitch.sections.devDemo') }}</p>
                <CheckboxSwitch
                    v-model="checked.devDemoDarkMode"
                    :label="t('demo.checkboxSwitch.devDemo.toggleDarkMode')"
                    version="dashboard"
                    :wrapper-label="t('demo.checkboxSwitch.wrapperLabels.darkMode')"
                    show-wrapper-label
                />
                <ShowCodeToggle :code="code.devDemoDarkMode" />
            </div>
        </div>
    </section>
</template>

<script setup>
import { reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import CheckboxSwitch from '@/components/forms/checkboxes/CheckboxSwitch.vue';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';
import {
    EDIT_PROFILE_KNOB_CLASS,
    EDIT_PROFILE_LABEL_CLASS,
    EDIT_PROFILE_SWITCH_WRAPPER_CLASS,
    EDIT_PROFILE_TRACK_CLASS,
    PLAN_KNOB_CLASS,
    PLAN_TRACK_CLASS,
    PROFILE_KNOB_CLASS,
    PROFILE_LABEL_CLASS,
    PROFILE_TRACK_CLASS,
} from '@/dev/composables/useCheckboxSwitchDemoClasses.js';

const { t } = useI18n();

const checked = reactive({
    publishMediaToggleImm: false,
    publishMediaToggleSched: false,
    linkSubscriptionToggle: false,
    p2vToggle: false,
    showPreviewToggle: false,
    blurThumbnailToggle: false,
    featuredTier: false,
    postToX: false,
    editProfilePostToX: false,
    showPayPerView: false,
    showWatchNow: false,
    bookingXPostLive: false,
    bookingXPostBooked: false,
    bookingXPostInSession: false,
    bookingXPostTipped: false,
    bookingXPostPurchase: false,
    twitterRepostToggle: false,
    devDemoDarkMode: false,
});

const mediaPublishItems = [
    { key: 'publishMediaToggleImm', id: 'publish-media-toggle-imm', labelKey: 'demo.checkboxSwitch.mediaPublish.postToX' },
    { key: 'publishMediaToggleSched', id: 'publish-media-toggle-sched', labelKey: 'demo.checkboxSwitch.mediaPublish.postToX' },
];

const mediaSubscriptionItems = [
    { key: 'linkSubscriptionToggle', id: 'link-subscription-toggle', labelKey: 'demo.checkboxSwitch.mediaSubscription.linkPlan' },
    { key: 'p2vToggle', id: 'p2v-toggle', labelKey: 'demo.checkboxSwitch.mediaSubscription.payToView' },
];

const profileItems = [
    { key: 'showPayPerView', id: 'show-payPerView', labelKey: 'demo.checkboxSwitch.profile.payPerView' },
    { key: 'showWatchNow', id: 'show-watchNow', labelKey: 'demo.checkboxSwitch.profile.watchNow' },
];

const bookingItems = [
    { key: 'bookingXPostLive', labelKey: 'demo.checkboxSwitch.booking.xPostLive' },
    { key: 'bookingXPostBooked', labelKey: 'demo.checkboxSwitch.booking.xPostBooked' },
    { key: 'bookingXPostInSession', labelKey: 'demo.checkboxSwitch.booking.xPostInSession' },
    { key: 'bookingXPostTipped', labelKey: 'demo.checkboxSwitch.booking.xPostTipped' },
    { key: 'bookingXPostPurchase', labelKey: 'demo.checkboxSwitch.booking.xPostPurchase' },
];

const importLine = "import CheckboxSwitch from '@/components/forms/checkboxes/CheckboxSwitch.vue';";

const code = computed(() => ({
    publishMediaToggleImm: `${importLine}

<CheckboxSwitch
  v-model="postToSocialsImmediate"
  label="Post to X when my media is published"
  id="publish-media-toggle-imm"
/>

<!-- Same as MediaUploaderStepPublishAndSharing — publish immediately -->`,
    publishMediaToggleSched: `${importLine}

<CheckboxSwitch
  v-model="postToSocialsSchedule"
  label="Post to X when my media is published"
  id="publish-media-toggle-sched"
/>

<!-- Same as MediaUploaderStepPublishAndSharing — schedule publish -->`,
    linkSubscriptionToggle: `${importLine}

<CheckboxSwitch
  v-model="linkSubscription"
  label="Link this media to subscription plan"
  id="link-subscription-toggle"
/>`,
    p2vToggle: `${importLine}

<CheckboxSwitch
  v-model="payToView"
  label="Make this media available for pay to view"
  id="p2v-toggle"
/>`,
    showPreviewToggle: `${importLine}

<CheckboxSwitch
  v-model="showPreviewTrailer"
  label="Show Preview Trailer"
  id="show-preview-toggle"
/>

<!-- Same as TrailerSetting.vue -->`,
    blurThumbnailToggle: `${importLine}

<CheckboxSwitch
  v-model="blurThumbnail"
  label="Blur thumbnail"
  show-wrapper-label
  id="blur-thumbnail-toggle"
/>

<!-- Same as VideoThumbnailSelector.vue -->`,
    featuredTier: `${importLine}

<CheckboxSwitch
  v-model="isFeatured"
  label="This is a Featured Tier"
  id="featured-tier"
  track-class="PLAN_TRACK_CLASS"
  knob-class="PLAN_KNOB_CLASS"
  label-class="text-base font-semibold text-black dark:text-[#e8e6e3]"
  switch-wrapper-class="w-9 h-5"
/>

<!-- Same as PlanDetail.vue -->`,
    postToX: `${importLine}

<CheckboxSwitch
  v-model="postToX"
  label="Post updates of this tier to X"
  id="post-to-x"
  track-class="PLAN_TRACK_CLASS"
  knob-class="PLAN_KNOB_CLASS"
  label-class="text-base font-medium text-black dark:text-[#e8e6e3]"
  switch-wrapper-class="w-9 h-5"
/>

<!-- Same as PlanSharing.vue -->`,
    editProfilePostToX: `${importLine}

<CheckboxSwitch
  v-model="profileData.postToX"
  id="post-to-x"
  label="Post to X when you receive tips"
  switch-wrapper-class="EDIT_PROFILE_SWITCH_WRAPPER_CLASS"
  track-class="EDIT_PROFILE_TRACK_CLASS"
  knob-class="EDIT_PROFILE_KNOB_CLASS"
  label-class="EDIT_PROFILE_LABEL_CLASS"
/>

<!-- Same as EditProfilePage.vue -->`,
    showPayPerView: `${importLine}

<CheckboxSwitch
  v-model="showPayPerView"
  label="Pay per view"
  id="show-payPerView"
  version="v1"
  track-class="PROFILE_TRACK_CLASS"
  knob-class="PROFILE_KNOB_CLASS"
  label-class="text-white text-sm leading-6 text-[400]"
  switch-wrapper-class="w-9 h-5"
/>

<!-- Same as ProfileViewAllPopup.vue -->`,
    showWatchNow: `${importLine}

<CheckboxSwitch
  v-model="showWatchNow"
  label="Watch now"
  id="show-watchNow"
  version="v1"
  track-class="PROFILE_TRACK_CLASS"
  knob-class="PROFILE_KNOB_CLASS"
  label-class="text-white text-sm leading-6 text-[400]"
  switch-wrapper-class="w-9 h-5"
/>`,
    bookingXPostLive: `${importLine}

<CheckboxSwitch
  v-model="xPostLive"
  label="Post to X when my booking schedule is live"
  version="dashboard"
  wrapper-label="Dark Mode"
/>`,
    bookingXPostBooked: `${importLine}

<CheckboxSwitch
  v-model="xPostBooked"
  label="Post to X when a booking is received"
  version="dashboard"
  wrapper-label="Dark Mode"
/>`,
    bookingXPostInSession: `${importLine}

<CheckboxSwitch
  v-model="xPostInSession"
  label="Post to X when I am in a session"
  version="dashboard"
  wrapper-label="Dark Mode"
/>`,
    bookingXPostTipped: `${importLine}

<CheckboxSwitch
  v-model="xPostTipped"
  label="Post to X when I am tipped in a session"
  version="dashboard"
  wrapper-label="Dark Mode"
/>`,
    bookingXPostPurchase: `${importLine}

<CheckboxSwitch
  v-model="xPostPurchase"
  label="Post to X when someone made a purchase in a session"
  version="dashboard"
  wrapper-label="Dark Mode"
/>`,
    twitterRepostToggle: `${importLine}

<CheckboxSwitch
  v-model="xPostLive"
  label="Post to X when my booking schedule is live"
  version="dashboard"
  wrapper-label="Dark Mode"
/>`,
    devDemoDarkMode: `${importLine}

<CheckboxSwitch
  v-model="darkMode"
  label="Toggle Dark mode"
  version="dashboard"
  wrapper-label="Dark Mode"
  show-wrapper-label
/>`,
}));
</script>
