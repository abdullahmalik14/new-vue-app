<template>
    <!-- Select Dropdown with Icon Dashboard -->
          <div class="flex flex-col gap-[0.375rem] flex-1 self-stretch">
            <label
              for="dash-country-select"
              class="block text-sm font-medium text-dash-text"
              >Dashboard dropdown</label
            >
              <div class="dash-select cursor-pointer relative">
                <div
                  class="dash-select__trigger flex items-center justify-between w-full px-3 py-2 border-b border-dash-border rounded-dash-input shadow-dash-input bg-white/50"
                >
                  <span class="text-sm font-normal text-[#0c111d]"
                    >English</span
                  >
                  <svg
                    class="select-arrow w-4 h-4 transition-transform duration-300 ease-in-out transform"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 6L8 10L12 6"
                      stroke="#98A2B3"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <div
                  class="dash-options-container absolute w-full opacity-0 invisible pointer-events-none transition-all duration-300 z-10 top-[calc(100%+0.5rem)] bg-white shadow-none border-none"
                >
                  <div
                    class="dash-options rounded-[2px] bg-[#ececec] backdrop-blur-[25px] max-h-[200px] overflow-y-auto"
                  >
                    <div class="dash-option selected bg-white/50" data-value="english">
                      <span
                        class="flex gap-[0.625rem] py-3 px-[0.75rem] text-sm font-medium leading-5 text-[#0c111d] capitalize border-b border-[#eaecf0] bg-white"
                        >English</span
                      >
                    </div>
                    <div class="dash-option bg-white/50 hover:bg-white/70" data-value="chinese">
                      <span
                        class="flex gap-[0.625rem] py-3 px-[0.75rem] text-sm font-normal leading-5 text-[#0c111d] capitalize"
                        >Chinese</span
                      >
                    </div>
                    <div class="dash-option bg-white/50 hover:bg-white/70" data-value="japanese">
                      <span
                        class="flex gap-[0.625rem] py-3 px-[0.75rem] text-sm font-normal leading-5 text-[#0c111d] capitalize"
                        >Japanese</span
                      >
                    </div>
                    <div class="dash-option bg-white/50 hover:bg-white/70" data-value="korean">
                      <span
                        class="flex gap-[0.625rem] py-3 px-[0.75rem] text-sm font-normal leading-5 text-[#0c111d] capitalize"
                        >Korean</span
                      >
                    </div>
                  </div>
                </div>
              </div>
              <select
                class="dash-real-select hidden"
                name="dash-country-select"
                required
              >
                <option value="">Please select a pet</option>
                <option value="cat">Cat</option>
                <option value="dog">Dog</option>
                <option value="hamster">Hamster</option>
              </select>
            </div>
        
</template>
 <script setup>
import { onMounted, onBeforeUnmount } from 'vue';

let closeAllDropdowns = null;
let positionDropdown = null;

onMounted(() => {
  const customSelects = document.querySelectorAll('.dash-select');

  closeAllDropdowns = function () {
    document.querySelectorAll('.dash-select').forEach(select => {
      select.classList.remove('open');
      select.querySelector('.select-arrow')?.classList.remove('rotate-180');
      const otherOptions = select.querySelector('.dash-options-container');
      otherOptions?.classList.add('opacity-0', 'invisible', 'pointer-events-none');
      otherOptions?.classList.remove('opacity-100', 'visible', 'pointer-events-auto');
    });
  };

  positionDropdown = function (select) {
    const optionsContainer = select.querySelector('.dash-options-container');
    const rect = select.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const optionsHeight = select.querySelector('.dash-options').scrollHeight;

    select.classList.remove('upward');
    optionsContainer?.classList.remove('bottom-[calc(100%+0.5rem)]');
    optionsContainer?.classList.add('top-[calc(100%+0.5rem)]');

    if (spaceBelow < optionsHeight && spaceAbove > spaceBelow) {
      select.classList.add('upward');
      optionsContainer?.classList.remove('top-[calc(100%+0.5rem)]');
      optionsContainer?.classList.add('bottom-[calc(100%+0.5rem)]');
    }
  };

  customSelects.forEach(select => {
    const trigger = select.querySelector('.dash-select__trigger span');
    const options = select.querySelectorAll('.dash-option');
    const realSelect = select.parentElement.querySelector('.dash-real-select');

    const selectedOption = select.querySelector('.dash-option.selected');
    if (selectedOption) {
      trigger.textContent = selectedOption.querySelector('span').textContent;
      realSelect.value = selectedOption.dataset.value || '';
    }

    select.addEventListener('click', function (e) {
      e.stopPropagation();

      document.querySelectorAll('.dash-select').forEach(s => {
        if (s !== select) {
          s.classList.remove('open');
          s.querySelector('.select-arrow')?.classList.remove('rotate-180');
          const otherOptions = s.querySelector('.dash-options-container');
          otherOptions?.classList.add('opacity-0', 'invisible', 'pointer-events-none');
          otherOptions?.classList.remove('opacity-100', 'visible', 'pointer-events-auto');
        }
      });

      positionDropdown(this);

      this.classList.toggle('open');
      const arrow = this.querySelector('.select-arrow');
      const optionsContainer = this.querySelector('.dash-options-container');

      if (this.classList.contains('open')) {
        arrow?.classList.add('rotate-180');
        optionsContainer?.classList.remove('opacity-0', 'invisible', 'pointer-events-none');
        optionsContainer?.classList.add('opacity-100', 'visible', 'pointer-events-auto');
      } else {
        arrow?.classList.remove('rotate-180');
        optionsContainer?.classList.add('opacity-0', 'invisible', 'pointer-events-none');
        optionsContainer?.classList.remove('opacity-100', 'visible', 'pointer-events-auto');
      }
    });

    options.forEach(option => {
      option.addEventListener('click', function (e) {
        e.stopPropagation();

        options.forEach(opt => {
          opt.classList.remove('selected');
        });

        this.classList.add('selected');
        const optionSpan = this.querySelector('span');
        trigger.textContent = optionSpan.textContent;
        realSelect.value = this.dataset.value || optionSpan.textContent.toLowerCase();

        select.classList.remove('open');
        realSelect.dispatchEvent(new Event('change'));
      });
    });
  });

  document.addEventListener('click', closeAllDropdowns);
});

onBeforeUnmount(() => {
  if (closeAllDropdowns) {
    document.removeEventListener('click', closeAllDropdowns);
  }
});
</script>
