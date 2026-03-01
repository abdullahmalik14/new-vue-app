<script setup>
import { computed } from 'vue';

const props = defineProps({
  theme: {
    type: String,
    default: 'orange', // 'orange' or 'pink'
    validator: (value) => ['orange', 'pink'].includes(value)
  },
  hasButton: {
    type: Boolean,
    default: true // true = Button wala card, false = Progress wala card
  }
});

// Helper to identify ONLY the 4th card (Pink + No Button)
const isCard4 = computed(() => props.theme === 'pink' && !props.hasButton);

const styles = computed(() => {
  const isOrange = props.theme === 'orange';
  
  // 1. Shadow Logic  
  const shadow = isOrange 
    ? 'shadow-[0px_-18px_32px_0px_#FF510080]' 
    : 'shadow-[0px_-18px_32px_0px_#FF6D9180]';

  // 2. Outer Background Logic
  // Card 1, 2 (Orange) -> Orange Gradient
  // Card 3 (Pink + Button) -> Pink Gradient
  // Card 4 (Pink + No Button) -> Dark Base Color (bg-[rgba(255,0,102,0.2)])
  let outerBg;
  if (isOrange) {
    outerBg = 'bg-[linear-gradient(325.69deg,rgba(255,159,41,0.75)_20.45%,rgba(255,159,41,0.75)_67.31%)]';
  } else if (props.hasButton) {
    outerBg = 'bg-[linear-gradient(180deg,_rgba(255,255,255,0)_50%,_rgba(255,255,255,0.8)_100%),linear-gradient(323.52deg,_rgba(251,4,100,0.6)_20.2%,_rgba(248,74,167,0.6)_79.7%)]';
  } else {
    // This is specifically for Card 4
    outerBg = 'bg-[rgba(255,0,102,0.2)]';
  }

  // 3. Inner Background Logic (The Dark Overlay)
  // Sirf Card 4 mein ye dark overlay aayega, baaki sab transparent rahenge
  const innerBg = isCard4.value
    ? 'bg-[linear-gradient(rgba(0,0,0,0.175)_50%,_rgba(0,0,0,0.7)_100%)] backdrop-blur-[12.5px]'
    : ''; // Baaki cards ke liye koi extra bg nahi

  return {
    shadow,
    outerBg,
    innerBg,
    // Content Styles
    catImage: 'https://i.ibb.co.com/VYP1JChT/lucky-draw-cat.webp',
    catShadow: isOrange
      ? 'drop-shadow-[2px_3px_32px_0px_#FFF7A34D]'
      : 'filter drop-shadow-[-6px_7px_32px_#0425FB80] drop-shadow-[6px_3px_32px_#FB046480]',
    title: isOrange ? 'Subscriber Discount' : 'Lucky Draw!',
    
    // Progress Bar Colors
    progressBg: 'bg-[#FFED29]', // Sabmein yellow hi use hua hai progress ke liye
    progressText: '#FFED29', // Text color yellow
    
    // Button Styles
    buttonBg: isOrange ? 'bg-[#FFED29]' : 'bg-[#FB0464]',
    buttonText: isOrange ? 'text-black' : 'text-white',
    clipPathClass: isOrange ? 'bg-[#FFED29]' : 'bg-[#FB0464]'
  };
});
</script>

