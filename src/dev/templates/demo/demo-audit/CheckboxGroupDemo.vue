<template>
    <section class="flex flex-col gap-6">
        <DemoSectionHeader :title="t('demo.checkboxGroup.sectionTitle')" />
        <div class="flex flex-col gap-10 max-w-3xl">
            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkboxGroup.sections.checkout') }}</p>

                <div class="flex flex-col gap-3">
                    <CheckboxGroup
                        v-model="checked.checkoutTerms"
                        :checkbox-class="CHECKOUT_GREEN_CLASS"
                        label-class="text-sm leading-normal tracking-[0.0175rem] text-[#667085] cursor-pointer"
                        wrapper-class="flex items-center gap-2"
                    >
                        {{ t('demo.checkboxGroup.checkout.websiteTermsPrefix') }}
                        <a href="#" class="text-sm leading-normal font-medium tracking-[0.0175rem] text-[#07F468] cursor-pointer">{{ t('demo.checkboxGroup.links.terms') }}</a>
                        {{ t('demo.checkboxGroup.checkout.and') }}
                        <a href="#" class="text-sm leading-normal font-medium tracking-[0.0175rem] text-[#07F468] cursor-pointer">{{ t('demo.checkboxGroup.links.privacy') }}</a>.
                    </CheckboxGroup>
                    <ShowCodeToggle :code="code.checkoutTerms" />
                </div>

                <div class="flex flex-col gap-3">
                    <CheckboxGroup
                        v-model="checked.checkoutTermsFansocial"
                        :checkbox-class="CHECKOUT_GREEN_CLASS"
                        label-class="text-sm mt-[2px] leading-normal tracking-[0.0175rem] text-[#667085] cursor-pointer"
                        wrapper-class="flex items-center gap-2"
                    >
                        {{ t('demo.checkboxGroup.checkout.fansocialTermsPrefix') }}
                        <a href="#" class="text-sm leading-normal font-medium tracking-[0.0175rem] text-[#07F468] cursor-pointer">{{ t('demo.checkboxGroup.links.terms') }}</a>
                        {{ t('demo.checkboxGroup.checkout.and') }}
                        <a href="#" class="text-sm leading-normal font-medium tracking-[0.0175rem] text-[#07F468] cursor-pointer">{{ t('demo.checkboxGroup.links.privacy') }}</a>.
                    </CheckboxGroup>
                    <ShowCodeToggle :code="code.checkoutTermsFansocial" />
                </div>

                <div v-for="item in checkoutSimpleItems" :key="item.key" class="flex flex-col gap-3">
                    <CheckboxGroup
                        v-model="checked[item.key]"
                        :label="t(item.labelKey)"
                        :checkbox-class="item.checkboxClass"
                        :label-class="item.labelClass"
                        :wrapper-class="item.wrapperClass"
                    />
                    <ShowCodeToggle :code="code[item.key]" />
                </div>
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkboxGroup.sections.checkoutDark') }}</p>
                <div v-for="item in checkoutDarkItems" :key="item.key" class="flex flex-col gap-3">
                    <CheckboxGroup
                        v-model="checked[item.key]"
                        :label="t(item.labelKey)"
                        :checkbox-class="item.checkboxClass"
                        :label-class="item.labelClass"
                        :wrapper-class="item.wrapperClass"
                    />
                    <ShowCodeToggle :code="code[item.key]" />
                </div>
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkboxGroup.sections.dashboard') }}</p>

                <div v-for="item in dashboardSimpleItems" :key="item.key" class="flex flex-col gap-3">
                    <CheckboxGroup
                        v-model="checked[item.key]"
                        :label="t(item.labelKey)"
                        :checkbox-class="SUCCESS_GREEN_CLASS"
                        label-class="text-sm mt-[2px] align-text-top text-[#0c111d]"
                        wrapper-class="pl-1 flex items-center gap-3"
                    />
                    <ShowCodeToggle :code="code[item.key]" />
                </div>

                <div v-for="option in planMediaOptions" :key="option.key" class="flex flex-col gap-3">
                    <CheckboxGroup
                        v-model="checked[`planMedia_${option.key}`]"
                        :label="t(option.labelKey)"
                        :tags="option.tags"
                        :meta-text="option.metaTextKey ? t(option.metaTextKey) : ''"
                        :checkbox-class="`${SUCCESS_GREEN_CLASS} cursor-shrink-0`"
                        label-class="text-xs mt-[2px] leading-normal font-semibold text-[#0C111D] max-w-[100px] truncate sm:max-w-none md:text-lg"
                        wrapper-class="pl-1 flex items-center gap-2 md:gap-6 w-full"
                    />
                    <ShowCodeToggle :code="code[`planMedia_${option.key}`]" />
                </div>

                <div class="flex flex-col gap-3">
                    <CheckboxGroup
                        v-model="checked.planVerifiedFanSharing"
                        :label="t('demo.checkboxGroup.planSharing.verifiedFan')"
                        :checkbox-class="SUCCESS_GREEN_CLASS"
                        label-class="text-sm align-text-top text-[#0c111d] dark:text-[#dbd8d3]"
                        wrapper-class="pl-1 flex items-center gap-3"
                    />
                    <ShowCodeToggle :code="code.planVerifiedFanSharing" />
                </div>
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkboxGroup.sections.mediaSubmit') }}</p>
                <div v-for="(labelKey, i) in mediaSubmitLabelKeys" :key="`media-submit-${i}`" class="flex flex-col gap-3">
                    <CheckboxGroup
                        v-model="checked[`mediaSubmit_${i}`]"
                        :label="t(labelKey)"
                        :checkbox-class="MEDIA_TERMS_CLASS"
                        label-class="text-[12px] sm:text-[14px] text-[#0C111D] font-[400] cursor-pointer"
                        wrapper-class="flex items-start gap-2"
                    />
                    <ShowCodeToggle :code="code[`mediaSubmit_${i}`]" />
                </div>
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkboxGroup.sections.mediaPublish') }}</p>
                <CheckboxGroup
                    v-model="checked.mediaComingSoon"
                    :label="t('demo.checkboxGroup.mediaPublish.comingSoon')"
                    :checkbox-class="`${SUCCESS_GREEN_CLASS} mt-[3px]`"
                    label-class="text-[16px] text-[#000] font-[500] cursor-pointer leading-normal"
                    wrapper-class="flex gap-2 items-start"
                />
                <ShowCodeToggle :code="code.mediaComingSoon" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkboxGroup.sections.mediaSubscription') }}</p>
                <div v-for="item in mediaSubscriptionItems" :key="item.key" class="flex flex-col gap-3">
                    <CheckboxGroup
                        v-model="checked[item.key]"
                        :label="t(item.labelKey)"
                        :checkbox-class="SUCCESS_GREEN_CLASS"
                        :label-class="item.labelClass"
                        wrapper-class="flex items-center"
                    />
                    <ShowCodeToggle :code="code[item.key]" />
                </div>
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkboxGroup.sections.booking') }}</p>
                <div v-for="item in bookingItems" :key="item.key" class="flex flex-col gap-3">
                    <CheckboxGroup
                        v-if="!item.labelSlot"
                        v-model="checked[item.key]"
                        :label="t(item.labelKey)"
                        :mid-img="item.midImg ? bookingInstantIconUrl : ''"
                        :checkbox-class="item.checkboxClass"
                        :label-class="item.labelClass"
                        :wrapper-class="item.wrapperClass"
                    />
                    <CheckboxGroup
                        v-else
                        v-model="checked[item.key]"
                        :checkbox-class="item.checkboxClass"
                        :label-class="item.labelClass"
                        :wrapper-class="item.wrapperClass"
                    >
                        <span>{{ t(item.labelKey) }}</span>
                        <DropdownTooltipIcon
                            :text="t('demo.checkboxGroup.booking.bufferTooltip')"
                            :icon-src="bookingHelpIconUrl"
                            icon-class="ml-1 inline w-4 h-4"
                            wrapper-class="inline-flex"
                        />
                    </CheckboxGroup>
                    <ShowCodeToggle :code="code[item.key]" />
                </div>
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkboxGroup.sections.calendar') }}</p>
                <div v-for="item in calendarFilterItems" :key="item.key" class="flex flex-col gap-3">
                    <CheckboxGroup
                        v-model="checked[item.key]"
                        :label="t(item.labelKey)"
                        :checkbox-class="CALENDAR_FILTER_CLASS"
                        :checkbox-style="calendarFilterStyle(item.key, item.color)"
                        label-class="text-slate-700 sm:text-base text-[14px] cursor-pointer font-medium leading-6"
                        wrapper-class="flex items-center gap-2"
                    />
                    <ShowCodeToggle :code="code[item.key]" />
                </div>
                <div v-for="item in calendarOtherItems" :key="item.key" class="flex flex-col gap-3">
                    <CheckboxGroup
                        v-model="checked[item.key]"
                        :label="t(item.labelKey)"
                        :checkbox-class="item.checkboxClass"
                        :label-class="item.labelClass"
                        :wrapper-class="item.wrapperClass"
                    />
                    <ShowCodeToggle :code="code[item.key]" />
                </div>
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkboxGroup.sections.calendarEventDropdown') }}</p>
                <div v-for="item in calendarEventDropdownItems" :key="item.key" class="flex flex-col gap-3">
                    <CheckboxGroup
                        v-model="checked[item.key]"
                        :label="t(item.labelKey)"
                        :checkbox-class="item.checkboxClass"
                        label-class="text-slate-700 sm:text-base text-[14px] cursor-pointer font-medium leading-6"
                        wrapper-class="flex items-center gap-2"
                    />
                    <ShowCodeToggle :code="code[item.key]" />
                </div>
                <div class="flex flex-col gap-3">
                    <CheckboxGroup
                        v-model="checked.calMainShowEvents"
                        :label="t('demo.checkboxGroup.calendarMain.showExistingEvents')"
                        :checkbox-class="CALENDAR_PINK_CLASS"
                        label-class="text-xs sm:text-[12px] leading-normal tracking-[0.0175rem] text-slate-700 cursor-pointer mt-[2px]"
                        wrapper-class="flex items-center"
                    />
                    <ShowCodeToggle :code="code.calMainShowEvents" />
                </div>
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkboxGroup.sections.adjustEvent') }}</p>
                <div class="flex flex-col gap-3.5">
                    <CheckboxGroup
                        v-for="item in adjustEventItems"
                        :key="item.key"
                        v-model="checked[item.key]"
                        :label="t(item.labelKey)"
                        label-class="text-gray-950 text-base font-medium cursor-pointer"
                        wrapper-class="flex items-center gap-2.5"
                    />
                </div>
                <ShowCodeToggle :code="code.adjustEvent" />
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkboxGroup.sections.bookingStep2') }}</p>
                <div class="flex flex-col gap-3">
                    <div v-for="item in bookingStep2Items" :key="item.key" class="flex flex-col gap-3">
                        <div class="flex items-center gap-2">
                            <CheckboxGroup
                                v-model="checked[item.key]"
                                :label="t(item.labelKey)"
                                :checkbox-class="BOOKING_STANDARD_2PX_CLASS"
                                label-class="text-slate-700 text-[16px] leading-normal cursor-pointer"
                                wrapper-class="flex items-center gap-2"
                            />
                            <DropdownTooltipIcon
                                :text="t(item.tooltipKey)"
                                :icon-src="bookingHelpIconUrl"
                            />
                        </div>
                        <ShowCodeToggle :code="code[item.key]" />
                    </div>
                </div>
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkboxGroup.sections.topUp') }}</p>
                <div v-for="item in topUpItems" :key="item.key" class="flex flex-col gap-3">
                    <CheckboxGroup
                        v-model="checked[item.key]"
                        :label="t(item.labelKey)"
                        :checkbox-class="TOPUP_CHECKBOX_CLASS"
                        label-class="text-sm leading-tight text-[#667085] cursor-pointer"
                        wrapper-class="flex items-center gap-2 !mb-0"
                    />
                    <ShowCodeToggle :code="code[item.key]" />
                </div>
            </div>

            <div class="flex flex-col gap-3">
                <p class="text-sm font-semibold text-[#344054]">{{ t('demo.checkboxGroup.sections.trailer') }}</p>
                <CheckboxGroup
                    v-model="checked.trailerCheckbox"
                    :label="t('demo.checkboxGroup.trailer.uploadOwn')"
                    :checkbox-class="TRAILER_CHECKBOX_CLASS"
                    label-class="text-sm text-[#344054] cursor-pointer"
                    wrapper-class="flex items-center gap-2 !mb-0"
                />
                <ShowCodeToggle :code="code.trailerCheckbox" />
            </div>
        </div>
    </section>
