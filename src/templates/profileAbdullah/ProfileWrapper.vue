<template>
  <div>
    <!-- main-slider -->
    <div class="fixed top-0 left-0 w-[110%] z-[-1] h-screen">
      <!-- profile-main-slider -->
      <div id="splide01" class="splide visible h-full">
        <div class="splide__track px-0 h-full">
          <ul class="splide__list">
            <!-- Slide 1 -->
            <li
              class="splide__slide w-full before:content-[''] before:block before:w-full before:absolute before:h-full before:top-0 before:left-0 before:z-[2] max-[580px]:before:[background:transparent] before:[background:linear-gradient(180deg,rgba(0,0,0,0.03)_-0.17%,rgba(0,0,0,0.15)_100%)]">
              <img
                class="lazyload w-full h-full object-cover object-center ml-[-5%] [will-change:filter] pointer-events-none [filter:blur(var(--blur))] [-mt:var(--blur)] [height:calc(100%_+_var(--blur))]"
                data-src="/images/slide-1.webp" alt="profile-slidein-bg" />
            </li>

            <!-- Slide 2 -->
            <li
              class="splide__slide w-full before:content-[''] before:block before:w-full before:absolute before:h-full before:top-0 before:left-0 before:z-[2] max-[580px]:before:[background:transparent] before:[background:linear-gradient(180deg,rgba(0,0,0,0.03)_-0.17%,rgba(0,0,0,0.15)_100%)]">
              <img
                class="lazyload w-full h-full object-cover object-center ml-[-5%] [will-change:filter] pointer-events-none [filter:blur(var(--blur))] [-mt:var(--blur)] [height:calc(100%_+_var(--blur))]"
                data-src="/images/slide-2.webp" alt="sample-bg-image" />
            </li>

            <!-- Slide 3 -->
            <li
              class="splide__slide w-full before:content-[''] before:block before:w-full before:absolute before:h-full before:top-0 before:left-0 before:z-[2] max-[580px]:before:[background:transparent] before:[background:linear-gradient(180deg,rgba(0,0,0,0.03)_-0.17%,rgba(0,0,0,0.15)_100%)]">
              <img
                class="lazyload w-full h-full object-cover object-center ml-[-5%] [will-change:filter] pointer-events-none [filter:blur(var(--blur))] [-mt:var(--blur)] [height:calc(100%_+_var(--blur))]"
                data-src="/images/slide-3.webp" alt="auth-bg" />
            </li>
          </ul>
        </div>
      </div>

      <!-- blur-overlay -->
      <article
        class="fixed top-0 left-0 w-full h-screen z-[9999] transition-[opacity,background-color] duration-[800ms] bg-[linear-gradient(180deg,rgba(0,0,0,0.03)_-0.17%,rgba(0,0,0,0.15)_100%)] will-change-[opacity,filter] opacity-0">
      </article>
    </div>

    <!-- header-component -->
    <div data-header-component
      class="flex flex-col-reverse justify-between w-full bg-black/30 backdrop-blur-[10px] px-0 fixed top-0 -translate-y-full [transition:transform_0.3s_ease] z-[999] max-[580px]:[background:linear-gradient(180deg,rgba(0,0,0,0.60)_0%,rgba(0,0,0,0.50)_25%,rgba(0,0,0,0.01)_100%)] max-[580px]:backdrop-blur-[50px] md:px-4 xl:flex-row xl:gap-4 xl:px-12 group [&.scroll-active]:translate-y-0">
      <!-- navigation-section -->
      <div class="xl:pt-[2.813rem]">
        <ul
          class="nav-container flex flex-row justify-around items-center overflow-x-auto whitespace-nowrap flex-nowrap sm:gap-4">
          <!-- menu-item -->
          <li
            class="tab-item flex justify-center gap-1 relative flex-grow opacity-70 [border-bottom:1px_solid_transparent] group active [&.active]:[border-bottom:1px_solid_#07f468] max-[580px]:group-[.active]:[border-bottom:1px_solid_#e7e5e4] [&.active]:opacity-100 xl:flex-[unset] cursor-pointer"
            data-tab="feed">
            <div
              class="flex justify-center flex-grow max-[325px]:px-2 max-[325px]:py-0 px-4 py-[0.639rem] sm:px-4 sm:py-0">
              <span class="block pt-2 pb-2">
                <span
                  class="block text-sm font-medium capitalize text-[#e7e5e4] max-[580px]:group-hover:text-[#e7e5e4] max-[580px]:group-[.active]:text-[#e7e5e4] group-hover:text-[#07f468] group-[.active]:text-[#07f468]">Feed</span>
              </span>

              <div class="text-[0.625rem] leading-normal font-medium text-[#07f468]">
                18
              </div>
            </div>
          </li>

          <!-- menu-item -->
          <li
            class="tab-item flex justify-center gap-1 relative flex-grow opacity-70 [border-bottom:1px_solid_transparent] group [&.active]:[border-bottom:1px_solid_#07f468] max-[580px]:group-[.active]:[border-bottom:1px_solid_#e7e5e4] [&.active]:opacity-100 xl:flex-[unset] cursor-pointer"
            data-tab="media">
            <div
              class="flex justify-center flex-grow max-[325px]:px-2 max-[325px]:py-0 px-4 py-[0.639rem] sm:px-4 sm:py-0">
              <span class="block pt-2 pb-2">
                <span
                  class="block text-sm font-medium capitalize text-[#e7e5e4] max-[580px]:group-hover:text-[#e7e5e4] max-[580px]:group-[.active]:text-[#e7e5e4] group-hover:text-[#07f468] group-[.active]:text-[#07f468]">Media</span>
              </span>

              <div class="text-[0.625rem] leading-normal font-medium text-[#07f468]">
                18
              </div>
            </div>
          </li>

          <!-- menu-item -->
          <li
            class="tab-item flex justify-center gap-1 relative flex-grow opacity-70 [border-bottom:1px_solid_transparent] group [&.active]:[border-bottom:1px_solid_#07f468] max-[580px]:group-[.active]:[border-bottom:1px_solid_#e7e5e4] [&.active]:opacity-100 xl:flex-[unset] cursor-pointer"
            data-tab="merch">
            <div
              class="flex justify-center flex-grow max-[325px]:px-2 max-[325px]:py-0 px-4 py-[0.639rem] sm:px-4 sm:py-0">
              <span class="block pt-2 pb-2">
                <span
                  class="block text-sm font-medium capitalize text-[#e7e5e4] max-[580px]:group-hover:text-[#e7e5e4] max-[580px]:group-[.active]:text-[#e7e5e4] group-hover:text-[#07f468] group-[.active]:text-[#07f468]">Merch</span>
              </span>

              <div class="text-[0.625rem] leading-normal font-medium text-[#07f468]">
                18
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- header user profile section -->
      <div class="hidden md:flex justify-end items-center gap-4 flex-wrap py-2 xl:justify-[unset]">
        <!-- header-option-button -->
        <ProfileHeaderOptionbuttons />

        <!-- profile-info -->
        <HeaderUserProfileDesktop />
      </div>

      <!-- Header User Profile Section for large & small mobile (767 - 300) -->
      <HeaderUserProfileResponsive />
    </div>

    <!-- container -->
    <section class="relative overflow-hidden bg-[linear-gradient(180deg,rgba(0,0,0,0.03)_-0.17%,rgba(0,0,0,0.5)_100%)]">
      <!-- profile-hero -->
      <section data-section="banner" class="w-full h-screen relative [transition:opacity_0.8s] z-0">
        <!-- header -->
        <ProfileHeader />

        <!-- profile-meta -->
        <ProfileMeta />

        <!-- right-button-section -->
        <ProfileRightButtons />

        <!-- bottom-section -->
        <div
          class="flex flex-col items-end absolute left-0 bottom-0 w-full pb-14 px-0 z-[-1] sm:pb-12 md:flex-row md:px-4 md:pb-6 xl:px-12 xl:pb-12">
          <!-- hero-info -->
          <div
            class="flex flex-col gap-2 w-full max-[580px]:justify-end max-[580px]:h-screen max-[580px]:bg-[linear-gradient(180deg,rgba(0,0,0,0.00)_25%,rgba(0,0,0,0.15)_75%)] md:block lg:w-1/2">
            <div class="flex flex-col gap-1 px-2.5 md:gap-4 md:px-0 xl:gap-0">
              <h1
                class="hidden items-center gap-1 text-xl leading-normal font-semibold text-white md:flex md:text-5xl md:leading-[3.75rem] xl:text-6xl xl:leading-[4.5rem] xl:mb-5 xl:mt-[.67em]">
                Sukii19
                <div class="flex w-3.5 h-3.5 md:hidden">
                  <img data-src="/images/svgviewer-png-output-22.webp" alt="verified-tick"
                    class="lazyload w-3.5 h-3.5" />
                </div>
              </h1>

              <!-- Mobile Avatar message online row -->

              <ProfileMetaResponsive />

              <!-- profile-sharing-responsive -->
              <ProfileSharingResponsive />

              <!-- profile-description -->
              <ProfileDescription />

              <!-- profile-sharing desktop-->
              <ProfileSharing />

              <!-- Gallery Carousel for Tablet and Mobile -->
              <div id="splide02"
                class="splide flex w-full py-[.3125rem] [transition:opacity_0.8s] relative md:py-[0.313rem] xl:hidden"
                role="region" aria-roledescription="carousel">
                <!-- slider-track -->
                <div class="splide__track w-full px-0 mx-auto md:mr-[unset]" id="splide02-track">
                  <!-- slider list -->
                  <ul id="splide02-list" class="splide__list w-full" role="presentation">
                    <!-- slider item 1 -->
                    <li
                      class="splide__slide flex flex-col items-start gap-4 z-[-2] border-l-4 border-r-4 border-transparent bg-center bg-cover bg-no-repeat max-[580px]:rounded-sm opacity-50 max-[580px]:!border-none is-active [&.is-active]:opacity-100"
                      style="
                        background-image: url('/images/slide-1.webp');
                      ">
                      <img class="lazyload hidden" data-src="/images/slide-1.webp" alt="profile-slidein-bg" />
                    </li>

                    <li
                      class="splide__slide flex flex-col items-start gap-4 z-[-2] border-l-4 border-r-4 border-transparent bg-center bg-cover bg-no-repeat max-[580px]:rounded-sm opacity-50 max-[580px]:!border-none is-active [&.is-active]:opacity-100"
                      style="
                        background-image: url('/images/slide-2.webp');
                      ">
                      <img class="lazyload hidden" data-src="/images/slide-2.webp" alt="sample-bg-image" />
                    </li>

                    <li
                      class="splide__slide flex flex-col items-start gap-4 z-[-2] border-l-4 border-r-4 border-transparent bg-center bg-cover bg-no-repeat max-[580px]:rounded-sm opacity-50 max-[580px]:!border-none is-active [&.is-active]:opacity-100"
                      style="
                        background-image: url('/images/slide-3.webp');
                      ">
                      <img class="lazyload hidden" data-src="/images/slide-3.webp" alt="auth-bg" />
                    </li>
                  </ul>
                </div>
              </div>

            </div>

            <!-- profile-subscribe-cta -->
            <ProfileSubscribeCta />

            <!-- navigation Section for mobile -->
            <div
              class="absolute bottom-0 flex w-full [background:linear-gradient(180deg,rgba(0,0,0,0.60)_0%,rgba(0,0,0,0.50)_25%,rgba(0,0,0,0.01)_100%)] backdrop-blur-[40px] sm:[background:unset] sm:backdrop-blur-0 md:hidden">
              <ul class="nav-container flex flex-row items-center w-full overflow-x-auto whitespace-nowrap flex-wrap">
                <!-- menu-item -->
                <li
                  class="tab-item relative flex justify-center gap-1 opacity-70 [border-bottom:1.5px_solid_transparent] group active [&.active]:[border-bottom:1.5px_solid_#07f468] [&.active]:opacity-100 max-[580px]:[&.active]:[border-bottom:1.5px_solid_#E7E5E4] flex-grow cursor-pointer"
                  data-tab="feed">
                  <div
                    class="flex justify-center flex-grow max-[325px]:px-2 max-[325px]:py-0 px-4 py-[0.639rem] sm:px-4 sm:py-0">
                    <span class="block pt-2 pb-2">
                      <span
                        class="block text-sm font-medium text-[#e7e5e4] max-[580px]:group-hover:text-[#e7e5e4] max-[580px]:group-[.active]:text-[#e7e5e4] group-hover:text-[#07f468] group-[.active]:text-[#07f468]">Feed</span>
                    </span>

                    <div class="text-[0.625rem] leading-normal font-medium text-[#07f468]">
                      18
                    </div>
                  </div>
                </li>

                <!-- menu-item -->
                <li
                  class="tab-item relative flex justify-center gap-1 opacity-70 [border-bottom:1.5px_solid_transparent] group [&.active]:[border-bottom:1.5px_solid_#07f468] [&.active]:opacity-100 max-[580px]:[&.active]:[border-bottom:1.5px_solid_#E7E5E4] flex-grow cursor-pointer"
                  data-tab="media">
                  <div
                    class="flex justify-center flex-grow max-[325px]:px-2 max-[325px]:py-0 px-4 py-[0.639rem] sm:px-4 sm:py-0">
                    <span class="block pt-2 pb-2">
                      <span
                        class="block text-sm font-medium text-[#e7e5e4] max-[580px]:group-hover:text-[#e7e5e4] max-[580px]:group-[.active]:text-[#e7e5e4] group-hover:text-[#07f468] group-[.active]:text-[#07f468]">Media</span>
                    </span>

                    <div class="text-[0.625rem] leading-normal font-medium text-[#07f468]">
                      18
                    </div>
                  </div>
                </li>

                <!-- menu-item -->
                <li
                  class="tab-item relative flex justify-center gap-1 opacity-70 [border-bottom:1.5px_solid_transparent] group [&.active]:[border-bottom:1.5px_solid_#07f468] [&.active]:opacity-100 max-[580px]:[&.active]:[border-bottom:1.5px_solid_#E7E5E4] flex-grow cursor-pointer"
                  data-tab="merch">
                  <div
                    class="flex justify-center flex-grow max-[325px]:px-2 max-[325px]:py-0 px-4 py-[0.639rem] sm:px-4 sm:py-0">
                    <span class="block pt-2 pb-2">
                      <span
                        class="block text-sm font-medium text-[#e7e5e4] max-[580px]:group-hover:text-[#e7e5e4] max-[580px]:group-[.active]:text-[#e7e5e4] group-hover:text-[#07f468] group-[.active]:text-[#07f468]">Merch</span>
                    </span>

                    <div class="text-[0.625rem] leading-normal font-medium text-[#07f468]">
                      18
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <!-- profile options -->
          <div class="hidden w-1/2 xl:block">
            <div id="splide03" class="splide w-full [transition:opacity_0.8s]">
              <!-- slider-track -->
              <div class="splide__track w-[80%] ml-auto px-0" id="splide03-track">
                <!-- slider list -->
                <ul id="splide03-list" class="splide__list w-full" role="presentation">
                  <li
                    class="splide__slide flex flex-col items-start gap-4 relative opacity-50 p-4 bg-cover bg-center bg-no-repeat [transform:scaleY(70%)] z-[-2] [&.is-prev]:flex [&.is-prev]:[transform:scaleY(90%)] [&.is-prev]:z-[-1] [&.is-next]:flex [&.is-next]:[transform:scaleY(90%)] [&.is-next]:z-[-1] [&.is-active]:flex [&.is-active]:!w-[40%] [&.is-active]:[transform:scale(100%,100%)] [&.is-active]:rounded [&.is-active]:opacity-100 [&.is-active]:z-[1] cursor-pointer"
                    style="
                      background-image: url('/images/slide-1.webp');
                    ">
                    <img class="lazyload hidden" data-src="/images/slide-1.webp" alt="profile-slidein-bg" />
                  </li>

                  <li
                    class="splide__slide flex flex-col items-start gap-4 relative opacity-50 p-4 bg-cover bg-center bg-no-repeat [transform:scaleY(70%)] z-[-2] [&.is-prev]:flex [&.is-prev]:[transform:scaleY(90%)] [&.is-prev]:z-[-1] [&.is-next]:flex [&.is-next]:[transform:scaleY(90%)] [&.is-next]:z-[-1] [&.is-active]:flex [&.is-active]:!w-[40%] [&.is-active]:[transform:scale(100%,100%)] [&.is-active]:rounded [&.is-active]:opacity-100 [&.is-active]:z-[1] cursor-pointer"
                    style="
                      background-image: url('/images/slide-2.webp');
                    ">
                    <img class="lazyload hidden" data-src="/images/slide-2.webp" alt="sample-bg-image" />
                  </li>

                  <li
                    class="splide__slide flex flex-col items-start gap-4 relative opacity-50 p-4 bg-cover bg-center bg-no-repeat [transform:scaleY(70%)] z-[-2] [&.is-prev]:flex [&.is-prev]:[transform:scaleY(90%)] [&.is-prev]:z-[-1] [&.is-next]:flex [&.is-next]:[transform:scaleY(90%)] [&.is-next]:z-[-1] [&.is-active]:flex [&.is-active]:!w-[40%] [&.is-active]:[transform:scale(100%,100%)] [&.is-active]:rounded [&.is-active]:opacity-100 [&.is-active]:z-[1] cursor-pointer"
                    style="
                      background-image: url('/images/slide-3.webp');
                    ">
                    <img class="lazyload hidden" data-src="/images/slide-3.webp" alt="auth-bg" />
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- bottom-section -->
      <div class="flex flex-col items-stretch max-[580px]:bg-black/25 opacity-100 md:overflow-hidden xl:overflow-auto">
        <!-- feed-tab-content -->
        <div class="tab-content active relative flex-1 min-h-[100svh] lg:bg-black/50" id="feed-content">
          <div
            class="flex flex-col gap-6 px-2 py-4 bg-black/50 backdrop-blur-[400px] sm:p-4 md:gap-9 lg:flex-grow lg:mx-auto lg:px-12 lg:py-6 lg:bg-transparent">
            <section class="relative flex flex-col gap-2 lg:flex-row lg:gap-0 lg:w-[calc(100%-9rem)] lg:mx-auto">
              <div>
                <Heading text="MARCH" tag="h2" theme="profileFeed" />
                <Heading text="2024" tag="h2" theme="profileFeed" />
              </div>

              <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:max-w-[62.9375rem]">
                <FeedPollCard day="31" suffix="st" title="What Should I eat for tonight’s live stream?" :options="[
                  { label: 'Orange', percent: 70, votes: 25, checked: true },
                  { label: 'Apple', percent: 20, votes: 25 },
                  { label: 'Chicken', percent: 10, votes: 25 },
                ]" :totalVotes="400" timeLeft="24 hours left to vote" />

                <FeedMediaCard day="31" suffix="st"
                  description="Jenny is back! Tonight I will eat mostly fruits. -> 8pm EST time 👅!" :likes="205"
                  :comments="16" :bgImage="checkoutHeader" :hoverBg="sampleBg" />

                <FeedPollCard day="31" suffix="st" title="What Should I eat for tonight’s live stream?" :options="[
                  { label: 'Orange', percent: 70, votes: 25, checked: true },
                  { label: 'Apple', percent: 20, votes: 25 },
                  { label: 'Chicken', percent: 10, votes: 25 },
                ]" :totalVotes="400" timeLeft="24 hours left to vote" />

                <FeedMediaCard day="31" suffix="st"
                  description="Jenny is back! Tonight I will eat mostly fruits. -> 8pm EST time 👅!" :likes="205"
                  :comments="16" :bgImage="checkoutHeader" :hoverBg="sampleBg" />
              </div>
            </section>

            <section class="relative flex flex-col gap-2 lg:flex-row lg:gap-0 lg:w-[calc(100%-9rem)] lg:mx-auto">
              <div>
                <Heading text="FEBRUARY" tag="h2" theme="profileFeed" />
                <Heading text="2024" tag="h2" theme="profileFeed" />
              </div>

              <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:max-w-[62.9375rem]">
                <FeedPollCard day="31" suffix="st" title="What Should I eat for tonight’s live stream?" :options="[
                  { label: 'Orange', percent: 70, votes: 25, checked: true },
                  { label: 'Apple', percent: 20, votes: 25 },
                  { label: 'Chicken', percent: 10, votes: 25 },
                ]" :totalVotes="400" timeLeft="24 hours left to vote" />

                <FeedMediaCard day="31" suffix="st"
                  description="Jenny is back! Tonight I will eat mostly fruits. -> 8pm EST time 👅!" :likes="205"
                  :comments="16" :bgImage="checkoutHeader" :hoverBg="sampleBg" />

                <FeedPollCard day="31" suffix="st" title="What Should I eat for tonight’s live stream?" :options="[
                  { label: 'Orange', percent: 70, votes: 25, checked: true },
                  { label: 'Apple', percent: 20, votes: 25 },
                  { label: 'Chicken', percent: 10, votes: 25 },
                ]" :totalVotes="400" timeLeft="24 hours left to vote" />

                <FeedMediaCard day="31" suffix="st"
                  description="Jenny is back! Tonight I will eat mostly fruits. -> 8pm EST time 👅!" :likes="205"
                  :comments="16" :bgImage="checkoutHeader" :hoverBg="sampleBg" />
              </div>
            </section>
          </div>

          <button data-create-feed-button
            class="fixed bottom-6 right-2 md:right-6 w-12 h-12 md:w-24 md:h-24 hidden justify-center items-center rounded-full p-2 bg-[#07F468]">
            <img src="/images/file-plus-02.webp" alt="file-plus-02" class="w-8 h-8 md:w-14 md:h-14" />
          </button>
        </div>

        <!-- media-tab-content -->
        <div class="tab-content hidden relative flex-1 min-h-[65.25rem] pt-20 md:pt-32" id="media-content">
          <section class="mb-8">
            <ProfileMediaTabHeading title="Pay to View" :count="11" />

            <div class="mx-2 overflow-visible md:mx-4 xl:mx-12">
              <PlayMediaCards :mediaList="myMediaData" @media-click="openMediaPopup" />
            </div>
          </section>

          <section class="mb-8">
            <ProfileMediaTabHeading title="Subscription" :count="15" />

            <div class="mx-2 overflow-visible md:mx-4 xl:mx-12">
              <PlayMediaCards :mediaList="myMediaData" @media-click="openMediaPopup" />
            </div>

          </section>

          <section class="mb-8">
            <ProfileMediaTabHeading title="Subscription" />


            <div class="mx-2 overflow-visible md:mx-4 xl:mx-12">
              <PlayMediaCards :mediaList="myMediaData" @media-click="openMediaPopup" />
            </div>

          </section>
        </div>

        <!-- merch-tab-content -->
        <div class="tab-content hidden relative flex-1 min-h-[100svh]" id="merch-content">
          <div
            class="flex flex-col gap-6 px-2 py-4 bg-black/50 backdrop-blur-[400px] sm:p-4 md:gap-9 lg:flex-grow lg:mx-auto lg:px-12 lg:py-6">
            <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              <MerchCard @click="openMerchPopup('pre-order')" bgImage="/images/checkout-header.webp"
                title="My top (washed) Get Jenny’s favourite Mangoes!" currency="USD" price="$25" finalPrice="$25"
                description="Get Jenny’s favourite Mangoes! Buy them while supply last !Get Jenny’s favourite Mangoes! Buy them while supply last !Get Jenny’s favourite Mangoes! Buy them while supply last !"
                overlayBg="linear-gradient(0deg, rgba(255,255,255,0.68) -3.06%, rgba(255,255,255,0) 144.5%), linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1))"
                overlayHoverBg="linear-gradient(0deg, rgba(255,255,255,0.9) -3.06%, rgba(255,255,255,0) 144.5%), linear-gradient(0deg, rgba(0,0,0,0.25), rgba(0,0,0,0.25))" />

              <MerchCard @click="openMerchPopup('regular')" bgImage="/images/checkout-header.webp"
                title="My top (washed) Get Jenny’s favourite Mangoes!" currency="USD" price="$25" finalPrice="$25"
                discountText="10% OFF"
                description="Get Jenny’s favourite Mangoes! Buy them while supply last !Get Jenny’s favourite Mangoes! Buy them while supply last !Get Jenny’s favourite Mangoes! Buy them while supply last !"
                overlayBg="linear-gradient(0deg, rgba(255,205,41,0.68) -3.06%, rgba(255,205,41,0) 117.35%), linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1))"
                overlayHoverBg="linear-gradient(0deg, rgba(255,205,41,0.9) -3.06%, rgba(255,205,41,0) 117.35%), linear-gradient(0deg, rgba(0,0,0,0.25), rgba(0,0,0,0.25))" />

              <!-- Test card for other variants -->
              <MerchCard @click="openMerchPopup('out-of-stock')" bgImage="/images/checkout-header.webp"
                title="Out of Stock Item" currency="USD" price="$25" finalPrice="$25"
                description="This item is out of stock."
                overlayBg="linear-gradient(0deg, rgba(255,255,255,0.68) -3.06%, rgba(255,255,255,0) 144.5%), linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1))"
                overlayHoverBg="linear-gradient(0deg, rgba(255,255,255,0.9) -3.06%, rgba(255,255,255,0) 144.5%), linear-gradient(0deg, rgba(0,0,0,0.25), rgba(0,0,0,0.25))" />
            </div>
          </div>
        </div>

      </div>
    </section>

    <ProfileMediaDetailsPopup v-model="profileMediaDetailsPopupOpen" :media="selectedMedia" />
    <ProfileMerchPopup v-model="profileMerchPopupOpen" :variant="selectedMerchVariant" />
  </div>
