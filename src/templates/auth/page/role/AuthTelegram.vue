<template>
  <AuthWrapper>
    <div class="relative z-20 flex flex-col items-center justify-center min-h-screen gap-6 px-6">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center gap-4 w-full max-w-md">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <p class="text-white text-lg font-medium">{{ statusMessage }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex flex-col items-center gap-4 w-full max-w-md">
        <div class="flex items-center gap-3 bg-gradient-to-r from-[#5d1906] to-[#0e0401] border-l-4 border-l-[#e8723e] px-4 py-3 shadow-lg relative w-full">
          <div class="relative flex-shrink-0 w-10 h-10 flex items-center justify-center">
            <div class="absolute inset-0 bg-[#6b1d06] rounded-xl"></div>
            <div class="absolute inset-0 bg-[#e8723e]/20 rounded-full blur-md"></div>
            <ExclamationCircleIcon class="w-6 h-6 text-[#ff6535] relative z-10" />
          </div>
          <p class="text-white text-[15px] font-normal leading-relaxed flex-1">
            {{ error }}
          </p>
        </div>
        <p class="text-white/70 text-sm text-center">
          You can close this window and try again.
        </p>
      </div>

      <!-- Main Content -->
      <div v-else class="flex flex-col w-full max-w-md gap-6">
        <!-- Heading -->
        <Heading :text="'Continue with Telegram'" tag="h2" theme="AuthHeading" />

        <!-- Telegram Widget Container -->
        <div class="flex flex-col items-center gap-4">
          <div ref="widgetContainer" class="flex items-center justify-center min-h-[60px] w-full"></div>
          
          <div class="text-center max-w-sm">
            <Paragraph
              :text="widgetHelpText"
              font-size="text-xs"
              font-weight="font-normal"
              font-color="text-white/70"
            />
          </div>
        </div>
      </div>
    </div>
  </AuthWrapper>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useRoute } from "vue-router";
import { AuthWrapper } from "@/templates/auth/Auth.js";
import { log } from "@/utils/common/logHandler.js";
import Heading from "@/components/default/Heading.vue";
import Paragraph from "@/components/default/Paragraph.vue";
import { ExclamationCircleIcon } from "@heroicons/vue/24/solid";

const route = useRoute();
const widgetContainer = ref(null);
const isLoading = ref(false);
const statusMessage = ref("Loading Telegram login…");
const error = ref(null);

const state = String(route.query.state || "");

const widgetHelpText = computed(() => {
  return "If you don't see the Telegram button, ensure your domain is set in BotFather and that the bot username is configured.";
});

function postToOpener(type, payload) {
  if (window.opener && !window.opener.closed) {
    window.opener.postMessage(
      {
        type,
        state,
        ...payload
      },
      "*"
    );
    return true;
  }
  return false;
}

function onTelegramAuth(user) {
  try {
    log("AuthTelegram.vue", "onTelegramAuth", "success", "Telegram widget returned user", {
      hasId: !!user?.id,
      hasHash: !!user?.hash,
      hasUsername: !!user?.username
    });

    statusMessage.value = "Sending authorization to parent window…";
    isLoading.value = true;

    const ok = postToOpener("TELEGRAM_AUTH_SUCCESS", { user });
    if (!ok) {
      error.value = "Parent window not available. Please close this window and try again.";
      isLoading.value = false;
      return;
    }

    // Wait for optional ACK then close
    let acknowledged = false;
    const ackListener = (event) => {
      const data = event?.data;
      if (data && data.type === "TELEGRAM_AUTH_ACK" && data.state === state) {
        acknowledged = true;
        window.removeEventListener("message", ackListener);
        setTimeout(() => window.close(), 500);
      }
    };
    window.addEventListener("message", ackListener);

    // Fallback close after 3 seconds
    setTimeout(() => {
      if (!acknowledged) {
        window.removeEventListener("message", ackListener);
        window.close();
      }
    }, 3000);
  } catch (e) {
    error.value = e?.message || "Telegram login failed";
    postToOpener("TELEGRAM_AUTH_ERROR", { error: error.value });
  }
}

function injectTelegramWidget() {
  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME;
  if (!botUsername) {
    error.value = "Missing VITE_TELEGRAM_BOT_USERNAME";
    return;
  }

  // Expose callback for the widget attribute: data-onauth="onTelegramAuth(user)"
  window.onTelegramAuth = onTelegramAuth;

  const widgetVersion = import.meta.env.VITE_TELEGRAM_WIDGET_VERSION || "22";

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://telegram.org/js/telegram-widget.js?${encodeURIComponent(widgetVersion)}`;
  script.setAttribute("data-telegram-login", botUsername);
  script.setAttribute("data-size", "large");
  script.setAttribute("data-userpic", "false");
  script.setAttribute("data-radius", "8");
  script.setAttribute("data-request-access", "write");
  script.setAttribute("data-onauth", "onTelegramAuth(user)");

  script.onerror = () => {
    error.value = "Failed to load Telegram widget script";
  };

  widgetContainer.value?.appendChild(script);
}

onMounted(() => {
  log("AuthTelegram.vue", "onMounted", "start", "Mounting Telegram callback page", {
    hasState: !!state
  });
  injectTelegramWidget();
});

onBeforeUnmount(() => {
  try {
    if (window.onTelegramAuth === onTelegramAuth) {
      delete window.onTelegramAuth;
    }
  } catch (e) {
    // ignore
  }
});
</script>

<script>
export const assets = {
  critical: ["/css/auth.css"],
  high: [],
  normal: []
};
</script>


