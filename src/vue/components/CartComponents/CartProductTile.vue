<template>
  <RaBadge
    v-if="badgeText"
    size="md"
    class="uppercase rounded primary-font ra-cart-product__badge"
  >
    {{ badgeText }}
  </RaBadge>
  <div
    class="w-full flex flex-col font-primary pt-2 pb-6 ra-cart-product-tile__container"
  >
    <div class="w-full flex flex-row gap-4 relative">
      <div v-if="isInsurance" class="!block w-[64px] h-[80px]">
        <img
          v-bind="product_image"
          class="w-full aspect-square h-full object-cover"
        />
      </div>
      <a v-else :href="product.url" class="!block w-[64px] h-[80px]">
        <img
          v-bind="product_image"
          class="w-full aspect-square h-full object-cover"
        />
      </a>
      <div class="flex flex-col gap-1 justify-between flex-1">
        <span
          v-if="isInsurance"
          class="text-base sans-14"
          v-html="productTitle"
        ></span>
        <a
          v-else
          :href="product.url"
          class="text-base sans-14"
          v-html="productTitle"
        />
        <div
          class="flex flex-row justify-between md:flex-col ra-cart-product-tile__options"
          :style="{
            visibility: isInsurance ? 'hidden' : 'visible',
          }"
        >
          <div
            v-for="(option, i) in product.options_with_values"
            :key="product.handle + '-' + i"
            class="flex-col text-primary text-sm font-light mono-12"
            :class="{
              '': i != 0,
            }"
          >
            {{ option.name }}
            <span class="text-primary">{{ option.value }}</span>
          </div>
        </div>
        <div
          v-if="productColor"
          class="flex flex-row justify-between md:flex-col ra-cart-product-tile__options"
        >
          <div class="flex-col text-primary text-sm font-light mono-12">
            Color
            <span class="text-primary">{{ productColor }}</span>
          </div>
        </div>
        <div v-if="hasShipOnDate">
          <p class="text-primary text-sm font-light mono-12">
            Ships by {{ product.properties["SHIPS-BY"] }}
          </p>
        </div>
        <div class="flex flex-col gap-1 justify-between">
          <p
            v-if="
              product?.properties &&
              product?.properties['Recipient name'] !== undefined
            "
            class="text-primary text-sm font-light mono-12"
          >
            name: {{ product?.properties["Recipient name"] }}
          </p>
          <p
            v-if="
              product?.properties &&
              product?.properties['Recipient email'] !== undefined
            "
            class="text-primary text-sm font-light mono-12"
          >
            email: {{ product?.properties["Recipient email"] }}
          </p>
          <p
            v-if="
              product?.properties &&
              product?.properties['Message'] !== undefined
            "
            class="text-primary text-sm font-light mono-12"
          >
            message: {{ product?.properties["Message"] }}
          </p>
          <p
            v-if="
              product?.properties && product?.properties['From'] !== undefined
            "
            class="text-primary text-sm font-light mono-12"
          >
            from: {{ product?.properties["From"] }}
          </p>
        </div>
        <QuantityAdjuster
          class="mt-1"
          @quantity-updated="updateQuantity"
          :quantity="qty"
          :reached-cart-max="reactCartMax"
          :style="{
            visibility: isInsurance ? 'hidden' : 'visible',
          }"
        />
      </div>
      <div
        class="flex flex-col justify-end items-end absolute bottom-0 right-0"
      >
        <!-- trashcan icon disabled
        <span
          class="ra-button ra-icon-button ra-button--tertiary ra-icon-button--md group"
          @click="updateQuantity(0)"
        >
          <svg
            width="12"
            height="16"
            viewBox="0 0 12 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="group-hover:fill-white fill-tertiary-900 transition-all"
          >
            <path d="M11 16L1 16L1 4L11 4L11 16Z" />
            <path d="M9 1L12 1V3L0 3L0 1L3 1L4 0L8 0L9 1Z" />
          </svg>
        </span> -->
        <div class="flex-row text-sm mono-12">
          {{ $filters.moneyWithoutDecimals(product.final_line_price) }}
          <s v-if="product.original_line_price != product.final_line_price">{{
            $filters.moneyWithoutDecimals(product.original_line_price)
          }}</s>
          <s
            v-else-if="
              product.properties?._COMPARE_AT_PRICE * product.quantity >
              product.final_line_price
            "
            >{{
              $filters.moneyWithoutDecimals(
                product.properties?._COMPARE_AT_PRICE * product.quantity
              )
            }}</s
          >
        </div>
      </div>
    </div>
    <div v-if="isSubscriptionProduct" class="border border-grey-400 p-3 mt-4">
      <div
        class="ra-choice ra-choice--radio ra-choice--classic ra-choice--radio-classic"
      >
        <input
          :id="product.handle + '-' + product.id"
          type="radio"
          class="ra-choice__input"
        />
        <label
          :for="product.handle + '-' + product.id"
          class="ra-choice__label-container ra-choice__container set--sibling-deep-focus"
        >
          <div
            class="ra-choice__checkmark set--inherit-focus bg-white focus:bg-white"
          >
            <span class="ra-choice__checkmark-icon"></span>
          </div>
          <span class="ra-choice__label">Subscribe & Save 15%</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { useCartStore } from "../../stores/cart.js";
