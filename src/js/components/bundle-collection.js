const selectors = {
  cartDrawer: 'cart-drawer',
  template: '[data-bundle-template]',
  productGridItem: '[data-grid-item]',
  button: '[data-bundle-product-button]',
  selectedCount: '[data-bundle-selected-count]',
  countLeft: '[data-bundle-count-left]',
  bundleTotal: '[data-bundle-total]',
  bundleTotalSavings: '[data-bundle-total-savings]',
  addButton: '[data-bundle-add-to-cart]',
  removeButton: '[data-bundle-remove-button]',
  scrollToBundle: '[data-bundle-scroll-to]',
  placeholder: '[data-bundle-placeholder]',
  placeholderFilled: '[data-bundle-placeholder-filled]',
  placeholderPrice: '[data-placeholder-price]',
  placeholderPriceCompare: '[data-placeholder-price-compare]',
  placeholderOptions: '[data-placeholder-options]',
  bundleCartItem: '[data-bundle-cart-item]',
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
  bundleVariantId: 'data-bundle-variant-id',
  bundlePrice: 'data-bundle-price',
  bundlePriceCompare: 'data-bundle-price-compare',
  bundleOptions: 'data-bundle-options',
  bundleHandle: 'data-bundle-handle',
  bundleCartItem: 'data-bundle-cart-item',
};

