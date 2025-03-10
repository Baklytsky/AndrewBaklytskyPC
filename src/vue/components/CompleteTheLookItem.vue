<template>
  <div class="flex w-full flex-col mb-10 sm:mb-6 pt-2">
    <div class="w-full flex flex-row gap-6 font-primary items-center">
      <div class="flex flex-row items-center gap-6">
        <a
          :href="currentProduct.url"
          class="ctl__product-image shrink-0 !block w-full max-w-[120px] max-h-[150px] md:max-w-[170px] md:max-h-[212px]"
        >
          <img
            v-bind="product_image"
            class="w-full aspect-square object-cover h-full"
            alt=""
          />
        </a>
        <div
          class="hidden xl:flex flex-col justify-between gap-2 mb-2 w-[130px]"
        >
          <a
            :href="currentProduct.url"
            class="text-lg sans-14"
            v-text="currentProduct.title.split('|')[0]"
          />
          <div v-if="currentColorLabel.length" class="mono-12 mb-2">
            Color:{{ currentColorLabel }}
          </div>
          <div class="flex flex-row flex-wrap gap-2 text-sm mono-12 text-right">
            <span
              class="whitespace-nowrap"
              data-price="{{product_price}}"
              :data-sale-price="
                product_compare_price && product_compare_price !== product_price
                  ? true
                  : null
              "
            >
              {{ $filters.moneyWithoutDecimals(product_price) }}
            </span>
            <s
              v-if="
                product_compare_price && product_compare_price != product_price
              "
              class="text-grey-500 whitespace-nowrap"
              data-price-compare
            >
              {{ $filters.moneyWithoutDecimals(product_compare_price) }}
            </s>
          </div>
          <div
            v-if="activateSaleEvent"
            class="flex mt-sm cursor-pointer mono-12"
            data-sale-event-tooltip
          >
            <span :style="{ color: saleEventTooltipColor }"
              >{{ $filters.moneyWithoutDecimals(saleEventPrice) }}
              <span class="text-[10px] uppercase font-normal tracking-[1.2px]">
                {{ saleEventTooltipCopy }}
              </span>
            </span>
          </div>
        </div>
      </div>
      <div
        class="flex flex-col gap-1 justify-between flex-1 py-[2px] md:py-[10px]"
      >
        <div class="flex flex-row justify-between gap-2 mb-2 xl:hidden">
          <a
            :href="currentProduct.url"
            class="text-lg sans-14"
            v-text="currentProduct.title.split('|')[0]"
          />
        </div>
        <div class="flex flex-col text-sm mono-12 text-right">
          <!--          <span class="whitespace-nowrap">-->
          <!--            {{ $filters.moneyWithoutDecimals(product_price) }}-->
          <!--          </span>-->
          <s
            v-if="
              product_compare_price && product_compare_price != product_price
            "
            class="text-grey-500 whitespace-nowrap"
          >
            {{ $filters.moneyWithoutDecimals(product_compare_price) }}</s
          >
        </div>
        <div
          v-if="activateSaleEvent"
          class="flex cursor-pointer mono-12 xl:hidden mb-2"
          data-sale-event-tooltip
        >
          <span :style="{ color: saleEventTooltipColor }"
            >{{ $filters.moneyWithoutDecimals(saleEventPrice) }}
            <span class="text-[10px] uppercase font-normal tracking-[1.2px]">
              {{ saleEventTooltipCopy }}
            </span>
          </span>
        </div>
        <div v-if="currentColorLabel.length" class="mono-12 mb-2 xl:hidden">
          Color:{{ currentColorLabel }}
        </div>
        <div
          class="flex flex-col text-sm mono-12 mb-[10px] text-left xl:hidden"
        >
          <span
            class="whitespace-nowrap"
            data-price="{{product_price}}"
            :data-sale-price="
              product_compare_price && product_compare_price !== product_price
                ? true
                : null
            "
          >
            {{ $filters.moneyWithoutDecimals(product_price) }}
          </span>
          <s
            v-if="
              product_compare_price && product_compare_price != product_price
            "
            class="text-grey-500 whitespace-nowrap"
            data-price-compare
          >
            {{ $filters.moneyWithoutDecimals(product_compare_price) }}
          </s>
        </div>
        <div v-if="showSiblingProducts">
          <TileColorPicker
            v-if="isParent || isChild"
            :product="product"
            :is-child="isChild"
            :current-product="currentProduct"
            @change-product="(product) => updateCurrentProduct(product)"
          />
        </div>
        <div
          class="gap-2 flex flex-row"
          v-if="hasVariants && currentProduct.available && vipCustomer"
        >
          <template v-for="(options, optionKey) in formattedOptions">
            <CartSwatchPicker
              v-if="swatchOptions.includes(optionKey)"
              :key="`swatch_${optionKey}`"
              label=""
              :options="options"
              :selected="selectedOptions[optionKey]"
              @change:option="
                (selected, option) =>
                  handleOptionSelect(optionKey, selected, option)
              "
            />

            <CartOptionPicker
              v-else
              label=""
              :key="`${optionKey}`"
              :options="options"
              class="w-full"
              :selected="selectedOptions[optionKey]"
              variant="dropdown"
              placeholderLabel="Size"
              :itemsPerRow="itemsPerRow"
              @change:option="
                (selected, option) =>
                  handleOptionSelect(optionKey, selected, option)
              "
            />
          </template>
        </div>
        <div v-if="currentVariant.available && vipCustomer">
          <button
            class="ra-button ra-button--full-width ra-button--sm mt-2 ra-button--secondary max-sm:mt-[2px]"
            @click="addToCart"
            :disabled="
              !variantSelected ||
              productMax ||
              !Object.values(selectedOptions).length ||
              currentVariantSoldOut
            "
          >
            {{ buttonLabel }}
          </button>
        </div>
        <div v-else-if="!currentVariant.available || !currentProduct.available">
          <button
            class="ra-button ra-button--full-width ra-button--sm mt-2 ra-button--secondary max-sm:mt-[2px] BIS"
            title="BIS"
            :disabled="
              productMax ||
              waitlistModalDisabled === 'true' ||
              (!Object.values(selectedOptions).length &&
                !AllSizesOutOfStockOrComingSoon) ||
              currentVariantSoldOut
            "
            @click="modalOpen = true"
          >
            {{ buttonLabel }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <Teleport to="body">
    <div v-if="modalOpen">
      <BackInStockForm
        :product="currentProduct"
        :selected-variant="{}"
        :vip-customer="vipCustomer"
        :close-modal="closeModal"
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
  </Teleport>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useCartStore } from "../stores/cart.js";
