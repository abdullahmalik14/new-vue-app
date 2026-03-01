<script setup>
const props = defineProps({
  engine: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div
    class="w-96 h-full min-h-0 relative rounded-3xl overflow-hidden 
    bg-[linear-gradient(180deg,rgba(12,17,29,0)_25%,#0C111D_100%),url('/images/ai-art.png')]
    bg-center bg-cover bg-no-repeat"
  >

    <!-- HEADER (FIXED) -->
    <div class="left-0 top-0 absolute bg-gray-900 inline-flex overflow-hidden z-10">
      <div class="pl-4 pr-1.5 py-1 bg-[#FF0066] rounded-br flex justify-center items-center gap-2.5">
        <div class="text-white text-sm font-bold leading-5">Group Event</div>
      </div>
      <div class="px-1.5 py-1 flex justify-center items-center gap-2.5">
        <div class="text-yellow-300 text-sm font-bold leading-5">Limited spots!</div>
      </div>
    </div>

    <!-- MAIN FLEX WRAPPER -->
    <div class="w-96 h-full bg-gradient-to-b from-gray-900/0 to-gray-900 rounded-3xl inline-flex flex-col">

      <!-- BODY (SCROLLABLE) -->
      <div  
        class="flex-1 overflow-y-auto pt-10
        [&::-webkit-scrollbar]:hidden
        [-ms-order-style:none]
        [scrollbar-width:none]"
      >
        <div class="w-full flex flex-col items-start">
          <div class="w-full min-h-[200px] px-4 pt-4 pb-2 flex flex-col justify-end items-start gap-4">
            <div class="w-full flex flex-col items-start gap-4">
              <div class="w-full text-white text-3xl font-semibold leading-9 line-clamp-2">
                J&B’s Cooking show
              </div>

              <div class="w-full inline-flex items-center gap-2">
                <div class="w-8 h-8 relative">
                  <img src="/images/token.svg" alt="" />
                </div>
                <div class="flex items-center gap-[5px]">
                  <span class="text-white text-3xl font-semibold leading-10">500</span>
                  <span class="text-white text-2xl font-semibold leading-8">Tokens</span>
                  <div class="py-1 flex justify-center items-center gap-2.5">
                    <div class="text-white text-sm font-normal leading-5">
                      minimum contribution
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-2 pb-4 flex flex-col items-start backdrop-blur-[2px]">
            <div class="px-4 flex flex-col items-start gap-4">
             <div class=" flex-1 pt-2 pb-4  flex flex-col  items-start">
                <div class=" flex-1 px-4 flex flex-col  items-start gap-4">
                    <div class=" flex flex-col justify-center items-start gap-2">
                        <div class=" inline-flex  items-start gap-1 flex-wrap content-start">
                            <div class="h-6 flex justify-center items-center gap-1.5">
                                <div class="w-6 h-6 relative">
                                    <img class="w-5 h-5 left-[1.17px] top-[1px] absolute" src="/images/ex-profile.png" />
                                </div>
                                <div class="inline-flex flex-col justify-center items-start">
                                    <div class=" inline-flex  items-center gap-1">
                                        <div class=" text-white text-base font-medium leading-6 line-clamp-1">Princess Carrot Pop</div>
                                        <div class="px-1.5 bg-[#FF0066] rounded-[50px] flex justify-center items-center gap-2.5">
                                            <div class=" text-white text-sm font-medium leading-5">Host</div>
                                        </div>
                                        <div class="w-2.5 h-2.5 relative overflow-hidden">
                                            <img src="/images/svgviewer-png-output-22.webp" alt="">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class=" text-white text-xs font-medium leading-4 line-clamp-1">,</div>
                            <div class="h-6 flex justify-center items-center gap-1.5">
                                <div class="w-6 h-6 relative">
                                    <img class="w-5 h-5 left-[1.17px] top-[1px] absolute" src="/images/ex-profile.png" />
                                </div>
                                <div class="inline-flex flex-col justify-center items-start">
                                    <div class=" inline-flex  items-center gap-1">
                                        <div class=" text-white text-base font-medium leading-6 line-clamp-1">De La Queen</div>
                                        <div class="w-2.5 h-2.5 relative overflow-hidden">
                                            <img src="/images/svgviewer-png-output-22.webp" alt="">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class=" text-white text-xs font-medium leading-4 line-clamp-1">,</div>
                            <div class="h-6 flex justify-center items-center gap-1.5">
                                <div class="w-6 h-6 relative">
                                    <img class="w-5 h-5 left-[1.17px] top-[1px] absolute" src="/images/ex-profile.png" />
                                </div>
                                <div class="inline-flex flex-col justify-center items-start">
                                    <div class=" inline-flex  items-center gap-1">
                                        <div class=" text-white text-base font-medium leading-6 line-clamp-1">Buff Bunny</div>
                                        <div class="w-2.5 h-2.5 relative overflow-hidden">
                                            <img src="/images/svgviewer-png-output-22.webp" alt="">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class=" flex flex-col  items-start gap-4">
                        <div class=" inline-flex  items-start gap-4">
                            <div class="w-6 h-6 relative overflow-hidden">
                                <img src="/images/alarmIcon.png" alt="">                    
                                    </div>
                            <div class="flex-1 flex  items-center gap-2 flex-wrap content-center">
                                <div class=" text-white text-base font-medium leading-6 line-clamp-1">Wednesday, August 24, 2025</div>
                                <div class=" text-white text-base font-medium leading-6 line-clamp-1">9:30pm-10:30pm</div>
                            </div>
                        </div>
                    </div>
                    <div class="flex-1 text-white text-[14px] font-normal leading-6">Join us for a spectacular live stream event featuring three fabulous queens showcasing their culinary talents! Enjoy mouthwatering... </div>
                </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      <!-- BOTTOM (FIXED) -->
      <div class="w-full cursor-pointer rounded-bl-3xl rounded-br-3xl inline-flex items-center overflow-hidden flex-shrink-0">
        <div class="flex-1 flex justify-center items-center overflow-hidden">
          <div class="flex-1 pl-6 pr-2 py-[8px] bg-[#FF0066] inline-flex flex-col justify-center items-center gap-2">
            <div class="w-full flex flex-col justify-center items-start">
              <div class="w-full text-center text-white text-xl font-bold leading-8">
                JOIN EVENT
              </div>
              <div class="w-full text-center text-white text-xs font-medium leading-4">
                Contribute 500 tokens or more to join
              </div>
            </div>

            <div class="flex flex-col gap-1.5 w-full">
              <div class="w-full h-2 rounded-[5px] bg-[#0C111D33]">
                <div class="h-full rounded-[5px] bg-white w-[35%]"></div>
              </div>

              <div class="inline-flex justify-between items-start">
                <div class="flex-1 text-center text-yellow-300 text-xs font-medium leading-4">
                  20/100 spots left!
                </div>
              </div>
            </div>
          </div>

          <img src="/images/pinkUnion.png" alt="" />
        </div>

        <div 
        @click="engine.goToStep(2)"
        class="pr-6 bg-gray-900 inline-flex flex-col justify-center items-center gap-2">
          <div class="w-8 h-8 relative overflow-hidden">
            <img src="/images/pink-arrow-up-right.png" alt="" />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
