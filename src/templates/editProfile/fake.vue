<template>
    
  

        <!-- payout-popup -->
        <div class="fixed inset-0 w-screen h-screen overflow-hidden bg-white/10 z-[9999] dark:bg-[#181a1b]/10">
            <!-- blur-overlay -->
            <div class="absolute inset-0 w-full h-full backdrop-blur-[5px] pointer-events-none z-[-1]"></div>
            
            <!-- popup-inner-wrapper -->
            <div class="absolute top-0 right-0 w-full h-screen overflow-hidden backdrop-blur-[50px] shadow-[0px_0px_10px_0px_#00000040] bg-[#F9FAFB]/90 md:w-[29.1875rem] dark:bg-[#1b1d1e]/90">
                <!-- popup-container -->
                <div class="flex flex-col h-full shadow-[0px_0px_10px_-34px_#0000001A] [background:linear-gradient(0deg,rgba(255,255,255,0.9),rgba(255,255,255,0.9)),linear-gradient(180deg,rgba(255,255,255,0.75)_0%,rgba(255,255,255,0)_100%)] before:inset-0 before:content-[''] before:absolute before:bg-[url('https://i.ibb.co.com/6Rz2GJd8/payout-popup-gradient.png')] before:bg-cover before:bg-center before:bg-no-repeat before:[opacity:12.5%] before:z-[0] before:pointer-events-none">
                    <!-- progress-bar -->
                    <div class="hidden overflow-hidden w-full h-2 bg-[#EAECF0] dark:bg-[#222526] z-[1]">
                      <div class="w-[92%] h-full bg-[#0c111d] dark:bg-[#0a0e17]"></div>
                    </div>

                    <!-- alert-container -->
                    <div data-alert-container class="flex w-full relative">
                        <div class="w-[3px] block bg-[#2ED3B7] dark:bg-[#23a897]"></div>
                        <div class="flex gap-4 px-4 py-3.5 min-h-[4rem] flex-1 min-w-0 min-h-0 shadow-[0px_0px_8px_0px_#2ED3B714] [background:linear-gradient(0deg,rgba(255,255,255,0.9),rgba(255,255,255))] before:absolute before:content-[''] before:top-0 before:left-0 before:w-full before:h-full before:bg-gradient-to-r before:[background:linear-gradient(90deg,rgba(46,211,183,0.15)_0%,rgba(46,211,183,0)_75%)] relative">
                            <div class="relative w-full flex items-center gap-2.5">
                                <div class="flex justify-center items-center w-6 h-6 min-w-[1.5rem]">
                                    <img src="https://i.ibb.co.com/dJkc0WbZ/check-circle.webp" alt="check circle" class="w-10 h-10 min-w-[2.5rem] drop-shadow-[0px_0px_10.67px_#2FD0B580] [filter:brightness(0)_saturate(100%)_invert(83%)_sepia(42%)_saturate(747%)_hue-rotate(104deg)_brightness(87%)_contrast(89%)]">
                                </div>

                                <div class="flex flex-col w-full flex-1">
                                    <div class="flex justify-between items-start gap-1">
                                        <div class="flex flex-col gap-2">
                                            <h3 class="text-sm font-semibold text-[#15B79E] dark:text-[#52ebd3]">Your payout request has been accepted.</h3>
                                        </div>

                                        <!-- close-button -->
                                        <button class="hidden justify-center items-center w-6 h-6">
                                            <img src="https://i.ibb.co.com/DfT6Sg5g/x-close.webp" alt="x close" class="w-6 h-6 min-w-[1.5rem] [filter:brightness(0)_saturate(100%)_invert(92%)_sepia(8%)_saturate(217%)_hue-rotate(178deg)_brightness(97%)_contrast(82%)]">
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- main-section -->
                    <div class="flex flex-col gap-6 px-2 pt-2 pb-4 min-h-0 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] z-[2] md:p-4">
                        <!-- header -->
                        <div class="flex justify-between items-center">
                            <h2 class="text-sm font-semibold text-[#344054] dark:text-[#bdb8af]"></h2>

                            <button class="flex justify-center items-center w-6 h-6 md:w-10 md:h-10">
                                <img src="https://i.ibb.co.com/Q3RfM295/close.webp" alt="close" class="w-full h-full [filter:brightness(0)_saturate(100%)_invert(73%)_sepia(11%)_saturate(425%)_hue-rotate(179deg)_brightness(87%)_contrast(89%)]">
                            </button>
                        </div>

                        <div class="flex flex-col justify-center items-center gap-6 text-center">
                            <div class="flex justify-center items-center w-[12.5rem] h-[12.5rem]">
                                <img src="https://i.ibb.co.com/TMyYVxdV/pay-deposited.webp" alt="pay deposited" class="w-full h-full drop-shadow-[0px_0px_32px_#FFFFFF,0px_0px_12px_#2C2C2C80,0px_0px_4px_#00000080]">
                            </div>
                            <h2 class="text-2xl font-medium text-[#0C111D] md:text-3xl md:leading-[2.375rem] dark:text-[#dbd8d3]"><span class="text-3xl leading-[2.375rem] font-semibold text-[#0C111D] md:text-4xl md:leading-[2.75rem] md:tracking-[0.045rem] dark:text-[#dbd8d3]">USD$117.86</span><br>will be deposited into your account within {N} business days.</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
</template>