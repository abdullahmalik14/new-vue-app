<template>
  <div class="h-screen md:w-[26.875rem] ">
    <div
      class="flex flex-col h-full [background:linear-gradient(180deg,rgba(255,255,255,0.20)_-4.5%,rgba(255,255,255,0.00)_11.18%),rgba(0,0,0,0.70)] backdrop-blur-[25px] md:shadow-[0px_4px_4px_0px_#00000040]"
    >
      <!-- back-button (for-mobile) -->
      <div
        class="flex justify-start items-center h-14 p-2 bg-black/20 bg-blur-[25px] shrink-0 w-full md:hidden"
      >
        <span
          class="flex justify-center items-center w-10 h-10 cursor-pointer"
          @click="$emit('close')"
        >
          <img
            src="https://i.ibb.co.com/SwdkNf80/chevron-left.webp"
            alt="chevron-left"
            class="h-6"
          />
        </span>
        <span class="text-base font-semibold tracking-[0.025rem] text-white"
          >Your Cart</span
        >
      </div>

      <!-- title-container (desktop) -->
      <div
        class="hidden items-center gap-2 px-2 py-4 border-b border-transparent shrink-0 md:flex"
      >
        <span class="text-base font-semibold tracking-[0.025rem] text-white"
          >Your Cart</span
        >
      </div>

      <!-- cart-container -->
      <div
        class="flex flex-col h-[calc(100vh-3.5rem)] md:h-full [background:linear-gradient(180deg,rgba(255,255,255,0.20)_-4.5%,rgba(255,255,255,0.00)_11.18%),rgba(0,0,0,0.70)] backdrop-blur-[25px] md:[background:none] md:backdrop-blur-0"
      >
        <!-- cart-item-container -->
        <div
          class="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <!-- Empty State -->
          <div
            v-if="store.items.length === 0"
            class="flex flex-col items-center justify-center h-full p-8 text-center"
          >
            <div class="text-6xl mb-4">🛒</div>
            <h3 class="text-xl font-semibold text-white mb-2">Cart is Empty</h3>
            <p class="text-sm text-white/70 mb-4">
              Open console and run cart commands to add items
            </p>
            <code class="text-xs bg-black/40 px-3 py-2 rounded text-[#07F468]">
              Check console for commands →
            </code>
          </div>

          <!-- Cart Items -->
          <div v-else>
            <div
              v-for="item in store.items"
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
                          src="https://i.ibb.co.com/67B4Cz6d/Frame-1410098582.webp"
                          alt="avatar"
                          class="h-full"
                        />
                      </div>
                      <div class="flex items-center gap-[0.208rem]">
                        <span
                          class="text-[0.625rem] leading-normal font-medium text-[#667085]"
                          >{{ item.seller }}</span
                        >
                        <img
                          src="https://i.ibb.co.com/nMhY8CpS/svgviewer-png-output-22.webp"
                          alt=""
                          class="w-[0.5206rem] h-[0.5206rem]"
                        />
                      </div>
                      <span
                        class="text-[0.625rem] leading-normal font-medium tracking-[0.003125rem] text-white opacity-50"
                        >Ship from Germany</span
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
                            src="https://i.ibb.co.com/fztC70H0/tag.webp"
                            alt="tag"
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
                      +${{ item.shipping }} shipping
                    </span>
                  </div>

                  <!-- Quantity Controls -->
                  <div class="flex items-center gap-2">
                    <img
                      :src="
                        item.qty > 1
                          ? 'https://i.ibb.co.com/LXwdW794/minus-circle.webp'
                          : 'https://i.ibb.co.com/3YVrnBJz/trash-bin.webp'
                      "
                      alt="decrease"
                      class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(76%)_sepia(26%)_saturate(7143%)_hue-rotate(94deg)_brightness(110%)_contrast(94%)] cursor-pointer"
                      @click="updateQty(item.productId, item.qty - 1)"
                    />

                    <div class="flex justify-center items-center w-2 px-2 py-1">
                      <span
                        class="text-sm leading-normal font-medium tracking-[0.00875rem] text-white"
                        >{{ item.qty }}</span
                      >
                    </div>

                    <img
                      src="https://i.ibb.co.com/VYqPvctj/plus-circle.webp"
                      alt="increase"
                      class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(76%)_sepia(26%)_saturate(7143%)_hue-rotate(94deg)_brightness(110%)_contrast(94%)] cursor-pointer"
                      @click="updateQty(item.productId, item.qty + 1)"
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
          v-if="store.items.length > 0"
          class="flex border-t border-b border-[#07F468] bg-[#0C111D] shrink-0"
        >
          <!-- subtotal-container -->
          <div class="flex px-3 py-2.5 flex-grow">
            <div class="flex flex-col gap-1">
              <span
                class="text-xs leading-normal font-medium tracking-[0.015rem] text-white"
              >
                Subtotal ({{ totalItems }} items)
              </span>
              <h3 class="text-2xl font-semibold text-[#07F468]">
                ${{ subtotal }}
              </h3>
            </div>
          </div>

          <!-- checkout-button -->
          <!-- <button class="flex justify-center items-center gap-2.5 p-3 outline-none border-none bg-[#07F468] group hover:bg-black transition-colors" @click="handleCheckout">
                        <span class="text-lg font-medium text-black align-middle group-hover:text-[#07F468]">CHECK OUT</span>
                        <img src="https://i.ibb.co.com/v28S0Zt/arrow-up-right.webp" alt="arrow-up-right" class="w-6 h-6 [filter:brightness(0)_saturate(100%)] group-hover:[filter:brightness(0)_saturate(100%)_invert(76%)_sepia(26%)_saturate(7143%)_hue-rotate(94deg)_brightness(110%)_contrast(94%)]">
                    </button> -->

          <ButtonComponent
            text="ChECK OUT"
            variant="bgGreen"
            :rightIcon="'https://i.ibb.co.com/v28S0Zt/arrow-up-right.webp'"
            :rightIconClass="`
  w-6 h-6 transition duration-200
  filter brightness-0 invert-0   /* Default: black */
  group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]
