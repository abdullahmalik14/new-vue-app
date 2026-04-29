<template>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New tier page</title>

    <!-- poppins font -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
      rel="stylesheet"
    />

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Custom CSS -->
    <script>
      tailwind.config = {
          darkMode: 'class',
          theme: {
              extend: {
                  screens: {
                      sm: '480px',
                      md: '768px',
                      lg: '1010px',
                      xl: '1365px',
                  },
                  fontFamily: {
                      sans: ['Poppins', 'Inter', 'Montserrat', 'Open Sans', 'arial', 'sans-serif'],
                  },
              },
          },
      }
    </script>
  </head>
<body class="bg-[#EAECF0] font-sans p-0 m-0 box-border overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] [&.dark]:bg-[#222526]">
    <!-- main-wrapper -->
    <div class="relative before:content-[''] before:fixed before:top-0 before:left-0 before:w-full before:h-screen before:pointer-events-none before:bg-cover before:bg-center before:bg-no-repeat before:bg-[url('https://i.ibb.co.com/QvpHN5vD/mobile-gradient-main-bg-1.webp')] before:z-[-1] sm:before:bg-[url('https://i.ibb.co.com/dw910Z5b/gradient-main-bg.webp')]">
        <!-- container -->
        <div data-container class="flex flex-col min-h-screen z-[0]">
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
                    <div right-nav-icons class="flex md:hidden items-center gap-2">
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
                    <div data-save-cancel-buttons-container class="hidden flex items-center gap-2 py-[0.1875rem] md:gap-6 md:py-0">
                        <button data-cancel-button class="flex justify-center items-center py-1 min-w-[4.6875rem] md:min-w-0">
                            <span class="text-base font-medium text-[#0C111D] md:text-lg dark:text-[#dbd8d3]">CANCEL</span>
                        </button>

                        <button data-save-button class="flex justify-center items-center px-4 py-1 min-w-[4.6875rem] md:px-[1.3125rem] md:py-1.5 bg-black group/button hover:bg-[#07F468] dark:bg-[#181a1b] dark:hover:bg-[#23f97b]">
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

                                    <!-- select-dropdown -->
                                    <div class="select-dropdown relative flex w-full">
                                        <div class="dropdown-select w-full cursor-pointer border-none">
                                            <div class="dash-select__trigger w-full h-12 flex items-center gap-2 py-2 px-3.5 rounded-t-sm border-b border-[#D0D5DD] bg-white/50 shadow-[0_1px_2px_0_#1018280D] md:rounded-[0.3125rem] dark:bg-[#181a1b]/50 dark:border-[#4a5568]">
                                                <span class="text-base flex-grow text-[#0C111D] capitalize text-balance dark:text-[#dbd8d3]">
                                                Everyone
                                                </span>
                                                <img class="select-arrow h-6 w-6 transition-transform duration-200 [filter:brightness(0)_saturate(100%)_invert(45%)_sepia(6%)_saturate(1597%)_hue-rotate(183deg)_brightness(91%)_contrast(76%)]"
                                                src="https://i.ibb.co.com/jkt6FN7G/chevron-down.webp" alt="chevron down" />
                                            </div>
                                            <div class="dash-options-container max-md:!fixed max-md:!bottom-0 max-md:!top-auto max-md:!shadow-[0px_-2px_4px_0px_#0000001A] absolute left-auto right-0 top-[calc(100%+0.5rem)] z-[9999] w-full origin-top scale-95 opacity-0 backdrop-blur-[25px] shadow-lg rounded-lg transition-[opacity,transform] duration-200 ease-out [transform-origin:50%_0] h-0 overflow-hidden pointer-events-none md:rounded-[0.3125rem]">
                                                <div class="rounded-lg border border-[rgba(186,188,203,0.5)] bg-white/50 dark:border-[rgba(61,71,73,0.5)] dark:bg-[#181a1b]/50">
                                                    <div data-value="everyone" class="option flex flex-col justify-center items-center gap-1 group [&.selected]:bg-[#EAECF0] hover:bg-white md:items-start md:border-b md:border-[#EAECF0] dark:hover:bg-[#181a1b] dark:[&.selected]:bg-[#222526] md:dark:border-[#222526]">
                                                        <div class="option-inner-container flex flex-col justify-center items-center gap-1 flex-1 px-4 py-2.5 md:items-start md:py-4">
                                                            <span class="text-base font-medium capitalize text-balance text-[#344054] group-[.selected]:font-semibold dark:text-[#bdb8af]">Everyone</span>
                                                            <p class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">Your profile link will be visible to everyone.</p>
                                                        </div>
                                                    </div>
                                                    <div data-value="models-only" class="option flex flex-col justify-center items-center gap-1 group [&.selected]:bg-[#EAECF0] hover:bg-white md:items-start md:border-b md:border-[#EAECF0] dark:hover:bg-[#181a1b] dark:[&.selected]:bg-[#222526] md:dark:border-[#222526]">
                                                        <div class="option-inner-container flex flex-col justify-center items-center gap-1 flex-1 px-4 py-2.5 md:items-start md:py-4">
                                                            <span class="text-base font-medium capitalize text-balance text-[#344054] group-[.selected]:font-semibold dark:text-[#bdb8af]">Models Only</span>
                                                            <p class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">Your profile link will be accessible only to Fansocial users with model accounts and will not be visible to other users.</p>
                                                        </div>
                                                    </div>
                                                    <div data-value="fans-only" class="option flex flex-col justify-center items-center gap-1 group [&.selected]:bg-[#EAECF0] hover:bg-white md:items-start md:border-b md:border-[#EAECF0] dark:hover:bg-[#181a1b] dark:[&.selected]:bg-[#222526] md:dark:border-[#222526]">
                                                        <div class="option-inner-container flex flex-col justify-center items-center gap-1 flex-1 px-4 py-2.5 md:items-start md:py-4">
                                                            <span class="text-base font-medium capitalize text-balance text-[#344054] group-[.selected]:font-semibold dark:text-[#bdb8af]">Fans Only</span>
                                                            <p class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">Your profile link will be accessible only to Fansocial users with fan accounts and will not be visible to other users.</p>
                                                        </div>
                                                    </div>
                                                    <div data-value="registered-user-only" class="option flex flex-col justify-center items-center gap-1 group [&.selected]:bg-[#EAECF0] hover:bg-white md:items-start md:border-b md:border-[#EAECF0] dark:hover:bg-[#181a1b] dark:[&.selected]:bg-[#222526] md:dark:border-[#222526]">
                                                        <div class="option-inner-container flex flex-col justify-center items-center gap-1 flex-1 px-4 py-2.5 md:items-start md:py-4">
                                                            <span class="text-base font-medium capitalize text-balance text-[#344054] group-[.selected]:font-semibold dark:text-[#bdb8af]">Registered User Only</span>
                                                            <p class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">Your profile link will be accessible only to logged-in Fansocial users and will not be visible to others.</p>
                                                        </div>
                                                    </div>
                                                    <div data-value="nobody" class="option flex flex-col justify-center items-center gap-1 group [&.selected]:bg-[#EAECF0] hover:bg-white md:items-start md:border-b md:border-[#EAECF0] dark:hover:bg-[#181a1b] dark:[&.selected]:bg-[#222526] md:dark:border-[#222526]">
                                                        <div class="option-inner-container flex flex-col justify-center items-center gap-1 flex-1 px-4 py-2.5 md:items-start md:py-4">
                                                            <span class="text-base font-medium capitalize text-balance text-[#344054] group-[.selected]:font-semibold dark:text-[#bdb8af]">Nobody</span>
                                                            <p class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">Your profile link will remain completely private and inaccessible to anyone.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <select class="dash-real-select hidden" name="dropdown-select" required>
                                            <option value="everyone">
                                                Everyone
                                            </option>
                                            <option value="models-only">
                                                Models Only
                                            </option>
                                            <option value="fans-only">
                                                Fans Only
                                            </option>
                                            <option value="registered-user-only">
                                                Registered User Only
                                            </option>
                                            <option value="nobody">
                                                Nobody
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <!-- input-group -->
                            <div class="flex flex-col gap-4 sm:flex-row">
                                <!-- input-container -->
                                <div class="flex flex-col gap-1.5 w-full">
                                    <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Display Name</span>
                                    <!-- input-field -->
                                    <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                        <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3.5 rounded-t-sm [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-11">
                                            <input type="text" placeholder="" value="" class="w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                        </div>
                                        <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                    </div>
                                </div>

                                <!-- input-container -->
                                <div class="flex flex-col gap-1.5 w-full">
                                    <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Age</span>
                                    <!-- input-field -->
                                    <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                        <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3.5 rounded-t-sm [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-11">
                                            <input type="text" placeholder="" value="" class="w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                        </div>
                                        <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                    </div>
                                </div>
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
                                        <div class="select-dropdown relative flex w-full">
                                            <div class="dropdown-select w-full cursor-pointer border-none">
                                                <div class="dash-select__trigger w-full h-10 flex items-center gap-2 py-2 px-3.5 rounded-t-sm border-b border-[#D0D5DD] bg-white/50 shadow-[0_1px_2px_0_#1018280D] dark:bg-[#181a1b]/50 dark:border-[#4a5568]">
                                                    <span class="text-base flex-grow text-[#101828] capitalize text-balance dark:text-[#d6d3cd]">
                                                    Select
                                                    </span>
                                                    <img class="select-arrow h-5 w-5 transition-transform duration-200"
                                                    src="https://i.ibb.co.com/jkt6FN7G/chevron-down.webp" alt="chevron down" />
                                                </div>
                                                <div class="dash-options-container max-md:!fixed max-md:!bottom-0 max-md:!top-auto max-md:!shadow-[0px_-2px_4px_0px_#0000001A] absolute left-auto right-0 top-[calc(100%+0.5rem)] z-[9999] w-full origin-top scale-95 opacity-0 backdrop-blur-[12.5px] shadow-lg rounded-lg transition-[opacity,transform] duration-200 ease-out [transform-origin:50%_0] h-0 overflow-hidden pointer-events-none">
                                                    <div class="rounded-lg p-1 border border-[rgba(186,188,203,0.5)] bg-white/50 dark:border-[rgba(61,71,73,0.5)] dark:bg-[#181a1b]/50">
                                                        <div data-value="male" class="option flex items-center justify-center gap-[0.625rem] group [&.selected]:bg-[#EAECF0] hover:bg-white dark:hover:bg-[#181a1b] dark:[&.selected]:bg-[#222526]">
                                                            <div class="option-inner-container flex justify-center items-center flex-1 gap-[0.625rem] p-[0.625rem]">
                                                            <span class="text-sm font-medium text-[#344054] capitalize text-balance group-[.selected]:font-semibold dark:text-[#bdb8af]">
                                                                Male
                                                            </span>
                                                            </div>
                                                        </div>
                                                        <div data-value="female" class="option flex items-center justify-center gap-[0.625rem] group [&.selected]:bg-[#EAECF0] hover:bg-white dark:hover:bg-[#181a1b] dark:[&.selected]:bg-[#222526]">
                                                            <div class="option-inner-container flex justify-center items-center flex-1 gap-[0.625rem] p-[0.625rem]">
                                                            <span class="text-sm font-medium text-[#344054] capitalize text-balance group-[.selected]:font-semibold dark:text-[#bdb8af]">
                                                                Female
                                                            </span>
                                                            </div>
                                                        </div>
                                                        <div data-value="others" class="option flex items-center justify-center gap-[0.625rem] group [&.selected]:bg-[#EAECF0] hover:bg-white dark:hover:bg-[#181a1b] dark:[&.selected]:bg-[#222526]">
                                                            <div class="option-inner-container flex justify-center items-center flex-1 gap-[0.625rem] p-[0.625rem]">
                                                            <span class="text-sm font-medium text-[#344054] capitalize text-balance group-[.selected]:font-semibold dark:text-[#bdb8af]">
                                                                Others
                                                            </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <select class="dash-real-select hidden" name="dropdown-select" required>
                                                <option value="male">
                                                    Male
                                                </option>
                                                <option value="female">
                                                    Female
                                                </option>
                                                <option value="others">
                                                    Others
                                                </option>
                                            </select>
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
                                        <div class="select-dropdown relative flex w-full">
                                            <div class="dropdown-select w-full cursor-pointer border-none">
                                                <div class="dash-select__trigger w-full h-10 flex items-center gap-2 py-2 px-3.5 rounded-t-sm border-b border-[#D0D5DD] bg-white/50 shadow-[0_1px_2px_0_#1018280D] dark:bg-[#181a1b]/50 dark:border-[#4a5568]">
                                                    <span class="text-base flex-grow text-[#101828] capitalize text-balance dark:text-[#d6d3cd]">
                                                    Select
                                                    </span>
                                                    <img class="select-arrow h-5 w-5 transition-transform duration-200"
                                                    src="https://i.ibb.co.com/jkt6FN7G/chevron-down.webp" alt="chevron down" />
                                                </div>
                                                <div class="dash-options-container max-md:!fixed max-md:!bottom-0 max-md:!top-auto max-md:!shadow-[0px_-2px_4px_0px_#0000001A] absolute left-auto right-0 top-[calc(100%+0.5rem)] z-[9999] w-full origin-top scale-95 opacity-0 backdrop-blur-[12.5px] shadow-lg rounded-lg transition-[opacity,transform] duration-200 ease-out [transform-origin:50%_0] h-0 overflow-hidden pointer-events-none">
                                                    <div class="rounded-lg p-1 border border-[rgba(186,188,203,0.5)] bg-white/50 dark:border-[rgba(61,71,73,0.5)] dark:bg-[#181a1b]/50">
                                                        <div data-value="australia" class="option flex items-center justify-center gap-[0.625rem] group [&.selected]:bg-[#EAECF0] hover:bg-white dark:hover:bg-[#181a1b] dark:[&.selected]:bg-[#222526]">
                                                            <div class="option-inner-container flex justify-center items-center flex-1 gap-[0.625rem] p-[0.625rem]">
                                                            <span class="text-sm font-medium text-[#344054] capitalize text-balance group-[.selected]:font-semibold dark:text-[#bdb8af]">
                                                                Australia
                                                            </span>
                                                            </div>
                                                        </div>
                                                        <div data-value="usa" class="option flex items-center justify-center gap-[0.625rem] group [&.selected]:bg-[#EAECF0] hover:bg-white dark:hover:bg-[#181a1b] dark:[&.selected]:bg-[#222526]">
                                                            <div class="option-inner-container flex justify-center items-center flex-1 gap-[0.625rem] p-[0.625rem]">
                                                            <span class="text-sm font-medium text-[#344054] capitalize text-balance group-[.selected]:font-semibold dark:text-[#bdb8af]">
                                                                USA
                                                            </span>
                                                            </div>
                                                        </div>
                                                        <div data-value="singapore" class="option flex items-center justify-center gap-[0.625rem] group [&.selected]:bg-[#EAECF0] hover:bg-white dark:hover:bg-[#181a1b] dark:[&.selected]:bg-[#222526]">
                                                            <div class="option-inner-container flex justify-center items-center flex-1 gap-[0.625rem] p-[0.625rem]">
                                                            <span class="text-sm font-medium text-[#344054] capitalize text-balance group-[.selected]:font-semibold dark:text-[#bdb8af]">
                                                                Singapore
                                                            </span>
                                                            </div>
                                                        </div>
                                                        <div data-value="thailand" class="option flex items-center justify-center gap-[0.625rem] group [&.selected]:bg-[#EAECF0] hover:bg-white dark:hover:bg-[#181a1b] dark:[&.selected]:bg-[#222526]">
                                                            <div class="option-inner-container flex justify-center items-center flex-1 gap-[0.625rem] p-[0.625rem]">
                                                            <span class="text-sm font-medium text-[#344054] capitalize text-balance group-[.selected]:font-semibold dark:text-[#bdb8af]">
                                                                Thailand
                                                            </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <select class="dash-real-select hidden" name="dropdown-select" required>
                                                <option value="australia">
                                                    Australia
                                                </option>
                                                <option value="usa">
                                                    USA
                                                </option>
                                                <option value="singapore">
                                                    Singapore
                                                </option>
                                                <option value="thailand">
                                                    Thailand
                                                </option>
                                            </select>
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

                                        <!-- select-dropdown -->
                                        <div class="select-dropdown relative flex w-full">
                                            <div class="dropdown-select w-full cursor-pointer border-none">
                                                <div class="dash-select__trigger w-full h-10 flex items-center gap-2 py-2 px-3.5 rounded-t-sm border-b border-[#D0D5DD] bg-white/50 shadow-[0_1px_2px_0_#1018280D] dark:bg-[#181a1b]/50 dark:border-[#4a5568]">
                                                    <span class="text-base flex-grow text-[#101828] capitalize text-balance dark:text-[#d6d3cd]">
                                                    Select
                                                    </span>
                                                    <img class="select-arrow h-5 w-5 transition-transform duration-200"
                                                    src="https://i.ibb.co.com/jkt6FN7G/chevron-down.webp" alt="chevron down" />
                                                </div>
                                                <div class="dash-options-container max-md:!fixed max-md:!bottom-0 max-md:!top-auto max-md:!shadow-[0px_-2px_4px_0px_#0000001A] absolute left-auto right-0 top-[calc(100%+0.5rem)] z-[9999] w-full origin-top scale-95 opacity-0 backdrop-blur-[12.5px] shadow-lg rounded-lg transition-[opacity,transform] duration-200 ease-out [transform-origin:50%_0] h-0 overflow-hidden pointer-events-none">
                                                    <div class="rounded-lg p-1 border border-[rgba(186,188,203,0.5)] bg-white/50 dark:border-[rgba(61,71,73,0.5)] dark:bg-[#181a1b]/50">
                                                        <div data-value="skinny" class="option flex items-center justify-center gap-[0.625rem] group [&.selected]:bg-[#EAECF0] hover:bg-white dark:hover:bg-[#181a1b] dark:[&.selected]:bg-[#222526]">
                                                            <div class="option-inner-container flex justify-center items-center flex-1 gap-[0.625rem] p-[0.625rem]">
                                                            <span class="text-sm font-medium text-[#344054] capitalize text-balance group-[.selected]:font-semibold dark:text-[#bdb8af]">
                                                                Skinny
                                                            </span>
                                                            </div>
                                                        </div>
                                                        <div data-value="slim" class="option flex items-center justify-center gap-[0.625rem] group [&.selected]:bg-[#EAECF0] hover:bg-white dark:hover:bg-[#181a1b] dark:[&.selected]:bg-[#222526]">
                                                            <div class="option-inner-container flex justify-center items-center flex-1 gap-[0.625rem] p-[0.625rem]">
                                                            <span class="text-sm font-medium text-[#344054] capitalize text-balance group-[.selected]:font-semibold dark:text-[#bdb8af]">
                                                                Slim
                                                            </span>
                                                            </div>
                                                        </div>
                                                        <div data-value="athletic" class="option flex items-center justify-center gap-[0.625rem] group [&.selected]:bg-[#EAECF0] hover:bg-white dark:hover:bg-[#181a1b] dark:[&.selected]:bg-[#222526]">
                                                            <div class="option-inner-container flex justify-center items-center flex-1 gap-[0.625rem] p-[0.625rem]">
                                                            <span class="text-sm font-medium text-[#344054] capitalize text-balance group-[.selected]:font-semibold dark:text-[#bdb8af]">
                                                                Athletic
                                                            </span>
                                                            </div>
                                                        </div>
                                                        <div data-value="medium" class="option flex items-center justify-center gap-[0.625rem] group [&.selected]:bg-[#EAECF0] hover:bg-white dark:hover:bg-[#181a1b] dark:[&.selected]:bg-[#222526]">
                                                            <div class="option-inner-container flex justify-center items-center flex-1 gap-[0.625rem] p-[0.625rem]">
                                                            <span class="text-sm font-medium text-[#344054] capitalize text-balance group-[.selected]:font-semibold dark:text-[#bdb8af]">
                                                                Medium
                                                            </span>
                                                            </div>
                                                        </div>
                                                        <div data-value="curvy" class="option flex items-center justify-center gap-[0.625rem] group [&.selected]:bg-[#EAECF0] hover:bg-white dark:hover:bg-[#181a1b] dark:[&.selected]:bg-[#222526]">
                                                            <div class="option-inner-container flex justify-center items-center flex-1 gap-[0.625rem] p-[0.625rem]">
                                                            <span class="text-sm font-medium text-[#344054] capitalize text-balance group-[.selected]:font-semibold dark:text-[#bdb8af]">
                                                                Curvy
                                                            </span>
                                                            </div>
                                                        </div>
                                                        <div data-value="bbw" class="option flex items-center justify-center gap-[0.625rem] group [&.selected]:bg-[#EAECF0] hover:bg-white dark:hover:bg-[#181a1b] dark:[&.selected]:bg-[#222526]">
                                                            <div class="option-inner-container flex justify-center items-center flex-1 gap-[0.625rem] p-[0.625rem]">
                                                            <span class="text-sm font-medium text-[#344054] capitalize text-balance group-[.selected]:font-semibold dark:text-[#bdb8af]">
                                                                BBW
                                                            </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <select class="dash-real-select hidden" name="dropdown-select" required>
                                                <option value="skinny">
                                                    Skinny
                                                </option>
                                                <option value="slim">
                                                    Slim
                                                </option>
                                                <option value="athletic">
                                                    Athletic
                                                </option>
                                                <option value="medium">
                                                    Medium
                                                </option>
                                                <option value="curvy">
                                                    Curvy
                                                </option>
                                                <option value="bbw">
                                                    BBW
                                                </option>
                                            </select>
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

                                        <!-- select-dropdown -->
                                        <div class="select-dropdown relative flex w-full">
                                            <div class="dropdown-select w-full cursor-pointer border-none">
                                                <div class="dash-select__trigger w-full h-10 flex items-center gap-2 py-2 px-3.5 rounded-t-sm border-b border-[#D0D5DD] bg-white/50 shadow-[0_1px_2px_0_#1018280D] dark:bg-[#181a1b]/50 dark:border-[#4a5568]">
                                                    <span class="text-base flex-grow text-[#101828] capitalize text-balance dark:text-[#d6d3cd]">
                                                    Select
                                                    </span>
                                                    <img class="select-arrow h-5 w-5 transition-transform duration-200"
                                                    src="https://i.ibb.co.com/jkt6FN7G/chevron-down.webp" alt="chevron down" />
                                                </div>
                                                <div class="dash-options-container max-md:!fixed max-md:!bottom-0 max-md:!top-auto max-md:!shadow-[0px_-2px_4px_0px_#0000001A] absolute left-auto right-0 top-[calc(100%+0.5rem)] z-[9999] w-full origin-top scale-95 opacity-0 backdrop-blur-[12.5px] shadow-lg rounded-lg transition-[opacity,transform] duration-200 ease-out [transform-origin:50%_0] h-0 overflow-hidden pointer-events-none">
                                                    <div class="rounded-lg p-1 border border-[rgba(186,188,203,0.5)] bg-white/50 dark:border-[rgba(61,71,73,0.5)] dark:bg-[#181a1b]/50">
                                                        <div data-value="blonde" class="option flex items-center justify-center gap-[0.625rem] group [&.selected]:bg-[#EAECF0] hover:bg-white dark:hover:bg-[#181a1b] dark:[&.selected]:bg-[#222526]">
                                                            <div class="option-inner-container flex justify-center items-center flex-1 gap-[0.625rem] p-[0.625rem]">
                                                            <span class="text-sm font-medium text-[#344054] capitalize text-balance group-[.selected]:font-semibold dark:text-[#bdb8af]">
                                                                Blonde
                                                            </span>
                                                            </div>
                                                        </div>
                                                        <div data-value="black" class="option flex items-center justify-center gap-[0.625rem] group [&.selected]:bg-[#EAECF0] hover:bg-white dark:hover:bg-[#181a1b] dark:[&.selected]:bg-[#222526]">
                                                            <div class="option-inner-container flex justify-center items-center flex-1 gap-[0.625rem] p-[0.625rem]">
                                                            <span class="text-sm font-medium text-[#344054] capitalize text-balance group-[.selected]:font-semibold dark:text-[#bdb8af]">
                                                                Black
                                                            </span>
                                                            </div>
                                                        </div>
                                                        <div data-value="brunette" class="option flex items-center justify-center gap-[0.625rem] group [&.selected]:bg-[#EAECF0] hover:bg-white dark:hover:bg-[#181a1b] dark:[&.selected]:bg-[#222526]">
                                                            <div class="option-inner-container flex justify-center items-center flex-1 gap-[0.625rem] p-[0.625rem]">
                                                            <span class="text-sm font-medium text-[#344054] capitalize text-balance group-[.selected]:font-semibold dark:text-[#bdb8af]">
                                                                Brunette
                                                            </span>
                                                            </div>
                                                        </div>
                                                        <div data-value="brown" class="option flex items-center justify-center gap-[0.625rem] group [&.selected]:bg-[#EAECF0] hover:bg-white dark:hover:bg-[#181a1b] dark:[&.selected]:bg-[#222526]">
                                                            <div class="option-inner-container flex justify-center items-center flex-1 gap-[0.625rem] p-[0.625rem]">
                                                            <span class="text-sm font-medium text-[#344054] capitalize text-balance group-[.selected]:font-semibold dark:text-[#bdb8af]">
                                                                Brown
                                                            </span>
                                                            </div>
                                                        </div>
                                                        <div data-value="redhead" class="option flex items-center justify-center gap-[0.625rem] group [&.selected]:bg-[#EAECF0] hover:bg-white dark:hover:bg-[#181a1b] dark:[&.selected]:bg-[#222526]">
                                                            <div class="option-inner-container flex justify-center items-center flex-1 gap-[0.625rem] p-[0.625rem]">
                                                            <span class="text-sm font-medium text-[#344054] capitalize text-balance group-[.selected]:font-semibold dark:text-[#bdb8af]">
                                                                Redhead
                                                            </span>
                                                            </div>
                                                        </div>
                                                        <div data-value="colorful" class="option flex items-center justify-center gap-[0.625rem] group [&.selected]:bg-[#EAECF0] hover:bg-white dark:hover:bg-[#181a1b] dark:[&.selected]:bg-[#222526]">
                                                            <div class="option-inner-container flex justify-center items-center flex-1 gap-[0.625rem] p-[0.625rem]">
                                                            <span class="text-sm font-medium text-[#344054] capitalize text-balance group-[.selected]:font-semibold dark:text-[#bdb8af]">
                                                                Colorful
                                                            </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <select class="dash-real-select hidden" name="dropdown-select" required>
                                                <option value="blonde">
                                                    Blonde
                                                </option>
                                                <option value="black">
                                                    Black
                                                </option>
                                                <option value="brunette">
                                                    Brunette
                                                </option>
                                                <option value="brown">
                                                    Brown
                                                </option>
                                                <option value="redhead">
                                                    Redhead
                                                </option>
                                                <option value="colorful">
                                                    Colorful
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- textarea-container -->
                            <div class="flex flex-col gap-1.5 w-full">
                                <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Display Name</span>
                                <!-- textarea -->
                                <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                    <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 rounded-t-sm [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)]">
                                        <textarea name="" id="" placeholder="" class="w-full h-full px-3.5 py-2.5 min-h-[7.5rem] text-base [field-sizing:content] text-[#101828] dark:text-[#d6d3cd] placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans bg-transparent border-none outline-none"></textarea>
                                    </div>
                                    <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                </div>
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
                                <div class="flex flex-col gap-4 lg:flex-row-reverse">
                                    <!-- upload-container -->
                                    <div data-media-upload="" class="cursor-pointer border-2 border-transparent bg-[rgba(0,0,0,0.05)] rounded-xl relative h-[12.5rem] w-full flex flex-col items-center justify-center hover:border-[#0c111d] dark:bg-[#181a1b]/5 dark:hover:border-[#857c6d] hover:bg-[rgba(0,0,0,0.10)] dark:hover:bg-[rgba(0,0,0,0.05)] group/upload sm:h-[13.3125rem] lg:w-1/2">
                                        <div data-media-upload-input-wrap="" class="gap-3 w-full flex flex-col justify-center items-center px-6 py-4 self-stretch border-2 border-dashed border-transparent">
                                            <div class="flex justify-center items-center w-10 h-10 rounded-lg shadow-[0px_1px_2px_0px_#1018280D] bg-[#07F468] group-hover/upload:bg-[#0C111D] dark:bg-[#06c454] dark:group-hover/upload:bg-[#162036]">
                                                <img src="https://i.ibb.co.com/9JDWMW1/upload-03.webp" alt="upload 03" class="w-5 h-5 [filter:brightness(0)] group-hover/upload:[filter:brightness(0)_saturate(100%)_invert(65%)_sepia(22%)_saturate(4910%)_hue-rotate(97deg)_brightness(113%)_contrast(94%)]">
                                            </div>
                                            <div class="flex flex-col gap-1 text-center">
                                                <p class="text-sm text-[#475467] dark:text-[#b1aba0]"><span class="text-sm font-semibold text-center text-[#0C111D] dark:text-[#dbd8d3]">Click to upload</span> or drag and drop image or video files here</p>
                                                <p class="text-xs leading-normal text-[#475467] dark:text-[#b1aba0]">MP4, AVI, QUICKTIME, X-MATROSKA, X-MS-WMV, WEBM, OGG, PNG or JPG (max. 15MB)</p>
                                            </div>
                                        </div>

                                        <div data-uploaded-media-container="" class="hidden flex flex-col gap-1 px-2 pt-2 pb-12 w-full h-full">
                                            <div class="flex flex-col w-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none]">
                                                <!-- media-item -->
                                                <div class="flex justify-between items-center gap-2 h-12 min-h-[3rem] px-2 py-1 border-b border-[#D0D5DD] dark:border-[#3b4043]">
                                                    <div class="flex items-center gap-4">
                                                        <img src="https://i.ibb.co.com/Qjn50qJy/Images.webp" alt="Images" class="w-6 h-6 min-w-[1.5rem] [filter:brightness(0)_saturate(100%)_invert(5%)_sepia(8%)_saturate(6048%)_hue-rotate(189deg)_brightness(94%)_contrast(96%)]">
                                                        <span class="text-base font-medium tracking-[0.015rem] text-[#303437] dark:text-[#b1aba0]">free_photo.png</span>
                                                    </div>

                                                    <button class="flex justify-center items-center gap-0.5">
                                                        <img src="https://i.ibb.co.com/VYYz44p3/minus-square.webp" alt="minus square" class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(66%)_sepia(13%)_saturate(347%)_hue-rotate(179deg)_brightness(94%)_contrast(92%)]">
                                                        <span class="text-xs leading-normal font-medium text-[#98A2B3] dark:text-[#b0a993]">remove</span>
                                                    </button>
                                                </div>

                                                <!-- media-item -->
                                                <div class="flex justify-between items-center gap-2 h-12 min-h-[3rem] px-2 py-1 border-b border-[#D0D5DD] dark:border-[#3b4043]">
                                                    <div class="flex items-center gap-4">
                                                        <img src="https://i.ibb.co.com/Qjn50qJy/Images.webp" alt="Images" class="w-6 h-6 min-w-[1.5rem] [filter:brightness(0)_saturate(100%)_invert(5%)_sepia(8%)_saturate(6048%)_hue-rotate(189deg)_brightness(94%)_contrast(96%)]">
                                                        <span class="text-base font-medium tracking-[0.015rem] text-[#303437] dark:text-[#b1aba0]">free_photo.png</span>
                                                    </div>

                                                    <button class="flex justify-center items-center gap-0.5">
                                                        <img src="https://i.ibb.co.com/VYYz44p3/minus-square.webp" alt="minus square" class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(66%)_sepia(13%)_saturate(347%)_hue-rotate(179deg)_brightness(94%)_contrast(92%)]">
                                                        <span class="text-xs leading-normal font-medium text-[#98A2B3] dark:text-[#b0a993]">remove</span>
                                                    </button>
                                                </div>

                                                <!-- media-item -->
                                                <div class="flex justify-between items-center gap-2 h-12 min-h-[3rem] px-2 py-1 border-b border-[#D0D5DD] dark:border-[#3b4043]">
                                                    <div class="flex items-center gap-4">
                                                        <img src="https://i.ibb.co.com/sdBL6k4R/video.webp" alt="video" class="w-6 h-6 min-w-[1.5rem] [filter:brightness(0)_saturate(100%)_invert(5%)_sepia(8%)_saturate(6048%)_hue-rotate(189deg)_brightness(94%)_contrast(96%)]">
                                                        <span class="text-base font-medium tracking-[0.015rem] text-[#303437] dark:text-[#b1aba0]">free_video.png</span>
                                                    </div>

                                                    <button class="flex justify-center items-center gap-0.5">
                                                        <img src="https://i.ibb.co.com/VYYz44p3/minus-square.webp" alt="minus square" class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(66%)_sepia(13%)_saturate(347%)_hue-rotate(179deg)_brightness(94%)_contrast(92%)]">
                                                        <span class="text-xs leading-normal font-medium text-[#98A2B3] dark:text-[#b0a993]">remove</span>
                                                    </button>
                                                </div>

                                                <!-- media-item -->
                                                <div class="flex justify-between items-center gap-2 h-12 min-h-[3rem] px-2 py-1 border-b border-[#D0D5DD] dark:border-[#3b4043]">
                                                    <div class="flex items-center gap-4">
                                                        <img src="https://i.ibb.co.com/sdBL6k4R/video.webp" alt="video" class="w-6 h-6 min-w-[1.5rem] [filter:brightness(0)_saturate(100%)_invert(5%)_sepia(8%)_saturate(6048%)_hue-rotate(189deg)_brightness(94%)_contrast(96%)]">
                                                        <span class="text-base font-medium tracking-[0.015rem] text-[#303437] dark:text-[#b1aba0]">free_video.png</span>
                                                    </div>

                                                    <button class="flex justify-center items-center gap-0.5">
                                                        <img src="https://i.ibb.co.com/VYYz44p3/minus-square.webp" alt="minus square" class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(66%)_sepia(13%)_saturate(347%)_hue-rotate(179deg)_brightness(94%)_contrast(92%)]">
                                                        <span class="text-xs leading-normal font-medium text-[#98A2B3] dark:text-[#b0a993]">remove</span>
                                                    </button>
                                                </div>

                                                <!-- media-item -->
                                                <div class="flex justify-between items-center gap-2 h-12 min-h-[3rem] px-2 py-1 border-b border-[#D0D5DD] dark:border-[#3b4043]">
                                                    <div class="flex items-center gap-4">
                                                        <img src="https://i.ibb.co.com/Qjn50qJy/Images.webp" alt="Images" class="w-6 h-6 min-w-[1.5rem] [filter:brightness(0)_saturate(100%)_invert(5%)_sepia(8%)_saturate(6048%)_hue-rotate(189deg)_brightness(94%)_contrast(96%)]">
                                                        <span class="text-base font-medium tracking-[0.015rem] text-[#303437] dark:text-[#b1aba0]">free_photo.png</span>
                                                    </div>

                                                    <button class="flex justify-center items-center gap-0.5">
                                                        <img src="https://i.ibb.co.com/VYYz44p3/minus-square.webp" alt="minus square" class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(66%)_sepia(13%)_saturate(347%)_hue-rotate(179deg)_brightness(94%)_contrast(92%)]">
                                                        <span class="text-xs leading-normal font-medium text-[#98A2B3] dark:text-[#b0a993]">remove</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div data-upload-progress-container="" class="hidden flex flex-col justify-center items-center gap-1 px-6 py-4 w-full h-full">
                                            <div class="flex flex-col justify-center items-center gap-6 w-full h-full">
                                                <!-- progress-bar -->
                                                <div data-progress-bar class="rounded-[3.125rem] overflow-hidden w-full max-w-[26.25rem] h-2 bg-[#DEE5EC] dark:bg-[#272a2c] z-0">
                                                    <div data-progress-fill class="w-1/2 h-full bg-[#0c111d] dark:bg-[#162036]"></div>
                                                </div>

                                                <span class="text-sm leading-normal tracking-[-0.00875rem] text-[#0C111D] dark:text-[#dbd8d3]">Uploading...</span>
                                            </div>
                                        </div>

                                        <!-- Add Tier Button -->
                                        <button class="hidden absolute -right-0.5 -bottom-0.5 w-max [clip-path:polygon(8%_0,_100%_0,_105%_105%,_0_105%)] group flex items-center justify-center gap-[0.625rem] py-1 pl-[1.4rem] pr-2 rounded-br-xl bg-black hover:bg-[#07f468] cursor-pointer">
                                            <div class="flex items-center justify-center gap-2.5">
                                                <img src="https://i.ibb.co.com/LzBLyfyn/upload-01.webp" alt="upload-01"
                                                    class="[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)] w-6 h-6 group-hover:filter-none"
                                                />
                                                <span class="text-lg leading-7 font-medium text-[#07f468] group-hover:text-black">Upload</span>
                                                <div class="flex items-start h-8">
                                                    <span class="text-[0.625rem] leading-normal text-[#07f468] group-hover:text-black">3</span>
                                                </div>
                                            </div>
                                        </button>

                                        <!-- cancle-button -->
                                        <button class="hidden absolute right-2 bottom-2 w-max flex justify-center items-center gap-1 h-[1.125rem]">
                                            <img src="https://i.ibb.co.com/j9XG8FWR/close-button.webp" alt="close button" class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(22%)_sepia(13%)_saturate(1332%)_hue-rotate(179deg)_brightness(94%)_contrast(87%)]">
                                            <span class="text-xs font-medium text-[#344054] dark:text-[#bdb8af]">Cancel</span>
                                        </button>
                                    </div>

                                    <!-- upload-container -->
                                    <div class="hidden relative flex flex-col gap-6 h-[12.5rem] rounded-xl cursor-pointer sm:h-[13.3125rem] lg:w-1/2">
                                        <!-- dashed border -->
                                        <svg class="absolute inset-0 w-full h-full pointer-events-none">
                                            <rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="12" ry="12" fill="none" stroke="#D0D5DD" stroke-width="1" stroke-dasharray="4 4"
                                            class="dark:stroke-[#3b4043]"
                                            />
                                        </svg>

                                        <!-- content -->
                                        <div class="flex flex-col gap-6 h-full justify-center items-center">
                                            <img src="https://i.ibb.co.com/9Hm4KHzN/Images.webp" alt="Images" class="w-16 h-16">
                                            <p class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">Upload your first piece and watch yourself shine!</p>
                                        </div>
                                    </div>

                                    <!-- uploaded-gallery-grid-container -->
                                    <div data-uploaded-grid-container class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:w-1/2">
                                        <!-- uploaded-media -->
                                        <div data-uploaded-media draggable="true" class="flex justify-center items-center relative rounded-sm overflow-hidden w-full aspect-[1.9886] bg-white/50 cursor-pointer lg:h-[6.40625rem] lg:aspect-[unset] dark:bg-[#181a1b]/50">
                                            <!-- uploaded-image -->
                                            <div class="flex justify-center items-center w-full h-full">
                                                <img data-upload-image src="https://i.ibb.co.com/Kx9QDc68/auth-bg-compressed.webp" alt="auth-bg-compressed" class="w-full h-full object-cover">
                                            </div>
                                            <!-- delete-button -->
                                            <div data-delete-button class="flex justify-center items-center absolute top-0 right-0 z-[3] w-6 h-6 group/button cursor-pointer bg-[#ff4405] hover:bg-[#ff692e]">
                                                <img src="https://i.ibb.co.com/j9XG8FWR/close-button.webp" alt="close button" class="w-5 h-5 [filter:brightness(100)_saturate(0)]"/>
                                            </div>
                                            <!-- media-type-container -->
                                            <div class="absolute bottom-0 left-0 flex justify-center items-center z-[3]">
                                                <!-- image-tag -->
                                                <div data-image-tag class="flex justify-center items-center gap-[0.1875rem] h-5 px-1 bg-[rgba(48,52,55,.7)] dark:bg-[rgba(31,44,63,0.50)]">
                                                    <span class="text-xs leading-normal tracking-[0.008rem] text-white dark:text-[#e8e6e3]">Image</span>
                                                    <img src="https://i.ibb.co.com/nN9TqnGb/image-03.webp" alt="image 03" class="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>

                                        <!-- uploaded-media -->
                                        <div data-uploaded-media draggable="true" class="flex justify-center items-center relative rounded-sm overflow-hidden w-full aspect-[1.9886] bg-white/50 cursor-pointer lg:h-[6.40625rem] lg:aspect-[unset] dark:bg-[#181a1b]/50">
                                            <!-- uploaded-image -->
                                            <div class="flex justify-center items-center w-full h-full">
                                                <video data-upload-video
                                                    class="w-full h-full object-cover"
                                                    src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                                                ></video>
                                            </div>
                                            <!-- delete-button -->
                                            <div data-delete-button class="flex justify-center items-center absolute top-0 right-0 z-[3] w-6 h-6 group/button cursor-pointer bg-[#ff4405] hover:bg-[#ff692e]">
                                                <img src="https://i.ibb.co.com/j9XG8FWR/close-button.webp" alt="close button" class="w-5 h-5 [filter:brightness(100)_saturate(0)]"/>
                                            </div>
                                            <!-- media-type-container -->
                                            <div class="absolute bottom-0 left-0 flex justify-center items-center z-[3]">
                                                <!-- video-tag -->
                                                <div data-video-tag class="flex justify-center items-center gap-[0.1875rem] px-1 h-5 bg-[rgba(48,52,55,.7)] dark:bg-[rgba(31,44,63,0.50)]">
                                                    <span class="text-xs text-white leading-normal tracking-[0.008rem] dark:text-[#e8e6e3]">Video</span>
                                                    <img src="https://i.ibb.co.com/wN978Hjm/video.webp" alt="video" class="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>

                                        <!-- uploaded-media -->
                                        <div data-uploaded-media draggable="true" class="flex justify-center items-center relative rounded-sm overflow-hidden w-full aspect-[1.9886] bg-white/50 cursor-pointer lg:h-[6.40625rem] lg:aspect-[unset] dark:bg-[#181a1b]/50">
                                            <!-- uploaded-image -->
                                            <div class="flex justify-center items-center w-full h-full">
                                                <img data-upload-image src="https://i.ibb.co.com/Kx9QDc68/auth-bg-compressed.webp" alt="auth-bg-compressed" class="w-full h-full object-cover">
                                            </div>
                                            <!-- delete-button -->
                                            <div data-delete-button class="flex justify-center items-center absolute top-0 right-0 z-[3] w-6 h-6 group/button cursor-pointer bg-[#ff4405] hover:bg-[#ff692e]">
                                                <img src="https://i.ibb.co.com/j9XG8FWR/close-button.webp" alt="close button" class="w-5 h-5 [filter:brightness(100)_saturate(0)]"/>
                                            </div>
                                            <!-- media-type-container -->
                                            <div class="absolute bottom-0 left-0 flex justify-center items-center z-[3]">
                                                <!-- image-tag -->
                                                <div data-image-tag class="flex justify-center items-center gap-[0.1875rem] h-5 px-1 bg-[rgba(48,52,55,.7)] dark:bg-[rgba(31,44,63,0.50)]">
                                                    <span class="text-xs leading-normal tracking-[0.008rem] text-white dark:text-[#e8e6e3]">Image</span>
                                                    <img src="https://i.ibb.co.com/nN9TqnGb/image-03.webp" alt="image 03" class="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>

                                        <!-- uploaded-media -->
                                        <div data-uploaded-media draggable="true" class="flex justify-center items-center relative rounded-sm overflow-hidden w-full aspect-[1.9886] bg-white/50 cursor-pointer lg:h-[6.40625rem] lg:aspect-[unset] dark:bg-[#181a1b]/50">
                                            <!-- uploaded-image -->
                                            <div class="flex justify-center items-center w-full h-full">
                                                <video data-upload-video
                                                    class="w-full h-full object-cover"
                                                    src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                                                ></video>
                                            </div>
                                            <!-- delete-button -->
                                            <div data-delete-button class="flex justify-center items-center absolute top-0 right-0 z-[3] w-6 h-6 group/button cursor-pointer bg-[#ff4405] hover:bg-[#ff692e]">
                                                <img src="https://i.ibb.co.com/j9XG8FWR/close-button.webp" alt="close button" class="w-5 h-5 [filter:brightness(100)_saturate(0)]"/>
                                            </div>
                                            <!-- media-type-container -->
                                            <div class="absolute bottom-0 left-0 flex justify-center items-center z-[3]">
                                                <!-- video-tag -->
                                                <div data-video-tag class="flex justify-center items-center gap-[0.1875rem] px-1 h-5 bg-[rgba(48,52,55,.7)] dark:bg-[rgba(31,44,63,0.50)]">
                                                    <span class="text-xs text-white leading-normal tracking-[0.008rem] dark:text-[#e8e6e3]">Video</span>
                                                    <img src="https://i.ibb.co.com/wN978Hjm/video.webp" alt="video" class="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>

                                        <!-- uploaded-media -->
                                        <div data-uploaded-media draggable="true" class="flex justify-center items-center relative rounded-sm overflow-hidden w-full aspect-[1.9886] bg-white/50 cursor-pointer lg:h-[6.40625rem] lg:aspect-[unset] dark:bg-[#181a1b]/50">
                                            <!-- uploaded-image -->
                                            <div class="flex justify-center items-center w-full h-full">
                                                <img data-upload-image src="https://i.ibb.co.com/Kx9QDc68/auth-bg-compressed.webp" alt="auth-bg-compressed" class="w-full h-full object-cover">
                                            </div>
                                            <!-- delete-button -->
                                            <div data-delete-button class="flex justify-center items-center absolute top-0 right-0 z-[3] w-6 h-6 group/button cursor-pointer bg-[#ff4405] hover:bg-[#ff692e]">
                                                <img src="https://i.ibb.co.com/j9XG8FWR/close-button.webp" alt="close button" class="w-5 h-5 [filter:brightness(100)_saturate(0)]"/>
                                            </div>
                                            <!-- media-type-container -->
                                            <div class="absolute bottom-0 left-0 flex justify-center items-center z-[3]">
                                                <!-- image-tag -->
                                                <div data-image-tag class="flex justify-center items-center gap-[0.1875rem] h-5 px-1 bg-[rgba(48,52,55,.7)] dark:bg-[rgba(31,44,63,0.50)]">
                                                    <span class="text-xs leading-normal tracking-[0.008rem] text-white dark:text-[#e8e6e3]">Image</span>
                                                    <img src="https://i.ibb.co.com/nN9TqnGb/image-03.webp" alt="image 03" class="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>

                                        <!-- uploaded-media -->
                                        <div data-uploaded-media draggable="true" class="flex justify-center items-center relative rounded-sm overflow-hidden w-full aspect-[1.9886] bg-white/50 cursor-pointer lg:h-[6.40625rem] lg:aspect-[unset] dark:bg-[#181a1b]/50">
                                            <!-- uploaded-image -->
                                            <div class="flex justify-center items-center w-full h-full">
                                                <video data-upload-video
                                                    class="w-full h-full object-cover"
                                                    src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                                                ></video>
                                            </div>
                                            <!-- delete-button -->
                                            <div data-delete-button class="flex justify-center items-center absolute top-0 right-0 z-[3] w-6 h-6 group/button cursor-pointer bg-[#ff4405] hover:bg-[#ff692e]">
                                                <img src="https://i.ibb.co.com/j9XG8FWR/close-button.webp" alt="close button" class="w-5 h-5 [filter:brightness(100)_saturate(0)]"/>
                                            </div>
                                            <!-- media-type-container -->
                                            <div class="absolute bottom-0 left-0 flex justify-center items-center z-[3]">
                                                <!-- video-tag -->
                                                <div data-video-tag class="flex justify-center items-center gap-[0.1875rem] px-1 h-5 bg-[rgba(48,52,55,.7)] dark:bg-[rgba(31,44,63,0.50)]">
                                                    <span class="text-xs text-white leading-normal tracking-[0.008rem] dark:text-[#e8e6e3]">Video</span>
                                                    <img src="https://i.ibb.co.com/wN978Hjm/video.webp" alt="video" class="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- button -->
                            <div class="hidden filter drop-shadow-[4px_3px_0px_#000000] group hover:drop-shadow-[4px_3px_0px_#FF439D]">
                                <button class="flex justify-center items-center gap-2.5 pl-2 pr-[20.5px] min-h-[2rem] [clip-path:polygon(calc(100%-12.5px)_0%,100%_100%,0%_100%,0%_0%)] bg-[linear-gradient(135deg,#F093FB_0%,#FF439D_100%)] group-hover:[background:black]">
                                    <span class="text-lg font-medium text-black group-hover:text-[#FF439D]">Unlock premium to upload videos</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- social-media-section -->
                <section class="flex flex-col gap-4 px-2 py-4 w-full shadow-[0px_4px_6px_-2px_#10182814] backdrop-blur-[25px] bg-white/40 md:gap-6 md:p-4 dark:bg-[#181a1b]/40 xl:gap-4">
                    <h2 class="text-2xl font-semibold text-[#667085] dark:text-[#9e9589]">Social Media</h2>

                    <!-- form-section -->
                    <div class="flex flex-col gap-4">
                        <!-- form-container -->
                        <div class="flex flex-col gap-4">
                            <!-- input-group -->
                            <div class="flex flex-col gap-4 lg:flex-row">
                                <!-- input-container -->
                                <div class="flex flex-col gap-1.5 w-full">
                                    <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Twitter</span>
                                    <!-- input-field -->
                                    <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                        <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3.5 rounded-t-sm [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-11">
                                            <input type="text" placeholder="" value="socialmedia.com/model/jennyplayhouse" class="w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                        </div>
                                        <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                    </div>
                                </div>

                                <!-- input-container -->
                                <div class="flex flex-col gap-1.5 w-full">
                                    <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Instagram</span>
                                    <!-- input-field -->
                                    <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                        <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3.5 rounded-t-sm [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-11">
                                            <input type="text" placeholder="" value="socialmedia.com/model/jennyplayhouse" class="w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                        </div>
                                        <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                    </div>
                                </div>
                            </div>

                            <!-- input-group -->
                            <div class="flex flex-col gap-4 lg:flex-row">
                                <!-- input-container -->
                                <div class="flex flex-col gap-1.5 w-full">
                                    <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Wishlist</span>
                                    <!-- input-field -->
                                    <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                        <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3.5 rounded-t-sm [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-11">
                                            <input type="text" placeholder="" value="socialmedia.com/model/jennyplayhouse" class="w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                        </div>
                                        <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                    </div>
                                </div>

                                <!-- input-container -->
                                <div class="flex flex-col gap-1.5 w-full">
                                    <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Additional URL 1</span>
                                    <!-- input-field -->
                                    <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                        <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3.5 rounded-t-sm [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-11">
                                            <input type="text" placeholder="" value="socialmedia.com/model/jennyplayhouse" class="w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                        </div>
                                        <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                    </div>
                                </div>
                            </div>

                            <!-- input-group -->
                            <div class="flex flex-col gap-4 lg:flex-row">
                                <!-- input-container -->
                                <div class="flex flex-col gap-1.5 w-full">
                                    <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Additional URL 2</span>
                                    <!-- input-field -->
                                    <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                        <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3.5 rounded-t-sm [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-11">
                                            <input type="text" placeholder="" value="socialmedia.com/model/jennyplayhouse" class="w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                        </div>
                                        <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                    </div>
                                </div>

                                <!-- input-container -->
                                <div class="flex flex-col gap-1.5 w-full">
                                    <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Additional URL 3</span>
                                    <!-- input-field -->
                                    <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                        <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3.5 rounded-t-sm [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-11">
                                            <input type="text" placeholder="" value="socialmedia.com/model/jennyplayhouse" class="w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                        </div>
                                        <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                    </div>
                                </div>
                            </div>

                            <!-- input-group -->
                            <div class="flex flex-col gap-4 lg:flex-row">
                                <!-- input-container -->
                                <div class="flex flex-col gap-1.5 w-full lg:w-[calc(50%-.5rem)]">
                                    <span class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Additional URL 4</span>
                                    <!-- input-field -->
                                    <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                        <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 px-3.5 rounded-t-sm [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)] h-11">
                                            <input type="text" placeholder="" value="socialmedia.com/model/jennyplayhouse" class="w-full max-w-full box-border text-base text-[#101828] dark:text-[#d6d3cd] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans">
                                        </div>
                                        <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- button -->
                        <div class="hidden filter w-max drop-shadow-[4px_3px_0px_#000000] group hover:drop-shadow-[4px_3px_0px_#FF439D]">
                            <button class="flex justify-center items-center gap-2.5 pl-2 pr-[20.5px] h-8 [clip-path:polygon(calc(100%-12.5px)_0%,100%_100%,0%_100%,0%_0%)] bg-[linear-gradient(135deg,#F093FB_0%,#FF439D_100%)] group-hover:[background:black]">
                                <span class="text-lg font-medium text-black group-hover:text-[#FF439D]">Unlock premium to add more links</span>
                            </button>
                        </div>
                    </div>
                </section>

                <!-- tipping-settings-section -->
                <section class="flex flex-col gap-4 px-2 py-4 w-full shadow-[0px_4px_6px_-2px_#10182814] backdrop-blur-[25px] bg-white/40 md:gap-6 md:p-4 dark:bg-[#181a1b]/40 xl:gap-4">
                    <h2 class="text-2xl font-semibold text-[#667085] dark:text-[#9e9589]">Tipping Settings</h2>

                    <!-- tip-message -->
                    <div class="flex flex-col gap-4">
                        <h3 class="text-sm font-bold text-[#667085] dark:text-[#9e9589]">Tip Message</h3>
                        
                        <ul class="flex flex-col pl-1 opacity-70">
                            <li class="text-sm text-[#344054] dark:text-[#bdb8af] relative pl-4 before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-[#344054] before:absolute before:left-[0.188rem] before:top-[0.438rem] md:text-base">Your fan will see this message when they tip you.</li>
                            <li class="text-sm text-[#344054] dark:text-[#bdb8af] relative pl-4 before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-[#344054] before:absolute before:left-[0.188rem] before:top-[0.438rem] md:text-base">Leave empty to show default message</li>
                        </ul>

                        <!-- textarea-container -->
                        <div class="flex flex-col gap-1.5 w-full">
                            <!-- textarea -->
                            <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] group/input-field">
                                <div class="flex items-center gap-2 border-b border-[#D0D5DD] md:group-[.invalid]/input-field:border-[#FF4405] bg-white/50 rounded-t-sm [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] dark:border-[#3b4043] dark:bg-[#181a1b]/50 dark:[box-shadow:0px_1px_2px_0px_rgba(24,36,61,0.05)]">
                                    <textarea name="" id="" placeholder="Thank you for your tip!" class="w-full h-full px-3.5 py-2.5 min-h-[5.5rem] text-base [field-sizing:content] text-[#101828] dark:text-[#d6d3cd] placeholder:text-base placeholder:text-[#667085] dark:placeholder:text-[#9e9589] placeholder:font-sans bg-transparent border-none outline-none"></textarea>
                                </div>
                                <span class="hidden md:group-[.invalid]/input-field:inline text-sm text-[#FF4405]">This item is required.</span>
                            </div>

                            <span class="text-sm text-[#475467] dark:text-[#b1aba0]">50/200 characters</span>
                        </div>
                    </div>

                    <!-- share-settings -->
                    <section class="flex flex-col gap-4">
                        <h3 class="text-sm font-bold text-[#667085] dark:text-[#9e9589]">Share Settings</h3>

                        <div data-settings-wrapper class="flex flex-col gap-4 min-[600px]:flex-row lg:gap-6">
                            <!-- settings-section -->
                            <div class="flex flex-col gap-4 min-[600px]:flex-1">
                                <!-- toggle-switch-wrapper -->
                                <div class="flex items-center gap-2">
                                    <!-- toggle-switch-container  -->
                                    <label class="relative inline-block w-9 h-[1.28125rem] cursor-pointer">
                                        <input data-post-to-x-toggle-switch type="checkbox" checked class="peer h-0 w-0 opacity-0" id="post-to-x" />
                                        <span class="absolute inset-0 cursor-pointer rounded-[0.75rem] bg-[#98a2b380] transition-all duration-100 ease-in-out peer-checked:bg-[#0c111d] dark:bg-[#434c5b80] dark:peer-checked:bg-[#0a0e17]"></span>
                                        <span class="absolute left-[0.125rem] top-1/2 h-4 w-4 -translate-y-1/2 transform rounded-full bg-white shadow-[0_1px_3px_0_rgba(16,24,40,0.1),0_1px_2px_0_rgba(16,24,40,0.06)] transition-all duration-100 ease-in-out peer-checked:translate-x-[1rem] dark:bg-[#181a1b]"></span>
                                    </label>

                                    <label for="post-to-x" class="cursor-pointer">
                                        <span class="text-base font-medium text-black dark:text-[#e8e6e3]">Post to X when you receive tips</span>
                                    </label>
                                </div>

                                <!-- form-section -->
                                <div data-post-to-x-form-section class="hidden flex flex-col gap-4">
                                    <!-- post-message-section -->
                                    <section class="flex flex-col gap-2">
                                        <h3 class="text-sm font-semibold text-[#667085] dark:text-[#9e9589]">Post Message (Leave blank to use system default message.)</h3>
                                        
                                        <!-- input-container -->
                                        <div class="flex flex-col gap-1.5">
                                            <!-- input-field -->
                                            <div class="w-full flex items-center gap-2 bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043]">
                                                <textarea placeholder="I got some lovely tips from @username..." class="px-3.5 py-2.5 text-base bg-transparent border-none outline-none w-full min-w-0 text-[#0C111D] placeholder:text-[#667085] dark:text-[#dbd8d3] dark:placeholder:text-[#9e9689]"></textarea>
                                            </div>

                                            <span class="text-sm text-[#475467] dark:text-[#b1aba0]">66/72 characters</span>
                                        </div>

                                        <div class="flex items-center gap-2">
                                            <div class="flex justify-center items-center w-6 h-6">
                                                <input data-show-username type="checkbox" name="save" id="show-username" class="appearance-none bg-[white] dark:bg-[#2d3748] border border-[#D0D5DD] dark:border-[#4a5568] rounded-[4px] w-4 min-w-4 h-4 checked:accent-[#07f468] checked:bg-[#07f468] dark:checked:bg-[#0aff78] checked:border-[#07f468] dark:checked:border-[#0aff78] checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:border-[black] dark:checked:after:border-[white] checked:after:border-b-[2px] checked:after:border-r-[2px] checked:after:rotate-45 checked:after:box-border cursor-pointer">
                                            </div>

                                            <div class="flex items-center gap-1">
                                                <label for="show-username" class="text-sm text-[#0C111D] dark:text-[#dbd8d3] cursor-pointer">Show fan’s username on your post</label>
                                            
                                                <div class="relative inline-flex overflow-hidden cursor-pointer group hover:overflow-visible">
                                                    <!-- Icon -->
                                                    <img src="https://i.ibb.co/DPgMH5GG/svgviewer-png-output-15.webp" alt="tooltip icon" class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(45%)_sepia(12%)_saturate(597%)_hue-rotate(183deg)_brightness(96%)_contrast(100%)]">

                                                    <!-- Tooltip -->
                                                    <div class="absolute z-[2] flex flex-col items-start text-center min-w-[18.75rem] md:w-max
                                                        opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto
                                                        text-xs leading-normal font-medium text-white py-2 px-3 rounded-lg
                                                        bg-[#101828] dark:bg-[rgba(14,19,32,1)] dark:text-[#e8e6e3] [box-shadow:0px_2px_4px_-2px_#1018280F,0px_4px_8px_-2px_#1018281A] [backdrop-filter:blur(25px)]
                                                        -right-2 bottom-full -translate-y-2 sm:bottom-[unset] sm:top-full sm:left-1/2 sm:-translate-x-1/2 sm:translate-y-2
                                                        before:content-[''] before:absolute before:w-0 before:h-0 before:right-2.5 before:bottom-[-5px] before:border-[6px] before:border-b-0 before:border-l-transparent before:border-r-transparent before:border-t-[rgba(16,24,40)]
                                                        sm:before:left-1/2 sm:before:top-[-5px] sm:before:-translate-x-1/2 sm:before:bottom-[unset] sm:before:border-[6px] sm:before:border-t-0 sm:before:border-b-[rgba(16,24,40)] sm:before:border-l-transparent sm:before:border-r-transparent"
                                                    >
                                                        <p class="text-xs leading-normal font-semibold text-white dark:text-[#e8e6e3]">Fan who tips anonymously will be recognized as '@anonymous'.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <!-- attach-media-section -->
                                    <section class="flex flex-col gap-2">
                                        <h3 class="text-sm font-semibold text-[#667085] dark:text-[#9e9589]">Attach Media</h3>

                                        <!-- round-checkbox-input-container -->
                                        <div class="flex flex-col gap-2">
                                            <!-- Choice -->
                                            <div class="flex items-center gap-2 relative">
                                                <input type="radio" id="upload-media" checked name="dash-radio-group" class="hidden peer" />

                                                <label
                                                    for="upload-media"
                                                    class="relative pl-8 cursor-pointer text-base font-medium
                                                    text-black dark:text-[#e8e6e3]
                                                    before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2
                                                    before:w-5 before:h-5 before:rounded-full before:border
                                                    before:border-[#d0d5dd] dark:before:border-[#3b4043]
                                                    before:bg-[#ffffff] dark:before:bg-[#181a1b]
                                                    peer-checked:before:bg-[#000000] dark:peer-checked:before:bg-[#000000]
                                                    after:content-[''] after:absolute after:left-[0.4375rem] after:top-1/2 after:-translate-y-1/2
                                                    after:w-[0.375rem] after:h-[0.375rem] after:rounded-full
                                                    after:bg-[#07f468] dark:after:bg-[#07f468]
                                                    after:hidden peer-checked:after:block"
                                                >
                                                    Upload media
                                                </label>
                                            </div>

                                            <!-- Choice -->
                                            <div class="flex items-center gap-2 relative">
                                                <input type="radio" id="no-media" name="dash-radio-group" class="hidden peer" />

                                                <label
                                                    for="no-media"
                                                    class="relative pl-8 cursor-pointer text-base font-medium
                                                    text-black dark:text-[#e8e6e3]
                                                    before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2
                                                    before:w-5 before:h-5 before:rounded-full before:border
                                                    before:border-[#d0d5dd] dark:before:border-[#3b4043]
                                                    before:bg-[#ffffff] dark:before:bg-[#181a1b]
                                                    peer-checked:before:bg-[#000000] dark:peer-checked:before:bg-[#000000]
                                                    after:content-[''] after:absolute after:left-[0.4375rem] after:top-1/2 after:-translate-y-1/2
                                                    after:w-[0.375rem] after:h-[0.375rem] after:rounded-full
                                                    after:bg-[#07f468] dark:after:bg-[#07f468]
                                                    after:hidden peer-checked:after:block"
                                                >
                                                    Do not attach media
                                                </label>
                                            </div>
                                        </div>

                                        <div data-upload-media-container class="hidden flex flex-col">
                                            <!-- upload-container -->
                                            <div data-media-upload="" class="hidden cursor-pointer border-2 border-transparent bg-[rgba(0,0,0,0.05)] rounded-xl px-6 py-4 relative h-[12.5rem] w-full flex flex-col items-center justify-center hover:border-[#0c111d] dark:bg-[#181a1b]/5 dark:hover:border-[#857c6d] hover:bg-[rgba(0,0,0,0.10)] dark:hover:bg-[rgba(0,0,0,0.05)] group/upload sm:h-[13.3125rem] md:h-[12.5rem] lg:h-[13.3125rem]">
                                                <div data-media-upload-input-wrap="" class="gap-3 w-full flex flex-col justify-center items-center self-stretch border-2 border-dashed border-transparent">
                                                    <div class="flex justify-center items-center w-10 h-10 rounded-lg shadow-[0px_1px_2px_0px_#1018280D] bg-[#07F468] group-hover/upload:bg-[#0C111D] dark:bg-[#06c454] dark:group-hover/upload:bg-[#162036]">
                                                        <img src="https://i.ibb.co.com/9JDWMW1/upload-03.webp" alt="upload 03" class="w-5 h-5 [filter:brightness(0)] group-hover/upload:[filter:brightness(0)_saturate(100%)_invert(65%)_sepia(22%)_saturate(4910%)_hue-rotate(97deg)_brightness(113%)_contrast(94%)]">
                                                    </div>
                                                    <div class="flex flex-col gap-1 text-center">
                                                        <p class="text-sm text-[#475467] dark:text-[#b1aba0]"><span class="text-sm font-semibold text-center text-[#0C111D] dark:text-[#dbd8d3]">Click to upload</span> or drag and drop image or video files here</p>
                                                        <p class="text-xs leading-normal text-[#475467] dark:text-[#b1aba0]">MP4, AVI, QUICKTIME, X-MATROSKA, X-MS-WMV, WEBM, OGG, PNG or JPG (max. 15MB)</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- uploaded-media-container -->
                                            <div data-uploaded-media-container class="flex justify-center items-center relative rounded-sm overflow-hidden w-full max-w-[23.6667rem] h-[11.0625rem] bg-white/50 min-[600px]:h-[13.3125rem] md:h-[11.0625rem] lg:h-[13.3125rem] dark:bg-[#181a1b]/50">
                                                <!-- uploaded-image -->
                                                <div class="flex justify-center items-center w-full h-full">
                                                    <img data-upload-image src="https://i.ibb.co.com/Kx9QDc68/auth-bg-compressed.webp" alt="auth-bg-compressed" class="w-full h-full object-cover">
                                                </div>
                                                <!-- delete-button -->
                                                <div class="flex justify-center items-center absolute top-0 right-0 z-[3] w-6 h-6 group/button cursor-pointer bg-[#ff4405] hover:bg-[#ff692e]">
                                                    <img src="https://i.ibb.co.com/YMvbDsR/trash-03.webp" alt="trash-03" class="w-5 h-5 [filter:brightness(100)_saturate(0)]"/>
                                                </div>
                                                <!-- fullscreen-button -->
                                                <div data-uploaded-media-fullscreen-button class="flex justify-center items-center absolute bottom-0 left-0 z-[3] w-8 h-8 group/button cursor-pointer bg-black hover:bg-[#07F468]">
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
                            <div data-post-to-x-post-preview class="hidden flex flex-col gap-2 w-full min-[600px]:w-[17.625rem] min-[600px]:shrink-0 lg:w-[22.5625rem]">
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

                                        <p class="text-xs leading-normal font-medium text-[#0C111D] dark:text-[#dbd8d3]">I got some lovely tips from fans...<span class="hidden" data-preview-tip-info>@manogoes4eva tipped 400 tokens</span></p>
                                    
                                        <div data-preview-media-container class="flex justify-center items-center rounded-[0.625rem] overflow-hidden bg-[#F2F6FC] w-full h-[10.9375rem] min-[600px]:h-[8.9375rem] lg:h-[11.9375rem] dark:bg-[#1d1f20]">
                                            <img src="https://i.ibb.co.com/Kx9QDc68/auth-bg-compressed.webp" alt="auth-bg-compressed" class="w-full h-full object-cover">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </section>
                </section>

                <!-- cancel-save-button -->
                <div data-save-cancel-buttons-container class="hidden flex justify-end items-center gap-6 px-2 md:px-6 lg:px-10 xl:justify-start xl:px-0">
                    <button data-cancel-button class="flex justify-center items-center">
                        <span class="text-lg font-medium text-[#0C111D] dark:text-[#dbd8d3]">CANCEL</span>
                    </button>

                    <button data-save-button class="flex justify-center items-center px-5 h-10 bg-black group/button hover:bg-[#07F468] dark:bg-[#181a1b] dark:hover:bg-[#23f97b]">
                        <span class="text-lg font-medium text-[#07F468] group-hover/button:text-black dark:text-[#23f97b] dark:group-hover/button:text-[#181a1b]">SAVE</span>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- light-gallery-container -->
    <div data-lightgallery-container class="hidden fixed inset-0 flex justify-center items-center backdrop-blur-[5px] z-[99999] bg-white/10 dark:bg-[#181a1b]/10">
        <!-- media-container (set width and height automatically using lightgallery respecting media's original ratio) -->
        <div data-lightgallery-media-wrapper class="flex justify-center items-center rounded-sm shadow-[0px_0px_24px_-2px_#10182880] relative max-h-screen max-w-[min(22.5rem,90vw)] sm:max-w-[min(46rem,90vw)] md:max-w-[min(39rem,90vw)] lg:max-w-[min(64rem,90vw)] bg-white/50 dark:bg-[#181a1b]/50">
            <div data-lightgallery-media-container class="flex justify-center items-center w-full h-full">
                <img src="https://i.ibb.co.com/Kx9QDc68/auth-bg-compressed.webp" alt="auth-bg-compressed" class="w-full h-full object-cover">
            </div>
            
            <!-- close-button -->
            <button data-lightgallery-close-button class="absolute top-2 right-2 rounded-full flex justify-center items-center w-6 h-6 backdrop-blur-[10px] bg-black/30 sm:w-12 sm:h-12 dark:bg-[#181a1b]/30">
                <img src="https://i.ibb.co.com/W4TXDR0j/x-close.webp" alt="x close" class="w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(100%)_sepia(0%)_saturate(1710%)_hue-rotate(335deg)_brightness(107%)_contrast(107%)] drop-shadow-[0px_0px_8px_0px_#00000080] sm:w-8 sm:h-8">
            </button>

            <!-- media-type-container -->
            <div class="absolute bottom-0 left-0 flex justify-center items-center z-[3]">
                <!-- image-tag -->
                <div data-image-tag class="flex justify-center items-center px-1 py-0.5 gap-[0.1875rem] bg-[rgba(48,52,55,.7)] dark:bg-[rgba(31,44,63,0.50)]">
                    <span class="text-xs text-white leading-normal tracking-[0.008rem] dark:text-[#e8e6e3]">Image</span>
                    <img src="https://i.ibb.co.com/nN9TqnGb/image-03.webp" alt="image 03" class="w-4 h-4" />
                </div>
                
                <!-- video-tag -->
                <div data-video-tag class="hidden flex justify-center items-center px-1 py-0.5 gap-[0.1875rem] bg-[rgba(48,52,55,.7)] dark:bg-[rgba(31,44,63,0.50)]">
                    <span class="text-xs text-white leading-normal tracking-[0.008rem] dark:text-[#e8e6e3]">Video</span>
                    <img src="https://i.ibb.co.com/wN978Hjm/video.webp" alt="video" class="w-4 h-4" />
                </div>
            </div>

            <!-- video-play-button -->
            <button data-video-play-button class="hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center w-14 h-14 rounded-full backdrop-blur-[3.945px] bg-white/10 md:w-[7.5rem] md:h-[7.5rem] dark:bg-[#181a1b]/10">
                <img src="https://i.ibb.co.com/Y7hmQnSb/play-icon-big.webp" alt="play icon big" class="w-8 h-8 opacity-70 md:w-14 md:h-14">
            </button>
        </div>
    </div>

<!-- handle dropdowns -->
<script>
document.addEventListener('DOMContentLoaded', function() {
  // HELPER FUNCTIONS (shared across all dropdowns)

  /**
   * Positions the dropdown options either below or above the trigger,
   * based on available space in the viewport.
   * @param {HTMLElement} select - The .dropdown-select container element
   */
  function positionDropdown(select) {
    const optionsContainer = select.querySelector('.dash-options-container');
    if (!optionsContainer) return;

    // Get position and dimensions of the select trigger
    const rect = select.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom; // pixels below the trigger
    const spaceAbove = rect.top; // pixels above the trigger
    const optionsHeight = optionsContainer.scrollHeight; // total height of options list

    // Remove any previous positioning classes
    optionsContainer.classList.remove('upward', 'downward');

    // Decide direction: if not enough space below but enough above, place upward
    if (spaceBelow < optionsHeight && spaceAbove > spaceBelow) {
      optionsContainer.classList.add('upward');
      optionsContainer.style.top = 'auto';
      optionsContainer.style.bottom = 'calc(100% + 0.5rem)'; // appear above with a small gap
    } else {
      optionsContainer.classList.add('downward');
      optionsContainer.style.top = 'calc(100% + 0.5rem)'; // appear below with a gap
      optionsContainer.style.bottom = 'auto';
    }
  }

  /**
   * Opens a dropdown: adds open class, rotates arrow, and applies visible state classes.
   * @param {HTMLElement} select - The .dropdown-select container element
   */
  function openDropdown(select) {
    const optionsContainer = select.querySelector('.dash-options-container');
    const arrow = select.querySelector('.select-arrow');
    if (!optionsContainer || !arrow) return;

    // Mark as open (used for state checks)
    optionsContainer.classList.add('open');
    arrow.classList.add('rotate-180'); // rotate arrow icon

    // Transition from hidden to visible (removing hidden classes, adding visible ones)
    optionsContainer.classList.remove('scale-95', 'opacity-0', 'pointer-events-none', 'h-0', 'overflow-hidden');
    optionsContainer.classList.add('scale-100', 'opacity-100', 'pointer-events-auto', 'h-auto', 'overflow-auto');
  }

  /**
   * Closes a dropdown: removes open class, resets arrow, and applies hidden state classes.
   * @param {HTMLElement} select - The .dropdown-select container element
   */
  function closeDropdown(select) {
    const optionsContainer = select?.querySelector('.dash-options-container');
    const arrow = select?.querySelector('.select-arrow');
    if (!optionsContainer || !arrow) return;

    optionsContainer.classList.remove('open');
    arrow.classList.remove('rotate-180');

    // Hide with smooth transition (scale down, fade out, no pointer events, collapsed height)
    optionsContainer.classList.remove('scale-100', 'opacity-100', 'pointer-events-auto', 'h-auto', 'overflow-auto');
    optionsContainer.classList.add('scale-95', 'opacity-0', 'pointer-events-none', 'h-0', 'overflow-hidden');
  }

  // ==================== INITIALIZE EACH DROPDOWN ====================
  document.querySelectorAll('.dropdown-select').forEach(trendsSelect => {
    // Find related elements within this dropdown
    const selectDropdown = trendsSelect.closest('.select-dropdown');
    const trigger = trendsSelect.querySelector('.dash-select__trigger span');
    const arrow = trendsSelect.querySelector('.select-arrow');
    const options = trendsSelect.querySelectorAll('.option');
    const realSelect = selectDropdown.querySelector('.dash-real-select');
    const optionsContainer = trendsSelect.querySelector('.dash-options-container');

    // --- Initialize selected class based on current trigger text ---
    if (trigger) {
        const currentValue = realSelect?.value;

        options.forEach(opt => {
            if (opt.dataset.value === currentValue) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
    }

    // Click on the dropdown trigger toggles open/close
    trendsSelect.addEventListener('click', function(e) {
      e.stopPropagation();

      const isOpening = !optionsContainer.classList.contains('open');

      // Close any other dropdown
      document.querySelectorAll('.dropdown-select').forEach(s => {
        if (s !== trendsSelect) {
          closeDropdown(s);
        }
      });

      if (isOpening) {
        // Position and open this dropdown
        positionDropdown(trendsSelect);
        openDropdown(trendsSelect);
      } else {
        // Close it if already open
        closeDropdown(trendsSelect);
      }
    });

    // Click on an option updates the displayed value and the hidden select
    options.forEach(option => {
      option.addEventListener('click', function(e) {
        e.stopPropagation();

        // Get the text of the clicked option
        const selectedText = this.querySelector('span').textContent.trim();
        const selectedValue = this.dataset.value;

        if (trigger) trigger.textContent = selectedText;
        if (realSelect) realSelect.value = selectedValue;

        // --- Update selected class: remove from all, add to this ---
        options.forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');

        // Close the dropdown after selection
        closeDropdown(trendsSelect);

        // Trigger a 'change' event on the hidden select
        if (realSelect) realSelect.dispatchEvent(new Event('change'));
      });
    });
  });

  // ==================== GLOBAL EVENT HANDLERS ====================

  // Close all dropdowns when clicking anywhere outside them
  document.addEventListener('click', function() {
    document.querySelectorAll('.dropdown-select').forEach(select => {
      closeDropdown(select);
    });
  });

  // Reposition any open dropdown when the window is resized
  window.addEventListener('resize', function() {
    document.querySelectorAll('.dropdown-select').forEach(select => {
      const optionsContainer = select.querySelector('.dash-options-container');
      // Only reposition if this dropdown is currently open
      if (optionsContainer && optionsContainer.classList.contains('open')) {
        positionDropdown(select);
      }
    });
  });
});
</script>

<!-- handle cancel/save button visibility based on input value change -->
<script>
/**
 * Changed state handling for edit profile form.
 * Supports: text inputs, textareas, dropdowns, checkboxes, radios, toggle switches.
 * Shows cancel/save buttons and hides right nav icons when any field changes.
 * Cancel restores all fields to their initial states; save captures new baseline.
 */
document.addEventListener('DOMContentLoaded', function() {
  // Update custom dropdowns trigger when hidden select changes
  document.querySelectorAll('.dash-real-select').forEach(realSelect => {
    realSelect.addEventListener('change', function(e) {
      const select = this;
      const dropdown = select.closest('.select-dropdown');
      if (!dropdown) return;

        // Update trigger span text (in case it's not already updated by the dropdown)
        const triggerSpan = dropdown.querySelector('.dash-select__trigger span');
        const selectedOption = select.options[select.selectedIndex];
        if (triggerSpan && selectedOption) {
            triggerSpan.textContent = selectedOption.textContent;
        }
    });
  });

  // Changed state initialization
  const container = document.querySelector('[data-container]');
  if (!container) return;

  const rightNavIcons = document.querySelector('[right-nav-icons]');
  const saveCancelContainers = document.querySelectorAll('[data-save-cancel-buttons-container]');
  const cancelButtons = document.querySelectorAll('[data-cancel-button]');
  const saveButtons = document.querySelectorAll('[data-save-button]');

  // All input, select, and textarea fields inside the container
  const formFields = container.querySelectorAll('input, select, textarea');

  // Store initial states (for checkboxes/radios we store checked; for others we store value)
  let initialStates = new Map();

  function captureInitialStates() {
    initialStates.clear();
    formFields.forEach(field => {
      if (field.type === 'checkbox' || field.type === 'radio') {
        initialStates.set(field, field.checked);
      } else {
        initialStates.set(field, field.value);
      }
    });
  }

  function isUpdated() {
    for (let [field, initialState] of initialStates.entries()) {
      if (field.type === 'checkbox' || field.type === 'radio') {
        if (field.checked !== initialState) return true;
      } else {
        if (field.value !== initialState) return true;
      }
    }
    return false;
  }

  function updateVisibility() {
    if (isUpdated()) {
      if (rightNavIcons) rightNavIcons.classList.add('hidden');
      saveCancelContainers.forEach(el => el.classList.remove('hidden'));
    } else {
      if (rightNavIcons) rightNavIcons.classList.remove('hidden');
      saveCancelContainers.forEach(el => el.classList.add('hidden'));
    }
  }

  function handleChange() {
    updateVisibility();
  }

  // Attach listeners to all fields (input events for live updates, change for final selection)
  formFields.forEach(field => {
    field.addEventListener('input', handleChange);
    field.addEventListener('change', handleChange);
  });

  // Cancel button: revert all fields to initial states
  cancelButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      for (let [field, initialState] of initialStates.entries()) {
        if (field.type === 'checkbox' || field.type === 'radio') {
          if (field.checked !== initialState) {
            field.checked = initialState;
            // Dispatch change event so custom dropdowns and other listeners update
            field.dispatchEvent(new Event('change', { bubbles: true }));
          }
        } else {
          if (field.value !== initialState) {
            field.value = initialState;
            field.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      }
      updateVisibility();
    });
  });

  // Save button: accept current states as new baseline
  saveButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      captureInitialStates();
      updateVisibility();
    });
  });

  // Initialize
  captureInitialStates();
  updateVisibility();
});
</script>

<!-- handle Ppost to X Toggle, Username Checkbox & Media Upload Controller -->
<script>
  /**
   *    When main toggle (Post to X) is ON → Show form section, post preview section.
   *    When "Show fan’s username" checkbox is checked (and main toggle ON) → Show the user info span inside preview.
   *    When "Upload media" radio is selected → Show the upload container AND the preview media container.
   *    When "Do not attach media" is selected → Hide the upload container AND the preview media container.
   */

  document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.querySelector('[data-post-to-x-toggle-switch]');
    const formSection = document.querySelector('[data-post-to-x-form-section]');
    const previewSection = document.querySelector('[data-post-to-x-post-preview]');
    const tipSpan = document.querySelector('[data-preview-tip-info]');

    const showUsernameCheckbox = document.getElementById('show-username');

    const uploadRadio = document.getElementById('upload-media');
    const noMediaRadio = document.getElementById('no-media');
    const uploadContainer = document.querySelector('[data-upload-media-container]');
    const previewMediaContainer = document.querySelector('[data-preview-media-container]');

    // Update tip span visibility based on checkbox
    function updateTipSpan() {
      if (!tipSpan || !showUsernameCheckbox) return;
      // Show span only if checkbox is checked, otherwise hide
      tipSpan.classList.toggle('hidden', !showUsernameCheckbox.checked);
    }

    // Update visibility of main sections
    function updateMainToggle(show) {
      // Show/hide the entire form and preview sections
      formSection.classList.toggle('hidden', !show);
      previewSection.classList.toggle('hidden', !show);

      if (show) {
        updateTipSpan();
      }
    }

    // Update upload container AND preview media container based on radio selection
    function updateUploadAndPreviewMedia() {
      // Determine if "Upload media" is selected
      const showMedia = uploadRadio && uploadRadio.checked;

      // Toggle upload container
      if (uploadContainer) {
        uploadContainer.classList.toggle('hidden', !showMedia);
      }

      // Toggle preview media container
      if (previewMediaContainer) {
        previewMediaContainer.classList.toggle('hidden', !showMedia);
      }
    }

    // Initial state setup (runs once when page loads)
    if (toggle && formSection && previewSection) {
      updateMainToggle(toggle.checked);
    }
    updateUploadAndPreviewMedia();

    // Event listeners for user interactions
    if (toggle) {
      toggle.addEventListener('change', function(e) {
        updateMainToggle(e.target.checked);
      });
    }

    if (showUsernameCheckbox) {
      showUsernameCheckbox.addEventListener('change', function() {
        // Only update the tip span if the preview is currently visible (main toggle ON)
        if (previewSection && !previewSection.classList.contains('hidden')) {
          updateTipSpan();
        }
      });
    }

    if (uploadRadio) {
      uploadRadio.addEventListener('change', updateUploadAndPreviewMedia);
    }
    if (noMediaRadio) {
      noMediaRadio.addEventListener('change', updateUploadAndPreviewMedia);
    }
  });
</script>

<!-- ==================== LIGHTBOX SCRIPT ==================== -->
<script>
  /**
   * Lightbox Gallery – Fullscreen overlay for images/videos.
   * Triggered by:
   *   - [data-uploaded-media-fullscreen-button] inside a container
   *   - Click on any [data-uploaded-media] container
   * Features:
   *   - Detects media type (image/video) and toggles UI accordingly
   *   - Locks background scroll while open
   *   - Closes via close button, backdrop click, or Escape key
   */
  (function() {
    // ---------- DOM references ----------
    const lightbox = document.querySelector('[data-lightgallery-container]');
    const mediaContainer = document.querySelector('[data-lightgallery-media-container]');
    const imageTag = lightbox.querySelector('[data-image-tag]');
    const videoTag = lightbox.querySelector('[data-video-tag]');
    const videoPlayButton = document.querySelector('[data-video-play-button]');
    const closeButton = document.querySelector('[data-lightgallery-close-button]');

    // Initially hide video‑specific UI (will be shown only when video is loaded)
    if (videoTag) videoTag.classList.add('hidden');
    if (videoPlayButton) videoPlayButton.classList.add('hidden');

    // States
    let currentVideo = null;      // Reference to the currently playing video element
    let scrollY = 0;              // Store scroll position before locking

    // Scroll locking (prevents background scrolling on mobile)
    function disableScroll() {
      scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.classList.add('overflow-hidden');
    }

    function enableScroll() {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.classList.remove('overflow-hidden');
      window.scrollTo(0, scrollY);
    }

    // Close lightbox
    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.add('hidden');
      enableScroll();
      if (currentVideo) {
        currentVideo.pause();
        currentVideo = null;
      }
    }

    // Event listeners for close button and video play button
    if (closeButton) {
      closeButton.addEventListener('click', closeLightbox);
    }

    if (videoPlayButton) {
      videoPlayButton.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent closing lightbox when clicking the button
        if (!currentVideo) return;
        currentVideo.paused ? currentVideo.play() : currentVideo.pause();
      });
    }

    // Open lightbox with a given media element (image or video)
    function openLightboxWithMedia(mediaEl) {
      if (!mediaEl) return;
      const src = mediaEl.src || mediaEl.currentSrc;
      const isVideo = mediaEl.tagName.toLowerCase() === 'video';

      // Clear previous content from the lightbox container
      mediaContainer.innerHTML = '';

      if (isVideo) {
        // Create video element and append to container
        const video = document.createElement('video');
        video.src = src;
        video.className = 'w-full h-full object-cover';
        video.loop = false;
        video.controls = false;      // Use custom play button
        video.playsInline = true;    // Mobile friendly
        mediaContainer.appendChild(video);
        currentVideo = video;

        // Show video‑specific UI, hide image UI
        if (imageTag) imageTag.classList.add('hidden');
        if (videoTag) videoTag.classList.remove('hidden');
        if (videoPlayButton) videoPlayButton.classList.remove('hidden');

        // --- Auto‑hide play button while video is playing ---
        function updatePlayButtonVisibility() {
          if (video.paused) {
            videoPlayButton.classList.remove('hidden');
          } else {
            videoPlayButton.classList.add('hidden');
          }
        }

        // Listen to play/pause events to toggle the button
        video.addEventListener('play', updatePlayButtonVisibility);
        video.addEventListener('pause', updatePlayButtonVisibility);
        video.addEventListener('ended', updatePlayButtonVisibility); // also show button when ended
        // Initial state: video is paused, button should be visible
        updatePlayButtonVisibility();
      } else {
        // Create image element and append
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'lightbox media';
        img.className = 'w-full h-full object-cover';
        mediaContainer.appendChild(img);
        currentVideo = null;

        // Show image UI, hide video controls
        if (imageTag) imageTag.classList.remove('hidden');
        if (videoTag) videoTag.classList.add('hidden');
        if (videoPlayButton) videoPlayButton.classList.add('hidden');
      }

      // Show the lightbox overlay and lock scrolling
      lightbox.classList.remove('hidden');
      disableScroll();
    }

    // Trigger 1: Fullscreen button inside a media container
    // Searches for [data-uploaded-media-fullscreen-button] and opens the media
    // found inside its closest [data-uploaded-media-container].
    document.querySelectorAll('[data-uploaded-media-fullscreen-button]').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent accidental bubbling
        const uploadedContainer = this.closest('[data-uploaded-media-container]');
        if (!uploadedContainer) return;
        const mediaEl = uploadedContainer.querySelector('img[data-upload-image], video[data-upload-video]');
        openLightboxWithMedia(mediaEl);
      });
    });

    // Trigger 2: Click on the entire media tile (grid item)
    // This allows opening the lightbox by clicking anywhere on the media element,
    // except when clicking on the delete button (which has [data-delete-button]).
    document.querySelectorAll('[data-uploaded-media]').forEach(container => {
      container.addEventListener('click', function(e) {
        // Ignore clicks that started on a delete button or its children
        if (e.target.closest('[data-delete-button]')) return;

        const mediaEl = this.querySelector('img[data-upload-image], video[data-upload-video]');
        openLightboxWithMedia(mediaEl);
      });
    });

    // Close on backdrop click (click on the overlay itself)
    if (lightbox) {
      lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) closeLightbox();
      });
    }

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeLightbox();
    });
  })();
