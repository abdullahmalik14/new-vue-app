<template>
    <section class="flex flex-col gap-6">
        <DemoSectionHeader :title="t('demo.radioGroup.sectionTitle')" />
        <div class="flex flex-col gap-10 max-w-xl">
            <div class="flex flex-col gap-3">
                <RadioGroup
                    v-model="radioVals.withLabel"
                    name="radio-with-label"
                    :label="t('demo.radioGroup.labels.attachMedia')"
                    :options="attachMediaOptions"
                    version="dashboard"
                    label-class="text-sm font-semibold text-[#667085]"
                />
                <p class="text-xs text-gray-400">{{ t('demo.radioGroup.selected') }}: {{ radioVals.withLabel }}</p>
                <ShowCodeToggle :code="codeExamples.withLabel" />
            </div>

            <div class="flex flex-col gap-3">
                <RadioGroup
                    v-model="radioVals.mediaUploader"
                    name="radio-media-uploader"
                    :label="t('demo.radioGroup.labels.attachMedia')"
                    :options="attachMediaOptions"
                    version="dashboard"
                    :radio-label-class="mediaUploaderRadioLabelClass"
                />
                <p class="text-xs text-gray-400">{{ t('demo.radioGroup.selected') }}: {{ radioVals.mediaUploader }}</p>
                <ShowCodeToggle :code="codeExamples.mediaUploaderStyle" />
            </div>

            <div class="flex flex-col gap-3">
                <RadioGroup
                    v-model="radioVals.multiple"
                    name="radio-multiple"
                    :label="t('demo.radioGroup.labels.pickMultiple')"
                    :options="basicOptions"
                    version="dashboard"
                    multiple
                />
                <p class="text-xs text-gray-400">{{ t('demo.radioGroup.selected') }}: {{ multipleSelectedLabel }}</p>
                <ShowCodeToggle :code="codeExamples.multiple" />
            </div>
        </div>
    </section>
</template>

<script setup>
import { reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import RadioGroup from '@/components/forms/radio/dashboard/RadioGroup.vue';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';

const { t } = useI18n();

const radioVals = reactive({
    withLabel: 'useOriginal',
    mediaUploader: 'useOriginal',
    multiple: ['optionA', 'optionC'],
});

const basicOptions = computed(() => [
    { value: 'optionA', label: t('demo.radioGroup.options.optionA') },
    { value: 'optionB', label: t('demo.radioGroup.options.optionB') },
    { value: 'optionC', label: t('demo.radioGroup.options.optionC') },
]);

const attachMediaOptions = computed(() => [
    { value: 'useOriginal', label: t('demo.radioGroup.options.useOriginal') },
    { value: 'useCustom', label: t('demo.radioGroup.options.useCustom') },
    { value: 'none', label: t('demo.radioGroup.options.none') },
]);

const multipleSelectedLabel = computed(() =>
    radioVals.multiple.length ? radioVals.multiple.join(', ') : '—',
);

const mediaUploaderRadioLabelClass = `relative text-[0.938rem] font-medium leading-6 text-black pl-8 cursor-pointer
  before:content-[''] before:w-5 before:h-5 before:rounded-full before:border before:border-radio-border before:bg-white
  before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 peer-checked:before:bg-black
  after:content-[''] after:w-[0.375rem] after:h-[0.375rem] after:rounded-full after:bg-success
  after:absolute after:left-[0.4375rem] after:top-1/2 after:-translate-y-1/2
  peer-checked:after:block after:hidden`;

const codeExamples = computed(() => ({
    withLabel: `<RadioGroup
  v-model="selected"
  name="radio-with-label"
  :label="t('demo.radioGroup.labels.attachMedia')"
  :options="attachMediaOptions"
  version="dashboard"
  label-class="text-sm font-semibold text-[#667085]"
/>

<!-- Script -->
import RadioGroup from '@/dev/components/forms/radio/dashboard/RadioGroup.vue';`,
    mediaUploaderStyle: `<RadioGroup
  v-model="socialThumbnailMode"
  name="socialMode"
  :label="t('demo.radioGroup.labels.attachMedia')"
  :options="attachMediaOptions"
  version="dashboard"
  :radio-label-class="mediaUploaderRadioLabelClass"
/>

<!-- Script -->
import RadioGroup from '@/dev/components/forms/radio/dashboard/RadioGroup.vue';

<!-- Same radio-label-class as MediaUploaderStepPublishAndSharing -->`,
    multiple: `<RadioGroup
  v-model="selected"
  name="radio-multiple"
  :label="t('demo.radioGroup.labels.pickMultiple')"
  :options="basicOptions"
  version="dashboard"
  multiple
/>

<!-- Script -->
import RadioGroup from '@/dev/components/forms/radio/dashboard/RadioGroup.vue';
const selected = ref(['optionA', 'optionC']);`,
}));
</script>
