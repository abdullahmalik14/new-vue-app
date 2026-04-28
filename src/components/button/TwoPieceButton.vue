<template>
  <component
    :is="tag"
    :href="tag === 'a' ? href : undefined"
    :type="tag === 'button' ? type : undefined"
    :disabled="disabled && tag === 'button'"
    :class="[computedRootClass, disabled ? 'opacity-60 cursor-not-allowed' : '']"
    v-bind="dataAttrs"
    @click="onClick"
  >
    <!-- Variant: existing two-piece layout -->
    <template v-if="variant === 'two-piece'">
      <div v-if="skewPosition === 'right'" class="flex items-center self-stretch w-full">
        <div :class="[mainClass]">
          <slot name="icon" />
          <span v-if="text" :class="computedTextClass">{{ text }}</span>
          <slot />
        </div>
        <div :class="[skewClass]"></div>
      </div>

      <div v-else class="flex items-center self-stretch w-full">
        <div :class="[skewClass]"></div>
        <div :class="[mainClass]">
          <span v-if="text" :class="computedTextClass">{{ text }}</span>
          <slot name="rightIcon" />
        </div>
      </div>
    </template>

    <!-- Variant: link-x / premium-upgrade -->
    <template v-else-if="variant === 'link-x' || variant === 'premium-upgrade'">
      <div :class="contentWrapperClass">
        <slot name="icon" />
        <span v-if="text" :class="computedTextClass">{{ text }}</span>
        <slot />
      </div>
    </template>
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    tag?: "a" | "button" | "div";
    href?: string;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    text?: string;
    skewPosition?: "left" | "right";
    variant?: "two-piece" | "skew-right" | "link-x" | "premium-upgrade";
    rootClass?: string;
    mainClass?: string;
    skewClass?: string;
    textClass?: string;
    contentWrapperClass?: string;
    // Pass-through attributes like data-*, aria-*, etc.
    dataAttrs?: Record<string, any>;
  }>(),
  {
    tag: "a",
    href: "#",
    type: "button",
    disabled: false,
    text: "",
    skewPosition: "right",
    variant: "two-piece",
    rootClass: "",
    mainClass: "",
    skewClass: "",
    textClass: "",
    contentWrapperClass: "",
    dataAttrs: () => ({}),
  }
);

const emit = defineEmits<{ (e: "click", ev: MouseEvent): void }>();

function onClick(ev: MouseEvent) {
  if (props.disabled) return;
  emit("click", ev);
}

// Computed defaults depending on variant
const computedRootClass = computed(() => {
  if (props.rootClass && props.rootClass.length) return props.rootClass;
  if (props.variant === "skew-right") {
    // Default classes for the green skew-right-bottom button UI
    return "group w-max pl-2 bg-[#07f468] gap-2.5 pr-2.5 h-10 relative flex justify-center items-center appearance-button transition-opacity duration-100 ease-in-out normal-case overflow-visible outline-none border-none hover:bg-black hover:after:bg-black before:content-[''] before:block before:w-full before:h-full before:absolute before:top-0 before:right-0 before:z-[1] before:shadow-[4px_4px_0_0_#000] before:transition-all before:ease-in-out before:duration-0 after:content-[''] after:block after:w-4 after:h-full after:absolute after:top-0 after:-right-[0.43rem] after:z-[1] after:shadow-[4px_4px_0_0_#000] after:skew-x-[20deg] after:translate-x-0 after:transition-all after:ease-in-out after:duration-0 after:bg-[#07f468]";
  }
  if (props.variant === "link-x") {
    return "pb-1 filter drop-shadow-[5px_4px_0px_#000] group hover:drop-shadow-[5px_4px_0px_#07F468] w-max md:pb-0 transition-all duration-300";
  }
  if (props.variant === "premium-upgrade") {
    return "pb-1 md:pb-0 filter drop-shadow-[5px_4px_0px_#000] group w-max relative after:content-[''] after:absolute after:left-0 after:top-0 after:w-[calc(100%-1rem)] after:h-full after:bg-transparent after:pointer-events-none after:z-[2] after:shadow-[inset_0px_0px_1px_0px_#FFF3A1,0px_0px_10px_0px_#FFB909B2,0px_0px_10px_0px_#F2F2030D,0px_5px_50px_0px_#F2F20380] hover:after:shadow-[inset_0px_0px_1px_0px_#FFF3A1,0px_0px_10px_0px_#FFB909E6,0px_0px_10px_0px_#F2F20333,0px_5px_50px_0px_#F2F203CC] transition-all duration-300";
  }
  // Default for the legacy two-piece variant
  return "no-underline";
});

const contentWrapperClass = computed(() => {
  if (props.contentWrapperClass && props.contentWrapperClass.length)
    return props.contentWrapperClass;
  
  if (props.variant === "link-x") {
    return "flex justify-center items-center gap-2.5 pl-2 pr-6 h-10 [clip-path:polygon(calc(100%-1rem)_0%,100%_100%,0%_100%,0%_0%)] bg-[#07F468] group-hover:bg-black transition-all duration-300";
  }
  
  if (props.variant === "premium-upgrade") {
    return "relative flex justify-center items-center gap-2.5 pl-2 pr-6 h-10 [clip-path:polygon(calc(100%-1rem)_0%,100%_100%,0%_100%,0%_0%)] bg-[linear-gradient(90deg,#D8AF0D_0%,#9F8009_100%)] group-hover:bg-[linear-gradient(90deg,#F2C318_0%,#C9A10A_100%)] transition-all duration-300 before:content-[''] before:absolute before:left-0 before:w-full before:h-full before:bg-[url('https://i.ibb.co.com/m1KgwwG/button-black-overlay.png')] before:bg-cover before:bg-center before:bg-no-repeat before:opacity-95 before:z-[1] before:pointer-events-none group-hover:before:opacity-40 [&>img]:relative [&>img]:z-10 [&>span]:relative [&>span]:z-10";
  }

  if (props.variant === "skew-right") {
    return "flex items-center justify-center gap-2.5 relative";
  }
  return props.mainClass || "";
});

const computedTextClass = computed(() => {
  if (props.textClass && props.textClass.length) return props.textClass;

  if (props.variant === "link-x") {
    return "text-lg font-medium text-black group-hover:text-[#07F468] transition-colors duration-300";
  }

  if (props.variant === "premium-upgrade") {
    return "text-lg font-medium text-white";
  }

  return props.textClass || "";
});
</script>

<style scoped>
/* CSS-first two-piece button. All visuals via classes passed in props. */
</style>
