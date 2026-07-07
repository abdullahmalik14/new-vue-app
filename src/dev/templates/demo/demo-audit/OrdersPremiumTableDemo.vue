<template>
    <section class="flex flex-col gap-6">
        <DemoSectionHeader :title="t('demo.premiumOrders.sectionTitle')" />
        <OrdersPremiumTable />
    </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import OrdersPremiumTable from '@/dev/components/ui/table/dashboard/OrdersPremiumTable.vue';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';

const { t } = useI18n();
</script>
