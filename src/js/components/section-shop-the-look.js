if (!customElements.get('look-component')) {
  customElements.define(
    'look-component',
    class Look extends HTMLElement {
      constructor() {
        super();

        this.popupCloseByEvent = this.popupCloseByEvent.bind(this);
      }

      connectedCallback() {
        this.slider = this.querySelector('[data-slider-mobile]');
        this.slides = this.querySelectorAll('[data-slide]');
        this.thumbs = this.querySelectorAll('[data-slider-thumb]');
        this.popupContainer = this.querySelector('[data-popup-container]');
        this.popupClose = this.querySelectorAll('[data-popup-close]');

        if (this.slider && this.slides.length && this.thumbs.length) {
          this.popupContainer.addEventListener('transitionend', (e) => {
            if (e.target != this.popupContainer) return;

            this.popupContainer.classList.remove('is-animating');
            if (e.target.classList.contains('is-open')) {
              this.popupOpenCallback();
            } else {
              this.popupCloseCallback();
            }
          });

          this.popupContainer.addEventListener('transitionstart', (e) => {
            if (e.target != this.popupContainer) return;

            this.popupContainer.classList.add('is-animating');
          });

          this.popupClose.forEach((button) => {
            button.addEventListener('click', () => {
              this.popupContainer.classList.remove('is-open');
              document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
            });
          });

          this.thumbs.forEach((thumb, i) => {
            thumb.addEventListener('click', (e) => {
              e.preventDefault();
              const idx = thumb.hasAttribute('data-slider-thumb') && thumb.getAttribute('data-slider-thumb') !== '' ? parseInt(thumb.getAttribute('data-slider-thumb')) : i;
              const slide = this.slides[idx];
              if (theme.isMobile) {
                const parentPadding = parseInt(window.getComputedStyle(this.slider).paddingLeft);
                this.slider.scrollTo({
                  top: 0,
                  left: slide.offsetLeft - parentPadding,
                  behavior: 'auto',
                });
                document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
                this.popupContainer.classList.add('is-animating', 'is-open');
              } else {
                const {stickyHeaderHeight} = window.theme.readHeights();
                const slideTop = slide.getBoundingClientRect().top;
                const slideHeightHalf = slide.offsetHeight / 2;
                const windowHeight = theme.windowHeight;
                const windowHeightHalf = windowHeight / 2;
                let scrollTarget = slideTop + slideHeightHalf - windowHeightHalf + window.scrollY;
                const sliderContainerTop = this.getBoundingClientRect().top + window.scrollY;
                const sliderContainerBottom = sliderContainerTop + this.offsetHeight;

                if (scrollTarget < sliderContainerTop) {
                  scrollTarget = sliderContainerTop - stickyHeaderHeight;
                } else if (scrollTarget + windowHeight > sliderContainerBottom) {
                  scrollTarget = sliderContainerBottom - windowHeight;
                }

                window.scrollTo({
                  top: scrollTarget,
                  left: 0,
                  behavior: 'smooth',
                });
              }
            });
          });
        }
      }

      popupCloseByEvent() {
        this.popupContainer.classList.remove('is-open');
      }

      popupOpenCallback() {
        document.addEventListener('theme:quick-add:open', this.popupCloseByEvent, {once: true});
        document.addEventListener('theme:product:added', this.popupCloseByEvent, {once: true});
      }

      popupCloseCallback() {
        document.removeEventListener('theme:quick-add:open', this.popupCloseByEvent, {once: true});
        document.removeEventListener('theme:product:added', this.popupCloseByEvent, {once: true});
      }
    }
  );
}
