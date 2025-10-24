const selectors = {
  bundleJson: '[data-bundle-json]',
  template: '[data-bundle-template]',
  productGridItem: '[data-grid-item]',
  button: '[data-bundle-product-button]',
  selectedCount: '[data-bundle-selected-count]',
  bundleTotal: '[data-bundle-total]',
  bundleTotalSavings: '[data-bundle-total-savings]',
  addButton: '[data-bundle-add-to-cart]',
  removeButton: '[data-bundle-remove-button]',
  scrollToBundleButton: '[data-bundle-scroll-button]',
  placeholder: '[data-bundle-placeholder]',
  placeholderFilled: '[data-bundle-placeholder-filled]',
  placeholderPrice: '[data-placeholder-price]',
  placeholderPriceCompare: '[data-placeholder-price-compare]',
  placeholderVendor: '[data-placeholder-vendor]',
  placeholderTitle: '[data-placeholder-title]',
  placeholderUrl: '[data-placeholder-url]',
  placeholderOptions: '[data-placeholder-options]',
  placeholderImage: '[data-placeholder-image]',
  focusable: 'button, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
};

const attributes = {
  bundle: 'data-bundle',
  maxSelection: 'data-bundle-max-selection',
  animationTiming: 'data-bundle-animation-timing',
  productId: 'data-bundle-product-button',
  quickAdd: 'data-quick-add-btn',
  bundleName: 'data-bundle-name',
  bundleImage: 'data-bundle-image',
  bundleHandle: 'data-bundle-handle',
  bundleCartItem: 'data-bundle-cart-item',
  placeholderImage: 'data-placeholder-image',
  bundleProductUrl: 'data-bundle-product-url',
};

const classes = {
  filled: 'is-filled',
  focused: 'is-focused',
  lineActive: 'is-line-active',
  dotActive: 'is-dot-active',
  animateIn: 'is-animate-in',
  animateOut: 'is-animate-out',
  adding: 'is-adding',
  removing: 'is-removing',
};

