<template>
  <div class="h-screen md:w-[26.875rem] ">
    <div
      class="flex flex-col h-full [background:linear-gradient(180deg,rgba(255,255,255,0.20)_-4.5%,rgba(255,255,255,0.00)_11.18%),rgba(0,0,0,0.70)] backdrop-blur-[25px] md:shadow-[0px_4px_4px_0px_#00000040]"
    >
      <!-- back-button (for-mobile) -->
      <!-- header-container (mobile) -->
      <div 
        class="flex items-center gap-2 h-14 p-2 bg-black/20 bg-blur-[25px] shrink-0 w-full md:hidden border-b border-[#344054]"
      >
        <span
          class="flex justify-center items-center w-10 h-10 cursor-pointer"
          @click="$emit('close')"
        >
          <img
            v-if="chevronLeftUrl"
            :src="chevronLeftUrl"
            :alt="t('cart.chevronLeftAlt')"
            class="h-6"
          />
        </span>
        <div class="flex flex-grow flex-col">
          <div class="flex items-center gap-2">
            <span class="text-base font-semibold tracking-[0.025rem] text-white">
              {{ cartStore.label || t('cart.title') }}
            </span>
            <!-- Star SVG Icon (Mobile) -->
            <svg 
              @click="setDefault"
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              class="w-5 h-5 cursor-pointer transition-all"
              :fill="cartStore.isDefault ? '#07F468' : 'none'"
              :stroke="cartStore.isDefault ? '#07F468' : 'rgba(255,255,255,0.4)'"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </div>
          <span v-if="cartStore.isDefault" class="text-[0.625rem] text-[#07F468] font-bold uppercase tracking-wider">{{ t('cart.primaryCart') }}</span>
        </div>
      </div>

      <!-- title-container (desktop) -->
      <div
        class="hidden items-center justify-between gap-2 px-4 py-4 border-b border-[#344054] shrink-0 md:flex bg-black/10"
      >
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-3">
            <span class="text-base font-semibold tracking-[0.025rem] text-white">
              {{ cartStore.label || t('cart.title') }}
            </span>
            <div class="flex items-center gap-2">
              <span class="text-[0.625rem] text-white/40 px-1.5 py-0.5 border border-white/20 rounded capitalize">{{ cartStore.cartType }}</span>
              <span v-if="cartStore.isDefault" class="text-[0.625rem] bg-[#07F468]/20 text-[#07F468] px-1.5 py-0.5 border border-[#07F468]/30 rounded font-bold uppercase tracking-wider">{{ t('cart.defaultBadge') }}</span>
            </div>
            <!-- Star SVG Icon (Desktop) -->
            <svg 
              @click="setDefault"
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              class="w-4 h-4 cursor-pointer transition-all"
              :fill="cartStore.isDefault ? '#07F468' : 'none'"
              :stroke="cartStore.isDefault ? '#07F468' : 'rgba(255,255,255,0.4)'"
              :title="cartStore.isDefault ? t('cart.primaryCart') : t('cart.setAsDefault')"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </div>
        </div>
        <button @click="syncLiveData" class="text-[0.625rem] text-[#07F468] hover:text-white transition-colors flex items-center gap-1">
          <i class="fas fa-sync-alt"></i> {{ t('cart.syncLive') }}
        </button>
      </div>

      <!-- cart-container -->
      <div
        class="flex flex-col h-[calc(100vh-3.5rem)] md:h-full [background:linear-gradient(180deg,rgba(255,255,255,0.20)_-4.5%,rgba(255,255,255,0.00)_11.18%),rgba(0,0,0,0.70)] backdrop-blur-[25px] md:[background:none] md:backdrop-blur-0"
      >
        <!-- Quick Actions (Rename/Coupon) -->
        <div class="px-3 py-2 border-b border-[#344054] flex flex-col gap-2">
          <div class="flex gap-2">
            <input 
              v-model="newLabel" 
              class="flex-1 bg-white/5 border border-[#344054] rounded h-8 px-2 text-xs text-white outline-none focus:border-[#07F468]" 
              :placeholder="t('cart.renamePlaceholder')"
            />
            <button @click="renameCart" class="px-3 bg-[#07F468]/10 border border-[#07F468]/30 rounded text-[0.625rem] text-[#07F468] font-bold hover:bg-[#07F468] hover:text-black transition-all">
              {{ t('cart.save') }}
            </button>
          </div>
          <div class="flex gap-2">
            <input 
              v-model="couponCode" 
              :disabled="cartStore.couponCode"
              class="flex-1 bg-white/5 border border-[#344054] rounded h-8 px-2 text-xs text-white outline-none focus:border-[#07F468] disabled:opacity-50" 
              :placeholder="cartStore.couponCode ? t('cart.couponAppliedPlaceholder') : t('cart.couponPlaceholder')"
            />
            <button v-if="!cartStore.couponCode" @click="applyCoupon" class="px-3 bg-white/10 border border-white/20 rounded text-[0.625rem] text-white font-bold hover:bg-white hover:text-black transition-all">
              {{ t('cart.apply') }}
            </button>
            <button v-else @click="removeCoupon" class="px-3 bg-red-500/10 border border-red-500/30 rounded text-[0.625rem] text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all">
              {{ t('cart.remove') }}
            </button>
          </div>
        </div>

        <!-- cart-item-container -->
        <div
          class="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <!-- Empty State -->
          <div
            v-if="cartStore.items.length === 0"
            class="flex flex-col items-center justify-center h-full p-8 text-center"
          >
            <div class="text-6xl mb-4">🛒</div>
            <h3 class="text-xl font-semibold text-white mb-2">{{ t('cart.emptyTitle') }}</h3>
            <p class="text-sm text-white/70 mb-6">
              {{ t('cart.emptyDescription') }}
            </p>
            
            <!-- Quick Test Buttons -->
            <div class="flex flex-col gap-3 w-full max-w-xs">
              <button 
                @click="quickBuy('nba123')"
                class="px-4 py-2 bg-[#07F468] text-black text-xs font-bold rounded hover:opacity-90 transition-all"
              >
               {{ t('cart.addNbaCard') }}
              </button>
              <button 
                @click="quickBuy('item456')"
                class="px-4 py-2 bg-white/10 border border-white/20 text-white text-xs font-bold rounded hover:bg-white/20 transition-all"
              >
               {{ t('cart.addVintageShirt') }}
              </button>
              <p class="text-[0.625rem] text-white/40 mt-2">
                {{ t('cart.lookupTestHint') }}
              </p>
            </div>
          </div>

          <!-- Cart Items -->
          <div v-else>
            <div
              v-for="item in cartStore.items"
              :key="item.productId"
              class="flex border-b border-[#344054]"
            >
              <!-- product-info-container -->
              <div class="flex flex-col gap-4 p-3 flex-grow">
                <div class="flex flex-col">
                  <!-- product-name -->
                  <h3
                    class="text-sm leading-normal font-medium tracking-[0.00875rem] line-clamp-2 text-white"
                  >
                    {{ item.title }}
                  </h3>

                  <!-- seller-info -->
                  <div class="flex items-center gap-2">
                    <div class="flex items-center gap-[0.4168rem] h-[1.875rem]">
                      <div class="w-5 h-5 flex justify-center items-center">
                        <img
                          v-if="sellerAvatarUrl"
                          :src="sellerAvatarUrl"
                          :alt="t('cart.avatarAlt')"
                          class="h-full"
                        />
                      </div>
                      <div class="flex items-center gap-[0.208rem]">
                        <span
                          class="text-[0.625rem] leading-normal font-medium text-[#667085]"
                          >{{ item.seller || t('cart.standardSeller') }}</span
                        >
                        <img
                          v-if="verifiedBadgeUrl"
                          :src="verifiedBadgeUrl"
                          alt=""
                          class="w-[0.5206rem] h-[0.5206rem]"
                        />
                      </div>
                      <span
                        class="text-[0.625rem] leading-normal font-medium tracking-[0.003125rem] text-white opacity-50"
                        >{{ t('cart.shipFromGermany') }}</span
                      >
                    </div>
                  </div>
                </div>

                <div class="flex justify-between">
                  <div class="flex flex-col gap-1">
                    <div class="flex flex-col gap-0.5">
                      <!-- Price with promo -->
                      <h2
                        :class="
                          item.promoCodes?.length > 0
                            ? 'text-[#D8AF0D]'
                            : 'text-[#07F468]'
                        "
                        class="text-base font-semibold"
                      >
                        USD$
                        <span
                          v-if="
                            item.originalPrice && item.promoCodes?.length > 0
                          "
                          class="text-xs leading-normal font-medium line-through text-[#D8AF0D]"
                        >
                          {{ item.originalPrice }}
                        </span>
                        {{ item.price }}
                      </h2>

                      <!-- Promo Codes -->
                      <div
                        v-if="item.promoCodes?.length > 0"
                        class="flex flex-col gap-1"
                      >
                        <div
                          v-for="(code, idx) in item.promoCodes"
                          :key="idx"
                          class="flex justify-center items-center gap-1 w-max h-4 px-[0.3125rem] rounded-[1.875rem] [background:linear-gradient(90deg,#D8AF0D_0%,#9F8009_100%)]"
                        >
                          <img
                            v-if="tagIconUrl"
                            :src="tagIconUrl"
                            :alt="t('cart.tagAlt')"
                            class="w-3 h-3"
                          />
                          <span
                            class="text-[0.625rem] leading-4 font-semibold text-black"
                            >{{ code }}</span
                          >
                        </div>
                      </div>
                    </div>

                    <!-- Shipping -->
                    <span
                      v-if="item.shipping > 0"
                      class="text-[0.625rem] leading-normal tracking-[0.003125rem] text-white"
                    >
                      {{ t('cart.shipping', { amount: item.shipping }) }}
                    </span>

                    <span v-if="item.lastSyncedAt" class="text-[0.5rem] text-[#07F468] opacity-70">
                      <i class="fas fa-check-circle"></i> {{ t('cart.syncAt', { time: new Date(item.lastSyncedAt).toLocaleTimeString() }) }}
                    </span>
                  </div>

                  <!-- Quantity Controls -->
                  <div class="flex items-center gap-2">
                    <img
                      :src="quantityDecreaseIcon(item)"
                      :alt="t('cart.decreaseAlt')"
                      class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(76%)_sepia(26%)_saturate(7143%)_hue-rotate(94deg)_brightness(110%)_contrast(94%)] cursor-pointer"
                      @click="updateQty(item.productId, (item.qty || item.quantity) - 1)"
                    />

                    <div class="flex justify-center items-center w-2 px-2 py-1">
                      <span
                        class="text-sm leading-normal font-medium tracking-[0.00875rem] text-white"
                        >{{ item.qty || item.quantity }}</span
                      >
                    </div>

                    <img
                      v-if="plusCircleUrl"
                      :src="plusCircleUrl"
                      :alt="t('cart.increaseAlt')"
                      class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(76%)_sepia(26%)_saturate(7143%)_hue-rotate(94deg)_brightness(110%)_contrast(94%)] cursor-pointer"
                      @click="updateQty(item.productId, (item.qty || item.quantity) + 1)"
                    />
                  </div>
                </div>
              </div>

              <!-- image-container -->
              <div class="w-20 min-w-[5rem]">
                <img
                  :src="item.image"
                  :alt="item.title"
                  class="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- cart-total-container -->
        <div
          v-if="cartStore.items.length > 0"
          class="flex flex-col border-t border-[#07F468] bg-[#0C111D] shrink-0"
        >
          <!-- detailed-summary -->
          <div class="flex flex-col gap-1 px-4 py-3 border-b border-white/5">
            <div class="flex justify-between text-[0.625rem] text-white/50">
              <span>{{ t('cart.subtotal', { count: cartStore.summary.totalItems }) }}</span>
              <span>${{ cartStore.summary.subtotal.toFixed(2) }}</span>
            </div>
            <div v-if="cartStore.summary.feesTotal > 0" class="flex justify-between text-[0.625rem] text-white/50">
              <span>{{ t('cart.serviceFees') }}</span>
              <span>+${{ cartStore.summary.feesTotal.toFixed(2) }}</span>
            </div>
            <div v-if="cartStore.summary.couponDiscount > 0" class="flex justify-between text-[0.625rem] text-[#F04438]">
              <span>{{ t('cart.couponDiscount') }}</span>
              <span>-${{ cartStore.summary.couponDiscount.toFixed(2) }}</span>
            </div>
            <div v-if="cartStore.summary.planDiscount > 0" class="flex justify-between text-[0.625rem] text-[#2E90FA]">
              <span>{{ t('cart.planDiscount') }}</span>
              <span>-${{ cartStore.summary.planDiscount.toFixed(2) }}</span>
            </div>
          </div>

          <!-- subtotal-container -->
          <div class="flex items-center">
            <div class="flex px-4 py-2.5 flex-grow">
              <div class="flex flex-col gap-0.5">
                <span
                  class="text-[0.625rem] leading-normal font-medium tracking-[0.015rem] text-white/50"
                >
                  {{ t('cart.estimatedTotal') }}
                </span>
                <h3 class="text-xl font-semibold text-[#07F468]">
                  ${{ cartStore.summary.grandTotal.toFixed(2) }}
                </h3>
              </div>
            </div>

            <DashboardPrimaryButton
              :text="t('cart.checkout')"
              variant="bgGreen"
              :rightIcon="checkoutArrowUrl"
              :rightIconClass="`
    w-6 h-6 transition duration-200
    filter brightness-0 invert-0   /* Default: black */
    group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]
  `"
              btnBg="#07f468"
              btnHoverBg="black"
              btnText="black"
              btnHoverText="#07f468"
              @click="handleCheckout"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from 'vue-i18n';
import { useCartStore } from "@/stores/useCartStore.js";
import { FlowHandler } from "@/services/flow-system/FlowHandler";
import flowRefreshManager from "@/services/flow-system/flowRefreshManager";
import DashboardPrimaryButton from "@/components/ui/buttons/DashboardPrimaryButton.vue";
import { preloadIcons } from "@/utils/preload";
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { t } = useI18n();
const cartStore = useCartStore();
const newLabel = ref("");
const couponCode = ref("");

const { url: chevronLeftUrl } = useAssetUrl('icon.notification.chevronLeft');
const { url: sellerAvatarUrl } = useAssetUrl('checkout.demo.creatorAvatar');
const { url: verifiedBadgeUrl } = useAssetUrl('icon.media.verified');
const { url: tagIconUrl } = useAssetUrl('cart.demo.tagIcon');
const { url: minusCircleUrl } = useAssetUrl('cart.demo.minusCircle');
const { url: plusCircleUrl } = useAssetUrl('cart.demo.plusCircle');
const { url: trashBinUrl } = useAssetUrl('checkout.demo.trashBin');
const { url: checkoutArrowUrl } = useAssetUrl('cart.demo.checkoutArrow');

function quantityDecreaseIcon(item) {
  return (item.qty > 1 || item.quantity > 1) ? minusCircleUrl.value : trashBinUrl.value;
}

// Methods using FlowHandler
const updateQty = async (productId, newQty) => {
  if (newQty < 1) {
    removeItem(productId);
  } else {
    // Optimistic update
    cartStore.updateItemQuantityLocal({ productId, quantity: newQty });
    
    await FlowHandler.run("cart.updateQuantity", { 
      productId, 
      quantity: newQty 
    });
  }
};

const removeItem = async (productId) => {
  // Optimistic update
  cartStore.removeItemLocal(productId);
  
  await FlowHandler.run("cart.removeItem", { productId });
};

const renameCart = async () => {
  if (!newLabel.value.trim()) return;
  const sessionId = localStorage.getItem("sessionId") || "guest";
  await FlowHandler.run("cart.rename", { sessionId, label: newLabel.value });
  newLabel.value = "";
};

const applyCoupon = async () => {
  if (!couponCode.value.trim()) return;
  const sessionId = localStorage.getItem("sessionId") || "guest";
  await FlowHandler.run("cart.applyCoupon", { sessionId, couponCode: couponCode.value.toUpperCase() });
  couponCode.value = "";
};

const removeCoupon = async () => {
  const sessionId = localStorage.getItem("sessionId") || "guest";
  await FlowHandler.run("cart.removeCoupon", { sessionId });
};

const quickBuy = async (productId) => {
  const sessionId = localStorage.getItem("sessionId") || "guest";
  await FlowHandler.run("cart.addItem", { 
    productId, 
    quantity: 1,
    sessionId
  });
};

const syncLiveData = async () => {
  const sessionId = localStorage.getItem("sessionId") || "guest";
  await FlowHandler.run("cart.attachLiveData", { sessionId });
};

const setDefault = async () => {
  console.log("🌟 [UI] Setting cart as default...", cartStore.label);
  const sessionId = localStorage.getItem("sessionId") || "guest";
  // Optimistic update
  cartStore.isDefault = true;
  // We call the flow to mark this cart as default in the backend
  await FlowHandler.run("cart.setAsDefault", { sessionId });
};

const handleCheckout = () => {
  console.log("Checkout clicked!", cartStore.items);
};

// Lifecycle hooks
onMounted(() => {
  preloadIcons([
    minusCircleUrl.value,
    trashBinUrl.value,
    plusCircleUrl.value,
  ].filter(Boolean));

  // Start background sync from registry (includes initial fetch)
  flowRefreshManager.startFromRegistry("cart.fetch", {
    sessionId: localStorage.getItem("sessionId") || "guest",
  }, { runImmediately: true });
});

onUnmounted(() => {
  flowRefreshManager.stop("cart.fetch");
});
</script>

<style scoped>
/* Any specific styles if needed */
</style>
