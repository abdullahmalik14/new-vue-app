<template>
    <BasePopup :modelValue="modelValue" @update:modelValue="(val) => emit('update:modelValue', val)"
        :popupConfig="profileLoginPopupConfig">
        <!-- Close Icon -->
        <div @click="handleClose"
            class="absolute w-10 h-10 top-2 right-2 z-10 flex justify-center items-center cursor-pointer rounded-full bg-transparent [backdrop-filter:blur(0)] [filter:drop-shadow(0_0_20px_#FFFFFF)] md:w-12 md:h-12 md:-top-6 md:-right-6 md:bg-bg-overlay dark:md:bg-bg-dark-overlay md:[backdrop-filter:blur(20px)] md:[filter:none]">
            <img class="w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(90%)_sepia(9%)_saturate(72%)_hue-rotate(183deg)_brightness(105%)_contrast(91%)] md:w-[2.125rem] md:h-[2.125rem] md:[filter:none]"
                src="https://i.ibb.co.com/XrzfWZFN/svgviewer-png-output-35.webp" alt="close-icon" />
        </div>

        <!-- Content -->
        <div class="overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] h-full ">
            <div class="relative w-full min-h-full flex flex-col items-start gap-4 px-6 py-12 bg-black/30 backdrop-blur-[50px]">
                <AuthLogin v-if="currentView === 'login'" />
                <AuthSignUp v-else-if="currentView === 'signup'" />
                <AuthLostPassword v-else-if="currentView === 'lostPassword'" />
                <AuthResetPassword v-else-if="currentView === 'resetPassword'" :prefilledEmail="resetEmail" />
                <AuthConfirmEmail v-else-if="currentView === 'confirmEmail'" />
            </div>
        </div>
    </BasePopup>
</template>

<script setup>
import { ref, computed, provide, watch } from "vue";
import BasePopup from "@/components/ui/popups/BasePopup.vue";
import AuthLogin from "@/templates/auth/views/AuthLogin.vue";
import AuthSignUp from "@/templates/auth/views/AuthSignUp.vue";
import AuthLostPassword from "@/templates/auth/views/AuthLostPassword.vue";
import AuthResetPassword from "@/templates/auth/views/AuthResetPassword.vue";
import AuthConfirmEmail from "@/templates/auth/views/AuthConfirmEmail.vue";

const props = defineProps({
    modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const handleClose = () => {
    emit("update:modelValue", false);
};

const profileLoginPopupConfig = {
    actionType: "popup",
    position: "center",
    customEffect: "scale",
    offset: "0px",
    speed: "250ms",
    effect: "ease-in-out",
    shouldShowOverlay: false,
    shouldCloseOnOutsideClick: true,
    shouldLockBodyScroll: true,
    shouldCloseOnEscape: true,
    width: { default: "90%" },
    height: { default: "90%" },
    scrollable: true,
    closeSpeed: "250ms",
    closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
};

// In-popup navigation: instead of routing, we swap the auth view inside the popup.
const DEFAULT_PATH = "/log-in";
const currentPath = ref(DEFAULT_PATH);
const viewHistory = ref([]);
const resetEmail = ref("");

const parsePath = (path) => {
    const [pathname, queryString] = String(path || "").split("?");
    const query = {};
    if (queryString) {
        new URLSearchParams(queryString).forEach((value, key) => {
            query[key] = value;
        });
    }
    return { pathname, query };
};

const popupNavHandler = (path) => {
    const { pathname, query } = parsePath(path);
    if (pathname.startsWith("/dashboard")) {
        handleClose();
        return;
    }
    if (query.email) resetEmail.value = query.email;
    viewHistory.value.push(currentPath.value);
    currentPath.value = path;
};

const popupGoBack = () => {
    currentPath.value = viewHistory.value.length ? viewHistory.value.pop() : DEFAULT_PATH;
};

provide("popupNavHandler", popupNavHandler);
provide("popupGoBack", popupGoBack);

const currentView = computed(() => {
    const { pathname } = parsePath(currentPath.value);
    if (pathname.startsWith("/sign-up")) return "signup";
    if (pathname.startsWith("/lost-password")) return "lostPassword";
    if (pathname.startsWith("/reset-password")) return "resetPassword";
    if (pathname.startsWith("/confirm-email")) return "confirmEmail";
    return "login";
});

// Reset to the login view every time the popup is opened fresh.
watch(
    () => props.modelValue,
    (isOpen) => {
        if (isOpen) {
            currentPath.value = DEFAULT_PATH;
            viewHistory.value = [];
            resetEmail.value = "";
        }
    }
);
</script>
