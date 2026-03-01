<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import PopupHandler from '@/components/ui/popup/PopupHandler.vue';

const props = defineProps({
    modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

// --- 1. Screen Size Detection ---
const isMobile = ref(false);

const checkScreenSize = () => {
    isMobile.value = window.innerWidth < 768; // 768px se neeche Mobile logic
};

onMounted(() => {
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
});

onUnmounted(() => {
    window.removeEventListener("resize", checkScreenSize);
});

// --- 2. Dynamic Config (Switches based on screen size) ---
const profileSeeMorePopupConfig = computed(() => {
    if (isMobile.value) {
        // === MOBILE CONFIG (Bottom Sheet) ===
        return {
            actionType: "slidein", // Native Slide-in logic use karega
            from: "bottom", // Neeche se ayega
            position: "center",
            speed: "300ms", // Thoda smooth slide
            effect: "ease-in-out",
            showOverlay: true,
            closeOnOutside: true,
            lockScroll: true,
            escToClose: true,
            width: "100%", // Full width
            height: "auto", // Content jitni height
        };
    } else {
        // === DESKTOP CONFIG (Center Popup) ===
        return {
            actionType: "popup",
            position: "center",
            customEffect: "scale",
            offset: "0px",
            speed: "250ms",
            effect: "ease-in-out",
            showOverlay: true, // Changed to true to match logic, or keep false if intended
            closeOnOutside: true,
            lockScroll: true,
            escToClose: true,
            width: { default: "auto", "<768": "90%", },
            height: { default: "auto", "<768": "90%" },
            scrollable: true,
            closeSpeed: "250ms",
            closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
        };
    }
});

</script>

<template>
    <PopupHandler :modelValue="modelValue" @update:modelValue="(val) => emit('update:modelValue', val)"
        :config="profileSeeMorePopupConfig">

        <div
            class="w-full md:w-[720px] h-[519px] p-6 bg-black/50 backdrop-blur-xl inline-flex flex-col justify-start items-start gap-4">
            <div class="self-stretch inline-flex justify-start items-center gap-2">
                <div class="flex-1 justify-start text-white text-2xl font-semibold font-['Poppins'] leading-8">
                    Jenny’ Playhouse</div>
                <div @click="emit('update:modelValue', false)"
                    class="w-8 h-8 relative overflow-hidden flex justify-center items-center cursor-pointer">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 1L1 17M1 1L17 17" stroke="green" stroke-width="1.5" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </div>
            </div>
            <div class="self-stretch flex-1 justify-start">
                <span class="text-white text-base font-normal font-['Poppins'] leading-6"> I love eating! watch me eat
                    different food every 8pm EST time👅!Here is Jenny’s bio. I love eating! I I love eating! watch me
                    eat different food every 8pm EST time👅!Here is Jenny’s bio. I love eating! watch me eat different
                    food every We..Read morelove eating! watch me eat different food every 8pm EST time👅!Here is
                    Jenny’s bio. I love eating! <br />
                </span>
                <br>
                <ul class="text-white text-base font-normal font-['Poppins'] leading-6 list-disc pl-4">
                    <li>content update weekly!</li>
                    <li>100% real content</li>
                    <li>no editing</li>
                    <li>Ad free</li>
                    <li>content update weekly!</li>
                    <li>100% real content</li>
                    <li>no editing</li>
                    <li>Ad free</li>
                </ul>
            </div>
        </div>

    </PopupHandler>
</template>