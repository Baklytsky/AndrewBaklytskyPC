if (!customElements.get('announcement-bar')) {
  customElements.define(
    'announcement-bar',
    class AnnouncementBar extends HTMLElement {
      constructor() {
        super();

        this.enableSlider = !window.theme.isMobile();
        this.initSliderEvent = (event) => this.initSlider(event);
        this.resizeHandler = this.reinitializeSlider.bind(this);
        customElements.whenDefined('swiper-container').then(() => this.initSlider());
      }

      connectedCallback() {
        this.slider = this.querySelector('swiper-container');
        this.slidesCount = this.querySelectorAll('.announcement__slide').length;

        this.initSlider();

        document.addEventListener('theme:resize:width', this.resizeHandler);

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
          this.refreshTickers();
        });

        document.dispatchEvent(new CustomEvent('theme:announcement:init', {bubbles: true}));
      }

      initSlider() {
        if (!this.slider) return;

        this.allSlides = Array.from(this.slider.querySelectorAll('swiper-slide'));

        this.restoreAllSlides();

        const isMobileView = window.theme.isMobile();
        this.allSlides.forEach((slide) => {
          const isMobileOnly = slide.classList.contains('mobile');
          const isDesktopOnly = slide.classList.contains('desktop');

          if ((isMobileView && isDesktopOnly) || (!isMobileView && isMobileOnly)) {
            slide.remove();
          }
        });

        this.swiperContainer = this.slider;

        if (this.swiperContainer && typeof this.swiperContainer.initialize === 'function') {
          this.swiperContainer.initialize();
          this.refreshTickers();
        }

        document.addEventListener('theme:resize:width', this.initSliderEvent);
      }

      removeSlide(slide) {
        if (!this.slider || !this.swiperContainer) return;

        // Get the Swiper instance
        const swiperInstance = this.swiperContainer.swiper;

        if (swiperInstance) {
          // Find the index of the slide to remove
          const slideIndex = Array.from(this.swiperContainer.querySelectorAll('swiper-slide')).indexOf(slide);

          if (slideIndex !== -1) {
            // Use Swiper's removeSlide method to remove the slide
            swiperInstance.removeSlide(slideIndex);

            // Update slides count
            this.slidesCount = this.querySelectorAll('.announcement__slide').length;

            // Refresh the swiper to update its state
            swiperInstance.update();
          }
        }
      }

      reinitializeSlider() {
        if (!this.swiperContainer || !this.swiperContainer.swiper) return;

        this.swiperContainer.swiper.destroy(true, true);

        this.slider.innerHTML = '';

        this.allSlides.forEach((slide) => {
          this.slider.appendChild(slide);
        });

        this.initSlider();
      }

      restoreAllSlides() {
        const currentSlides = Array.from(this.slider.querySelectorAll('swiper-slide'));
        const currentHTML = currentSlides.map((slide) => slide.outerHTML).join('');

        const template = document.createElement('template');
        template.innerHTML = currentHTML;

        this.slider.innerHTML = '';

        this.allSlides.forEach((slide) => {
          this.slider.appendChild(slide);
        });
      }

      removeTickerText(tickerText) {
        const ticker = tickerText.closest('ticker-bar');
        tickerText.remove();
        ticker.dispatchEvent(new CustomEvent('theme:ticker:refresh'));
      }

      refreshTickers() {
        this.querySelectorAll('ticker-bar')?.forEach((ticker) => {
          ticker.dispatchEvent(new CustomEvent('theme:ticker:refresh'));
        });
      }

      disconnectedCallback() {
        document.removeEventListener('theme:resize:width', this.initSliderEvent);
        document.removeEventListener('theme:resize:width', this.tickerResizeEvent);
        document.removeEventListener('theme:resize:width', this.resizeHandler);
      }
    }
  );
}
