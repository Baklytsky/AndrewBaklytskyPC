if (!customElements.get('logos-slider')) {
  customElements.define(
    'logos-slider',
    class LogosSlider extends HTMLElement {
      constructor() {
        super();
        customElements.whenDefined('swiper-container').then(() => this.init());
      }

      init() {
        this.swiperContainers = this.querySelectorAll('swiper-container');
        if (this.swiperContainers.length === 0) return;
        this.textContainer = this.querySelector('[data-slider-text]');
        this.logosContainer = this.querySelector('[data-slider-logos]');
        this.logosSwiper = this.logosContainer.swiper;

        // Responsive breakpoints
        this.logosSwiper.params.breakpoints = {
          320: {
            slidesPerView: 1.8,
          },
          480: {
            slidesPerView: 3.5,
          },
          990: {
            slidesPerView: 5,
          },
          1400: {
            slidesPerView: 7.5,
          },
        };

        // Controller params to sync both Swiper instances
        if (this.swiperContainers.length === 2) {
          this.textSwiper = this.textContainer.swiper;
          this.textSwiper.controller.control = this.logosSwiper;
          this.logosSwiper.controller.control = this.textSwiper;
        }

        // Manual sync in addition to Swiper's native "controller.control" methods
        this.addEventListener('click', (event) => this.handleClick(event));
        this.resizeObserver = new ResizeObserver(() => this.syncOnResize());
        this.swiperContainers?.forEach((container) => this.resizeObserver.observe(container));
      }

      handleClick(event) {
        const target = event.target;
        const slide = target.closest('swiper-slide');
        if (!slide) return;

        const index = parseInt(slide.dataset.index);
        this.textSwiper?.slideTo(index);
        this.logosSwiper.slideTo(index);
      }

      syncOnResize() {
        if (this.textSwiper && this.logosSwiper) {
          const index = this.textSwiper.activeIndex;
          this.textSwiper.slideTo(index, 0); // 0ms for instant sync
          this.logosSwiper.slideTo(index, 0);
        }
      }

      disconnectedCallback() {
        this.resizeObserver?.disconnect();
      }
    }
  );
}
