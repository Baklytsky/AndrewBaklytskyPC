if (!customElements.get('card-slider')) {
  customElements.define(
    'card-slider',
    class CardSlider extends HTMLElement {
      constructor() {
        super();
        customElements.whenDefined('swiper-container').then(() => this.init());
      }

      init() {
        this.swiperContainer = this.querySelector('swiper-container');
        if (!this.swiperContainer) return;
        this.swiperInstance = this.swiperContainer.swiper;
        this.isSwiperDisabled = this.swiperContainer.classList.contains('swiper-disabled');
        this.next = this.swiperInstance.navigation.nextEl;
        this.prev = this.swiperInstance.navigation.prevEl;
        this.swiperInstance.on('resize', () => this.positionArrows());
      }

      positionArrows() {
        if (this.prev && this.next && !this.isSwiperDisabled) {
          const itemImage = this.querySelector('.collection-item__image') || this.querySelector('.product-card__image') || this.querySelector('[data-column-image]');

          // Prevent 'clientHeight' of null error if no image
          if (!itemImage) return;

          this.prev.style.top = itemImage.clientHeight / 2 + 'px';
          this.next.style.top = itemImage.clientHeight / 2 + 'px';
        }
      }
    }
  );
}
