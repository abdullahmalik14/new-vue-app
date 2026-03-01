<template>
  <section :class="theme.main.wrapper" v-bind="dataAttrs" :data-view="effectiveView"
    :data-focus="cursor ? cursor.toISOString().slice(0, 10) : ''">

    <!-- default-header-theme-1 -->
    <div v-if="variant === 'default'" class="flex items-center justify-between sticky top-0 z-30 p-2 backdrop-blur-md">
      <div class="flex items-center gap-[11px]">
        <div class="font-bold " :class="theme.main.title">{{ title }}</div>
        <!-- mobile-view-start-->
        <div class="cursor-pointer flex lg:hidden" @click="toggleMobileCalendar">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.00024 12L16.0002 20L24.0002 12" stroke="#667085" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>

        </div>

        <div v-if="isMobileCalendarOpen" ref="mobileCalendarRef"
          class="absolute top-12 left-0 z-[100] w-full lg:hidden rounded-bl-[12px] rounded-br-[12px] overflow-hidden">
          <div
            class="p-2 bg-white/80 backdrop-blur-[10px] rounded-br-xl rounded-bl-xl md:rounded-xl shadow-[0px_5px_5px_0px_rgba(0,0,0,0.10)]">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2 cursor-pointer" @click="isDatePopupOpen = true">
                <div class="text-gray-900 text-base font-medium uppercase">{{ title }}</div>
                <svg width="15" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.00024 12L16.0002 20L24.0002 12" stroke="#667085" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </div>

              <span class="flex items-center justify-between gap-[16px]">
                <button class="w-[6px] h-[12px] flex items-center justify-center" @click="shift(-1)" data-main-prev>
                  <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.9995L1 8.99951L9 0.999512" stroke="#FF0066" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </button>
                <button class="w-[6px] h-[12px] flex items-center justify-center" @click="shift(1)" data-main-next>
                  <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 16.9995L9 8.99951L1 0.999512" stroke="#FF0066" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </button>
              </span>
            </div>
            <MiniCalendar class="w-full" :month-date="cursor" :selected-date="focusDate" :events="events" :theme="{
              ...theme,
              mini: {
                wrapper: 'flex flex-col w-full font-medium text-gray-500 mt-[10px] gap-[0.625rem] rounded-xl w-[20.375rem]',
                header: 'font-semibold',
                // CHANGE 1: 'hover:bg-slate-50' yahan se HATA diya hai.
                // CHANGE 2: 'focus:ring-inset' ADD kiya hai taake outline andar bane aur cut na ho.
                dayBase: 'w-[37.43px] h-[37px] rounded-full flex flex-col items-center justify-center focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500',
                outside: 'opacity-0',
                expired: 'opacity-100',
                today: 'bg-[#FF0066] font-semibold text-white',
                selected: 'rounded-full',
                dot: 'mt-[2rem] w-1.5 h-1.5 rounded-full absolute'
              }
            }" @date-selected="(d) => { emitDate(d); isMobileCalendarOpen = false; }">
            </MiniCalendar>
          </div>
        </div>
        <!-- mobile-view-end-->


        <button
          class="px-[1.5rem] hidden xl:flex justify-center items-center py-[0.25rem] h-[3rem] rounded-[2rem] border border-pink-400 hover:bg-slate-50"
          @click="goToday" data-main-today>
          <p class="font-medium text-[14px] text-pink-500">Today</p>
        </button>
        <span class="lg:flex items-center justify-between hidden ">
          <button class="w-[2rem] h-[2rem] flex items-center justify-center" @click="shift(-1)" data-main-prev>
            <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 16.9995L1 8.99951L9 0.999512" stroke="#667085" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </button>
          <button class="w-[2rem] h-[2rem] flex items-center justify-center" @click="shift(1)" data-main-next>
            <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 16.9995L9 8.99951L1 0.999512" stroke="#667085" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </button>
        </span>
      </div>

      <div class="flex items-center gap-2" ref="dropdownContainer">
        <div class="relative inline-block text-left hidden xl:flex">

          <div @click="toggleDropdown"
            :class="isDropdownOpen ? 'bg-[#000]' : 'bg-gradient-to-l from-pink-500/20 to-pink-500/10'"
            class="h-[2.5rem] w-[11.25rem] px-[1.5rem] py-[0.5rem] rounded-[3rem] flex items-center justify-between cursor-pointer select-none transition-all duration-300">
            <span class="flex items-center justify-center h-full">
              <h2 class="text-[0.875rem] font-medium " :class="isDropdownOpen ? 'text-white' : 'text-black'">All Events
              </h2>
              <p class="text-pink-500 text-[10px] font-bold h-full ml-1">
                20
              </p>
            </span>

            <button class="flex items-center justify-center w-[0.5rem] h-[0.5rem] transition-transform duration-200"
              :class="{ 'rotate-180': isDropdownOpen }">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M0.796688 1.96714L3.53832 6.70268C3.68984 6.9644 3.7656 7.09526 3.86444 7.13922C3.95066 7.17755 4.04909 7.17755 4.13531 7.13922C4.23415 7.09526 4.30992 6.9644 4.46144 6.70268L7.20307 1.96714C7.35513 1.70448 7.43117 1.57315 7.41993 1.46536C7.41013 1.37134 7.36087 1.28591 7.28442 1.23032C7.19677 1.16659 7.04501 1.16659 6.74151 1.16659H1.25825C0.954741 1.16659 0.802987 1.16659 0.715335 1.23032C0.638882 1.28591 0.589625 1.37134 0.579824 1.46536C0.568586 1.57315 0.64462 1.70448 0.796688 1.96714Z"
                  :fill="isDropdownOpen ? 'white' : 'black'" :stroke="isDropdownOpen ? 'white' : 'black'"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>

          <div v-if="isDropdownOpen" class="absolute top-full left-0 mt-2 z-50 origin-top-left">
            <EventDropdownContent />
          </div>

        </div>

        <span
          class="xl:flex items-center hidden w-[14.375rem] rounded-[3rem] p-[0.25rem] bg-white/20 border border-pink-400/80">

          <button @click="setView('day')"
            class="w-[4.5rem] px-[1rem] py-[0.5rem] leading-[1.25rem] rounded-[3rem] text-[0.875rem] font-bold" :class="view === 'day'
              ? 'bg-pink-400/80 text-white'
              : 'text-pink-400/80'">
            Day
          </button>

          <button @click="setView('week')"
            class="w-[4.5rem] px-[1rem] py-[0.5rem] leading-[1.25rem] rounded-[3rem] text-[0.875rem] font-semibold"
            :class="view === 'week'
              ? 'bg-pink-400/80 text-white'
              : 'text-pink-400/80'">
            Week
          </button>

          <button @click="setView('month')"
            class="w-[4.875rem] px-[1rem] py-[0.5rem] leading-[1.25rem] rounded-[3rem] text-[0.875rem] font-bold"
            :class="view === 'month'
              ? 'bg-pink-400/80 text-white'
              : 'text-pink-400/80'">
            Month
          </button>

        </span>


        <!-- mobile-view-today-button -->
        <button
          class="px-6 flex xl:hidden justify-center items-center py-1 rounded-[2rem] border border-pink-400 hover:bg-slate-50"
          @click="goToday" data-main-today>
          <p class="font-medium text-[14px] text-pink-500">Today</p>
        </button>
        <div class="cursor-pointer relative flex xl:hidden">
          <div @click="toggleDropdown">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3.38589 5.66687C2.62955 4.82155 2.25138 4.39889 2.23712 4.03968C2.22473 3.72764 2.35882 3.42772 2.59963 3.22889C2.87684 3 3.44399 3 4.57828 3H19.4212C20.5555 3 21.1227 3 21.3999 3.22889C21.6407 3.42772 21.7748 3.72764 21.7624 4.03968C21.7481 4.39889 21.3699 4.82155 20.6136 5.66687L14.9074 12.0444C14.7566 12.2129 14.6812 12.2972 14.6275 12.3931C14.5798 12.4781 14.5448 12.5697 14.5236 12.6648C14.4997 12.7721 14.4997 12.8852 14.4997 13.1113V18.4584C14.4997 18.6539 14.4997 18.7517 14.4682 18.8363C14.4403 18.911 14.395 18.9779 14.336 19.0315C14.2692 19.0922 14.1784 19.1285 13.9969 19.2012L10.5969 20.5612C10.2293 20.7082 10.0455 20.7817 9.89802 20.751C9.76901 20.7242 9.6558 20.6476 9.583 20.5377C9.49975 20.4122 9.49975 20.2142 9.49975 19.8184V13.1113C9.49975 12.8852 9.49975 12.7721 9.47587 12.6648C9.45469 12.5697 9.41971 12.4781 9.37204 12.3931C9.31828 12.2972 9.2429 12.2129 9.09213 12.0444L3.38589 5.66687Z"
                stroke="#667085" stroke-width="1.77778" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>

          <div v-if="isDropdownOpen" class="absolute top-full right-5 mt-2 z-50 origin-top-left">
            <EventDropdownContent />
          </div>

        </div>
        <div class="cursor-pointer flex xl:hidden" @click="calendarPopupOpen = true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M21 10H3M16 2V6M8 2V6M7.8 22H16.2C17.8802 22 18.7202 22 19.362 21.673C19.9265 21.3854 20.3854 20.9265 20.673 20.362C21 19.7202 21 18.8802 21 17.2V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22Z"
              stroke="#667085" stroke-width="1.78" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>

      </div>
    </div>

    <!-- default-header-theme-2 -->
    <div v-else-if="variant === 'theme2'"
      class="flex flex-wrap lg:flex-nowrap items-center justify-between w-full mb-[3rem]">

      <div class="flex items-center gap-[11px] order-1">
        <div class="font-bold" :class="theme.main.title">{{ title }}</div>
        <span class="flex items-center justify-between">
          <button class="w-[2rem] h-[2rem] flex items-center justify-center" @click="shift(-1)" data-main-prev>
            <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 16.9995L1 8.99951L9 0.999512" stroke="#667085" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </button>
          <button class="w-[2rem] h-[2rem] flex items-center justify-center" @click="shift(1)" data-main-next>
            <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 16.9995L9 8.99951L1 0.999512" stroke="#667085" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </button>
        </span>
      </div>

      <div class="flex items-center gap-3 order-3 w-full mt-1 lg:w-auto lg:order-2 lg:mt-0">
        <CheckboxGroup label="Show existing events/booking schedule" v-model="showSchedule"
          checkboxClass="appearance-none bg-white border border-[#D0D5DD] rounded-[4px] w-4 min-w-4 h-4 checked:white checked:bg-[#FF0066] checked:border-[#FF0066] checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:border-white checked:after:border-w-0 checked:after:border-b-2 checked:after:border-r-2 checked:after:rotate-45 checked:after:box-border cursor-pointer"
          labelClass="text-xs sm:text-[12px] leading-normal tracking-[0.0175rem] text-slate-700 cursor-pointer mt-[2px]"
          wrapperClass="flex items-center" />
      </div>

      <button @click="$emit('preview-schedule')"
        class="px-2 py-2.5 rounded-full outline-none border border-[#F1C1D9] text-brand-textPink text-xs font-medium flex items-center gap-2 hover:bg-pink-100 transition-colors order-2 lg:order-3">
        Preview booking schedule
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
          stroke-linecap="round" stroke-linejoin="round" class="mb-[1px]">
          <line x1="7" y1="17" x2="17" y2="7"></line>
          <polyline points="7 7 17 7 17 17"></polyline>
        </svg>
      </button>
    </div>


    <div v-if="effectiveView !== 'month'" class="h-full">
      <div class="flex" :class="[effectiveView === 'day' ? 'grid-cols-2' : 'grid-cols-8', theme.main.xHeader]">

        <div :class="theme.main.axisXLabel">
          <div v-if="variant === 'default'" class="lg:flex hidden items-center px-[0.25rem] gap-[0.125rem]">
            <span class="flex items-center justify-center w-[10px] h-[10px]">
              <svg width="6" height="5" viewBox="0 0 6 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.5 1.36523L3 3.86523L5.5 1.36523" stroke="#98A2B3" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </span>
            <p class="text-[11px] text-gray-400 font-medium leading-[18px]">GMT +08</p>
          </div>
          <div v-else class="flex flex-col items-center justify-end pb-2">
            <span class="text-[10px] font-bold text-slate-400">GMT+5</span>
          </div>
        </div>

        <div class="grid h-[3.995rem] w-full" :class="effectiveView === 'day' ? 'grid-cols-1' : 'grid-cols-7'">

          <div v-for="(d, i) in days" :key="'xh-' + i" class="text-center flex flex-col items-center justify-center"
            :class="[
              theme.main.axisXDay,
              (sd(d).getDay() === 0 && variant === 'default') ? 'text-red-500' : ''
            ]" :data-date="d.toISOString().slice(0, 10)">

            <div class="text-[11px] font-semibold leading-[1.25rem] uppercase"
              :class="variant === 'theme2' ? 'text-slate-500 tracking-wider mb-1' : ''">
              {{ ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()] }}
            </div>

            <div class="text-[1rem] w-[2rem] text-center font-semibold leading-[2rem]"
              :class="[(highlightTodayColumn && sameDay(d, today)) ? theme.main.axisXToday : '']">
              {{ d.getDate() }}
            </div>
          </div>
        </div>

      </div>

      <div
        class="flex gap-2 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div class="flex flex-col">
          <div v-for="(t) in range.labels" :key="'slot-label-' + t"
            :class="[theme.main.axisYRow, isNowLabel(t) ? ' !text-brand-textPink font-bold' : '']">
            {{ formatTime(t) }}
          </div>
        </div>

        <span class="grid w-full relative rounded-md overflow-hidden"
          :class="[effectiveView === 'day' ? 'grid-cols-1' : 'grid-cols-7']">
          <div v-for="(d, idx) in days" :key="'col-' + idx" :data-date="d.toISOString().slice(0, 10)"
            :data-expired="sd(d) < today ? 'true' : 'false'" :class="theme.main.colBase" @click.self="emitDate(d)">

            <div class="absolute z-[0] inset-0 pointer-events-none">
              <div v-for="i in range.rowCount" :key="'grid-' + i" :class="theme.main.gridRow"></div>
            </div>

            <div class="relative z-[0]" data-cal-scroll
              :style="{ height: (range.rowCount * rowHeightPx) + 'px', overflowY: 'auto' }">
              <template v-for="ev in eventsForDay(d)" :key="ev.id||ev.title+ev.start">
                <slot v-if="ev.slot === 'alt'" name="event-alt" :event="ev" :day="d" :view="effectiveView"
                  :style="styleBlock(ev)" :onClick="dispatchEventClick"></slot>
                <slot v-else-if="ev.slot === 'custom'" name="event-custom" :event="ev" :day="d" :view="effectiveView"
                  :style="styleBlock(ev)" :onClick="dispatchEventClick"></slot>
                <slot v-else-if="ev.slot === 'custom2'" name="event-custom2" :event="ev" :day="d" :view="effectiveView"
                  :style="styleBlock(ev)" :onClick="dispatchEventClick"></slot>
                <slot v-else name="event" :event="ev" :day="d" :view="effectiveView" :style="styleBlock(ev)"
                  :onClick="dispatchEventClick"></slot>
              </template>
            </div>

          </div>
        </span>
      </div>
    </div>

    <div v-if="effectiveView === 'month'" class="flex flex-col h-full">

      <div class="grid grid-cols-7 shrink-0 mt-[-3rem]">
        <div v-for="w in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="w"
          class="text-center text-sm sm:text-lg font-semibold uppercase leading-7 mb-[10px]"
          :class="w === 'Sun' ? 'text-red-400' : 'text-gray-500'">
          {{ w }}
        </div>
      </div>

      <div class="flex-1 flex flex-col">

        <div v-for="(row, rowIndex) in monthRows" :key="'row-' + rowIndex" class="contents">

          <div class="grid grid-cols-7 flex-1">
            <button v-for="(d, i) in row" :key="'m-' + i" type="button" @click="handleMonthDateClick(d)" :class="[
              theme.month.cellBase,
              d.getMonth() !== cursor.getMonth() ? theme.month.outside : '',
              (highlightTodayColumn && sameDay(d, today)) ? theme.month.today : '',
              d.getDay() === 0 ? 'text-red-400' : '',
              expandedDate && sameDay(d, expandedDate) ? 'bg-slate-50' : ''
            ]">
              <div class="text-sm mb-1" :class="d.getDay() === 0 ? 'text-red-400 font-semibold' : ''">
                {{ d.getDate() }}
              </div>

              <div class="space-y-1 w-full">
                <template v-for="ev in eventsForDay(d)" :key="ev.id || ev.title + ev.start">
                  <slot :name="ev.slot ? 'event-' + ev.slot : 'event'" :event="ev" :day="d" view="month"
                    :onClick="dispatchEventClick" />
                </template>
              </div>
            </button>
          </div>

          <div v-if="isRowExpanded(row)" class="w-full transition-all duration-300 lg:hidden">
            <div class="w-full p-2 bg-black/10 flex flex-col h-[500px]">
              <div class="w-full flex flex-col  gap-2">
                <div class="w-full flex flex-col  gap-2">
                  <div
                    class=" pr-1 bg-[#FFFFFF] rounded shadow-[0px_0px_8px_0px_rgba(99,88,255,0.50)] inline-flex  gap-1.5 overflow-hidden">
                    <div class="w-1  relative bg-indigo-600" />
                    <div class="flex-1  py-2 flex  gap-1">
                      <div class="w-14  justify-center text-slate-700 text-xs font-medium font-['Poppins'] leading-4">
                        2:15pm- 9:30pm</div>
                      <div class="flex-1 inline-flex flex-col  gap-1">
                        <div class=" justify-center text-indigo-600 text-sm font-semibold font-['Poppins'] leading-5">
                          Live Call</div>
                        <div class="inline-flex justify-start items-center gap-1">
                          <div class="w-5 h-5 relative">
                            <img class="w-5 h-5 left-[0.97px] top-[0.83px] absolute"
                              src="https://i.ibb.co/0VQJ0swt/Vector.png" />
                          </div>
                          <div class="justify-center text-gray-500 text-xs font-medium font-['Poppins'] leading-4">
                            Apples</div>
                        </div>
                      </div>
                      <div class="h-12 inline-flex flex-col justify-between items-end">
                        <div class=" inline-flex justify-start items-center gap-1">
                          <div class="w-1.5 h-1.5 bg-[#5549FF] rounded-full" />
                          <div class="justify-start text-gray-500 text-xs font-medium font-['Poppins'] leading-4">in
                            5
                            min</div>
                        </div>
                        <div class="px-2 py-[3px] bg-[#5549FF] rounded inline-flex justify-start items-center gap-1">
                          <div class="w-4 h-4 relative overflow-hidden">
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"
                              xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M10.9998 1L8.66645 3.33333M8.66645 3.33333L10.9998 5.66667M8.66645 3.33333H13.9998M6.8178 8.24205C6.01675 7.44099 5.38422 6.53523 4.92022 5.56882C4.88031 5.48569 4.86036 5.44413 4.84503 5.39154C4.79054 5.20463 4.82968 4.97513 4.94302 4.81684C4.97491 4.7723 5.01302 4.7342 5.08923 4.65799C5.3223 4.42492 5.43883 4.30838 5.51502 4.1912C5.80235 3.74927 5.80235 3.17955 5.51502 2.73762C5.43883 2.62044 5.3223 2.5039 5.08923 2.27083L4.95931 2.14092C4.60502 1.78662 4.42787 1.60947 4.23762 1.51324C3.85924 1.32186 3.4124 1.32186 3.03402 1.51324C2.84377 1.60947 2.66662 1.78662 2.31233 2.14092L2.20724 2.24601C1.85416 2.59909 1.67762 2.77563 1.54278 3.01565C1.39317 3.28199 1.2856 3.69565 1.2865 4.00113C1.28732 4.27643 1.34073 4.46458 1.44753 4.84087C2.02151 6.86314 3.10449 8.77138 4.69648 10.3634C6.28847 11.9554 8.19671 13.0383 10.219 13.6123C10.5953 13.7191 10.7834 13.7725 11.0587 13.7733C11.3642 13.7743 11.7779 13.6667 12.0442 13.5171C12.2842 13.3822 12.4608 13.2057 12.8138 12.8526L12.9189 12.7475C13.2732 12.3932 13.4504 12.2161 13.5466 12.0258C13.738 11.6474 13.738 11.2006 13.5466 10.8222C13.4504 10.632 13.2732 10.4548 12.9189 10.1005L12.789 9.97062C12.5559 9.73755 12.4394 9.62101 12.3222 9.54482C11.8803 9.25749 11.3106 9.2575 10.8687 9.54482C10.7515 9.62102 10.6349 9.73755 10.4019 9.97062C10.3257 10.0468 10.2875 10.0849 10.243 10.1168C10.0847 10.2302 9.85521 10.2693 9.66831 10.2148C9.61572 10.1995 9.57415 10.1795 9.49103 10.1396C8.52461 9.67562 7.61885 9.0431 6.8178 8.24205Z"
                                stroke="white" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                          </div>
                          <div class="justify-start text-white text-xs font-semibold font-['Poppins'] leading-4">
                            Join
                            Call</div>
                        </div>
                      </div>
                      <div class="w-4 h-4 relative overflow-hidden">
                        <svg width="4" height="12" viewBox="0 0 4 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M2.00004 6.6665C2.36823 6.6665 2.66671 6.36803 2.66671 5.99984C2.66671 5.63165 2.36823 5.33317 2.00004 5.33317C1.63185 5.33317 1.33337 5.63165 1.33337 5.99984C1.33337 6.36803 1.63185 6.6665 2.00004 6.6665Z"
                            stroke="#98A2B3" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
                          <path
                            d="M2.00004 1.99984C2.36823 1.99984 2.66671 1.70136 2.66671 1.33317C2.66671 0.964981 2.36823 0.666504 2.00004 0.666504C1.63185 0.666504 1.33337 0.964981 1.33337 1.33317C1.33337 1.70136 1.63185 1.99984 2.00004 1.99984Z"
                            stroke="#98A2B3" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
                          <path
                            d="M2.00004 11.3332C2.36823 11.3332 2.66671 11.0347 2.66671 10.6665C2.66671 10.2983 2.36823 9.99984 2.00004 9.99984C1.63185 9.99984 1.33337 10.2983 1.33337 10.6665C1.33337 11.0347 1.63185 11.3332 2.00004 11.3332Z"
                            stroke="#98A2B3" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div
                    class=" pr-1 bg-gradient-to-r from-gray-50/50 to-gray-50/20 rounded inline-flex  gap-1.5 overflow-hidden">
                    <div class="w-1  relative bg-indigo-600" />
                    <div class="flex-1 py-2 flex  gap-1.5">
                      <div class="w-14  justify-center text-slate-700 text-xs font-medium font-['Poppins'] leading-4">
                        9:40pm- 9:55pm</div>
                      <div class="flex-1 inline-flex flex-col  gap-1">
                        <div class=" justify-center text-indigo-600 text-sm font-semibold font-['Poppins'] leading-5">
                          Live Call</div>
                        <div class="inline-flex justify-start items-center gap-1">
                          <div class="w-5 h-5 relative">
                            <img class="w-5 h-5 left-[0.97px] top-[0.83px] absolute"
                              src="https://i.ibb.co/XZHymffZ/avatar-of-a-mango.png" />
                          </div>
                          <div class="justify-center text-gray-500 text-xs font-medium font-['Poppins'] leading-4">
                            Mangoes</div>
                        </div>
                      </div>
                      <div class="w-4 h-4 relative overflow-hidden">
                        <svg width="4" height="12" viewBox="0 0 4 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M2.00004 6.6665C2.36823 6.6665 2.66671 6.36803 2.66671 5.99984C2.66671 5.63165 2.36823 5.33317 2.00004 5.33317C1.63185 5.33317 1.33337 5.63165 1.33337 5.99984C1.33337 6.36803 1.63185 6.6665 2.00004 6.6665Z"
                            stroke="#98A2B3" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
                          <path
                            d="M2.00004 1.99984C2.36823 1.99984 2.66671 1.70136 2.66671 1.33317C2.66671 0.964981 2.36823 0.666504 2.00004 0.666504C1.63185 0.666504 1.33337 0.964981 1.33337 1.33317C1.33337 1.70136 1.63185 1.99984 2.00004 1.99984Z"
                            stroke="#98A2B3" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
                          <path
                            d="M2.00004 11.3332C2.36823 11.3332 2.66671 11.0347 2.66671 10.6665C2.66671 10.2983 2.36823 9.99984 2.00004 9.99984C1.63185 9.99984 1.33337 10.2983 1.33337 10.6665C1.33337 11.0347 1.63185 11.3332 2.00004 11.3332Z"
                            stroke="#98A2B3" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="w-full flex flex-col  gap-2">
                  <div
                    class=" pr-1 bg-gradient-to-r from-gray-50/50 to-gray-50/20 rounded inline-flex  gap-1.5 overflow-hidden">
                    <div class="w-1  relative bg-rose-600" />
                    <div class="flex-1 py-2 flex  gap-0.5">
                      <div class="w-14  justify-center text-slate-700 text-xs font-medium font-['Poppins'] leading-4">
                        9:40pm- 9:55pm</div>
                      <div class="flex-1 inline-flex flex-col  gap-1">
                        <div class=" justify-center text-rose-600 text-sm font-semibold font-['Poppins'] leading-5">
                          Group Call</div>
                        <div class="inline-flex justify-start items-center gap-1">
                          <div class="flex justify-start items-center">
                            <div class="w-5 h-5 relative shadow-[1px_0px_2px_0px_rgba(0,0,0,0.15)]">
                              <img class="w-5 h-5 left-[0.97px] top-[0.83px] absolute"
                                src="https://i.ibb.co/Y7qvLWpv/user-avatar-but-with-green-pear-face-as-head-pink-background-1.png" />
                            </div>
                            <div class="w-5 h-5 relative shadow-[1px_0px_2px_0px_rgba(0,0,0,0.15)]">
                              <img class="w-5 h-5 left-[0.97px] top-[0.83px] absolute"
                                src="https://i.ibb.co/XZHymffZ/avatar-of-a-mango.png" />
                            </div>
                            <div class="w-5 h-5 relative shadow-[1px_0px_2px_0px_rgba(0,0,0,0.15)]">
                              <img class="w-5 h-5 left-[0.97px] top-[0.83px] absolute"
                                src="https://i.ibb.co/0VQJ0swt/Vector.png" />
                            </div>
                          </div>
                          <div class="justify-center text-gray-500 text-xs font-medium font-['Poppins'] leading-4">
                            Mangoes, Apples and 30+</div>
                        </div>
                      </div>
                      <div class="w-4 h-4 relative overflow-hidden">
                        <svg width="4" height="12" viewBox="0 0 4 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M2.00004 6.6665C2.36823 6.6665 2.66671 6.36803 2.66671 5.99984C2.66671 5.63165 2.36823 5.33317 2.00004 5.33317C1.63185 5.33317 1.33337 5.63165 1.33337 5.99984C1.33337 6.36803 1.63185 6.6665 2.00004 6.6665Z"
                            stroke="#98A2B3" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
                          <path
                            d="M2.00004 1.99984C2.36823 1.99984 2.66671 1.70136 2.66671 1.33317C2.66671 0.964981 2.36823 0.666504 2.00004 0.666504C1.63185 0.666504 1.33337 0.964981 1.33337 1.33317C1.33337 1.70136 1.63185 1.99984 2.00004 1.99984Z"
                            stroke="#98A2B3" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
                          <path
                            d="M2.00004 11.3332C2.36823 11.3332 2.66671 11.0347 2.66671 10.6665C2.66671 10.2983 2.36823 9.99984 2.00004 9.99984C1.63185 9.99984 1.33337 10.2983 1.33337 10.6665C1.33337 11.0347 1.63185 11.3332 2.00004 11.3332Z"
                            stroke="#98A2B3" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div
                    class=" pr-1 bg-gradient-to-r from-gray-50/50 to-gray-50/20 rounded inline-flex  gap-1.5 overflow-hidden">
                    <div class="w-1  relative bg-indigo-600" />
                    <div class="flex-1 py-2 flex  gap-1.5">
                      <div class="w-14  justify-center text-slate-700 text-xs font-medium font-['Poppins'] leading-4">
                        9:40pm- 9:55pm</div>
                      <div class="flex-1 inline-flex flex-col  gap-1">
                        <div class=" justify-center text-indigo-600 text-sm font-semibold font-['Poppins'] leading-5">
                          Live Call</div>
                        <div class="inline-flex justify-start items-center gap-1">
                          <div class="w-5 h-5 relative">
                            <img class="w-5 h-5 left-[0.97px] top-[0.83px] absolute"
                              src="https://i.ibb.co/XZHymffZ/avatar-of-a-mango.png" />
                          </div>
                          <div class="justify-center text-gray-500 text-xs font-medium font-['Poppins'] leading-4">
                            Mangoes</div>
                        </div>
                      </div>
                      <div class="w-4 h-4 relative overflow-hidden">
                        <svg width="4" height="12" viewBox="0 0 4 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M2.00004 6.6665C2.36823 6.6665 2.66671 6.36803 2.66671 5.99984C2.66671 5.63165 2.36823 5.33317 2.00004 5.33317C1.63185 5.33317 1.33337 5.63165 1.33337 5.99984C1.33337 6.36803 1.63185 6.6665 2.00004 6.6665Z"
                            stroke="#98A2B3" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
                          <path
                            d="M2.00004 1.99984C2.36823 1.99984 2.66671 1.70136 2.66671 1.33317C2.66671 0.964981 2.36823 0.666504 2.00004 0.666504C1.63185 0.666504 1.33337 0.964981 1.33337 1.33317C1.33337 1.70136 1.63185 1.99984 2.00004 1.99984Z"
                            stroke="#98A2B3" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
                          <path
                            d="M2.00004 11.3332C2.36823 11.3332 2.66671 11.0347 2.66671 10.6665C2.66671 10.2983 2.36823 9.99984 2.00004 9.99984C1.63185 9.99984 1.33337 10.2983 1.33337 10.6665C1.33337 11.0347 1.63185 11.3332 2.00004 11.3332Z"
                            stroke="#98A2B3" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- popups -->
    <PopupHandler v-model="calendarPopupOpen" :config="calendarPopupConfig">
      <CalendarMobilePopupContent :view="view" :events-data="eventsData" @set-view="setView" @join-click="handleJoin"
        @reply-click="handleReply" @open-new-events="newEventsPopupOpen = true" />
    </PopupHandler>

    <PopupHandler v-model="newEventsPopupOpen" :config="newEventsPopupConfig">
      <NewEventsPopup />
    </PopupHandler>

    <PopupHandler v-model="eventDetailsPopupOpen" :config="eventDetailsPopupConfig">
      <CalendarEventDetailsPopup :event="selectedEvent" />
    </PopupHandler>

    <PopupHandler v-model="isDatePopupOpen" :config="datePopupConfig">
      <MobileDateSelector :current-date="cursor" @update:date="handleDateUpdate" @close="isDatePopupOpen = false" />
    </PopupHandler>


  </section>


