if (!customElements.get('slider-progress')) {
  customElements.define(
    'slider-progress',

    class SliderProgress extends HTMLElement {
      constructor() {
        super();

        this.scroller = null;
        this.slides = null;
        this.progressEl = null;
        this.progressFill = null;
        this.counter = null;

        this.scrollFrame = null;
        this.counterMaxFit = 0;
        // true - emit the single-slide intermediate ("2 of 4") on that frame.
        // false - hold the previous range label until a new range fully settles, jumping straight from "1-2 of 4" to "2-3 of 4".
        this.showSingleDigitDuringTransition = false;
        this.initialized = false;

        this.onScroll = this.onScroll.bind(this);
        this.onResize = this.onResize.bind(this);
      }

      connectedCallback() {
        this.init();
      }

      disconnectedCallback() {
        this.destroy();
      }

      init() {
        if (this.initialized) return;

        this.scroller = this.resolveScroller();
        this.progressEl = this.querySelector('[data-slider-progress]');
        this.progressFill = this.querySelector('[data-slider-progress-fill]');
        this.counter = this.querySelector('[data-slider-counter]');

        if (!this.scroller || !this.progressEl) return;

        this.slides = this.scroller.querySelectorAll('[data-grid-item]');

        this.scroller.addEventListener('scroll', this.onScroll, {passive: true});
        document.addEventListener('theme:resize:width', this.onResize);
        this.initialized = true;

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
       * Locate the scrollable target. Prefer an explicit `for` id reference;
       * otherwise fall back to a `[data-grid-slider]` sibling within the same
       * parent so the markup can be co-located with the scroller.
       */
      resolveScroller() {
        const id = this.getAttribute('for');
        if (id) {
          const target = document.getElementById(id);
          if (target) return target;
        }
        return this.parentElement?.querySelector('[data-grid-slider]') || null;
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
       * Width-only resize handler. The scroller's natural in-view capacity
       * can change across breakpoints (e.g. 2-up → 1-up), so we drop the
       * cached maxFit before recomputing progress + counter for the new
       * layout.
       */
      onResize() {
        this.counterMaxFit = 0;
        this.onScroll();
      }

      onScroll() {
        if (this.scrollFrame) return;

        // rAF-throttled scroll handler so layout reads + writes happen at
        // most once per frame regardless of how many `scroll` events the
        // browser fires
        this.scrollFrame = requestAnimationFrame(() => {
          this.scrollFrame = null;
          this.updateProgress();
          this.updateCounter();
        });
      }

      updateProgress() {
        if (!this.progressEl || !this.scroller) return;
        const max = this.scroller.scrollWidth - this.scroller.clientWidth;
        const isScrollable = max > 1;
        // Hide the whole progress block when there's nothing to scroll (e.g.
        // few enough items to fit, or breakpoints where the grid renders as
        // a static layout instead of a slider).
        this.progressEl.hidden = !isScrollable;
        if (!this.progressFill) return;
        const ratio = isScrollable ? Math.max(0, Math.min(1, this.scroller.scrollLeft / max)) : 0;
        this.progressFill.style.setProperty('--slider-progress', ratio.toFixed(4));
      }

      updateCounter() {
        if (!this.counter || !this.slides?.length) return;
        const total = this.slides.length;
        const tolerance = 1;
        const left = this.scroller.scrollLeft - tolerance;
        const right = left + this.scroller.clientWidth + tolerance * 2;

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
        // (b) the strict pass collapsed to a single slide despite the
        // scroller naturally fitting more. In both cases we may want to
        // hold the previously rendered range label rather than flash an
        // intermediate.
        const isTransition = first === -1 || (first === last && this.counterMaxFit > 1);

        if (isTransition && !this.showSingleDigitDuringTransition && this.counter.textContent) {
          return;
        }

        // Mid-scroll fallback: when no slide is fully in view, mark the
        // slide under the viewport's horizontal centre so the counter never
        // blanks.
        if (first === -1) {
          const mid = this.scroller.scrollLeft + this.scroller.clientWidth / 2;
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

      destroy() {
        if (!this.initialized) return;
        this.scroller?.removeEventListener('scroll', this.onScroll);
        document.removeEventListener('theme:resize:width', this.onResize);
        if (this.scrollFrame) {
          cancelAnimationFrame(this.scrollFrame);
          this.scrollFrame = null;
        }
        this.counterMaxFit = 0;
        this.initialized = false;
      }
    }
  );
}
