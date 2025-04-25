const selectors = {
  cartDrawer: 'cart-drawer',
  template: '[data-bundle-template]',
  productGridItem: '[data-grid-item]',
  button: '[data-bundle-product-button]',
  selectedCount: '[data-bundle-selected-count]',
  bundleTotal: '[data-bundle-total]',
  addButton: '[data-bundle-add-to-cart]',
  removeButton: '[data-bundle-remove-button]',
  placeholder: '[data-bundle-placeholder]',
  placeholderFilled: '[data-bundle-placeholder-filled]',
  placeholderPrice: '[data-placeholder-price]',
};

const attributes = {
  maxSelection: 'data-bundle-max-selection',
  quickAdd: 'data-quick-add-btn',
  bundleVariantId: 'data-bundle-variant-id',
  bundlePrice: 'data-bundle-price',
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
        this.bundleTotal = this.querySelector(selectors.bundleTotal);
        this.addButton = this.querySelector(selectors.addButton);
        this.productCards = this.querySelectorAll(selectors.productGridItem);
        this.placeholders = this.querySelectorAll(selectors.placeholder);
        this.selectedProducts = new Array(this.maxSelection).fill(null);
      }

      connectedCallback() {
        this.querySelectorAll(selectors.button).forEach((button) => {
          button.addEventListener('click', () => {
            if (!button.hasAttribute(attributes.quickAdd)) {
              this.addProductToBundle(button);
            }
          });
        });

        this.addEventListener('theme:bundle:button', (e) => {
          const button = e.detail.button;
          button.setAttribute(attributes.bundleVariantId, e.detail.variantId);
          button.setAttribute(attributes.bundlePrice, e.detail.price);
          this.addProductToBundle(button);
        });

        this.addButton.addEventListener('click', () => {
          if (this.selectedProducts.filter((p) => p !== null).length === this.maxSelection) {
            this.addButton.classList.add(classes.loading);
            this.addButton.disabled = true;
            fetch(theme.routes.cart_add_url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({items: this.selectedProducts}),
            })
              .then((response) => {
                if (theme.settings.cartType === 'page') {
                  window.location = theme.routes.cart_url;
                } else {
                  const cartDrawer = document.querySelector(selectors.cartDrawer);
                  if (cartDrawer) {
                    cartDrawer.dispatchEvent(new CustomEvent('theme:cart:refresh', {bubbles: true}));
                    cartDrawer.dispatchEvent(new CustomEvent('theme:cart-drawer:show', {bubbles: true}));
                    // window.theme.a11y.lastElement = button;

                    this.addButton.classList.remove(classes.loading);
                    this.addButton.disabled = false;
                  }
                }
              })
              .catch((error) => {
                console.error('Error:', error);
              });

            // window.location.href = '/cart';
            // const cartDrawer = document.querySelector(selectors.cartDrawer);

            // if (cartDrawer) {
            //   cartDrawer.dispatchEvent(new CustomEvent('theme:cart-drawer:show'));
            //   // window.theme.a11y.lastElement = button;
            // }
          }
        });

        this.updateUI();
      }

      updateUI() {
        const filledCount = this.selectedProducts.filter((product) => product !== null).length;
        this.selectedCount.textContent = filledCount;
        const total = this.selectedProducts.reduce((sum, product) => {
          return sum + (product ? parseFloat(product.price) : 0);
        }, 0);
        this.bundleTotal.innerHTML = this.formatRate(total);
        this.addButton.disabled = filledCount !== this.maxSelection;
        this.productCards.forEach((card) => {
          const button = card.querySelector(selectors.button);
          const variantId = button.getAttribute(attributes.bundleVariantId);
          const isSelected = this.selectedProducts.some((product) => product && product.id === variantId);
          if (isSelected) {
            card.classList.add(classes.selected);
            button.disabled = true;
          } else {
            card.classList.remove(classes.selected);
            button.disabled = filledCount >= this.maxSelection;
          }
          if (filledCount >= this.maxSelection && !isSelected) {
            card.classList.add(classes.disabled);
          } else {
            card.classList.remove(classes.disabled);
          }
        });
      }

      addProductToBundle(button) {
        // Find the card by product ID from the button that was clicked
        const productData = {
          id: button.getAttribute(attributes.bundleVariantId),
          quantity: 1,
          price: button.getAttribute(attributes.bundlePrice),
        };
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
