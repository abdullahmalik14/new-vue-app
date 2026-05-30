<template>
    <!-- popup-container -->
    <div class="flex flex-col h-full relative md:pt-4">
        <!-- back-button -->
        <button @click="goBack" class="max-md:hidden flex justify-center items-center gap-1 w-max px-4">
            <img src="https://i.ibb.co.com/tPzh072N/chevron-left.webp" alt="chevron left" class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(46%)_sepia(8%)_saturate(955%)_hue-rotate(183deg)_brightness(91%)_contrast(88%)]">
            <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">Back</span>
        </button>

        <!-- header -->
        <div class="flex justify-between items-center gap-2.5 px-4 py-2 md:py-4">
            <div class="flex items-center gap-1 md:gap-2">
                <img src="https://i.ibb.co.com/SDXwDYLH/auto-cycle.webp" alt="auto cycle" class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(24%)_sepia(17%)_saturate(891%)_hue-rotate(179deg)_brightness(92%)_contrast(92%)] md:w-6 md:h-6">
                <h2 class="text-sm font-semibold text-[#344054] dark:text-[#bdb8af]">Auto Withdraw Setting</h2>
            </div>

            <button @click="emit('close')" class="flex justify-center items-center w-6 h-6 md:hidden">
                <img src="https://i.ibb.co.com/DPv34WzS/close.webp" alt="close" class="w-full h-full [filter:brightness(0)_saturate(100%)_invert(73%)_sepia(11%)_saturate(425%)_hue-rotate(179deg)_brightness(87%)_contrast(89%)]">
            </button>
        </div>

        <!-- content -->
        <div class="flex flex-col gap-6 px-2 pt-4 pb-12 md:px-4 xl:px-6 xl:pt-2">
            <p class="text-sm text-[#344054] dark:text-[#bdb8af]">Setup auto withdraw earnings to your selected payout method by month or by earning amounts.</p>
        
            <!-- dropdown-section -->
            <div data-dropdown-section class="flex flex-col gap-2 group/dropdown-section every-month">
                <label for="payout-method" class="text-base font-medium text-[#0C111D] dark:text-[#dbd8d3]">Auto withdraw earnings to my selected payout method :</label>
                
                <!-- select-dropdown -->
                <div class="select-dropdown relative flex w-full lg:max-w-[20rem]">
                    <div class="dropdown-select w-full cursor-pointer border-none">
                        <div class="dash-select__trigger w-full h-10 flex items-center gap-2 py-2 px-3 rounded-t-sm border-b-[1.5px] border-[#0C111D] bg-white/50 shadow-[0_1px_2px_0_#1018280D] dark:bg-[#181a1b]/50 dark:border-[#857c6d]">
                            <span class="text-base flex-grow text-[#101828] capitalize text-balance dark:text-[#d6d3cd]">
                            Every Month
                            </span>
                            <img class="select-arrow h-4 w-4 transition-transform duration-200"
                            src="https://i.ibb.co.com/XrQjftBq/down.webp" alt="down" />
                        </div>
                        <div class="dash-options-container max-md:!fixed max-md:!inset-0 max-md:!flex max-md:!items-end max-md:bg-white/60 max-md:bg-[#181a1b]/60 max-md:backdrop-blur-[2.5px] absolute left-auto right-0 top-[calc(100%+0.5rem)] z-[9999] w-full origin-top scale-95 opacity-0 transition-[opacity,transform] duration-200 ease-out [transform-origin:50%_0] h-0 overflow-hidden pointer-events-none">
                            <div class="flex flex-col gap-1 max-md:w-full max-md:!shadow-[0px_0px_12px_0px_#00000033] backdrop-blur-[50px] shadow-[0px_3px_6px_0px_#00000033] bg-white/90 dark:bg-[#181a1b]/90">
                                <div data-value="every-month" class="option flex items-center justify-center gap-[0.625rem] border-b border-[#EAECF0] group [&.selected]:bg-[#F9FAFB] hover:bg-[#F9FAFB] dark:border-[#353a3c] dark:hover:bg-[#1b1d1e] dark:[&.selected]:bg-[#1b1d1e]">
                                    <div class="option-inner-container flex flex-col flex-1 gap-1 px-2 py-3 md:p-4">
                                        <span class="text-base font-medium text-[#0C111D] capitalize text-balance dark:text-[#dbd8d3]">Every Month</span>

                                        <p class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">Withdraw money to selected payout method every month automatically.</p>
                                    </div>
                                </div>
                                <div data-value="by-earning-target" class="option flex items-center justify-center gap-[0.625rem] border-b border-[#EAECF0] group [&.selected]:bg-[#F9FAFB] hover:bg-[#F9FAFB] dark:border-[#353a3c] dark:hover:bg-[#1b1d1e] dark:[&.selected]:bg-[#1b1d1e]">
                                    <div class="option-inner-container flex flex-col flex-1 gap-1 px-2 py-3 md:p-4">
                                        <span class="text-base font-medium text-[#0C111D] capitalize text-balance dark:text-[#dbd8d3]">By earning target</span>

                                        <p class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">Withdraw money to selected payout method when your earning hits a specific amount.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <select class="dash-real-select hidden" name="dropdown-select" required>
                        <option value="every-month">
                            Every Month
                        </option>
                        <option value="by-earning-target">
                            By earning target
                        </option>
                    </select>
                </div>

                <p class="group-[.every-month]/dropdown-section:inline group-[.by-earning-target]/dropdown-section:hidden text-xs leading-normal text-[#344054] md:text-sm dark:text-[#bdb8af]">Automatic payout requests are processed on the 1st of each month, including earnings from the past 28 days. Fund arrival depends on the payout method you choose.</p>
            </div>

            <!-- earning-target-section -->
            <div data-earning-target-section class="flex flex-col gap-6 group/earning-target-section every-month">
                <!-- every-month-content -->
                <div class="flex flex-col gap-2 group-[.every-month]/earning-target-section:flex group-[.by-earning-target]/earning-target-section:hidden">
                <!-- title-section -->
                <div class="flex justify-between items-center gap-2">
                    <h3 class="text-base font-medium text-[#0C111D] dark:text-[#dbd8d3]">Earning targets</h3>

                    <span class="text-xs leading-normal italic text-[#667085] md:text-base dark:text-[#9e9589]">Optional</span>
                </div>

                <p class="text-xs leading-normal text-[#344054] md:text-sm dark:text-[#bdb8af]">We will not withdraw your money if your monthly earning does not reach your specified amount below.</p>
                
                <!-- input-field -->
                <div class="flex items-center gap-2 px-3 py-2 shadow-[0px_1px_2px_0px_#1018280D] rounded-t-sm border-b border-[#D0D5DD] bg-white/50 lg:max-w-[20rem] dark:bg-[#181a1b]/50 dark:border-[#3b4043]">
                    <div class="flex items-center gap-3 w-full">
                        <span class="text-base text-[#344054] dark:text-[#bdb8af]">USD$</span>
                        <input type="number" placeholder="Enter Amount" value="" class="text-base placeholder:text-[#667085] text-[#101828] bg-transparent focus:outline-none flex-grow dark:placeholder:text-[#9e9589] dark:text-[#d6d3cd]">
                    </div>
                </div>
                </div>

                <!-- by-earning-target-content -->
                <div class="flex flex-col gap-2 group-[.every-month]/earning-target-section:hidden group-[.by-earning-target]/earning-target-section:flex">
                <!-- title-section -->
                <div class="flex justify-between items-center gap-2">
                    <h3 class="text-base font-medium text-[#0C111D] dark:text-[#dbd8d3]">Earning targets</h3>
                </div>

                <p class="text-xs leading-normal text-[#344054] md:text-sm dark:text-[#bdb8af]">Your earnings will be paid out to your selected method every time your accumulated earnings reach the specified amount.</p>
                
                <!-- input-field -->
                <div class="flex items-center gap-2 px-3 py-2 shadow-[0px_1px_2px_0px_#1018280D] rounded-t-sm border-b border-[#D0D5DD] bg-white/50 lg:max-w-[20rem] dark:bg-[#181a1b]/50 dark:border-[#3b4043]">
                    <div class="flex items-center gap-3 w-full">
                        <span class="text-base text-[#344054] dark:text-[#bdb8af]">USD$</span>
                        <input type="number" placeholder="Enter Amount" value="100.00" class="text-base placeholder:text-[#667085] text-[#101828] bg-transparent focus:outline-none flex-grow dark:placeholder:text-[#9e9589] dark:text-[#d6d3cd]">
                    </div>
                </div>
                </div>
            </div>

            <!-- payout-method-section -->
            <div class="flex flex-col gap-4">
                <h3 class="text-base font-medium text-[#0C111D] dark:text-[#dbd8d3]">Payout Method</h3>

                <!-- payout-method-dropdown -->
                <div data-payout-method-dropdown class="payout-method-dropdown relative flex w-full">
                    <div class="payout-method-dropdown-select w-full cursor-pointer border-none">
                        <div data-payout-select-trigger-default class="flex items-center gap-2 p-3 rounded-t-sm border-b-[1.5px] border-[#0C111D] bg-white/50 md:h-[5.5rem] dark:bg-[#181a1b]/50 dark:border-[#857c6d]">
                        <div class="flex items-center gap-2 flex-1">
                            <img src="https://i.ibb.co.com/Q7mxt12p/plus-square.webp" alt="plus square" class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(5%)_sepia(8%)_saturate(4414%)_hue-rotate(184deg)_brightness(90%)_contrast(96%)]">
                            <span class="text-lg font-semibold text-[#101828] dark:text-[#d6d3cd]">Add New...</span>
                        </div>

                        <img class="select-arrow h-4 w-4 transition-transform duration-200 [filter:brightness(0)_saturate(100%)_invert(64%)_sepia(15%)_saturate(311%)_hue-rotate(179deg)_brightness(99%)_contrast(85%)]" src="https://i.ibb.co.com/XrQjftBq/down.webp" alt="down" />
                        </div>

                        <div data-payout-select-trigger-option class="hidden flex items-center gap-2 p-3 rounded-t-sm border-b-[1.5px] border-[#D0D5DD] backdrop-blur-[5px] bg-white/50 md:h-[5.5rem] dark:bg-[#181a1b]/50 dark:border-[#3b4043]">
                        <div class="flex flex-col gap-2 flex-1 min-w-0">
                            <!-- option__top -->
                            <div class="flex justify-between items-center gap-2">
                            <span data-payout-trigger-title class="text-lg font-medium truncate text-[#182230] group-[.option-selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.option-selected]/option:text-[#e6e4e1]">Bank Deposit</span>
                            <div class="flex items-center gap-1 flex-wrap shrink-0 px-2 py-1 shadow-[0px_0px_4px_0px_#00000026] rounded-[3.125rem] bg-white dark:bg-[#181a1b]">
                                <div class="w-4 h-4">
                                <img src="https://i.ibb.co.com/21zPFPz7/globe.webp" alt="globe" class="w-full h-full [filter:_brightness(0)_saturate(100%)]"/>
                                </div>

                                <span class="text-sm leading-4 font-medium text-[#182230] dark:text-[#d1cdc7]">USA - <span data-payout-trigger-bank> Bank</span></span>
                            </div>
                            </div>

                            <!-- option__bottom -->
                            <div data-payout-trigger-bottom class="flex justify-between items-center gap-2">
                            <span data-payout-trigger-pays-text class="text-sm text-[#182230] group-[.option-selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.option-selected]/option:text-[#e6e4e1]">Pays in <span data-payout-trigger-currency class="text-sm font-medium text-[#182230] group-[.option-selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.option-selected]/option:text-[#e6e4e1]">USD</span></span>
                            <span data-payout-trigger-fee class="text-sm text-[#182230] group-[.option-selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.option-selected]/option:text-[#e6e4e1]">USD$3.45 fee</span>
                            </div>
                        </div>

                        <img class="select-arrow h-4 w-4 shrink-0 transition-transform duration-200 [filter:brightness(0)_saturate(100%)_invert(64%)_sepia(15%)_saturate(311%)_hue-rotate(179deg)_brightness(99%)_contrast(85%)]" src="https://i.ibb.co.com/XrQjftBq/down.webp" alt="down" />
                        </div>

                        <div data-payout-select-options class="max-md:!fixed max-md:!inset-0 max-md:!flex max-md:!items-end absolute left-auto right-0 top-[calc(100%+0.5rem)] z-[9999] w-full origin-top scale-95 opacity-0 transition-[opacity,transform] duration-200 ease-out [transform-origin:50%_0] h-0 overflow-hidden pointer-events-none">
                            <div class="flex flex-col max-md:w-full max-md:!shadow-[0px_0px_12px_0px_#00000033] shadow-[0px_3px_6px_0px_#00000033] bg-white/90 dark:bg-[#181a1b]/90">
                                <!-- option -->
                                <div data-payout-option class="flex flex-col gap-2 flex-1 px-2 py-3 border-b-[1.5px] border-[#D0D5DD] backdrop-blur-[5px] bg-white/50 group/option md:p-4 dark:border-[#3b4043] dark:bg-[#181a1b]/50 [&.selected]:bg-black/90 [&.selected]:border-white cursor-pointer dark:[&.selected]:bg-[#181a1b]/90 dark:[&.selected]:border-[#303436]">
                                <!-- option__top -->
                                <div class="flex justify-between items-center gap-2">
                                    <span data-payout-option-title class="text-lg font-medium truncate text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">Bank Deposit</span>
                                    <div class="flex items-center gap-1 flex-wrap shrink-0 px-2 py-1 shadow-[0px_0px_4px_0px_#00000026] rounded-[3.125rem] bg-white dark:bg-[#181a1b]">
                                        <div class="w-4 h-4">
                                        <img src="https://i.ibb.co.com/hJStBf17/bank.webp" alt="bank" class="w-full h-full [filter:_brightness(0)_saturate(100%)]"/>
                                        </div>

                                        <span data-payout-option-bank class="text-sm leading-4 font-medium text-[#182230] dark:text-[#d1cdc7]">Bank</span>
                                    </div>
                                </div>

                                <!-- option__bottom -->
                                <div data-payout-option-bottom class="flex justify-between items-center gap-2">
                                    <span data-payout-option-pays-text class="truncate text-sm text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">Pays in <span data-payout-option-currency class="text-sm font-medium text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">EUR</span></span>
                                    <span data-payout-option-fee class="text-sm text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">USD$3.45 fee</span>
                                </div>
                                </div>

                                <!-- option -->
                                <div data-payout-option class="flex flex-col gap-2 flex-1 px-2 py-3 border-b-[1.5px] border-[#D0D5DD] backdrop-blur-[5px] bg-white/50 group/option md:p-4 dark:border-[#3b4043] dark:bg-[#181a1b]/50 [&.selected]:bg-black/90 [&.selected]:border-white cursor-pointer dark:[&.selected]:bg-[#181a1b]/90 dark:[&.selected]:border-[#303436]">
                                <!-- option__top -->
                                <div class="flex justify-between items-center gap-2">
                                    <span data-payout-option-title class="text-lg font-medium truncate text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">Bank Deposit</span>
                                    <div class="flex items-center gap-1 flex-wrap shrink-0 px-2 py-1 shadow-[0px_0px_4px_0px_#00000026] rounded-[3.125rem] bg-white dark:bg-[#181a1b]">
                                        <div class="w-4 h-4">
                                        <img src="https://i.ibb.co.com/hJStBf17/bank.webp" alt="bank" class="w-full h-full [filter:_brightness(0)_saturate(100%)]"/>
                                        </div>

                                        <span data-payout-option-bank class="text-sm leading-4 font-medium text-[#182230] dark:text-[#d1cdc7]">Bank</span>
                                    </div>
                                </div>

                                <!-- option__bottom -->
                                <div data-payout-option-bottom class="flex justify-between items-center gap-2">
                                    <span data-payout-option-pays-text class="truncate text-sm text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">Pays in <span data-payout-option-currency class="text-sm font-medium text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">USD</span></span>
                                    <span data-payout-option-fee class="text-sm text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">USD$3.45 fee</span>
                                </div>
                                </div>

                                <!-- option -->
                                <div data-payout-option class="flex flex-col gap-2 flex-1 px-2 py-3 border-b-[1.5px] border-[#D0D5DD] backdrop-blur-[5px] bg-white/50 group/option md:p-4 dark:border-[#3b4043] dark:bg-[#181a1b]/50 [&.selected]:bg-black/90 [&.selected]:border-white cursor-pointer dark:[&.selected]:bg-[#181a1b]/90 dark:[&.selected]:border-[#303436]">
                                <!-- option__top -->
                                <div class="flex justify-between items-center gap-2">
                                    <span data-payout-option-title class="text-lg font-medium truncate text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">Bank Wire</span>
                                    <div class="flex items-center gap-1 flex-wrap shrink-0 px-2 py-1 shadow-[0px_0px_4px_0px_#00000026] rounded-[3.125rem] bg-white dark:bg-[#181a1b]">
                                        <div class="w-4 h-4">
                                        <img src="https://i.ibb.co.com/hJStBf17/bank.webp" alt="bank" class="w-full h-full [filter:_brightness(0)_saturate(100%)]"/>
                                        </div>

                                        <span data-payout-option-bank class="text-sm leading-4 font-medium text-[#182230] dark:text-[#d1cdc7]">Bank</span>
                                    </div>
                                </div>

                                <!-- option__bottom -->
                                <div data-payout-option-bottom class="flex justify-between items-center gap-2">
                                    <span data-payout-option-pays-text class="truncate text-sm text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">Pays in <span data-payout-option-currency class="text-sm font-medium text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">USD</span></span>
                                    <span data-payout-option-fee class="text-sm text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">USD$3.45 fee</span>
                                </div>
                                </div>

                                <!-- option -->
                                <div data-payout-option class="flex flex-col gap-2 flex-1 px-2 py-3 border-b-[1.5px] border-[#D0D5DD] backdrop-blur-[5px] bg-white/50 group/option md:p-4 dark:border-[#3b4043] dark:bg-[#181a1b]/50 [&.selected]:bg-black/90 [&.selected]:border-white cursor-pointer dark:[&.selected]:bg-[#181a1b]/90 dark:[&.selected]:border-[#303436]">
                                <!-- option__top -->
                                <div class="flex justify-between items-center gap-2">
                                    <span data-payout-option-title class="text-lg font-medium truncate text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">Bank Wire</span>
                                    <div class="flex items-center gap-1 flex-wrap shrink-0 px-2 py-1 shadow-[0px_0px_4px_0px_#00000026] rounded-[3.125rem] bg-white dark:bg-[#181a1b]">
                                        <div class="w-4 h-4">
                                        <img src="https://i.ibb.co.com/hJStBf17/bank.webp" alt="bank" class="w-full h-full [filter:_brightness(0)_saturate(100%)]"/>
                                        </div>

                                        <span data-payout-option-bank class="text-sm leading-4 font-medium text-[#182230] dark:text-[#d1cdc7]">Bank</span>
                                    </div>
                                </div>

                                <!-- option__bottom -->
                                <div data-payout-option-bottom class="flex justify-between items-center gap-2">
                                    <span data-payout-option-pays-text class="truncate text-sm text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">Pays in <span data-payout-option-currency class="text-sm font-medium text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">CZK</span></span>
                                    <span data-payout-option-fee class="text-sm text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">USD$3.45 fee</span>
                                </div>
                                </div>

                                <!-- option -->
                                <div data-payout-option class="flex flex-col gap-2 flex-1 px-2 py-3 border-b-[1.5px] border-[#D0D5DD] backdrop-blur-[5px] bg-white/50 group/option md:p-4 dark:border-[#3b4043] dark:bg-[#181a1b]/50 [&.selected]:bg-black/90 [&.selected]:border-white cursor-pointer dark:[&.selected]:bg-[#181a1b]/90 dark:[&.selected]:border-[#303436]">
                                <!-- option__top -->
                                <div class="flex justify-between items-center gap-2">
                                    <span data-payout-option-title class="text-lg font-medium truncate text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">USDT - Ethereum(ERC20)</span>
                                    <div class="flex items-center gap-1 flex-wrap shrink-0 px-2 py-1 shadow-[0px_0px_4px_0px_#00000026] rounded-[3.125rem] bg-white dark:bg-[#181a1b]">
                                        <div class="w-4 h-4">
                                        <img src="https://i.ibb.co.com/qFdZMDc2/crypto.webp" alt="crypto" class="w-full h-full [filter:_brightness(0)_saturate(100%)]"/>
                                        </div>

                                        <span data-payout-option-bank class="text-sm leading-4 font-medium text-[#182230] dark:text-[#d1cdc7]">Crypto</span>
                                    </div>
                                </div>

                                <!-- option__bottom -->
                                <div data-payout-option-bottom class="flex justify-between items-center gap-2">
                                    <span data-payout-option-pays-text class="truncate text-sm text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">Pays in <span data-payout-option-currency class="text-sm font-medium text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">USDT</span></span>
                                    <span data-payout-option-fee class="text-sm text-[#182230] group-[.selected]/option:text-[#FCFCFD] dark:text-[#d1cdc7] dark:group-[.selected]/option:text-[#e6e4e1]">USD$3.45 fee</span>
                                </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <select class="payout-real-select hidden" name="dropdown-select" required>
                        
                    </select>
                </div>
            </div>
        </div>

        
        <div class="flex justify-between items-center gap-2 fixed bottom-0 right-0 w-full md:w-[29.1875rem] lg:w-[45rem]">
            <div data-payout-date class="max-md:!hidden hidden flex items-center gap-1 pl-4 group/payout-date every-month">
            <span class="text-sm text-[#0C111D] dark:text-[#dbd8d3]">Next payout date:</span>
            <span class="group-[.every-month]/payout-date:inline group-[.by-earning-target]/payout-date:hidden text-sm font-medium text-[#0C111D] dark:text-[#dbd8d3]">Apr-03-2025</span>
            <span class="group-[.every-month]/payout-date:hidden group-[.by-earning-target]/payout-date:inline text-sm font-medium text-[#0C111D] dark:text-[#dbd8d3]">When earning reaches USD$ 100.00.</span>
            </div>

            <button data-next-button class="ml-auto flex items-center gap-2.5 pl-[1.48rem] pr-2 h-10 shadow-[0px_0px_16px_0px_#FFFFFF80] [clip-path:polygon(100%_0%,100%_100%,0%_100%,0.98rem_0%)] bg-black group/button hover:bg-[#07F468] dark:bg-[#181a1b] dark:hover:bg-[#06c454]">
                <img src="https://i.ibb.co.com/Fb2Xxf9S/tick-circle.webp" alt="tick circle" class="w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(53%)_sepia(97%)_saturate(459%)_hue-rotate(93deg)_brightness(114%)_contrast(94%)] group-hover/button:[filter:brightness(0)_saturate(100%)]">
                <span class="text-lg font-medium text-[#07F468] group-hover/button:text-black dark:text-[#23f97b] dark:group-hover/button:text-[#e8e6e3]">SAVE</span>
            </button>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
  engine: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close']);

const goBack = () => {
    props.engine.goToStep(1);
};
</script>
