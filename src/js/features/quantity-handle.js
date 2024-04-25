const selectors = {
  quantityHolder: '[data-quantity-holder]',
  quantityField: '[data-quantity-field]',
  quantityButton: '[data-quantity-button]',
  quantityMinusButton: '[data-quantity-minus]',
  quantityPlusButton: '[data-quantity-plus]',
};

const classes = {
  quantityReadOnly: 'read-only',
  isDisabled: 'is-disabled',
};

class QuantityCounter {
  constructor(holder, inCart = false) {
    this.holder = holder;
    this.quantityUpdateCart = inCart;
  }

  init() {
    // DOM Elements
    this.quantity = this.holder.querySelector(selectors.quantityHolder);

    if (!this.quantity) {
      return;
    }

    this.field = this.quantity.querySelector(selectors.quantityField);
    this.buttons = this.quantity.querySelectorAll(selectors.quantityButton);
    this.increaseButton = this.quantity.querySelector(selectors.quantityPlusButton);

    // Set value or classes
    this.quantityValue = Number(this.field.value || 0);
    this.cartItemID = this.field.getAttribute('data-id');
    this.maxValue = Number(this.field.getAttribute('max')) > 0 ? Number(this.field.getAttribute('max')) : null;
    this.minValue = Number(this.field.getAttribute('min')) > 0 ? Number(this.field.getAttribute('min')) : 0;
    this.disableIncrease = this.disableIncrease.bind(this);

    // Flags
    this.emptyField = false;

    // Methods
    this.updateQuantity = this.updateQuantity.bind(this);
    this.decrease = this.decrease.bind(this);
    this.increase = this.increase.bind(this);

    this.disableIncrease();

    // Events
    if (!this.quantity.classList.contains(classes.quantityReadOnly)) {
      this.changeValueOnClick();
      this.changeValueOnInput();
    }
  }

  /**
   * Change field value when click on quantity buttons
   *
   * @return  {Void}
   */

  changeValueOnClick() {
    this.buttons.forEach((element) => {
      element.addEventListener('click', (event) => {
        event.preventDefault();

        this.quantityValue = Number(this.field.value || 0);

        const clickedElement = event.target;
        const isDescrease = clickedElement.matches(selectors.quantityMinusButton) || clickedElement.closest(selectors.quantityMinusButton);
        const isIncrease = clickedElement.matches(selectors.quantityPlusButton) || clickedElement.closest(selectors.quantityPlusButton);

        if (isDescrease) {
          this.decrease();
        }

        if (isIncrease) {
          this.increase();
        }

        this.updateQuantity();
      });
    });
  }

  /**
   * Change field value when input new value in a field
   *
   * @return  {Void}
   */

  changeValueOnInput() {
    this.field.addEventListener('input', () => {
      this.quantityValue = this.field.value;
      this.updateQuantity();
    });
  }

  /**
   * Update field value
   *
   * @return  {Void}
   */

  updateQuantity() {
    if (this.maxValue < this.quantityValue && this.maxValue !== null) {
      this.quantityValue = this.maxValue;
    }

    if (this.minValue > this.quantityValue) {
      this.quantityValue = this.minValue;
    }

    this.field.value = this.quantityValue;

    this.disableIncrease();

    document.dispatchEvent(new CustomEvent('theme:cart:update'));

    if (this.quantityUpdateCart) {
      this.updateCart();
    }
  }

  /**
   * Decrease value
   *
   * @return  {Void}
   */

  decrease() {
    if (this.quantityValue > this.minValue) {
      this.quantityValue--;

      return;
    }

    this.quantityValue = 0;
  }

  /**
   * Increase value
   *
   * @return  {Void}
   */

  increase() {
    this.quantityValue++;
  }

  /**
   * Disable increase
   *
   * @return  {[type]}  [return description]
   */

  disableIncrease() {
    this.increaseButton.classList.toggle(classes.isDisabled, this.quantityValue >= this.maxValue && this.maxValue !== null);
  }

  updateCart() {
    if (this.quantityValue === '') return;

    const event = new CustomEvent('theme:cart:update', {
      bubbles: true,
      detail: {
        id: this.cartItemID,
        quantity: this.quantityValue,
      },
    });

    this.holder.dispatchEvent(event);
  }
}

export default QuantityCounter;
