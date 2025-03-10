<template>
  <div class="ra-product-form relative">
    <Transition name="fade" mode="out-in">
      <dialog
        id="waitlist-modal"
        class="lg:hidden z-10 top-1/2 -translate-y-1/2"
        :closed="showWaitlistMobile === false"
        :open="showWaitlistMobile === true"
        v-if="showWaitlistMobile"
      >
        <div
          class="ra-modal__background-image absolute top-5 md:top-5 right-5 md:right-5 z-9 h-full w-full -mt-5 -mr-5 rounded-2xl"
        ></div>
        <div
          class="ra-modal__content max-w-full relative rounded-2xl bg-center bg-cover"
        >
          <div class="absolute top-[18px] right-6 z-10">
            <form method="dialog" class="close-modal">
              <button
                class="text-white"
                aria-label="close modal"
                value="close"
                v-on:click="showWaitlistMobile = false"
              >
                <svg class="w-3 h-3">
                  <use xlink:href="#close"></use>
                </svg>
              </button>
            </form>
          </div>

          <WaitlistForm
            :variant="currentVariant"
            :product="product"
            :vip-customer="vipCustomer"
          />
        </div>
      </dialog>
    </Transition>

    <Transition name="fade" mode="out-in">
      <div v-if="showWaitlistDesktop">
        <button
          class="absolute flex right-0 -top-[1px] text-white"
          v-on:click="showWaitlistDesktop = false"
        >
          <svg class="w-3 h-3">
            <use xlink:href="#close"></use>
          </svg>
        </button>
        <WaitlistForm :variant="currentVariant" :product="product" />
      </div>
      <div v-else>
        <div class="flex justify-between pb-2 lg:pb-12">
          <!-- Title -->
          <h1 class="sr-only" v-text="productTitle"></h1>
          <span
            class="sans-16 text-stroke-primary w-[50%] min-h-[48px]"
            v-text="productTitle"
          ></span>

          <div
            class="text-uppercase text-right mono-16 text-stroke-primary flex font-light flex-col"
            v-if="currentVariant"
          >
            <!-- Price -->
            <div
              class="flex flex-wrap justify-end"
              v-if="isComparePriceVisible"
            >
              <span class="text-text-highlight">{{
                $filters.moneyWithoutDecimals(currentVariant.price)
              }}</span>
              <span class="ml-2 line-through ra-product-form__compare_price">{{
                $filters.moneyWithoutDecimals(currentVariant.compare_at_price)
              }}</span>
            </div>
            <template v-else>{{
              $filters.moneyWithoutDecimals(currentVariant.price)
            }}</template>

            <!-- Size range -->
            <div
              v-if="firstSize && !isGiftCardTemplate && !activateSaleEvent"
              class="flex justify-end whitespace-pre"
            >
              SIZE <span v-text="firstSize"></span>
              <span v-if="lastSize" class="flex items-center whitespace-normal"
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="9"
                  height="8"
                  viewBox="0 0 9 8"
                  fill="none"
                  class="mx-[2px]"
                >
                  <path
                    d="M4.688 7.504H3.456L6.048 5.04C6.32 4.768 6.672 4.464 7.024 4.16C6.448 4.176 6.048 4.176 5.648 4.176H0V3.328H5.632C6.048 3.328 6.432 3.328 7.024 3.344C6.672 3.04 6.336 2.72 6.032 2.448L3.456 0H4.688L8.512 3.744L4.688 7.504Z"
                    fill="#ECEAE5"
                  ></path>
                </svg>
                {{ lastSize }}
              </span>
            </div>
            <div
              v-if="activateSaleEvent"
              class="flex mt-sm cursor-pointer"
              data-sale-event-tooltip
            >
              <span :style="{ color: saleEventTooltipColor }"
                ><strong>{{
                  $filters.moneyWithoutDecimals(saleEventPrice)
                }}</strong>
                <span
                  class="text-[10px] uppercase font-normal tracking-[1.2px]"
                >
                  {{ saleEventTooltipCopy }}
                </span>
              </span>
            </div>
          </div>
        </div>
        <div
          @click="scrollToOkendoRatingSection"
          class="product-form__okendo-div-duplicate"
          v-if="
            (okendoDivTreeDuplicate && isBuyBoxOpen) ||
            (isDesktop && okendoDivTreeDuplicate)
          "
          v-html="okendoDivTreeDuplicate.innerHTML"
        ></div>
        <!--         Mobile buy box trigger -->
        <Transition name="fadeHeight" mode="out-in">
          <div
            class="ra-product-form-trigger-wrapper"
            :class="isBuyBoxOpen ? 'open' : 'closed'"
          >
            <button
              class="ra-button ra-product-form-trigger ra-button--trigger ra-button--primary ra-button--lg w-full relative lg:hidden mb-4"
              title="Open buy box"
              @click="onBuyBoxOpen"
            >
              {{ buttonLabel }}
            </button>
          </div>
        </Transition>
        <div class="ra-product-form__options-wrapper">
          <div
            v-if="!product.has_only_default_variant"
            class="mt-4 lg:mt-0 ra-product-form-options"
            :class="hasChildren || isChildProduct ? 'mb-10 md:mb-8' : 'mb-10'"
          >
            <template
              v-for="(options, optionKey, index) in formattedOptions"
              :key="`swatch_option_${optionKey}`"
            >
              <div
                class="mono-12 text-stroke-primary mb-3"
                :class="index === 1 ? 'mt-8' : ''"
              >
                <span v-if="isGiftCardTemplate">Select Amount</span>
                <div v-else class="swatch_option--select-a">
                  <span>Select a {{ optionKey }}:</span>
                  <button
                    v-if="optionKey == 'SIZE' && showSizeGuide"
                    @click="openSizeGuide"
                  >
                    SIZE GUIDE
                  </button>
                </div>
              </div>
              <SwatchPicker
                v-if="optionsAsSwatches.includes(optionKey)"
                :key="`swatch_${optionKey}`"
                :label="optionKey"
                :options="options"
                :selected="selectedOptions[optionKey]"
                @change:option="
                  (selected, option) =>
                    handleOptionSelect(optionKey, selected, option)
                "
              />

              <OptionPicker
                v-else
                :key="`option_${optionKey}`"
                :options="options"
                :data-gift-card="isGiftCardTemplate"
                :selected="selectedOptions[optionKey]"
                :tags="product.tags"
                :waitlist-product="product.coming_soon"
                :vip-customer="vipCustomer"
                @change="
                  (selected, option) =>
                    handleOptionSelect(optionKey, selected, option)
                "
              />
            </template>
          </div>

          <div
            v-if="product.fabric_swatch_content"
            class="mono-12 text-stroke-primary mb-6 md:mb-8"
            v-html="product.fabric_swatch_content"
          ></div>

          <div v-if="hasChildren || isChildProduct">
            <ColorPicker
              v-if="isParentProduct"
              :product="product"
              @update-product="handleUpdateProduct"
            />
            <ColorPicker
              v-else-if="isChildProduct"
              :product="product.parent_product"
              @update-product="handleUpdateProduct"
            />
          </div>
        </div>
        <!--        <div v-if="isGiftCardTemplate" class="gift-card-form mb-6">-->
        <!--          <label class="form-control">-->
        <!--            <input type="checkbox" name="checkbox" v-model="giftCardCheck" />-->
        <!--            <span class="mono-12 text-stroke-primary uppercase"-->
        <!--              >SEND AS A GIFT (optional)</span-->
        <!--            >-->
        <!--          </label>-->
        <!--          <div-->
        <!--            :class="-->
        <!--              giftCardCheck-->
        <!--                ? 'gift-card-form-expanded'-->
        <!--                : 'gift-card-form-collapsed'-->
        <!--            "-->
        <!--          >-->
        <!--            <div v-if="giftCardCheck" class="flex flex-col gap-2 mt-6">-->
        <!--              <div class="relative">-->
        <!--                <input-->
        <!--                  type="email"-->
        <!--                  v-model="giftCardEmail"-->
        <!--                  placeholder="Recipient email"-->
        <!--                  :class="giftCardEmailInvalid && 'input-error'"-->
        <!--                  class="flex-1 w-full"-->
        <!--                />-->
        <!--                <span class="error-bubble text-red" v-if="giftCardEmailInvalid"-->
        <!--                  >This field is invalid</span-->
        <!--                >-->
        <!--              </div>-->
        <!--              <div class="relative">-->
        <!--                <input-->
        <!--                  type="text"-->
        <!--                  v-model="giftCardName"-->
        <!--                  placeholder="Recipient name"-->
        <!--                  :class="giftCardNameError && 'input-error'"-->
        <!--                  class="flex-1 w-full"-->
        <!--                />-->
        <!--                <span v-if="giftCardNameError" class="error-bubble text-red"-->
        <!--                  >This field is required</span-->
        <!--                >-->
        <!--              </div>-->
        <!--              <textarea-->
        <!--                type="text"-->
        <!--                maxlength="200"-->
        <!--                v-model="giftCardMessage"-->
        <!--                placeholder="Message (optional)"-->
        <!--              />-->
        <!--              <span class="uppercase mono-12 text-stroke-primary opacity-60"-->
        <!--                >200 characters max</span-->
        <!--              >-->
        <!--              <input-->
        <!--                type="text"-->
        <!--                v-model="giftCardFrom"-->
        <!--                placeholder="From (optional)"-->
        <!--              />-->
        <!--            </div>-->
        <!--          </div>-->
        <!--        </div>-->
        <button
          v-if="
            buttonLabel == props.waitlistText || buttonLabel == props.bisText
          "
          class="ra-button ra-button ra-button--primary ra-button--lg w-full relative"
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
        <button
          v-else
          class="ra-button ra-button ra-button--primary ra-button--lg w-full relative"
          title="Add to bag"
          :disabled="
            productMax ||
            !Object.values(selectedOptions).length ||
            currentVariantSoldOut
          "
          @click="addToCart"
        >
          {{ buttonLabel }}
        </button>

        <button
          v-if="
            enableGiftNoteBtn &&
            product.available &&
            product.type === 'gift card'
          "
          class="ra-button ra-button ra-button--primary ra-button--lg w-full relative mt-2"
          @click="addGiftNote"
        >
          Send as a Gift 🎁
        </button>
        <div
          class="flex items-center justify-center pt-3"
          v-if="isFinalSale && product.final_sale_message"
        >
          <p class="uppercase mono-12 text-stroke-primary">
            {{ product.final_sale_message }}
          </p>
        </div>
        <div
          class="flex items-center justify-center pt-3"
          v-if="product.ship_on_date"
        >
          <p class="uppercase mono-12 text-stroke-primary">
            Ships By {{ product.ship_on_date }}
          </p>
        </div>
        <div class="text-center hidden lg:block">
          <button
            class="uppercase mono-12 text-stroke-primary mt-6"
            @click="scrollToDetails"
          >
            View details
          </button>
        </div>
      </div>
    </Transition>
    <div
      v-if="completeTheLookAnchorLink"
      class="lg:hidden text-white text-center"
    >
      <button
        class="uppercase mono-12 text-stroke-primary mt-6"
        @click="scrollToCompleteTheLook"
      >
        Complete the look
      </button>
    </div>
    <div
      v-if="showKlarnaAfterpayMessage"
      class="mono-12 flex flex-wrap items-center justify-center text-white text-center mt-[20px]"
      style="font-size: 10px"
    >
      <span>BUY NOW, PAY LATER WITH</span>
      <div id="klarna-button" class="w-[70px] mt-[-6px]">
        <a
          href="https://www.khy.com/pages/klarna"
          aria-label="Klarna"
          target="_blank"
        >
          <img
            src="https://cdn.shopify.com/s/files/1/0781/1314/5147/files/6eb439fe-8d62-4687-adb2-be7ec86dd8e9_Wordmark_Transparent_And_OffWhite.png?v=1732284550"
            alt="klarna-logo"
          />
        </a>
      </div>
      <span>OR</span>
      <div
        id="afterpay-button"
        class="w-[100px] ml-[-5px] mt-[-2px]"
        data-afterpay-modal="en_US-theme-white"
      >
        <img
          src="https://cdn.shopify.com/s/files/1/0781/1314/5147/files/AP_logo_lockup_6328x2204_whiteclear_png.png?v=1732286042"
          alt="afterpay-logo"
        />
      </div>
    </div>
  </div>
  <Teleport to="body">
    <div v-if="modalOpen">
      <BackInStockForm
        :product="product"
        :selected-variant="
          Object.values(selectedOptions).length ? currentVariant : {}
        "
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
import { computed, ref, reactive, onMounted, watch } from "vue";
import { useCartStore } from "../stores/cart.js";
import { useProductPageStore } from "../stores/productPage";
import { updateURL } from "../../js/utils/search-params.js";
import SwatchPicker from "./SwatchPicker.vue";
import OptionPicker from "./OptionPicker.vue";
import WaitlistForm from "./WaitlistForm.vue";
import ColorPicker from "./ColorPicker.vue";
import BackInStockForm from "./BackInStockForm.vue";
import { dataViewItem, dataAddToCart } from "./datalayer/";
import { openBuyBox, closeBuyBox } from "../../js/utils/buy-box";
import { atcBuilder } from "../../js/utils/helpers";
import * as $filters from "../filters/money";

