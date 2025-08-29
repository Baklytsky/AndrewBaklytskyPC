/*
  [data-scroll-trigger-point] sets the position that the observed element should reach.
  Accepted values:
    "top", "middle", "bottom"
*/

if (!customElements.get('scroll-spy')) {
  customElements.define(
    'scroll-spy',
    class ScrollSpy extends HTMLElement {
      constructor() {
        super();

        this.container = this?.closest(this?.getAttribute('data-scroll-spy-container')) || document;
        this.scrollSpyButton = this.querySelector('[data-scroll-spy]');
        this.elementToSpy = this.container.querySelector(this.scrollSpyButton.getAttribute('data-scroll-spy'));
        this.anchorSelector = `[data-scroll-spy="#${this.elementToSpy.id}"]`;
        this.anchor = this.container.querySelector(this.anchorSelector);
        this.anchorSiblings = this.container.querySelectorAll('[data-scroll-spy]');
        this.initialized = false;

        if (!this.anchor) return;

        this.triggerPoint = this.anchor.getAttribute('data-scroll-trigger-point');

        this.scrollCallback = () => this.onScroll();
        this.toggleScrollObserver = this.toggleScrollObserver.bind(this);
      }

      connectedCallback() {
        this.toggleScrollObserver();
        document.addEventListener('theme:resize:width', this.toggleScrollObserver);
      }

      toggleScrollObserver() {
        if (this.isEligible()) {
          if (!this.initialized) {
            document.addEventListener('theme:scroll', this.scrollCallback);
            this.initialized = true;
          }
        } else {
          document.removeEventListener('theme:scroll', this.scrollCallback);
          this.initialized = false;
        }
      }

      isEligible() {
        const isDesktopView = !window.theme.isMobile();
        const isMobileView = !isDesktopView;
        return (
          (isMobileView && this.anchor.hasAttribute('data-scroll-spy-mobile')) ||
          (isDesktopView && this.anchor.hasAttribute('data-scroll-spy-desktop')) ||
          (!this.anchor.hasAttribute('data-scroll-spy-desktop') && !this.anchor.hasAttribute('data-scroll-spy-mobile'))
        );
      }

      onScroll() {
        this.top = this.elementToSpy.getBoundingClientRect().top;

        // Check element's visibility in the viewport
        const windowHeight = Math.round(window.innerHeight);
        const scrollTop = Math.round(window.scrollY);
        const scrollBottom = scrollTop + windowHeight;
        const elementOffsetTopPoint = Math.round(this.top + scrollTop);
        const elementHeight = this.elementToSpy.offsetHeight;
        const elementOffsetBottomPoint = elementOffsetTopPoint + elementHeight;
        const isBottomOfElementPassed = elementOffsetBottomPoint < scrollTop;
        const isTopOfElementReached = elementOffsetTopPoint < scrollBottom;
        const isInView = isTopOfElementReached && !isBottomOfElementPassed;

        if (!isInView) return;
        if (!this.triggerPointReached()) return;

        // Update active classes
        this.anchorSiblings.forEach((anchor) => {
          if (!anchor.matches(this.anchorSelector)) {
            anchor.classList.remove('is-selected');
          }
        });

        this.anchor.classList.add('is-selected');
      }

      triggerPointReached() {
        let triggerPointReached = false;

        switch (this.triggerPoint) {
          case 'top':
            triggerPointReached = this.top <= 0;
            break;

          case 'middle':
            triggerPointReached = this.top <= window.innerHeight / 2;
            break;

          case 'bottom':
            triggerPointReached = this.top <= window.innerHeight;
            break;

          default:
            triggerPointReached = this.top <= 0;
        }

        return triggerPointReached;
      }

      disconnectedCallback() {
        document.removeEventListener('theme:resize:width', this.toggleScrollObserver);
        document.removeEventListener('theme:scroll', this.scrollCallback);
      }
    }
  );
}