</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { SOD, addDays, addMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, timeToMinutes, overlaps, monthNames } from '@/utils/calendarHelpers.js';
import CheckboxGroup from '../ui/form/checkbox/CheckboxGroup.vue';
import { onUnmounted } from 'vue';
import EventDropdownContent from './EventDropdownContent.vue';
import PopupHandler from '../ui/popup/PopupHandler.vue';
import EventsWidget from './EventsWidget.vue';
import ButtonComponent from '../dev/button/ButtonComponent.vue';
import NewEventsPopup from './NewEventsPopup.vue';
import CalendarMobilePopupContent from './CalendarMobilePopupContent.vue';
import CalendarEventDetailsPopup from './CalendarEventDetailsPopup.vue';
import MobileDateSelector from './MobileDateSelector.vue';

import MiniCalendar from './MiniCalendar.vue';

const props = defineProps({
  variant: { type: String, default: 'default' },
  focusDate: { type: Date, required: true },
  initialView: { type: String, default: 'week' },
  events: { type: Array, default: () => [] },
  theme: { type: Object, default: () => ({}) },
  dataAttrs: { type: Object, default: () => ({}) },
  consoleOverlaps: { type: Boolean, default: true },
  highlightTodayColumn: { type: Boolean, default: false },
  timeStart: { type: String, default: '05:00' },
  timeEnd: { type: String, default: '23:00' },
  slotMinutes: { type: Number, default: 60 },
  rowHeightPx: { type: Number, default: 64 },
  minEventHeightPx: { type: Number, default: 0 }
});

