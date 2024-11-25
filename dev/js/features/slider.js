import Flickity from 'flickity';
import FlickityFade from 'flickity-fade';

import {isDesktop} from '../util/media-query';

const selectors = {
  aos: '[data-aos]',
  collectionImage: '.collection-item__image',
  columnImage: '[data-column-image]',
  flickityNextArrow: '.flickity-button.next',
  flickityPrevArrow: '.flickity-button.previous',
  link: 'a:not(.btn)',
  productItemImage: '.product-item__image',
  slide: '[data-slide]',
  slideValue: 'data-slide',
  slider: '[data-slider]',
  sliderThumb: '[data-slider-thumb]',
};

const attributes = {
  arrowPositionMiddle: 'data-arrow-position-middle',
  slideIndex: 'data-slide-index',
  sliderOptions: 'data-options',
  slideTextColor: 'data-slide-text-color',
};

const classes = {
  aosAnimate: 'aos-animate',
  desktop: 'desktop',
  focused: 'is-focused',
  flickityEnabled: 'flickity-enabled',
  heroContentTransparent: 'hero__content--transparent',
  initialized: 'is-initialized',
  isLoading: 'is-loading',
  isSelected: 'is-selected',
  mobile: 'mobile',
  singleSlide: 'single-slide',
  sliderInitialized: 'js-slider--initialized',
};

const sections = {};

class Slider {
  constructor(container, slideshow = null) {
    this.container = container;
    this.slideshow = slideshow || this.container.querySelector(selectors.slider);

    if (!this.slideshow) return;

    this.slideshowSlides = this.slideshow.querySelectorAll(selectors.slide);

    if (this.slideshowSlides.length <= 1) return;

    this.sliderThumbs = this.container.querySelectorAll(selectors.sliderThumb);
    this.multipleSlides = this.slideshow.hasAttribute(attributes.slidesLargeDesktop);

    if (this.slideshow.hasAttribute(attributes.sliderOptions)) {
      this.customOptions = JSON.parse(decodeURIComponent(this.slideshow.getAttribute(attributes.sliderOptions)));
    }

    this.flkty = null;

    this.init();
  }

  init() {
    this.slideshow.classList.add(classes.isLoading);

    let slideSelector = selectors.slide;
    const isDesktopView = isDesktop();
    const slideMobile = `${selectors.slide}:not(.${classes.mobile})`;
    const slideDesktop = `${selectors.slide}:not(.${classes.desktop})`;
    const hasDeviceSpecificSelectors = this.slideshow.querySelectorAll(slideDesktop).length || this.slideshow.querySelectorAll(slideMobile).length;

    if (hasDeviceSpecificSelectors) {
      if (isDesktopView) {
        slideSelector = slideMobile;
      } else {
        slideSelector = slideDesktop;
      }
    }

    if (this.slideshow.querySelectorAll(slideSelector).length <= 1) {
      this.slideshow.classList.add(classes.singleSlide);
      this.slideshow.classList.remove(classes.isLoading);
    }

    this.sliderOptions = {
      cellSelector: slideSelector,
      contain: true,
      wrapAround: true,
      adaptiveHeight: true,
      ...this.customOptions,
      on: {
        ready: () => {
          requestAnimationFrame(() => {
            this.slideshow.classList.add(classes.initialized);
            this.slideshow.classList.remove(classes.isLoading);
            this.slideshow.parentNode.dispatchEvent(
              new CustomEvent('theme:slider:loaded', {
                bubbles: true,
                detail: {
                  slider: this,
                },
              })
            );
          });

          this.slideActions();

          if (this.sliderOptions.prevNextButtons) {
            this.positionArrows();
          }
        },
        change: (index) => {
          const slide = this.slideshowSlides[index];
          if (!slide || this.sliderOptions.groupCells) return;

          const elementsToAnimate = slide.querySelectorAll(selectors.aos);
          if (elementsToAnimate.length) {
            elementsToAnimate.forEach((el) => {
              el.classList.remove(classes.aosAnimate);
              requestAnimationFrame(() => {
                // setTimeout with `0` delay fixes functionality on Mobile and Firefox
                setTimeout(() => {
                  el.classList.add(classes.aosAnimate);
                }, 0);
              });
            });
          }
        },
        resize: () => {
          if (this.sliderOptions.prevNextButtons) {
            this.positionArrows();
          }
        },
      },
    };

    if (this.sliderOptions.fade) {
      this.flkty = new FlickityFade(this.slideshow, this.sliderOptions);
    }

    if (!this.sliderOptions.fade) {
      this.flkty = new Flickity(this.slideshow, this.sliderOptions);
    }

    this.flkty.on('change', () => this.slideActions(true));

    if (this.sliderThumbs.length) {
      this.sliderThumbs.forEach((element) => {
        element.addEventListener('click', (e) => {
          e.preventDefault();
          const slideIndex = [...element.parentElement.children].indexOf(element);
          this.flkty.select(slideIndex);
        });
      });
    }

    if (!this.flkty || !this.flkty.isActive) {
      this.slideshow.classList.remove(classes.isLoading);
    }
  }

