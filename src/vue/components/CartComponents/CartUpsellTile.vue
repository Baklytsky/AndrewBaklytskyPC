<template>
  <div class="flex w-full flex-col p-4 surfaces-light rounded-[12px]">
    <div class="w-full flex flex-row gap-4 font-primary">
      <a :href="currentProduct.url" class="!block max-w-[112px]">
        <img v-bind="product_image" class="w-[64px] h-[80px] object-cover" />
      </a>
      <div class="flex flex-col gap-1 justify-between flex-1">
        <div class="flex flex-row justify-between gap-2">
          <a
            :href="currentProduct.url"
            class="text-lg sans-14"
            v-text="currentProduct.title.split('|')[0]"
          />
          <div
            class="flex flex-col text-sm mono-12 text-right !font-light"
            :class="{
              'text-red':
                product_compare_price && product_compare_price != product_price,
            }"
          >
            {{ $filters.moneyWithoutDecimals(product_price) }}
            <s
              v-if="
                product_compare_price && product_compare_price != product_price
              "
              class="text-grey-500"
              >{{ $filters.moneyWithoutDecimals(product_compare_price) }}</s
            >
          </div>
        </div>
        <TileColorPicker
          v-if="isParent || isChild"
          :product="product"
          :is-child="isChild"
          :current-product="currentProduct"
          @change-product="(product) => updateCurrentProduct(product)"
        />
        <div
          class="gap-2 flex flex-col"
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
              :selected="selectedOptions[optionKey]"
              variant="dropdown"
              placeholderLabel="Select Size"
              :itemsPerRow="itemsPerRow"
              @change:option="
                (selected, option) =>
                  handleOptionSelect(optionKey, selected, option)
              "
            />
          </template>
        </div>
        <div v-else>
          <a
            :href="currentProduct.url"
            class="looks__oos-btn ra-button--sm flex items-center px-3 ra-button--secondary h-[44px] w-full"
          >
            {{ soldOutBtn }}
          </a>
        </div>
      </div>
    </div>
    <div v-if="displayCta">
      <button
        class="ra-button ra-button--full-width ra-button--sm mt-2 ra-button--primary"
        @click="addToCart"
        v-text="buttonLabel"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch, ref, onMounted } from "vue";
import { useCartStore } from "../../stores/cart.js";
import { useProductPageStore } from "../../stores/productPage.js";
import { getSizedImageFromUrl } from "../../filters/image.js";
import { CartSwatchPicker, CartOptionPicker } from "./";
import { atcBuilder } from "../../../js/utils/helpers";
import TileColorPicker from "../TileColorPicker.vue";

const cartStore = useCartStore();

const props = defineProps({
  product: {
    type: Object,
  },
  orderLimit: String,
  vipCustomer: Boolean,
  waitlistText: String,
  soldOutText: String,
  bisText: String,
  preOrderText: String,
});

const currentProduct = ref(props.product);

const isPreOrder = computed(() => currentProduct.value.pre_order);

const updateCurrentProduct = (product) => {
  currentProduct.value = product;
};

// eslint-disable-next-line no-unused-vars
const hasShipOnDate = computed(() => !!currentProduct.value.ship_on_date);

const product_image = computed(() => {
  const image = {};
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
  return variantSelected.value ? currentVariant.value.compare_at_price : null;
});

// eslint-disable-next-line no-unused-vars
const product_link = computed(() => {
  return variantSelected.value
    ? currentVariant.value.url
    : `/products/${currentProduct.value.handle}`;
});

const vipCustomer = computed(() => {
  if (currentProduct.value.coming_soon) return props.vipCustomer;
  return true;
});

const hasVariants = computed(() => currentProduct.value?.variants?.length > 1);

const displayCta = computed(() => {
  if (!selectedOptions["SIZE"]) {
    /* empty */
  }
  return hasVariants.value
    ? optionsSelected.value.length === variantOptions.value
    : true;
});

const isParent = computed(() => {
  if (
    props.product.tags.includes("parent-product") &&
    props.product.child_products.length > 0
  ) {
    return true;
  }
  return false;
});

