import Flickity from 'flickity';

import {register} from '../vendor/theme-scripts/theme-sections';

const sections = {};

const selectors = {
  slider: '[data-slider]',
  item: '[data-item]',
};

const classes = {
  flickityEnabled: 'flickity-enabled',
};

const attributes = {
  sectionId: 'data-section-id',
};

class Testimonials {
  constructor(section) {
    this.container = section.container;
    this.sectionId = this.container.getAttribute(attributes.sectionId);
    this.slider = this.container.querySelector(selectors.slider);
    this.sliderResizeEvent = () => this.initSlider();
    this.flkty = null;
    this.initSlider();

    document.addEventListener('theme:resize:width', this.sliderResizeEvent);
  }

  initSlider() {
    const slidesCount = this.slider.querySelectorAll(selectors.item).length;
    let flickityEnabled = this.slider.classList.contains(classes.flickityEnabled);

    // Destroy slider if there are 3 slides on desktop or 2 on tablet
    // Use native scrolling on mobile
    if ((slidesCount == 2 && window.innerWidth >= theme.sizes.small) || slidesCount == 1 || window.innerWidth < theme.sizes.small) {
      if (flickityEnabled) {
        this.flkty.destroy();
      }

      return;
    }

    this.flkty = new Flickity(this.slider, {
      cellSelector: selectors.item,
      prevNextButtons: true,
      pageDots: false,
      groupCells: true,
      cellAlign: 'left',
      contain: true,
      adaptiveHeight: false,
    });

    this.flkty.resize();
    const isLargerThanVw = this.flkty.slideableWidth > this.flkty.size.width;
    // Destroy slider if slidable container is smaller than the slider's container width
    if (!isLargerThanVw) {
      this.flkty.destroy();
    }
  }

  onBlockSelect(evt) {
    if (this.flkty !== null) {
      const index = parseInt([...evt.target.parentNode.children].indexOf(evt.target));
      const slidesPerPage = parseInt(this.flkty.slides[0].cells.length);
      const groupIndex = Math.floor(index / slidesPerPage);

      this.flkty.select(groupIndex);
    } else {
      const sliderStyle = this.slider.currentStyle || window.getComputedStyle(this.slider);
      const sliderPadding = parseInt(sliderStyle.paddingLeft);
      const blockPositionLeft = evt.target.offsetLeft - sliderPadding;

      // Native scroll to item
      this.slider.scrollTo({
        top: 0,
        left: blockPositionLeft,
        behavior: 'smooth',
      });
    }
  }

  onUnload() {
    document.removeEventListener('theme:resize:width', this.sliderResizeEvent);
  }
}

const TestimonialsSection = {
  onLoad() {
    sections[this.id] = new Testimonials(this);
  },
  onUnload(e) {
    sections[this.id].onUnload(e);
  },
  onBlockSelect(e) {
    sections[this.id].onBlockSelect(e);
  },
};

register('testimonials', TestimonialsSection);
