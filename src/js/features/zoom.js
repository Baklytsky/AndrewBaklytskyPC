import {a11y} from '../vendor/theme-scripts/theme-a11y';

import {LoadPhotoswipe} from './load-photoswipe';

const selectors = {
  mediaContainer: '[data-product-single-media-group]',
  productMediaSlider: '[data-product-single-media-slider]',
  zoomWrapper: '[data-zoom-wrapper]',
};

const classes = {
  popupClass: 'pswp-zoom-gallery',
  popupClassNoThumbs: 'pswp-zoom-gallery--single',
  isMoving: 'is-moving',
};

const attributes = {
  dataImageWidth: 'data-image-width',
  dataImageHeight: 'data-image-height',
};

class Zoom {
  constructor(container) {
    this.container = container;
    this.mediaContainer = this.container.querySelector(selectors.mediaContainer);
    this.slider = this.container.querySelector(selectors.productMediaSlider);
    this.zoomWrappers = this.container.querySelectorAll(selectors.zoomWrapper);
    this.zoomEnable = this.mediaContainer.dataset.gallery === 'true';
    this.a11y = a11y;

    if (this.zoomEnable) {
      this.init();
    }
  }

  init() {
    if (this.zoomWrappers.length) {
      this.zoomWrappers.forEach((element, i) => {
        element.addEventListener('click', (e) => {
          e.preventDefault();

          const isMoving = this.slider && this.slider.classList.contains(classes.isMoving);

          if (!isMoving) {
            this.a11y.state.trigger = element;
            this.createZoom(i);
          }
        });
      });
    }
  }

  createZoom(indexImage) {
    const instance = this;
    let items = [];
    let counter = 0;

    this.zoomWrappers.forEach((elementImage) => {
      const imgSrc = elementImage.getAttribute('href');
      const imgWidth = parseInt(elementImage.getAttribute(attributes.dataImageWidth));
      const imgHeight = parseInt(elementImage.getAttribute(attributes.dataImageHeight));

      items.push({
        src: imgSrc,
        w: imgWidth,
        h: imgHeight,
        msrc: imgSrc,
      });

      counter += 1;
      if (instance.zoomWrappers.length === counter) {
        let popupClass = `${classes.popupClass}`;

        if (counter === 1) {
          popupClass = `${classes.popupClass} ${classes.popupClassNoThumbs}`;
        }
        const options = {
          barsSize: {top: 60, bottom: 60},
          history: false,
          focus: false,
          index: indexImage,
          mainClass: popupClass,
          showHideOpacity: true,
          showAnimationDuration: 250,
          hideAnimationDuration: 250,
          closeOnScroll: false,
          closeOnVerticalDrag: false,
          captionEl: false,
          closeEl: true,
          closeElClasses: ['caption-close'],
          tapToClose: false,
          clickToCloseNonZoomable: false,
          maxSpreadZoom: 2,
          loop: true,
          spacing: 0,
          allowPanToNext: true,
          pinchToClose: false,
        };

        new LoadPhotoswipe(items, options);
      }
    });
  }
}

export default Zoom;
