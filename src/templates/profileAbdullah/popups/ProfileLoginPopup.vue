<template>
    <PopupHandler :modelValue="modelValue" @update:modelValue="(val) => emit('update:modelValue', val)"
        :config="profileLoginPopupConfig">
        <!-- Close Icon -->
        <div @click="handleClose"
            class="absolute w-10 h-10 top-2 right-2 z-10 flex justify-center items-center cursor-pointer rounded-full bg-transparent [backdrop-filter:blur(0)] [filter:drop-shadow(0_0_20px_#FFFFFF)] md:w-12 md:h-12 md:-top-6 md:-right-6 md:bg-bg-overlay dark:md:bg-bg-dark-overlay md:[backdrop-filter:blur(20px)] md:[filter:none]">
            <img class="w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(90%)_sepia(9%)_saturate(72%)_hue-rotate(183deg)_brightness(105%)_contrast(91%)] md:w-[2.125rem] md:h-[2.125rem] md:[filter:none]"
                src="https://i.ibb.co.com/XrzfWZFN/svgviewer-png-output-35.webp" alt="close-icon" />
        </div>

        <!-- Back Icon (visible on all steps except Login) -->
        <!-- Rendered inside each auth component via popupGoBack inject -->

        <!-- Scrollable Content Area -->
        <div
            class="overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] h-full">

            <!-- Step 1: Login -->
            <AuthWrapper v-if="step === 1">
                <AuthLogIn />
            </AuthWrapper>

            <!-- Step 2: Sign Up -->
            <AuthWrapper v-else-if="step === 2">
                <AuthSignUp />
            </AuthWrapper>

            <!-- Step 3: Lost Password -->
            <AuthWrapper v-else-if="step === 3">
                <AuthLostPassword />
            </AuthWrapper>

            <!-- Step 4: Reset Password -->
            <AuthWrapper v-else-if="step === 4">
                <AuthResetPassword :prefilled-email="pendingEmail" />
            </AuthWrapper>

            <!-- Step 5: Confirm Email -->
            <AuthWrapper v-else-if="step === 5">
                <AuthConfirmEmail />
            </AuthWrapper>

            <!-- Step 6: Onboarding -->
            <AuthWrapper v-else-if="step === 6">
                <AuthSignUpOnboarding />
            </AuthWrapper>

        </div>
    </PopupHandler>
</template>

<script setup>
import { ref, provide, watch } from "vue";
import PopupHandler from "@/components/ui/popup/PopupHandler.vue";
import { AuthWrapper } from "@/templates/auth/Auth.js";
import AuthLogIn from "@/components/auth/AuthLogIn.vue";
import AuthSignUp from "@/components/auth/AuthSignUp.vue";
import AuthLostPassword from "@/components/auth/AuthLostPassword.vue";
import AuthResetPassword from "@/components/auth/AuthResetPassword.vue";
import AuthConfirmEmail from "@/components/auth/AuthConfirmEmail.vue";
import AuthSignUpOnboarding from "@/components/auth/AuthSignUpOnboarding.vue";

// ─── Props & Emits ──────────────────────────────────────────────────────────
const props = defineProps({
    modelValue: { type: Boolean, default: false },
    initialStep: { type: Number, default: 1 },
});

const emit = defineEmits(["update:modelValue"]);

// ─── Step State ─────────────────────────────────────────────────────────────
const step = ref(props.initialStep);

// Prefilled email passed from lost-password → reset-password
const pendingEmail = ref("");

// Reset to step 1 each time the popup opens
watch(() => props.modelValue, (isOpen) => {
    if (isOpen) {
        step.value = props.initialStep;
        pendingEmail.value = "";
    }
});

// ─── Popup Navigation Handler ────────────────────────────────────────────────
// Intercepts router.push calls made by auth components when running inside popup.
// Maps route paths to popup steps; falls back to closing popup for /dashboard.
function popupNavigate(path) {
    const url = typeof path === "string" ? path : path?.path ?? "";

    if (url.startsWith("/confirm-email")) {
        step.value = 5;
    } else if (url.startsWith("/reset-password")) {
        // Extract pre-filled email from query string if present
        try {
            const urlObj = new URL(url, window.location.origin);
            pendingEmail.value = urlObj.searchParams.get("email") || "";
        } catch {
            pendingEmail.value = "";
        }
        step.value = 4;
    } else if (url.startsWith("/log-in") || url.startsWith("/sign-in")) {
        step.value = 1;
    } else if (url.startsWith("/lost-password") || url.startsWith("/forgot-password")) {
        step.value = 3;
    } else if (url.startsWith("/sign-up") || url.startsWith("/register")) {
        step.value = 2;
    } else if (url.startsWith("/onboarding")) {
        step.value = 6;
    } else if (url.startsWith("/dashboard") || url === "/") {
        // Auth complete — close the popup; the outer page / route guard handles the rest
        handleClose();
    } else {
        // Unknown path — just close the popup and let Vue Router handle it
        handleClose();
    }
}

// Provide nav handler + back handler — declared AFTER goBack is defined below
// (see bottom of script)

// ─── Close ───────────────────────────────────────────────────────────────────
const handleClose = () => {
    emit("update:modelValue", false);
};

// ─── Back ────────────────────────────────────────────────────────────────────
// Maps each step to its logical previous step
const stepBackMap = {
    2: 1, // SignUp → Login
    3: 1, // LostPassword → Login
    4: 3, // ResetPassword → LostPassword
    5: 2, // ConfirmEmail → SignUp
    6: 1, // Onboarding → Login
};

function goBack() {
    step.value = stepBackMap[step.value] ?? 1;
    pendingEmail.value = "";
}

// Provide both handlers here, after goBack is defined
provide("popupNavHandler", popupNavigate);
provide("popupGoBack", goBack);

// ─── Popup Config ────────────────────────────────────────────────────────────
const profileLoginPopupConfig = {
    actionType: "popup",
    position: "center",
    customEffect: "scale",
    offset: "0px",
    speed: "250ms",
    effect: "ease-in-out",
    showOverlay: false,
    closeOnOutside: true,
    lockScroll: true,
    escToClose: true,
    width: { default: "90%" },
    height: { default: "90%" },
    scrollable: true,
    closeSpeed: "250ms",
    closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
};
</script>
