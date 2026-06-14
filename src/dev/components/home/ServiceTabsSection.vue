<script setup>
import { ref } from 'vue';

const activeTab = ref('media-&-merch');

const tabs = [
    { id: 'media-&-merch', label: 'Media & Merch' },
    { id: 'membership-subscription', label: 'Membership subscription' },
    { id: 'calls-&-events', label: 'Calls & Events' },
    { id: 'coming-soon', label: 'coming soon' }
];

const setTab = (id) => {
    activeTab.value = id;
};
</script>

<template>
    <div
        class="flex flex-col gap-6 py-20 relative bg-[#EAECF0] bg-[linear-gradient(180deg,rgba(255,255,255,0.75)_70%,rgba(255,255,255,0)_100%)]">
        <!-- blur-overlay -->
        <div class="absolute inset-0 w-full h-full backdrop-blur-[25px] pointer-events-none z-[-1]"></div>

        <div class="flex flex-col gap-6">
            <!-- title-section -->
            <section
                class="flex flex-col justify-center items-center text-center gap-2 px-4 py-2.5 md:gap-4 md:py-0 xl:gap-7 xl:px-12">
                <h2
                    class="text-2xl font-semibold text-[#344054] md:text-3xl md:leading-[2.375rem] xl:text-5xl xl:leading-[3.75rem] xl:tracking-[-0.06rem] dark:text-[#bdb8af]">
                    Stop Jumping Between Platforms.</h2>
                <p
                    class="text-base font-semibold text-[#344054] md:text-lg md:font-medium xl:text-2xl dark:text-[#bdb8af]">
                    Start Thriving in One Dynamic Ecosystem.</p>
            </section>

            <!-- tab-section -->
            <div class="flex flex-col gap-6">
                <!-- tab-buttons -->
                <div
                    class="flex items-center justify-center gap-6 px-4 py-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:px-12">
                    <ul class="flex items-center gap-2 xl:gap-4">
                        <li v-for="tab in tabs" :key="tab.id" @click="setTab(tab.id)"
                            :class="['flex justify-center items-center gap-2.5 px-5 py-2 bg-[#FCFCFD] rounded-[6.25rem] shadow-[0px_3px_16.8px_0px_#0C111D26] cursor-pointer group/tab-button xl:px-8 xl:py-4 dark:bg-[#191c1d]', { 'bg-[#07F468] dark:bg-[#06c454] tab-active': activeTab === tab.id }]">
                            <span
                                class="text-sm leading-6 font-semibold uppercase whitespace-nowrap text-[#101828] md:font-medium xl:text-lg dark:text-[#d6d3cd]">{{
                                tab.label }}</span>
                        </li>
                    </ul>
                </div>

                <!-- tab-container -->
                <div class="flex flex-col px-4 xl:px-12">
                    <!-- Media & Merch -->
                    <div v-if="activeTab === 'media-&-merch'" class="flex flex-col gap-6 md:gap-4 xl:flex-row">
                        <article
                            class="flex flex-col justify-end items-end rounded-[1.875rem] bg-[#F5F5F5] h-[34.375rem] overflow-hidden relative md:flex-row md:h-[29.09375rem] md:bg-[linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] xl:flex-col xl:w-[42.75rem] xl:h-[48.25rem] xl:[background:#F5F5F5] dark:bg-[#1e2021]">
                            <div
                                class="w-full h-[19.375rem] absolute top-0 md:static md:w-1/2 md:h-full xl:w-full xl:h-[44.75rem]">
                                <img loading="lazy" src="https://i.ibb.co.com/0gJQhnr/custom.webp" alt="custom"
                                    class="w-full object-cover">
                            </div>
                            <section
                                class="flex flex-col gap-2 px-5 pt-10 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] md:w-1/2 md:p-5 md:[background:transparent] xl:w-full xl:bg-[linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] xl:pt-16 xl:px-8 xl:pb-8">
                                <h3
                                    class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]">
                                    Build your ultimate revenue generating ecosystem</h3>
                                <p class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]">Upload physical
                                    merch, digital downloads, exclusive videos, or image sets all in one place. The
                                    possibility to sell is endless : Simply sell them as pay per views, or make your
                                    content exclusive by controlling media and product access to subscribers only. Our
                                    website’s seamless ecosystems even allows you to upsell in other revenue streams
                                    like live call and group events!</p>
                            </section>
                        </article>

                        <div class="flex flex-col gap-6 md:flex-row md:gap-4 xl:flex-col xl:flex-1">
                            <article
                                class="flex flex-col justify-end items-end rounded-[1.875rem] bg-[#F5F5F5] h-[25rem] overflow-hidden relative md:w-1/2 md:order-2 md:h-[29.09375rem] xl:w-full xl:h-1/2 dark:bg-[#1e2021]">
                                <div
                                    class="w-full h-full absolute top-0 md:h-[24.59375rem] lg:h-[22.46875rem] xl:h-[21.625rem]">
                                    <img loading="lazy" src="https://i.ibb.co.com/1GSgfC6N/perks.webp" alt="perks"
                                        class="w-full object-cover">
                                </div>
                                <section
                                    class="flex flex-col gap-2 px-5 pt-16 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] xl:pt-16 xl:px-8 xl:pb-8">
                                    <h3
                                        class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]">
                                        Real-Time Strategy Optimization</h3>
                                    <p class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]">Track sales
                                        performance as it happens and instantly tweak your pricing, access settings, or
                                        subscription models to maximize conversion based on live data.</p>
                                </section>
                            </article>

                            <article
                                class="flex flex-col justify-end items-end rounded-[1.875rem] bg-[#F5F5F5] h-[25rem] overflow-hidden relative md:w-1/2 md:order-1 md:h-[29.09375rem] xl:w-full xl:h-1/2 dark:bg-[#1e2021]">
                                <div
                                    class="w-full h-[18rem] absolute top-0 md:h-[20.96875rem] lg:h-full xl:h-[23.125rem]">
                                    <img loading="lazy" src="https://i.ibb.co.com/hF8f4xzB/automated.webp"
                                        alt="automated" class="w-full object-cover">
                                </div>
                                <section
                                    class="flex flex-col gap-2 px-5 pt-10 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] xl:pt-16 xl:px-8 xl:pb-8">
                                    <h3
                                        class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]">
                                        Global reach on overview</h3>
                                    <p class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]">New and trending
                                        creators and their media will featured on fan’s dashboard, helping you connect
                                        your profile with like-minded community.</p>
                                </section>
                            </article>
                        </div>
                    </div>

                    <!-- Membership Subscription -->
                    <div v-if="activeTab === 'membership-subscription'"
                        class="grid grid-rows-4 gap-6 md:gap-4 md:[grid-template-rows:repeat(3,minmax(0,auto))] md:grid-cols-2 xl:[grid-template-rows:repeat(2,minmax(0,auto))] xl:[grid-template-columns:repeat(2,minmax(0,auto))]">
                        <article
                            class="flex flex-col justify-end items-end w-full h-[25rem] relative rounded-[1.875rem] overflow-hidden bg-[#F5F5F5] order-1 md:order-1 md:col-span-2 md:flex-row md:w-full md:h-[14.046875rem] md:bg-[linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] xl:row-span-1 xl:col-span-1 xl:[background:#f5f5f5] xl:flex-col xl:h-[33.35rem] dark:bg-[#1e2021]">
                            <div
                                class="absolute top-0 w-full h-[16.75rem] md:static md:w-1/2 md:h-full xl:w-full xl:h-[31.35rem]">
                                <img loading="lazy" src="https://i.ibb.co.com/Pb7jpFZ/wish.webp" alt="wish"
                                    class="w-full object-cover">
                            </div>
                            <section
                                class="flex flex-col gap-2 px-5 pt-10 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] md:w-1/2 md:p-5 md:[background:transparent] xl:w-full xl:bg-[linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] xl:pt-16 xl:px-8 xl:pb-8">
                                <h3
                                    class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]">
                                    Flexible payment for Every Fan</h3>
                                <p class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]">One price doesn't fit
                                    all. Create a customized ladder of support with monthly options for casual viewers
                                    and discounted annual plans for your core community, maximizing your recurring
                                    revenue.</p>
                            </section>
                        </article>

                        <article
                            class="flex flex-col justify-end items-end w-full h-[25rem] relative rounded-[1.875rem] overflow-hidden bg-[#F5F5F5] order-2 md:order-3 md:row-span-3 md:flex-col md:w-full md:h-[29.0625rem] xl:row-span-2 xl:col-span-1 xl:flex-col xl:h-[21.9rem] dark:bg-[#1e2021]">
                            <div
                                class="absolute top-0 w-full h-[16.75rem] md:static md:h-[16.0625rem] xl:w-full xl:h-[19.9rem]">
                                <img loading="lazy" src="https://i.ibb.co.com/0gJQhnr/custom.webp" alt="custom"
                                    class="w-full object-cover">
                            </div>
                            <section
                                class="flex flex-col gap-2 px-5 pt-10 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] md:px-5 md:pt-10 md:pb-5 xl:w-full xl:bg-[linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] xl:pt-16 xl:px-8 xl:pb-8">
                                <h3
                                    class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]">
                                    Automated Subscriber Retention</h3>
                                <p class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]">Don’t let a
                                    cancellation be the end of the road. Activate our smart retention tools to
                                    automatically offer special discounts or offers when a subscriber attempts to leave,
                                    winning them back before they go.</p>
                            </section>
                        </article>

                        <article
                            class="flex flex-col justify-end items-end w-full h-[25rem] relative rounded-[1.875rem] overflow-hidden bg-[#F5F5F5] order-3 md:order-2 md:col-span-2 md:flex-row md:w-full md:h-[14.046875rem] md:bg-[linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] xl:row-span-1 xl:col-span-1 xl:[background:#f5f5f5] xl:flex-col xl:h-[33.35rem] dark:bg-[#1e2021]">
                            <div
                                class="absolute top-0 w-full h-full md:static md:w-1/2 md:h-full xl:w-full xl:h-[31.35rem]">
                                <img loading="lazy" src="https://i.ibb.co.com/nqq3yDMb/smart.webp" alt="smart"
                                    class="w-full object-cover">
                            </div>
                            <section
                                class="flex flex-col gap-2 px-5 pt-16 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] md:w-1/2 md:p-5 md:[background:transparent] xl:w-full xl:bg-[linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] xl:pt-16 xl:px-8 xl:pb-8">
                                <h3
                                    class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]">
                                    Perks That Build Loyalty</h3>
                                <p class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]">Give back to the fans
                                    who support you most. Configure automatic benefits like free monthly tokens,
                                    store-wide discounts on merch, or access to VIP-only media to keep your churn rate
                                    low.</p>
                            </section>
                        </article>

                        <article
                            class="flex flex-col justify-end items-end w-full h-[25rem] relative rounded-[1.875rem] overflow-hidden bg-[#F5F5F5] order-4 md:order-4 md:row-span-3 md:flex-col md:w-full md:h-[29.0625rem] xl:row-span-2 xl:col-span-1 xl:flex-col xl:h-[21.9rem] dark:bg-[#1e2021]">
                            <div
                                class="absolute top-0 w-full h-full md:static md:h-[27.9375rem] xl:w-full xl:h-[21.4rem]">
                                <img loading="lazy" src="https://i.ibb.co.com/WWRNrL84/flexible.webp" alt="flexible"
                                    class="w-full object-cover">
                            </div>
                            <section
                                class="flex flex-col gap-2 px-5 pt-16 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] md:px-5 md:pt-16 md:pb-5 xl:w-full xl:bg-[linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] xl:pt-16 xl:px-8 xl:pb-8">
                                <h3
                                    class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]">
                                    Keep all your fans in the loop</h3>
                                <p class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]">connect your Our
                                    website account with your existing social media such as X and Telegram, let everyone
                                    know what you’re up to in one single post!</p>
                            </section>
                        </article>
                    </div>

                    <!-- Calls & Events -->
                    <div v-if="activeTab === 'calls-&-events'" class="flex flex-col gap-6 md:gap-4">
                        <div class="flex flex-col gap-6 md:flex-row md:gap-4">
                            <article
                                class="flex flex-col justify-end items-end rounded-[1.875rem] bg-[#F5F5F5] h-[28.125rem] overflow-hidden relative md:w-1/2 md:h-[34.11rem] md:bg-[linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] xl:flex-col xl:h-[32.45rem] dark:bg-[#1e2021]">
                                <div
                                    class="w-full h-[17.375rem] absolute top-0 md:static md:h-[19.98rem] xl:w-full xl:h-[20.556rem]">
                                    <img loading="lazy" src="https://i.ibb.co.com/1GSgfC6N/perks.webp" alt="perks"
                                        class="w-full object-cover">
                                </div>
                                <section
                                    class="flex flex-col gap-2 px-5 pt-10 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] md:[background:transparent] xl:w-full xl:p-8">
                                    <h3
                                        class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]">
                                        Instant Call</h3>
                                    <p class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]">Stay in the loop
                                        with your fans no matter where you are! With our Telegram integration, you’ll
                                        get instant notifications for incoming calls, ensuring you never miss a chance
                                        to chat. Plus, effortlessly upsell your items already listed on Our website
                                        while you’re at it!</p>
                                </section>
                            </article>

                            <article
                                class="flex flex-col justify-end items-end rounded-[1.875rem] bg-[#F5F5F5] h-[31.25rem] overflow-hidden relative md:w-1/2 md:h-[34.11rem] md:bg-[linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] xl:flex-col xl:h-[32.45rem] dark:bg-[#1e2021]">
                                <div
                                    class="w-full h-[21.75rem] absolute top-0 md:static md:h-[21.48rem] xl:w-full xl:h-[24.214rem]">
                                    <img loading="lazy" src="https://i.ibb.co.com/hF8f4xzB/automated.webp"
                                        alt="automated" class="w-full object-cover">
                                </div>
                                <section
                                    class="flex flex-col gap-2 px-5 pt-10 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] md:[background:transparent] xl:w-full xl:p-8">
                                    <h3
                                        class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]">
                                        Booking Schedule</h3>
                                    <p class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]">Get ready to let
                                        your fans book some quality time with you! Set your availability and offer
                                        exclusive call requests, plus don’t forget to showcase your media and merch
                                        during those chats. It’s the perfect way to connect and sell at the same time!
                                    </p>
                                </section>
                            </article>
                        </div>

                        <article
                            class="flex flex-col justify-end items-end rounded-[1.875rem] bg-[#F5F5F5] h-[31.25rem] overflow-hidden relative md:flex-row-reverse md:h-[24.078rem] md:bg-[linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] xl:h-[21.3rem] dark:bg-[#1e2021]">
                            <div class="w-full h-[19.25rem] absolute top-0 md:static md:w-1/2 md:h-full">
                                <img loading="lazy" src="https://i.ibb.co.com/Pb7jpFZ/wish.webp" alt="wish"
                                    class="w-full object-cover">
                            </div>
                            <section
                                class="flex flex-col gap-2 px-5 pt-10 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] md:w-1/2 md:p-5 md:[background:transparent] xl:p-8">
                                <h3
                                    class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]">
                                    Group Event</h3>
                                <p class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]">Join forces with
                                    fellow Our website creators and expand your fan base! Host exciting group events
                                    where you can engage your audience with interactive live streams, like thrilling
                                    lucky draws and live auctions. You’re in control of who gets to join the fun, and
                                    you can even receive tips and gifts from your loyal fans!</p>
                            </section>
                        </article>
                    </div>

                    <!-- Coming Soon -->
                    <div v-if="activeTab === 'coming-soon'" class="flex flex-col gap-6 md:gap-4">
                        <div class="flex flex-col gap-6 md:gap-4 md:flex-row">
                            <article
                                class="flex flex-col justify-end items-end rounded-[1.875rem] bg-[#F5F5F5] h-[25rem] overflow-hidden relative md:w-1/2 md:h-[35.045rem] xl:h-[35.96rem] dark:bg-[#1e2021]">
                                <div
                                    class="w-full h-[17.5rem] absolute top-0 md:h-[24.59375rem] lg:h-full xl:h-[35.46rem]">
                                    <img loading="lazy" src="https://i.ibb.co.com/0gJQhnr/custom.webp" alt="custom"
                                        class="w-full object-cover">
                                </div>
                                <section
                                    class="flex flex-col gap-2 px-5 pt-10 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] xl:p-8">
                                    <h3
                                        class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]">
                                        Smart Access & Dynamic Pricing</h3>
                                    <p class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]">You control the
                                        exclusivity. Make products public for maximum reach, gate them for subscribers
                                        only, or offer automated discounts to your loyalest fans. You can even
                                        flash-sell items live during events.</p>
                                </section>
                            </article>

                            <article
                                class="flex flex-col justify-end items-end rounded-[1.875rem] bg-[#F5F5F5] h-[28.125rem] overflow-hidden relative md:w-1/2 md:h-[35.045rem] xl:h-[35.96rem] dark:bg-[#1e2021]">
                                <div
                                    class="w-full h-[19.875rem] absolute top-0 md:h-[33.92rem] lg:h-full xl:h-[35.46rem]">
                                    <img loading="lazy" src="https://i.ibb.co.com/nqq3yDMb/smart.webp" alt="smart"
                                        class="w-full object-cover">
                                </div>
                                <section
                                    class="flex flex-col gap-2 px-5 pt-10 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] xl:w-full xl:px-8 xl:pt-16 xl:pb-8">
                                    <h3
                                        class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]">
                                        Custom request</h3>
                                    <p class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]">Open a high-value
                                        revenue stream by accepting paid custom orders through your profile. Whether
                                        it’s personalized shoutouts or custom-made goods, let fans commission you
                                        directly.</p>
                                </section>
                            </article>
                        </div>

                        <div class="flex flex-col gap-6 md:gap-4 md:flex-row">
                            <article
                                class="flex flex-col justify-end items-end rounded-[1.875rem] bg-[#F5F5F5] h-[31.77rem] overflow-hidden relative md:w-1/2 xl:h-[32.6rem] dark:bg-[#1e2021]">
                                <div
                                    class="w-full h-[27.77rem] absolute top-0 md:h-[25.77rem] lg:h-[30.64rem] xl:h-[27.1rem]">
                                    <img loading="lazy" src="https://i.ibb.co.com/WWRNrL84/flexible.webp" alt="flexible"
                                        class="w-full object-cover">
                                </div>
                                <section
                                    class="flex flex-col gap-2 px-5 pt-10 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] xl:pt-16 xl:px-8 xl:pb-8">
                                    <h3
                                        class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]">
                                        Broadcast in real-time to a global audience</h3>
                                    <p class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]">Build your own
                                        loyal communities through scheduled live streaming events - chat with them
                                        during events, set and achieve tipping goals together and offer attractive
                                        offers or lucky draw to your viewers, creating your own kind of community
                                        hangout!</p>
                                </section>
                            </article>

                            <article
                                class="flex flex-col justify-end items-end rounded-[1.875rem] bg-[#F5F5F5] h-[31.77rem] overflow-hidden relative md:w-1/2 xl:h-[32.6rem] dark:bg-[#1e2021]">
                                <div class="w-full h-full absolute top-0 md:h-[30.64rem] lg:h-full xl:h-[32.1rem]">
                                    <img loading="lazy" src="https://i.ibb.co.com/1GSgfC6N/perks.webp" alt="perks"
                                        class="w-full object-cover">
                                </div>
                                <section
                                    class="flex flex-col gap-2 px-5 pt-10 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] xl:pt-16 xl:px-8 xl:pb-8">
                                    <h3
                                        class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]">
                                        Wish Tender</h3>
                                    <p class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]">Create wish list
                                        directly on Our website and let your fans send you gifts through your favourite
                                        online shopping platforms securely, and ensure your sensitive information stay
                                        private. </p>
                                </section>
                            </article>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
