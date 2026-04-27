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
 * Appends a span.bullet-fill child to each pagination bullet and animates its
 * width — bypasses the background/transition rules that affect ::part(bullet).
 */
const initLineProgress = (el, swiper) => {
  // Guard: only autoplay swipers, and only once per element (prevents duplicate
  // listeners when afterSwiperInit re-runs on shopify:section:select).
  if (!el.hasAttribute('autoplay') || el.dataset.lineProgressInit) return;
  el.dataset.lineProgressInit = '1';

  el.classList.add('has-line-progress');

  swiper.on('touchStart', () => { el.dataset.swiperDragging = '1'; });
  swiper.on('touchEnd',   () => { delete el.dataset.swiperDragging; });

  // Animate a real <span> child's width — the same pattern as a plain <div>
  // fill bar. Avoids all CSS transition, ::part(), and shadow-DOM cascade issues.
  const FILL_CSS =
    'position:absolute;left:0;top:0;height:100%;width:0;background:var(--text);pointer-events:none;';

  const ensureFillChildren = () => {
    const bullets = swiper.pagination?.bullets;
    if (!bullets?.length) return;
    bullets.forEach((b) => {
      if (b.querySelector('.bullet-fill')) return;
      b.style.position = 'relative';
      b.style.overflow = 'hidden';
      const fill = document.createElement('span');
      fill.className = 'bullet-fill';
      fill.style.cssText = FILL_CSS;
      b.appendChild(fill);
    });
  };

  // Inject fill spans once at init — deferred by one frame so pagination is
  // rendered. Keeping DOM mutations out of event handlers prevents them from
  // interfering with Swiper's mid-transition pagination updates.
  requestAnimationFrame(ensureFillChildren);

  const setFill = (pct) => {
    const bullets = swiper.pagination?.bullets;
    if (!bullets?.length) return;
    const active = bullets[swiper.realIndex % bullets.length];
    const fill = active?.querySelector('.bullet-fill');
    if (fill) fill.style.width = `${pct}%`;
  };

  const resetFill = () => {
    const bullets = swiper.pagination?.bullets;
    if (!bullets) return;
    bullets.forEach((b) => {
      const f = b.querySelector('.bullet-fill');
      if (f) f.style.width = '0%';
    });
  };

  swiper.on('autoplayTimeLeft', (_s, _t, percentage) => {
    if (el.dataset.swiperDragging) return;
    setFill(((1 - percentage) * 100).toFixed(2));
  });

  swiper.on('slideChangeTransitionStart', resetFill);
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
