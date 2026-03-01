<template>
  <svg
    class="w-[1.125rem] h-[1.125rem] flex-shrink-0"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Hexagon outline in orange -->
    <path
      d="M9 1L16.3923 4.5V13.5L9 17L1.6077 13.5V4.5L9 1Z"
      fill="none"
      stroke="#ff7c1e"
      stroke-width="1.5"
    />
    <!-- Exclamation mark outline - vertical line (35-40% of hexagon height, rounded caps at both ends) -->
    <path
      d="M9 4.5V9.5"
      stroke="#ff7c1e"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <!-- Exclamation mark outline - dot (circular outline with clear consistent gap) -->
    <circle
      cx="9"
      cy="12.5"
      r="0.2"
      fill="none"
      stroke="#ff7c1e"
      stroke-width="1.4"
    />
  </svg>
</template>

<script setup></script>
