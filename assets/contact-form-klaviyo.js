if (!customElements.get('contact-form-klaviyo')) {
  class ContactFormKlaviyo extends HTMLElement {
    constructor() {
      super();
      this.form = this.querySelector('form');
      this.klaviyoListId = this.getAttribute('data-klaviyo-list-id');
      this.email = this.querySelector('input[type="email"]');
      this.companyId = 'XyRtPP'

      if (this.klaviyoListId) {
        this.form.addEventListener('submit', this.sendForm.bind(this));
      } else {
        return console.error('Klaviyo form id not found.');
      }
    }

    formData() {
      let requestAttribute = {
        email: (this.querySelector('input[type="email"]')) ? this.querySelector('input[type="email"]').value : '',
        first_name: (this.querySelector('#ContactForm-name')) ? this.querySelector('#ContactForm-name').value : '',
        properties: {
          'comment': (this.querySelector('#ContactForm-body')) ? this.querySelector('#ContactForm-body').value : '',
        }
      }
      let phoneNumber = (this.querySelector('input[type="tel"]')) ? this.querySelector('input[type="tel"]').value : ''

        if (phoneNumber.length > 10) {
        requestAttribute.phone_number = `+1${phoneNumber.replace('(', '').replace(')', '').replace('-', '').replace(' ', '')}`
      }

      return {
        method: 'POST',
        headers: {revision: '2024-02-15', 'content-type': 'application/json'},
        body: JSON.stringify({
          data: {
            type: 'subscription',
            attributes: {
              custom_source: 'Contact form',
              profile: {
                data: {
                  type: 'profile',
                  attributes: requestAttribute
                }
              }
            },
            relationships: {list: {data: {type: 'list', id: this.klaviyoListId}}}
          }
        })
      };
    }
    showMessage(type) {
      // this.email.classList.add(type);
      document.querySelector('.contact_form__message-' + type).classList.remove('hidden');

      setTimeout(() => {
        this.email.classList.remove(type);
        document.querySelector('.contact_form__message-' + type).classList.add('hidden');
      }, 6000)
    }

    sendForm(event) {
      event.preventDefault();
      const _this = this;

      if (this.emailValidation()) {
        fetch(`https://a.klaviyo.com/client/subscriptions/?company_id=${this.companyId}`, this.formData())
          .then(response => {(response.status === 202) ? _this.showMessage("success"):  _this.showMessage("error")})
      } else {
        this.showMessage("error-email");
      }
    }

    emailValidation() {
      if (this.email) {
        const emailValue = this.email.value;
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const result = re.test(emailValue);

        return result && result !== ''
      } else {
        return true
      }
    }
  }
  customElements.define("contact-form-klaviyo", ContactFormKlaviyo);
}