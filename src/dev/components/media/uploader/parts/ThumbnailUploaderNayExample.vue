<template>
  <div class="p-8 space-y-12 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-800">ThumbnailUploaderNay — Usage Examples</h1>

    <!-- ─────────────────────────────────────────────────────────────────────── -->
    <!-- 1. Basic Usage                                                          -->
    <!-- ─────────────────────────────────────────────────────────────────────── -->
    <section>
      <h2 class="text-lg font-semibold text-gray-700 mb-3">1. Basic Usage</h2>
      <ThumbnailUploaderNay @media-uploaded="onBasicUploaded" />
      <p v-if="basicUrl" class="mt-2 text-sm text-green-600">Uploaded URL: {{ basicUrl }}</p>
    </section>

    <!-- ─────────────────────────────────────────────────────────────────────── -->
    <!-- 2. With an Initial / Existing Thumbnail                                 -->
    <!-- ─────────────────────────────────────────────────────────────────────── -->
    <section>
      <h2 class="text-lg font-semibold text-gray-700 mb-3">2. With Existing Thumbnail</h2>
      <ThumbnailUploaderNay
        :media-urls="[existingThumbnail]"
        button-text="Replace thumbnail"
        @media-uploaded="onExistingReplaced"
        @media-removed="onExistingRemoved"
      />
    </section>

    <!-- ─────────────────────────────────────────────────────────────────────── -->
    <!-- 3. Custom Styling                                                        -->
    <!-- ─────────────────────────────────────────────────────────────────────── -->
    <section>
      <h2 class="text-lg font-semibold text-gray-700 mb-3">3. Custom Styling</h2>
      <ThumbnailUploaderNay
        main-color="#10b981"
        custom-class="border-2 border-dashed border-green-400 rounded-2xl p-6 bg-green-50 hover:bg-green-100 w-full flex flex-col items-center justify-center transition-colors"
        button-text="Choose thumbnail image"
        button-text-class="font-bold text-green-700 cursor-pointer"
        drop-text="or drag an image here"
        drop-text-class="text-sm text-green-600 text-center"
        :max-size="5242880"
        custom-max-size="5 MB"
        @media-uploaded="onCustomUploaded"
      />
    </section>

    <!-- ─────────────────────────────────────────────────────────────────────── -->
    <!-- 4. Always Show Uploader (re-upload even when preview is visible)         -->
    <!-- ─────────────────────────────────────────────────────────────────────── -->
    <section>
      <h2 class="text-lg font-semibold text-gray-700 mb-3">4. Always Show Uploader</h2>
      <ThumbnailUploaderNay
        :always-show-uploader="true"
        button-text="Update thumbnail"
        @media-uploaded="onAlwaysUploaded"
      />
    </section>

    <!-- ─────────────────────────────────────────────────────────────────────── -->
    <!-- 5. Multiple Instances on the Same Page (events are isolated per instance)-->
    <!-- ─────────────────────────────────────────────────────────────────────── -->
    <section>
      <h2 class="text-lg font-semibold text-gray-700 mb-3">5. Multiple Instances — Event Isolation</h2>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-xs text-gray-500 mb-1">Post thumbnail</p>
          <ThumbnailUploaderNay
            input-name="post_thumbnail"
            button-text="Post thumbnail"
            @media-uploaded="onPostThumbnail"
          />
          <p v-if="postThumbUrl" class="text-xs text-green-600 mt-1 truncate">{{ postThumbUrl }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-1">Cover image</p>
          <ThumbnailUploaderNay
            input-name="cover_image"
            button-text="Cover image"
            @media-uploaded="onCoverImage"
          />
          <p v-if="coverImageUrl" class="text-xs text-green-600 mt-1 truncate">{{ coverImageUrl }}</p>
        </div>
      </div>
    </section>

    <!-- ─────────────────────────────────────────────────────────────────────── -->
    <!-- 7. ThumbnailUploader.vue-style UI                                        -->
    <!-- ─────────────────────────────────────────────────────────────────────── -->
    <section>
      <h2 class="text-lg font-semibold text-gray-700 mb-3">7. ThumbnailUploader-style UI</h2>
      <ThumbnailUploaderNay
        custom-class="cursor-pointer border-2 border-transparent bg-black/5 rounded-xl p-2 h-[12.1875rem] flex flex-col items-center justify-center hover:border-gray-900 hover:bg-black/10"
        input-wrapper-class="border-2 border-dashed border-transparent"
        button-wrapper-class="shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] rounded-lg h-10 w-10 relative flex justify-center items-center"
        button-icon-wrapper-class="cursor-pointer shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] bg-green-500 rounded-lg h-10 w-10 flex justify-center items-center hover:bg-black"
        button-parent-wrapper-class="flex flex-col items-center justify-center gap-3"
        button-text="Click to upload"
        button-text-class="font-semibold text-gray-900 cursor-pointer"
        drop-text="or drag and drop image file here"
        drop-text-class="text-sm font-normal leading-5 text-gray-500 text-center"
        custom-allowed-types="PNG or JPG"
        custom-max-size="10MB"
        format-text-class="text-dark-gray text-xs leading-[1.125rem] text-center mb-0"
        @media-uploaded="onThumbnailStyleUploaded"
      />
      <p v-if="thumbnailStyleFileName" class="text-green-600 text-xs text-center font-semibold mt-2">
        Selected: {{ thumbnailStyleFileName }}
      </p>
    </section>

    <!-- ─────────────────────────────────────────────────────────────────────── -->
    <!-- 8. Video Upload                                                          -->
    <!-- ─────────────────────────────────────────────────────────────────────── -->
    <section>
      <h2 class="text-lg font-semibold text-gray-700 mb-3">8. Video Upload</h2>
      <ThumbnailUploaderNay
        media-type="video"
        allowed-types="video/mp4,video/avi"
        :max-size="524288000"
        custom-max-size="500 MB"
        button-text="Upload Video"
        drop-text="or drag and drop video file here"
        @media-uploaded="onVideoUploaded"
      />
      <p v-if="videoUrl" class="mt-2 text-sm text-green-600 truncate">Uploaded: {{ videoUrl }}</p>
    </section>

    <!-- ─────────────────────────────────────────────────────────────────────── -->
    <!-- 9. Audio Upload                                                          -->
    <!-- ─────────────────────────────────────────────────────────────────────── -->
    <section>
      <h2 class="text-lg font-semibold text-gray-700 mb-3">9. Audio Upload</h2>
      <ThumbnailUploaderNay
        media-type="audio"
        allowed-types="audio/mp3,audio/wav"
        :max-size="52428800"
        custom-max-size="50 MB"
        button-text="Upload Audio"
        drop-text="or drag and drop audio file here"
        @media-uploaded="onAudioUploaded"
      />
      <p v-if="audioUrl" class="mt-2 text-sm text-green-600 truncate">Uploaded: {{ audioUrl }}</p>
    </section>

    <!-- ─────────────────────────────────────────────────────────────────────── -->
    <!-- 10. Image Gallery (multiple files)                                       -->
    <!-- ─────────────────────────────────────────────────────────────────────── -->
    <section>
      <h2 class="text-lg font-semibold text-gray-700 mb-3">10. Image Gallery</h2>
      <ThumbnailUploaderNay
        media-type="image-gallery"
        allowed-types="image/png,image/jpg,image/jpeg"
        :max-size="15728640"
        button-text="Upload Images"
        drop-text="or drag and drop multiple images here"
        @media-uploaded="onGalleryUploaded"
      />
      <ul v-if="galleryUrls.length" class="mt-2 space-y-1">
        <li
          v-for="(url, i) in galleryUrls"
          :key="i"
          class="text-sm text-green-600 truncate"
        >
          {{ i + 1 }}. {{ url }}
        </li>
      </ul>
    </section>

    <!-- ─────────────────────────────────────────────────────────────────────── -->
    <!-- 6. Accessing Reactive State via Template Ref                             -->
    <!-- ─────────────────────────────────────────────────────────────────────── -->
    <section>
      <h2 class="text-lg font-semibold text-gray-700 mb-3">6. Template Ref — Reactive State Access</h2>
      <ThumbnailUploaderNay ref="refExample" @media-uploaded="onRefUploaded" />
      <div class="mt-2 text-sm text-gray-600 space-y-1">
        <p>thumbnailUrl: <code class="text-indigo-600">{{ refExample?.thumbnailUrl ?? '—' }}</code></p>
        <p>compressorData: <code class="text-indigo-600">{{ refExample?.compressorData ? 'set' : 'null' }}</code></p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";
import ThumbnailUploaderNay from "./ThumbnailUploaderNay.vue";

// ── Section 1 ────────────────────────────────────────────────────────────────
const basicUrl = ref("");
const onBasicUploaded = ({ media_urls }) => {
  basicUrl.value = media_urls;
  console.log("Basic upload:", media_urls);
};

// ── Section 2 ────────────────────────────────────────────────────────────────
const existingThumbnail = "https://picsum.photos/seed/thumb/640/360";
const onExistingReplaced = ({ media_urls }) => {
  console.log("Replaced thumbnail:", media_urls);
};
const onExistingRemoved = () => {
  console.log("Thumbnail removed");
};

// ── Section 3 ────────────────────────────────────────────────────────────────
const onCustomUploaded = ({ media_urls }) => {
  console.log("Custom styled upload:", media_urls);
};

// ── Section 4 ────────────────────────────────────────────────────────────────
const onAlwaysUploaded = ({ media_urls }) => {
  console.log("Always-visible uploader:", media_urls);
};

// ── Section 5 ────────────────────────────────────────────────────────────────
const postThumbUrl = ref("");
const coverImageUrl = ref("");
const onPostThumbnail = ({ media_urls }) => {
  postThumbUrl.value = media_urls;
};
const onCoverImage = ({ media_urls }) => {
  coverImageUrl.value = media_urls;
};

// ── Section 7 ────────────────────────────────────────────────────────────────
const thumbnailStyleFileName = ref("");
const onThumbnailStyleUploaded = ({ media_urls }) => {
  // Show the last segment of the URL as a pseudo-filename
  const url = Array.isArray(media_urls) ? media_urls[0] : media_urls;
  thumbnailStyleFileName.value = url ? url.split("/").pop() : "";
  console.log("ThumbnailUploader-style upload:", url);
};
// ── Sections 8–10 ────────────────────────────────────────────────────────────
const videoUrl = ref("");
const onVideoUploaded = ({ media_urls }) => {
  videoUrl.value = Array.isArray(media_urls) ? media_urls[0] : media_urls;
  console.log("Video uploaded:", videoUrl.value);
};

const audioUrl = ref("");
const onAudioUploaded = ({ media_urls }) => {
  audioUrl.value = Array.isArray(media_urls) ? media_urls[0] : media_urls;
  console.log("Audio uploaded:", audioUrl.value);
};

const galleryUrls = ref([]);
const onGalleryUploaded = ({ media_urls }) => {
  galleryUrls.value = Array.isArray(media_urls) ? media_urls : [media_urls];
  console.log("Gallery uploaded:", galleryUrls.value);
};

// ── Section 6 ────────────────────────────────────────────────────────────────
const onRefUploaded = () => {
  // thumbnailUrl and compressorData are exposed directly on refExample.value
  console.log("Via ref — url:", refExample.value?.thumbnailUrl);
};
</script>
