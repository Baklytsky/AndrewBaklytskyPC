<template>
  <div>
    <div v-for="(product, i) in cart.items" :key="product.handle + '-' + i">
      <CartProductTile
        :product="product"
        :qty="product.quantity"
        :product-badge-settings="productBadgeSettings"
        :settings="settings"
      />
    </div>
  </div>
</template>

<script setup>
import { CartProductTile } from "./";

defineProps({
  settings: {
    type: Object,
    default: () => {},
  },
  cart: {
    type: Object,
    default: () => {},
  },
  productBadgeSettings: String,
});
</script>
