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
 * Drive the bullet pagination progress fill via the autoplayTimeLeft event.
 * Sets --bullet-progress on the active bullet each frame; the CSS rule in
 * head.liquid reads it via background-size on ::part(bullet) for any
 * autoplay="true" swiper. Works for both line and circle styles.
 */
const initBulletProgress = (el, swiper) => {
  // Guard: only sliders with autoplay="true" (excludes autoplay="false" cases),
  // and only once per element (prevents duplicate listeners when
  // afterSwiperInit re-runs on shopify:section:select).
  if (el.getAttribute('autoplay') !== 'true' || el.dataset.bulletProgressInit) return;
  el.dataset.bulletProgressInit = '1';

  // Write --bullet-progress to the active bullet element, not the swiper-container.
  // The swiper-container's style attribute is watched by Swiper's internal
  // MutationObserver (force-enabled by the swiper-element bundle), so 60fps
  // writes there trigger swiper.update() in a tight loop and prevent autoplay
  // from running. Bullets live in shadow DOM and are not observed.
  swiper.on('autoplayTimeLeft', (_s, _t, percentage) => {
    const bullets = swiper.pagination?.bullets;
    if (!bullets?.length) return;
    const active = bullets[swiper.realIndex % bullets.length];
    if (active) active.style.setProperty('--bullet-progress', `${((1 - percentage) * 100).toFixed(2)}%`);
  });
};

/**
 * Additionals after '<swiper-container>' custom element is defined.
 */
const afterSwiperInit = () => {
  customElements.whenDefined('swiper-container').then(() => {
    const initAll = () => {
      document.querySelectorAll('swiper-container').forEach((el) => {
        el.classList.add('is-initialized');

        if (el.getAttribute('autoplay') !== 'true') return;
        requestAnimationFrame(() => {
          if (el.swiper) initBulletProgress(el, el.swiper);
        });
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
