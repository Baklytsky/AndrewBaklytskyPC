const selectors = {
  recipientCheckbox: '[data-recipient-checkbox]',
  recipientEmail: '[data-recipient-email]',
  recipientName: '[data-recipient-name]',
  recipientMessage: '[data-recipient-message]',
  recipientSendOn: '[data-recipient-send-on]',
  recipientControl: '[data-recipient-control]',
  recipientOffset: '[data-recipient-offset]',
  productForm: '[data-product-form]',
  cartDrawer: '[data-cart-drawer]',
};

const classes = {
  quickViewVisible: 'js-quick-view-visible',
};

class RecipientForm extends HTMLElement {
  constructor() {
    super();
    this.recipientCheckbox = this.querySelector(selectors.recipientCheckbox);
    this.recipientControl = this.querySelector(selectors.recipientControl);
    this.recipientControl.disabled = true;
    this.recipientEmail = this.querySelector(selectors.recipientEmail);
    this.recipientName = this.querySelector(selectors.recipientName);
    this.recipientMessage = this.querySelector(selectors.recipientMessage);
    this.recipientSendOn = this.querySelector(selectors.recipientSendOn);
    this.recipientOffset = this.querySelector(selectors.recipientOffset);
    if (this.recipientOffset) this.recipientOffset.value = new Date().getTimezoneOffset();
    this.cartDrawer = document.querySelector(selectors.cartDrawer);

    this.onChangeEvent = (event) => this.onChange(event);
    this.onCartAddedEvent = () => this.onCartAdded();
  }

  connectedCallback() {
    if (!this.recipientCheckbox) return;

    this.disableInputFields();

    this.recipientCheckbox.addEventListener('change', this.onChangeEvent);
    document.addEventListener('theme:cart:added', this.onCartAddedEvent);
  }

  onChange(event) {
    if (!event.target.checked) {
      this.clearInputFields();
      this.disableInputFields();
      return;
    }

    this.enableInputFields();
  }

  onCartAdded() {
    const scrollToPosition = this.closest(selectors.productForm).offsetTop;
    const isQuickBuyForm = document.body.classList.contains(classes.quickViewVisible);
    const isRecipientFormActive = this.recipientCheckbox.checked === true;

    if (!isRecipientFormActive) return;

    if (!isQuickBuyForm) {
      // Scroll to the top position of the Product form to prevent layout shift when Recipient form fields are hidden
      window.scrollTo({
        top: scrollToPosition,
        left: 0,
        behavior: 'smooth',
      });
    }

    // Hide Recipient form fields when Cart Drawer's opening animation is completed
    const onCartDrawerTransitionEnd = (event) => {
      if (event.target !== this.cartDrawer) return;

      requestAnimationFrame(() => {
        this.recipientCheckbox.checked = false;
        this.recipientCheckbox.dispatchEvent(new Event('change'));
      });

      this.cartDrawer.removeEventListener('transitionend', onCartDrawerTransitionEnd);
    };

    this.cartDrawer.addEventListener('transitionend', onCartDrawerTransitionEnd);
  }

  inputFields() {
    return [this.recipientEmail, this.recipientName, this.recipientMessage, this.recipientSendOn];
  }

  disableableFields() {
    return [...this.inputFields(), this.recipientOffset];
  }

  clearInputFields() {
    this.inputFields().forEach((field) => (field.value = ''));
  }

  enableInputFields() {
    this.disableableFields().forEach((field) => (field.disabled = false));
  }

  disableInputFields() {
    this.disableableFields().forEach((field) => (field.disabled = true));
  }

  disconnectedCallback() {
    this.recipientCheckbox.removeEventListener('change', this.onChangeEvent);
    document.removeEventListener('theme:cart:added', this.onCartAddedEvent);
  }
}

export {RecipientForm};
