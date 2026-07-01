<template>
  <!-- Main Media Upload Container -->
  <div
    v-if="!hideUploader"
    ref="componentRef"
    :data-media-upload="mediaType"
    :class="'flex-col ' + effectiveCustomClass"
    :data-max-size="maxSize"
    :data-allowed-types="allowedTypes"
    :data-upload-immediately="uploadImmediately ? '1' : '0'"
    :data-save-to-media-library="saveToMediaLibrary ? '1' : '0'"
    :data-edit-profile="editProfile ? '1' : '0'"
    :data-is-profile-avatar="isProfileAvatar ? '1' : '0'"
    :data-show-error="showError ? '1' : '0'"
    :data-generate-resized-images="generateResizedImages ? '1' : '0'"
    :data-enable-image-compression="enableImageCompression ? '1' : '0'"
    :style="'--media-uploader-main-color: ' + mainColor + ';'"
  >

  
    <!-- Profile Image Upload (Edit Profile Mode) -->
    <div v-if="editProfile && !isProfileAvatar" class="p-6 flex justify-center items-center">
      <div
        class="w-48 h-48 md:w-44 md:h-44 sm:w-32 sm:h-32 rounded-full flex justify-center items-center relative bg-pink-400"
        :style="profileColorScheme ? 'background-color: ' + profileColorScheme + ';' : ''"
        :class="profileColorScheme ? '' : 'bg-pink-400'"
      >
        <!-- Profile Image or Placeholder -->
        <div class="w-full h-full flex items-center justify-center">
          <svg
            v-if="!profileImage"
            class="w-full h-full object-cover rounded-full"
            xmlns="http://www.w3.org/2000/svg"
            width="162"
            height="162"
            viewBox="0 0 162 162"
            fill="none"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M103.02 122.108L68.0332 125.97C61.0982 126.738 55.9488 119.7 58.7519 113.326L65.5208 97.9009C67.6179 93.1259 65.1055 87.6451 61.0982 84.3026C55.6997 79.8182 51.9622 73.2993 51.1317 65.7632C49.4291 50.2756 60.5791 36.3659 76.0479 34.6635C91.5167 32.9611 105.449 44.1096 107.152 59.5764C108.003 67.2787 105.657 74.5865 101.192 80.1919C97.9118 84.3441 96.5622 90.3647 99.6975 94.6207L109.332 107.742C113.464 113.368 109.955 121.361 103.02 122.108Z"
              fill="#DEE5EC"
            ></path>
          </svg>
          <img v-else :src="profileImage" alt="" class="w-full h-full object-cover rounded-full" />
        </div>

        <!-- Edit Icon -->
        <div
          class="absolute bottom-0 right-0 w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-green-500 flex items-center justify-center cursor-pointer"
        >
          <img
            :src="'https://fansocial.app/wp-content/plugins/fansocial/assets/icons/svg/edit-pencil-black.svg'"
            alt=""
            class="w-8 h-8 filter brightness-0"
          />
        </div>
      </div>
    </div>

    <!-- Regular Upload Interface -->
    <div
      v-if="!editProfile"
      data-media-upload-input-wrap=""
      :media-upload-id="effectiveInputName"
      :class="'flex flex-col gap-4 justify-center w-full self-stretch ' + inputWrapperClass"
    >
      <!-- Upload Button Area -->
      <div :class="buttonParentWrapperClass">
        <div :class="buttonWrapperClass">

          <!-- File Input -->
          <input
            data-media-upload-input=""
            :name="effectiveInputName"
            type="file"
            class="absolute z-20 opacity-0 h-full w-full cursor-pointer"
            :accept="acceptAttribute"
            :multiple="multipleAttribute"
            :required="inputRequired"
          />

          <!-- Upload Icon/Button -->
          <span v-if="showButtonIcon" :class="buttonIconWrapperClass">
            <img
              :src="'https://fansocial.app/wp-content/plugins/fansocial/assets/icons/svg/upload-cloud-02.svg'"
              :alt="buttonIconName"
              class="w-5 h-5 filter brightness-0 invert"
            />
          </span>

          <!-- Hidden Inputs for Data Storage -->
          <input type="hidden" :name="'media_urls_' + effectiveInputName" value="" media_urls="" />
          <input type="hidden" name="media_id" :value="mediaId || ''" data-uploaded-library-id="" />
          <input type="hidden" name="visibility" :value="visibility" data-uploaded-media-visibility="" />
          <input type="hidden" :name="effectiveInputName" value="[]" data-uploaded-data="" />
          <input type="hidden" value="" media-data="" data-aws-respon="" />
          <input type="hidden" value="" data-aws-json="" />
        </div>

        <!-- Upload Text -->
        <div :class="dropTextClass">
          <span :class="buttonTextClass" data-click-to-upload="">{{ buttonText }}</span>
          <span v-if="dropText">{{ dropText }}</span>
        </div>
      </div>

      <!-- Format Information -->
      <div v-if="showError" :class="showErrorClass">
        <p :class="formatTextClass">
          {{ allowedTypesFormatted }}
          <span v-if="mediaType === 'image-gallery'">(max: 10 files {{ maxSizeFormatted }})</span>
          <span v-else>(max: {{ maxSizeFormatted }})</span>
        </p>
      </div>
    </div>

    <!-- Processing State -->
    <div
      data-media-step-processing=""
      hidden=""
      :class="processingCustomClass"
    >
      <div
        processing-wrapper=""
        role="progressbar"
        aria-valuenow="65"
        aria-valuemin="0"
        aria-valuemax="100"
        style="--value:0"
        class="flex flex-col justify-center items-center gap-6 w-full flex-1 max-h-64"
      >
        <!-- Upload process -->
        <div
          data-media-step-processing-wrap=""
          class="flex flex-col justify-center gap-6 w-full max-w-md"
        >
          <div class="bg-gray-200 h-2 relative w-full rounded-full">
            <span
              data-media-step-processing-bar=""
              data-show-loader="true"
              :style="'width: 0%; background-color: ' + mainColor + ';'"
              class="h-full block -bg-[#30f] -bg-gray-700 -absolute left-0 rounded-full"
            ></span>
          </div>
          <h6
            v-show="showProcessingText"
            data-media-step-processing-text=""
            :style="'color: ' + mainColor + ';'"
            class="text-sm font-medium leading-normal text-white text-center"
          >
            Processing for something awesome...
          </h6>
        </div>
      </div>

      <div v-show="showCancelButton" class="flex w-full w-100 justify-end">
        <button
          type="button"
          class="bg-transparent pointer hover--parent--child--col--dodger-blue"
          data-media-step-processing-cancel=""
          data-button-color="blue-1"
          data-button-size="small"
          data-button-icon-position="left"
          data-button-adjust-padding="1"
        >
          <div data-button-text-wrap="" class="gap--4 flex items-center">
            <img
              :src="'https://fansocial.app/wp-content/plugins/fansocial/assets/icons/svg/close-btn.svg'"
              alt="close-btn"
              class="w--16 h--16 filter--col--oxford-blue hov--filter--col--dodger-blue"
            />
            <span class="fs--12 fw5 lh--18 text-white col--oxford-blue hover--col--dodger-blue">
              Cancel
            </span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

