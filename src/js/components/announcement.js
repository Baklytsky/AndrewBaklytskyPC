import {Slider} from '../features/slider';
import {isDesktop} from '../util/media-query';

const selectors = {
  marquee: '.announcement__bar-holder--marquee',
  slide: '[data-slide]',
  slider: '[data-slider]',
  ticker: 'ticker-bar',
  tickerSlide: '.announcement__slide',
};

const classes = {
  hidden: 'hidden',
};

if (!customElements.get('announcement-bar')) {
  customElements.define(
    'announcement-bar',
    class AnnouncementBar extends HTMLElement {
      constructor() {
        super();

        this.slider = this.querySelector(selectors.slider);
        this.enableSlider = isDesktop();
        this.slidesCount = this.querySelectorAll(selectors.tickerSlide).length;
        this.initSliderEvent = (event) => this.initSlider(event);
      }

      connectedCallback() {
        if (this.slider) {
          this.initSliders();
        }

        this.addEventListener('theme:block:select', (e) => {
          this.onBlockSelect(e);
        });

        this.addEventListener('theme:block:deselect', (e) => {
          this.onBlockDeselect(e);
        });

        this.addEventListener('theme:countdown:hide', (e) => {
          if (window.Shopify.designMode) return;

          const isMarquee = e.target.closest(selectors.marquee);

          if (this.slidesCount === 1) {
            const tickerBar = this.querySelector(selectors.ticker);
            tickerBar.style.display = 'none';
          }

          if (isMarquee) {
            const tickerText = e.target.closest(selectors.tickerSlide);
            this.removeTickerText(tickerText);
          } else {
            const slide = e.target.closest(selectors.slide);
            this.removeSlide(slide);
          }
        });

        this.addEventListener('theme:countdown:expire', () => {
          this.querySelectorAll(selectors.ticker)?.forEach((ticker) => {
            ticker.dispatchEvent(new CustomEvent('theme:ticker:refresh'));
          });
        });

        document.dispatchEvent(new CustomEvent('theme:announcement:init', {bubbles: true}));
      }

      /**
       * Init slider
       */
      initSliders() {
        this.initSlider();
        document.addEventListener('theme:resize:width', this.initSliderEvent);

        this.addEventListener('theme:slider:loaded', () => {
          this.querySelectorAll(selectors.tickerBar)?.forEach((ticker) => {
            ticker.dispatchEvent(new CustomEvent('theme:ticker:refresh'));
          });
        });
      }

      initSlider() {
        const isDesktopView = isDesktop();
        const isMobileView = !isDesktopView;

        if ((isDesktopView && this.enableSlider) || (isMobileView && !this.enableSlider)) {
          this.slider.flkty?.destroy();

          if (isDesktopView && this.enableSlider) {
            this.enableSlider = false;
          } else if (isMobileView && !this.enableSlider) {
            this.enableSlider = true;
          }

          this.slider = new Slider(this, this.querySelector(selectors.slider));
          this.slider.flkty?.reposition();
        }
      }

      removeSlide(slide) {
        this.slider.flkty?.remove(slide);

        if (this.slider.flkty?.cells.length === 0) {
          this.section.classList.add(classes.hidden);
        }
      }

      removeTickerText(tickerText) {
        const ticker = tickerText.closest(selectors.ticker);
        tickerText.remove();
        ticker.dispatchEvent(new CustomEvent('theme:ticker:refresh'));
      }

      onBlockSelect(e) {
        if (this.slider) {
          this.slider.onBlockSelect(e);
        }
      }

      onBlockDeselect(e) {
        if (this.slider) {
          this.slider.onBlockDeselect(e);
        }
      }

      disconnectedCallback() {
        document.removeEventListener('theme:resize:width', this.initSliderEvent);
        document.removeEventListener('theme:resize:width', this.tickerResizeEvent);

        this.removeEventListener('theme:block:select', (e) => {
          this.onBlockSelect(e);
        });

        this.removeEventListener('theme:block:deselect', (e) => {
          this.onBlockDeselect(e);
        });
      }
    }
  );
}
