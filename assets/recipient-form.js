if (!customElements.get('recipient-form')) {
  customElements.define(
    'recipient-form',
    class RecipientForm extends HTMLElement {
      constructor() {
        super();
        this.form = this.closest('product-form');
        if (!this.form) return

        this.control = this.querySelector('.product-recipient summary');
        this.emailInput = this.querySelector('input[type=email]');
        this.dateInput = this.querySelector('input[type=date]');
        this.initialsElements = this.querySelectorAll('[data-recipient-element]');
        this.offsetProperty = this.querySelector(`#Recipient-timezone-offset-${this.dataset.sectionId}`);
        if (this.offsetProperty) this.offsetProperty.value = new Date().getTimezoneOffset().toString();

        if (!this.emailInput) return
        this.initEvents()
      }

      initEvents() {
        this.control.addEventListener('click', (e)=> {
          this.toggleAttribute('active')
          this.initialsElements.forEach(el => el.toggleAttribute('disabled'));
        });

        this.dateInput?.addEventListener('change', (e) => {
          (e.target.value) ? e.target.classList.add('has-value') : e.target.classList.remove('has-value');
        });
      }

      validateEmail() {
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(this.emailInput.value);
      }
    }
  );
}
