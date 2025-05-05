const selectors = {
  cartDrawer: 'cart-drawer',
  template: '[data-bundle-template]',
  productGridItem: '[data-grid-item]',
  button: '[data-bundle-product-button]',
  selectedCount: '[data-bundle-selected-count]',
  countLeft: '[data-bundle-count-left]',
  bundleTotal: '[data-bundle-total]',
  addButton: '[data-bundle-add-to-cart]',
  removeButton: '[data-bundle-remove-button]',
  scrollToBundle: '[data-bundle-scroll-to]',
  placeholder: '[data-bundle-placeholder]',
  placeholderFilled: '[data-bundle-placeholder-filled]',
  placeholderPrice: '[data-placeholder-price]',
  placeholderOptions: '[data-placeholder-options]',
  bundleCartItem: '[data-bundle-cart-item]',
};

const attributes = {
  maxSelection: 'data-bundle-max-selection',
  quickAdd: 'data-quick-add-btn',
  bundleName: 'data-bundle-name',
  bundleImage: 'data-bundle-image',
  bundleVariantId: 'data-bundle-variant-id',
  bundlePrice: 'data-bundle-price',
  bundleOptions: 'data-bundle-options',
  bundleHandle: 'data-bundle-handle',
  bundleCartItem: 'data-bundle-cart-item',
};

const classes = {
  selected: 'is-selected',
  filled: 'is-filled',
  disabled: 'is-disabled',
  loading: 'is-loading',
};

if (!customElements.get('bundle-collection')) {
  customElements.define(
    'bundle-collection',
    class BundleCollection extends HTMLElement {
      constructor() {
        super();

        this.buttons = this.querySelectorAll(selectors.button);
        this.maxSelection = parseInt(this.getAttribute(attributes.maxSelection));
        this.selectedCount = this.querySelector(selectors.selectedCount);
        this.countLeft = this.querySelector(selectors.countLeft);
        this.bundleTotal = this.querySelector(selectors.bundleTotal);
        this.addButton = this.querySelector(selectors.addButton);
        this.scrollToBundle = this.querySelector(selectors.scrollToBundle);
        this.placeholders = this.querySelectorAll(selectors.placeholder);
        this.selectedProducts = new Array(this.maxSelection).fill(null);
        this.bundleUniqueId = 0;
        this.bundleCounter = 0;
        this.bundleCartItems = null;
        this.handle = this.hasAttribute(attributes.bundleHandle) ? this.getAttribute(attributes.bundleHandle) : '';
      }

      connectedCallback() {
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
              this.addButton.classList.add(classes.loading);
              this.addButton.disabled = true;
              this.selectedProducts.forEach((element) => {
                if (this.handle !== '') {
                  this.bundleCartItems = document.querySelectorAll(`[${attributes.bundleCartItem}="${this.handle}"]`);
                  element.properties._bundle_unique_id = this.bundleCartItems.length ? this.bundleCartItems.length + 1 : 1;
                }
              });

              fetch(theme.routes.cart_add_url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({items: this.selectedProducts}),
              })
                .then(() => {
                  if (theme.settings.cartType === 'page') {
                    window.location = theme.routes.cart_url;
                  } else {
                    const cartDrawer = document.querySelector(selectors.cartDrawer);
                    if (cartDrawer) {
                      cartDrawer.dispatchEvent(new CustomEvent('theme:cart:refresh', {bubbles: true}));
                      cartDrawer.dispatchEvent(new CustomEvent('theme:cart-drawer:show', {bubbles: true}));
                      window.theme.a11y.lastElement = this.addButton;

                      this.addButton.classList.remove(classes.loading);
                      this.addButton.disabled = false;
                    }
                  }
                })
                .catch((error) => {
                  console.error('Error:', error);
                });
            }
          });
        }

        this.updateUI();
      }

      updateUI() {
        const filledCount = this.selectedProducts.filter((product) => product !== null).length;
        this.selectedCount.textContent = filledCount;
        this.countLeft.textContent = this.maxSelection - filledCount;
        const total = this.selectedProducts.reduce((sum, product) => {
          return sum + (product ? parseFloat(product.price) : 0);
        }, 0);
        this.bundleTotal.innerHTML = this.formatRate(total);
        this.addButton.disabled = filledCount !== this.maxSelection;
        this.buttons.forEach((button) => {
          button.disabled = filledCount >= this.maxSelection;
        });
      }

      addProductToBundle(button) {
        const productData = {
          id: button.getAttribute(attributes.bundleVariantId),
          quantity: 1,
          properties: {
            _bundle_title: `${this.getAttribute(attributes.bundleName)}`,
          },
          price: button.getAttribute(attributes.bundlePrice),
        };
        if (this.hasAttribute(attributes.bundleImage)) {
          productData.properties._bundle_image = `${this.getAttribute(attributes.bundleImage)}`;
        }
        const emptyIndex = this.selectedProducts.findIndex((product) => product === null);
        if (emptyIndex === -1) return;
        this.selectedProducts[emptyIndex] = productData;

        const productItem = button.closest(selectors.productGridItem);
        const template = productItem.querySelector(selectors.template);
        const content = template.innerHTML;
        const placeholder = this.placeholders[emptyIndex];
        placeholder.classList.add(classes.filled);
        const filledEl = placeholder.querySelector(selectors.placeholderFilled);
        filledEl.innerHTML = content;
        filledEl.querySelector(selectors.placeholderPrice).innerHTML = this.formatRate(button.getAttribute(attributes.bundlePrice));
        filledEl.querySelector(selectors.removeButton).addEventListener('click', () => this.removeProductFromBundle(emptyIndex));
        if (button.hasAttribute(attributes.bundleOptions) && filledEl.querySelector(selectors.placeholderOptions)) {
          filledEl.querySelector(selectors.placeholderOptions).textContent = button.getAttribute(attributes.bundleOptions);
        }
        this.updateUI();
      }

      removeProductFromBundle(slot) {
        const index = parseInt(slot);
        if (index < 0 || index >= this.selectedProducts.length) return;
        this.selectedProducts[index] = null;
        const placeholder = this.placeholders[index];
        placeholder.classList.remove(classes.filled);
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
