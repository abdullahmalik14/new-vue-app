<template>
    <section class="flex flex-col gap-6">
        <DemoSectionHeader :title="t('demo.mediaUploaderComponents.sectionTitle')" />

        <div class=" flex flex-col">
            <div class="w-full max-w-3xl flex flex-col gap-10">
                <div class="flex flex-col gap-3">
                    <p class="text-sm font-semibold text-[#667085]">{{ t('demo.mediaUploaderComponents.sections.searchTags') }}</p>
                    <MediaUploaderSearchInput
                        :title="t('demo.mediaUploaderComponents.search.tags.title')"
                        :subtitle="t('demo.mediaUploaderComponents.search.tags.subtitle')"
                        :placeholder="t('demo.mediaUploaderComponents.search.tags.placeholder')"
                        type="tags"
                        :results="tagsList"
                        :history-tags="historyTags"
                        v-model="tagsModel"
                        :max-items="10"
                        :show-language-icon="true"
                        @search="handleTagSearch"
                        @manage-tags="openManageTags"
                    />
                    <ShowCodeToggle :code="code.searchTags" />
                </div>

                <div class="flex flex-col gap-3">
                    <p class="text-sm font-semibold text-[#667085]">{{ t('demo.mediaUploaderComponents.sections.searchCoPerformer') }}</p>
                    <MediaUploaderSearchInput
                        :title="t('demo.mediaUploaderComponents.search.coPerformer.title')"
                        :subtitle="t('demo.mediaUploaderComponents.search.coPerformer.subtitle')"
                        :placeholder="t('demo.mediaUploaderComponents.search.coPerformer.placeholder')"
                        type="performer"
                        :results="performersList"
                        v-model="performersModel"
                        :max-items="5"
                        @search="handlePerformerSearch"
                    />
                    <ShowCodeToggle :code="code.searchCoPerformer" />
                </div>

                <div class="flex flex-col gap-3">
                    <p class="text-sm font-semibold text-[#667085]">{{ t('demo.mediaUploaderComponents.sections.searchInviteList') }}</p>
                    <MediaUploaderSearchInput
                        :subtitle="t('demo.mediaUploaderComponents.search.inviteList.subtitle')"
                        :placeholder="t('demo.mediaUploaderComponents.search.inviteList.placeholder')"
                        type="performer"
                        :results="planSharingPerformersList"
                        v-model="invitedPerformersModel"
                        :max-items="5"
                        parentClass="w-full"
                        searchWrapperClass="bg-white/75 dark:bg-[#181a1b]/75"
                        inputClass="h-7"
                        subTitleClass="text-[#0C111D] dark:text-[#dbd8d3] text-base font-medium"
                    />
                    <ShowCodeToggle :code="code.searchInviteList" />
                </div>

                <div class="flex flex-col gap-3">
                    <p class="text-sm font-semibold text-[#667085]">{{ t('demo.mediaUploaderComponents.sections.publishDatePicker') }}</p>
                    <PublishDatePicker
                        v-model="scheduleDateModel"
                        :label="t('demo.mediaUploaderComponents.publishDatePicker.label')"
                        :message="t('demo.mediaUploaderComponents.publishDatePicker.message')"
                    />
                    <ShowCodeToggle :code="code.publishDatePicker" />
                </div>

                <div class="flex flex-col gap-3">
                    <p class="text-sm font-semibold text-[#667085]">{{ t('demo.mediaUploaderComponents.sections.postPreview') }}</p>
                    <PostPreview />
                    <ShowCodeToggle :code="code.postPreview" />
                </div>


                <div class="flex flex-col gap-3">
                    <p class="text-sm font-semibold text-[#667085]">{{ t('demo.mediaUploaderComponents.sections.thumbnailUploaderDefault') }}</p>
                    <ThumbnailUploader />
                    <ShowCodeToggle :code="code.thumbnailUploaderDefault" />
                </div>

                <div class="flex flex-col gap-3">
                    <p class="text-sm font-semibold text-[#667085]">{{ t('demo.mediaUploaderComponents.sections.thumbnailUploaderTrailer') }}</p>
                    <ThumbnailUploader
                        :subtitle="t('demo.mediaUploaderComponents.thumbnailUploader.trailerSubtitle')"
                        :file-info="t('demo.mediaUploaderComponents.thumbnailUploader.trailerFileInfo')"
                        accept="video/*,image/*"
                        stateUrlKey="previewTrailerUrl"
                        stateFileKey="uploadedTrailerFile"
                    />
                    <ShowCodeToggle :code="code.thumbnailUploaderTrailer" />
                </div>

                <div class="flex flex-col gap-3">
                    <p class="text-sm font-semibold text-[#667085]">{{ t('demo.mediaUploaderComponents.sections.thumbnailUploaderImage') }}</p>
                    <ThumbnailUploader
                        :subtitle="t('demo.mediaUploaderComponents.thumbnailUploader.imageSubtitle')"
                        :file-info="t('demo.mediaUploaderComponents.thumbnailUploader.imageFileInfo')"
                        stateUrlKey="socialThumbnailCustomImageSrc"
                        stateFileKey="socialThumbnailCustomImageFile"
                    />
                    <ShowCodeToggle :code="code.thumbnailUploaderImage" />
                </div>

                <div class="flex flex-col gap-3">
                    <p class="text-sm font-semibold text-[#667085]">{{ t('demo.mediaUploaderComponents.sections.thumbnailUploaderVideo') }}</p>
                    <ThumbnailUploader
                        :subtitle="t('demo.mediaUploaderComponents.thumbnailUploader.videoSubtitle')"
                        :file-info="t('demo.mediaUploaderComponents.thumbnailUploader.videoFileInfo')"
                        stateUrlKey="socialThumbnailCustomVideoSrc"
                        stateFileKey="socialThumbnailCustomVideoFile"
                        accept="video/*"
                    />
                    <ShowCodeToggle :code="code.thumbnailUploaderVideo" />
                </div>

                <div class="flex flex-col gap-3">
                    <p class="text-sm font-semibold text-[#667085]">{{ t('demo.mediaUploaderComponents.sections.thumbnailUploaderTier') }}</p>
                    <ThumbnailUploader
                        :title="t('demo.mediaUploaderComponents.thumbnailUploader.tierTitle')"
                        :subtitle="t('demo.mediaUploaderComponents.thumbnailUploader.tierSubtitle')"
                        :file-info="t('demo.mediaUploaderComponents.thumbnailUploader.tierFileInfo')"
                        stateUrlKey="tier_backgroundUrl"
                        stateFileKey="tier_backgroundFile"
                    >
                        <template #icon>
                            <svg width="60" height="60" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M40 30C34.4772 30 30 34.4772 30 40V80C30 85.5228 34.4772 90 40 90H80C85.5228 90 90 85.5228 90 80V40C90 34.4772 85.5228 30 80 30H40ZM40 35H80C82.7614 35 85 37.2386 85 40V70.8359L71.4922 56.4023C70.6211 55.4805 69.1758 55.4805 68.3047 56.4023L35 90V40C35 37.2386 37.2386 35 40 35ZM85 77.293L75.4062 67.043L69.8984 72.8828L78.3359 81.8984C72.0156 81.8984 66.8281 77.3477 65.418 71.3984L59.8164 77.0273C65.5703 82.5 73.082 85.3125 80.5 85.3125C82.2539 85.3125 83.8438 85.1602 85 84.8789V77.293ZM40 85H41.5938L64.3164 60.7188L71.4922 68.3984L58.2148 82.4766C52.7305 84.3281 46.4219 85.6484 40 85.3125V85ZM75 42.5C72.2386 42.5 70 44.7386 70 47.5C70 50.2614 72.2386 52.5 75 52.5C77.7614 52.5 80 50.2614 80 47.5C80 44.7386 77.7614 42.5 75 42.5Z" fill="#667085"/>
                            </svg>
                        </template>
                    </ThumbnailUploader>
                    <ShowCodeToggle :code="code.thumbnailUploaderTier" />
                </div>

                <div class="flex flex-col gap-3">
                    <p class="text-sm font-semibold text-[#667085]">{{ t('demo.mediaUploaderComponents.sections.thumbnailUploaderNayTwitter') }}</p>
                    <ThumbnailUploaderNay
                        :input-name="twitterUploaderInputName"
                        custom-class="cursor-pointer border-2 border-transparent bg-black/5 rounded-xl p-4 h-[7.875rem] flex flex-col items-center justify-center hover:border-gray-900 hover:bg-black/10"
                        input-wrapper-class="border-2 border-dashed border-transparent !gap-1"
                        button-wrapper-class="shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] rounded-lg h-10 w-10 relative flex justify-center items-center"
                        button-icon-wrapper-class="cursor-pointer shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] bg-green-500 rounded-lg h-10 w-10 flex justify-center items-center hover:bg-black"
                        button-parent-wrapper-class="flex flex-col items-center justify-center gap-3"
                        :button-text="t('demo.mediaUploaderComponents.thumbnailUploaderNay.clickToUpload')"
                        button-text-class="font-semibold text-gray-900 cursor-pointer"
                        :drop-text="t('demo.mediaUploaderComponents.thumbnailUploaderNay.dropText')"
                        drop-text-class="text-sm font-normal leading-5 text-gray-500 text-center"
                        :custom-allowed-types="t('demo.mediaUploaderComponents.thumbnailUploaderNay.twitterAllowedTypes')"
                        :custom-max-size="t('demo.mediaUploaderComponents.thumbnailUploaderNay.twitterMaxSize')"
                        eenable-image-compression="true"
                        format-text-class="text-gray-500 text-xs leading-[1.125rem] text-center mb-0"
                        @media-urls-updated="handleTwitterMediaUrlsUpdated"
                    />
                    <ShowCodeToggle :code="code.thumbnailUploaderNayTwitter" />
                </div>

                <div class="flex flex-col gap-3">
                    <p class="text-sm font-semibold text-[#667085]">{{ t('demo.mediaUploaderComponents.sections.thumbnailUploaderNayBooking') }}</p>
                    <ThumbnailUploaderNay
                        custom-class="cursor-pointer border-2 border-transparent bg-black/5 rounded-xl p-4 h-[7.875rem] flex flex-col items-center justify-center hover:border-gray-900 hover:bg-black/10"
                        input-wrapper-class="border-2 border-dashed border-transparent !gap-1"
                        button-wrapper-class="shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] rounded-lg h-10 w-10 relative flex justify-center items-center"
                        button-icon-wrapper-class="cursor-pointer shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] bg-green-500 rounded-lg h-10 w-10 flex justify-center items-center hover:bg-black"
                        button-parent-wrapper-class="flex flex-col items-center justify-center gap-3"
                        :button-text="t('demo.mediaUploaderComponents.thumbnailUploaderNay.clickToUpload')"
                        button-text-class="font-semibold text-gray-900 cursor-pointer"
                        :drop-text="t('demo.mediaUploaderComponents.thumbnailUploaderNay.bookingDropText')"
                        drop-text-class="text-sm font-normal leading-5 text-gray-500 text-center"
                        :custom-allowed-types="t('demo.mediaUploaderComponents.thumbnailUploaderNay.bookingAllowedTypes')"
                        :custom-max-size="t('demo.mediaUploaderComponents.thumbnailUploaderNay.bookingMaxSize')"
                        eenable-image-compression="true"
                        format-text-class="text-gray-500 text-xs leading-[1.125rem] text-center mb-0"
                        @media-uploaded="handleBookingMediaUploaded"
                    />
                    <ShowCodeToggle :code="code.thumbnailUploaderNayBooking" />
                </div>

                <div class="flex flex-col gap-3">
                    <p class="text-sm font-semibold text-[#667085]">{{ t('demo.mediaUploaderComponents.sections.videoThumbnailSelector') }}</p>
                    <VideoThumbnailSelector />
                    <ShowCodeToggle :code="code.videoThumbnailSelector" />
                </div>


                <div class="flex flex-col gap-3">
                    <p class="text-sm font-semibold text-[#667085]">{{ t('demo.mediaUploaderComponents.sections.thumbnailSelector') }}</p>
                    <ThumbnailSelector
                        :thumbnails="thumbnailSelectorImages"
                        :selectedIndex="thumbnailSelectedIndex"
                        @update:selectedIndex="(index) => (thumbnailSelectedIndex = index)"
                    />
                    <ShowCodeToggle :code="code.thumbnailSelector" />
                </div>

                <div class="flex flex-col gap-3">
                    <p class="text-sm font-semibold text-[#667085]">{{ t('demo.mediaUploaderComponents.sections.blurEffect') }}</p>
                    <BlurEffect v-model="blurLevelModel" />
                    <ShowCodeToggle :code="code.blurEffect" />
                </div>

                <div class="flex flex-col gap-3">
                    <p class="text-sm font-semibold text-[#667085]">{{ t('demo.mediaUploaderComponents.sections.uploadThumbnailPreview') }}</p>
                    <UploadThumbnailPreview
                        :bgImage="assets.slideImage"
                        :deleteIcon="assets.deleteIcon"
                        expandIcon=""
                        :showLabel="false"
                        :showBlurToggle="true"
                        :preloadImages="[assets.slideImage, assets.deleteIcon]"
                    />
                    <ShowCodeToggle :code="code.uploadThumbnailPreview" />
                </div>

                <div class="flex flex-col gap-3">
                    <p class="text-sm font-semibold text-[#667085]">{{ t('demo.mediaUploaderComponents.sections.systemGeneratedImage') }}</p>
                    <SystemGeneratedImage />
                    <ShowCodeToggle :code="code.systemGeneratedImage" />
                </div>

                <div class="flex flex-col gap-3">
                    <p class="text-sm font-semibold text-[#667085]">{{ t('demo.mediaUploaderComponents.sections.uploadYourOwnTrailer') }}</p>
                    <UploadYourOwnTrailer />
                    <ShowCodeToggle :code="code.uploadYourOwnTrailer" />
                </div>

                <div class="flex flex-col gap-3">
                    <p class="text-sm font-semibold text-[#667085]">{{ t('demo.mediaUploaderComponents.sections.fileUploadPlaceholder') }}</p>
                    <FileUploadPlaceholder />
                    <ShowCodeToggle :code="code.fileUploadPlaceholder" />
                </div>

                <div class="flex flex-col gap-3">
                    <p class="text-sm font-semibold text-[#667085]">{{ t('demo.mediaUploaderComponents.sections.trailerSettingScreenshot') }}</p>
                    <TrailerSetting stateKey="showPreviewTrailer_Screenshot" />
                    <ShowCodeToggle :code="code.trailerSettingScreenshot" />
                </div>

                <div class="flex flex-col gap-3">
                    <p class="text-sm font-semibold text-[#667085]">{{ t('demo.mediaUploaderComponents.sections.trailerSettingPlaceholder') }}</p>
                    <TrailerSetting stateKey="showPreviewTrailer_Placeholder" />
                    <ShowCodeToggle :code="code.trailerSettingPlaceholder" />
                </div>

                <div class="flex flex-col gap-3">
                    <p class="text-sm font-semibold text-[#667085]">{{ t('demo.mediaUploaderComponents.sections.trailerSettingUpload') }}</p>
                    <TrailerSetting stateKey="showPreviewTrailer_Upload" />
                    <ShowCodeToggle :code="code.trailerSettingUpload" />
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMediaUploaderStore } from '@/stores/useMediaUploaderStore';
import BlurEffect from '@/dev/components/media/uploader/parts/BlurEffect.vue';
import FileUploadPlaceholder from '@/dev/components/media/uploader/parts/FileUploadPlaceholder.vue';
import PostPreview from '@/dev/components/media/uploader/parts/PostPreview.vue';
import PublishDatePicker from '@/dev/components/media/uploader/parts/PublishDatePicker.vue';
import MediaUploaderSearchInput from '@/dev/components/media/uploader/parts/MediaUploaderSearchInput.vue';
import SocialCustomPreview from '@/dev/components/media/uploader/parts/SocialCustomPreview.vue';
import SystemGeneratedImage from '@/dev/components/media/uploader/parts/SystemGeneratedImage.vue';
import ThumbnailSelector from '@/dev/components/media/uploader/parts/ThumbnailSelector.vue';
import ThumbnailUploader from '@/dev/components/media/uploader/parts/ThumbnailUploader.vue';
import ThumbnailUploaderNay from '@/dev/components/media/uploader/parts/ThumbnailUploaderNay.vue';
import TrailerSetting from '@/dev/components/media/uploader/parts/TrailerSetting.vue';
import UploadThumbnailPreview from '@/dev/components/media/uploader/parts/UploadThumbnailPreview.vue';
import UploadYourOwnTrailer from '@/dev/components/media/uploader/parts/UploadYourOwnTrailer.vue';
import VideoThumbnailSelector from '@/dev/components/media/uploader/parts/VideoThumbnailSelector.vue';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';
import { useMediaUploaderDemo } from '@/dev/composables/useMediaUploaderDemo.js';

