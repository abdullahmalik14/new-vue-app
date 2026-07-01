import { ref, computed, onMounted } from 'vue';
import { getAssetUrl, getAssetUrlSync } from '@/systems/assets/assetLibrary.js';
import { getBundledAssetMap } from '@/systems/assets/assetMapSource.js';

const ASSET_FLAGS = {
  featuredMediaBg: 'checkout.demo.featuredMediaBg',
  creatorAvatar: 'checkout.demo.creatorAvatar',
  profileSlideinBg: 'checkout.demo.profileSlideinBg',
  planLogo: 'checkout.demo.planLogo',
  planLogoNoBg: 'checkout.demo.planLogoNoBg',
  communicationIcon: 'checkout.icon.communication',
  generalIcon: 'checkout.icon.general',
  paymentIcon: 'checkout.icon.payment',
  mailIcon: 'checkout.icon.mail',
  cardBg: 'checkout.demo.cardBg',
  trashIcon: 'checkout.demo.trashIcon',
  trashBin: 'checkout.demo.trashBin',
  visaLogo: 'checkbox.demo.visaLogo',
  calendarIcon: 'checkout.demo.calendarIcon',
  chevronLeft: 'icon.notification.chevronLeft',
  chevronArrows: 'checkout.demo.chevronArrows',
  verifiedTick: 'icon.media.verified',
  closeIcon: 'icon.notification.close',
  financeIcon: 'checkout.demo.financeIcon',
  faceSmile: 'checkout.demo.faceSmile',
  addressIcon: 'checkout.demo.addressIcon',
  alertIcon: 'icon.notification.alertIcon',
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

export function useCheckoutDemoAssets() {
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
