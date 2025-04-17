const selectors = {
  cartDrawer: 'cart-drawer',
  productGridItem: '[data-grid-item]',
  button: '[data-product-button]',
  selectedCount: '[data-selected-count]',
  bundleTotal: '[data-bundle-total]',
  addButton: '[data-add-bundle-to-cart]',
};

const attributes = {
  maxSelection: 'data-max-selection',
};

const classes = {
  selected: 'is-selected',
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
        this.placeholders = this.querySelectorAll('.product-placeholder');
        this.selectedProducts = new Array(this.maxSelection).fill(null);
      }

      connectedCallback() {
        this.querySelectorAll(selectors.button).forEach((button) => {
          button.addEventListener('click', (e) => {
            const variantId = e.currentTarget.dataset.variantId;
            this.addProductToBundle(e.currentTarget, variantId);
          });
        });

        this.querySelectorAll('.remove-selection').forEach((button) => {
          button.addEventListener('click', (e) => {
            const slot = e.currentTarget.dataset.slot;
            this.removeProductFromBundle(slot);
          });
        });

        this.addButton.addEventListener('click', () => {
          if (this.selectedProducts.filter((p) => p !== null).length === this.maxSelection) {
            this.addButton.disabled = true;
            this.addButton.innerHTML = '<span class="spinner"></span> Processing...';
            console.log(this.selectedProducts);
            fetch(theme.routes.cart_add_url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({items: this.selectedProducts}),
            })
              .then((response) => {
                console.log(response);
                const cartDrawer = document.querySelector(selectors.cartDrawer);
                if (cartDrawer) {
                  cartDrawer.dispatchEvent(new CustomEvent('theme:cart:refresh', {bubbles: true}));
                  cartDrawer.dispatchEvent(new CustomEvent('theme:cart-drawer:show', {bubbles: true}));
                  // window.theme.a11y.lastElement = button;
                  setTimeout(() => {}, 5000);
                }

                if (theme.settings.cartType === 'page') {
                  window.location = theme.routes.cart_url;
                }
              })
              .catch((error) => {
                console.error('Error:', error);
              });
            for (let i = 0; i < this.selectedProducts.length; i++) {
              if (this.selectedProducts[i] !== null) {
                // fetch(theme.routes.cart_add_url, {
                //   method: 'POST',
                //   headers: {'Content-Type': 'application/json'},
                //   body: JSON.stringify({id: this.selectedProducts[i].variantId, quantity: 1}),
                // }).then((response) => {
                //   console.log(response);
                // });
              }
            }
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
        this.bundleTotal.textContent = '$' + total.toFixed(2);
        this.addButton.disabled = filledCount !== this.maxSelection;
        this.productCards.forEach((card) => {
          const button = card.querySelector(selectors.button);
          const variantId = button.dataset.variantId;
          const isSelected = this.selectedProducts.some((product) => product && product.id === variantId);
          if (isSelected) {
            card.classList.add(classes.selected);
            button.disabled = true;
          } else {
            card.classList.remove(classes.selected);
            button.disabled = filledCount >= this.maxSelection;
          }
          if (filledCount >= this.maxSelection && !isSelected) {
            card.classList.add('disabled');
          } else {
            card.classList.remove('disabled');
          }
        });
      }

      addProductToBundle(button, variantId) {
        // Find the card by product ID from the button that was clicked
        const productData = {
          id: variantId,
          quantity: 1,
        };
        const emptyIndex = this.selectedProducts.findIndex((product) => product === null);
        if (emptyIndex === -1) return;
        this.selectedProducts[emptyIndex] = productData;
        // const placeholder = this.placeholders[emptyIndex];
        // placeholder.classList.add('filled');
        // const filledEl = placeholder.querySelector('.placeholder-filled');
        // filledEl.querySelector('.placeholder-image').src = productData.image;
        // filledEl.querySelector('.placeholder-title').textContent = productData.title;
        // filledEl.querySelector('.placeholder-price').textContent = '$' + parseFloat(productData.price).toFixed(2);

        const productItem = button.closest(selectors.productGridItem);
        const template = productItem.querySelector('[data-bundle-template]');
        const content = template.innerHTML;
        const placeholder = this.placeholders[emptyIndex];
        placeholder.classList.add('filled');
        const filledEl = placeholder.querySelector('.placeholder-filled__container');
        filledEl.innerHTML = content;
        this.updateUI();
      }

      removeProductFromBundle(slot) {
        const index = parseInt(slot) - 1;
        if (index < 0 || index >= this.selectedProducts.length) return;
        this.selectedProducts[index] = null;
        const placeholder = this.placeholders[index];
        placeholder.classList.remove('filled');
        this.updateUI();
      }

      disconnectedCallback() {}
    }
  );
}