const okendoDivTreeDuplicate = ref(null);

const props = defineProps({
  product: Object,
  vipCustomer: Boolean,
  orderLimit: String,
  template: String,
  waitlistText: {
    type: String,
    default: "Waitlist for Early Access",
  },
  bisText: {
    type: String,
    default: "Pre-Order",
  },
  soldOutText: {
    type: String,
    default: "Sold Out",
  },
  waitlistModalDisabled: { type: String },
  waitlistModalTitle: { type: String },
  waitlistModalDescription: { type: String },
  waitlistModalDescriptionSecondLine: { type: String },
  waitlistModalLegalText: { type: String },
  waitlistModalCta: { type: String },
  bisModalTitle: { type: String },
  bisModalDescription: { type: String },
  bisModalDescriptionSecondLine: { type: String },
  bisModalLegalText: { type: String },
  bisModalCta: { type: String },
  preOrderText: { type: String },
  completeTheLookAnchorLink: { type: Boolean },
  enableSaleEvent: { type: Boolean },
  saleEventTooltipColor: { type: String },
  saleEventTooltipCopy: { type: String },
  showKlarnaAfterpayMessage: { type: Boolean },
  enableGiftNote: { type: Boolean },
});

const cartStore = useCartStore();
const emit = defineEmits(["update-product"]);

