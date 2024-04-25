import Flickity from 'flickity';

import flickitySmoothScrolling from '../globals/flickity-smooth-scrolling';
import {register} from '../vendor/theme-scripts/theme-sections';

const sections = {};

const selectors = {
  slider: '[data-slider-gallery]',
  sliderNav: '[data-slider-info]',
  item: '[data-slide-item]',
};

class Locations {
  constructor(section) {
    this.container = section.container;
    this.slider = this.container.querySelector(selectors.slider);
    this.sliderNav = this.container.querySelector(selectors.sliderNav);

    this.initSlider();
  }

  initSlider() {
    const slidesCount = this.container.querySelectorAll(selectors.item).length;
    let flkty = Flickity.data(this.slider) || null;
    let flktyNav = Flickity.data(this.sliderNav) || null;

    if (slidesCount <= 1) {
      return;
    }

    flkty = new Flickity(this.slider, {
      fade: true,
      wrapAround: true,
      adaptiveHeight: true,
      prevNextButtons: false,
      pageDots: false,
    });

    // iOS smooth scrolling fix
    flickitySmoothScrolling(this.slider);

    flktyNav = new Flickity(this.sliderNav, {
      fade: true,
      wrapAround: true,
      imagesLoaded: true,
      asNavFor: this.slider,
      prevNextButtons: true,
      pageDots: false,
    });

    // Trigger text change on image move/drag
    flktyNav.on('change', () => {
      flkty.selectCell(flktyNav.selectedIndex);
    });

    // Trigger text change on image move/drag
    flkty.on('change', () => {
      flktyNav.selectCell(flkty.selectedIndex);
    });
  }

  onBlockSelect(evt) {
    const flkty = Flickity.data(this.slider) || null;
    const flktyNav = Flickity.data(this.sliderNav) || null;
    const index = parseInt([...evt.target.parentNode.children].indexOf(evt.target));

    if (flkty !== null) {
      flkty.select(index);
    }
    if (flktyNav !== null) {
      flktyNav.select(index);
    }
  }
}

const LocationsSection = {
  onLoad() {
    sections[this.id] = new Locations(this);
  },
  onBlockSelect(e) {
    sections[this.id].onBlockSelect(e);
  },
};

register('locations', LocationsSection);
