<template>
  <div
    class="w-full flex items-center justify-between flex-col ra-sidecart__container ra-cart__container"
  >
    <Transition name="fade">
      <div
        v-if="cartOpen && cartReady"
        @click="toggleCart"
        @scroll.prevent
        class="fixed z-[997] !block inset-0 bg-grey-900 opacity-[0.2]"
      ></div>
    </Transition>
    <Transition name="sidecart">
      <div
        v-if="cartOpen"
        class="w-full sm:w-[469px] h-full fixed top-0 right-0 z-[999] bg-[--inline-cart-background-image] ra-sidecart__bg-image"
        ref="cartInline"
      >
        <div
          class="h-full max-h-screen bg-[--inline-cart-background] bg-blend-luminosity backdrop-blur-[50px] rounded-none flex flex-col"
        >
          <div class="w-full">
            <div class="p-6 flex flex-row justify-between">
              <div class="flex flex-col">
                <span
                  class="text-lg text-white mono-24-spaced !leading-[100%] my-auto"
                  v-text="cartCount"
                />
                <div v-if="reachedOrderLimit" class="mt-md">
                  <p class="mono-12 font-bold">{{ orderLimit }}</p>
                </div>
              </div>
              <button
                @click="toggleCart"
                class="flex items-center ra-button ra-icon-button ra-button--secondary ra-icon-button--md w-11 h-11 focus:!outline-transparent !rounded-full"
              >
                <RaIcon size="15px" class="cursor-pointer" color="white">
                  <svg>
                    <use xlink:href="#close"></use>
                  </svg>
                </RaIcon>
              </button>
            </div>
            <!-- <div class="px-6 pt-4 pb-2">
            <CartProgressBar
              v-if="settings.free_gift_enabled"
              :threshold="settings.free_gift_threshold"
              :subtotal="cart.total_price"
            />
          </div> -->
          </div>
          <div
            class="px-6 pt-0 pb-5 overflow-y-scroll"
            id="inline_cart_container"
          >
            <template v-if="cartHasItems">
              <CartMessage
                v-if="settings.cart_message_1?.length > 0"
                :message="settings.cart_message_1"
                :color="settings.cart_message_1_color_inline"
              />
              <div class="mb-2">
                <CartProducts
                  :product-badge-settings="productBadgeSettings"
                  :cart="cart"
                  :settings="settings"
                />
              </div>
              <CartGiftMessage
                v-if="settings.gift_message_enabled"
                :message="settings.gift_message_text"
              />
              <div class="pt-3 md:pt-8">
                <CartUpsell
                  v-if="settings.upsell_enabled && settings.upsell_product"
                  :product="settings.upsell_product"
                  :title="settings.upsell_title"
                  :order-limit="orderLimit"
                  :vip-customer="vipCustomer"
                  :waitlistText="waitlistText"
                  :sold-out-text="soldOutText"
                  :bisText="bisText"
                  :preOrderText="preOrderText"
                />
              </div>
            </template>
            <template v-else-if="cartIsEmpty">
              <div class="flex flex-col items-center pt-8 md:pt-15">
                <EmptyCart :settings="emptyCartSettings" />
              </div>
            </template>
          </div>
          <div class="px-6 py-6 mt-auto surfaces-light">
            <CartProgressBar
              v-if="settings.free_shipping_bar_enabled && progressBarData"
              :threshold="progressBarData.free_shipping_threshold"
              :subtotal="cart.total_price"
              :showBar="settings.free_shipping_bar_enabled"
            />
            <CartSubtotal :subtotal="cart.total_price" />
            <CartCheckoutButton
              :checkout-ready="cartHasItems"
              :order-limit-checkout-button="orderLimitCheckoutButton"
              :over-order-limit="overdOrderLimit"
            />
            <a
              href="/cart"
              class="mono-12 ra-link grid mono-13 ra-link pt-6 text-center"
            >
              View Bag</a
            >
            <CartMessage
              v-if="settings.cart_message_2?.length > 0"
              :message="settings.cart_message_2"
              :color="settings.cart_message_2_color_inline"
              class="mt-4"
            />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { RaIcon } from "@bva/ui-vue";
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useCartStore } from "../stores/cart.js";
import {
  CartCheckoutButton,
  CartGiftMessage,
  CartMessage,
  CartProducts,
  CartProgressBar,
  CartSubtotal,
  CartUpsell,
  EmptyCart,
} from "./CartComponents";

import { dataViewCart } from "./datalayer/";

const cartStore = useCartStore();

