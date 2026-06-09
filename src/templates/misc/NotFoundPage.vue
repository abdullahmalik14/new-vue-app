<template>
    <!-- wrapper -->
    <div
        class="bg-black/80 font-sans p-0 m-0 box-border overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] bg-cover bg-center bg-no-repeat"
        style="background-image: url('https://i.ibb.co/sJc1vMG3/page-bg.webp')"
        >
        <div
            class="flex flex-col justify-center items-center gap-8 p-4 h-screen [background:linear-gradient(180deg,rgba(0,0,0,0.1)_-0.17%,rgba(0,0,0,0.5)_100%),linear-gradient(0deg,rgba(0,0,0,0.5),rgba(0,0,0,0.5))] backdrop-blur-[50px] overflow-hidden md:p-8">
            <!-- top-image-container -->
            <div
                class="w-[17.125rem] h-[13.20875rem] self-end relative md:w-[24.36625rem] md:h-[18.8125rem] xl:self-center">
                <img src="https://i.ibb.co.com/1gkF4PP/404-top.webp" alt="404-top"
                    class="absolute -right-4 bottom-0 w-[17.125rem] h-[13.20875rem] md:w-[24.36625rem] md:h-[18.8125rem] xl:right-[-23rem] xl:bottom-[-5.5rem]">
            </div>

            <!-- content-container -->
            <div class="flex flex-col justify-center items-center gap-12">
                <section class="flex flex-col gap-6">
                    <h1
                        class="text-4xl leading-[2.75rem] font-semibold tracking-[-0.045rem] text-center text-[#F5F5F4] md:text-5xl md:leading-[3.75rem]">
                        Page not found</h1>
                    <p class="text-lg text-center text-[#D7D3D0] md:text-xl md:leading-normal">Sorry, the page you are
                        looking for doesn't exist.<br>Here are some helpful links:</p>
                </section>

                <!-- button-container -->
                <div class="flex justify-center items-center gap-3 w-full">
                    <button
                        class="flex justify-center items-center px-6 py-[1.125rem] bg-[#101828] border-[1.5px] border-[#07F468] w-1/2 cursor-pointer group/button hover:bg-[#07F468] md:w-max">
                        <span
                            class="text-base font-medium whitespace-nowrap text-[#07F468] group-hover/button:text-[#0C111D]">Go
                            back</span>
                    </button>

                    <button
                        class="flex justify-center items-center px-6 py-[1.125rem] bg-[#07F468] border-[1.5px] border-[#07F468] w-1/2 cursor-pointer group/button hover:bg-[#101828] md:w-max">
                        <span
                            class="text-base font-medium whitespace-nowrap text-[#0C111D] group-hover/button:text-[#07F468]">Take
                            me home</span>
                    </button>
                </div>
            </div>

          <!-- bottom-image-container -->
            <div
                class="w-[17.125rem] h-[13.20875rem] self-start relative md:w-[24.375rem] md:h-[17.125rem] xl:self-center">
                <img src="https://i.ibb.co.com/20qmzwB4/404-bottom.webp" alt="404-bottom"
                    class="absolute -left-8 -top-8 w-[18.75rem] h-[13.1875rem] md:-left-6 md:w-[24.375rem] md:h-[17.125rem] xl:left-[-21rem] xl:top-[-9rem]">
            </div>
        </div>
    </div>
</template>