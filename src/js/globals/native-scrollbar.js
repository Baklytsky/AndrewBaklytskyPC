if (!customElements.get('native-scrollbar')) {
  customElements.define(
    'native-scrollbar',
    class NativeScrollbar extends HTMLElement {
      constructor() {
        super();

        this.scrollbar = this.querySelector('[data-scrollbar]');
        this.arrowNext = this.querySelector('[data-scrollbar-arrow-prev]');
        this.arrowPrev = this.querySelector('[data-scrollbar-arrow-next]');
        this.toggleNextArrow = this.toggleNextArrow.bind(this);
      }

      connectedCallback() {
        document.addEventListener('theme:resize', this.toggleNextArrow);

        if (this.scrollbar.hasAttribute('data-scrollbar-slider')) {
          this.scrollToVisibleElement();
        }

        if (this.arrowNext && this.arrowPrev) {
          this.toggleNextArrow();
          this.events();
        }
      }

      disconnectedCallback() {
        document.removeEventListener('theme:resize', this.toggleNextArrow);
      }

      events() {
        this.arrowNext.addEventListener('click', (event) => {
          event.preventDefault();

          this.goToNext();
        });

        this.arrowPrev.addEventListener('click', (event) => {
          event.preventDefault();

          this.goToPrev();
        });

        this.scrollbar.addEventListener('scroll', () => {
          this.togglePrevArrow();
          this.toggleNextArrow();
        });
      }

      goToNext() {
        const moveWith = this.scrollbar.hasAttribute('data-scrollbar-slide-fullwidth') ? this.scrollbar.getBoundingClientRect().width : this.scrollbar.getBoundingClientRect().width / 2;
        const position = moveWith + this.scrollbar.scrollLeft;

        this.move(position);

        this.arrowPrev.classList.remove('is-hidden');

        this.toggleNextArrow();
      }

      goToPrev() {
        const moveWith = this.scrollbar.hasAttribute('data-scrollbar-slide-fullwidth') ? this.scrollbar.getBoundingClientRect().width : this.scrollbar.getBoundingClientRect().width / 2;
        const position = this.scrollbar.scrollLeft - moveWith;

        this.move(position);

        this.arrowNext.classList.remove('is-hidden');

        this.togglePrevArrow();
      }

      toggleNextArrow() {
        requestAnimationFrame(() => {
          this.arrowNext?.classList.toggle('is-hidden', Math.round(this.scrollbar.scrollLeft + this.scrollbar.getBoundingClientRect().width + 1) >= this.scrollbar.scrollWidth);
        });
      }

      togglePrevArrow() {
        requestAnimationFrame(() => {
          this.arrowPrev.classList.toggle('is-hidden', this.scrollbar.scrollLeft <= 0);
        });
      }

      scrollToVisibleElement() {
        [].forEach.call(this.scrollbar.children, (element) => {
          element.addEventListener('click', (event) => {
            event.preventDefault();

            this.move(element.offsetLeft - element.clientWidth);
          });
        });
      }

      move(offsetLeft, behavior = 'smooth') {
        this.scrollbar.scrollTo({
          top: 0,
          left: offsetLeft,
          behavior: behavior,
        });
      }
    }
  );
}