const { t } = useI18n();
const uploaderStore = useMediaUploaderStore();
const {
  assets,
  thumbnailSelectorImages,
  historyTags,
  tagsList,
  performersList,
  planSharingPerformersList,
} = useMediaUploaderDemo();

const scheduleDateModel = ref('');
const blurLevelModel = ref('20px');
const thumbnailSelectedIndex = ref(0);
const tagsModel = ref([]);
const performersModel = ref([]);
const invitedPerformersModel = ref([]);
const twitterUploaderInputName = ref('');

const handleTagSearch = () => {};
const openManageTags = () => {};
const handlePerformerSearch = () => {};
const handleTwitterMediaUrlsUpdated = () => {};
const handleBookingMediaUploaded = () => {};

function initUploaderStore() {
  const a = assets.value;
  if (!a.slideImage) return;

  uploaderStore.updateFormField('thumbnailUrl', a.slideImage);
  uploaderStore.updateFormField('previewTrailerUrl', a.slideImage);
  uploaderStore.updateFormField('blurThumbnail', false);
  uploaderStore.updateFormField('blurThumbnailLevel', '20px');
  uploaderStore.updateFormField('socialThumbnailMode', 'useOriginal');
  uploaderStore.updateFormField('socialPostMessage', '');
  uploaderStore.updateFormField('socialThumbnailCustomImageSrc', a.customImage || a.slideImage);
  uploaderStore.updateFormField('socialThumbnailCustomVideoSrc', a.sampleVideo);
}