</template>

<script setup>
import Heading from "@/components/default/Heading.vue";
import FeedPollCard from "@/components/ui/card/dashboard/FeedPollCard.vue";
import FeedMediaCard from "@/components/ui/card/dashboard/FeedMediaCard.vue";
import { ref, onMounted, onUnmounted } from "vue";
import PlayMediaCards from "@/components/ui/card/dashboard/PlayMediaCards.vue";
import MerchCard from "@/components/ui/card/dashboard/MerchCard.vue";

// Asset Path
import checkoutHeader from '/images/checkout-header.webp'
import sampleBg from '/images/slide-2.webp'
import ProfileHeader from "./ProfileHeader.vue";
import ProfileMeta from "./ProfileMeta.vue";
import ProfileSubscribeCta from "./ProfileSubscribeCta.vue";
import ProfileSharing from "./ProfileSharing.vue";
import ProfileRightButtons from "./ProfileRightButtons.vue";
import Paragraph from "@/components/default/Paragraph.vue";
import ProfileDescription from "./ProfileDescription.vue";
import ProfileSharingResponsive from "./ProfileSharingResponsive.vue";
import ProfileMetaResponsive from "./ProfileMetaResponsive.vue";
import HeaderUserProfileResponsive from "./HeaderUserProfileResponsive.vue";
import HeaderUserProfileDesktop from "./HeaderUserProfileDesktop.vue";
import ProfileHeaderOptionbuttons from "./ProfileHeaderOptionbuttons.vue";
import ProfileMediaTabHeading from "./ProfileMediaTabHeading.vue";
import ProfileMediaDetailsPopup from "@/components/ui/popup/ProfileMediaDetailsPopup.vue";
import ProfileMerchPopup from "@/templates/profileAbdullah/popups/ProfileMerchPopup.vue";

