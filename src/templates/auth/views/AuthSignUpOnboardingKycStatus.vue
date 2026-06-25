<template>
  <div>
    <h1>{{ $t('auth.register.kyc.status.title') }}</h1>
    <p>
      {{ $t('auth.register.kyc.status.description') }}: {{ authStore.currentUser.kycPassed ? $t('auth.register.kyc.status.done') : $t('auth.register.kyc.status.pending') }}
    </p>
  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/useAuthStore"

const authStore = useAuthStore()
</script>

<script>
export const assets = {
  critical: ["/css/onboarding.css"],
  high: [],
  normal: ["/images/onboarding-bg.jpg"],
}
</script>

