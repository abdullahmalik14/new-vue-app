<script setup>
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from "vue";

// Props (Receives single tier object)
const props = defineProps({
  tier: {
    type: Object,
    required: true,
  },
});

/* ===============================
   STATE & LOGIC
================================ */
const activePlan = ref(props.tier.defaultPlan || "6m");
const showMorePlans = ref(false);
const cardRef = ref(null); // Ref for clamping context

// Helper to get active plan details
const currentPlan = computed(() => {
  return (
    props?.tier?.plans?.find((p) => p?.id === activePlan?.value) ||
    props?.tier?.plans?.[0]
  );
});

/* Activate plan */
function activatePlan(planId) {
  activePlan.value = planId;
  showMorePlans.value = false;
}

/* Toggle popup */
function toggleMorePlans() {
  showMorePlans.value = !showMorePlans.value;
}

/* ===============================
   LINE CLAMP LOGIC (Ported)
================================ */
function clampDescription() {
  if (!cardRef.value) return;

  const content = cardRef.value.querySelector("[data-tier-content]");
  const descWrap = cardRef.value.querySelector("[data-tier-description]");
  const descText = cardRef.value.querySelector("[data-tier-description-text]");
  const readMore = cardRef.value.querySelector("[data-read-more]");
  const featureList = cardRef.value.querySelector("[data-feature-list]");

  if (!content || !descWrap || !descText) return;

  descText.style.webkitLineClamp = "unset";

  const contentRect = content.getBoundingClientRect();
  const descRect = descWrap.getBoundingClientRect();

  let usedBelow = 0;
  if (readMore) usedBelow += readMore.getBoundingClientRect().height;
  if (featureList) usedBelow += featureList.getBoundingClientRect().height;

  usedBelow += window.innerWidth >= 768 ? 24 : 16;

  const availableHeight = contentRect.bottom - descRect.top - usedBelow;

  if (availableHeight <= 0) return;

  const style = getComputedStyle(descText);
  const lineHeight = parseFloat(style.lineHeight);

  if (!lineHeight) return;

  const maxLines = Math.floor(availableHeight / lineHeight);

  if (maxLines > 0) {
    descText.style.display = "-webkit-box";
    descText.style.webkitBoxOrient = "vertical";
    descText.style.overflow = "hidden";
    descText.style.webkitLineClamp = maxLines;
  }
}

onMounted(async () => {
  await nextTick();
  clampDescription();
  window.addEventListener("resize", clampDescription);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", clampDescription);
});
</script>