const handleUpdateProduct = (data) => {
  emit("update-product", data);
};

const optionsAsSwatches = ["Color"];
console.log(props.product, "PRODUCT");

// const { title, variants } = toRefs(props.product);
// const { title, variants } = toRefs(props.product);

const title = computed(() => {
  return props.product.title;
});

const variants = computed(() => {
  return props.product.variants;
});

const isComparePriceVisible = computed(() => {
  return currentVariant.value.compare_at_price > currentVariant.value.price;
});

const isDesktop = computed(() => {
  return window.innerWidth > 1024;
});

const isGiftCardTemplate = computed(() => {
  return (
    window.location.pathname.includes("gift-card") ||
    window.location.pathname.includes("gift-note")
  );
});

// eslint-disable-next-line vue/return-in-computed-property

const isParentProduct = computed(() =>
  props.product.tags.includes("parent-product")
);

const isChildProduct = computed(() => {
  return !!props?.product?.parent_product;
});

const hasChildren = computed(() => {
  if (isParentProduct.value) {
    return props?.product?.child_products.length > 0;
  }
  return false;
});

const showSizeGuide = computed(() => {
  return props.product.parent_product
    ? props.product.parent_product.has_size_guide
    : props.product.has_size_guide;
});

const isPreOrder = computed(() => props.product?.pre_order);
const isFinalSale = computed(() => props.product?.final_sale);

