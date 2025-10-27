class SiblingSwatches {
  constructor(swatches, product) {
    this.swatches = swatches;
    this.product = product;
    this.productLinks = this.product.querySelectorAll('[data-product-link]');
    this.productCutline = this.product.querySelector('[data-product-cutline]');
    this.productPrice = this.product.querySelector('[data-product-price]');
    this.productImage = this.product.querySelector('[data-product-image-default]');
    this.productImageSibling = this.product.querySelector('[data-product-image-sibling]');
    this.siblingsInnerHolder = this.product.querySelector('[data-sibling-inner]');

    this.init();
  }

  init() {
    this.cacheDefaultValues();

    this.siblingsInnerHolder.addEventListener('mouseleave', () => this.resetProductValues());
    this.siblingsInnerHolder.addEventListener('focusout', () => {
      if (document.body.classList.contains('is-focused')) this.resetProductValues();
    });

    this.swatches.forEach((swatch) => {
      swatch.addEventListener('mouseenter', (event) => this.showSibling(event));
      swatch.addEventListener('focusin', (event) => {
        if (document.body.classList.contains('is-focused')) this.showSibling(event);
      });
    });
  }

  cacheDefaultValues() {
    this.activeSibling = this.siblingsInnerHolder.querySelector('.sibling__link--current')?.closest('[data-sibling-link]');
    this.productImageSibling.setAttribute('data-sibling-image', this.activeSibling?.dataset.siblingImage);

    this.productLinkValue = this.productLinks[0].hasAttribute('data-product-link') ? this.productLinks[0].getAttribute('data-product-link') : '';
    this.productPriceValue = this.productPrice.innerHTML;

    if (this.productCutline) {
      this.productCutlineValue = this.productCutline.innerHTML;
    }
  }

  resetProductValues() {
    this.product.classList.remove('is-active');

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
    const siblingPrice = swatch.hasAttribute('data-sibling-price') ? swatch.getAttribute('data-sibling-price') : '';
    const siblingCompareAtPrice = swatch.hasAttribute('data-sibling-compare-at-price') ? swatch.getAttribute('data-sibling-compare-at-price') : '';
    const siblingCutline = swatch.hasAttribute('data-sibling-cutline') ? swatch.getAttribute('data-sibling-cutline') : '';
    const siblingImage = swatch.hasAttribute('data-sibling-image') ? swatch.getAttribute('data-sibling-image') : '';

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
    const imageSrc = theme.getSizedImageUrl(siblingImage, `${widthRounded}x`);
    const imageExists = this.productImageSibling.querySelector(`[src="${imageSrc}"]`);
    const showCurrentImage = () => {
      this.productImageSibling.classList.add('is-visible');
      this.productImageSibling.querySelector(`[src="${imageSrc}"]`).classList.add('is-fade');
    };
    const swapImages = () => {
      const activeSiblingImage = this.productImageSibling.getAttribute('data-sibling-image');
      const swapNewImageOnHover = siblingImage !== activeSiblingImage;
      const swapActiveSiblingImage = siblingImage === activeSiblingImage && this.productImageSibling.classList.contains('is-visible');

      // Avoid changing the image when hovering over the currently active sibling link, if the featured image remains unchanged.
      const shouldSwap = Boolean(swapActiveSiblingImage || swapNewImageOnHover);

      if (!shouldSwap) return;

      this.productImageSibling.querySelectorAll('img').forEach((image) => {
        image.classList.remove('is-fade');
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

    this.productImageSibling.classList.remove('is-visible');
    this.productImageSibling.querySelectorAll('img').forEach((image) => {
      image.classList.remove('is-fade');
    });
  }
}

if (!customElements.get('product-card-siblings')) {
  customElements.define(
    'product-card-siblings',
    class ProductCardSiblings extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
        this.product = this.closest('[data-grid-item]');
        this.siblingCount = this.querySelector('[data-sibling-count]');
        this.siblingFieldset = this.querySelector('[data-sibling-fieldset]');
        this.siblingLinks = this.querySelectorAll('[data-sibling-link]');
        this.productInfo = this.closest('[data-product-information]');
        this.productLink = this.closest('[data-product-link]');
        this.hideSwatchesTimer = 0;
        this.swatchesStyle = theme.settings.collectionSwatchStyle;

        if (this.siblingFieldset && this.productInfo) {
          if (this.swatchesStyle == 'grid' || this.swatchesStyle == 'slider' || this.swatchesStyle == 'limited') {
            this.siblingFieldset.classList.add('is-visible');
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
      }

      showSiblings() {
        if (this.hideSwatchesTimer) clearTimeout(this.hideSwatchesTimer);

        if (this.productLink) {
          this.productLink.classList.add('no-events');
        }

        if (this.swatchesStyle == 'text') return;

        this.siblingFieldset.classList.add('is-visible');
      }

      hideSiblings() {
        this.hideSwatchesTimer = setTimeout(() => {
          if (this.productLink) {
            this.productLink.classList.remove('no-events');
          }

          this.siblingFieldset.classList.remove('is-visible');
        }, 100);
      }
    }
  );
}
