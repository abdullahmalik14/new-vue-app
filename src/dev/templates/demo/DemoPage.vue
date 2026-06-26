<template>
    <div class="bg-[#ececec] py-16 px-4 font-sans antialiased text-slate-900">
        <div class="max-w-7xl mx-auto flex flex-col gap-24">

            <!-- PAGE TITLE -->
            <div class="text-center relative py-12">
                <div class="absolute inset-0 flex items-center justify-center -z-10 opacity-30">
                    <div class="w-96 h-96 bg-indigo-200 rounded-full blur-[100px] animate-pulse"></div>
                </div>
                <h1
                    class="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 tracking-tighter drop-shadow-sm mb-4">
                    Dashboard Component Showcase
                </h1>

            </div>


            <!-- ===== SECTION: MediaCardVariants ===== -->
            <div class="flex flex-col gap-12">
                <div class="flex flex-col gap-4">
                    <BaseHeading text="Media Card Variations (V1)" tag="h1" theme="defaultPrimaryHeading" version="basic"
                        class="!text-black" />
                    <BaseParagraph text="Multiple display logic and layout variants for our primary media card."
                        class="!text-slate-500" />
                </div>

                <!-- 1. Creator: My Media -->
                <section class="flex flex-col gap-6">
                    <BaseHeading text="1. Creator: My Media" tag="h2" theme="defaultSecondaryHeading" version="basic"
                        class="!text-black" />
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                        <MediaCardV1 v-for="item in myMediaList" :key="item.id" :media="item" variant="default"
                            @menu-action="handleAction" />
                    </div>
                    <ShowCodeToggle :code="demoSnippets.mediaV1.myMedia" />
                </section>

                <!-- 2. Fan: Continue Watching -->
                <section class="flex flex-col gap-6">
                    <BaseHeading text="2. Fan: Continue Watching" tag="h2" theme="defaultSecondaryHeading" version="basic"
                        class="!text-black" />
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                        <MediaCardV1 :media="myMediaList[0]" variant="resume" />
                    </div>
                    <ShowCodeToggle :code="demoSnippets.mediaV1.resume" />
                </section>

                <!-- 3. Fan: Latest Media -->
                <section class="flex flex-col gap-6">
                    <BaseHeading text="3. Fan: Latest Media" tag="h2" theme="defaultSecondaryHeading" version="basic"
                        class="!text-black" />
                    <div class="flex items-start gap-4">
                        <MediaCardV1 :media="latestMediaItem" variant="latest" />
                    </div>
                    <ShowCodeToggle :code="demoSnippets.mediaV1.latest" />
                </section>

                <!-- 4. Fan: Purchased Media -->
                <section class="flex flex-col gap-6">
                    <BaseHeading text="4. Fan: Purchased Media" tag="h2" theme="defaultSecondaryHeading" version="basic"
                        class="!text-black" />
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                        <MediaCardV1 :media="purchasedMediaItem" variant="purchased" @menu-action="handleAction" />
                    </div>
                    <ShowCodeToggle :code="demoSnippets.mediaV1.purchased" />
                </section>

                <!-- 5. Fan: Grid View (Zoom Effect) -->
                <section class="flex flex-col gap-6">
                    <BaseHeading text="5. Fan: Grid View (Zoom Effect)" tag="h2" theme="defaultSecondaryHeading"
                        version="basic" class="!text-black" />
                    <div
                        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-2 xl:gap-4 w-full gap-y-[5.5rem] md:gap-y-[5rem] xl:gap-y-[5.5rem] relative isolate">
                        <MediaCardV1 v-for="item in gridMediaList" :key="item.id" :media="item" variant="grid"
                            @menu-action="handleAction" />
                    </div>
                    <ShowCodeToggle :code="demoSnippets.mediaV1.gridView" />
                </section>

                <div class="">
                    <BaseHeading text="Media Card Variations (V2)" tag="h1" theme="defaultPrimaryHeading" version="basic"
                        class="!text-black" />
                    <BaseParagraph text="An alternative design language for cards with hover expansion effects."
                        class="!text-slate-500 mt-2" />
                </div>

                <div class="flex flex-col gap-8">
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-12 gap-x-4 relative isolate">
                        <div class="flex flex-col gap-3">
                            <span class="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Gallery</span>
                            <MediaCardV2 :media="galleryCard" />
                            <ShowCodeToggle :code="demoSnippets.mediaV2.gallery" />
                        </div>
                        <div class="flex flex-col gap-3">
                            <span class="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Image</span>
                            <MediaCardV2 :media="imageCard" />
                            <ShowCodeToggle :code="demoSnippets.mediaV2.image" />
                        </div>
                        <div class="flex flex-col gap-3">
                            <span class="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Video</span>
                            <MediaCardV2 :media="videoCard" />
                            <ShowCodeToggle :code="demoSnippets.mediaV2.video" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- ===== SECTION: DashboardTextInput ===== -->
            <section class="flex flex-col gap-10">
                <DemoSectionHeader title="DashboardTextInput" />

                <p class="text-sm font-semibold text-gray-600 -mb-4">{{ t('demo.dashboardTextInput.generalVariations') }}</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

                    <!-- Label + description + placeholder -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.labelDescPlaceholder') }}</span>
                        <DashboardTextInput v-model="inputs.username" :placeholder="t('demo.dashboardTextInput.usernamePlaceholder')" showLabel
                            :labelText="t('demo.dashboardTextInput.username')"
                            :description="t('demo.dashboardTextInput.usernameDescription')" />
                        <ShowCodeToggle :code="demoSnippets.icd.withLabelDescPlaceholder" />
                    </div>

                    <!-- Label + placeholder, no description -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.labelPlaceholder') }}</span>
                        <DashboardTextInput v-model="inputs.email" :placeholder="t('demo.dashboardTextInput.emailPlaceholder')" showLabel
                            :labelText="t('demo.dashboardTextInput.email')" />
                        <ShowCodeToggle :code="demoSnippets.icd.withLabelPlaceholder" />
                    </div>

                    <!-- Label, no placeholder -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.labelNoPlaceholder') }}</span>
                        <DashboardTextInput v-model="inputs.firstName" showLabel :labelText="t('demo.dashboardTextInput.firstName')" />
                        <ShowCodeToggle :code="demoSnippets.icd.withLabelNoPlaceholder" />
                    </div>

                    <!-- No label, with placeholder -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.noLabelWithPlaceholder') }}</span>
                        <DashboardTextInput v-model="inputs.noLabel" :placeholder="t('demo.dashboardTextInput.noLabelPlaceholder')" />
                        <ShowCodeToggle :code="demoSnippets.icd.noLabelWithPlaceholder" />
                    </div>

                    <!-- No label, no placeholder, no description -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.plain') }}</span>
                        <DashboardTextInput v-model="inputs.plain" />
                        <ShowCodeToggle :code="demoSnippets.icd.plain" />
                    </div>

                    <!-- Title with placeholder only -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.title') }}</span>
                        <DashboardTextInput v-model="inputs.title" :placeholder="t('booking.eventTitlePlaceholder')" showLabel
                            :labelText="t('demo.dashboardTextInput.title')" />
                        <ShowCodeToggle :code="demoSnippets.icd.title" />
                    </div>

                    <!-- Left icon search (asset map) -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.leftIconSearch') }}</span>
                        <DashboardTextInput v-model="inputs.search" :placeholder="t('common.searchByUsernameEmail')" showLabel
                            :labelText="t('booking.coPerformerOptional')" :left-icon="searchIconUrl" optionalLabel
                            :optionalLabelText="t('common.optional')" />
                        <ShowCodeToggle :code="demoSnippets.icd.searchLeftIcon" />
                    </div>

                    <!-- No icon -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.noIcon') }}</span>
                        <DashboardTextInput v-model="inputs.noIcon" :placeholder="t('demo.dashboardTextInput.plainNoIconsPlaceholder')" showLabel
                            :labelText="t('demo.dashboardTextInput.displayName')" />
                        <ShowCodeToggle :code="demoSnippets.icd.noIcon" />
                    </div>

                    <!-- Right icon (asset map) -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.rightIcon') }}</span>
                        <DashboardTextInput v-model="inputs.emailSupport" :placeholder="t('demo.dashboardTextInput.enterEmailPlaceholder')" showLabel
                            :labelText="t('demo.dashboardTextInput.emailSupport')" autocomplete="email" :rightIcon="EnvelopeIcon" />
                        <ShowCodeToggle :code="demoSnippets.icd.rightIcon" />
                    </div>

                    <!-- Autofill styling (no icon — browser saved email) -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.autofill') }}</span>
                        <DashboardTextInput v-model="inputs.autofillEmail" :placeholder="t('demo.dashboardTextInput.enterEmailPlaceholder')" showLabel
                            :labelText="t('demo.dashboardTextInput.email')" autocomplete="email" name="email" />
                        <ShowCodeToggle :code="demoSnippets.icd.autofill" />
                    </div>

                    <!-- Required asterisk -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.requiredStar') }}</span>
                        <DashboardTextInput v-model="inputs.requiredStar" :placeholder="t('demo.dashboardTextInput.requiredPlaceholder')" showLabel
                            :labelText="t('demo.dashboardTextInput.fullName')" requiredDisplay="*" />
                        <ShowCodeToggle :code="demoSnippets.icd.requiredStar" />
                    </div>

                    <!-- Required italic text -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.requiredItalic') }}</span>
                        <DashboardTextInput v-model="inputs.requiredText" :placeholder="t('demo.dashboardTextInput.requiredPlaceholder')" showLabel
                            :labelText="t('demo.dashboardTextInput.emailAddress')" requiredDisplay="italic-text" />
                        <ShowCodeToggle :code="demoSnippets.icd.requiredText" />
                    </div>

                    <!-- Both icons -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.bothIcons') }}</span>
                        <DashboardTextInput v-model="inputs.advancedSearch" :placeholder="t('demo.dashboardTextInput.searchFiltersPlaceholder')" showLabel
                            :labelText="t('demo.dashboardTextInput.advancedSearch')" :leftIcon="searchIconUrl" :rightIcon="Bars3Icon"
                            clickableRightIcon />
                        <ShowCodeToggle :code="demoSnippets.icd.bothIcons" />
                    </div>

                    <!-- Textarea with wired character counter -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.textareaCounter') }}</span>
                        <DashboardTextInput id="demo-textarea-bio" type="textarea" show-label v-model="inputs.bio"
                            textAreaRows="3" :labelText="t('demo.dashboardTextInput.bio')" :placeholder="t('common.descriptionOptional')" :maxLength="200" />
                        <ShowCodeToggle :code="demoSnippets.icd.textarea" />
                    </div>

                    <!-- Textarea with description + counter -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.textareaDescCounter') }}</span>
                        <DashboardTextInput type="textarea" show-label v-model="inputs.tipMessage" textAreaRows="3"
                            :labelText="t('demo.dashboardTextInput.tipMessage')" :placeholder="t('demo.dashboardTextInput.tipMessagePlaceholder')"
                            :description="t('demo.dashboardTextInput.tipMessageDescription')" :maxLength="200" />
                        <ShowCodeToggle :code="demoSnippets.icd.textareaWithDesc" />
                    </div>
                </div>

             
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

                    <!-- Event title — no label (booking step 1) -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.noLabelEventTitle') }}</span>
                        <DashboardTextInput v-model="inputs.eventTitle" :placeholder="t('booking.eventTitlePlaceholder')" />
                        <ShowCodeToggle :code="demoSnippets.icd.bookingEventTitle" />
                    </div>

                    <!-- Co-performer search (booking step 2) -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.coPerformerSearch') }}</span>
                        <DashboardTextInput v-model="inputs.coPerformerSearch" :placeholder="t('common.searchByUsernameEmail')"
                            showLabel :labelText="t('booking.coPerformerOptional')" :left-icon="searchIconUrl" optionalLabel
                            :optionalLabelText="t('common.optional')" />
                        <ShowCodeToggle :code="demoSnippets.icd.bookingCoPerformer" />
                    </div>

                    <!-- Session duration — Minutes outside input (booking step 1) -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.numberMinutes') }}</span>
                        <div class="flex flex-col gap-1.5 w-full">
                            <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">{{ t('booking.sessionDuration') }}</span>
                            <div class="flex items-center gap-2">
                                <div class="w-44 shrink-0">
                                    <DashboardTextInput v-model="inputs.duration" type="number" />
                                </div>
                                <span class="text-base font-medium text-[#101828] dark:text-[#d6d3cd] leading-normal whitespace-nowrap">{{ t('booking.minutes') }}</span>
                            </div>
                        </div>
                        <ShowCodeToggle :code="demoSnippets.icd.bookingDuration" />
                    </div>

                    <!-- Base price — Tokens /session outside input -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.basePriceTokens') }}</span>
                        <div class="flex flex-col gap-1.5 w-full">
                            <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">{{ t('booking.basePrice') }}</span>
                            <div class="flex items-center gap-2">
                                <div class="w-44 shrink-0">
                                    <DashboardTextInput v-model="inputs.basePrice" type="number" />
                                </div>
                                <div class="flex items-center gap-2 whitespace-nowrap">
                                    <span class="text-base font-medium text-[#101828] dark:text-[#d6d3cd] leading-normal">{{ t('common.tokens') }}</span>
                                    <span class="text-base font-normal text-[#101828] dark:text-[#d6d3cd] leading-tight">{{ t('booking.perSession') }}</span>
                                </div>
                            </div>
                        </div>
                        <ShowCodeToggle :code="demoSnippets.icd.bookingBasePrice" />
                    </div>

                    <!-- USD leftSpan (media uploader pattern) -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.leftSpanUsd') }}</span>
                        <DashboardTextInput v-model="inputs.originalPrice" type="number" showLabel
                            :labelText="t('booking.originalPrice')" leftSpan :leftSpanText="t('demo.dashboardTextInput.usdPrefix')"
                            :description="t('booking.priceRangeDescription')" />
                        <ShowCodeToggle :code="demoSnippets.icd.bookingLeftSpan" />
                    </div>

                    <!-- Number stepper only -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.numberStepper') }}</span>
                        <DashboardTextInput v-model="inputs.quantity" type="number" showLabel :labelText="t('demo.dashboardTextInput.quantity')" />
                        <ShowCodeToggle :code="demoSnippets.icd.numberStepper" />
                    </div>

                    <!-- Number without stepper -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.numberNoStepper') }}</span>
                        <DashboardTextInput v-model="inputs.age" type="number" showLabel :labelText="t('demo.dashboardTextInput.age')" :showControls="false" />
                        <ShowCodeToggle :code="demoSnippets.icd.numberNoControls" />
                    </div>

                    <!-- Booking fee — tooltip only (no suffix inside input) -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.tooltipOnly') }}</span>
                        <DashboardTextInput v-model="inputs.bookingFee" type="number" showLabel
                            :labelText="t('booking.bookingFee')" showTooltip :tooltipText="t('booking.bookingFeeTooltip')"
                            :tooltipIcon="InformationCircleIcon" />
                        <ShowCodeToggle :code="demoSnippets.icd.bookingTooltip" />
                    </div>

                    <!-- Off-hour surcharge — % outside input -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.offHourSurcharge') }}</span>
                        <div class="flex flex-col gap-1.5 w-full">
                            <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">{{ t('booking.offHourSurcharge') }}</span>
                            <div class="flex items-center gap-2">
                                <div class="w-44 shrink-0">
                                    <DashboardTextInput v-model="inputs.offHourSurcharge" type="number" />
                                </div>
                                <span class="text-base font-medium text-[#101828] dark:text-[#d6d3cd] leading-normal whitespace-nowrap">{{ t('booking.percentFromBasePrice') }}</span>
                            </div>
                        </div>
                        <ShowCodeToggle :code="demoSnippets.icd.bookingOffHour" />
                    </div>

                    <!-- Disabled number -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.disabled') }}</span>
                        <div class="flex flex-col gap-1.5 w-full opacity-50">
                            <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">{{ t('booking.maximumSessionAllowed') }}</span>
                            <div class="flex items-center gap-2">
                                <div class="w-44 shrink-0">
                                    <DashboardTextInput v-model="inputs.maxSessionDuration" type="number" disabled />
                                </div>
                                <span class="text-base font-medium text-[#101828] dark:text-[#d6d3cd] leading-normal whitespace-nowrap">{{ t('booking.sessions') }}</span>
                            </div>
                        </div>
                        <ShowCodeToggle :code="demoSnippets.icd.bookingDisabled" />
                    </div>

                    <!-- Validation errors -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.validationErrors') }}</span>
                        <DashboardTextInput v-model="inputs.eventTitleValidated" showLabel
                            :labelText="t('booking.eventTitlePlaceholder')" :placeholder="t('booking.eventTitlePlaceholder')"
                            showErrors :errors="[{ message: t('booking.validationEventTitleRequired') }]" />
                        <ShowCodeToggle :code="demoSnippets.icd.bookingErrors" />
                    </div>

                    <!-- Required text error -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.requiredTextError') }}</span>
                        <DashboardTextInput v-model="inputs.requiredErrorField" showLabel :labelText="t('booking.eventTitlePlaceholder')"
                            requiredDisplay="required-text-error" />
                        <ShowCodeToggle :code="demoSnippets.icd.bookingRequiredError" />
                    </div>

                    <!-- Success state -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.success') }}</span>
                        <DashboardTextInput v-model="inputs.successField" showLabel :labelText="t('demo.dashboardTextInput.username')" onSuccess
                            :success="[{ message: t('demo.dashboardTextInput.usernameAvailable') }]" />
                        <ShowCodeToggle :code="demoSnippets.icd.bookingSuccess" />
                    </div>

                    <!-- Remind me — inline copy outside input (booking settings) -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.dashboardTextInput.variations.remindMe') }}</span>
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="text-base font-normal text-[#101828] dark:text-[#d6d3cd] leading-normal whitespace-nowrap">{{ t('booking.remindMe') }}</span>
                            <div class="w-44 shrink-0">
                                <DashboardTextInput v-model="inputs.remindMeTime" type="number" />
                            </div>
                            <span class="text-base font-normal text-[#101828] dark:text-[#d6d3cd] leading-normal">{{ `${t('booking.minutesBeforeCall')} ${t('booking.scheduledCall')}` }}</span>
                        </div>
                        <ShowCodeToggle :code="demoSnippets.icd.bookingRemindMe" />
                    </div>
                </div>
            </section>

            <!-- ===== SECTION: Heading ===== -->
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="Heading" />
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <!-- 1. h1 defaultPrimary -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">h1 —
                            defaultPrimaryHeading</span>
                        <div class="p-2  flex items-center">
                            <BaseHeading text="Primary H1" tag="h1" theme="defaultPrimaryHeading" class="!text-black"
                                version="basic" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.heading.h1Primary" />
                    </div>

                    <!-- 2. h2 defaultSecondary -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">h2 —
                            defaultSecondaryHeading</span>
                        <div class="p-2  flex items-center">
                            <BaseHeading text="Secondary H2" tag="h2" theme="defaultSecondaryHeading" class="!text-black"
                                version="basic" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.heading.h2Secondary" />
                    </div>

                    <!-- 3. h3 sectionHeading -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">h3 — sectionHeading</span>
                        <div class="p-2  flex items-center">
                            <BaseHeading text="Section H3" tag="h3" theme="sectionHeading" class="!text-black"
                                version="basic" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.heading.h3Section" />
                    </div>

                    <!-- 4. dashboardHeading -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">h2 — dashboardHeading</span>
                        <div class="p-2  flex items-center">
                            <BaseHeading text="Dashboard Title" tag="h2" theme="dashboardHeading" version="basic" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.heading.h2Dashboard" />
                    </div>

                    <!-- 5. AuthHeading -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">h2 — AuthHeading</span>
                        <div class="p-2  flex items-center">
                            <BaseHeading text="Login" tag="h2" theme="AuthHeading" class="!text-black" version="basic" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.heading.h2Auth" />
                    </div>

                    <!-- 6. formHeading -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">h4 — formHeading</span>
                        <div class="p-2  flex items-center">
                            <BaseHeading text="Profile Settings" tag="h4" theme="formHeading" version="basic" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.heading.h4Form" />
                    </div>

                    <!-- 7. demoHeadings h1 -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">h1 — demoHeadings</span>
                        <div class="p-2  flex items-center">
                            <BaseHeading text="Demo H1 Bold" tag="h1" theme="demoHeadings" version="basic" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.heading.h1Demo" />
                    </div>

                    <!-- 8. demoHeadings h3 -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">h3 — demoHeadings</span>
                        <div class="p-2  flex items-center">
                            <BaseHeading text="Demo H3 Medium" tag="h3" theme="demoHeadings" version="basic" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.heading.h3Demo" />
                    </div>

                    <!-- 9. With left icon -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">With Left Icon</span>

                        <BaseHeading text="With Icon" tag="h3" theme="defaultSecondaryHeading" class="!text-black"
                            version="basic" :leftIcon="StarIcon" />

                        <ShowCodeToggle :code="demoSnippets.heading.withIcon" />
                    </div>

                    <!-- 10. orderHeading -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">h1 — orderHeading</span>
                        <div class="p-2  flex items-center">
                            <BaseHeading text="Order #1234" tag="h1" theme="orderHeading" version="basic" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.heading.order" />
                    </div>
                </div>
            </section>

            <!-- ===== SECTION: Paragraph ===== -->
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="Paragraph" />
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <!-- 1. Default -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Default</span>
                        <div class="p-2  flex items-center">
                            <BaseParagraph text="This is a default paragraph with standard styling." class="!text-black" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.paragraph.default" />
                    </div>

                    <!-- 2. Small font -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Small (text-sm)</span>
                        <div class="p-2  flex items-center">
                            <BaseParagraph text="Small text paragraph for captions." class="!text-black text-sm" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.paragraph.small" />
                    </div>

                    <!-- 3. Large font -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Large (text-xl)</span>
                        <div class="p-2  flex items-center">
                            <BaseParagraph text="Large paragraph text." class="!text-black text-xl" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.paragraph.large" />
                    </div>

                    <!-- 4. Bold -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Bold</span>
                        <div class="p-2  flex items-center">
                            <BaseParagraph text="Bold paragraph text." class="!text-black font-bold" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.paragraph.bold" />
                    </div>

                    <!-- 5. Custom color -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Custom Color (Blue)</span>
                        <div class="p-2  flex items-center">
                            <BaseParagraph text="Blue paragraph text." fontColor="text-blue-600" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.paragraph.blue" />
                    </div>

                    <!-- 6. Error color -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Error Red</span>
                        <div class="p-2  flex items-center">
                            <BaseParagraph text="This field is required." fontColor="text-red-500" fontSize="text-sm" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.paragraph.error" />
                    </div>

                    <!-- 7. Success color -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Success Green</span>
                        <div class="p-2  flex items-center">
                            <BaseParagraph text="Action successful!" fontColor="text-green-600" fontWeight="font-medium" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.paragraph.success" />
                    </div>

                    <!-- 8. Italic -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Italic</span>
                        <div class="p-2  flex items-center">
                            <BaseParagraph text="Italic paragraph text for notes." fontFamily="italic"
                                fontColor="text-gray-500" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.paragraph.italic" />
                    </div>

                    <!-- 9. With left icon -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">With Left Icon</span>
                        <div class="p-2  flex items-center">
                            <BaseParagraph text="Info message here" :leftIcon="InformationCircleIcon" fontSize="text-sm"
                                fontColor="text-blue-600" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.paragraph.withIcon" />
                    </div>

                    <!-- 10. Extra small xs -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Extra Small (text-xs)</span>
                        <div class="p-2  flex items-center">
                            <BaseParagraph text="Helper text displayed below the input field." fontSize="text-xs"
                                fontColor="text-gray-400" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.paragraph.xs" />
                    </div>
                </div>
            </section>

            <!-- ===== SECTION: NotificationCard ===== -->
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="NotificationCard" />
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <!-- Colour variants -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('notificationCard.demo.labels.warningMediaRequired') }}</span>
                        <div class="p-2 flex items-center">
                            <NotificationCard variant="warning"
                                :title="t('notificationCard.demo.titles.mediaRequired')"
                                :description="t('notificationCard.demo.descriptions.mediaRequired')"
                                :icon="notifFilmIconUrl" :badgeIcon="notifUploadIconUrl"
                                v-model="notifOpen.warning" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.notification.warning" />
                    </div>
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('notificationCard.demo.labels.successApproved') }}</span>
                        <div class="p-2 flex items-center">
                            <NotificationCard variant="success"
                                :title="t('notificationCard.demo.titles.congratulations')"
                                :description="t('notificationCard.demo.descriptions.mediaApproved')"
                                :icon="notifPlaceholderIconUrl" :badgeIcon="tickCircleUrl"
                                v-model="notifOpen.success" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.notification.success" />
                    </div>
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('notificationCard.demo.labels.infoBankDetails') }}</span>
                        <div class="p-2 flex items-center">
                            <NotificationCard variant="info"
                                :title="t('notificationCard.demo.titles.bankDetails')"
                                :description="t('notificationCard.demo.descriptions.bankDetails')"
                                :icon="notifSettingsIconUrl" :badgeIcon="notifSettingsIconUrl"
                                v-model="notifOpen.info" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.notification.info" />
                    </div>
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('notificationCard.demo.labels.errorDestructive') }}</span>
                        <div class="p-2 flex items-center">
                            <NotificationCard variant="error"
                                :title="t('notificationCard.demo.titles.actionRequired')"
                                :description="t('notificationCard.demo.descriptions.securityUpdate')"
                                :icon="notifBellIconUrl" :badgeIcon="notifDeleteIconUrl"
                                v-model="notifOpen.error" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.notification.error" />
                    </div>
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('notificationCard.demo.labels.noticeCyan') }}</span>
                        <div class="p-2 flex items-center">
                            <NotificationCard variant="notice"
                                :title="t('notificationCard.demo.titles.unsavedChanges')"
                                :description="t('notificationCard.demo.descriptions.unsavedChanges')"
                                :icon="notifHeartIconUrl" :badgeIcon="notifTipIconUrl"
                                v-model="notifOpen.notice" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.notification.notice" />
                    </div>
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('notificationCard.demo.labels.alertAmber') }}</span>
                        <div class="p-2 flex items-center">
                            <NotificationCard variant="alert"
                                :title="t('notificationCard.demo.titles.activeSubscribers')"
                                :description="t('notificationCard.demo.descriptions.activeSubscribers')"
                                :icon="notifCommentIconUrl"
                                v-model="notifOpen.alert" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.notification.alert" />
                    </div>
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('notificationCard.demo.labels.successTeal') }}</span>
                        <div class="p-2 flex items-center">
                            <NotificationCard variant="success-teal"
                                :title="t('notificationCard.demo.titles.profileUpdated')"
                                :description="t('notificationCard.demo.descriptions.profileUpdated')"
                                :icon="notifHeartIconUrl"
                                v-model="notifOpen.successTeal" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.notification.successTeal" />
                    </div>
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('notificationCard.demo.labels.limitExceededDark') }}</span>
                        <div class="p-2 flex items-center">
                            <NotificationCard variant="limit-exceeded"
                                :title="t('notificationCard.demo.titles.uploadLimit')"
                                :description="t('notificationCard.demo.descriptions.uploadLimit')"
                                :icon="notifBellIconUrl"
                                v-model="notifOpen.limitExceeded" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.notification.limitExceeded" />
                    </div>

                    <!-- With / without icon -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('notificationCard.demo.labels.withIcon') }}</span>
                        <div class="p-2 flex items-center">
                            <NotificationCard variant="info"
                                :title="t('notificationCard.demo.titles.bankDetails')"
                                :description="t('notificationCard.demo.descriptions.bankDetails')"
                                :icon="notifSettingsIconUrl"
                                v-model="notifOpen.withIcon" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.notification.withIcon" />
                    </div>
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('notificationCard.demo.labels.withoutIcon') }}</span>
                        <div class="p-2 flex items-center">
                            <NotificationCard variant="alert" :showIcon="false"
                                :title="t('notificationCard.demo.titles.activeSubscribers')"
                                :description="t('notificationCard.demo.descriptions.activeSubscribers')"
                                v-model="notifOpen.withoutIcon" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.notification.withoutIcon" />
                    </div>

                    <!-- With / without description -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('notificationCard.demo.labels.withDescription') }}</span>
                        <div class="p-2 flex items-center">
                            <NotificationCard variant="success"
                                :title="t('notificationCard.demo.titles.congratulations')"
                                :description="t('notificationCard.demo.descriptions.mediaApproved')"
                                :icon="notifPlaceholderIconUrl"
                                v-model="notifOpen.withDescription" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.notification.withDescription" />
                    </div>
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('notificationCard.demo.labels.withoutDescription') }}</span>
                        <div class="p-2 flex items-center">
                            <NotificationCard variant="notice"
                                :title="t('notificationCard.demo.titles.titleOnly')"
                                :icon="notifHeartIconUrl"
                                v-model="notifOpen.withoutDescription" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.notification.withoutDescription" />
                    </div>
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('notificationCard.demo.labels.withoutTitle') }}</span>
                        <div class="p-2 flex items-center">
                            <NotificationCard variant="info"
                                :description="t('notificationCard.demo.descriptions.completeProfile')"
                                :icon="notifUserPlaceholderIconUrl"
                                v-model="notifOpen.withoutTitle" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.notification.withoutTitle" />
                    </div>

                    <!-- With / without close -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('notificationCard.demo.labels.withClose') }}</span>
                        <div class="p-2 flex items-center">
                            <NotificationCard variant="info"
                                :title="t('notificationCard.demo.titles.bankDetails')"
                                :description="t('notificationCard.demo.descriptions.bankDetails')"
                                :icon="notifSettingsIconUrl" :closable="true"
                                v-model="notifOpen.withClose" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.notification.withClose" />
                    </div>
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('notificationCard.demo.labels.withoutClose') }}</span>
                        <div class="p-2 flex items-center">
                            <NotificationCard variant="notice"
                                :title="t('notificationCard.demo.titles.unsavedChanges')"
                                :description="t('notificationCard.demo.descriptions.unsavedChanges')"
                                :icon="notifHeartIconUrl" :closable="false"
                                v-model="notifOpen.withoutClose" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.notification.withoutClose" />
                    </div>

                    <!-- Custom icon -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('notificationCard.demo.labels.customIcon') }}</span>
                        <div class="p-2 flex items-center">
                            <NotificationCard variant="success-teal"
                                :title="t('notificationCard.demo.titles.profileUpdated')"
                                :description="t('notificationCard.demo.descriptions.profileUpdated')"
                                :icon="notifHeartIconUrl" :badgeIcon="notifTipIconUrl"
                                v-model="notifOpen.customIcon" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.notification.customIcon" />
                    </div>

                    <!-- With / without link -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('notificationCard.demo.labels.withLink') }}</span>
                        <div class="p-2 flex items-center">
                            <NotificationCard variant="notice"
                                :title="t('notificationCard.demo.titles.connectX')"
                                :description="t('notificationCard.demo.descriptions.connectX')"
                                :icon="notifCommentIconUrl"
                                :linkLabel="t('notificationCard.demo.links.connectNow')"
                                linkHref="#"
                                v-model="notifOpen.withLink" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.notification.withLink" />
                    </div>
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('notificationCard.demo.labels.withoutLink') }}</span>
                        <div class="p-2 flex items-center">
                            <NotificationCard variant="info"
                                :title="t('notificationCard.demo.titles.titleOnly')"
                                :description="t('notificationCard.demo.descriptions.completeProfile')"
                                :icon="notifUserPlaceholderIconUrl"
                                v-model="notifOpen.withoutLink" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.notification.withoutLink" />
                    </div>
                </div>
            </section>

            <!-- ===== SECTION: QuillEditor ===== -->
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="QuillEditor" />
                <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.quillEditor.labels.default') }}</span>
                        <div class="bg-transparent overflow-hidden">
                            <QuillEditor v-model="vals.q1" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.quill.default" />
                    </div>

                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.quillEditor.labels.customPlaceholder') }}</span>
                        <div class="bg-transparent overflow-hidden">
                            <QuillEditor v-model="vals.q2" :placeholder="t('demo.quillEditor.placeholders.tierDescription')" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.quill.customPlaceholder" />
                    </div>

                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.quillEditor.labels.initialContent') }}</span>
                        <div class="bg-transparent overflow-hidden">
                            <QuillEditor v-model="vals.q3" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.quill.initialContent" />
                    </div>

                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.quillEditor.labels.richInitialContent') }}</span>
                        <div class="bg-transparent overflow-hidden">
                            <QuillEditor v-model="vals.q4" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.quill.richInitialContent" />
                    </div>

                    <div class="flex flex-col gap-3 md:col-span-2">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t('demo.quillEditor.labels.withLabelWrapper') }}</span>
                        <div class="bg-transparent overflow-hidden max-w-xl">
                            <div class="flex flex-col gap-1.5">
                                <span class="text-sm font-medium text-[#667085]">{{ t('demo.quillEditor.fieldLabels.eventDescription') }}</span>
                                <QuillEditor v-model="vals.q5" :placeholder="t('demo.quillEditor.placeholders.eventDescription')" />
                            </div>
                        </div>
                        <ShowCodeToggle :code="demoSnippets.quill.withLabelWrapper" />
                    </div>
                </div>
            </section>

            <!-- ===== SECTION: SubscriptionCard ===== -->
            <!-- Temporarily removed as SubscriptionCard is missing
            <section class="flex flex-col gap-12">
                ...
            </section>
            -->

            <!-- ===== SECTION: TierCard ===== -->
            <section class="flex flex-col gap-12">
                <DemoSectionHeader title="Tier Cards" />
                <p class="text-xs text-slate-500/80 -mt-8">
                    {{ t('demo.tierCard.sectionDescription') }}
                </p>
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-x-8 gap-y-12">
                    <div v-for="tier in demoTierList" :key="tier.id" class="flex flex-col gap-4">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t(tier.labelKey) }}</span>
                        <TierCard :tier="tier" />
                        <ShowCodeToggle :code="demoSnippets.tierCard[tier.id]" />
                    </div>
                </div>
            </section>

            <!-- ===== SECTION: EventCard ===== -->
            <section class="flex flex-col gap-12">
                <DemoSectionHeader title="Event Cards" />
                <p class="text-xs text-slate-500/80 -mt-8">
                    {{ t('demo.eventCard.sectionDescription') }}
                </p>
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-x-8 gap-y-12">
                    <div v-for="item in demoEventCards" :key="item.id" class="flex flex-col gap-4">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ t(item.labelKey) }}</span>
                        <EventCard :theme="item.theme" :hasButton="item.hasButton" />
                        <ShowCodeToggle :code="demoSnippets.eventCard[item.id]" />
                    </div>
                </div>
            </section>

            <!-- ===== SECTION: Cart component ===== -->
            <section class="flex flex-col gap-12">
                <DemoSectionHeader title="Shopping Cart" />
                <p class="text-xs text-slate-500/80 -mt-8">
                    Interactive cart component driven by custom events. Open console to see interaction commands.
                </p>
                <Cart />

                <div class="">
                    <ShowCodeToggle :code="demoSnippets.cart.default" />
                </div>
            </section>



            <!-- ===== SECTION: Spinner ===== -->
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="Spinner" />
                <p class="text-sm text-gray-500 -mt-4">{{ t('demo.spinner.assetMapImage') }} — useAssetUrl + assetMap (no hardcoded URLs)</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

                    <div class="flex flex-col items-center gap-3 p-4 border border-gray-200 rounded-lg bg-white/60">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider text-center">{{ t('demo.spinner.assetMapImage') }}</span>
                        <LoadingSpinner v-if="spinnerIconUrl" :src="spinnerIconUrl" size="2xl" />
                        <span v-else class="text-xs text-gray-400">{{ t('common.loading') }}</span>
                        <ShowCodeToggle :code="demoSnippets.spinner.img" />
                    </div>

                    <div class="flex flex-col items-center gap-3 p-4 border border-gray-200 rounded-lg bg-white/60">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider text-center">{{ t('demo.spinner.svgStyled') }}</span>
                        <LoadingSpinner thickness="3.5" size="lg" color="text-green-500" trackColor="text-white" />
                        <ShowCodeToggle :code="demoSnippets.spinner.styled" />
                    </div>

                    <div class="flex flex-col items-center gap-3 p-4 border border-gray-200 rounded-lg bg-white/60">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider text-center">{{ t('demo.spinner.svgThin') }}</span>
                        <LoadingSpinner thickness="1" size="3xl" color="text-green-500" trackColor="text-white" />
                        <ShowCodeToggle :code="demoSnippets.spinner.thin" />
                    </div>

                </div>
            </section>

            <!-- ===== SECTION: All Buttons (full catalog) ===== -->
            <section class="flex flex-col gap-8 mb-20">
                <DemoSectionHeader title="All Buttons — Full Catalog" />

                <p class="text-sm text-gray-500 -mt-4">
                    Exactly the same buttons used across the app (same text, variant, size, width and icons),
                    so another developer can copy the real thing. Each label shows the variant and where it is used.
                </p>
                <p class="text-sm text-gray-600">{{ t('demo.buttons.clickToLoadHint') }}</p>

                <!-- Auth pages (login / sign up / onboarding) -->
                <div class="flex flex-col gap-3">
                    <span class="text-xs text-gray-500 uppercase tracking-wider font-semibold">Auth pages — login / sign up / onboarding</span>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                        <div class="flex flex-col gap-2 w-full max-w-[380px]">
                            <DashboardPrimaryButton text="Sign in" variant="authPink" size="lg" type="button"
                                :loading="buttonLoaders.authSignIn" loadingSpinnerColor="text-white"
                                @click="runButtonDemo('authSignIn')" />
                            <span class="text-[10px] text-gray-400 uppercase tracking-wider">authPink · size lg · login/signup submit</span>
                            <ShowCodeToggle :code="demoSnippets.buttons.authSignIn" />
                        </div>
                        <div class="flex flex-col gap-2 w-full max-w-[380px]">
                            <DashboardPrimaryButton text="Continue with X (Twitter)" variant="authTransparent" size="lg" type="button"
                                :leftIcon="xLogoUrl" leftIconClass="w-8 h-8"
                                :loading="buttonLoaders.authX" loadingSpinnerColor="text-current"
                                @click="runButtonDemo('authX')" />
                            <span class="text-[10px] text-gray-400 uppercase tracking-wider">authTransparent · size lg · social</span>
                            <ShowCodeToggle :code="demoSnippets.buttons.authX" />
                        </div>
                        <div class="flex flex-col gap-2 w-full max-w-[380px]">
                            <DashboardPrimaryButton text="Continue with Telegram" variant="authTransparent" size="lg" type="button"
                                :leftIcon="telegramIconUrl" leftIconClass="w-8 h-8"
                                :loading="buttonLoaders.authTelegram" loadingSpinnerColor="text-current"
                                @click="runButtonDemo('authTelegram')" />
                            <span class="text-[10px] text-gray-400 uppercase tracking-wider">authTransparent · size lg · social</span>
                            <ShowCodeToggle :code="demoSnippets.buttons.authTelegram" />
                        </div>
                    </div>
                </div>

                <!-- Checkout / purchase / cart popups -->
                <div class="flex flex-col gap-3">
                    <span class="text-xs text-gray-500 uppercase tracking-wider font-semibold">Checkout / purchase / cart popups</span>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                        <div class="flex flex-col gap-2 w-full max-w-[380px]">
                            <DashboardPrimaryButton text="Proceed Payment" variant="checkoutProceedpayment" type="button"
                                :rightIcon="arrowRightUrl"
                                :rightIconClass="`w-6 h-6 [filter:brightness(0)_saturate(100%)] group-hover/button:[filter:brightness(0)_saturate(100%)_invert(67%)_sepia(19%)_saturate(5664%)_hue-rotate(95deg)_brightness(112%)_contrast(94%)]`"
                                :loading="buttonLoaders.checkoutProceed" loadingSpinnerColor="text-black"
                                @click="runButtonDemo('checkoutProceed')" />
                            <span class="text-[10px] text-gray-400 uppercase tracking-wider">checkoutProceedpayment · checkout/buy-now</span>
                            <ShowCodeToggle :code="demoSnippets.buttons.proceedPayment" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <DashboardPrimaryButton text="Continue with X (Twitter)" variant="actionGreen" type="button"
                                :leftIcon="xLogoUrl"
                                leftIconClass="w-6 h-6 group-hover/xbtn:[filter:brightness(0)_saturate(100%)_invert(3%)_sepia(58%)_saturate(1835%)_hue-rotate(205deg)_brightness(93%)_contrast(94%)]"
                                :loading="buttonLoaders.checkoutActionGreenX" loadingSpinnerColor="text-current"
                                @click="runButtonDemo('checkoutActionGreenX')" />
                            <span class="text-[10px] text-gray-400 uppercase tracking-wider">actionGreen · guest purchase</span>
                            <ShowCodeToggle :code="demoSnippets.buttons.actionGreenX" />
                        </div>
                    </div>
                </div>

                <!-- Profile / media -->
                <div class="flex flex-col gap-3">
                    <span class="text-xs text-gray-500 uppercase tracking-wider font-semibold">Profile / media</span>
                    <div class="flex flex-wrap items-start gap-6">
                        <div class="flex flex-col gap-2">
                            <DashboardPrimaryButton text="Back" variant="profileMediaBtn" type="button"
                                :leftIcon="arrowLeftUrl"
                                :leftIconClass="`w-8 h-8 [filter:brightness(0)_saturate(100%)_invert(81%)_sepia(45%)_saturate(3798%)_hue-rotate(87deg)_brightness(100%)_contrast(98%)] drop-shadow-[0px_0px_8px_0px_#00000080]`"
                                :loading="buttonLoaders.profileBack" loadingSpinnerColor="text-[#07F468]"
                                @click="runButtonDemo('profileBack')" />
                            <span class="text-[10px] text-gray-400 uppercase tracking-wider">profileMediaBtn · ProfileViewAll popup</span>
                            <ShowCodeToggle :code="demoSnippets.buttons.profileBack" />
                        </div>
                    </div>
                </div>

                <!-- Payout settings -->
                <div class="flex flex-col gap-3">
                    <span class="text-xs text-gray-500 uppercase tracking-wider font-semibold">Payout settings</span>
                    <div class="flex flex-wrap items-start gap-6">
                        <div class="flex flex-col gap-2">
                            <DashboardPrimaryButton variant="none" text="SAVE" type="button"
                                customClass="flex items-center gap-2.5 pl-[1.48rem] pr-2 h-10 shadow-[0px_0px_16px_0px_#FFFFFF80] [clip-path:polygon(100%_0%,100%_100%,0%_100%,0.98rem_0%)] bg-black group/button enabled:hover:bg-[#07F468]"
                                textClass="text-lg font-medium text-[#07F468] group-hover/button:text-black"
                                :loading="buttonLoaders.payoutSave" loadingSpinnerColor="text-[#07F468]"
                                @click="runButtonDemo('payoutSave')">
                                <template #leftIcon>
                                    <img v-if="tickCircleUrl" :src="tickCircleUrl" alt="" class="w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(53%)_sepia(97%)_saturate(459%)_hue-rotate(93deg)_brightness(114%)_contrast(94%)] group-hover/button:[filter:brightness(0)_saturate(100%)]" />
                                </template>
                            </DashboardPrimaryButton>
                            <span class="text-[10px] text-gray-400 uppercase tracking-wider">none + custom · PayoutSettings step 2/3</span>
                            <ShowCodeToggle :code="demoSnippets.buttons.payoutSave" />
                        </div>
                    </div>
                </div>

                <!-- Plan sharing -->
                <div class="flex flex-col gap-3">
                    <span class="text-xs text-gray-500 uppercase tracking-wider font-semibold">Plan sharing</span>
                    <div class="flex flex-wrap items-start gap-6">
                        <div class="flex flex-col gap-2">
                            <DashboardPrimaryButton text="Send invite" variant="simpleBtn" type="button"
                                :leftIcon="sendIconUrl"
                                :leftIconClass="`w-6 h-6 group-hover/button:[filter:brightness(0)_saturate(100%)_invert(74%)_sepia(36%)_saturate(5644%)_hue-rotate(95deg)_brightness(111%)_contrast(94%)]`"
                                btnBg="#07f468" btnHoverBg="black" btnText="black" btnHoverText="#07f468"
                                :loading="buttonLoaders.sendInvite" loadingSpinnerColor="text-black"
                                @click="runButtonDemo('sendInvite')" />
                            <span class="text-[10px] text-gray-400 uppercase tracking-wider">simpleBtn · PlanSharing</span>
                            <ShowCodeToggle :code="demoSnippets.buttons.sendInvite" />
                        </div>
                    </div>
                </div>

                <!-- Media uploader -->
                <div class="flex flex-col gap-3">
                    <span class="text-xs text-gray-500 uppercase tracking-wider font-semibold">Media uploader</span>
                    <div class="flex flex-wrap items-start gap-6">
                        <div class="flex flex-col gap-2">
                            <DashboardPrimaryButton text="Add Tier" variant="polygonLeft" customClass="gap-[2px] text-sm" type="button"
                                :leftIcon="addTierIconUrl"
                                :leftIconClass="`w-6 h-6 transition duration-200 [filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)] group-hover:[filter:brightness(0)]`"
                                btnBg="#000" btnHoverBg="#07f468" btnText="#07f468" btnHoverText="#000"
                                :loading="buttonLoaders.addTier" loadingSpinnerColor="text-[#07F468]"
                                @click="runButtonDemo('addTier')" />
                            <span class="text-[10px] text-gray-400 uppercase tracking-wider">polygonLeft · Add Tier</span>
                            <ShowCodeToggle :code="demoSnippets.buttons.addTier" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <div class="flex flex-wrap items-center gap-3">
                                <DashboardPrimaryButton text="Next" variant="polygonLeft" type="button"
                                    :rightIcon="polygonArrowUrl"
                                    :rightIconClass="`w-6 h-6 transition duration-200 filter brightness-0 invert-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]`"
                                    btnBg="#07f468" btnHoverBg="black" btnText="black" btnHoverText="#07f468"
                                    :loading="buttonLoaders.polygonNext" loadingSpinnerColor="text-black"
                                    @click="runButtonDemo('polygonNext')" />
                                <DashboardPrimaryButton text="Next" variant="polygonLeft" type="button" disabled
                                    :rightIcon="polygonArrowUrl"
                                    :rightIconClass="`w-6 h-6 transition duration-200 filter brightness-0 invert-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]`"
                                    btnBg="#07f468" btnHoverBg="black" btnText="black" btnHoverText="#07f468" />
                            </div>
                            <span class="text-[10px] text-gray-400 uppercase tracking-wider">polygonLeft · Next (enabled + disabled)</span>
                            <ShowCodeToggle :code="demoSnippets.buttons.polygonNext" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <DashboardPrimaryButton text="SUBMIT MEDIA FOR APPROVAL" variant="polygonLeft" type="button"
                                :rightIcon="polygonArrowUrl"
                                :rightIconClass="`w-6 h-6 transition duration-200 filter brightness-0 invert-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]`"
                                btnBg="#07f468" btnHoverBg="black" btnText="black" btnHoverText="#07f468"
                                :loading="buttonLoaders.submitMedia" loadingSpinnerColor="text-black"
                                @click="runButtonDemo('submitMedia')" />
                            <span class="text-[10px] text-gray-400 uppercase tracking-wider">polygonLeft · Submit</span>
                            <ShowCodeToggle :code="demoSnippets.buttons.submitMedia" />
                        </div>
                    </div>
                </div>

                <!-- Dashboard analytics -->
                <div class="flex flex-col gap-3">
                    <span class="text-xs text-gray-500 uppercase tracking-wider font-semibold">Dashboard analytics</span>
                    <div class="flex flex-wrap items-start gap-6">
                        <div class="flex flex-col gap-2">
                            <DashboardPrimaryButton variant="none" text="All Orders" type="button"
                                customClass="inline-flex items-center gap-2.5 pr-2 pl-6 py-1 bg-white border border-gray-200 rounded-none [clip-path:polygon(0_100%,100%_100%,100%_0,16%_0)] shadow-sm enabled:hover:bg-gray-50 transition-colors"
                                textClass="text-blue-700 text-base font-medium"
                                :wrapperOverrides="[{target:'wrapper1', removeClass:true}, {target:'wrapper2', removeClass:true}]"
                                :loading="buttonLoaders.allOrders" loadingSpinnerColor="text-blue-700"
                                @click="runButtonDemo('allOrders')">
                                <template #rightIcon>
                                    <span class="text-blue-700 text-[10px] font-bold -translate-y-2 -ml-1">25</span>
                                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 5H13M13 5L9 1M13 5L9 9" stroke="#1D4ED8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </template>
                            </DashboardPrimaryButton>
                            <span class="text-[10px] text-gray-400 uppercase tracking-wider">none + custom · orders table</span>
                            <ShowCodeToggle :code="demoSnippets.buttons.allOrders" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <DashboardPrimaryButton variant="none" text="Trend" type="button"
                                customClass="group/button flex items-center justify-center gap-1 pl-[0.9375rem] pr-2 py-1 bg-white [clip-path:polygon(0_0,100%_0,105%_105%,16%_105%)] rounded-none border border-gray-200 enabled:hover:bg-gray-100 transition-colors"
                                textClass="text-xs font-medium text-gray-700"
                                :wrapperOverrides="[{target:'wrapper1', removeClass:true}, {target:'wrapper2', removeClass:true}]"
                                :loading="buttonLoaders.trend" loadingSpinnerColor="text-gray-700"
                                @click="runButtonDemo('trend')">
                                <template #rightIcon>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#374151" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7 17L17 7M17 7H9M17 7V15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </template>
                            </DashboardPrimaryButton>
                            <span class="text-[10px] text-gray-400 uppercase tracking-wider">none + custom · metric card</span>
                            <ShowCodeToggle :code="demoSnippets.buttons.trend" />
                        </div>
                    </div>
                </div>

                <!-- Events / add-ons / scheduling -->
                <div class="flex flex-col gap-3">
                    <span class="text-xs text-gray-500 uppercase tracking-wider font-semibold">Events / add-ons / scheduling</span>
                    <div class="flex flex-wrap items-start gap-6">
                        <div class="flex flex-col gap-2 w-full max-w-[220px]">
                            <DashboardPrimaryButton text="NEW EVENTS" variant="none" type="button"
                                customClass="group w-full h-12 min-h-10 px-4 py-2 text-base font-semibold bg-black rounded-[48px] inline-flex justify-center items-center gap-2 text-[#07F468] enabled:hover:text-black enabled:hover:bg-[#07F468]"
                                :leftIcon="plusIconUrl"
                                :leftIconClass="`w-6 h-6 transition duration-200 group-hover:[filter:brightness(0)_saturate(100%)]`"
                                :loading="buttonLoaders.newEvents" loadingSpinnerColor="text-[#07F468]"
                                @click="runButtonDemo('newEvents')" />
                            <span class="text-[10px] text-gray-400 uppercase tracking-wider">none + custom · NEW EVENTS</span>
                            <ShowCodeToggle :code="demoSnippets.buttons.newEvents" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <DashboardPrimaryButton text="PUBLISH SCHEDULE" variant="polygonLeft" type="button"
                                :leftIcon="publishScheduleIconUrl"
                                :leftIconClass="`w-6 h-6 transition duration-200 filter brightness-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]`"
                                :loading="buttonLoaders.publishSchedule" loadingSpinnerColor="text-black"
                                @click="runButtonDemo('publishSchedule')" />
                            <span class="text-[10px] text-gray-400 uppercase tracking-wider">polygonLeft · PUBLISH SCHEDULE</span>
                            <ShowCodeToggle :code="demoSnippets.buttons.publishSchedule" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <DashboardPrimaryButton text="add-on service" variant="none" type="button"
                                customClass="group bg-gray-900 flex justify-center items-center gap-2 min-w-14 px-2 py-1 text-center justify-start text-green-500 text-xs font-semibold capitalize tracking-tight enabled:hover:text-black enabled:hover:bg-[#07F468]"
                                :leftIcon="plusIconUrl"
                                :leftIconClass="`w-3 h-3 transition duration-200 group-hover:[filter:brightness(0)_saturate(100%)] rounded-sm outline outline-[1.50px] outline-offset-[-0.75px]`"
                                :loading="buttonLoaders.addonService" loadingSpinnerColor="text-white"
                                @click="runButtonDemo('addonService')" />
                            <span class="text-[10px] text-gray-400 uppercase tracking-wider">none + custom · add-on service</span>
                            <ShowCodeToggle :code="demoSnippets.buttons.addonService" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <DashboardPrimaryButton text="add-on service" variant="none" type="button"
                                customClass="group bg-gray-900 flex justify-center items-center gap-2 min-w-14 px-2 py-1 text-center justify-start text-green-500 text-xs font-semibold capitalize tracking-tight enabled:hover:text-black enabled:hover:bg-[#07F468]"
                                :leftIcon="plusSmallIconUrl"
                                :leftIconClass="`w-3 h-3 transition duration-200 group-hover:[filter:brightness(0)_saturate(100%)]`"
                                :loading="buttonLoaders.addonServiceV2" loadingSpinnerColor="text-white"
                                @click="runButtonDemo('addonServiceV2')" />
                            <span class="text-[10px] text-gray-400 uppercase tracking-wider">none + custom · add-on service v2</span>
                            <ShowCodeToggle :code="demoSnippets.buttons.addonServiceV2" />
                        </div>
                    </div>
                </div>

                <!-- TwoPieceButton variants -->
                <div class="flex flex-col gap-3">
                    <span class="text-xs text-gray-500 uppercase tracking-wider font-semibold">TwoPieceButton — variants</span>
                    <div class="flex flex-wrap items-start gap-8">
                        <div class="flex flex-col gap-2">
                            <TwoPieceButton variant="link-x" tag="button" text="Link your X account" type="button"
                                :loading="buttonLoaders.twoPieceLinkX"
                                loadingSpinnerColor="text-black"
                                @click="runButtonDemo('twoPieceLinkX')">
                                <template #icon>
                                    <img v-if="xTwoPieceUrl" :src="xTwoPieceUrl" alt="" class="w-6 h-6 brightness-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(83%)_sepia(37%)_saturate(2897%)_hue-rotate(81deg)_brightness(94%)_contrast(103%)]" />
                                </template>
                            </TwoPieceButton>
                            <span class="text-[10px] text-gray-400 uppercase tracking-wider">link-x · Settings</span>
                            <ShowCodeToggle :code="demoSnippets.buttons.twoPieceLinkX" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <TwoPieceButton variant="premium-upgrade" tag="button" text="Upgrade To Premium" textClass="text-lg font-medium text-white" type="button"
                                :loading="buttonLoaders.twoPiecePremium"
                                loadingSpinnerColor="text-white"
                                @click="runButtonDemo('twoPiecePremium')">
                                <template #icon>
                                    <img v-if="starIconUrl" :src="starIconUrl" alt="" class="w-6 h-6" />
                                </template>
                            </TwoPieceButton>
                            <span class="text-[10px] text-gray-400 uppercase tracking-wider">premium-upgrade · Settings</span>
                            <ShowCodeToggle :code="demoSnippets.buttons.twoPiecePremium" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <TwoPieceButton tag="button" variant="link-x" type="button"
                                rootClass="filter drop-shadow-[4px_3px_0px_#000000] group enabled:hover:drop-shadow-[4px_3px_0px_#FF439D] block w-max appearance-button"
                                contentWrapperClass="flex justify-center items-center gap-2.5 pl-2 pr-[20.5px] min-h-[2rem] [clip-path:polygon(calc(100%-12.5px)_0%,100%_100%,0%_100%,0%_0%)] bg-[linear-gradient(135deg,#F093FB_0%,#FF439D_100%)] group-hover:[background:black]"
                                textClass="text-lg font-medium text-black group-hover:text-[#FF439D]"
                                text="Unlock premium to upload videos"
                                :loading="buttonLoaders.twoPiecePink"
                                loadingSpinnerColor="text-white"
                                @click="runButtonDemo('twoPiecePink')" />
                            <span class="text-[10px] text-gray-400 uppercase tracking-wider">link-x (pink) · Edit Profile</span>
                            <ShowCodeToggle :code="demoSnippets.buttons.twoPiecePink" />
                        </div>
                    </div>
                </div>
            </section>

        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, defineComponent, h } from 'vue';
