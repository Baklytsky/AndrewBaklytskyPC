if (!customElements.get('product-form')) {
  customElements.define('product-form', class ProductForm extends HTMLElement {
    constructor() {
      super();

      this.form = this.querySelector('form');
      this.form.querySelector('[name="items[0][id]"]').disabled = false;
      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
      this.sectiondId = this.form.dataset.sectionId;
      this.cartPopup = document.querySelector('cart-popup');
    }

    onSubmitHandler(evt) {
      evt.preventDefault();
      const submitButton = this.querySelector('[type="submit"]');
      if (submitButton.classList.contains('loading')) return;

      this.handleErrorMessage();

      if (!this.checkRecipientForm()) {
        this.handleErrorMessage(window.recipient_form.errorMessage);
        return;
      }

       // this.cartPopup.setActiveElement(document.activeElement);

      submitButton.setAttribute('aria-disabled', true);
      submitButton.classList.add('loading');
      this.querySelector('.loading-overlay__spinner').classList.remove('hidden');

      const formData = new FormData(this.form);

      // Start Additional product
      const additionalForm = document.querySelector(`[data-additional-product-form="${this.sectiondId}"]`);
      const additionalProductChecked = additionalForm && additionalForm.querySelector('input[type="checkbox"]')
        ? additionalForm.querySelector('input[type="checkbox"]').checked
        : false;

      if (additionalProductChecked) {
        const additionalFormData = new FormData(additionalForm);
        for (const pair of additionalFormData.entries()) {
          formData.append(pair[0], pair[1]);
        }
      }
      // End Additional product

      const successCallback = (response) => {
        if (response.status) {
          this.handleErrorMessage(response.description);
        }
      }

      const finallyCallback = () => {
        submitButton.classList.remove('loading');
        submitButton.removeAttribute('aria-disabled');

        this.querySelector('.loading-overlay__spinner').classList.add('hidden');
      }

      //AddToCart
      this.cartPopup.addToCart(formData, true, true, successCallback.bind(this), null, finallyCallback.bind(this));
    }

    handleErrorMessage(errorMessage = false) {
      this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
      this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

      this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

      if (errorMessage) {
        this.errorMessage.innerHTML = errorMessage;
      }
    }

    checkRecipientForm() {
      let validationResult = true;
      const recipientForm = this.querySelector('recipient-form')
      if (recipientForm && recipientForm.hasAttribute('active')) validationResult = recipientForm.validateEmail()
      return validationResult
    }

    createFormDataItem(form) {
      if (!form) {return false}
      const formData = new FormData(form);
      const item = {}

      formData.forEach((value, key) => {
        const lastStr = key.charAt(key.length - 1)

        if (key.includes('properties') && lastStr === ']') {
          const newKey = key.substring(key.indexOf('[') + 1, key.indexOf(']'));
          const skipProperty = (newKey === '_image' && !value.name.length) || (newKey === '_text' && !value.length)

          if (skipProperty) return

          if (item['properties']) {item['properties'][newKey] = value;}
          else item['properties'] = {[newKey]: value};

        } else item[key] = value;
      });

      return item || false;
    }
  });
}
