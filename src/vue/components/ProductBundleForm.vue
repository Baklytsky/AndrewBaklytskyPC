<template>
  <div class="ra-product-main__inner w-full relative px-6 pb-2 lg:py-8">
    <div>
      <div class="pb-2 lg:pb-12">
        <div class="flex justify-between pb-[10px]">
          <!-- Title -->
          <h1 class="sr-only" v-text="title"></h1>
          <span
            class="sans-16 text-stroke-primary w-[85%]"
            v-text="title"
          ></span>

          <div
            class="text-uppercase text-right mono-16 text-stroke-primary flex font-light flex-col"
          >
            <!-- Price -->
            <div
              class="flex flex-wrap justify-end"
              v-if="isComparePriceVisible"
            >
              <span class="text-text-highlight">{{
                $filters.moneyWithoutDecimals(price)
              }}</span>
              <span class="ml-2 line-through ra-product-form__compare_price">{{
                $filters.moneyWithoutDecimals(compare_at_price)
              }}</span>
            </div>
            <template v-else>{{
              $filters.moneyWithoutDecimals(price)
            }}</template>
          </div>
        </div>

        <!-- Subtitle & Options -->
        <div
          v-if="hasSubtitleOrOptions && !activateSaleEvent"
          class="flex justify-between"
        >
          <span
            class="sans-16 text-stroke-primary w-[50%]"
            v-text="subtitleText"
          ></span>
          <span
            class="mono-16 text-stroke-primary w-[50%] text-right"
            v-text="optionsText"
          ></span>
        </div>
        <div
          v-if="activateSaleEvent"
          class="flex mt-sm cursor-pointer mono-12"
          data-sale-event-tooltip
        >
          <span :style="{ color: saleEventTooltipColor }"
            >{{ $filters.moneyWithoutDecimals(saleEventPrice) }}
            <span class="text-[10px] uppercase font-normal tracking-[1.2px]">
              {{ saleEventTooltipCopy }}
            </span>
          </span>
        </div>
      </div>
      <div class="ra-product-bundle__items lg:max-h-[60vh] lg:overflow-auto">
        <div v-for="(prod, i) in products" :key="prod.handle + '-' + i">
          <BundleProductItem
            :product="prod"
            :addProduct="addProduct"
            :deselectProduct="deselectProduct"
            :submitted="submitted"
            :vip-customer="vipCustomer"
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
            :enable-sale-event="enableSaleEvent"
            :sale-event-tooltip-color="saleEventTooltipColor"
            :sale-event-tooltip-copy="saleEventTooltipCopy"
          />
        </div>
      </div>
    </div>
    <div>
      <button
        class="looks__atc ra-button ra-button--full-width ra-button--sm mt-2 ra-button--primary max-sm:mt-[2px] ra-button--primary"
        @click="addToCart"
        v-text="ctaText"
        :disabled="!enableCta"
      />
    </div>
    <div
      v-if="showKlarnaAfterpayMessage"
      class="mono-12 flex flex-wrap items-center justify-center text-white text-center mt-[20px]"
      style="font-size: 10px"
    >
      <span>BUY NOW, PAY LATER WITH</span>
      <div id="klarna-button" class="w-[70px] mt-[-6px]">
        <img
          src="https://cdn.shopify.com/s/files/1/0781/1314/5147/files/6eb439fe-8d62-4687-adb2-be7ec86dd8e9_Wordmark_Transparent_And_OffWhite.png?v=1732284550"
          alt="klarna-logo"
        />
      </div>
      <span>OR</span>
      <div
        id="afterpay-button"
        class="w-[100px] ml-[-5px] mt-[-2px]"
        data-afterpay-modal="en_US-theme-white"
      >
        <img
          src="https://cdn.shopify.com/s/files/1/0781/1314/5147/files/AP_logo_lockup_6328x2204_whiteclear_png.png?v=1732286042"
          alt="afterpay-logo"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useCartStore } from "../stores/cart.js";
import { computed, ref, toRefs } from "vue";
import BundleProductItem from "./BundleProductItem.vue";
import { openBuyBox, closeBuyBox } from "../../js/utils/buy-box";
import * as $filters from "../filters/money";
// import * as $filters from "../filters/money";

// eslint-disable-next-line no-unused-vars
const props = defineProps({
  product: {
    type: Object,
    default: () => {},
  },
  products: {
    type: Array,
  },
  containerClasslist: {
    type: String,
    default: "",
  },
  vipCustomer: Boolean,
  orderLimit: String,
  waitlistText: {
    type: String,
    default: "Waitlist for Early Access",
  },
  subtitleText: { type: String },
  optionsText: { type: String },
  soldOutText: String,
  waitlistModalTitle: { type: String },
  waitlistModalDescription: { type: String },
  waitlistModalLegalText: { type: String },
  waitlistModalCta: { type: String },
  bisModalTitle: { type: String },
  bisModalDescription: { type: String },
  bisModalLegalText: { type: String },
  bisModalCta: { type: String },
  bisText: { String },
  productBadgeSettings: String,
  enableSaleEvent: { type: Boolean },
  saleEventTooltipColor: { type: String },
  saleEventTooltipCopy: { type: String },
  showKlarnaAfterpayMessage: { type: Boolean },
});

