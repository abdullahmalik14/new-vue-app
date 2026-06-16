<template>
  <div class="flex-1 md:pt-[16px] rounded-[10px] inline-flex flex-col gap-2.5 md:items-end">
    <div class="w-full text-slate-700 text-sm font-normal font-['Poppins'] leading-5 md:justify-end flex text-right">
      “{{ currentQuote.text }}” ~ {{ currentQuote.author }}
    </div>
    <DashboardPrimaryButton
      variant="none"
      @click="refreshQuote"
      customClass="group flex items-center justify-center gap-1 !bg-transparent rounded-none border-none outline-none hover:opacity-80 transition-opacity"
      textClass="text-blue-600 text-xs font-medium font-['Poppins'] leading-4 select-none"
      text="New Quote"
      :wrapperOverrides="[{target:'wrapper1', removeClass:true}, {target:'wrapper2', removeClass:true}]">
      <template #leftIcon>
        <div class="w-4 h-4 relative overflow-hidden flex items-center justify-center">
          <img
            src="https://i.ibb.co.com/tPv74nnJ/svgviewer-png-output-1.webp"
            alt="refresh"
            class="w-[.875rem] h-[.875rem]"
            :class="{ 'animate-spin': isRefreshing }"
          />
        </div>
      </template>
    </DashboardPrimaryButton>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue'

const quotes = [
  { text: "Those who flow as life flows know they need no other force.", author: "Lao Tzu" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "If you are not willing to risk the usual, you will have to settle for the ordinary.", author: "Jim Rohn" },
  { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
  { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
  { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
  { text: "I never dreamed about success. I worked for it.", author: "Estée Lauder" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" }
]

const currentQuote = ref(quotes[0])
const isRefreshing = ref(false)

const refreshQuote = () => {
  isRefreshing.value = true
  
  setTimeout(() => {
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * quotes.length)
    } while (quotes[newIndex].text === currentQuote.value.text && quotes.length > 1)
    
    currentQuote.value = quotes[newIndex]
    isRefreshing.value = false
  }, 300) // Small delay for visual feedback
}

onMounted(() => {
  // Select a random quote on mount
  const index = Math.floor(Math.random() * quotes.length)
  currentQuote.value = quotes[index]
})
</script>