import { useI18n } from 'vue-i18n';

// Components
import LoadingSpinner from '@/components/ui/spinners/LoadingSpinner.vue';
import MediaCardV1 from '@/components/ui/media/media-cards/MediaCardV1.vue';
import MediaCardV2 from '@/components/ui/media/media-cards/MediaCardV2.vue';
import DashboardTextInput from '@/components/forms/inputs/DashboardTextInput.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import BaseHeading from '@/components/ui/typography/BaseHeading.vue';
import BaseParagraph from '@/components/ui/typography/BaseParagraph.vue';
import NotificationCard from '@/components/ui/card/dashboard/NotificationCard.vue';
import QuillEditor from '@/components/forms/inputs/QuillEditor.vue';
// import SubscriptionCard from '@/templates/profile/views/SubscriptionCard.vue';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import TwoPieceButton from '@/components/ui/buttons/TwoPieceButton.vue';
// Heroicons
import {
    UserIcon, InformationCircleIcon, StarIcon, EnvelopeIcon,
    ArrowDownTrayIcon, ArrowRightIcon, ShareIcon, CheckIcon, TrashIcon,
    ArrowTopRightOnSquareIcon, FilmIcon, PhotoIcon, BuildingLibraryIcon,
    BellAlertIcon, EyeIcon, EyeSlashIcon, Bars3Icon
} from '@heroicons/vue/24/outline';

