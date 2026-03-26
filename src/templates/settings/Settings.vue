<template>

<div class="bg-[#EAECF0] font-sans p-0 m-0 box-border overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] [&.dark]:bg-[#222526]">
    <!-- main-wrapper -->
    <div class="relative before:content-[''] before:fixed before:inset-0 before:pointer-events-none before:bg-cover before:bg-center before:bg-no-repeat before:bg-[url('https://i.ibb.co.com/QvpHN5vD/mobile-gradient-main-bg-1.webp')] before:z-[-1] sm:before:bg-[url('https://i.ibb.co.com/dw910Z5b/gradient-main-bg.webp')] lg:before:absolute">
        <!-- container -->
        <div class="flex min-h-screen z-[0] lg:gap-4 lg:px-4 lg:py-6 lg:h-screen">
            <!-- sidebar -->
            <div data-sidebar class="flex flex-col w-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] bg-[linear-gradient(0deg,rgba(255,255,255,0.01),rgba(255,255,255,0.01)),linear-gradient(180deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_50%,rgba(255,255,255,0.5)_100%)] shadow-[0_0_30px_#0000000D,0_30px_50px_#FFFFFF1A_inset] lg:w-[26.6875rem]">
                <!-- nav -->
                <div class="flex md:hidden flex-col gap-4 p-2 bg-[linear-gradient(0deg,rgba(234,236,240,0.9),rgba(234,236,240,0.9)),linear-gradient(0deg,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0)_100%)] relative">
                    <!-- blur-overlay -->
                    <div class="absolute inset-0 w-full h-full backdrop-blur-[5px] pointer-events-none z-[-1]"></div>
                    
                    <div class="flex justify-between items-center gap-2">

                        <!-- page title -->
                        <div class="flex items-center gap-1.5 relative">
                            <h1 class="text-sm font-semibold text-[#475467] dark:text-[#b1aba0]">Settings</h1>
                        </div>

                        <!-- nav right-item -->
                        <div class="flex items-center gap-2">
                            <div class="flex items-center justify-end gap-2">

                                <!-- choose-language -->
                                <a href="" class="flex items-center justify-center p-1.5 gap-3 rounded hover:bg-[rgba(12,17,29,0.1)]">
                                    <div class="pointer-events-none h-5 w-5">
                                        <img src="https://i.ibb.co/4Rjb4cQd/svgviewer-png-output-37.webp" class="pointer-events-none h-5 w-5 [filter:brightness(0)_saturate(100%)_invert(48%)_sepia(15%)_saturate(548%)_hue-rotate(182deg)_brightness(86%)_contrast(88%)]">
                                    </div>
                                </a>

                                <!-- notification-item -->
                                <div class="relative">

                                    <span class="absolute top-[.125rem] right-[.188rem] h-[.438rem] w-[.438rem] bg-[#F40793] dark:bg-[#C30676] rounded-full block"></span>

                                    <a href="" class="notifications-panel-trigger group cursor-pointer rounded flex items-center justify-center p-1.5 gap-3 hover:bg-[rgba(251,91,162,0.1)]">
                                        <div class="w-5 h-5 pointer-events-none">
                                            <img src="https://i.ibb.co/v65qxNDc/svgviewer-png-output-38.webp" alt="notification" class="h-5 w-5 [filter:brightness(0)_saturate(100%)_invert(48%)_sepia(15%)_saturate(548%)_hue-rotate(182deg)_brightness(86%)_contrast(88%)]">
                                        </div>
                                    </a>

                                </div>

                                <!-- user-profile-item -->
                                <div class="flex justify-end items-center relative">
                                    <a href="#" class="flex flex-col items-center justify-center gap-0.5 rounded px-1">
                                        <div class="pointer-events-none h-8 w-8 flex justify-center items-center">

                                            <div class="relative w-6 h-6">

                                                <div class="rounded-full w-6 h-6">
                                                    <img src="https://i.ibb.co/jkjtwC9C/svgviewer-png-output-17.webp" class="bg-[#4CC9F0] object-cover w-full h-full rounded-full">
                                                </div>

                                                <div class="bg-[#FDB022] dark:bg-[#B77702] w-1.5 h-1.5 absolute block bottom-0 right-0 rounded-full"></div>

                                            </div>

                                        </div>
                                    </a>
                                </div>

                            </div>

                            <!-- Hamburger-menu -->
                            <div class="py-1 rounded gap-0.5 px-2 flex flex-col justify-center items-center cursor-pointer">
                                <div class="w-6 h-6 pointer-events-none">
                                    <img src="https://i.ibb.co/SwVgDdjR/svgviewer-png-output-39.webp" class="w-6 h-6 pointer-events-none [filter:brightness(0)_saturate(100%)_invert(48%)_sepia(15%)_saturate(548%)_hue-rotate(182deg)_brightness(86%)_contrast(88%)]">
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <div class="flex flex-col">
                    <!-- user-info -->
                    <div class="flex flex-col justify-center items-center self-stretch gap-4 border-b border-white px-2 py-4 md:px-4 md:pt-10 md:pb-6 lg:px-0 lg:py-6 dark:border-[#303436]">
                        <!-- avatar -->
                        <div class="relative rounded-full w-[7.5rem] h-[7.5rem]">
                            <div class="w-full h-full relative overflow-hidden border-[0.75px] border-[#00000014] rounded-full dark:border-[#363b3d14]">
                                <img src="https://i.ibb.co.com/cKFHZbnm/placeholder-headshot-creator-trans-bg.webp" alt="placeholder-headshot-creator-trans-bg" class="w-full h-full object-cover rounded-full"/>
                            </div>

                            <!-- active dot -->
                            <div class="absolute block rounded-full w-4 h-4 top-[7.125rem] left-[7.125rem] bg-[#07F468] dark:bg-[#06c353]"></div>
                        </div>

                        <!-- user-details -->
                        <div class="flex flex-col justify-center items-center gap-1 self-stretch text-center">
                            <h2 class="text-xl leading-normal font-semibold text-[#0c111d] dark:text-[#dbd8d3]">Carrot pops</h2>
                            <span class="text-base text-[#0c111d] dark:text-[#dbd8d3]">@carrot_popxoxo123</span>
                            <span class="text-sm text-center self-stretch text-[#344054] dark:text-[#bdb7af]">mscarrot_pops@gmail.com</span>
                        </div>

                        <!-- edit-profile-button -->
                        <div class="inline-flex justify-start items-center gap-0.5">
                            <a href="#" class="inline-flex justify-start items-center gap-0.5">
                                <div class="text-xs leading-normal font-medium text-[#155eef] dark:text-[#2b8cf1]">Edit Profile</div>
                                <div class="w-4 h-4 relative">
                                    <img src="https://i.ibb.co.com/hRx6tshS/svgviewer-png-output-5.webp" alt="svgviewer-png-output-5" class="w-4 h-4"/>
                                </div>
                            </a>
                        </div>
                    </div>

                    <!-- Others Accout Pages Link -->
                    <div class="flex flex-col justify-start items-start gap-4 self-stretch h-full px-2 py-4 md:gap-6 md:px-4 md:py-6 lg:px-6">

                        <!-- GENERAL -->
                        <div class="flex flex-col justify-start items-start self-stretch gap-1 md:gap-2">
                            <div class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">GENERAL</div>

                            <div data-tab-button="account-information" class="inline-flex justify-start items-center gap-2.5 self-stretch py-1 cursor-pointer group active [&.disabled]:pointer-events-none">
                                <div class="text-base font-medium flex-grow text-[#0c111d] group-[.active]:text-black lg:group-[.active]:text-[#004eeb] group-[.disabled]:text-[#667085] dark:text-[#dbd8d3] dark:group-[.active]:text-[#e8e6e3] dark:lg:group-[.active]:text-[#3f9dff] dark:group-[.disabled]:text-[#9e9589]">
                                    Account Information
                                </div>
                                <div class="w-6 h-6 relative">
                                    <img src="https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp" alt="svgviewer-png-output-6" class="w-6 h-6 lg:group-[.active]:[filter:brightness(0)_saturate(100%)_invert(24%)_sepia(88%)_saturate(7497%)_hue-rotate(220deg)_brightness(96%)_contrast(101%)] group-[.disabled]:[filter:brightness(0)_saturate(100%)_invert(45%)_sepia(13%)_saturate(594%)_hue-rotate(183deg)_brightness(92%)_contrast(92%)]">
                                </div>
                            </div>

                            <div data-tab-button="change-password" class="inline-flex justify-start items-center gap-2.5 self-stretch py-1 cursor-pointer group [&.disabled]:pointer-events-none">
                                <div class="text-base font-medium flex-grow text-[#0c111d] group-[.active]:text-black lg:group-[.active]:text-[#004eeb] group-[.disabled]:text-[#667085] dark:text-[#dbd8d3] dark:group-[.active]:text-[#e8e6e3] dark:lg:group-[.active]:text-[#3f9dff] dark:group-[.disabled]:text-[#9e9589]">
                                    Change Password
                                </div>
                                <div class="w-6 h-6 relative">
                                    <img src="https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp" alt="svgviewer-png-output-6" class="w-6 h-6 lg:group-[.active]:[filter:brightness(0)_saturate(100%)_invert(24%)_sepia(88%)_saturate(7497%)_hue-rotate(220deg)_brightness(96%)_contrast(101%)] group-[.disabled]:[filter:brightness(0)_saturate(100%)_invert(45%)_sepia(13%)_saturate(594%)_hue-rotate(183deg)_brightness(92%)_contrast(92%)]">
                                </div>
                            </div>

                            <div data-tab-button="privacy-security" class="inline-flex justify-start items-center gap-2.5 self-stretch py-1 cursor-pointer group [&.disabled]:pointer-events-none">
                                <div class="text-base font-medium flex-grow text-[#0c111d] group-[.active]:text-black lg:group-[.active]:text-[#004eeb] group-[.disabled]:text-[#667085] dark:text-[#dbd8d3] dark:group-[.active]:text-[#e8e6e3] dark:lg:group-[.active]:text-[#3f9dff] dark:group-[.disabled]:text-[#9e9589]">
                                    Privacy &amp; Security
                                </div>
                                <div class="w-6 h-6 relative">
                                    <img src="https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp" alt="svgviewer-png-output-6" class="w-6 h-6 lg:group-[.active]:[filter:brightness(0)_saturate(100%)_invert(24%)_sepia(88%)_saturate(7497%)_hue-rotate(220deg)_brightness(96%)_contrast(101%)] group-[.disabled]:[filter:brightness(0)_saturate(100%)_invert(45%)_sepia(13%)_saturate(594%)_hue-rotate(183deg)_brightness(92%)_contrast(92%)]">
                                </div>
                            </div>
                        </div>

                        <!-- CALL & LIVE STREAM -->
                        <div class="flex flex-col justify-start items-start self-stretch gap-1 md:gap-2">
                            <div class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">CALL &amp; LIVE STREAM SETTINGS</div>

                            <div data-tab-button="live-stream-settings" class="inline-flex justify-start items-center gap-2.5 self-stretch py-1 cursor-pointer group [&.disabled]:pointer-events-none disabled">
                                <div class="text-base font-medium flex-grow text-[#0c111d] group-[.active]:text-black lg:group-[.active]:text-[#004eeb] group-[.disabled]:text-[#667085] dark:text-[#dbd8d3] dark:group-[.active]:text-[#e8e6e3] dark:lg:group-[.active]:text-[#3f9dff] dark:group-[.disabled]:text-[#9e9589]">
                                    Live Stream Settings
                                </div>
                                <div class="w-6 h-6 relative">
                                    <img src="https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp" alt="svgviewer-png-output-6" class="w-6 h-6 lg:group-[.active]:[filter:brightness(0)_saturate(100%)_invert(24%)_sepia(88%)_saturate(7497%)_hue-rotate(220deg)_brightness(96%)_contrast(101%)] group-[.disabled]:[filter:brightness(0)_saturate(100%)_invert(45%)_sepia(13%)_saturate(594%)_hue-rotate(183deg)_brightness(92%)_contrast(92%)]">
                                </div>
                            </div>

                            <div data-tab-button="call-settings" class="inline-flex justify-start items-center gap-2.5 self-stretch py-1 cursor-pointer group [&.disabled]:pointer-events-none disabled">
                                <div class="text-base font-medium flex-grow text-[#0c111d] group-[.active]:text-black lg:group-[.active]:text-[#004eeb] group-[.disabled]:text-[#667085] dark:text-[#dbd8d3] dark:group-[.active]:text-[#e8e6e3] dark:lg:group-[.active]:text-[#3f9dff] dark:group-[.disabled]:text-[#9e9589]">
                                    Call Settings
                                </div>
                                <div class="w-6 h-6 relative">
                                    <img src="https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp" alt="svgviewer-png-output-6" class="w-6 h-6 lg:group-[.active]:[filter:brightness(0)_saturate(100%)_invert(24%)_sepia(88%)_saturate(7497%)_hue-rotate(220deg)_brightness(96%)_contrast(101%)] group-[.disabled]:[filter:brightness(0)_saturate(100%)_invert(45%)_sepia(13%)_saturate(594%)_hue-rotate(183deg)_brightness(92%)_contrast(92%)]">
                                </div>
                            </div>
                        </div>

                        <!-- TRANSACTION -->
                        <div class="flex flex-col justify-start items-start self-stretch gap-1 md:gap-2">
                            <div class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">TRANSACTION</div>

                            <div data-tab-button="shipping-address" class="inline-flex justify-start items-center gap-2.5 self-stretch py-1 cursor-pointer group [&.disabled]:pointer-events-none">
                                <div class="text-base font-medium flex-grow text-[#0c111d] group-[.active]:text-black lg:group-[.active]:text-[#004eeb] group-[.disabled]:text-[#667085] dark:text-[#dbd8d3] dark:group-[.active]:text-[#e8e6e3] dark:lg:group-[.active]:text-[#3f9dff] dark:group-[.disabled]:text-[#9e9589]">Shipping Address</div>
                                <div class="w-6 h-6 relative">
                                    <img src="https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp" alt="svgviewer-png-output-6" class="w-6 h-6 lg:group-[.active]:[filter:brightness(0)_saturate(100%)_invert(24%)_sepia(88%)_saturate(7497%)_hue-rotate(220deg)_brightness(96%)_contrast(101%)] group-[.disabled]:[filter:brightness(0)_saturate(100%)_invert(45%)_sepia(13%)_saturate(594%)_hue-rotate(183deg)_brightness(92%)_contrast(92%)]">
                                </div>
                            </div>

                            <div data-tab-button="payout-details" class="inline-flex justify-start items-center gap-2.5 self-stretch py-1 cursor-pointer group [&.disabled]:pointer-events-none">
                                <div class="text-base font-medium flex-grow text-[#0c111d] group-[.active]:text-black lg:group-[.active]:text-[#004eeb] group-[.disabled]:text-[#667085] dark:text-[#dbd8d3] dark:group-[.active]:text-[#e8e6e3] dark:lg:group-[.active]:text-[#3f9dff] dark:group-[.disabled]:text-[#9e9589]">Payout Details</div>
                                <div class="w-6 h-6 relative">
                                    <img src="https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp" alt="svgviewer-png-output-6" class="w-6 h-6 lg:group-[.active]:[filter:brightness(0)_saturate(100%)_invert(24%)_sepia(88%)_saturate(7497%)_hue-rotate(220deg)_brightness(96%)_contrast(101%)] group-[.disabled]:[filter:brightness(0)_saturate(100%)_invert(45%)_sepia(13%)_saturate(594%)_hue-rotate(183deg)_brightness(92%)_contrast(92%)]">
                                </div>
                            </div>
                        </div>

                        <!-- SOCIAL MEDIA -->
                        <div class="flex flex-col justify-start items-start self-stretch gap-1 md:gap-2">
                            <div class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">SOCIAL MEDIA AND SHARING</div>

                            <div data-tab-button="newsletter-email-settings" class="inline-flex justify-start items-center gap-2.5 self-stretch py-1 cursor-pointer group disabled [&.disabled]:pointer-events-none">
                                <div class="text-base font-medium flex-grow text-[#0c111d] group-[.active]:text-black lg:group-[.active]:text-[#004eeb] group-[.disabled]:text-[#667085] dark:text-[#dbd8d3] dark:group-[.active]:text-[#e8e6e3] dark:lg:group-[.active]:text-[#3f9dff] dark:group-[.disabled]:text-[#9e9589]">
                                    Newsletter &amp; Email Settings
                                </div>
                                <div class="w-6 h-6 relative">
                                    <img src="https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp" alt="svgviewer-png-output-6" class="w-6 h-6 lg:group-[.active]:[filter:brightness(0)_saturate(100%)_invert(24%)_sepia(88%)_saturate(7497%)_hue-rotate(220deg)_brightness(96%)_contrast(101%)] group-[.disabled]:[filter:brightness(0)_saturate(100%)_invert(45%)_sepia(13%)_saturate(594%)_hue-rotate(183deg)_brightness(92%)_contrast(92%)]">
                                </div>
                            </div>

                            <div data-tab-button="x-repost-automation" class="inline-flex justify-start items-center gap-2.5 self-stretch py-1 cursor-pointer group disabled [&.disabled]:pointer-events-none">
                                <div class="text-base font-medium flex-grow text-[#0c111d] group-[.active]:text-black lg:group-[.active]:text-[#004eeb] group-[.disabled]:text-[#667085] dark:text-[#dbd8d3] dark:group-[.active]:text-[#e8e6e3] dark:lg:group-[.active]:text-[#3f9dff] dark:group-[.disabled]:text-[#9e9589]">
                                    X Repost Automation
                                </div>
                                <div class="w-6 h-6 relative">
                                    <img src="https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp" alt="svgviewer-png-output-6" class="w-6 h-6 lg:group-[.active]:[filter:brightness(0)_saturate(100%)_invert(24%)_sepia(88%)_saturate(7497%)_hue-rotate(220deg)_brightness(96%)_contrast(101%)] group-[.disabled]:[filter:brightness(0)_saturate(100%)_invert(45%)_sepia(13%)_saturate(594%)_hue-rotate(183deg)_brightness(92%)_contrast(92%)]">
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <!-- tab-container -->
            <div data-tab-container class="fixed top-0 left-0 w-full h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] flex flex-col z-[1] bg-[#EAECF0] lg:static lg:!flex lg:flex-1 lg:bg-transparent [&.dark]:bg-[#222526]">
                <!-- bg-wrapper -->
                <div class="relative before:content-[''] before:fixed before:inset-0 before:pointer-events-none before:bg-cover before:bg-center before:bg-no-repeat before:bg-[url('https://i.ibb.co.com/QvpHN5vD/mobile-gradient-main-bg-1.webp')] before:z-[-1] sm:before:bg-[url('https://i.ibb.co.com/dw910Z5b/gradient-main-bg.webp')] lg:before:hidden">
                    <!-- tab (account-information) -->
                    <div data-tab="account-information" class="hidden [&.tab-active]:flex flex-col z-[2] md:gap-2 tab-active">
                        <!-- title-container -->
                        <div class="flex justify-between items-center gap-2.5 px-2 py-4 md:px-4 md:pt-3 md:pb-2 lg:py-3">
                            <h2 class="text-lg font-semibold text-[#667085] md:text-2xl dark:text-[#9e9589]">Account Information</h2>

                            <button data-back-button class="flex items-center gap-2 bg-transparent outline-none cursor-pointer lg:hidden">
                                <img src="https://i.ibb.co.com/zTQHyhyP/arrow-back.webp" alt="arrow back" class="w-4 h-4">
                                <span class="text-lg font-medium text-[#344054] dark:text-[#bdb7af]">BACK</span>
                            </button>

                            <div data-save-cancel-buttons-container class="flex items-center gap-2 md:gap-6">
                                <button data-cancel-button class="flex justify-center items-center">
                                    <span class="text-base font-medium text-[#0C111D] md:text-lg dark:text-[#dbd8d3]">CANCEL</span>
                                </button>

                                <button data-save-button class="flex justify-center items-center px-4 py-1 bg-black md:px-[1.3125rem] md:py-1.5 dark:bg-[#181a1b]">
                                    <span class="text-base font-medium text-[#07F468] md:text-lg dark:text-[#23f97b]">SAVE</span>
                                </button>
                            </div>
                        </div>

                        <!-- content-container -->
                        <div class="flex flex-col gap-2 pb-6 lg:pb-0">
                            <!-- user-information -->
                            <div class="flex flex-col gap-4 p-2 bg-white/40 md:px-4 md:py-6 lg:gap-6 lg:px-6 dark:bg-[#181a1b]/40">
                                <!-- input-container -->
                                <div class="flex flex-col gap-1.5">
                                    <div class="flex flex-col gap-1.5">
                                        <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Username</span>
                                        <!-- input-field -->
                                        <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                            <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-10">
                                                <input type="text" placeholder="carrot_popxoxo123" value="" class="w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                            </div>
                                            <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                        </div>
                                    </div>

                                    <p class="text-xs leading-normal text-[#475467] md:text-sm dark:text-[#b1aba0]">Usernames cannot be changed after your first month on our website, but special circumstances may allow for exceptions. Please contact us if you need assistance with changing your username.</p>
                                </div>

                                <!-- input-container -->
                                <div class="flex flex-col gap-1.5">
                                    <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Email</span>
                                    <!-- input-field -->
                                    <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                        <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-10">
                                            <input type="text" placeholder="mscarrot_pops@gmail.com" value="" class="w-full max-w-full box-border truncate text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                        </div>
                                        <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                    </div>
                                </div>

                                <!-- input-group -->
                                <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                                    <!-- input-container -->
                                    <div class="flex flex-col gap-1.5 w-full">
                                        <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">First Name</span>
                                        <!-- input-field -->
                                        <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                            <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-10">
                                                <input type="text" placeholder="" value="" class="w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                            </div>
                                            <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                        </div>
                                    </div>

                                    <!-- input-container -->
                                    <div class="flex flex-col gap-1.5 w-full">
                                        <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Last Name</span>
                                        <!-- input-field -->
                                        <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                            <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-10">
                                                <input type="text" placeholder="" value="" class="w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                            </div>
                                            <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- link-x-account -->
                            <div class="flex flex-col gap-4 p-2 bg-white/40 md:px-4 md:py-6 lg:gap-6 lg:px-6 dark:bg-[#181a1b]/40">
                                <!-- title -->
                                <section class="flex flex-col gap-2">
                                    <h3 class="text-xl leading-normal font-semibold text-[#0C111D] dark:text-[#dbd8d3]">Link X Account </h3>
                                    <p class="text-xs leading-normal text-[#344054] md:text-sm dark:text-[#bdb7af]">Link your account to your Twitter(X) account to post product and feed updates automatically.</p>
                                </section>

                                <!-- button-container -->
                                <div class="pb-1 filter drop-shadow-[5px_4px_0px_#000] group hover:drop-shadow-[5px_4px_0px_#07F468] w-max md:pb-0">
                                    <button class="flex justify-center items-center gap-2.5 pl-2 pr-6 h-10 [clip-path:polygon(calc(100%-1rem)_0%,100%_100%,0%_100%,0%_0%)] bg-[#07F468] group-hover:bg-black">
                                        <img src="https://i.ibb.co.com/35nPv7by/x.webp" alt="x" class="w-6 h-6 brightness-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(83%)_sepia(37%)_saturate(2897%)_hue-rotate(81deg)_brightness(94%)_contrast(103%)]">
                                        <span class="text-lg font-medium text-black group-hover:text-[#07F468]">Link your X account</span>
                                    </button>
                                </div>
                            </div>

                            <!-- promote yourself -->
                            <div class="flex flex-col gap-4 p-2 bg-white/40 md:px-4 md:py-6 lg:gap-6 lg:px-6 dark:bg-[#181a1b]/40">
                                <!-- title -->
                                <div class="flex flex-col gap-2">
                                    <div class="flex justify-between items-start">
                                        <h3 class="text-lg font-semibold text-[#9F8009] dark:text-[#f6d75f]">Promote Yourself on our website's X Account</h3>
                                        <div class="flex justify-center items-center gap-1 py-[0.3125rem] shrink-0">
                                            <img src="https://i.ibb.co.com/yFbNLrPp/stars.webp" alt="stars" class="w-4 h-4">
                                            <span class="text-xs leading-normal font-medium text-transparent bg-clip-text bg-[linear-gradient(90deg,#D8AF0D_-35.59%,#9F8009_100%)]">PREMIUM</span>
                                        </div>
                                    </div>

                                    <p class="text-xs leading-normal text-[#344054] md:text-sm dark:text-[#bdb7af]">We will automatically post your Account Updates to our website's official twitter account.</p>
                                </div>

                                <!-- button-container -->
                                <div class="pb-1 md:pb-0">
                                    <div class="filter drop-shadow-[5px_4px_0px_#000] group w-max relative
                                    after:content-[''] after:absolute after:left-0 after:top-0 after:w-[calc(100%-1rem)] after:h-full after:bg-transparent after:pointer-events-none after:z-[2]
                                    after:shadow-[inset_0px_0px_1px_0px_#FFF3A1,0px_0px_10px_0px_#FFB909B2,0px_0px_10px_0px_#F2F2030D,0px_5px_50px_0px_#F2F20380]

                                    hover:after:shadow-[inset_0px_0px_1px_0px_#FFF3A1,0px_0px_10px_0px_#FFB909E6,0px_0px_10px_0px_#F2F20333,0px_5px_50px_0px_#F2F203CC]">

                                        <button class="relative flex justify-center items-center gap-2.5 pl-2 pr-6 h-10
                                        [clip-path:polygon(calc(100%-1rem)_0%,100%_100%,0%_100%,0%_0%)]
                                        bg-[linear-gradient(90deg,#D8AF0D_0%,#9F8009_100%)]
                                        group-hover:bg-[linear-gradient(90deg,#F2C318_0%,#C9A10A_100%)]
                                        transition-all duration-300

                                        before:content-[''] before:absolute before:left-0 before:w-[245px] before:h-full
                                        before:bg-[url('https://i.ibb.co.com/m1KgwwG/button-black-overlay.png')]
                                        before:bg-cover before:bg-center before:bg-no-repeat
                                        before:opacity-95 before:z-[1] before:pointer-events-none
                                        group-hover:before:opacity-40

                                        [&>img]:relative [&>img]:z-10
                                        [&>span]:relative [&>span]:z-10">

                                            <img src="https://i.ibb.co.com/M5c8F9Mb/star-06.webp" alt="star 06" class="w-6 h-6">
                                            <span class="text-lg font-medium text-white">Upgrade To Premium</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- tab (change-password) -->
                    <div data-tab="change-password" class="hidden [&.tab-active]:flex flex-col z-[2] md:gap-2">
                        <!-- title-container -->
                        <div class="flex justify-between items-center gap-2.5 px-2 py-4 md:px-4 md:pt-3 md:pb-2 lg:py-3">
                            <h2 class="text-lg font-semibold text-[#667085] md:text-2xl dark:text-[#9e9589]">Change Password</h2>

                            <button data-back-button class="flex items-center gap-2 bg-transparent outline-none cursor-pointer lg:hidden">
                                <img src="https://i.ibb.co.com/zTQHyhyP/arrow-back.webp" alt="arrow back" class="w-4 h-4">
                                <span class="text-lg font-medium text-[#344054] dark:text-[#bdb7af]">BACK</span>
                            </button>

                            <div data-save-cancel-buttons-container class="flex items-center gap-2 md:gap-6">
                                <button data-cancel-button class="flex justify-center items-center">
                                    <span class="text-base font-medium text-[#0C111D] md:text-lg dark:text-[#dbd8d3]">CANCEL</span>
                                </button>

                                <button data-save-button class="flex justify-center items-center px-4 py-1 bg-black md:px-[1.3125rem] md:py-1.5 dark:bg-[#181a1b]">
                                    <span class="text-base font-medium text-[#07F468] md:text-lg dark:text-[#23f97b]">SAVE</span>
                                </button>
                            </div>
                        </div>

                        <!-- content-container -->
                        <div class="flex flex-col gap-4 p-2 bg-white/40 md:px-4 md:py-6 lg:gap-6 lg:px-6 dark:bg-[#181a1b]/40">
                            <!-- input-container -->
                            <div class="flex flex-col gap-1.5">
                                <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Old Password</span>
                                <!-- input-field -->
                                <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                    <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-10">
                                        <input type="text" placeholder="Old Password" value="" class="w-full max-w-full box-border text-base text-[#667085] dark:text-[#9e9589] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                    </div>
                                    <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                </div>
                            </div>

                            <!-- input-container -->
                            <div class="flex flex-col gap-1.5">
                                <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">New Password</span>
                                <!-- input-field -->
                                <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                    <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-10">
                                        <input type="text" placeholder="New Password" value="" class="w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                    </div>
                                    <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                </div>
                            </div>

                            <!-- input-container -->
                            <div class="flex flex-col gap-1.5">
                                <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Re-enter New Password</span>
                                <!-- input-field -->
                                <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                    <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-10">
                                        <input type="text" placeholder="New Password" value="" class="w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                    </div>
                                    <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- tab (privacy-security) -->
                    <div data-tab="privacy-security" class="hidden [&.tab-active]:flex flex-col z-[2] md:gap-2">
                        <!-- title-container -->
                        <div class="flex justify-between items-center gap-2.5 px-2 py-4 md:px-4 md:pt-3 md:pb-2 lg:py-3">
                            <h2 class="text-lg font-semibold text-[#667085] md:text-2xl dark:text-[#9e9589]">Privacy & Security</h2>

                            <button data-back-button class="flex items-center gap-2 bg-transparent outline-none cursor-pointer lg:hidden">
                                <img src="https://i.ibb.co.com/zTQHyhyP/arrow-back.webp" alt="arrow back" class="w-4 h-4">
                                <span class="text-lg font-medium text-[#344054] dark:text-[#bdb7af]">BACK</span>
                            </button>
                        </div>

                        <!-- content-container -->
                        <div class="flex flex-col gap-4 p-2 bg-white/40 md:px-4 md:py-6 lg:gap-6 lg:px-6 dark:bg-[#181a1b]/40">
                            <!-- log-out-all -->
                            <div class="flex justify-between items-center gap-4">
                                <div class="flex gap-1">
                                    <h3 class="text-xl leading-normal font-semibold text-[#667085] dark:text-[#9e9589]">Active Device</h3>
                                    <span class="text-[0.625rem] leading-normal font-medium tracking-[0.0156rem] text-[#667085] dark:text-[#9e9589]">5</span>
                                </div>

                                <button class="flex justify-center items-center gap-2 px-2 py-1 bg-[#FF4405] dark:bg-[#c93300]">
                                    <img src="https://i.ibb.co.com/v6N02vyF/power-01.webp" alt="power 01" class="w-4 h-4">
                                    <span class="text-xs leading-normal font-semibold tracking-[0.01875rem] text-white dark:text-[#e8e6e3]">Log out of all device</span>
                                </button>
                            </div>

                            <!-- log-out-one-by-one -->
                            <div class="flex flex-col gap-2">
                                <!-- device -->
                                <div class="w-full flex justify-between items-center gap-4 p-4 shadow-[0px_0px_10px_0px_#0000001A] bg-white/70 dark:bg-[#181a1b]/70">
                                    <!-- device-info -->
                                    <div class="flex items-center gap-4">
                                        <div class="flex justify-center items-center w-10 h-10 rounded-full bg-[#EAECF0] dark:bg-[#222526]">
                                            <img src="https://i.ibb.co.com/0RbhDzdS/phone.webp" alt="phone" class="w-6 h-6">
                                        </div>

                                        <div class="flex flex-col gap-1.5">
                                            <div class="flex items-center gap-2">
                                                <span class="text-sm font-medium text-black dark:text-[#e8e6e3]">iPhone 16</span>
                                                <div class="w-0.5 h-0.5 rounded-full bg-[#667085] dark:bg-[#535c6d]"></div>
                                                <span class="text-sm font-medium text-black dark:text-[#e8e6e3]">Chrome</span>
                                            </div>

                                            <p class="text-xs leading-normal text-[#344054] dark:text-[#bdb7af]">Logged in on xx-xx-xxxx xx:xx</p>
                                        </div>
                                    </div>

                                    <!-- log-out button -->
                                    <button class="flex justify-center items-center gap-2 px-2 py-1">
                                        <img src="https://i.ibb.co.com/v6N02vyF/power-01.webp" alt="power 01" class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(41%)_sepia(72%)_saturate(5327%)_hue-rotate(357deg)_brightness(100%)_contrast(102%)]">
                                    
                                        <span class="text-xs leading-normal font-semibold tracking-[0.01875rem] text-[#FF4405] dark:text-[#ff571e]">Log out</span>
                                    </button>
                                </div>

                                <!-- device -->
                                <div class="w-full flex justify-between items-center gap-4 p-4 shadow-[0px_0px_10px_0px_#0000001A] bg-white/70 dark:bg-[#181a1b]/70">
                                    <!-- device-info -->
                                    <div class="flex items-center gap-4">
                                        <div class="flex justify-center items-center w-10 h-10 rounded-full bg-[#EAECF0] dark:bg-[#222526]">
                                            <img src="https://i.ibb.co.com/0RbhDzdS/phone.webp" alt="phone" class="w-6 h-6">
                                        </div>

                                        <div class="flex flex-col gap-1.5">
                                            <div class="flex items-center gap-2">
                                                <span class="text-sm font-medium text-black dark:text-[#e8e6e3]">iPhone 16</span>
                                                <div class="w-0.5 h-0.5 rounded-full bg-[#667085] dark:bg-[#535c6d]"></div>
                                                <span class="text-sm font-medium text-black dark:text-[#e8e6e3]">Chrome</span>
                                            </div>

                                            <p class="text-xs leading-normal text-[#344054] dark:text-[#bdb7af]">Logged in on xx-xx-xxxx xx:xx</p>
                                        </div>
                                    </div>

                                    <!-- log-out button -->
                                    <button class="flex justify-center items-center gap-2 px-2 py-1">
                                        <img src="https://i.ibb.co.com/v6N02vyF/power-01.webp" alt="power 01" class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(41%)_sepia(72%)_saturate(5327%)_hue-rotate(357deg)_brightness(100%)_contrast(102%)]">
                                    
                                        <span class="text-xs leading-normal font-semibold tracking-[0.01875rem] text-[#FF4405] dark:text-[#ff571e]">Log out</span>
                                    </button>
                                </div>

                                <!-- device -->
                                <div class="w-full flex justify-between items-center gap-4 p-4 shadow-[0px_0px_10px_0px_#0000001A] bg-white/70 dark:bg-[#181a1b]/70">
                                    <!-- device-info -->
                                    <div class="flex items-center gap-4">
                                        <div class="flex justify-center items-center w-10 h-10 rounded-full bg-[#EAECF0] dark:bg-[#222526]">
                                            <img src="https://i.ibb.co.com/0RbhDzdS/phone.webp" alt="phone" class="w-6 h-6">
                                        </div>

                                        <div class="flex flex-col gap-1.5">
                                            <div class="flex items-center gap-2">
                                                <span class="text-sm font-medium text-black dark:text-[#e8e6e3]">iPhone 16</span>
                                                <div class="w-0.5 h-0.5 rounded-full bg-[#667085] dark:bg-[#535c6d]"></div>
                                                <span class="text-sm font-medium text-black dark:text-[#e8e6e3]">Chrome</span>
                                            </div>

                                            <p class="text-xs leading-normal text-[#344054] dark:text-[#bdb7af]">Logged in on xx-xx-xxxx xx:xx</p>
                                        </div>
                                    </div>

                                    <!-- log-out button -->
                                    <button class="flex justify-center items-center gap-2 px-2 py-1">
                                        <img src="https://i.ibb.co.com/v6N02vyF/power-01.webp" alt="power 01" class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(41%)_sepia(72%)_saturate(5327%)_hue-rotate(357deg)_brightness(100%)_contrast(102%)]">
                                    
                                        <span class="text-xs leading-normal font-semibold tracking-[0.01875rem] text-[#FF4405] dark:text-[#ff571e]">Log out</span>
                                    </button>
                                </div>

                                <!-- device -->
                                <div class="w-full flex justify-between items-center gap-4 p-4 shadow-[0px_0px_10px_0px_#0000001A] bg-white/70 dark:bg-[#181a1b]/70">
                                    <!-- device-info -->
                                    <div class="flex items-center gap-4">
                                        <div class="flex justify-center items-center w-10 h-10 rounded-full bg-[#EAECF0] dark:bg-[#222526]">
                                            <img src="https://i.ibb.co.com/0RbhDzdS/phone.webp" alt="phone" class="w-6 h-6">
                                        </div>

                                        <div class="flex flex-col gap-1.5">
                                            <div class="flex items-center gap-2">
                                                <span class="text-sm font-medium text-black dark:text-[#e8e6e3]">iPhone 16</span>
                                                <div class="w-0.5 h-0.5 rounded-full bg-[#667085] dark:bg-[#535c6d]"></div>
                                                <span class="text-sm font-medium text-black dark:text-[#e8e6e3]">Chrome</span>
                                            </div>

                                            <p class="text-xs leading-normal text-[#344054] dark:text-[#bdb7af]">Logged in on xx-xx-xxxx xx:xx</p>
                                        </div>
                                    </div>

                                    <!-- log-out button -->
                                    <button class="flex justify-center items-center gap-2 px-2 py-1">
                                        <img src="https://i.ibb.co.com/v6N02vyF/power-01.webp" alt="power 01" class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(41%)_sepia(72%)_saturate(5327%)_hue-rotate(357deg)_brightness(100%)_contrast(102%)]">
                                    
                                        <span class="text-xs leading-normal font-semibold tracking-[0.01875rem] text-[#FF4405] dark:text-[#ff571e]">Log out</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- tab (shipping-address) -->
                    <div data-tab="shipping-address" class="hidden [&.tab-active]:flex flex-col z-[2] md:gap-2">
                        <!-- title-container -->
                        <div class="flex justify-between items-center gap-2.5 px-2 py-4 md:px-4 md:pt-3 md:pb-2 lg:py-3">
                            <h2 class="text-lg font-semibold text-[#667085] md:text-2xl dark:text-[#9e9589]">Shipping Address</h2>

                            <button data-back-button class="flex items-center gap-2 bg-transparent outline-none cursor-pointer lg:hidden">
                                <img src="https://i.ibb.co.com/zTQHyhyP/arrow-back.webp" alt="arrow back" class="w-4 h-4">
                                <span class="text-lg font-medium text-[#344054] dark:text-[#bdb7af]">BACK</span>
                            </button>

                            <div data-save-cancel-buttons-container class="flex items-center gap-2 md:gap-6">
                                <button data-cancel-button class="flex justify-center items-center">
                                    <span class="text-base font-medium text-[#0C111D] md:text-lg dark:text-[#dbd8d3]">CANCEL</span>
                                </button>

                                <button data-save-button class="flex justify-center items-center px-4 py-1 bg-black md:px-[1.3125rem] md:py-1.5 dark:bg-[#181a1b]">
                                    <span class="text-base font-medium text-[#07F468] md:text-lg dark:text-[#23f97b]">SAVE</span>
                                </button>
                            </div>
                        </div>

                        <!-- content-container -->
                        <div class="flex flex-col gap-2 pb-6 lg:pb-0">
                            <!-- personal-information-container -->
                            <div class="flex flex-col gap-4 p-2 bg-white/40 md:px-4 md:py-6 lg:gap-6 lg:px-6 dark:bg-[#181a1b]/40">
                                <h3 class="text-xl leading-normal font-semibold text-[#0C111D] dark:text-[#dbd8d3]">Personal Information</h3>

                                <!-- input-group -->
                                <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                                    <!-- input-container -->
                                    <div class="flex flex-col gap-1.5 w-full">
                                        <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">First Name</span>
                                        <!-- input-field -->
                                        <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                            <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-10">
                                                <input type="text" placeholder="" value="" class="w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                            </div>
                                            <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                        </div>
                                    </div>

                                    <!-- input-container -->
                                    <div class="flex flex-col gap-1.5 w-full">
                                        <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Last Name</span>
                                        <!-- input-field -->
                                        <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                            <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-10">
                                                <input type="text" placeholder="" value="" class="w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                            </div>
                                            <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- input-group -->
                                <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                                    <!-- input-container -->
                                    <div class="flex flex-col gap-1.5 w-full">
                                        <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Email</span>
                                        <!-- input-field -->
                                        <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                            <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-10">
                                                <input type="text" placeholder="" value="" class="w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                            </div>
                                            <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                        </div>
                                    </div>

                                    <!-- input-container -->
                                    <div class="flex flex-col gap-1.5 w-full">
                                        <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Phone Number</span>
                                        <!-- input-field -->
                                        <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                            <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-10">
                                                <input type="text" placeholder="" value="" class="w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                            </div>
                                            <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- shipping-address-container -->
                            <div class="flex flex-col gap-4 p-2 bg-white/40 md:px-4 md:py-6 lg:gap-6 lg:px-6 dark:bg-[#181a1b]/40">
                                <h3 class="text-xl leading-normal font-semibold text-[#0C111D] dark:text-[#dbd8d3]">Shipping Address</h3>

                                <!-- input-container -->
                                <div class="flex flex-col gap-1.5">
                                    <div class="flex justify-between items-start">
                                        <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Company</span>

                                        <span class="text-xs leading-normal italic text-[#667085] dark:text-[#9e9589]">Optional</span>
                                    </div>

                                    <!-- input-field -->
                                    <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                        <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-10">
                                            <input type="text" placeholder="" value="" class="w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                        </div>
                                        <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                    </div>
                                </div>

                                <!-- input-container -->
                                <div class="flex flex-col gap-1.5">
                                    <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Address Line 1</span>
                                    <!-- input-field -->
                                    <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                        <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-10">
                                            <input type="text" placeholder="" value="" class="w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                        </div>
                                        <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                    </div>
                                </div>

                                <!-- input-container -->
                                <div class="flex flex-col gap-1.5">
                                    <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Address Line 2</span>
                                    <!-- input-field -->
                                    <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                        <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-10">
                                            <input type="text" placeholder="" value="" class="w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                        </div>
                                        <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                    </div>
                                </div>

                                <!-- input-group -->
                                <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                                    <!-- input-container -->
                                    <div class="flex flex-col gap-1.5 w-full">
                                        <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Postal Code</span>
                                        <!-- input-field -->
                                        <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                            <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-10">
                                                <input type="text" placeholder="" value="" class="w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                            </div>
                                            <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                        </div>
                                    </div>

                                    <!-- input-container -->
                                    <div class="flex flex-col gap-1.5 w-full">
                                        <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">City</span>
                                        <!-- input-field -->
                                        <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                            <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-10">
                                                <input type="text" placeholder="" value="" class="w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                            </div>
                                            <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- dropdown-group -->
                                <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                                    <!-- dropdown-wrapper -->
                                    <div class="flex flex-col gap-1.5 w-full">
                                        <!-- dropdown-field -->
                                        <div class="flex flex-col gap-1.5">
                                            <label for="state" class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">
                                                State
                                            </label>

                                            <!-- select-dropdown -->
                                            <div id="select-dropdown" class="select-dropdown relative z-[10000] flex w-full">
                                                <div class="country-select w-full cursor-pointer border-none">
                                                    <div class="dash-select__trigger w-full h-10 flex items-center gap-2 py-2 px-3 border-b border-[#D0D5DD] bg-white/50 shadow-[0_1px_2px_0_#1018280D] dark:bg-[#181a1b]/50 dark:border-[#4a5568]">
                                                        <span class="text-base flex-grow text-[#101828] capitalize text-balance dark:text-[#d6d3cd]">
                                                        Georgia
                                                        </span>
                                                        <img class="select-arrow h-5 w-5 transition-transform duration-200"
                                                        src="https://i.ibb.co.com/jkt6FN7G/chevron-down.webp" alt="chevron down" />
                                                    </div>
                                                    <div class="dash-options-container absolute left-auto right-0 top-[calc(100%+0.5rem)] z-[9999] w-full origin-top scale-95 opacity-0 shadow-lg transition-[opacity,transform] duration-200 ease-out [transform-origin:50%_0] h-0 overflow-hidden pointer-events-none">
                                                        <div class="rounded-[0.125rem] border border-[rgba(186,188,203,0.5)] bg-white dark:border-[rgba(61,71,73,0.5)] dark:bg-[#181a1b]">
                                                            <div class="option flex items-center justify-center gap-[0.625rem] hover:bg-white p-[0.75rem] dark:hover:bg-[#181a1b]">
                                                                <div class="option-inner-container flex flex-1 gap-[0.625rem] px-[0.625rem] py-[0.563rem]">
                                                                <span class="text-sm font-medium text-[#0c111d] capitalize tracking-[0.01875rem] text-balance dark:text-[#dbd8d3]">
                                                                    Georgia
                                                                </span>
                                                                </div>
                                                            </div>
                                                            <div class="option flex items-center justify-center gap-[0.625rem] hover:bg-white p-[0.75rem] dark:hover:bg-[#181a1b]">
                                                                <div class="option-inner-container flex flex-1 gap-[0.625rem] px-[0.625rem] py-[0.563rem]">
                                                                <span class="text-sm font-medium text-[#0c111d] capitalize tracking-[0.01875rem] text-balance dark:text-[#dbd8d3]">
                                                                    Florida
                                                                </span>
                                                                </div>
                                                            </div>
                                                            <div class="option flex items-center justify-center gap-[0.625rem] hover:bg-white p-[0.75rem] dark:hover:bg-[#181a1b]">
                                                                <div class="option-inner-container flex flex-1 gap-[0.625rem] px-[0.625rem] py-[0.563rem]">
                                                                <span class="text-sm font-medium text-[#0c111d] capitalize tracking-[0.01875rem] text-balance dark:text-[#dbd8d3]">
                                                                    Hawaii
                                                                </span>
                                                                </div>
                                                            </div>
                                                            <div class="option flex items-center justify-center gap-[0.625rem] hover:bg-white p-[0.75rem] dark:hover:bg-[#181a1b]">
                                                                <div class="option-inner-container flex flex-1 gap-[0.625rem] px-[0.625rem] py-[0.563rem]">
                                                                <span class="text-sm font-medium text-[#0c111d] capitalize tracking-[0.01875rem] text-balance dark:text-[#dbd8d3]">
                                                                    Dhaka
                                                                </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <select class="dash-real-select hidden" name="country-select" required>
                                                    <option value="georgia">
                                                        Georgia
                                                    </option>
                                                    <option value="florida">
                                                        Florida
                                                    </option>
                                                    <option value="hawaii">
                                                        Hawaii
                                                    </option>
                                                    <option value="dhaka">
                                                        Dhaka
                                                    </option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- dropdown-wrapper -->
                                    <div class="flex flex-col gap-1.5 w-full">
                                        <!-- dropdown-field -->
                                        <div class="flex flex-col gap-1.5">
                                            <label for="country" class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">
                                                Country
                                            </label>

                                            <!-- select-dropdown -->
                                            <div id="select-dropdown" class="select-dropdown relative z-[10000] flex w-full">
                                                <div class="country-select w-full cursor-pointer border-none">
                                                    <div class="dash-select__trigger w-full h-10 flex items-center gap-2 py-2 px-3 border-b border-[#D0D5DD] bg-white/50 shadow-[0_1px_2px_0_#1018280D] dark:bg-[#181a1b]/50 dark:border-[#4a5568]">
                                                        <span class="text-base flex-grow text-[#101828] capitalize text-balance dark:text-[#d6d3cd]">
                                                        United States (US)
                                                        </span>
                                                        <img class="select-arrow h-5 w-5 transition-transform duration-200"
                                                        src="https://i.ibb.co.com/jkt6FN7G/chevron-down.webp" alt="chevron down" />
                                                    </div>
                                                    <div class="dash-options-container absolute left-auto right-0 top-[calc(100%+0.5rem)] z-[9999] w-full origin-top scale-95 opacity-0 shadow-lg transition-[opacity,transform] duration-200 ease-out [transform-origin:50%_0] h-0 overflow-hidden pointer-events-none">
                                                        <div class="rounded-[0.125rem] border border-[rgba(186,188,203,0.5)] bg-white dark:border-[rgba(61,71,73,0.5)] dark:bg-[#181a1b]">
                                                            <div class="option flex items-center justify-center gap-[0.625rem] hover:bg-white p-[0.75rem] dark:hover:bg-[#181a1b]">
                                                                <div class="option-inner-container flex flex-1 gap-[0.625rem] px-[0.625rem] py-[0.563rem]">
                                                                <span class="text-sm font-medium text-[#0c111d] capitalize tracking-[0.01875rem] text-balance dark:text-[#dbd8d3]">
                                                                    United States (US)
                                                                </span>
                                                                </div>
                                                            </div>
                                                            <div class="option flex items-center justify-center gap-[0.625rem] hover:bg-white p-[0.75rem] dark:hover:bg-[#181a1b]">
                                                                <div class="option-inner-container flex flex-1 gap-[0.625rem] px-[0.625rem] py-[0.563rem]">
                                                                <span class="text-sm font-medium text-[#0c111d] capitalize tracking-[0.01875rem] text-balance dark:text-[#dbd8d3]">
                                                                    Hong Kong
                                                                </span>
                                                                </div>
                                                            </div>
                                                            <div class="option flex items-center justify-center gap-[0.625rem] hover:bg-white p-[0.75rem] dark:hover:bg-[#181a1b]">
                                                                <div class="option-inner-container flex flex-1 gap-[0.625rem] px-[0.625rem] py-[0.563rem]">
                                                                <span class="text-sm font-medium text-[#0c111d] capitalize tracking-[0.01875rem] text-balance dark:text-[#dbd8d3]">
                                                                    Australia
                                                                </span>
                                                                </div>
                                                            </div>
                                                            <div class="option flex items-center justify-center gap-[0.625rem] hover:bg-white p-[0.75rem] dark:hover:bg-[#181a1b]">
                                                                <div class="option-inner-container flex flex-1 gap-[0.625rem] px-[0.625rem] py-[0.563rem]">
                                                                <span class="text-sm font-medium text-[#0c111d] capitalize tracking-[0.01875rem] text-balance dark:text-[#dbd8d3]">
                                                                    Bangladesh
                                                                </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <select class="dash-real-select hidden" name="country-select" required>
                                                    <option value="united-states-us">
                                                        United States (US)
                                                    </option>
                                                    <option value="hong-kong">
                                                        Hong Kong
                                                    </option>
                                                    <option value="australia">
                                                        Australia
                                                    </option>
                                                    <option value="bangladesh">
                                                        Bangladesh
                                                    </option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- tab (payout-details) -->
                    <div data-tab="payout-details" class="hidden [&.tab-active]:flex flex-col z-[2] md:gap-2">
                        <!-- title-container -->
                        <div class="flex justify-between items-center gap-2.5 px-2 py-4 md:px-4 md:pt-3 md:pb-2 lg:py-3">
                            <h2 class="text-lg font-semibold text-[#667085] md:text-2xl dark:text-[#9e9589]">Payout Details</h2>

                            <button data-back-button class="flex items-center gap-2 bg-transparent outline-none cursor-pointer lg:hidden">
                                <img src="https://i.ibb.co.com/zTQHyhyP/arrow-back.webp" alt="arrow back" class="w-4 h-4">
                                <span class="text-lg font-medium text-[#344054] dark:text-[#bdb7af]">BACK</span>
                            </button>

                            <div data-save-cancel-buttons-container class="flex items-center gap-2 md:gap-6">
                                <button data-cancel-button class="flex justify-center items-center">
                                    <span class="text-base font-medium text-[#0C111D] md:text-lg dark:text-[#dbd8d3]">CANCEL</span>
                                </button>

                                <button data-save-button class="flex justify-center items-center px-4 py-1 bg-black md:px-[1.3125rem] md:py-1.5 dark:bg-[#181a1b]">
                                    <span class="text-base font-medium text-[#07F468] md:text-lg dark:text-[#23f97b]">SAVE</span>
                                </button>
                            </div>
                        </div>

                        <!-- content-container -->
                        <div class="flex flex-col gap-2 pb-6 lg:pb-0">
                            <!-- beneficiary-information -->
                            <div class="flex flex-col gap-4 p-2 bg-white/40 md:px-4 md:py-6 lg:gap-6 lg:px-6 dark:bg-[#181a1b]/40">
                                <!-- title -->
                                <section class="flex flex-col gap-2">
                                    <h3 class="text-xl leading-normal font-semibold text-[#0C111D] dark:text-[#dbd8d3]">Beneficiary Information</h3>
                                    <p class="text-xs leading-normal text-[#344054] md:text-sm dark:text-[#bdb7af]">Beneficiary is the account holder who will receive the payment.</p>
                                </section>

                                <!-- input-container -->
                                <div class="flex flex-col gap-1.5">
                                    <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Beneficiary name</span>
                                    <!-- input-field -->
                                    <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                        <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-10">
                                            <input type="text" placeholder="" value="" class="w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                        </div>
                                        <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                    </div>
                                </div>

                                <!-- input-container -->
                                <div class="flex flex-col gap-1.5">
                                    <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Beneficiary Street</span>
                                    <!-- input-field -->
                                    <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                        <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-10">
                                            <input type="text" placeholder="Beneficiary Street" value="" class="w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                        </div>
                                        <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                    </div>
                                </div>

                                <!-- input-container -->
                                <div class="flex flex-col gap-1.5">
                                    <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Beneficiary City</span>
                                    <!-- input-field -->
                                    <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                        <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-10">
                                            <input type="text" placeholder="Beneficiary address town/city" value="" class="w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                        </div>
                                        <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                    </div>
                                </div>

                                <!-- input-container -->
                                <div class="flex flex-col gap-1.5">
                                    <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Beneficiary Postal Code</span>
                                    <!-- input-field -->
                                    <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                        <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-10">
                                            <input type="text" placeholder="Beneficiary address post/zip code" value="" class="w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                        </div>
                                        <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                    </div>
                                </div>
                            </div>

                            <!-- bank-information -->
                            <div class="flex flex-col gap-4 p-2 bg-white/40 md:px-4 md:py-6 lg:gap-6 lg:px-6 dark:bg-[#181a1b]/40">
                                <!-- title -->
                                <section class="flex flex-col gap-2">
                                    <h3 class="text-xl leading-normal font-semibold text-[#0C111D] dark:text-[#dbd8d3]">Bank Information</h3>
                                    <p class="text-xs leading-normal text-[#344054] md:text-sm dark:text-[#bdb7af]">All transaction will be paid in <span class="font-bold">USD</span>.</p>
                                </section>

                                <!-- input-container -->
                                <div class="flex flex-col gap-1.5">
                                    <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Beneficiary Account</span>
                                    <!-- input-field -->
                                    <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                        <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-10">
                                            <input type="text" placeholder="Acccount number in local or IBAN format" value="" class="w-full max-w-full box-border truncate text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                        
                                            <span class="flex items-center justify-center min-w-[1rem]">
                                                <div class="relative inline-flex overflow-hidden cursor-pointer group hover:overflow-visible">
                                                    <!-- Icon -->
                                                    <img src="https://i.ibb.co/DPgMH5GG/svgviewer-png-output-15.webp" alt="tooltip icon" class="w-4 h-4">

                                                    <!-- Tooltip -->
                                                    <div class="absolute z-[2] flex flex-col items-start min-w-[15.625rem] max-w-[22.4375rem] md:max-w-[21.5rem]
                                                                opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto
                                                                text-xs leading-normal font-medium text-white py-2 px-3 rounded-lg
                                                                bg-[#101828B2] dark:bg-[rgba(14,19,32,0.9)] dark:text-[#dbd8d3] [box-shadow:0px_2px_4px_-2px_#1018280F,0px_4px_8px_-2px_#1018281A] [backdrop-filter:blur(25px)]
                                                                bottom-[calc(100%+8px)] -right-1
                                                                before:content-[''] before:absolute before:w-0 before:h-0 before:bottom-[-11px] before:right-[6px] before:border-[6px] before:border-t-[rgba(16,24,40,0.7)] before:border-l-transparent before:border-r-transparent before:border-b-transparent
                                                                dark:before:border-t-[rgba(14,19,32,0.9)]">
                                                    <p class="text-xs leading-normal font-medium text-white dark:text-[#dbd8d3]">If this option is turned off, fans will be allow to unsubscribe and enjoy the discount again when resubscribe.</p>
                                                    </div>
                                                </div>
                                            </span>
                                        </div>
                                        <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                    </div>
                                </div>

                                <!-- dropdown-wrapper -->
                                <div class="flex flex-col gap-1.5 w-full">
                                    <!-- dropdown-field -->
                                    <div class="flex flex-col gap-1.5">
                                        <label for="country" class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">
                                            Country
                                        </label>

                                        <!-- select-dropdown -->
                                        <div id="select-dropdown" class="select-dropdown relative z-[10000] flex w-full">
                                            <div class="country-select w-full cursor-pointer border-none">
                                                <div class="dash-select__trigger w-full h-10 flex items-center gap-2 py-2 px-3 border-b border-[#D0D5DD] bg-white/50 shadow-[0_1px_2px_0_#1018280D] dark:bg-[#181a1b]/50 dark:border-[#4a5568]">
                                                    <span class="text-base flex-grow text-[#101828] capitalize text-balance dark:text-[#d6d3cd]">
                                                    United States (US)
                                                    </span>
                                                    <img class="select-arrow h-5 w-5 transition-transform duration-200"
                                                    src="https://i.ibb.co.com/jkt6FN7G/chevron-down.webp" alt="chevron down" />
                                                </div>
                                                <div class="dash-options-container absolute left-auto right-0 top-[calc(100%+0.5rem)] z-[9999] w-full origin-top scale-95 opacity-0 shadow-lg transition-[opacity,transform] duration-200 ease-out [transform-origin:50%_0] h-0 overflow-hidden pointer-events-none">
                                                    <div class="rounded-[0.125rem] border border-[rgba(186,188,203,0.5)] bg-white dark:border-[rgba(61,71,73,0.5)] dark:bg-[#181a1b]">
                                                        <div class="option flex items-center justify-center gap-[0.625rem] hover:bg-white p-[0.75rem] dark:hover:bg-[#181a1b]">
                                                            <div class="option-inner-container flex flex-1 gap-[0.625rem] px-[0.625rem] py-[0.563rem]">
                                                            <span class="text-sm font-medium text-[#0c111d] capitalize tracking-[0.01875rem] text-balance dark:text-[#dbd8d3]">
                                                                United States (US)
                                                            </span>
                                                            </div>
                                                        </div>
                                                        <div class="option flex items-center justify-center gap-[0.625rem] hover:bg-white p-[0.75rem] dark:hover:bg-[#181a1b]">
                                                            <div class="option-inner-container flex flex-1 gap-[0.625rem] px-[0.625rem] py-[0.563rem]">
                                                            <span class="text-sm font-medium text-[#0c111d] capitalize tracking-[0.01875rem] text-balance dark:text-[#dbd8d3]">
                                                                Hong Kong
                                                            </span>
                                                            </div>
                                                        </div>
                                                        <div class="option flex items-center justify-center gap-[0.625rem] hover:bg-white p-[0.75rem] dark:hover:bg-[#181a1b]">
                                                            <div class="option-inner-container flex flex-1 gap-[0.625rem] px-[0.625rem] py-[0.563rem]">
                                                            <span class="text-sm font-medium text-[#0c111d] capitalize tracking-[0.01875rem] text-balance dark:text-[#dbd8d3]">
                                                                Australia
                                                            </span>
                                                            </div>
                                                        </div>
                                                        <div class="option flex items-center justify-center gap-[0.625rem] hover:bg-white p-[0.75rem] dark:hover:bg-[#181a1b]">
                                                            <div class="option-inner-container flex flex-1 gap-[0.625rem] px-[0.625rem] py-[0.563rem]">
                                                            <span class="text-sm font-medium text-[#0c111d] capitalize tracking-[0.01875rem] text-balance dark:text-[#dbd8d3]">
                                                                Bangladesh
                                                            </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <select class="dash-real-select hidden" name="country-select" required>
                                                <option value="united-states-us">
                                                    United States (US)
                                                </option>
                                                <option value="hong-kong">
                                                    Hong Kong
                                                </option>
                                                <option value="australia">
                                                    Australia
                                                </option>
                                                <option value="bangladesh">
                                                    Bangladesh
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <!-- input-container -->
                                <div class="flex flex-col gap-1.5">
                                    <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">BIC/SWIFT code</span>
                                    <!-- input-field -->
                                    <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                        <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-10">
                                            <input type="text" placeholder="Enter BIC/SWIFT code" value="" class="w-full max-w-full box-border truncate text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                        </div>
                                        <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                    </div>
                                </div>

                                <!-- input-container -->
                                <div class="flex flex-col gap-1.5">
                                    <div class="flex flex-col gap-1.5">
                                        <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Intermediary Bank BIC/SWIFT code</span>
                                        <!-- input-field -->
                                        <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                            <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-10">
                                                <input type="text" placeholder="Enter BIC/SWIFT code" value="" class="w-full max-w-full box-border truncate text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                            </div>
                                            <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                        </div>
                                    </div>

                                    <p class="text-xs leading-normal text-[#475467] md:text-sm dark:text-[#b1aba0]">If you are not sure if you need an intermediary Bank for international transfer, please contact your bank for future information.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue';

onMounted(() => {
  // ==================== HANDLE TAB SWITCHING ====================

  const tabButtons = document.querySelectorAll("[data-tab-button]");
  const tabs = document.querySelectorAll("[data-tab]");
  const sidebar = document.querySelector("[data-sidebar]");
  const tabContainer = document.querySelector("[data-tab-container]");
  const backButtons = document.querySelectorAll("[data-back-button]");
  const BREAKPOINT = 1010; // lg

  // Removes active classes from all tabs and tab buttons
  const deactivateAll = () => {
    tabs.forEach(tab => tab.classList.remove("tab-active"));
    tabButtons.forEach(btn => btn.classList.remove("active"));
  };

  /**
   * Activates a specific tab by name.
   * @param {string} tabName - Value of the data-tab / data-tab-button attribute.
   */
  const activateTab = tabName => {
    deactivateAll();
    const tab = document.querySelector(`[data-tab="${tabName}"]`);
    const btn = document.querySelector(`[data-tab-button="${tabName}"]`);
    if (tab) tab.classList.add("tab-active");
    if (btn) btn.classList.add("active");
    updateLayout();
  };

  /**
   * Adjusts the layout based on viewport width and active tab state.
   */
  const updateLayout = () => {
    const activeTab = document.querySelector("[data-tab].tab-active");
    const isMobile = window.innerWidth < BREAKPOINT;

    if (!isMobile) {
      sidebar.classList.remove("hidden");
      tabContainer.classList.remove("hidden");
      if (!activeTab) activateTab("account-information");
    } else {
      if (activeTab) {
        sidebar.classList.add("hidden");
        tabContainer.classList.remove("hidden");
      } else {
        sidebar.classList.remove("hidden");
        tabContainer.classList.add("hidden");
      }
    }
  };

  // Tab buttons: activate the corresponding tab
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => activateTab(btn.dataset.tabButton));
  });

  // Back buttons: only in mobile view, deactivate all tabs
  backButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      if (window.innerWidth < BREAKPOINT) {
        deactivateAll();
        updateLayout();
      }
    });
  });

  // On mobile, start with no active tab so the sidebar is visible.
  if (window.innerWidth < BREAKPOINT) {
    deactivateAll();
  }
  updateLayout();

  window.addEventListener("resize", updateLayout);

  // ==================== HANDLE DROPDOWNS ====================

  /**
   * Positions the dropdown options either below or above the trigger.
   * @param {HTMLElement} select - The .country-select container element
   */
  function positionDropdown(select) {
    const optionsContainer = select.querySelector('.dash-options-container');
    if (!optionsContainer) return;
    const rect = select.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const optionsHeight = optionsContainer.scrollHeight;
    optionsContainer.classList.remove('upward', 'downward');
    if (spaceBelow < optionsHeight && spaceAbove > spaceBelow) {
      optionsContainer.classList.add('upward');
      optionsContainer.style.top = 'auto';
      optionsContainer.style.bottom = 'calc(100% + 0.5rem)';
    } else {
      optionsContainer.classList.add('downward');
      optionsContainer.style.top = 'calc(100% + 0.5rem)';
      optionsContainer.style.bottom = 'auto';
    }
  }

  /**
   * Opens a dropdown.
   * @param {HTMLElement} select - The .country-select container element
   */
  function openDropdown(select) {
    const optionsContainer = select.querySelector('.dash-options-container');
    const arrow = select.querySelector('.select-arrow');
    if (!optionsContainer || !arrow) return;
    optionsContainer.classList.add('open');
    arrow.classList.add('rotate-180');
    optionsContainer.classList.remove('scale-95', 'opacity-0', 'pointer-events-none', 'h-0', 'overflow-hidden');
    optionsContainer.classList.add('scale-100', 'opacity-100', 'pointer-events-auto', 'h-auto', 'overflow-auto');
  }

  /**
   * Closes a dropdown.
   * @param {HTMLElement} select - The .country-select container element
   */
  function closeDropdown(select) {
    const optionsContainer = select?.querySelector('.dash-options-container');
    const arrow = select?.querySelector('.select-arrow');
    if (!optionsContainer || !arrow) return;
    optionsContainer.classList.remove('open');
    arrow.classList.remove('rotate-180');
    optionsContainer.classList.remove('scale-100', 'opacity-100', 'pointer-events-auto', 'h-auto', 'overflow-auto');
    optionsContainer.classList.add('scale-95', 'opacity-0', 'pointer-events-none', 'h-0', 'overflow-hidden');
  }

  // Initialize each dropdown
  document.querySelectorAll('.country-select').forEach(trendsSelect => {
    const selectDropdown = trendsSelect.closest('.select-dropdown');
    const trigger = trendsSelect.querySelector('.dash-select__trigger span');
    const options = trendsSelect.querySelectorAll('.option');
    const realSelect = selectDropdown.querySelector('.dash-real-select');
    const optionsContainer = trendsSelect.querySelector('.dash-options-container');

    trendsSelect.addEventListener('click', function(e) {
      e.stopPropagation();
      const isOpening = !optionsContainer.classList.contains('open');
      document.querySelectorAll('.country-select').forEach(s => {
        if (s !== trendsSelect) closeDropdown(s);
      });
      if (isOpening) {
        positionDropdown(trendsSelect);
        openDropdown(trendsSelect);
      } else {
        closeDropdown(trendsSelect);
      }
    });

    options.forEach(option => {
      option.addEventListener('click', function(e) {
        e.stopPropagation();
        const selectedText = this.querySelector('span').textContent;
        if (trigger) trigger.textContent = selectedText;
        if (realSelect) realSelect.value = selectedText.toLowerCase();
        closeDropdown(trendsSelect);
        if (realSelect) realSelect.dispatchEvent(new Event('change'));
      });
    });
  });

  // Close all dropdowns when clicking outside
  document.addEventListener('click', function() {
    document.querySelectorAll('.country-select').forEach(select => closeDropdown(select));
  });

  // Reposition open dropdown on resize
  window.addEventListener('resize', function() {
    document.querySelectorAll('.country-select').forEach(select => {
      const optionsContainer = select.querySelector('.dash-options-container');
      if (optionsContainer && optionsContainer.classList.contains('open')) {
        positionDropdown(select);
      }
    });
  });

  // ==================== HANDLE TAB INPUT VALUE CHANGE ====================

  /**
   * Initializes the edit-mode toggle for a given tab.
   * @param {HTMLElement} tab - The tab container element with [data-tab] attribute.
   */
  function initTabEditButtons(tab) {
    const backBtn = tab.querySelector('[data-back-button]');
    const saveCancelContainer = tab.querySelector('[data-save-cancel-buttons-container]');
    const cancelBtn = tab.querySelector('[data-cancel-button]');
    const saveBtn = tab.querySelector('[data-save-button]');

    if (!backBtn || !saveCancelContainer || !cancelBtn || !saveBtn) return;

    const formFields = tab.querySelectorAll('input, select');
    let initialValues = new Map();

    function captureInitialValues() {
      initialValues.clear();
      formFields.forEach(field => initialValues.set(field, field.value));
    }

    function isUpdated() {
      for (let [field, initialVal] of initialValues.entries()) {
        if (field.value !== initialVal) return true;
      }
      return false;
    }

    function updateButtons() {
      if (isUpdated()) {
        backBtn.classList.add('hidden');
        saveCancelContainer.classList.remove('hidden');
      } else {
        backBtn.classList.remove('hidden');
        saveCancelContainer.classList.add('hidden');
      }
    }

    formFields.forEach(field => {
      field.addEventListener('input', updateButtons);
      field.addEventListener('change', updateButtons);
    });

    cancelBtn.addEventListener('click', () => {
      for (let [field, initialVal] of initialValues.entries()) {
        if (field.value !== initialVal) {
          field.value = initialVal;
          if (field.tagName === 'SELECT') {
            field.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      }
      updateButtons();
    });

    saveBtn.addEventListener('click', () => {
      captureInitialValues();
      updateButtons();
    });

    captureInitialValues();
    updateButtons();
  }

  // Apply to all tabs
  document.querySelectorAll('[data-tab]').forEach(tab => initTabEditButtons(tab));
});
</script>