const emit = defineEmits(['date-selected', 'update:focus-date', 'preview-schedule']);
const today = ref(SOD(new Date()));
const width = ref(window.innerWidth);
const cursor = ref(new Date(props.focusDate));
const view = ref(props.initialView);
const nowTimer = ref(null);
const nowY = ref(0);
// State for dropdown
const isDropdownOpen = ref(false);
const dropdownContainer = ref(null);
const showSchedule = ref(false); // Checkbox state
const calendarPopupOpen = ref(false);
const newEventsPopupOpen = ref(false);
const eventDetailsPopupOpen = ref(false);
const selectedEvent = ref({});
const isMobileCalendarOpen = ref(false);
const isDatePopupOpen = ref(false); // New state for Date Popup
const expandedDate = ref(null);
const mobileCalendarRef = ref(null);

const handleMobileCalendarClickOutside = (event) => {
  if (
    isMobileCalendarOpen.value &&
    mobileCalendarRef.value &&
    !mobileCalendarRef.value.contains(event.target) &&
    // Check if the click was on the toggle button itself (to avoid immediate re-opening)
    !event.target.closest('.cursor-pointer.flex.lg\\:hidden')
  ) {
    isMobileCalendarOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleMobileCalendarClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleMobileCalendarClickOutside);
});


