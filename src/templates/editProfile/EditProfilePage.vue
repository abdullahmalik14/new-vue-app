<template>
 
<div class="bg-[#EAECF0] font-sans p-0 m-0 box-border overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] [&.dark]:bg-[#222526]" @click="closeDropdowns">
    <!-- main-wrapper -->
    <div class="relative before:content-[''] before:fixed before:top-0 before:left-0 before:w-full before:h-screen before:pointer-events-none before:bg-cover before:bg-center before:bg-no-repeat before:bg-[url('https://i.ibb.co.com/QvpHN5vD/mobile-gradient-main-bg-1.webp')] before:z-[-1] sm:before:bg-[url('https://i.ibb.co.com/dw910Z5b/gradient-main-bg.webp')]">
        <!-- container -->
        <div data-container class="flex flex-col min-h-screen z-[0]">
            <!-- notification -->
        <div class="fixed top-0 left-0 right-0 z-[100] w-full max-w-[100vw]">
            <NotificationCard 
                v-model="showNotification"
                variant="notice"
                title="You have unsaved changes"
                description="You have made changes to your profile since your last saved. Remember to click ‘SAVE’ to publish your changes."
                icon="https://i.ibb.co.com/ksz4bh87/smiley-face.webp"
                badgeIcon="https://i.ibb.co.com/Tqx4sFpx/info-square.webp"
                :closable="true"
            />
        </div>

        <!-- nav -->
            <div class="flex flex-col gap-4 px-4 py-2 w-full h-max bg-[linear-gradient(0deg,rgba(234,236,240,0.9),rgba(234,236,240,0.9)),linear-gradient(0deg,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0)_100%)] relative md:[background:transparent] md:py-6 xl:px-10 xl:pt-10 xl:[background:linear-gradient(90deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0)_8%)]">
                <!-- blur-overlay -->
                <div class="absolute inset-0 w-full h-full backdrop-blur-[5px] pointer-events-none z-[-1] md:backdrop-blur-[25px]"></div>
                
                <div class="flex justify-between items-center gap-2">
                    <!-- page title -->
                    <div class="flex items-center gap-1.5 relative">
                        <h1 class="text-sm font-semibold text-[#475467] md:text-3xl md:leading-[2.375rem] md:font-medium dark:text-[#b1aba0]">Edit Profile</h1>
                    </div>

                    <!-- nav right-item -->
                    <div id="right-nav-icons" class="md:hidden items-center gap-2" :class="isChanged ? 'hidden' : 'flex'">
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

                    <!-- cancel-save-button -->
                    <div data-save-cancel-buttons-container class="flex items-center gap-2 py-[0.1875rem] md:gap-6 md:py-0" :class="{ 'hidden': !isChanged }">
                        <button @click="onCancel" data-cancel-button class="flex justify-center items-center py-1 min-w-[4.6875rem] md:min-w-0">
                            <span class="text-base font-medium text-[#0C111D] md:text-lg dark:text-[#dbd8d3]">CANCEL</span>
                        </button>

                        <button @click="onSave" data-save-button class="flex justify-center items-center px-4 py-1 min-w-[4.6875rem] md:px-[1.3125rem] md:py-1.5 bg-black group/button hover:bg-[#07F468] dark:bg-[#181a1b] dark:hover:bg-[#23f97b]">
                            <span class="text-base font-medium text-[#07F468] group-hover/button:text-black md:text-lg dark:text-[#23f97b] dark:group-hover/button:text-[#181a1b]">SAVE</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- content-container -->
            <div class="flex flex-col gap-6 py-6 sm:pt-10 md:gap-8 md:pt-[6.25rem] md:px-4 lg:pt-[5.75rem] lg:pb-6 xl:px-10 xl:pt-24 xl:[background:linear-gradient(90deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0)_8%)]">
                <!-- user-info-section -->
                <div class="flex flex-col items-center md:items-start">
                    <!-- form-section -->
                    <div class="flex flex-col gap-6 px-2 pt-20 pb-4 mt-14 w-full shadow-[0px_4px_6px_-2px_#10182814] relative bg-white/40 md:px-4 xl:pt-[5.25rem] dark:bg-[#181a1b]/40">
                        <!-- avatar-container -->
                        <div class="absolute -top-14 left-0 right-0 mx-auto flex justify-center items-center w-max z-[1] md:-top-[7.75rem] md:right-auto md:pl-8 lg:pl-10 xl:-top-32 xl:pl-[1.09375rem]">
                            <!-- avatar -->
                            <div class="flex justify-center items-center w-[7.5rem] h-[7.5rem] rounded-full bg-[#F04CC9] shadow-[0px_0px_10px_-34px_#0000001A] md:w-[10.6875rem] md:h-[10.6875rem] xl:w-[12.1875rem] xl:h-[12.1875rem]">
                                <span class="text-[3.66rem] leading-[4.577rem] font-bold tracking-[-0.073rem] text-white md:text-[5.218rem] md:leading-[6.522rem] md:tracking-[-0.10435rem] xl:text-[5.95rem] xl:leading-[7.4375rem] xl:tracking-[-0.119rem] dark:text-[#e8e6e3]">CP</span>
                            </div>

                            <!-- edit-button -->
                            <button class="absolute bottom-0 right-0 flex justify-center items-center w-10 h-10 p-2 bg-[#07F468] rounded-full md:w-12 md:h-12 md:p-2.5 dark:bg-[#06c454]">
                                <img src="https://i.ibb.co.com/wZgQbKp9/svgviewer-png-output-49.webp" alt="edit" class="w-full h-full"/>
                            </button>
                        </div>
                        
                        <!-- blur-overlay -->
                        <div class="absolute inset-0 w-full h-full backdrop-blur-[25px] pointer-events-none z-[-1]"></div>

                        <!-- input-section -->
                        <div class="flex flex-col gap-4">
                            <!-- dropdown-wrapper (profile-visibility) -->
                            <div class="flex flex-col gap-1.5 w-full pb-1 md:absolute md:-top-[5.125rem] md:right-0 md:w-[22.5rem]">
                                <!-- dropdown-field -->
                                <div class="flex flex-col gap-1.5 md:items-end md:gap-1">
                                    <label for="profile-visibility" class="text-sm font-medium text-[#667085] md:text-[#0C111D] dark:text-[#9e9589] md:dark:text-[#dbd8d3]">
                                        Profile Visibility
                                    </label>

                                    <UnifiedSelect
                                        v-model="profileData.visibility"
                                        :options="visibilityOptions"
                                        variant="dashboard"
                                        placeholder="Select Visibility"
                                        dropdownMaxHeight="max-h-[30rem]"
                                    />
                                </div>
                            </div>
                            <!-- input-group -->
                            <div class="flex flex-col gap-4 sm:flex-row">
                                <!-- input-container -->
                               <InputComponentDashboard v-model="profileData.displayName" labelText="Display Name" showLabel
                                    placeholder="" />

                                <!-- input-container -->
                                <InputComponentDashboard v-model="profileData.age" labelText="Age" showLabel
                                    placeholder="" />
                            </div>

                            <!-- dropdown-group -->
                            <div class="flex flex-col gap-4 sm:flex-row">
                                <!-- dropdown-wrapper -->
                                <div class="flex flex-col gap-1.5 w-full pb-1">
                                    <!-- dropdown-field -->
                                    <div class="flex flex-col gap-1.5">
                                        <label for="gender" class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">
                                            Gender
                                        </label>

                                        <!-- select-dropdown -->
                                        <div class="select-dropdown relative flex w-full" @click.stop="toggleDropdown('gender')">
                                            <div class="dropdown-select w-full cursor-pointer border-none">
                                                <div class="dash-select__trigger w-full h-10 flex items-center gap-2 py-2 px-3.5 rounded-t-sm border-b border-[#D0D5DD] bg-white/50 shadow-[0_1px_2px_0_#1018280D] dark:bg-[#181a1b]/50 dark:border-[#4a5568]">
                                                    <span class="text-base flex-grow text-[#101828] capitalize text-balance dark:text-[#d6d3cd]">
                                                    {{ getLabel(genderOptions, profileData.gender) }}
                                                    </span>
                                                    <img class="select-arrow h-5 w-5 transition-transform duration-200"
                                                    :class="{ 'rotate-180': activeDropdown === 'gender' }"
                                                    src="https://i.ibb.co.com/jkt6FN7G/chevron-down.webp" alt="chevron down" />
                                                </div>
                                                <div class="dash-options-container max-md:!fixed max-md:!bottom-0 max-md:!top-auto max-md:!shadow-[0px_-2px_4px_0px_#0000001A] absolute left-auto right-0 top-[calc(100%+0.5rem)] z-[9999] w-full origin-top backdrop-blur-[12.5px] shadow-lg rounded-lg transition-[opacity,transform] duration-200 ease-out [transform-origin:50%_0]"
                                                     :class="activeDropdown === 'gender' ? 'scale-100 opacity-100 pointer-events-auto h-auto overflow-auto downward' : 'scale-95 opacity-0 pointer-events-none h-0 overflow-hidden'">
                                                    <div class="rounded-lg p-1 border border-[rgba(186,188,203,0.5)] bg-white/50 dark:border-[rgba(61,71,73,0.5)] dark:bg-[#181a1b]/50">
                                                        <div v-for="opt in genderOptions" :key="opt.value"
                                                             @click.stop="selectOption('gender', opt.value)"
                                                             class="option flex items-center justify-center gap-[0.625rem] group hover:bg-white dark:hover:bg-[#181a1b]"
                                                             :class="{ 'selected bg-[#EAECF0] dark:bg-[#222526]': profileData.gender === opt.value }">
                                                            <div class="option-inner-container flex justify-center items-center flex-1 gap-[0.625rem] p-[0.625rem]">
                                                                <span class="text-sm font-medium text-[#344054] capitalize text-balance dark:text-[#bdb8af]"
                                                                      :class="{ 'font-semibold': profileData.gender === opt.value }">
                                                                    {{ opt.label }}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- dropdown-wrapper -->
                                <div class="flex flex-col gap-1.5 w-full pb-1">
                                    <!-- dropdown-field -->
                                    <div class="flex flex-col gap-1.5">
                                        <label for="country" class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">
                                            Country
                                        </label>

                                        
                                        <!-- select-dropdown -->
                                        <div class="select-dropdown relative flex w-full" @click.stop="toggleDropdown('country')">
                                            <div class="dropdown-select w-full cursor-pointer border-none">
                                                <div class="dash-select__trigger w-full h-10 flex items-center gap-2 py-2 px-3.5 rounded-t-sm border-b border-[#D0D5DD] bg-white/50 shadow-[0_1px_2px_0_#1018280D] dark:bg-[#181a1b]/50 dark:border-[#4a5568]">
                                                    <span class="text-base flex-grow text-[#101828] capitalize text-balance dark:text-[#d6d3cd]">
                                                    {{ getLabel(countryOptions, profileData.country) }}
                                                    </span>
                                                    <img class="select-arrow h-5 w-5 transition-transform duration-200"
                                                    :class="{ 'rotate-180': activeDropdown === 'country' }"
                                                    src="https://i.ibb.co.com/jkt6FN7G/chevron-down.webp" alt="chevron down" />
                                                </div>
                                                <div class="dash-options-container max-md:!fixed max-md:!bottom-0 max-md:!top-auto max-md:!shadow-[0px_-2px_4px_0px_#0000001A] absolute left-auto right-0 top-[calc(100%+0.5rem)] z-[9999] w-full origin-top backdrop-blur-[12.5px] shadow-lg rounded-lg transition-[opacity,transform] duration-200 ease-out [transform-origin:50%_0]"
                                                     :class="activeDropdown === 'country' ? 'scale-100 opacity-100 pointer-events-auto h-auto overflow-auto downward' : 'scale-95 opacity-0 pointer-events-none h-0 overflow-hidden'">
                                                    <div class="rounded-lg p-1 border border-[rgba(186,188,203,0.5)] bg-white/50 dark:border-[rgba(61,71,73,0.5)] dark:bg-[#181a1b]/50">
                                                        <div v-for="opt in countryOptions" :key="opt.value"
                                                             @click.stop="selectOption('country', opt.value)"
                                                             class="option flex items-center justify-center gap-[0.625rem] group hover:bg-white dark:hover:bg-[#181a1b]"
                                                             :class="{ 'selected bg-[#EAECF0] dark:bg-[#222526]': profileData.country === opt.value }">
                                                            <div class="option-inner-container flex justify-center items-center flex-1 gap-[0.625rem] p-[0.625rem]">
                                                                <span class="text-sm font-medium text-[#344054] capitalize text-balance dark:text-[#bdb8af]"
                                                                      :class="{ 'font-semibold': profileData.country === opt.value }">
                                                                    {{ opt.label }}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- dropdown-group -->
                            <div class="flex flex-col gap-4 sm:flex-row">
                                <!-- dropdown-wrapper -->
                                <div class="flex flex-col gap-1.5 w-full pb-1">
                                    <!-- dropdown-field -->
                                    <div class="flex flex-col gap-1.5">
                                        <label for="body-type" class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">
                                            Body Type
                                        </label>

                                        <div class="select-dropdown relative flex w-full" @click.stop="toggleDropdown('bodyType')">
                                            <div class="dropdown-select w-full cursor-pointer border-none">
                                                <div class="dash-select__trigger w-full h-10 flex items-center gap-2 py-2 px-3.5 rounded-t-sm border-b border-[#D0D5DD] bg-white/50 shadow-[0_1px_2px_0_#1018280D] dark:bg-[#181a1b]/50 dark:border-[#4a5568]">
                                                    <span class="text-base flex-grow text-[#101828] capitalize text-balance dark:text-[#d6d3cd]">
                                                    {{ getLabel(bodyTypeOptions, profileData.bodyType) }}
                                                    </span>
                                                    <img class="select-arrow h-5 w-5 transition-transform duration-200"
                                                    :class="{ 'rotate-180': activeDropdown === 'bodyType' }"
                                                    src="https://i.ibb.co.com/jkt6FN7G/chevron-down.webp" alt="chevron down" />
                                                </div>
                                                <div class="dash-options-container max-md:!fixed max-md:!bottom-0 max-md:!top-auto max-md:!shadow-[0px_-2px_4px_0px_#0000001A] absolute left-auto right-0 top-[calc(100%+0.5rem)] z-[9999] w-full origin-top backdrop-blur-[12.5px] shadow-lg rounded-lg transition-[opacity,transform] duration-200 ease-out [transform-origin:50%_0]"
                                                     :class="activeDropdown === 'bodyType' ? 'scale-100 opacity-100 pointer-events-auto h-auto overflow-auto downward' : 'scale-95 opacity-0 pointer-events-none h-0 overflow-hidden'">
                                                    <div class="rounded-lg p-1 border border-[rgba(186,188,203,0.5)] bg-white/50 dark:border-[rgba(61,71,73,0.5)] dark:bg-[#181a1b]/50">
                                                        <div v-for="opt in bodyTypeOptions" :key="opt.value"
                                                             @click.stop="selectOption('bodyType', opt.value)"
                                                             class="option flex items-center justify-center gap-[0.625rem] group hover:bg-white dark:hover:bg-[#181a1b]"
                                                             :class="{ 'selected bg-[#EAECF0] dark:bg-[#222526]': profileData.bodyType === opt.value }">
                                                            <div class="option-inner-container flex justify-center items-center flex-1 gap-[0.625rem] p-[0.625rem]">
                                                                <span class="text-sm font-medium text-[#344054] capitalize text-balance dark:text-[#bdb8af]"
                                                                      :class="{ 'font-semibold': profileData.bodyType === opt.value }">
                                                                    {{ opt.label }}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- dropdown-wrapper -->
                                <div class="flex flex-col gap-1.5 w-full pb-1">
                                    <!-- dropdown-field -->
                                    <div class="flex flex-col gap-1.5">
                                        <label for="hair" class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">
                                            Hair
                                        </label>

                                        <div class="select-dropdown relative flex w-full" @click.stop="toggleDropdown('hair')">
                                            <div class="dropdown-select w-full cursor-pointer border-none">
                                                <div class="dash-select__trigger w-full h-10 flex items-center gap-2 py-2 px-3.5 rounded-t-sm border-b border-[#D0D5DD] bg-white/50 shadow-[0_1px_2px_0_#1018280D] dark:bg-[#181a1b]/50 dark:border-[#4a5568]">
                                                    <span class="text-base flex-grow text-[#101828] capitalize text-balance dark:text-[#d6d3cd]">
                                                    {{ getLabel(hairOptions, profileData.hair) }}
                                                    </span>
                                                    <img class="select-arrow h-5 w-5 transition-transform duration-200"
                                                    :class="{ 'rotate-180': activeDropdown === 'hair' }"
                                                    src="https://i.ibb.co.com/jkt6FN7G/chevron-down.webp" alt="chevron down" />
                                                </div>
                                                <div class="dash-options-container max-md:!fixed max-md:!bottom-0 max-md:!top-auto max-md:!shadow-[0px_-2px_4px_0px_#0000001A] absolute left-auto right-0 top-[calc(100%+0.5rem)] z-[9999] w-full origin-top backdrop-blur-[12.5px] shadow-lg rounded-lg transition-[opacity,transform] duration-200 ease-out [transform-origin:50%_0]"
                                                     :class="activeDropdown === 'hair' ? 'scale-100 opacity-100 pointer-events-auto h-auto overflow-auto downward' : 'scale-95 opacity-0 pointer-events-none h-0 overflow-hidden'">
                                                    <div class="rounded-lg p-1 border border-[rgba(186,188,203,0.5)] bg-white/50 dark:border-[rgba(61,71,73,0.5)] dark:bg-[#181a1b]/50">
                                                        <div v-for="opt in hairOptions" :key="opt.value"
                                                             @click.stop="selectOption('hair', opt.value)"
                                                             class="option flex items-center justify-center gap-[0.625rem] group hover:bg-white dark:hover:bg-[#181a1b]"
                                                             :class="{ 'selected bg-[#EAECF0] dark:bg-[#222526]': profileData.hair === opt.value }">
                                                            <div class="option-inner-container flex justify-center items-center flex-1 gap-[0.625rem] p-[0.625rem]">
                                                                <span class="text-sm font-medium text-[#344054] capitalize text-balance dark:text-[#bdb8af]"
                                                                      :class="{ 'font-semibold': profileData.hair === opt.value }">
                                                                    {{ opt.label }}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- textarea-container -->
                            <div class="flex flex-col gap-1 w-full">
                                <InputComponentDashboard v-model="profileData.bio" labelText="Display Name" showLabel type="textarea"
                                    textAreaRows="4" placeholder="" />
                                
                            </div>
                        </div>

                        <!-- profile-gallery-section -->
                        <div class="flex flex-col gap-4">
                            <div class="flex flex-col gap-2">
                                <!-- text-container -->
                                <section class="flex flex-col gap-2 sm:gap-4 lg:gap-2">
                                    <h3 class="text-sm font-bold text-[#667085] dark:text-[#9e9589]">Profile Gallery</h3>
                                    <ul class="flex flex-col pl-1">
                                        <li class="text-sm text-[#344054] dark:text-[#bdb8af] relative pl-4 before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-[#344054] before:absolute before:left-[0.188rem] before:top-[0.438rem] lg:text-base">Your uploaded media will appear on your profile page background. Drag and drop uploaded media to reorder sequence.</li>
                                        <li class="text-sm text-[#344054] dark:text-[#bdb8af] relative pl-4 before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-[#344054] before:absolute before:left-[0.188rem] before:top-[0.438rem] lg:text-base">You may upload up to 6 media files (Max. 2 video files)</li>
                                    </ul>
                                </section>

                                <!-- upload-section -->
                                <div class="flex flex-col gap-4 lg:flex-row-reverse transition-opacity duration-300" :class="{ 'pointer-events-none opacity-50': !isPremiumVideoUnlocked }">
                                    <!-- upload-container -->
                                    <ThumbnailUploader
                                        :uploader="galleryUploader"
                                        title="Click to upload"
                                        subtitle="or drag and drop image or video files here"
                                        fileInfo="MP4, AVI, QUICKTIME, X-MATROSKA, X-MS-WMV, WEBM, OGG, PNG or JPG (max. 15MB)"
                                        wrapperClass="cursor-pointer border-2 border-transparent bg-[rgba(0,0,0,0.05)] rounded-xl relative h-[12.5rem] w-full flex flex-col items-center justify-center hover:border-[#0c111d] dark:bg-[#181a1b]/5 dark:hover:border-[#857c6d] hover:bg-[rgba(0,0,0,0.10)] dark:hover:bg-[rgba(0,0,0,0.05)] group/upload sm:h-[13.3125rem] lg:w-1/2"
                                        innerWrapperClass="gap-3 w-full flex flex-col justify-center items-center px-6 py-4 self-stretch border-2 border-dashed border-transparent"
                                        iconWrapperClass="flex justify-center items-center w-10 h-10 rounded-lg shadow-[0px_1px_2px_0px_#1018280D] bg-[#07F468] group-hover/upload:bg-[#0C111D] dark:bg-[#06c454] dark:group-hover/upload:bg-[#162036]"
                                        iconInnerWrapperClass="contents"
                                        titleClass="text-sm text-[#475467] dark:text-[#b1aba0]"
                                        titleHighlightClass="text-sm font-semibold text-center text-[#0C111D] dark:text-[#dbd8d3]"
                                        fileInfoClass="text-xs leading-normal text-[#475467] dark:text-[#b1aba0]"
                                    >
                                        <template #icon>
                                            <img src="https://i.ibb.co.com/9JDWMW1/upload-03.webp" alt="upload 03" class="w-5 h-5 [filter:brightness(0)] group-hover/upload:[filter:brightness(0)_saturate(100%)_invert(65%)_sepia(22%)_saturate(4910%)_hue-rotate(97deg)_brightness(113%)_contrast(94%)]">
                                        </template>
                                    </ThumbnailUploader>

                                    <!-- gallery-display-container -->
                                    <div class="relative flex flex-col gap-6 min-h-[12.5rem] h-max rounded-xl sm:min-h-[13.3125rem] lg:w-1/2">
                                        <!-- placeholder if empty -->
                                        <div v-if="galleryItems.length === 0" class="flex flex-col gap-6 h-full justify-center items-center py-8">
                                            <!-- dashed border -->
                                            <svg class="absolute inset-0 w-full h-full pointer-events-none">
                                                <rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="12" ry="12" fill="none" stroke="#D0D5DD" stroke-width="1" stroke-dasharray="4 4" class="dark:stroke-[#3b4043]" />
                                            </svg>
                                            <img src="https://i.ibb.co.com/9Hm4KHzN/Images.webp" alt="Images" class="w-16 h-16">
                                            <p class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">Upload your first piece and watch yourself shine!</p>
                                        </div>

                                        <!-- grid if media exists -->
                                        <div v-else class="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3 h-full overflow-y-auto">
                                            <div v-for="(item, index) in galleryItems" :key="index" class="relative group overflow-hidden h-[5.5rem] bg-black/5 dark:bg-white/5">
                                                <video v-if="item.type?.startsWith('video/')" :src="item.url" class="w-full h-full object-cover"></video>
                                                <img v-else :src="item.url" class="w-full h-full object-cover">
                                                
                                                <!-- video-tag -->
                                                <div v-if="item.type?.startsWith('video/')" class="absolute bottom-0 left-0 flex justify-center items-center z-[3]">
                                                    <div data-video-tag class="flex justify-center items-center gap-[0.1875rem] px-1 h-5 bg-[rgba(48,52,55,.7)] dark:bg-[rgba(31,44,63,0.50)]">
                                                        <span class="text-xs text-white leading-normal tracking-[0.008rem] dark:text-[#e8e6e3]">Video</span>
                                                        <img src="https://i.ibb.co.com/wN978Hjm/video.webp" alt="video" class="w-4 h-4" />
                                                    </div>
                                                </div>
                                                
                                                <!-- delete-button (cross) -->
                                                <div @click="removeGalleryItem(index)" class="flex justify-center items-center absolute top-0 right-0 z-[3] w-5 h-5 cursor-pointer bg-[#ff4405] hover:bg-[#ff692e]">
                                                    <img src="https://i.ibb.co.com/W4TXDR0j/x-close.webp" alt="x-close" class="w-3.5 h-3.5 [filter:brightness(100)_saturate(0)]"/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- button -->
                            <TwoPieceButton
                                v-if="!isPremiumVideoUnlocked"
                                @click="isPremiumVideoUnlocked = true"
                                tag="button"
                                variant="link-x"
                                rootClass="filter drop-shadow-[4px_3px_0px_#000000] group hover:drop-shadow-[4px_3px_0px_#FF439D] block w-max appearance-button"
                                contentWrapperClass="flex justify-center items-center gap-2.5 pl-2 pr-[20.5px] min-h-[2rem] [clip-path:polygon(calc(100%-12.5px)_0%,100%_100%,0%_100%,0%_0%)] bg-[linear-gradient(135deg,#F093FB_0%,#FF439D_100%)] group-hover:[background:black]"
                                textClass="text-lg font-medium text-black group-hover:text-[#FF439D]"
                                text="Unlock premium to upload videos"
                            />
                        </div>
                    </div>
                </div>

                <!-- social-media-section -->
                 <DashboardSectionContainer>
                    <h2 class="text-2xl font-semibold text-[#667085] dark:text-[#9e9589]">Social Media</h2>

                    <!-- form-section -->
                    <div class="flex flex-col gap-4">
                        <!-- form-container -->
                        <div class="flex flex-col gap-4">
                            <!-- input-group -->
                            <div class="flex flex-col gap-4 lg:flex-row">
                                <!-- input-container -->
                                <InputComponentDashboard v-model="profileData.twitter" labelText="Twitter" showLabel
                                    placeholder="" />

                                <!-- input-container -->
                                <InputComponentDashboard v-model="profileData.instagram" labelText="Instagram" showLabel
                                    placeholder="" />
                            </div>

                            <!-- input-group -->
                            <div class="flex flex-col gap-4 lg:flex-row">
                                <!-- input-container -->
                                <InputComponentDashboard v-model="profileData.wishlist" labelText="Wishlist" showLabel
                                    placeholder="" />

                                <!-- input-container -->
                                <InputComponentDashboard v-model="profileData.additionalUrl1" labelText="Additional URL 1" showLabel
                                    placeholder="" />
                            </div>

                            <template v-if="isPremiumLinksUnlocked">
                                <!-- input-group -->
                                <div class="flex flex-col gap-4 lg:flex-row">
                                    <!-- input-container -->
                                    <InputComponentDashboard v-model="profileData.additionalUrl2" labelText="Additional URL 2" showLabel
                                        placeholder="" class="flex-1" />

                                    <!-- input-container -->
                                    <InputComponentDashboard v-model="profileData.additionalUrl3" labelText="Additional URL 3" showLabel
                                        placeholder="" class="flex-1" />
                                </div>

                                <!-- input-group -->
                                <div class="flex flex-col gap-4 lg:flex-row">
                                    <!-- input-container -->
                                    <InputComponentDashboard v-model="profileData.additionalUrl4" labelText="Additional URL 4" showLabel
                                        placeholder="" class="flex-1" />
                                    <div class="hidden lg:block lg:flex-1"></div>
                                </div>
                            </template>
                        </div>

                        <!-- button -->
                        <TwoPieceButton
                            v-if="!isPremiumLinksUnlocked"
                            @click="isPremiumLinksUnlocked = true"
                            tag="button"
                            variant="link-x"
                            rootClass="filter drop-shadow-[4px_3px_0px_#000000] group hover:drop-shadow-[4px_3px_0px_#FF439D] block w-max appearance-button mt-4"
                            contentWrapperClass="flex justify-center items-center gap-2.5 pl-2 pr-[20.5px] min-h-[2rem] [clip-path:polygon(calc(100%-12.5px)_0%,100%_100%,0%_100%,0%_0%)] bg-[linear-gradient(135deg,#F093FB_0%,#FF439D_100%)] group-hover:[background:black]"
                            textClass="text-lg font-medium text-black group-hover:text-[#FF439D]"
                            text="Unlock premium to add more links"
                        />
                    </div>
                </DashboardSectionContainer>

                <!-- tipping-settings-section -->
                 <DashboardSectionContainer>
                    <h2 class="text-2xl font-semibold text-[#667085] dark:text-[#9e9589]">Tipping Settings</h2>

                    <!-- tip-message -->
                    <div class="flex flex-col gap-4">
                        <h3 class="text-sm font-bold text-[#667085] dark:text-[#9e9589]">Tip Message</h3>
                        
                        <ul class="flex flex-col pl-1 opacity-70">
                            <li class="text-sm text-[#344054] dark:text-[#bdb8af] relative pl-4 before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-[#344054] before:absolute before:left-[0.188rem] before:top-[0.438rem] md:text-base">Your fan will see this message when they tip you.</li>
                            <li class="text-sm text-[#344054] dark:text-[#bdb8af] relative pl-4 before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-[#344054] before:absolute before:left-[0.188rem] before:top-[0.438rem] md:text-base">Leave empty to show default message</li>
                        </ul>

                        <!-- textarea-container -->
                        <div class="flex flex-col gap-1 w-full">
                            <InputComponentDashboard v-model="profileData.tipMessage" :showLabel="false" type="textarea"
                                textAreaRows="4" placeholder="Thank you for your tip!" />

                            <span class="text-sm text-[#475467] dark:text-[#b1aba0]">{{ profileData.tipMessage?.length || 0 }}/200 characters</span>
                        </div>
                    </div>

                    <!-- share-settings -->
                    <section class="flex flex-col gap-4">
                        <h3 class="text-sm font-bold text-[#667085] dark:text-[#9e9589]">Share Settings</h3>

                        <div data-settings-wrapper class="flex flex-col gap-4 min-[600px]:flex-row lg:gap-6">
                            <!-- settings-section -->
                            <div class="flex flex-col gap-4 min-[600px]:flex-1">
                                <!-- toggle-switch-wrapper -->
                                <CheckboxSwitch
                                    v-model="profileData.postToX"
                                    id="post-to-x"
                                    label="Post to X when you receive tips"
                                    switchWrapperClass="w-9 h-[1.28125rem] !mt-0"
                                    trackClass="inset-0 rounded-[0.75rem] bg-[#98a2b380] peer-checked:bg-[#0c111d] dark:bg-[#434c5b80] dark:peer-checked:bg-[#0a0e17]"
                                    knobClass="w-4 h-4 left-[0.125rem] rounded-full bg-white shadow-[0_1px_3px_0_rgba(16,24,40,0.1),0_1px_2px_0_rgba(16,24,40,0.06)] peer-checked:translate-x-[1rem] dark:bg-[#181a1b]"
                                    labelClass="text-base font-medium text-black dark:text-[#e8e6e3] flex items-center h-[1.28125rem]"
                                />

                                <!-- form-section -->
                                <div class="flex flex-col gap-4" v-show="profileData.postToX">
                                    <!-- post-message-section -->
                                    <section class="flex flex-col gap-2">
                                        <h3 class="text-sm font-semibold text-[#667085] dark:text-[#9e9589]">Post Message (Leave blank to use system default message.)</h3>
                                        
                                        <!-- input-container -->
                                        <div class="flex flex-col gap-1 w-full">
                                            <InputComponentDashboard v-model="profileData.postMessage" :showLabel="false" type="textarea"
                                                textAreaRows="3" placeholder="I got some lovely tips from @username..." />

                                            <span class="text-sm text-[#475467] dark:text-[#b1aba0]">{{ profileData.postMessage?.length || 0 }}/72 characters</span>
                                        </div>

                                        <div class="flex items-center gap-2">
                                            <div class="flex justify-center items-center w-6 h-6">
                                                <input type="checkbox" v-model="profileData.showUsername" name="save" id="show-username" class="appearance-none bg-[white] dark:bg-[#2d3748] border border-[#D0D5DD] dark:border-[#4a5568] rounded-[4px] w-4 min-w-4 h-4 checked:accent-[#07f468] checked:bg-[#07f468] dark:checked:bg-[#0aff78] checked:border-[#07f468] dark:checked:border-[#0aff78] checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:border-[black] dark:checked:after:border-[white] checked:after:border-b-[2px] checked:after:border-r-[2px] checked:after:rotate-45 checked:after:box-border cursor-pointer">
                                            </div>

                                            <div class="flex items-center gap-1">
                                                <label for="show-username" class="text-sm text-[#0C111D] dark:text-[#dbd8d3] cursor-pointer">Show fan’s username on your post</label>
                                            
                                                <div class="relative flex items-center min-w-0 min-h-[1rem]">
                                                    <!-- Icon -->
                                                    <div ref="tooltipAnchor" class="cursor-pointer">
                                                        <img src="https://i.ibb.co/DPgMH5GG/svgviewer-png-output-15.webp" alt="tooltip icon" class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(45%)_sepia(12%)_saturate(597%)_hue-rotate(183deg)_brightness(96%)_contrast(100%)]">
                                                    </div>

                                                    <!-- Tooltip -->
                                                    <DropdownHandler
                                                        :anchor="tooltipAnchor"
                                                        :config="{
                                                            trigger: 'hover',
                                                            layer: 'tooltip',
                                                            theme: 'tooltip-dark',
                                                            width: 300,
                                                            positionMode: 'above',
                                                            align: 'center',
                                                            offset: 12,
                                                            animation: 'fade'
                                                        }"
                                                    >
                                                        <div class="relative p-1">
                                                            <div class="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#101828B2] dark:border-t-[rgba(14,19,32,0.9)]"></div>
                                                            <p class="text-xs leading-normal font-semibold text-white dark:text-[#e8e6e3]">Fan who tips anonymously will be recognized as '@anonymous'.</p>
                                                        </div>
                                                    </DropdownHandler>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <!-- attach-media-section -->
                                    <section class="flex flex-col gap-2">
                                        <h3 class="text-sm font-semibold text-[#667085] dark:text-[#9e9589]">Attach Media</h3>

                                        <!-- round-checkbox-input-container -->
                                        <!-- round-checkbox-input-container -->
                                        <div class="flex flex-col gap-2">
                                            <RadioGroup
                                                v-model="profileData.attachMedia"
                                                name="dash-radio-group"
                                                version="dashboard"
                                                :options="[
                                                    { label: 'Upload media', value: 'upload' },
                                                    { label: 'Do not attach media', value: 'none' }
                                                ]"
                                                radioLabelClass="relative pl-8 cursor-pointer text-base font-medium text-black dark:text-[#e8e6e3] before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-5 before:h-5 before:rounded-full before:border before:border-[#d0d5dd] dark:before:border-[#3b4043] before:bg-[#ffffff] dark:before:bg-[#181a1b] peer-checked:before:bg-[#000000] dark:peer-checked:before:bg-[#000000] after:content-[''] after:absolute after:left-[0.4375rem] after:top-1/2 after:-translate-y-1/2 after:w-[0.375rem] after:h-[0.375rem] after:rounded-full after:bg-[#07f468] dark:after:bg-[#07f468] after:hidden peer-checked:after:block"
                                            />
                                        </div>
                                        <div class="flex flex-col" v-show="profileData.attachMedia === 'upload'">
                                            <!-- upload-container -->
                                            <ThumbnailUploader
                                                v-if="!postMediaUploader.state.uploadedThumbnailFile"
                                                :uploader="postMediaUploader"
                                                title="Click to upload"
                                                subtitle="or drag and drop image or video files here"
                                                fileInfo="MP4, AVI, QUICKTIME, X-MATROSKA, X-MS-WMV, WEBM, OGG, PNG or JPG (max. 15MB)"
                                                wrapperClass="cursor-pointer border-2 border-transparent bg-[rgba(0,0,0,0.05)] rounded-xl px-6 py-4 relative h-[12.5rem] w-full flex flex-col items-center justify-center hover:border-[#0c111d] dark:bg-[#181a1b]/5 dark:hover:border-[#857c6d] hover:bg-[rgba(0,0,0,0.10)] dark:hover:bg-[rgba(0,0,0,0.05)] group/upload sm:h-[13.3125rem] md:h-[12.5rem] lg:h-[13.3125rem]"
                                                innerWrapperClass="gap-3 w-full flex flex-col justify-center items-center self-stretch border-2 border-dashed border-transparent"
                                                iconWrapperClass="flex justify-center items-center w-10 h-10 rounded-lg shadow-[0px_1px_2px_0px_#1018280D] bg-[#07F468] group-hover/upload:bg-[#0C111D] dark:bg-[#06c454] dark:group-hover/upload:bg-[#162036]"
                                                iconInnerWrapperClass="contents"
                                                titleClass="text-sm text-[#475467] dark:text-[#b1aba0]"
                                                titleHighlightClass="text-sm font-semibold text-center text-[#0C111D] dark:text-[#dbd8d3]"
                                                fileInfoClass="text-xs leading-normal text-[#475467] dark:text-[#b1aba0]"
                                            >
                                                <template #icon>
                                                    <img src="https://i.ibb.co.com/9JDWMW1/upload-03.webp" alt="upload 03" class="w-5 h-5 [filter:brightness(0)] group-hover/upload:[filter:brightness(0)_saturate(100%)_invert(65%)_sepia(22%)_saturate(4910%)_hue-rotate(97deg)_brightness(113%)_contrast(94%)]">
                                                </template>
                                            </ThumbnailUploader>

                                            <!-- uploaded-media-container -->
                                            <div v-else data-uploaded-media-container class="flex justify-center items-center relative rounded-sm overflow-hidden w-full max-w-[23.6667rem] h-[11.0625rem] bg-white/50 min-[600px]:h-[13.3125rem] md:h-[11.0625rem] lg:h-[13.3125rem] dark:bg-[#181a1b]/50">
                                                <!-- uploaded-image/video -->
                                                <div class="flex justify-center items-center w-full h-full">
                                                    <video v-if="postMediaUploader.state.uploadedThumbnailFile?.type?.startsWith('video/')" 
                                                        data-upload-video 
                                                        :src="postMediaPreviewUrl" 
                                                        class="w-full h-full object-cover"
                                                        autoplay muted loop playsinline></video>
                                                    <img v-else data-upload-image :src="postMediaPreviewUrl" alt="uploaded-media" class="w-full h-full object-cover">
                                                </div>
                                                <!-- delete-button (cross) -->
                                                <div @click="deletePostMedia" class="flex justify-center items-center absolute top-0 right-0 z-[3] w-6 h-6 group/button cursor-pointer bg-[#ff4405] hover:bg-[#ff692e]">
                                                    <img src="https://i.ibb.co.com/W4TXDR0j/x-close.webp" alt="x-close" class="w-4 h-4 [filter:brightness(100)_saturate(0)]"/>
                                                </div>
                                                <!-- fullscreen-button -->
                                                <div @click="expandPostMedia" data-uploaded-media-fullscreen-button class="flex justify-center items-center absolute bottom-0 left-0 z-[3] w-8 h-8 group/button cursor-pointer bg-black hover:bg-[#07F468]">
                                                    <img src="https://i.ibb.co.com/p6FPV9QX/fullscreen.webp" alt="fullscreen" class="w-5 h-5 group-hover/button:[filter:brightness(0)]">
                                                </div>
                                                <!-- media-type-tag -->
                                                <div class="flex justify-center items-center absolute bottom-0 right-0 z-[3] px-1 h-[1.375rem] bg-black dark:bg-[#181a1b]">
                                                    <span class="text-xs leading-normal font-medium text-white dark:text-[#e8e6e3]">Thumbnail</span>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>

                            <!-- post-preview-section -->
                            <div class="flex flex-col gap-2 w-full min-[600px]:w-[17.625rem] min-[600px]:shrink-0 lg:w-[22.5625rem]" v-show="profileData.postToX">
                                <h3 class="text-xs leading-normal text-right text-[#667085] dark:text-[#9e9689]">POST PREVIEW</h3>

                                <div class="flex gap-2 px-2 py-2 rounded-[0.3125rem] bg-white/70 w-ful min-[600px]:min-h-[6.3125rem] min-[600px]:max-h-[14.3125rem] lg:max-h-[unset] dark:bg-[#181a1bb3]">
                                    <!-- avatar-container -->
                                    <div class="w-6 h-6 rounded-md overflow-hidden min-w-[1.5rem]">
                                        <img src="https://i.ibb.co.com/70sHrpv/featured-media-bg.webp" alt="featured-media-bg" class="w-full h-full object-cover">
                                    </div>

                                    <!-- post-container -->
                                    <div class="flex flex-col gap-1 flex-1">
                                        <!-- post creator info -->
                                        <div class="flex items-center gap-2">
                                            <div class="flex items-center gap-1">
                                                <h4 class="text-xs leading-normal font-semibold text-[#0C111D] truncate dark:text-[#dbd8d3]">Jelly FISH</h4>
                                                <img src="https://i.ibb.co.com/nMhY8CpS/svgviewer-png-output-22.webp" alt="verified-tick" class="w-3 h-3"/>
                                            </div>

                                            <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9689]">@jellyf1sh</span>

                                            <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9689]">Jul 31</span>
                                        </div>

                                        <p class="text-xs leading-normal font-medium text-[#0C111D] dark:text-[#dbd8d3]">{{ profileData.postMessage || 'I got some lovely tips from fans...' }}<span v-show="profileData.showUsername">@manogoes4eva tipped 400 tokens</span></p>
                                    
                                        <div class="flex justify-center items-center rounded-[0.625rem] overflow-hidden bg-[#F2F6FC] w-full h-[10.9375rem] min-[600px]:h-[8.9375rem] lg:h-[11.9375rem] dark:bg-[#1d1f20]" v-show="profileData.attachMedia === 'upload'">
                                            <video v-if="postMediaUploader.state.uploadedThumbnailFile?.type?.startsWith('video/') && postMediaPreviewUrl" 
                                                :src="postMediaPreviewUrl" 
                                                class="w-full h-full object-cover"
                                                autoplay muted loop playsinline></video>
                                            <img v-else :src="postMediaPreviewUrl || 'https://i.ibb.co/Kx9QDc68/auth-bg-compressed.webp'" alt="post-media-preview" class="w-full h-full object-cover">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </section>
                </DashboardSectionContainer>

                <!-- cancel-save-button -->
                <div data-save-cancel-buttons-container class="flex justify-end items-center gap-6 px-2 md:px-6 lg:px-10 xl:justify-start xl:px-0" :class="{ 'hidden': !isChanged }">
                    <button @click="onCancel" class="flex justify-center items-center">
                        <span class="text-lg font-medium text-[#0C111D] dark:text-[#dbd8d3]">CANCEL</span>
                    </button>

                    <button @click="onSave" class="flex justify-center items-center px-5 h-10 bg-black group/button hover:bg-[#07F468] dark:bg-[#181a1b] dark:hover:bg-[#23f97b]">
                        <span class="text-lg font-medium text-[#07F468] group-hover/button:text-black dark:text-[#23f97b] dark:group-hover/button:text-[#181a1b]">SAVE</span>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- light-gallery-container -->
    <div v-if="isLightboxOpen" data-lightgallery-container class="fixed inset-0 flex justify-center items-center backdrop-blur-[5px] z-[99999] bg-white/10 dark:bg-[#181a1b]/10" @click="closeLightbox">
        <!-- media-container -->
        <div @click.stop data-lightgallery-media-wrapper class="flex justify-center items-center rounded-sm shadow-[0px_0px_24px_-2px_#10182880] relative max-h-screen max-w-[min(22.5rem,90vw)] sm:max-w-[min(46rem,90vw)] md:max-w-[min(39rem,90vw)] lg:max-w-[min(64rem,90vw)] bg-white/50 dark:bg-[#181a1b]/50">
            <div data-lightgallery-media-container class="flex justify-center items-center w-full h-full">
                <video v-if="lightboxMedia?.type?.startsWith('video/')" 
                    ref="lightboxVideo"
                    :src="lightboxMedia?.url" 
                    class="w-full h-full object-cover"
                    loop playsinline></video>
                <img v-else :src="lightboxMedia?.url" alt="lightbox-media" class="w-full h-full object-cover">
            </div>
            
            <!-- close-button -->
            <button @click="closeLightbox" data-lightgallery-close-button class="absolute top-2 right-2 rounded-full flex justify-center items-center w-6 h-6 backdrop-blur-[10px] bg-black/30 sm:w-12 sm:h-12 dark:bg-[#181a1b]/30">
                <img src="https://i.ibb.co.com/W4TXDR0j/x-close.webp" alt="x close" class="w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(100%)_sepia(0%)_saturate(1710%)_hue-rotate(335deg)_brightness(107%)_contrast(107%)] drop-shadow-[0px_0px_8px_0px_#00000080] sm:w-8 sm:h-8">
            </button>

            <!-- media-type-container -->
            <div class="absolute bottom-0 left-0 flex justify-center items-center z-[3]">
                <!-- image-tag -->
                <div v-if="!lightboxMedia?.type?.startsWith('video/')" data-image-tag class="flex justify-center items-center px-1 py-0.5 gap-[0.1875rem] bg-[rgba(48,52,55,.7)] dark:bg-[rgba(31,44,63,0.50)]">
                    <span class="text-xs text-white leading-normal tracking-[0.008rem] dark:text-[#e8e6e3]">Image</span>
                    <img src="https://i.ibb.co.com/nN9TqnGb/image-03.webp" alt="image 03" class="w-4 h-4" />
                </div>
                
                <!-- video-tag -->
                <div v-else data-video-tag class="flex justify-center items-center px-1 py-0.5 gap-[0.1875rem] bg-[rgba(48,52,55,.7)] dark:bg-[rgba(31,44,63,0.50)]">
                    <span class="text-xs text-white leading-normal tracking-[0.008rem] dark:text-[#e8e6e3]">Video</span>
                    <img src="https://i.ibb.co.com/wN978Hjm/video.webp" alt="video" class="w-4 h-4" />
                </div>
            </div>

            <!-- video-play-button -->
            <button v-if="lightboxMedia?.type?.startsWith('video/')" @click="toggleVideoPlay" data-video-play-button class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center w-14 h-14 rounded-full backdrop-blur-[3.945px] bg-white/10 md:w-[7.5rem] md:h-[7.5rem] dark:bg-[#181a1b]/10">
                <img v-if="isVideoPaused" src="https://i.ibb.co.com/Y7hmQnSb/play-icon-big.webp" alt="play icon big" class="w-8 h-8 opacity-70 md:w-14 md:h-14">
                <div v-else class="w-8 h-8 opacity-70 md:w-14 md:h-14 flex justify-center items-center gap-1.5 md:gap-2.5">
                    <div class="w-2 h-8 bg-white/70 md:w-3 md:h-12 rounded-sm"></div>
                    <div class="w-2 h-8 bg-white/70 md:w-3 md:h-12 rounded-sm"></div>
                </div>
            </button>
        </div>
    </div>
    </div>
</template>

<script setup>
import DashboardSectionContainer from '@/components/dashboard/DashboardSectionContainer.vue';
import InputComponentDashboard from '@/components/input/InputComponentDashboard.vue';
import TwoPieceButton from '@/components/button/TwoPieceButton.vue';
import CheckboxSwitch from '@/components/checkbox/CheckboxSwitch.vue';
import DropdownHandler from '@/components/dropdownHandler/DropdownHandler.vue';
import RadioGroup from '@/components/ui/form/radio/dashboard/RadioGroup.vue';
import ThumbnailUploader from '@/components/ui/global/media/uploader/HelperComponents/ThumbnailUploader.vue';
import UnifiedSelect from '@/components/ui/popup/dropdown/dashboard/customThemeSelect/UnifiedSelect.vue';
import NotificationCard from '@/components/ui/card/dashboard/NotificationCard.vue';
import { ref, computed, onMounted, onUnmounted, reactive, watch } from 'vue';

const tooltipAnchor = ref(null);
const isPremiumVideoUnlocked = ref(false);
const isPremiumLinksUnlocked = ref(false);
const galleryUploader = reactive({
  state: { uploadedThumbnailFile: null },
  setState(key, value) { this.state[key] = value; }
});

const postMediaUploader = reactive({
  state: { uploadedThumbnailFile: null },
  setState(key, value) { this.state[key] = value; }
});

const galleryItems = ref([]);

watch(() => galleryUploader.state.uploadedThumbnailFile, (newFile) => {
    if (newFile) {
        const videoCount = galleryItems.value.filter(item => item.type?.startsWith('video/')).length;
        if (newFile.type?.startsWith('video/') && videoCount >= 2) {
            alert("Maximum 2 video files allowed.");
            galleryUploader.setState('uploadedThumbnailFile', null);
            galleryUploader.setState('thumbnailUrl', null);
            return;
        }
        if (galleryItems.value.length >= 6) {
            alert("Maximum 6 media files allowed.");
            galleryUploader.setState('uploadedThumbnailFile', null);
            galleryUploader.setState('thumbnailUrl', null);
            return;
        }

        galleryItems.value.push({
            file: newFile,
            url: galleryUploader.state.thumbnailUrl,
            type: newFile.type
        });

        galleryUploader.setState('uploadedThumbnailFile', null);
        galleryUploader.setState('thumbnailUrl', null);
    }
});

const removeGalleryItem = (index) => {
    galleryItems.value.splice(index, 1);
};

const postMediaPreviewUrl = computed(() => postMediaUploader.state.thumbnailUrl);

const isLightboxOpen = ref(false);
const lightboxVideo = ref(null);
const isVideoPaused = ref(true);
const lightboxMedia = ref(null);

const disableScroll = () => {
  const scrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.classList.add('overflow-hidden');
  return scrollY;
};

const enableScroll = (scrollY) => {
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.classList.remove('overflow-hidden');
  window.scrollTo(0, scrollY);
};

let lastScrollY = 0;

const deletePostMedia = () => {
  postMediaUploader.setState('uploadedThumbnailFile', null);
  postMediaUploader.setState('thumbnailUrl', null);
};

const expandPostMedia = () => {
  lastScrollY = disableScroll();
  lightboxMedia.value = {
    url: postMediaPreviewUrl.value,
    type: postMediaUploader.state.uploadedThumbnailFile?.type
  };
  isLightboxOpen.value = true;
  isVideoPaused.value = true;
};

const closeLightbox = () => {
  isLightboxOpen.value = false;
  enableScroll(lastScrollY);
};

const toggleVideoPlay = () => {
  if (lightboxVideo.value) {
    if (lightboxVideo.value.paused) {
      lightboxVideo.value.play();
      isVideoPaused.value = false;
    } else {
      lightboxVideo.value.pause();
      isVideoPaused.value = true;
    }
  }
};

const profileData = ref({
  displayName: '',
  age: '',
  gender: '',
  country: '',
  bodyType: '',
  hair: '',
  bio: '',
  twitter: '',
  instagram: '',
  wishlist: '',
  additionalUrl1: '',
  additionalUrl2: '',
  additionalUrl3: '',
  additionalUrl4: '',
  tipMessage: '',
  postToX: false,
  postMessage: '',
  showUsername: false,
  attachMedia: 'upload',
  visibility: 'everyone'
});

const initialProfileData = ref(null);
const initialGalleryItems = ref(null);
const activeDropdown = ref(null);

const toggleDropdown = (name) => {
  activeDropdown.value = activeDropdown.value === name ? null : name;
};

const closeDropdowns = () => {
  activeDropdown.value = null;
};

const selectOption = (field, value) => {
  profileData.value[field] = value;
  closeDropdowns();
};

const getLabel = (options, val) => options.find(o => o.value === val)?.label || 'Select';

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Others', value: 'others' }
];