// ─── Props ────────────────────────────────────────────────────────────────────
const props = defineProps({
  // Main configuration
  mainColor: { type: String, default: "#3300ff" },
  mediaType: {
    type: String,
    default: "image",
    validator: (value) => ["image", "video", "audio", "image-gallery", "mixed-media"].includes(value),
  },
  customClass: { type: String, default: "" },
  processingCustomClass: {
    type: String,
    default: "w-full h-full flex justify-center items-center gap-6 flex-col flex-1",
  },
  inputWrapperClass: { type: String, default: "" },
  inputName: { type: String, default: "" },
  inputRequired: { type: Boolean, default: false },
  uploadImmediately: { type: Boolean, default: true },
  saveToMediaLibrary: { type: Boolean, default: false },
  hideUploader: { type: Boolean, default: false },
  editProfile: { type: Boolean, default: false },
  isProfileAvatar: { type: Boolean, default: false },
  profileColorScheme: { type: String, default: "" },

  // Button / UI
  buttonText: { type: String, default: "Click to upload" },
  buttonTextClass: { type: String, default: "font-semibold text-gray-700 cursor-pointer" },
  showButtonIcon: { type: Boolean, default: true },
  buttonIconName: { type: String, default: "upload" },
  buttonIconClass: { type: String, default: "text-white fill-white" },
  buttonWrapperClass: {
    type: String,
    default: "relative w-10 h-10 flex justify-center items-center rounded-lg shadow-lg cursor-pointer",
  },
  buttonParentWrapperClass: {
    type: String,
    default: "flex flex-col justify-center items-center gap-3",
  },
  buttonIconWrapperClass: {
    type: String,
    default: "w-10 h-10 flex justify-center items-center rounded-lg shadow-lg bg-green-500 hover:bg-gray-800 transition-colors",
  },
  dropText: { type: String, default: "or drag and drop files here" },
  dropTextClass: {
    type: String,
    default: "text-sm font-normal leading-5 text-gray-500 text-center",
  },
  formatTextClass: { type: String, default: "text-xs leading-6 text-gray-500 text-center mb-0" },
  processingButtonColor: { type: String, default: "blue" },
  processingButtonSize: { type: String, default: "medium" },

  // Visibility / state
  newDashboard: { type: Boolean, default: false },
  showProcessingText: { type: Boolean, default: true },
  showCancelButton: { type: Boolean, default: true },
  showError: { type: Boolean, default: true },
  showErrorClass: { type: String, default: "" },
  visibility: { type: String, default: "public" },

  // File constraints
  customAllowedTypes: { type: String, default: "" },
  customMaxSize: { type: String, default: "" },
  maxSize: { type: Number, default: 15728640 }, // 15 MB
  allowedTypes: { type: String, default: "image/png,image/jpg,image/jpeg" },
  generateResizedImages: { type: Boolean, default: false },
  enableImageCompression: { type: Boolean, default: false },

  // Media data
  mediaUrls: { type: Array, default: () => [] },
  mediaId: { type: [String, Number], default: null },
  mediaData: { type: Object, default: () => ({}) },
});