const toggleMobileCalendar = () => {
  isMobileCalendarOpen.value = !isMobileCalendarOpen.value;
};


// Divider for Month Rows (7 days each)
const monthRows = computed(() => {
  const result = [];
  const allDays = days.value;
  for (let i = 0; i < allDays.length; i += 7) {
    result.push(allDays.slice(i, i + 7));
  }
  return result;
});

const handleMonthDateClick = (d) => {
  // Check if it's a large screen (lg breakpoint is usually 1024px)
  if (window.innerWidth >= 1024) return;

  const dayEvents = eventsForDay(d);

  if (dayEvents.length > 0) {
    if (expandedDate.value && sameDay(d, expandedDate.value)) {
      expandedDate.value = null;
    } else {
      expandedDate.value = new Date(d);
    }
  } else {
    expandedDate.value = null;
  }
  emitDate(d);
};



const isRowExpanded = (row) => {
  if (!expandedDate.value) return false;
  return row.some(d => sameDay(d, expandedDate.value));
};

const calendarPopupConfig = {
  actionType: "slidein",
  from: "right",
  offset: "0px",
  speed: "250ms",
  effect: "ease-in-out",
  showOverlay: true,
  closeOnOutside: true,
  lockScroll: true,
  escToClose: true,
  width: { default: "384px", "<500": "90%" },
  height: { default: "100%", "<768": "100%" },
  scrollable: true,
  closeSpeed: "250ms",
  closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
};

