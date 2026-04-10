<template>
    <div class="bg-[#ececec] py-16 px-6 font-sans antialiased text-slate-900">
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
                <p class="text-indigo-900/40 font-bold tracking-[0.3em] uppercase text-xs">
                    Modular Dashboard System & UI Laboratory
                </p>
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
                        
                            <InputComponentDashboard 
                                v-model="inputs.basic" 
                                placeholder="carrot_popxoxo123" 
                                showLabel
                                labelText="Username"
                                description="Usernames cannot be changed after your first month on our website, but special circumstances may allow for exceptions. Please contact us if you need assistance with changing your username."
                            />
                        
                        <ShowCodeToggle :code="demoSnippets.icd.default" />
                    </div>

                    <div class="flex flex-col gap-3">
                        
                            <InputComponentDashboard 
                                v-model="inputs.basic" 
                                placeholder="mscarrot_pops@gmail.com" 
                                showLabel
                                labelText="Email"
                            />
                        
                        <ShowCodeToggle :code="demoSnippets.icd.email" />
                    </div>

                     <div class="flex flex-col gap-3">
                        
                            <InputComponentDashboard 
                                v-model="inputs.basic" 
                                placeholder=""
                                showLabel
                                labelText="First Name"
                            />
                        
                        <ShowCodeToggle :code="demoSnippets.icd.firstName" />
                    </div>

                    <div class="flex flex-col gap-3">
                        
                            <InputComponentDashboard 
                                v-model="inputs.basic" 
                                placeholder=""
                                showLabel
                                labelText="Last Name"
                            />
                        
                        <ShowCodeToggle :code="demoSnippets.icd.lastName" />
                    </div>

                    <div class="flex flex-col gap-3">
                        
                            <InputComponentDashboard 
                                v-model="inputs.basic" 
                                placeholder="Event Title"
                                showLabel
                                labelText="Title"
                            />
                        
                        <ShowCodeToggle :code="demoSnippets.icd.title" />
                    </div>

                     <div class="flex flex-col gap-3">
                         <InputComponentDashboard 
                         placeholder="Search by username & email"
                    v-model="inputs.basic" 
                    showLabel
                    label-text="Co-performer (Optional)"
                    :left-icon="MagnifyingGlassIcon"
                     optionalLabel class="w-full" />

                     <ShowCodeToggle :code="demoSnippets.icd.coPerformer" />
                     </div>

                    <!-- 2. Password with Toggle -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Password with Toggle</span>
                            <InputComponentDashboard 
                                v-model="inputs.password" 
                                placeholder="Old Password" 
                                showLabel
                                labelText="Old Password"
                                @rightIconClick="inputs.showPass = !inputs.showPass"
                                
                            />
                        <ShowCodeToggle :code="demoSnippets.icd.password" />
                    </div>

                   
                    <!-- 4. With Right Icon -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">With Right Icon</span>
                            <InputComponentDashboard 
                                v-model="inputs.email" 
                                placeholder="Enter email..." 
                                showLabel
                                labelText="Email Support" 
                                :rightIcon="EnvelopeIcon"
                                
                            />
                        <ShowCodeToggle :code="demoSnippets.icd.rightIcon" />
                    </div>

                    <!-- 5. Required Display -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Required (*)</span>
                            <InputComponentDashboard 
                                v-model="inputs.email" 
                                placeholder="Required field" 
                                showLabel
                                labelText="Full Name" 
                                requiredDisplay="*"
                                
                            />
                        <ShowCodeToggle :code="demoSnippets.icd.requiredStar" />
                    </div>


                    
                    <!-- 9. Prefix and Suffix Icons -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Both Icons (Left & Right)</span>
                        <div class="min-h-[100px] flex items-center">
                            <InputComponentDashboard 
                                v-model="inputs.email" 
                                placeholder="Search with filters..." 
                                showLabel
                                labelText="Advanced Search" 
                                :leftIcon="MagnifyingGlassIcon"
                                :rightIcon="Bars3Icon"
                                clickableRightIcon
                                
                            />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.icd.bothIcons" />
                    </div>

                    <!-- 10. Textarea -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Textarea</span>
                  
                           <InputComponentDashboard
                            id="input_g"
                            type="textarea"
                            show-label
                            v-model="inputs.bio"
                            textAreaRows="3"
                            label-text=""
                            placeholder="Description (Optional)"
                            description="0/200 characters"
                        />
                  
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
                <!-- Reopen buttons -->
                <div class="flex flex-wrap gap-2 mt-2">
                    <button v-for="key in Object.keys(notifOpen)" :key="key"
                        class="text-[0.65rem] px-4 py-1.5 bg-white hover:bg-slate-50 rounded-full text-slate-600 font-semibold capitalize transition shadow-sm border border-slate-200"
                        @click="notifOpen[key] = true">
                        Reopen {{ key }}
                    </button>
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

                    <!-- 2. Placeholder -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">With Placeholder</span>
                        <div class="bg-transparent overflow-hidden">
                            <QuillEditor v-model="vals.q2" placeholder="Start typing your story..." />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.quill.placeholder" />
                    </div>

                    <!-- 3. Initial Content -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">With Initial Content</span>
                        <div class="bg-transparent overflow-hidden">
                            <QuillEditor v-model="vals.q3" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.quill.initial" />
                    </div>

                    <!-- 4. Announcement -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider">Announcement Draft</span>
                        <div class="bg-transparent overflow-hidden">
                            <QuillEditor v-model="vals.q4" placeholder="Write your announcement..." />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.quill.announcement" />
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


            <!-- ===== SECTION: VueDatePicker ===== -->
            <section class="flex flex-col gap-6 mb-20">
                <DemoSectionHeader title="VueDatePicker" />
                <p class="text-xs text-gray-400 -mt-4">
                    All pickers are always-visible (inline) calendars. Config-driven: <code>mode</code>,
                    <code>enableTime</code>, <code>blockedDates</code>, <code>minDate/maxDate</code>, etc.
                </p>

                <!-- GROUP 1: Basic Modes -->
                <p class="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-4">Basic Modes</p>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <!-- Single Date -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Single Date
                            (Default)</span>
                        <div class="p-2">
                            <VueDatePicker v-model="dp.single" />
                            <p class="text-[10px] mt-2 text-gray-400 font-mono">{{ dp.single || '—' }}</p>
                        </div>
                        <ShowCodeToggle :code="demoSnippets.datepicker.single" />
                    </div>

                    <!-- Range Selection -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Range (Max 7
                            days)</span>
                        <div class="p-2">
                            <VueDatePicker v-model="dp.range"
                                :config="{ mode: 'range', maxRangeDays: 7, style: { theme: 'indigo' } }" />
                            <p class="text-[10px] mt-2 text-gray-400 font-mono">{{ dp.range?.start || '—' }} → {{
                                dp.range?.end || '—' }}</p>
                        </div>
                        <ShowCodeToggle :code="demoSnippets.datepicker.range" />
                    </div>

                    <!-- With Time Selection -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">With Time (Dark
                            Theme)</span>
                        <div class="p-2">
                            <VueDatePicker v-model="dp.withTime"
                                :config="{ enableTime: true, format: 'DD/MM/YYYY HH:mm', style: { theme: 'dark' } }" />
                            <p class="text-[10px] mt-2 text-gray-400 font-mono">{{ dp.withTime || '—' }}</p>
                        </div>
                        <ShowCodeToggle :code="demoSnippets.datepicker.withTime" />
                    </div>

                    <!-- Blocked Dates -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[14px] text-gray-400 uppercase tracking-widest font-semibold">Blocked
                            Dates</span>
                        <div class="p-2">
                            <VueDatePicker v-model="dp.blocked"
                                :config="{ style: { theme: 'red' }, blockedDates: [new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]] }" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.datepicker.blocked" />
                    </div>
                </div>

                <!-- GROUP 2: Advanced Styling -->
                <p class="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-8">Advanced Styling</p>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <!-- Teal Header -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Teal Header +
                            Blue Theme</span>
                        <div class="p-2">
                            <VueDatePicker v-model="dp.tealHeader"
                                :config="{ style: { headerClass: 'bg-teal-600 text-white', theme: 'blue' } }" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.datepicker.tealHeader" />
                    </div>

                    <!-- Square -->
                    <div class="flex flex-col gap-3">
                        <span class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Square
                            (rounded-none)</span>
                        <div class="p-2">
                            <VueDatePicker v-model="dp.square"
                                :config="{ style: { rounded: 'rounded-none', todayStyle: 'background' } }" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.datepicker.square" />
                    </div>

                </div>

                <!-- GROUP 3: Business Edge Cases -->
                <p class="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-8">Business & Validation</p>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <!-- Glassmorphism -->
                    <div class="flex flex-col gap-3 lg:col-span-1">
                        <span
                            class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Glassmorphism</span>
                        <div
                            class="flex justify-center p-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl">
                            <VueDatePicker v-model="dp.glass"
                                :config="{ style: { customClass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white', headerClass: 'bg-transparent text-white border-white/10', theme: 'indigo' } }" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.datepicker.glass" />
                    </div>

                    <!-- Min/Max Date -->
                    <div class="flex flex-col gap-3 py-4">
                        <span class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Min/Max limits
                            (2026 only)</span>
                        <div class="p-2">
                            <VueDatePicker v-model="dp.minDate"
                                :config="{ minDate: '2026-01-01', maxDate: '2026-12-31' }" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.datepicker.minMax" />
                    </div>

                    <!-- Trip Planner -->
                    <div class="flex flex-col gap-3 py-4">
                        <span class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Trip Planner
                            (Tomorrow + 30d)</span>
                        <div class="p-2">
                            <VueDatePicker v-model="dp.trip"
                                :config="{ mode: 'range', minDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], style: { theme: 'indigo' } }" />
                        </div>
                        <ShowCodeToggle :code="demoSnippets.datepicker.trip" />
                    </div>
                </div>
            </section>



            <!-- ===== SECTION: Spinner ===== -->
            <section class="flex flex-col gap-6 mb-20">
                <DemoSectionHeader title="Spinner" />
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                    <!-- 1. Default -->
                    <div class="flex flex-col items-center gap-3 p-2">
                        <span class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Default</span>
                        <div class="h-12 flex items-center justify-center">
                            <Spinner />
                        </div>
                        <ShowCodeToggle code="<!-- Template -->\n<Spinner />" />
                    </div>

                    <!-- 2. Extra Small -->
                    <div class="flex flex-col items-center gap-3 p-2">
                        <span class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Extra
                            Small</span>
                        <div class="h-12 flex items-center justify-center">
                            <Spinner size="xs" />
                        </div>
                        <ShowCodeToggle code="<!-- Template -->\n<Spinner size='xs' />" />
                    </div>

                    <!-- 3. Small -->
                    <div class="flex flex-col items-center gap-3 p-2">
                        <span class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Small</span>
                        <div class="h-12 flex items-center justify-center">
                            <Spinner size="sm" />
                        </div>
                        <ShowCodeToggle code="<!-- Template -->\n<Spinner size='sm' />" />
                    </div>

                    <!-- 4. Large -->
                    <div class="flex flex-col items-center gap-3 p-2">
                        <span class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Large</span>
                        <div class="h-12 flex items-center justify-center">
                            <Spinner size="lg" />
                        </div>
                        <ShowCodeToggle code="<!-- Template -->\n<Spinner size='lg' />" />
                    </div>

                    <!-- 5. 2XL -->
                    <div class="flex flex-col items-center gap-3 p-2">
                        <span class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Huge
                            (2xl)</span>
                        <div class="h-12 flex items-center justify-center">
                            <Spinner size="2xl" />
                        </div>
                        <ShowCodeToggle code="<!-- Template -->\n<Spinner size='2xl' />" />
                    </div>

                    <!-- 6. Custom Color -->
                    <div class="flex flex-col items-center gap-3 p-2">
                        <span class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Color
                            (Pink)</span>
                        <div class="h-12 flex items-center justify-center">
                            <Spinner color="text-pink-500" />
                        </div>
                        <ShowCodeToggle code="<!-- Template -->\n<Spinner color='text-pink-500' />" />
                    </div>

                    <!-- 7. No Track -->
                    <div class="flex flex-col items-center gap-3 p-2">
                        <span class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">No Track</span>
                        <div class="h-12 flex items-center justify-center">
                            <Spinner :showTrack="false" color="text-indigo-600" />
                        </div>
                        <ShowCodeToggle code="<!-- Template -->\n<Spinner :showTrack='false' />" />
                    </div>

                    <!-- 8. Thick -->
                    <div class="flex flex-col items-center gap-3 p-2">
                        <span class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Thick
                            Stroke</span>
                        <div class="h-12 flex items-center justify-center">
                            <Spinner thickness="6" size="lg" />
                        </div>
                        <ShowCodeToggle code="<!-- Template -->\n<Spinner thickness='6' />" />
                    </div>

                    <!-- 9. Fast Speed -->
                    <div class="flex flex-col items-center gap-3 p-2">
                        <span class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Speed:
                            Fast</span>
                        <div class="h-12 flex items-center justify-center">
                            <Spinner speed="fast" color="text-orange-500" />
                        </div>
                        <ShowCodeToggle code="<!-- Template -->\n<Spinner speed='fast' />" />
                    </div>

                    <!-- 10. With Text -->
                    <div class="flex flex-col items-center gap-3 p-2 lg:col-span-2">
                        <span class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">With Text</span>
                        <div class="h-12 flex items-center justify-center">
                            <Spinner text="Loading your data..." color="text-teal-500" />
                        </div>
                        <ShowCodeToggle code="<!-- Template -->\n<Spinner text='Loading...' />" />
                    </div>

                    <!-- 11. Button Integration -->
                    <div class="flex flex-col items-center gap-3 p-2 lg:col-span-1">
                        <span class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">In Button</span>
                        <div class="h-12 flex items-center justify-center">
                            <button
                                class="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium inline-flex items-center">
                                <Spinner size="xs" color="text-white" trackColor="text-indigo-400" customClass="mr-2" />
                                Processing
                            </button>
                        </div>
                        <ShowCodeToggle
                            code="<!-- Template -->\n<button>\n  <Spinner size='xs' color='text-white' /> \n  Processing\n</button>" />
                    </div>

                    <!-- 12. Using Img Src -->
                    <div class="flex flex-col items-center gap-3 p-2 lg:col-span-1">
                        <span class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">SVG
                            Sprite</span>
                        <!-- <div class="h-12 flex items-center justify-center"> -->
                            <Spinner src="https://i.ibb.co.com/TM7mTrZJ/spinner.webp" size="2xl" />
                        <!-- </div> -->
                        <ShowCodeToggle code="<!-- Template -->\n<Spinner src='svg-path.svg' />" />
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
import VueDatePicker from '@/components/datePicker/VueDatePicker.vue';
import DemoSectionHeader from '@/templates/dev/DemoSectionHeader.vue';
import DemoCard from '@/templates/dev/DemoCard.vue';
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

