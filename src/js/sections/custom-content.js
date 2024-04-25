import Flickity from 'flickity';

import {videoPlay} from '../features/video-play';
import videoBackground from '../features/video-background';
import {productGrid} from '../features/product-grid';
import {register} from '../vendor/theme-scripts/theme-sections';
import {newsletterSection} from '../globals/newsletter';
import {tooltip} from '../features/tooltip';

const selectors = {
  product: '[data-product]',
  productSlider: '[data-slider]',
  productSlide: '[data-slide]',
  productGridItemImage: '[data-product-media-container]',
  flickityButton: '.flickity-button',
  item: '[data-slide]',
  links: 'a, button',
};

const attributes = {
  tabIndex: 'tabindex',
};

const sections = {};

class CustomContent {
  constructor(container) {
    this.container = container;
    this.product = this.container.querySelectorAll(selectors.product);
    this.productSlider = this.container.querySelectorAll(selectors.productSlider);
    this.checkSliderOnResize = () => this.checkSlider();
    this.resizeSliderEvent = (event) => this.resizeSlider(event);
    this.flkty = [];
    this.videoObj = [];
    this.quickViewObj = [];

    this.listen();
  }

  checkSlider() {
    if (window.innerWidth >= theme.sizes.small) {
      this.productSlider.forEach((slider) => {
        this.initProductSlider(slider);
      });
    } else {
      this.productSlider.forEach((slider) => {
        this.destroyProductSlider(slider);
      });
    }
  }

  initProductSlider(slider) {
    const slidesCount = slider.querySelectorAll(selectors.productSlide).length;
    const sliderId = slider.dataset.slider;

    if (slidesCount > 1) {
      if (this.flkty[sliderId] === undefined || !this.flkty[sliderId].isActive) {
        this.flkty[sliderId] = new Flickity(slider, {
          prevNextButtons: true,
          adaptiveHeight: true,
          pageDots: true,
          wrapAround: true,
          on: {
            ready: () => {
              this.setSliderArrowsPosition(slider);
            },
            change: (index) => {
              this.flkty[sliderId].cells.forEach((slide, i) => {
                slide.element.querySelectorAll(selectors.links).forEach((link) => {
                  link.setAttribute(attributes.tabIndex, i === index ? '0' : '-1');
                });
              });
            },
          },
        });
      } else {
        this.setSliderArrowsPosition(slider);
      }
    }
  }

  destroyProductSlider(slider) {
    const sliderId = slider.dataset.slider;

    if (typeof this.flkty[sliderId] === 'object') {
      this.flkty[sliderId].destroy();
    }
  }

  setSliderArrowsPosition(slider) {
    const arrows = slider.querySelectorAll(selectors.flickityButton);
    const image = slider.querySelector(selectors.productGridItemImage);

    if (arrows.length && image) {
      arrows.forEach((arrow) => {
        arrow.style.top = `${image.offsetHeight / 2}px`;
      });
    }
  }

  resizeSlider(event) {
    const slider = event.target;
    const flkty = Flickity.data(slider) || null;

    if (!flkty) return;
    flkty.resize();
  }

  listen() {
    this.checkSlider();
    document.addEventListener('theme:resize:width', this.checkSliderOnResize);

    this.productSlider.forEach((slider) => {
      slider.addEventListener('theme:slider:resize', this.resizeSliderEvent);
    });
  }

  onUnload() {
    if (this.flkty) {
      for (const key in this.flkty) {
        if (this.flkty.hasOwnProperty(key)) {
          this.flkty[key].destroy();
        }
      }
    }

    document.removeEventListener('theme:resize:width', this.checkSliderOnResize);

    this.productSlider.forEach((slider) => {
      slider.removeEventListener('theme:slider:resize', this.resizeSliderEvent);
    });
  }
}

const CustomContentSection = {
  onLoad() {
    sections[this.id] = new CustomContent(this.container);
  },
  onUnload(e) {
    sections[this.id].onUnload(e);
  },
};

register('custom-content', [CustomContentSection, newsletterSection, videoPlay, tooltip, videoBackground, productGrid]);
