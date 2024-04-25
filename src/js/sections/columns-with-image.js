import Flickity from 'flickity';

import {videoPlay} from '../features/video-play';
import {register} from '../vendor/theme-scripts/theme-sections';

const selectors = {
  slider: '[data-slider]',
  sliderItem: '[data-slider-item]',
  sliderItemImage: '[data-media-container]',
  links: 'a, button',
  flickityButton: '.flickity-button',
};

const classes = {
  carouselInactive: 'carousel--inactive',
  carouselResize: 'carousel--resize',
};

const attributes = {
  tabIndex: 'tabindex',
};

const sections = {};

class ColumnsWithImage {
  constructor(section) {
    this.container = section.container;
    this.slider = this.container.querySelector(selectors.slider);
    this.flkty = null;
    this.gutter = 0;
    this.checkSlidesSizeOnResize = () => this.checkSlidesSize();
    this.listen();
  }

  initSlider() {
    this.slider.classList.remove(classes.carouselInactive);

    this.flkty = new Flickity(this.slider, {
      pageDots: false,
      cellAlign: 'left',
      groupCells: true,
      contain: true,
      on: {
        ready: () => {
          this.setSliderArrowsPosition(this.slider);
          setTimeout(() => {
            this.changeTabIndex();
            this.flkty.resize();
          }, 0);
        },
        change: () => {
          this.changeTabIndex();
        },
      },
    });

    Flickity.prototype._createResizeClass = function () {
      this.element.classList.add(classes.carouselResize);
    };

    Flickity.createMethods.push('_createResizeClass');

    const resize = Flickity.prototype.resize;
    Flickity.prototype.resize = function () {
      this.element.classList.remove(classes.carouselResize);
      resize.call(this);
      this.element.classList.add(classes.carouselResize);
    };
  }

  destroySlider() {
    this.slider.classList.add(classes.carouselInactive);

    if (this.flkty !== null) {
      this.flkty.destroy();
      this.flkty = null;
    }
  }

  checkSlidesSize() {
    const sliderItemStyle = this.container.querySelector(selectors.sliderItem).currentStyle || window.getComputedStyle(this.container.querySelector(selectors.sliderItem));
    this.gutter = parseInt(sliderItemStyle.marginRight);
    const containerWidth = this.slider.offsetWidth;
    const itemsWidth = this.getItemsWidth();
    const itemsOverflowViewport = containerWidth < itemsWidth;

    if (window.innerWidth >= theme.sizes.small && itemsOverflowViewport) {
      this.initSlider();
    } else {
      this.destroySlider();
    }
  }

  changeTabIndex() {
    const selectedElementsIndex = this.flkty.selectedIndex;

    this.flkty.slides.forEach((slide, index) => {
      slide.cells.forEach((cell) => {
        cell.element.querySelectorAll(selectors.links).forEach((link) => {
          link.setAttribute(attributes.tabIndex, selectedElementsIndex === index ? '0' : '-1');
        });
      });
    });
  }

  getItemsWidth() {
    let itemsWidth = 0;
    const slides = this.slider.querySelectorAll(selectors.sliderItem);
    if (slides.length) {
      slides.forEach((item) => {
        itemsWidth += item.offsetWidth + this.gutter;
      });
    }

    return itemsWidth;
  }

  listen() {
    if (this.slider) {
      this.checkSlidesSize();
      document.addEventListener('theme:resize:width', this.checkSlidesSizeOnResize);
    }
  }

  setSliderArrowsPosition(slider) {
    const arrows = slider.querySelectorAll(selectors.flickityButton);
    const image = slider.querySelector(selectors.sliderItemImage);

    if (arrows.length && image) {
      arrows.forEach((arrow) => {
        arrow.style.top = `${image.offsetHeight / 2}px`;
      });
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
    document.removeEventListener('theme:resize:width', this.checkSlidesSizeOnResize);
  }
}

const ColumnsWithImageSection = {
  onLoad() {
    sections[this.id] = new ColumnsWithImage(this);
  },
  onUnload(e) {
    sections[this.id].onUnload(e);
  },
  onBlockSelect(e) {
    sections[this.id].onBlockSelect(e);
  },
};

register('columns-with-image', [ColumnsWithImageSection, videoPlay]);