// ===== VueDatePicker refs =====
const dp = reactive({
    // Basic
    single: null,
    range: { start: null, end: null },
    green: null,
    blocked: null,
    withTime: null,
    todayBg: null,
    // Advanced styling
    tealHeader: null,
    compact: null,
    largeRounded: null,
    noBorder: null,
    square: null,
    error: null,
    // Time combos
    rangeTime: { start: null, end: null },
    customFmt: null,
    appt: null,
    timeBlocked: null,
    // Edge cases
    maxRange1: { start: null, end: null },
    minDate: null,
    maxDate: null,
    mondayStart: null,
    pastOnly: null,
    futureOnly: null,
    // Business
    trip: { start: null, end: null },
    mono: null,
    debug: null,
    rangeBlocked: { start: null, end: null },
    glass: null,
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
        myMedia: `<!-- Template -->\n<MediaCardV1 \n  v-for="item in myMediaList" \n  :key="item.id" \n  :media="item" \n  variant="default" \n/>\n\n<!-- Script Data -->\nconst myMediaList = ref([\n  {\n    id: 1,\n    type: 'video',\n    videoUrl: 'http://.../video.mp4',\n    title: 'Took a walk...', ...\n  }\n]);`,
        resume: `<!-- Template -->\n<MediaCardV1 \n  :media="myMediaList[0]" \n  variant="resume" \n/>`,
        latest: `<!-- Template -->\n<MediaCardV1 \n  :media="latestMediaItem" \n  variant="latest" \n/>`,
        purchased: `<!-- Template -->\n<MediaCardV1 \n  :media="purchasedMediaItem" \n  variant="purchased" \n/>`,
        gridView: `<!-- Template -->\n<MediaCardV1 \n  v-for="item in gridMediaList" \n  :key="item.id" \n  :media="item" \n  variant="grid" \n/>`,
    },
    mediaV2: {
        gallery: `<!-- Template -->\n<MediaCardV2 :media="galleryCard" />\n\n<!-- Script Data -->\nconst galleryCard = ref({\n  type: 'gallery',\n  isLocked: true,\n  showTag: true,\n  tagText: 'Subscriber Exclusive',\n  tagColor: 'green'\n});`,
        image: `<!-- Template -->\n<MediaCardV2 :media="imageCard" />\n\n<!-- Script Data -->\nconst imageCard = ref({\n  type: 'image',\n  showTag: true,\n  tagText: 'Subscribe or Buy',\n  tagColor: 'pink'\n});`,
        video: `<!-- Template -->\n<MediaCardV2 :media="videoCard" />\n\n<!-- Script Data -->\nconst videoCard = ref({\n  type: 'video',\n  videoUrl: 'https://.../video.mp4',\n  isLocked: true,\n  showTag: false\n});`,
    },
    inputDashboard: {
        basic: `<!-- Template -->\n<InputComponentDashboard \n  v-model="username" \n  showLabel \n  labelText="Username" \n  requiredDisplay="*" \n  placeholder="Enter username" \n/>`,
        icons: `<!-- Template -->\n<InputComponentDashboard \n  v-model="email" \n  showLabel \n  labelText="Email" \n  :leftIcon="EnvelopeIcon" \n/>`,
        password: `<!-- Template -->\n<InputComponentDashboard \n  v-model="password" \n  type="password" \n  :rightIcon="showPass ? EyeIcon : EyeSlashIcon" \n  clickableRightIcon \n  @rightIconClick="showPass = !showPass" \n/>`,
        error: `<!-- Template -->\n<InputComponentDashboard \n  showErrors \n  :errors="[{ message: 'Invalid format', icon: InformationCircleIcon }]" \n/>`,
        success: `<!-- Template -->\n<InputComponentDashboard \n  onSuccess \n  :success="[{ message: 'Available!' }]" \n/>`,
        spans: `<!-- Template -->\n<InputComponentDashboard \n  leftSpan \n  leftSpanText="$" \n  rightSpan \n  rightSpanText="USD" \n/>`,
        textarea: `<!-- Template -->\n<InputComponentDashboard \n  v-model="bio" \n  type="textarea" \n  description="Brief bio..." \n/>`,
    },
    heading: {
        h1Primary: `<Heading text="Primary H1" tag="h1" theme="defaultPrimaryHeading" class="!text-black" version="basic" />`,
        h2Secondary: `<Heading text="Secondary H2" tag="h2" theme="defaultSecondaryHeading" class="!text-black" version="basic" />`,
        h3Section: `<Heading text="Section H3" tag="h3" theme="sectionHeading" class="!text-black" version="basic" />`,
        h2Dashboard: `<Heading text="Dashboard Title" tag="h2" theme="dashboardHeading" version="basic" />`,
        h2Auth: `<Heading text="Login" tag="h2" theme="AuthHeading" class="!text-black" version="basic" />`,
        h4Form: `<Heading text="Profile Settings" tag="h4" theme="formHeading" version="basic" />`,
        h1Demo: `<Heading text="Demo H1 Bold" tag="h1" theme="demoHeadings" version="basic" />`,
        h3Demo: `<Heading text="Demo H3 Medium" tag="h3" theme="demoHeadings" version="basic" />`,
        withIcon: `<Heading text="With Icon" tag="h3" theme="defaultSecondaryHeading" class="!text-black" version="basic" :leftIcon="StarIcon" />`,
        order: `<Heading text="Order #1234" tag="h1" theme="orderHeading" version="basic" />`,
    },
    paragraph: {
        default: `<Paragraph text="Standard text content..." class="!text-black" />`,
        small: `<Paragraph text="Small caption text" class="!text-black text-sm" />`,
        large: `<Paragraph text="Large paragraph text" class="!text-black text-xl" />`,
        bold: `<Paragraph text="Bold text" class="!text-black font-bold" />`,
        blue: `<Paragraph text="Blue text" fontColor="text-blue-600" />`,
        error: `<Paragraph text="Error message" fontColor="text-red-500" fontSize="text-sm" />`,
        success: `<Paragraph text="Success message" fontColor="text-green-600" />`,
        italic: `<Paragraph text="Italic note" fontFamily="italic" />`,
        withIcon: `<Paragraph text="Info message" :leftIcon="InfoIcon" />`,
        xs: `<Paragraph text="Helper text" fontSize="text-xs" />`,
    },
    icd: {
        default: `<InputComponentDashboard \n  v-model="val" \n  labelText="Username" \n  placeholder="Enter text..." \n  showLabel\n  labelClass="!text-slate-900"\n  inputClass="!text-slate-900"\n  wrapperClass="!border-slate-300 !bg-white"\n/>`,
        password: `<InputComponentDashboard \n  v-model="password" \n  :type="showPass ? 'text' : 'password'"\n  labelText="Password"\n  :rightIcon="showPass ? EyeSlashIcon : EyeIcon"\n  clickableRightIcon\n  @rightIconClick="showPass = !showPass"\n  labelClass="!text-slate-900"\n  inputClass="!text-slate-900"\n  wrapperClass="!border-slate-300 !bg-white"\n/>`,
        leftIcon: `<InputComponentDashboard \n  v-model="search" \n  labelText="Search" \n  :leftIcon="MagnifyingGlassIcon"\n  labelClass="!text-slate-900"\n  inputClass="!text-slate-900"\n  wrapperClass="!border-slate-300 !bg-white"\n/>`,
        rightIcon: `<InputComponentDashboard \n  v-model="email" \n  labelText="Email" \n  :rightIcon="EnvelopeIcon"\n  labelClass="!text-slate-900"\n  inputClass="!text-slate-900"\n  wrapperClass="!border-slate-300 !bg-white"\n/>`,
        requiredStar: `<InputComponentDashboard \n  v-model="name" \n  labelText="Full Name" \n  requiredDisplay="*"\n  labelClass="!text-slate-900"\n  inputClass="!text-slate-900"\n  wrapperClass="!border-slate-300 !bg-white"\n/>`,
        requiredItalic: `<InputComponentDashboard \n  v-model="email" \n  labelText="Email" \n  requiredDisplay="italic-text" \n  requiredDisplayText="Required"\n  labelClass="!text-slate-900"\n  inputClass="!text-slate-900"\n  wrapperClass="!border-slate-300 !bg-white"\n/>`,
        errors: `<InputComponentDashboard \n  v-model="code" \n  labelText="Promo Code" \n  showErrors\n  :errors="[{ error: 'Invalid code' }]"\n  labelClass="!text-slate-900"\n  inputClass="!text-slate-900"\n  wrapperClass="!border-slate-300 !bg-white"\n  errorClass="!text-red-500"\n/>`,
        success: `<InputComponentDashboard \n  v-model="handle" \n  labelText="Username" \n  onSuccess\n  :success="[{ message: 'Available!' }]"\n  labelClass="!text-slate-900"\n  inputClass="!text-slate-900"\n  wrapperClass="!border-slate-300 !bg-white"\n  successClass="!text-green-600"\n/>`,
        suffixPrice: `<InputComponentDashboard \n  v-model="price" \n  labelText="Unit Price" \n  rightSpan \n  rightSpanText="USD"\n  labelClass="!text-slate-900"\n  inputClass="!text-slate-900"\n  wrapperClass="!border-slate-300 !bg-white"\n  rightSpanClass="!text-slate-500"\n/>`,
        textarea: `<InputComponentDashboard \n  v-model="bio" \n  type="textarea" \n  labelText="Bio"\n  labelClass="!text-slate-900"\n  inputClass="!text-slate-900"\n  wrapperClass="!border-slate-300 !bg-white"\n/>`,
        bothIcons: `<InputComponentDashboard \n  v-model="search" \n  labelText="Advanced Search" \n  :leftIcon="MagnifyingGlassIcon"\n  :rightIcon="Bars3Icon"\n  clickableRightIcon\n  labelClass="!text-slate-900"\n  inputClass="!text-slate-900"\n  wrapperClass="!border-slate-300 !bg-white"\n  leftIconClass="!text-slate-500"\n  rightIconClass="!text-slate-400"\n/>`,
    },
    notification: {
        warning: `<!-- Template -->\n<NotificationCard \n  variant="warning" \n  title="Media Content Required"\n  description="Your profile currently has no media..."\n  timestamp="1w"\n  :icon="FilmIcon"\n  :badgeIcon="ArrowUpTrayIcon"\n  dismissLabel="Dismiss"\n  actionLabel="Take Action"\n  v-model="visible" \n/>\n\n<!-- Script Data -->\nconst visible = ref(true);`,
        success: `<!-- Template -->\n<NotificationCard \n  variant="success" \n  title="Congratulations"\n  description="Your media has been approved."\n  timestamp="1m"\n  :icon="PhotoIcon"\n  :badgeIcon="CheckIcon"\n  dismissLabel="Dismiss"\n  actionLabel="Take Action"\n  v-model="visible" \n/>\n\n<!-- Script Data -->\nconst visible = ref(true);`,
        error: `<!-- Template -->\n<NotificationCard \n  variant="error" \n  title="Action Required"\n  description="Critical update needed..."\n  timestamp="Just now"\n  :icon="BellAlertIcon"\n  :badgeIcon="TrashIcon"\n  dismissLabel="Dismiss"\n  actionLabel="Finalize"\n  v-model="visible" \n/>\n\n<!-- Script Data -->\nconst visible = ref(true);`,
        info: `<!-- Template -->\n<NotificationCard \n  variant="info" \n  title="Bank Details Required"\n  description="Please complete your bank information."\n  timestamp="3m"\n  :icon="BuildingLibraryIcon"\n  :badgeIcon="InformationCircleIcon"\n  dismissLabel="Dismiss"\n  actionLabel="Take Action"\n  v-model="visible" \n/>\n\n<!-- Script Data -->\nconst visible = ref(true);`,
    },
    quill: {
        default: `<!-- Template -->\n<QuillEditor v-model="content" />\n\n<!-- Script Data -->\nconst content = ref('');`,
        placeholder: `<!-- Template -->\n<QuillEditor v-model="content" placeholder="Start typing..." />\n\n<!-- Script Data -->\nconst content = ref('');`,
        initial: `<!-- Template -->\n<QuillEditor v-model="content" />\n\n<!-- Script Data -->\nconst content = ref('<strong>Initial</strong> content...');`,
        announcement: `<!-- Template -->\n<QuillEditor v-model="content" placeholder="Announcement title..." />\n\n<!-- Script Data -->\nconst content = ref('');`,
    },
    datepicker: {
        single: `<!-- Template -->\n<VueDatePicker v-model="date" />\n\n<!-- Script Data -->\nconst date = ref(null);`,
        range: `<!-- Template -->\n<VueDatePicker v-model="range" :config="config" />\n\n<!-- Script Data -->\nconst range = ref({ start: null, end: null });\nconst config = {\n  mode: 'range',\n  maxRangeDays: 7\n};`,
        withTime: `<!-- Template -->\n<VueDatePicker v-model="dateTime" :config="config" />\n\n<!-- Script Data -->\nconst dateTime = ref(null);\nconst config = {\n  enableTime: true,\n  format: 'DD/MM/YYYY HH:mm'\n};`,
        blocked: `<!-- Template -->\n<VueDatePicker v-model="date" :config="config" />\n\n<!-- Script Data -->\nconst date = ref(null);\nconst config = {\n  blockedDates: ['2026-03-29']\n};`,
        tealHeader: `<!-- Template -->\n<VueDatePicker :config="config" />\n\n<!-- Script Data -->\nconst config = {\n  style: {\n    headerClass: 'bg-teal-600 text-white',\n    theme: 'blue'\n  }\n};`,
        square: `<!-- Template -->\n<VueDatePicker :config="config" />\n\n<!-- Script Data -->\nconst config = {\n  style: {\n    rounded: 'rounded-none',\n    todayStyle: 'background'\n  }\n};`,
        error: `<!-- Template -->\n<div class="border-2 border-red-500 rounded-xl">\n  <VueDatePicker :config="config" />\n</div>\n\n<!-- Script Data -->\nconst config = {\n  style: {\n    border: 'border-0',\n    shadow: 'shadow-none'\n  },\n  placeholder: 'Required!'\n};`,
        glass: `<!-- Template -->\n<div class="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-2xl">\n  <VueDatePicker :config="config" />\n</div>\n\n<!-- Script Data -->\nconst config = {\n  style: {\n    customClass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white',\n    headerClass: 'bg-transparent text-white border-white/10',\n    theme: 'indigo'\n  }\n};`,
        minMax: `<!-- Template -->\n<VueDatePicker :config="config" />\n\n<!-- Script Data -->\nconst config = {\n  minDate: '2026-01-01',\n  maxDate: '2026-12-31'\n};`,
        trip: `<!-- Template -->\n<VueDatePicker v-model="range" :config="config" />\n\n<!-- Script Data -->\nconst tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];\nconst config = {\n  mode: 'range',\n  minDate: tomorrow\n};`,
    },
    tierCard: {
        1: `<!-- Template -->\n<TierCard :tier="tierData[0]" />\n\n<!-- Script Data (Source: TierData.js) -->\nconst tier = {\n  title: "My VVIP Lounge ❤️️️",\n  backgroundImage: "...",\n  plans: [{ id: '1m', label: '1 month', price: '55.86' }, ...],\n  theme: { textPrimary: '#FB0464', ... }\n};`,
        2: `<!-- Template -->\n<TierCard :tier="tierData[1]" />\n\n<!-- Script Data (Spend Mode) -->\nconst tier = {\n  footer: {\n    type: 'spend',\n    progress: { leftText: "Spend $200 more to claim", width: "80%" }\n  }\n};`,
        3: `<!-- Template -->\n<TierCard :tier="tierData[2]" />\n\n<!-- Script Data -->\nconst tier = { ... };`,
        4: `<!-- Template -->\n<TierCard :tier="tierData[3]" />\n\n<!-- Script Data (Hidden Progress) -->\nconst tier = {\n  footer: { type: 'hidden' }\n};`,
        5: `<!-- Template -->\n<TierCard :tier="tierData[4]" />\n\n<!-- Script Data (Subscribe Mode) -->\nconst tier = {\n  footer: { type: 'subscribe', buttonText: 'SUBSCRIBE' }\n};`,
    },
    eventCard: {
        orangeButton: `<!-- Template -->\n<EventCard theme="orange" :hasButton="true" />`,
        orangeProgress: `<!-- Template -->\n<EventCard theme="orange" :hasButton="false" />`,
        pinkButton: `<!-- Template -->\n<EventCard theme="pink" :hasButton="true" />`,
        pinkProgress: `<!-- Template -->\n<EventCard theme="pink" :hasButton="false" />`,
    },
    cart: {
        default: `<!-- Template -->
<Cart />

<!-- Interaction Logic (Custom Events) -->
// To add an item via console or script:
window.dispatchEvent(new CustomEvent('cart:add', {
  detail: {
    item: {
      title: "NBA Hoops Card",
      productId: "nba123",
      qty: 1,
      price: 12.23,
      originalPrice: 20.00,
      shipping: 12.23,
      seller: "Princess Carrot Pop",
      image: "https://i.ibb.co.com/70sHrpv/featured-media-bg.webp",
      promoCodes: ["PROMOCODE2025", "MEMBER BENEFIT"]
    }
  }
}));`,
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
