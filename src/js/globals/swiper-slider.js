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
 * Bullet pagination behavior:
 *   - Per-slide color sync (--bullet-color) for any swiper-container, regardless
 *     of autoplay or dots_style (circle/line). One host-write per slideChange.
 *   - Progress fill (--bullet-progress) only for autoplay="true" sliders.
 */
const initBullets = (el, swiper) => {
  // Init once per element (prevents duplicate listeners when afterSwiperInit
  // re-runs on shopify:section:select).
  if (el.dataset.bulletInit) return;
  el.dataset.bulletInit = '1';

  // ── Per-slide color sync (all sliders):
  // Mirror the active slide's --text onto the swiper-container host as
  // --bullet-color. Bullets in shadow DOM inherit it because the registered
  // @property has inherits: true, so the host's value is the single source of truth.
  //
  // One host-write per slide change is safe even though the swiper-element bundle
  // force-enables Swiper's MutationObserver on the host (observer: true is set by
  // default unless virtual is enabled — see swiper-element-bundle.mjs). Its
  // callback (observerUpdate → calcSlideSlots) is tolerable at slide-change
  // frequency. Per-frame host-writes would not be safe — that's exactly why the
  // 60fps --bullet-progress write below targets the bullet element instead.
  const syncBulletColor = () => {
    const slide = swiper.slides?.[swiper.activeIndex];
    if (!slide) return;
    const color = getComputedStyle(slide).getPropertyValue('--text').trim();
    if (!color) return;
    el.style.setProperty('--bullet-color', color);
  };

  requestAnimationFrame(syncBulletColor);

  swiper.on('slideChange', syncBulletColor);

  // ── Progress fill (autoplay sliders only):
  if (el.getAttribute('autoplay') !== 'true') return;

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

        // Defer one frame so el.swiper
        // is available even when this runs synchronously after registration.
        requestAnimationFrame(() => {
          if (el.swiper) initBullets(el, el.swiper);
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
