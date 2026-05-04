import {IsInView} from '../globals/is-in-view';
import {DraggableSlider} from '../features/draggable-slider';

const selectors = {
  buttonArrow: '[data-button-arrow]',
  collectionImage: '[data-collection-image]',
  columnImage: '[data-column-image]',
  productImage: '[data-product-image]',
  slide: '[data-grid-item]',
  slider: '[data-grid-slider]',
};

const attributes = {
  buttonPrev: 'data-button-prev',
  buttonNext: 'data-button-next',
  alignArrows: 'align-arrows',
};

const classes = {
  arrows: 'slider__arrows',
  visible: 'is-visible',
  scrollSnapDisabled: 'scroll-snap-disabled',
};

if (!customElements.get('grid-slider')) {
  customElements.define(
    'grid-slider',

    class GridSlider extends HTMLElement {
      constructor() {
        super();

        this.isInitialized = false;
        this.draggableSlider = null;
        this.positionArrows = this.positionArrows.bind(this);
        this.onButtonArrowClick = (e) => this.buttonArrowClickEvent(e);
        this.slidesObserver = null;
        this.firstLastSlidesObserver = null;
        this.isDragging = false;
        this.toggleSlider = this.toggleSlider.bind(this);

        this.progressInitialized = false;
        this.scrollFrame = null;
        // true - emit the single-slide intermediate ("2 of 4") on that frame.
        // false - hold the previous range label until a new range fully settles, jumping straight from "1-2 of 4" to "2-3 of 4".
        this.showSingleDigitDuringTransition = false;
        this.counterMaxFit = 0;
        this.onScroll = this.onScroll.bind(this);
        this.onResize = this.onResize.bind(this);
      }

      connectedCallback() {
        this.init();
        this.addEventListener('theme:grid-slider:init', this.init);
      }

      init() {
        this.slider = this.querySelector(selectors.slider);
        this.slides = this.querySelectorAll(selectors.slide);
        this.buttons = this.querySelectorAll(selectors.buttonArrow);
        this.slider.classList.add(classes.scrollSnapDisabled);
        this.toggleSlider();
        document.addEventListener('theme:resize:width', this.toggleSlider);

        // Progress + counter run regardless of `toggleSlider`'s isEnabled state:
        // native scroll on the scroller works on touch/mobile even when the JS
        // arrow + observer + draggable wiring is disabled, and the progress UI
        // should reflect that scroll position.
        if (this.getAttribute('variant') === 'progress') {
          this.initProgress();
        }

        window.theme
          .waitForAllAnimationsEnd(this)
          .then(() => {
            this.slider.classList.remove(classes.scrollSnapDisabled);
          })
          .catch(() => {
            this.slider.classList.remove(classes.scrollSnapDisabled);
          });
      }

      toggleSlider() {
        const sliderWidth = this.slider.clientWidth;
        const slidesWidth = this.getSlidesWidth();
        const isEnabled = sliderWidth < slidesWidth;

        if (isEnabled && (!theme.isMobile || !window.theme.touch)) {
          if (this.isInitialized) return;

          this.slidesObserver = new IsInView(this.slider, selectors.slide);

          this.initArrows();
          this.isInitialized = true;

          // Create an instance of DraggableSlider
          this.draggableSlider = new DraggableSlider(this.slider);
        } else {
          this.destroy();
        }
      }

      initArrows() {
        // Create arrow buttons if don't exist
        if (!this.buttons.length) {
          const buttonsWrap = document.createElement('div');
          buttonsWrap.classList.add(classes.arrows);
          buttonsWrap.innerHTML = theme.sliderArrows.prev + theme.sliderArrows.next;

          // Append buttons outside the slider element
          this.append(buttonsWrap);
          this.buttons = this.querySelectorAll(selectors.buttonArrow);
        }

        this.buttonPrev = this.querySelector(`[${attributes.buttonPrev}]`);
        this.buttonNext = this.querySelector(`[${attributes.buttonNext}]`);

        this.toggleArrowsObserver();

        if (this.hasAttribute(attributes.alignArrows)) {
          this.positionArrows();
          this.arrowsResizeObserver();
        }

        this.buttons.forEach((buttonArrow) => {
          buttonArrow.addEventListener('click', this.onButtonArrowClick);
        });
      }

      buttonArrowClickEvent(e) {
        e.preventDefault();

        const firstVisibleSlide = this.slider.querySelector(`${selectors.slide}.${classes.visible}`);
        let slide = null;

        if (e.target.hasAttribute(attributes.buttonPrev)) {
          slide = firstVisibleSlide?.previousElementSibling;
        }

        if (e.target.hasAttribute(attributes.buttonNext)) {
          slide = firstVisibleSlide?.nextElementSibling;
        }

        this.goToSlide(slide);
      }

      removeArrows() {
        this.querySelector(`.${classes.arrows}`)?.remove();
      }

      // Go to prev/next slide on arrow click
      goToSlide(slide) {
        if (!slide) return;

        this.slider.scrollTo({
          top: 0,
          left: slide.offsetLeft,
          behavior: 'smooth',
        });
      }

      getSlidesWidth() {
        return this.slider.querySelector(selectors.slide)?.clientWidth * this.slider.querySelectorAll(selectors.slide).length;
      }

      toggleArrowsObserver() {
        // Add disable class/attribute on prev/next button

        if (this.buttonPrev && this.buttonNext) {
          const slidesCount = this.slides.length;
          const firstSlide = this.slides[0];
          const lastSlide = this.slides[slidesCount - 1];

          const config = {
            attributes: true,
            childList: false,
            subtree: false,
          };

          const callback = (mutationList) => {
            for (const mutation of mutationList) {
              if (mutation.type === 'attributes') {
                const slide = mutation.target;
                const isDisabled = Boolean(slide.classList.contains(classes.visible));

                if (slide == firstSlide) {
                  this.buttonPrev.disabled = isDisabled;
                }

                if (slide == lastSlide) {
                  this.buttonNext.disabled = isDisabled;
                }
              }
            }
          };

          if (firstSlide && lastSlide) {
            this.firstLastSlidesObserver = new MutationObserver(callback);
            this.firstLastSlidesObserver.observe(firstSlide, config);
            this.firstLastSlidesObserver.observe(lastSlide, config);
          }
        }
      }

      positionArrows() {
        const targetElement =
          this.slider.querySelector(selectors.productImage) || this.slider.querySelector(selectors.collectionImage) || this.slider.querySelector(selectors.columnImage) || this.slider;

        if (!targetElement) return;

        this.style.setProperty('--button-position', `${targetElement.clientHeight / 2}px`);
      }

      arrowsResizeObserver() {
        document.addEventListener('theme:resize:width', this.positionArrows);
      }

      /*
       * variant="progress" — display scroll progress bar + slide counter
       */
      initProgress() {
        if (this.progressInitialized) return;
        this.progressEl = this.querySelector('[data-slider-progress]');
        this.progressFill = this.querySelector('[data-slider-progress-fill]');
        this.counter = this.querySelector('[data-slider-counter]');
        if (!this.progressEl || !this.slider) return;

        this.slider.addEventListener('scroll', this.onScroll, {passive: true});
        document.addEventListener('theme:resize:width', this.onResize);
        this.progressInitialized = true;

        // Reserve the worst-case width before the first paint so the track
        // doesn't shift when the visible range cycles (e.g. "2 of 4" vs
        // "3-4 of 4")
        this.reserveCounterSpace();
        if (document.fonts && document.fonts.status !== 'loaded') {
          document.fonts.ready.then(() => this.reserveCounterSpace());
        }

        this.onScroll();
      }

      /*
       * Lock the counter's min-width to the widest label it can ever render
       * for the current slide count. The widest case is the (last-1)-(last)
       * range, e.g. "11-12 of 12"; for a single slide it's just "1 of 1".
       */
      reserveCounterSpace() {
        if (!this.counter || !this.slides?.length) return;
        const total = this.slides.length;
        const ofWord = window.theme?.sliderCounterOf || 'of';
        const widestLabel = total === 1 ? `1 ${ofWord} 1` : `${total - 1}-${total} ${ofWord} ${total}`;

        const previous = this.counter.textContent;
        this.counter.style.minWidth = '';
        this.counter.textContent = widestLabel;
        const width = this.counter.getBoundingClientRect().width;
        this.counter.textContent = previous;
        if (width > 0) this.counter.style.minWidth = `${Math.ceil(width)}px`;
      }

      /*
       * Width-only resize handler. The slider's natural in-view capacity can
       * change across breakpoints (e.g. 2-up → 1-up), so we drop the cached
       * maxFit before recomputing progress + counter for the new layout.
       */
      onResize() {
        this.counterMaxFit = 0;
        this.onScroll();
      }

      /*
       * Update progress bar and slide counter on scroll
       */
      onScroll() {
        if (this.scrollFrame) return;

        // rAF-throttled scroll handler so layout reads + writes happen at most
        // once per frame regardless of how many `scroll` events the browser fires
        this.scrollFrame = requestAnimationFrame(() => {
          this.scrollFrame = null;
          this.updateProgress();
          this.updateCounter();
        });
      }

      updateProgress() {
        if (!this.progressEl || !this.slider) return;
        const max = this.slider.scrollWidth - this.slider.clientWidth;
        const isScrollable = max > 1;
        // Hide the whole progress block when there's nothing to scroll (e.g.
        // few enough items to fit, or breakpoints where the grid renders as a
        // static layout instead of a slider).
        this.progressEl.hidden = !isScrollable;
        if (!this.progressFill) return;
        const ratio = isScrollable ? Math.max(0, Math.min(1, this.slider.scrollLeft / max)) : 0;
        this.progressFill.style.setProperty('--slider-progress', ratio.toFixed(4));
      }

      updateCounter() {
        if (!this.counter || !this.slides?.length) return;
        const total = this.slides.length;
        const tolerance = 1;
        const left = this.slider.scrollLeft - tolerance;
        const right = left + this.slider.clientWidth + tolerance * 2;

        let first = -1;
        let last = -1;
        this.slides.forEach((slide, i) => {
          const slideLeft = slide.offsetLeft;
          const slideRight = slideLeft + slide.offsetWidth;
          if (slideLeft >= left && slideRight <= right) {
            if (first === -1) first = i;
            last = i;
          }
        });

        // Track the largest simultaneous in-view count we've seen for the
        // current viewport. Any later frame where the count drops below this
        // maxFit is a transition between two adjacent ranges (e.g. between
        // "1-2 of 4" and "2-3 of 4"); see `showSingleDigitDuringTransition`.
        const count = first === -1 ? 0 : last - first + 1;
        if (count > this.counterMaxFit) this.counterMaxFit = count;

        // A "transition" frame is either (a) no slide fully in view at all
        // (extreme edge case — narrow viewports, fractional rounding), or
        // (b) the strict pass collapsed to a single slide despite the slider
        // naturally fitting more. In both cases we may want to hold the
        // previously rendered range label rather than flash an intermediate.
        const isTransition = first === -1 || (first === last && this.counterMaxFit > 1);

        if (isTransition && !this.showSingleDigitDuringTransition && this.counter.textContent) {
          return;
        }

        // Mid-scroll fallback: when no slide is fully in view, mark the slide
        // under the viewport's horizontal centre so the counter never blanks.
        if (first === -1) {
          const mid = this.slider.scrollLeft + this.slider.clientWidth / 2;
          for (let i = 0; i < total; i++) {
            const s = this.slides[i];
            if (s.offsetLeft <= mid && s.offsetLeft + s.offsetWidth >= mid) {
              first = last = i;
              break;
            }
          }
          if (first === -1) {
            first = 0;
            last = 0;
          }
        }

        const ofWord = window.theme?.sliderCounterOf || 'of';
        const range = first === last ? `${first + 1}` : `${first + 1}-${last + 1}`;
        this.counter.textContent = `${range} ${ofWord} ${total}`;
      }

      destroyProgress() {
        if (!this.progressInitialized) return;
        this.slider?.removeEventListener('scroll', this.onScroll);
        document.removeEventListener('theme:resize:width', this.onResize);
        if (this.scrollFrame) {
          cancelAnimationFrame(this.scrollFrame);
          this.scrollFrame = null;
        }
        this.counterMaxFit = 0;
        this.progressInitialized = false;
      }

      disconnectedCallback() {
        this.destroy();
        this.destroyProgress();
        document.removeEventListener('theme:resize:width', this.toggleSlider);
      }

      destroy() {
        this.isInitialized = false;
        this.draggableSlider?.destroy();
        this.draggableSlider = null;
        this.slidesObserver?.destroy();
        this.slidesObserver = null;
        this.firstLastSlidesObserver?.disconnect();
        this.firstLastSlidesObserver = null;
        this.removeArrows();

        document.removeEventListener('theme:resize:width', this.positionArrows);
      }
    }
  );
}
