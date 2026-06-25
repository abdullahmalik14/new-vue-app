<template>
  <div data-lazy-block="beta" class="lazy-demo-block lazy-demo-block--beta">
    <span class="lazy-demo-block__tag">Section B</span>
    <h2 class="lazy-demo-block__title">Beta — lazily loaded</h2>
    <p class="lazy-demo-block__text">
      Each lazy section is its own component and its own chunk. Watch the Elements
      panel: this markup appears the moment the section enters the pre-load margin.
    </p>
  </div>
</template>

<script setup>
// Own code-split chunk — fetched on scroll.
</script>

<style scoped>
.lazy-demo-block {
  border-radius: 16px;
  padding: 48px 32px;
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.lazy-demo-block--beta {
  background: linear-gradient(135deg, #0f766e, #14b8a6);
}
.lazy-demo-block__tag {
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.8;
}
.lazy-demo-block__title {
  font-size: 28px;
  font-weight: 700;
}
.lazy-demo-block__text {
  font-size: 15px;
  line-height: 1.6;
  max-width: 640px;
  opacity: 0.95;
}
</style>
