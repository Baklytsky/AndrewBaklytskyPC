if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector('form');
        this.variantIdInput.disabled = false;
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.cart = document.querySelector('cart-drawer');
        this.submitButton = this.querySelector('[type="submit"]');
        this.submitButtonText = this.submitButton.querySelector('[data-add-to-cart-text]');
        if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');

        this.hideErrors = this.dataset.hideErrors === 'true';

        console.log('product form', this.variantInputId);
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        const isBundle = this.buttonATC.hasAttribute('data-bundle-modal-button');

        if (isBundle) {
          const productJSONhtml = this.container.querySelector('[data-bundle-json]')?.innerHTML;
          const productJSON = JSON.parse(productJSONhtml);
          const bundleButton = document.querySelector(`[data-bundle-product-button="${productJSON.id}"]`);

          if (bundleButton) {
            bundleButton.dispatchEvent(
              new CustomEvent('theme:bundle:button-modal', {
                detail: {
                  data: {
                    product: productJSON,
                    variant: productJSON.variant,
                  },
                },
                bubbles: true,
              })
            );

            document.dispatchEvent(
              new CustomEvent('theme:bundle:added', {
                bubbles: true,
              })
            );
          }
        } else {
          document.dispatchEvent(
            new CustomEvent('theme:cart:add', {
              detail: {
                button: this.submitButton,
              },
              bubbles: false,
            })
          );
        }

        const quickAddModal = this.closest('quick-add-modal');
        if (!quickAddModal) {
          window.theme.a11y.lastElement = this.submitButton;
        }
      }

      toggleSubmitButton(disable = true, text = window.theme.strings.addToCart) {
        this.submitButton.toggleAttribute('disabled', disable);
        // Preserve existing price markup inside the add-to-cart text
        const existingPriceElement = this.submitButtonText?.querySelector('[data-product-price]');
        if (existingPriceElement) {
          const priceHTML = existingPriceElement.outerHTML;
          this.submitButtonText.textContent = text;
          this.submitButtonText.insertAdjacentHTML('beforeend', ` ${priceHTML}`);
        } else {
          this.submitButtonText.textContent = text;
        }
      }

      get variantIdInput() {
        return this.form.querySelector('[name=id]');
      }
    }
  );
}