const profileMediaDetailsPopupOpen = ref(false);
const selectedMedia = ref({});

const profileMerchPopupOpen = ref(false);
const selectedMerchVariant = ref('regular');

const openMediaPopup = (media) => {
  selectedMedia.value = media;
  profileMediaDetailsPopupOpen.value = true;
};

const openMerchPopup = (variant) => {
  selectedMerchVariant.value = variant;
  profileMerchPopupOpen.value = true;
};

// --- MEDIA LIST DATA ---
const myMediaData = ref([
  {
    image: "/images/slide-1.webp",
    alt: "Video 1",
    duration: "14:09",
    timeAgo: "2h ago",
    likes: "0",
    views: "0",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    title: "Building successful teams through collaboration",
  },
  {
    image: "/images/slide-2.webp",
    alt: "Video 2",
    duration: "14:09",
    timeAgo: "2h ago",
    likes: "0",
    views: "0",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    title: "Building successful teams through collaboration",
  },
  {
    image: "/images/slide-3.webp",
    alt: "Video 3",
    duration: "14:09",
    timeAgo: "2h ago",
    likes: "0",
    views: "0",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    title: "Building successful teams through collaboration",
  },
  {
    image: "/images/slide-1.webp",
    alt: "Video 4",
    duration: "14:09",
    timeAgo: "2h ago",
    likes: "0",
    views: "0",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    title: "Building successful teams through collaboration",
  },
  {
    image: "/images/slide-2.webp",
    alt: "Video 5",
    duration: "14:09",
    timeAgo: "2h ago",
    likes: "0",
    views: "0",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    title: "Building successful teams through collaboration",
  },
  {
    image: "/images/slide-3.webp",
    alt: "Video 6",
    duration: "14:09",
    timeAgo: "2h ago",
    likes: "0",
    views: "0",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    title: "Building successful teams through collaboration",
  },
]);

