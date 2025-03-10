<template>
  <button
    class="ra-button ra-cart__cta ra-button--full-width ra-button--sm ra-button--primary text-[16px]"
    :class="containerClasslist"
    @click="navigateToCheckout"
    :disabled="overOrderLimit"
  >
    {{ buttonText }}
  </button>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  checkoutReady: {
    type: Boolean,
    default: false,
  },
  containerClasslist: {
    type: String,
    default: "",
  },
  orderLimitCheckoutButton: String,
  overOrderLimit: Boolean,
});

const buttonText = computed(() => {
  if (props.overOrderLimit) return props.orderLimitCheckoutButton;
  return "Checkout";
});

const navigateToCheckout = () => {
  if (props.checkoutReady) {
    window.location.href = "/checkout";
  }
};
</script>
