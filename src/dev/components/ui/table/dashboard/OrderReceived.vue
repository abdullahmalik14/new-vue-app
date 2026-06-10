<template>
  <section class="flex flex-col gap-6 mt-4">
    <!-- bg-[#15222e] -->
    <!-- page-container -->
    <div
      class="h-full flex flex-col xl:bg-gradient-to-b from-white/30 to-white/0 md:gap-6"
    >
      <!-- page-header -->
      <div
        class="flex flex-col p-2 px-2 gap-6 lg:pt-6 lg:px-4 xl:pb-0 xl:px-10 xl:pt-6"
      >
        <!-- title-container -->
        <div
          class="hidden w-full gap-4 md:flex justify-between items-center xl:gap-6"
        >
          <h1
            class="text-[1.875rem] leading-[2.375rem] text-[#475467] tracking-[-0.045rem] font-medium m-0 xl:text-[1.875rem] xl:leading-[2.375rem]"
          >
            Orders Received
          </h1>
        </div>

        <!-- page-settings -->
        <div
          class="flex flex-col items-start gap-2 lg:flex-row lg:items-center"
        >
          <!-- tab-buttons -->
          <div class="w-full lg:w-auto">
            <div
              class="flex px-1 py-1 rounded-[3rem] bg-gradient-to-r from-[rgba(251,_91,_162,_0.15)] to-[rgba(251,_91,_162,_0.08)] border-none shadow-[0_1px_2px_0_rgba(16,_24,_40,_0.05)] overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] sm:overflow-hidden items-start"
            >
              <button
                class="group px-2 md:px-4 py-2 justify-center items-center flex gap-1 md:gap-2 flex-1 lg:flex-none outline-none border-none [&.active]:rounded-[3rem] [&.active]:bg-black active"
              >
                <span
                  class="text-xs md:text-sm font-medium leading-normal md:leading-5 text-black group-[.active]:text-white whitespace-nowrap"
                  >In Progress</span
                >
                <small
                  class="text-[#F06] tracking-[.016rem] h-6 leading-normal text-[0.625rem] font-medium"
                  >4</small
                >
              </button>

              <button
                class="group px-2 md:px-4 py-2 justify-center items-center flex gap-1 md:gap-2 flex-1 lg:flex-none outline-none border-none [&.active]:rounded-[3rem] [&.active]:bg-black"
              >
                <span
                  class="text-xs md:text-sm font-medium leading-normal md:leading-5 text-black group-[.active]:text-white whitespace-nowrap"
                  >Completed</span
                >
                <small
                  class="text-[#F06] tracking-[.016rem] h-6 leading-normal text-[0.625rem] font-medium"
                  >200+</small
                >
              </button>

              <button
                class="group px-2 md:px-4 py-2 justify-center items-center flex gap-1 md:gap-2 flex-1 lg:flex-none outline-none border-none [&.active]:rounded-[3rem] [&.active]:bg-black"
              >
                <span
                  class="text-xs md:text-sm font-medium leading-normal md:leading-5 text-black group-[.active]:text-white whitespace-nowrap"
                  >Canceled</span
                >
                <small
                  class="text-[#F06] tracking-[.016rem] h-6 leading-normal text-[0.625rem] font-medium"
                  >99+</small
                >
              </button>

              <button
                class="group px-2 md:px-4 py-2 justify-center items-center flex gap-1 md:gap-2 flex-1 lg:flex-none outline-none border-none [&.active]:rounded-[3rem] [&.active]:bg-black"
              >
                <span
                  class="text-xs md:text-sm font-medium leading-normal md:leading-5 text-black group-[.active]:text-white whitespace-nowrap"
                  >All</span
                >
                <small
                  class="text-[#F06] tracking-[.016rem] h-6 leading-normal text-[0.625rem] font-medium"
                  >300+</small
                >
              </button>
            </div>
          </div>

          <!-- search & dropdown -->
          <div class="flex items-center gap-2 flex-1 w-full xl:w-auto">
            <!-- search -->
            <div class="flex w-full gap-[0.375rem]">
              <div
                class="flex items-center gap-2 w-full px-3 py-2 rounded-t-sm"
              >
                <div class="flex items-center gap-2 w-full">
                  <span
                    ><img
                      src="https://i.ibb.co.com/8gjMKbFY/svgviewer-png-output-24.webp"
                      alt="search"
                      class="w-5 h-5 min-w-5"
                  /></span>
                  <div class="flex-none w-[9.375rem] sm:auto overflow-hidden">
                    <input
                      type="text"
                      placeholder="Search..."
                      class="border-none bg-transparent outline-none text-base text-[#101828] placeholder:text-[#757575]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- select-dropdown -->
            <div
              class="select-dropdown w-auto relative z-[10000] flex-1"
              id="select-dropdown"
            >
              <div
                class="order-select cursor-pointer min-w-[5.75rem] rounded-[0.5rem] border-none"
              >
                <div
                  class="dash-select__trigger flex items-center justify-center gap-1 rounded-[0.5rem] px-2"
                >
                  <span
                    class="text-[0.875rem] font-medium leading-[1.25rem] text-[#344054] capitalize tracking-[0.01875rem] whitespace-nowrap"
                    >Order Type</span
                  >
                  <img
                    class="select-arrow h-4 w-4 transition-transform duration-200"
                    src="https://i.ibb.co.com/8DxMjVHT/svgviewer-png-output-25.webp"
                    alt="arrow-down"
                  />
                </div>
                <div
                  class="dash-options-container absolute left-auto right-0 top-[calc(100%+0.5rem)] z-[9999] w-full w-max origin-top scale-95 opacity-0 h-0 overflow-hidden pointer-events-none shadow-lg transition-all duration-200 ease-out [transform-origin:50%_0]"
                >
                  <div
                    class="rounded-[0.125rem] border border-[rgba(186,188,203,0.5)] bg-white/90"
                  >
                    <div
                      class="option flex items-center justify-center gap-[0.625rem] [&.selected]:bg-white hover:bg-white p-[0.75rem]"
                    >
                      <div
                        class="option-inner-container flex flex-1 gap-[0.625rem]"
                      >
                        <span
                          class="text-[0.875rem] font-medium leading-[1.25rem] text-[#0c111d] capitalize tracking-[0.01875rem] text-balance"
                          >All Types</span
                        >
                      </div>
                    </div>
                    <div
                      class="option flex items-center justify-center gap-[0.625rem] [&.selected]:bg-white hover:bg-white p-[0.75rem]"
                    >
                      <div
                        class="option-inner-container flex flex-1 gap-[0.625rem]"
                      >
                        <span
                          class="text-[0.875rem] font-medium leading-[1.25rem] text-[#0c111d] capitalize tracking-[0.01875rem] text-balance"
                          >P2V</span
                        >
                      </div>
                    </div>
                    <div
                      class="option flex items-center justify-center gap-[0.625rem] [&.selected]:bg-white hover:bg-white p-[0.75rem]"
                    >
                      <div
                        class="option-inner-container flex flex-1 gap-[0.625rem]"
                      >
                        <span
                          class="text-[0.875rem] font-medium leading-[1.25rem] text-[#0c111d] capitalize tracking-[0.01875rem] text-balance"
                          >Subscription</span
                        >
                      </div>
                    </div>
                    <div
                      class="option flex items-center justify-center gap-[0.625rem] [&.selected]:bg-white hover:bg-white p-[0.75rem]"
                    >
                      <div
                        class="option-inner-container flex flex-1 gap-[0.625rem]"
                      >
                        <span
                          class="text-[0.875rem] font-medium leading-[1.25rem] text-[#0c111d] capitalize tracking-[0.01875rem] text-balance"
                          >Merch</span
                        >
                      </div>
                    </div>
                    <div
                      class="option flex items-center justify-center gap-[0.625rem] [&.selected]:bg-white hover:bg-white p-[0.75rem]"
                    >
                      <div
                        class="option-inner-container flex flex-1 gap-[0.625rem]"
                      >
                        <span
                          class="text-[0.875rem] font-medium leading-[1.25rem] text-[#0c111d] capitalize tracking-[0.01875rem] text-balance"
                          >Mix</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <select
                class="dash-real-select hidden"
                name="order-select"
                required
              >
                <option value="all-types">All Types</option>
                <option value="p2v">P2V</option>
                <option value="subscription">Subscription</option>
                <option value="merch">Merch</option>
                <option value="mix">Mix</option>
              </select>
            </div>

            
          </div>
        </div>
      </div>

      <!-- table -->

      <OrderTable />

      <!-- page-container with scrollable items -->
      <p class="-mb-4 text-black">Table with scrollable items:</p>
      <!-- table -->
      <OrderScrollableTable />
    </div>
  </section>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from "vue";
import OrderScrollableTable from "./OrderScrollableTable.vue";
import OrderTable from "./OrderTable.vue";

onMounted(() => {
  initDropdowns(); // <-- run after component is mounted
});

onBeforeUnmount(() => {
  // cleanup listeners to avoid duplicates
  document.removeEventListener("click", closeAllDropdowns);
  window.removeEventListener("resize", handleResize);
});

function initDropdowns() {
  document.querySelectorAll(".order-select").forEach((orderSelect) => {
    const selectDropdown = orderSelect.closest(".select-dropdown");
    const trigger = orderSelect.querySelector(".dash-select__trigger span");
    const arrow = orderSelect.querySelector(".select-arrow");
    const options = orderSelect.querySelectorAll(".option");
    const realSelect = selectDropdown.querySelector(".dash-real-select");
    const optionsContainer = orderSelect.querySelector(".dash-options-container");

    if (realSelect) {
      realSelect.value = "yearly";
    }

    orderSelect.addEventListener("click", function (e) {
      e.stopPropagation();
      const isOpening = !optionsContainer.classList.contains("open");

      document.querySelectorAll(".order-select").forEach((s) => {
        if (s !== orderSelect) {
          closeDropdown(s);
        }
      });

      if (isOpening) {
        positionDropdown(orderSelect);
        openDropdown(orderSelect);
      } else {
        closeDropdown(orderSelect);
      }
    });

    options.forEach((option) => {
      option.addEventListener("click", function (e) {
        e.stopPropagation();

        options.forEach((opt) => opt.classList.remove("selected"));
        this.classList.add("selected");

        const selectedText = this.querySelector("span").textContent;
        if (trigger) trigger.textContent = selectedText;
        if (realSelect) realSelect.value = selectedText.toLowerCase();

        closeDropdown(orderSelect);
        if (realSelect) realSelect.dispatchEvent(new Event("change"));
      });
    });
  });

  document.addEventListener("click", closeAllDropdowns);
  window.addEventListener("resize", handleResize);
}

function positionDropdown(select) {
  const optionsContainer = select.querySelector(".dash-options-container");
  if (!optionsContainer) return;

  const rect = select.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  const optionsHeight = optionsContainer.scrollHeight;

  optionsContainer.classList.remove("upward", "downward");

  if (spaceBelow < optionsHeight && spaceAbove > spaceBelow) {
    optionsContainer.classList.add("upward");
    optionsContainer.style.top = "auto";
    optionsContainer.style.bottom = "calc(100% + 0.5rem)";
  } else {
    optionsContainer.classList.add("downward");
    optionsContainer.style.top = "calc(100% + 0.5rem)";
    optionsContainer.style.bottom = "auto";
  }
}

function openDropdown(select) {
  const optionsContainer = select.querySelector(".dash-options-container");
  const arrow = select.querySelector(".select-arrow");
  if (!optionsContainer || !arrow) return;

  optionsContainer.classList.add("open");
  arrow.classList.add("rotate-180");

  optionsContainer.classList.remove(
    "scale-95",
    "opacity-0",
    "pointer-events-none",
    "h-0",
    "overflow-hidden"
  );
  optionsContainer.classList.add(
    "scale-100",
    "opacity-100",
    "pointer-events-auto",
    "h-auto",
    "overflow-auto"
  );
}

function closeDropdown(select) {
  const optionsContainer = select?.querySelector(".dash-options-container");
  const arrow = select?.querySelector(".select-arrow");
  if (!optionsContainer || !arrow) return;

  optionsContainer.classList.remove("open");
  arrow.classList.remove("rotate-180");
  optionsContainer.classList.remove(
    "scale-100",
    "opacity-100",
    "pointer-events-auto",
    "h-auto",
    "overflow-auto"
  );
  optionsContainer.classList.add(
    "scale-95",
    "opacity-0",
    "pointer-events-none",
    "h-0",
    "overflow-hidden"
  );
}

function closeAllDropdowns() {
  document.querySelectorAll(".order-select").forEach((select) => {
    closeDropdown(select);
  });
}

function handleResize() {
  document.querySelectorAll(".order-select").forEach((select) => {
    const optionsContainer = select.querySelector(".dash-options-container");
    if (optionsContainer && optionsContainer.classList.contains("open")) {
      positionDropdown(select);
    }
  });
}
</script>