const { t } = useI18n();
const { url: searchIconUrl } = useAssetUrl('icon.search');
const { url: spinnerIconUrl } = useAssetUrl('icon.spinner');
const { url: xLogoUrl } = useAssetUrl('icon.social.x.logo');
const { url: telegramIconUrl } = useAssetUrl('icon.social.telegram');
const { url: arrowRightUrl } = useAssetUrl('icon.arrow.right');
const { url: arrowLeftUrl } = useAssetUrl('icon.arrow.left');
const { url: tickCircleUrl } = useAssetUrl('icon.tick.circle');
const { url: sendIconUrl } = useAssetUrl('icon.send');
const { url: addTierIconUrl } = useAssetUrl('icon.add.tier');
const { url: polygonArrowUrl } = useAssetUrl('icon.polygon.arrow');
const { url: plusIconUrl } = useAssetUrl('icon.plus');
const { url: plusSmallIconUrl } = useAssetUrl('icon.plus.small');
const { url: publishScheduleIconUrl } = useAssetUrl('icon.publish.schedule');
const { url: starIconUrl } = useAssetUrl('icon.star');
const { url: xTwoPieceUrl } = useAssetUrl('icon.social.x.twoPiece');
const { url: demoPosterUrl } = useAssetUrl('media.demo.poster');
const { url: demoSampleBgUrl } = useAssetUrl('media.demo.sampleBg');
const { url: demoAvatarUrl } = useAssetUrl('media.demo.avatar');
const { url: demoSampleVideoUrl } = useAssetUrl('media.demo.sampleVideo');
const { url: notifFilmIconUrl } = useAssetUrl('dashboard.notification.film');
const { url: notifUploadIconUrl } = useAssetUrl('dashboard.notification.upload');
const { url: notifPlaceholderIconUrl } = useAssetUrl('dashboard.notification.placeholder');
const { url: notifSettingsIconUrl } = useAssetUrl('dashboard.notification.settings');
const { url: notifBellIconUrl } = useAssetUrl('dashboard.notification.bell');
const { url: notifDeleteIconUrl } = useAssetUrl('icon.media.menu.delete');
const { url: notifHeartIconUrl } = useAssetUrl('dashboard.notification.heart');
const { url: notifTipIconUrl } = useAssetUrl('dashboard.notification.tip');
const { url: notifCommentIconUrl } = useAssetUrl('dashboard.notification.comment');
const { url: notifUserPlaceholderIconUrl } = useAssetUrl('dashboard.notification.userPlaceholder');
const { url: tierBgUrl } = useAssetUrl('tier.demo.background');
const { url: tierButtonPinkUrl } = useAssetUrl('tier.demo.buttonBgPink');
const { url: tierButtonGreenUrl } = useAssetUrl('tier.demo.buttonBgGreen');
import TierCard from '@/components/ui/card/dashboard/TierCard.vue';
import EventCard from '@/components/ui/card/dashboard/EventCard.vue';
import Cart from '@/components/ui/cart/Cart.vue';


