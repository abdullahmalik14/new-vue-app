<template>
  <component
    :is="tag"
    :href="tag === 'a' ? href : undefined"
    :type="tag === 'button' ? type : undefined"
    :disabled="(disabled || loading) && tag === 'button'"
    :aria-busy="loading || undefined"
    :class="[computedRootClass, disabled && !loading ? 'opacity-60 cursor-not-allowed' : '', loadingRootClass]"
    v-bind="dataAttrs"
    @click="onClick"
  >
    <!-- Variant: existing two-piece layout -->
    <template v-if="variant === 'two-piece'">
      <div class="relative flex items-center self-stretch w-full">
        <div class="inline-grid [grid-template-areas:'stack'] place-items-center w-full">
          <div
            class="[grid-area:stack] flex items-center self-stretch w-full"
            :class="loading ? 'invisible' : ''"
            aria-hidden="true"
          >
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
          </div>
          <span
            v-if="loading"
            class="[grid-area:stack] relative z-20 inline-flex items-center justify-center pointer-events-none"
          >
            <LoadingSpinner v-bind="loadingSpinnerBindings">
              <template v-if="$slots.loadingSpinner" #spinner>
                <slot name="loadingSpinner" />
              </template>
            </LoadingSpinner>
          </span>
        </div>
      </div>
    </template>

    <!-- Variant: link-x / premium-upgrade / skew-right -->
    <template v-else-if="variant === 'link-x' || variant === 'premium-upgrade' || variant === 'skew-right'">
      <div :class="[resolvedContentWrapperClass, 'relative inline-grid [grid-template-areas:\'stack\'] place-items-center justify-items-center']">
        <span
          class="[grid-area:stack] inline-flex items-center justify-center gap-2.5"
          :class="loading ? 'invisible' : ''"
          aria-hidden="true"
        >
          <slot name="icon" />
          <span v-if="text" :class="computedTextClass">{{ text }}</span>
          <slot />
        </span>
        <span
          v-if="loading"
          class="[grid-area:stack] relative z-20 inline-flex items-center justify-center pointer-events-none"
        >
          <LoadingSpinner v-bind="loadingSpinnerBindings">
            <template v-if="$slots.loadingSpinner" #spinner>
              <slot name="loadingSpinner" />
            </template>
          </LoadingSpinner>
        </span>
      </div>
    </template>
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
import LoadingSpinner from "@/components/ui/spinners/LoadingSpinner.vue";

