<script setup>
import { ref, computed } from "vue";
import NotificationCard from "@/components/ui/card/dashboard/NotificationCard.vue";
import CheckboxSwitch from "@/components/forms/checkboxes/CheckboxSwitch.vue";
import PublishDatePicker from "./parts/PublishDatePicker.vue";
import CheckboxGroup from "@/components/forms/checkboxes/CheckboxGroup.vue";
import DashboardPrimaryButton from "@/components/ui/buttons/DashboardPrimaryButton.vue";
import BaseInput from "@/components/forms/inputs/BaseInput.vue";
import RadioGroup from "@/components/forms/radio/dashboard/RadioGroup.vue";
import PostPreview from "./parts/PostPreview.vue";
import BaseParagraph from "@/components/ui/typography/BaseParagraph.vue";
import BaseTextInput from "@/components/forms/inputs/BaseTextInput.vue";
import ThumbnailUploader from "./parts/ThumbnailUploader.vue";
import SocialCustomPreview from "./parts/SocialCustomPreview.vue";
import { useMediaUploaderStore } from "@/stores/useMediaUploaderStore";

const uploaderStore = useMediaUploaderStore();

// Mobile dropdown
const showPublishDropdown = ref(false);

// Dropdown Label Logic
function getPublishLabel(step) {
  switch (step) {
    case "publishImmediately": return "Publish immediately after approval";
    case "schedulePublish": return "Schedule a publish time";
    default: return "Select an option";
  }
}

// ===============================================
// STATE CONNECTIONS (Logic Bridge) 🌉
// ===============================================

// 1. Post to X (Immediate Tab)
const postToSocialsImmediateModel = computed({
  get: () => uploaderStore.form.postToSocials_Immediate || false,
  set: (val) => uploaderStore.updateFormField("postToSocials_Immediate", val)
});

// 2. Post to X (Schedule Tab)
const postToSocialsScheduleModel = computed({
  get: () => uploaderStore.form.postToSocials_Schedule || false,
  set: (val) => uploaderStore.updateFormField("postToSocials_Schedule", val)
});

// 2. Social Message (Textarea)
const socialMessageModel = computed({
  get: () => uploaderStore.form.socialPostMessage || "",
  set: (val) => uploaderStore.updateFormField("socialPostMessage", val)
});

// 3. Social Thumbnail Mode (Radio Group)
// Values: 'useOriginal', 'useCustom', 'none'
const socialThumbnailModeModel = computed({
  get: () => uploaderStore.form.socialThumbnailMode || "useOriginal",
  set: (val) => uploaderStore.updateFormField("socialThumbnailMode", val)
});

// 4. Schedule Date (Date Picker)
const scheduleDateModel = computed({
  get: () => uploaderStore.form.scheduledPublishDateTime || "",
  set: (val) => uploaderStore.updateFormField("scheduledPublishDateTime", val)
});

// 5. Feature on Coming Soon (Checkbox)
const featureOnComingSoonModel = computed({
  get: () => uploaderStore.form.featureOnComingSoon || false,
  set: (val) => uploaderStore.updateFormField("featureOnComingSoon", val)
});

// 6. Preorder Price (Input)
const preOrderPriceModel = computed({
  get: () => uploaderStore.form.preOrderPrice,
  set: (val) => uploaderStore.updateFormField("preOrderPrice", val)
});

// Options for Radio Group
const transferTypeOptions = [
  { value: "useOriginal", label: "Use original thumbnail and preview" },
  { value: "useCustom", label: "Upload a different thumbnail and preview" },
  { value: "none", label: "Do not attach thumbnail and preview" },
];
</script>