// ─────────────────────────────────────────────
// Inline ShowCode toggle component (no external file needed)
// ─────────────────────────────────────────────
const ShowCodeToggle = defineComponent({
    props: { code: { type: String, default: '' } },
    setup(props) {
        const open = ref(false);
        const copied = ref(false);
        const copy = async () => {
            await navigator.clipboard.writeText(props.code).catch(() => { });
            copied.value = true;
            setTimeout(() => (copied.value = false), 2000);
        };
        return () => h('div', { class: 'flex flex-col gap-0 mb-4' }, [
            h('button', {
                type: 'button',
                onClick: () => (open.value = !open.value),
                class: 'self-start flex items-center gap-1.5 text-[0.7rem] font-medium text-gray-500 hover:text-gray-800 dark:text-white/50 dark:hover:text-white/80 transition-colors mt-1 px-0 py-0',
            }, [
                h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', 'stroke-width': '1.8', stroke: 'currentColor', class: 'w-3 h-3' },
                    [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5' })]),
                open.value ? 'Hide Code' : 'Show Code',
            ]),
            open.value && h('div', { class: 'mt-2 rounded-lg overflow-hidden bg-[#1a1a1a]' }, [
                h('div', { class: 'flex justify-between items-center px-3 py-1.5 bg-[#252525]' }, [
                    h('span', { class: 'text-[0.6rem] font-mono text-white/30 uppercase tracking-wider' }, 'Vue'),
                    h('button', { type: 'button', onClick: copy, class: 'text-[0.65rem] text-white/40 hover:text-white/70 transition-colors' }, copied.value ? '✓ Copied' : 'Copy'),
                ]),
                h('pre', { class: 'p-3 overflow-x-auto text-[0.72rem] leading-relaxed text-[#d4d4d4] font-mono' },
                    h('code', {}, props.code)),
            ]),
        ]);
    },
});


const vals = reactive({
    // DashboardTextInput
    icd1: '', icd2: '', icd3: '', icd4: '', icd5: '', icd6: '',
    icd7: '', icd8: '', icd9: '', icd10: '', icd11: '', icd12: '',
    // BaseInput
    bi1: '', bi2: '', bi3: 'Readonly Text', bi4: 5, bi5: '', bi6: '', bi7: '', bi8: 'bad@', bi9: 'good@email.com', bi10: '',
    // AuthTextInput
    ia1: '', ia2: '', ia3: '', ia4: '', ia5: '', ia6: '', ia7: 'disabled text', ia8: '', ia9: '', ia10: '',
    // BaseTextInput
    id1: '', id2: '', id3: '', id4: 'bademail', id5: '', id6: '', id7: '', id8: 0, id9: '', id10: '',
    // CodeInput
    ci1: '', ci2: '', ci3: '', ci4: '', ci5: '', ci6: '',
    // CheckboxGroup
    cg1: false, cg2: true, cg3: false, cg4: true, cg5: false, cg6: false, cg7: true,
    cg8a: true, cg8b: false, cg8c: true, cg9: false, cg10: false,
    // CheckboxSwitch
    cs1: false, cs2: true, cs3: false, cs4: true, cs5: false, cs6: true, cs7: false, cs8: true,
    cs9a: true, cs9b: false, cs9c: true, cs10: false,
    // QuillEditor
    q1: '', q2: '',
    q3: t('demo.quillEditor.initialContent.simple'),
    q4: t('demo.quillEditor.initialContent.rich'),
    q5: '',
});

// ===== NotificationCard open states =====
const notifOpen = reactive({
    warning: true,
    success: true,
    info: true,
    error: true,
    notice: true,
    alert: true,
    successTeal: true,
    limitExceeded: true,
    withIcon: true,
    withoutIcon: true,
    withDescription: true,
    withoutDescription: true,
    withoutTitle: true,
    withClose: true,
    withoutClose: true,
    customIcon: true,
    withLink: true,
    withoutLink: true,
});

// ===== Media demo data (assetMap + i18n — no hardcoded URLs) =====
const myMediaList = computed(() => [
    {
        id: 1,
        type: 'video',
        videoUrl: demoSampleVideoUrl.value,
        poster: demoPosterUrl.value,
        title: t('mediaCard.demo.titles.walkInPark'),
        duration: '14:55',
        timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),
        likes: 0,
        views: 4,
        creatorName: t('mediaCard.demo.creators.creatorAllen'),
        avatar: demoAvatarUrl.value,
    },
]);

const latestMediaItem = computed(() => ({
    id: 3,
    type: 'video',
    videoUrl: demoSampleVideoUrl.value,
    poster: demoPosterUrl.value,
    title: t('mediaCard.demo.titles.mySecondComingSoon'),
    duration: '14:55',
    timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),
    likes: 0,
    views: 4,
    creatorName: t('mediaCard.demo.creators.creatorAllen'),
    avatar: demoAvatarUrl.value,
}));

const purchasedMediaItem = computed(() => ({
    id: 4,
    type: 'video',
    videoUrl: demoSampleVideoUrl.value,
    poster: demoPosterUrl.value,
    title: t('mediaCard.demo.titles.walkInParkToday'),
    duration: '14:55',
    timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),
    likes: 0,
    views: 4,
    creatorName: t('mediaCard.demo.creators.mistressJessica'),
    avatar: demoAvatarUrl.value,
}));

const gridMediaList = computed(() => [
    {
        id: 101,
        type: 'image',
        poster: demoSampleBgUrl.value,
        title: t('mediaCard.demo.titles.walkInParkMorning'),
        duration: '',
        timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),
        likes: 0,
        views: 4,
        creatorName: t('mediaCard.demo.creators.mistressJessica'),
        avatar: demoAvatarUrl.value,
    },
    {
        id: 102,
        type: 'video',
        videoUrl: demoSampleVideoUrl.value,
        poster: demoPosterUrl.value,
        title: t('mediaCard.demo.titles.walkInParkMorning'),
        duration: '14:55',
        timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),
        likes: 0,
        views: 4,
        creatorName: t('mediaCard.demo.creators.mistressJessica'),
        avatar: demoAvatarUrl.value,
    },
    {
        id: 103,
        type: 'gallery',
        poster: demoSampleBgUrl.value,
        title: t('mediaCard.demo.titles.walkInParkMorning'),
        duration: '',
        timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),
        likes: 0,
        views: 4,
        galleryCount: 7,
        creatorName: t('mediaCard.demo.creators.mistressJessica'),
        avatar: demoAvatarUrl.value,
    },
]);

