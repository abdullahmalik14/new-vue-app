<script setup>
import { ref, onMounted } from 'vue';

const activeIndex = ref(0);
const videoRefs = ref([]);

const syncVideo = (index) => {
    if (index === undefined || index === null) return;
    activeIndex.value = index;

    // Logic from original HTML: stop all, play active
    videoRefs.value.forEach((video, i) => {
        if (video) {
            if (i === index) {
                video.classList.add('active');
                video.play().catch(() => { });
            } else {
                video.classList.remove('active');
                video.pause();
                video.currentTime = 0;
            }
        }
    });
};

onMounted(() => {
    // Initial sync for first load
    setTimeout(() => syncVideo(0), 100);
});

defineExpose({
    syncVideo
});
</script>

<template>
    <div id="bg-layer" class="absolute w-screen h-screen inset-0 z-0 overflow-hidden pointer-events-none">
        <!-- Using same video structure as original HTML -->
        <!-- src paths match the original data-hero-bg 0, 1, 2 mapping -->
        <video v-for="i in [0, 1, 2]" :key="i" :ref="el => { if (el) videoRefs[i] = el }" :data-hero-bg="i"
            class="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-1000 [&.active]:opacity-100"
            :src="`/videos/hero-bg-video-${i === 1 ? 2 : i === 2 ? 3 : 0}.mp4`" muted playsinline preload="metadata"
            loop></video>

        <!-- Overlay -->
        <div class="absolute inset-0 bg-[#1D2334]/75 dark:bg-[#242b40]/75"></div>
    </div>
</template>

<style scoped>
/* Optional: ensures video doesn't show if not active even before transition */
video:not(.active) {
    pointer-events: none;
}
</style>
