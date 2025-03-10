<template>
  <div :class="containerClasslist">
    <h5 class="text-left mono-12 text-transform--uppercase mb-6">
      {{ title }}
    </h5>
    <CartUpsellTile
      :product="product"
      :order-limit="orderLimit"
      :vip-customer="vipCustomer"
      :waitlistText="waitlistText"
      :sold-out-text="soldOutText"
      :bisText="bisText"
      :preOrderText="preOrderText"
    />
  </div>
</template>

<script setup>
import { useCartStore } from "../../stores/cart.js";
import { computed } from "vue";
import { CartUpsellTile } from "./";

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
  title: {
    type: String,
    default: "YOU MAY ALSO LIKE",
  },
  orderLimit: String,
  vipCustomer: Boolean,
  waitlistText: String,
  soldOutText: String,
  bisText: String,
  preOrderText: String,
});

const cartStore = useCartStore();

const items = computed(() => cartStore.cart.items);

// eslint-disable-next-line no-unused-vars
const upsellItemInCart = computed(() =>
  items.value.some((item) => item.handle == props.product.handle)
);
</script>