const newEventsPopupConfig = {
  actionType: "slidein",
  from: "right",
  offset: "0px",
  verticalAlign: "bottom",
  width: { default: "384px" },
  height: { default: "auto" },
  speed: "300ms",
  effect: "ease-in-out",
  showOverlay: false,
  closeOnOutside: true,
  lockScroll: false,
};

const eventDetailsPopupConfig = {
  actionType: "popup",
  position: "center",
  customEffect: "scale",
  offset: "0px",
  speed: "250ms",
  effect: "ease-in-out",
  showOverlay: true,
  closeOnOutside: true,
  lockScroll: true,
  escToClose: true,
  width: { default: "auto", "<480": "90%" },
  height: "auto",
  scrollable: false,
  closeSpeed: "250ms",
  closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
};

const datePopupConfig = {
  actionType: "slidein",
  from: "top",
  offset: "65px", // Height of header
  verticalAlign: "top", // Opens from top
  width: { default: "100%" },
  height: { default: "auto" }, // Let component define height
  speed: "300ms",
  effect: "ease-in-out",
  showOverlay: false,
  closeOnOutside: true,
  lockScroll: true,
};

const handleDateUpdate = (newDate) => {
  cursor.value = newDate;
  emit('date-selected', newDate);
  // Also emit update:focus-date if user expects v-model behavior
  emit('update:focus-date', newDate);
  isDatePopupOpen.value = false;
  isMobileCalendarOpen.value = false; // Close parent popup too if desired? User said "neeche jo calendar ha wahan bh date chng honic chyh"
};

