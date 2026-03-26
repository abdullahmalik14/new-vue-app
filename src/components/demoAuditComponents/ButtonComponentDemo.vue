<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 font-sans">
    <div class="max-w-6xl mx-auto flex flex-col gap-16">
      <section class="flex flex-col gap-6">
        <DemoSectionHeader title="ButtonComponent" />
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          <!-- 1. Primary -->
          <DemoCard label="Primary" :code="codeExamples.primary">
            <ButtonComponent :text="btnStates.btn1 ? 'Clicked!' : 'Primary Button'" variant="primary"
              customClass="px-4 py-2.5 w-full transition-all" @click="handleClick('btn1')" />
          </DemoCard>

          <!-- 2. Secondary -->
          <DemoCard label="Secondary" :code="codeExamples.secondary">
            <ButtonComponent :text="btnStates.btn2 ? 'Clicked!' : 'Secondary Button'" variant="secondary"
              customClass="px-4 py-2.5 w-full transition-all" @click="handleClick('btn2')" />
          </DemoCard>

          <!-- 3. Success -->
          <DemoCard label="Success" :code="codeExamples.success">
            <ButtonComponent :text="btnStates.btn3 ? 'Confirmed' : 'Confirm'" variant="success"
              customClass="px-4 py-2.5 w-full transition-all" @click="handleClick('btn3')" />
          </DemoCard>

          <!-- 4. Danger -->
          <DemoCard label="Danger" :code="codeExamples.danger">
            <ButtonComponent text="Delete" variant="danger" customClass="px-4 py-2.5 w-full" />
          </DemoCard>

          <!-- 5. Warning -->
          <DemoCard label="Warning" :code="codeExamples.warning">
            <ButtonComponent text="Warning" variant="warning" customClass="px-4 py-2.5 w-full" />
          </DemoCard>

          <!-- 7. Disabled -->
          <DemoCard label="Disabled (Static)" :code="codeExamples.disabled">
            <ButtonComponent text="Disabled" variant="primary" :disabled="true" customClass="px-4 py-2.5 w-full" />
          </DemoCard>

          <!-- 10. Left Icon — Primary -->
          <DemoCard label="Left Icon (Primary)" :code="codeExamples.leftIcon">
            <ButtonComponent text="Download" variant="primary"
              customClass="px-4 py-2.5 w-full flex items-center justify-center gap-2"
              leftIcon="https://api.iconify.design/heroicons:arrow-down-tray.svg?color=%23ffffff"
              leftIconClass="w-4 h-4 inline-block align-middle" />
          </DemoCard>

          <!-- 11. Right Icon — Primary -->
          <DemoCard label="Right Icon (Primary)" :code="codeExamples.rightIcon">
            <ButtonComponent text="Next Step" variant="primary"
              customClass="px-4 py-2.5 w-full flex items-center justify-center gap-2"
              rightIcon="https://api.iconify.design/heroicons:arrow-right.svg?color=%23ffffff"
              rightIconClass="w-4 h-4 inline-block align-middle" />
          </DemoCard>

          <!-- 12. Left + Right Icons — Outline -->
          <DemoCard label="Left + Right Icon (Outline)" :code="codeExamples.bothIcons">
            <ButtonComponent text="Share" variant="outline"
              customClass="px-4 py-2.5 w-full flex items-center justify-center gap-2"
              leftIcon="https://api.iconify.design/heroicons:share.svg?color=%23374151"
              leftIconClass="w-4 h-4 inline-block align-middle"
              rightIcon="https://api.iconify.design/heroicons:arrow-right.svg?color=%23374151"
              rightIconClass="w-4 h-4 inline-block align-middle" />
          </DemoCard>

          <!-- 13. Left Icon — Success -->
          <DemoCard label="Left Icon (Success)" :code="codeExamples.leftIconSuccess">
            <ButtonComponent :text="btnStates.btn13 ? 'Saved!' : 'Save Changes'" variant="success"
              customClass="px-4 py-2.5 w-full flex items-center justify-center gap-2 transition-all"
              leftIcon="https://api.iconify.design/heroicons:check.svg?color=%23ffffff"
              leftIconClass="w-4 h-4 inline-block align-middle" @click="handleClick('btn13')" />
          </DemoCard>

          <!-- 14. Left Icon — Danger -->
          <DemoCard label="Left Icon (Danger)" :code="codeExamples.leftIconDanger">
            <ButtonComponent text="Delete Item" variant="danger"
              customClass="px-4 py-2.5 w-full flex items-center justify-center gap-2"
              leftIcon="https://api.iconify.design/heroicons:trash.svg?color=%23ffffff"
              leftIconClass="w-4 h-4 inline-block align-middle" />
          </DemoCard>

          <!-- 15. Right Icon — External -->
          <DemoCard label="Right Icon (External Link)" :code="codeExamples.rightIconExternal">
            <ButtonComponent text="Open Link" variant="outline"
              customClass="px-4 py-2.5 w-full flex items-center justify-center gap-2"
              rightIcon="https://api.iconify.design/heroicons:arrow-top-right-on-square.svg?color=%23374151"
              rightIconClass="w-4 h-4 inline-block align-middle" />
          </DemoCard>

          <!-- 16. Left Icon — Warning -->
          <DemoCard label="Left Icon (Warning)" :code="codeExamples.leftIconWarning">
            <ButtonComponent text="Report Issue" variant="warning"
              customClass="px-4 py-2.5 w-full flex items-center justify-center gap-2"
              leftIcon="https://api.iconify.design/heroicons:exclamation-triangle.svg?color=%23000000"
              leftIconClass="w-4 h-4 inline-block align-middle" />
          </DemoCard>

          <!-- 17. Polygon Left — Green -->
          <DemoCard label="Polygon Left (Green)" :code="codeExamples.polygonLeftGreen">
            <ButtonComponent text="Subscribe" variant="polygonLeft" btnBg="#07f468" btnHoverBg="#000" btnText="#000"
              btnHoverText="#07f468" />
          </DemoCard>

          <!-- 18. Polygon Left — Pink -->
          <DemoCard label="Polygon Left (Pink)" :code="codeExamples.polygonLeftPink">
            <ButtonComponent text="Join Now" variant="polygonLeft" btnBg="#FF0066" btnHoverBg="#000" btnText="#fff"
              btnHoverText="#FF0066" />
          </DemoCard>

          <!-- 19. Polygon Right -->
          <DemoCard label="Polygon Right" :code="codeExamples.polygonRight">
            <ButtonComponent text="Explore" variant="polygonRight" />
          </DemoCard>

          <!-- 20. BG Green -->
          <DemoCard label="BG Green (Hover Black)" :code="codeExamples.bgGreen">
            <ButtonComponent text="Get Started" variant="bgGreen" />
          </DemoCard>

          <!-- 21. Retry Action -->
          <DemoCard label="Retry Action" :code="codeExamples.retryAction">
            <ButtonComponent :text="btnStates.btn21 ? 'Retrying...' : 'Try Again'" variant="retryAction"
              leftIcon="https://api.iconify.design/heroicons:arrow-path.svg?color=%2307f468"
              :leftIconClass="['w-4 h-4 inline-block align-middle transition-all group-hover/button:brightness-0 dark:group-hover/button:invert dark:group-hover/button:brightness-0', btnStates.btn21 ? 'animate-spin' : ''].join(' ')"
              @click="handleClick('btn21')" />
          </DemoCard>

          <!-- 22. simpleBtn -->
          <DemoCard label="Simple Button (Custom Colors)" :code="codeExamples.simpleBtnCustom">
            <ButtonComponent text="Custom" variant="simpleBtn" btnBg="#6366f1" btnHoverBg="#4f46e5" btnText="#fff"
              btnHoverText="#fff" />
          </DemoCard>

        </div>
      </section>

      <!-- Dashboard Buttons Section -->
      <section class="flex flex-col gap-6">
        <DemoSectionHeader title="Dashboard Specialized Variants" />
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">

          <!-- Variant: skew-right -->
          <DemoCard label="Variant: skew-right (Native)" :code="codeExamples.twoPieceSkewRight">
            <ButtonComponent variant="skew-right" btnBg="#07f468" btnHoverBg="#000" text="Link your X account"
              textClass="py-1 break-words leading-7 text-lg font-medium transition-colors text-black group-hover:text-[#07f468]"
              :addAttributes="{ 'data-green-skew-right-bottom-button': true }">
              <template #leftIcon>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                  class="w-6 h-6">
                  <g id="social media icon/X">
                    <g id="Vector">
                      <mask id="path-1-inside-1" fill="white">
                        <path
                          d="M13.7142 10.6226L20.4163 3H18.8287L13.0068 9.61729L8.36042 3H3L10.0278 13.0075L3 21H4.58761L10.7316 14.0104L15.6396 21H21.0001M5.16061 4.17142H7.59962L18.8275 19.8861H16.3878" />
                      </mask>
                      <path
                        d="M13.7142 10.6226L20.4163 3H18.8287L13.0068 9.61729L8.36042 3H3L10.0278 13.0075L3 21H4.58761L10.7316 14.0104L15.6396 21H21.0001M5.16061 4.17142H7.59962L18.8275 19.8861H16.3878"
                        fill="black" class="group-hover:fill-[#07f468] transition-colors" />
                      <path
                        d="M13.7142 10.6226L20.4163 3H18.8287L13.0068 9.61729L8.36042 3H3L10.0278 13.0075L3 21H4.58761L10.7316 14.0104L15.6396 21H21.0001M5.16061 4.17142H7.59962L18.8275 19.8861H16.3878"
                        fill="black" mask="url(#path-1-inside-1)"
                        class="group-hover:fill-[#07f468] transition-colors" />
                    </g>
                  </g>
                </svg>
              </template>
            </ButtonComponent>
          </DemoCard>

          <!-- Action Layout -->
          <DemoCard label="Save/Cancel Actions" :code="codeExamples.dashboardActions">
            <div class="flex items-center gap-2">
              <button
                class="py-1 px-2 min-w-[6.25rem] text-lg font-medium flex justify-center items-center hover:bg-white transition-colors">
                <span class="text-[#0c111d] break-words leading-7 text-lg font-medium uppercase">Cancel</span>
              </button>
              <button
                class="group py-1 px-2 gap-2.5 min-w-[5.3125rem] bg-black flex justify-center items-center hover:bg-[#07f468] transition-colors">
                <span
                  class="text-[#07f468] break-words leading-7 text-lg font-medium uppercase group-hover:text-black">Save</span>
              </button>
            </div>
          </DemoCard>

          <!-- Profile / Go Live -->
          <DemoCard label="Profile / Go Live" :code="codeExamples.dashboardProfile">
            <div class="flex items-center self-stretch gap-4 w-full">
              <div class="flex-1 self-stretch flex items-center gap-2">
                <button
                  class="bg-black shadow-[4px_4px_0_0_#fb5ba2] h-10 w-10 relative flex justify-center items-center cursor-pointer transition-all duration-150 ease-in-out hover:bg-[#07f468] hover:shadow-[4px_4px_0_0_#000]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    class="pointer-events-none transition-all duration-150 ease-in-out h-6 w-6">
                    <g id="dots-vertical">
                      <g id="Icon">
                        <path
                          d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
                          stroke="#FB5BA2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        <path
                          d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z"
                          stroke="#FB5BA2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        <path
                          d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z"
                          stroke="#FB5BA2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </g>
                    </g>
                  </svg>
                </button>

                <button
                  class="group bg-black shadow-[4px_4px_0_0_#fb5ba2] transition-all duration-150 ease-in-out hover:bg-[#07f468] hover:shadow-[4px_4px_0_0_#000] flex-1 self-stretch flex items-center justify-center -skew-x-[20deg]">
                  <span
                    class="skew-x-[20deg] font-medium text-lg leading-7 text-white transition-all duration-150 ease-in-out group-hover:text-black">View
                    Profile</span>
                </button>
              </div>

              <div class="flex-1 self-stretch flex items-center">
                <button
                  class="group [filter:grayscale(100%)] bg-[#9f9f9f] shadow-[4px_4px_0_0_#636363] transition-all duration-150 ease-in-out cursor-default flex-1 self-stretch flex items-center justify-center -skew-x-[20deg]">
                  <span
                    class="skew-x-[20deg] font-medium text-lg leading-7 text-black transition-all duration-150 ease-in-out flex items-center gap-2.5">
                    Go Live
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                      class="w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(55%)_sepia(10%)_saturate(5098%)_hue-rotate(296deg)_brightness(98%)_contrast(101%)] transition-all duration-150 ease-in-out">
                      <path
                        d="M9.77811 6.63604C9.22582 6.63604 8.77811 6.18832 8.77811 5.63604C8.77811 5.08376 9.22583 4.63604 9.77811 4.63604L18.2634 4.63605C18.5395 4.63605 18.7895 4.74798 18.9705 4.92895C19.0664 5.02482 19.1387 5.13532 19.1875 5.25327C19.2364 5.37117 19.2634 5.50046 19.2634 5.63605L19.2634 14.1213C19.2634 14.6736 18.8157 15.1213 18.2634 15.1213C17.7111 15.1213 17.2634 14.6736 17.2634 14.1213L17.2634 8.05026L6.24256 19.0711C5.85204 19.4616 5.21887 19.4616 4.82835 19.0711C4.43782 18.6806 4.43782 18.0474 4.82835 17.6569L15.8492 6.63605L9.77811 6.63604Z"
                        fill="#303437" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </DemoCard>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import ButtonComponent from '@/components/button/ButtonComponent.vue';