const isDelayed = computed(() => props.product?.delayed);

// eslint-disable-next-line no-unused-vars
const hasShipOnDate = computed(() => !!props.product?.ship_on_date);

const productTitle = computed(() => {
  return title.value.split("|")[0];
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

const closeModal = () => {
  modalOpen.value = false;
};

const firstSize = computed(() => {
  return variants.value?.[0]?.option1;
});

const lastSize = computed(() => {
  return variants.value?.[variants.value.length - 1]?.option1;
});

// Set initial options from first_available_variant
const selectedOptions = reactive({});

// Note: Insertion order should be preserved here as of ES2015 (assuming string keys),
// but there could be edge cases where options might not be properly ordered if using an int as a key
if (props.product.selected_variant) {
  props.product?.options?.forEach((option, i) => {
    selectedOptions[option] = props.product.first_available_variant.options[i];
  });
}

const handleOptionSelect = (optionKey, selected, selectedOption) => {
  selectedOptions[optionKey] = selectedOption.value;
  dataViewItem(props.product, currentVariant);
};

const optionHasInStockVariant = (optionValue, optionKeyIndex) => {
  // Get indices of variant option keys not currently selected
  const variants = props.product.variants;
  const optionKeyIndices = [0, 1, 2];
  const currentOptionIndex = optionKeyIndices.splice(optionKeyIndex, 1)[0];

  // Find the variant that matches the optionValue passed in along with the currentvariant's remaining selected options,
  // check availability and return a Boolean
  const filteredAvailableVariants = variants
    .filter((variant) => {
      return (
        variant.options[optionKeyIndices[0]] ===
          currentVariant.value.options[optionKeyIndices[0]] &&
        variant.options[optionKeyIndices[1]] ===
          currentVariant.value.options[optionKeyIndices[1]] &&
        variant.available
      );
    })
    .some((variant) => variant.options[currentOptionIndex] === optionValue);

  return filteredAvailableVariants;
};

// Set keyed object for all option values and disabled state
const formattedOptions = computed(() => {
  const formattedOptions = {};
  const optionsWithValues = props.product.options_with_values;

  props.product.options.forEach((option, optionIndex) => {
    formattedOptions[option] = [];
    // Todo - Find a more elegant way of passing separate data for swatches

    // Currently the liquid templates don't have insight into which option keys are set to use
    // color swatches, so there's some necessary config duplication until
    // we switch to the storefront API
    if (optionsAsSwatches.includes(option)) {
      optionsWithValues[option].forEach((optionValue) => {
        let optionIsAvailable = optionHasInStockVariant(
          optionValue.value,
          optionIndex
        );
        if (props.product.coming_soon) {
          optionIsAvailable = true;
        }
        formattedOptions[option].push({
          label: optionValue.value,
          value: optionValue.value,
          image: optionValue.url,
          disabled: !optionIsAvailable,
        });
      });
    } else {
      optionsWithValues[option].forEach((value) => {
        let optionIsAvailable = optionHasInStockVariant(value, optionIndex);
        if (props.product.coming_soon) {
          optionIsAvailable = true;
        }
        formattedOptions[option].push({
          label: value,
          value,
          disabled: !optionIsAvailable,
        });
      });
    }
  });

  return formattedOptions;
});

const hasComplexVariants = computed(() => {
  return props.product ? props.product.options.length > 1 : false;
});

const currentVariant = computed(() => {
  let currentVariant = props.product.variants[0];
  if (hasComplexVariants.value) {
    if (props.product.options.length > 2) {
      currentVariant = props.product.variants.find(
        (variant) =>
          variant.option1.toLowerCase() ===
            Object.values(selectedOptions)[0].toLowerCase() &&
          variant.option2.toLowerCase() ===
            Object.values(selectedOptions)[1].toLowerCase() &&
          variant.option3.toLowerCase() ===
            Object.values(selectedOptions)[2].toLowerCase()
      );
    } else {
      currentVariant = props.product.variants.find(
        (variant) =>
          variant.option1.toLowerCase() ===
            Object.values(selectedOptions)[0].toLowerCase() &&
          variant.option2.toLowerCase() ===
            Object.values(selectedOptions)[1].toLowerCase()
      );
    }
  } else if (
    props.product.variants_count > 1 &&
    Object.values(selectedOptions).length
  ) {
    currentVariant = props.product.variants.find(
      (variant) =>
        variant.option1.toLowerCase() ===
        Object.values(selectedOptions)[0].toLowerCase()
    );
  }
  return currentVariant || props.product.first_available_variant;
});

const currentVariantSoldOut = computed(() => {
  if (!currentVariant.value.available && props.product?.no_waitlist) {
    return true;
  }
  return false;
});

const activateSaleEvent = computed(() => {
  return (
    props.enableSaleEvent &&
    (props.product?.sale_event_price > 0 ||
      props.product?.sale_event_discount > 0)
  );
});

const enableGiftNoteBtn = computed(() => {
  console.log(props.enableGiftNote);
  return props.enableGiftNote;
});

const saleEventPrice = computed(() => {
  let price = currentVariant.value.price;

  if (props.product?.sale_event_price > 0) {
    price = props.product?.sale_event_price;
  }

  if (props.product?.sale_event_discount > 0) {
    const discount =
      currentVariant.value.price * (props.product?.sale_event_discount / 100);
    const discountedPrice = (currentVariant.value.price - discount) / 100;
    const ceilValue = Math.ceil(discountedPrice);
    price = ceilValue * 100;
  }

  return price;
});

const buttonLabel = computed(() => {
  if (!props.product.available && props.product?.no_waitlist)
    return props.soldOutText == "" ? "Sold Out" : props.soldOutText;
  if (
    !Object.values(selectedOptions).length &&
    !AllSizesOutOfStockOrComingSoon.value &&
    !isGiftCardTemplate.value
  ) {
    return "Select Size";
  }
  if (!Object.values(selectedOptions).length && isGiftCardTemplate.value)
    return "Select Amount";
  if (props.product?.coming_soon && props.vipCustomer === false)
    return props.waitlistText == ""
      ? "Waitlist for Early Access"
      : props.waitlistText;
  if (currentVariantSoldOut.value)
    return props.soldOutText == "" ? "Sold Out" : props.soldOutText;
  if (!currentVariant.value.available)
    return props.bisText == "" ? "Sold Out - Join Waitlist" : props.bisText;
  if (productMax.value) return "Max Quantity (2) in cart";
  if (isPreOrder.value)
    return props.preOrderText == "" ? "Pre-Order" : props.preOrderText;
  return isAddingToCart.value ? "Adding..." : "Add to Bag";
});

const totalInventoryCount = computed(() => {
  let totalQuantity = 0;

  if (props.product?.variants) {
    props.product.variants.forEach((variant) => {
      totalQuantity += variant.inventory_quantity;
    });
  }
  return totalQuantity;
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

const badgeText = computed(() => {
  if (props.product.custom_badge) {
    return props.product.custom_badge;
  } else if (props.product.final_sale) {
    return "final sale";
  } else if (props.product.pre_order) {
    return "pre-order";
  } else if (totalInventoryCount.value < 1 && props.product.coming_soon) {
    return "waitlist";
  } else if (totalInventoryCount.value < 1) {
    return "sold out";
  } else if (
    totalInventoryCount.value < props.product.few_items_left_quantity
  ) {
    return "Few items left";
  } else if (totalInventoryCount.value < props.product.selling_fast_quantity) {
    return "Selling fast";
  } else if (
    !props.product.few_items_left_quantity &&
    totalInventoryCount.value < window.GLBE_SETTINGS.fewItemsLeft
  ) {
    return "Few items left";
  } else if (
    !props.product.selling_fast_quantity &&
    totalInventoryCount.value < window.GLBE_SETTINGS.sellingFast
  ) {
    return "Selling fast";
  } else {
    return false;
  }
});

const scrollToDetails = () => {
  var elmnt = document.getElementById("product-additional-info");
  elmnt.scrollIntoView({ behavior: "smooth", block: "start" });
};

const scrollToCompleteTheLook = () => {
  var elmnt = document.getElementById("CompleteTheLook");
  elmnt.scrollIntoView({ behavior: "smooth", block: "start" });
};

const scrollToOkendoRatingSection = () => {
  var elmnt = document.getElementById("okendo-rating-section-scroll-to");
  var elmntMobile = document.getElementById(
    "okendo-rating-section-scroll-to-mobile"
  );
  // if window mobile
  if (window.innerWidth < 1024) {
    elmntMobile.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    elmnt.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const showWaitlistDesktop = ref(false);
const showWaitlistMobile = ref(false);
const qty = ref(1);
const isAddingToCart = ref(false);
const isBuyBoxOpen = ref(false);
const giftCardName = ref("");
const giftCardNameError = ref(false);
const giftCardEmail = ref("");
const giftCardEmailInvalid = ref(false);
const giftCardCheck = ref(false);
const giftCardMessage = ref("");
const giftCardFrom = ref("");
const modalOpen = ref(false);

let touchstartY = 0;
let touchendY = 0;

const gestureZone = document.getElementById("product-buy-box-child");
const buyBoxContainer = document.getElementById("product-buy-box");
const buyBoxPillContainer = document.getElementById(
  "product-buy-box__pill-container"
);

if (gestureZone) {
  gestureZone.addEventListener(
    "touchstart",
    function (event) {
      touchstartY = event?.changedTouches[0]?.screenY;
    },
    false
  );

  gestureZone.addEventListener(
    "touchend",
    function (event) {
      touchendY = event?.changedTouches[0]?.screenY;
      handleGesture(event.target);
    },
    false
  );

  gestureZone.addEventListener(
    "touchmove",
    function (event) {
      const newHeight = innerHeight - event?.changedTouches[0]?.clientY;
      if (event.changedTouches[0].screenY > touchstartY) {
        const buyBoxPosition = buyBoxContainer.scrollTop;

        if (buyBoxPosition === 0) {
          if (buyBoxContainer && buyBoxContainer.offsetHeight > 166) {
            buyBoxContainer.style.cssText = `height: ${newHeight}px; overflow: none`;
            buyBoxContainer.classList.remove("product-buy-box--open");
          }
        }
      }
    },
    false
  );
}

function handleGesture(target) {
  if (touchendY < touchstartY) {
    isBuyBoxOpen.value = true;
    openBuyBox();
  }

  if (touchendY > touchstartY) {
    const buyBoxPosition = buyBoxContainer.scrollTop;
    if (buyBoxPosition === 0) {
      isBuyBoxOpen.value = false;
      closeBuyBox();
    }
    if (target === buyBoxPillContainer) {
      isBuyBoxOpen.value = false;
      buyBoxContainer.scrollTop = 0;
      closeBuyBox();
    }
  }
}

const onBuyBoxOpen = () => {
  showWaitlistMobile.value = false;
  isBuyBoxOpen.value = true;
  openBuyBox();
};

const addGiftNote = () => {
  document.dispatchEvent(new Event("giftnote_voucher_open"));
};

const addToCart = async () => {
  if (
    (props.product.coming_soon || !currentVariant.value.available) &&
    window.innerWidth < 1024 &&
    props.vipCustomer === false
  ) {
    closeBuyBox();
    modalOpen.value = true;
    return false;
  }

  if (
    !currentVariant.value.available ||
    (props.product.coming_soon && props.vipCustomer === false)
  ) {
    modalOpen.value = true;
    return false;
  }

  if (!Object.values(selectedOptions).length) {
    return false;
  }

  // Gift card form validation
  if (giftCardCheck.value) {
    giftCardEmailInvalid.value = false;
    giftCardNameError.value = false;

    if (
      /* eslint-disable-next-line */
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(giftCardEmail.value)
    ) {
      giftCardEmailInvalid.value = false;
    } else {
      giftCardEmailInvalid.value = true;
      return false;
    }

    if (giftCardName.value == "") {
      giftCardNameError.value = true;
      return false;
    } else {
      giftCardNameError.value = false;
    }
  }
  const itemProps = atcBuilder({
    tags: props.product.tags,
    currentVariant: currentVariant.value.id,
    isPreOrder: isPreOrder.value,
    delayed: isDelayed.value,
    shipOnDate: props.product.ship_on_date,
    fewItemsLeft: props.product.few_items_left_quantity,
    sellingFast: props.product.selling_fast_quantity,
    badge: badgeText.value,
    giftCardName: giftCardName.value,
    giftCardEmail: giftCardEmail.value,
    giftCardMessage: giftCardMessage.value,
    giftCardFrom: giftCardFrom.value,
    compareAtPrice: currentVariant.value.compare_at_price,
  });

  isAddingToCart.value = true;

  await cartStore
    .addItem(itemProps)
    .then(() => dataAddToCart(props.product, currentVariant, qty))
    .then(() => clearGiftCardData());
  isAddingToCart.value = false;
};

const clearGiftCardData = () => {
  giftCardName.value = "";
  giftCardEmail.value = "";
  giftCardMessage.value = "";
  giftCardFrom.value = "";
};

const updateVariantURL = () => {
  const searchParamString = new URLSearchParams({
    variant: currentVariant.value.id,
  }).toString();

  searchParamString && updateURL(searchParamString);
};

const primarySwiperInstance = document.querySelector(
  ".product-media-gallery__primary"
)?.swiper;

const slideToCurrentVariantImage = () => {
  const currentVariantSlide = primarySwiperInstance?.slides.find(
    (slide) =>
      parseInt(slide.getAttribute("data-media-id")) ===
      currentVariant.value.media.id
  );
  const index = currentVariantSlide?.getAttribute("data-slide-index");
  index && primarySwiperInstance.slideTo(index);
};

const updateBadgeText = () => {
  let badgeText;
  let badgeOverride = false;
  let timeDifference;
  const { back_in_stock } = currentVariant.value;
  if (currentVariant.value.badge) {
    badgeText = currentVariant.value.badge;
    badgeOverride = currentVariant.value.badge_override;
  } else if (props.product.badge) {
    badgeText = props.product.badge;
    badgeOverride = props.product.badge_override;
  }
  if (!badgeOverride) {
    if (
      currentVariant.value.inventory_quantity === 0 &&
      currentVariant.value.inventory_policy === "deny"
    ) {
      badgeText = "Sold Out";
    } else if (back_in_stock) {
      const year = back_in_stock.split("-")[0];
      const month = back_in_stock.split("-")[1];
      const day = back_in_stock.split("-")[2];
      const bisDate = new Date(`${month}/${day}/${year}`);
      const currentDate = Date.now();
      timeDifference = (currentDate - bisDate) / (1000 * 3600 * 24);
      if (timeDifference < 14) {
        badgeText = "Back in Stock";
      }
    } else if (
      currentVariant.value.price < currentVariant.value.compare_at_price
    ) {
      badgeText = "On Sale";
    }
  }
  if (badgeText && productBadge) {
    productBadge.textContent = badgeText;
    productBadge.classList.remove("hidden");
  } else {
    productBadge?.classList.add("hidden");
  }
};

const openSizeGuide = () => {
  const sizeGuideModal = document.getElementById("modal-size-guide");
  setTimeout(() => {
    sizeGuideModal?.click();
    document.querySelector(".size-guide-modal").scrollTo(0, 0);
  }, 200);
};

const productBadge = document.querySelector("[data-pdp-badge]");

const productStore = useProductPageStore();

watch(currentVariant, (variant) => {
  productStore.setCurrentVariant(variant);
  updateVariantURL();
  slideToCurrentVariantImage();
  updateBadgeText();
});

onMounted(() => {
  productStore.setCurrentVariant(
    currentVariant.value || props.product.first_available_variant
  );
  slideToCurrentVariantImage();
  updateBadgeText();
  const okendoDuplicate = document.querySelector("#okendo-star-rating"); // Replace with the actual ID of your external div
  okendoDivTreeDuplicate.value = okendoDuplicate;
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}

.fadeHeight-enter-active,
.fadeHeight-leave-active {
  transition: all 0.5s;
  max-height: 230px;
}

.fadeHeight-enter-from,
.fadeHeight-leave-to {
  opacity: 0;
  max-height: 0px;
}

.ra-product-form-trigger-wrapper {
  overflow: hidden;
}

.product-buy-box--open .ra-product-form-trigger-wrapper {
  visibility: hidden;
  opacity: 0;
  transform: translateY(200%);
  display: none;
}

.ra-product-form-trigger-wrapper.closed {
  transition: all 0.3s linear;
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
}

.ra-product-form-trigger-wrapper.open {
  visibility: hidden;
  opacity: 0;
  height: 0;
}

@keyframes fadeOutTrigger {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    opacity: 0;
  }
}

@keyframes fadeInTrigger {
  0% {
    opacity: 0;
  }

  10% {
    opacity: 0.1;
  }

  20% {
    opacity: 0.2;
  }

  30% {
    opacity: 0.3;
  }

  40% {
    opacity: 0.4;
  }

  50% {
    opacity: 0.5;
  }

  60% {
    opacity: 0.6;
  }

  70% {
    opacity: 0.7;
  }

  80% {
    opacity: 0.8;
  }

  90% {
    opacity: 0.9;
  }

  100% {
    opacity: 1;
  }
}

.swatch_option--select-a {
  display: flex;
  justify-content: space-between;
}

.swatch_option--select-a button {
  text-decoration: underline;
}

.swatch_option--select-a button:hover,
.swatch_option--select-a button:focus,
.swatch_option--select-a button:focus-visible {
  cursor: pointer;
  text-decoration: none;
}
</style>
