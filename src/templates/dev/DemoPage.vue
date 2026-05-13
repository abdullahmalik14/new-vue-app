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
                    <Heading text="Media Card Variations (V1)" tag="h1" theme="defaultPrimaryHeading" version="basic"
                        class="!text-black" />
                    <Paragraph text="Multiple display logic and layout variants for our primary media card."
                        class="!text-slate-500" />
                </div>

                <!-- 1. Creator: My Media -->
                <section class="flex flex-col gap-6">
                    <Heading text="1. Creator: My Media" tag="h2" theme="defaultSecondaryHeading" version="basic"
                        class="!text-black" />
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                        <MediaCardV1 v-for="item in myMediaList" :key="item.id" :media="item" variant="default"
                            @menu-action="handleAction" />
                    </div>
                    <ShowCodeToggle :code="demoSnippets.mediaV1.myMedia" />
                </section>

                <!-- 2. Fan: Continue Watching -->
                <section class="flex flex-col gap-6">
                    <Heading text="2. Fan: Continue Watching" tag="h2" theme="defaultSecondaryHeading" version="basic"
                        class="!text-black" />
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                        <MediaCardV1 :media="myMediaList[0]" variant="resume" />
                    </div>
                    <ShowCodeToggle :code="demoSnippets.mediaV1.resume" />
                </section>

                <!-- 3. Fan: Latest Media -->
                <section class="flex flex-col gap-6">
                    <Heading text="3. Fan: Latest Media" tag="h2" theme="defaultSecondaryHeading" version="basic"
                        class="!text-black" />
                    <div class="flex items-start gap-4">
                        <MediaCardV1 :media="latestMediaItem" variant="latest" />
                    </div>
                    <ShowCodeToggle :code="demoSnippets.mediaV1.latest" />
                </section>

                <!-- 4. Fan: Purchased Media -->
                <section class="flex flex-col gap-6">
                    <Heading text="4. Fan: Purchased Media" tag="h2" theme="defaultSecondaryHeading" version="basic"
                        class="!text-black" />
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                        <MediaCardV1 :media="purchasedMediaItem" variant="purchased" @menu-action="handleAction" />
                    </div>
                    <ShowCodeToggle :code="demoSnippets.mediaV1.purchased" />
                </section>

                <!-- 5. Fan: Grid View (Zoom Effect) -->
                <section class="flex flex-col gap-6">
                    <Heading text="5. Fan: Grid View (Zoom Effect)" tag="h2" theme="defaultSecondaryHeading"
                        version="basic" class="!text-black" />
                    <div
                        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-2 xl:gap-4 w-full gap-y-[5.5rem] md:gap-y-[5rem] xl:gap-y-[5.5rem]">
                        <MediaCardV1 v-for="item in gridMediaList" :key="item.id" :media="item" variant="grid"
                            @menu-action="handleAction" />
                    </div>
                    <ShowCodeToggle :code="demoSnippets.mediaV1.gridView" />
                </section>

                <div class="">
                    <Heading text="Media Card Variations (V2)" tag="h1" theme="defaultPrimaryHeading" version="basic"
                        class="!text-black" />
                    <Paragraph text="An alternative design language for cards with hover expansion effects."
                        class="!text-slate-500 mt-2" />
                </div>

                <div class="flex flex-col gap-8">
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-12 gap-x-4">
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

            <!-- ===== SECTION: InputComponentDashboard ===== -->
            <section class="flex flex-col gap-10">
                <DemoSectionHeader title="InputComponentDashboard" />

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

                    <div class="flex flex-col gap-3">

                        <InputComponentDashboard v-model="inputs.basic" placeholder="carrot_popxoxo123" showLabel
                            labelText="Username"
                            description="Usernames cannot be changed after your first month on our website, but special circumstances may allow for exceptions. Please contact us if you need assistance with changing your username." />

                        <ShowCodeToggle :code="demoSnippets.icd.default" />
                    </div>

                    <div class="flex flex-col gap-3">

                        <InputComponentDashboard v-model="inputs.basic" placeholder="mscarrot_pops@gmail.com" showLabel
                            labelText="Email" />

                        <ShowCodeToggle :code="demoSnippets.icd.email" />
                    </div>

                    <div class="flex flex-col gap-3">

                        <InputComponentDashboard v-model="inputs.basic" placeholder="" showLabel
                            labelText="First Name" />

                        <ShowCodeToggle :code="demoSnippets.icd.firstName" />
                    </div>

                    <div class="flex flex-col gap-3">

                        <InputComponentDashboard v-model="inputs.basic" placeholder="" showLabel
                            labelText="Last Name" />

                        <ShowCodeToggle :code="demoSnippets.icd.lastName" />
                    </div>

                    <div class="flex flex-col gap-3">

                        <InputComponentDashboard v-model="inputs.basic" placeholder="Event Title" showLabel
                            labelText="Title" />

                        <ShowCodeToggle :code="demoSnippets.icd.title" />
                    </div>

                    <div class="flex flex-col gap-3">
                        <InputComponentDashboard placeholder="Search by username & email" v-model="inputs.basic"
                            showLabel label-text="Co-performer (Optional)" :left-icon="MagnifyingGlassIcon"
                            optionalLabel class="w-full" />

                        <ShowCodeToggle :code="demoSnippets.icd.coPerformer" />
                    </div>

                    <!-- 2. Password with Toggle -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Password with Toggle</span>
                        <InputComponentDashboard v-model="inputs.password" placeholder="Old Password" showLabel
                            labelText="Old Password" @rightIconClick="inputs.showPass = !inputs.showPass" />
                        <ShowCodeToggle :code="demoSnippets.icd.password" />
                    </div>


                    <!-- 4. With Right Icon -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">With Right Icon</span>
                        <InputComponentDashboard v-model="inputs.email" placeholder="Enter email..." showLabel
                            labelText="Email Support" :rightIcon="EnvelopeIcon" />
                        <ShowCodeToggle :code="demoSnippets.icd.rightIcon" />
                    </div>

                    <!-- 5. Required Display -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Required (*)</span>
                        <InputComponentDashboard v-model="inputs.email" placeholder="Required field" showLabel
                            labelText="Full Name" requiredDisplay="*" />
                        <ShowCodeToggle :code="demoSnippets.icd.requiredStar" />
                    </div>



                    <!-- 9. Prefix and Suffix Icons -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Both Icons (Left &
                            Right)</span>
                        <div class="min-h-[100px] flex items-center">
                            <InputComponentDashboard v-model="inputs.email" placeholder="Search with filters..."
                                showLabel labelText="Advanced Search" :leftIcon="MagnifyingGlassIcon"
                                :rightIcon="Bars3Icon" clickableRightIcon />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.icd.bothIcons" />
                    </div>

                    <!-- 10. Textarea -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Textarea</span>

                        <InputComponentDashboard id="input_g" type="textarea" show-label v-model="inputs.bio"
                            textAreaRows="3" label-text="" placeholder="Description (Optional)"
                            description="0/200 characters" />

                        <ShowCodeToggle :code="demoSnippets.icd.textarea" />
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
                            <Heading text="Primary H1" tag="h1" theme="defaultPrimaryHeading" class="!text-black"
                                version="basic" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.heading.h1Primary" />
                    </div>

                    <!-- 2. h2 defaultSecondary -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">h2 —
                            defaultSecondaryHeading</span>
                        <div class="p-2  flex items-center">
                            <Heading text="Secondary H2" tag="h2" theme="defaultSecondaryHeading" class="!text-black"
                                version="basic" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.heading.h2Secondary" />
                    </div>

                    <!-- 3. h3 sectionHeading -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">h3 — sectionHeading</span>
                        <div class="p-2  flex items-center">
                            <Heading text="Section H3" tag="h3" theme="sectionHeading" class="!text-black"
                                version="basic" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.heading.h3Section" />
                    </div>

                    <!-- 4. dashboardHeading -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">h2 — dashboardHeading</span>
                        <div class="p-2  flex items-center">
                            <Heading text="Dashboard Title" tag="h2" theme="dashboardHeading" version="basic" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.heading.h2Dashboard" />
                    </div>

                    <!-- 5. AuthHeading -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">h2 — AuthHeading</span>
                        <div class="p-2  flex items-center">
                            <Heading text="Login" tag="h2" theme="AuthHeading" class="!text-black" version="basic" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.heading.h2Auth" />
                    </div>

                    <!-- 6. formHeading -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">h4 — formHeading</span>
                        <div class="p-2  flex items-center">
                            <Heading text="Profile Settings" tag="h4" theme="formHeading" version="basic" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.heading.h4Form" />
                    </div>

                    <!-- 7. demoHeadings h1 -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">h1 — demoHeadings</span>
                        <div class="p-2  flex items-center">
                            <Heading text="Demo H1 Bold" tag="h1" theme="demoHeadings" version="basic" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.heading.h1Demo" />
                    </div>

                    <!-- 8. demoHeadings h3 -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">h3 — demoHeadings</span>
                        <div class="p-2  flex items-center">
                            <Heading text="Demo H3 Medium" tag="h3" theme="demoHeadings" version="basic" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.heading.h3Demo" />
                    </div>

                    <!-- 9. With left icon -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">With Left Icon</span>

                        <Heading text="With Icon" tag="h3" theme="defaultSecondaryHeading" class="!text-black"
                            version="basic" :leftIcon="StarIcon" />

                        <ShowCodeToggle :code="demoSnippets.heading.withIcon" />
                    </div>

                    <!-- 10. orderHeading -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">h1 — orderHeading</span>
                        <div class="p-2  flex items-center">
                            <Heading text="Order #1234" tag="h1" theme="orderHeading" version="basic" />
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
                            <Paragraph text="This is a default paragraph with standard styling." class="!text-black" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.paragraph.default" />
                    </div>

                    <!-- 2. Small font -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Small (text-sm)</span>
                        <div class="p-2  flex items-center">
                            <Paragraph text="Small text paragraph for captions." class="!text-black text-sm" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.paragraph.small" />
                    </div>

                    <!-- 3. Large font -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Large (text-xl)</span>
                        <div class="p-2  flex items-center">
                            <Paragraph text="Large paragraph text." class="!text-black text-xl" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.paragraph.large" />
                    </div>

                    <!-- 4. Bold -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Bold</span>
                        <div class="p-2  flex items-center">
                            <Paragraph text="Bold paragraph text." class="!text-black font-bold" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.paragraph.bold" />
                    </div>

                    <!-- 5. Custom color -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Custom Color (Blue)</span>
                        <div class="p-2  flex items-center">
                            <Paragraph text="Blue paragraph text." fontColor="text-blue-600" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.paragraph.blue" />
                    </div>

                    <!-- 6. Error color -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Error Red</span>
                        <div class="p-2  flex items-center">
                            <Paragraph text="This field is required." fontColor="text-red-500" fontSize="text-sm" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.paragraph.error" />
                    </div>

                    <!-- 7. Success color -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Success Green</span>
                        <div class="p-2  flex items-center">
                            <Paragraph text="Action successful!" fontColor="text-green-600" fontWeight="font-medium" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.paragraph.success" />
                    </div>

                    <!-- 8. Italic -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Italic</span>
                        <div class="p-2  flex items-center">
                            <Paragraph text="Italic paragraph text for notes." fontFamily="italic"
                                fontColor="text-gray-500" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.paragraph.italic" />
                    </div>

                    <!-- 9. With left icon -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">With Left Icon</span>
                        <div class="p-2  flex items-center">
                            <Paragraph text="Info message here" :leftIcon="InformationCircleIcon" fontSize="text-sm"
                                fontColor="text-blue-600" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.paragraph.withIcon" />
                    </div>

                    <!-- 10. Extra small xs -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Extra Small (text-xs)</span>
                        <div class="p-2  flex items-center">
                            <Paragraph text="Helper text displayed below the input field." fontSize="text-xs"
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
                    <!-- 1. Media Requirement (Warning) -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Warning Variant (Media
                            Required)</span>
                        <div class="p-2 flex items-center">
                            <NotificationCard variant="warning" title="Media Content Required"
                                description="Your profile currently has no media. Enhance your profile's visibility by adding at least 5 media items."
                                timestamp="1w" :icon="FilmIcon" :badgeIcon="ArrowUpTrayIcon" dismissLabel="Dismiss"
                                actionLabel="Take Action" v-model="notifOpen.warning" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.notification.warning" />
                    </div>

                    <!-- 2. Media Approved (Success) -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Success Variant
                            (Approved)</span>
                        <div class="p-2 flex items-center">
                            <NotificationCard variant="success" title="Congratulations"
                                description="Your media 'Audio with placeholder and no preview' has been approved."
                                timestamp="1m" :icon="PhotoIcon" :badgeIcon="CheckIcon" dismissLabel="Dismiss"
                                actionLabel="Take Action" v-model="notifOpen.success" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.notification.success" />
                    </div>

                    <!-- 3. Bank Info Required (Info) -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Info Variant (Bank
                            Details)</span>
                        <div class="p-2 flex items-center">
                            <NotificationCard variant="info" title="Bank Details Required"
                                description="To ensure seamless transactions, please complete your bank information."
                                timestamp="3m" :icon="BuildingLibraryIcon" :badgeIcon="InformationCircleIcon"
                                dismissLabel="Dismiss" actionLabel="Take Action" v-model="notifOpen.info" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.notification.info" />
                    </div>

                    <!-- 4. Destructive Alert (Error) -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Error Variant
                            (Destructive)</span>
                        <div class="p-2 flex items-center">
                            <NotificationCard variant="error" title="Action Required"
                                description="Critical update needed for your account security settings."
                                timestamp="Just now" :icon="BellAlertIcon" :badgeIcon="TrashIcon" dismissLabel="Dismiss"
                                actionLabel="Finalize" v-model="notifOpen.error" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.notification.error" />
                    </div>
                </div>

            </section>

            <!-- ===== SECTION: QuillEditor ===== -->
            <section class="flex flex-col gap-6">
                <DemoSectionHeader title="QuillEditor" />
                <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <!-- 1. Default -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Default Rich Text Editor</span>
                        <div class="bg-transparent overflow-hidden">
                            <QuillEditor v-model="vals.q1" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.quill.default" />
                    </div>



                    <!-- 3. Initial Content -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">With Initial Content</span>
                        <div class="bg-transparent overflow-hidden">
                            <QuillEditor v-model="vals.q3" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.quill.initial" />
                    </div>


                </div>
            </section>

            <!-- ===== SECTION: SubscriptionCard ===== -->
            <section class="flex flex-col gap-12">
                <DemoSectionHeader title="SubscriptionCard" />
                <p class="text-xs text-slate-500/80 -mt-8">
                    Modern subscription cards with integrated feature lists and price toggles
                </p>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-24 gap-x-12 mt-8">
                    <div v-for="card in cards" :key="card.id" class="flex flex-col gap-4">
                        <div class="relative h-[34rem] sm:h-[42.5rem] md:h-[39rem] w-full">
                            <ul class="relative w-full h-full m-0 p-0 list-none">
                                <SubscriptionCard :card-data="card" :order="3" :is-current="card.isCurrentSubscription"
                                    :current-subscription-price="39.99" @trigger-action="handleCardAction" />
                            </ul>
                        </div>
                        <ShowCodeToggle
                            :code="`<!-- Template -->\n<SubscriptionCard \n  :card-data='card' \n  :is-current='${card.isCurrentSubscription ? 'true' : 'false'}' \n  @trigger-action='handleCardAction' \n/>\n\n<!-- Script Data (Interaction) -->\nconst card = ${JSON.stringify(card, null, 4)};\n\nconst handleCardAction = (card) => {\n  alert('Action triggered for: ' + card.title);\n};`" />
                    </div>
                </div>
            </section>

            <!-- ===== SECTION: TierCard ===== -->
            <section class="flex flex-col gap-12">
                <DemoSectionHeader title="Tier Cards" />
                <p class="text-xs text-slate-500/80 -mt-8">
                    Modern tier cards with integrated feature lists and price toggles (Data from TierData.js)
                </p>
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-x-8 gap-y-12">
                    <div v-for="tier in tierData" :key="tier.id" class="flex flex-col gap-4">
                        <TierCard :tier="tier" />
                        <ShowCodeToggle :code="demoSnippets.tierCard[tier.id]" />
                    </div>
                </div>
            </section>

            <!-- ===== SECTION: EventCard ===== -->
            <section class="flex flex-col gap-12">
                <DemoSectionHeader title="Event Cards" />
                <p class="text-xs text-slate-500/80 -mt-8">
                    Modern event cards with integrated feature lists and price toggles
                </p>
                <div class="flex flex-wrap gap-8 justify-center">
                    <div class="flex flex-col gap-4">
                        <EventCard theme="orange" :hasButton="true" />
                        <ShowCodeToggle :code="demoSnippets.eventCard.orangeButton" />
                    </div>
                    <div class="flex flex-col gap-4">
                        <EventCard theme="orange" :hasButton="false" />
                        <ShowCodeToggle :code="demoSnippets.eventCard.orangeProgress" />
                    </div>
                    <div class="flex flex-col gap-4">
                        <EventCard theme="pink" :hasButton="true" />
                        <ShowCodeToggle :code="demoSnippets.eventCard.pinkButton" />
                    </div>
                    <div class="flex flex-col gap-4">
                        <EventCard theme="pink" :hasButton="false" />
                        <ShowCodeToggle :code="demoSnippets.eventCard.pinkProgress" />
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
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">

                    <!-- 12. Using Img Src -->
                    <div class="flex flex-col items-center gap-3 p-2 lg:col-span-1">

                        <Spinner src="https://i.ibb.co.com/TM7mTrZJ/spinner.webp" size="2xl" />

                        <ShowCodeToggle :code="demoSnippets.spinner.img" />
                    </div>

                    <div class="flex flex-col items-center gap-3 p-2 lg:col-span-1">

                        <Spinner thickness="3.5" size="lg" color="text-green-500" trackColor="text-white" />

                        <ShowCodeToggle :code="demoSnippets.spinner.styled" />
                    </div>


                    <div class="flex flex-col items-center gap-3 p-2 lg:col-span-1">

                        <Spinner thickness="1" size="3xl" color="text-green-500" trackColor="text-white" />

                        <ShowCodeToggle :code="demoSnippets.spinner.thin" />
                    </div>
                </div>
            </section>

            <!-- ===== SECTION: Buttons ===== -->
            <section class="flex flex-col gap-8 mb-20">
                <DemoSectionHeader title="Button Showcase" />
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                    <!-- Auth Pink -->
                    <div class="flex flex-col gap-4">
                        <ButtonComponent :text="buttonText" variant="authPink" type="submit" />
                        <ShowCodeToggle :code="demoSnippets.buttons.authPink" />
                    </div>

                    <!-- Auth Transparent (Telegram) -->
                    <div class="flex flex-col gap-4">
                        <ButtonComponent text="Continue with Telegram" variant="authTransparent" size="lg"
                            :leftIcon="telegramIcon" leftIconClass="w-8 h-8" />
                        <ShowCodeToggle :code="demoSnippets.buttons.authTransparent" />
                    </div>

                    <!-- New Events -->
                    <div class="flex flex-col gap-4">
                        <ButtonComponent text="NEW EVENTS" variant="none"
                            customClass="group w-full h-12 min-h-10 px-4 py-2 text-base font-semibold bg-black rounded-[48px] inline-flex justify-center items-center gap-2 text-[#07F468] hover:text-black hover:bg-[#07F468]"
                            :leftIcon="'https://i.ibb.co.com/RpWmJkcb/plus.webp'"
                            :leftIconClass="`w-6 h-6 transition duration-200 group-hover:[filter:brightness(0)_saturate(100%)]`" />
                        <ShowCodeToggle :code="demoSnippets.buttons.newEvents" />
                    </div>

                    <!-- Polygon Next -->
                    <div class="flex flex-col gap-4">
                        <ButtonComponent text="Next" variant="polygonLeft"
                            :rightIcon="'https://i.ibb.co.com/hx8ztZFf/svgviewer-png-output-8.webp'" :rightIconClass="`
                                w-6 h-6 transition duration-200
                                filter brightness-0 invert-0
                                group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]
                                `" btnBg="#07f468" btnHoverBg="black" btnText="black" btnHoverText="#07f468" />
                        <ShowCodeToggle :code="demoSnippets.buttons.polygonNext" />
                    </div>

                    <!-- Publish Schedule -->
                    <div class="flex flex-col gap-4">
                        <ButtonComponent text="PUBLISH SCHEDULE" variant="polygonLeft"
                            :leftIcon="'https://i.ibb.co/S74jfvBw/Icon-1.png'" :leftIconClass="`
                            w-6 h-6 transition duration-200
                            filter brightness-0
                            group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]
                            `" />
                        <ShowCodeToggle :code="demoSnippets.buttons.publishSchedule" />
                    </div>

                    <!-- Add-on Service -->
                    <div class="flex flex-col gap-4">
                    <!-- Add-on Service -->
                    <div class="flex flex-col gap-4">
                        <ButtonComponent text="add-on service" variant="none"
                            customClass="group bg-gray-900 flex justify-center items-center gap-2 min-w-14 px-2 py-1 text-center justify-start text-green-500 text-xs font-semibold capitalize tracking-tight hover:text-black hover:bg-[#07F468]"
                            :leftIcon="'https://i.ibb.co.com/RpWmJkcb/plus.webp'" :leftIconClass="`
                            w-3 h-3 transition duration-200 group-hover:[filter:brightness(0)_saturate(100%)]
                            rounded-sm  outline outline-[1.50px] outline-offset-[-0.75px] `" />
                        <ShowCodeToggle :code="demoSnippets.buttons.addonService" />
                    </div>

                    <!-- Add-on Service V2 -->
                    <div class="flex flex-col gap-4">
                        <ButtonComponent text="add-on service" variant="none"
                            customClass="group bg-gray-900 flex justify-center items-center gap-2 min-w-14 px-2 py-1 text-center justify-start text-green-500 text-xs font-semibold capitalize tracking-tight hover:text-black hover:bg-[#07F468]"
                            :leftIcon="'https://i.ibb.co.com/bRYvsTVs/Icon.png'" :leftIconClass="`
                            w-3 h-3 transition duration-200 group-hover:[filter:brightness(0)_saturate(100%)]
                            `" />
                        <ShowCodeToggle :code="demoSnippets.buttons.addonServiceV2" />
                    </div>

                    <!-- Proceed Payment -->
                    <div class="flex flex-col gap-4">
                        <ButtonComponent text="Proceed Payment" variant="checkoutProceedpayment"
                            :rightIcon="'https://i.ibb.co.com/NdmC2BjP/arrow-right.webp'"
                            :rightIconClass="`w-6 h-6 [filter:brightness(0)_saturate(100%)] group-hover/button:[filter:brightness(0)_saturate(100%)_invert(67%)_sepia(19%)_saturate(5664%)_hue-rotate(95deg)_brightness(112%)_contrast(94%)]`" />
                        <ShowCodeToggle :code="demoSnippets.buttons.proceedPayment" />
                    </div>



                    <!-- Action Green (X) -->
                    <div class="flex flex-col gap-4">
                        <ButtonComponent text="Continue with X (Twitter)" variant="actionGreen"
                            leftIcon="https://i.ibb.co.com/HTj6TpFh/x.webp"
                            leftIconClass="w-6 h-6 group-hover/xbtn:[filter:brightness(0)_saturate(100%)_invert(3%)_sepia(58%)_saturate(1835%)_hue-rotate(205deg)_brightness(93%)_contrast(94%)]" />
                        <ShowCodeToggle :code="demoSnippets.buttons.actionGreenX" />
                    </div>

                </div>
                </div>
            </section>

        </div>
    </div>
</template>

<script setup>
import { ref, reactive, defineComponent, h } from 'vue';

// Components
import Spinner from '@/components/ui/spinner/Spinner.vue';
import MediaCardV1 from '@/components/mediaCardsVariations/MediaCardV1.vue';
import MediaCardV2 from '@/components/mediaCardsVariations/MediaCardV2.vue';
import InputComponentDashboard from '@/components/input/InputComponentDashboard.vue';
import Heading from '@/components/default/Heading.vue';
import Paragraph from '@/components/default/Paragraph.vue';
import NotificationCard from '@/components/ui/card/dashboard/NotificationCard.vue';
import QuillEditor from '@/components/input/QuillEditor.vue';
import SubscriptionCard from '@/templates/profileAbdullah/components/SubscriptionCard.vue';
import CountryStateDemo from '@/templates/dev/CountryStateDemo.vue';
import DemoSectionHeader from '@/templates/dev/DemoSectionHeader.vue';
import DemoCard from '@/templates/dev/DemoCard.vue';
import ButtonComponent from '@/components/button/ButtonComponent.vue';
import { tierData } from "/public/data/TierData.js";
// Heroicons
import {
    MagnifyingGlassIcon, EnvelopeIcon, UserIcon, InformationCircleIcon, StarIcon,
    ArrowDownTrayIcon, ArrowRightIcon, ShareIcon, CheckIcon, TrashIcon,
    ArrowTopRightOnSquareIcon, FilmIcon, PhotoIcon, BuildingLibraryIcon,
    BellAlertIcon, EyeIcon, EyeSlashIcon
} from '@heroicons/vue/24/outline';
import TierCard from '@/components/ui/card/dashboard/TierCard.vue';
import EventCard from '@/components/ui/card/dashboard/EventCard.vue';
import Cart from '@/components/Cart.vue';


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


// ===== Reactive model values =====
const vals = reactive({
    // InputComponentDashboard
    icd1: '', icd2: '', icd3: '', icd4: '', icd5: '', icd6: '',
    icd7: '', icd8: '', icd9: '', icd10: '', icd11: '', icd12: '',
    // BaseInput
    bi1: '', bi2: '', bi3: 'Readonly Text', bi4: 5, bi5: '', bi6: '', bi7: '', bi8: 'bad@', bi9: 'good@email.com', bi10: '',
    // InputAuthComponent
    ia1: '', ia2: '', ia3: '', ia4: '', ia5: '', ia6: '', ia7: 'disabled text', ia8: '', ia9: '', ia10: '',
    // InputDefaultComponent
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
    q1: '', q2: '', q3: '<p><strong>Hello World!</strong> This is pre-loaded content.</p>', q4: '',
});

// ===== NotificationCard open states =====
const notifOpen = reactive({
    success: true,
    error: true,
    warning: true,
    info: true,
});

// ===== Media data =====
const AVATAR = 'https://i.ibb.co.com/jk1F8MqJ/featured-media-bg.webp';
const POSTER = 'https://i.ibb.co.com/jk1F8MqJ/featured-media-bg.webp';

const demoMedia = {
    default: { type: 'video', videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', poster: POSTER, title: 'Default Media Card Title', duration: '5:23', timeAgo: '2d', likes: '1.2K', views: '8.4K', creatorName: 'Creator Name', avatar: AVATAR },
    resume: { type: 'video', videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', poster: POSTER, title: 'Resume Watching', duration: '12:45', timeAgo: '1w', likes: '3.5K', views: '22K', creatorName: 'Creator Name', avatar: AVATAR },
    purchased: { type: 'video', videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', poster: POSTER, title: 'Purchased Content Title', duration: '45:00', timeAgo: '3d', likes: '900', views: '5K', creatorName: 'Creator Name', avatar: AVATAR },
    latest: { type: 'video', videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', poster: POSTER, title: 'Latest Upload Title', duration: '3:10', timeAgo: '1h', likes: '221', views: '1.1K', creatorName: 'Creator Name', avatar: AVATAR },
    grid: { type: 'video', videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', poster: POSTER, title: 'Grid View Card Title', duration: '7:30', timeAgo: '5d', likes: '450', views: '3.3K', creatorName: 'Creator Name', avatar: AVATAR },
    grid2: { type: 'video', videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', poster: POSTER, title: 'Buy & Subscribe Card', duration: '10:00', timeAgo: '2d', likes: '800', views: '4K', creatorName: 'Creator Name', avatar: AVATAR },
    image: { type: 'image', poster: POSTER, title: 'Image Type Card', duration: '', timeAgo: '4d', likes: '300', views: '2K', creatorName: 'Creator Name', avatar: AVATAR },
    gallery: { type: 'gallery', poster: POSTER, title: 'Gallery Type Card', duration: '', timeAgo: '1d', likes: '600', views: '5.5K', creatorName: 'Creator Name', avatar: AVATAR },
    // MediaCardV2
    v2_video: { type: 'video', videoUrl: '', poster: POSTER, title: 'V2 Video Card', duration: '6:00', timeAgo: '2h', likes: '300', views: '1.2K', showTag: false },
    v2_image: { type: 'image', poster: POSTER, title: 'V2 Image Card', duration: '', timeAgo: '1d', likes: '150', views: '800', showTag: false },
    v2_tagged_green: { type: 'video', videoUrl: '', poster: POSTER, title: 'Free Video', duration: '3:30', timeAgo: '3d', likes: '100', views: '500', showTag: true, tagText: 'Free', tagColor: 'green' },
    v2_tagged_pink: { type: 'video', videoUrl: '', poster: POSTER, title: 'Subscriber Only', duration: '8:45', timeAgo: '1w', likes: '500', views: '3K', showTag: true, tagText: 'Sub Only', tagColor: 'pink' },
    v2_gallery: { type: 'gallery', poster: POSTER, title: 'Gallery', duration: '', timeAgo: '2d', likes: '80', views: '300', showTag: false, galleryCount: 7 },
    v2_locked: { type: 'image', poster: POSTER, title: 'Locked Content', duration: '', timeAgo: '5d', likes: '200', views: '1K', showTag: false, isLocked: true },
};

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
        myMedia: `<!-- Template -->\n<MediaCardV1 \n  v-for="item in myMediaList" \n  :key="item.id" \n  :media="item" \n  variant="default" \n  @menu-action="handleAction" \n/>\n\n<!-- Script Data -->\nconst myMediaList = ref([\n  {\n    id: 1,\n    type: 'video',\n    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',\n    poster: 'https://i.ibb.co.com/jk1F8MqJ/featured-media-bg.webp',\n    title: 'Took a walk in the park.',\n    duration: '14:55',\n    timeAgo: '5mo',\n    likes: 0,\n    views: 4,\n    creatorName: 'Creator Allen',\n    avatar: 'https://i.ibb.co.com/jk1F8MqJ/featured-media-bg.webp'\n  }\n]);\n\nconst handleAction = (action) => {\n  console.log("Action triggered:", action);\n};`,
        resume: `<!-- Template -->\n<MediaCardV1 \n  :media="myMediaList[0]" \n  variant="resume" \n/>`,
        latest: `<!-- Template -->\n<MediaCardV1 \n  :media="latestMediaItem" \n  variant="latest" \n/>\n\n<!-- Script Data -->\nconst latestMediaItem = ref({\n  id: 3,\n  type: 'video',\n  videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',\n  poster: 'https://i.ibb.co.com/jk1F8MqJ/featured-media-bg.webp',\n  title: 'My 2nd coming soon',\n  duration: '14:55',\n  timeAgo: '5mo',\n  likes: 0,\n  views: 4,\n  creatorName: 'Creator Allen',\n  avatar: 'https://i.ibb.co.com/jk1F8MqJ/featured-media-bg.webp'\n});`,
        purchased: `<!-- Template -->\n<MediaCardV1 \n  :media="purchasedMediaItem" \n  variant="purchased" \n  @menu-action="handleAction" \n/>\n\n<!-- Script Data -->\nconst purchasedMediaItem = ref({\n  id: 4,\n  type: 'video',\n  videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',\n  poster: 'https://i.ibb.co.com/jk1F8MqJ/featured-media-bg.webp',\n  title: 'Took a walk in the park today.',\n  duration: '14:55',\n  timeAgo: '5mo',\n  likes: 0,\n  views: 4,\n  creatorName: 'Mistress Jessica',\n  avatar: 'https://i.ibb.co.com/jk1F8MqJ/featured-media-bg.webp'\n});`,
        gridView: `<!-- Template -->\n<MediaCardV1 \n  v-for="item in gridMediaList" \n  :key="item.id" \n  :media="item" \n  variant="grid" \n  @menu-action="handleAction" \n/>\n\n<!-- Script Data -->\nconst gridMediaList = ref([\n  {\n    id: 101,\n    type: 'image',\n    poster: 'https://i.ibb.co.com/bjGQxr5S/sample-bg-image.webp',\n    title: 'Took a walk in the park this morning',\n    duration: '',\n    timeAgo: '5mo',\n    likes: 0,\n    views: 4,\n    creatorName: 'Mistress Jessica',\n    avatar: 'https://i.ibb.co.com/jk1F8MqJ/featured-media-bg.webp'\n  },\n  {\n    id: 102,\n    type: 'video',\n    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',\n    poster: 'https://i.ibb.co.com/jk1F8MqJ/featured-media-bg.webp',\n    title: 'Morning workout session',\n    duration: '10:30',\n    timeAgo: '2d',\n    likes: 120,\n    views: 1200,\n    creatorName: 'Mistress Jessica',\n    avatar: 'https://i.ibb.co.com/jk1F8MqJ/featured-media-bg.webp'\n  }\n]);`,
    },
    mediaV2: {
        gallery: `<!-- Template -->\n<MediaCardV2 :media="galleryCard" />\n\n<!-- Script Data -->\nconst galleryCard = ref({\n  id: 1,\n  type: 'gallery',\n  poster: 'https://i.ibb.co.com/bjGQxr5S/sample-bg-image.webp',\n  title: 'Took a walk in the park this morning',\n  timeAgo: '5mo',\n  likes: 0,\n  views: 4,\n  galleryCount: 7,\n  isLocked: true,               \n  showTag: true,                \n  tagText: 'Subscriber Exclusive',\n  tagColor: 'green'\n});`,
        image: `<!-- Template -->\n<MediaCardV2 :media="imageCard" />\n\n<!-- Script Data -->\nconst imageCard = ref({\n  id: 2,\n  type: 'image',\n  poster: 'https://i.ibb.co.com/bjGQxr5S/sample-bg-image.webp',\n  title: 'Took a walk in the park this morning',\n  timeAgo: '5mo',\n  likes: 0,\n  views: 4,\n  isLocked: false,              \n  showTag: true,                \n  tagText: 'Subscribe or Buy',  \n  tagColor: 'pink'              \n});`,
        video: `<!-- Template -->\n<MediaCardV2 :media="videoCard" />\n\n<!-- Script Data -->\nconst videoCard = ref({\n  id: 3,\n  type: 'video',\n  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',\n  poster: 'https://i.ibb.co.com/jk1F8MqJ/featured-media-bg.webp',\n  title: 'Took a walk in the park this morning',\n  duration: '14:55',\n  timeAgo: '5mo',\n  likes: 0,\n  views: 4,\n  isLocked: true,               \n  showTag: false,\n  tagText: '',\n  tagColor: 'green'\n});`,
    },
    heading: {
        h1Primary: `<Heading \n  text="Primary H1" \n  tag="h1" \n  theme="defaultPrimaryHeading" \n  version="basic" \n  class="!text-black" \n/>`,
        h2Secondary: `<Heading \n  text="Secondary H2" \n  tag="h2" \n  theme="defaultSecondaryHeading" \n  version="basic" \n  class="!text-black" \n/>`,
        h3Section: `<Heading \n  text="Section H3" \n  tag="h3" \n  theme="sectionHeading" \n  version="basic" \n  class="!text-black" \n/>`,
        h2Dashboard: `<Heading \n  text="Dashboard Title" \n  tag="h2" \n  theme="dashboardHeading" \n  version="basic" \n/>`,
        h2Auth: `<Heading \n  text="Login" \n  tag="h2" \n  theme="AuthHeading" \n  version="basic" \n  class="!text-black" \n/>`,
        h4Form: `<Heading \n  text="Profile Settings" \n  tag="h4" \n  theme="formHeading" \n  version="basic" \n/>`,
        h1Demo: `<Heading \n  text="Demo H1 Bold" \n  tag="h1" \n  theme="demoHeadings" \n  version="basic" \n/>`,
        h3Demo: `<Heading \n  text="Demo H3 Medium" \n  tag="h3" \n  theme="demoHeadings" \n  version="basic" \n/>`,
        withIcon: `<Heading \n  text="With Icon" \n  tag="h3" \n  theme="defaultSecondaryHeading" \n  version="basic" \n  class="!text-black" \n  :leftIcon="StarIcon" \n/>`,
        order: `<Heading \n  text="Order #1234" \n  tag="h1" \n  theme="orderHeading" \n  version="basic" \n/>`,
    },
    paragraph: {
        default: `<Paragraph \n  text="This is a default paragraph with standard styling." \n  class="!text-black" \n/>`,
        small: `<Paragraph \n  text="Small text paragraph for captions." \n  class="!text-black text-sm" \n/>`,
        large: `<Paragraph \n  text="Large paragraph text." \n  class="!text-black text-xl" \n/>`,
        bold: `<Paragraph \n  text="Bold paragraph text." \n  class="!text-black font-bold" \n/>`,
        blue: `<Paragraph \n  text="Blue paragraph text." \n  fontColor="text-blue-600" \n/>`,
        error: `<Paragraph \n  text="This field is required." \n  fontColor="text-red-500" \n  fontSize="text-sm" \n/>`,
        success: `<Paragraph \n  text="Action successful!" \n  fontColor="text-green-600" \n  fontWeight="font-medium" \n/>`,
        italic: `<Paragraph \n  text="Italic paragraph text for notes." \n  fontFamily="italic" \n  fontColor="text-gray-500" \n/>`,
        withIcon: `<Paragraph \n  text="Info message here" \n  :leftIcon="InformationCircleIcon" \n  fontSize="text-sm" \n  fontColor="text-blue-600" \n/>`,
        xs: `<Paragraph \n  text="Helper text displayed below the input field." \n  fontSize="text-xs" \n  fontColor="text-gray-400" \n/>`,
    },
    icd: {
        default: `<InputComponentDashboard \n  v-model="inputs.basic" \n  placeholder="carrot_popxoxo123" \n  showLabel \n  labelText="Username" \n  description="Usernames cannot be changed..." \n/>`,
        email: `<InputComponentDashboard \n  v-model="inputs.basic" \n  placeholder="mscarrot_pops@gmail.com" \n  showLabel \n  labelText="Email" \n/>`,
        firstName: `<InputComponentDashboard \n  v-model="inputs.basic" \n  placeholder="" \n  showLabel \n  labelText="First Name" \n/>`,
        lastName: `<InputComponentDashboard \n  v-model="inputs.basic" \n  placeholder="" \n  showLabel \n  labelText="Last Name" \n/>`,
        title: `<InputComponentDashboard \n  v-model="inputs.basic" \n  placeholder="Event Title" \n  showLabel \n  labelText="Title" \n/>`,
        coPerformer: `<InputComponentDashboard \n  placeholder="Search by username & email" \n  v-model="inputs.basic" \n  showLabel \n  label-text="Co-performer (Optional)" \n  :left-icon="MagnifyingGlassIcon" \n  optionalLabel \n/>`,
        password: `<InputComponentDashboard \n  v-model="inputs.password" \n  placeholder="Old Password" \n  showLabel \n  labelText="Old Password" \n  @rightIconClick="inputs.showPass = !inputs.showPass" \n/>`,
        rightIcon: `<InputComponentDashboard \n  v-model="inputs.email" \n  placeholder="Enter email..." \n  showLabel \n  labelText="Email Support" \n  :rightIcon="EnvelopeIcon" \n/>`,
        requiredStar: `<InputComponentDashboard \n  v-model="inputs.email" \n  placeholder="Required field" \n  showLabel \n  labelText="Full Name" \n  requiredDisplay="*" \n/>`,
        bothIcons: `<InputComponentDashboard \n  v-model="inputs.email" \n  placeholder="Search with filters..." \n  showLabel \n  labelText="Advanced Search" \n  :leftIcon="MagnifyingGlassIcon" \n  :rightIcon="Bars3Icon" \n  clickableRightIcon \n/>`,
        textarea: `<InputComponentDashboard \n  id="input_g" \n  type="textarea" \n  show-label \n  v-model="inputs.bio" \n  textAreaRows="3" \n  label-text="" \n  placeholder="Description (Optional)" \n  description="0/200 characters" \n/>`,
    },
    notification: {
        warning: `<NotificationCard \n  variant="warning" \n  title="Media Content Required" \n  description="Your profile currently has no media..." \n  timestamp="1w" \n  :icon="FilmIcon" \n  :badgeIcon="ArrowUpTrayIcon" \n  dismissLabel="Dismiss" \n  actionLabel="Take Action" \n  v-model="notifOpen.warning" \n/>`,
        success: `<NotificationCard \n  variant="success" \n  title="Congratulations" \n  description="Your media has been approved." \n  timestamp="1m" \n  :icon="PhotoIcon" \n  :badgeIcon="CheckIcon" \n  dismissLabel="Dismiss" \n  actionLabel="Take Action" \n  v-model="notifOpen.success" \n/>`,
        info: `<NotificationCard \n  variant="info" \n  title="Bank Details Required" \n  description="To ensure seamless transactions, please complete..." \n  timestamp="3m" \n  :icon="BuildingLibraryIcon" \n  :badgeIcon="InformationCircleIcon" \n  dismissLabel="Dismiss" \n  actionLabel="Take Action" \n  v-model="notifOpen.info" \n/>`,
        error: `<NotificationCard \n  variant="error" \n  title="Action Required" \n  description="Critical update needed for account security..." \n  timestamp="Just now" \n  :icon="BellAlertIcon" \n  :badgeIcon="TrashIcon" \n  dismissLabel="Dismiss" \n  actionLabel="Finalize" \n  v-model="notifOpen.error" \n/>`,
    },
    quill: {
        default: `<QuillEditor v-model="vals.q1" />`,
        initial: `<QuillEditor v-model="vals.q3" />`,
    },
    tierCard: {
        1: `<!-- Template -->\n<TierCard :tier="tierData[0]" />\n\n<!-- Script Data (Source: TierData.js) -->\nconst tier = {\n  id: 1,\n  title: "My VVIP Lounge ❤️️️",\n  backgroundImage: "https://i.ibb.co.com/ht8z7r27/card-bg-gradient.webp",\n  plans: [\n    { id: '1m', label: '1 month', price: '55.86', discount: '0', isCurrent: false },\n    { id: '3m', label: '3 months', price: '124.86', discount: '25', isCurrent: false },\n    { id: '6m', label: '6 months', price: '221.86', discount: '34', isCurrent: false },\n    { id: '1y', label: '1 year', price: '320.86', discount: '52', isCurrent: false }\n  ],\n  theme: {\n    textPrimary: '#FB0464',\n    textSecondary: '#111827',\n    buttonBg: '#FB0464',\n    buttonText: '#FFFFFF',\n    tagBg: '#FEF2F2',\n    tagText: '#FB0464',\n    progressBg: '#FEE2E2',\n    progressFill: '#FB0464'\n  },\n  footer: {\n    type: 'spend',\n    progress: { leftText: "Spend $200 more to claim", rightText: "$200.00", width: "80%" }\n  }\n};`,
        2: `<TierCard :tier="tierData[1]" />`,
        3: `<TierCard :tier="tierData[2]" />`,
        4: `<TierCard :tier="tierData[3]" />`,
        5: `<TierCard :tier="tierData[4]" />`,
    },
    eventCard: {
        orangeButton: `<EventCard theme="orange" :hasButton="true" />`,
        orangeProgress: `<EventCard theme="orange" :hasButton="false" />`,
        pinkButton: `<EventCard theme="pink" :hasButton="true" />`,
        pinkProgress: `<EventCard theme="pink" :hasButton="false" />`,
    },
    cart: {
        default: `<!-- Template -->\n<Cart />\n\n<!-- Interaction Logic (Custom Events) -->\n// To add an item via console or script:\nwindow.dispatchEvent(new CustomEvent('cart:add', {\n  detail: {\n    item: {\n      title: "NBA Hoops Card",\n      productId: "nba123",\n      qty: 1,\n      price: 12.23,\n      originalPrice: 20.00,\n      shipping: 12.23,\n      seller: "Princess Carrot Pop",\n      image: "https://i.ibb.co.com/70sHrpv/featured-media-bg.webp",\n      promoCodes: ["PROMOCODE2025", "MEMBER BENEFIT"]\n    }\n  }\n}));`,
    },
    spinner: {
        img: `<Spinner \n  src="https://i.ibb.co.com/TM7mTrZJ/spinner.webp" \n  size="2xl" \n/>`,
        styled: `<Spinner \n  thickness="3.5" \n  size="lg" \n  color="text-green-500" \n  trackColor="text-white" \n/>`,
        thin: `<Spinner \n  thickness="1" \n  size="3xl" \n  color="text-green-500" \n  trackColor="text-white" \n/>`,
    },
    buttons: {
        authPink: `<ButtonComponent \n  :text="buttonText" \n  variant="authPink" \n  type="submit" \n/>`,
        authTransparent: `<ButtonComponent \n  text="Continue with Telegram" \n  variant="authTransparent" \n  size="lg" \n  :leftIcon="telegramIcon" \n  leftIconClass="w-8 h-8" \n/>`,
        newEvents: `<ButtonComponent \n  text="NEW EVENTS" \n  variant="none" \n  customClass="group w-full h-12 min-h-10 px-4 py-2 text-base font-semibold bg-black rounded-[48px] inline-flex justify-center items-center gap-2 text-[#07F468] hover:text-black hover:bg-[#07F468]" \n  :leftIcon="'https://i.ibb.co.com/RpWmJkcb/plus.webp'" \n  :leftIconClass="\`w-6 h-6 transition duration-200 group-hover:[filter:brightness(0)_saturate(100%)]\`" \n/>`,
        polygonNext: `<ButtonComponent \n  text="Next" \n  variant="polygonLeft" \n  :rightIcon="'https://i.ibb.co.com/hx8ztZFf/svgviewer-png-output-8.webp'" \n  :rightIconClass="\`w-6 h-6 transition duration-200 filter brightness-0 invert-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]\`" \n  btnBg="#07f468" \n  btnHoverBg="black" \n  btnText="black" \n  btnHoverText="#07f468" \n/>`,
        publishSchedule: `<ButtonComponent \n  text="PUBLISH SCHEDULE" \n  variant="polygonLeft" \n  :leftIcon="'https://i.ibb.co.com/S74jfvBw/Icon-1.png'" \n  :leftIconClass="\`w-6 h-6 transition duration-200 filter brightness-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]\`" \n/>`,
        addonService: `<ButtonComponent \n  text="add-on service" \n  variant="none" \n  customClass="group bg-gray-900 flex justify-center items-center gap-2 min-w-14 px-2 py-1 text-center justify-start text-green-500 text-xs font-semibold capitalize tracking-tight hover:text-black hover:bg-[#07F468]" \n  :leftIcon="'https://i.ibb.co.com/RpWmJkcb/plus.webp'" \n  :leftIconClass="\`w-3 h-3 transition duration-200 group-hover:[filter:brightness(0)_saturate(100%)] rounded-sm outline outline-[1.50px] outline-offset-[-0.75px]\`" \n/>`,
        addonServiceV2: `<ButtonComponent \n  text="add-on service" \n  variant="none" \n  customClass="group bg-gray-900 flex justify-center items-center gap-2 min-w-14 px-2 py-1 text-center justify-start text-green-500 text-xs font-semibold capitalize tracking-tight hover:text-black hover:bg-[#07F468]" \n  :leftIcon="'https://i.ibb.co.com/bRYvsTVs/Icon.png'" \n  :leftIconClass="\`w-3 h-3 transition duration-200 group-hover:[filter:brightness(0)_saturate(100%)]\`" \n/>`,
        proceedPayment: `<ButtonComponent \n  text="Proceed Payment" \n  variant="checkoutProceedpayment" \n  :rightIcon="'https://i.ibb.co.com/NdmC2BjP/arrow-right.webp'" \n  :rightIconClass="\`w-6 h-6 [filter:brightness(0)_saturate(100%)] group-hover/button:[filter:brightness(0)_saturate(100%)_invert(67%)_sepia(19%)_saturate(5664%)_hue-rotate(95deg)_brightness(112%)_contrast(94%)]\`" \n/>`,
        actionGreenX: `<ButtonComponent \n  text="Continue with X (Twitter)" \n  variant="actionGreen" \n  leftIcon="https://i.ibb.co.com/HTj6TpFh/x.webp" \n  leftIconClass="w-6 h-6 group-hover/xbtn:[filter:brightness(0)_saturate(100%)_invert(3%)_sepia(58%)_saturate(1835%)_hue-rotate(205deg)_brightness(93%)_contrast(94%)]" \n/>`,
    }
};

z


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
    basic: '',
    email: '',
    password: '',
    showPass: false,
    error: 'abc-123',
    success: 'my-profile-slug',
    price: '99.99',
    bio: ''
});