<template>
  <div class="flex justify-center items-center ">
    <div class="flex flex-col justify-end items-end w-[21.5625rem] h-[28.75rem] rounded-3xl bg-[url('https://i.ibb.co.com/70sHrpv/featured-media-bg.webp')] bg-cover bg-center relative overflow-hidden lg:w-[23.4375rem] lg:h-[31.25rem]">
      
      <button class="absolute top-3 right-3 w-6 h-6 flex justify-center items-center opacity-70 drop-shadow-[0px_0px_6px_#00000080] bg-transparent outline-none border-none z-10">
        <img src="https://i.ibb.co.com/bMbk5v87/x-close.webp" alt="x-close" class="w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(99%)_sepia(100%)_saturate(2%)_hue-rotate(25deg)_brightness(104%)_contrast(100%)]">
      </button>

      <div class="absolute inset-0 h-[17.625rem] bg-[url('https://i.ibb.co.com/70sHrpv/featured-media-bg.webp')] bg-cover bg-center z-0 lg:h-[20.125rem]">
        <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black"></div>
      </div>

      <div :class="['flex flex-col w-full z-[1] relative rounded-t-3xl', styles.shadow]">
        
        <div :class="['flex flex-col justify-end backdrop-blur-[12.5px] rounded-t-3xl', styles.outerBg]">
            
            <div :class="['flex flex-col justify-end w-full rounded-t-3xl', styles.innerBg]">
                
                <div class="absolute left-0 -top-4 w-full flex items-end gap-4 px-3 z-[1]">
                    <img :src="styles.catImage" alt="lucky-draw-cat" :class="['w-[6.91rem] h-[7.25rem]', styles.catShadow]">
                    
                    <div :class="['flex flex-col py-4', props.theme === 'pink' ? 'drop-shadow-[0px_-2px_16px_#FB0464]' : 'drop-shadow-[0px_4px_8px_#00000059]']">
                        <h1 class="text-2xl font-semibold text-white">{{ styles.title }}</h1>
                        <div class="flex items-center gap-1">
                            <span class="text-base font-medium truncate text-[#F2F4F7]">Princess Carrot Pop</span>
                            <img src="https://i.ibb.co.com/nMhY8CpS/svgviewer-png-output-22.webp" alt="verified-tick" class="h-2.5"/>
                        </div>
                    </div>
                </div>

                <div :class="['flex flex-col gap-4 pt-[6.75rem] px-4 lg:px-6 z-[1]', props.hasButton ? 'pb-3' : 'pb-6']">
                    
                    <div v-if="!props.hasButton" class="flex flex-col justify-end gap-3 min-h-[5.3rem]">
                        <div class="flex flex-col gap-[0.4375rem] drop-shadow-[0px_2px_8px_#00000040]">
                            <div class="w-full h-[0.3125rem] rounded-[0.3125rem] bg-white/20 dark:bg-[#181a1b33]">
                                <div :class="['w-[50%] h-full rounded-[0.3125rem] dark:bg-[#ffee37]', styles.progressBg]"></div>
                            </div>

                            <div class="flex justify-between gap-1">
                                <div class="flex items-center gap-1">
                                    <span class="text-sm font-medium" :style="{ color: styles.progressText }">
                                        Spend $200 more to {{ props.theme === 'orange' ? 'claim' : 'enter' }}
                                    </span>
                                    
                                    <span class="flex items-center justify-center">
                                      <div class="relative inline-flex overflow-hidden cursor-pointer group hover:overflow-visible">
                                          <img src="https://i.ibb.co/DPgMH5GG/svgviewer-png-output-15.webp" alt="tooltip icon" class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(90%)_sepia(99%)_saturate(973%)_hue-rotate(331deg)_brightness(108%)_contrast(101%)]">
                                          </div>
                                    </span>
                                </div>
                                <span class="text-xs leading-normal font-medium text-white">200/ USD400</span>
                            </div>
                        </div>

                         <div class="flex flex-col gap-[0.4375rem] drop-shadow-[0px_2px_8px_#00000040]">
                            <div class="w-full h-[0.3125rem] rounded-[0.3125rem] bg-white/20">
                                <div :class="['h-full rounded-[0.3125rem]', styles.progressBg, props.theme === 'orange' ? 'w-[19%]' : 'w-[5%]']"></div>
                            </div>
                            <div class="flex justify-between gap-1">
                                <span class="text-sm font-medium" :style="{ color: styles.progressText }">
                                    {{ props.theme === 'orange' ? '10 offers left!' : '5 chances left!' }}
                                </span>
                                <span class="text-xs leading-normal font-medium text-white">95/100 {{ props.theme === 'orange' ? '' : 'Offer' }}</span>
                            </div>
                        </div>
                    </div>

                    <div v-if="props.hasButton" class="flex flex-col gap-[0.4375rem] drop-shadow-[0px_2px_8px_#00000040]">
                        <div class="w-full h-[0.3125rem] rounded-[0.3125rem] bg-white/20">
                            <div :class="['h-full rounded-[0.3125rem]', styles.progressBg, props.theme === 'orange' ? 'w-[19%]' : 'w-[5%]']"></div>
                        </div>
                        <div class="flex justify-between gap-1">
                            <span class="text-sm font-medium" :style="{ color: styles.progressText }">
                                {{ props.theme === 'orange' ? '10 offers left!' : '5 chances left!' }}
                            </span>
                            <span class="text-xs leading-normal font-medium text-white">95/100 {{ props.theme === 'orange' ? '' : 'Offer' }}</span>
                        </div>
                    </div>

                    <div class="flex justify-center items-center gap-2">
                        <span class="text-sm leading-[1.125rem] text-white">Ends in</span>
                        <div class="flex items-center gap-0.5">
                            <div class="flex justify-center items-center w-8 h-7 rounded bg-[#0C111D]">
                                <span class="text-xl font-semibold text-white">02</span>
                            </div>
                            <span class="text-xl font-bold text-[#0C111D]">:</span>
                            <div class="flex justify-center items-center w-8 h-7 rounded bg-[#0C111D]">
                                <span class="text-xl font-semibold text-white">13</span>
                            </div>
                            <span class="text-xl font-bold text-[#0C111D]">:</span>
                            <div class="flex justify-center items-center w-8 h-7 rounded bg-[#0C111D]">
                                <span class="text-xl font-semibold text-white">07</span>
                            </div>
                        </div>
                    </div>
                </div>

                <button v-if="props.hasButton" class="flex justify-center items-center w-full min-h-[4.125rem] bg-black relative">
                    <div :class="['absolute right-0 w-[calc(100%-2.5rem)] h-full [clip-path:polygon(100%_0%,100%_100%,10px_100%,18px_50%,0%_50%,12px_0%)] pointer-events-none', styles.clipPathClass]"></div>
                    <span :class="['text-xl leading-normal font-bold z-[1]', styles.buttonText]">
                        {{ props.theme === 'orange' ? 'CLAIM DISCOUNT' : 'ENTER LUCKY DRAW' }}
                    </span>
                </button>

            </div> </div> </div>
    </div>
  </div>
</template>