<template>
     <div class="hidden md:flex items-center gap-2 flex-wrap">
          <!-- tip-button -->
          <div
            class="w-[3.75rem] h-[3.75rem] grayscale relative pointer-events-none"
          >
            <span
              class="absolute top-0 left-0 block w-[3.75rem] h-[3.75rem] group/icon"
            >
              <img
                data-src="/images/token.webp"
                alt="token"
                class="lazyload absolute top-0 left-0 transition-all duration-200 group-hover/icon:opacity-0"
              />
              <img
                data-src="/images/token.webp"
                alt="token-hover"
                class="lazyload absolute top-0 left-0 transition-all duration-200 opacity-0 duration-[0.4s] group-hover/icon:opacity-100 group-hover/icon:scale-110"
              />
            </span>
          </div>

          <!-- private-call-button -->
          <div
            class="w-[3.75rem] h-[3.75rem] grayscale relative pointer-events-none"
          >
            <span
              class="absolute top-0 left-0 block w-[3.75rem] h-[3.75rem] group/icon"
            >
              <img
                data-src="/images/call.webp"
                alt="call"
                class="lazyload absolute top-0 left-0 transition-all duration-200 group-hover/icon:opacity-0"
              />
              <img
                data-src="/images/call-hover.webp"
                alt="call-hover"
                class="lazyload absolute top-0 left-0 transition-all duration-200 opacity-0 duration-[0.4s] group-hover/icon:opacity-100 group-hover/icon:scale-110"
              />
              <img
                data-src="/images/online-dot.webp"
                alt="online-dot"
                class="lazyload absolute w-[18%] top-0 right-[3px] duration-500"
              />
            </span>
          </div>

          <!-- private-message-button -->
          <div
            class="w-[3.75rem] h-[3.75rem] grayscale relative pointer-events-none"
          >
            <span
              class="absolute top-0 left-0 block w-[3.75rem] h-[3.75rem] group/icon"
            >
              <img
                data-src="/images/message.webp"
                alt="message"
                class="lazyload absolute top-0 left-0 transition-all duration-200 group-hover/icon:opacity-0"
              />
              <img
                data-src="/images/message-hover.webp"
                alt="message-hover"
                class="lazyload absolute top-0 left-0 transition-all duration-200 opacity-0 duration-[0.4s] group-hover/icon:opacity-100 group-hover/icon:scale-110"
              />
              <img
                data-src="/images/online-dot.webp"
                alt="online-dot"
                class="lazyload absolute w-[18%] top-0 right-[3px] duration-500"
              />
            </span>
          </div>
        </div>
</template>