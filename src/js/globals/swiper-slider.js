import {register} from 'swiper/element/bundle';

/**
 * Handle breakpoints for swiper containers
 */
const handleBreakpoints = () => {
  document.querySelectorAll('swiper-container[breakpoint]').forEach((container) => {
    const breakpoint = container.getAttribute('breakpoint');
    const mediaQuery = window.matchMedia(breakpoint);

    const handleBreakpointChange = () => {
      if (mediaQuery.matches) {
        if (!container.swiper.enabled) {
          container.swiper.enable();
          container.swiper.slideTo(0);
          container.classList.remove('swiper-disabled');
        }
      } else {
        container.swiper.disable();
        container.classList.add('swiper-disabled');
      }
    };

    handleBreakpointChange();
    mediaQuery.addEventListener('change', handleBreakpointChange);
  });
};

/**
 * Additionals after '<swiper-container>' custom element is defined
 */
const afterSwiperInit = () => {
  customElements.whenDefined('swiper-container').then(() => {
    document.querySelectorAll('swiper-container').forEach((el) => el.classList.add('is-initialized'));
    handleBreakpoints();
  });
};

/**
 * Initialize Swiper on a page load
 */
window.addEventListener('load', () => {
  register();
  afterSwiperInit();
});

/**
 * Handle Shopify section changes
 */
const shopifyEvents = ['shopify:section:load', 'shopify:section:reorder', 'shopify:section:select'];
shopifyEvents.forEach((eventName) => {
  document.addEventListener(eventName, afterSwiperInit);
});
