<template>
    <section class="flex flex-col gap-6">
        <DemoSectionHeader :title="t('demo.dashProfileSettings.sectionTitle')" />
        <DashProfileSettings />
    </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import DashProfileSettings from '@/dev/components/ui/nav/dashboard/DashProfileSettings.vue';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';

const { t } = useI18n();
</script>
