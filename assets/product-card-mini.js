class ProductCardMini extends HTMLElement {
  constructor() {
    super();

    this.form = this.querySelector('form');
    this.images = this.querySelector('[data-variant-images]');
    this.cart = document.querySelector('cart-popup');
    
    this.addEventListener('change', (evt) => {
      evt.stopPropagation();
      this.onVariantChange()
    });
    this.form.addEventListener('submit', this.onFormSubmit.bind(this));

    this.allwaysApplyDiscountScript = this.getAttribute('data-always-apply-discount-script') === 'true';
  
    this.productJSON = JSON.parse(this.querySelector('[type="application/json"]').textContent);

    this.currentVariant = this.productJSON.current_variant;

    this.addEventListener('updatePrice', () => this.togglePrice(true));
  }

  onFormSubmit(evt)  {
    evt.preventDefault();
    const submitButton = this.querySelector('[type="submit"]');
    if (submitButton.classList.contains('loading')) return;

    // this.handleErrorMessage();

    submitButton.setAttribute('aria-disabled', true);
    submitButton.classList.add('loading');

    const formData = new FormData(this.form);
    // const items = [];
    // const mainItem = {};
    //
    // formData.forEach((value, key) => (mainItem[key] = value));
    // items.push(mainItem);

    const successCallback = function (response) {
      if (response.status) {
        this.handleErrorMessage(response.description);
      }
    }

    const finallyCallback = function () {
      setTimeout(() => {
        submitButton.classList.remove('loading');
        submitButton.removeAttribute('aria-disabled');
      }, 1000);
    }

    this.cart.addToCart(formData, true, true, successCallback.bind(this), null, finallyCallback.bind(this));
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();

    if (this.currentVariant) {
      this.updateVariantInput();
      this.changeImage();
      this.togglePrice();
      this.toggleButton();
    } else {
      this.toggleButton(true);
    }
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset, .fieldset'));
    this.options = fieldsets.map((fieldset) => {
      const radioChecked = Array.from(fieldset.querySelectorAll('input[data-variant-option]')).find((radio) => radio.checked)
      return radioChecked ? radioChecked.value : 'notSelectedOption';
    });
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }

  getVariantData() {
    this.variantData = this.variantData || this.productJSON.variants;
    return this.variantData;
  }

  updateVariantInput() {
    const input = this.form.querySelector('input[name="items[1][id]"]');
    input.value = this.currentVariant.id;
  }

  changeImage() {
    const image = this.querySelector(`[data-image-for-varaint="${this.currentVariant.id}"]`) || this.querySelector(`[data-featured-image]`) || false;
    const imageContainer = this.querySelector('.product-card-mini__image');

    if (image) {
      imageContainer.style.display = 'block';
      imageContainer.innerHTML = '';
      imageContainer.appendChild(image.cloneNode());
    } else {
      imageContainer.style.display = 'none';
    }
  }

  togglePrice(cleanScriptPrices) {
    const priceParentSelector = this.dataset.priceSelector;
    const comparePriceSelector = this.querySelector(`${priceParentSelector} [data-compare-price]`);
    const priceSelector = this.querySelector(`${priceParentSelector} [data-price]`);

    if (this.currentVariant.compare_at_price > this.currentVariant.price) {
      comparePriceSelector.innerHTML = formatMoney(this.currentVariant.compare_at_price, '{{amount_no_decimals}}');
      comparePriceSelector.style.display = 'block';
    } else {
      comparePriceSelector.innerHTML = '';
      comparePriceSelector.style.display = 'none';
    }

    priceSelector.setAttribute('data-price', this.currentVariant.price);
    priceSelector.innerHTML = formatMoney(this.currentVariant.price, '{{amount_no_decimals}}');
    
    if (cleanScriptPrices) return false;
    
    if (!this.allwaysApplyDiscountScript) document.querySelector('cart-items').scriptDiscountCheck(false, true);
    if (this.allwaysApplyDiscountScript) document.querySelector('cart-items').scriptDiscountApplyMiniCard(this);
  }

  toggleButton(unavalibale) {
    if (unavalibale || !this.currentVariant.available) {
      this.querySelector('input[type="submit"], input[type="checkbox"]').setAttribute('disabled', '');
      this.querySelector('input[type="submit"], input[type="checkbox"]').checked = false;
    } else {
      this.querySelector('input[type="submit"], input[type="checkbox"]').removeAttribute('disabled');
    }
  }

  handleErrorMessage(errorMessage = false) {
    this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('.product-card-mini__error-message-wrapper');
    this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-card-mini__error-message');

    this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

    if (errorMessage) {
      this.errorMessage.textContent = errorMessage;
    }

    setTimeout(() => {
      this.errorMessageWrapper.setAttribute('hidden', '');
    }, 4000);
  }
}

customElements.define('product-card-mini', ProductCardMini);