const props = withDefaults(
  defineProps<{
    tag?: "a" | "button" | "div";
    href?: string;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    loading?: boolean;
    loadingSpinnerColor?: string;
    loadingSpinnerSrc?: string;
    loadingSpinnerSize?: string;
    loadingSpinnerShowTrack?: boolean;
    loadingSpinnerThickness?: string | number;
    loadingSpinnerImgFilter?: string;
    loadingSpinnerCustomClass?: string;
    text?: string;
    skewPosition?: "left" | "right";
    variant?: "two-piece" | "skew-right" | "link-x" | "premium-upgrade";
    rootClass?: string;
    mainClass?: string;
    skewClass?: string;
    textClass?: string;
    contentWrapperClass?: string;
    dataAttrs?: Record<string, any>;
  }>(),
  {
    tag: "a",
    href: "#",
    type: "button",
    disabled: false,
    loading: false,
    loadingSpinnerColor: "text-current",
    loadingSpinnerSrc: "",
    loadingSpinnerSize: "sm",
    loadingSpinnerShowTrack: false,
    loadingSpinnerThickness: "4",
    loadingSpinnerImgFilter: "",
    loadingSpinnerCustomClass: "",
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

const loadingSpinnerBindings = computed(() => ({
  size: props.loadingSpinnerSize,
  color: props.loadingSpinnerColor,
  showTrack: props.loadingSpinnerShowTrack,
  thickness: props.loadingSpinnerThickness,
  src: props.loadingSpinnerSrc,
  imgFilter: props.loadingSpinnerImgFilter,
  customClass: props.loadingSpinnerCustomClass,
}));

function onClick(ev: MouseEvent) {
  if (props.disabled || props.loading) return;
  emit("click", ev);
}

/** Strip group / group-hover utilities while loading so hover cannot override loading UI. */
function withoutGroupInteraction(className: string): string {
  return className
    .split(/\s+/)
    .filter(
      (token) =>
        token &&
        !/^group(?:\/[\w-]+)?$/.test(token) &&
        !/^group-hover(?:\/[\w-]+)?:/.test(token)
    )
    .join(" ");
}

const loadingRootClass = computed(() =>
  props.loading ? "pointer-events-none cursor-wait [&:disabled]:opacity-100" : ""
);

const loadingContentLockClass = computed(() => {
  if (!props.loading) return "";
  if (props.contentWrapperClass) return "";
  if (props.variant === "link-x") return "!bg-[#07F468]";
  if (props.variant === "premium-upgrade") {
    return "before:!opacity-95 !bg-[linear-gradient(90deg,#D8AF0D_0%,#9F8009_100%)]";
  }
  return "";
});

const computedRootClass = computed(() => {
  let cls = "";
  if (props.rootClass && props.rootClass.length) cls = props.rootClass;
  else if (props.variant === "skew-right") {
    cls =
      "group w-max pl-2 bg-[#07f468] gap-2.5 pr-2.5 h-10 relative flex justify-center items-center appearance-button transition-opacity duration-100 ease-in-out normal-case overflow-visible outline-none border-none enabled:hover:bg-black enabled:hover:after:bg-black before:content-[''] before:block before:w-full before:h-full before:absolute before:top-0 before:right-0 before:z-[1] before:shadow-[4px_4px_0_0_#000] before:transition-all before:ease-in-out before:duration-0 after:content-[''] after:block after:w-4 after:h-full after:absolute after:top-0 after:-right-[0.43rem] after:z-[1] after:shadow-[4px_4px_0_0_#000] after:skew-x-[20deg] after:translate-x-0 after:transition-all after:ease-in-out after:duration-0 after:bg-[#07f468]";
  } else if (props.variant === "link-x") {
    cls =
      "pb-1 filter drop-shadow-[5px_4px_0px_#000] group enabled:hover:drop-shadow-[5px_4px_0px_#07F468] w-max md:pb-0 transition-all duration-300";
  } else if (props.variant === "premium-upgrade") {
    cls =
      "pb-1 md:pb-0 filter drop-shadow-[5px_4px_0px_#000] group w-max relative after:content-[''] after:absolute after:left-0 after:top-0 after:w-[calc(100%-1rem)] after:h-full after:bg-transparent after:pointer-events-none after:z-[2] after:shadow-[inset_0px_0px_1px_0px_#FFF3A1,0px_0px_10px_0px_#FFB909B2,0px_0px_10px_0px_#F2F2030D,0px_5px_50px_0px_#F2F20380] enabled:hover:after:shadow-[inset_0px_0px_1px_0px_#FFF3A1,0px_0px_10px_0px_#FFB909E6,0px_0px_10px_0px_#F2F20333,0px_5px_50px_0px_#F2F203CC] transition-all duration-300";
  } else {
    cls = "no-underline";
  }
  if (props.loading) cls = withoutGroupInteraction(cls);
  return cls;
});

const resolvedContentWrapperClass = computed(() => {
  let cls = "";
  if (props.contentWrapperClass && props.contentWrapperClass.length) {
    cls = props.contentWrapperClass;
  } else if (props.variant === "link-x") {
    cls =
      "flex justify-center items-center gap-2.5 pl-2 pr-6 h-10 [clip-path:polygon(calc(100%-1rem)_0%,100%_100%,0%_100%,0%_0%)] bg-[#07F468] group-hover:bg-black transition-all duration-300";
  } else if (props.variant === "premium-upgrade") {
    cls =
      "relative flex justify-center items-center gap-2.5 pl-2 pr-6 h-10 [clip-path:polygon(calc(100%-1rem)_0%,100%_100%,0%_100%,0%_0%)] bg-[linear-gradient(90deg,#D8AF0D_0%,#9F8009_100%)] group-hover:bg-[linear-gradient(90deg,#F2C318_0%,#C9A10A_100%)] transition-all duration-300 before:content-[''] before:absolute before:left-0 before:w-full before:h-full before:bg-[url('https://i.ibb.co.com/m1KgwwG/button-black-overlay.png')] before:bg-cover before:bg-center before:bg-no-repeat before:opacity-95 before:z-[1] before:pointer-events-none group-hover:before:opacity-40 [&>span:first-child_img]:relative [&>span:first-child_img]:z-10 [&>span:first-child>span]:relative [&>span:first-child>span]:z-10";
  } else if (props.variant === "skew-right") {
    cls = "flex items-center justify-center gap-2.5 relative";
  } else {
    cls = props.mainClass || "";
  }
  if (props.loading) cls = withoutGroupInteraction(cls);
  if (props.loading && loadingContentLockClass.value) {
    cls = `${cls} ${loadingContentLockClass.value}`.trim();
  }
  return cls;
});

const computedTextClass = computed(() => {
  let cls = "";
  if (props.textClass && props.textClass.length) cls = props.textClass;
  else if (props.variant === "link-x") {
    cls =
      "text-lg font-medium text-black group-hover:text-[#07F468] transition-colors duration-300";
  } else if (props.variant === "premium-upgrade") {
    cls = "text-lg font-medium text-white";
  } else {
    cls = props.textClass || "";
  }
  if (props.loading) cls = withoutGroupInteraction(cls);
  return cls;
});
</script>

<style scoped>
/* CSS-first two-piece button. All visuals via classes passed in props. */
</style>
