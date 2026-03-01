<script setup>
import { reactive } from "vue";
import FlexTable from "../FlexTable.vue";

// Sample data matching your design
const state = reactive({
  rows: [
    {
      id: 1,
      type: "Unknown",
      orderNum: "#8281",
      icon: "https://i.ibb.co.com/Y7phV0cK/cart.webp",
      iconBg: "#07f468",
      from: "@linden",
      fromAvatar: "https://i.ibb.co.com/jkjtwC9C/svgviewer-png-output-17.webp",
      status: "New",
      date: "8 Apr 2025",
      total: "0",
    },
    {
      id: 2,
      type: "Merch",
      orderNum: "#6565",
      icon: "https://i.ibb.co.com/RGtnmtYZ/merch.webp",
      iconBg: "black",
      from: "@gaver10",
      fromAvatar:
        "https://i.ibb.co.com/b5C0tMTN/placeholder-headshot-creator.webp",
      status: "New",
      date: "20 Sep 2024",
      total: "0",
    },
  ],
  loading: false,
  hasMore: false,
});

// Columns with proper responsive widths
const columns = [
  { key: "order", label: "Order#", basis: "basis-1/6" },
  { key: "from", label: "From", basis: "basis-1/6" },
  { key: "status", label: "Status", basis: "basis-1/6" },
  { key: "date", label: "Date", basis: "basis-1/6" },
  { key: "total", label: "Total", basis: "basis-1/5", align: 'center' }, // ✅ yahan
];

// Custom theme - minimal borders like original
const theme = {
  container:'relative rounded-lg',
  header:'text-text-quaternary border-b border-text-quaternary',
  headerRow:'flex items-center',
  headerCell:'px-2 py-2 text-sm font-poppins tracking-wide',
  row:'flex items-center odd:bg-white even:bg-bg-row-odd cursor-pointer',
  cell:'text-sm text-zinc-800',
  footer:'p-3 text-center'
}

function loadMore() {
  if (state.loading || !state.hasMore) return;
  state.loading = true;
  setTimeout(() => {
    // Add more rows logic here
    state.loading = false;
  }, 500);
}
</script>

<template>
  <div class="">
    <FlexTable
      :columns="columns"
      :rows="state.rows"
      row-key="id"
      :theme="theme"
      :inner-scroll="false"
      :sticky-header="false"
      :has-more="state.hasMore"
      :loading="state.loading"
      desktop-breakpoint="md"
      @load-more="loadMore"
    >
      <!-- Order column with icon - FULL WIDTH ON MOBILE -->
      <template #cell.order="{ row }">
        <div class="flex items-center p-0">
          <!-- Icon container -->
          <div
            class="flex justify-center items-center w-[3.5rem] h-[4.5rem] md:w-[4.5rem] border-b border-zinc-200 md:border-b-0"
            :style="{ backgroundColor: row.iconBg }"
          >
            <img :src="row.icon" :alt="row.type" class="w-9 h-9" />
          </div>

          <!-- Text container -->
          <div
            class="flex flex-col justify-center items-start flex-1 min-h-[4.5rem] p-1.5 md:p-2.5 gap-0 md:gap-0.5"
          >
            <span
              class="truncate text-xs font-semibold leading-[1.125rem] text-zinc-900 whitespace-nowrap"
            >
              {{ row.type }}
            </span>
            <span
              class="hidden md:flex truncate text-xs leading-[1.125rem] text-zinc-600 whitespace-nowrap"
            >
              {{ row.orderNum }}
            </span>

            <!-- Mobile view - inline info -->
            <div class="flex md:hidden flex-col w-full">
              <div class="flex items-center">
                <span
                  class="truncate text-xs leading-[1.125rem] text-zinc-600 whitespace-nowrap"
                >
                  {{ row.orderNum }} &nbsp;
                </span>
                <span
                  class="truncate text-xs leading-[1.125rem] text-zinc-500 whitespace-nowrap"
                >
                  {{ row.date }}
                </span>
              </div>
              <span class="flex items-center gap-[0.3125rem]">
                <img
                  :src="row.fromAvatar"
                  alt="avatar"
                  class="w-5 h-5 rounded-full"
                />
                <span
                  class="truncate text-xs leading-[1.125rem] text-zinc-600 whitespace-nowrap"
                >
                  {{ row.from }}
                </span>
              </span>
            </div>
          </div>
        </div>
      </template>

      <!-- From column - CONTENT WIDTH -->
      <template #cell.from="{ row }">
        <div
          class="flex items-center min-h-[2.625rem] p-2.5"
        >
          <span class="flex items-center gap-[0.3125rem] self-stretch">
            <img
              :src="row.fromAvatar"
              alt="avatar"
              class="w-5 h-5 rounded-full"
            />
            <span
              class="truncate text-xs leading-[1.125rem] text-zinc-600 whitespace-nowrap"
            >
              {{ row.from }}
            </span>
          </span>
        </div>
      </template>

      <!-- Status column - CONTENT WIDTH -->
      <template #cell.status="{ row }">
        <div
          class="flex items-start min-h-[2.625rem] p-2.5"
        >
          <div class="flex items-start">
            <span
              class="flex justify-center items-center p-1 bg-bg-status-light backdrop-blur-[10px]"
            >
              <img
                src="https://i.ibb.co.com/cSnyRK5k/stars.webp"
                alt="stars"
                class="w-4 h-4"
              />
            </span>
            <span
              class="flex justify-center items-center px-1.5 py-[0.188rem] gap-2 text-xs font-medium leading-[1.125rem] text-status-new  backdrop-blur-[10px] whitespace-nowrap"
            >
              {{ row.status }}
            </span>
          </div>
        </div>
      </template>

      <!-- Date column - CONTENT WIDTH -->
      <template #cell.date="{ row }">
        <div
          class="flex items-center min-h-[2.625rem] p-2.5"
        >
          <span class="truncate text-xs leading-[1.125rem] text-zinc-500">
            {{ row.date }}
          </span>
        </div>
      </template>

      <!-- Total column - PUSH TO RIGHT -->
      <template #cell.total="{ row }">
  <div class="flex items-center min-h-[2.625rem] p-2.5">
    <span
      class="text-xs font-semibold leading-[1.125rem] text-zinc-900 whitespace-nowrap text-center ml-5 w-full"
    >
      {{ row.total }}
    </span>
  </div>
</template>

    </FlexTable>
  </div>
</template>