onMounted(() => {
  // --- SPLIDE SLIDERS ---
  if (typeof Splide !== "undefined") {
    const heroSection = document.querySelector('[data-section="banner"]');

    const splide01 = new Splide("#splide01", {
      type: "fade",
      fixedWidth: "100%",
      height: "100vh",
      pagination: false,
      arrows: false,
      cover: false,
      autoplay: false,
      lazyLoad: "nearby",
    }).mount();

    const splide02 = new Splide("#splide02", {
      type: "slide",
      perPage: 3,
      perMove: 1,
      gap: "0.5rem",
      pagination: false,
      arrows: false,
      drag: true,
      fixedWidth: "20%",
      fixedHeight: "5rem",
      breakpoints: {
        768: { fixedWidth: "20%", fixedHeight: "5rem" },
        480: { perPage: 3, fixedWidth: "2.5rem", fixedHeight: "2.5rem" },
      },
    }).mount();

    const splide03 = new Splide("#splide03", {
      type: "loop",
      perPage: 3,
      perMove: 1,
      pagination: false,
      arrows: false,
      drag: true,
      dragMinThreshold: 10,
      fixedWidth: 0,
      fixedHeight: "9.375rem",
      focus: "center",
      gap: "0px",
      padding: { left: 0, right: 0 },
    }).mount();

    function updateActiveClasses(targetIndex) {
      document.querySelectorAll("#splide02 .splide__slide").forEach((slide) => {
        slide.classList.remove("is-active");
      });
      const targetSlide = document.querySelector(
        `#splide02 .splide__slide:nth-child(${targetIndex + 1})`
      );
      if (targetSlide) targetSlide.classList.add("is-active");
    }

    function syncAllSliders(index) {
      splide01.go(index);
      splide02.go(index);
      splide03.go(index);
      updateActiveClasses(index);
    }

    splide02.on("click", (slide) => syncAllSliders(slide.index));
    splide03.on("click", (slide) => syncAllSliders(slide.index));

    splide01.on("moved", (i) => {
      splide02.go(i);
      splide03.go(i);
    });
    splide02.on("moved", (i) => {
      splide01.go(i);
      splide03.go(i);
    });
    splide03.on("moved", (i) => {
      splide01.go(i);
      splide02.go(i);
    });

    setTimeout(() => {
      syncAllSliders(0);
      splide03.refresh();
    }, 100);
  }


  // --- BLUR ON SCROLL ---
  const blurHandler = () => {
    const scrollY = window.scrollY;
    const banner = document.querySelector('[data-section="banner"]');
    if (!banner) return;

    const start = 100,
      end = banner.clientHeight + 200,
      maxBlur = 25;
    let blur =
      scrollY <= start
        ? 0
        : scrollY >= end
          ? maxBlur
          : ((scrollY - start) / (end - start)) * maxBlur;

    document.documentElement.style.setProperty("--blur", `${blur}px`);
  };
  window.addEventListener("scroll", blurHandler);

  // --- HEADER SCROLL EFFECT ---
  const headerScrollHandler = () => {
    const scrollY = window.pageYOffset;
    const headerComponent = document.querySelector("[data-header-component]");
    const createFeedButton = document.querySelector(
      "[data-create-feed-button]"
    );

    if (!headerComponent || !createFeedButton) return;

    if (scrollY > 480) {
      headerComponent.classList.add("scroll-active");
      createFeedButton.classList.add("flex");
      createFeedButton.classList.remove("hidden");
    } else {
      headerComponent.classList.remove("scroll-active");
      createFeedButton.classList.remove("flex");
      createFeedButton.classList.add("hidden");
    }
  };
  window.addEventListener("scroll", headerScrollHandler);

  // --- TABS HANDLER ---
  const navContainers = document.querySelectorAll(".nav-container");

  function switchTab(clickedTab) {
    const tabId = clickedTab.getAttribute("data-tab");
    document.querySelectorAll(".tab-item").forEach((tab) => {
      tab.classList.remove("active");
    });
    document
      .querySelectorAll(`.tab-item[data-tab="${tabId}"]`)
      .forEach((tab) => tab.classList.add("active"));

    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.add("hidden");
      content.classList.remove("active");
    });

    const activeContent = document.getElementById(`${tabId}-content`);
    if (activeContent) {
      activeContent.classList.remove("hidden");
      activeContent.classList.add("active");
    }
  }

  navContainers.forEach((container) => {
    container.addEventListener("click", (e) => {
      const clickedTab = e.target.closest(".tab-item");
      if (clickedTab) switchTab(clickedTab);
    });
  });
});

// Clean-up listeners jab component destroy ho jaye
onUnmounted(() => {
  window.removeEventListener("scroll", blurHandler);
});
</script>
