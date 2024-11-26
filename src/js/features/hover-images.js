import Flickity from 'flickity';

const selectors = {
  slide: '[data-hover-slide]',
  slideTouch: '[data-hover-slide-touch]',
  slider: '[data-hover-slider]',
  productLink: '[data-product-link]',
  flickityButton: '.flickity-prev-next-button',
};

class HoverImages extends HTMLElement {
  constructor() {
    super();

    this.flkty = null;
    this.slider = this.querySelector(selectors.slider);
    this.handleScroll = this.handleScroll.bind(this);
  }

  connectedCallback() {
    if (window.theme.touch) {
      this.initTouch();
    } else {
      this.initFlickity();
    }
  }

  disconnectedCallback() {
    if (this.flkty) {
      this.flkty.options.watchCSS = false;
      this.flkty.destroy();
    }
  }

  initTouch() {
    this.style.setProperty('--slides-count', this.querySelectorAll(selectors.slideTouch).length);
    this.slider.addEventListener('scroll', this.handleScroll);
  }

  handleScroll() {
    const slideIndex = this.slider.scrollLeft / this.slider.clientWidth;
    this.style.setProperty('--slider-index', slideIndex);
  }

  initFlickity() {
    if (this.querySelectorAll(selectors.slide).length < 2) return;

    this.flkty = new Flickity(this.slider, {
      cellSelector: selectors.slide,
      contain: true,
      wrapAround: true,
      watchCSS: true,
      autoPlay: false,
      draggable: false,
      pageDots: false,
      prevNextButtons: true,
    });

    this.flkty.pausePlayer();

    this.addEventListener('mouseenter', () => {
      this.flkty.unpausePlayer();
    });

    this.addEventListener('mouseleave', () => {
      this.flkty.pausePlayer();
    });

    // Prevent page redirect on Flickity arrow click
    this.closest(selectors.productLink).addEventListener('click', (e) => {
      if (e.target.matches(selectors.flickityButton)) {
        e.preventDefault();
      }
    });
  }
}

export {HoverImages};