import { computed, reactive, ref } from "vue";
import { getSizedImageFromUrl } from "../filters/image.js";
import { CartSwatchPicker, CartOptionPicker } from "./CartComponents/index";
import { atcBuilder } from "../../js/utils/helpers";
import TileColorPicker from "./TileColorPicker.vue";
import BackInStockForm from "./BackInStockForm.vue";
import * as $filters from "../filters/money";

const props = defineProps({
  product: {
    type: Object,
  },
  vipCustomer: Boolean,
  showSiblingProducts: { type: Boolean },
  waitlistText: {
    type: String,
    default: "Waitlist for Early Access",
  },
  bisText: {
    type: String,
    default: "Sold Out - Join Waitlist",
  },
  soldOutText: {
    type: String,
    default: "Sold Out",
  },
  preOrderText: {
    type: String,
    default: "Pre-Order",
  },
  productBadgeSettings: String,
  waitlistModalTitle: { type: String },
  waitlistModalDescription: { type: String },
  waitlistModalDisabled: { type: String },
  waitlistModalLegalText: { type: String },
  waitlistModalCta: { type: String },
  bisModalTitle: { type: String },
  bisModalDescription: { type: String },
  bisModalLegalText: { type: String },
  bisModalCta: { type: String },
  enableSaleEvent: { type: Boolean },
  saleEventTooltipColor: { type: String },
  saleEventTooltipCopy: { type: String },
});

const cartStore = useCartStore();
// eslint-disable-next-line no-unused-vars
const { cart } = storeToRefs(cartStore);
const currentProduct = ref(props.product);
const variantSelected = ref(false);
const modalOpen = ref(false);
const isAddingToCart = ref(false);
const isParent = computed(() => {
  if (
    props.product.tags.includes("parent-product") &&
    props.product.child_products.length > 0
  )
    return true;
  return false;
});

const currentColorLabel = computed(() => {
  return currentProduct.value.title?.split("|")[1]?.trim() || "";
});

const isChild = computed(() => {
  if (props.product.parent_product) {
    return true;
  }
  return false;
});

