<template>
    <PopupHandler :modelValue="modelValue" @update:modelValue="(val) => emit('update:modelValue', val)"
        :config="profileMerchPopupConfig">
        <!-- wrapper   -->
        <div ref="popupWrapper"
            class="bg-black/50 relative before:absolute before:inset-0 before:bg-[url('https://i.ibb.co.com/5WQ43b48/sample-bg-image-compressed.webp')] before:bg-cover before:bg-center before:bg-no-repeat before:content-[''] before:z-[-1] dark:bg-[#181a1b]/50">
            <!-- bg-overlay -->
            <div
                class="absolute inset-0 w-full h-full bg-black/5 backdrop-blur-[125px] pointer-events-none z-[-1] dark:bg-[#181a1b]/5">
            </div>

            <!-- container -->
            <div class="flex flex-col min-h-screen lg:flex-row lg:h-screen lg:overflow-hidden">
                <!-- close-button -->
                <button
                    class="fixed top-4 right-4 flex justify-center items-center w-8 h-8 z-50 drop-shadow-[0px_30px_-34px_#0000004D] cursor-pointer"
                    @click="emit('update:modelValue', false)">
                    <img src="https://i.ibb.co.com/DfT6Sg5g/x-close.webp" alt="x close"
                        class="w-full h-full [filter:brightness(0)_saturate(100%)_invert(97%)_sepia(1%)_saturate(5636%)_hue-rotate(182deg)_brightness(95%)_contrast(81%)]">
                </button>

                <!-- splide-section -->
                <div class="h-full lg:w-1/2 lg:flex lg:flex-col lg:h-screen lg:overflow-hidden">
                    <Splide :options="mainOptions" ref="mainSplide"
                        class="splide bg-black/25 flex-1 min-h-0 dark:bg-[#181a1b]/25" aria-label="Main Gallery">
                        <SplideSlide v-for="(img, i) in images" :key="'main-' + i"
                            class="relative flex items-center justify-center" @mousedown="onMouseDown"
                            @mouseup="onMouseUp(i, $event)">
                            <img :src="img.src" :alt="'Image ' + (i + 1)"
                                class="w-full h-auto block cursor-zoom-in rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                        </SplideSlide>
                    </Splide>

                    <Splide :options="thumbOptions" ref="thumbSplide" class="pt-2 shrink-0" aria-label="Thumbnails">
                        <SplideSlide v-for="(img, i) in images" :key="'thumb-' + i"
                            class="aspect-square backdrop-blur-[10px] border ![border:1px_solid_transparent_!important;] transition-all duration-300 cursor-pointer [&.is-active]:[border:1px_solid_#F5F5F4_!important;] after:content-[''] after:absolute after:inset-0 after:bg-[#222222]/10 after:pointer-events-none dark:after:bg-[#2b2f31]/10 dark:[&.is-active]:[border:1px_solid_#333739_!important;]">
                            <img :src="img.thumb" :alt="'Thumb ' + (i + 1)" class="w-full h-full object-cover">
                        </SplideSlide>
                    </Splide>

                    <div ref="lgTrigger" class="hidden"></div>
                </div>

                <!-- text-section -->
                <div
                    class="flex flex-col p-2 lg:w-1/2 lg:h-screen lg:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] lg:p-6 lg:px-10">
                    <div class="flex flex-col gap-6 lg:gap-10">
                        <!-- text-section__header -->
                        <div class="flex flex-col gap-6">
                            <!-- title-section -->
                            <section class="flex flex-col gap-4 pt-3">
                                <!-- tag-link-section -->
                                <div class="flex items-center gap-1 flex-wrap">
                                    <a href="#"
                                        class="text-sm text-[#D0D5DD] hover:underline hover:text-[#07F468] dark:text-[#cfcac4] dark:hover:text-[#23f97b]">Seasonal
                                        Fruits</a>
                                    <span
                                        class="text-xs leading-normal tracking-[0.01875rem] text-[#D0D5DD] dark:text-[#cfcac4]">,</span>
                                    <a href="#"
                                        class="text-sm text-[#D0D5DD] hover:underline hover:text-[#07F468] dark:text-[#cfcac4] dark:hover:text-[#23f97b]">Mostly
                                        Eating</a>
                                    <span
                                        class="text-xs leading-normal tracking-[0.01875rem] text-[#D0D5DD] dark:text-[#cfcac4]">,</span>
                                    <a href="#"
                                        class="text-sm text-[#D0D5DD] hover:underline hover:text-[#07F468] dark:text-[#cfcac4] dark:hover:text-[#23f97b]">Fried
                                        Chicken</a>
                                </div>

                                <h1
                                    class="text-xl leading-normal font-semibold drop-shadow-[0px_0px_10px_#0000001A] text-[#F5F5F4] lg:text-3xl lg:leading-[2.375rem] dark:text-[#e1dfdb]">
                                    [Peach] from my farm-Peach from my farm (Autumn harvest)</h1>
                            </section>

                            <!-- tags-container -->
                            <div class="flex items-center gap-2">
                                <img src="https://i.ibb.co.com/ZRFYW4BD/tag-01.webp" alt="tag 01"
                                    class="w-4 h-4 min-w-[1rem]">

                                <div class="flex items-center gap-2 flex-wrap">
                                    <!-- tag -->
                                    <div
                                        class="flex justify-center items-center px-2 h-6 bg-[#0C111D] cursor-pointer dark:bg-[#0a0e17]">
                                        <span
                                            class="text-sm font-medium text-[#F9FAFB] dark:text-[#dddad5]">Featured</span>
                                    </div>

                                    <!-- tag -->
                                    <div
                                        class="flex justify-center items-center px-2 h-6 bg-[#0C111D] cursor-pointer dark:bg-[#0a0e17]">
                                        <span class="text-sm font-medium text-[#F9FAFB] dark:text-[#dddad5]">Best
                                            Seller</span>
                                    </div>

                                    <!-- tag -->
                                    <div
                                        class="flex justify-center items-center px-2 h-6 bg-[#0C111D] cursor-pointer dark:bg-[#0a0e17]">
                                        <span class="text-sm font-medium text-[#F9FAFB] dark:text-[#dddad5]">Seasonal
                                            Offers</span>
                                    </div>
                                </div>
                            </div>

                            <!-- likes-view-container -->
                            <div class="flex items-center gap-4 ">
                                <!-- likes -->
                                <div class="flex items-center gap-2">
                                    <img src="https://i.ibb.co.com/9kNrMyfz/heart.webp" alt="heart" class="w-4 h-4">
                                    <span class="text-base text-[#F2F4F7] dark:text-[#e1dfdb]">123</span>
                                </div>

                                <!-- views -->
                                <div class="flex items-center gap-2">
                                    <img src="https://i.ibb.co.com/0V8HcdXr/eye.webp" alt="eye" class="w-4 h-4">
                                    <span class="text-base text-[#F2F4F7] dark:text-[#e1dfdb]">2K</span>
                                </div>

                                <!-- merch -->
                                <div class="flex items-center gap-2">
                                    <img src="https://i.ibb.co.com/YTqCn1M0/shopping-cart-03.webp"
                                        alt="shopping cart 03" class="w-4 h-4">
                                    <span class="text-base text-[#F2F4F7] dark:text-[#e1dfdb]">15</span>
                                </div>
                            </div>

                            <!-- price-display -->
                            <div class="flex flex-col gap-2 md:flex-row md:items-center">
                                <!-- price -->
                                <div class="flex items-baseline gap-0.5 drop-shadow-[0px_0px_40px_#FFC300]">
                                    <span
                                        class="text-xl leading-normal font-semibold align-bottom text-white dark:text-[#e8e6e3]">USD$</span>
                                    <span
                                        class="text-base font-medium line-through align-middle text-white dark:text-[#e8e6e3]">12.99</span>
                                    <span
                                        class="text-6xl leading-[4.5rem] font-semibold align-bottom -tracking-[0.075rem] text-white dark:text-[#e8e6e3]">6.99</span>
                                </div>

                                <!-- labels -->
                                <div
                                    class="flex items-center gap-3 pt-[0.0625rem] pb-2.5 flex-wrap md:items-start md:flex-col md:pb-5">
                                    <!-- yellow-label with icon -->
                                    <div
                                        class="flex justify-center items-center gap-1 px-1.5 py-0.5 bg-[linear-gradient(90deg,#D8AF0D_0%,#9F8009_100%)]">
                                        <img src="https://i.ibb.co.com/3m6JKJSh/clock.webp" alt="clock" class="w-4 h-4">
                                        <span
                                            class="text-xs leading-normal font-semibold text-black dark:text-[#e8e6e3]">Pre-Order
                                            Discount</span>
                                    </div>

                                    <!-- yellow-label -->
                                    <div
                                        class="flex justify-center items-center gap-1 px-1.5 py-0.5 bg-[linear-gradient(90deg,#D8AF0D_0%,#9F8009_100%)]">
                                        <span
                                            class="text-xs leading-normal font-semibold text-black dark:text-[#e8e6e3]">Official
                                            Release: 12 Jul 2024</span>
                                    </div>

                                    <!-- red-label -->
                                    <div class="flex justify-center items-center gap-1 px-1.5 py-0.5 bg-[#FF4405]">
                                        <span
                                            class="text-xs leading-normal font-semibold text-white dark:text-[#e8e6e3]">1
                                            LEFT IN STOCK</span>
                                    </div>
                                </div>
                            </div>

                            <!-- button-container -->
                            <div ref="stickyContainer"
                                :class="['flex w-full group/button-container sticky bottom-0', isSticky ? 'is-sticky w-[calc(100%+1rem)] -ml-2 py-6 bg-[linear-gradient(0deg,rgba(255,255,255,0.01)_0%,rgba(255,255,255,0)_100%)] backdrop-blur-[50px]' : '']">

                                <!-- State: pre-order (Yellow) -->
                                <button v-if="variant === 'pre-order'"
                                    class="relative flex-grow h-14 mx-3 group-[.is-sticky]/button-container:mx-5 border-[3px] border-[#FFFADD] bg-[rgba(242,242,3,0.7)] [background-blend-mode:overlay] px-1 transform skew-x-[-24deg] shadow-[inset_0_0_1px_0_#FFF3A1,0_0_10px_0_#FFB909B2,0_5px_50px_0_#F2F20380,0px_0px_10px_0px_#F2F2030D] before:absolute before:inset-0 before:bg-[url('https://i.ibb.co.com/GfcYM2zK/button-bg.webp')] before:bg-center before:bg-cover before:opacity-75">
                                    <div
                                        class="w-full h-full flex justify-center items-center gap-0.5 relative z-10 skew-x-[24deg]">
                                        <span
                                            class="text-xl font-bold text-[#F5F5F5] drop-shadow-[0px_0px_30px_#10182880] whitespace-nowrap uppercase">Pre-order
                                            NOW</span>
                                    </div>
                                </button>

                                <!-- State: regular (Pink Buy Now + Add to Cart) -->
                                <template v-else-if="variant === 'regular'">
                                    <button
                                        class="relative flex-grow h-14 ml-3 group-[.is-sticky]/button-container:ml-5 border-[3px] border-[#FFE1FC] bg-[#F600FE]/50 [background-blend-mode:overlay] px-1 transform skew-x-[-24deg] shadow-[0_0_10px_0_#F600FEB2,0_5px_50px_0_#E803AE80,0_0_35px_0_#E803AE40,0_0_10px_0_#E803AE0D,inset_0_0_1px_0_#FF97F3E5] before:absolute before:inset-0 before:w-full before:h-full before:content-[''] before:bg-[url('https://i.ibb.co.com/GfcYM2zK/button-bg.webp')] before:bg-center before:bg-cover before:opacity-75 md:before:opacity-65 md:shadow-[0_0_10px_0_#F600FEB2,0_0_40px_0_#E803AE80_inset,0_5px_50px_0_#E803AE80,0_0_35px_0_#E803AE40,0_0_10px_0_#E803AE0D,0_0_1px_0_#FF97F3E5_inset] lg:h-[4.5rem]">
                                        <!-- text-container -->
                                        <div
                                            class="w-full h-full flex justify-center items-center gap-0.5 relative z-[10] skew-x-[24deg]">
                                            <span
                                                class="text-xl leading-normal font-semibold align-middle text-[#F5F5F5] drop-shadow-[0px_0px_30px_0px_#10182880] whitespace-nowrap lg:text-3xl lg:leading-[2.375rem]">BUY
                                                NOW</span>
                                        </div>
                                    </button>

                                    <button
                                        class="relative flex-grow h-14 -ml-[3px] mr-3 group-[.is-sticky]/button-container:mr-5 border-[3px] border-[#FFE1FC] bg-[#E0007880] [background-blend-mode:overlay] px-1 transform skew-x-[-24deg] shadow-[0_0_10px_0_#F600FEB2,0_5px_50px_0_#E803AE80,0_0_35px_0_#E803AE40,0_0_10px_0_#E803AE0D,inset_0_0_1px_0_#FF97F3E5] before:absolute before:inset-0 before:w-full before:h-full before:content-[''] before:bg-[url('https://i.ibb.co.com/GfcYM2zK/button-bg.webp')] before:bg-center before:bg-cover before:opacity-75 md:before:opacity-65 md:shadow-[0_0_10px_0_#F600FEB2,0_0_40px_0_#E803AE80_inset,0_5px_50px_0_#E803AE80,0_0_35px_0_#E803AE40,0_0_10px_0_#E803AE0D,0_0_1px_0_#FF97F3E5_inset] lg:h-[4.5rem]">
                                        <!-- text-container -->
                                        <div
                                            class="w-full h-full flex justify-center items-center gap-0.5 relative z-[10] skew-x-[24deg]">
                                            <span
                                                class="text-xl leading-normal font-semibold align-middle text-[#F5F5F5] drop-shadow-[0px_0px_30px_0px_#10182880] whitespace-nowrap lg:text-3xl lg:leading-[2.375rem]">Add
                                                to Cart</span>
                                        </div>
                                    </button>
                                </template>

                                <!-- State: subscriber-pre-order (Blue) -->
                                <button v-else-if="variant === 'subscriber-pre-order'"
                                    class="relative flex-grow h-14 mx-3 group-[.is-sticky]/button-container:mx-5 border-[3px] border-white bg-[#1EBBFFB2] [background-blend-mode:overlay] px-1 transform skew-x-[-24deg] shadow-[inset_0_0_40px_0_#0D71FC80,inset_0_0_1px_0_#1B45FF,inset_0_0_10px_0_#1EBBFFB2,0_5px_50px_0_#0D71FC80,0_0_35px_0_#0D71FC40,0_0_10px_0_#0D71FC0D] before:absolute before:inset-0 before:w-full before:h-full before:content-[''] before:bg-[url('https://i.ibb.co.com/GfcYM2zK/button-bg.webp')] before:bg-center before:bg-cover before:opacity-75 lg:h-[4.5rem]">
                                    <!-- text-container -->
                                    <div
                                        class="w-full h-full flex justify-center items-center gap-0.5 relative z-[10] skew-x-[24deg]">
                                        <span
                                            class="text-xl leading-normal font-semibold align-middle text-[#F5F5F5] drop-shadow-[0px_0px_30px_0px_#10182880] whitespace-nowrap lg:text-3xl lg:leading-[2.375rem]">Subscribe
                                            & Pre-order</span>
                                    </div>
                                </button>

                                <!-- State: subscriber-grab (Blue) -->
                                <button v-else-if="variant === 'subscriber-grab'"
                                    class="relative flex-grow h-14 mx-3 group-[.is-sticky]/button-container:mx-5 border-[3px] border-white bg-[#1EBBFFB2] [background-blend-mode:overlay] px-1 transform skew-x-[-24deg] shadow-[inset_0_0_40px_0_#0D71FC80,inset_0_0_1px_0_#1B45FF,inset_0_0_10px_0_#1EBBFFB2,0_5px_50px_0_#0D71FC80,0_0_35px_0_#0D71FC40,0_0_10px_0_#0D71FC0D] before:absolute before:inset-0 before:w-full before:h-full before:content-[''] before:bg-[url('https://i.ibb.co.com/GfcYM2zK/button-bg.webp')] before:bg-center before:bg-cover before:opacity-75 lg:h-[4.5rem]">
                                    <!-- text-container -->
                                    <div
                                        class="w-full h-full flex justify-center items-center gap-0.5 relative z-[10] skew-x-[24deg]">
                                        <span
                                            class="text-xl leading-normal font-semibold align-middle text-[#F5F5F5] drop-shadow-[0px_0px_30px_0px_#10182880] whitespace-nowrap lg:text-3xl lg:leading-[2.375rem]">Subscribe
                                            & Grab</span>
                                    </div>
                                </button>

                                <!-- State: out-of-stock (Red) -->
                                <button v-else-if="variant === 'out-of-stock'"
                                    class="relative flex-grow h-14 mx-3 group-[.is-sticky]/button-container:mx-5 border-[3px] border-[#FFE0E3] bg-[#FF44000D] [background-blend-mode:overlay] px-1 transform skew-x-[-24deg] shadow-[0px_0px_40px_0px_#FC190D80_inset,0px_5px_50px_0px_#FC190D80,0px_0px_35px_0px_#FC190D40,0px_0px_10px_0px_#FC190D0D,0px_0px_1px_0px_#FFB6BC_inset] before:absolute before:inset-0 before:w-full before:h-full before:content-[''] before:bg-[url('https://i.ibb.co.com/GfcYM2zK/button-bg.webp')] before:bg-center before:bg-cover before:opacity-40 lg:h-[4.5rem]">
                                    <!-- text-container -->
                                    <div
                                        class="w-full h-full flex justify-center items-center gap-0.5 relative z-[10] skew-x-[24deg]">
                                        <span
                                            class="text-xl leading-normal font-semibold align-middle text-[#F5F5F5] drop-shadow-[0px_0px_30px_0px_#10182880] whitespace-nowrap lg:text-3xl lg:leading-[2.375rem]">OUT
                                            OF STOCK</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <!-- tab-section -->
                        <div class="flex flex-col gap-4 pb-20">
                            <!-- tab-button-container -->
                            <div class="flex items-center gap-4">
                                <button @click="activeTab = 'product-details'"
                                    :class="['flex justify-center items-center p-2.5 w-max border-b transition-all cursor-pointer', activeTab === 'product-details' ? 'border-white opacity-100' : 'border-transparent opacity-50']">
                                    <span class="text-base text-white dark:text-[#e8e6e3]">Product
                                        Details</span>
                                </button>
                                <button @click="activeTab = 'shipping-policy'"
                                    :class="['flex justify-center items-center p-2.5 w-max border-b transition-all cursor-pointer', activeTab === 'shipping-policy' ? 'border-white opacity-100' : 'border-transparent opacity-50']">
                                    <span class="text-base text-white dark:text-[#e8e6e3]">Shipping
                                        Policy</span>
                                </button>
                            </div>

                            <!-- tab-container -->
                            <div class="flex flex-col">
                                <div v-if="activeTab === 'product-details'" class="flex flex-col gap-4">
                                    <p class="text-sm text-[#F5F5F4] dark:text-[#e1dfdb]">Get Jenny’s favourite Mangoes!
                                        Buy
                                        them while supply last !Get Jenny’s favourite Mangoes! Buy them while supply
                                        last
                                        !Get Jenny’s favourite Mangoes! Buy them while supply last !</p>

                                    <ul class="flex flex-col">
                                        <li v-for="i in 7" :key="i"
                                            class="text-sm text-[#F5F5F4] dark:text-[#e1dfdb] relative pl-4 before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-white before:absolute before:left-[0.188rem] before:top-[0.438rem]">
                                            Get Jenny’s favourite Mangoes! Buy them while supply last !</li>
                                    </ul>
                                </div>

                                <div v-else class="flex flex-col gap-4">
                                    <div class="flex items-center gap-2">
                                        <img src="https://i.ibb.co.com/7NBsK3xG/plane.webp" alt="plane" class="w-5 h-5">
                                        <p class="text-sm font-medium text-[#07F468] dark:text-[#23f97b]">This product
                                            ships internationally.</p>
                                    </div>

                                    <div class="hidden items-center gap-2">
                                        <img src="https://i.ibb.co.com/fV9JY4v2/marker-pin-06.webp" alt="marker pin 06"
                                            class="w-5 h-5">
                                        <p class="text-sm font-medium text-[#D7D3D0] dark:text-[#e1dfdb]">This product
                                            ships to Taiwan only.</p>
                                    </div>

                                    <div class="flex gap-4">
                                        <span
                                            class="w-[12.5rem] min-w-[12.5rem] text-sm text-[#F5F5F4] dark:text-[#e1dfdb]">Deliver
                                            from</span>
                                        <div class="flex gap-2 items-center grow flex-wrap">
                                            <span
                                                class="text-sm font-medium text-[#F5F5F4] dark:text-[#e1dfdb]">Taiwan</span>
                                        </div>
                                    </div>

                                    <div class="flex flex-col gap-2">
                                        <span class="text-sm font-semibold text-[#F5F5F4] dark:text-[#e1dfdb]">Shipping
                                            Fee</span>

                                        <div class="flex gap-4">
                                            <span
                                                class="w-[12.5rem] min-w-[12.5rem] text-xs text-[#F5F5F4] dark:text-[#e1dfdb]">Domestic</span>
                                            <div class="flex gap-2 items-center grow flex-wrap">
                                                <span
                                                    class="text-sm font-medium text-[#F5F5F4] dark:text-[#e1dfdb]">Taiwan</span>
                                            </div>
                                        </div>

                                        <div class="flex gap-4">
                                            <span
                                                class="w-[12.5rem] min-w-[12.5rem] text-xs text-[#F5F5F4] dark:text-[#e1dfdb]">International</span>
                                            <div class="flex gap-2 items-center grow flex-wrap">
                                                <span
                                                    class="text-sm font-medium text-[#F5F5F4] dark:text-[#e1dfdb]">USD$
                                                    123</span>
                                                <span
                                                    class="text-xs italic text-[#F5F5F4] dark:text-[#e1dfdb]">Applicable
                                                    to
                                                    all countries</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="flex flex-col gap-2">
                                        <span class="text-sm font-semibold text-[#F5F5F4] dark:text-[#e1dfdb]">Delivery
                                            &
                                            Processing Time</span>

                                        <div class="flex gap-4">
                                            <span
                                                class="w-[12.5rem] min-w-[12.5rem] text-xs text-[#F5F5F4] dark:text-[#e1dfdb]">International</span>
                                            <div class="flex gap-2 items-center grow flex-wrap">
                                                <span
                                                    class="text-sm font-medium text-[#F5F5F4] dark:text-[#e1dfdb]">14-30
                                                    days</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="flex flex-col gap-2">
                                        <span
                                            class="text-sm font-semibold text-[#F5F5F4] dark:text-[#e1dfdb]">Tracking</span>

                                        <p class="text-sm text-[#F5F5F4] dark:text-[#e1dfdb]">Once your order is
                                            shipped,
                                            you will receive a tracking number via email once Jenny has process your
                                            order.
                                        </p>
                                    </div>

                                    <div class="flex flex-col gap-2">
                                        <span class="text-sm font-semibold text-[#F5F5F4] dark:text-[#e1dfdb]">Customs
                                            and
                                            Duties</span>

                                        <p class="text-sm text-[#F5F5F4] dark:text-[#e1dfdb]">Please be aware that
                                            international shipments may be subject to customs inspections and import
                                            duties.
                                            These charges are the responsibility of the recipient and vary by country.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- button-container -->
                        <div class="flex justify-end items-end gap-2">
                            <button
                                v-for="icon in ['https://i.ibb.co.com/fGdzgLXp/share-06.webp', 'https://i.ibb.co.com/hFw7MBf2/icon.webp']"
                                :key="icon"
                                class="flex justify-center items-center w-8 h-8 backdrop-blur-[50px] rounded-full border-[0.5px] border-[#E9E5D3] bg-[#E9E5D3]/5 dark:border-[#36311b] dark:bg-[#36311b]/5">
                                <img :src="icon" class="w-4 h-4">
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </PopupHandler>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import lightGallery from 'lightgallery';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import PopupHandler from '@/components/ui/popup/PopupHandler.vue';
import { Splide, SplideSlide } from '@splidejs/vue-splide';
import '@splidejs/vue-splide/css';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';

