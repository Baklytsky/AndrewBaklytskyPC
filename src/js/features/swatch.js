import {getUrlWithVariant} from '../vendor/theme-scripts/theme-product-form';
import {fetchProduct} from '../util/fetch-product';
import loadScript from '../util/loader';

const defaults = {
  color: 'ash',
};

const selectors = {
  swatch: '[data-swatch]',
  swatchColor: '[data-swatch-color]',
  productBlock: '[data-product-block]',
  productImage: '[data-product-image]',
  productImageSecondary: '[data-product-image-secondary]',
  productImageHover: '[data-product-image-hover]',
  quickView: '[data-button-quick-view]',
  gridImage: '[data-grid-image]',
  link: '[data-grid-link]',
  swatchesMore: '[data-swatches-more]',
  sectionType: '[data-section-type]',
  swatchesContainer: '[data-swatches-container]',
  swatchesLabel: '[data-swatches-label]',
  swatchesButton: '[data-swatches-button]',
  selectorWrapper: '[data-option-position]',
  slider: '[data-slider]',
};

const classes = {
  mediaVisible: 'product__media--featured-visible',
  mediaHoverVisible: 'product__media__hover-img--visible',
  noImage: 'swatch__link--no-image',
  noOutline: 'no-outline',
  isVisible: 'is-visible',
  selectorLarge: 'selector-wrapper--large',
};

const attributes = {
  swatch: 'data-swatch',
  handle: 'data-swatch-handle',
  label: 'data-swatch-label',
  image: 'data-swatch-image',
  imageId: 'data-swatch-image-id',
  variant: 'data-swatch-variant',
  variantId: 'data-variant-id',
  variantSecondaryId: 'data-variant-secondary-id',
  loaded: 'data-loaded',
  href: 'href',
};

let swatches = {};
const sections = {};

class ColorMatch {
  constructor(options = {}) {
    this.settings = {
      ...defaults,
      ...options,
    };

    this.match = this.init();
  }

  getColor() {
    return this.match;
  }

  init() {
    const getColors = loadScript({json: theme.assets.swatches});
    return getColors
      .then((colors) => {
        return this.matchColors(colors, this.settings.color);
      })
      .catch((e) => {
        console.log('failed to load swatch colors script');
        console.log(e);
      });
  }

  matchColors(colors, name) {
    let bg = '#E5E5E5';
    let img = null;
    const path = theme.assets.base || '/';
    const comparisonName = name.toLowerCase().replace(/\s/g, '');
    const array = colors.colors;

    if (array) {
      let indexArray = null;

      const hexColorArr = array.filter((colorObj, index) => {
        const neatName = Object.keys(colorObj).toString().toLowerCase().replace(/\s/g, '');

        if (neatName === comparisonName) {
          indexArray = index;

          return colorObj;
        }
      });

      if (hexColorArr.length && indexArray !== null) {
        const value = Object.values(array[indexArray])[0];
        bg = value;

        if (value.includes('.jpg') || value.includes('.jpeg') || value.includes('.png') || value.includes('.svg')) {
          img = `${path}${value}`;
          bg = '#888888';
        }
      }
    }

    return {
      color: this.settings.color,
      path: img,
      hex: bg,
    };
  }
}

class Swatch {
  constructor(element) {
    this.element = element;
    this.swatchLink = this.element.nextElementSibling;
    this.colorString = element.getAttribute(attributes.swatch);
    this.image = this.element.getAttribute(attributes.image);
    this.imageId = this.element.getAttribute(attributes.imageId);
    this.variant = this.element.getAttribute(attributes.variant);
    this.outer = this.element.closest(selectors.productBlock);
    this.hoverImages = [];

    const matcher = new ColorMatch({color: this.colorString});
    matcher.getColor().then((result) => {
      this.colorMatch = result;
      this.init();
    });
  }

  init() {
    this.setStyles();

    if (this.variant && this.outer) {
      this.handleClicks();
    }

    if (!this.image && this.swatchLink) {
      this.swatchLink.classList.add(classes.noImage);
    }
  }