const visibilityOptions = [
  { label: 'Everyone', value: 'everyone', description: 'Your profile link will be visible to everyone.' },
  { label: 'Models Only', value: 'models-only', description: 'Your profile link will be accessible only to Fansocial users with model accounts and will not be visible to other users.' },
  { label: 'Fans Only', value: 'fans-only', description: 'Your profile link will be accessible only to Fansocial users with fan accounts and will not be visible to other users.' },
  { label: 'Registered User Only', value: 'registered-user-only', description: 'Your profile link will be accessible only to logged-in Fansocial users and will not be visible to others.' },
  { label: 'Nobody', value: 'nobody', description: 'Your profile link will remain completely private and inaccessible to anyone.' }
];

const countryOptions = [
  { label: 'Australia', value: 'australia' },
  { label: 'USA', value: 'usa' },
  { label: 'Singapore', value: 'singapore' },
  { label: 'Thailand', value: 'thailand' }
];

const bodyTypeOptions = [
  { label: 'Skinny', value: 'skinny' },
  { label: 'Slim', value: 'slim' },
  { label: 'Athletic', value: 'athletic' },
  { label: 'Medium', value: 'medium' },
  { label: 'Curvy', value: 'curvy' },
  { label: 'BBW', value: 'bbw' }
];

const hairOptions = [
  { label: 'Blonde', value: 'blonde' },
  { label: 'Black', value: 'black' },
  { label: 'Brunette', value: 'brunette' },
  { label: 'Brown', value: 'brown' },
  { label: 'Redhead', value: 'redhead' },
  { label: 'Colorful', value: 'colorful' }
];