const classes = {
  selected: 'is-selected',
  filled: 'is-filled',
  disabled: 'is-disabled',
  loading: 'is-loading',
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
        this.countLeft = this.querySelector(selectors.countLeft);
        this.bundleTotal = this.querySelector(selectors.bundleTotal);
        this.bundleTotalSavings = this.querySelector(selectors.bundleTotalSavings);
        this.addButton = this.querySelector(selectors.addButton);
        this.scrollToBundle = this.querySelector(selectors.scrollToBundle);
        this.placeholders = this.querySelectorAll(selectors.placeholder);
        this.selectedProducts = [];
        this.bundleCartItems = null;
        this.handle = this.hasAttribute(attributes.bundleHandle) ? this.getAttribute(attributes.bundleHandle) : '';
        this.bundleProducts = JSON.parse(localStorage.getItem('bundleProducts')) || [];
      }

      connectedCallback() {
        if (!this.bundle) return;

        if (this.buttons.length) {
          this.buttons.forEach((button) => {
            button.addEventListener('click', () => {
              if (!button.hasAttribute(attributes.quickAdd)) {
                this.addProductToBundle(button);
              }
            });
          });
        }

        this.addEventListener('theme:bundle:button', (e) => {
          const button = e.detail.button;
          button.setAttribute(attributes.bundleVariantId, e.detail.variantId);
          button.setAttribute(attributes.bundleOptions, e.detail.options.join(' / '));
          button.setAttribute(attributes.bundlePrice, e.detail.price);
          button.setAttribute(attributes.bundlePriceCompare, e.detail.priceCompare);

          this.addProductToBundle(button);
        });

        if (this.scrollToBundle) {
          this.scrollToBundle.addEventListener('click', () => {
            window.theme.scrollTo(this.getBoundingClientRect().top);
          });
        }

        if (this.addButton) {
          this.addButton.addEventListener('click', () => {
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
          });
        }

        if (this.bundleProducts.length) {
          this.loadLocalStorage();
        }

        this.updateUI();
      }

      loadLocalStorage() {
        this.bundleProducts.forEach((bundleProduct, index) => {
          const placeholder = this.placeholders[index];
          const content = bundleProduct.html;
          const button = this.querySelector(`[${attributes.productId}="${bundleProduct.productId}"]`);

          this.setProductToPlaceholder(placeholder, content, button);
        });

        this.placeholders[this.bundleProducts.length - 1].classList.remove(classes.lineActive);
        this.selectedProducts = this.bundleProducts;
      }

      setProductToPlaceholder(placeholder, content, button) {
        const filledEl = placeholder.querySelector(selectors.placeholderFilled);
        filledEl.innerHTML = content;
        placeholder.classList.add(classes.filled);
        placeholder.classList.add(classes.dotActive);
        placeholder.classList.add(classes.lineActive);

        filledEl.querySelector(selectors.removeButton).addEventListener('click', (event) => this.removeProductFromBundle(event));
      }

      updateUI() {
        const filledCount = this.selectedProducts.length;
        this.selectedCount.textContent = filledCount;
        this.countLeft.textContent = this.maxSelection - filledCount;
        const total = this.selectedProducts.reduce(
          (sum, product) => {
            return {
              price: sum.price + (product ? parseFloat(product.price) : 0),
              priceCompare: sum.priceCompare + (product ? parseFloat(product.priceCompare) : 0),
            };
          },
          {price: 0, priceCompare: 0}
        );

        const totalSavings = total.priceCompare - total.price < 0 ? 0 : total.priceCompare - total.price;
        this.bundleTotal.innerHTML = this.formatRate(total.price);
        this.bundleTotalSavings.innerHTML = this.formatRate(totalSavings);
        this.addButton.disabled = filledCount !== this.maxSelection;
        if (filledCount === this.maxSelection && document.body.classList.contains(classes.focused)) {
          this.addButton.focus();
        }
        this.buttons.forEach((button) => {
          button.disabled = filledCount >= this.maxSelection;
        });
      }

      addProductToBundle(button) {
        if (this.classList.contains(classes.adding) || this.classList.contains(classes.removing)) return;

        this.classList.add(classes.adding);

        const productData = {
          id: button.getAttribute(attributes.bundleVariantId),
          quantity: 1,
          properties: {
            _bundle_title: `${this.getAttribute(attributes.bundleName)}`,
          },
          price: button.getAttribute(attributes.bundlePrice),
          priceCompare: button.getAttribute(attributes.bundlePriceCompare),
          productId: button.getAttribute(attributes.productId),
        };

        if (this.hasAttribute(attributes.bundleImage)) {
          productData.properties._bundle_image = `${this.getAttribute(attributes.bundleImage)}`;
        }

        if (this.selectedProducts.length >= this.maxSelection) return;

        const productItem = button.closest(selectors.productGridItem);
        const template = productItem.querySelector(selectors.template);
        const content = template.innerHTML;
        const placeholder = this.querySelector(`${selectors.placeholder}:not(.${classes.filled})`);
        productData.html = content;
        this.selectedProducts.push(productData);

        localStorage.setItem('bundleProducts', JSON.stringify(this.selectedProducts));

        if (!placeholder) return;

        const filledEl = placeholder.querySelector(selectors.placeholderFilled);
        filledEl.innerHTML = content;

        if (button.hasAttribute(attributes.bundlePriceCompare) && parseFloat(button.getAttribute(attributes.bundlePriceCompare)) > 0) {
          filledEl.querySelector(selectors.placeholderPriceCompare).innerHTML = this.formatRate(button.getAttribute(attributes.bundlePriceCompare));
        }
        filledEl.querySelector(selectors.placeholderPrice).innerHTML = this.formatRate(button.getAttribute(attributes.bundlePrice));
        filledEl.querySelector(selectors.removeButton).addEventListener('click', (event) => this.removeProductFromBundle(event));
        if (button.hasAttribute(attributes.bundleOptions) && filledEl.querySelector(selectors.placeholderOptions)) {
          filledEl.querySelector(selectors.placeholderOptions).textContent = button.getAttribute(attributes.bundleOptions);
        }

        if (this.selectedProducts.length > 1) {
          this.placeholders[this.selectedProducts.length - 2].classList.add(classes.lineActive);
        }

        requestAnimationFrame(() => {
          placeholder.classList.add(classes.animateIn);
          placeholder.classList.add(classes.dotActive);
        });

        setTimeout(() => {
          placeholder.classList.remove(classes.animateIn);
          placeholder.classList.add(classes.filled);
          this.classList.remove(classes.adding);
        }, this.animationTiming);

        const focusableElements = placeholder.querySelectorAll(selectors.focusable);
        if (focusableElements.length) {
          focusableElements.forEach((element) => {
            element.removeAttribute('tabindex');
          });
        }

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
        localStorage.setItem('bundleProducts', JSON.stringify(this.selectedProducts));

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

          if (lastFilledPlaceholder) {
            lastFilledPlaceholder.after(placeholder);

            this.placeholders = this.querySelectorAll(selectors.placeholder);

            let lastFilledPlaceholderNew = null;
            this.placeholders.forEach((element) => {
              if (element.classList.contains(classes.filled)) {
                lastFilledPlaceholderNew = element;
                element.classList.add(classes.lineActive);
                element.classList.add(classes.dotActive);
              } else {
                element.classList.remove(classes.lineActive);
                element.classList.remove(classes.dotActive);
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

      disconnectedCallback() {}
    }
  );
}
