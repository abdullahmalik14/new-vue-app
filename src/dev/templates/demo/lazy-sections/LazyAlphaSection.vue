<template>
  <div data-lazy-block="alpha" class="lazy-demo-block lazy-demo-block--alpha">
    <span class="lazy-demo-block__tag">Section A</span>
    <h2 class="lazy-demo-block__title">Alpha — lazily loaded</h2>
    <p class="lazy-demo-block__text">
      This block's HTML and its JavaScript chunk were created only when you
      scrolled near it. Before that, only an empty placeholder div existed in the
      inspector.
    </p>
  </div>
</template>

<script setup>
// Intentionally lightweight — this file is loaded as its own code-split chunk
// so the Network tab shows it being fetched on scroll.
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
.lazy-demo-block--alpha {
  background: linear-gradient(135deg, #6d28d9, #9333ea);
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