const isChild = computed(() => {
  if (props.product.parent_product) {
    return true;
  }
  return false;
});

const variantSelected = ref(false);

const swatchOptions = ["Color"];

const itemsPerRow = "3";

// Set initial options from first_available_variant
const selectedOptions = reactive({});

const handleOptionSelect = (optionKey, selected, selectedOption) => {
  if (!optionsSelected.value.includes(optionKey))
    optionsSelected.value.push(optionKey);
  selectedOptions[optionKey] = selectedOption.value;
};

const optionHasInStockVariant = (optionValue, optionKeyIndex) => {
  // Get indices of variant option keys not currently selected
  const variants = currentProduct.value.variants;
  const optionKeyIndices = [0, 1, 2];
  const currentOptionIndex = optionKeyIndices.splice(optionKeyIndex, 1)[0];

  // Find the variant that matches the optionValue passed in along with the currentvariant's remaining selected options,
  // check availability and return a Boolean
  const filteredAvailableVariants = variants
    .filter((variant) => {
      const options = variant.options.filter((option) => option);
      const currentVariantOptions = currentVariant.value.options.filter(
        (option) => option
      );
      return (
        options[optionKeyIndices[0]] ===
          currentVariantOptions[optionKeyIndices[0]] &&
        options[optionKeyIndices[1]] ===
          currentVariantOptions[optionKeyIndices[1]] &&
        variant.available
      );
    })
    .some((variant) => variant.options[currentOptionIndex] === optionValue);
  return filteredAvailableVariants;
};
// Set keyed object for all option values and disabled state
const formattedOptions = computed(() => {
  const formattedOptions = {};

  currentProduct.value.options.forEach((option, optionIndex) => {
    formattedOptions[option] = [];

    currentProduct.value.options_with_values[option].forEach((value) => {
      const optionIsAvailable = optionHasInStockVariant(value, optionIndex);
      formattedOptions[option].push({
        label: value,
        value,
        disabled: !optionIsAvailable,
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

const buttonLabel = computed(() => {
  if (!currentProduct.value.available && !currentProduct.value.coming_soon)
    return props.soldOutText == "" ? "Sold Out" : props.soldOutText;
  if (isPreOrder.value)
    return props.preOrderText == "" ? "Pre-Order" : props.preOrderText;
  return isAddingToCart.value ? "Adding..." : "Add to Bag";
});

const soldOutBtn = computed(() => {
  if (!currentProduct.value.available && currentProduct.value.no_waitlist)
    return props.soldOutText == "" ? "Sold Out" : props.soldOutText;
  if (!currentProduct.value.available && !currentProduct.value.coming_soon)
    return props.bisText == "" ? "Sold Out - Join Waitlist" : props.bisText;
  return currentProduct.value.coming_soon
    ? props.waitlistText == ""
      ? "Waitlist for Early Access"
      : props.waitlistText
    : props.bisText;
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

const productStore = useProductPageStore();
const isAddingToCart = ref(false);
const addToCart = async () => {
  const itemProps = atcBuilder({
    tags: currentProduct.value.tags,
    currentVariant: currentVariant.value.id,
    isPreOrder: isPreOrder.value,
    shipOnDate: currentProduct.value.ship_on_date,
    fewItemsLeft: currentProduct.value.few_items_left_quantity,
    sellingFast: currentProduct.value.selling_fast_quantity,
    badge: badgeText.value,
    compareAtPrice: currentVariant.value.compare_at_price,
  });

  isAddingToCart.value = true;
  await cartStore.addItem(itemProps);
  isAddingToCart.value = false;
};

const variantOptions = computed(() => currentProduct.value.options.length);
const optionsSelected = ref([]);

watch(currentVariant, (variant) => {
  variantSelected.value = true;
  productStore.setCurrentVariant(variant);
});

watch(currentProduct, () => {
  selectedOptions["SIZE"] = "";
  optionsSelected.value = [];
});

onMounted(() => {
  variantSelected.value = !hasComplexVariants.value;
});
</script>
