import { register } from "swiper/element/bundle";

/**
 * Initialize a single Swiper element with its parameters
 * @param {HTMLElement} swiperEl - The swiper container element
 */
const initSingleSwiper = (swiperEl) => {
  try {
    const dataParams = swiperEl.getAttribute("data-init-params");
    const swiperParams = JSON.parse(dataParams);
    
    if (swiperEl.initialized) {
      swiperEl.initialized = false;
    }
    
    Object.assign(swiperEl, swiperParams);
    swiperEl.initialize();
  } catch (error) {
    console.error("Error initializing swiper:", error);
  }
};

/**
 * Initialize new swipers that haven't been initialized yet
 */
const initSwipers = () => {
  const preInitSwipers = document.querySelectorAll(
    "swiper-container[init='false']"
  );

  if (!preInitSwipers.length) return;
  preInitSwipers.forEach(initSingleSwiper);
};

/**
 * Update all swipers that have the init attribute
 */
const updateSwipers = () => {
  const swipers = document.querySelectorAll("swiper-container[init]");
  swipers.forEach(initSingleSwiper);
};

/**
 * Initialize Swiper on a page load
 */
window.addEventListener("load", () => {
  register();
  initSwipers();
});

/**
 * Handle Shopify section changes
 */
const shopifyEvents = ["shopify:section:load", "shopify:section:reorder", "shopify:section:select"];
shopifyEvents.forEach(eventName => {
  document.addEventListener(eventName, updateSwipers);
});