</template>

<script setup>
import { reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import CheckboxGroup from '@/components/forms/checkboxes/CheckboxGroup.vue';
import DropdownTooltipIcon from '@/components/ui/dropdowns/DropdownTooltipIcon.vue';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import {
    BOOKING_SMALL_CLASS,
    BOOKING_STANDARD_2PX_CLASS,
    BOOKING_STANDARD_CLASS,
    CALENDAR_EVENT_AUDIO_CLASS,
    CALENDAR_EVENT_GROUP_CLASS,
    CALENDAR_EVENT_VIDEO_CLASS,
    CALENDAR_FILTER_CLASS,
    CALENDAR_PINK_CLASS,
    CALENDAR_SCHEDULE_CLASS,
    CHECKOUT_GREEN_CLASS,
    CHECKOUT_SAVE_CARD_CLASS,
    MEDIA_TERMS_CLASS,
    SUCCESS_GREEN_CLASS,
    TOPUP_CHECKBOX_CLASS,
    TRAILER_CHECKBOX_CLASS,
} from '@/dev/composables/checkboxGroupDemoClasses.js';

const { t } = useI18n();
const { url: bookingInstantIconUrl } = useAssetUrl('icon.booking.instant');
const { url: bookingHelpIconUrl } = useAssetUrl('icon.booking.help');

const checked = reactive({
    checkoutTerms: false,
    checkoutTermsFansocial: false,
    checkoutSaveAddress: false,
    checkoutSameShipping: false,
    checkoutSaveCard: false,
    checkoutDarkSaveAddress: false,
    checkoutDarkSaveCard: false,
    planApplySale: false,
    planVerifiedFan: false,
    planVerifiedFanSharing: false,
    planMedia_someContent: false,
    planMedia_moreContent: false,
    planMedia_draftContent: false,
    planMedia_noMeta: false,
    mediaSubmit_0: false,
    mediaSubmit_1: false,
    mediaSubmit_2: false,
    mediaSubmit_3: false,
    mediaSubmit_4: false,
    mediaComingSoon: false,
    mediaTier1: false,
    mediaTier2: false,
    mediaDiscovery: false,
    mediaProfile: false,
    bookingStandard: false,
    bookingSlate: false,
    booking16px: false,
    bookingMidimg: false,
    bookingSmallNested: false,
    bookingEmoji: false,
    bookingRecording: false,
    bookingDisabled: false,
    bookingLabelSlot: false,
    bookingWaitlist: false,
    bookingAllowFanRecord: false,
    bookingAllowPersonalRequest: false,
    calVideo: false,
    calAudio: false,
    calGroup: false,
    calSchedule: false,
    calPink: false,
    calEventVideo: false,
    calEventAudio: false,
    calEventGroup: false,
    calMainShowEvents: false,
    adjust_0: false,
    adjust_1: false,
    adjust_2: false,
    adjust_3: false,
    topupSaveAddress: false,
    topupSameShipping: false,
    trailerCheckbox: false,
});

const checkoutSimpleItems = [
    {
        key: 'checkoutSaveAddress',
        labelKey: 'demo.checkboxGroup.checkout.saveAddress',
        checkboxClass: CHECKOUT_GREEN_CLASS,
        labelClass: 'text-sm leading-normal tracking-[0.0175rem] text-[#667085] cursor-pointer',
        wrapperClass: 'flex items-center gap-2',
    },
    {
        key: 'checkoutSameShipping',
        labelKey: 'demo.checkboxGroup.checkout.sameShipping',
        checkboxClass: CHECKOUT_GREEN_CLASS,
        labelClass: 'text-sm leading-normal tracking-[0.0175rem] text-[#667085] cursor-pointer',
        wrapperClass: 'flex items-center gap-2',
    },
    {
        key: 'checkoutSaveCard',
        labelKey: 'demo.checkboxGroup.checkout.saveCard',
        checkboxClass: CHECKOUT_SAVE_CARD_CLASS,
        labelClass: 'text-xs sm:text-sm leading-normal tracking-[0.0175rem] text-[#667085] cursor-pointer',
        wrapperClass: 'flex items-center gap-2',
    },
];

const checkoutDarkItems = [
    {
        key: 'checkoutDarkSaveAddress',
        labelKey: 'demo.checkboxGroup.checkoutDark.saveAddress',
        checkboxClass: CHECKOUT_GREEN_CLASS,
        labelClass: 'text-sm leading-normal tracking-[0.0175rem] text-[#98A2B3] cursor-pointer',
        wrapperClass: 'flex items-center gap-2',
    },
    {
        key: 'checkoutDarkSaveCard',
        labelKey: 'demo.checkboxGroup.checkoutDark.saveCard',
        checkboxClass: CHECKOUT_SAVE_CARD_CLASS,
        labelClass: 'text-xs sm:text-sm leading-normal tracking-[0.0175rem] text-[#98A2B3] cursor-pointer',
        wrapperClass: 'flex items-center gap-2',
    },
];

const dashboardSimpleItems = [
    { key: 'planApplySale', labelKey: 'demo.checkboxGroup.dashboard.applySale' },
    { key: 'planVerifiedFan', labelKey: 'demo.checkboxGroup.dashboard.verifiedFan' },
];

const planMediaOptions = computed(() => [
    {
        key: 'someContent',
        labelKey: 'demo.checkboxGroup.planMedia.someContent',
        metaTextKey: 'demo.checkboxGroup.planMedia.meta16',
        tags: [{ text: t('demo.checkboxGroup.tags.publishedTier'), variant: '#D1E0FF', class: 'text-[#155EEF]' }],
    },
    {
        key: 'moreContent',
        labelKey: 'demo.checkboxGroup.planMedia.moreContent',
        metaTextKey: 'demo.checkboxGroup.planMedia.meta24',
        tags: [{ text: t('demo.checkboxGroup.tags.publishedTier'), variant: '#D1E0FF', class: 'text-[#155EEF]' }],
    },
    {
        key: 'draftContent',
        labelKey: 'demo.checkboxGroup.planMedia.draftContent',
        metaTextKey: 'demo.checkboxGroup.planMedia.meta3',
        tags: [{ text: t('demo.checkboxGroup.tags.draft'), variant: '', class: 'text-[#98A2B3]' }],
    },
    {
        key: 'noMeta',
        labelKey: 'demo.checkboxGroup.planMedia.noMeta',
        metaTextKey: '',
        tags: [{ text: t('demo.checkboxGroup.tags.draft'), variant: '', class: 'text-[#98A2B3]' }],
    },
]);

const mediaSubmitLabelKeys = [
    'demo.checkboxGroup.mediaSubmit.item0',
    'demo.checkboxGroup.mediaSubmit.item1',
    'demo.checkboxGroup.mediaSubmit.item1',
    'demo.checkboxGroup.mediaSubmit.item2',
    'demo.checkboxGroup.mediaSubmit.item2',
];

const mediaSubscriptionItems = [
    {
        key: 'mediaTier1',
        labelKey: 'demo.checkboxGroup.mediaSubscription.freePlan',
        labelClass: 'text-[14px] text-[#0C111D] font-[400] cursor-pointer truncate whitespace-nowrap overflow-hidden md:max-w-[270px] lg:max-w-[400px] max-w-[250px]',
    },
    {
        key: 'mediaTier2',
        labelKey: 'demo.checkboxGroup.mediaSubscription.premiumTier',
        labelClass: 'text-[14px] text-[#0C111D] font-[400] cursor-pointer truncate whitespace-nowrap overflow-hidden md:max-w-[270px] lg:max-w-[400px] max-w-[250px]',
    },
    {
        key: 'mediaDiscovery',
        labelKey: 'demo.checkboxGroup.mediaSubscription.discovery',
        labelClass: 'text-[16px] text-[#0C111D] font-[600] cursor-pointer',
    },
    {
        key: 'mediaProfile',
        labelKey: 'demo.checkboxGroup.mediaSubscription.profile',
        labelClass: 'text-[16px] text-[#0C111D] font-[600] cursor-pointer',
    },
];

const bookingItems = [
    {
        key: 'bookingStandard',
        labelKey: 'demo.checkboxGroup.booking.longerSessions',
        checkboxClass: BOOKING_STANDARD_CLASS,
        labelClass: 'text-gray-700 text-base mt-[0.063rem] leading-normal',
        wrapperClass: 'flex items-center gap-2',
    },
    {
        key: 'bookingSlate',
        labelKey: 'demo.checkboxGroup.booking.longerDiscount',
        checkboxClass: BOOKING_STANDARD_CLASS,
        labelClass: 'text-slate-700 text-base mt-[0.063rem] leading-normal',
        wrapperClass: 'flex items-center gap-2 mb-3',
    },
    {
        key: 'booking16px',
        labelKey: 'demo.checkboxGroup.booking.recurringDiscount',
        checkboxClass: BOOKING_STANDARD_CLASS,
        labelClass: 'text-slate-700 text-[16px] leading-normal',
        wrapperClass: 'flex gap-2 items-center',
    },
    {
        key: 'bookingMidimg',
        labelKey: 'demo.checkboxGroup.booking.instantBooking',
        checkboxClass: BOOKING_STANDARD_CLASS,
        labelClass: 'text-slate-700 mt-[0.063rem] text-base leading-normal',
        wrapperClass: 'flex items-center gap-2 mb-3',
        midImg: true,
    },
    {
        key: 'bookingSmallNested',
        labelKey: 'demo.checkboxGroup.booking.disableChat',
        checkboxClass: BOOKING_SMALL_CLASS,
        labelClass: 'text-slate-700 text-base leading-normal',
        wrapperClass: 'flex items-center gap-2 mb-2 mt-2',
    },
    {
        key: 'bookingEmoji',
        labelKey: 'demo.checkboxGroup.booking.emojiReply',
        checkboxClass: BOOKING_SMALL_CLASS,
        labelClass: 'text-slate-700 text-sm leading-normal italic',
        wrapperClass: 'flex items-center gap-2 mb-2 ml-5',
    },
    {
        key: 'bookingRecording',
        labelKey: 'demo.checkboxGroup.booking.allowRecording',
        checkboxClass: BOOKING_STANDARD_CLASS,
        labelClass: 'text-slate-700 text-[16px] leading-normal',
        wrapperClass: 'flex items-center gap-2',
    },
    {
        key: 'bookingDisabled',
        labelKey: 'demo.checkboxGroup.booking.cancellationFee',
        checkboxClass: BOOKING_STANDARD_CLASS,
        labelClass: 'text-slate-700 text-base leading-normal cursor-pointer',
        wrapperClass: 'flex items-center gap-2',
    },
    {
        key: 'bookingLabelSlot',
        labelKey: 'demo.checkboxGroup.booking.bufferTime',
        checkboxClass: BOOKING_STANDARD_CLASS,
        labelClass: 'text-slate-700 text-base leading-normal inline-flex items-center gap-1',
        wrapperClass: 'flex items-center gap-2',
        labelSlot: true,
    },
    {
        key: 'bookingWaitlist',
        labelKey: 'demo.checkboxGroup.booking.waitlist',
        checkboxClass: BOOKING_STANDARD_CLASS,
        labelClass: 'text-slate-700 text-[16px] leading-normal',
        wrapperClass: 'flex items-center gap-2',
    },
];

const calendarFilterItems = [
    { key: 'calVideo', labelKey: 'demo.checkboxGroup.calendar.videoCall', color: '#7F56D9' },
    { key: 'calAudio', labelKey: 'demo.checkboxGroup.calendar.audioCall', color: '#12B76A' },
    { key: 'calGroup', labelKey: 'demo.checkboxGroup.calendar.groupEvent', color: '#F79009' },
];

const calendarOtherItems = [
    {
        key: 'calSchedule',
        labelKey: 'demo.checkboxGroup.calendar.showSchedule',
        checkboxClass: CALENDAR_SCHEDULE_CLASS,
        labelClass: 'text-slate-700 sm:text-[16px] text-[12px] cursor-pointer font-medium leading-6',
        wrapperClass: 'flex items-center gap-2',
    },
    {
        key: 'calPink',
        labelKey: 'demo.checkboxGroup.calendar.showExisting',
        checkboxClass: CALENDAR_PINK_CLASS,
        labelClass: 'text-xs sm:text-xs leading-normal tracking-[0.0175rem] text-slate-700 cursor-pointer mt-[0.125rem]',
        wrapperClass: 'flex items-center',
    },
];

const calendarEventDropdownItems = [
    { key: 'calEventVideo', labelKey: 'demo.checkboxGroup.calendarEventDropdown.videoCall', checkboxClass: CALENDAR_EVENT_VIDEO_CLASS },
    { key: 'calEventAudio', labelKey: 'demo.checkboxGroup.calendarEventDropdown.audioCall', checkboxClass: CALENDAR_EVENT_AUDIO_CLASS },
    { key: 'calEventGroup', labelKey: 'demo.checkboxGroup.calendarEventDropdown.groupCall', checkboxClass: CALENDAR_EVENT_GROUP_CLASS },
];

const bookingStep2Items = [
    { key: 'bookingAllowFanRecord', labelKey: 'demo.checkboxGroup.bookingStep2.allowFanRecord', tooltipKey: 'demo.checkboxGroup.bookingStep2.allowFanRecordTooltip' },
    { key: 'bookingAllowPersonalRequest', labelKey: 'demo.checkboxGroup.bookingStep2.allowPersonalRequest', tooltipKey: 'demo.checkboxGroup.bookingStep2.allowPersonalRequestTooltip' },
];

const adjustEventItems = [
    { key: 'adjust_0', labelKey: 'demo.checkboxGroup.adjustEvent.recordSession' },
    { key: 'adjust_1', labelKey: 'demo.checkboxGroup.adjustEvent.exclusiveVideo' },
    { key: 'adjust_2', labelKey: 'demo.checkboxGroup.adjustEvent.cosplay' },
    { key: 'adjust_3', labelKey: 'demo.checkboxGroup.adjustEvent.topless' },
];

const topUpItems = [
    { key: 'topupSaveAddress', labelKey: 'demo.checkboxGroup.checkout.saveAddress' },
    { key: 'topupSameShipping', labelKey: 'demo.checkboxGroup.checkout.sameShipping' },
];

function calendarFilterStyle(key, activeColor) {
    const isOn = checked[key];
    return {
        backgroundColor: isOn ? activeColor : 'white',
        borderColor: isOn ? activeColor : '#D0D5DD',
    };
}

const importLine = "import CheckboxGroup from '@/components/forms/checkboxes/CheckboxGroup.vue';";

const code = computed(() => ({
    checkoutTerms: `${importLine}

<CheckboxGroup
  v-model="termsAgreed"
  checkbox-class="CHECKOUT_GREEN_CLASS"
  label-class="text-sm leading-normal tracking-[0.0175rem] text-[#667085] cursor-pointer"
  wrapper-class="flex items-center gap-2"
>
  I agree to Our Website's
  <a href="#" class="text-sm leading-normal font-medium tracking-[0.0175rem] text-[#07F468] cursor-pointer">Terms and Condition</a>
  and
  <a href="#" class="text-sm leading-normal font-medium tracking-[0.0175rem] text-[#07F468] cursor-pointer">Privacy Policy</a>.
</CheckboxGroup>`,
    checkoutTermsFansocial: `${importLine}

<CheckboxGroup
  v-model="termsAgreed"
  checkbox-class="CHECKOUT_GREEN_CLASS"
  label-class="text-sm leading-normal tracking-[0.0175rem] text-[#667085] cursor-pointer"
  wrapper-class="flex items-center gap-2"
>
  I agree to Fansocial's
  <a href="#" class="text-sm leading-normal font-medium tracking-[0.0175rem] text-[#07F468] cursor-pointer">Terms and Condition</a>
  and
  <a href="#" class="text-sm leading-normal font-medium tracking-[0.0175rem] text-[#07F468] cursor-pointer">Privacy Policy</a>.
</CheckboxGroup>`,
    checkoutSaveAddress: `${importLine}

<CheckboxGroup
  v-model="saveAddress"
  label="Save this address for future use."
  checkbox-class="CHECKOUT_GREEN_CLASS"
  label-class="text-sm leading-normal tracking-[0.0175rem] text-[#667085] cursor-pointer"
  wrapper-class="flex items-center gap-2"
/>`,
    checkoutSameShipping: `${importLine}

<CheckboxGroup
  v-model="sameAsShipping"
  label="Same as Shipping Address"
  checkbox-class="CHECKOUT_GREEN_CLASS"
  label-class="text-sm leading-normal tracking-[0.0175rem] text-[#667085] cursor-pointer"
  wrapper-class="flex items-center gap-2"
/>`,
    checkoutSaveCard: `${importLine}

<CheckboxGroup
  v-model="saveCard"
  label="Save this card for faster checkout."
  checkbox-class="CHECKOUT_SAVE_CARD_CLASS"
  label-class="text-xs sm:text-sm leading-normal tracking-[0.0175rem] text-[#667085] cursor-pointer"
  wrapper-class="flex items-center gap-2"
/>`,
    checkoutDarkSaveAddress: `${importLine}

<CheckboxGroup
  v-model="saveAddress"
  label="Save this address for future use."
  checkbox-class="CHECKOUT_GREEN_CLASS"
  label-class="text-sm leading-normal tracking-[0.0175rem] text-[#98A2B3] cursor-pointer"
  wrapper-class="flex items-center gap-2"
/>

<!-- Same as PurchaseTipFlowPopup / dark checkout sections -->`,
    checkoutDarkSaveCard: `${importLine}

<CheckboxGroup
  v-model="saveCard"
  label="Save this card for faster checkout."
  checkbox-class="CHECKOUT_SAVE_CARD_CLASS"
  label-class="text-xs sm:text-sm leading-normal tracking-[0.0175rem] text-[#98A2B3] cursor-pointer"
  wrapper-class="flex items-center gap-2"
/>

<!-- Same as PaymentMethodNotLoggedIn.vue -->`,
    planApplySale: `${importLine}

<CheckboxGroup
  v-model="applyToSale"
  label="Apply to items already on sale"
  checkbox-class="SUCCESS_GREEN_CLASS"
  label-class="text-sm align-text-top text-[#0c111d]"
  wrapper-class="pl-1 flex items-center gap-3"
/>`,
    planVerifiedFan: `${importLine}

<CheckboxGroup
  v-model="verifiedFanOnly"
  label="Verified fan only"
  checkbox-class="SUCCESS_GREEN_CLASS"
  label-class="text-sm align-text-top text-[#0c111d]"
  wrapper-class="pl-1 flex items-center gap-3"
/>`,
    planVerifiedFanSharing: `${importLine}

<CheckboxGroup
  v-model="verifiedFanOnly"
  label="Verified fan only"
  checkbox-class="SUCCESS_GREEN_CLASS"
  label-class="text-sm align-text-top text-[#0c111d] dark:text-[#dbd8d3]"
  wrapper-class="pl-1 flex items-center gap-3"
/>

<!-- Same as PlanSharing.vue -->`,
    planMedia_someContent: `${importLine}

<CheckboxGroup
  v-model="selected"
  label="Access to some content"
  :tags="[{ text: 'Published Tier', variant: '#D1E0FF', class: 'text-[#155EEF]' }]"
  meta-text="16 Media"
  checkbox-class="SUCCESS_GREEN_CLASS cursor-shrink-0"
  label-class="text-xs leading-normal font-semibold text-[#0C111D] max-w-[100px] truncate sm:max-w-none md:text-lg"
  wrapper-class="pl-1 flex items-center gap-2 md:gap-6 w-full"
/>`,
    planMedia_moreContent: `${importLine}

<CheckboxGroup
  v-model="selected"
  label="Access to more content"
  :tags="[{ text: 'Published Tier', variant: '#D1E0FF', class: 'text-[#155EEF]' }]"
  meta-text="24 Media"
  checkbox-class="SUCCESS_GREEN_CLASS cursor-shrink-0"
  label-class="text-xs leading-normal font-semibold text-[#0C111D] max-w-[100px] truncate sm:max-w-none md:text-lg"
  wrapper-class="pl-1 flex items-center gap-2 md:gap-6 w-full"
/>`,
    planMedia_draftContent: `${importLine}

<CheckboxGroup
  v-model="selected"
  label="Access to even some more content"
  :tags="[{ text: 'Draft', variant: '', class: 'text-[#98A2B3]' }]"
  meta-text="3 Media"
  checkbox-class="SUCCESS_GREEN_CLASS cursor-shrink-0"
  label-class="text-xs leading-normal font-semibold text-[#0C111D] max-w-[100px] truncate sm:max-w-none md:text-lg"
  wrapper-class="pl-1 flex items-center gap-2 md:gap-6 w-full"
/>`,
    planMedia_noMeta: `${importLine}

<CheckboxGroup
  v-model="selected"
  label="Access to even more the most content"
  :tags="[{ text: 'Draft', variant: '', class: 'text-[#98A2B3]' }]"
  checkbox-class="SUCCESS_GREEN_CLASS cursor-shrink-0"
  label-class="text-xs leading-normal font-semibold text-[#0C111D] max-w-[100px] truncate sm:max-w-none md:text-lg"
  wrapper-class="pl-1 flex items-center gap-2 md:gap-6 w-full"
/>`,
    mediaSubmit_0: `${importLine}

<CheckboxGroup
  v-model="agreed"
  :label="t('demo.checkboxGroup.mediaSubmit.item0')"
  checkbox-class="MEDIA_TERMS_CLASS"
  label-class="text-[12px] sm:text-[14px] text-[#0C111D] font-[400] cursor-pointer"
  wrapper-class="flex items-start gap-2"
/>`,
    mediaSubmit_1: `${importLine}

<CheckboxGroup
  v-model="agreed"
  :label="t('demo.checkboxGroup.mediaSubmit.item1')"
  checkbox-class="MEDIA_TERMS_CLASS"
  label-class="text-[12px] sm:text-[14px] text-[#0C111D] font-[400] cursor-pointer"
  wrapper-class="flex items-start gap-2"
/>`,
    mediaSubmit_2: `${importLine}

<CheckboxGroup
  v-model="agreed"
  :label="t('demo.checkboxGroup.mediaSubmit.item1')"
  checkbox-class="MEDIA_TERMS_CLASS"
  label-class="text-[12px] sm:text-[14px] text-[#0C111D] font-[400] cursor-pointer"
  wrapper-class="flex items-start gap-2"
/>`,
    mediaSubmit_3: `${importLine}

<CheckboxGroup
  v-model="agreed"
  :label="t('demo.checkboxGroup.mediaSubmit.item2')"
  checkbox-class="MEDIA_TERMS_CLASS"
  label-class="text-[12px] sm:text-[14px] text-[#0C111D] font-[400] cursor-pointer"
  wrapper-class="flex items-start gap-2"
/>`,
    mediaSubmit_4: `${importLine}

<CheckboxGroup
  v-model="agreed"
  :label="t('demo.checkboxGroup.mediaSubmit.item2')"
  checkbox-class="MEDIA_TERMS_CLASS"
  label-class="text-[12px] sm:text-[14px] text-[#0C111D] font-[400] cursor-pointer"
  wrapper-class="flex items-start gap-2"
/>`,
    mediaComingSoon: `${importLine}

<CheckboxGroup
  v-model="featureComingSoon"
  label="Feature this media on 'coming soon' section"
  checkbox-class="SUCCESS_GREEN_CLASS"
  label-class="text-[16px] text-[#000] font-[500] cursor-pointer leading-normal"
  wrapper-class="flex items-center gap-2"
/>`,
    mediaTier1: `${importLine}

<CheckboxGroup
  v-model="tierSelected"
  label="Free Plan"
  checkbox-class="SUCCESS_GREEN_CLASS"
  label-class="text-[14px] text-[#0C111D] font-[400] cursor-pointer truncate whitespace-nowrap overflow-hidden md:max-w-[270px] lg:max-w-[400px] max-w-[250px]"
  wrapper-class="flex items-center"
/>`,
    mediaTier2: `${importLine}

<CheckboxGroup
  v-model="tierSelected"
  label="Premium Tier"
  checkbox-class="SUCCESS_GREEN_CLASS"
  label-class="text-[14px] text-[#0C111D] font-[400] cursor-pointer truncate whitespace-nowrap overflow-hidden md:max-w-[270px] lg:max-w-[400px] max-w-[250px]"
  wrapper-class="flex items-center"
/>`,
    mediaDiscovery: `${importLine}

<CheckboxGroup
  v-model="discoveryPage"
  label="Discovery Page"
  checkbox-class="SUCCESS_GREEN_CLASS"
  label-class="text-[16px] text-[#0C111D] font-[600] cursor-pointer"
  wrapper-class="flex items-center"
/>`,
    mediaProfile: `${importLine}

<CheckboxGroup
  v-model="profilePage"
  label="My Profile Page"
  checkbox-class="SUCCESS_GREEN_CLASS"
  label-class="text-[16px] text-[#0C111D] font-[600] cursor-pointer"
  wrapper-class="flex items-center"
/>`,
    bookingStandard: `${importLine}

<CheckboxGroup
  v-model="allowLongerSessions"
  label="Allow longer sessions"
  checkbox-class="BOOKING_STANDARD_CLASS"
  label-class="text-gray-700 text-base mt-[0.063rem] leading-normal"
  wrapper-class="flex items-center gap-2"
/>`,
    bookingSlate: `${importLine}

<CheckboxGroup
  v-model="enableLongerDiscount"
  label="Enable longer session discount"
  checkbox-class="BOOKING_STANDARD_CLASS"
  label-class="text-slate-700 text-base mt-[0.063rem] leading-normal"
  wrapper-class="flex items-center gap-2 mb-3"
/>`,
    booking16px: `${importLine}

<CheckboxGroup
  v-model="recurringDiscount"
  label="Enable discount for recurring events"
  checkbox-class="BOOKING_STANDARD_CLASS"
  label-class="text-slate-700 text-[16px] leading-normal"
  wrapper-class="flex gap-2 items-center"
/>`,
    bookingMidimg: `${importLine}

import { useAssetUrl } from '@/composables/useAssetUrl.js';
const { url: bookingInstantIconUrl } = useAssetUrl('icon.booking.instant');

<CheckboxGroup
  v-model="allowInstantBooking"
  label="Allow instant booking"
  :mid-img="bookingInstantIconUrl"
  checkbox-class="BOOKING_STANDARD_CLASS"
  label-class="text-slate-700 mt-[0.063rem] text-base leading-normal"
  wrapper-class="flex items-center gap-2 mb-3"
/>`,
    bookingSmallNested: `${importLine}

<CheckboxGroup
  v-model="disableChat"
  label="Disable chat before call"
  checkbox-class="BOOKING_SMALL_CLASS"
  label-class="text-slate-700 text-base leading-normal"
  wrapper-class="flex items-center gap-2 mb-2 mt-2"
/>`,
    bookingEmoji: `${importLine}

<CheckboxGroup
  v-model="allowEmoji"
  label="Allow reply with emoji"
  checkbox-class="BOOKING_SMALL_CLASS"
  label-class="text-slate-700 text-sm leading-normal italic"
  wrapper-class="flex items-center gap-2 mb-2 ml-5"
/>`,
    bookingRecording: `${importLine}

<CheckboxGroup
  v-model="allowRecording"
  label="Allow recording"
  checkbox-class="BOOKING_STANDARD_CLASS"
  label-class="text-slate-700 text-[16px] leading-normal"
  wrapper-class="flex items-center gap-2"
/>`,
    bookingDisabled: `${importLine}

<CheckboxGroup
  v-model="enableCancellationFee"
  label="Enable cancellation fee"
  checkbox-class="BOOKING_STANDARD_CLASS"
  label-class="text-slate-700 text-base leading-normal cursor-pointer"
  wrapper-class="flex items-center gap-2"
/>`,
    bookingLabelSlot: `${importLine}

import DropdownTooltipIcon from '@/components/ui/dropdowns/DropdownTooltipIcon.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
const { url: bookingHelpIconUrl } = useAssetUrl('icon.booking.help');

<CheckboxGroup
  v-model="setBufferTime"
  checkbox-class="BOOKING_STANDARD_CLASS"
  label-class="text-slate-700 text-base leading-normal inline-flex items-center gap-1"
  wrapper-class="flex items-center gap-2"
>
  <span>Set buffer time between booked appointments</span>
  <DropdownTooltipIcon
    text="Buffer time between booked appointments"
    :icon-src="bookingHelpIconUrl"
    icon-class="ml-1 inline w-4 h-4"
    wrapper-class="inline-flex"
  />
</CheckboxGroup>`,
    bookingWaitlist: `${importLine}

<CheckboxGroup
  v-model="allowWaitlist"
  label="Allow fans to join waitlist if event is full"
  checkbox-class="BOOKING_STANDARD_CLASS"
  label-class="text-slate-700 text-[16px] leading-normal"
  wrapper-class="flex items-center gap-2"
/>`,
    bookingAllowFanRecord: `${importLine}

import DropdownTooltipIcon from '@/components/ui/dropdowns/DropdownTooltipIcon.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
const { url: bookingHelpIconUrl } = useAssetUrl('icon.booking.help');

<div class="flex items-center gap-2">
  <CheckboxGroup
    v-model="allowRecording"
    label="Allow fan record the session"
    checkbox-class="BOOKING_STANDARD_2PX_CLASS"
    label-class="text-slate-700 text-[16px] leading-normal cursor-pointer"
    wrapper-class="flex items-center gap-2"
  />
  <DropdownTooltipIcon
    text="If enabled, fans can purchase a session recording as an add-on."
    :icon-src="bookingHelpIconUrl"
  />
</div>`,
    bookingAllowPersonalRequest: `${importLine}

import DropdownTooltipIcon from '@/components/ui/dropdowns/DropdownTooltipIcon.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
const { url: bookingHelpIconUrl } = useAssetUrl('icon.booking.help');

<div class="flex items-center gap-2">
  <CheckboxGroup
    v-model="allowPersonalRequest"
    label="Allow personal request"
    checkbox-class="BOOKING_STANDARD_2PX_CLASS"
    label-class="text-slate-700 text-[16px] leading-normal cursor-pointer"
    wrapper-class="flex items-center gap-2"
  />
  <DropdownTooltipIcon
    text="If enabled, fans can include a personal request in the booking form."
    :icon-src="bookingHelpIconUrl"
  />
</div>`,
    calVideo: `${importLine}

<CheckboxGroup
  v-model="videoCallFilter"
  label="Video Call"
  checkbox-class="CALENDAR_FILTER_CLASS"
  :checkbox-style="{ backgroundColor: checked ? '#7F56D9' : 'white', borderColor: checked ? '#7F56D9' : '#D0D5DD' }"
  label-class="text-slate-700 sm:text-base text-[14px] cursor-pointer font-medium leading-6"
  wrapper-class="flex items-center gap-2"
/>`,
    calAudio: `${importLine}

<CheckboxGroup
  v-model="audioCallFilter"
  label="Audio Call"
  checkbox-class="CALENDAR_FILTER_CLASS"
  :checkbox-style="{ backgroundColor: checked ? '#12B76A' : 'white', borderColor: checked ? '#12B76A' : '#D0D5DD' }"
  label-class="text-slate-700 sm:text-base text-[14px] cursor-pointer font-medium leading-6"
  wrapper-class="flex items-center gap-2"
/>`,
    calGroup: `${importLine}

<CheckboxGroup
  v-model="groupEventFilter"
  label="Group Event"
  checkbox-class="CALENDAR_FILTER_CLASS"
  :checkbox-style="{ backgroundColor: checked ? '#F79009' : 'white', borderColor: checked ? '#F79009' : '#D0D5DD' }"
  label-class="text-slate-700 sm:text-base text-[14px] cursor-pointer font-medium leading-6"
  wrapper-class="flex items-center gap-2"
/>`,
    calSchedule: `${importLine}

<CheckboxGroup
  v-model="showSchedule"
  label="Show booking schedule availability"
  checkbox-class="CALENDAR_SCHEDULE_CLASS"
  label-class="text-slate-700 sm:text-[16px] text-[12px] cursor-pointer font-medium leading-6"
  wrapper-class="flex items-center gap-2"
/>`,
    calPink: `${importLine}

<CheckboxGroup
  v-model="showExistingSchedule"
  label="Show existing schedule"
  checkbox-class="CALENDAR_PINK_CLASS"
  label-class="text-xs sm:text-xs leading-normal tracking-[0.0175rem] text-slate-700 cursor-pointer mt-[0.125rem]"
  wrapper-class="flex items-center"
/>`,
    calEventVideo: `${importLine}

<CheckboxGroup
  v-model="videoCallSelected"
  label="Video Call"
  checkbox-class="CALENDAR_EVENT_VIDEO_CLASS"
  label-class="text-slate-700 sm:text-base text-[14px] cursor-pointer font-medium leading-6"
  wrapper-class="flex items-center gap-2"
/>

<!-- Same as EventDropdownContent.vue -->`,
    calEventAudio: `${importLine}

<CheckboxGroup
  v-model="audioCallSelected"
  label="Audio Call"
  checkbox-class="CALENDAR_EVENT_AUDIO_CLASS"
  label-class="text-slate-700 sm:text-base text-[14px] cursor-pointer font-medium leading-6"
  wrapper-class="flex items-center gap-2"
/>`,
    calEventGroup: `${importLine}

<CheckboxGroup
  v-model="groupCallSelected"
  label="Group Call"
  checkbox-class="CALENDAR_EVENT_GROUP_CLASS"
  label-class="text-slate-700 sm:text-base text-[14px] cursor-pointer font-medium leading-6"
  wrapper-class="flex items-center gap-2"
/>`,
    calMainShowEvents: `${importLine}

<CheckboxGroup
  v-model="showSchedule"
  label="Show existing events/booking schedule"
  checkbox-class="CALENDAR_PINK_CLASS"
  label-class="text-xs sm:text-[12px] leading-normal tracking-[0.0175rem] text-slate-700 cursor-pointer mt-[2px]"
  wrapper-class="flex items-center"
/>

<!-- Same as MainCalendar.vue -->`,
    adjustEvent: `${importLine}

<div class="flex flex-col gap-3.5">
  <CheckboxGroup
    v-model="recordSession"
    label="Record our session"
    label-class="text-gray-950 text-base font-medium cursor-pointer"
    wrapper-class="flex items-center gap-2.5"
  />
  <CheckboxGroup
    v-model="exclusiveVideo"
    label="Make video exclusive"
    label-class="text-gray-950 text-base font-medium cursor-pointer"
    wrapper-class="flex items-center gap-2.5"
  />
  <CheckboxGroup
    v-model="cosplay"
    label="Cosplay"
    label-class="text-gray-950 text-base font-medium cursor-pointer"
    wrapper-class="flex items-center gap-2.5"
  />
  <CheckboxGroup
    v-model="topless"
    label="Topless"
    label-class="text-gray-950 text-base font-medium cursor-pointer"
    wrapper-class="flex items-center gap-2.5"
  />
</div>

<!-- Same as AdjustEventDetailsPopup.vue -->`,
    topupSaveAddress: `${importLine}

<CheckboxGroup
  v-model="saveAddress"
  label="Save this address for future use."
  checkbox-class="TOPUP_CHECKBOX_CLASS"
  label-class="text-sm leading-tight text-[#667085] cursor-pointer"
  wrapper-class="flex items-center gap-2 !mb-0"
/>`,
    topupSameShipping: `${importLine}

<CheckboxGroup
  v-model="sameAsShipping"
  label="Same as Shipping Address"
  checkbox-class="TOPUP_CHECKBOX_CLASS"
  label-class="text-sm leading-tight text-[#667085] cursor-pointer"
  wrapper-class="flex items-center gap-2 !mb-0"
/>`,
    trailerCheckbox: `${importLine}

<CheckboxGroup
  v-model="uploadOwnTrailer"
  label="Upload your own trailer"
  checkbox-class="TRAILER_CHECKBOX_CLASS"
  label-class="text-sm text-[#344054] cursor-pointer"
  wrapper-class="flex items-center gap-2 !mb-0"
/>`,
}));
</script>
