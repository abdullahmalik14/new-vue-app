<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import PopupHandler from "@/components/ui/popup/PopupHandler.vue";
import PurchaseFlowSubscriptionOrderPopup from "@/components/ui/popup/purchase/PurchaseFlowSubscriptionOrderPopup.vue";

const purchaseFlowOpen = ref(false);

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  currentSubscription: { type: Object, default: null },
  newSubscription: { type: Object, default: null },
  isUpgrade: { type: Boolean, default: true }
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
const guestPurchaseFlowPopupConfig = computed(() => {
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
      actionType: "popup", // Native Popup logic
      customEffect: "scale", // Scale animation
      position: "center",
      speed: "250ms",
      effect: "ease-in-out",
      showOverlay: true, // Desktop pe overlay true rakhein ya false apki marzi
      closeOnOutside: true,
      lockScroll: true,
      escToClose: true,
      width: "auto", // Wrapper ki width lega
      height: "auto",
    };
  }
});
</script>

<template>
  <PopupHandler :modelValue="modelValue" @update:modelValue="(val) => emit('update:modelValue', val)"
    :config="guestPurchaseFlowPopupConfig">
    <div
      class="bg-white/90 backdrop-blur-[50px] shadow-[0px_4px_6px_-2px_#10182808,0px_12px_16px_-4px_#10182814] /* Mobile Styling */ w-full rounded-t-[0.625rem] /* Desktop Styling */ md:max-w-[31.25rem] md:rounded-[0.625rem] md:bg-white/10 dark:bg-[#181a1b]/90 md:dark:bg-[#181a1b]/10 md:backdrop-blur-[35px]">
      <div class="flex flex-col py-1">
        <div class="flex justify-center items-center p-2">
          <h1 class="text-sm font-semibold text-[#667085] md:text-[#EAECF0] dark:text-[#a0aec0] dark:md:text-[#dddad5]">
            Yumi's always eating
          </h1>
        </div>

        <div class="flex flex-col gap-4 px-3 py-2">
          <p class="text-base font-medium text-[#0C111D] md:text-[#F9FAFB] dark:text-[#dbd8d3] dark:md:text-[#dddad5]">
            You are about to {{ isUpgrade ? 'upgrade' : 'downgrade' }} your membership tier as follow:
          </p>

          <div class="flex flex-col gap-2">
            <span
              class="text-xs leading-normal font-medium text-[#667085] md:text-[#98A2B3] dark:text-[#a0aec0] dark:md:text-[#b0a99e]">Current
              subscription</span>
            <div
              class="flex bg-[url('https://i.ibb.co.com/LXPfFX03/profile-slidein-bg.webp')] bg-cover bg-center bg-no-repeat shadow-[4px_4px_0px_0px_#667085,4px_4px_4px_0px_#00000026]">
              <div
                class="w-[4.75rem] min-w-[4.75rem] pl-[0.4375rem] flex items-center relative bg-cover bg-center bg-[url('https://i.ibb.co.com/LXPfFX03/profile-slidein-bg.webp')] before:content-[''] before:absolute before:inset-0 before:bg-[linear-gradient(0deg,rgba(0,0,0,0.5),rgba(0,0,0,0.5)),linear-gradient(0deg,rgba(102,112,133,0.50),rgba(102,112,133,0.50))] before:z-0">
                <img src="https://i.ibb.co.com/p6RVnpkx/logo-1.webp" alt="logo (1)"
                  class="w-[3.125rem] w-[3.125rem] z-10 [filter:brightness(0)_saturate(100%)_invert(47%)_sepia(11%)_saturate(709%)_hue-rotate(182deg)_brightness(89%)_contrast(89%)]" />
              </div>
              <div
                class="flex grow h-full -ml-5 pl-5 [background:linear-gradient(0deg,rgba(0,0,0,0.75),rgba(0,0,0,0.75)),linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.4)_100%)] backdrop-blur-[5px] [clip-path:polygon(20px_0,100%_0,100%_100%,0_100%)]">
                <div class="flex flex-col justify-center gap-1 p-2 grow drop-shadow-[0px_0px_4px_#00000066]">
                  <h3 class="text-sm font-semibold line-clamp-2 text-white dark:text-[#e8e6e3]">
                    {{ currentSubscription?.title || 'Library of LOREM LPSUM ATIER dolor sit amet, consectetur adipiscing elit.' }}
                  </h3>
                  <div class="flex items-center h-[1.1875rem]">
                    <h3 class="text-lg font-semibold align-middle text-white dark:text-[#e8e6e3]">
                      USD${{ currentSubscription?.price || '99.99' }}
                    </h3>
                    <span class="text-sm font-medium mt-1 text-white dark:text-[#e8e6e3]">/mo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <span
              class="text-xs leading-normal font-medium text-[#667085] md:text-[#98A2B3] dark:text-[#a0aec0] dark:md:text-[#b0a99e]">New
              Subscribtion</span>
            <div
              class="flex bg-[url('https://i.ibb.co.com/LXPfFX03/profile-slidein-bg.webp')] bg-cover bg-center bg-no-repeat shadow-[4px_4px_0px_0px_#ff0066,4px_4px_4px_0px_#00000026]">
              <div
                class="w-[4.75rem] min-w-[4.75rem] pl-[0.4375rem] flex items-center relative bg-cover bg-center bg-[url('https://i.ibb.co.com/LXPfFX03/profile-slidein-bg.webp')] before:content-[''] before:absolute before:inset-0 before:bg-[linear-gradient(0deg,rgba(0,0,0,0.5),rgba(0,0,0,0.5)),linear-gradient(0deg,rgba(255,0,102,0.50),rgba(255,0,102,0.50))] before:z-0">
                <img src="https://i.ibb.co.com/p6RVnpkx/logo-1.webp" alt="logo (1)"
                  class="w-[3.125rem] w-[3.125rem] z-10 [filter:brightness(0)_saturate(100%)_invert(15%)_sepia(95%)_saturate(6042%)_hue-rotate(329deg)_brightness(98%)_contrast(107%)]" />
              </div>
              <div
                class="flex grow h-full -ml-5 pl-5 [background:linear-gradient(0deg,rgba(0,0,0,0.75),rgba(0,0,0,0.75)),linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.4)_100%)] backdrop-blur-[5px] [clip-path:polygon(20px_0,100%_0,100%_100%,0_100%)]">
                <div class="flex flex-col justify-center gap-1 p-2 grow drop-shadow-[0px_0px_4px_#00000066]">
                  <h3 class="text-sm font-semibold line-clamp-2 text-white dark:text-[#e8e6e3]">
                    {{ newSubscription?.title || 'FEATURED library of LOREM LPSUM ATIER dolor sit amet, consectetur adipiscing elit.' }}
                  </h3>
                  <div class="flex items-center h-[1.1875rem]">
                    <h3 class="text-lg font-semibold align-middle text-white dark:text-[#e8e6e3]">
                      USD${{ newSubscription?.price || '499.99' }}
                    </h3>
                    <span class="text-sm font-medium mt-1 text-white dark:text-[#e8e6e3]">/mo</span>
                  </div>
                </div>
              </div>
            </div>
            <p
              class="text-xs leading-normal text-[#667085] md:text-[#98A2B3] dark:text-[#a0aec0] dark:md:text-[#b0a99e]">
              Your membership will update in your next billing cycle
              (xx-xx-xxxx)
            </p>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2.5 p-2 md:px-4 md:py-3">
        <button @click="emit('update:modelValue', false)"
          class="w-1/2 h-10 flex justify-center items-center px-2 bg-black group/button outline-none border-none hover:bg-[#07F468] [&.disabled]:bg-white/20 [&.disabled]:cursor-not-allowed [&.disabled]:border-none dark:bg-[#181a1b] dark:hover:bg-[#06c454] dark:[&.disabled]:bg-[#181a1b]/20">
          <span
            class="text-lg font-medium text-[#07F468] group-hover/button:text-black group-[.disabled]/button:text-white/30 dark:text-[#23f97b] dark:group-hover/button:text-[#e8e6e3] dark:group-[.disabled]/button:text-[#e8e6e3]/30">Cancel</span>
        </button>
        <button
          class="w-1/2 h-10 flex justify-center items-center px-2 bg-[#07F468] group/button outline-none border-none hover:bg-black [&.disabled]:bg-white/20 [&.disabled]:cursor-not-allowed [&.disabled]:border-none dark:bg-[#06c454] dark:hover:bg-[#181a1b] dark:[&.disabled]:bg-[#181a1b]/20"
          @click="purchaseFlowOpen = true">
          <span
            class="text-lg font-medium tracking-[0.0218rem] text-black group-hover/button:text-[#07F468] group-[.disabled]/button:text-white/30 dark:text-[#e8e6e3] dark:group-hover/button:text-[#23f97b] dark:group-[.disabled]/button:text-[#e8e6e3]/30">{{
              isUpgrade ? 'UPGRADE' : 'DOWNGRADE' }}</span>
        </button>
      </div>
    </div>
    <PurchaseFlowSubscriptionOrderPopup v-model="purchaseFlowOpen" mode="upgrade"
      :currentSubscription="currentSubscription" :newSubscription="newSubscription" />
  </PopupHandler>
</template>
