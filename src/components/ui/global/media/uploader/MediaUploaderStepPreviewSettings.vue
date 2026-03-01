<template>
  <div class="relative md:py-[16px] md:px-[10px] lg:px-[24px]">
    <div class="flex gap-2 items-center py-[16px]">
      <img src="/images/backIcon.png" alt="" srcset="" />
      <button class="text-xs font-medium leading-[1.125rem] text-medium-text break-words">
        Back
      </button>
    </div>

    <h4 class="text-[#667085] text-sm font-[700] leading-normal not-italic py-[8px]">
      Thumbnail Settings
    </h4>

    <div
      class="border border-border-light w-full flex-row items-s tretch overflow-x-auto rounded-[0.313rem] bg-secondary-bg hidden md:flex"
      style="scrollbar-width: none; -ms-overflow-style: none">
      <div @click="uploader.goToSubstep('chooseScreenshot', { intent: 'user' })" :class="[
        'border-r flex flex-1 flex-shrink-0 min-w-fit items-center px-4 py-2 justify-center gap-2 border-border-light cursor-pointer',
        uploader.substep === 'chooseScreenshot' ? 'bg-dark-text text-white' : '',
      ]">
        <img src="/images/ssIcon.png" alt="" class="flex-shrink-0" />
        <button :class="uploader.substep === 'chooseScreenshot' ? 'text-white' : 'text-secondary-text'">
          Choose screenshot
        </button>
      </div>

      <div @click="uploader.goToSubstep('usePlaceholder', { intent: 'user' })" :class="[
        'flex flex-shrink-0 flex-1 min-w-fit border-r items-center px-4 py-2 justify-center gap-2 border-border-light cursor-pointer',
        uploader.substep === 'usePlaceholder' ? 'bg-dark-text text-white' : 'text-secondary-text',
      ]">
        <img src="/images/placeholderIcon.png" alt="" class="flex-shrink-0" />
        <button :class="uploader.substep === 'usePlaceholder' ? 'text-white' : ''">
          Use placeholder
        </button>
      </div>

      <div @click="uploader.goToSubstep('uploadThumbnail', { intent: 'user' })" :class="[
        'flex flex-shrink-0 flex-1 min-w-fit border-r items-center px-4 py-2 justify-center gap-2 border-border-light cursor-pointer',
        uploader.substep === 'uploadThumbnail' ? 'bg-dark-text text-white' : 'text-secondary-text',
      ]">
        <img src="/images/uploadIcon.png" alt="" class="flex-shrink-0" />
        <button :class="uploader.substep === 'uploadThumbnail' ? 'text-white' : ''">
          Upload your own thumbnail
        </button>
      </div>
    </div>

    <div class="md:hidden border border-border-light rounded-md bg-secondary-bg">
      <div @click="showMobileTabs = !showMobileTabs"
        class="px-4 py-2 border-b border-border-light cursor-pointer flex justify-center items-center gap-2 bg-dark-text text-white">
        <img :src="getStepIcon(uploader.substep)" alt="" class="w-5 h-5" />
        <span class="text-sm sm:text-[16px]">{{ getStepLabel(uploader.substep) }}</span>
        <img src="/images/chevron-down.webp" alt="" class="w-3 h-3" />
      </div>

      <div v-if="showMobileTabs" class="flex flex-col">
        <div @click="uploader.goToSubstep('chooseScreenshot'); showMobileTabs = false;"
          class="px-4 py-2 text-sm sm:text-[16px] flex items-center gap-2 border-b border-border-light cursor-pointer text-secondary-text">
          <img src="/images/ssIcon.png" alt="" class="w-5 h-5" />
          Choose screenshot
        </div>
        <div @click="uploader.goToSubstep('usePlaceholder'); showMobileTabs = false;"
          class="px-4 py-2 text-sm sm:text-[16px] flex items-center gap-2 border-b border-border-light cursor-pointer text-secondary-text">
          <img src="/images/placeholderIcon.png" alt="" class="w-5 h-5" />
          Use placeholder
        </div>
        <div @click="uploader.goToSubstep('uploadThumbnail'); showMobileTabs = false;"
          class="px-4 py-2 text-sm sm:text-[16px] flex items-center gap-2 border-b border-border-light cursor-pointer text-secondary-text">
          <img src="/images/ssIcon.png" alt="" class="w-5 h-5" />
          Upload your own thumbnail
        </div>
      </div>
    </div>

    <div v-if="uploader.substep === 'chooseScreenshot'">
      <div class="mt-4">
        <VideoThumbnailSelector :uploader="uploader" />
      </div>

      <h4 class="text-[#667085] text-sm font-[700] leading-normal not-italic py-[16px]">
        Trailer Settings
      </h4>

      <div class="mb-[100px]">
        <TrailerSetting :uploader="uploader" stateKey="showPreviewTrailer_Screenshot" />
      </div>
    </div>

    <div v-else-if="uploader.substep === 'usePlaceholder'">
      <div class="mt-4">
        <FileUploadPlaceholder />

        <h4 class="text-[#667085] text-sm font-[700] leading-normal not-italic py-[16px] w-max-">
          Trailer Settings
        </h4>
        <div class="mb-[50px]">
          <TrailerSetting :uploader="uploader" stateKey="showPreviewTrailer_Placeholder" />
        </div>

        <div
          class="[scrollbar-width: none] border border-border-light flex-row items-stretch overflow-x-auto whitespace-nowrap rounded-[0.313rem] bg-secondary-bg hidden md:flex">
          <div @click="previewTrailerSourceModel = 'siteGenerated'" :class="[
            'flex-1 text-center py-2 flex items-center gap-2 justify-center cursor-pointer border-r border-border-light',
            previewTrailerSourceModel === 'siteGenerated'
              ? 'bg-dark-text text-white'
              : 'text-secondary-text',
          ]">
            <img src="/images/ssIcon.png" alt="" />
            Use system generated trailer
          </div>

          <div @click="previewTrailerSourceModel = 'uploadOwn'" :class="[
            'flex-1 text-center py-2 cursor-pointer flex items-center gap-2 justify-center',
            previewTrailerSourceModel === 'uploadOwn'
              ? 'bg-dark-text text-white'
              : 'text-secondary-text',
          ]">
            <img src="/images/uploadIcon.png" alt="" />
            Upload your own trailer
          </div>
        </div>

        <div class="md:hidden border border-border-light rounded-md bg-secondary-bg">
          <div @click="showNestedDropdown = !showNestedDropdown"
            class="px-4 py-2 border-b border-border-light cursor-pointer flex justify-center items-center gap-2 bg-dark-text text-white">
            <img :src="getNestedIcon(previewTrailerSourceModel)" alt="" class="w-5 h-5" />
            <span class="text-sm sm:text-[16px]">{{ getNestedLabel(previewTrailerSourceModel) }}</span>
            <img src="/images/chevron-down.webp" alt="" class="w-3 h-3" />
          </div>

          <div v-if="showNestedDropdown" class="flex flex-col">
            <div @click="previewTrailerSourceModel = 'siteGenerated'; showNestedDropdown = false;"
              class="px-4 py-2 flex items-center text-sm sm:text-[16px] gap-2 border-b border-border-light cursor-pointer text-secondary-text">
              <img src="/images/ssIcon.png" alt="" class="w-5 h-5" />
              Use system generated trailer
            </div>

            <div @click="previewTrailerSourceModel = 'uploadOwn'; showNestedDropdown = false;"
              class="px-4 py-2 flex items-center text-sm sm:text-[16px] gap-2 border-b border-border-light cursor-pointer text-secondary-text">
              <img src="/images/uploadIcon.png" alt="" class="w-5 h-5" />
              Upload your own trailer
            </div>
          </div>
        </div>

        <div v-if="previewTrailerSourceModel === 'siteGenerated'">
          <p class="mt-4 text-gray-700">
            <SystemGeneratedImage />
          </p>
        </div>

        <div v-else-if="previewTrailerSourceModel === 'uploadOwn'">
          <div class="mt-4 mb-[50px]">
            <ThumbnailUploader :uploader="uploader" subtitle="or drag and drop video file here"
              fileInfo="MP4, AVI, QUICKTIME, X-MATROSKA, X-MS-WMV, WEBM, OGG, JPEG, PNG. (Max. 2000MB)" />
            <div class="mt-4 flex flex-col gap-2">
              <NotificationCard variant="alert" :showIcon="false"
                title="Your media will be under review because you have uploaded a new trailer." description="" />
              <UploadYourOwnTrailer />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="uploader.substep === 'uploadThumbnail'">
      <div class="mt-4">
        <ThumbnailUploader :uploader="uploader" />
        <UploadThumbnailPreview bgImage="/images/slide-2.webp" deleteIcon="/images/delete.png" expandIcon=""
          :showLabel="false" :showBlurToggle="true" :preloadImages="['/images/slide-2.webp', '/images/delete.png']" />
        <h4 class="text-[#667085] text-sm font-[700] leading-normal not-italic py-[16px]">
          Trailer Settings
        </h4>
        <div class="mb-[50px]">
          <TrailerSetting :uploader="uploader" stateKey="showPreviewTrailer_Upload" />
        </div>
      </div>
    </div>

    <div class="flex justify-end md:mt-0 mt-4" @click="uploader.goToStep(2, { intent: 'user' })">
      <ButtonComponent text="Next" variant="polygonLeft"
        :rightIcon="'https://i.ibb.co/hx8ztZFf/svgviewer-png-output-8.webp'" btnBg="#07f468" btnHoverBg="black"
        btnText="black" btnHoverText="#07f468" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import ButtonComponent from "@/components/dev/button/ButtonComponent.vue";
