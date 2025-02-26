const selectors = {
  marquee: '.announcement__bar-holder--marquee',
  slide: '[data-slide]',
  slider: '[data-slider]',
  ticker: 'ticker-bar',
  tickerSlide: '.announcement__slide',
};

if (!customElements.get('announcement-bar')) {
  customElements.define(
    'announcement-bar',
    class AnnouncementBar extends HTMLElement {
      constructor() {
        super();

        this.slider = this.querySelector(selectors.slider);
        this.enableSlider = !window.theme.isMobile();
        this.slidesCount = this.querySelectorAll(selectors.tickerSlide).length;
        this.initSliderEvent = (event) => this.initSlider(event);
      }

      connectedCallback() {
        if (this.slider) {
          this.initSliders();
        }

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
        const isDesktopView = !window.theme.isMobile();
        const isMobileView = !isDesktopView;

        if ((isDesktopView && this.enableSlider) || (isMobileView && !this.enableSlider)) {
          this.slider.dispatchEvent(new CustomEvent('theme:slider:destroy', {bubbles: false}));

          if (isDesktopView && this.enableSlider) {
            this.enableSlider = false;
          } else if (isMobileView && !this.enableSlider) {
            this.enableSlider = true;
          }

          this.slider.dispatchEvent(new CustomEvent('theme:slider:init', {bubbles: false}));
          this.slider.dispatchEvent(new CustomEvent('theme:slider:reposition', {bubbles: false}));
        }
      }

      removeSlide(slide) {
        this.slider.dispatchEvent(
          new CustomEvent('theme:slider:remove-slide', {
            bubbles: false,
            detail: {
              slide,
            },
          })
        );
      }

      removeTickerText(tickerText) {
        const ticker = tickerText.closest(selectors.ticker);
        tickerText.remove();
        ticker.dispatchEvent(new CustomEvent('theme:ticker:refresh'));
      }

      disconnectedCallback() {
        document.removeEventListener('theme:resize:width', this.initSliderEvent);
        document.removeEventListener('theme:resize:width', this.tickerResizeEvent);
      }
    }
  );
}
