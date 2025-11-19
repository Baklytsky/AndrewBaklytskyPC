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

  /**
   * Trigger variant change by updating the variant ID input in a form
   * @param {string} variantId - The variant ID to trigger
   */
  triggerVariantChange(variantId) {
    const targetForm = this.closest('form');
    if (!targetForm || !variantId) return;

    const variantIdInput = targetForm.querySelector('[name="id"]');
    if (!variantIdInput) return;

    variantIdInput.value = variantId;
    variantIdInput.dispatchEvent(new Event('change'));
  }
}

customElements.define('variant-selects', VariantSelects);
