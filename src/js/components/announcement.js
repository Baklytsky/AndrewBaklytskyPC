if (!customElements.get('announcement-bar')) {
  customElements.define(
    'announcement-bar',
    class AnnouncementBar extends HTMLElement {
      constructor() {
        super();

        this.enableSlider = !window.theme.isMobile();
        this.initSliderEvent = (event) => this.initSlider(event);
        customElements.whenDefined('swiper-container').then(() => this.initSlider());
      }

      connectedCallback() {
        this.slider = this.querySelector('swiper-container');
        this.slidesCount = this.querySelectorAll('.announcement__slide').length;

        if (this.slider) {
          this.initSlider();

          document.addEventListener('theme:resize:width', this.initSliderEvent);
          this.addEventListener('theme:slider:loaded', () => {
            this.querySelectorAll('ticker-bar')?.forEach((ticker) => {
              ticker.dispatchEvent(new CustomEvent('theme:ticker:refresh'));
            });
          });
        }

        this.addEventListener('theme:countdown:hide', (e) => {
          if (window.Shopify.designMode) return;

          const isMarquee = e.target.closest('.announcement__bar-holder--marquee');

          if (this.slidesCount === 1) {
            const tickerBar = this.querySelector('ticker-bar');
            tickerBar.style.display = 'none';
          }

          if (isMarquee) {
            const tickerText = e.target.closest('.announcement__slide');
            this.removeTickerText(tickerText);
          } else {
            const slide = e.target.closest('swiper-slide');
            this.removeSlide(slide);
          }
        });

        this.addEventListener('theme:countdown:expire', () => {
          this.querySelectorAll('ticker-bar')?.forEach((ticker) => {
            ticker.dispatchEvent(new CustomEvent('theme:ticker:refresh'));
          });
        });

        document.dispatchEvent(new CustomEvent('theme:announcement:init', {bubbles: true}));
      }

      initSlider() {
        this.swiperContainer = this.querySelector('swiper-container');

        if (this.swiperContainer && typeof this.swiperContainer.initialize === 'function') {
          this.swiperContainer.initialize();
        }
      }

      // TODO
      // initSlider() {
      //   const isDesktopView = !window.theme.isMobile();
      //   const isMobileView = !isDesktopView;

      //   if ((isDesktopView && this.enableSlider) || (isMobileView && !this.enableSlider)) {
      //     this.slider.dispatchEvent(new CustomEvent('theme:slider:destroy', {bubbles: false}));

      //     if (isDesktopView && this.enableSlider) {
      //       this.enableSlider = false;
      //     } else if (isMobileView && !this.enableSlider) {
      //       this.enableSlider = true;
      //     }

      //     this.slider.dispatchEvent(new CustomEvent('theme:slider:init', {bubbles: false}));
      //     this.slider.dispatchEvent(new CustomEvent('theme:slider:reposition', {bubbles: false}));
      //   }
      // }

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
        const ticker = tickerText.closest('ticker-bar');
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
