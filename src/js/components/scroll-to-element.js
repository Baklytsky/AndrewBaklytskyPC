import scrollTo from '../util/scroll-to';

const selectors = {
  scrollToElement: '[data-scroll-to]',
  tooltip: '[data-tooltip]',
  collapsibleTrigger: '[data-collapsible-trigger]',
};

const attributes = {
  open: 'open',
  dataScrollTo: 'data-scroll-to',
  tooltipStopMousenterValue: 'data-tooltip-stop-mouseenter',
};

if (!customElements.get('scroll-to-element')) {
  customElements.define(
    'scroll-to-element',
    class ScrollToElement extends HTMLElement {
      constructor() {
        super();

        this.scrollToButton = this.querySelector(selectors.scrollToElement);
      }

      connectedCallback() {
        if (this.scrollToButton) {
          this.scrollToButton.addEventListener('click', () => {
            const target = document.querySelector(this.scrollToButton.getAttribute(attributes.dataScrollTo));

            if (!target || this.scrollToButton.tagName === 'A') return;

            this.scrollToElement(target);
          });
        }
      }

      scrollToElement(element) {
        scrollTo(element.getBoundingClientRect().top + 1);

        const collapsibleElement = element.nextElementSibling.matches('details') ? element.nextElementSibling : null;

        if (collapsibleElement) {
          const collapsibleTrigger = collapsibleElement?.querySelector(selectors.collapsibleTrigger);
          const isOpen = collapsibleElement.hasAttribute(attributes.open);

          if (!isOpen) {
            collapsibleTrigger?.dispatchEvent(new Event('click'));
          }
        }

        const tooltips = document.querySelectorAll(`${selectors.tooltip}:not([${attributes.tooltipStopMousenterValue}])`);
        if (tooltips.length) {
          tooltips.forEach((tooltip) => {
            tooltip.setAttribute(attributes.tooltipStopMousenterValue, '');

            setTimeout(() => {
              tooltip.removeAttribute(attributes.tooltipStopMousenterValue);
            }, 1000);
          });
        }
      }
    }
  );
}