const galleryCard = computed(() => ({
    id: 1,
    type: 'gallery',
    poster: demoSampleBgUrl.value,
    title: t('mediaCard.demo.titles.walkInParkMorning'),
    timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),
    likes: 0,
    views: 4,
    galleryCount: 7,
    isLocked: true,
    showTag: true,
    tagText: t('mediaCard.demo.tags.subscriberExclusive'),
    tagColor: 'green',
}));

const imageCard = computed(() => ({
    id: 2,
    type: 'image',
    poster: demoSampleBgUrl.value,
    title: t('mediaCard.demo.titles.walkInParkMorning'),
    timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),
    likes: 0,
    views: 4,
    isLocked: false,
    showTag: true,
    tagText: t('mediaCard.demo.tags.subscribeOrBuy'),
    tagColor: 'pink',
}));

const videoCard = computed(() => ({
    id: 3,
    type: 'video',
    videoUrl: demoSampleVideoUrl.value,
    poster: demoPosterUrl.value,
    title: t('mediaCard.demo.titles.walkInParkMorning'),
    duration: '14:55',
    timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),
    likes: 0,
    views: 4,
    isLocked: true,
    showTag: false,
    tagText: '',
    tagColor: 'green',
}));

// ===== TierCard demo data (assetMap + i18n) =====
const demoTierList = computed(() => {
    const plans = [
        { id: '1d', label: t('tierCard.demo.plans.oneDay'), price: '55.86', discount: null },
        { id: '1m', label: t('tierCard.demo.plans.oneMonth'), price: '55.86', discount: '-5%' },
        { id: '6m', label: t('tierCard.demo.plans.sixMonth'), price: '55.86', discount: '-50%', isMostValue: true },
        { id: '1y', label: t('tierCard.demo.plans.oneYear'), price: '55.86', discount: '-5%' },
    ];

    const flashSale = {
        active: true,
        endsIn: t('tierCard.demo.flashSale.endsIn'),
        originalPrice: t('tierCard.demo.flashSale.originalPrice'),
    };

    const pinkTheme = {
        textPrimary: '#FB0464',
        textSecondary: 'text-[#FFED29] dark:text-[#ffee37]',
        shadow: 'shadow-[0px_0px_80px_0px_#FF8FBA40,0px_0px_8px_0px_#FF8FBA40]',
        barColor: 'bg-[#FB0464] dark:bg-[#c90350]',
        barTextColor: 'text-[#FFED29]',
        featuredBg: 'bg-[#FB0464] dark:bg-[#c90350]',
        buttonBgImage: `url('${tierButtonPinkUrl.value}')`,
        flashLabel: 'text-white dark:text-[#e8e6e3]',
        flashText: '#FB0464',
        textReNew: 'text-white dark:text-[#e8e6e3]',
        featuredText: 'text-white dark:text-[#e8e6e3]',
    };

    const goldTheme = {
        ...pinkTheme,
        textPrimary: 'text-[#FFED29]',
        shadow: 'shadow-[0px_0px_80px_0px_#FFED2940,0px_0px_8px_0px_#FFED2980]',
        barColor: 'bg-[#ffffff]',
    };

    const greenTheme = {
        textPrimary: 'text-[#07F468] dark:text-[#06c454]',
        textSecondary: 'text-[#FFED29] dark:text-[#FFED29]',
        shadow: 'shadow-[0px_0px_80px_0px_#07F46840,0px_0px_8px_0px_#07F46880]',
        barColor: 'bg-[#FFED29] dark:bg-[#ffee37]',
        barTextColor: 'text-[#FFED29]',
        featuredBg: 'bg-black dark:bg-[#181a1b]',
        buttonBgImage: `url('${tierButtonGreenUrl.value}')`,
        flashLabel: 'text-[#07F468] dark:text-[#06c454]',
        flashText: '#07F468',
        textReNew: 'text-white dark:text-[#e8e6e3]',
        featuredText: 'text-[#07F468] dark:text-[#06c454]',
    };

    const base = {
        title: t('tierCard.demo.title'),
        backgroundImage: tierBgUrl.value,
        stats: { video: 100, image: 80, audio: 70 },
        plans,
        defaultPlan: '6m',
        flashSale,
        description: t('tierCard.demo.description'),
    };

    return [
        {
            id: 1,
            labelKey: 'tierCard.demo.labels.tier1StandardClaim',
            ...base,
            isFeatured: true,
            theme: pinkTheme,
            footer: {
                type: 'standard',
                buttonText: t('tierCard.demo.footer.claimOffer'),
                progress: {
                    visible: true,
                    width: '5%',
                    leftText: t('tierCard.demo.footer.fiveLeft'),
                    rightText: t('tierCard.demo.footer.offerProgressLow'),
                },
            },
        },
        {
            id: 2,
            labelKey: 'tierCard.demo.labels.tier2SpendToClaim',
            ...base,
            isFeatured: true,
            theme: goldTheme,
            footer: {
                type: 'spend',
                buttonText: t('tierCard.demo.footer.claimOffer'),
                progress: {
                    visible: true,
                    width: '80%',
                    leftText: t('tierCard.demo.footer.spendMore'),
                    rightText: t('tierCard.demo.footer.spendProgress'),
                },
            },
        },
        {
            id: 3,
            labelKey: 'tierCard.demo.labels.tier3Standard95Left',
            ...base,
            isFeatured: true,
            theme: { ...pinkTheme, barTextColor: 'text-[#FB0464]' },
            footer: {
                type: 'standard',
                buttonText: t('tierCard.demo.footer.claimOffer'),
                progress: {
                    visible: true,
                    width: '95%',
                    leftText: t('tierCard.demo.footer.ninetyFiveLeft'),
                    rightText: t('tierCard.demo.footer.offerProgressHigh'),
                },
            },
        },
        {
            id: 4,
            labelKey: 'tierCard.demo.labels.tier4HiddenProgress',
            ...base,
            isFeatured: true,
            theme: { ...pinkTheme, barColor: 'bg-[#FFED29] dark:bg-[#ffee37]' },
            footer: {
                type: 'hidden',
                buttonText: t('tierCard.demo.footer.claimOffer'),
                progress: { visible: false },
            },
        },
        {
            id: 5,
            labelKey: 'tierCard.demo.labels.tier5SubscribeGreen',
            ...base,
            isFeatured: false,
            theme: greenTheme,
            footer: {
                type: 'subscribe',
                buttonText: t('tierCard.demo.footer.subscribe'),
                progress: { visible: false },
            },
        },
    ];
});

// ===== EventCard demo config =====
const demoEventCards = [
    { id: 'orangeButton', theme: 'orange', hasButton: true, labelKey: 'eventCard.demo.labels.orangeButton' },
    { id: 'orangeProgress', theme: 'orange', hasButton: false, labelKey: 'eventCard.demo.labels.orangeProgress' },
    { id: 'pinkButton', theme: 'pink', hasButton: true, labelKey: 'eventCard.demo.labels.pinkButton' },
    { id: 'pinkProgress', theme: 'pink', hasButton: false, labelKey: 'eventCard.demo.labels.pinkProgress' },
];

// ===== Subscription card data =====
const cards = ref([
    {
        id: 1,
        title: 'FEATURED library of LOREM LPSUM ATIER dolor sit amet, consectetur adipiscing elit.',
        price: '30.99',
        oldPrice: '999.99',
        followers: '30',
        videos: '12',
        photos: '45',
        mediaCount: '5',
        image: 'https://i.ibb.co.com/5WQ43b48/sample-bg-image-compressed.webp',
        features: [
            '<span class="font-semibold text-[#FF0066]">10 free tokens</span> each month',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Merchandise',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Custom Request',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Pay to View videos'
        ],
        fullDescription: `Watch all of my mango eating content! content update weekly!<br><br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing`,
    },
    {
        id: 2,
        title: 'FEATURED library of LOREM LPSUM ATIER dolor sit amet, consectetur adipiscing elit.',
        price: '499.99',
        oldPrice: '999.99',
        followers: 'No',
        videos: '0',
        photos: '0',
        mediaCount: '5',
        isFeatured: true,
        image: 'https://i.ibb.co.com/Kx9QDc68/auth-bg-compressed.webp',
        features: [
            '<span class="font-semibold text-[#FF0066]">10 free tokens</span> each month',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Merchandise',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Custom Request',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Pay to View videos'
        ],
        fullDescription: `Watch all of my mango eating content! content update weekly!<br><br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing`,
    },
    {
        id: 3,
        title: 'Library of LOREM LPSUM ATIER dolor sit amet, consectetur adipiscing elit.',
        price: '99.99',
        oldPrice: '999.99',
        followers: '30',
        videos: '0',
        photos: '0',
        mediaCount: '5',
        isCurrentSubscription: true,
        image: 'https://i.ibb.co.com/LXPfFX03/profile-slidein-bg.webp',
        features: [
            '<span class="font-semibold text-[#FF0066]">10 free tokens</span> each month',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Merchandise',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Custom Request',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Pay to View videos'
        ],
        fullDescription: `Watch all of my mango eating content! content update weekly!<br><br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing`,
    },
    {
        id: 4,
        title: 'FEATURED library of LOREM LPSUM ATIER dolor sit amet, consectetur adipiscing elit.',
        price: '30.99',
        oldPrice: '999.99',
        followers: '30',
        videos: '0',
        photos: '0',
        mediaCount: '5',
        
        image: 'https://i.ibb.co.com/SwFy98RJ/checkout-header.webp',
        features: [
            '<span class="font-semibold text-[#FF0066]">10 free tokens</span> each month',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Merchandise',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Custom Request',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Pay to View videos'
        ],
        fullDescription: `Watch all of my mango eating content! content update weekly!<br><br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing`,
    },
    {
        id: 5,
        title: 'FEATURED library of LOREM LPSUM ATIER dolor sit amet, consectetur adipiscing elit.',
        price: '30.99',
        oldPrice: '999.99',
        followers: '30',
        videos: '0',
        photos: '0',
        mediaCount: '5',
        image: 'https://i.ibb.co.com/7sWfvWC/hero-image-blue.webp',
        features: [
            '<span class="font-semibold text-[#FF0066]">10 free tokens</span> each month',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Merchandise',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Custom Request',
            '<span class="font-semibold text-[#FF0066]">10% off</span> on all Pay to View videos'
        ],
        fullDescription: `Watch all of my mango eating content! content update weekly!<br><br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing<br>
        • 100% real content<br>
        • no editing`,
    }
]);

const handleCardAction = (card) => {
    alert(`Action triggered for: ${card.title}`);
};

