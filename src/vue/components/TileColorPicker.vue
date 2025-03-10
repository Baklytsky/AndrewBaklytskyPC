<template>
  <div v-if="isChild" class="flex flex-row flex-wrap gap-2 my-1">
    <TileColorSwatch
      :product="product.parent_product"
      :current-product="currentProduct"
      @click="$emit('changeProduct', product.parent_product)"
    />
    <TileColorSwatch
      v-for="cp in product.parent_product.child_products"
      :key="cp.id"
      :product="cp"
      :current-product="currentProduct"
      @click="$emit('changeProduct', cp)"
    />
  </div>
  <div v-else class="flex flex-row gap-2 my-1">
    <TileColorSwatch
      :product="product"
      :current-product="currentProduct"
      @click="$emit('changeProduct', product)"
    />
    <TileColorSwatch
      v-for="cp in product.child_products"
      :key="cp.id"
      :product="cp"
      :current-product="currentProduct"
      @click="$emit('changeProduct', cp)"
    />
  </div>
</template>
<script setup>
import TileColorSwatch from "./TileColorSwatch.vue";

defineProps({
  product: Object,
  currentProduct: Object,
  isChild: Boolean,
});
</script>
