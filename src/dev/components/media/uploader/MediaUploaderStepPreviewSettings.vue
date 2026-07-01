<script setup>
import { ref, computed } from "vue";
import DashboardPrimaryButton from "@/components/ui/buttons/DashboardPrimaryButton.vue";
import TrailerSetting from "./parts/TrailerSetting.vue";
import VideoThumbnailSelector from "./parts/VideoThumbnailSelector.vue";
import FileUploadPlaceholder from "./parts/FileUploadPlaceholder.vue";
import ThumbnailUploader from "./parts/ThumbnailUploader.vue";
import UploadThumbnailPreview from "./parts/UploadThumbnailPreview.vue";
import SystemGeneratedImage from "./parts/SystemGeneratedImage.vue";
import UploadYourOwnTrailer from "./parts/UploadYourOwnTrailer.vue";
import NotificationCard from "@/components/ui/card/dashboard/NotificationCard.vue";
import { CheckCircleIcon } from "@heroicons/vue/24/solid";
import { useMediaUploaderStore } from "@/stores/useMediaUploaderStore";
import { watch } from "vue";

const uploaderStore = useMediaUploaderStore();
const showMobileTabs = ref(false);
const showNestedDropdown = ref(false);
const showSuccessToast = ref(false);

// ===========================================
// TOAST LOGIC: Watch for Video Upload
// ===========================================
watch(() => uploaderStore.form.previewTrailerUrl, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    showSuccessToast.value = true;
    setTimeout(() => {
      showSuccessToast.value = false;
    }, 4000); // 4 seconds auto-hide
  }
});

// ===========================================
// FIX: Nested Substep Logic connected to Engine
// ===========================================

const previewTrailerSourceModel = computed({
  get: () => uploaderStore.form.previewTrailerSource || "siteGenerated",
  set: (val) => {
    uploaderStore.updateFormField("previewTrailerSource", val);
  }
});

// ===========================================
// Helper Functions
// ===========================================

function getStepLabel(step) {
  if (step === "chooseScreenshot") return "Choose screenshot";
  if (step === "usePlaceholder") return "Use placeholder";
  if (step === "uploadThumbnail") return "Upload your own thumbnail";
  return "Choose screenshot";
}

