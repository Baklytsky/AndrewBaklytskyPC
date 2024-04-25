import Flickity from 'flickity';

import flickitySmoothScrolling from '../globals/flickity-smooth-scrolling';
import {register} from '../vendor/theme-scripts/theme-sections';

const selectors = {
  pressItems: '[data-press-items]',
  logoSlider: '[data-logo-slider]',
  logoSlide: '[data-logo-slide]',
  links: 'a, button',
};

const attributes = {
  logoSlide: 'data-logo-index',
  tabIndex: 'tabindex',
};

let sections = {};

class Press {
  constructor(section) {
    this.container = section.container;
    this.slider = this.container.querySelector(selectors.pressItems);
    this.sliderNav = this.container.querySelector(selectors.logoSlider);
    this.sliderResizeEvent = () => this.checkSlides();

    this.initSlider();
    this.checkSlides();

    window.addEventListener('load', this.resizeSlider.bind(this));
    document.addEventListener('theme:resize:width', this.sliderResizeEvent);
  }

  checkSlides() {
    const containerWidth = this.container.offsetWidth;
    const slides = this.container.querySelectorAll(selectors.logoSlide);
    const sliderNav = Flickity.data(this.sliderNav) || null;

    if (sliderNav !== null) {
      sliderNav.options.draggable = false;
      sliderNav.options.wrapAround = false;
      sliderNav.options.contain = true;

      if (this.getSlidesWidth() > containerWidth && slides.length > 2) {
        sliderNav.options.draggable = true;
        sliderNav.options.wrapAround = true;
        sliderNav.options.contain = false;
      }
      sliderNav.resize();
      sliderNav.updateDraggable();
    }
  }

  getSlidesWidth() {
    const slides = this.container.querySelectorAll(selectors.logoSlide);
    let slidesTotalWidth = 0;

    if (slides.length) {
      slides.forEach((slide) => {
        slidesTotalWidth += slide.offsetWidth;
      });
    }
    return slidesTotalWidth;
  }

  /* Init slider */
  initSlider() {
    let flkty = Flickity.data(this.slider) || null;
    let flktyNav = Flickity.data(this.sliderNav) || null;
    const duration = parseInt(this.container.dataset.duration);
    const autoplay = this.container.dataset.autoplay === 'true' ? duration : false;

    flkty = new Flickity(this.slider, {
      fade: true,
      wrapAround: true,
      adaptiveHeight: true,
      prevNextButtons: false,
      pageDots: false,
      autoPlay: autoplay,
    });

    flktyNav = new Flickity(this.sliderNav, {
      draggable: false,
      wrapAround: false,
      contain: true,
      imagesLoaded: true,
      asNavFor: this.slider,
      prevNextButtons: false,
      adaptiveHeight: false,
      pageDots: false,
      on: {
        ready: () => {
          const slides = this.container.querySelectorAll(selectors.logoSlide);
          slides.forEach((slide) => {
            // Change slide text on logo change for a11y reasons
            slide.addEventListener('keyup', (event) => {
              if (event.code === theme.keyboardKeys.ENTER || event.code === theme.keyboardKeys.NUMPADENTER || event.code === theme.keyboardKeys.SPACE) {
                const selectedIndex = Number(slide.getAttribute(attributes.logoSlide));
                flkty.selectCell(selectedIndex);
              }
            });
          });
        },
      },
    });

    // iOS smooth scrolling fix
    flickitySmoothScrolling(this.slider);
    flickitySmoothScrolling(this.sliderNav);

    // Trigger text change on image move/drag
    flktyNav.on('change', (index) => {
      flkty.selectCell(index);
    });

    // Trigger text change on image move/drag
    flkty.on('change', (index) => {
      flktyNav.selectCell(index);

      flkty.cells.forEach((slide, i) => {
        slide.element.querySelectorAll(selectors.links).forEach((link) => {
          link.setAttribute(attributes.tabIndex, i === index ? '0' : '-1');
        });
      });
    });
  }

  // slider height fix on window load
  resizeSlider() {
    const hasSlider = Flickity.data(this.slider);

    if (hasSlider) {
      hasSlider.resize();
    }
  }

  onBlockSelect(event) {
    const slider = Flickity.data(this.slider) || null;
    const sliderNav = Flickity.data(this.sliderNav) || null;
    const index = parseInt([...event.target.parentNode.children].indexOf(event.target));

    if (slider !== null) {
      slider.select(index);
      slider.pausePlayer();
    }

    if (sliderNav !== null) {
      sliderNav.select(index);
    }
  }

  onBlockDeselect() {
    const slider = Flickity.data(this.slider) || null;
    const autoplay = this.container.dataset.autoplay === 'true';

    if (autoplay && slider !== null) {
      slider.playPlayer();
    }
  }

  onUnload() {
    document.removeEventListener('theme:resize:width', this.sliderResizeEvent);
  }
}

const pressSection = {
  onLoad() {
    sections[this.id] = new Press(this);
  },
  onUnload(e) {
    sections[this.id].onUnload(e);
  },
  onBlockSelect(e) {
    sections[this.id].onBlockSelect(e);
  },
  onBlockDeselect() {
    sections[this.id].onBlockDeselect();
  },
};

register('press', pressSection);