watch(assets, initUploaderStore, { immediate: true, deep: true });

const importLine = (name, path) => `import ${name} from '${path}';`;

const code = computed(() => ({
  searchTags: `${importLine('MediaUploaderSearchInput', '@/dev/components/media/uploader/parts/MediaUploaderSearchInput.vue')}

<MediaUploaderSearchInput
  :title="t('demo.mediaUploaderComponents.search.tags.title')"
  :subtitle="t('demo.mediaUploaderComponents.search.tags.subtitle')"
  :placeholder="t('demo.mediaUploaderComponents.search.tags.placeholder')"
  type="tags"
  :results="tagsList"
  :history-tags="historyTags"
  v-model="tagsModel"
  :max-items="10"
  :show-language-icon="true"
  :icon-url="searchIconUrl"
  @search="handleTagSearch"
  @manage-tags="openManageTags"
/>`,
  searchCoPerformer: `${importLine('MediaUploaderSearchInput', '@/dev/components/media/uploader/parts/MediaUploaderSearchInput.vue')}

<MediaUploaderSearchInput
  :title="t('demo.mediaUploaderComponents.search.coPerformer.title')"
  :subtitle="t('demo.mediaUploaderComponents.search.coPerformer.subtitle')"
  :placeholder="t('demo.mediaUploaderComponents.search.coPerformer.placeholder')"
  type="performer"
  :results="performersList"
  v-model="performersModel"
  :max-items="5"
  @search="handlePerformerSearch"
/>`,
  searchInviteList: `${importLine('MediaUploaderSearchInput', '@/dev/components/media/uploader/parts/MediaUploaderSearchInput.vue')}

<MediaUploaderSearchInput
  :subtitle="t('demo.mediaUploaderComponents.search.inviteList.subtitle')"
  :placeholder="t('demo.mediaUploaderComponents.search.inviteList.placeholder')"
  type="performer"
  :results="planSharingPerformersList"
  v-model="invitedPerformersModel"
  :max-items="5"
  parentClass="w-full"
  searchWrapperClass="bg-white/75 dark:bg-[#181a1b]/75"
  inputClass="h-7"
  subTitleClass="text-[#0C111D] dark:text-[#dbd8d3] text-base font-medium"
/>`,
  publishDatePicker: `${importLine('PublishDatePicker', '@/dev/components/media/uploader/parts/PublishDatePicker.vue')}

<PublishDatePicker
  v-model="scheduleDateModel"
  :label="t('demo.mediaUploaderComponents.publishDatePicker.label')"
  :message="t('demo.mediaUploaderComponents.publishDatePicker.message')"
/>`,
  postPreview: `${importLine('PostPreview', '@/dev/components/media/uploader/parts/PostPreview.vue')}

<PostPreview />`,
  socialPreviewThumbnail: `${importLine('SocialCustomPreview', '@/dev/components/media/uploader/parts/SocialCustomPreview.vue')}

<SocialCustomPreview
  v-if="customImageSrc"
  :src="customImageSrc"
  :label="t('demo.mediaUploaderComponents.socialPreview.thumbnailLabel')"
  type="image"
  @preview-delete="onDeleteCustomImage"
/>`,
  socialPreviewTrailer: `${importLine('SocialCustomPreview', '@/dev/components/media/uploader/parts/SocialCustomPreview.vue')}

<SocialCustomPreview
  v-if="customVideoSrc"
  :src="customVideoSrc"
  :label="t('demo.mediaUploaderComponents.socialPreview.trailerLabel')"
  type="video"
  @preview-delete="onDeleteCustomVideo"
/>`,
  thumbnailUploaderDefault: `${importLine('ThumbnailUploader', '@/dev/components/media/uploader/parts/ThumbnailUploader.vue')}

<ThumbnailUploader />`,
  thumbnailUploaderTrailer: `${importLine('ThumbnailUploader', '@/dev/components/media/uploader/parts/ThumbnailUploader.vue')}

<ThumbnailUploader
  :subtitle="t('demo.mediaUploaderComponents.thumbnailUploader.trailerSubtitle')"
  :file-info="t('demo.mediaUploaderComponents.thumbnailUploader.trailerFileInfo')"
  accept="video/*,image/*"
  stateUrlKey="previewTrailerUrl"
  stateFileKey="uploadedTrailerFile"
/>`,
  thumbnailUploaderImage: `${importLine('ThumbnailUploader', '@/dev/components/media/uploader/parts/ThumbnailUploader.vue')}

<ThumbnailUploader
  :subtitle="t('demo.mediaUploaderComponents.thumbnailUploader.imageSubtitle')"
  :file-info="t('demo.mediaUploaderComponents.thumbnailUploader.imageFileInfo')"
  stateUrlKey="socialThumbnailCustomImageSrc"
  stateFileKey="socialThumbnailCustomImageFile"
/>`,
  thumbnailUploaderVideo: `${importLine('ThumbnailUploader', '@/dev/components/media/uploader/parts/ThumbnailUploader.vue')}

<ThumbnailUploader
  :subtitle="t('demo.mediaUploaderComponents.thumbnailUploader.videoSubtitle')"
  :file-info="t('demo.mediaUploaderComponents.thumbnailUploader.videoFileInfo')"
  stateUrlKey="socialThumbnailCustomVideoSrc"
  stateFileKey="socialThumbnailCustomVideoFile"
  accept="video/*"
/>`,
  thumbnailUploaderTier: `${importLine('ThumbnailUploader', '@/dev/components/media/uploader/parts/ThumbnailUploader.vue')}

<ThumbnailUploader
  :title="t('demo.mediaUploaderComponents.thumbnailUploader.tierTitle')"
  :subtitle="t('demo.mediaUploaderComponents.thumbnailUploader.tierSubtitle')"
  :file-info="t('demo.mediaUploaderComponents.thumbnailUploader.tierFileInfo')"
  stateUrlKey="tier_backgroundUrl"
  stateFileKey="tier_backgroundFile"
>
  <template #icon><!-- tier SVG icon --></template>
</ThumbnailUploader>`,
  thumbnailUploaderNayTwitter: `${importLine('ThumbnailUploaderNay', '@/dev/components/media/uploader/parts/ThumbnailUploaderNay.vue')}

<ThumbnailUploaderNay
  :button-text="t('demo.mediaUploaderComponents.thumbnailUploaderNay.clickToUpload')"
  :drop-text="t('demo.mediaUploaderComponents.thumbnailUploaderNay.dropText')"
  :custom-allowed-types="t('demo.mediaUploaderComponents.thumbnailUploaderNay.twitterAllowedTypes')"
  :custom-max-size="t('demo.mediaUploaderComponents.thumbnailUploaderNay.twitterMaxSize')"
/>`,
  thumbnailUploaderNayBooking: `${importLine('ThumbnailUploaderNay', '@/dev/components/media/uploader/parts/ThumbnailUploaderNay.vue')}

<ThumbnailUploaderNay
  :button-text="t('demo.mediaUploaderComponents.thumbnailUploaderNay.clickToUpload')"
  :drop-text="t('demo.mediaUploaderComponents.thumbnailUploaderNay.bookingDropText')"
  :custom-allowed-types="t('demo.mediaUploaderComponents.thumbnailUploaderNay.bookingAllowedTypes')"
  :custom-max-size="t('demo.mediaUploaderComponents.thumbnailUploaderNay.bookingMaxSize')"
/>`,
  videoThumbnailSelector: `${importLine('VideoThumbnailSelector', '@/dev/components/media/uploader/parts/VideoThumbnailSelector.vue')}

<VideoThumbnailSelector />`,
  thumbnailSelector: `${importLine('ThumbnailSelector', '@/dev/components/media/uploader/parts/ThumbnailSelector.vue')}

<ThumbnailSelector
  :thumbnails="thumbnailSelectorImages"
  :selectedIndex="thumbnailSelectedIndex"
  @update:selectedIndex="(index) => (thumbnailSelectedIndex = index)"
/>`,
  blurEffect: `${importLine('BlurEffect', '@/dev/components/media/uploader/parts/BlurEffect.vue')}

<BlurEffect v-model="blurLevelModel" />`,
  uploadThumbnailPreview: `${importLine('UploadThumbnailPreview', '@/dev/components/media/uploader/parts/UploadThumbnailPreview.vue')}

<UploadThumbnailPreview
  :bgImage="slideImageUrl"
  :deleteIcon="deleteIconUrl"
  expandIcon=""
  :showLabel="false"
  :showBlurToggle="true"
  :preloadImages="[slideImageUrl, deleteIconUrl]"
/>`,
  systemGeneratedImage: `${importLine('SystemGeneratedImage', '@/dev/components/media/uploader/parts/SystemGeneratedImage.vue')}

<SystemGeneratedImage />`,
  uploadYourOwnTrailer: `${importLine('UploadYourOwnTrailer', '@/dev/components/media/uploader/parts/UploadYourOwnTrailer.vue')}

<UploadYourOwnTrailer />`,
  fileUploadPlaceholder: `${importLine('FileUploadPlaceholder', '@/dev/components/media/uploader/parts/FileUploadPlaceholder.vue')}

<FileUploadPlaceholder />`,
  trailerSettingScreenshot: `${importLine('TrailerSetting', '@/dev/components/media/uploader/parts/TrailerSetting.vue')}

<TrailerSetting stateKey="showPreviewTrailer_Screenshot" />`,
  trailerSettingPlaceholder: `${importLine('TrailerSetting', '@/dev/components/media/uploader/parts/TrailerSetting.vue')}

<TrailerSetting stateKey="showPreviewTrailer_Placeholder" />`,
  trailerSettingUpload: `${importLine('TrailerSetting', '@/dev/components/media/uploader/parts/TrailerSetting.vue')}

<TrailerSetting stateKey="showPreviewTrailer_Upload" />`,
}));
</script>
