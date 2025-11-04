if (!customElements.get('grid-swatch')) {
  customElements.define(
    'grid-swatch',
    class GridSwatch extends HTMLElement {
      constructor() {
        super();

        this.productItemMouseLeaveEvent = () => this.hideVariantImages();
        this.showVariantImageEvent = (swatchButton) => this.showVariantImage(swatchButton);
        this.resizeEvent = () => this.init();
      }

      connectedCallback() {
        this.handle = this.getAttribute('data-swatch-handle');
        this.productItem = this.closest('[data-grid-item]');
        this.productInfo = this.closest('[data-product-information]');
        this.productImage = this.productItem.querySelector('[data-product-image]');
        this.swatchesStyle = theme.settings.collectionSwatchStyle;
        document.addEventListener('theme:resize:width', this.resizeEvent);

        const label = this.getAttribute('data-swatch-label').trim().toLowerCase();

        this.fetchProduct(this.handle).then((product) => {
          this.product = product;
          this.colorOption = product.options.find(function (element) {
            return element.name.toLowerCase() === label || null;
          });

          if (this.colorOption) {
            this.init();
          }
        });
      }

      init() {
        this.swatchCount = this.productInfo.querySelector('[data-swatch-count]');
        this.swatchFieldset = this.productInfo.querySelector('[data-grid-swatch-fieldset]');
        this.hideSwatchesTimer = 0;

        if (this.swatchCount.hasAttribute('data-swatch-count')) {
          if (this.swatchesStyle == 'text' || this.swatchesStyle == 'text-slider') {
            if (this.swatchesStyle == 'text') return;

            this.swatchCount.addEventListener('mouseenter', () => {
              if (this.hideSwatchesTimer) clearTimeout(this.hideSwatchesTimer);

              this.productInfo.classList.add('no-events');
              this.swatchFieldset.classList.add('is-visible');
            });

            // Prevent color swatches blinking on mouse move
            this.productInfo.addEventListener('mouseleave', () => {
              this.hideSwatchesTimer = setTimeout(() => {
                this.productInfo.classList.remove('no-events');
                this.swatchFieldset.classList.remove('is-visible');
              }, 100);
            });
          }

          if (this.swatchesStyle == 'slider' || this.swatchesStyle == 'grid') {
            this.swatchFieldset.classList.add('is-visible');
          }

          if (this.swatchesStyle == 'limited') {
            this.swatchFieldset.classList.add('is-visible');
          }
        }

        this.bindSwatchButtonEvents();
      }

      bindSwatchButtonEvents() {
        this.querySelectorAll('[data-swatch-button]')?.forEach((swatchButton) => {
          // Show variant image when hover on color swatch
          swatchButton.addEventListener('mouseenter', this.showVariantImageEvent);
        });

        this.productItem.addEventListener('mouseleave', this.productItemMouseLeaveEvent);
      }

      showVariantImage(event) {
        const swatchButton = event.target;
        const variantName = swatchButton.getAttribute('data-swatch-variant-name')?.replaceAll('"', "'");
        const variantImages = this.productImage.querySelectorAll('[data-variant-title]');
        const variantImageSelected = this.productImage.querySelector(`[data-variant-title="${variantName}"]`);

        // Hide all variant images
        variantImages?.forEach((image) => {
          image.classList.remove('is-visible');
        });

        // Show selected variant image
        variantImageSelected?.classList.add('is-visible');
      }

      hideVariantImages() {
        // Hide all variant images
        this.productImage.querySelectorAll('[data-variant-title].is-visible')?.forEach((image) => {
          image.classList.remove('is-visible');
        });
      }

      fetchProduct(handle) {
        const requestRoute = `${window.theme.routes.root}products/${handle}.js`;

        return window
          .fetch(requestRoute)
          .then((response) => {
            return response.json();
          })
          .catch((e) => {
            console.error(e);
          });
      }

      disconnectedCallback() {
        document.removeEventListener('theme:resize:width', this.resizeEvent);
      }
    }
  );
}
