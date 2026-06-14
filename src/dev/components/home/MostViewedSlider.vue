<script setup>
import BaseMediaSlider from './BaseMediaSlider.vue';

const mediaItems = [
    {
        bg: 'https://i.ibb.co.com/M5Q8qb4F/hero-bg-image-2-1.webp',
        typeIcon: 'https://i.ibb.co.com/tTDV6Ms1/play-square.webp',
        meta: '15:00:03',
        avatar: 'https://i.ibb.co.com/70sHrpv/featured-media-bg.webp',
        name: 'Princess Carrot Pop',
        handle: '@sammisjelly187'
    },
    {
        bg: 'https://i.ibb.co.com/S4vnSYPw/hero-bg-image-1-2.webp',
        typeIcon: 'https://i.ibb.co.com/Q3dZ2gtL/gallery-image-icon.webp',
        meta: '30',
        avatar: 'https://i.ibb.co.com/70sHrpv/featured-media-bg.webp',
        name: 'Princess Carrot Pop',
        handle: '@sammisjelly187'
    },
    {
        bg: 'https://i.ibb.co.com/j9b5wvYV/hero-bg-image-2-2.webp',
        typeIcon: 'https://i.ibb.co.com/tTDV6Ms1/play-square.webp',
        meta: '15:00:03',
        avatar: 'https://i.ibb.co.com/70sHrpv/featured-media-bg.webp',
        name: 'Princess Carrot Pop',
        handle: '@sammisjelly187'
    },
    {
        bg: 'https://i.ibb.co.com/wNtVT4r0/hero-bg-image-0-2.webp',
        typeIcon: 'https://i.ibb.co.com/Q3dZ2gtL/gallery-image-icon.webp',
        meta: '30',
        avatar: 'https://i.ibb.co.com/70sHrpv/featured-media-bg.webp',
        name: 'Princess Carrot Pop',
        handle: '@sammisjelly187'
    }
];
</script>

<template>
    <BaseMediaSlider title="Most Viewed" icon="https://i.ibb.co.com/FbpnxXzs/gallery.webp" :mediaItems="mediaItems" />
</template>
