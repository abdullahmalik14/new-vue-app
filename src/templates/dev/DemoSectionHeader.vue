<template>
    <div class="border-b-2 border-gray-300 dark:border-gray-700 pb-3">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 tracking-tight">
            <span class="text-blue-500 mr-2">#</span>{{ title }}
        </h2>
    </div>
</template>

<script setup>
defineProps({ title: String });
</script>
