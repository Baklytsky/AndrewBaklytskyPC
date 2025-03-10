<template>
  <div
    class="tile__color-swatch relative cursor-pointer w-4 h-4 rounded-full"
    :class="{ active: isActive, unavailable: isUnavailable }"
    data-product-swatch
  >
    <img
      :src="product.color_swatch"
      class="w-4 h-4 rounded-full"
      width="auto"
      height="auto"
    />
  </div>
</template>
<script setup>
import { computed } from "vue";

const props = defineProps({
  product: Object,
  currentProduct: Object,
});

const isActive = computed(() => {
  if (props.product.id === props.currentProduct.id) return true;
  return false;
});
const isUnavailable = computed(() => {
  if (props.product.available === false) return true;
  return false;
});
</script>
