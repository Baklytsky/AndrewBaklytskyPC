class compareProductsSelect extends HTMLElement {
  constructor() {
    super();

    this.customSelect = this.querySelector('custom-select');
    this.customSelectInput = this.customSelect.querySelector('input[data-custom-select-input]');
    this.oldNames = this.customSelect.querySelectorAll('.form-select__dropdown-option');
    this.newNames = this.querySelectorAll('.compare-products-section__new-name');
    this.imagesPairs = this.querySelectorAll('.compare-products-section__image-item');

    this.eventListeners();
  }

  eventListeners() {
    this.customSelectInput.addEventListener('change', () => {
      this.oldNames.forEach((item, index) => {
        if (JSON.parse(item.getAttribute('aria-selected'))) this.toggleNamesAndImages(index);
      })
    })
  }

  toggleNamesAndImages(i) {
    this.newNames.forEach((item, index) => {
      item.setAttribute('aria-hidden', true);
      if (index === i) item.setAttribute('aria-hidden', false);
    })

    this.imagesPairs.forEach((item, index) => {
      item.setAttribute('aria-hidden', true);
      if (index === i) item.setAttribute('aria-hidden', false);
    })
  }
}

customElements.define('compare-products-select', compareProductsSelect);
