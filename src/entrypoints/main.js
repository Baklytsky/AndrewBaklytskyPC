import { createApp } from "vue";
import { createPinia } from "pinia";

import { getSizedImageFromUrl } from "../vue/filters/image.js";
import { ucfirst, upcase, unhandleize } from "../vue/filters/string.js";
import { money, moneyWithoutDecimals } from "../vue/filters/money.js";

import { register } from "swiper/element/bundle";
import "swiper/css/bundle";

import components from "../vue/components/index.js";
import "../js/custom-elements/custom-elements.js";
import "../js/custom-elements/scrollable.js";
import "../js/custom-elements/ra-product-carousel.js";
import "../js/custom-elements/ra-product-main.js";
import "../js/custom-elements/ra-hero-video-controls.js";
import Vue3TouchEvents from "vue3-touch-events";

import "tailwindcss/base.css";
import "@bva/ui-shared/styles/reset.css";
import "@bva/ui-shared/styles/required.css";
import "@bva/ui-shared/styles/components.css";
import "tailwindcss/utilities.css";
import "aos/dist/aos.css";

const isDesignMode = window.Shopify.designMode || window.Shopify.inspectMode;
const pinia = createPinia();

/**
 * renderVueApps
 * @param {String} eventTarget - string selector for vue app roots.
 */
const renderVueApps = (eventTarget = "[data-vue-root]") => {
  const vueRoots = document.querySelectorAll(eventTarget);
  vueRoots.forEach((root) => {
    const app = createApp();
    const componentName = root.dataset.vueRoot;
    const component = components[componentName];

    app.component(componentName, component);
    app.config.globalProperties.$filters = {
      getSizedImageFromUrl,
      ucfirst,
      upcase,
      unhandleize,
      money,
      moneyWithoutDecimals,
    };
    app.use(pinia);
    app.use(Vue3TouchEvents);
    app.mount(root);
    if (isDesignMode) {
      const appSectionLoad = (event) => {
        const parentSectionId = `#shopify-section-${event.detail.sectionId}`;
        if (root.closest(parentSectionId) !== null) {
          app.unmount();
          document.removeEventListener("shopify:section:load", appSectionLoad);
        }
      };
      document.addEventListener("shopify:section:load", appSectionLoad);
    }
  });
};

/**
 * reinitializeVueComponent
 * @param {HTMLElement} root - The root element where the Vue component is mounted.
 */
const reinitializeVueComponent = (root) => {
  const app = createApp();
  const componentName = root.dataset.vueRoot;
  const component = components[componentName];

  if (component) {
    app.component(componentName, component);
    app.config.globalProperties.$filters = {
      getSizedImageFromUrl,
      ucfirst,
      upcase,
      unhandleize,
      money,
      moneyWithoutDecimals,
    };
    app.use(pinia);
    app.use(Vue3TouchEvents);
    app.mount(root);
  }
};

const initSwipers = () => {
  const preInitSwipers = document.querySelectorAll(
      "swiper-container[init='false']"
  );

  if (!preInitSwipers) return;
  preInitSwipers.forEach((swiperEl) => {
    const swiperParams = JSON.parse(swiperEl.getAttribute("data-init-params"));
    Object.assign(swiperEl, swiperParams);
    swiperEl.initialize();
  });
};

const updateSwipers = () => {
  const swipers = document.querySelectorAll("swiper-container");

  swipers.forEach((swiperEl) => {
    if (swiperEl.hasAttribute("init")) {
      const swiperParams = JSON.parse(
          swiperEl.getAttribute("data-init-params")
      );

      swiperEl.initialized = false;
      Object.assign(swiperEl, swiperParams);
      swiperEl.initialize();
    }
  });
};

window.addEventListener("load", () => {
  register();
  renderVueApps();
  initSwipers();
  // AOS.init();
});

/**
 * Customizer Refresh Apps Code
 */
if (isDesignMode) {
  window.renderVueApps = renderVueApps;
  const refreshVue = (event) => {
    if (event?.detail?.sectionId) {
      renderVueApps(
          `#shopify-section-${event.detail.sectionId} [data-vue-root]`,
          isDesignMode
      );
    }
  };

  const onShopifySectionChange = () => {
    updateSwipers();
    refreshVue();
  };

  document.addEventListener("shopify:section:load", () => {
    onShopifySectionChange();
  });

  document.addEventListener("shopify:section:reorder", () => {
    onShopifySectionChange();
  });
}

export { renderVueApps, reinitializeVueComponent };