</script>

<!-- ==================== DRAG & DROP REORDERING SCRIPT ==================== -->
<script>
  /**
   * Drag and drop reordering for media tiles inside a grid container.
   * Allows users to rearrange items by dragging and dropping.
   * Target container: [data-uploaded-grid-container] containing [data-uploaded-media] children.
   */
  const grid = document.querySelector('[data-uploaded-grid-container]');

  let dragSrc = null; // Holds the element being dragged

  // Drag event handlers
  function handleDragStart(e) {
    dragSrc = this;
    e.dataTransfer.effectAllowed = 'move';
    this.classList.add('dragging');
  }

  function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('[data-uploaded-media]').forEach(i => i.classList.remove('drag-over'));
  }

  function handleDragOver(e) {
    e.preventDefault();
    if (dragSrc !== this) this.classList.add('drag-over');
  }

  function handleDragLeave(e) {
    this.classList.remove('drag-over');
  }

  function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');

    // Only swap if contains a valid source and the target is different
    if (dragSrc && dragSrc !== this) {
      const parent = this.parentNode;
      const children = Array.from(parent.children);
      const srcIndex = children.indexOf(dragSrc);
      const targetIndex = children.indexOf(this);

      // Swap DOM positions: insert source before or after target depending on index
      if (srcIndex < targetIndex) {
        parent.insertBefore(dragSrc, this.nextSibling);
      } else {
        parent.insertBefore(dragSrc, this);
      }
    }
  }

  // Attach drag & drop event listeners to all media tiles
  document.querySelectorAll('[data-uploaded-media]').forEach(item => {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('dragleave', handleDragLeave);
    item.addEventListener('drop', handleDrop);
  });
</script>
</body>
</html>
</template>