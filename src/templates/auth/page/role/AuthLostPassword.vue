<template>
  <AuthWrapper>
    <AuthLostPassword />
  </AuthWrapper>
</template>
<script setup>
import { AuthWrapper } from '@/templates/auth/Auth.js'
import AuthLostPassword from '@/components/auth/AuthLostPassword.vue'
</script>