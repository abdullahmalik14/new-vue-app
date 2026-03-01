<template>
  <!-- kyc-container -->
  <div class="flex flex-col w-full relative gap-6 z-[5]">
    <div class="flex flex-col w-full gap-6">
      <!-- heading -->
      <Heading :text="t('auth.register.KYC.title')" tag="h2" theme="AuthHeading" />
      <Paragraph :text="t('auth.register.KYC.description')" font-size="text-base" font-weight="font-medium"
        font-color="text-white" />

      <div class="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <!-- confirm button -->
        <ButtonComponent :text="isLoading ? t('common.loading') : t('auth.register.KYC.button')" variant="authPink"
          size="lg" :disabled="isLoading" @click="completeKyc" />

        <!-- logout -->
        <ButtonComponent :text="t('auth.register.KYC.logout')" variant="authTransparent" size="lg" type="button"
          @click="handleLogout" />
      </div>

      <!-- Error message -->
      <p v-if="error" class="text-sm text-red-300 bg-red-900/30 border border-red-500/40 rounded-md px-3 py-2">
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "@/stores/useAuthStore"
import { authHandler } from "@/utils/auth/authHandler"
import { useI18n } from "vue-i18n"
import { getActiveLocale } from "@/utils/translation/localeManager.js"
import { loadTranslationsForSection } from "@/utils/translation/translationLoader.js"
import Heading from "@/components/default/Heading.vue"
import Paragraph from "@/components/default/Paragraph.vue"
import ButtonComponent from "@/components/button/ButtonComponent.vue"
import apiWrapper from "@/lib/mock-api-demo/apiWrapper.js"
import { userIdUtility } from "@/lib/mock-api-demo/utilities/userId.js"

const router = useRouter()
const auth = useAuthStore()
const { t, locale: i18nLocale } = useI18n()
const error = ref("")
const isLoading = ref(false)

// Get active locale from localeManager
const locale = computed(() => getActiveLocale())

// Preload auth section translations
onMounted(async () => {
  console.log(`[KYC] Component mounted, current locale: ${locale.value}`)

  // Load translations for auth section
  try {
    await loadTranslationsForSection('auth', locale.value)
  } catch (err) {
    console.error('[KYC] Failed to load translations:', err)
  }
})

function handleLogout() {
  auth.logout()
  router.push("/log-in")
}

async function completeKyc() {
  const start = performance.now()
  try {
    isLoading.value = true

    // Mock KYC payload (replace with real data later)
    const kycPayload = [
        { type: "document", name: "passport", status: "uploaded" }
    ];
    
    const userId = await userIdUtility.getUserId();

    // Promise.all for Cognito update and API call
    await Promise.all([
        authHandler.updateProfileAttributes({ "custom:kyc": "true" }),
        apiWrapper.post('/users/sign-up/kyc', {
            userId: userId,
            kycPayload: kycPayload,
            action: 'kycSuccess' // or 'kycFail' based on logic
        })
    ]);

    const { idToken } = await authHandler.restoreSession()

    auth.updateUserAttributesLocally({ kycPassed: true, onboardingCompleted: true })
    auth.setTokenAndDecode(idToken)

    router.push("/dashboard")
  } catch (err) {
    error.value = "Failed to complete KYC: " + (err.message || "Unknown error")
  } finally {
    isLoading.value = false
  }
}
</script>

<script>
export const assets = {
  critical: ["/css/onboarding.css"],
  high: [],
  normal: ["/images/kyc-bg.jpg"],
}
</script>

