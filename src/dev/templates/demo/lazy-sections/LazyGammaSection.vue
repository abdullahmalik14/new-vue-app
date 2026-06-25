<template>
  <div data-lazy-block="gamma" class="lazy-demo-block lazy-demo-block--gamma">
    <span class="lazy-demo-block__tag">Section C (footer)</span>
    <h2 class="lazy-demo-block__title">Gamma — the "footer" loaded on approach</h2>
    <p class="lazy-demo-block__text">
      This is the footer-style section: it stays unloaded until the user scrolls
      close to the bottom, then its HTML is created — exactly the lazy behaviour
      requested.
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
.lazy-demo-block--gamma {
  background: linear-gradient(135deg, #b45309, #f59e0b);
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