// 1. My Media Data
const myMediaList = ref([
    {
        id: 1,
        type: 'video',
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        poster: POSTER,
        title: 'Took a walk in the park.',
        duration: '14:55',
        timeAgo: '5mo',
        likes: 0,
        views: 4,
        creatorName: 'Creator Allen',
        avatar: 'https://i.ibb.co.com/jk1F8MqJ/featured-media-bg.webp'
    }
]);

// 2. Latest Media Data
const latestMediaItem = ref({
    id: 3,
    type: 'video',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: POSTER,
    title: 'My 2nd coming soon',
    duration: '14:55',
    timeAgo: '5mo',
    likes: 0,
    views: 4,
    creatorName: 'Creator Allen',
    avatar: 'https://i.ibb.co.com/jk1F8MqJ/featured-media-bg.webp'
});

// 3. Purchased Media Data
const purchasedMediaItem = ref({
    id: 4,
    type: 'video',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: POSTER,
    title: 'Took a walk in the park today.',
    duration: '14:55',
    timeAgo: '5mo',
    likes: 0,
    views: 4,
    creatorName: 'Mistress Jessica',
    avatar: 'https://i.ibb.co.com/jk1F8MqJ/featured-media-bg.webp'
});

// 4. Grid Media Data (Image, Video, Gallery)
const gridMediaList = ref([
    {
        id: 101,
        type: 'image',
        poster: 'https://i.ibb.co.com/bjGQxr5S/sample-bg-image.webp',
        title: 'Took a walk in the park this morning',
        duration: '',
        timeAgo: '5mo',
        likes: 0,
        views: 4,
        creatorName: 'Mistress Jessica',
        avatar: 'https://i.ibb.co.com/jk1F8MqJ/featured-media-bg.webp'
    },
    {
        id: 102,
        type: 'video',
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        poster: POSTER,
        title: 'Took a walk in the park this morning',
        duration: '14:55',
        timeAgo: '5mo',
        likes: 0,
        views: 4,
        creatorName: 'Mistress Jessica',
        avatar: 'https://i.ibb.co.com/jk1F8MqJ/featured-media-bg.webp'
    },
    {
        id: 103,
        type: 'gallery',
        poster: 'https://i.ibb.co.com/bjGQxr5S/sample-bg-image.webp',
        title: 'Took a walk in the park this morning',
        duration: '',
        timeAgo: '5mo',
        likes: 0,
        views: 4,
        creatorName: 'Mistress Jessica',
        avatar: 'https://i.ibb.co.com/jk1F8MqJ/featured-media-bg.webp'
    }
]);