function getStepIcon(step) {
  if (step === "chooseScreenshot") return "/images/ssIcon.png";
  if (step === "usePlaceholder") return "/images/placeholderIcon.png";
  if (step === "uploadThumbnail") return "/images/ssIcon.png";
  return "/images/ssIcon.png";
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

<template>
  <div class="relative py-[16px] px-[8px] lg:px-[24px] flex flex-col gap-4">
    <div class="flex gap-2 items-center ">
      <img src="/images/backIcon.png" alt="" srcset="" />
      <button class="text-xs font-medium leading-[1.125rem] text-medium-text break-words">
        Back
      </button>
    </div>

    <h4 class="text-[#667085] text-sm font-[700] leading-normal not-italic">
      Thumbnail Settings
    </h4>

    <div
      class="border border-border-light w-full flex-row items-s tretch overflow-x-auto rounded-[0.313rem] bg-secondary-bg hidden md:flex"
      style="scrollbar-width: none; -ms-overflow-style: none">
      <div @click="uploaderStore.setSubstep('chooseScreenshot')" :class="[
        'border-r flex flex-1 flex-shrink-0 min-w-fit items-center px-4 py-2 justify-center gap-2 border-border-light cursor-pointer',
        uploaderStore.substep === 'chooseScreenshot' ? 'bg-dark-text text-white' : '',
      ]">
        <img src="/images/ssIcon.png" alt="" class="flex-shrink-0" />
        <button :class="uploaderStore.substep === 'chooseScreenshot' ? 'text-white' : 'text-secondary-text'">
          Choose screenshot
        </button>
      </div>

      <div @click="uploaderStore.setSubstep('usePlaceholder')" :class="[
        'flex flex-shrink-0 flex-1 min-w-fit border-r items-center px-4 py-2 justify-center gap-2 border-border-light cursor-pointer',
        uploaderStore.substep === 'usePlaceholder' ? 'bg-dark-text text-white' : 'text-secondary-text',
      ]">
        <img src="/images/placeholderIcon.png" alt="" class="flex-shrink-0" />
        <button :class="uploaderStore.substep === 'usePlaceholder' ? 'text-white' : ''">
          Use placeholder
        </button>
      </div>

      <div @click="uploaderStore.setSubstep('uploadThumbnail')" :class="[
        'flex flex-shrink-0 flex-1 min-w-fit border-r items-center px-4 py-2 justify-center gap-2 border-border-light cursor-pointer',
        uploaderStore.substep === 'uploadThumbnail' ? 'bg-dark-text text-white' : 'text-secondary-text',
      ]">
        <img src="/images/uploadIcon.png" alt="" class="flex-shrink-0" />
        <button :class="uploaderStore.substep === 'uploadThumbnail' ? 'text-white' : ''">
          Upload your own thumbnail
        </button>
      </div>
    </div>

    <div class="md:hidden border border-border-light rounded-md bg-secondary-bg">
      <div @click="showMobileTabs = !showMobileTabs"
        class="px-4 py-2 border-b border-border-light cursor-pointer flex justify-center items-center gap-2 bg-dark-text text-white">
        <img :src="getStepIcon(uploaderStore.substep)" alt="" class="w-5 h-5" />
        <span class="text-sm sm:text-[16px]">{{ getStepLabel(uploaderStore.substep) }}</span>
        <img src="/images/chevron-down.webp" alt="" class="w-3 h-3" />
      </div>

      <div v-if="showMobileTabs" class="flex flex-col">
        <div @click="uploaderStore.setSubstep('chooseScreenshot'); showMobileTabs = false;"
          class="px-4 py-2 text-sm sm:text-[16px] flex items-center gap-2 border-b border-border-light cursor-pointer text-secondary-text">
          <img src="/images/ssIcon.png" alt="" class="w-5 h-5" />
          Choose screenshot
        </div>
        <div @click="uploaderStore.setSubstep('usePlaceholder'); showMobileTabs = false;"
          class="px-4 py-2 text-sm sm:text-[16px] flex items-center gap-2 border-b border-border-light cursor-pointer text-secondary-text">
          <img src="/images/placeholderIcon.png" alt="" class="w-5 h-5" />
          Use placeholder
        </div>
        <div @click="uploaderStore.setSubstep('uploadThumbnail'); showMobileTabs = false;"
          class="px-4 py-2 text-sm sm:text-[16px] flex items-center gap-2 border-b border-border-light cursor-pointer text-secondary-text">
          <img src="/images/ssIcon.png" alt="" class="w-5 h-5" />
          Upload your own thumbnail
        </div>
      </div>
    </div>

    <div class="w-full" v-if="uploaderStore.substep === 'chooseScreenshot'">
      <div class="w-full">
        <VideoThumbnailSelector />
      </div>

      <h4 class="text-[#667085] text-sm font-[700] leading-normal not-italic pt-[24px] pb-[16px]">
        Trailer Settings
      </h4>

      <div class="mb-[100px]">
        <TrailerSetting stateKey="showPreviewTrailer_Screenshot" />
      </div>
    </div>

    <div v-else-if="uploaderStore.substep === 'usePlaceholder'">
      <div >
        <FileUploadPlaceholder />

        <h4 class="text-[#667085] text-sm font-[700] leading-normal not-italic pt-[24px] pb-[16px] w-max-">
          Trailer Settings
        </h4>
        <div class="mb-[16px]">
          <TrailerSetting stateKey="showPreviewTrailer_Placeholder" />
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

        <div v-if="previewTrailerSourceModel === 'siteGenerated'" class="w-full md:w-1/2">
          <div class="mt-4 text-gray-700">
            <SystemGeneratedImage />
          </div>
        </div>

        <div v-else-if="previewTrailerSourceModel === 'uploadOwn'" class="w-full">
          <div class="mt-4 mb-[50px]">
            <ThumbnailUploader 
              v-if="!uploaderStore.form.previewTrailerUrl"
              subtitle="or drag and drop video file here"
              fileInfo="MP4, AVI, MOV, WEBM, JPEG, PNG. (Max. 2000MB)" 
              accept="video/*,image/*"
              stateUrlKey="previewTrailerUrl"
              stateFileKey="uploadedTrailerFile"
            />
            <div v-if="uploaderStore.form.previewTrailerUrl" class="w-full md:w-1/2 mt-4 flex flex-col gap-2">
              <UploadYourOwnTrailer />
            </div>

            <!-- Toast Success Notification (Top Right Popup) -->
            <Teleport to="body">
              <div v-if="showSuccessToast" class="fixed top-6 right-6 z-[9999] w-[350px] pointer-events-auto animate-in fade-in slide-in-from-right duration-300">
                <NotificationCard 
                  variant="success-teal" 
                  title="Successfully uploaded new video."
                  :closable="false"
                  :icon="CheckCircleIcon"
                />
              </div>
            </Teleport>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="uploaderStore.substep === 'uploadThumbnail'">
      <div class="">
        <ThumbnailUploader />
        <div class="mt-6">
          <UploadThumbnailPreview bgImage="/images/slide-2.webp" deleteIcon="/images/delete(2).png" expandIcon=""
          :showLabel="false" :showBlurToggle="true" :preloadImages="['/images/slide-2.webp', '/images/delete(2).png']" />
        </div>
        <h4 class="text-[#667085] text-sm font-[700] leading-normal not-italic pt-[24px] pb-[16px]">
          Trailer Settings
        </h4>
        <div class="mb-[50px]">
          <TrailerSetting stateKey="showPreviewTrailer_Upload" />
        </div>
      </div>
    </div>

    <div class="flex justify-end md:mt-0 mt-4" @click="uploaderStore.setStep(2)">
      <DashboardPrimaryButton text="Next" variant="polygonLeft"
        :rightIcon="'https://i.ibb.co/hx8ztZFf/svgviewer-png-output-8.webp'" btnBg="#07f468" btnHoverBg="black"
        btnText="black" btnHoverText="#07f468" />
    </div>
  </div>
</template>