  setStyles() {
    if (this.colorMatch && this.colorMatch.hex) {
      this.element.style.setProperty('--swatch', `${this.colorMatch.hex}`);
    }

    if (this.colorMatch && this.colorMatch.path) {
      this.element.style.setProperty('background-image', `url(${this.colorMatch.path})`);
    }
  }

  handleClicks() {
    // Change PGI featured image on swatch click
    this.swatchLink.addEventListener('click', (event) => {
      const isFocusEnabled = !document.body.classList.contains(classes.noOutline);
      const variantId = this.swatchLink.getAttribute(attributes.variant);

      if (!isFocusEnabled) {
        event.preventDefault();
        this.updateImagesAndLinksOnEvent(variantId);
      }
    });

    this.swatchLink.addEventListener('keyup', (event) => {
      const isFocusEnabled = !document.body.classList.contains(classes.noOutline);
      const variantId = this.swatchLink.getAttribute(attributes.variant);

      if (event.code !== theme.keyboardKeys.ENTER && event.code !== theme.keyboardKeys.NUMPADENTER) {
        return;
      }

      if (!isFocusEnabled) {
        event.preventDefault();
        this.swatchLink.dispatchEvent(new Event('mouseenter', {bubbles: true}));
        this.updateImagesAndLinksOnEvent(variantId);
      }
    });
  }

  updateImagesAndLinksOnEvent(variantId) {
    this.updateLinks();
    this.replaceImages(variantId);
  }

  updateLinks() {
    this.linkElements = this.outer.querySelectorAll(selectors.link);
    this.quickView = this.outer.querySelector(selectors.quickView);

    // Update links
    if (this.linkElements.length) {
      this.linkElements.forEach((element) => {
        const destination = getUrlWithVariant(element.getAttribute('href'), this.variant);
        element.setAttribute('href', destination);
      });
    }

    // Change quickview variant with swatch one
    if (this.quickView && theme.settings.quickBuy === 'quick_buy') {
      this.quickView.setAttribute(attributes.variantId, this.variant);
    }
  }

  replaceImages(id) {
    const imageSecondary = this.outer.querySelector(`[${attributes.variantSecondaryId}="${id}"]`);
    const gridImage = this.outer.querySelector(`[${attributes.variantId}="${id}"]`);
    const gridImages = this.outer.querySelectorAll(selectors.gridImage);
    const currentGridImage = [...gridImages].find((image) => image.classList.contains(classes.mediaVisible));

    // Add new loaded image and sync with the secondary image for smooth animation
    if (gridImage && this.imageId) {
      if (!imageSecondary || !currentGridImage) return;

      const onAnimationEnd = () => {
        requestAnimationFrame(() => {
          currentGridImage.classList.remove(classes.mediaVisible);
          gridImage.classList.add(classes.mediaVisible);

          requestAnimationFrame(() => {
            imageSecondary.classList.remove(classes.mediaVisible);
          });
        });

        imageSecondary.removeEventListener('animationend', onAnimationEnd);
      };

      requestAnimationFrame(() => {
        imageSecondary.classList.add(classes.mediaVisible);
      });

      imageSecondary.addEventListener('animationend', onAnimationEnd);
    }

    // Change all hover images classes
    if (theme.settings.productGridHover === 'image') {
      this.hoverImages = this.outer.querySelectorAll(selectors.productImageHover);
    }

    if (this.hoverImages.length > 1) {
      this.hoverImages.forEach((hoverImage) => {
        hoverImage.classList.remove(classes.mediaHoverVisible);

        if (hoverImage.getAttribute(attributes.variantId) === this.variant) {
          hoverImage.classList.add(classes.mediaHoverVisible);
        } else {
          this.hoverImages[0].classList.add(classes.mediaHoverVisible);
        }
      });
    }
  }
}

class GridSwatch extends HTMLElement {
  constructor() {
    super();

    this.handle = this.getAttribute(attributes.handle);
    this.label = this.getAttribute(attributes.label).trim().toLowerCase();

    fetchProduct(this.handle).then((product) => {
      this.product = product;
      this.colorOption = product.options.find((element) => {
        return element.name.toLowerCase() === this.label || null;
      });

      if (this.colorOption) {
        this.swatches = this.colorOption.values;
        this.init();
      }
    });
  }