const demoSnippets = {
    mediaV1: {
        myMedia: `<!-- Template -->\n<MediaCardV1 \n  v-for="item in myMediaList" \n  :key="item.id" \n  :media="item" \n  variant="default" \n  @menu-action="handleAction" \n/>\n\n<!-- Script Data -->\nconst { url: demoPosterUrl } = useAssetUrl('media.demo.poster');\nconst { url: demoAvatarUrl } = useAssetUrl('media.demo.avatar');\nconst { url: demoSampleVideoUrl } = useAssetUrl('media.demo.sampleVideo');\n\nconst myMediaList = computed(() => [{\n  id: 1,\n  type: 'video',\n  videoUrl: demoSampleVideoUrl.value,\n  poster: demoPosterUrl.value,\n  title: t('mediaCard.demo.titles.walkInPark'),\n  duration: '14:55',\n  timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),\n  likes: 0,\n  views: 4,\n  creatorName: t('mediaCard.demo.creators.creatorAllen'),\n  avatar: demoAvatarUrl.value,\n}]);\n\nconst handleAction = (action) => {\n  console.log("Action triggered:", action);\n};`,
        resume: `<!-- Template -->\n<MediaCardV1 \n  :media="myMediaList[0]" \n  variant="resume" \n/>`,
        latest: `<!-- Template -->\n<MediaCardV1 \n  :media="latestMediaItem" \n  variant="latest" \n/>\n\n<!-- Script Data -->\nconst latestMediaItem = computed(() => ({\n  id: 3,\n  type: 'video',\n  videoUrl: demoSampleVideoUrl.value,\n  poster: demoPosterUrl.value,\n  title: t('mediaCard.demo.titles.mySecondComingSoon'),\n  duration: '14:55',\n  timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),\n  likes: 0,\n  views: 4,\n  creatorName: t('mediaCard.demo.creators.creatorAllen'),\n  avatar: demoAvatarUrl.value,\n}));`,
        purchased: `<!-- Template -->\n<MediaCardV1 \n  :media="purchasedMediaItem" \n  variant="purchased" \n  @menu-action="handleAction" \n/>\n\n<!-- Script Data -->\nconst purchasedMediaItem = computed(() => ({\n  id: 4,\n  type: 'video',\n  videoUrl: demoSampleVideoUrl.value,\n  poster: demoPosterUrl.value,\n  title: t('mediaCard.demo.titles.walkInParkToday'),\n  duration: '14:55',\n  timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),\n  likes: 0,\n  views: 4,\n  creatorName: t('mediaCard.demo.creators.mistressJessica'),\n  avatar: demoAvatarUrl.value,\n}));`,
        gridView: `<!-- Template -->\n<MediaCardV1 \n  v-for="item in gridMediaList" \n  :key="item.id" \n  :media="item" \n  variant="grid" \n  @menu-action="handleAction" \n/>\n\n<!-- Script Data -->\nconst { url: demoSampleBgUrl } = useAssetUrl('media.demo.sampleBg');\n\nconst gridMediaList = computed(() => [{\n  id: 101,\n  type: 'image',\n  poster: demoSampleBgUrl.value,\n  title: t('mediaCard.demo.titles.walkInParkMorning'),\n  timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),\n  likes: 0,\n  views: 4,\n  creatorName: t('mediaCard.demo.creators.mistressJessica'),\n  avatar: demoAvatarUrl.value,\n}, {\n  id: 102,\n  type: 'video',\n  videoUrl: demoSampleVideoUrl.value,\n  poster: demoPosterUrl.value,\n  title: t('mediaCard.demo.titles.walkInParkMorning'),\n  duration: '14:55',\n  timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),\n  likes: 0,\n  views: 4,\n  creatorName: t('mediaCard.demo.creators.mistressJessica'),\n  avatar: demoAvatarUrl.value,\n}]);`,
    },
    mediaV2: {
        gallery: `<!-- Template -->\n<MediaCardV2 :media="galleryCard" />\n\n<!-- Script Data -->\nconst { url: demoSampleBgUrl } = useAssetUrl('media.demo.sampleBg');\n\nconst galleryCard = computed(() => ({\n  id: 1,\n  type: 'gallery',\n  poster: demoSampleBgUrl.value,\n  title: t('mediaCard.demo.titles.walkInParkMorning'),\n  timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),\n  likes: 0,\n  views: 4,\n  galleryCount: 7,\n  isLocked: true,\n  showTag: true,\n  tagText: t('mediaCard.demo.tags.subscriberExclusive'),\n  tagColor: 'green'\n}));`,
        image: `<!-- Template -->\n<MediaCardV2 :media="imageCard" />\n\n<!-- Script Data -->\nconst imageCard = computed(() => ({\n  id: 2,\n  type: 'image',\n  poster: demoSampleBgUrl.value,\n  title: t('mediaCard.demo.titles.walkInParkMorning'),\n  timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),\n  likes: 0,\n  views: 4,\n  isLocked: false,\n  showTag: true,\n  tagText: t('mediaCard.demo.tags.subscribeOrBuy'),\n  tagColor: 'pink'\n}));`,
        video: `<!-- Template -->\n<MediaCardV2 :media="videoCard" />\n\n<!-- Script Data -->\nconst { url: demoPosterUrl } = useAssetUrl('media.demo.poster');\nconst { url: demoSampleVideoUrl } = useAssetUrl('media.demo.sampleVideo');\n\nconst videoCard = computed(() => ({\n  id: 3,\n  type: 'video',\n  videoUrl: demoSampleVideoUrl.value,\n  poster: demoPosterUrl.value,\n  title: t('mediaCard.demo.titles.walkInParkMorning'),\n  duration: '14:55',\n  timeAgo: t('mediaCard.demo.timeAgo.fiveMonths'),\n  likes: 0,\n  views: 4,\n  isLocked: true,\n  showTag: false,\n  tagText: '',\n  tagColor: 'green'\n}));`,
    },
    heading: {
        h1Primary: `<BaseHeading \n  text="Primary H1" \n  tag="h1" \n  theme="defaultPrimaryHeading" \n  version="basic" \n  class="!text-black" \n/>`,
        h2Secondary: `<BaseHeading \n  text="Secondary H2" \n  tag="h2" \n  theme="defaultSecondaryHeading" \n  version="basic" \n  class="!text-black" \n/>`,
        h3Section: `<BaseHeading \n  text="Section H3" \n  tag="h3" \n  theme="sectionHeading" \n  version="basic" \n  class="!text-black" \n/>`,
        h2Dashboard: `<BaseHeading \n  text="Dashboard Title" \n  tag="h2" \n  theme="dashboardHeading" \n  version="basic" \n/>`,
        h2Auth: `<BaseHeading \n  text="Login" \n  tag="h2" \n  theme="AuthHeading" \n  version="basic" \n  class="!text-black" \n/>`,
        h4Form: `<BaseHeading \n  text="Profile Settings" \n  tag="h4" \n  theme="formHeading" \n  version="basic" \n/>`,
        h1Demo: `<BaseHeading \n  text="Demo H1 Bold" \n  tag="h1" \n  theme="demoHeadings" \n  version="basic" \n/>`,
        h3Demo: `<BaseHeading \n  text="Demo H3 Medium" \n  tag="h3" \n  theme="demoHeadings" \n  version="basic" \n/>`,
        withIcon: `<BaseHeading \n  text="With Icon" \n  tag="h3" \n  theme="defaultSecondaryHeading" \n  version="basic" \n  class="!text-black" \n  :leftIcon="StarIcon" \n/>`,
        order: `<BaseHeading \n  text="Order #1234" \n  tag="h1" \n  theme="orderHeading" \n  version="basic" \n/>`,
    },
    paragraph: {
        default: `<BaseParagraph \n  text="This is a default paragraph with standard styling." \n  class="!text-black" \n/>`,
        small: `<BaseParagraph \n  text="Small text paragraph for captions." \n  class="!text-black text-sm" \n/>`,
        large: `<BaseParagraph \n  text="Large paragraph text." \n  class="!text-black text-xl" \n/>`,
        bold: `<BaseParagraph \n  text="Bold paragraph text." \n  class="!text-black font-bold" \n/>`,
        blue: `<BaseParagraph \n  text="Blue paragraph text." \n  fontColor="text-blue-600" \n/>`,
        error: `<BaseParagraph \n  text="This field is required." \n  fontColor="text-red-500" \n  fontSize="text-sm" \n/>`,
        success: `<BaseParagraph \n  text="Action successful!" \n  fontColor="text-green-600" \n  fontWeight="font-medium" \n/>`,
        italic: `<BaseParagraph \n  text="Italic paragraph text for notes." \n  fontFamily="italic" \n  fontColor="text-gray-500" \n/>`,
        withIcon: `<BaseParagraph \n  text="Info message here" \n  :leftIcon="InformationCircleIcon" \n  fontSize="text-sm" \n  fontColor="text-blue-600" \n/>`,
        xs: `<BaseParagraph \n  text="Helper text displayed below the input field." \n  fontSize="text-xs" \n  fontColor="text-gray-400" \n/>`,
    },
    icd: {
        withLabelDescPlaceholder: `<DashboardTextInput \n  v-model="inputs.username" \n  :placeholder="$t('demo.dashboardTextInput.usernamePlaceholder')" \n  showLabel \n  :labelText="$t('demo.dashboardTextInput.username')" \n  :description="$t('demo.dashboardTextInput.usernameDescription')" \n/>`,
        withLabelPlaceholder: `<DashboardTextInput \n  v-model="inputs.email" \n  :placeholder="$t('demo.dashboardTextInput.emailPlaceholder')" \n  showLabel \n  :labelText="$t('demo.dashboardTextInput.email')" \n/>`,
        withLabelNoPlaceholder: `<DashboardTextInput \n  v-model="inputs.firstName" \n  showLabel \n  :labelText="$t('demo.dashboardTextInput.firstName')" \n/>`,
        noLabelWithPlaceholder: `<DashboardTextInput \n  v-model="inputs.noLabel" \n  :placeholder="$t('demo.dashboardTextInput.noLabelPlaceholder')" \n/>`,
        plain: `<DashboardTextInput v-model="inputs.plain" />`,
        title: `<DashboardTextInput \n  v-model="inputs.title" \n  :placeholder="$t('booking.eventTitlePlaceholder')" \n  showLabel \n  :labelText="$t('demo.dashboardTextInput.title')" \n/>`,
        searchLeftIcon: `<DashboardTextInput \n  v-model="inputs.search" \n  :placeholder="$t('common.searchByUsernameEmail')" \n  showLabel \n  :labelText="$t('booking.coPerformerOptional')" \n  :left-icon="searchIconUrl" \n  optionalLabel \n  :optionalLabelText="$t('common.optional')" \n/>\n\n<!-- Script -->\nconst { url: searchIconUrl } = useAssetUrl('icon.search');`,
        noIcon: `<DashboardTextInput \n  v-model="inputs.noIcon" \n  :placeholder="$t('demo.dashboardTextInput.plainNoIconsPlaceholder')" \n  showLabel \n  :labelText="$t('demo.dashboardTextInput.displayName')" \n/>`,
        rightIcon: `<DashboardTextInput \n  v-model="inputs.emailSupport" \n  :placeholder="$t('demo.dashboardTextInput.enterEmailPlaceholder')" \n  showLabel \n  :labelText="$t('demo.dashboardTextInput.emailSupport')" \n  autocomplete="email" \n  :rightIcon="EnvelopeIcon" \n/>\n\n<!-- Script -->\nimport { EnvelopeIcon } from '@heroicons/vue/24/outline';`,
        autofill: `<DashboardTextInput \n  v-model="inputs.autofillEmail" \n  :placeholder="$t('demo.dashboardTextInput.enterEmailPlaceholder')" \n  showLabel \n  :labelText="$t('demo.dashboardTextInput.email')" \n  autocomplete="email" \n  name="email" \n/>`,
        requiredStar: `<DashboardTextInput \n  v-model="inputs.requiredStar" \n  :placeholder="$t('demo.dashboardTextInput.requiredPlaceholder')" \n  showLabel \n  :labelText="$t('demo.dashboardTextInput.fullName')" \n  requiredDisplay="*" \n/>`,
        requiredText: `<DashboardTextInput \n  v-model="inputs.requiredText" \n  :placeholder="$t('demo.dashboardTextInput.requiredPlaceholder')" \n  showLabel \n  :labelText="$t('demo.dashboardTextInput.emailAddress')" \n  requiredDisplay="italic-text" \n/>`,
        bothIcons: `<DashboardTextInput \n  v-model="inputs.advancedSearch" \n  :placeholder="$t('demo.dashboardTextInput.searchFiltersPlaceholder')" \n  showLabel \n  :labelText="$t('demo.dashboardTextInput.advancedSearch')" \n  :leftIcon="searchIconUrl" \n  :rightIcon="Bars3Icon" \n  clickableRightIcon \n/>`,
        textarea: `<DashboardTextInput \n  type="textarea" \n  show-label \n  v-model="inputs.bio" \n  textAreaRows="3" \n  :labelText="$t('demo.dashboardTextInput.bio')" \n  :placeholder="$t('common.descriptionOptional')" \n  :maxLength="200" \n/>`,
        textareaWithDesc: `<DashboardTextInput \n  type="textarea" \n  show-label \n  v-model="inputs.tipMessage" \n  textAreaRows="3" \n  :labelText="$t('demo.dashboardTextInput.tipMessage')" \n  :placeholder="$t('demo.dashboardTextInput.tipMessagePlaceholder')" \n  :description="$t('demo.dashboardTextInput.tipMessageDescription')" \n  :maxLength="200" \n/>`,
        bookingEventTitle: `<DashboardTextInput \n  v-model="inputs.eventTitle" \n  :placeholder="$t('booking.eventTitlePlaceholder')" \n/>`,
        bookingCoPerformer: `<DashboardTextInput \n  v-model="inputs.coPerformerSearch" \n  :placeholder="$t('common.searchByUsernameEmail')" \n  showLabel \n  :labelText="$t('booking.coPerformerOptional')" \n  :left-icon="searchIconUrl" \n  optionalLabel \n  :optionalLabelText="$t('common.optional')" \n/>`,
        bookingDuration: `<div class="flex flex-col gap-1.5 w-full">\n  <span class="text-sm font-medium text-[#667085]">{{ $t('booking.sessionDuration') }}</span>\n  <div class="flex items-center gap-2">\n    <div class="w-44 shrink-0">\n      <DashboardTextInput v-model="inputs.duration" type="number" />\n    </div>\n    <span class="text-base font-medium whitespace-nowrap">{{ $t('booking.minutes') }}</span>\n  </div>\n</div>`,
        numberStepper: `<DashboardTextInput \n  v-model="inputs.quantity" \n  type="number" \n  showLabel \n  :labelText="$t('demo.dashboardTextInput.quantity')" \n/>`,
        numberNoControls: `<DashboardTextInput \n  v-model="inputs.age" \n  type="number" \n  showLabel \n  :labelText="$t('demo.dashboardTextInput.age')" \n  :showControls="false" \n/>`,
        bookingBasePrice: `<div class="flex flex-col gap-1.5 w-full">\n  <span class="text-sm font-medium text-[#667085]">{{ $t('booking.basePrice') }}</span>\n  <div class="flex items-center gap-2">\n    <div class="w-44 shrink-0">\n      <DashboardTextInput v-model="inputs.basePrice" type="number" />\n    </div>\n    <div class="flex items-center gap-2 whitespace-nowrap">\n      <span class="text-base font-medium">{{ $t('common.tokens') }}</span>\n      <span class="text-base font-normal">{{ $t('booking.perSession') }}</span>\n    </div>\n  </div>\n</div>`,
        bookingLeftSpan: `<DashboardTextInput \n  v-model="inputs.originalPrice" \n  type="number" \n  showLabel \n  :labelText="$t('booking.originalPrice')" \n  leftSpan \n  :leftSpanText="$t('demo.dashboardTextInput.usdPrefix')" \n  :description="$t('booking.priceRangeDescription')" \n/>`,
        bookingTooltip: `<DashboardTextInput \n  v-model="inputs.bookingFee" \n  type="number" \n  showLabel \n  :labelText="$t('booking.bookingFee')" \n  showTooltip \n  :tooltipText="$t('booking.bookingFeeTooltip')" \n  :tooltipIcon="InformationCircleIcon" \n/>`,
        bookingOffHour: `<div class="flex flex-col gap-1.5 w-full">\n  <span class="text-sm font-medium text-[#667085]">{{ $t('booking.offHourSurcharge') }}</span>\n  <div class="flex items-center gap-2">\n    <div class="w-44 shrink-0">\n      <DashboardTextInput v-model="inputs.offHourSurcharge" type="number" />\n    </div>\n    <span class="text-base font-medium whitespace-nowrap">{{ $t('booking.percentFromBasePrice') }}</span>\n  </div>\n</div>`,
        bookingDisabled: `<div class="flex flex-col gap-1.5 w-full opacity-50">\n  <span class="text-sm font-medium text-[#667085]">{{ $t('booking.maximumSessionAllowed') }}</span>\n  <div class="flex items-center gap-2">\n    <div class="w-44 shrink-0">\n      <DashboardTextInput v-model="inputs.maxSessionDuration" type="number" disabled />\n    </div>\n    <span class="text-base font-medium whitespace-nowrap">{{ $t('booking.sessions') }}</span>\n  </div>\n</div>`,
        bookingErrors: `<DashboardTextInput \n  v-model="inputs.eventTitleValidated" \n  showLabel \n  :labelText="$t('booking.eventTitlePlaceholder')" \n  :placeholder="$t('booking.eventTitlePlaceholder')" \n  showErrors \n  :errors="[{ message: $t('booking.validationEventTitleRequired') }]" \n/>`,
        bookingRequiredError: `<DashboardTextInput \n  v-model="inputs.requiredErrorField" \n  showLabel \n  :labelText="$t('booking.eventTitlePlaceholder')" \n  requiredDisplay="required-text-error" \n/>`,
        bookingSuccess: `<DashboardTextInput \n  v-model="inputs.successField" \n  showLabel \n  :labelText="$t('demo.dashboardTextInput.username')" \n  onSuccess \n  :success="[{ message: $t('demo.dashboardTextInput.usernameAvailable') }]" \n/>`,
        bookingRemindMe: `<div class="flex flex-wrap items-center gap-2">\n  <span class="text-base font-normal whitespace-nowrap">{{ $t('booking.remindMe') }}</span>\n  <div class="w-44 shrink-0">\n    <DashboardTextInput v-model="inputs.remindMeTime" type="number" />\n  </div>\n  <span class="text-base font-normal">{{ $t('booking.minutesBeforeCall') }} {{ $t('booking.scheduledCall') }}</span>\n</div>`,
    },
    notification: {
        warning: `<NotificationCard \n  variant="warning" \n  :title="t('notificationCard.demo.titles.mediaRequired')" \n  :description="t('notificationCard.demo.descriptions.mediaRequired')" \n  :icon="notifFilmIconUrl" \n  :badgeIcon="notifUploadIconUrl" \n  v-model="notifOpen.warning" \n/>\n\n<!-- Script -->\nconst { url: notifFilmIconUrl } = useAssetUrl('dashboard.notification.film');\nconst { url: notifUploadIconUrl } = useAssetUrl('dashboard.notification.upload');`,
        success: `<NotificationCard \n  variant="success" \n  :title="t('notificationCard.demo.titles.congratulations')" \n  :description="t('notificationCard.demo.descriptions.mediaApproved')" \n  :icon="notifPlaceholderIconUrl" \n  :badgeIcon="tickCircleUrl" \n  v-model="notifOpen.success" \n/>\n\n<!-- Script -->\nconst { url: notifPlaceholderIconUrl } = useAssetUrl('dashboard.notification.placeholder');\nconst { url: tickCircleUrl } = useAssetUrl('icon.tick.circle');`,
        info: `<NotificationCard \n  variant="info" \n  :title="t('notificationCard.demo.titles.bankDetails')" \n  :description="t('notificationCard.demo.descriptions.bankDetails')" \n  :icon="notifSettingsIconUrl" \n  :badgeIcon="notifSettingsIconUrl" \n  v-model="notifOpen.info" \n/>\n\n<!-- Script -->\nconst { url: notifSettingsIconUrl } = useAssetUrl('dashboard.notification.settings');`,
        error: `<NotificationCard \n  variant="error" \n  :title="t('notificationCard.demo.titles.actionRequired')" \n  :description="t('notificationCard.demo.descriptions.securityUpdate')" \n  :icon="notifBellIconUrl" \n  :badgeIcon="notifDeleteIconUrl" \n  v-model="notifOpen.error" \n/>\n\n<!-- Script -->\nconst { url: notifBellIconUrl } = useAssetUrl('dashboard.notification.bell');\nconst { url: notifDeleteIconUrl } = useAssetUrl('icon.media.menu.delete');`,
        notice: `<NotificationCard \n  variant="notice" \n  :title="t('notificationCard.demo.titles.unsavedChanges')" \n  :description="t('notificationCard.demo.descriptions.unsavedChanges')" \n  :icon="notifHeartIconUrl" \n  :badgeIcon="notifTipIconUrl" \n  v-model="notifOpen.notice" \n/>\n\n<!-- Script -->\nconst { url: notifHeartIconUrl } = useAssetUrl('dashboard.notification.heart');\nconst { url: notifTipIconUrl } = useAssetUrl('dashboard.notification.tip');`,
        alert: `<NotificationCard \n  variant="alert" \n  :title="t('notificationCard.demo.titles.activeSubscribers')" \n  :description="t('notificationCard.demo.descriptions.activeSubscribers')" \n  :icon="notifCommentIconUrl" \n  v-model="notifOpen.alert" \n/>`,
        successTeal: `<NotificationCard \n  variant="success-teal" \n  :title="t('notificationCard.demo.titles.profileUpdated')" \n  :description="t('notificationCard.demo.descriptions.profileUpdated')" \n  :icon="notifHeartIconUrl" \n  v-model="notifOpen.successTeal" \n/>`,
        limitExceeded: `<NotificationCard \n  variant="limit-exceeded" \n  :title="t('notificationCard.demo.titles.uploadLimit')" \n  :description="t('notificationCard.demo.descriptions.uploadLimit')" \n  :icon="notifBellIconUrl" \n  v-model="notifOpen.limitExceeded" \n/>`,
        withIcon: `<NotificationCard \n  variant="info" \n  :title="t('notificationCard.demo.titles.bankDetails')" \n  :description="t('notificationCard.demo.descriptions.bankDetails')" \n  :icon="notifSettingsIconUrl" \n  v-model="notifOpen.withIcon" \n/>`,
        withoutIcon: `<NotificationCard \n  variant="alert" \n  :showIcon="false" \n  :title="t('notificationCard.demo.titles.activeSubscribers')" \n  :description="t('notificationCard.demo.descriptions.activeSubscribers')" \n  v-model="notifOpen.withoutIcon" \n/>`,
        withDescription: `<NotificationCard \n  variant="success" \n  :title="t('notificationCard.demo.titles.congratulations')" \n  :description="t('notificationCard.demo.descriptions.mediaApproved')" \n  :icon="notifPlaceholderIconUrl" \n  v-model="notifOpen.withDescription" \n/>`,
        withoutDescription: `<NotificationCard \n  variant="notice" \n  :title="t('notificationCard.demo.titles.titleOnly')" \n  :icon="notifHeartIconUrl" \n  v-model="notifOpen.withoutDescription" \n/>`,
        withoutTitle: `<NotificationCard \n  variant="info" \n  :description="t('notificationCard.demo.descriptions.completeProfile')" \n  :icon="notifUserPlaceholderIconUrl" \n  v-model="notifOpen.withoutTitle" \n/>`,
        withClose: `<NotificationCard \n  variant="info" \n  :title="t('notificationCard.demo.titles.bankDetails')" \n  :description="t('notificationCard.demo.descriptions.bankDetails')" \n  :icon="notifSettingsIconUrl" \n  :closable="true" \n  v-model="notifOpen.withClose" \n/>`,
        withoutClose: `<NotificationCard \n  variant="notice" \n  :title="t('notificationCard.demo.titles.unsavedChanges')" \n  :description="t('notificationCard.demo.descriptions.unsavedChanges')" \n  :icon="notifHeartIconUrl" \n  :closable="false" \n  v-model="notifOpen.withoutClose" \n/>`,
        customIcon: `<NotificationCard \n  variant="success-teal" \n  :title="t('notificationCard.demo.titles.profileUpdated')" \n  :description="t('notificationCard.demo.descriptions.profileUpdated')" \n  :icon="notifHeartIconUrl" \n  :badgeIcon="notifTipIconUrl" \n  v-model="notifOpen.customIcon" \n/>\n\n<!-- Custom icon via assetMap URL string (not Heroicon component) -->`,
        withLink: `<NotificationCard \n  variant="notice" \n  :title="t('notificationCard.demo.titles.connectX')" \n  :description="t('notificationCard.demo.descriptions.connectX')" \n  :icon="notifCommentIconUrl" \n  :linkLabel="t('notificationCard.demo.links.connectNow')" \n  linkHref="#" \n  v-model="notifOpen.withLink" \n/>`,
        withoutLink: `<NotificationCard \n  variant="info" \n  :title="t('notificationCard.demo.titles.titleOnly')" \n  :description="t('notificationCard.demo.descriptions.completeProfile')" \n  :icon="notifUserPlaceholderIconUrl" \n  v-model="notifOpen.withoutLink" \n/>`,
    },
    quill: {
        default: `<!-- Template -->\n<QuillEditor v-model="editorContent" />\n\n<!-- Script -->\nimport { ref } from 'vue';\nimport QuillEditor from '@/components/forms/inputs/QuillEditor.vue';\n\nconst editorContent = ref('');\n\n<!-- Notes -->\n// v-model stores HTML string (innerHTML)\n// Default placeholder: "Description..."\n// Toolbar: bold, italic, link, ordered list, bullet list`,
        customPlaceholder: `<!-- Template -->\n<QuillEditor \n  v-model="tierDescription" \n  :placeholder="t('demo.quillEditor.placeholders.tierDescription')" \n/>\n\n<!-- Script -->\nimport { ref } from 'vue';\nimport { useI18n } from 'vue-i18n';\nimport QuillEditor from '@/components/forms/inputs/QuillEditor.vue';\n\nconst { t } = useI18n();\nconst tierDescription = ref('');`,
        initialContent: `<!-- Template -->\n<QuillEditor v-model="editorContent" />\n\n<!-- Script -->\nimport { ref } from 'vue';\nimport { useI18n } from 'vue-i18n';\nimport QuillEditor from '@/components/forms/inputs/QuillEditor.vue';\n\nconst { t } = useI18n();\nconst editorContent = ref(t('demo.quillEditor.initialContent.simple'));\n\n<!-- Example value -->\n// "<p><strong>Hello World!</strong> This is pre-loaded content.</p>"`,
        richInitialContent: `<!-- Template -->\n<QuillEditor v-model="editorContent" />\n\n<!-- Script -->\nimport { ref } from 'vue';\nimport { useI18n } from 'vue-i18n';\nimport QuillEditor from '@/components/forms/inputs/QuillEditor.vue';\n\nconst { t } = useI18n();\nconst editorContent = ref(t('demo.quillEditor.initialContent.rich'));\n\n<!-- Supports formatted HTML: bold, italic, links, ul/ol -->`,
        withLabelWrapper: `<!-- Template (PlanDetail / Booking pattern) -->\n<div class="flex flex-col gap-1.5">\n  <span class="text-sm font-medium text-[#667085]">\n    {{ t('demo.quillEditor.fieldLabels.eventDescription') }}\n  </span>\n  <QuillEditor \n    v-model="eventDescription" \n    :placeholder="t('demo.quillEditor.placeholders.eventDescription')" \n  />\n</div>\n\n<!-- Script -->\nimport { ref } from 'vue';\nimport { useI18n } from 'vue-i18n';\nimport QuillEditor from '@/components/forms/inputs/QuillEditor.vue';\n\nconst { t } = useI18n();\nconst eventDescription = ref('');`,
    },
    tierCard: {
        1: `<!-- Template -->\n<TierCard :tier="tierStandardClaim" />\n\n<!-- Script -->\nimport { computed } from 'vue';\nimport { useI18n } from 'vue-i18n';\nimport TierCard from '@/components/ui/card/dashboard/TierCard.vue';\nimport { useAssetUrl } from '@/composables/useAssetUrl.js';\n\nconst { t } = useI18n();\nconst { url: tierBgUrl } = useAssetUrl('tier.demo.background');\nconst { url: tierButtonPinkUrl } = useAssetUrl('tier.demo.buttonBgPink');\n\nconst tierStandardClaim = computed(() => ({\n  id: 1,\n  title: t('tierCard.demo.title'),\n  backgroundImage: tierBgUrl.value,\n  isFeatured: true,\n  stats: { video: 100, image: 80, audio: 70 },\n  theme: {\n    textPrimary: '#FB0464',\n    textSecondary: 'text-[#FFED29] dark:text-[#ffee37]',\n    shadow: 'shadow-[0px_0px_80px_0px_#FF8FBA40,0px_0px_8px_0px_#FF8FBA40]',\n    barColor: 'bg-[#FB0464] dark:bg-[#c90350]',\n    barTextColor: 'text-[#FFED29]',\n    featuredBg: 'bg-[#FB0464] dark:bg-[#c90350]',\n    buttonBgImage: \`url('\${tierButtonPinkUrl.value}')\`,\n    flashLabel: 'text-white dark:text-[#e8e6e3]',\n    flashText: '#FB0464',\n    textReNew: 'text-white dark:text-[#e8e6e3]',\n    featuredText: 'text-white dark:text-[#e8e6e3]',\n  },\n  plans: [\n    { id: '1d', label: t('tierCard.demo.plans.oneDay'), price: '55.86', discount: null },\n    { id: '1m', label: t('tierCard.demo.plans.oneMonth'), price: '55.86', discount: '-5%' },\n    { id: '6m', label: t('tierCard.demo.plans.sixMonth'), price: '55.86', discount: '-50%', isMostValue: true },\n    { id: '1y', label: t('tierCard.demo.plans.oneYear'), price: '55.86', discount: '-5%' },\n  ],\n  defaultPlan: '6m',\n  flashSale: {\n    active: true,\n    endsIn: t('tierCard.demo.flashSale.endsIn'),\n    originalPrice: t('tierCard.demo.flashSale.originalPrice'),\n  },\n  description: t('tierCard.demo.description'),\n  footer: {\n    type: 'standard',\n    buttonText: t('tierCard.demo.footer.claimOffer'),\n    progress: {\n      visible: true,\n      width: '5%',\n      leftText: t('tierCard.demo.footer.fiveLeft'),\n      rightText: t('tierCard.demo.footer.offerProgressLow'),\n    },\n  },\n}));\n\n<!-- Notes -->\n// footer.type: 'standard' | 'spend' | 'hidden' | 'subscribe'\n// backgroundImage + theme.buttonBgImage from assetMap`,
        2: `<!-- Template -->\n<TierCard :tier="tierSpendToClaim" />\n\n<!-- Script -->\nimport { computed } from 'vue';\nimport { useI18n } from 'vue-i18n';\nimport TierCard from '@/components/ui/card/dashboard/TierCard.vue';\nimport { useAssetUrl } from '@/composables/useAssetUrl.js';\n\nconst { t } = useI18n();\nconst { url: tierBgUrl } = useAssetUrl('tier.demo.background');\nconst { url: tierButtonPinkUrl } = useAssetUrl('tier.demo.buttonBgPink');\n\nconst tierSpendToClaim = computed(() => ({\n  id: 2,\n  title: t('tierCard.demo.title'),\n  backgroundImage: tierBgUrl.value,\n  isFeatured: true,\n  stats: { video: 100, image: 80, audio: 70 },\n  theme: {\n    textPrimary: 'text-[#FFED29]',\n    textSecondary: 'text-[#FFED29] dark:text-[#ffee37]',\n    shadow: 'shadow-[0px_0px_80px_0px_#FFED2940,0px_0px_8px_0px_#FFED2980]',\n    barColor: 'bg-[#ffffff]',\n    barTextColor: 'text-[#FFED29]',\n    featuredBg: 'bg-[#FB0464] dark:bg-[#c90350]',\n    buttonBgImage: \`url('\${tierButtonPinkUrl.value}')\`,\n    flashLabel: 'text-white dark:text-[#e8e6e3]',\n    flashText: '#FB0464',\n    textReNew: 'text-white dark:text-[#e8e6e3]',\n    featuredText: 'text-white dark:text-[#e8e6e3]',\n  },\n  plans: [/* same plans pattern as tier 1 */],\n  defaultPlan: '6m',\n  flashSale: { active: true, endsIn: t('tierCard.demo.flashSale.endsIn'), originalPrice: t('tierCard.demo.flashSale.originalPrice') },\n  description: t('tierCard.demo.description'),\n  footer: {\n    type: 'spend',\n    buttonText: t('tierCard.demo.footer.claimOffer'),\n    progress: {\n      visible: true,\n      width: '80%',\n      leftText: t('tierCard.demo.footer.spendMore'),\n      rightText: t('tierCard.demo.footer.spendProgress'),\n    },\n  },\n}));`,
        3: `<!-- Template -->\n<TierCard :tier="tierStandard95Left" />\n\n<!-- Script -->\nimport { computed } from 'vue';\nimport { useI18n } from 'vue-i18n';\nimport TierCard from '@/components/ui/card/dashboard/TierCard.vue';\nimport { useAssetUrl } from '@/composables/useAssetUrl.js';\n\nconst { t } = useI18n();\nconst { url: tierBgUrl } = useAssetUrl('tier.demo.background');\nconst { url: tierButtonPinkUrl } = useAssetUrl('tier.demo.buttonBgPink');\n\nconst tierStandard95Left = computed(() => ({\n  id: 3,\n  title: t('tierCard.demo.title'),\n  backgroundImage: tierBgUrl.value,\n  isFeatured: true,\n  stats: { video: 100, image: 80, audio: 70 },\n  theme: {\n    textPrimary: '#FB0464',\n    textSecondary: 'text-[#FFED29] dark:text-[#ffee37]',\n    shadow: 'shadow-[0px_0px_80px_0px_#FF8FBA40,0px_0px_8px_0px_#FF8FBA40]',\n    barColor: 'bg-[#FB0464] dark:bg-[#c90350]',\n    barTextColor: 'text-[#FB0464]',\n    featuredBg: 'bg-[#FB0464] dark:bg-[#c90350]',\n    buttonBgImage: \`url('\${tierButtonPinkUrl.value}')\`,\n    flashLabel: 'text-white dark:text-[#e8e6e3]',\n    flashText: '#FB0464',\n    textReNew: 'text-white dark:text-[#e8e6e3]',\n    featuredText: 'text-white dark:text-[#e8e6e3]',\n  },\n  plans: [/* same plans pattern as tier 1 */],\n  defaultPlan: '6m',\n  flashSale: { active: true, endsIn: t('tierCard.demo.flashSale.endsIn'), originalPrice: t('tierCard.demo.flashSale.originalPrice') },\n  description: t('tierCard.demo.description'),\n  footer: {\n    type: 'standard',\n    buttonText: t('tierCard.demo.footer.claimOffer'),\n    progress: {\n      visible: true,\n      width: '95%',\n      leftText: t('tierCard.demo.footer.ninetyFiveLeft'),\n      rightText: t('tierCard.demo.footer.offerProgressHigh'),\n    },\n  },\n}));`,
        4: `<!-- Template -->\n<TierCard :tier="tierHiddenProgress" />\n\n<!-- Script -->\nimport { computed } from 'vue';\nimport { useI18n } from 'vue-i18n';\nimport TierCard from '@/components/ui/card/dashboard/TierCard.vue';\nimport { useAssetUrl } from '@/composables/useAssetUrl.js';\n\nconst { t } = useI18n();\nconst { url: tierBgUrl } = useAssetUrl('tier.demo.background');\nconst { url: tierButtonPinkUrl } = useAssetUrl('tier.demo.buttonBgPink');\n\nconst tierHiddenProgress = computed(() => ({\n  id: 4,\n  title: t('tierCard.demo.title'),\n  backgroundImage: tierBgUrl.value,\n  isFeatured: true,\n  stats: { video: 100, image: 80, audio: 70 },\n  theme: {\n    textPrimary: '#FB0464',\n    textSecondary: 'text-[#FFED29] dark:text-[#ffee37]',\n    shadow: 'shadow-[0px_0px_80px_0px_#FF8FBA40,0px_0px_8px_0px_#FF8FBA40]',\n    barColor: 'bg-[#FFED29] dark:bg-[#ffee37]',\n    barTextColor: 'text-[#FFED29]',\n    featuredBg: 'bg-[#FB0464] dark:bg-[#c90350]',\n    buttonBgImage: \`url('\${tierButtonPinkUrl.value}')\`,\n    flashLabel: 'text-white dark:text-[#e8e6e3]',\n    flashText: '#FB0464',\n    textReNew: 'text-white dark:text-[#e8e6e3]',\n    featuredText: 'text-white dark:text-[#e8e6e3]',\n  },\n  plans: [/* same plans pattern as tier 1 */],\n  defaultPlan: '6m',\n  flashSale: { active: true, endsIn: t('tierCard.demo.flashSale.endsIn'), originalPrice: t('tierCard.demo.flashSale.originalPrice') },\n  description: t('tierCard.demo.description'),\n  footer: {\n    type: 'hidden',\n    buttonText: t('tierCard.demo.footer.claimOffer'),\n    progress: { visible: false },\n  },\n}));`,
        5: `<!-- Template -->\n<TierCard :tier="tierSubscribeGreen" />\n\n<!-- Script -->\nimport { computed } from 'vue';\nimport { useI18n } from 'vue-i18n';\nimport TierCard from '@/components/ui/card/dashboard/TierCard.vue';\nimport { useAssetUrl } from '@/composables/useAssetUrl.js';\n\nconst { t } = useI18n();\nconst { url: tierBgUrl } = useAssetUrl('tier.demo.background');\nconst { url: tierButtonGreenUrl } = useAssetUrl('tier.demo.buttonBgGreen');\n\nconst tierSubscribeGreen = computed(() => ({\n  id: 5,\n  title: t('tierCard.demo.title'),\n  backgroundImage: tierBgUrl.value,\n  isFeatured: false,\n  stats: { video: 100, image: 80, audio: 70 },\n  theme: {\n    textPrimary: 'text-[#07F468] dark:text-[#06c454]',\n    textSecondary: 'text-[#FFED29] dark:text-[#FFED29]',\n    shadow: 'shadow-[0px_0px_80px_0px_#07F46840,0px_0px_8px_0px_#07F46880]',\n    barColor: 'bg-[#FFED29] dark:bg-[#ffee37]',\n    barTextColor: 'text-[#FFED29]',\n    featuredBg: 'bg-black dark:bg-[#181a1b]',\n    buttonBgImage: \`url('\${tierButtonGreenUrl.value}')\`,\n    flashLabel: 'text-[#07F468] dark:text-[#06c454]',\n    flashText: '#07F468',\n    textReNew: 'text-white dark:text-[#e8e6e3]',\n    featuredText: 'text-[#07F468] dark:text-[#06c454]',\n  },\n  plans: [/* same plans pattern as tier 1 */],\n  defaultPlan: '6m',\n  flashSale: { active: true, endsIn: t('tierCard.demo.flashSale.endsIn'), originalPrice: t('tierCard.demo.flashSale.originalPrice') },\n  description: t('tierCard.demo.description'),\n  footer: {\n    type: 'subscribe',\n    buttonText: t('tierCard.demo.footer.subscribe'),\n    progress: { visible: false },\n  },\n}));`,
    },
    eventCard: {
        orangeButton: `<!-- Template -->\n<EventCard theme="orange" :hasButton="true" />\n\n<!-- Script -->\nimport EventCard from '@/components/ui/card/dashboard/EventCard.vue';\n\n<!-- Props -->\n// theme: 'orange' | 'pink'\n// hasButton: true = single progress + CTA button footer\n\n<!-- Assets (inside EventCard via useAssetUrl) -->\n// tier.demo.background — card background\n// event.demo.catImage — mascot image\n// icon.notification.close — dismiss icon\n// icon.media.verified — creator badge\n// event.demo.tooltip — progress tooltip icon\n\n<!-- i18n (inside EventCard via $t) -->\n// eventCard.demo.titles.subscriberDiscount\n// eventCard.demo.buttons.claimDiscount\n// eventCard.demo.creatorName`,
        orangeProgress: `<!-- Template -->\n<EventCard theme="orange" :hasButton="false" />\n\n<!-- Script -->\nimport EventCard from '@/components/ui/card/dashboard/EventCard.vue';\n\n<!-- Props -->\n// theme: 'orange'\n// hasButton: false = dual progress bars, no CTA button\n\n<!-- i18n keys used -->\n// eventCard.demo.spendMoreClaim\n// eventCard.demo.offersLeft\n// eventCard.demo.progressRatio`,
        pinkButton: `<!-- Template -->\n<EventCard theme="pink" :hasButton="true" />\n\n<!-- Script -->\nimport EventCard from '@/components/ui/card/dashboard/EventCard.vue';\n\n<!-- Props -->\n// theme: 'pink'\n// hasButton: true = single progress + pink CTA button\n\n<!-- i18n keys used -->\n// eventCard.demo.titles.luckyDraw\n// eventCard.demo.buttons.enterLuckyDraw\n// eventCard.demo.chancesLeft`,
        pinkProgress: `<!-- Template -->\n<EventCard theme="pink" :hasButton="false" />\n\n<!-- Script -->\nimport EventCard from '@/components/ui/card/dashboard/EventCard.vue';\n\n<!-- Props -->\n// theme: 'pink'\n// hasButton: false = dual progress + dark overlay (card 4 layout)\n\n<!-- i18n keys used -->\n// eventCard.demo.spendMoreEnter\n// eventCard.demo.chancesLeft\n// eventCard.demo.progressOffer`,
    },
    cart: {
        default: `<!-- Template -->\n<Cart />\n\n<!-- Interaction Logic (Custom Events) -->\n// To add an item via console or script:\nwindow.dispatchEvent(new CustomEvent('cart:add', {\n  detail: {\n    item: {\n      title: "NBA Hoops Card",\n      productId: "nba123",\n      qty: 1,\n      price: 12.23,\n      originalPrice: 20.00,\n      shipping: 12.23,\n      seller: "Princess Carrot Pop",\n      image: "https://i.ibb.co.com/70sHrpv/featured-media-bg.webp",\n      promoCodes: ["PROMOCODE2025", "MEMBER BENEFIT"]\n    }\n  }\n}));`,
    },
    spinner: {
        img: `<LoadingSpinner \n  :src="spinnerIconUrl" \n  size="2xl" \n/>\n\n<!-- Script -->\nconst { url: spinnerIconUrl } = useAssetUrl('icon.spinner');`,
        styled: `<LoadingSpinner \n  thickness="3.5" \n  size="lg" \n  color="text-green-500" \n  trackColor="text-white" \n/>`,
        thin: `<LoadingSpinner \n  thickness="1" \n  size="3xl" \n  color="text-green-500" \n  trackColor="text-white" \n/>`,
        buttonLoading: `<DashboardPrimaryButton \n  text="Sign in" \n  variant="authPink" \n  size="lg" \n  type="button" \n  :loading="buttonLoaders.authSignIn" \n  loadingSpinnerColor="text-white" \n  @click="runButtonDemo('authSignIn')" \n/>\n\n<!-- Script -->\nconst buttonLoaders = reactive({});\nconst runButtonDemo = (id) => {\n  if (buttonLoaders[id]) return;\n  buttonLoaders[id] = true;\n  setTimeout(() => { buttonLoaders[id] = false; }, 2500);\n};`,
    },
    buttons: {
        authSignIn: `<DashboardPrimaryButton \n  text="Sign in" \n  variant="authPink" \n  size="lg" \n  type="button" \n  :loading="buttonLoaders.authSignIn" \n  loadingSpinnerColor="text-white" \n  @click="runButtonDemo('authSignIn')" \n/>`,
        authX: `<DashboardPrimaryButton \n  text="Continue with X (Twitter)" \n  variant="authTransparent" \n  size="lg" \n  type="button" \n  :leftIcon="xLogoUrl" \n  leftIconClass="w-8 h-8" \n  :loading="buttonLoaders.authX" \n  @click="runButtonDemo('authX')" \n/>\n\n<!-- Script -->\nconst { url: xLogoUrl } = useAssetUrl('icon.social.x.logo');`,
        authTelegram: `<DashboardPrimaryButton \n  text="Continue with Telegram" \n  variant="authTransparent" \n  size="lg" \n  type="button" \n  :leftIcon="telegramIconUrl" \n  leftIconClass="w-8 h-8" \n  :loading="buttonLoaders.authTelegram" \n  @click="runButtonDemo('authTelegram')" \n/>\n\n<!-- Script -->\nconst { url: telegramIconUrl } = useAssetUrl('icon.social.telegram');`,
        polygonNext: `<DashboardPrimaryButton \n  text="Next" \n  variant="polygonLeft" \n  type="button" \n  :rightIcon="polygonArrowUrl" \n  :loading="buttonLoaders.polygonNext" \n  loadingSpinnerColor="text-black" \n  @click="runButtonDemo('polygonNext')" \n  btnBg="#07f468" \n  btnHoverBg="black" \n  btnText="black" \n  btnHoverText="#07f468" \n/>\n\n<!-- Disabled (same look) -->\n<DashboardPrimaryButton \n  text="Next" \n  variant="polygonLeft" \n  type="button" \n  disabled \n  :rightIcon="polygonArrowUrl" \n  btnBg="#07f468" \n  btnHoverBg="black" \n  btnText="black" \n  btnHoverText="#07f468" \n/>\n\n<!-- Script -->\nconst { url: polygonArrowUrl } = useAssetUrl('icon.polygon.arrow');`,
        profileBack: `<DashboardPrimaryButton \n  text="Back" \n  variant="profileMediaBtn" \n  type="button" \n  :leftIcon="arrowLeftUrl" \n  :loading="buttonLoaders.profileBack" \n  @click="runButtonDemo('profileBack')" \n/>\n\n<!-- Script -->\nconst { url: arrowLeftUrl } = useAssetUrl('icon.arrow.left');`,
        payoutSave: `<DashboardPrimaryButton \n  variant="none" \n  text="SAVE" \n  type="button" \n  :loading="buttonLoaders.payoutSave" \n  loadingSpinnerColor="text-[#07F468]" \n  @click="runButtonDemo('payoutSave')" \n  customClass="..." \n  textClass="..." \n>\n  <template #leftIcon>\n    <img :src="tickCircleUrl" alt="" class="w-6 h-6 ..." />\n  </template>\n</DashboardPrimaryButton>\n\n<!-- Script -->\nconst { url: tickCircleUrl } = useAssetUrl('icon.tick.circle');`,
        sendInvite: `<DashboardPrimaryButton \n  text="Send invite" \n  variant="simpleBtn" \n  type="button" \n  :leftIcon="sendIconUrl" \n  :loading="buttonLoaders.sendInvite" \n  @click="runButtonDemo('sendInvite')" \n  btnBg="#07f468" \n  btnHoverBg="black" \n  btnText="black" \n  btnHoverText="#07f468" \n/>\n\n<!-- Script -->\nconst { url: sendIconUrl } = useAssetUrl('icon.send');`,
        addTier: `<DashboardPrimaryButton \n  text="Add Tier" \n  variant="polygonLeft" \n  type="button" \n  :leftIcon="addTierIconUrl" \n  :loading="buttonLoaders.addTier" \n  loadingSpinnerColor="text-[#07F468]" \n  @click="runButtonDemo('addTier')" \n  btnBg="#000" \n  btnHoverBg="#07f468" \n  btnText="#07f468" \n  btnHoverText="#000" \n/>\n\n<!-- Script -->\nconst { url: addTierIconUrl } = useAssetUrl('icon.add.tier');`,
        submitMedia: `<DashboardPrimaryButton \n  text="SUBMIT MEDIA FOR APPROVAL" \n  variant="polygonLeft" \n  type="button" \n  :rightIcon="polygonArrowUrl" \n  :loading="buttonLoaders.submitMedia" \n  @click="runButtonDemo('submitMedia')" \n  btnBg="#07f468" \n  btnHoverBg="black" \n  btnText="black" \n  btnHoverText="#07f468" \n/>\n\n<!-- Script -->\nconst { url: polygonArrowUrl } = useAssetUrl('icon.polygon.arrow');`,
        allOrders: `<DashboardPrimaryButton \n  variant="none" \n  text="All Orders" \n  type="button" \n  :loading="buttonLoaders.allOrders" \n  @click="runButtonDemo('allOrders')" \n  customClass="..." \n>\n  <template #rightIcon>...</template>\n</DashboardPrimaryButton>`,
        trend: `<DashboardPrimaryButton \n  variant="none" \n  text="Trend" \n  type="button" \n  :loading="buttonLoaders.trend" \n  @click="runButtonDemo('trend')" \n  customClass="..." \n>\n  <template #rightIcon>...</template>\n</DashboardPrimaryButton>`,
        twoPieceLinkX: `<TwoPieceButton \n  variant="link-x" \n  tag="button" \n  text="Link your X account" \n  type="button" \n  :loading="buttonLoaders.twoPieceLinkX" \n  loadingSpinnerColor="text-black" \n  @click="runButtonDemo('twoPieceLinkX')" \n>\n  <template #icon>\n    <img :src="xTwoPieceUrl" alt="" class="w-6 h-6 ..." />\n  </template>\n</TwoPieceButton>\n\n<!-- Script -->\nconst { url: xTwoPieceUrl } = useAssetUrl('icon.social.x.twoPiece');`,
        twoPiecePremium: `<TwoPieceButton \n  variant="premium-upgrade" \n  tag="button" \n  text="Upgrade To Premium" \n  type="button" \n  :loading="buttonLoaders.twoPiecePremium" \n  @click="runButtonDemo('twoPiecePremium')" \n>\n  <template #icon>\n    <img :src="starIconUrl" alt="" class="w-6 h-6" />\n  </template>\n</TwoPieceButton>\n\n<!-- Script -->\nconst { url: starIconUrl } = useAssetUrl('icon.star');`,
        twoPiecePink: `<TwoPieceButton \n  tag="button" \n  variant="link-x" \n  type="button" \n  text="Unlock premium to upload videos" \n  :loading="buttonLoaders.twoPiecePink" \n  @click="runButtonDemo('twoPiecePink')" \n  rootClass="..." \n  contentWrapperClass="..." \n  textClass="..." \n/>`,
        authPink: `<DashboardPrimaryButton \n  :text="buttonText" \n  variant="authPink" \n  type="submit" \n/>`,
        authTransparent: `<DashboardPrimaryButton \n  text="Continue with Telegram" \n  variant="authTransparent" \n  size="lg" \n  :leftIcon="telegramIconUrl" \n  leftIconClass="w-8 h-8" \n/>`,
        newEvents: `<DashboardPrimaryButton \n  text="NEW EVENTS" \n  variant="none" \n  type="button" \n  customClass="group w-full h-12 ..." \n  :leftIcon="plusIconUrl" \n  :loading="buttonLoaders.newEvents" \n  loadingSpinnerColor="text-[#07F468]" \n  @click="runButtonDemo('newEvents')" \n/>\n\n<!-- Script -->\nconst { url: plusIconUrl } = useAssetUrl('icon.plus');`,
        publishSchedule: `<DashboardPrimaryButton \n  text="PUBLISH SCHEDULE" \n  variant="polygonLeft" \n  type="button" \n  :leftIcon="publishScheduleIconUrl" \n  :loading="buttonLoaders.publishSchedule" \n  @click="runButtonDemo('publishSchedule')" \n/>\n\n<!-- Script -->\nconst { url: publishScheduleIconUrl } = useAssetUrl('icon.publish.schedule');`,
        addonService: `<DashboardPrimaryButton \n  text="add-on service" \n  variant="none" \n  type="button" \n  customClass="group bg-gray-900 ..." \n  :leftIcon="plusIconUrl" \n  :loading="buttonLoaders.addonService" \n  @click="runButtonDemo('addonService')" \n/>\n\n<!-- Script -->\nconst { url: plusIconUrl } = useAssetUrl('icon.plus');`,
        addonServiceV2: `<DashboardPrimaryButton \n  text="add-on service" \n  variant="none" \n  type="button" \n  customClass="group bg-gray-900 ..." \n  :leftIcon="plusSmallIconUrl" \n  :loading="buttonLoaders.addonServiceV2" \n  @click="runButtonDemo('addonServiceV2')" \n/>\n\n<!-- Script -->\nconst { url: plusSmallIconUrl } = useAssetUrl('icon.plus.small');`,
        proceedPayment: `<DashboardPrimaryButton \n  text="Proceed Payment" \n  variant="checkoutProceedpayment" \n  type="button" \n  :rightIcon="arrowRightUrl" \n  :loading="buttonLoaders.checkoutProceed" \n  loadingSpinnerColor="text-black" \n  @click="runButtonDemo('checkoutProceed')" \n/>\n\n<!-- Script -->\nconst { url: arrowRightUrl } = useAssetUrl('icon.arrow.right');`,
        actionGreenX: `<DashboardPrimaryButton \n  text="Continue with X (Twitter)" \n  variant="actionGreen" \n  type="button" \n  :leftIcon="xLogoUrl" \n  :loading="buttonLoaders.checkoutActionGreenX" \n  @click="runButtonDemo('checkoutActionGreenX')" \n/>\n\n<!-- Script -->\nconst { url: xLogoUrl } = useAssetUrl('icon.social.x.logo');`,
    }
};


