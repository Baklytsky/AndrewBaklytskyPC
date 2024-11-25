import {getSizedImageUrl} from '@shopify/theme-images';
import Tooltip from './tooltip';
import NativeScrollbar from './native-scrollbar';

const selectors = {
  productCutline: '[data-product-cutline]',
  productLink: '[data-product-link]',
  productGridItem: '[data-grid-item]',
  productInfo: '[data-product-information]',
  productImage: '[data-product-image-default]',
  productImageSibling: '[data-product-image-sibling]',
  productPrice: '[data-product-price]',
  siblingsInnerHolder: '[data-sibling-inner]',
  siblingCount: '[data-sibling-count]',
  siblingFieldset: '[data-sibling-fieldset]',
  siblingLink: '[data-sibling-link]',
  tooltip: '[data-tooltip]',
};

const classes = {
  visible: 'is-visible',
  fade: 'is-fade',
  stopEvents: 'no-events',
  active: 'is-active',
};

const attributes = {
  siblingAddedImage: 'data-sibling-added-image',
  siblingCutline: 'data-sibling-cutline',
  siblingImage: 'data-sibling-image',
  siblingLink: 'data-sibling-link',
  siblingPrice: 'data-sibling-price',
  siblingCompareAtPrice: 'data-sibling-compare-at-price',
  productLink: 'data-product-link',
};

class SiblingSwatches {
  constructor(swatches, product) {
    this.swatches = swatches;
    this.product = product;
    this.productLinks = this.product.querySelectorAll(selectors.productLink);
    this.productCutline = this.product.querySelector(selectors.productCutline);
    this.productPrice = this.product.querySelector(selectors.productPrice);
    this.productImage = this.product.querySelector(selectors.productImage);
    this.productImageSibling = this.product.querySelector(selectors.productImageSibling);

    this.init();
  }

  init() {
    this.cacheDefaultValues();

    this.product.addEventListener('mouseleave', () => this.resetProductValues());
    this.product.addEventListener('focusout', () => this.resetProductValues());

    this.swatches.forEach((swatch) => {
      swatch.addEventListener('mouseenter', (event) => this.showSibling(event));
      swatch.addEventListener('focusin', (event) => this.showSibling(event));
    });

    if (this.productLinks.length) {
      this.swatches.forEach((swatch) => {
        swatch.addEventListener('click', () => {
          this.productLinks[0].click();
        });

        swatch.addEventListener('keyup', (e) => {
          if (e.code === 'Enter') {
            this.productLinks[0].click();
          }
        });
      });
    }
  }

  cacheDefaultValues() {
    this.productLinkValue = this.productLinks[0].hasAttribute(attributes.productLink) ? this.productLinks[0].getAttribute(attributes.productLink) : '';
    this.productPriceValue = this.productPrice.innerHTML;

    if (this.productCutline) {
      this.productCutlineValue = this.productCutline.innerHTML;
    }
  }

  resetProductValues() {
    this.product.classList.remove(classes.active);

    if (this.productLinkValue) {
      this.productLinks.forEach((productLink) => {
        productLink.href = this.productLinkValue;
      });
    }

    if (this.productPrice) {
      this.productPrice.innerHTML = this.productPriceValue;
    }

    if (this.productCutline && this.productCutline) {
      this.productCutline.innerHTML = this.productCutlineValue;
      this.productCutline.title = this.productCutlineValue;
    }

    this.hideSiblingImage();
  }

  showSibling(event) {
    const swatch = event.target;
    const siblingLink = swatch.hasAttribute(attributes.siblingLink) ? swatch.getAttribute(attributes.siblingLink) : '';
    const siblingPrice = swatch.hasAttribute(attributes.siblingPrice) ? swatch.getAttribute(attributes.siblingPrice) : '';
    const siblingCompareAtPrice = swatch.hasAttribute(attributes.siblingCompareAtPrice) ? swatch.getAttribute(attributes.siblingCompareAtPrice) : '';
    const siblingCutline = swatch.hasAttribute(attributes.siblingCutline) ? swatch.getAttribute(attributes.siblingCutline) : '';
    const siblingImage = swatch.hasAttribute(attributes.siblingImage) ? swatch.getAttribute(attributes.siblingImage) : '';

    if (siblingLink) {
      this.productLinks.forEach((productLink) => {
        productLink.href = siblingLink;
      });
    }

    if (siblingCompareAtPrice) {
      this.productPrice.innerHTML = `<span class="price sale"><span class="new-price">${siblingPrice}</span> <span class="old-price">${siblingCompareAtPrice}</span></span>`;
    } else {
      this.productPrice.innerHTML = `<span class="price">${siblingPrice}</span>`;
    }

    if (this.productCutline) {
      if (siblingCutline) {
        this.productCutline.innerHTML = siblingCutline;
        this.productCutline.title = siblingCutline;
      } else {
        this.productCutline.innerHTML = '';
        this.productCutline.title = '';
      }
    }

    if (siblingImage) {
      this.showSiblingImage(siblingImage);
    }
  }