// ─── Emits ────────────────────────────────────────────────────────────────────
const emit = defineEmits(["media-uploaded", "media-urls-updated", "compressor-data-updated"]);

// ─── Reactive state ───────────────────────────────────────────────────────────
const media_urls = ref([]);
const compressorData = ref(null);
const componentRef = ref(null);

// ─── Computed ─────────────────────────────────────────────────────────────────
const effectiveInputName = computed(() => props.inputName || props.mediaType);

const effectiveCustomClass = computed(() => {
  if (props.customClass) return props.customClass;
  switch (props.mediaType) {
    case "image":
      return "flex justify-center items-center min-h-[450px] w-full p-2 rounded-xl bg-black/5 hover:bg-black/10 border-2 border-transparent hover:border-gray-700";
    case "video":
    case "audio":
      return "min-h-[450px] w-full p-2 rounded-xl bg-black/5 hover:bg-black/10 border-2 border-transparent hover:border-gray-700 flex justify-center items-center";
    case "image-gallery":
      return "min-h-[126px] w-full p-2 rounded-xl bg-black/5 hover:bg-black/10 border-2 border-transparent hover:border-gray-700";
    default:
      return "w-full flex justify-center items-center h-[195px] w-full p-2 rounded-xl bg-black/5 hover:bg-black/10 border-2 border-transparent hover:border-gray-700";
  }
});

const acceptAttribute = computed(() => {
  return props.allowedTypes
    .split(",")
    .map((type) => {
      switch (type.trim()) {
        case "image/png":  return ".png";
        case "image/jpg":  return ".jpg";
        case "image/jpeg": return ".jpeg";
        case "video/mp4":  return ".mp4";
        case "video/avi":  return ".avi";
        case "audio/mp3":  return ".mp3";
        case "audio/wav":  return ".wav";
        default:           return type.trim();
      }
    })
    .join(",");
});

const maxSizeFormatted = computed(() => {
  if (props.customMaxSize) return props.customMaxSize;
  const mb = Math.round(props.maxSize / (1024 * 1024));
  return `${mb} MB`;
});

const allowedTypesFormatted = computed(() => {
  if (props.customAllowedTypes) return props.customAllowedTypes;
  return props.allowedTypes
    .split(",")
    .map((type) => type.trim().split("/")[1]?.toUpperCase())
    .filter(Boolean)
    .join(", ");
});

const multipleAttribute = computed(() =>
  ["image-gallery", "mixed-media"].includes(props.mediaType)
);

const profileImage = computed(() =>
  props.mediaUrls && props.mediaUrls.length > 0 ? props.mediaUrls[0] : ""
);

// ─── Upload event handler ─────────────────────────────────────────────────────
const handleUploadedAll = (e) => {
  const detail = e.detail;

  // Ignore events that belong to a different component instance
  if (detail.parentDiv && componentRef.value) {
    if (
      !componentRef.value.contains(detail.parentDiv) &&
      detail.parentDiv !== componentRef.value
    ) {
      return;
    }
  }

  let mediaUrls, compData;

  if (["image-gallery", "mixed-media"].includes(detail.mediaType)) {
    compData = detail.data.currentcompressorData;
    if (compData && Array.isArray(compData) && compData.length > 0) {
      mediaUrls = compData.map((item) => item.original).filter(Boolean);
    } else if (detail.data.currentCompressorData) {
      compData = detail.data.currentCompressorData;
      mediaUrls = compData.original;
    }
  } else {
    compData = detail.data.currentCompressorData;
    mediaUrls = compData.original;
  }

  media_urls.value = mediaUrls;
  compressorData.value = compData;

  emit("media-uploaded", { media_urls: mediaUrls, compressorData: compData, detail });
  emit("media-urls-updated", mediaUrls);
  emit("compressor-data-updated", compData);
};

