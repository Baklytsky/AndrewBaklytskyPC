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

  // Per-slide color sync:
  //  - Mirrors the active slide's --text onto both the swiper-container host and
  //    its closest .swiper ancestor as --bullet-color.
  //  - Writing to both keeps the bullets in shadow DOM and the arrows in light DOM
  //    in lockstep, all driven from the same source value via var(--bullet-color).
  //  - The registered @property (inherits: true) handles the smooth transition
  //    independently on each target.
  //  - Writes per slideChange are safe even though the swiper-element bundle
  //    force-enables Swiper's MutationObserver on the host (observer: true is set
  //    by default unless virtual is enabled — see swiper-element-bundle.mjs). Its
  //    callback (observerUpdate → calcSlideSlots) is tolerable at slide-change
  //    frequency. Per-frame writes on observed elements would not be safe —
  //    that's exactly why the 60fps --bullet-progress write below targets the
  //    bullet element (in shadow DOM, not observed) instead.
  const colorTargets = [el];
  const wrapper = el.closest('.swiper');
  if (wrapper && wrapper !== el) colorTargets.push(wrapper);
  const syncBulletColor = () => {
    const slide = swiper.slides?.[swiper.activeIndex];
    if (!slide) return;
    const color = getComputedStyle(slide).getPropertyValue('--text').trim();
    if (!color) return;
    for (const target of colorTargets) {
      target.style.setProperty('--bullet-color', color);
    }
  };

  requestAnimationFrame(syncBulletColor);

  swiper.on('slideChange', syncBulletColor);

  // Progress fill (autoplay sliders only):
  if (el.getAttribute('autoplay') !== 'true') return;

  //  - Write --bullet-progress to the active bullet element, not the swiper-container.
  //  - The swiper-container's style attribute is watched by Swiper's internal
  //    MutationObserver (force-enabled by the swiper-element bundle), so 60fps
  //    writes there trigger swiper.update() in a tight loop and prevent autoplay
  //    from running. Bullets live in shadow DOM and are not observed.
  swiper.on('autoplayTimeLeft', (_s, _t, percentage) => {
    const bullets = swiper.pagination?.bullets;
    if (!bullets?.length) return;
    const active = bullets[swiper.realIndex % bullets.length];
    if (active) active.style.setProperty('--bullet-progress', `${((1 - percentage) * 100).toFixed(2)}%`);
  });
};

/**
 * Fix accessibility issues introduced by Swiper's built-in a11y module on the
 * external navigation buttons (light DOM):
 *   - It sets aria-controls to the .swiper-wrapper id, which lives inside the
 *     web component's shadow DOM and can't be resolved from the light DOM. That
 *     dangling idref fails axe's aria-valid-attr-value check, so we drop it.
 *   - It overwrites the button's aria-label with its English default message, so
 *     we restore the localized label from window.theme.strings.
 *
 * Buttons carrying data-aria-controls are left for their own component
 * (slideshow / product gallery) to rewire to a valid, light-DOM id.
 * Idempotent, so it's safe to re-run on every (re)initialization.
 */
const fixNavA11y = (swiper) => {
  const nav = swiper.navigation;
  if (!nav) return;

  const strings = window.theme?.strings || {};
  const targets = [
    {els: nav.prevEl, label: strings.previousSlide},
    {els: nav.nextEl, label: strings.nextSlide},
  ];

  targets.forEach(({els, label}) => {
    const list = Array.isArray(els) ? els : els ? [els] : [];
    list.forEach((navEl) => {
      if (!navEl.hasAttribute('data-aria-controls')) {
        const controls = navEl.getAttribute('aria-controls');
        if (controls && !document.getElementById(controls)) {
          navEl.removeAttribute('aria-controls');
        }
      }
      if (label) navEl.setAttribute('aria-label', label);
    });
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
          if (!el.swiper) return;
          initBullets(el, el.swiper);
          fixNavA11y(el.swiper);
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