  showSiblingImage(siblingImage) {
    if (!this.productImageSibling) return;

    // Add current sibling swatch image to PGI image
    const ratio = window.devicePixelRatio || 1;
    const pixels = this.productImage.offsetWidth * ratio;
    const widthRounded = Math.ceil(pixels / 180) * 180;
    const imageSrc = getSizedImageUrl(siblingImage, `${widthRounded}x`);
    const imageExists = this.productImageSibling.querySelector(`[src="${imageSrc}"]`);
    const showCurrentImage = () => {
      this.productImageSibling.classList.add(classes.visible);
      this.productImageSibling.querySelector(`[src="${imageSrc}"]`).classList.add(classes.fade);
    };
    const swapImages = () => {
      this.productImageSibling.querySelectorAll('img').forEach((image) => {
        image.classList.remove(classes.fade);
      });
      requestAnimationFrame(showCurrentImage);
    };

    if (imageExists) {
      swapImages();
    } else {
      const imageTag = document.createElement('img');

      imageTag.src = imageSrc;

      if (this.productCutline) {
        imageTag.alt = this.productCutline.innerText;
      }

      imageTag.addEventListener('load', () => {
        this.productImageSibling.append(imageTag);

        swapImages();
      });
    }
  }

  hideSiblingImage() {
    if (!this.productImageSibling) return;

    this.productImageSibling.classList.remove(classes.visible);
    this.productImageSibling.querySelectorAll('img').forEach((image) => {
      image.classList.remove(classes.fade);
    });
  }
}

class ProductSiblings extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.product = this.closest(selectors.productGridItem);
    this.siblingScrollbar = this.querySelector(selectors.siblingsInnerHolder);
    this.siblingCount = this.querySelector(selectors.siblingCount);
    this.siblingFieldset = this.querySelector(selectors.siblingFieldset);
    this.siblingLinks = this.querySelectorAll(selectors.siblingLink);
    this.productInfo = this.closest(selectors.productInfo);
    this.productLink = this.closest(selectors.link);
    this.hideSwatchesTimer = 0;
    this.swatchesStyle = theme.settings.collectionSwatchStyle;

    this.initScrollbar();

    if (this.siblingFieldset && this.productInfo) {
      if (this.swatchesStyle == 'grid' || this.swatchesStyle == 'slider' || this.swatchesStyle == 'limited') {
        this.siblingFieldset.classList.add(classes.visible);
      }

      if (this.siblingCount) {
        this.siblingCount.addEventListener('mouseenter', () => this.showSiblings());

        // Prevent color swatches blinking on mouse move
        this.productInfo.addEventListener('mouseleave', () => this.hideSiblings());
      }
    }

    if (this.siblingLinks.length) {
      new SiblingSwatches(this.siblingLinks, this.product);
    }

    // Init Tooltips
    this.querySelectorAll(selectors.tooltip).forEach((tooltip) => {
      new Tooltip(tooltip);
    });
  }

  showSiblings() {
    if (this.hideSwatchesTimer) clearTimeout(this.hideSwatchesTimer);

    if (this.productLink) {
      this.productLink.classList.add(classes.stopEvents);
    }

    if (this.swatchesStyle == 'text') return;

    this.siblingFieldset.classList.add(classes.visible);
  }

  hideSiblings() {
    this.hideSwatchesTimer = setTimeout(() => {
      if (this.productLink) {
        this.productLink.classList.remove(classes.stopEvents);
      }

      this.siblingFieldset.classList.remove(classes.visible);
    }, 100);
  }

  initScrollbar() {
    if (this.siblingScrollbar) {
      new NativeScrollbar(this.siblingScrollbar);
    }
  }
}

export {ProductSiblings};
