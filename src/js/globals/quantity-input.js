class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', {bubbles: true});
    this.input.addEventListener('change', this.onInputChange.bind(this));
    this.querySelectorAll('button').forEach((button) => button.addEventListener('click', this.onButtonClick.bind(this)));
  }

  quantityUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.validateQtyRules();
    this.quantityUpdateUnsubscriber = subscribe(theme.PUB_SUB_EVENTS.quantityUpdate, this.validateQtyRules.bind(this));
  }

  disconnectedCallback() {
    if (this.quantityUpdateUnsubscriber) {
      this.quantityUpdateUnsubscriber();
    }
  }

  onInputChange(event) {
    this.validateQtyRules();
    if (this.input && this.input.name === 'updates[]') {
      this.updateCart();
    }
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;
    const button = event.target.nodeName === 'BUTTON' ? event.target : event.target.closest('button');
    const name = button ? button.name : undefined;

    const isIncrease = name === 'increase' || name === 'plus';
    const isDecrease = name === 'decrease' || name === 'minus';

    if (isIncrease) {
      if (parseInt(this.input?.dataset?.min) > parseInt(this.input.step) && this.input.value == 0) {
        this.input.value = this.input.dataset.min;
      } else {
        this.input.stepUp();
      }
    } else if (isDecrease) {
      this.input.stepDown();
    }

    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);

    if (this.input?.dataset?.min === previousValue && isDecrease) {
      this.input.value = parseInt(this.input.min);
    }
  }

  validateQtyRules() {
    const value = parseInt(this.input.value);
    if (this.input.min) {
      const buttonMinus = this.querySelector(".quantity__button[name='minus']") || this.querySelector(".quantity__button[name='decrease']");
      if (buttonMinus) buttonMinus.classList.toggle('disabled', parseInt(value) <= parseInt(this.input.min));
    }
    if (this.input.max) {
      const max = parseInt(this.input.max);
      const buttonPlus = this.querySelector(".quantity__button[name='plus']") || this.querySelector(".quantity__button[name='increase']");
      if (buttonPlus) buttonPlus.classList.toggle('disabled', value >= max);
    }
  }

  updateCart() {
    if (!this.input || this.input.value === '') return;
    this.dispatchEvent(
      new CustomEvent('theme:cart:update', {
        bubbles: true,
        detail: {
          id: this.input.dataset.id,
          quantity: this.input.value,
        },
      })
    );
  }
}

customElements.define('quantity-input', QuantityInput);
