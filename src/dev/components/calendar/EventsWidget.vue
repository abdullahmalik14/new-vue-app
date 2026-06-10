<template>
  <section class="flex flex-col gap-[1rem]">
    
    <div v-for="(section, sIndex) in sections" :key="sIndex" class="flex flex-col gap-[0.5rem] w-full">
      
      <h3 class="text-[0.75rem] text-gray-500 leading-[1.125rem] font-semibold uppercase">
        {{ section.title }}
      </h3>

      <section 
        v-for="(event, eIndex) in section.items" 
        :key="eIndex"
        class="relative flex h-[4.125rem] pr-[0.25rem] justify-end rounded-[0.25rem] shadow-purple-glow"
        :class="event.bgClass || 'bg-customGrey'"
      >
        <div 
          class="absolute w-[0.25rem] left-[0] h-full rounded-l-[0.25rem]"
          :class="event.borderClass"
        ></div>

        <section class="flex gap-[0.25rem] h-[4.125rem] px-[0.5rem] py-[0.5rem] w-full">
          
          <span v-if="event.time" class="flex items-center justify-center w-[3.4375rem] h-auto shrink-0">
            <p class="text-[0.6875rem] text-gray-700 font-medium leading-[1rem]">{{ event.time }}</p>
          </span>
          
          <span v-else class="flex flex-col justify-center w-[3.4375rem] h-auto shrink-0">
             <p class="text-[0.75rem] text-gray-700 font-semibold leading-[1.125rem] uppercase">{{ event.dayName }}</p>
             <p class="text-[1.125rem] text-gray-700 font-semibold leading-[1.75rem]">{{ event.dayNumber }}</p>
          </span>

          <span class="flex flex-col gap-[0.25rem] h-auto flex-1 min-w-0"> 
            
            <h3 class="text-[0.875rem] font-semibold leading-[1.25rem] truncate pr-1" :class="event.titleColorClass">
              {{ event.title }}
            </h3>

            <span class="flex" >
              
              <template v-if="!event.isGroup">
                <img 
                  class="z-[30] w-5 h-5 object-cover object-center mask-mango shrink-0"
                  :src="event.avatars[0].src"
                  alt="Avatar"
                />
                <p class="text-[0.6875rem]  text-gray-500 font-medium leading-[1.125rem] ml-1 truncate">
                  {{ event.avatars[0].name }}
                </p>
              </template>

              <template v-else>
                <div class="flex">

                    <span class="flex -space-x-[.8rem]">

                        <div 
                        v-for="(av, i) in event.avatars" 
                        :key="i"
                        class="w-[1rem] h-[1rem] rounded bg-cover bg-center mask-mango shrink-0 border border-white"
                        :class="`z-[${30 - (i*10)}]`" 
                        :style="{ backgroundImage: `url(${av.src})` }"
                        ></div>
                    </span>

                    <p v-if="event.isGroup" class="text-[0.6875rem]  text-gray-500 font-medium leading-[1.125rem] mt-[-2px] truncate">
                       {{ event.groupText }}
                    </p>
                </div>
              </template>
            </span>
            
          </span>

          <div class="flex  gap-[0.25rem] shrink-0">
            
            <div v-if="event.showJoin" class="flex flex-col items-end justify-between w-[5.4375rem]">
              <span class="flex items-center gap-[0.25rem]">
                <div class="bg-lightViolet w-[0.375rem] h-[0.375rem] rounded-[50%]"></div>
                <p class="text-[0.75rem] text-gray-500 font-medium leading-[1.125rem]">{{ event.statusText }}</p>
              </span>

              <button 
                @click="$emit('join-click', event)" 
                class="flex items-center outline-none justify-between w-full px-2 py-[3px] h-[1.5rem] gap-[0.25rem] rounded-[0.25rem] bg-lightViolet hover:bg-lightViolet/90 transition-colors"
              >
                <span class="w-[1rem] h-[1rem]">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.9998 1L8.66645 3.33333M8.66645 3.33333L10.9998 5.66667M8.66645 3.33333H13.9998M6.8178 8.24205C6.01675 7.44099 5.38422 6.53523 4.92022 5.56882C4.88031 5.48569 4.86036 5.44413 4.84503 5.39154C4.79054 5.20463 4.82968 4.97513 4.94302 4.81684C4.97491 4.7723 5.01302 4.7342 5.08923 4.65799C5.3223 4.42492 5.43883 4.30838 5.51502 4.1912C5.80235 3.74927 5.80235 3.17955 5.51502 2.73762C5.43883 2.62044 5.3223 2.5039 5.08923 2.27083L4.95931 2.14092C4.60502 1.78662 4.42787 1.60947 4.23762 1.51324C3.85924 1.32186 3.4124 1.32186 3.03402 1.51324C2.84377 1.60947 2.66662 1.78662 2.31233 2.14092L2.20724 2.24601C1.85416 2.59909 1.67762 2.77563 1.54278 3.01565C1.39317 3.28199 1.2856 3.69565 1.2865 4.00113C1.28732 4.27643 1.34073 4.46458 1.44753 4.84087C2.02151 6.86314 3.10449 8.77138 4.69648 10.3634C6.28847 11.9554 8.19671 13.0383 10.219 13.6123C10.5953 13.7191 10.7834 13.7725 11.0587 13.7733C11.3642 13.7743 11.7779 13.6667 12.0442 13.5171C12.2842 13.3822 12.4608 13.2057 12.8138 12.8526L12.9189 12.7475C13.2732 12.3932 13.4504 12.2161 13.5466 12.0258C13.738 11.6474 13.738 11.2006 13.5466 10.8222C13.4504 10.632 13.2732 10.4548 12.9189 10.1005L12.789 9.97062C12.5559 9.73755 12.4394 9.62101 12.3222 9.54482C11.8803 9.25749 11.3106 9.2575 10.8687 9.54482C10.7515 9.62102 10.6349 9.73755 10.4019 9.97062C10.3257 10.0468 10.2875 10.0849 10.243 10.1168C10.0847 10.2302 9.85521 10.2693 9.66831 10.2148C9.61572 10.1995 9.57415 10.1795 9.49103 10.1396C8.52461 9.67562 7.61885 9.0431 6.8178 8.24205Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                <p class="text-[0.75rem] text-white font-semibold leading-[1.125rem]">Join call</p>
              </button>
            </div>

            <span v-else-if="event.showReply" class="flex flex-col justify-end h-[2.875rem]">
              <button 
                @click="$emit('reply-click', event)"
                class="text-[0.75rem] text-gray-500 leading-[1.125rem] font-semibold px-[0.5rem] py-[0.1875rem] border border-gray-500 rounded-[0.25rem] hover:bg-gray-50"
              >
                REPLY
              </button>
            </span>
            
            <span class="flex items-center justify-center w-[1rem] h-[1rem]">
              <svg width="4" height="12" viewBox="0 0 4 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.00004 6.6665C2.36823 6.6665 2.66671 6.36803 2.66671 5.99984C2.66671 5.63165 2.36823 5.33317 2.00004 5.33317C1.63185 5.33317 1.33337 5.63165 1.33337 5.99984C1.33337 6.36803 1.63185 6.6665 2.00004 6.6665Z" stroke="#98A2B3" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2.00004 1.99984C2.36823 1.99984 2.66671 1.70136 2.66671 1.33317C2.66671 0.964981 2.36823 0.666504 2.00004 0.666504C1.63185 0.666504 1.33337 0.964981 1.33337 1.33317C1.33337 1.70136 1.63185 1.99984 2.00004 1.99984Z" stroke="#98A2B3" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2.00004 11.3332C2.36823 11.3332 2.66671 11.0347 2.66671 10.6665C2.66671 10.2983 2.36823 9.99984 2.00004 9.99984C1.63185 9.99984 1.33337 10.2983 1.33337 10.6665C1.33337 11.0347 1.63185 11.3332 2.00004 11.3332Z" stroke="#98A2B3" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </div>

        </section>
      </section>
    </div>
  </section>
</template>

<script setup>
defineProps({
  sections: {
    type: Array,
    default: () => []
  }
});
defineEmits(['join-click', 'reply-click']);
</script>