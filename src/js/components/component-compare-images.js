if (!customElements.get('comparison-images')) {
  class ComparisonImages extends HTMLElement {
    constructor() {
      super();
      this.overlay = this.querySelector('[data-comparison-overlay]')
      this.overlayImage = this.overlay.querySelector('video-component') || this.overlay.querySelector('img')
      this.divider = this.querySelector('.comparison__slide-divider')
      this.navArrows = this.closest('slideshow-swiper').querySelectorAll('.swiper-button-prev, .swiper-button-next')
      if (this.overlay && this.divider) this.initComparisons()
    }

    initComparisons() {
      this.initVariables()
      this.divider.removeAttribute('hidden');
      this.initEvents()
    }

    initVariables() {
      this.pressed = false;
      this.overlayImage.style.width = this.offsetWidth + 'px';

      if (this.navArrows.length) {
        this.navArrows.forEach(arrow => arrow.style.top = (this.overlay.offsetHeight / 2) + 'px')
      }
    }

    initEvents() {
      this.divider.addEventListener("mousedown", () => {this.pressed = true; this.addEvent()});
      this.divider.addEventListener("touchstart", () => {this.pressed = true; this.addEvent()});

      this.addEventListener("mousemove", (e) => this.slideMove(e));
      this.addEventListener("touchmove", (e) => this.slideMove(e));

      this.addEventListener("mouseup", () => this.pressed = false);
      this.addEventListener("touchend", () => this.pressed = false);

      window.addEventListener('resize', ()=> this.initVariables())
    }

    slideMove(e) {
      if (!this.pressed) return false;
      this.position = this.getCursorPos(e)
      if (this.position < 0) this.position = 0;
      if (this.position > 100) this.position = 100;
      this.slide();
    }

    getCursorPos(e) {
      e = (e.changedTouches) ? e.changedTouches[0] : e;
      return ((e.pageX - this.overlay.getBoundingClientRect().left) * 100) / this.offsetWidth;
    }

    slide() {
      this.overlay.style.width = this.position + "%";
      this.divider.style.left = this.position + "%";
    }

    addEvent() {
      window.dataLayer.push({
        'event': 'clinical_trial_image_scroll',
        'click': {
          'show_more_type': ''
        },
      });
    }
  }

  customElements.define('compare-images', ComparisonImages);
}
