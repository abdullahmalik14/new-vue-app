<template>
  <div
    class="flex flex-col w-full aspect-square overflow-hidden relative bg-cover bg-no-repeat bg-center before:absolute before:inset-0 before:content-[''] before:pointer-events-none before:bg-[linear-gradient(180deg,rgba(0,0,0,0.64)_1.82%,rgba(0,0,0,0.08)_41.09%,rgba(0,0,0,0.8)_90.18%)] before:z-0 group cursor-pointer transition-all duration-300"
    :style="{
      backgroundImage: hoverActive ? `url(${hoverBg})` : `url(${bgImage})`,
    }"
    @mouseenter="hoverActive = true"
    @mouseleave="hoverActive = false"
  >
    <!-- date -->
    <div class="pt-6 px-6 shrink-0 z-[1]">
      <div class="flex gap-1 drop-shadow-[0px_0px_10px_-34px_#0000001A]">
        <h2
          class="text-[2rem] leading-6 font-medium text-[#E7E5E4] group-hover:text-[#07F468]"
        >
          {{ day }}
        </h2>
        <span
          class="text-sm leading-none font-medium uppercase text-[#E7E5E4] group-hover:text-[#07F468]"
          >{{ suffix }}</span
        >
      </div>
    </div>

    <!-- media-info-section -->
    <div class="flex flex-col justify-end gap-2 p-4 z-[1] flex-grow">
      <p
        class="text-base font-medium tracking-[0.005rem] text-[#E7E5E4] drop-shadow-[0px_0px_10px_-34px_#0000001A] line-clamp-2 shrink-0 group-hover:text-[#07F468]"
      >
        {{ description }}
      </p>

      <div class="flex items-end gap-4">
        <!-- likes -->
        <div class="flex items-center gap-2">
          <img
            :src="likeIcon"
            alt="like-icon"
            class="w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(99%)_sepia(36%)_saturate(108%)_hue-rotate(297deg)_brightness(96%)_contrast(88%)] group-hover:[filter:brightness(0)_saturate(100%)_invert(70%)_sepia(47%)_saturate(1521%)_hue-rotate(87deg)_brightness(100%)_contrast(98%)]"
          />
          <span
            class="text-xs leading-normal tracking-[0.005rem] text-[#E7E5E4] align-middle group-hover:text-[#07F468]"
            >{{ likes }}</span
          >
        </div>

        <!-- comments -->
        <div class="flex items-center gap-2">
          <img
            :src="commentIcon"
            alt="comment-icon"
            class="w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(99%)_sepia(36%)_saturate(108%)_hue-rotate(297deg)_brightness(96%)_contrast(88%)] group-hover:[filter:brightness(0)_saturate(100%)_invert(70%)_sepia(47%)_saturate(1521%)_hue-rotate(87deg)_brightness(100%)_contrast(98%)]"
          />
          <span
            class="text-xs leading-normal tracking-[0.005rem] text-[#E7E5E4] align-middle group-hover:text-[#07F468]"
            >{{ comments }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const hoverActive = ref(false);

defineProps({
  day: { type: [String, Number], required: true },
  suffix: { type: String, default: "" },
  description: { type: String, required: true },
  likes: { type: [String, Number], default: 0 },
  comments: { type: [String, Number], default: 0 },
  bgImage: { type: String, required: true },
  hoverBg: { type: String, required: true },
  likeIcon: {
    type: String,
    default: "/images/not-liked.webp",
  },
  commentIcon: {
    type: String,
    default: "/images/message-text-square-02.webp",
  },
});
</script>