<template>
  <div class="relative py-[16px] px-[10px] lg:px-[24px]">

    <div class="mb-[50px]">
      <div @click="uploaderStore.setStep(3)" class="flex gap-2 items-center cursor-pointer">
        <img src="/images/backIcon.png" alt="" srcset="" />
        <button class="text-xs font-medium leading-[1.125rem] text-medium-text break-words">
          Back
        </button>
      </div>

      <h4 class="text-[#667085] text-sm font-[700] leading-normal not-italic my-[10px]">
        When do you like to publish this media?
      </h4>

      <div
        class="[scrollbar-width: none] border border-border-light flex-row items-stretch overflow-x-auto whitespace-nowrap rounded-[0.313rem] bg-secondary-bg hidden md:flex">
        <button @click="uploaderStore.setSubstep('publishImmediately')"
          :class="['border-r flex flex-1 items-center px-4 py-2 justify-center gap-2 border-border-light cursor-pointer', uploaderStore.substep === 'publishImmediately' ? 'bg-dark-text text-white' : '']">
          <img src="/images/publish-icon.png" alt="" />
          Publish immediately after approval
        </button>

        <button @click="uploaderStore.setSubstep('schedulePublish')"
          :class="['border-r flex flex-1 items-center px-4 py-2 justify-center gap-2 border-border-light cursor-pointer', uploaderStore.substep === 'schedulePublish' ? 'bg-dark-text text-white' : '']">
          <img src="/images/schedule-icon.png" alt="" />
          Schedule a publish time
        </button>
      </div>

      <div class="md:hidden border border-border-light rounded-md bg-secondary-bg">
        <div @click="showPublishDropdown = !showPublishDropdown"
          class="px-4 py-2 text-xs sm:text-[16px] border-b border-border-light cursor-pointer flex justify-center items-center gap-2 bg-dark-text text-white">
          <span>{{ getPublishLabel(uploaderStore.substep) }}</span>
          <img src="/images/chevron-down.webp" class="w-3 h-3" alt="" />
        </div>

        <div v-if="showPublishDropdown" class="flex flex-col">
          <div @click="uploaderStore.setSubstep('publishImmediately'); showPublishDropdown = false;"
            class="px-4 py-2 text-xs sm:text-[16px] flex items-center gap-2 border-b border-border-light cursor-pointer text-secondary-text">
            <img src="/images/publish-icon.png" class="w-4 h-4" alt="" />
            Publish immediately after approval
          </div>

          <div @click="uploaderStore.setSubstep('schedulePublish'); showPublishDropdown = false;"
            class="px-4 py-2 text-xs sm:text-[16px] flex items-center gap-2 border-b border-border-light cursor-pointer text-secondary-text">
            <img src="/images/schedule-icon.png" class="w-4 h-4" alt="" />
            Schedule a publish time
          </div>
        </div>
      </div>

      <!-- substep 1 -->
      <div v-if="uploaderStore.substep === 'publishImmediately'">
        <div class="text-[#303437] text-[14px] mt-4 mb-6">
          We will publish the media according to your subscription and Pay to view preference. It will usually take 2
          working days.
        </div>

        <div>
          <h4 class="text-[#667085] text-sm font-[700] leading-normal not-italic my-[10px]">
            Share Settings
          </h4>

          <CheckboxSwitch label="Post to X when my media is published" id="publish-media-toggle-imm"
            v-model="postToSocialsImmediateModel" />
 
          <div v-if="postToSocialsImmediateModel">
            <div class="flex justify-between gap-[24px]">
              <div class="flex-1">
                <div class="mt-4 mb-4 flex flex-col gap-2">
                  <div class="text-[14px] font-[600] tetxt-[#0C111D]">
                    Post Message (Leave blank to use system default message.)
                  </div>
  
                  <BaseInput type="textarea" v-model="socialMessageModel"
                    placeholder="Don’t miss out—check this exclusive content and be the first to experience it!"
                    :maxLength="1000"
                    inputClass="bg-white/50 w-full px-3 py-3 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300 text-[16px] resize-none overflow-hidden placeholder:whitespace-normal" />
  
                </div>
  
                <div>
                  <RadioGroup v-model="socialThumbnailModeModel" name="socialMode" label="Attach Media"
                    :options="transferTypeOptions" version="dashboard" :radio-label-class="`relative text-[0.938rem] font-medium leading-6 text-black pl-8 cursor-pointer
                      before:content-[''] before:w-5 before:h-5 before:rounded-full before:border before:border-radio-border before:bg-white 
                      before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 peer-checked:before:bg-black 
                      after:content-[''] after:w-[0.375rem] after:h-[0.375rem] after:rounded-full after:bg-success 
                      after:absolute after:left-[0.4375rem] after:top-1/2 after:-translate-y-1/2 
                      peer-checked:after:block after:hidden
                    `" />
                </div>
              </div>
  
              <div class="hidden md:flex">
                <PostPreview />
              </div>
            </div>
  
            <div v-if="socialThumbnailModeModel === 'useCustom'" class="md:flex justify-between gap-4 mt-4">
              <div class="w-full">
                <SocialCustomPreview 
                  v-if="uploaderStore.form.socialThumbnailCustomImageSrc"
                  :src="uploaderStore.form.socialThumbnailCustomImageSrc"
                  label="Thumbnail"
                  type="image"
                  @preview-delete="uploaderStore.updateFormField('socialThumbnailCustomImageSrc', '')"
                />
                <ThumbnailUploader v-else subtitle="or drag and drop thumbnail image"
                  fileInfo="SVG, PNG, JPG or GIF (max. 800x400px)" stateUrlKey="socialThumbnailCustomImageSrc"
                  stateFileKey="socialThumbnailCustomImageFile" />
              </div>
              <div class="w-full mt-2 md:mt-0">
                <SocialCustomPreview 
                  v-if="uploaderStore.form.socialThumbnailCustomVideoSrc"
                  :src="uploaderStore.form.socialThumbnailCustomVideoSrc"
                  label="Trailer"
                  type="video"
                  @preview-delete="uploaderStore.updateFormField('socialThumbnailCustomVideoSrc', '')"
                />
                <ThumbnailUploader v-else subtitle="or drag and drop trailer file"
                  fileInfo="MP3, MP4, AVI, QUICKTIME, X-MATROSKA, X-MS-WMV, WEBM, OGG. (Max. 2000MB)"
                  stateUrlKey="socialThumbnailCustomVideoSrc" stateFileKey="socialThumbnailCustomVideoFile"
                  accept="video/*" />
              </div>
            </div>
  
            <div class="md:hidden mt-2">
              <PostPreview />
            </div>
  
            <div class="my-4">
              <NotificationCard variant="notice"
                title="You must connect to your X account before using auto repost feature." linkHref="#"
                :showIcon="false" :closable="false">
                <button class="py-1 px-2 w-max bg-[#22CCEE] text-[12px] text-[#FFFFFF]">
                  Connect X account
                </button>
              </NotificationCard>
            </div>
          </div>
        </div>
      </div>
      <!-- substep 2 -->
      <div v-else-if="uploaderStore.substep === 'schedulePublish'">

        <PublishDatePicker v-model="scheduleDateModel" label="Set date and time for publishing:"
          message="Date must be minimum 2 days ahead." />

        <div class="mt-4 mb-4 flex gap-2 items-center">
          <CheckboxGroup label="Feature this media on ‘coming soon’ section" v-model="featureOnComingSoonModel"
            checkboxClass="appearance-none bg-white border border-gray-300 rounded-[4px] w-3 h-3 cursor-pointer checked:bg-success checked:border-success checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border-black checked:after:border-[2px] checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:rotate-45 checked:after:box-border"
            labelClass="text-[16px] text-[#000] font-[500] cursor-pointer" wrapperClass="flex items-center" />
          <div class="relative group">
            <img src="/images/info-icon.png" alt="" class="cursor-pointer" />
            <div
              class="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-[#555b67] text-[#ffffff] text-xs px-3 py-2 shadow-lg z-50 w-[280px] rounded-[8px]">
              This media will be added to the ‘coming soon’ section on your profile media page.
            </div>
          </div>
        </div>

        <div>
          <div class="ml-6">
            <BaseParagraph text="Preorder price (Optional)" font-size="text-[14px]" font-weight="font-[400]"
              font-color="text-[#667085]" />
          </div>

          <div class="sm:w-[380px] ml-6">
            <BaseTextInput id="input_preorder" type="number" show-label :modelValue="preOrderPriceModel"
              @update:modelValue="(val) => {
                preOrderPriceModel = val;
              }" label-text="" rightSpan :rightSpanText="'USD'" />
          </div>
          <ul class="list-disc ml-[40px] text-[14px] text-[#475467] mt-2">
            <li>Offer special offer to fans who pre orders this media.</li>
            <li>Leave blank to disable feature.</li>
          </ul>
        </div>

        <div>
          <h4 class="text-[#667085] text-sm font-[700] leading-normal not-italic mb-[12px] mt-[20px]">
            Share Settings
          </h4>
 
          <CheckboxSwitch label="Post to X when my media is published" id="publish-media-toggle-sched"
            v-model="postToSocialsScheduleModel" />
 
          <div v-if="postToSocialsScheduleModel">
            <div class="flex justify-between gap-[24px]">
              <div class="flex-1">
                <div class="mt-4 mb-4 flex flex-col gap-2">
                  <div class="text-[14px] font-[600] tetxt-[#0C111D]">
                    Post Message (Leave blank to use system default message.)
                  </div>
  
                  <BaseInput type="textarea" v-model="socialMessageModel"
                    placeholder="Don’t miss out—check this exclusive content and be the first to experience it!"
                    :maxLength="1000"
                    inputClass="bg-white/50 w-full px-3 py-3 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300 text-[16px] resize-none overflow-hidden placeholder:whitespace-normal" />
  
                </div>
  
                <div>
                  <RadioGroup v-model="socialThumbnailModeModel" name="socialMode2" label="Attach Media"
                    :options="transferTypeOptions" version="dashboard" :radio-label-class="`relative text-[0.938rem] font-medium leading-6 text-black pl-8 cursor-pointer
                      before:content-[''] before:w-5 before:h-5 before:rounded-full before:border before:border-radio-border before:bg-white 
                      before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 peer-checked:before:bg-black 
                      after:content-[''] after:w-[0.375rem] after:h-[0.375rem] after:rounded-full after:bg-success 
                      after:absolute after:left-[0.4375rem] after:top-1/2 after:-translate-y-1/2 
                      peer-checked:after:block after:hidden
                    `" />
                </div>
              </div>
  
              <div class="hidden md:flex">
                <PostPreview />
              </div>
            </div>
  
            <div v-if="socialThumbnailModeModel === 'useCustom'" class="md:flex justify-between gap-4 mt-4">
              <div class="w-full">
                <SocialCustomPreview 
                  v-if="uploaderStore.form.socialThumbnailCustomImageSrc"
                  :src="uploaderStore.form.socialThumbnailCustomImageSrc"
                  label="Thumbnail"
                  type="image"
                  @preview-delete="uploaderStore.updateFormField('socialThumbnailCustomImageSrc', '')"
                />
                <ThumbnailUploader v-else subtitle="or drag and drop thumbnail image"
                  fileInfo="SVG, PNG, JPG or GIF (max. 800x400px)" stateUrlKey="socialThumbnailCustomImageSrc"
                  stateFileKey="socialThumbnailCustomImageFile" />
              </div>
              <div class="w-full mt-2 md:mt-0">
                <SocialCustomPreview 
                  v-if="uploaderStore.form.socialThumbnailCustomVideoSrc"
                  :src="uploaderStore.form.socialThumbnailCustomVideoSrc"
                  label="Trailer"
                  type="video"
                  @preview-delete="uploaderStore.updateFormField('socialThumbnailCustomVideoSrc', '')"
                />
                <ThumbnailUploader v-else subtitle="or drag and drop trailer file"
                  fileInfo="MP3, MP4, AVI, QUICKTIME, X-MATROSKA, X-MS-WMV, WEBM, OGG. (Max. 2000MB)"
                  stateUrlKey="socialThumbnailCustomVideoSrc" stateFileKey="socialThumbnailCustomVideoFile"
                  accept="video/*" />
              </div>
            </div>
  
            <div class="md:hidden mt-2">
              <PostPreview />
            </div>
  
            <div class="my-4">
              <NotificationCard variant="notice"
                title="You must connect to your X account before using auto repost feature." linkHref="#"
                :showIcon="false" :closable="false">
                <button class="py-1 px-2 w-max bg-[#22CCEE] text-[12px] text-[#FFFFFF]">
                  Connect X account
                </button>
              </NotificationCard>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end md:mt-0 mt-4" @click="uploaderStore.setStep(5)">
      <DashboardPrimaryButton text="Next" variant="polygonLeft"
        :rightIcon="'https://i.ibb.co/hx8ztZFf/svgviewer-png-output-8.webp'" btnBg="#07f468" btnHoverBg="black"
        btnText="black" btnHoverText="#07f468" />
    </div>
  </div>
</template>