<template>
  <div
    ref="cardRef"
    data-tier-card-wrapper
    class=""
  >
    <div
      class="w-full h-[100svh] rounded-[0.3125rem] sm:max-h-[40.6875rem] sm:w-[24rem] md:h-[37.625rem]"
      :class="tier?.theme?.shadow"
      :style="{
        backgroundImage: `linear-gradient(180deg,rgba(0,0,0,0.14) 30%,rgba(0,0,0,0.7) 100%), url('${tier.backgroundImage}')`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }"
    >
      <div
        class="h-full flex flex-col bg-black/30 backdrop-blur-[5px] rounded-[0.3125rem]"
      >
        <div
          data-tier-content
          class="flex flex-col gap-3 px-4 pt-5 pb-4 overflow-y-hidden grow [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none]"
        >
          <span class="flex items-center">
            <div
              class="w-full z-[5] relative overflow-hidden drop-shadow-[0px_4px_18px_#00000080] hover:overflow-visible hover:cursor-pointer group"
            >
              <h2
                class="text-[1.875rem] leading-[2.375rem] font-semibold overflow-hidden line-clamp-2 text-white dark:text-[#e8e6e3]"
              >
                {{ tier?.title }}
              </h2>
              <div
                class="absolute z-[2] flex flex-col items-start w-full max-w-[22.4375rem] md:max-w-[21.5rem] opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto text-xs leading-normal font-medium text-white py-2 px-3 rounded-lg bg-[#101828B2] dark:bg-[rgba(14,19,32,0.9)] dark:text-[#dbd8d3] [box-shadow:0px_2px_4px_-2px_#1018280F,0px_4px_8px_-2px_#1018281A] [backdrop-filter:blur(25px)] left-1/2 top-full translate-x-[-50%] translate-y-2 before:content-[''] before:absolute before:w-0 before:h-0 before:left-1/2 before:top-[-5px] before:-translate-x-1/2 before:border-[6px] before:border-t-0 before:border-l-transparent before:border-r-transparent before:border-b-[#101828B2] dark:before:border-b-[rgba(14,19,32,0.9)]"
              >
                {{ tier?.title }}
              </div>
            </div>
          </span>

          <div
            class="flex items-center gap-2.5 drop-shadow-[0px_2px_12px_#000000BF]"
          >
            <div class="flex items-center gap-[0.0625rem]">
              <span
                class="text-xs font-medium leading-normal text-white dark:text-[#e8e6e3]"
                >{{ tier?.stats?.video }}</span
              >
              <img
                src="https://i.ibb.co.com/sdBL6k4R/video.webp"
                alt="video"
                class="w-4 h-4 [filter:brightness(100%)]"
              />
            </div>
            <div
              class="h-[0.188rem] w-[0.188rem] bg-white block rounded-full"
            ></div>
            <div class="flex items-center gap-[0.0625rem]">
              <span
                class="text-xs font-medium leading-normal text-white dark:text-[#e8e6e3]"
                >{{ tier?.stats?.image }}</span
              >
              <img
                src="https://i.ibb.co.com/Qjn50qJy/Images.webp"
                alt="Images"
                class="w-4 h-4 [filter:brightness(100%)]"
              />
            </div>
            <div
              class="h-[0.188rem] w-[0.188rem] bg-white block rounded-full"
            ></div>
            <div class="flex items-center gap-[0.0625rem]">
              <span
                class="text-xs font-medium leading-normal text-white dark:text-[#e8e6e3]"
                >{{ tier?.stats?.audio }}</span
              >
              <img
                src="https://i.ibb.co.com/1JYD4qyw/audio.webp"
                alt="audio"
                class="w-4 h-4 [filter:brightness(100%)]"
              />
            </div>
          </div>

          <div class="flex items-center gap-2 py-2">
            <div
              class="flex bg-white/15 rounded-[3.125rem] backdrop-blur-[25px] w-1/2 md:w-full dark:bg-[#181a1b26]"
            >
              <button
                v-for="plan in tier.plans"
                :key="plan.id"
                @click.stop="activatePlan(plan.id)"
                :class="
                  activePlan === plan?.id
                    ? '!flex bg-black dark:bg-[#181a1b]'
                    : 'hidden md:flex'
                "
                class="justify-center items-center gap-0.5 px-2.5 py-1.5 rounded-[3.125rem] w-full cursor-pointer md:grow"
              >
                <span
                  class="text-xs leading-normal font-medium whitespace-nowrap text-white dark:text-[#e8e6e3]"
                  >{{ plan.label }}</span
                >
                <span
                  v-if="plan.discount"
                  class="text-xs leading-normal font-medium text-[#FFED29] dark:text-[#ffee37]"
                  >{{ plan.discount }}</span
                >
              </button>
            </div>
            <button
              @click.stop="toggleMorePlans"
              class="flex justify-center items-center gap-0.5 px-2.5 py-1.5 rounded-[3.125rem] bg-white/15 backdrop-blur-[25px] cursor-pointer w-1/2 md:hidden dark:bg-[#181a1b26]"
            >
              <span
                class="text-xs leading-normal font-medium text-white dark:text-[#e8e6e3]"
                >More Plans</span
              >
            </button>
          </div>

          <div class="flex gap-2">
            <div class="flex items-baseline">
              <span
                class="text-xl leading-normal font-semibold"
                :class="tier?.theme?.textSecondary"
                >USD$</span
              >
              <span
                class="text-4xl leading-[2.75rem] font-semibold tracking-[-0.045rem]"
                :class="tier?.theme?.textSecondary"
                >{{ currentPlan?.price }}</span
              >
            </div>

            <div class="flex flex-col justify-between">
              <div
                v-if="tier?.flashSale?.active"
                class="flex items-baseline gap-1 relative pl-4 pr-1 rounded bg-black ml-[0.3125rem] flex-wrap dark:bg-[#181a1b] max-[360px]:py-1 max-[360px]:w-min"
              >
                <img
                  src="https://i.ibb.co.com/nqWs4Ny4/flash.webp"
                  alt="flash"
                  class="absolute -left-1.5 top-1/2 -translate-y-1/2 h-5"
                />

                <span
                  class="text-[0.6875rem] leading-none whitespace-nowrap"
                  :class="tier.theme.flashLabel"
                >
                  Sale Ends in
                </span>

                <div class="flex items-center gap-0.5">
                  <span
                    class="text-xs leading-normal font-bold"
                    :style="{ color: tier.theme.flashText }"
                  >
                    {{ tier.flashSale.endsIn }}
                  </span>
                </div>
              </div>

              <span
                v-if="tier?.flashSale?.active"
                class="text-xs leading-normal font-medium line-through text-white dark:text-[#e8e6e3]"
              >
                {{ tier?.flashSale?.originalPrice }}
              </span>
            </div>
          </div>

          <div
            data-tier-description
            class="flex flex-col md:gap-2 drop-shadow-[0px_2px_12px_0px_#000000BF]"
          >
            <p
              data-tier-description-text
              class="text-sm drop-shadow-[0px_2px_4px_-2px_#1018280F,0px_4px_8px_-2px_#1018281A] text-white dark:text-[#e8e6e3]"
            >
              {{ tier?.description }}
            </p>
            <button data-read-more class="flex items-center gap-0.5">
              <span
                class="text-xs leading-normal font-medium text-[#D0D5DD] dark:text-[#cfcac4]"
                >READ MORE</span
              >
              <img
                src="https://i.ibb.co.com/v4YdjnyQ/double-arrows.webp"
                alt="double-arrows"
                class="w-4 h-4"
              />
            </button>
          </div>

          <ul
            data-feature-list
            class="flex flex-col gap-1 drop-shadow-[0px_2px_12px_0px_#000000BF]"
          >
            <li class="flex items-start gap-4">
              <div class="flex items-center gap-2 w-1/2">
                <img
                  src="https://i.ibb.co.com/qYmSQNzZ/take-coin.webp"
                  class="w-4 h-4"
                /><span
                  class="text-xs leading-normal font-medium text-white dark:text-[#e8e6e3]"
                  >Free Tokens</span
                >
              </div>
              <span
                class="text-sm font-medium text-white dark:text-[#e8e6e3] w-1/2"
                >100 tokens everyday</span
              >
            </li>
            <li class="flex items-start gap-4">
              <div class="flex items-center gap-2 w-1/2">
                <img
                  src="https://i.ibb.co.com/JWqTj09z/cart.webp"
                  class="w-4 h-4"
                /><span
                  class="text-xs leading-normal font-medium text-white dark:text-[#e8e6e3]"
                  >Merch Discount</span
                >
              </div>
              <span
                class="text-sm font-medium text-white dark:text-[#e8e6e3] w-1/2"
                >10% off</span
              >
            </li>
            <li class="flex items-start gap-4">
              <div class="flex items-center gap-2 w-1/2">
                <img
                  src="https://i.ibb.co.com/Mxk1cLRC/image.webp"
                  class="w-4 h-4"
                /><span
                  class="text-xs leading-normal font-medium text-white dark:text-[#e8e6e3]"
                  >PPV Discount</span
                >
              </div>
              <span
                class="text-sm font-medium text-white dark:text-[#e8e6e3] w-1/2"
                >10% off</span
              >
            </li>
            <li class="flex items-start gap-4">
              <div class="flex items-center gap-2 w-1/2">
                <img
                  src="https://i.ibb.co.com/JWqTj09z/cart.webp"
                  class="w-4 h-4"
                /><span
                  class="text-xs leading-normal font-medium text-white dark:text-[#e8e6e3]"
                  >Custom Request</span
                >
              </div>
              <span
                class="text-sm font-medium text-white dark:text-[#e8e6e3] w-1/2"
                >5% off</span
              >
            </li>
          </ul>
        </div>

        <div
          v-if="tier?.footer?.type === 'standard'"
          class="flex cursor-pointer rounded-t-[0.625rem] w-full min-h-fit mt-auto relative shadow-[0px_-8px_24px_0px_#FF8FBA40] bg-black dark:bg-[#181a1b]"
        >
          <div class="flex items-center z-[1] w-full min-h-[5rem]">
            <div class="flex flex-col gap-2 pl-2 py-2 w-full">
              <div class="flex flex-col">
                <h3 class="text-lg font-bold"  :style="{ color: tier.theme.textPrimary }">
                  {{ currentPlan?.label }} for USD${{ currentPlan?.price }}
                </h3>
                <p
                  class="text-[0.65625rem] leading-[1.125rem]"
                  :class="tier?.theme?.textReNew"
                >
                  Renews at USD${{ currentPlan?.price }} every
                  {{ currentPlan?.label }}
                </p>
              </div>
              <div class="flex flex-col gap-[0.4375rem]">
                <div
                  class="w-full h-[0.3125rem] rounded-[0.3125rem] bg-white/20 dark:bg-[#181a1b33]"
                >
                  <div
                    class="h-full rounded-[0.3125rem]"
                    :class="tier?.theme?.barColor"
                    :style="{ width: tier?.footer?.progress?.width }"
                  ></div>
                </div>
                <div class="flex justify-between gap-1">
                  <span
                    class="text-xs leading-normal font-medium"
                    :class="tier.theme.barTextColor"
                    >{{ tier?.footer?.progress?.leftText }}</span
                  >
                  <span
                    class="text-xs leading-normal font-medium text-[#D0D5DD] dark:text-[#cfcac4]"
                    >{{ tier?.footer?.progress?.rightText }}</span
                  >
                </div>
              </div>
            </div>
          </div>
          <div
            class="flex justify-center items-center pl-8 pr-2.5 w-max z-[0] bg-cover bg-no-repeat"
            :style="{ backgroundImage: tier?.theme?.buttonBgImage }"
          >
            <span
              class="text-base font-bold italic text-[#0C111D] dark:text-[#dbd8d3]"
              v-html="tier?.footer?.buttonText"
            ></span>
          </div>
        </div>

        <div
          v-else-if="tier?.footer?.type === 'spend'"
          class="flex cursor-pointer rounded-t-[0.625rem] w-full min-h-fit mt-auto relative shadow-[0px_-8px_24px_0px_#FF8FBA40] bg-black dark:bg-[#181a1b]"
        >
          <div class="flex items-center z-[1] w-full min-h-[5rem]">
            <div class="flex flex-col gap-2 p-2 w-full">
              <div class="flex flex-col">
                <h3 class="text-lg font-bold" :class="tier?.theme?.textPrimary">
                  {{ currentPlan?.label }} for USD${{ currentPlan?.price }}
                </h3>
                <p
                  class="text-[0.65625rem] leading-[1.125rem] "
                  :class="tier?.theme?.textReNew"
                >
                  Renews at USD${{ currentPlan?.price }} every
                  {{ currentPlan?.label }}
                </p>
              </div>
              <div class="flex flex-col gap-[0.4375rem]">
                <div
                  class="w-full h-[0.3125rem] rounded-[0.3125rem] bg-white/20 dark:bg-[#181a1b33]"
                >
                  <div
                    class="h-full rounded-[0.3125rem]"
                    :class="tier?.theme?.barColor"
                    :style="{ width: tier?.footer?.progress?.width }"
                  ></div>
                </div>
                <div class="flex justify-between gap-1">
                  <div class="flex items-center gap-1">
                    <span
                      class="text-xs leading-normal font-medium text-[#D0D5DD] dark:text-[#cfcac4]"
                      >{{ tier?.footer?.progress?.leftText }}</span
                    >
                    <div
                      class="relative inline-flex overflow-hidden cursor-pointer group hover:overflow-visible"
                    >
                      <img
                        src="https://i.ibb.co/DPgMH5GG/svgviewer-png-output-15.webp"
                        alt="tooltip icon"
                        class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(15%)_sepia(83%)_saturate(7346%)_hue-rotate(330deg)_brightness(98%)_contrast(100%)]"
                      />
                      <div
                        class="absolute z-[2] opacity-0 group-hover:opacity-100 flex flex-col items-start w-[8.6875rem] text-xs text-white bg-[#101828B2] p-2 rounded-lg left-1/2 bottom-full translate-x-[-50%] -translate-y-2"
                      >
                        <p>
                          Spending includes: Pay to view, Subscriptions, Tip
                        </p>
                      </div>
                    </div>
                  </div>
                  <span
                    class="text-xs leading-normal font-medium text-[#D0D5DD] dark:text-[#cfcac4]"
                    >{{ tier?.footer?.progress?.rightText }}</span
                  >
                </div>
              </div>
            </div>
          </div>
          <div
            class="flex justify-center items-center pl-8 pr-2.5 w-max z-[0] bg-cover bg-no-repeat"
            :style="{ backgroundImage: tier?.theme?.buttonBgImage }"
          >
            <span
              class="text-base font-bold italic text-[#0C111D] dark:text-[#dbd8d3]"
              v-html="tier?.footer?.buttonText"
            ></span>
          </div>
        </div>

        <div
          v-else-if="tier?.footer?.type === 'hidden'"
          class="flex cursor-pointer rounded-t-[0.625rem] w-full min-h-fit mt-auto relative shadow-[0px_-8px_24px_0px_#FF8FBA40] bg-black dark:bg-[#181a1b]"
        >
          <div class="flex items-center z-[1] w-full min-h-[5rem]">
            <div class="flex flex-col gap-2 pl-2 py-2 w-full">
              <div class="flex flex-col">
                <h3 class="text-lg font-bold" :style="{ color: tier.theme.textPrimary }">
                  {{ currentPlan.label }} for USD${{ currentPlan.price }}
                </h3>
                <p
                  class="text-[0.65625rem] leading-[1.125rem]"
                  :class="tier?.theme?.textReNew"
                >
                  Renews at USD${{ currentPlan.price }} every
                  {{ currentPlan.label }}
                </p>
              </div>
              <div class="hidden flex-col gap-[0.4375rem]">
                <div
                  class="w-full h-[0.3125rem] rounded-[0.3125rem] bg-white/20 dark:bg-[#181a1b33]"
                >
                  <div
                    class="w-[5%] h-full rounded-[0.3125rem]"
                    :class="tier.theme.barColor"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div
            class="flex justify-center items-center pl-8 pr-2.5 w-max z-[0] bg-cover bg-no-repeat"
            :style="{ backgroundImage: tier.theme.buttonBgImage }"
          >
            <span
              class="text-base font-bold italic text-[#0C111D] dark:text-[#dbd8d3]"
              v-html="tier.footer.buttonText"
            ></span>
          </div>
        </div>

        <div
          v-else-if="tier?.footer?.type === 'subscribe'"
          class="flex cursor-pointer rounded-t-[0.625rem] overflow-hidden w-full min-h-fit mt-auto relative shadow-[0px_-8px_24px_0px_#07F46840] bg-black dark:bg-[#181a1b]"
        >
          <div class="flex items-center z-[1] w-full min-h-[5rem]">
            <div class="flex flex-col gap-2 pl-2 py-2 w-full">
              <div class="flex flex-col">
                <h3 class="text-lg font-bold" :class="tier.theme.textPrimary">
                  {{ currentPlan.label }} for USD${{ currentPlan.price }}
                </h3>
                <p
                  class="text-xs leading-normal font-medium"
                  :class="tier?.theme?.textReNew"
                >
                  Renews at USD${{ currentPlan.price }} every
                  {{ currentPlan.label }}
                </p>
              </div>
            </div>
          </div>
          <div
            class="flex justify-center items-center pl-[1.625rem] pr-2.5 w-max z-[0] bg-cover bg-no-repeat"
            :style="{ backgroundImage: tier.theme.buttonBgImage }"
          >
            <span
              class="text-base font-bold italic text-[#0C111D] dark:text-[#dbd8d3]"
              v-html="tier.footer.buttonText"
            ></span>
          </div>
        </div>
        <div
          v-if="tier?.isFeatured"
          class="absolute -top-2 -left-2 [clip-path:polygon(0_0,100%_0,calc(100%-0.5rem)_100%,0_100%)] flex justify-center items-center pl-1.5 pr-2.5 py-0.5 z-[6]"
          :class="tier.theme.featuredBg"
        >
          <span
            class="text-sm font-semibold"
          :class="tier.theme.featuredText"
            >FEATURED</span
          >
        </div>
      </div>
    </div>
  </div>

  <div
    data-more-plans-popup
    :class="showMorePlans ? 'flex' : 'hidden'"
    class="fixed bottom-0 left-0 w-full rounded-t-[0.625rem] bg-white shadow-[0px_0px_12px_0px_#0000001A] backdrop-blur-[50px] z-[5] md:!hidden dark:bg-[#181a1b]"
  >
    <div class="flex flex-col py-1 w-full">
      <div
        v-for="plan in tier.plans"
        :key="plan.id"
        @click="activatePlan(plan.id)"
        @click.stop="activatePlan(plan.id)"
        class="flex justify-center items-center h-11 px-1.5 py-0.5 cursor-pointer"
        :class="
          activePlan === plan.id
            ? 'bg-[#F2F4F7] dark:bg-[#1e2022] discount-active'
            : ''
        "
      >
        <div
          class="flex justify-between items-center gap-6 px-2.5 py-2 w-full max-[350px]:gap-2"
        >
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-0.5">
              <span
                class="text-sm font-medium text-[#0C111D] dark:text-[#dbd8d3]"
                >{{ plan.label }}</span
              >
              <span
                v-if="plan.discount"
                class="text-xs leading-normal font-medium text-[#FF0066] dark:text-[#ff1a76]"
                >{{ plan.discount }}</span
              >
            </div>

            <div v-if="plan.isMostValue" class="backdrop-blur-[10px]">
              <div
                class="flex justify-center items-center gap-1 rounded ml-2 pl-2.5 pr-1.5 py-0.5 backdrop-blur-[10px] bg-[#FCE40D] dark:bg-[#a19102]"
              >
                <img
                  src="https://i.ibb.co.com/4gCVM3BW/Hot-icon.webp"
                  alt="Hot-icon"
                  class="absolute -top-1 -left-2 w-6 h-6"
                />
                <span
                  class="text-[0.625rem] leading-normal whitespace-nowrap font-semibold text-black dark:text-[#e8e6e3]"
                  >Most Value</span
                >
              </div>
            </div>
          </div>
          <span class="text-base font-semibold text-black dark:text-[#e8e6e3]"
            >USD${{ plan.price }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
