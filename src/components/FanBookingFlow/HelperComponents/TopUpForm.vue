<script setup>
defineProps({
  walletBalance: {
    type: Number,
    required: true
  },
  topUpAmount: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  remainingBalance: { // Balance after booking (Wallet + TopUp - Total)
    type: Number,
    required: true
  }
});

const emit = defineEmits(['back']);
</script>

<template>
  <div class="flex flex-col w-full h-full">
    
    <div 
      class="inline-flex justify-start items-center gap-0.5 cursor-pointer mb-4"
      @click="emit('back')"
    >
      <div class="w-4 h-4 relative overflow-hidden">
        <img src="/images/arrow-left.svg" alt="">
      </div>
      <div class="justify-start text-white text-xs font-medium font-['Poppins'] leading-4">
        Back
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <div class="rounded-[10px] flex flex-col gap-4">
          
          <div class="flex flex-col gap-1">
            <div class="opacity-70 justify-start text-white text-xs font-normal font-['Poppins'] leading-4">
                TOP UP AMOUNT
            </div>
            <div class="flex flex-col gap-6">
                <div class="inline-flex justify-start items-center gap-1">
                  <div class="relative">
                      <img class="w-10 h-10" src="/images/token.svg" alt="">
                  </div>
                  <div class="flex-1 h-11 px-1 border-b border-gray-400 inline-flex flex-col justify-center items-start gap-2">
                      <div class="h-11 inline-flex w-full justify-between items-center gap-1">
                        <div class="flex-1 justify-start text-white text-3xl font-normal font-['Poppins'] leading-9">
                            {{ topUpAmount.toLocaleString() }}
                        </div>
                        <div class="inline-flex flex-col justify-start items-end">
                            <div class="px-1 bg-green-500 inline-flex justify-center items-center gap-2.5">
                              <div class="text-right justify-center text-gray-900 text-xs font-semibold font-['Poppins'] leading-4">
                                  -20%
                              </div>
                            </div>
                            <div class="text-right justify-end text-white text-sm font-semibold font-['Poppins'] leading-5">
                              =USD$ 123.45
                            </div>
                        </div>
                      </div>
                  </div>
                </div>
            </div>
          </div>

          <div class="inline-flex justify-start items-center gap-2">
            <div class="flex-1 p-2.5 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/50 flex justify-center items-center gap-2.5"><div class="justify-start text-white text-sm font-medium font-['Poppins'] leading-5">500</div></div>
            <div class="flex-1 p-2.5 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/50 flex justify-center items-center gap-2.5"><div class="justify-start text-white text-sm font-medium font-['Poppins'] leading-5">1,000</div></div>
            <div class="flex-1 p-2.5 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/50 flex justify-center items-center gap-2.5"><div class="justify-start text-white text-sm font-medium font-['Poppins'] leading-5">2,000</div></div>
            <div class="flex-1 p-2.5 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/50 flex justify-center items-center gap-2.5"><div class="justify-start text-white text-sm font-medium font-['Poppins'] leading-5">5,000</div></div>
          </div>

          <div class="flex flex-col gap-2">
            <div class="h-6 inline-flex justify-start items-center gap-2">
                <div class="w-5 h-5 relative flex justify-center items-center"><img src="/images/creditIcon.png" alt=""></div>
                <div class="justify-center text-gray-50 text-sm font-semibold font-['Poppins'] leading-5">PAYMENT METHOD</div>
            </div>
            <div class="px-4 bg-black/50 rounded-md outline outline-1 outline-offset-[-1px] outline-gray-200/50 flex flex-col gap-6">
                <div class="py-2 inline-flex justify-start items-center gap-2">
                  <div class="flex-1 inline-flex flex-col justify-center items-start gap-1">
                      <div class="w-56 h-6 justify-center text-gray-200 text-base font-medium font-['Poppins'] leading-6">Chan Tai Man</div>
                      <div class="justify-center text-gray-200 text-base font-medium font-['Poppins'] leading-6 line-clamp-1">VISA-1234</div>
                  </div>
                  <div class="w-4 h-4 relative overflow-hidden"><img src="/images/chevron-down.webp" alt=""></div>
                </div>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <div class="h-6 inline-flex justify-start items-center gap-2">
                <div class="w-5 h-5 relative overflow-hidden"><img src="/images/at-sign.png" alt=""></div>
                <div class="justify-center text-gray-50 text-sm font-semibold font-['Poppins'] leading-5">ACCOUNT EMAIL</div>
            </div>
            <div class="inline-flex justify-start items-end">
                <div class="py-1 flex justify-center items-center gap-2">
                  <div class="w-10 h-9 relative"><img class="w-9 h-9 left-[2.28px] top-0 absolute" src="https://i.ibb.co/XZHymffZ/avatar-of-a-mango.png" /></div>
                  <div class="inline-flex flex-col justify-center items-start">
                      <div class="inline-flex justify-start items-center gap-1">
                        <div class="justify-start text-white text-xs font-semibold font-['Poppins'] leading-4 line-clamp-1">mangoes</div>
                        <div data-size="xs" class="w-2.5 h-2.5 relative overflow-hidden"><img src="/images/svgviewer-png-output-22.webp" alt=""></div>
                      </div>
                      <div class="justify-start text-gray-500 text-xs font-medium font-['Poppins'] leading-4">mangoes@email.com</div>
                  </div>
                </div>
            </div>
          </div>

          <div class="flex flex-col justify-center items-start gap-2">
            
            <div class="inline-flex justify-between w-full">
                <div class="justify-start text-white text-sm font-normal font-['Poppins'] leading-5">Original balance</div>
                <div class="flex justify-start items-center gap-1">
                  <div class="w-4 h-4 relative"><img src="/images/token.svg" alt=""></div>
                  <div class="justify-start text-white text-sm font-medium font-['Poppins'] leading-5">{{ walletBalance.toLocaleString() }}</div>
                </div>
            </div>

            <div class="inline-flex justify-between w-full">
                <div class="justify-start text-white text-sm font-normal font-['Poppins'] leading-5">Top up amount</div>
                <div class="flex justify-start items-center gap-1">
                  <div class="justify-start text-white text-sm font-medium font-['Poppins'] leading-5">+</div>
                  <div class="w-4 h-4 relative"><img src="/images/token.svg" alt=""></div>
                  <div class="justify-start text-white text-sm font-medium font-['Poppins'] leading-5">{{ topUpAmount.toLocaleString() }}</div>
                </div>
            </div>

            <div class="h-0 outline outline-1 outline-offset-[-0.50px] outline-white w-full"></div>

            <div class="inline-flex justify-between w-full">
                <div class="justify-start text-white text-sm font-normal font-['Poppins'] leading-5">Balance after top up</div>
                <div class="flex justify-start items-center gap-1">
                  <div class="w-4 h-4 relative"><img src="/images/token.svg" alt=""></div>
                  <div class="justify-start text-white text-lg font-semibold font-['Poppins'] leading-7">{{ (walletBalance + topUpAmount).toLocaleString() }}</div>
                </div>
            </div>

            <div class="inline-flex justify-between w-full">
                <div class="justify-start text-white text-sm font-normal font-['Poppins'] leading-5">Subtotal</div>
                <div class="flex justify-start items-center gap-1">
                  <div class="justify-start text-white text-sm font-medium font-['Poppins'] leading-5">-</div>
                  <div class="w-4 h-4 relative"><img src="/images/token.svg" alt=""></div>
                  <div class="justify-start text-white text-sm font-medium font-['Poppins'] leading-5">{{ totalPrice }}</div>
                </div>
            </div>

            <div class="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-white"></div>

            <div class="inline-flex justify-between w-full">
                <div class="justify-start text-white text-sm font-semibold font-['Poppins'] leading-5">Balance after booking</div>
                <div class="flex justify-start items-center gap-1">
                  <div class="w-4 h-4 relative"><img src="/images/token.svg" alt=""></div>
                  <div class="justify-start text-white text-lg font-semibold font-['Poppins'] leading-7">{{ remainingBalance.toLocaleString() }}</div>
                </div>
            </div>

            <div class="inline-flex justify-between w-full">
                <div class="justify-start text-white text-sm font-semibold font-['Poppins'] leading-5">Top up payment</div>
                <div class="flex justify-start items-center gap-1">
                  <div class="justify-start text-white text-lg font-semibold font-['Poppins'] leading-7">USD$ 23.45</div>
                </div>
            </div>

            <div class="opacity-70 inline-flex justify-start items-center gap-0.5">
                <div class="w-4 h-4 relative overflow-hidden flex justify-center items-center"><img src="/images/doubleDropdown.png" alt=""></div>
                <div class="justify-start text-white text-xs font-medium font-['Poppins'] leading-4">Payment Summary</div>
            </div>
          </div>
      </div>
    </div>
  </div>
</template>