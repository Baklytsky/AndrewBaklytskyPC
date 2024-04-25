import {register} from '../vendor/theme-scripts/theme-sections';

const selectors = {
  slider: '[data-slider]',
};

let sections = {};

class IconsRow {
  constructor(section) {
    this.container = section.container;
    this.slider = this.container.querySelector(selectors.slider);
  }

  onBlockSelect(evt) {
    const sliderStyle = this.slider.currentStyle || window.getComputedStyle(this.slider);
    const sliderPadding = parseInt(sliderStyle.paddingLeft);
    const blockPositionLeft = evt.target.offsetLeft - sliderPadding;

    this.slider.scrollTo({
      top: 0,
      left: blockPositionLeft,
      behavior: 'smooth',
    });
  }
}

const iconsRowSection = {
  onLoad() {
    sections[this.id] = new IconsRow(this);
  },
  onBlockSelect(e) {
    sections[this.id].onBlockSelect(e);
  },
};

register('icons-row', iconsRowSection);