import { getSizedImageFromUrl } from "../../filters/image.js";
import QuantityAdjuster from "../QuantityAdjuster.vue";
import { dataRemoveFromCart } from "../datalayer/";
import { RaBadge } from "@bva/ui-vue";

const props = defineProps({
  product: {
    type: Object,
    default: () => {},
  },
  settings: {
    type: Object,
    default: () => {},
  },
  qty: {
    type: Number,
  },
  productBadgeSettings: String,
});

const cartStore = useCartStore();
const { cart } = storeToRefs(cartStore);

const product_image = computed(() => {
  const img = {};
  img.src = small_image.value;
  img.alt = props.product.featured_image.alt;
  return img;
});

const isPreOrder = computed(() => {
  if (
    props.product?.properties?._BADGE &&
    props.product?.properties?._BADGE.toLowerCase() == "pre-order"
  ) {
    return true;
  }
  return false;
});

// const isDelayed = computed(() => {
//   return props.product?.properties?.DELAYED;
// });

const hasShipOnDate = computed(() => {
  // const isPreOrderOrWaitlist = isPreOrder.value || isDelayed.value;
  // if (props.product?.properties && props.product?.properties["SHIPS-BY"] && isPreOrderOrWaitlist) {
  //   return true;
  // }
  // return false;
  return props.product?.properties && props.product?.properties["SHIPS-BY"];
});

const small_image = computed(() =>
  getSizedImageFromUrl(props.product.featured_image.url, "large")
);

const productColor = computed(() => {
  const color = props.product.product_title?.split("|")[1];
  if (color) return color;
  return false;
});

const inventoryCount = computed(() => {
  if (cart.settings?.items) {
    const cartItem = cart.settings.items.find((item) => {
      const variantIds = item.variants.map((variant) => {
        return variant.id;
      });
      return variantIds.includes(props.product.id);
    });
    const totalInventories = cartItem.variants.map((variant) => {
      return variant.inventory_quantity;
    });
    return totalInventories.reduce((partialSum, a) => partialSum + a, 0);
  }
  return 0;
});

const reactCartMax = computed(() => cart.value.item_count >= 10);

const productTitleWithColor = props.product.title.split(" - ")[0];
const productTitle = productTitleWithColor.split("|")[0];

const updateQuantity = (qty) => {
  const productObj = {
    id: props.product.key.toString(),
    quantity: qty,
  };
  if (qty < props.product.quantity) dataRemoveFromCart(props.product);
  cartStore.updateItem(productObj).then((cart) => {
    const event = new CustomEvent("cartUpdated", {
      detail: { item_count: cart.item_count },
    });
    window.dispatchEvent(event);
  });
};

const isInsurance = computed(() => {
  return (
    props.product.product_type === "Insurance" ||
    props.product.product_type === "insurance"
  );
});

const badgeText = computed(() => {
  if (isInsurance.value) {
    return "protected";
  } else if (props.product.properties?._BADGE) {
    return props.product.properties._BADGE;
  } else if (isPreOrder.value) {
    return "pre-order";
  } else if (
    inventoryCount.value < 1 &&
    props.product.properties._tag == "coming-soon"
  ) {
    return "waitlist";
  } else if (inventoryCount.value < 1) {
    return "sold out";
  } else if (inventoryCount.value < props.product.properties?._fewItemsLeft) {
    return "Few items left";
  } else if (inventoryCount.value < props.product.properties?._sellingFast) {
    return "Selling fast";
  } else if (
    !props.product?.properties?._fewItemsLeft &&
    inventoryCount.value < window.GLBE_SETTINGS?.fewItemsLeft
  ) {
    return "Few items left";
  } else if (
    !props.product.properties?._sellingFast &&
    inventoryCount.value < window.GLBE_SETTINGS?.sellingFast
  ) {
    return "Selling fast";
  } else {
    return false;
  }
});

const isSubscriptionProduct = false;
</script>
