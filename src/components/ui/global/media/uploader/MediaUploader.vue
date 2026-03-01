<template>
  <DashboardWrapperTwoColContainer>
    <div class=" ">
      <div class="flex-[00.5] bg-submenu-bg px-4 py-2 shadow-md backdrop-blur-lg hidden">
        Media
      </div>

      <div
        class="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <!-- head -->
        <div class="flex justify-between items-center px-[5px] py-[16px]">
          <h3 class="text-sm font-semibold leading-5 text-primary-text dark:text-text">
            Upload Media
          </h3>
          <img class="w-4 h-4 [pointer-events:none]" src="https://i.ibb.co.com/Mxvwrpbg/svgviewer-png-output-84.webp"
            alt="close" />
        </div>
        <!-- Step Header Navigation -->
        <div
          class="flex flex-row gap-2 justify-between items-center self-stretch overflow-x-auto list-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            class="text-xs md:flex-1 font-normal leading-[1.125rem] flex md:min-w-[5rem] flex-col items-center gap-2.5 md:px-2 md:py-2 transition-all duration-200 cursor-pointer flex-shrink-0"
            :class="uploader.step === 1
              ? 'border-b-2 border-black text-black dark:text-text'
              : 'border-b border-transparent text-gray-text'
              " @click="uploader.forceStep(1)">
            Preview Settings
          </button>

          <button
            class="text-xs md:flex-1 font-normal leading-[1.125rem] flex md:min-w-[5rem] flex-col items-center gap-2.5 md:px-2 md:py-2 transition-all duration-200 cursor-pointer flex-shrink-0"
            :class="uploader.step === 2
              ? 'border-b-2 border-black text-black'
              : 'border-b border-transparent text-gray-text'
              " @click="uploader.forceStep(2)">
            Subscription and P2V
          </button>

          <button
            class="text-xs md:flex-1 font-normal leading-[1.125rem] flex md:min-w-[5rem] flex-col items-center gap-2.5 md:px-2 md:py-2 transition-all duration-200 cursor-pointer flex-shrink-0"
            :class="uploader.step === 3
              ? 'border-b-2 border-black text-black'
              : 'border-b border-transparent text-gray-text'
              " @click="uploader.forceStep(3)">
            Media Details
          </button>

          <button
            class="text-xs md:flex-1 font-normal leading-[1.125rem] flex md:min-w-[5rem] flex-col items-center gap-2.5  md:px-2 md:py-2 transition-all duration-200 cursor-pointer flex-shrink-0"
            :class="uploader.step === 4
              ? 'border-b-2 border-black text-black'
              : 'border-b border-transparent text-gray-text'
              " @click="uploader.forceStep(4)">
            Publish & Sharing Settings
          </button>

          <button
            class="text-xs md:flex-1 font-normal leading-[1.125rem] flex md:min-w-[5rem] flex-col items-center gap-2.5  md:px-2 md:py-2 transition-all duration-200 cursor-pointer flex-shrink-0"
            :class="uploader.step === 5
              ? 'border-b-2 border-black text-black'
              : 'border-b border-transparent text-gray-text'
              " @click="uploader.forceStep(5)">
            Submit
          </button>
        </div>

        <!-- Step Content -->
        <div>
          <MediaUploaderStepPreviewSettings v-if="uploader.step === 1" :uploader="uploader" />

          <MediaUploaderStepSubscriptionP2v v-else-if="uploader.step === 2" :uploader="uploader" />

          <MediaUploaderStepMediaDetails v-else-if="uploader.step === 3" :uploader="uploader" />

          <MediaUploaderStepPublishAndSharing v-else-if="uploader.step === 4" :uploader="uploader" />

          <MediaUploaderStepSubmit v-else-if="uploader.step === 5" :uploader="uploader" />
        </div>

        <!-- debugSection (as requested) -->
        <!-- debugSection with Tailwind Classes -->
        <div class="debugSection grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 p-4 bg-gray-100 rounded-lg">
          <!-- Flow State Panel -->
          <div class="bg-white border border-gray-300 rounded-lg p-4 shadow-md">
            <h3 class="text-lg font-semibold text-gray-800 border-b-2 border-blue-500 pb-2 mb-4">
              Flow State
            </h3>
            <pre
              class="max-h-96 overflow-auto bg-slate-900 text-slate-200 p-4 rounded-md text-xs leading-relaxed">{{ JSON.stringify(uploader.state, null, 2) }}</pre>
          </div>

          <!-- Flow Logs Panel -->
          <div class="bg-white border border-gray-300 rounded-lg p-4 shadow-md">
            <h3 class="text-lg font-semibold text-gray-800 border-b-2 border-green-500 pb-2 mb-4">
              Flow Logs
            </h3>
            <pre
              class="max-h-96 overflow-auto bg-slate-900 text-green-400 p-4 rounded-md text-xs leading-relaxed font-mono">{{ uploader.logs.slice(-50).join("\n") }}</pre>
          </div>
        </div>
      </div>
    </div>
  </DashboardWrapperTwoColContainer>
