<template>
    <section class="flex flex-col gap-6">
        <DemoSectionHeader :title="t('demo.actionMenuDropdown.sectionTitle')" />
        <div class="flex flex-wrap gap-8">
            <div class="flex flex-col gap-4">
                <h3 class="text-lg font-semibold text-[#344054]">{{ t('booking.adjustment.titles.moreTime') }}</h3>
                <BookingAdjustmentPopup
                    type="moreTime"
                    :event-date="sample.eventDate"
                    :new-time="sample.newTime"
                    :end-time="sample.endTime"
                    :original-time="sample.originalTime"
                    :user-name="sample.userName"
                />
                <ShowCodeToggle :code="codeExamples.moreTime" />
            </div>

            <div class="flex flex-col gap-4">
                <h3 class="text-lg font-semibold text-[#344054]">{{ t('booking.adjustment.titles.reschedule') }}</h3>
                <BookingAdjustmentPopup
                    type="reschedule"
                    :event-date="sample.eventDateReschedule"
                    :original-date="sample.originalDate"
                    :new-time="sample.newTime"
                    :end-time="sample.endTime"
                    :original-time="sample.originalTime"
                    :user-name="sample.userName"
                />
                <ShowCodeToggle :code="codeExamples.reschedule" />
            </div>

            <div class="flex flex-col gap-4">
                <h3 class="text-lg font-semibold text-[#344054]">{{ t('booking.adjustment.titles.cancel') }}</h3>
                <BookingAdjustmentPopup type="cancel" />
                <ShowCodeToggle :code="codeExamples.cancel" />
            </div>

            <div class="flex flex-col gap-4">
                <h3 class="text-lg font-semibold text-[#344054]">{{ t('demo.actionMenuDropdown.cards.actionMenu') }}</h3>
                <ActionMenuDropdown variant="card" :items="bookingMenuItems" />
                <ShowCodeToggle :code="codeExamples.actionMenu" />
            </div>

            <div class="flex flex-col gap-4">
                <h3 class="text-lg font-semibold text-[#344054]">{{ t('demo.actionMenuDropdown.cards.avatarMenu') }}</h3>
                <ActionMenuDropdown variant="list" :items="avatarMenuItems" />
                <ShowCodeToggle :code="codeExamples.avatarMenu" />
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BookingAdjustmentPopup from '@/dev/components/ui/popups/booking/BookingAdjustmentPopup.vue';
import ActionMenuDropdown from '@/dev/components/ui/dropdowns/ActionMenuDropdown.vue';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';

const { t } = useI18n();

const bookingMenuItems = [
    {
        id: 'moreTime',
        labelKey: 'booking.moreOptions.moreTime',
        iconKey: 'icon.booking.clockPlus',
        iconAltKey: 'booking.moreOptions.icons.clock',
    },
    {
        id: 'reschedule',
        labelKey: 'booking.moreOptions.reschedule',
        iconKey: 'icon.booking.calendar',
        iconAltKey: 'booking.moreOptions.icons.calendar',
    },
    {
        id: 'cancel',
        labelKey: 'booking.moreOptions.cancelCall',
        iconKey: 'icon.booking.phoneCancel',
        iconAltKey: 'booking.moreOptions.icons.cancel',
        danger: true,
    },
];

const avatarMenuItems = [
    {
        id: 'edit',
        labelKey: 'avatarMenu.edit',
        iconKey: 'icon.media.menu.edit',
        iconAltKey: 'avatarMenu.icons.edit',
    },
    {
        id: 'upload',
        labelKey: 'avatarMenu.uploadNew',
        iconKey: 'icon.avatar.upload',
        iconAltKey: 'avatarMenu.icons.upload',
    },
    {
        id: 'chooseAvatars',
        labelKey: 'avatarMenu.chooseFromAvatars',
        iconKey: 'icon.avatar.gallery',
        iconAltKey: 'avatarMenu.icons.avatars',
    },
];

const sample = computed(() => ({
    eventDate: t('demo.bookingAdjustment.sample.eventDate'),
    eventDateReschedule: t('demo.bookingAdjustment.sample.eventDateReschedule'),
    originalDate: t('demo.bookingAdjustment.sample.originalDate'),
    newTime: t('demo.bookingAdjustment.sample.newTime'),
    endTime: t('demo.bookingAdjustment.sample.endTime'),
    originalTime: t('demo.bookingAdjustment.sample.originalTime'),
    userName: t('demo.bookingAdjustment.sample.userName'),
}));

const codeExamples = computed(() => ({
    moreTime: `<BookingAdjustmentPopup
  type="moreTime"
  :event-date="t('demo.bookingAdjustment.sample.eventDate')"
  :new-time="t('demo.bookingAdjustment.sample.newTime')"
  :end-time="t('demo.bookingAdjustment.sample.endTime')"
  :original-time="t('demo.bookingAdjustment.sample.originalTime')"
  :user-name="t('demo.bookingAdjustment.sample.userName')"
  @close="onClose"
  @submit="onSubmit"
/>`,
    reschedule: `<BookingAdjustmentPopup
  type="reschedule"
  :event-date="t('demo.bookingAdjustment.sample.eventDateReschedule')"
  :original-date="t('demo.bookingAdjustment.sample.originalDate')"
  :new-time="t('demo.bookingAdjustment.sample.newTime')"
  :end-time="t('demo.bookingAdjustment.sample.endTime')"
  :original-time="t('demo.bookingAdjustment.sample.originalTime')"
  :user-name="t('demo.bookingAdjustment.sample.userName')"
  @close="onClose"
  @submit="onSubmit"
/>`,
    cancel: `<BookingAdjustmentPopup
  type="cancel"
  @close="onClose"
  @back="onBack"
  @confirm="onConfirm"
/>`,
    actionMenu: `<ActionMenuDropdown
  variant="card"
  :items="bookingMenuItems"
  @select="onSelect"
/>`,
    avatarMenu: `<ActionMenuDropdown
  variant="list"
  :items="avatarMenuItems"
  @select="onSelect"
/>`,
}));
</script>