// ─── Inject external uploader scripts (once, deferred) ───────────────────────
const injectScript = (src) => {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const el = document.createElement("script");
  el.src = src;
  el.defer = true;
  document.head.appendChild(el);
};

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  window.MEDIA_SITE_URL = "https://fansocial.app"; // Set global site URL for uploader scripts

  // Bridge globals from parent frame
  window.userData = window.parent?.userData;
  window.showToast = window.parent?.showToast;
  window.translation_strings = window.parent?.translation_strings || {
    "minMaxError": "Please check your minimum and maximum entry",
    "minError": "Please check your minimum entry",
    "maxError": "Please check your maximum entry",
    "requiredError": "This field is required",
    "emailError": "Please enter a valid email address",
    "numberError": "Please enter a valid number",
    "telephoneError": "Please enter a valid telephone number",
    "checkboxError": "At least one checkbox must be selected",
    "example_cpr_success": "Your custom request form has been sent to Jenny.",
    "dashboard_edit_profile_gallery_order_success": "New order for free gallery saved.",
    "dashboard_media_pending_approval": "Your media has been uploaded pending approval.",
    "media_uploader_unknow_error": "An error has occurred. Please reload the page and try again.",
    "media_uploader_error_no_selected_files": "Please select one or more files to upload.",
    "media_uploader_error_another_upload_in_progress": "Another upload is in progress.",
    "media_uploader_error_image_size_exceeded": "Image size has exceeded the limit.",
    "media_uploader_error_video_size_exceeded": "Video size has exceeded the limit.",
    "media_uploader_error_invalid_type": "File is of an invalid type.",
    "media_uploader_error_file_size_exceeded": "File size has exceeded the limit.",
    "media_uploader_error_no_active_media_upload": "No active media upload found.",
    "media_uploader_error_media_urls_input_not_found": "Media URLs input not found.",
    "media_uploader_error_invalid_content_type": "Invalid content type.",
    "media_uploader_error_empty_value_found": "Empty value found for ${key} in JSON.",
    "media_uploader_error_aws_data_json_input_not_found": "AWS Data JSON input not found.",
    "media_uploader_error_select_schedule_type": "Please select a schedule type.",
    "media_uploader_error_upload_files_first": "Please upload files first.",
    "media_uploader_error_select_option": "Please select an option.",
    "media_uploader_error_tier_or_ppv_price": "You should set a tier or PPV price to show in the media lists.",

    "media_uploader_getting_ready": "Getting Ready",
    "media_uploader_almost_ready": "Almost ready, wrapping it all up",
    "media_uploader_processing_awesome": "Processing for something awesome...",
    "media_uploader_processing": "Processing",
    "media_uploader_uploading": "Uploading...",
    "media_uploader_done": "Done",
    "media_uploader_new_subscription_tier_added": "New subscription tier added.",
    "media_uploader_video_title": "Video Title",
    "media_uploader_image_title": "Image Title",
    "media_uploader_audio_title": "Audio Title",
    "media_uploader_image_gallery_title": "Image Gallery Title",
  }

  injectScript("https://fansocial.app/wp-content/plugins/fansocial/dev/media-upload-new/js/mediaUploader.js");
  injectScript("https://fansocial.app/wp-content/plugins/fansocial/dev/media-upload-new/js/mediaUploadHandler.js");

  document.addEventListener("mediaUploader-uploaded-all", handleUploadedAll);
});

onUnmounted(() => {
  document.removeEventListener("mediaUploader-uploaded-all", handleUploadedAll);
});

// ─── Expose for template refs ─────────────────────────────────────────────────
defineExpose({ media_urls, compressorData });
</script>

<style>
  /* Upload processing bar — width reset when active loader is running */
  [data-media-step-processing-bar][data-show-loader=true] {
    width: 0% !important;
  }

  /* Upload processing bar — border radius */
  [data-media-step-processing-bar][data-show-loader=true]:before,
  [data-media-step-processing-bar] {
    border-radius: 3.125rem;
  }

  [data-media-step-processing-bar] {
    border-top-right-radius: 0rem;
    border-bottom-right-radius: 0rem;
  }

  /* Horizontal loader animation for upload processing */
  [data-media-step-processing-bar][data-show-loader=true]:before {
    content: '';
    height: inherit;
    background: var(--color-blue, #30f);
    position: absolute;
    animation: borealisBar 2s linear infinite;
  }

  @keyframes borealisBar {
    0%   { left: 0%;   right: 100%; width: 0%;   }
    10%  { left: 0%;   right: 75%;  width: 25%;  }
    90%  { right: 0%;  left: 75%;   width: 25%;  }
    100% { left: 100%; right: 0%;   width: 0%;   }
  }
  [data-media-upload][hidden]:where(:not([hidden="until-found"])),
  [data-media-upload] [hidden]:where(:not([hidden="until-found"])) {
      display: none;
  }
</style>