`"
            btnBg="#07f468"
            btnHoverBg="black"
            btnText="black"
            btnHoverText="#07f468"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted, onUnmounted } from "vue";
import { CartHandler } from "@/composables/cartHandler.js"; 
import { preloadIcons } from "@/utils/preload";
import ButtonComponent from "./button/ButtonComponent.vue";

// Reactive store
const store = reactive({
  items: [],
});

let cartHandler = null;

// Computed properties
const totalItems = computed(() => {
  return store.items.reduce((sum, item) => sum + item.qty, 0);
});

const subtotal = computed(() => {
  return store.items
    .reduce((sum, item) => sum + item.price * item.qty, 0)
    .toFixed(2);
});

// Methods
const updateQty = (productId, newQty) => {
  if (newQty < 1) {
    removeItem(productId);
  } else {
    window.dispatchEvent(
      new CustomEvent("cart:updateQty", {
        detail: { productId, qty: newQty },
      })
    );
  }
};

const removeItem = (productId) => {
  window.dispatchEvent(
    new CustomEvent("cart:removeItem", {
      detail: { productId },
    })
  );
};

const handleCheckout = () => {
  console.log("Checkout clicked!", store.items);
  // Add your checkout logic here
};

// Lifecycle hooks
onMounted(() => {
  preloadIcons([
    "https://i.ibb.co.com/LXwdW794/minus-circle.webp",
    "https://i.ibb.co.com/3YVrnBJz/trash-bin.webp",
    "https://i.ibb.co.com/VYqPvctj/plus-circle.webp",
  ]);

  cartHandler = new CartHandler(store);

  // Log console commands
  console.log(
    "%c🛒 CART CONSOLE COMMANDS 🛒",
    "color: #07F468; font-size: 16px; font-weight: bold;"
  );
  console.log("%cAdd Item:", "color: #07F468; font-weight: bold;");
  console.log(`window.dispatchEvent(new CustomEvent('cart:add', {
  detail: {
    item: {
      title: "NBA Hoops Card",
      productId: "nba123",
      qty: 1,
      price: 12.23,
      originalPrice: 20.00,
      shipping: 12.23,
      seller: "Princess Carrot Pop",
      image: "https://i.ibb.co.com/70sHrpv/featured-media-bg.webp",
      promoCodes: ["PROMOCODE2025", "MEMBER BENEFIT"]
    }
  }
}));`);

  console.log("%cRemove Item:", "color: #07F468; font-weight: bold;");
  console.log(
    `window.dispatchEvent(new CustomEvent('cart:removeItem', { detail: { productId: "nba123" } }));`
  );

  console.log("%cUpdate Quantity:", "color: #07F468; font-weight: bold;");
  console.log(
    `window.dispatchEvent(new CustomEvent('cart:updateQty', { detail: { productId: "nba123", qty: 5 } }));`
  );

  console.log("%cClear Cart:", "color: #07F468; font-weight: bold;");
  console.log(`window.dispatchEvent(new CustomEvent('cart:clear'));`);
});

onUnmounted(() => {
  if (cartHandler) {
    cartHandler.destroy();
  }
});
</script>
