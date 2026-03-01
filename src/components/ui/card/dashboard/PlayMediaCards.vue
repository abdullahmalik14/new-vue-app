<template>
  <ul data-media-list-container class="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-4">
    <li v-for="(item, index) in mediaList" :key="index" data-media-card
      class="relative shadow-[0_0_10px_-34px_rgba(0,0,0,0.10)] aspect-[2/1.1522] cursor-pointer group hover:overflow-visible">
      <a class="block absolute left-1/2 top-1/2 [transform:translate(-50%,-50%)_perspective(0)_translateZ(0)] overflow-visible w-full h-full transition-all duration-150 ease-in-out shadow-[0_0_10px_-34px_rgba(0,0,0,0.10)] bg-no-repeat bg-center bg-cover group-hover:duration-150 group-hover:z-[2] group-hover:block group-hover:w-full group-hover:h-full group-hover:min-w-full xl:group-hover:w-[26.25rem] xl:group-hover:h-[21.875rem] xl:group-hover:min-w-[unset] xl:group-hover:rounded-[0.313rem] xl:group-hover:shadow-[0_0_0.625rem_-2.125rem_rgba(0,0,0,0.10)]"
        @click="$emit('media-click', item)">
        <!-- thumb-container -->
        <div
          class="block relative w-full h-full overflow-hidden bg-no-repeat bg-center bg-cover z-[10010] after:absolute after:left-0 after:top-0 after:w-full after:h-full after:rounded-none after:z-[10010] after:opacity-100 after:content-[''] after:bg-[linear-gradient(180deg,rgba(0,0,0,0.6)_-24.72%,rgba(0,0,0,0)_41.92%,rgba(0,0,0,0.6)_108.57%)]">
          <div class="w-full h-[100.1%] flex justify-center items-center absolute left-0 top-0">
            <img class="w-full h-full object-cover visible" :src="item.image" :alt="item.alt" />
          </div>
        </div>

        <!-- media-type -->
        <span
          class="inline-flex justify-center items-center gap-[0.188rem] absolute top-1 left-1 px-1 py-0.5 rounded bg-[rgba(24,34,48,0.50)] dark:bg-[rgba(31,44,63,0.50)] drop-shadow-[0_0_0.313rem_rgba(0,0,0,1)] z-[99999]">
          <img src="/images/video.webp" alt="video" class="w-4 h-4" />
          <span class="text-xs leading-normal tracking-[0.008rem] text-white dark:text-[#e8e6e3]">{{ item.duration
            }}</span>
        </span>

        <!-- duration, likes, views -->
        <div
          class="flex justify-center items-center gap-2 absolute top-1 right-0 px-2.5 drop-shadow-[0_0_0.313rem_rgba(0,0,0,1)] z-[99999]">
          <div class="flex justify-center items-center gap-1">
            <span class="text-xs leading-none whitespace-nowrap text-white tracking-[0.01875rem] dark:text-[#e8e6e3]">{{
              item.timeAgo }}</span>
          </div>

          <div class="flex items-center gap-[0.813rem] px-1 opacity-70">
            <span class="flex justify-center items-center gap-[0.188rem] drop-shadow-[0_0_0.313rem_rgba(0,0,0,1)]">
              <img src="/images/heart.webp" alt="heart" class="w-[0.75rem] [filter:brightness(100)_saturate(0)]" />
              <span class="text-xs font-medium text-white tracking-[0.008rem] dark:text-[#e8e6e3]">{{ item.likes
                }}</span>
            </span>
            <span class="flex justify-center items-center gap-[0.1875rem] drop-shadow-[0_0_.313rem_#000]">
              <img src="/images/eye.webp" alt="eye" class="w-[0.75rem] [filter:brightness(100)_saturate(0)]" />
              <span class="text-xs font-medium text-white tracking-[0.0075rem] dark:text-[#e8e6e3]">{{ item.views
                }}</span>
            </span>
          </div>
        </div>

        <!-- button -->
        <div
          class="absolute bottom-0 left-0 transition-all duration-150 ease-in-out z-[10100] group-hover:flex xl:group-hover:hidden">
          <span
            class="flex justify-center items-center gap-1 px-2.5 py-1 bg-[#FB0464] transition-all duration-150 ease-in-out opacity-100">
            <span class="text-xs leading-[0.875rem] text-white dark:text-[#e8e6e3]">Subscribe or Buy</span>
          </span>
        </div>

        <!-- video -->
        <video
          class="absolute top-0 left-0 w-full h-full backdrop-blur-[10px] object-cover z-[10010] hidden opacity-0 transition-all duration-150 ease-in-out group-hover:flex group-hover:opacity-100 group-hover:bg-black"
          :src="item.video"></video>

        <!-- hover-container -->
        <div
          class="hidden flex-col justify-end gap-3.5 w-full h-full p-2 absolute top-0 left-0 overflow-hidden transition-all duration-150 ease-in-out z-[10100] opacity-0 [will-change:transform] [transform:translateZ(0)] [backface-visibility:hidden] [perspective:1000px] group-hover:opacity-100 xl:group-hover:flex">
          <div class="flex justify-between items-center">
            <div class="flex">
              <span
                class="flex justify-center items-center gap-1 px-2.5 py-1 bg-[#FB0464] transition-all duration-150 ease-in-out opacity-100">
                <span class="text-xs leading-[0.875rem] text-white dark:text-[#e8e6e3]">Subscribe or Buy</span>
              </span>
            </div>
          </div>

          <span class="text-sm text-white line-clamp-2 [text-shadow:0_0_4px_rgba(0,0,0,0.5)]">{{ item.title }}</span>
        </div>
      </a>
    </li>
  </ul>
</template>


<script>
export default {
  name: "MediaList",
  props: {
    mediaList: {
      type: Array,
      required: true,
    },
  },
  mounted() {
    // --- PLAY VIDEO ON HOVER ---
    const mediaCards = document.querySelectorAll("[data-media-card]");
    mediaCards.forEach((card) => {
      const video = card.querySelector("video");
      if (!video) return;

      card.addEventListener("mouseenter", () => video.play().catch(() => { }));
      card.addEventListener("mouseleave", () => {
        video.pause();
        video.currentTime = 0;
      });
    });

    // --- MEDIA CARD POSITION LOGIC ---
    document.querySelectorAll("[data-media-list-container]").forEach((ul) => {
      const mediaCards = ul.querySelectorAll("[data-media-card]");
      mediaCards.forEach((card, index) => {
        card.addEventListener("mouseenter", () => {
          const a = card.querySelector("a");
          if (window.innerWidth >= 1365) {
            const col = (index % 5) + 1;
            a.style.left = "50%";
            if (col === 1) a.style.left = "75%";
            else if (col === 5) a.style.left = "25%";
          }
        });
        card.addEventListener("mouseleave", () => {
          const a = card.querySelector("a");
          a.style.left = "50%";
        });
      });
    });
  },
};
</script>
