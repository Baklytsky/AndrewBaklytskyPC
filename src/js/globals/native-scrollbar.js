if (!customElements.get('native-scrollbar')) {
  customElements.define(
    'native-scrollbar',
    class NativeScrollbar extends HTMLElement {
      constructor() {
        super();

        this.scrollbar = this.querySelector('[data-scrollbar]');
        this.arrowNext = this.querySelector('[data-scrollbar-arrow-next]');
        this.arrowPrev = this.querySelector('[data-scrollbar-arrow-prev]');
        this.scrollbarWidth = 0;
        this.scrollbarHeight = 0;
        this.resizeEvents = this.resizeEvents.bind(this);
        this.scrollDirection = null;
      }

      connectedCallback() {
        this.addEventListener('theme:swatches:loaded', this.resizeEvents);
        document.addEventListener('theme:resize', this.resizeEvents);

        // Detect scroll direction
        this.detectScrollDirection();

        if (this.scrollbar.hasAttribute('data-scrollbar-slider')) {
          this.scrollToVisibleElement();
        }

        this.scrollbar.addEventListener(
          'scroll',
          window.theme.debounce(() => this.updateArrows(), 16)
        );

        if (this.arrowNext && this.arrowPrev) {
          this.resizeEvents();
          this.clickEvents();
        }
      }

      disconnectedCallback() {
        this.removeEventListener('theme:swatches:loaded', this.resizeEvents);
        document.removeEventListener('theme:resize', this.resizeEvents);
      }

      resizeEvents() {
        this.detectScrollDirection();
        this.scrollbarWidth = this.scrollbar.clientWidth;
        this.scrollbarHeight = this.scrollbar.clientHeight;
        this.updateArrows();
      }

      clickEvents() {
        this.arrowNext.addEventListener('click', (event) => {
          event.preventDefault();

          this.goToNext();
        });

        this.arrowPrev.addEventListener('click', (event) => {
          event.preventDefault();

          this.goToPrev();
        });
      }

      goToNext() {
        let moveWith, position;

        if (this.scrollDirection === 'horizontal') {
          moveWith = this.scrollbar.hasAttribute('data-scrollbar-slide-fullwidth') ? this.scrollbarWidth : this.scrollbarWidth / 2;
          position = this.scrollbar.scrollLeft + moveWith;
        } else if (this.scrollDirection === 'vertical') {
          moveWith = this.scrollbar.hasAttribute('data-scrollbar-slide-fullwidth') ? this.scrollbarHeight : this.scrollbarHeight / 2;
          position = this.scrollbar.scrollTop + moveWith;
        } else {
          return; // No scroll direction detected
        }

        this.arrowPrev.removeAttribute('disabled');
        this.move(position);
      }

      goToPrev() {
        let moveWith, position;

        if (this.scrollDirection === 'horizontal') {
          moveWith = this.scrollbar.hasAttribute('data-scrollbar-slide-fullwidth') ? this.scrollbarWidth : this.scrollbarWidth / 2;
          position = this.scrollbar.scrollLeft - moveWith;
        } else if (this.scrollDirection === 'vertical') {
          moveWith = this.scrollbar.hasAttribute('data-scrollbar-slide-fullwidth') ? this.scrollbarHeight : this.scrollbarHeight / 2;
          position = this.scrollbar.scrollTop - moveWith;
        } else {
          return; // No scroll direction detected
        }

        this.arrowNext.removeAttribute('disabled');
        this.move(position);
      }

      updateArrows() {
        if (!this.scrollDirection) {
          this.arrowPrev?.toggleAttribute('disabled', true);
          this.arrowNext?.toggleAttribute('disabled', true);
          return;
        }

        const EPS = 1;
        const sb = this.scrollbar;

        const need = this.scrollDirection === 'horizontal' ? sb.scrollWidth > sb.clientWidth : sb.scrollHeight > sb.clientHeight;
        const atStart = this.scrollDirection === 'horizontal' ? sb.scrollLeft <= EPS : sb.scrollTop <= EPS;
        const atEnd = this.scrollDirection === 'horizontal' ? Math.ceil(sb.scrollLeft + sb.clientWidth) >= sb.scrollWidth - EPS : Math.ceil(sb.scrollTop + sb.clientHeight) >= sb.scrollHeight - EPS;

        // Prev is disabled at the beginning or when scrolling is not needed
        this.arrowPrev?.toggleAttribute('disabled', atStart || !need);
        // Next is disabled at the end or when scrolling is not needed
        this.arrowNext?.toggleAttribute('disabled', atEnd || !need);
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

        this.setAttribute('data-direction', this.scrollDirection);
      }
    }
  );
}
