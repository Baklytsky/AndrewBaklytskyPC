if (!customElements.get('bundle-collection')) {
  customElements.define(
    'bundle-collection',
    class BundleCollection extends HTMLElement {
      constructor() {
        super();

        this.bundle = this.getAttribute('data-bundle') === 'true';
        this.buttons = this.querySelectorAll('[data-bundle-product-button]');
        this.maxSelection = parseInt(this.getAttribute('data-bundle-max-selection'));
        this.animationTiming = parseInt(this.getAttribute('data-bundle-animation-timing'));
        this.selectedCount = this.querySelector('[data-bundle-selected-count]');
        this.bundleTotal = this.querySelector('[data-bundle-total]');
        this.bundleTotalSavings = this.querySelector('[data-bundle-total-savings]');
        this.addButton = this.querySelector('[data-bundle-add-to-cart]');
        this.scrollToBundleButton = this.querySelector('[data-bundle-scroll-button]');
        this.placeholders = this.querySelectorAll('[data-bundle-placeholder]');
        this.selectedProducts = [];
        this.bundleCartItems = null;
        this.bundleId = this.hasAttribute('data-bundle-id') ? this.getAttribute('data-bundle-id') : '';
        this.discountType = this?.getAttribute('data-bundle-discount-type');
        this.discountValue = this?.getAttribute('data-bundle-discount-value');
        this.bundleButtonAddEvent = (event) => this.bundleButtonAdd(event);
        this.bundleButtonChangeEvent = (event) => this.bundleButtonChange(event);
        this.addProductsToCartEvent = (event) => this.addProductsToCart(event);
        this.addProductToBundleModalEvent = (event) => this.addProductToBundleModal(event);
        this.scrollToBundleEvent = (event) => this.scrollToBundle(event);
        this.productAddSuccessEvent = (event) => this.handleProductAddSuccess(event);
        this.cartBuiltEvent = (event) => this.handleCartBuilt(event);
        this.pendingBundleClear = false;
      }

      connectedCallback() {
        if (!this.bundle) return;

        // Reset bundle data on page load/refresh to start fresh
        this.clearBundleData();

        if (this.buttons.length) {
          this.buttons.forEach((button) => {
            button.addEventListener('click', this.bundleButtonAddEvent);
          });
        }

        this.addEventListener('theme:bundle:change', this.bundleButtonChangeEvent);
        this.addEventListener('theme:bundle:button-modal', this.addProductToBundleModalEvent);

        this.scrollToBundleButton?.addEventListener('click', this.scrollToBundleEvent);
        this.addButton?.addEventListener('click', this.addProductsToCartEvent);

        // Listen for successful product add to mark bundle for clearing
        document.addEventListener('theme:product:add', this.productAddSuccessEvent);
        // Listen for cart built event to clear bundle data after cart is ready
        document.addEventListener('theme:cart:built', this.cartBuiltEvent);

        this.updateUI();
      }

      scrollToBundle() {
        window.theme.scrollTo(this.getBoundingClientRect().top);
      }

      handleProductAddSuccess(event) {
        // Check if this is a bundle add to cart by checking if the button is the bundle add button
        if (event.detail?.button === this.addButton) {
          // Mark bundle for clearing when cart is built
          this.pendingBundleClear = true;
        }
      }

      handleCartBuilt(event) {
        // Clear bundle data after cart has been built
        if (this.pendingBundleClear) {
          setTimeout(() => {
            this.pendingBundleClear = false;
            this.clearBundleData();
          }, 600); // match the ".drawer__inner" animation timing of 0.6s
        }
      }

      clearBundleData() {
        // Reset selected products
        this.selectedProducts = [];

        // Clear all placeholders
        this.placeholders.forEach((placeholder) => {
          placeholder.classList.remove('is-filled', 'is-dot-active', 'is-line-active', 'is-animate-in', 'is-animate-out');
          const filledEl = placeholder.querySelector('[data-bundle-placeholder-filled]');
          if (filledEl) {
            filledEl.innerHTML = '';
          }
        });

        // Reset first placeholder dot state
        if (this.placeholders.length > 0) {
          this.placeholders[0].classList.remove('is-dot-active');
        }

        // Update UI to reflect cleared state
        this.updateUI();
      }

      addProductToBundleModal(event) {
        this.addProductToBundle(event.detail.data);
      }

      addProductsToCart() {
        if (this.selectedProducts.filter((p) => p !== null).length === this.maxSelection) {
          this.bundleCartItems = document.querySelectorAll(`[data-bundle-cart-item="${this.bundleId}"]`);
          const bundleSequence = this.bundleCartItems.length ? this.bundleCartItems.length + 1 : 1;
          const timestamp = Date.now();

          this.selectedProducts.forEach((element, index) => {
            if (this.bundleId !== '') {
              // Unique ID prevents Shopify from merging duplicate products into single line items
              element.properties._bundle_unique_id = `${this.bundleId}_${bundleSequence}_${index + 1}_${timestamp + index}`;
              element.properties._bundle_item_index = `${index + 1}`;
            }
          });

          window.theme.a11y.lastElement = this.addButton;

          document.dispatchEvent(
            new CustomEvent('theme:cart:add', {
              detail: {
                button: this.addButton,
                data: this.selectedProducts,
              },
            })
          );
        }
      }

      bundleButtonChange(event) {
        const productCard = event.target;
        const button = productCard.querySelector('[data-bundle-product-button]');

        if (button) {
          // Add event listener for the button
          button.addEventListener('click', this.bundleButtonAddEvent);

          // Check if bundle is full and disable button if needed
          const filledCount = this.selectedProducts.length;
          if (filledCount >= this.maxSelection) {
            button.disabled = true;
            button.classList.add('is-disabled');
          }
        }
      }

      bundleButtonAdd(event) {
        const target = event.currentTarget;
        if (!target.hasAttribute('data-quick-add-btn')) {
          const productItem = target.closest('[data-grid-item]');
          const dataSelector = productItem.querySelector('[data-bundle-json]');
          if ((dataSelector && !dataSelector.innerHTML) || !dataSelector) {
            return;
          }

          const data = JSON.parse(dataSelector.innerHTML);

          this.addProductToBundle(data);
        }
      }

      isSupportedByGetSizedImageUrl(src, size = '100x') {
        return theme.getSizedImageUrl(src, size) !== null;
      }

      setProductToPlaceholder(data, placeholder) {
        const template = this.querySelector('[data-bundle-template]');
        const cloneTemplate = template.content.cloneNode(true);
        const filledEl = placeholder.querySelector('[data-bundle-placeholder-filled]');
        const button = this.querySelector(`[data-bundle-product-button="${data.productId}"]`);
        const productUrl = button?.hasAttribute('data-bundle-product-url') ? button.getAttribute('data-bundle-product-url') : null;
        const vendor = cloneTemplate.querySelector('[data-placeholder-vendor]');

        if (vendor) {
          vendor.textContent = data.vendor;
        }
        cloneTemplate.querySelector('[data-placeholder-title]').innerHTML = data.title;
        cloneTemplate.querySelector('[data-placeholder-price]').innerHTML = this.formatRate(data.price);

        cloneTemplate.querySelectorAll('[data-placeholder-url]').forEach((element) => {
          element.href = `${productUrl}?variant=${data.id}`;
        });

        if (parseFloat(data.priceCompare) > 0) {
          cloneTemplate.querySelector('[data-placeholder-price-compare]').innerHTML = this.formatRate(data.priceCompare);
        }

        if (data.variants > 1) {
          cloneTemplate.querySelector('[data-placeholder-options]').textContent = data.optionsText;
        }

        if (data.image.variant?.src || data.image.product?.src) {
          const placeholderImage = cloneTemplate.querySelector('[data-placeholder-image]');
          const imageTag = document.createElement('img');
          const imageWidth = placeholderImage.hasAttribute('data-placeholder-image') ? parseInt(placeholderImage.getAttribute('data-placeholder-image')) : 0;
          const imageWidthRetina = imageWidth * 2;
          let dataImageSrc = data.image.product?.src || null;
          let dataImageAspectRatio = data.image.product?.aspect_ratio || null;

          if (data.image.variant?.src) {
            dataImageSrc = data.image.variant?.src;
            dataImageAspectRatio = data.image.variant?.aspect_ratio;
          }

          const imageSrc = this.isSupportedByGetSizedImageUrl(dataImageSrc, `${imageWidthRetina}x`) ? theme.getSizedImageUrl(dataImageSrc, `${imageWidthRetina}x`) : dataImageSrc;
          imageTag.src = imageSrc;
          imageTag.width = imageWidthRetina;
          imageTag.height = imageWidthRetina / dataImageAspectRatio;
          imageTag.alt = data.title || '';

          imageTag.addEventListener('load', () => {
            placeholderImage.appendChild(imageTag);
          });
        }

        filledEl.innerHTML = '';
        filledEl.appendChild(cloneTemplate);
        filledEl.querySelector('[data-bundle-remove-button]').addEventListener('click', (event) => this.removeProductFromBundle(event));
      }

      updateUI() {
        const filledCount = this.selectedProducts.length;
        this.selectedCount.textContent = filledCount;
        this.addButton.disabled = filledCount !== this.maxSelection;
        let savingPrice = 0;
        let price = this.selectedProducts.reduce((sum, product) => {
          const price = parseFloat(product?.price);
          return sum + (isNaN(price) ? 0 : price);
        }, 0);

        if (filledCount === this.maxSelection) {
          if (this.discountValue && this.discountType && this.bundleTotalSavings) {
            const currencyRate = window.Shopify && window.Shopify.currency && window.Shopify.currency.rate ? Number(window.Shopify.currency.rate) : 1;
            const discountValue = Number(this.discountValue) * 100 * currencyRate;
            if (this.discountType === 'percent') {
              savingPrice = (price * parseFloat(this.discountValue)) / 100;
              price -= savingPrice;
            } else if (this.discountType === 'fixed' && price > discountValue) {
              savingPrice = discountValue;
              price -= discountValue;
            }
          }

          if (document.body.classList.contains('is-focused')) {
            this.addButton.focus();
          }
        }

        this.bundleTotal.innerHTML = this.formatRate(price);

        if (this.bundleTotalSavings) {
          this.bundleTotalSavings.innerHTML = window.theme.formatMoney(savingPrice, theme.moneyFormat);
        }

        // Query for all bundle buttons to include any dynamically added ones
        this.buttons = this.querySelectorAll('[data-bundle-product-button]');
        this.buttons.forEach((button) => {
          button.disabled = filledCount >= this.maxSelection;
          button.classList.toggle('is-disabled', filledCount >= this.maxSelection);
        });
      }

      addProductToBundle(data) {
        const placeholder = this.placeholders[this.selectedProducts.length];
        if (this.classList.contains('is-adding') || this.classList.contains('is-removing') || !placeholder || this.selectedProducts.length >= this.maxSelection) return;
        const variant = data.variant;
        const product = data.product;
        const imageMediaItems = (product.media || []).filter((item) => item.media_type === 'image');

        const productData = {
          id: variant.id,
          quantity: 1,
          properties: {
            _bundle_unique_id: ``,
          },
          price: variant.price,
          priceCompare: variant.compare_at_price ? variant.compare_at_price : 0,
          productId: product.id,
          optionsText: variant.options.join(' / '),
          vendor: product.vendor,
          title: product.title,
          image: {
            variant: {
              src: variant.featured_image?.src,
              width: variant.featured_image?.width,
              height: variant.featured_image?.height,
              aspect_ratio: variant.featured_image?.width / variant.featured_image?.height,
            },
            product: imageMediaItems[0]?.preview_image,
          },
          variants: product.variants.length,
        };

        this.setProductToPlaceholder(productData, placeholder);

        this.selectedProducts.push(productData);

        if (this.selectedProducts.length > 1) {
          this.placeholders[this.selectedProducts.length - 2].classList.add('is-line-active');
        }

        this.classList.add('is-adding');

        requestAnimationFrame(() => {
          placeholder.classList.add('is-animate-in', 'is-dot-active');
        });

        setTimeout(() => {
          placeholder.classList.remove('is-animate-in');
          placeholder.classList.add('is-filled');
          this.classList.remove('is-adding');
        }, this.animationTiming);

        const focusableElements = placeholder.querySelectorAll('button, [href], select, textarea, [tabindex]:not([tabindex="-1"])');
        focusableElements?.forEach((element) => {
          element.removeAttribute('tabindex');
        });

        this.updateUI();
      }

      removeProductFromBundle(event) {
        if (this.classList.contains('is-adding') || this.classList.contains('is-removing')) return;

        this.classList.add('is-removing');

        const placeholder = event.currentTarget.closest('[data-bundle-placeholder]');
        placeholder.classList.add('is-animate-out');
        const placeholdersArr = Array.from(this.placeholders);
        const index = placeholdersArr.indexOf(placeholder);
        const targetFocusButton = this.querySelector(`[data-bundle-product-button="${this.selectedProducts[index].productId}"]`);
        this.selectedProducts.splice(index, 1);

        let lastFilledPlaceholder = null;
        if (this.selectedProducts.length) {
          lastFilledPlaceholder = this.placeholders[this.selectedProducts.length];
          this.placeholders[this.selectedProducts.length - 1].classList.remove('is-line-active');
          this.placeholders[this.selectedProducts.length].classList.remove('is-dot-active');
        } else {
          this.placeholders[0].classList.remove('is-dot-active');
        }

        placeholder.classList.remove('is-filled');

        setTimeout(() => {
          placeholder.classList.remove('is-animate-out');
          placeholder.querySelector('[data-bundle-placeholder-filled]').innerHTML = '';

          if (lastFilledPlaceholder) {
            lastFilledPlaceholder.after(placeholder);

            this.placeholders = this.querySelectorAll('[data-bundle-placeholder]');

            let lastFilledPlaceholderNew = null;
            this.placeholders.forEach((element) => {
              if (element.classList.contains('is-filled')) {
                lastFilledPlaceholderNew = element;
                element.classList.add('is-line-active', 'is-dot-active');
              } else {
                element.classList.remove('is-line-active', 'is-dot-active');
              }
            });

            lastFilledPlaceholderNew.classList.remove('is-line-active');
          }

          this.classList.remove('is-removing');
        }, this.animationTiming);

        const focusableElements = placeholder.querySelectorAll('button, [href], select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length) {
          focusableElements.forEach((element) => {
            element.setAttribute('tabindex', -1);
          });
        }

        if (document.body.classList.contains('is-focused') && targetFocusButton) {
          targetFocusButton.disabled = false;
          targetFocusButton.focus();
        }

        this.updateUI();
      }

      formatRate(cents) {
        return window.theme.formatMoney(cents, theme.moneyFormat);
      }

      disconnectedCallback() {
        if (!this.bundle) return;

        if (this.buttons.length) {
          this.buttons.forEach((button) => {
            button.removeEventListener('click', this.bundleButtonAddEvent);
          });
        }

        this.removeEventListener('theme:bundle:change', this.bundleButtonChangeEvent);

        this.removeEventListener('theme:bundle:button-modal', this.addProductToBundleModalEvent);

        this.scrollToBundleButton?.removeEventListener('click', this.scrollToBundleEvent);
        this.addButton?.removeEventListener('click', this.addProductsToCartEvent);
        document.removeEventListener('theme:product:add', this.productAddSuccessEvent);
        document.removeEventListener('theme:cart:built', this.cartBuiltEvent);
      }
    }
  );
}
