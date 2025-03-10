<template>
  <div
    class="ra-product-tile__link"
    ref="productTileSwatch"
    :data-url="product.url"
    :data-color-label="product.title"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="updateProduct"
  >
    <div
      class="ra-product-tile__swatch relative cursor-pointer w-6 h-6 rounded-full"
      :class="{ active: isActive, unavailable: isUnavailable }"
      data-product-swatch
    >
      <img
        :src="product.color_swatch"
        class="w-6 h-6 rounded-full"
        width="auto"
        height="auto"
      />
    </div>
  </div>
</template>
<style scoped>
div.active {
  border: 1px solid var(--stroke-primary);
}
div.active img {
  transform: scale(0.8);
}
</style>
<script setup>
import { computed, ref, watch } from "vue";
import axios from "axios";
const props = defineProps({
  product: Object,
  activeColor: String,
});
import { reinitializeVueComponent } from "../../entries/main";
const emit = defineEmits(["update-product"]);
const productTileSwatch = ref(null);
const isActive = computed(() => window.location.pathname === props.product.url);

const setLabel = (target) => {
  const labelElem = target
    ?.closest(".ra-product-tile__options-item")
    ?.querySelector(".ra-product-tile__label");

  if (labelElem) labelElem.innerHTML = "Color: " + props.activeColor;
};

watch(isActive, (newVal) => {
  if (newVal) setLabel(productTileSwatch.value);
});

// eslint-disable-next-line vue/return-in-computed-property
const isUnavailable = computed(() => {
  if (props.product.coming_soon) return false;
  if (props.product.available === false) return true;
});

const handleMouseEnter = (e) => {
  let colorLabel =
    props.product.title?.split("|")[1]?.trim() || props.activeColor;
  const labelElem = e.target
    .closest(".ra-product-tile__options-item")
    ?.querySelector(".ra-product-tile__label");

  if (labelElem) labelElem.innerHTML = "Color: " + colorLabel;
};

const handleMouseLeave = (e) => {
  setLabel(e.target);
};

const updateProductData = (data) => {
  emit("update-product", data);
};

const updateProductHTML = (html, selector) => {
  const currentHTML = document.querySelector(selector);
  const newHTML = html.querySelector(selector);
  if (!currentHTML || !newHTML) return;
  currentHTML.innerHTML = newHTML.innerHTML;
  const swipers = currentHTML.querySelectorAll("swiper-container");
  const vueRoots = currentHTML.querySelectorAll("[data-vue-root]");
  vueRoots.forEach((root) => reinitializeVueComponent(root));
  swipers.forEach((swiper) => updateSwiper(swiper));
};

const updateSwiper = (swiper) => {
  const swiperParams = JSON.parse(swiper.getAttribute("data-init-params"));
  Object.assign(swiper, swiperParams);
  swiper.initialize();
};

const updateReviews = (selector, productID) => {
  const starRating = document.querySelector(selector);
  if (!starRating) return;
  window.okeWidgetApi.setProduct(starRating, `shopify-${productID}`);
};

const htmlSelectors = [
  "#pdp-container .pdp-gallery-wrapper",
  "#pdp-container #product-info-mobile",
  "#pdp-container #product-additional-info",
  "#pdp-container #product-recs-mf",
  "#pdp-container #product-recs-api",
  "#product-size-guide-wrapper",
];

const reviewSelectors = [
  "#pdp-container .product-form__okendo-div-duplicate [data-oke-star-rating]",
  ".desktop-okendo-review [data-oke-widget]",
  ".mobile-okendo-review [data-oke-widget]",
];

const updateProduct = async (e) => {
  const url = e.target.closest(".ra-product-tile__link")?.dataset.url;
  try {
    const [response1, response2] = await Promise.all([
      axios.get(`${url}?view=json-data`),
      axios.get(`${url}`),
    ]);
    const productData = response1.data;
    const productHTML = new DOMParser().parseFromString(
      response2.data,
      "text/html"
    );
    history.pushState({}, "", `${url}`);
    updateProductData(productData);
    htmlSelectors.forEach((selector) =>
      updateProductHTML(productHTML, selector)
    );
    reviewSelectors.forEach((selector) =>
      updateReviews(selector, productData.id)
    );
  } catch (error) {
    console.error(error);
  }
};
</script>