const eventsData = ref([
  {
    title: 'TODAY',
    items: [
      {
        time: '2:15pm-9:30pm',
        title: 'Live call',
        titleColorClass: 'text-lightViolet',
        borderClass: 'bg-lightViolet',
        bgClass: 'bg-white',
        showJoin: true,
        statusText: 'in 5 min',
        // WORKING IMAGE URL
        avatars: [{ src: 'https://i.ibb.co/0VQJ0swt/Vector.png', name: 'Apples' }]
      },
      {
        time: '2:15pm-9:30pm',
        title: 'Live call',
        titleColorClass: 'text-lightViolet',
        borderClass: 'bg-lightViolet',
        bgClass: 'bg-gradient-to-r from-gray-50/50 to-gray-50/20',
        showJoin: false,
        // WORKING IMAGE URL
        avatars: [{ src: 'https://i.ibb.co/XZHymffZ/avatar-of-a-mango.png', name: 'Mangoes' }]
      }
    ]
  },
  {
    title: 'THIS WEEK',
    items: [
      {
        dayName: 'TUE',
        dayNumber: '24',
        title: 'Group call',
        titleColorClass: 'text-activePink',
        borderClass: 'bg-brightPink',
        bgClass: 'bg-gradient-to-r from-gray-50/50 to-gray-50/20',
        isGroup: true,
        groupText: 'Mangoes, Apples and 30+',
        avatars: [
          { src: 'https://i.ibb.co/Y7qvLWpv/user-avatar-but-with-green-pear-face-as-head-pink-background-1.png' },
          { src: 'https://i.ibb.co/XZHymffZ/avatar-of-a-mango.png' },
          { src: 'https://i.ibb.co/0VQJ0swt/Vector.png' }
        ]
      },
      {
        dayName: 'WED',
        dayNumber: '25',
        title: 'Live call',
        titleColorClass: 'text-lightViolet',
        borderClass: 'bg-lightViolet',
        bgClass: 'bg-gradient-to-r from-gray-50/50 to-gray-50/20',
        avatars: [{ src: 'https://i.ibb.co/XZHymffZ/avatar-of-a-mango.png', name: 'Mangoes' }]
      }
    ]
  },
  {
    title: 'PENDING EVENTS',
    items: [
      {
        dayName: 'WED',
        dayNumber: '25',
        title: 'Live call',
        titleColorClass: 'text-gray-900',
        borderClass: 'bg-customDarkGrey',
        bgClass: 'bg-gradient-to-r from-gray-50/50 to-gray-50/20',
        showReply: true,
        avatars: [{ src: 'https://i.ibb.co/0VQJ0swt/Vector.png', name: 'Apples' }]
      },
      {
        dayName: 'SAT',
        dayNumber: '28',
        title: 'Live call',
        titleColorClass: 'text-gray-900',
        borderClass: 'bg-customDarkGrey',
        bgClass: 'bg-gradient-to-r from-gray-50/50 to-gray-50/40',
        showReply: true,
        avatars: [{ src: 'https://i.ibb.co/Y7qvLWpv/user-avatar-but-with-green-pear-face-as-head-pink-background-1.png', name: 'Grapes' }]
      }
    ]
  }
]);