const handleAction = (action) => {
    console.log("Menu clicked:", action);
}

// Global light input props for demo consistency
const lightInputProps = {
    labelClass: "!text-slate-900",
    inputClass: "flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-10",
    wrapperClass: "!border-slate-300 !bg-white",
    descriptionClass: "!text-slate-500",
    errorClass: "!text-red-600",
    successClass: "!text-green-600",
    leftIconClass: "!text-slate-500",
    rightIconClass: "!text-slate-400",
    requiredClass: "!text-slate-500",
    optionalLabelClass: "!text-slate-700 font-medium",
    leftSpanClass: "!text-slate-500",
    rightSpanClass: "!text-slate-500"
};

// Input Dashboard State
const inputs = reactive({
    username: '',
    email: '',
    firstName: '',
    noLabel: '',
    plain: '',
    title: '',
    search: '',
    noIcon: '',
    emailSupport: '',
    autofillEmail: 'linden@codelinden.com',
    requiredStar: '',
    requiredText: '',
    advancedSearch: '',
    bio: '',
    tipMessage: '',
    eventTitle: '',
    coPerformerSearch: '',
    duration: '',
    quantity: 5,
    age: '',
    basePrice: '',
    originalPrice: '',
    bookingFee: '',
    offHourSurcharge: '',
    maxSessionDuration: '3',
    eventTitleValidated: '',
    requiredErrorField: '',
    successField: 'carrot_pop',
    remindMeTime: '15',
    password: '',
    showPass: false,
    error: 'abc-123',
    success: 'my-profile-slug',
    price: '99.99',
});

