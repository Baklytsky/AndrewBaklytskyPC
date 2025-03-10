<template>
  <ra-cart-toggle>
    <a
      class="header__action-link relative flex items-center justify-center w-[44px] h-[44px] rounded-full"
      :class="[
        cartCount ? 'item-in-cart' : '',
        useCartTitle === 'true' ? '' : 'slide-out-cart',
      ]"
      href="/cart"
      title="cart"
      aria-label="cart"
      data-toggle-cart
    >
      <span
        v-if="useCartTitle === 'true'"
        class="cursor-pointer header__action-link-title"
        :style="{ color: iconColor }"
        >Cart</span
      >
      <RaIcon v-else size="17px" class="cursor-pointer" :color="iconColor">
        <svg>
          <use xlink:href="#cart"></use>
        </svg>
      </RaIcon>
    </a>
  </ra-cart-toggle>
</template>
<script setup>
import { storeToRefs } from "pinia";
import { RaIcon } from "@bva/ui-vue";
import { computed } from "vue";
import { useCartStore } from "../stores/cart.js";

const cartStore = useCartStore();
const { cart } = storeToRefs(cartStore);

// eslint-disable-next-line no-unused-vars
const props = defineProps({
  iconColor: String,
  useCartTitle: String,
});

const cartCount = computed(() => {
  const { item_count } = cart.value;
  return !!item_count;
});
</script>