const product_image = computed(() => {
  const image = {};
  if (currentProduct.value.looks_product_image.default) {
    image.src = currentProduct.value.looks_product_image.default[0]?.sizes.lg;
    image.alt = currentProduct.value.looks_product_image.default[0]?.alt;

    return image;
  }
  if (
    variantSelected.value &&
    currentVariant.value.images?.default?.sizes?.lg
  ) {
    image.src = currentVariant.value.images.default?.sizes.lg;
    image.alt = currentVariant.value.images.default?.alt;
  } else {
    image.src = small_product_image.value;
    image.alt = currentProduct.value.title;
  }
  return image;
});

const small_product_image = computed(() =>
  getSizedImageFromUrl(currentProduct.value.featured_image, "large")
);

const product_price = computed(() => {
  return variantSelected.value
    ? currentVariant.value.price
    : currentProduct.value.price;
});

const product_compare_price = computed(() => {
  return variantSelected.value
    ? currentVariant.value.compare_at_price
    : currentProduct.value.compare_at_price;
});

const hasVariants = computed(() => currentProduct.value?.variants?.length > 1);

const vipCustomer = computed(() => {
  if (currentProduct.value.coming_soon) return props.vipCustomer;
  return true;
});

const activateSaleEvent = computed(() => {
  return (
    props.enableSaleEvent &&
    (props.product?.sale_event_price > 0 ||
      props.product?.sale_event_discount > 0)
  );
});

const saleEventPrice = computed(() => {
  let price = product_price.value;

  if (props.product?.sale_event_price > 0) {
    price = props.product?.sale_event_price;
  }

  if (props.product?.sale_event_discount > 0) {
    const discount =
      product_price.value * (props.product?.sale_event_discount / 100);
    const discountedPrice = (product_price.value - discount) / 100;
    const ceilValue = Math.ceil(discountedPrice);
    price = ceilValue * 100;
  }

  return price;
});

const swatchOptions = ["Color"];

const itemsPerRow = "3";

// Set initial options from first_available_variant
const selectedOptions = reactive({});

const handleOptionSelect = (optionKey, selected, selectedOption) => {
  selectedOptions[optionKey] = selectedOption.value;
  variantSelected.value = true;
};

// const optionHasInStockVariant = (optionValue, optionKeyIndex) => {
//   // Get indices of variant option keys not currently selected
//   const variants = currentProduct.value.variants;
//   const optionKeyIndices = [0, 1, 2];
//   const currentOptionIndex = optionKeyIndices.splice(optionKeyIndex, 1)[0];
//
//   // Find the variant that matches the optionValue passed in along with the currentvariant's remaining selected options,
//   // check availability and return a Boolean
//   const filteredAvailableVariants = variants
//     .filter((variant) => {
//       const options = variant.options.filter((option) => option);
//       const currentVariantOptions = currentVariant.value.options.filter(
//         (option) => option
//       );
//       return (
//         options[optionKeyIndices[0]] ===
//           currentVariantOptions[optionKeyIndices[0]] &&
//         options[optionKeyIndices[1]] ===
//           currentVariantOptions[optionKeyIndices[1]] &&
//         variant.available
//       );
//     })
//     .some((variant) => variant.options[currentOptionIndex] === optionValue);
//   return filteredAvailableVariants;
// };

// Set keyed object for all option values and disabled state
const formattedOptions = computed(() => {
  const formattedOptions = {};
  currentProduct.value.options.forEach((option) => {
    formattedOptions[option] = [];

    currentProduct.value.options_with_values[option].forEach((value) => {
      // const optionIsAvailable = optionHasInStockVariant(value, optionIndex);
      formattedOptions[option].push({
        label: value,
        value,
        disabled: false,
      });
    });
  });

  return formattedOptions;
});

const hasComplexVariants = computed(() => {
  return currentProduct.value
    ? currentProduct.value.options?.length > 1
    : false;
});

const currentVariant = computed(() => {
  let currentVariant = currentProduct.value?.variants?.[0];
  if (hasComplexVariants.value) {
    if (currentProduct.value.options.length > 2) {
      currentVariant = currentProduct.value.variants.find(
        (variant) =>
          variant.option1 === Object.values(selectedOptions)[0] &&
          variant.option2 === Object.values(selectedOptions)[1] &&
          variant.option3 === Object.values(selectedOptions)[2]
      );
    } else {
      currentVariant = currentProduct.value.variants.find(
        (variant) =>
          variant.option1 === Object.values(selectedOptions)[0] &&
          variant.option2 === Object.values(selectedOptions)[1]
      );
    }
  } else if (currentProduct.value.variants_count > 1) {
    currentVariant = currentProduct.value.variants.find(
      (variant) => variant.option1 === Object.values(selectedOptions)[0]
    );
  }
  return currentVariant || currentProduct.value.first_available_variant;
});

