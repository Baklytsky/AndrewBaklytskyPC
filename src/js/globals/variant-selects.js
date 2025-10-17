class VariantSelects extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener('change', (event) => {
      const target = this.getInputForEventTarget(event.target);

      publish(theme.PUB_SUB_EVENTS.optionValueSelectionChange, {
        data: {
          event,
          target,
          selectedOptionValues: this.selectedOptionValues,
        },
      });
    });
  }

  getInputForEventTarget(target) {
    return target.tagName === 'SELECT' ? target.selectedOptions[0] : target;
  }

  get selectedOptionValues() {
    const selectedNativeDropdowns = Array.from(this.querySelectorAll('select option[selected]'));
    const selectedRadios = Array.from(this.querySelectorAll('fieldset input:checked'));
    const selectedPopouts = Array.from(this.querySelectorAll('[data-popout-input]'));

    return [...selectedNativeDropdowns, ...selectedRadios, ...selectedPopouts].map(({dataset}) => dataset.optionValueId).filter((id) => Boolean(id));
  }
}

customElements.define('variant-selects', VariantSelects);
