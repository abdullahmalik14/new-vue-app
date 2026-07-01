import { ref, computed, onMounted } from 'vue';
import { getAssetUrl, getAssetUrlSync } from '@/systems/assets/assetLibrary.js';
import { getBundledAssetMap } from '@/systems/assets/assetMapSource.js';

const ASSET_FLAGS = {
  slideImage: 'mediaUploader.slideImage',
  deleteIcon: 'mediaUploader.deleteIcon',
  searchIcon: 'mediaUploader.searchIcon',
  thumbA: 'mediaUploader.thumbA',
  thumbB: 'mediaUploader.thumbB',
  videoIcon: 'icon.media.play',
  globeIcon: 'icon.globe',
  plusIcon: 'mediaUploader.icon.plus',
  minusIcon: 'mediaUploader.icon.minus',
  expandIcon: 'mediaUploader.icon.expand',
  calendarIcon: 'mediaUploader.icon.calendar',
  blurIcon: 'mediaUploader.icon.blur',
  chevronDownIcon: 'mediaUploader.icon.chevronDown',
  uploadPlaceholderIcon: 'mediaUploader.icon.uploadPlaceholder',
  postPreviewAvatar: 'mediaUploader.postPreview.avatar',
  postPreviewVerified: 'mediaUploader.postPreview.verified',
  tagTabAz: 'mediaUploader.tagTab.az',
  tagTabSort: 'mediaUploader.tagTab.sort',
  tagTabHobby: 'mediaUploader.tagTab.hobby',
  tagTabClothing: 'mediaUploader.tagTab.clothing',
  tagTabScene: 'mediaUploader.tagTab.scene',
  tagTabIdentity: 'mediaUploader.tagTab.identity',
  tagTabBody: 'mediaUploader.tagTab.body',
  sampleVideo: 'media.demo.sampleVideo',
  performerAvatar: 'mediaUploader.demo.performerAvatar',
  customImage: 'mediaUploader.demo.customImage',
};

const bundledProduction = getBundledAssetMap().production || {};

function resolveBundledFlag(flag) {
  return bundledProduction[flag] || '';
}

const assetsVersion = ref(0);
let warmPromise = null;

function warmAllAssets() {
  if (!warmPromise) {
    warmPromise = Promise.all(
      Object.values(ASSET_FLAGS).map((flag) => getAssetUrl(flag).catch(() => null)),
    ).then(() => {
      assetsVersion.value += 1;
    });
  }
  return warmPromise;
}

export function useMediaUploaderAssets() {
  const assets = computed(() => {
    void assetsVersion.value;
    const resolved = {};
    for (const [key, flag] of Object.entries(ASSET_FLAGS)) {
      resolved[key] = getAssetUrlSync(flag) || resolveBundledFlag(flag) || '';
    }
    return resolved;
  });

  onMounted(() => {
    warmAllAssets();
  });

  warmAllAssets();

  return { assets };
}