const cartStore = useCartStore();
const { title, price, compare_at_price } = toRefs(props.product);
const { subtitleText, optionsText } = toRefs(props);
// eslint-disable-next-line no-unused-vars
const isComparePriceVisible = computed(() => {
  return compare_at_price.value > price.value;
});

const hasSubtitleOrOptions = computed(() => {
  return subtitleText.value.length || optionsText.value.length;
});

// eslint-disable-next-line no-unused-vars
const { cart } = storeToRefs(cartStore);

const enableCta = computed(() => {
  return selectedProducts.value.length > 0;
});

const ctaText = computed(() => {
  return selectedProducts.value.length > 0 ? "Add to Bag" : "Select Sizes";
});

const activateSaleEvent = computed(() => {
  return (
    props.enableSaleEvent &&
    (props.product?.sale_event_price > 0 ||
      props.product?.sale_event_discount > 0)
  );
});

const saleEventPrice = computed(() => {
  let salePrice = price.value;

  if (props.product?.sale_event_price > 0) {
    salePrice = props.product?.sale_event_price;
  }

  if (props.product?.sale_event_discount > 0) {
    const discount = price.value * (props.product?.sale_event_discount / 100);
    const discountedPrice = (price.value - discount) / 100;
    const ceilValue = Math.ceil(discountedPrice);
    salePrice = ceilValue * 100;
  }

  return salePrice;
});

const selectedProducts = ref([]);
//Value changes every time products are added to cart, triggering tiles to reset.
const submitted = ref(false);

const addProduct = (productData) => {
  if (selectedProducts.value.length > 0) {
    removeProduct(productData);
  }
  selectedProducts.value.push(productData);
};

const removeProduct = (productData) => {
  const productIndex = selectedProducts.value.findIndex(
    (prod) => prod.productId === productData.productId
  );
  if (productIndex > -1) {
    selectedProducts.value.splice(productIndex, 1);
  }
};

const deselectProduct = (productId) => {
  const productIndex = selectedProducts.value.findIndex(
    (prod) => prod.productId === productId
  );
  if (productIndex != -1) {
    selectedProducts.value.splice(productIndex, 1);
  }
};

const isAddingToCart = ref(false);

const prepareProductData = () => {
  return selectedProducts.value.map((prod) => {
    delete prod.productId;
    return prod;
  });
};

const addToCart = async () => {
  isAddingToCart.value = true;
  const prodData = prepareProductData();
  console.log(prodData);
  await cartStore.addItems(prodData);
  isAddingToCart.value = false;
  //clear selected products
  selectedProducts.value = [];
  //trigger submitted value to change, so product tiles watching this prop will reset
  submitted.value = !submitted.value;
};

const isBuyBoxOpen = ref(false);

let touchstartY = 0;
let touchendY = 0;

const gestureZone = document.getElementById("product-buy-box-child");
const buyBoxContainer = document.getElementById("product-buy-box");
const buyBoxPillContainer = document.getElementById(
  "product-buy-box__pill-container"
);

if (gestureZone) {
  gestureZone.addEventListener(
    "touchstart",
    function (event) {
      touchstartY = event?.changedTouches[0]?.screenY;
    },
    false
  );

  gestureZone.addEventListener(
    "touchend",
    function (event) {
      touchendY = event?.changedTouches[0]?.screenY;
      handleGesture(event.target);
    },
    false
  );

  gestureZone.addEventListener(
    "touchmove",
    function (event) {
      const newHeight = innerHeight - event?.changedTouches[0]?.clientY;
      if (event.changedTouches[0].screenY > touchstartY) {
        const buyBoxPosition = buyBoxContainer.scrollTop;

        if (buyBoxPosition === 0) {
          if (buyBoxContainer && buyBoxContainer.offsetHeight > 166) {
            buyBoxContainer.style.cssText = `height: ${newHeight}px; overflow: none`;
            buyBoxContainer.classList.remove("product-buy-box--open");
          }
        }
      }
    },
    false
  );
}

function handleGesture(target) {
  if (touchendY < touchstartY) {
    isBuyBoxOpen.value = true;
    openBuyBox();
  }

  if (touchendY > touchstartY) {
    const buyBoxPosition = buyBoxContainer.scrollTop;
    if (buyBoxPosition === 0) {
      isBuyBoxOpen.value = false;
      closeBuyBox();
    }
    if (target === buyBoxPillContainer) {
      isBuyBoxOpen.value = false;
      buyBoxContainer.scrollTop = 0;
      closeBuyBox();
    }
  }
}
</script>
