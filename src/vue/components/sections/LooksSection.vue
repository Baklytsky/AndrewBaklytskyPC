<template>
  <div class="flex flex-col lg:flex-row relative looks">
    <div
      class="looks__photo-gallery relative w-full lg:w-[65.5%]"
      :class="[broswer]"
    >
      <swiper-container
        class="looks-gallery"
        :class="[broswer]"
        thumbs-swiper=".looks-nav"
        loop="true"
        space-between="0"
        slides-per-view="1"
        speed="1"
        effect="fade"
      >
        <slot name="slides"></slot>
      </swiper-container>
      <swiper-container
        class="looks-nav"
        :style="{ height: navHeight }"
        loop="true"
        space-between="0"
        :slides-per-view="imageCount"
        free-mode="true"
        watch-slides-progress="true"
        direction="vertical"
      >
        <slot name="slides-nav"></slot>
      </swiper-container>
      <div>
        <slot name="page-content"></slot>
      </div>
    </div>
    <div
      class="looks__buy-box max-lg:bg-[var(--black-75)] relative w-full py-12 px-6 sm:pt-24 sm:pb-6 lg:w-[34.5%]"
    >
      <LooksBuyBox
        :products="products"
        :vip-customer="vipCustomer"
        :order-limit="orderLimit"
        :waitlist-text="waitlistText"
        :sold-out-text="soldOutText"
        :bis-text="bisText"
        :product-badge-settings="productBadgeSettings"
        :waitlist-modal-title="waitlistModalTitle"
        :waitlist-modal-description="waitlistModalDescription"
        :waitlist-modal-legal-text="waitlistModalLegalText"
        :waitlist-modal-cta="waitlistModalCta"
        :bis-modal-title="bisModalTitle"
        :bis-modal-description="bisModalDescription"
        :bis-modal-legal-text="bisModalLegalText"
        :bis-modal-cta="bisModalCta"
      />

      <div class="looks__bg-blur absolute top-0 left-0 w-full h-full"></div>
      <div
        class="looks__bg-image absolute w-full h-full top-0 left-0 bg-cover bg-center bg-no-repeat"
      ></div>
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted, onBeforeMount, ref } from "vue";
import LooksBuyBox from "../LooksBuyBox.vue";

const props = defineProps({
  products: {
    type: Object,
    default: () => {},
  },
  imageCount: {
    type: Number,
  },
  waitlistText: {
    type: String,
    default: "Waitlist for Early Access",
  },
  soldOutText: String,
  waitlistModalTitle: { type: String },
  waitlistModalDescription: { type: String },
  waitlistModalLegalText: { type: String },
  waitlistModalCta: { type: String },
  bisModalTitle: { type: String },
  bisModalDescription: { type: String },
  bisModalCta: { type: String },
  bisText: { type: String },
  vipCustomer: Boolean,
  orderLimit: String,
  productBadgeSettings: String,
});

const broswer = ref("");
const showHeader = ref(false);

const navHeight = computed(() => {
  return `${props.imageCount * 75}px`;
});

const controlHeaderLogo = () => {
  const header = document.querySelector(".header");
  if (!showHeader.value && window.scrollY > 150) {
    header?.classList?.add("show-mobile-logo");
    showHeader.value = true;
  }

  if (showHeader.value && window.scrollY < 150) {
    header?.classList?.remove("show-mobile-logo");
    showHeader.value = false;
  }
};

const setupEventListeners = () => {
  window.addEventListener("scroll", controlHeaderLogo);
};

onBeforeMount(() => {
  if (window.navigator.userAgent.indexOf("Mobile") != 1) {
    if (window.navigator.userAgent.indexOf("CriOS") != -1) {
      broswer.value = "chrome-ios";
    } else if (window.navigator.userAgent.indexOf("Chrome") != -1) {
      broswer.value = "chrome";
    } else if (window.navigator.userAgent.indexOf("Safari") != -1) {
      broswer.value = "safari";
    }
  }
});

onMounted(() => {
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 50);
  setupEventListeners();
});
</script>
