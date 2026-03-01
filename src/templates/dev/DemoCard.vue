<template>
    <div class="flex flex-col gap-2">
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{{ label
        }}</span>
        <div
            :class="['rounded-xl border p-4', dark ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-gray-100 dark:bg-gray-800']">
            <slot />
        </div>
    </div>
</template>

<script setup>
defineProps({ label: String, dark: Boolean });
</script>
