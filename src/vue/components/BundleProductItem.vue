<template>
  <RaBadge
    v-if="badgeText"
    size="md"
    class="font-primary looks_product-quantity-badge uppercase rounded inline"
  >
    {{ badgeText }}
  </RaBadge>
  <div class="flex w-full flex-col mb-10 sm:mb-6 pt-2">
    <div class="w-full flex flex-row gap-6 font-primary items-center">
      <a
        :href="currentProduct.url"
        class="aspect-[9/12] !block w-full max-w-[90px] max-h-[120px]"
      >
        <img
          v-bind="product_image"
          class="w-full aspect-square object-cover h-full"
        />
      </a>
      <div
        class="flex flex-col gap-1 justify-between flex-1 py-[2px] md:py-[10px]"
      >
        <div
          class="flex flex-row justify-between gap-2"
          :class="[isParent ? '' : 'mb-4']"
        >
          <a
            :href="currentProduct.url"
            class="text-lg sans-14 text-stroke-primary"
            v-text="currentProduct.title.split('|')[0]"
          />
          <div
            class="flex flex-col text-sm mono-12 text-right text-stroke-primary"
          >
            <span class="whitespace-nowrap">
              {{ $filters.moneyWithoutDecimals(product_price) }}
            </span>
            <s
              v-if="
                product_compare_price && product_compare_price != product_price
              "
              class="text-grey-500 whitespace-nowrap"
              >{{ $filters.moneyWithoutDecimals(product_compare_price) }}</s
            >
          </div>
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
        <TileColorPicker
          v-if="isParent || isChild"
          :product="product"
          :is-child="isChild"
          :current-product="currentProduct"
          @change-product="(product) => updateCurrentProduct(product)"
        />
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
              placeholderLabel="Select Size"
              :itemsPerRow="itemsPerRow"
              @change:option="
                (selected, option) =>
                  handleOptionSelect(optionKey, selected, option)
              "
            />
          </template>
          <button
            v-if="currentVariant.image"
            class="looks__remove-btn ra-button--sm ra-button--secondary rounded-full w-[44px] h-[44px] flex justify-center items-center"
            @click="removeProd"
          >
            <RaIcon icon="minus" />
          </button>
        </div>
        <div
          v-else-if="!currentProduct.available && !currentProduct.coming_soon"
        >
          <button
            class="looks__oos-btn ra-button--sm flex items-center px-3 ra-button--secondary h-[44px] w-full AV"
            :title="buttonText"
            @click="modalOpen = true"
          >
            {{ buttonText }}
          </button>
        </div>
        <div v-else>
          <button
            class="looks__oos-btn ra-button--sm flex items-center px-3 ra-button--secondary h-[44px] w-full CS"
            title="BIS"
            @click="modalOpen = true"
          >
            {{ buttonText }}
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
import { computed, reactive, watch, ref, onMounted } from "vue";
import { RaIcon } from "../../../@bva/ui-vue";
import { RaBadge } from "../../../@bva/ui-vue";
import { useProductPageStore } from "../stores/productPage.js";
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
  addProduct: {
    type: Function,
  },
  deselectProduct: {
    type: Function,
  },
  submitted: {
    type: Boolean,
  },
  vipCustomer: Boolean,
  waitlistText: {
    type: String,
    default: "Waitlist for Early Access",
  },
  bisText: {
    type: String,
    default: "Sold Out - Join Waitlist",
  },
  soldOutText: String,
  productBadgeSettings: String,
  waitlistModalTitle: { type: String },
  waitlistModalDescription: { type: String },
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

const currentProduct = ref(props.product);
const modalOpen = ref(false);

const updateCurrentProduct = (product) => {
  currentProduct.value = product;
};

const removeProd = () => {
  selectedOptions["SIZE"] = "";
  props.deselectProduct(currentProduct.value.id);
};

const closeModal = () => {
  modalOpen.value = false;
};

const isPreOrder = computed(() => currentProduct.value.pre_order);

const buttonText = computed(() => {
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

// eslint-disable-next-line no-unused-vars
const hasShipOnDate = computed(() => !!currentProduct.value.ship_on_date);

const isParent = computed(() => {
  if (
    props.product.tags.includes("parent-product") &&
    props.product.child_products.length > 0
  )
    return true;
  return false;
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

const hasVariants = computed(() => currentProduct.value?.variants?.length > 1);

const vipCustomer = computed(() => {
  if (currentProduct.value.coming_soon) return props.vipCustomer;
  return true;
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

  if (selectedOption.value === "") {
    removeProd(currentProduct.value);
  }
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

const optionsSelected = ref([]);

watch(currentProduct, (newProduct, oldProduct) => {
  selectedOptions["SIZE"] = "";
  props.deselectProduct(oldProduct.id);
});

watch(currentVariant, (variant) => {
  variantSelected.value = true;
  productStore.setCurrentVariant(variant);

  if (variant.image != undefined) {
    const itemProps = atcBuilder({
      tags: currentProduct.value.tags,
      currentVariant: currentVariant.value.id,
      isPreOrder: isPreOrder.value,
      shipOnDate: currentProduct.value.ship_on_date,
      productId: currentProduct.value.id,
      fewItemsLeft: currentProduct.value.few_items_left_quantity,
      sellingFast: currentProduct.value.selling_fast_quantity,
      badge: badgeText.value,
      isBundle: true,
      compareAtPrice: currentVariant.value.compare_at_price,
    });

    props.addProduct(itemProps);
  }
});

// Watch for submitted prop to change and reset selector.
watch(
  () => props.submitted,
  () => {
    selectedOptions["SIZE"] = "";
  }
);

onMounted(() => {
  variantSelected.value = !hasComplexVariants.value;
});
</script>
