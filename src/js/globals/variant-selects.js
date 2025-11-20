class VariantSelects extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener('change', (event) => {
      const target = this.getInputForEventTarget(event.target);

      // Check if this change event is from a 'popout-select' dropdown that should trigger variant change
      this.triggerPopoutVariantChange(target);

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
   * Trigger variant change from a popout-select dropdown
   * @param {HTMLElement} target - The target element that triggered the change event
   */
  triggerPopoutVariantChange(target) {
    // check if the target is the correct input
    if (!target || !target.hasAttribute('data-popout-input')) return;

    // check if the popout-select has the correct attribute
    const popoutSelect = target.closest('popout-select');
    if (!popoutSelect || !popoutSelect.hasAttribute('data-variant-change')) return;

    // get the variant ID from the target
    const variantId = target.getAttribute('data-variant-id');
    if (!variantId) return;

    // get the target form and the variant ID input
    const targetForm = this.closest('form');
    const variantIdInput = targetForm?.querySelector('[name="id"]');
    if (!targetForm || !variantIdInput) return;

    // set the variant ID value and trigger the variant change
    variantIdInput.value = variantId;
    variantIdInput.dispatchEvent(new Event('change', {bubbles: true}));
  }
}

customElements.define('variant-selects', VariantSelects);
