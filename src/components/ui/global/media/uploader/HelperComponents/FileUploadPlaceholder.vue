<template>
  <!-- uploader container -->
  <div class="flex flex-col justify-start self-stretch w-full rounded-sm gap-4 md:gap-6">
    <div class="flex flex-wrap items-start justify-start gap-2">
      <div class="w-full relative cursor-pointer" @click="$emit('click')">
        <div class="block overflow-hidden">
          <div
            :class="['flex flex-col justify-center items-center gap-[0.875rem] w-full rounded', bgLightClass, darkBgClass]"
            :style="{ height: height }"
          >
            <img
              :src="imageUrl"
              :alt="altText"
              class="max-h-full "
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "FileUploadPlaceholder",
  props: {
    imageUrl: {
      type: String,
      default: "https://i.ibb.co/SXd8PmXh/svgviewer-png-output-6.webp",
    },
    altText: {
      type: String,
      default: "file-upload-placeholder",
    },
    height: {
      type: String,
      default: "14.375rem",
    },
    bgColorLight: {
      type: String,
      default: "bg-light-bg", // Tailwind class for light mode
    },
    bgColorDark: {
      type: String,
      default: "bg-dark-gray-bg-2", // Tailwind class for dark mode
    },
  },
  computed: {
    bgLightClass() {
      return this.bgColorLight;
    },
    darkBgClass() {
      return `dark:${this.bgColorDark}`;
    },
  },
};
</script>
