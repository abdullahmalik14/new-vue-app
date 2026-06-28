<template>
    <section class="flex flex-col gap-6">
        <DemoSectionHeader :title="t('demo.calendarChat.sectionTitle')" />
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div class="flex flex-col gap-4">
                <h3 class="text-lg font-semibold text-[#344054]">{{ t('demo.calendarChat.cards.newMessage') }}</h3>
                <NewMessage />
                <ShowCodeToggle :code="codeExamples.newMessage" />
            </div>

            <div class="flex flex-col gap-4">
                <h3 class="text-lg font-semibold text-[#344054]">{{ t('demo.calendarChat.cards.chatSection') }}</h3>
                <ChatSection />
                <ShowCodeToggle :code="codeExamples.chatSection" />
            </div>

            <div class="flex flex-col gap-4">
                <h3 class="text-lg font-semibold text-[#344054]">{{ t('demo.calendarChat.cards.adjustCostBooking') }}</h3>
                <AdjustCostBooking />
                <ShowCodeToggle :code="codeExamples.adjustCostBooking" />
            </div>

            <div class="flex flex-col gap-4">
                <h3 class="text-lg font-semibold text-[#344054]">{{ t('demo.calendarChat.cards.callSoonChat') }}</h3>
                <CallSoonChat />
                <ShowCodeToggle :code="codeExamples.callSoonChat" />
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import NewMessage from '@/dev/components/calendar/NewMessage.vue';
import ChatSection from '@/dev/components/calendar/ChatSection.vue';
import AdjustCostBooking from '@/dev/components/calendar/AdjustCostBooking.vue';
import CallSoonChat from '@/dev/components/calendar/CallSoonChat.vue';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';

const { t } = useI18n();

const codeExamples = computed(() => ({
    newMessage: `<!-- Template -->
<NewMessage />

<!-- Script -->
import NewMessage from '@/dev/components/calendar/NewMessage.vue';`,
    chatSection: `<!-- Template -->
<ChatSection />

<!-- Script -->
import ChatSection from '@/dev/components/calendar/ChatSection.vue';`,
    adjustCostBooking: `<!-- Template -->
<AdjustCostBooking />

<!-- Script -->
import AdjustCostBooking from '@/dev/components/calendar/AdjustCostBooking.vue';`,
    callSoonChat: `<!-- Template -->
<CallSoonChat />

<!-- Script -->
import CallSoonChat from '@/dev/components/calendar/CallSoonChat.vue';`,
}));
</script>
