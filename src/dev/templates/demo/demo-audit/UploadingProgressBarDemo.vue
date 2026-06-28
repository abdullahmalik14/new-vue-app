<template>
    <section class="flex flex-col gap-6">
        <DemoSectionHeader :title="t('demo.uploadingProgressBar.sectionTitle')" />
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <div class="flex flex-col gap-4">
                <h3 class="text-lg font-semibold text-[#344054]">{{ t('demo.uploadingProgressBar.cards.start') }}</h3>
                <UploadingProgressBar :progress="0" />
                <ShowCodeToggle :code="codeExamples.start" />
            </div>

            <div class="flex flex-col gap-4">
                <h3 class="text-lg font-semibold text-[#344054]">{{ t('demo.uploadingProgressBar.cards.quarter') }}</h3>
                <UploadingProgressBar :progress="25" />
                <ShowCodeToggle :code="codeExamples.quarter" />
            </div>

            <div class="flex flex-col gap-4">
                <h3 class="text-lg font-semibold text-[#344054]">{{ t('demo.uploadingProgressBar.cards.half') }}</h3>
                <UploadingProgressBar :progress="50" />
                <ShowCodeToggle :code="codeExamples.half" />
            </div>

            <div class="flex flex-col gap-4">
                <h3 class="text-lg font-semibold text-[#344054]">{{ t('demo.uploadingProgressBar.cards.threeQuarter') }}</h3>
                <UploadingProgressBar :progress="75" />
                <ShowCodeToggle :code="codeExamples.threeQuarter" />
            </div>

            <div class="flex flex-col gap-4">
                <h3 class="text-lg font-semibold text-[#344054]">{{ t('demo.uploadingProgressBar.cards.complete') }}</h3>
                <UploadingProgressBar :progress="100" label-key="uploadProgress.complete" />
                <ShowCodeToggle :code="codeExamples.complete" />
            </div>

            <div class="flex flex-col gap-4">
                <h3 class="text-lg font-semibold text-[#344054]">{{ t('demo.uploadingProgressBar.cards.animated') }}</h3>
                <UploadingProgressBar :progress="animatedProgress" />
                <p class="text-xs text-gray-400 mt-2">{{ animatedProgress }}%</p>
                <ShowCodeToggle :code="codeExamples.animated" />
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import UploadingProgressBar from '@/dev/components/ui/progress/UploadingProgressBar.vue';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';

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