  init() {
    this.swatchElements = this.querySelectorAll(selectors.swatch);

    this.swatchElements.forEach((el) => {
      new Swatch(el);
    });

    this.handleShowMore();
  }

  handleShowMore() {
    this.initialHeight = this.offsetHeight;
    this.expandedHeight = this.initialHeight;
    const section = this.closest(selectors.sectionType);
    const moreLink = this.querySelector(selectors.swatchesMore);

    if (!moreLink) return;

    moreLink?.addEventListener('click', () => {
      this.classList.add(classes.isVisible);
    });

    section?.addEventListener('touchstart', (e) => {
      if (!this.contains(e.target)) {
        this.classList.remove(classes.isVisible);
        this.dispatchEvent(new Event('mouseleave', {bubbles: true}));
      }
    });

    this.addEventListener('mouseenter', () => {
      const onAnimationStart = (event) => {
        this.expandedHeight = this.offsetHeight;
        const slider = event.target.closest(selectors.slider);
        const heightDiffers = this.expandedHeight > this.initialHeight;

        if (heightDiffers && slider) {
          requestAnimationFrame(() => slider.dispatchEvent(new CustomEvent('theme:slider:resize', {bubbles: false})));
        }

        this.removeEventListener('animationstart', onAnimationStart);
      };

      this.addEventListener('animationstart', onAnimationStart);
    });

    this.addEventListener('mouseleave', () => {
      const onAnimationStart = (event) => {
        const slider = event.target.closest(selectors.slider);
        const heightDiffers = this.expandedHeight > this.initialHeight;

        if (heightDiffers && slider) {
          requestAnimationFrame(() => slider.dispatchEvent(new CustomEvent('theme:slider:resize', {bubbles: false})));
        }

        this.removeEventListener('animationstart', onAnimationStart);
      };

      this.addEventListener('animationstart', onAnimationStart);
    });
  }
}

class SwatchesContainer {
  constructor(container) {
    this.container = container;
    this.swatchesContainers = this.container.querySelectorAll(selectors.swatchesContainer);

    this.swatchesContainers.forEach((swatchesContainer) => {
      this.checkSwatchesHeightOnResize = () => this.checkSwatchesHeight(swatchesContainer);
      this.checkSwatchesHeight(swatchesContainer);
      document.addEventListener('theme:resize:width', this.checkSwatchesHeightOnResize);
    });
  }

  checkSwatchesHeight(swatchesContainer) {
    const label = swatchesContainer.querySelector(selectors.swatchesLabel);
    const swatch = swatchesContainer.querySelector(selectors.swatchesButton);
    const containerPaddingTop = parseInt(window.getComputedStyle(swatchesContainer).getPropertyValue('padding-top'));
    const labelMargin = parseInt(window.getComputedStyle(label).getPropertyValue('margin-bottom'));
    const swatchMargin = parseInt(window.getComputedStyle(swatch).getPropertyValue('margin-bottom'));
    const selectorWrapper = swatchesContainer.closest(selectors.selectorWrapper);
    selectorWrapper.classList.remove(classes.selectorLarge);

    if (swatchesContainer.offsetHeight - containerPaddingTop > label.offsetHeight + labelMargin + swatch.offsetHeight * 2 + swatchMargin * 2) {
      swatchesContainer.style.setProperty('--swatches-max-height', `${swatchesContainer.offsetHeight}px`);
      selectorWrapper.classList.add(classes.selectorLarge);
    }
  }

  onUnload() {
    this.swatchesContainers.forEach((swatchesContainer) => {
      document.removeEventListener('theme:resize:width', this.checkSwatchesHeightOnResize);
    });
  }
}

const makeSwatches = (container) => {
  swatches = [];
  const els = container.querySelectorAll(selectors.swatch);
  els.forEach((el) => {
    swatches.push(new Swatch(el));
  });
};

const swatchSection = {
  onLoad() {
    makeSwatches(this.container);
  },
};

const swatchesContainer = {
  onLoad() {
    sections[this.id] = new SwatchesContainer(this.container);
  },
  onUnload() {
    sections[this.id].onUnload();
  },
};

export {swatchSection, makeSwatches, GridSwatch, swatchesContainer, SwatchesContainer};
