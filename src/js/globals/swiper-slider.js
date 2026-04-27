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
 * Drive the line-style pagination progress bar via the autoplayTimeLeft event.
 * Updates --line-progress on the swiper-container each frame; the CSS rule in
 * head.liquid reads it via background-size on ::part(bullet-active).
 * No DOM mutations — pure CSS custom property updates.
 */
const initLineProgress = (el, swiper) => {
  // Guard: only autoplay swipers, and only once per element (prevents duplicate
  // listeners when afterSwiperInit re-runs on shopify:section:select).
  if (!el.hasAttribute('autoplay') || el.dataset.lineProgressInit) return;
  el.dataset.lineProgressInit = '1';

  el.classList.add('has-line-progress');

  swiper.on('touchStart', () => {
    el.dataset.swiperDragging = '1';
  });
  swiper.on('touchEnd', () => {
    delete el.dataset.swiperDragging;
  });

  // Write --line-progress to the active BULLET element, NOT the swiper-container.
  // The swiper-container's style attribute is watched by Swiper's internal
  // MutationObserver (force-enabled by the swiper-element bundle), so 60fps
  // writes there trigger swiper.update() in a tight loop and prevent autoplay
  // from running. Bullets live in shadow DOM and are not observed.
  swiper.on('autoplayTimeLeft', (_s, _t, percentage) => {
    if (el.dataset.swiperDragging) return;
    const bullets = swiper.pagination?.bullets;
    if (!bullets?.length) return;
    const active = bullets[swiper.realIndex % bullets.length];
    if (active) active.style.setProperty('--line-progress', `${((1 - percentage) * 100).toFixed(2)}%`);
  });

  swiper.on('slideChangeTransitionStart', () => {
    const bullets = swiper.pagination?.bullets;
    if (!bullets?.length) return;
    bullets.forEach((b) => b.style.removeProperty('--line-progress'));
  });
};

/**
 * Additionals after '<swiper-container>' custom element is defined.
 * Swiper element may finish its own init asynchronously after the custom element
 * is registered, so we retry via rAF if el.swiper isn't available yet.
 */
const afterSwiperInit = () => {
  customElements.whenDefined('swiper-container').then(() => {
    const initAll = () => {
      document.querySelectorAll('swiper-container').forEach((el) => {
        el.classList.add('is-initialized');
        const swiper = el.swiper;
        if (swiper) {
          initLineProgress(el, swiper);
        } else {
          // Swiper instance not ready yet — retry on the next frame.
          requestAnimationFrame(() => {
            if (el.swiper) initLineProgress(el, el.swiper);
          });
        }
      });
    };
    initAll();
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