const images = [
    { src: "https://picsum.photos/id/1015/1920/1080", thumb: "https://picsum.photos/id/1015/240/160" },
    { src: "https://picsum.photos/id/133/1920/1080", thumb: "https://picsum.photos/id/133/240/160" },
    { src: "https://picsum.photos/id/160/1920/1080", thumb: "https://picsum.photos/id/160/240/160" },
    { src: "https://picsum.photos/id/201/1920/1080", thumb: "https://picsum.photos/id/201/240/160" },
    { src: "https://picsum.photos/id/251/1920/1080", thumb: "https://picsum.photos/id/251/240/160" },
    { src: "https://picsum.photos/id/160/1920/1080", thumb: "https://picsum.photos/id/160/240/160" },
];

const activeTab = ref('product-details');
const isSticky = ref(false);
const mainSplide = ref(null);
const thumbSplide = ref(null);
const lgTrigger = ref(null);
const stickyContainer = ref(null);
const popupWrapper = ref(null);
let lgInstance = null;
let startX, startY;

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    variant: {
        type: String,
        default: 'regular',
        validator: (value) => ['regular', 'pre-order', 'subscriber-pre-order', 'subscriber-grab', 'out-of-stock'].includes(value)
    },
});

const emit = defineEmits(["update:modelValue"]);