// 1. CARD 1 (Gallery): Locked + Green Tag
const galleryCard = ref({
    id: 1,
    type: 'gallery',
    poster: 'https://i.ibb.co.com/bjGQxr5S/sample-bg-image.webp',
    title: 'Took a walk in the park this morning',
    timeAgo: '5mo',
    likes: 0,
    views: 4,
    galleryCount: 7,
    // Configuration:
    isLocked: true,               // Lock Icon: Visible
    showTag: true,                // Tag: Visible
    tagText: 'Subscriber Exclusive',
    tagColor: 'green'
});

// 2. CARD 2 (Image): Unlocked + Pink Tag
const imageCard = ref({
    id: 2,
    type: 'image',
    poster: 'https://i.ibb.co.com/bjGQxr5S/sample-bg-image.webp',
    title: 'Took a walk in the park this morning',
    timeAgo: '5mo',
    likes: 0,
    views: 4,
    // Configuration:
    isLocked: false,              // Lock Icon: Hidden
    showTag: true,                // Tag: Visible
    tagText: 'Subscribe or Buy',  // Custom Text
    tagColor: 'pink'              // Pink Color
});

// 3. CARD 3 (Video): Locked + No Tag
const videoCard = ref({
    id: 3,
    type: 'video',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: POSTER,
    title: 'Took a walk in the park this morning',
    duration: '14:55',
    timeAgo: '5mo',
    likes: 0,
    views: 4,
    // Configuration:
    isLocked: true,               // Lock Icon: Visible (Logic ke hisaab se)
    showTag: false,               // Tag: Hidden
    tagText: '',                  // Empty
    tagColor: 'green'             // Irrelevant
});

// Button Showcase Data
const buttonText = ref("Auth Button");
const telegramIcon = "https://i.ibb.co.com/8LKPbgm1/telegram.webp"; // Using a consistent placeholder if not found

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
