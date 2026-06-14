<script setup>
import { ref } from 'vue';

// Components
import BackgroundVideo from '../../components/home/BackgroundVideo.vue';
import MainNavbar from '../../components/home/MainNavbar.vue';
import HeroSection from '../../components/home/HeroSection.vue';
import AboutSection from '../../components/home/AboutSection.vue';
import FeaturedCreators from '../../components/home/FeaturedCreators.vue';
import DitchMiddleman from '../../components/home/DitchMiddleman.vue';
import MostViewedSlider from '../../components/home/MostViewedSlider.vue';
import RecentlyUploadedSlider from '../../components/home/RecentlyUploadedSlider.vue';
import GallerySlider from '../../components/home/GallerySlider.vue';
import ServiceTabsSection from '../../components/home/ServiceTabsSection.vue';
import SafetyBanner from '../../components/home/SafetyBanner.vue';
import ReviewSection from '../../components/home/ReviewSection.vue';
import JoinSection from '../../components/home/JoinSection.vue';
import FAQSection from '../../components/home/FAQSection.vue';
import OverviewSection from '../../components/home/OverviewSection.vue';
import MainFooter from '../../components/home/MainFooter.vue';

const bgVideo = ref(null);

const handleHeroSlideChange = (index) => {
    if (bgVideo.value) {
        bgVideo.value.syncVideo(index);
    }
};
</script>

<template>
    <div class="relative min-h-screen">
        <!-- Background Layer -->
        <BackgroundVideo ref="bgVideo" />

        <!-- Main Content -->
        <div class="relative z-10">
            <MainNavbar />

            

            <main>
                <HeroSection @slideChange="handleHeroSlideChange" />
                <AboutSection />
                <FeaturedCreators />
                <DitchMiddleman />
                <MostViewedSlider />
                <RecentlyUploadedSlider />
                <GallerySlider />
                <ServiceTabsSection />
                <SafetyBanner />
                <ReviewSection />
                <JoinSection />
                <FAQSection />
                <OverviewSection />
            </main>

            <MainFooter />
        </div>
    </div>
</template>

<style>
/* Global styles if needed, but Tailwind should handle most */
html {
    scroll-behavior: smooth;
}

body {
    font-family: 'Poppins', sans-serif;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
}

/* Custom scrollbar for some sections might be needed */
.no-scrollbar::-webkit-scrollbar {
    display: none;
}

.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
