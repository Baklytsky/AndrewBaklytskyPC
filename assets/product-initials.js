class ProductInitials extends HTMLElement {
  constructor() {
    super();
    this.form = this.closest('form')
    if (!this.form) return

    this.control = this.querySelector('.product-initials summary');
    this.input = this.querySelector('[name="items[0][properties][initials]"]');
    this.initialsElements = this.querySelectorAll('[data-initials-element]')

    if (!this.input) return;
    this.initEvents()
  }

  initEvents() {
    this.control.addEventListener('click', (e)=> {
      this.initialsElements.forEach(el => el.toggleAttribute('disabled'));
    });
  }
}
customElements.define('product-initials', ProductInitials);