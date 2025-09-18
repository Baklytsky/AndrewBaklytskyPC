if (!customElements.get('native-scrollbar')) {
  customElements.define(
    'native-scrollbar',
    class NativeScrollbar extends HTMLElement {
      constructor() {
        super();

        this.scrollbar = this.querySelector('[data-scrollbar]');
        this.arrowNext = this.querySelector('[data-scrollbar-arrow-prev]');
        this.arrowPrev = this.querySelector('[data-scrollbar-arrow-next]');
        this.togglePrevArrow = this.togglePrevArrow.bind(this);
        this.toggleNextArrow = this.toggleNextArrow.bind(this);
        this.scrollDirection = null;
      }

      connectedCallback() {
        document.addEventListener('theme:resize', this.toggleNextArrow);
        document.addEventListener('theme:resize', this.togglePrevArrow);

        // Detect scroll direction
        this.detectScrollDirection();

        if (this.scrollbar.hasAttribute('data-scrollbar-slider')) {
          this.scrollToVisibleElement();
        }

        if (this.arrowNext && this.arrowPrev) {
          this.togglePrevArrow();
          this.toggleNextArrow();
          this.events();
        }
      }

      disconnectedCallback() {
        document.removeEventListener('theme:resize', this.toggleNextArrow);
        document.removeEventListener('theme:resize', this.togglePrevArrow);
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
        let moveWith, position;

        if (this.scrollDirection === 'horizontal') {
          moveWith = this.scrollbar.hasAttribute('data-scrollbar-slide-fullwidth') ? this.scrollbar.getBoundingClientRect().width : this.scrollbar.getBoundingClientRect().width / 2;
          position = moveWith + this.scrollbar.scrollLeft;
        } else if (this.scrollDirection === 'vertical') {
          moveWith = this.scrollbar.hasAttribute('data-scrollbar-slide-fullwidth') ? this.scrollbar.getBoundingClientRect().height : this.scrollbar.getBoundingClientRect().height / 2;
          position = moveWith + this.scrollbar.scrollTop;
        } else {
          return; // No scroll direction detected
        }

        this.move(position);

        this.arrowPrev.classList.remove('is-hidden');

        this.toggleNextArrow();
      }

      goToPrev() {
        let moveWith, position;

        if (this.scrollDirection === 'horizontal') {
          moveWith = this.scrollbar.hasAttribute('data-scrollbar-slide-fullwidth') ? this.scrollbar.getBoundingClientRect().width : this.scrollbar.getBoundingClientRect().width / 2;
          position = this.scrollbar.scrollLeft - moveWith;
        } else if (this.scrollDirection === 'vertical') {
          moveWith = this.scrollbar.hasAttribute('data-scrollbar-slide-fullwidth') ? this.scrollbar.getBoundingClientRect().height : this.scrollbar.getBoundingClientRect().height / 2;
          position = this.scrollbar.scrollTop - moveWith;
        } else {
          return; // No scroll direction detected
        }

        this.move(position);

        this.arrowNext.classList.remove('is-hidden');

        this.togglePrevArrow();
      }

      toggleNextArrow() {
        requestAnimationFrame(() => {
          let isAtEnd = false;

          if (this.scrollDirection === 'horizontal') {
            isAtEnd = Math.round(this.scrollbar.scrollLeft + this.scrollbar.getBoundingClientRect().width + 1) >= this.scrollbar.scrollWidth;
          } else if (this.scrollDirection === 'vertical') {
            isAtEnd = Math.round(this.scrollbar.scrollTop + this.scrollbar.getBoundingClientRect().height + 1) >= this.scrollbar.scrollHeight;
          }

          this.arrowNext?.classList.toggle('is-hidden', !isAtEnd);
        });
      }

      togglePrevArrow() {
        requestAnimationFrame(() => {
          let isAtStart = false;

          if (this.scrollDirection === 'horizontal') {
            isAtStart = this.scrollbar.scrollLeft <= 0;
          } else if (this.scrollDirection === 'vertical') {
            isAtStart = this.scrollbar.scrollTop <= 0;
          }

          this.arrowPrev?.classList.toggle('is-hidden', !isAtStart);
        });
      }

      scrollToVisibleElement() {
        [].forEach.call(this.scrollbar.children, (element) => {
          element.addEventListener('click', (event) => {
            event.preventDefault();

            let position;
            if (this.scrollDirection === 'horizontal') {
              position = element.offsetLeft - element.clientWidth;
            } else if (this.scrollDirection === 'vertical') {
              position = element.offsetTop - element.clientHeight;
            } else {
              return;
            }

            this.move(position);
          });
        });
      }

      move(position, behavior = 'smooth') {
        if (this.scrollDirection === 'horizontal') {
          this.scrollbar.scrollTo({
            top: 0,
            left: position,
            behavior: behavior,
          });
        } else if (this.scrollDirection === 'vertical') {
          this.scrollbar.scrollTo({
            top: position,
            left: 0,
            behavior: behavior,
          });
        }
      }

      detectScrollDirection() {
        if (!this.scrollbar) return;

        const style = getComputedStyle(this.scrollbar);

        if ((style.overflowX === 'auto' || style.overflowX === 'scroll') && this.scrollbar.scrollWidth > this.scrollbar.clientWidth) {
          this.scrollDirection = 'horizontal';
        } else if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && this.scrollbar.scrollHeight > this.scrollbar.clientHeight) {
          this.scrollDirection = 'vertical';
        } else {
          this.scrollDirection = null;
        }
      }
    }
  );
}
