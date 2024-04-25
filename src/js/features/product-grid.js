import Flickity from 'flickity';

import QuickViewPopup from './quick-view-popup';

const selectors = {
  slider: '[data-slider]',
  productMediaContainer: '[data-product-media-container]',
  productMediaSlider: '[data-product-media-slideshow]',
  productMediaSlide: '[data-product-media-slideshow-slide]',
  progressBar: '[data-product-slideshow-progress]',
  flickityButton: '.flickity-button',
  popupProduct: '[data-product]',
  popupClose: '[data-popup-close]',
};

const classes = {
  fill: 'fill',
  quickViewVisible: 'js-quick-view-visible',
};

const sections = {};

class ProductGrid {
  constructor(container) {
    this.container = container;
    this.body = document.body;
    this.sliders = this.container.querySelectorAll(selectors.slider);

    if (theme.settings.productGridHover === 'slideshow' && !window.theme.touch) {
      this.productGridSlideshow();
    }

    new QuickViewPopup(this.container);
  }

  /* Product grid slideshow */
  productGridSlideshow() {
    const productMediaSlider = this.container.querySelectorAll(selectors.productMediaSlider);
    const linkedImages = this.container.querySelectorAll(selectors.productMediaContainer);

    if (productMediaSlider.length) {
      productMediaSlider.forEach((slider) => {
        const mediaContainer = slider.closest(selectors.productMediaContainer);
        const progressBar = mediaContainer.querySelector(selectors.progressBar);
        const countImages = slider.querySelectorAll(selectors.productMediaSlide).length;
        const autoplaySpeed = 2200;
        const draggable = !this.sliders.length; // Enable dragging if only layout is not Carousel
        let flkty = new Flickity.data(slider);
        let timer = 0;

        let cellSelector = selectors.productMediaSlide;

        if (!flkty.isActive && countImages > 1) {
          flkty = new Flickity(slider, {
            draggable: draggable,
            cellSelector: cellSelector,
            contain: true,
            wrapAround: true,
            imagesLoaded: true,
            pageDots: false,
            prevNextButtons: false,
            adaptiveHeight: false,
            pauseAutoPlayOnHover: false,
            selectedAttraction: 0.2,
            friction: 1,
            on: {
              ready: () => {
                this.container.style.setProperty('--autoplay-speed', `${autoplaySpeed}ms`);
              },
              change: () => {
                if (timer) {
                  clearTimeout(timer);
                }

                progressBar.classList.remove(classes.fill);
                progressBar.offsetWidth; // Force a reflow to ensure the remove class takes effect immediately

                requestAnimationFrame(() => {
                  progressBar.classList.add(classes.fill);
                });

                timer = setTimeout(() => {
                  progressBar.classList.remove(classes.fill);
                }, autoplaySpeed);
              },
              dragEnd: () => {
                flkty.playPlayer();
              },
            },
          });

          if (!window.theme.touch) {
            mediaContainer.addEventListener('mouseenter', () => {
              progressBar.classList.add(classes.fill);

              if (timer) {
                clearTimeout(timer);
              }

              timer = setTimeout(() => {
                progressBar.classList.remove(classes.fill);
              }, autoplaySpeed);

              flkty.options.autoPlay = autoplaySpeed;
              flkty.playPlayer();
            });
            mediaContainer.addEventListener('mouseleave', () => {
              flkty.stopPlayer();
              if (timer) {
                clearTimeout(timer);
              }
              progressBar.classList.remove(classes.fill);
            });
          }
        }
      });
    }

    // Prevent page redirect on slideshow arrow click
    if (linkedImages.length) {
      linkedImages.forEach((item) => {
        item.addEventListener('click', (e) => {
          if (e.target.matches(selectors.flickityButton)) {
            e.preventDefault();
          }
        });
      });
    }
  }

  /**
   * Quickview popup close function
   */
  popupClose() {
    const popupProduct = document.querySelector(selectors.popupProduct);
    if (popupProduct) {
      const popupClose = popupProduct.querySelector(selectors.popupClose);
      popupClose.dispatchEvent(new Event('click'));
    }
  }

  /**
   * Event callback for Theme Editor `section:block:select` event
   */
  onBlockSelect() {
    if (this.body.classList.contains(classes.quickViewVisible)) {
      this.popupClose();
    }
  }

  /**
   * Event callback for Theme Editor `section:deselect` event
   */
  onDeselect() {
    if (this.body.classList.contains(classes.quickViewVisible)) {
      this.popupClose();
    }
  }

  /**
   * Event callback for Theme Editor `section:unload` event
   */
  onUnload() {
    if (this.body.classList.contains(classes.quickViewVisible)) {
      this.popupClose();
    }
  }
}

const productGrid = {
  onLoad() {
    sections[this.id] = new ProductGrid(this.container);
  },
  onBlockSelect() {
    sections[this.id].onBlockSelect();
  },
  onDeselect() {
    sections[this.id].onDeselect();
  },
  onUnload() {
    sections[this.id].onUnload();
  },
};

export {ProductGrid, productGrid};