import DemoSectionHeader from '@/templates/dev/DemoSectionHeader.vue';
import DemoCard from '@/templates/dev/DemoCard.vue';

// State for simulating clicks
const btnStates = reactive({
  btn1: false, btn2: false, btn3: false, btn13: false, btn21: false
});

const handleClick = (btnKey) => {
  btnStates[btnKey] = true;
  setTimeout(() => {
    btnStates[btnKey] = false;
  }, 1500);
};

const codeExamples = {
  primary: `<ButtonComponent 
  text="Primary Button" 
  variant="primary" 
  customClass="px-4 py-2.5 w-full" 
/>`,
  secondary: `<ButtonComponent 
  text="Secondary Button" 
  variant="secondary" 
  customClass="px-4 py-2.5 w-full" 
/>`,
  success: `<ButtonComponent 
  text="Confirm" 
  variant="success" 
  customClass="px-4 py-2.5 w-full" 
/>`,
  danger: `<ButtonComponent 
  text="Delete" 
  variant="danger" 
  customClass="px-4 py-2.5 w-full" 
/>`,
  warning: `<ButtonComponent 
  text="Warning" 
  variant="warning" 
  customClass="px-4 py-2.5 w-full" 
/>`,

  disabled: `<ButtonComponent 
  text="Disabled" 
  variant="primary" 
  :disabled="true" 
  customClass="px-4 py-2.5 w-full" 
/>`,

  leftIcon: `<ButtonComponent 
  text="Download" 
  variant="primary" 
  customClass="px-4 py-2.5 w-full flex items-center justify-center gap-2"
  leftIcon="https://api.iconify.design/heroicons:arrow-down-tray.svg?color=%23ffffff"
  leftIconClass="w-4 h-4 inline-block align-middle" 
/>`,
  rightIcon: `<ButtonComponent 
  text="Next Step" 
  variant="primary" 
  customClass="px-4 py-2.5 w-full flex items-center justify-center gap-2"
  rightIcon="https://api.iconify.design/heroicons:arrow-right.svg?color=%23ffffff"
  rightIconClass="w-4 h-4 inline-block align-middle" 
/>`,
  bothIcons: `<ButtonComponent 
  text="Share" 
  variant="outline" 
  customClass="px-4 py-2.5 w-full flex items-center justify-center gap-2"
  leftIcon="https://api.iconify.design/heroicons:share.svg?color=%23374151"
  leftIconClass="w-4 h-4"
  rightIcon="https://api.iconify.design/heroicons:arrow-right.svg?color=%23374151"
  rightIconClass="w-4 h-4" 
/>`,
  leftIconSuccess: `<ButtonComponent 
  text="Save Changes" 
  variant="success" 
  customClass="px-4 py-2.5 w-full flex items-center justify-center gap-2"
  leftIcon="https://api.iconify.design/heroicons:check.svg?color=%23ffffff"
  leftIconClass="w-4 h-4 inline-block" 
/>`,
  leftIconDanger: `<ButtonComponent 
  text="Delete Item" 
  variant="danger" 
  customClass="px-4 py-2.5 w-full flex items-center justify-center gap-2"
  leftIcon="https://api.iconify.design/heroicons:trash.svg?color=%23ffffff"
  leftIconClass="w-4 h-4 inline-block" 
/>`,
  rightIconExternal: `<ButtonComponent 
  text="Open Link" 
  variant="outline" 
  customClass="px-4 py-2.5 w-full flex items-center justify-center gap-2"
  rightIcon="https://api.iconify.design/heroicons:arrow-top-right-on-square.svg"
  rightIconClass="w-4 h-4 inline-block" 
/>`,
  leftIconWarning: `<ButtonComponent 
  text="Report Issue" 
  variant="warning" 
  customClass="px-4 py-2.5 w-full flex items-center justify-center gap-2"
  leftIcon="...icon-url..."
  leftIconClass="w-4 h-4 inline-block" 
/>`,
  polygonLeftGreen: `<ButtonComponent 
  text="Subscribe" 
  variant="polygonLeft" 
  btnBg="#07f468"
  btnHoverBg="#000" 
  btnText="#000" 
  btnHoverText="#07f468" 
/>`,
  polygonLeftPink: `<ButtonComponent 
  text="Join Now" 
  variant="polygonLeft" 
  btnBg="#FF0066"
  btnHoverBg="#000" 
  btnText="#fff" 
  btnHoverText="#FF0066" 
/>`,
  polygonRight: `<ButtonComponent 
  text="Explore" 
  variant="polygonRight" 
/>`,
  bgGreen: `<ButtonComponent 
  text="Get Started" 
  variant="bgGreen" 
/>`,
  retryAction: `<ButtonComponent 
  text="Try Again" 
  variant="retryAction"
  leftIcon="...icon-url..."
  leftIconClass="w-4 h-4 inline-block align-middle" 
/>`,
  simpleBtnCustom: `<ButtonComponent 
  text="Custom" 
  variant="simpleBtn" 
  btnBg="#6366f1"
  btnHoverBg="#4f46e5" 
  btnText="#fff" 
  btnHoverText="#fff" 
/>`,
  twoPieceSkewRight: `<ButtonComponent
  variant="skew-right"
  text="Link your X account"
>
  <template #leftIcon>
    <!-- SVG Icon -->
  </template>
</ButtonComponent>`,
  dashboardActions: `<div class="flex flex-row gap-2">
  <button class="py-1 px-2 uppercase hover:bg-white text-black">Cancel</button>
  <button class="py-1 px-2 uppercase bg-black hover:bg-[#07f468] text-[#07f468]">Save</button>
</div>`
};
</script>
