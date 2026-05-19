<template>
  <div class="flex flex-col items-center justify-center flex-grow flex-shrink basis-auto w-full gap-2 pt-6 pb-6 min-h-[21.25rem] min-w-0">
    <div class="flex items-center justify-center p-4">
      <div class="relative flex items-center justify-center w-[10.0625rem] h-[10.0625rem]">
        <img :src="image" :alt="alt" class="w-32 h-32" />
      </div>
    </div>

    <div class="flex flex-col items-center text-center gap-2">
      <span class="text-base leading-6 text-light-text-secondary font-sans dark:text-dark-text-secondary">
        {{ message }}
      </span>
      <a v-if="link" :href="link" class="text-base leading-6">
        <span class="text-base leading-6 text-light-text-secondary font-sans dark:text-dark-text-secondary underline">
          {{ linkText }}
        </span>
      </a>
    </div>
  </div>
</template>

<script setup >
const { image, alt, message, link, linkText } = defineProps(['image', 'alt', 'message', 'link', 'linkText'])
</script>
