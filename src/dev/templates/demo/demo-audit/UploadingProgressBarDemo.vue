<template>
    <section class="flex flex-col gap-6">
        <DemoSectionHeader :title="t('demo.uploadingProgressBar.sectionTitle')" />
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <DemoCard :label="t('demo.uploadingProgressBar.cards.start')" :code="codeExamples.start">
                <UploadingProgressBar :progress="0" />
            </DemoCard>

            <DemoCard :label="t('demo.uploadingProgressBar.cards.quarter')" :code="codeExamples.quarter">
                <UploadingProgressBar :progress="25" />
            </DemoCard>

            <DemoCard :label="t('demo.uploadingProgressBar.cards.half')" :code="codeExamples.half">
                <UploadingProgressBar :progress="50" />
            </DemoCard>

            <DemoCard :label="t('demo.uploadingProgressBar.cards.threeQuarter')" :code="codeExamples.threeQuarter">
                <UploadingProgressBar :progress="75" />
            </DemoCard>

            <DemoCard :label="t('demo.uploadingProgressBar.cards.complete')" :code="codeExamples.complete">
                <UploadingProgressBar :progress="100" label-key="uploadProgress.complete" />
            </DemoCard>

            <DemoCard :label="t('demo.uploadingProgressBar.cards.animated')" :code="codeExamples.animated">
                <UploadingProgressBar :progress="animatedProgress" />
                <p class="text-xs text-gray-400 mt-2">{{ animatedProgress }}%</p>
            </DemoCard>
        </div>
    </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import UploadingProgressBar from '@/dev/components/ui/progress/UploadingProgressBar.vue';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import DemoCard from '@/dev/templates/demo/DemoCard.vue';

const { t } = useI18n();

const animatedProgress = ref(0);
let progressTimer = null;

onMounted(() => {
    progressTimer = window.setInterval(() => {
        animatedProgress.value = animatedProgress.value >= 100 ? 0 : animatedProgress.value + 5;
    }, 500);
});

onBeforeUnmount(() => {
    if (progressTimer) {
        window.clearInterval(progressTimer);
    }
});

const codeExamples = computed(() => ({
    start: `<UploadingProgressBar :progress="0" />`,
    quarter: `<UploadingProgressBar :progress="25" />`,
    half: `<UploadingProgressBar :progress="50" />`,
    threeQuarter: `<UploadingProgressBar :progress="75" />`,
    complete: `<UploadingProgressBar
  :progress="100"
  label-key="uploadProgress.complete"
/>`,
    animated: `<UploadingProgressBar :progress="animatedProgress" />

<!-- Script -->
const animatedProgress = ref(0);`,
}));
</script>