const effectiveView = computed(() => {
  if (props.variant === 'theme2') return 'week';
  // if (width.value < 640) return 'day';
  // if (width.value < 1024 && view.value === 'month') return 'week';
  return view.value;
});

const range = computed(() => {
  const sMin = timeToMinutes(props.timeStart);
  const eMin = timeToMinutes(props.timeEnd);
  const step = props.slotMinutes;
  const minutesTotal = Math.max(1, eMin - sMin);
  const rowCount = Math.floor(minutesTotal / step);
  const labels = Array.from({ length: rowCount + 1 }, (_, i) => {
    const mins = sMin + i * step;
    let h = Math.floor(mins / 60);
    let m = mins % 60;
    const ampm = h >= 12 ? 'pm' : 'am';
    let hour12 = h % 12;
    if (hour12 === 0) hour12 = 12;
    return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
  });
  return { sMin, eMin, step, minutesTotal, rowCount, labels };
});

const weekDays = computed(() => {
  const s = startOfWeek(cursor.value);
  return Array.from({ length: 7 }, (_, i) => addDays(s, i));
});

const days = computed(() => {
  if (effectiveView.value === 'month') {
    const start = startOfWeek(startOfMonth(cursor.value));
    const end = endOfWeek(endOfMonth(cursor.value));
    const arr = []; for (let x = new Date(start); x <= end; x = addDays(x, 1)) arr.push(new Date(x));
    return arr;
  }
  return effectiveView.value === 'day' ? [cursor.value] : weekDays.value;
});