// Button Showcase — click any catalog button to preview :loading (spinner only, no text)
const buttonLoaders = reactive({});
const runButtonDemo = (id) => {
    if (buttonLoaders[id]) return;
    buttonLoaders[id] = true;
    setTimeout(() => { buttonLoaders[id] = false; }, 2500);
};

const buttonText = ref("Auth Button");
const demoTabsModel = ref('Daily');

</script>

<style>
/* Premium Light Theme Showcase Styles */
.dynamic-premium-bg-light {
    background-color: #f8fafc;
    background-image:
        radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.08) 0, transparent 40%),
        radial-gradient(at 100% 0%, rgba(244, 63, 94, 0.06) 0, transparent 40%),
        radial-gradient(at 50% 100%, rgba(20, 184, 166, 0.05) 0, transparent 50%);
    background-attachment: fixed;
    position: relative;
    overflow-x: hidden;
}

.dynamic-premium-bg-light::before {
    content: "";
    position: fixed;
    inset: 0;
    z-index: 0;
    opacity: 0.15;
    pointer-events: none;
    background-image: url("https://www.transparenttextures.com/patterns/cubes.png");
}

/* Ensure content stays above background effects */
.dynamic-premium-bg-light>* {
    position: relative;
    z-index: 1;
}

/* Section entrance animations */
section {
    animation: slideUpFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideUpFadeIn {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Scrollbar Refinement */
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 20px;
    border: 2px solid #f1f5f9;
}

::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

/* Glassmorphic containers for sections if needed */
.glass-container {
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 24px;
    padding: 2rem;
}
</style>
