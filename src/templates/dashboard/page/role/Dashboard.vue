<!-- <template/> -->
<!-- <DashboardWrapperTwoColContainer>

    <Cookies />

    <ButtonComponent text="Cancel" variant="hoverBgWhite" size="lg" />

    <ButtonComponent text="Save" variant="greyBg" size="lg" />

    <ButtonComponent text="Save" variant="polygonRight"
      :leftIcon="'https://i.ibb.co/Sw3WhF1p/svgviewer-png-output-9.webp'" :leftIconClass="`
  w-6 h-6 transition duration-200
  filter brightness-0 invert
  group-hover:[filter:brightness(0)_saturate(100%)_invert(0%)_sepia(96%)_saturate(7494%)_hue-rotate(96deg)_brightness(112%)_contrast(97%)]
`" />

    <ButtonComponent text="Next" variant="polygonLeft"
      :rightIcon="'https://i.ibb.co/hx8ztZFf/svgviewer-png-output-8.webp'" :rightIconClass="`
  w-6 h-6 transition duration-200
  filter brightness-0 invert-0   
  group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]
`" btnBg="#07f468" btnHoverBg="black" btnText="black" btnHoverText="#07f468" />


    <LoadingTest />
    <PageDataTest />
    <br />
    <br />
    <Cart />
    <br />
    <br />

    <br />
    <br />
    <DashProfileSettings />

    <br />
    <br />

    <ButtonComponent text="View All Popup" variant="mediaBtn" @click="isViewAllPopupOpen = true" />

    <br />

    <ButtonComponent text="Profle media details popup" variant="mediaBtn"
      @click="profileMediaDetailsPopupOpen = true" />

    <br />

    <ButtonComponent text="Avatar upload popup" variant="mediaBtn" @click="avatarPopupOpen = true" />

    <br />

    <ButtonComponent text="Image Crop Popup" variant="mediaBtn" @click="imageCropPopupOpen = true" />

    <br />
    <ButtonComponent text="Cancel Upload Popup" variant="mediaBtn" @click="cancelUploadPopupOpen = true" />

    <br />

    <ButtonComponent text="Buy Now Login Popup" variant="mediaBtn" @click="buyNowLoginPopupOpen = true" />
    <br />

    <ButtonComponent text="Buy Now Not Login Popup" variant="mediaBtn" @click="buyNowNotLoginPopupOpen = true" />
    <br />

    <ButtonComponent text="Cart Checkout Login Popup" variant="mediaBtn" @click="cartCheckoutLoginPopupOpen = true" />
    <br />

    <ButtonComponent text="Cart Checkout Not Login Popup" variant="mediaBtn"
      @click="cartCheckoutNotLoginPopupOpen = true" />
    <br />

    <ButtonComponent text="Subscribe Login Popup" variant="mediaBtn" @click="subscribeLoginPopupOpen = true" />
    <br />

    <ButtonComponent text="Subscribe Not Login Popup" variant="mediaBtn" @click="subscribeNotLoginPopupOpen = true" />
    <br />

    <ButtonComponent text="Subscribe update Login Popup" variant="mediaBtn"
      @click="subscribeUpdateLoginPopupOpen = true" />

    <br />

    <ButtonComponent text="Purchase Tip Popup" variant="mediaBtn" @click="purchaseTipPopupOpen = true" />

    <br />

    <ButtonComponent text="Purchase Flow Subscription Popup" variant="mediaBtn"
      @click="purchaseFlowSubscriptionPopupOpen = true" />

    <br />

    <ButtonComponent text="Guest Purchase Flow Popup" variant="mediaBtn" @click="guestPurchaseFlowPopupOpen = true" />

    <br />

    <ButtonComponent text="Upgrade Tier Popup" variant="mediaBtn" @click="upgradeTierPopupOpen = true" />

    <br />

    <ButtonComponent text="1on1 Booking FlowPopup open" variant="mediaBtn"
      @click="oneOnOneBookingFlowPopupOpen = true" />

    <br />

    <ButtonComponent text="Ticket Event Popup Open" variant="mediaBtn" @click="ticketEventPopupOpen = true" />

    <br />

    <ButtonComponent text="Crowd Funding Event Popup" variant="mediaBtn" @click="crowdFundingEventPopupOpen = true" />

    <br />

    <ButtonComponent text="Tip Popup" variant="mediaBtn" @click="tipPopupOpen = true" />

    <br />

    <ButtonComponent text="Profile Login Popup" variant="mediaBtn" @click="profileLoginPopupOpen = true" />

    <br />

    <ButtonComponent text="Profile Merch Popup" variant="mediaBtn" @click="profileMerchPopupOpen = true" />

    <br />

    <ButtonComponent text="Top Up Popup" variant="mediaBtn" @click="topUpPopupOpen = true" />

    <br />

    <UploadingProgressBar :progress="uploadPercentage" imageSrc="https://i.ibb.co.com/Kx9QDc68/auth-bg-compressed.webp"
      label="Uploading..." />
    <br />
    <AvatarMenu />

    <br />
    <div class="flex flex-col items-center gap-6 md:gap-8">
      <TierCard v-for="tier in tierData" :key="tier.id" :tier="tier" />
    </div>
    <br />

    <LatestEventCard />
    <br />

    <div class="flex flex-wrap gap-8">
      <EventCard theme="orange" :hasButton="true" />
      <EventCard theme="orange" :hasButton="false" />
      <EventCard theme="pink" :hasButton="true" />
      <EventCard theme="pink" :hasButton="false" />
    </div>

    <br>


    <ProfileMerchPopup />


    <ProfileViewAllPopup v-model="isViewAllPopupOpen" />

    <ProfileMediaDetailsPopup v-model="profileMediaDetailsPopupOpen" />

    <AvatarUploadPopup v-model="avatarPopupOpen" />

    <ImageCropperModal v-model="imageCropPopupOpen" @save="handleImageSave" />
    <CancelUploadPopup v-model="cancelUploadPopupOpen" />
    <BuyNowLoginPopup v-model="buyNowLoginPopupOpen" />
    <BuyNowNotLoginPopup v-model="buyNowNotLoginPopupOpen" />
    <CartCheckoutLoginPopup v-model="cartCheckoutLoginPopupOpen" />
    <CartCheckoutNotLoginPopup v-model="cartCheckoutNotLoginPopupOpen" />
    <SubscribeLoginPopup v-model="subscribeLoginPopupOpen" />
    <SubscribeNotLoginPopup v-model="subscribeNotLoginPopupOpen" />
    <SubscribeUpdateLoginPopup v-model="subscribeUpdateLoginPopupOpen" />
    <PurchaseTipFlowPopup v-model="purchaseTipPopupOpen" />
    <PurchaseFlowSubscriptionOrderPopup v-model="purchaseFlowSubscriptionPopupOpen" />
    <GuestPurchaseFlowPopup v-model="guestPurchaseFlowPopupOpen" />
    <UpgradeTierPopup v-model="upgradeTierPopupOpen" />
    <OneOnOneBookingFlowPopup v-model="oneOnOneBookingFlowPopupOpen" />
    <TicketEventPopup v-model="ticketEventPopupOpen" />
    <CrowdFundingEventPopup v-model="crowdFundingEventPopupOpen" />
    <TipPopup v-model="tipPopupOpen" />
    <ProfileLoginPopup v-model="profileLoginPopupOpen" />
    <ProfileMerchPopup v-model="profileMerchPopupOpen" />
    <TopUpPopup v-model="topUpPopupOpen" />
  </DashboardWrapperTwoColContainer> -->

<!-- Dashboard page
</template> -->

<!-- <script setup>
import DashboardWrapperTwoColContainer from "@/components/dashboard/DashboardWrapperTwoColContainer.vue";
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import Cookies from "@/components/ui/badge/dashboard/Cookies.vue";
import Cart from "@/components/Cart.vue";
import OrderReceived from "@/components/ui/table/dashboard/OrderReceived.vue";
import ProfileViewAllPopup from "@/components/ui/popup/ProfileViewAllPopup.vue";
import ProfileMediaDetailsPopup from "@/components/ui/popup/ProfileMediaDetailsPopup.vue";
import AvatarUploadPopup from "@/components/ui/popup/AvatarUploadPopup.vue";
import { onMounted, ref } from "vue";
import ImageCropperModal from "@/components/ui/popup/ImageCropperModal.vue";
import AvatarMenu from "@/components/AvatarMenu.vue";
import CancelUploadPopup from "@/components/ui/popup/CancelUploadPopup.vue";
import UploadingProgressBar from "@/components/UploadingProgressBar.vue";
import BuyNowLoginPopup from "@/components/ui/popup/buyNow/BuyNowLoginPopup.vue";
import BuyNowNotLoginPopup from "@/components/ui/popup/buyNow/BuyNowNotLoginPopup.vue";
import CartCheckoutLoginPopup from "@/components/ui/popup/cartCheckout/CartCheckoutLoginPopup.vue";
import CartCheckoutNotLoginPopup from "@/components/ui/popup/cartCheckout/CartCheckoutNotLoginPopup.vue";
import SubscribeLoginPopup from "@/components/ui/popup/subscribe/SubscribeLoginPopup.vue";
import SubscribeNotLoginPopup from "@/components/ui/popup/subscribe/SubscribeNotLoginPopup.vue";
import SubscribeUpdateLoginPopup from "@/components/ui/popup/subscribe/SubscribeUpdateLoginPopup.vue";
import DashProfileSettings from "@/components/DashProfileSettings.vue";
import PurchaseTipFlowPopup from "@/components/ui/popup/purchase/PurchaseTipFlowPopup.vue";
import PurchaseFlowSubscriptionOrderPopup from "@/components/ui/popup/purchase/PurchaseFlowSubscriptionOrderPopup.vue";
import GuestPurchaseFlowPopup from "@/components/ui/popup/purchase/GuestPurchaseFlowPopup.vue";
import UpgradeTierPopup from "@/components/ui/popup/purchase/UpgradeTierPopup.vue";
import TierCard from "@/components/ui/card/dashboard/TierCard.vue";
import { tierData } from "/public/data/TierData.js";
import LatestEventCard from "@/components/ui/card/dashboard/LatestEventCard.vue";
import EventCard from "@/components/ui/card/dashboard/EventCard.vue";
import OneOnOneBookingFlowPopup from "@/components/FanBookingFlow/OneOnOneBookingFlow/OneOnOneBookingFlowPopup.vue";
import TicketEventPopup from "@/components/FanBookingFlow/GroupEventFlow/TicketEventPopup/TicketEventPopup.vue";
import CrowdFundingEventPopup from "@/components/FanBookingFlow/GroupEventFlow/CrowdFundingEventPopup/CrowdFundingEventPopup.vue";
import TipPopup from "@/templates/profileAbdullah/popups/TipPopup.vue";
import ProfileLoginPopup from "@/templates/profileAbdullah/popups/ProfileLoginPopup.vue";
import ProfileMerchPopup from "@/templates/profileAbdullah/popups/ProfileMerchPopup.vue";
import TopUpPopup from "@/templates/profileAbdullah/popups/TopUpPopup.vue";

const isViewAllPopupOpen = ref(false);
const profileMediaDetailsPopupOpen = ref(false);
const avatarPopupOpen = ref(false);
const imageCropPopupOpen = ref(false);
const cancelUploadPopupOpen = ref(false);
const buyNowLoginPopupOpen = ref(false);
const buyNowNotLoginPopupOpen = ref(false);
const cartCheckoutLoginPopupOpen = ref(false);
const cartCheckoutNotLoginPopupOpen = ref(false);
const subscribeLoginPopupOpen = ref(false);
const subscribeNotLoginPopupOpen = ref(false);
const subscribeUpdateLoginPopupOpen = ref(false);
const purchaseTipPopupOpen = ref(false);
const purchaseFlowSubscriptionPopupOpen = ref(false);
const guestPurchaseFlowPopupOpen = ref(false);
const upgradeTierPopupOpen = ref(false);
const oneOnOneBookingFlowPopupOpen = ref(false);
const ticketEventPopupOpen = ref(false);
const crowdFundingEventPopupOpen = ref(false);
const tipPopupOpen = ref(false);
const profileLoginPopupOpen = ref(false);
const profileMerchPopupOpen = ref(false);
const topUpPopupOpen = ref(false);

const handleImageSave = (data) => {
  console.log("Cropped Data Received:", data);
};
const uploadPercentage = ref(0);

// This function is only for demo purposes to show the progress bar in action.
// Once the actual API is integrated, this will no longer be needed,
// as the value will come directly from the API.
onMounted(() => {
  const interval = setInterval(() => {
    if (uploadPercentage.value < 100) {
      uploadPercentage.value += 1;
    } else {
      clearInterval(interval);
    }
  }, 50); // Speed control
});
</script> -->

<template>
  <div class="p-8 bg-zinc-200 min-h-screen flex justify-center flex-wrap gap-12 font-sans">

    <!-- MODEL CHAT PREVIEW -->
    <div>
      <div class="text-[11px] text-zinc-500 font-bold mb-3 uppercase tracking-wider">MODEL chat</div>
      <div class="w-96 h-[623px] shadow-2xl rounded-tl rounded-tr overflow-hidden shadow-zinc-400/50">
        <FlexChat :messages="modelMessages" currentUserId="jenny" :isGroupChat="false"
          :variantForMessage="msg => msg.type === 'system' ? 'system' : null" :theme="chatTheme" :hasMore="modelHasMore"
          :loading="modelLoading" @load-more="fetchMoreModelMessages" :infinite="true">
          <template #header>
            <div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <img src="https://ui-avatars.com/api/?name=Grape&background=22c55e&color=fff&rounded=true"
                    class="w-10 h-10 rounded-full object-cover shadow-sm bg-green-500 p-[1px]" />
                  <div class="flex flex-col">
                    <h3 class="font-semibold text-sm text-gray-900 leading-tight">Grapes <span
                        class="text-zinc-400">•••</span></h3>
                    <span class="text-xs text-slate-700 font-normal flex items-center gap-1 mt-0.5"><span
                        class="w-1.5 h-1.5 bg-rose-500 rounded-full"></span> 1 pending request</span>
                  </div>
                </div>
                <div class="flex items-center gap-3 text-zinc-600">
                  <img class='w-4 h-4' src="/images/share-icon.png" alt="">
                  <svg class="w-5 h-5 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M20 12H4"></path>
                  </svg>
                  <svg class="w-5 h-5 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                    </path>
                  </svg>
                </div>
              </div>
            </div>
          </template>

          <template #message.system="{ message }">
            <div class="w-full flex mb-2 mt-4 px-1">
              <LiveCallRequest v-if="message.systemType === 'call_request'" :message="message" :isFanView="false" />
              <div v-else
                class="text-[12px] text-zinc-400 font-medium py-1 px-3 bg-zinc-100 rounded-full w-full text-center">
                {{ message.text }}
              </div>
            </div>
          </template>

          <template #message.content="{ message }">
            <div class="text-[14px] leading-relaxed font-semibold">{{ message.text }}</div>
          </template>

          <template #message.avatar.me="{ message }">
            <img v-if="message.time"
              src="https://ui-avatars.com/api/?name=Grape&background=22c55e&color=fff&rounded=true"
              class="w-[18px] h-[18px] rounded-full object-cover shadow-sm bg-green-500 p-[1px]" />
            <div v-else class="w-[18px] h-[18px]"></div>
          </template>

          <template #message.avatar="{ message }">
            <img v-if="message.time" src="https://i.pravatar.cc/150?img=5"
              class="w-[18px] h-[18px] rounded-full object-cover shadow-sm bg-blue-500 p-[1px]" />
            <div v-else class="w-5 h-5"></div>
          </template>

          <template #compose>
            <div class="flex items-center gap-3 my-1">
              <img src="https://i.pravatar.cc/150?img=5"
                class="w-8 h-8 rounded-full object-cover shadow-sm bg-blue-500 p-[1px]" />
              <input type="text" placeholder="Write a reply..." v-model="modelComposeText"
                @keyup.enter="sendMessage('shared-chat', 'jenny', modelComposeText)"
                class="flex-1 text-[14px] bg-transparent outline-none text-zinc-700 placeholder:text-zinc-400 font-semibold" />
              <div class="flex gap-3 text-zinc-600">
                <svg @click="sendMessage('shared-chat', 'jenny', modelComposeText)"
                  class="w-6 h-6 cursor-pointer hover:text-indigo-600" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
                <svg class="w-6 h-6 cursor-pointer hover:text-zinc-900" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </template>
        </FlexChat>
      </div>
    </div>

    <!-- FAN CHAT PREVIEW -->
    <div>
      <div class="text-[11px] text-zinc-500 font-bold mb-3 uppercase tracking-wider">FAN chat</div>
      <div class="w-96 h-[623px] shadow-2xl rounded-tl rounded-tr overflow-hidden shadow-zinc-400/50">
        <FlexChat :messages="fanMessages" currentUserId="fan" :isGroupChat="false"
          :variantForMessage="msg => msg.type === 'system' ? 'system' : null" :theme="chatTheme" :hasMore="fanHasMore"
          :loading="fanLoading" @load-more="fetchMoreFanMessages" :infinite="true">
          <template #header>
            <div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <img src="https://i.pravatar.cc/150?img=5" class="w-10 h-10 rounded-full object-cover shadow-sm" />
                  <div class="flex flex-col">
                    <h3 class="font-semibold text-sm text-gray-900 leading-tight">Jenny Honey~ <span
                        class="text-zinc-400">•••</span></h3>
                    <span class="text-xs text-slate-700 font-normal flex items-center gap-1 mt-0.5"><span
                        class="w-1.5 h-1.5 bg-rose-500 rounded-full"></span> 1 pending request</span>
                  </div>
                </div>
                <div class="flex items-center gap-3 text-zinc-600">
                  <img class='w-4 h-4' src="/images/share-icon.png" alt="">
                  <svg class="w-5 h-5 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M20 12H4"></path>
                  </svg>
                  <svg class="w-5 h-5 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                    </path>
                  </svg>
                </div>
              </div>
            </div>
          </template>

          <template #message.system="{ message }">
            <div class="w-full flex mb-2 mt-4 px-1">
              <LiveCallRequest v-if="message.systemType === 'call_request'" :message="message" :isFanView="true" />
              <div v-else
                class="text-[12px] text-zinc-400 font-medium py-1 px-3 bg-zinc-100 rounded-full w-full text-center">
                {{ message.text }}
              </div>
            </div>
          </template>

          <template #message.content="{ message }">
            <div class="text-[14px] leading-relaxed font-semibold">{{ message.text }}</div>
          </template>

          <template #message.avatar.me="{ message }">
            <img v-if="message.time" src="https://i.pravatar.cc/150?img=5"
              class="w-[18px] h-[18px] rounded-full object-cover shadow-sm bg-blue-500 p-[1px]" />
            <div v-else class="w-[18px] h-[18px]"></div>
          </template>

          <template #message.avatar="{ message }">
            <img v-if="message.time"
              src="https://ui-avatars.com/api/?name=Grape&background=22c55e&color=fff&rounded=true"
              class="w-[18px] h-[18px] rounded-full object-cover shadow-sm bg-green-500 p-[1px]" />
            <div v-else class="w-5 h-5"></div>
          </template>

          <template #compose>
            <div class="flex items-center gap-3 my-1">
              <img src="https://ui-avatars.com/api/?name=Grape&background=22c55e&color=fff&rounded=true"
                class="w-8 h-8 rounded-full object-cover shadow-sm bg-green-500 p-[1px]" />
              <input type="text" placeholder="Write a reply..." v-model="fanComposeText"
                @keyup.enter="sendMessage('shared-chat', 'fan', fanComposeText)"
                class="flex-1 text-[14px] bg-transparent outline-none text-zinc-700 placeholder:text-zinc-400 font-semibold" />
              <div class="flex gap-3 text-zinc-600">
                <svg @click="sendMessage('shared-chat', 'fan', fanComposeText)"
                  class="w-6 h-6 cursor-pointer hover:text-indigo-600" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
                <!-- Send Live Call Request Button -->
                <svg @click="sendCallRequest" class="w-6 h-6 cursor-pointer hover:text-rose-500" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z">
                  </path>
                </svg>
                <svg class="w-6 h-6 cursor-pointer hover:text-zinc-900" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </template>
        </FlexChat>
      </div>
    </div>

    <!-- GROUP CHAT PREVIEW -->
    <div>
      <div class="text-[11px] text-zinc-500 font-bold mb-3 uppercase tracking-wider">GROUP chat</div>
      <div class="w-96 h-[623px] shadow-2xl rounded-tl rounded-tr overflow-hidden shadow-zinc-400/50">
        <FlexChat :messages="groupMessages" currentUserId="jenny" :isGroupChat="true"
          :variantForMessage="msg => msg.type === 'system' ? 'system' : null" :theme="chatTheme" :hasMore="groupHasMore"
          :loading="groupLoading" @load-more="fetchMoreGroupMessages">
          <template #header>
            <div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="flex -space-x-2">
                    <img src="https://i.pravatar.cc/150?img=11"
                      class="w-10 h-10 rounded-full object-cover shadow-sm border-2 border-white" />
                    <img src="https://i.pravatar.cc/150?img=33"
                      class="w-10 h-10 rounded-full object-cover shadow-sm border-2 border-white" />
                    <img src="https://i.pravatar.cc/150?img=47"
                      class="w-10 h-10 rounded-full object-cover shadow-sm border-2 border-white" />
                  </div>
                  <div class="flex flex-col ml-1">
                    <h3 class="font-semibold text-sm text-gray-900 leading-tight">Project Awesome <span
                        class="text-zinc-400">•••</span></h3>
                    <span class="text-xs text-zinc-500 font-semibold flex items-center gap-1 mt-0.5">3 members</span>
                  </div>
                </div>
                <div class="flex items-center gap-3 text-zinc-600">
                  <img class='w-4 h-4' src="/images/share-icon.png" alt="">
                  <svg class="w-5 h-5 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M20 12H4"></path>
                  </svg>
                  <svg class="w-5 h-5 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                    </path>
                  </svg>
                </div>
              </div>
            </div>
          </template>

          <template #message.system="{ message }">
            <div class="w-full flex justify-center mb-2 mt-4 px-1">
              <div class="text-[12px] text-zinc-400 font-medium py-1 px-3 bg-zinc-100 rounded-full">{{ message.text }}
              </div>
            </div>
          </template>

          <template #message.content="{ message }">
            <div class="text-[14px] leading-relaxed font-semibold">{{ message.text }}</div>
          </template>

          <template #message.avatar.me="{ message }">
            <img v-if="message.time"
              src="https://ui-avatars.com/api/?name=Jenny&background=22c55e&color=fff&rounded=true"
              class="w-[18px] h-[18px] rounded-full object-cover shadow-sm bg-green-500 p-[1px]" />
            <div v-else class="w-[18px] h-[18px]"></div>
          </template>

          <template #message.avatar="{ message }">
            <img v-if="message.time" :src="message.avatar"
              class="w-[18px] h-[18px] rounded-full object-cover shadow-sm bg-blue-500 p-[1px]" />
            <div v-else class="w-[18px] h-[18px]"></div>
          </template>

          <template #compose>
            <div class="flex items-center gap-3 my-1">
              <img src="https://ui-avatars.com/api/?name=Jenny&background=22c55e&color=fff&rounded=true"
                class="w-8 h-8 rounded-full object-cover shadow-sm bg-green-500 p-[1px]" />
              <input type="text" placeholder="Write a reply..." v-model="groupComposeText"
                @keyup.enter="sendMessage('group-chat', 'jenny', groupComposeText)"
                class="flex-1 text-[14px] bg-transparent outline-none text-zinc-700 placeholder:text-zinc-400 font-semibold" />
              <div class="flex gap-3 text-zinc-600">
                <svg @click="sendMessage('group-chat', 'jenny', groupComposeText)"
                  class="w-6 h-6 cursor-pointer hover:text-indigo-600" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
                <svg class="w-6 h-6 cursor-pointer hover:text-zinc-900" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </template>
        </FlexChat>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import FlexChat from '@/components/ui/chat/FlexChat.vue'
import LiveCallRequest from '@/components/ui/chat/LiveCallRequest.vue'
import { useChatStore } from '@/stores/useChatStore.js'
import { chatPipeline } from '@/pipelines/chatPipeline.js'
import { chatFlowHandler } from '@/flows/chatFlowHandler.js'

const chatTheme = {
  container: 'relative bg-[#f4f4f5] rounded-tl rounded-tr flex flex-col h-full overflow-hidden border border-zinc-200/50 container-shadow',
  header: 'bg-gray-200 font-sans px-2 py-2 shrink-0 z-10 shadow-sm relative',
  body: 'flex-1 overflow-y-auto px-4 py-2 space-y-1.5 scroll-smooth flex flex-col',
  compose: 'bg-white px-4 py-3 shrink-0',
  myMessageRow: 'flex w-full justify-end mt-1',
  otherMessageRow: 'flex w-full justify-start mt-1',
  systemMessageRow: 'flex w-full justify-center my-3',
  myBubble: 'text-white text-base font-normal max-w-96 min-w-20 min-h-10 px-3 py-1.5 bg-slate-600 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl shadow-[0px_0px_18px_0px_rgba(88,85,249,0.10)] inline-flex justify-center items-center gap-2.5',
  otherBubble: 'max-w-96 min-h-10 px-3 py-1.5 bg-gray-50 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl shadow-[0px_0px_18px_0px_rgba(88,85,249,0.10)] backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5',
  systemBubble: 'w-full',
  metaWrapper: 'opacity-90',
  myNameMeta: 'hidden',
  myTimeMeta: 'text-[11px] text-zinc-400 font-semibold',
  otherNameMeta: 'hidden',
  otherTimeMeta: 'text-[11px] text-zinc-400 font-semibold',
  avatarWrapper: 'flex shrink-0 items-end',
  avatarImg: 'w-5 h-5 rounded-full object-cover',
}

const modelComposeText = ref('')
const fanComposeText = ref('')
const groupComposeText = ref('')

// Initialize Pinia store
const chatStore = useChatStore()

// Computed reactives mapping to Pinia state
const modelMessages = computed(() => chatStore.getMessagesByChatId('shared-chat'))
const fanMessages = computed(() => chatStore.getMessagesByChatId('shared-chat'))
const groupMessages = computed(() => chatStore.getMessagesByChatId('group-chat'))

// Pagination states
const modelHasMore = ref(true)
const modelLoading = ref(false)
const fanHasMore = ref(true)
const fanLoading = ref(false)
const groupHasMore = ref(true)
const groupLoading = ref(false)

// Data Pipeline Fetches (Load Initial + Pagination)
const fetchMoreModelMessages = async () => {
  if (modelLoading.value || !modelHasMore.value) return
  modelLoading.value = true
  const res = await chatPipeline.fetchChatMessagesPipeline('shared-chat', 20, modelMessages.value.length)
  if (res.success && res.count === 0) modelHasMore.value = false
  modelLoading.value = false
}

const fetchMoreFanMessages = async () => {
  // We remove the duplicate check so both windows independently trigger their spinner delay on load.
  if (fanLoading.value || !fanHasMore.value) return
  fanLoading.value = true
  const res = await chatPipeline.fetchChatMessagesPipeline('shared-chat', 20, fanMessages.value.length)
  if (res.success && res.count === 0) fanHasMore.value = false
  fanLoading.value = false
}

const fetchMoreGroupMessages = async () => {
  if (groupLoading.value || !groupHasMore.value) return
  groupLoading.value = true
  const res = await chatPipeline.fetchChatMessagesPipeline('group-chat', 20, groupMessages.value.length)
  if (res.success && res.count === 0) groupHasMore.value = false
  groupLoading.value = false
}

// Flow Handler for Sending messages
const sendMessage = async (chatId, senderId, text, type = 'text') => {
  if (!text || typeof text !== 'string' || !text.trim()) return

  // Clear immediately for optimistic feeling
  if (chatId === 'shared-chat') {
    if (senderId === 'jenny') modelComposeText.value = ''
    else if (senderId === 'fan') fanComposeText.value = ''
  }
  else if (chatId === 'group-chat') groupComposeText.value = ''

  await chatFlowHandler.sendMessageFlow({
    chatId,
    senderId,
    text,
    type
  })
}

// Helper to manually trigger a call request for testing
const sendCallRequest = async () => {
  await chatFlowHandler.sendMessageFlow({
    chatId: 'shared-chat',
    senderId: 'fan',
    text: 'Call me and i will sing with you', // Mock text
    type: 'system',
    systemType: 'call_request',
    senderName: 'Jenny Honey~'
  })
}

// Initialize on Dashboard Load
onMounted(() => {
  // 1. Init mock socket listeners
  chatFlowHandler.initListeners()

  // 2. Initial fetch queries via Pipeline
  if (modelMessages.value.length === 0) fetchMoreModelMessages()
  if (fanMessages.value.length === 0) fetchMoreFanMessages()
  if (groupMessages.value.length === 0) fetchMoreGroupMessages()
})
</script>

<style scoped>
.container-shadow {
  box-shadow: 0 4px 24px -4px rgba(0, 0, 0, 0.1);
}
</style>