  slideActions(changeEvent = false) {
    const currentSlide = this.slideshow.querySelector(`.${classes.isSelected}`);
    if (!currentSlide) return;
    const currentSlideTextColor = currentSlide.hasAttribute(attributes.slideTextColor) ? currentSlide.getAttribute(attributes.slideTextColor) : '';
    const currentSlideLink = currentSlide.querySelector(selectors.link);
    const buttons = this.slideshow.querySelectorAll(`${selectors.slide} a, ${selectors.slide} button`);

    if (document.body.classList.contains(classes.focused) && currentSlideLink && this.sliderOptions.groupCells && changeEvent) {
      currentSlideLink.focus();
    }

    if (buttons.length) {
      buttons.forEach((button) => {
        const slide = button.closest(selectors.slide);
        if (slide) {
          const tabIndex = slide.classList.contains(classes.isSelected) ? 0 : -1;
          button.setAttribute('tabindex', tabIndex);
        }
      });
    }

    this.slideshow.style.setProperty('--text', currentSlideTextColor);

    if (this.sliderThumbs.length && this.sliderThumbs.length === this.slideshowSlides.length && currentSlide.hasAttribute(attributes.slideIndex)) {
      const slideIndex = parseInt(currentSlide.getAttribute(attributes.slideIndex));
      const currentThumb = this.container.querySelector(`${selectors.sliderThumb}.${classes.isSelected}`);
      if (currentThumb) {
        currentThumb.classList.remove(classes.isSelected);
      }
      this.sliderThumbs[slideIndex].classList.add(classes.isSelected);
    }
  }

  positionArrows() {
    if (this.slideshow.hasAttribute(attributes.arrowPositionMiddle) && this.sliderOptions.prevNextButtons) {
      const itemImage = this.slideshow.querySelector(selectors.collectionImage) || this.slideshow.querySelector(selectors.productItemImage) || this.slideshow.querySelector(selectors.columnImage);

      // Prevent 'clientHeight' of null error if no image
      if (!itemImage) return;

      this.slideshow.querySelector(selectors.flickityPrevArrow).style.top = itemImage.clientHeight / 2 + 'px';
      this.slideshow.querySelector(selectors.flickityNextArrow).style.top = itemImage.clientHeight / 2 + 'px';
    }
  }

  onUnload() {
    if (this.slideshow && this.flkty) {
      this.flkty.options.watchCSS = false;
      this.flkty.destroy();
    }
  }

  onBlockSelect(evt) {
    if (!this.slideshow) return;
    // Ignore the cloned version
    const slide = this.slideshow.querySelector(`[${selectors.slideValue}="${evt.detail.blockId}"]`);

    if (!slide) return;
    let slideIndex = parseInt(slide.getAttribute(attributes.slideIndex));

    if (this.multipleSlides && !this.slideshow.classList.contains(classes.sliderInitialized)) {
      slideIndex = 0;
    }

    this.slideshow.classList.add(classes.isSelected);

    // Go to selected slide, pause autoplay
    if (this.flkty && this.slideshow.classList.contains(classes.flickityEnabled)) {
      this.flkty.selectCell(slideIndex);
      this.flkty.stopPlayer();
    }
  }

  onBlockDeselect() {
    if (!this.slideshow) return;
    this.slideshow.classList.remove(classes.isSelected);

    if (this.flkty && this.sliderOptions.hasOwnProperty('autoPlay') && this.sliderOptions.autoPlay) {
      this.flkty.playPlayer();
    }
  }
}

const slider = {
  onLoad() {
    sections[this.id] = [];
    const els = this.container.querySelectorAll(selectors.slider);
    els.forEach((el) => {
      sections[this.id].push(new Slider(this.container, el));
    });
  },
  onUnload() {
    sections[this.id].forEach((el) => {
      if (typeof el.onUnload === 'function') {
        el.onUnload();
      }
    });
  },
  onBlockSelect(e) {
    sections[this.id].forEach((el) => {
      if (typeof el.onBlockSelect === 'function') {
        el.onBlockSelect(e);
      }
    });
  },
  onBlockDeselect(e) {
    sections[this.id].forEach((el) => {
      if (typeof el.onBlockDeselect === 'function') {
        el.onBlockDeselect(e);
      }
    });
  },
};

export {slider, Slider};