</template>

<script>
import { onMounted } from "vue";
import {
  createStepStateEngine,
  attachEngineLogging,
} from "@/utils/stateEngine";

import MediaUploaderStepPreviewSettings from "./MediaUploaderStepPreviewSettings.vue";
import MediaUploaderStepSubscriptionP2v from "./MediaUploaderStepSubscriptionP2v.vue";
import MediaUploaderStepMediaDetails from "./MediaUploaderStepMediaDetails.vue";
import MediaUploaderStepPublishAndSharing from "./MediaUploaderStepPublishAndSharing.vue";
import MediaUploaderStepSubmit from "./MediaUploaderStepSubmit.vue";
import DashboardWrapperTwoColContainer from "@/components/dashboard/DashboardWrapperTwoColContainer.vue";

export default {
  name: "MediaUploader",

  components: {
    MediaUploaderStepPreviewSettings,
    MediaUploaderStepSubscriptionP2v,
    MediaUploaderStepMediaDetails,
    MediaUploaderStepPublishAndSharing,
    MediaUploaderStepSubmit,
    DashboardWrapperTwoColContainer,
  },

  setup() {
    const uploader = createStepStateEngine({
      flowId: "mediaUploader",
      urlSync: "query",
      initialStep: 1,
      forcePolicy: "log",
      defaults: {
        mediaType: "",
        mediaId: "",
        src: null,
        thumbnailOption: "siteDefaultPlaceholder",
        thumbnailUrl: "",
        blurThumbnail: false,
        blurThumbnailLevel: "low",
        showPreviewTrailer_Screenshot: false,
        showPreviewTrailer_Placeholder: false,
        showPreviewTrailer_Upload: false,
        uploadedThumbnailFile: null,
        previewTrailerSource: "siteGenerated",
        previewTrailerUrl: "",
        linkToSubscriptionPlan: false,
        subscriptionPlanIds: [],
        postToSocials_Immediate: false, 
        postToSocials_Schedule: false,
        payToViewEnabled: false,
        payToViewOriginalPrice: null,
        payToViewDiscountedPrice: null,
        mediaTitle: "",
        description: "",
        tags: [],
        coPerformerIds: [],
        publishType: "publishImmediatelyAfterApproval",
        scheduledPublishDateTime: "",
        featureOnComingSoon: false,
        preOrderPrice: null,
        postToSocialsOnPublish: false,
        socialPostMessage: "",
        socialThumbnailMode: "useOriginal",
        socialThumbnailCustomImageSrc: "",
        socialThumbnailCustomVideoSrc: "",
        showOnDiscoveryPage: false,
        showOnProfilePage: false,
        termsCheckbox1: false,
        termsCheckbox2: false,
        termsCheckbox3: false,
        termsCheckbox4: false,
        termsCheckbox5: false,
      },
    });

    attachEngineLogging(uploader);

    onMounted(() => {
      uploader.initialize({ fromUrl: true });
    });

    return { uploader };
  },
};
</script>