const isPreOrder = computed(() => currentProduct.value.pre_order);

const currentVariantSoldOut = computed(() => {
  if (!currentVariant.value.available && props.product?.no_waitlist) {
    return true;
  }
  return false;
});

const productMax = computed(() => {
  let reachedMax = false;

  if (cartStore.cart.items) {
    const cartProduct = cartStore.cart.items.find(
      (item) => item.id === currentVariant.value.id
    );
    if (cartProduct?.quantity >= 2 && Object.values(selectedOptions).length) {
      reachedMax = true;
    }
  }
  return reachedMax;
});

const AllSizesOutOfStockOrComingSoon = computed(() => {
  return AllSizesOutOfStock.value || isComingSoon.value;
});

const AllSizesOutOfStock = computed(() => {
  return totalInventoryCount.value < 1;
});

const isComingSoon = computed(() => {
  return props.product.coming_soon;
});

const isGiftCardTemplate = computed(() => {
  return window.location.pathname.includes("gift-card");
});

const buttonLabel = computed(() => {
  if (!currentProduct.value.available && currentProduct.value?.no_waitlist)
    return props?.soldOutText;
  if (
    !Object.values(selectedOptions).length &&
    !AllSizesOutOfStockOrComingSoon.value &&
    !isGiftCardTemplate.value
  ) {
    return "Select Size";
  }
  if (!Object.values(selectedOptions).length && isGiftCardTemplate.value)
    return "Select Amount";
  if (currentProduct.value?.coming_soon && !currentProduct.value.vipCustomer)
    return props?.waitlistText;
  if (currentVariantSoldOut.value) return props?.soldOutText;
  if (!currentVariant.value.available) return props?.bisText;
  if (productMax.value) return "Max Quantity (2) in cart";
  if (isPreOrder.value) return props?.preOrderText;
  return isAddingToCart.value ? "Adding..." : "Add to Bag";
});

const totalInventoryCount = computed(() => {
  let totalQuantity = 0;

  if (currentProduct.value?.variants) {
    currentProduct.value.variants.forEach((variant) => {
      totalQuantity += variant.inventory_quantity;
    });
  }
  return totalQuantity;
});

const badgeText = computed(() => {
  if (currentProduct.value.custom_badge) {
    return currentProduct.value.custom_badge;
  } else if (currentProduct.value.pre_order) {
    return "pre-order";
  } else if (
    totalInventoryCount.value < 1 &&
    currentProduct.value.coming_soon
  ) {
    return "waitlist";
  } else if (totalInventoryCount.value < 1) {
    return "sold out";
  } else if (
    totalInventoryCount.value < currentProduct.value.few_items_left_quantity
  ) {
    return "Few items left";
  } else if (
    totalInventoryCount.value < currentProduct.value.selling_fast_quantity
  ) {
    return "Selling fast";
  } else if (
    !currentProduct.value.few_items_left_quantity &&
    totalInventoryCount.value < window.GLBE_SETTINGS.fewItemsLeft
  ) {
    return "Few items left";
  } else if (
    !currentProduct.value.selling_fast_quantity &&
    totalInventoryCount.value < window.GLBE_SETTINGS.sellingFast
  ) {
    return "Selling fast";
  } else {
    return false;
  }
});

const updateCurrentProduct = (product) => {
  currentProduct.value = product;
};

const addToCart = async () => {
  isAddingToCart.value = true;
  const itemProps = atcBuilder({
    tags: currentProduct.value.tags,
    currentVariant: currentVariant.value.id,
    isPreOrder: isPreOrder.value,
    shipOnDate: currentProduct.value.ship_on_date,
    productId: currentProduct.value.id,
    fewItemsLeft: currentProduct.value.few_items_left_quantity,
    sellingFast: currentProduct.value.selling_fast_quantity,
    badge: badgeText.value,
    compareAtPrice: currentVariant.value.compare_at_price,
  });
  await cartStore.addItem(itemProps);
  isAddingToCart.value = false;
};

const closeModal = () => {
  modalOpen.value = false;
};
</script>