// When popup opens, Splide needs to recalculate dimensions because
// it was mounted while the popup was hidden (zero dimensions).
watch(() => props.modelValue, async (val) => {
    if (val) {
        await nextTick();
        // Small delay to ensure PopupHandler has finished its transition
        setTimeout(() => {
            mainSplide.value?.splide?.refresh();
            thumbSplide.value?.splide?.refresh();
        }, 50);
    }
});

const profileMerchPopupConfig = {
    actionType: "slidein",
    from: "right",
    offset: "0px",
    speed: "250ms",
    effect: "ease-in-out",
    showOverlay: false,
    closeOnOutside: true,
    lockScroll: true,
    escToClose: true,
    width: { default: "100%", "<768": "100%" },
    height: { default: "100%", "<768": "100%" },
    scrollable: true,
    closeSpeed: "250ms",
    closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
};

const mainOptions = {
    type: 'fade',
    pagination: false,
    arrows: false,
    cover: true,
    heightRatio: 1.22445,
    mediaQuery: 'min',
    breakpoints: {
        480: { heightRatio: 1.1755, height: '450px' },
        1024: { heightRatio: 'auto', fixedHeight: '100vh' }
    }
};

const thumbOptions = {
    perPage: 6,
    gap: 8,
    pagination: false,
    isNavigation: true,
    arrows: false,
    drag: true,
    mediaQuery: 'min',
};

