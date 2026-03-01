<template>
  <DashboardWrapperTwoColContainer>
    <!-- <BookingForm /> -->

    <Cookies />

    <!-- <ButtonComponent text="Cancel" variant="hoverBgWhite" size="lg" /> -->

    <!-- <ButtonComponent text="Save" variant="greyBg" size="lg" /> -->

    <ButtonComponent text="Save" variant="polygonRight"
      :leftIcon="'https://i.ibb.co/Sw3WhF1p/svgviewer-png-output-9.webp'" :leftIconClass="`
  w-6 h-6 transition duration-200
  filter brightness-0 invert
  group-hover:[filter:brightness(0)_saturate(100%)_invert(0%)_sepia(96%)_saturate(7494%)_hue-rotate(96deg)_brightness(112%)_contrast(97%)]
`" />

    <ButtonComponent text="Next" variant="polygonLeft"
      :rightIcon="'https://i.ibb.co/hx8ztZFf/svgviewer-png-output-8.webp'" :rightIconClass="`
  w-6 h-6 transition duration-200
  filter brightness-0 invert-0   /* Default: black */
  group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]
`" btnBg="#07f468" btnHoverBg="black" btnText="black" btnHoverText="#07f468" />

    <!-- <OrderReceived /> -->

    <LoadingTest />
    <PageDataTest />
    <br />
    <br />
    <Cart />
    <!-- <OrderReceived /> -->
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
  </DashboardWrapperTwoColContainer>
</template>

<script setup>
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
</script>
