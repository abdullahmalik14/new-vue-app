<template>
  <DashboardSharedTwoColLayout>
    <div class=" ">
      <div class="flex-[00.5] bg-submenu-bg px-4 py-2 shadow-md backdrop-blur-lg hidden">
        Media
      </div>

      <div
        class="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <!-- head -->
        <div class="flex justify-between items-center px-[24px] py-[16px]">
          <h3 class="text-sm font-semibold leading-5 text-primary-text dark:text-text">
            Upload Media
          </h3>
          <img class="w-4 h-4 [pointer-events:none]" src="https://i.ibb.co.com/Mxvwrpbg/svgviewer-png-output-84.webp"
            alt="close" />
        </div>
        <!-- Step Header Navigation -->
        <div class="relative pb-[2px]">
          <!-- Force White Track Line -->
          <div class="absolute bottom-0 left-0 w-full h-[2px] bg-white" style="background-color: #ffffff !important;"></div>
          
          <div
            class="relative z-10 flex flex-row gap-5 justify-between items-center self-stretch overflow-x-auto list-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              class="text-xs md:flex-1 leading-[1.125rem] flex md:min-w-[5rem] flex-col items-center gap-2.5 md:px-2 md:py-2 transition-all duration-200 cursor-pointer flex-shrink-0"
              :class="uploaderStore.step === 1 
                ? 'border-b-2 border-black text-black dark:text-text font-[600]' 
                : 'text-gray-500'
                " @click="uploaderStore.setStep(1)">
              Preview Settings
            </button>
  
            <button
              class="text-xs md:flex-1 leading-[1.125rem] flex md:min-w-[5rem] flex-col items-center gap-2.5 md:px-2 md:py-2 transition-all duration-200 cursor-pointer flex-shrink-0"
              :class="uploaderStore.step === 2
                ? 'border-b-2 border-black text-black font-[600]'
                : 'text-gray-500'
                " @click="uploaderStore.setStep(2)">
              Subscription and P2V
            </button>
  
            <button
              class="text-xs md:flex-1 leading-[1.125rem] flex md:min-w-[5rem] flex-col items-center gap-2.5 md:px-2 md:py-2 transition-all duration-200 cursor-pointer flex-shrink-0"
              :class="uploaderStore.step === 3
                ? 'border-b-2 border-black text-black font-[600]'
                : 'text-gray-500'
                " @click="uploaderStore.setStep(3)">
              Media Details
            </button>
  
            <button
              class="text-xs md:flex-1 leading-[1.125rem] flex md:min-w-[5rem] flex-col items-center gap-2.5  md:px-2 md:py-2 transition-all duration-200 cursor-pointer flex-shrink-0"
              :class="uploaderStore.step === 4
                ? 'border-b-2 border-black text-black font-[600]'
                : 'text-gray-500'
                " @click="uploaderStore.setStep(4)">
              Publish & Sharing Settings
            </button>
  
            <button
              class="text-xs md:flex-1 leading-[1.125rem] flex md:min-w-[5rem] flex-col items-center gap-2.5  md:px-2 md:py-2 transition-all duration-200 cursor-pointer flex-shrink-0"
              :class="uploaderStore.step === 5
                ? 'border-b-2 border-black text-black font-[600]'
                : 'text-gray-500'
                " @click="uploaderStore.setStep(5)">
              Submit
            </button>
          </div>
        </div>

        <!-- Step Content -->
        <div>
          <MediaUploaderStepPreviewSettings v-if="uploaderStore.step === 1" />

          <MediaUploaderStepSubscriptionP2v v-else-if="uploaderStore.step === 2" />

          <MediaUploaderStepMediaDetails v-else-if="uploaderStore.step === 3" />

          <MediaUploaderStepPublishAndSharing v-else-if="uploaderStore.step === 4" />

          <MediaUploaderStepSubmit v-else-if="uploaderStore.step === 5" />
        </div>

        <!-- debugSection -->
        <div class="debugSection grid grid-cols-1 gap-4 mt-8 p-4 bg-gray-100 rounded-lg">
          <div class="bg-white border border-gray-300 rounded-lg p-4 shadow-md">
            <h3 class="text-lg font-semibold text-gray-800 border-b-2 border-blue-500 pb-2 mb-4">
              Pinia Store State
            </h3>
            <pre
              class="max-h-96 overflow-auto bg-slate-900 text-slate-200 p-4 rounded-md text-xs leading-relaxed">{{ JSON.stringify({ step: uploaderStore.step, substep: uploaderStore.substep, form: uploaderStore.form }, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </DashboardSharedTwoColLayout>
</template>

<script setup>
import { onMounted } from "vue";
import { useMediaUploaderStore } from "@/stores/useMediaUploaderStore";

import MediaUploaderStepPreviewSettings from "./MediaUploaderStepPreviewSettings.vue";
import MediaUploaderStepSubscriptionP2v from "./MediaUploaderStepSubscriptionP2v.vue";
import MediaUploaderStepMediaDetails from "./MediaUploaderStepMediaDetails.vue";
import MediaUploaderStepPublishAndSharing from "./MediaUploaderStepPublishAndSharing.vue";
import MediaUploaderStepSubmit from "./MediaUploaderStepSubmit.vue";
import DashboardWrapperTwoColContainer from "@/dev/templates/dashboard/shared/DashboardSharedTwoColLayout.vue";

const uploaderStore = useMediaUploaderStore();

onMounted(() => {
  uploaderStore.initializeFromUrl();
});
</script>