const onMouseDown = (e) => { startX = e.clientX; startY = e.clientY; };
const onMouseUp = (index, e) => {
    const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
    if (dist < 12) lgInstance.openGallery(index);
};

const checkSticky = () => {
    if (!stickyContainer.value) return;
    const rect = stickyContainer.value.getBoundingClientRect();
    isSticky.value = Math.abs(rect.bottom - window.innerHeight) < 2;
};

// Check for fine pointer (mouse)
const hasFinePointer = () => window.matchMedia('(pointer: fine)').matches;

onMounted(async () => {
    await nextTick();
    const main = mainSplide.value.splide;
    const thumbs = thumbSplide.value.splide;
    if (main && thumbs) main.sync(thumbs);

    // Init LightGallery
    lgInstance = lightGallery(lgTrigger.value, {
        container: popupWrapper.value,
        dynamic: true,
        dynamicEl: images.map(img => ({ src: img.src, thumb: img.thumb })),
        plugins: [lgThumbnail, lgZoom],
        speed: 400,
        download: false,
        counter: false,
        controls: false,
        showCloseIcon: false,
        addClass: 'lg-custom-thumbs',
        backdropClass: 'lg-profile-merch-backdrop',
        thumbMargin: 0,
        zoom: true,
        actualSize: false,
    });

    // Parallax & Custom Cursor Logic
    lgTrigger.value.addEventListener('lgAfterOpen', () => {
        const outer = document.querySelector('.lg-outer');
        if (!outer) return;

        // Hide Scrollbar of the popup container to prevent clipping/artifacts
        if (popupWrapper.value && popupWrapper.value.parentElement) {
            popupWrapper.value.parentElement.style.overflow = 'hidden';
        }

        // Force-hide default toolbar & content bottom shift (handled by CSS, but robust safety here)
        const toolbar = outer.querySelector('.lg-toolbar');
        if (toolbar) toolbar.classList.add('!hidden');

        const lgImageContainer = outer.querySelector('.lg-content');
        if (lgImageContainer) lgImageContainer.classList.add('!bottom-[7.875rem]');

        // Custom Close Button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'fixed top-6 right-6 flex justify-center items-center w-12 h-12 bg-black/30 backdrop-blur-[10px] rounded-full cursor-pointer z-[10000] dark:bg-[#181a1b]/30';
        closeBtn.innerHTML = `
            <img src="https://i.ibb.co.com/DfT6Sg5g/x-close.webp" 
                 alt="x close" 
                 class="w-8 h-8 drop-shadow-[0px_0px_8px_#00000080] [filter:brightness(0)_saturate(100%)_invert(97%)_sepia(1%)_saturate(5636%)_hue-rotate(182deg)_brightness(95%)_contrast(81%)]">
        `;
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (lgInstance) lgInstance.closeGallery();
        });
        outer.appendChild(closeBtn);

        // CUSTOM CURSOR (only if fine pointer)
        let customCursor = null;
        if (hasFinePointer()) {
            customCursor = document.createElement('div');
            customCursor.id = 'lg-custom-cursor';
            customCursor.className = `flex justify-center items-center w-10 h-10 lg:w-20 lg:h-20 rounded-full bg-black/25 backdrop-blur-[10px] group/cursor dark:bg-[#181a1b]/25 pointer-events-none fixed z-[9999] transition-opacity duration-200 opacity-0 transform -translate-x-1/2 -translate-y-1/2`;
            customCursor.innerHTML = `
                <img src="https://i.ibb.co.com/TDGYvfTn/zoom-in.webp" alt="zoom in" class="w-6 h-6 lg:w-10 lg:h-10 zoom-in-icon transition-all duration-200">
                <img src="https://i.ibb.co.com/jdwwgzf/zoom-out.webp" alt="zoom out" class="w-6 h-6 lg:w-10 lg:h-10 zoom-out-icon hidden transition-all duration-200">
            `;
            outer.appendChild(customCursor);

            // Inject strong cursor override for Chrome/Safari compatibility
            if (!document.getElementById('lg-cursor-override')) {
                const style = document.createElement('style');
                style.id = 'lg-cursor-override';
                style.innerHTML = `
                @media (pointer: fine) {
                    .lg-outer.lg-grab .lg-item img,
                    .lg-outer.lg-grabbing .lg-item img {
                    }
                }
                `;
                document.head.appendChild(style);
            }
        }

        // Force-hide ALL default cursors
        const forceNoCursor = () => {
            const imageAreas = outer.querySelectorAll('.lg-object, .lg-image');
            imageAreas.forEach(el => {
                if (el) el.style.setProperty('cursor', 'none', 'important');
            });
        };
        forceNoCursor();

        // Background Blur Logic
        // Handled via CSS class .lg-profile-merch-backdrop
        const lgBackgroundWrapper = document.querySelector('.lg-backdrop');
        if (lgBackgroundWrapper) {
            // Apply background-size and position via JS as it changes with image
            lgBackgroundWrapper.style.backgroundSize = 'cover';
            lgBackgroundWrapper.style.backgroundPosition = 'center';
            lgBackgroundWrapper.style.backgroundRepeat = 'no-repeat';
        }

        const updateBackground = () => {
            const currentImg = outer.querySelector('.lg-current img');
            if (currentImg && lgBackgroundWrapper) {
                lgBackgroundWrapper.style.backgroundImage = `url(${currentImg.src})`;
            }
        };
        updateBackground();

        // Thumbnails Logic
        const thumbOuter = outer.querySelector('.lg-thumb-outer');
        if (thumbOuter) thumbOuter.classList.add('!bg-transparent');

        const thumbInner = outer.querySelector('.lg-thumb');
        if (thumbInner) {
            thumbInner.classList.add('!w-full', '!flex', 'justify-self-center', 'gap-1', '!bg-transparent', 'drop-shadow-[0px_30px_-34px_#0000004D]', '!p-1', '!m-0', '!flex-nowrap', '!overflow-x-hidden', '!transform-none', '!transition-none', 'md:!w-[45rem]', 'md:!p-2', 'md:gap-2');
        }

        const thumbItems = outer.querySelectorAll('.lg-thumb-item');
        thumbItems.forEach(wrapper => {
            wrapper.classList.add('!h-auto', '!aspect-square', '!mb-0', 'backdrop-blur-[10px]', 'bg-white/20', '[border:1px_solid_transparent_!important;]', '[&.active]:[border:1px_solid_#F5F5F4_!important;]', 'dark:bg-[#181a1b]/20', 'dark:[&.active]:[border:1px_solid_#333739_!important;]');
            // Dynamic width calculation
            if (window.innerWidth >= 1024) {
                wrapper.style.setProperty('width', `calc((45rem - 1.75rem) / ${images.length})`, 'important');
            } else {
                wrapper.style.setProperty('width', `calc((100vw - 1.75rem) / ${images.length})`, 'important');
            }

            const img = wrapper.querySelector('img');
            if (img) img.classList.add('!w-full', '!h-full', '!object-cover');
        });

        const imgWraps = outer.querySelectorAll('.lg-img-wrap');
        imgWraps.forEach(wrap => {
            wrap.style.transition = 'transform 0.08s cubic-bezier(0.23, 1, 0.32, 1) !important';
            wrap.style.willChange = 'transform';
        });

        const getCurrentImgWrap = () => {
            return outer.querySelector('.lg-current .lg-img-wrap');
        };

        // Mouse Move Handler
        const handleMouseMove = (e) => {
            const imgWrap = getCurrentImgWrap();
            if (!imgWrap) return;

            const isZoomed = outer.classList.contains('lg-zoomed');

            if (isZoomed) {
                const rect = outer.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width - 0.5) * 80;
                const y = ((e.clientY - rect.top) / rect.height - 0.5) * 80;
                imgWrap.style.transform = `translate(${x}px, ${y}px)`;
            } else {
                imgWrap.style.transform = '';
            }

            // Custom Cursor Logic
            if (customCursor) {
                const isOverImage = e.target.closest('.lg-object') || e.target.closest('.lg-image');
                if (isOverImage) {
                    customCursor.style.left = `${e.clientX}px`;
                    customCursor.style.top = `${e.clientY}px`;
                    customCursor.style.opacity = '1';

                    const zoomInIcon = customCursor.querySelector('.zoom-in-icon');
                    const zoomOutIcon = customCursor.querySelector('.zoom-out-icon');
                    if (isZoomed) {
                        zoomInIcon?.classList.add('hidden');
                        zoomOutIcon?.classList.remove('hidden');
                    } else {
                        zoomInIcon?.classList.remove('hidden');
                        zoomOutIcon?.classList.add('hidden');
                    }
                } else {
                    customCursor.style.opacity = '0';
                }
            }
        };

        outer.addEventListener('mousemove', handleMouseMove);

        // Helper to clean up listener
        const cleanupListener = () => {
            outer.removeEventListener('mousemove', handleMouseMove);
        };

        // lgAfterSlide Logic
        const onSlide = () => {
            const imgWrap = getCurrentImgWrap();
            if (imgWrap) imgWrap.style.transform = '';

            updateBackground();

            const thumb = outer.querySelector('.lg-thumb');
            if (thumb) {
                thumb.style.left = '0px';
                thumb.style.transform = 'translateX(0px)';
                thumb.style.display = 'flex'; // Re-apply flex
            }
            forceNoCursor();
        };

        lgTrigger.value.addEventListener('lgAfterSlide', onSlide);

        // Cleanup on Close
        lgTrigger.value.addEventListener('lgBeforeClose', () => {
            cleanupListener();
            const cursor = outer.querySelector('#lg-custom-cursor');
            if (cursor) cursor.remove();

            // Restore Scrollbar
            if (popupWrapper.value && popupWrapper.value.parentElement) {
                popupWrapper.value.parentElement.style.removeProperty('overflow');
            }

            lgTrigger.value.removeEventListener('lgAfterSlide', onSlide);
        }, { once: true });

    });
});

