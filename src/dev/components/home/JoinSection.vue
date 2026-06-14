<template>
    <div
        class="flex justify-center items-center bg-[url('https://i.ibb.co.com/5WQ43b48/sample-bg-image-compressed.webp')] bg-cover bg-center bg-no-repeat">
        <div
            class="flex flex-col justify-center items-center gap-6 w-full px-4 py-16 bg-[#1D2334]/75 md:gap-10 md:py-12 xl:px-12 xl:py-[8.4375rem] dark:bg-[#242b40]/75">
            <h2
                class="text-2xl font-semibold drop-shadow-[0px_4px_9.6px_#00000040] text-white md:text-4xl md:leading-[2.75rem] md:-tracking-[0.045rem] md:max-w-[42.125rem] xl:text-5xl xl:leading-[3.75rem] md:-tracking-[0.06rem] dark:text-[#e8e6e3]">
                Ready to Earn? Join for Free.</h2>

            <!-- input-container -->
            <div class="flex flex-col justify-center items-center gap-5 w-full md:gap-10 md:max-w-[42.125rem]">
                <div class="flex flex-col gap-5 w-full md:flex-row md:gap-0">
                    <!-- username-input -->
                    <div class="h-12 overflow-visible md:grow">
                        <div
                            class="relative flex justify-center items-center gap-2 px-3 h-[3.25rem] backdrop-blur-[6px] rounded-md overflow-hidden border border-[#d0d5dd]/50 bg-white/10 md:rounded-l-md md:rounded-r-none dark:border-[#3b4043]/50 dark:bg-[#181a1b]/10">
                            <input type="text"
                                class="bg-transparent border-none outline-none grow peer text-lg text-[#F9FAFB] dark:text-[#e5e3df]">
                            <div
                                class="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none peer-focus:hidden peer-not-placeholder-shown:hidden">
                                <span class="text-lg text-[#F9FAFB] dark:text-[#e5e3df]">ourwebsite.app/@</span>
                                <span class="text-lg opacity-70 text-[#07F468] dark:[#23f97b]">username</span>
                            </div>
                        </div>
                    </div>

                    <!-- join-button -->
                    <button
                        class="flex justify-center items-center w-full px-4 py-2.5 bg-[#07F468] group/button hover:bg-[#1D2334] md:w-max md:h-[3.25rem] md:rounded-r-md dark:bg-[#0aff78] dark:hover:bg-[#242b40]">
                        <span
                            class="text-lg font-semibold text-[#1D2334] group-hover/button:text-[#07F468] md:text-xl md:leading-normal dark:text-[#cfcac4] dark:group-hover/button:text-[#23f97b]">JOIN
                            AS CREATOR</span>
                    </button>
                </div>

                <!-- sign-up-as-fan button -->
                <button
                    class="flex justify-center items-center px-2 py-0.5 mx-auto w-max bg-transparent border-none outline-none opacity-95">
                    <p class="text-xl leading-normal underline text-[#D0D5DD] dark:text-[#cfcac4]">Sign up as Fan</p>
                </button>
            </div>
        </div>
    </div>
</template>
