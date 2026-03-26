<template>
    <div class="border-b border-current pb-3 opacity-90">
        <h2 class="text-2xl font-bold tracking-tight">
            <span class="mr-2 opacity-50">#</span>{{ title }}
        </h2>
    </div>
</template>

<script setup>
defineProps({ title: String });
</script>