onUnmounted(() => {
    window.removeEventListener('scroll', checkSticky, true);
    window.removeEventListener('resize', checkSticky);
    lgInstance?.destroy();
});
</script>

<style>
/* Global styles for LightGallery when appended to body */
.lg-outer {
    z-index: 999999 !important;
    position: fixed !important;
    /* Scoped to viewport for correct centering */
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
}

/* Custom Backdrop Class */
.lg-backdrop.lg-profile-merch-backdrop {
    z-index: 999998 !important;
    background-color: rgba(0, 0, 0, 0.5) !important;
    backdrop-filter: blur(125px) !important;
    -webkit-backdrop-filter: blur(125px) !important;
    opacity: 1 !important;
    transition: opacity 0.4s ease 0s !important;
}

/* Dark mode support for backdrop if needed, though usually handled by opacity/color */
.dark .lg-backdrop.lg-profile-merch-backdrop {
    background-color: rgba(24, 26, 27, 0.5) !important;
}

/* Pseudo-element for the background image overlay effect (if needed) */
.lg-backdrop.lg-profile-merch-backdrop::after {
    content: "";
    position: absolute;
    inset: 0;
    background-color: inherit;
    z-index: 1;
}

/* Instance specific overrides using the class added in config: 'lg-custom-thumbs' */
.lg-outer.lg-custom-thumbs {
    cursor: none !important;
}

.lg-outer.lg-custom-thumbs .lg-item img {
    cursor: none !important;
}

.lg-outer.lg-custom-thumbs .lg-img-wrap {
    transition: transform 0.08s cubic-bezier(0.23, 1, 0.32, 1) !important;
    will-change: transform;
}

/* Strict Layout Overrides for LightGallery to prevent gaps */
.lg-outer.lg-custom-thumbs .lg-toolbar {
    display: none !important;
    height: 0 !important;
}

.lg-outer.lg-custom-thumbs .lg-content {
    top: 0 !important;
    bottom: 7.875rem !important;
    /* Space for thumbnails */
    height: auto !important;
    padding-top: 0 !important;
}

.lg-outer.lg-custom-thumbs .lg-inner {
    top: 0 !important;
    margin-top: 0 !important;
}
</style>

<style scoped>
.is-sticky::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(0deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0) 100%);
}
</style>