if (!customElements.get('bundle-collection')) {
  customElements.define(
    'bundle-collection',
    class BundleCollection extends HTMLElement {
      constructor() {
        super();

        this.bundle = this.getAttribute(attributes.bundle) === 'true';
        this.buttons = this.querySelectorAll(selectors.button);
        this.maxSelection = parseInt(this.getAttribute(attributes.maxSelection));
        this.animationTiming = parseInt(this.getAttribute(attributes.animationTiming));
        this.selectedCount = this.querySelector(selectors.selectedCount);
        this.bundleTotal = this.querySelector(selectors.bundleTotal);
        this.bundleTotalSavings = this.querySelector(selectors.bundleTotalSavings);
        this.addButton = this.querySelector(selectors.addButton);
        this.scrollToBundleButton = this.querySelector(selectors.scrollToBundleButton);
        this.placeholders = this.querySelectorAll(selectors.placeholder);
        this.selectedProducts = [];
        this.bundleCartItems = null;
        this.handle = this.hasAttribute(attributes.bundleHandle) ? this.getAttribute(attributes.bundleHandle) : '';
        this.localStorageName = `bundleProducts-${window.location.pathname}`;
        this.bundleProducts = JSON.parse(localStorage.getItem(this.localStorageName)) || [];
        this.bundleButtonAddEvent = (event) => this.bundleButtonAdd(event);
        this.bundleButtonChangeEvent = (event) => this.bundleButtonChange(event);
        this.addProductsToCartEvent = (event) => this.addProductsToCart(event);
        this.addProductToBundleModalEvent = (event) => this.addProductToBundleModal(event);
        this.scrollToBundleEvent = (event) => this.scrollToBundle(event);
      }

      connectedCallback() {
        if (!this.bundle) return;

        if (this.buttons.length) {
          this.buttons.forEach((button) => {
            button.addEventListener('click', this.bundleButtonAddEvent);
          });
        }

        this.addEventListener('theme:bundle:change', this.bundleButtonChangeEvent);
        this.addEventListener('theme:bundle:button-modal', this.addProductToBundleModalEvent);

        this.scrollToBundleButton?.addEventListener('click', this.scrollToBundleEvent);
        this.addButton?.addEventListener('click', this.addProductsToCartEvent);

        if (this.bundleProducts.length) {
          this.loadLocalStorage();
        }

        this.updateUI();
      }

      scrollToBundle() {
        window.theme.scrollTo(this.getBoundingClientRect().top);
      }

      addProductToBundleModal(event) {
        this.addProductToBundle(event.detail.data);
      }

      addProductsToCart() {
        if (this.selectedProducts.filter((p) => p !== null).length === this.maxSelection) {
          this.selectedProducts.forEach((element) => {
            if (this.handle !== '') {
              this.bundleCartItems = document.querySelectorAll(`[${attributes.bundleCartItem}="${this.handle}"]`);
              element.properties._bundle_unique_id = this.bundleCartItems.length ? this.bundleCartItems.length + 1 : 1;
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
        event.target.querySelector(selectors.button)?.addEventListener('click', this.bundleButtonAddEvent);
      }

      bundleButtonAdd(event) {
        const target = event.currentTarget;
        if (!target.hasAttribute(attributes.quickAdd)) {
          const productItem = target.closest(selectors.productGridItem);
          const dataSelector = productItem.querySelector(selectors.bundleJson);
          if ((dataSelector && !dataSelector.innerHTML) || !dataSelector) {
            return;
          }

          const data = JSON.parse(dataSelector.innerHTML);

          this.addProductToBundle(data);
        }
      }

      loadLocalStorage() {
        this.bundleProducts.forEach((data, index) => {
          const placeholder = this.placeholders[index];

          this.setProductToPlaceholder(data, placeholder);

          placeholder.classList.add(classes.filled, classes.dotActive, classes.lineActive);
        });

        this.placeholders[this.bundleProducts.length - 1].classList.remove(classes.lineActive);
        this.selectedProducts = this.bundleProducts;
      }

      isSupportedByGetSizedImageUrl(src, size = '100x') {
        return theme.getSizedImageUrl(src, size) !== null;
      }

      setProductToPlaceholder(data, placeholder) {
        const template = this.querySelector(selectors.template);
        const cloneTemplate = template.content.cloneNode(true);
        const filledEl = placeholder.querySelector(selectors.placeholderFilled);
        const button = this.querySelector(`[${attributes.productId}="${data.productId}"]`);
        const productUrl = button?.hasAttribute(attributes.bundleProductUrl) ? button.getAttribute(attributes.bundleProductUrl) : null;

        cloneTemplate.querySelector(selectors.placeholderVendor).textContent = data.vendor;
        cloneTemplate.querySelector(selectors.placeholderTitle).innerHTML = data.title;
        cloneTemplate.querySelector(selectors.placeholderPrice).innerHTML = this.formatRate(data.price);

        cloneTemplate.querySelectorAll(selectors.placeholderUrl).forEach((element) => {
          element.href = `${productUrl}?variant=${data.id}`;
        });

        if (parseFloat(data.priceCompare) > 0) {
          cloneTemplate.querySelector(selectors.placeholderPriceCompare).innerHTML = this.formatRate(data.priceCompare);
        }

        if (data.variants > 1) {
          cloneTemplate.querySelector(selectors.placeholderOptions).textContent = data.optionsText;
        }

        if (data.image.variant?.src || data.image.product?.src) {
          const placeholderImage = cloneTemplate.querySelector(selectors.placeholderImage);
          const imageTag = document.createElement('img');
          const imageWidth = placeholderImage.hasAttribute(attributes.placeholderImage) ? parseInt(placeholderImage.getAttribute(attributes.placeholderImage)) : 0;
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
        filledEl.querySelector(selectors.removeButton).addEventListener('click', (event) => this.removeProductFromBundle(event));
      }

      updateUI() {
        const filledCount = this.selectedProducts.length;
        this.selectedCount.textContent = filledCount;
        const total = this.selectedProducts.reduce(
          (sum, product) => {
            const price = product ? parseFloat(product.price) : 0;
            const priceCompare = product ? parseFloat(product.priceCompare) : 0;
            const difference = Math.max(0, priceCompare - price);

            return {
              price: sum.price + price,
              priceCompare: sum.priceCompare + difference,
            };
          },
          {price: 0, priceCompare: 0}
        );

        this.bundleTotal.innerHTML = this.formatRate(total.price);
        this.bundleTotalSavings.innerHTML = window.theme.formatMoney(total.priceCompare, theme.moneyFormat);
        this.addButton.disabled = filledCount !== this.maxSelection;
        if (filledCount === this.maxSelection && document.body.classList.contains(classes.focused)) {
          this.addButton.focus();
        }
        this.buttons.forEach((button) => {
          button.disabled = filledCount >= this.maxSelection;
        });
      }

      addProductToBundle(data) {
        const placeholder = this.placeholders[this.selectedProducts.length];
        if (this.classList.contains(classes.adding) || this.classList.contains(classes.removing) || !placeholder || this.selectedProducts.length >= this.maxSelection) return;
        const variant = data.variant;
        const product = data.product;
        const imageMediaItems = (product.media || []).filter((item) => item.media_type === 'image');

        const productData = {
          id: variant.id,
          quantity: 1,
          properties: {
            _bundle_title: `${this.getAttribute(attributes.bundleName)}`,
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

        if (this.hasAttribute(attributes.bundleImage)) {
          productData.properties._bundle_image = `${this.getAttribute(attributes.bundleImage)}`;
        }

        this.setProductToPlaceholder(productData, placeholder);

        this.selectedProducts.push(productData);

        localStorage.setItem(this.localStorageName, JSON.stringify(this.selectedProducts));

        if (this.selectedProducts.length > 1) {
          this.placeholders[this.selectedProducts.length - 2].classList.add(classes.lineActive);
        }

        this.classList.add(classes.adding);

        requestAnimationFrame(() => {
          placeholder.classList.add(classes.animateIn, classes.dotActive);
        });

        setTimeout(() => {
          placeholder.classList.remove(classes.animateIn);
          placeholder.classList.add(classes.filled);
          this.classList.remove(classes.adding);
        }, this.animationTiming);

        const focusableElements = placeholder.querySelectorAll(selectors.focusable);
        focusableElements?.forEach((element) => {
          element.removeAttribute('tabindex');
        });

        this.updateUI();
      }

      removeProductFromBundle(event) {
        if (this.classList.contains(classes.adding) || this.classList.contains(classes.removing)) return;

        this.classList.add(classes.removing);

        const placeholder = event.currentTarget.closest(selectors.placeholder);
        placeholder.classList.add(classes.animateOut);
        const placeholdersArr = Array.from(this.placeholders);
        const index = placeholdersArr.indexOf(placeholder);
        const targetFocusButton = this.querySelector(`[${attributes.productId}="${this.selectedProducts[index].productId}"]`);
        this.selectedProducts.splice(index, 1);
        localStorage.setItem(this.localStorageName, JSON.stringify(this.selectedProducts));

        let lastFilledPlaceholder = null;
        if (this.selectedProducts.length) {
          lastFilledPlaceholder = this.placeholders[this.selectedProducts.length];
          this.placeholders[this.selectedProducts.length - 1].classList.remove(classes.lineActive);
          this.placeholders[this.selectedProducts.length].classList.remove(classes.dotActive);
        } else {
          this.placeholders[0].classList.remove(classes.dotActive);
        }

        placeholder.classList.remove(classes.filled);

        setTimeout(() => {
          placeholder.classList.remove(classes.animateOut);
          placeholder.querySelector(selectors.placeholderFilled).innerHTML = '';

          if (lastFilledPlaceholder) {
            lastFilledPlaceholder.after(placeholder);

            this.placeholders = this.querySelectorAll(selectors.placeholder);

            let lastFilledPlaceholderNew = null;
            this.placeholders.forEach((element) => {
              if (element.classList.contains(classes.filled)) {
                lastFilledPlaceholderNew = element;
                element.classList.add(classes.lineActive, classes.dotActive);
              } else {
                element.classList.remove(classes.lineActive, classes.dotActive);
              }
            });

            lastFilledPlaceholderNew.classList.remove(classes.lineActive);
          }

          this.classList.remove(classes.removing);
        }, this.animationTiming);

        const focusableElements = placeholder.querySelectorAll(selectors.focusable);
        if (focusableElements.length) {
          focusableElements.forEach((element) => {
            element.setAttribute('tabindex', -1);
          });
        }

        if (document.body.classList.contains(classes.focused) && targetFocusButton) {
          targetFocusButton.disabled = false;
          targetFocusButton.focus();
        }

        this.updateUI();
      }

      formatRate(cents) {
        const price = cents === 0 ? window.theme.strings.free : window.theme.formatMoney(cents, theme.moneyFormat);
        return price;
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

        if (this.scrollToBundleButton) {
          this.scrollToBundleButton.removeEventListener('click', this.scrollToBundleEvent);
        }

        if (this.addButton) {
          this.addButton.removeEventListener('click', this.addProductsToCartEvent);
        }
      }
    }
  );
}
