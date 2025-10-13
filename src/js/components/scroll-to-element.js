if (!customElements.get('scroll-to-element')) {
  customElements.define(
    'scroll-to-element',
    class ScrollToElement extends HTMLElement {
      constructor() {
        super();

        this.scrollToButton = this.querySelector('[data-scroll-to]');
      }

      connectedCallback() {
        if (this.scrollToButton) {
          this.scrollToButton.addEventListener('click', () => {
            const target = document.querySelector(this.scrollToButton.getAttribute('data-scroll-to'));

            if (!target || this.scrollToButton.tagName === 'A') return;

            this.scrollToElement(target);
          });
        }
      }

      scrollToElement(element) {
        window.theme.scrollTo(element.getBoundingClientRect().top + 1);

        const collapsibleElement = element.nextElementSibling.matches('details') ? element.nextElementSibling : null;

        if (collapsibleElement) {
          const collapsibleTrigger = collapsibleElement?.querySelector('[data-collapsible-trigger]');
          const isOpen = collapsibleElement.hasAttribute('open');

          if (!isOpen) {
            collapsibleTrigger?.dispatchEvent(new Event('click'));
          }
        }

        const tooltips = document.querySelectorAll('[data-tooltip]:not([data-tooltip-stop-mouseenter])');
        if (tooltips.length) {
          tooltips.forEach((tooltip) => {
            tooltip.setAttribute('data-tooltip-stop-mouseenter', '');

            setTimeout(() => {
              tooltip.removeAttribute('data-tooltip-stop-mouseenter');
            }, 1000);
          });
        }
      }
    }
  );
}
