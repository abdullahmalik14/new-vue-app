<script setup>
import DashboardWrapperTwoColContainer from '@/components/dashboard/DashboardWrapperTwoColContainer.vue';
import FlexTable from '@/components/ui/table/FlexTable.vue';
import PayoutCard from '@/components/ui/card/dashboard/PayoutCard.vue';
import PayoutSettingsPopup from '@/components/ui/popup/PayoutSettingsPopup.vue';
import { ref } from 'vue';

const showPayoutSettingsPopup = ref(false);

const payoutColumns = [
  { key: 'period', label: 'Period', basis: 'min-w-[11.75rem]' },
  { key: 'status', label: 'Status', basis: 'min-w-[7.375rem] lg:min-w-[8.875rem]' },
  { key: 'totalEarned', label: 'Total Earned', basis: 'min-w-[7.625rem] lg:min-w-[9.8125rem] xl:min-w-[12.125rem]', align: 'right' },
  { key: 'rollover', label: 'Rollover', basis: 'min-w-[6.4375rem] lg:min-w-[8.5625rem]', align: 'right' },
  { key: 'transferFee', label: 'Transfer Fee', basis: 'min-w-[7.5rem] lg:min-w-[8.5625rem]', align: 'right' },
  { key: 'commission', label: 'Commission %', basis: 'min-w-[8.5625rem]', align: 'right' },
  { key: 'finalPayout', label: 'Final Payout', basis: 'min-w-[9.8125rem] xl:min-w-[12.125rem]', align: 'right' },
  { key: 'action', label: '', basis: 'min-w-[5rem]', grow: true, align: 'right' }
];

const payoutRows = [
  { id: 1, period: '1 Jan 2024 - 31 Jan 2024', status: 'Pending', totalEarned: 'USD$ 130.86', rollover: '$0', transferFee: '$0', commission: '88.8%', finalPayout: 'USD$ 123.08' },
  { id: 2, period: '1 Jan 2024 - 31 Jan 2024', status: 'Paid', totalEarned: 'USD$ 130.86', rollover: '$0', transferFee: '$0', commission: '88.8%', finalPayout: 'USD$ 123.08' },
  { id: 3, period: '1 Jan 2024 - 31 Jan 2024', status: 'Paid', totalEarned: 'USD$ 130.86', rollover: '$0', transferFee: '$0', commission: '88.8%', finalPayout: 'USD$ 123.08' },
  { id: 4, period: '1 Jan 2024 - 31 Jan 2024', status: 'Paid', totalEarned: 'USD$ 130.86', rollover: '$0', transferFee: '$0', commission: '88.8%', finalPayout: 'USD$ 123.08' },
  { id: 5, period: '1 Jan 2024 - 31 Jan 2024', status: 'Paid', totalEarned: 'USD$ 130.86', rollover: '$0', transferFee: '$0', commission: '88.8%', finalPayout: 'USD$ 123.08' }
];

const tableTheme = {
  container: 'hidden md:flex flex-col w-full',
  header: 'hidden md:flex items-center w-full',
  headerRow: 'flex items-center w-full',
  headerCell: 'flex items-center min-h-[2.625rem] border-b border-[#667085] dark:border-[#655e53]',
  row: 'flex items-center w-full min-h-[4.5rem] odd:bg-[#e3e9f0] even:bg-[#ebedf3]',
  cell: 'flex items-center h-full',
  footer: 'p-3 text-center'
};

const tableThemeMobile = {
  container: 'flex flex-col gap-1 sm:px-2 md:hidden',
  card: 'flex justify-center items-center p-2 rounded-sm backdrop-blur-[5px] border-[1.5px] border-[#D0D5DD] bg-white/50 sm:py-3 dark:border-[#3b4043] dark:bg-[#181a1b]/50',
  cardRow: '', // Using mobile-row slot for full control
};

</script>

