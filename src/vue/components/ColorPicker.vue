<template>
  <div class="mb-6 lg:mb-8 ra-product-tile__options-item">
    <div>
      <p class="mono-12 text-stroke-primary mb-4 ra-product-tile__label">
        Color: {{ currentColorLabel || "" }}
      </p>
    </div>
    <div
      class="ra-product-tile__swatches flex flex-row flex-wrap gap-4 mt-4 md:mt-6"
    >
      <ColorSwatch
        :product="product"
        :activeColor="currentColorLabel"
        @update-product="handleUpdateProduct"
      />
      <ColorSwatch
        v-for="cp in product.child_products"
        :key="cp.id"
        :product="cp"
        :activeColor="currentColorLabel"
        @update-product="handleUpdateProduct"
      />
    </div>
  </div>
</template>
<script setup>
import ColorSwatch from "./ColorSwatch.vue";
import { computed } from "vue";

const props = defineProps({
  product: Object,
});

const isActive = computed(() => window.location.pathname === props.product.url);

const cpIsActive = (cp) => {
  if (!isActive.value) {
    return window.location.pathname === cp.url;
  }
  return false;
};

const displayedChildProducts = computed(() => {
  if (!isActive.value) {
    return props.product.child_products.filter((cp) => cpIsActive(cp));
  }
  return false;
});

const currentActiveLabel = computed(() =>
  isActive.value ? props.product.title : displayedChildProducts.value[0]?.title
);

const currentColorLabel = computed(
  () => currentActiveLabel?.value?.split("|")[1]?.trim() || ""
);

const emit = defineEmits(["update-product"]);

const handleUpdateProduct = (data) => {
  emit("update-product", data);
};
</script>
