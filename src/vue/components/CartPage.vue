<template>
  <Transition name="cart" mode="out-in">
    <template v-if="cartReady">
      <div
        v-if="cartHasItems"
        class="mx-auto flex flex-col md:flex-row justify-evenly lg:justify-center ra-cart__container ra-cartpage__container"
      >
        <div class="basis-1/2 pt-6 px-2 md:pt-4 md:p-0 max-w-[572px]">
          <h3 class="mb-6 text-left mono-24">
            <span class="mono-24-spaced" v-text="cartCount" />
          </h3>
          <CartMessage
            v-if="settings.cart_message_1?.length > 0"
            :message="settings.cart_message_1"
            :color="settings.cart_message_1_color"
            container-classlist="mb-2 md:hidden"
          />
          <CartProducts
            :cart="cart"
            class="lg:max-w-[418px]"
            :product-badge-settings="productBadgeSettings"
            :settings="settings"
          />
        </div>
        <CartSidebar
          class="basis-4/12 flex flex-col p-4 px-2 md:p-0"
          v-bind="{ cart, settings }"
          :order-limit="orderLimit"
          :order-limit-checkout-button="orderLimitCheckoutButton"
          :over-order-limit="overdOrderLimit"
          :vip-customer="vipCustomer"
          :waitlistText="waitlistText"
          :sold-out-text="soldOutText"
          :bisText="bisText"
          :preOrderText="preOrderText"
        />
      </div>
      <div
        v-else-if="cartIsEmpty"
        class="text-center mt-4 flex flex-col items-center pt-[88px] pb-32"
      >
        <EmptyCart :settings="emptyCartSettings" />
      </div>
    </template>
  </Transition>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { useCartStore } from "../stores/cart.js";
import {
  CartProducts,
  CartSidebar,
  EmptyCart,
  CartMessage,
} from "./CartComponents";

const cartStore = useCartStore();
const { cart } = storeToRefs(cartStore);

const cartHasItems = computed(() => {
  return cart.value.items && cart.value.items.length > 0;
});

const cartIsEmpty = computed(() => {
  return cart.value.items?.length == 0 && cart.value.item_count == 0;
});

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

const cartCount = computed(() => {
  const { cart_header_text } = settings.value;
  return `${cart_header_text}`;
});

const overdOrderLimit = computed(() => {
  const { item_count } = cart.value;
  return item_count > 15;
});
</script>

<style scoped>
.cart-enter-active,
.cart-leave-active {
  transition: opacity 0.5s ease;
}

.cart-enter-from,
.cart-leave-to {
  opacity: 0;
}
</style>
