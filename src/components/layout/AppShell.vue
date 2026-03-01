<!-- File: src/components/layout/app/AppShell.vue -->
<template>
  <div class="   flex flex-col">
    <!-- Global Header / Nav -->
    <header class="w-full border-b bg-white/80 backdrop-blur">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <slot name="brand">
          <h1 class="text-base font-semibold">Vue App</h1>
        </slot>

        <!-- Global Locale Switcher (truly global) -->
        <LanguageSwitcher />
      </div>
    </header>

    <!-- Main application outlet -->
    <!-- <main class="flex-1">
      <router-view />
    </main> -->

    <!-- Optional global footer -->
    <!-- <footer class="border-t text-xs text-gray-500 px-4 py-3">
      <slot name="footer">© {{ new Date().getFullYear() }}</slot>
    </footer> -->
  </div>
</template>

<script setup>
import LanguageSwitcher from '@/components/ui/nav/language/LanguageSwitcher.vue';
</script>