<template>
  <AuthLayout>
    <div class="relative z-20">
      <p>{{ t(messageKey) }}</p>
    </div>
  </AuthLayout>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { AuthLayout } from '@/templates/auth'

defineProps({
  messageKey: {
    type: String,
    required: true,
  },
})

const { t } = useI18n()
</script>
