import {register} from '../vendor/theme-scripts/theme-sections';

const selectors = {
  item: '[data-accordion-item]',
  button: '[data-accordion-button]',
};

const classes = {
  isExpanded: 'is-expanded',
};

const sections = {};

class ImageAccordions {
  constructor(section) {
    this.container = section.container;
    this.imageAccordionsItems = this.container.querySelectorAll(selectors.item);
    this.buttons = this.container.querySelectorAll(selectors.button);
    this.accordionExpandEvent = (item) => this.accordionExpand(item);
    this.accordionFocusEvent = (item) => this.accordionFocus(item);

    this.init();
  }

  init() {
    this.imageAccordionsItems.forEach((item) => {
      item.addEventListener('mouseenter', this.accordionExpandEvent.bind(this, item));
    });

    this.buttons.forEach((button) => {
      button.addEventListener('focusin', this.accordionFocusEvent.bind(this, button));
    });
  }

  accordionExpand(item) {
    if (!item.classList.contains(classes.isExpanded)) {
      this.imageAccordionsItems.forEach((item) => {
        item.classList.remove(classes.isExpanded);
      });
      item.classList.add(classes.isExpanded);
    }
  }

  accordionFocus(button) {
    button.closest(selectors.item).dispatchEvent(new Event('mouseenter'));
  }

  onBlockSelect(evt) {
    const element = evt.target;
    if (element) {
      element.dispatchEvent(new Event('mouseenter'));
    }
  }
}

const imageAccordionsSection = {
  onLoad() {
    sections[this.id] = new ImageAccordions(this);
  },
  onBlockSelect(evt) {
    sections[this.id].onBlockSelect(evt);
  },
};

register('image-accordions', imageAccordionsSection);