// CHANGE 4: Refined Normalized Logic for JSON Handling
// The .map function with `new Date(ev.start)` automatically handles ISO strings.
// Added a filter check to ensure ev.start/ev.end exist before processing to prevent crashes on bad JSON.
const normalized = computed(() => {
  let evs = props.events || [];

  if (props.variant === 'theme2') {
    evs = evs.filter(ev => {
      if (ev.slot === 'custom') return true;
      if (showSchedule.value) return true;
      return false;
    });
  }

  return evs
    .filter(ev => ev && ev.start && ev.end)
    .map(ev => ({
      ...ev,
      start: new Date(ev.start), // Works for Date Object OR JSON String
      end: new Date(ev.end),     // Works for Date Object OR JSON String
      dataAttrs: ev.dataAttrs || {},
      slot: ev.slot || null
    }));
});

const title = computed(() => {
  const d = cursor.value, y = d.getFullYear(), m = d.getMonth();
  if (effectiveView.value === 'week') return `${monthNames[m]} ${y}`;
  if (effectiveView.value === 'month') return `${monthNames[m]} ${y}`;
  return `${monthNames[m]} ${d.getDate()}, ${y}`;
});

watch(() => props.focusDate, (v) => { if (v) { cursor.value = new Date(v); } });

function formatTime(time) {
  const [hour, rest] = time.split(':');
  const period = rest.split(' ')[1];
  return `${hour}${period}`;
}

const sd = (d) => SOD(d);
const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const isNowLabel = (label) => {
  const now = new Date();
  if (!sameDay(cursor.value, SOD(now))) return false;
  if (typeof label !== 'string') return false;
  const match = label.match(/^(\d{1,2}):(\d{2})\s?(am|pm)$/i);
  if (!match) return false;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ampm = match[3].toLowerCase();
  if (ampm === 'pm' && h !== 12) h += 12;
  if (ampm === 'am' && h === 12) h = 0;
  const labelMinutes = h * 60 + m;
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= labelMinutes && cur < labelMinutes + props.slotMinutes;
};
const emitDate = (d) => { if (!d) return; emit('date-selected', new Date(d)); };
const dispatchEventClick = (event) => {
  // console.log('Event clicked:', event);
  // document.dispatchEvent(new CustomEvent('calendar:event-click', { detail: { event } }));
  selectedEvent.value = event;
  eventDetailsPopupOpen.value = true;
};
const eventsForDay = (day) => {
  const s = SOD(day), e = addDays(s, 1);
  return normalized.value.filter(ev => ev.start < e && ev.end > s).sort((a, b) => a.start - b.start);
};
const styleBlock = (ev) => {
  const { sMin, eMin, step } = range.value;
  const startMin = ev.start.getHours() * 60 + ev.start.getMinutes();
  const endMin = ev.end.getHours() * 60 + ev.end.getMinutes();
  const clippedStart = Math.max(startMin, sMin);
  const clippedEnd = Math.min(endMin, eMin);
  if (clippedEnd <= clippedStart) return 'display:none';
  const rowsFromTop = (clippedStart - sMin) / step;
  const rowsHeight = (clippedEnd - clippedStart) / step;
  const topPx = rowsFromTop * props.rowHeightPx;
  const heightPx = Math.max(props.minEventHeightPx, rowsHeight * props.rowHeightPx);
  return `top:${topPx}px;height:${heightPx}px;left:2px;right:2px;`;
};
const setView = (v) => { view.value = v; };
const shift = (n) => {
  const v = effectiveView.value;
  if (v === 'month') {
    cursor.value = addMonths(cursor.value, n);
  } else {
    cursor.value = addDays(cursor.value, n * 7);
  }
  // NEW: Emit the updated date so Mini Calendar can sync
  emit('date-selected', new Date(cursor.value));
};

const goToday = () => {
  cursor.value = new Date();
  emit('date-selected', new Date(cursor.value)); // Sync on Today click
};
const updateNowLine = () => {
  const { sMin, eMin } = range.value;
  const now = new Date();
  if (!sameDay(cursor.value, SOD(now))) { nowY.value = 0; return; }
  const cur = now.getHours() * 60 + now.getMinutes();
  const pct = ((cur - sMin) / Math.max(1, (eMin - sMin))) * 100;
  nowY.value = Math.min(100, Math.max(0, pct));
};
const handleResize = () => { width.value = window.innerWidth; };

// Toggle function
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

// Close dropdown if clicked outside
const handleClickOutside = (event) => {
  if (dropdownContainer.value && !dropdownContainer.value.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', handleResize);
  nowTimer.value = setInterval(updateNowLine, 60000);
  updateNowLine();
});
// Resize listener taake agar koi window khuli rakh kar screen bari kare toh section band ho jaye
onMounted(() => {
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
      expandedDate.value = null;
    }
  });
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  clearInterval(nowTimer.value);
});
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>