const isChanged = computed(() => {
  if (!initialProfileData.value || !initialGalleryItems.value) return false;
  const profileChanged = JSON.stringify(profileData.value) !== JSON.stringify(initialProfileData.value);
  const galleryChanged = JSON.stringify(galleryItems.value) !== JSON.stringify(initialGalleryItems.value);
  return profileChanged || galleryChanged;
});

const showNotification = ref(false);
watch(isChanged, (newVal) => {
    if (newVal) {
        showNotification.value = true;
    } else {
        showNotification.value = false;
    }
});

const onCancel = () => {
  profileData.value = JSON.parse(JSON.stringify(initialProfileData.value));
  galleryItems.value = JSON.parse(JSON.stringify(initialGalleryItems.value));
};

const onSave = () => {
  initialProfileData.value = JSON.parse(JSON.stringify(profileData.value));
  initialGalleryItems.value = JSON.parse(JSON.stringify(galleryItems.value));
};

onMounted(() => {
  initialProfileData.value = JSON.parse(JSON.stringify(profileData.value));
  initialGalleryItems.value = JSON.parse(JSON.stringify(galleryItems.value));
  window.addEventListener('click', closeDropdowns);
});

onUnmounted(() => {
  window.removeEventListener('click', closeDropdowns);
});
</script>