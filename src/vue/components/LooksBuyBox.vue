<template>
  <div class="h-full flex flex-col justify-between">
    <div>
      <h1
        class="text-left mono-48 !font-thin text-transform--uppercase mb-[42px] text-stroke-primary"
      >
        Shop<br />
        the look
      </h1>
      <div v-for="(prod, i) in products" :key="prod.handle + '-' + i">
        <LooksProductTile
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
        />
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
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useCartStore } from "../stores/cart.js";
import { computed, ref } from "vue";
import LooksProductTile from "./LooksProductTile.vue";

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
});

const cartStore = useCartStore();

// eslint-disable-next-line no-unused-vars
const { cart } = storeToRefs(cartStore);

const enableCta = computed(() => {
  return selectedProducts.value.length > 0;
});

const ctaText = computed(() => {
  return selectedProducts.value.length > 0 ? "Add to Bag" : "Select Sizes";
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
  await cartStore.addItems(prodData);
  isAddingToCart.value = false;
  //clear selected products
  selectedProducts.value = [];
  //trigger submitted value to change, so product tiles watching this prop will reset
  submitted.value = !submitted.value;
};
</script>
