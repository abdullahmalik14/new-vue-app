<template>
    <div class="flex flex-col gap-2">
        <div class="flex justify-between items-end">
            <span class="text-xs font-semibold uppercase tracking-widest" :class="dark ? 'text-white/70' : 'text-gray-500 dark:text-white/70'">{{ label }}</span>
            <button v-if="code" @click="showCode = !showCode" 
                class="text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors text-inherit font-medium border border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-3.5 h-3.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                </svg>
                {{ showCode ? 'Hide Code' : 'Show Code' }}
            </button>
        </div>
        <div
            :class="['rounded-xl border p-4 transition-all duration-300', dark ? 'border-white/10 bg-transparent' : 'border-white/20 bg-white/5 shadow-sm']">
            <slot />
        </div>
        
        <!-- Code Reveal Block -->
        <div v-show="code && showCode" class="mt-1 text-sm bg-[#1e1e1e] rounded-xl overflow-hidden shadow-inner border border-gray-700/50">
            <div class="flex justify-between items-center px-4 py-2 bg-[#2d2d2d] border-b border-gray-700/50">
                <span class="text-[0.65rem] font-mono text-gray-400 uppercase tracking-wider">Vue Usage</span>
                <button @click="copyCode" class="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                    <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.40.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5 text-green-400">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {{ copied ? 'Copied!' : 'Copy' }}
                </button>
            </div>
            <pre class="p-4 overflow-x-auto text-[#d4d4d4] font-mono text-[0.8rem] leading-relaxed"><code>{{ code }}</code></pre>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    label: String,
    dark: Boolean,
    code: {
        type: String,
        default: ""
    }
});

const showCode = ref(false);
const copied = ref(false);

const copyCode = async () => {
    if (!props.code) return;
    try {
        await navigator.clipboard.writeText(props.code);
        copied.value = true;
        setTimeout(() => copied.value = false, 2000);
    } catch (e) {
        console.error('Failed to copy', e);
    }
};
</script>