import TrailerSetting from "./HelperComponents/TrailerSetting.vue";
import VideoThumbnailSelector from "./HelperComponents/VideoThumbnailSelector.vue";
import FileUploadPlaceholder from "./HelperComponents/FileUploadPlaceholder.vue";
import ThumbnailUploader from "./HelperComponents/ThumbnailUploader.vue";
import UploadThumbnailPreview from "./HelperComponents/UploadThumbnailPreview.vue";
import SystemGeneratedImage from "./HelperComponents/SystemGeneratedImage.vue";
import UploadYourOwnTrailer from "./HelperComponents/UploadYourOwnTrailer.vue";
import NotificationCard from "@/components/dev/card/notification/NotificationCard.vue";

const props = defineProps({
  uploader: {
    type: Object,
    required: true,
  },
});

const showMobileTabs = ref(false);
const showNestedDropdown = ref(false);

// ===========================================
// FIX: Nested Substep Logic connected to Engine
// ===========================================

// Hum 'previewTrailerSource' state use kar rahe hain
// Values: 'siteGenerated' (System) | 'uploadOwn' (Upload)
const previewTrailerSourceModel = computed({
  get: () => props.uploader.state.previewTrailerSource || "siteGenerated",
  set: (val) => {
    props.uploader.setState("previewTrailerSource", val, { reason: "user:trailerSource" });
  }
});

// ===========================================
// Helper Functions
// ===========================================

function getStepLabel(step) {
  if (step === "chooseScreenshot") return "Choose screenshot";
  if (step === "usePlaceholder") return "Use placeholder";
  if (step === "uploadThumbnail") return "Upload your own thumbnail";
  return "";
}

function getStepIcon(step) {
  if (step === "chooseScreenshot") return "/images/ssIcon.png";
  if (step === "usePlaceholder") return "/images/placeholderIcon.png";
  if (step === "uploadThumbnail") return "/images/ssIcon.png";
  return "";
}

function getNestedLabel(val) {
  if (val === "siteGenerated") return "Use system generated trailer";
  if (val === "uploadOwn") return "Upload your own trailer";
  return "";
}

function getNestedIcon(val) {
  if (val === "siteGenerated") return "/images/ssIcon.png";
  if (val === "uploadOwn") return "/images/uploadIcon.png";
  return "";
}
</script>