<template>
    <div class="flex flex-col gap-0">
        <button
            type="button"
            class="self-start flex items-center gap-1.5 text-[0.7rem] font-medium text-gray-500 hover:text-gray-800 dark:text-white/50 dark:hover:text-white/80 transition-colors mt-1 px-0 py-0"
            @click="open = !open"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-3 h-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
            </svg>
            {{ open ? t('demo.showCodeToggle.hideCode') : t('demo.showCodeToggle.showCode') }}
        </button>
        <div v-if="open" class="mt-2 rounded-lg overflow-hidden bg-[#1a1a1a] max-w-[350px]">
            <div class="flex justify-between items-center px-3 py-1.5 bg-[#252525]">
                <span class="text-[0.6rem] font-mono text-white/30 uppercase tracking-wider">{{ t('demo.showCodeToggle.vueLabel') }}</span>
                <button type="button" class="text-[0.65rem] text-white/40 hover:text-white/70 transition-colors" @click="copy">
                    {{ copied ? t('demo.showCodeToggle.copied') : t('demo.showCodeToggle.copy') }}
                </button>
            </div>
            <pre class="p-3 overflow-x-auto text-[0.72rem] leading-relaxed text-[#d4d4d4] font-mono whitespace-pre-wrap"><code>{{ code }}</code></pre>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
    code: {
        type: String,
        default: '',
    },
});

const open = ref(false);
const copied = ref(false);

async function copy() {
    await navigator.clipboard.writeText(props.code).catch(() => { });
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
}
</script>