<template>
 <DashboardWrapperTwoColContainer>
    <!-- main-wrapper -->
    <div class="flex flex-col md:flex-row">
      <!-- dashboard-template-main -->
      <div class="w-full relative z-[2] bg-transparent before:content-[''] before:fixed before:bg-[url('https://i.ibb.co.com/Y4zzyNCR/mobile-fansocial-gradient.png')] md:before:bg-[url('https://i.ibb.co.com/spGHXsL9/desktop-fansocial-gradient.png')] before:bg-cover before:bg-center before:w-screen before:h-screen before:bg-no-repeat before:left-0 before:top-0 before:pointer-events-none">
        <div class="flex flex-col gap-4 flex-grow md:gap-6">
          <!-- top page header section -->
          <div class="relative flex flex-col gap-6 bg-cover md:backdrop-blur-[5px] md:[background-image:url('https://i.ibb.co.com/RGG4fpDF/header-gradient-bg.webp')] md:px-4 md:pt-4 xl:px-6 xl:pt-6 before:content-[''] md:before:hidden before:fixed before:bg-[url('https://i.ibb.co.com/QvpHN5vD/mobile-gradient-main-bg-1.webp')] before:bg-cover before:w-full before:bg-no-repeat before:h-full before:left-0 before:top-0 before:pointer-events-none">

            <!-- overlay (above image, below content) -->
            <div class="absolute inset-0 bg-white/10 pointer-events-none"></div> 

            <!-- custom-title -->
            <div class="hidden md:flex justify-between items-center gap-4 w-full z-[1] xl:gap-6">
              <h1 class="text-3xl leading-[2.375rem] font-medium tracking-[-0.045rem] text-[#475467] dark:text-[#b1aaa0]">Your Earnings</h1>
            
              <!-- payout-settings-button -->
              <button @click="showPayoutSettingsPopup = true" class="flex justify-center items-center gap-2.5 pl-1 pr-2 h-10">
                <img src="https://i.ibb.co.com/xt47cMfQ/settings-02.webp" alt="settings 02" class="w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(49%)_sepia(5%)_saturate(1614%)_hue-rotate(183deg)_brightness(85%)_contrast(84%)]">
                <span class="text-lg font-medium text-[#667085] dark:text-[#9e9589]">Payout Settings</span>
              </button>
            </div>

            <!-- top-page-settings -->
            <div class="flex flex-col items-start gap-2 z-[1] sm:gap-4 md:gap-2 lg:flex-row lg:gap-4">
              <!-- card-section -->
            <PayoutCard/>
            </div>
          </div>

          <!-- payout-history section -->
          <div class="flex flex-col gap-2 md:gap-4 pb-10">
            <!-- title-container -->
            <div class="flex justify-between items-center gap-2.5 px-2 md:px-4">
              <h2 class="text-lg font-medium text-[#667085] md:text-xl md:leading-normal dark:text-[#9e9589]">Payout History</h2>
            </div>

            <!-- table-wrapper -->
            <FlexTable
              :columns="payoutColumns"
              :rows="payoutRows"
              :theme="tableTheme"
              :themeMobile="tableThemeMobile"
              showMobile
            >
              <!-- DESKTOP HEADERS -->
              <template #header.period="{ col }">
                <div class="pl-6 pr-2.5 w-full">
                  <span class="text-sm text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
                </div>
              </template>

              <template #header.status="{ col }">
                <div class="px-2.5 w-full">
                  <span class="text-sm text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
                </div>
              </template>

              <template #header.totalEarned="{ col }">
                <div class="pl-2.5 pr-6 w-full text-right">
                  <span class="text-sm text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
                </div>
              </template>

              <template #header.rollover="{ col }">
                <div class="pl-2.5 pr-6 w-full text-right">
                  <span class="text-sm text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
                </div>
              </template>

              <template #header.transferFee="{ col }">
                <div class="pl-2.5 pr-6 w-full text-right">
                  <span class="text-sm text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
                </div>
              </template>

              <template #header.commission="{ col }">
                <div class="pl-2.5 pr-6 w-full text-right">
                  <span class="text-sm text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
                </div>
              </template>

              <template #header.finalPayout="{ col }">
                <div class="pl-2.5 pr-6 w-full text-right">
                  <span class="text-sm text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
                </div>
              </template>

              <!-- DESKTOP CELLS -->
              <template #cell.period="{ value }">
                <div class="pl-6 pr-3 w-full">
                  <span class="text-xs leading-normal font-medium text-[#0C111D] dark:text-[#dbd8d3]">{{ value }}</span>
                </div>
              </template>

              <template #cell.status="{ value }">
                <div class="pl-3 w-full">
                  <div class="flex h-6">
                    <div class="flex justify-center items-center w-6 h-full backdrop-blur-[10px]" 
                         :class="value === 'Pending' ? 'bg-[#FFE500] dark:bg-[#a99700]' : 'bg-[#07F468] dark:bg-[#06c454]'">
                      <img :src="value === 'Pending' ? 'https://i.ibb.co.com/qP4Jr6q/clock.webp' : 'https://i.ibb.co.com/pBCPJv0c/tick-mark.webp'" 
                           :alt="value" class="w-4 h-4 [filter:brightness(0)_saturate(100%)]">
                    </div>
                    <div class="flex justify-center items-center px-1.5 h-full backdrop-blur-[10px] bg-black dark:bg-[#181a1b]">
                      <span class="text-xs leading-normal font-medium" 
                            :class="value === 'Pending' ? 'text-[#FFE500] dark:text-[#ffe81a]' : 'text-[#07F468] dark:text-[#23f97b]'">{{ value }}</span>
                    </div>
                  </div>
                </div>
              </template>

              <template #cell.totalEarned="{ value }">
                <div class="pl-3 pr-6 w-full text-right">
                  <span class="text-xs leading-normal font-medium text-[#0C111D] dark:text-[#dbd8d3]">{{ value }}</span>
                </div>
              </template>

              <template #cell.rollover="{ value }">
                <div class="pl-3 pr-6 w-full text-right">
                  <span class="text-xs leading-normal font-medium text-[#0C111D] dark:text-[#dbd8d3]">{{ value }}</span>
                </div>
              </template>

              <template #cell.transferFee="{ value }">
                <div class="pl-3 pr-6 w-full text-right">
                  <span class="text-xs leading-normal font-medium text-[#0C111D] dark:text-[#dbd8d3]">{{ value }}</span>
                </div>
              </template>

              <template #cell.commission="{ value }">
                <div class="pl-3 pr-6 w-full text-right">
                  <span class="text-xs leading-normal font-medium text-[#0C111D] dark:text-[#dbd8d3]">{{ value }}</span>
                </div>
              </template>

              <template #cell.finalPayout="{ value }">
                <div class="pl-3 pr-6 w-full text-right">
                  <span class="text-xs leading-normal font-bold text-[#004EEB] dark:text-[#3f9dff]">{{ value }}</span>
                </div>
              </template>

              <template #cell.action>
                <div class="pl-3 pr-6 w-full text-right flex justify-end">
                  <button class="flex justify-center items-center w-8 h-8">
                    <img src="https://i.ibb.co.com/qMVbj8VQ/search-icon.webp" alt="search icon" class="w-6 h-6">
                  </button>
                </div>
              </template>

              <!-- MOBILE ROW SLOT -->
              <template #mobile-row="{ row }">
                <div class="flex justify-between gap-0.5 w-full">
                  <!-- row-left -->
                  <div class="flex flex-col gap-1 w-[10.625rem] sm:gap-1.5 text-left">
                    <span class="text-sm font-medium py-0.5 text-[#182230] dark:text-[#d1cdc7]">{{ row.period }}</span>
                  
                    <!-- mini-table -->
                    <div class="flex flex-col gap-0.5 sm:gap-1">
                      <div class="flex justify-between items-center gap-0.5">
                        <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">Rollover</span>
                        <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">{{ row.rollover }}</span>
                      </div>
                      <div class="flex justify-between items-center gap-0.5">
                        <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">Transfer Fee</span>
                        <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">{{ row.transferFee }}</span>
                      </div>
                      <div class="flex justify-between items-center gap-0.5">
                        <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">Commission %</span>
                        <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">{{ row.commission }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- row-right -->
                  <div class="flex flex-col items-end gap-0.5 min-w-[9.4375rem] sm:gap-1.5">
                    <!-- status -->
                    <div class="flex h-6">
                      <div class="flex justify-center items-center w-6 h-full backdrop-blur-[10px]"
                           :class="row.status === 'Pending' ? 'bg-[#FFE500] dark:bg-[#a99700]' : 'bg-[#07F468] dark:bg-[#06c454]'">
                        <img :src="row.status === 'Pending' ? 'https://i.ibb.co.com/qP4Jr6q/clock.webp' : 'https://i.ibb.co.com/pBCPJv0c/tick-mark.webp'" 
                             class="w-4 h-4 [filter:brightness(0)_saturate(100%)]">
                      </div>
                      <div class="flex justify-center items-center px-1.5 h-full backdrop-blur-[10px] bg-black dark:bg-[#181a1b]">
                        <span class="text-xs leading-normal font-medium"
                              :class="row.status === 'Pending' ? 'text-[#FFE500] dark:text-[#ffe81a]' : 'text-[#07F468] dark:text-[#23f97b]'">{{ row.status }}</span>
                      </div>
                    </div>

                    <div class="flex flex-col sm:gap-1 text-right">
                      <div class="flex items-center justify-end gap-1">
                        <span class="text-[0.625rem] leading-[1.125rem] font-medium text-[#667085] dark:text-[#9e9589]">Total Earned</span>
                        <span class="text-[0.625rem] leading-[1.125rem] text-[#667085] dark:text-[#9e9589]">{{ row.totalEarned }}</span>
                      </div>

                      <div class="flex flex-col">
                        <span class="text-xs leading-normal font-medium text-right text-[#667085] dark:text-[#9e9589]">Final Payout</span>
                        <span class="text-lg font-bold text-right -mt-1 text-[#004EEB] dark:text-[#3f9dff]">{{ row.finalPayout }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </FlexTable>
          </div>
        </div>
    </div>
    </div>
    <PayoutSettingsPopup v-model="showPayoutSettingsPopup" />
 </DashboardWrapperTwoColContainer>
</template>