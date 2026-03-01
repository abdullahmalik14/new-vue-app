<template>
    <DashboardWrapperTwoColContainer>
        <div v-if="isLoadingAssets" class="flex items-center justify-center min-h-[240px] text-gray-500">
            loading
        </div>
        <div v-else-if="assetError" class="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Unable to load dashboard analytics assets: {{ assetError }}
        </div>
        <div v-else class="space-y-6">
            <section class="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                <p class="mt-1 text-sm text-gray-500">
                    Updated automatically once the analytics asset finishes loading.
                </p>
            </section>
        </div>
    </DashboardWrapperTwoColContainer>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import DashboardWrapperTwoColContainer from '@/components/dashboard/DashboardWrapperTwoColContainer.vue';
import AssetHandler from '@/utils/assets/assetsHandlerNew.js';
import { loadAssetsForSection } from '@/utils/assets/assetLibrary.js';

const ASSET_DEPENDENCIES = ['dashboard-metrics-lib'];

const isLoadingAssets = ref(true);
const assetError = ref(null);
const metricsSummary = ref(null);

let handlerInstance = null;

async function loadDashboardMetrics() {
    try {
        const assetsMetadata = await loadAssetsForSection('dashboard-creator');
        const assetConfigs = (assetsMetadata.assetPreloadConfigs || [])
            .map((entry, index) => ({
                name: entry.name || `dashboard-creator-asset-${index}`,
                url: entry.url || entry.src,
                type: entry.type || 'script',
                flags: entry.flags || [],
                priority: entry.priority || 'normal',
                location: entry.location || 'head-last',
                dependencies: entry.dependencies || [],
                defer: entry.defer ?? false,
                async: entry.async ?? false,
                nonce: entry.nonce ?? null,
                crossOrigin: entry.crossOrigin ?? null,
                retry: entry.retry ?? 1,
                timeout: entry.timeout ?? 10000
            }))
            .filter(asset => Boolean(asset.url));

        if (assetConfigs.length === 0) {
            assetError.value = 'No asset metadata configured for dashboard overview.';
            return;
        }

        handlerInstance = new AssetHandler(assetConfigs, { maxConcurrent: 2 });
        const result = await handlerInstance.ensureAssetDependencies(ASSET_DEPENDENCIES, { strict: true });

        if (result.failed.length > 0) {
            assetError.value = `Missing assets: ${result.failed.join(', ')}`;
            return;
        }

        if (typeof window !== 'undefined' && window.dashboardMetrics && typeof window.dashboardMetrics.getSummary === 'function') {
            metricsSummary.value = window.dashboardMetrics.getSummary();
        }
    } catch (error) {
        assetError.value = error.message || 'Failed to load dashboard assets';
    } finally {
        isLoadingAssets.value = false;
    }
}

onMounted(() => {
    loadDashboardMetrics();
});

onBeforeUnmount(() => {
    handlerInstance?.dispose();
    handlerInstance = null;
});
</script>