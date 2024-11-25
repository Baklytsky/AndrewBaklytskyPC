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

const sections = {};

class ScrollToElement {
  constructor(section) {
    this.section = section;
    this.container = section.container;
    this.scrollToButtons = this.container.querySelectorAll(selectors.scrollToElement);

    if (this.scrollToButtons.length) {
      this.init();
    }
  }

  init() {
    this.scrollToButtons.forEach((element) => {
      element.addEventListener('click', () => {
        const target = this.container.querySelector(element.getAttribute(attributes.dataScrollTo));

        if (!target || element.tagName === 'A') return;

        this.scrollToElement(target);
      });
    });
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

const scrollToElement = {
  onLoad() {
    sections[this.id] = new ScrollToElement(this);
  },
};

export default scrollToElement;