const { cart } = storeToRefs(cartStore);

const cartHasItems = computed(
  () => cart.value.items && cart.value.items.length > 0
);

const cartIsEmpty = computed(
  () => cart.value.items?.length == 0 && cart.value.item_count == 0
);

const cartReady = computed(() => Object.keys(cart).length > 0);

const props = defineProps({
  settings: {
    type: Object,
    default: () => {},
  },
  emptyCartSettings: {
    type: Object,
    default: () => {},
  },
  orderLimit: String,
  orderLimitCheckoutButton: String,
  vipCustomer: Boolean,
  productBadgeSettings: String,
  waitlistText: String,
  soldOutText: String,
  bisText: String,
  preOrderText: String,
});

const settings = ref(props.settings);

const emptyCartSettings = ref(props.emptyCartSettings);

const freeShippingCsvData = ref(null);

const cartCount = computed(() => {
  const { cart_header_text } = settings.value;
  const { item_count } = cart.value;
  const cart_count_text = `(${item_count})`;
  return `${cart_header_text} ${item_count > 0 ? cart_count_text : ""}`;
});

const reachedOrderLimit = computed(() => {
  const { item_count } = cart.value;
  return item_count >= 15;
});

const overdOrderLimit = computed(() => {
  const { item_count } = cart.value;
  return item_count > 15;
});

const progressBarData = computed(() => {
  const { free_gift_threshold, country_code, currency_code } = settings.value;
  let currentLocationData = null;
  if (freeShippingCsvData.value) {
    currentLocationData = freeShippingCsvData.value.find(
      (location) => location.country_code === country_code
    );
  }
  if (currency_code === "USD" && !currentLocationData) {
    currentLocationData = {
      country_code: country_code,
      free_shipping_threshold: free_gift_threshold,
    };
  }
  return currentLocationData;
});

const cartOpen = ref(false);

const toggleCart = (e) => {
  const body = document.getElementsByTagName("body");
  cartOpen.value = !cartOpen.value;
  if (cartOpen.value) {
    if (e.detail?.track) dataViewCart(cart);
    body[0].classList.add("modal-open");
  } else body[0].classList.remove("modal-open");
};

const headerToggle = document.querySelector("[data-toggle-cart]");

const keyboardHandler = (event) => {
  if (event.key == "Escape" || event.code == "Escape") toggleCart();
  else if (event.key == "Tab" || event.code == "Tab") focusTrap(event);
  event.handled = true;
};

onMounted(() => {
  window.addEventListener("toggleCart", toggleCart);
  getShippingCsv();
});

const cartInline = ref();
const focusableElements = ref();

watch(cartOpen, () => {
  if (cartOpen.value) {
    nextTick(() => {
      window.addEventListener("keydown", keyboardHandler);
      focusableElements.value = getFocusableElements(cartInline.value);
      focusableElements.value[0].focus();
    });
  } else {
    window.removeEventListener("keydown", keyboardHandler);
    headerToggle.focus();
  }
});

const focusTrap = (event) => {
  const firstEl = focusableElements.value[0];
  const currentEl = document.activeElement;
  const lastEl = focusableElements.value[focusableElements.value.length - 1];
  if (currentEl === lastEl) {
    event.preventDefault();
    firstEl.focus();
  } else if (currentEl === firstEl && event.shiftKey) {
    event.preventDefault();
    lastEl.focus();
  }
};

const getFocusableElements = (container) => {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
};

const getShippingCsv = async () => {
  try {
    const { free_shipping_csv_url } = settings.value;
    const csvData = await fetchCsv(free_shipping_csv_url);
    freeShippingCsvData.value = csvToJson(csvData);
  } catch (error) {
    console.error("Error processing CSV file:", error);
  }
};

const fetchCsv = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error in fetchCsv()! Status: ${response.status}`);
  }
  return await response.text();
};

const csvToJson = (csv) => {
  const lines = csv.split("\n");
  const headers = lines[0].split(",");
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentLine = lines[i].split(",");
    headers.forEach((header, index) => {
      if (header && currentLine[index]) {
        obj[header.trim()] = currentLine[index].trim();
      }
    });
    result.push(obj);
  }
  return result;
};
</script>

<style scoped>
.sidecart-enter-active,
.sidecart-leave-active {
  transition: margin 0.5s ease;
}

.sidecart-enter-from,
.sidecart-leave-to {
  margin-right: -470px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0 !important;
}

#inline_cart_container::-webkit-scrollbar {
  display: none;
}
</style>
