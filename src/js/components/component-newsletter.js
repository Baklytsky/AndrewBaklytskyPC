
if (!customElements.get('newsletter-footer')) {
  class NewsletterFooter extends HTMLElement {
    constructor() {
      super();

      this.form = this.querySelector('form');
      this.klaviyoListId = this.getAttribute('data-klaviyo-list-id');
      this.email = this.querySelector('input[type="email"]');
      this.companyId = 'SJacsh'

      if (this.klaviyoListId) {
        this.form.addEventListener('submit', this.sendForm.bind(this));

        this.email.addEventListener('invalid', this.sendGAErrorEvent);
      } else {
        return console.error('Klaviyo form id not found.');
      }
    }

    formData() {
      // return {
      //   g: this.klaviyoListId,
      //   '$fields': '$source,$email,$consent_method,$consent_form_id,$marketingOptIn',
      //   '$list_fields': '',
      //   '$timezone_offset': Math.abs(new Date().getTimezoneOffset() / 60),
      //   '$source': 'Site Footer',
      //   '$email': (this.querySelector('input[type="email"]')) ? this.querySelector('input[type="email"]').value : '',
      //   '$marketingOptIn': (this.querySelector('#newsletter-marketing')) ? this.querySelector('#newsletter-marketing').checked : false,
      //   '$consent_method': 'Klaviyo Form',
      //   '$origin': 'origin'
      // };
      return {
        method: 'POST',
        headers: {revision: '2024-02-15', 'content-type': 'application/json'},
        body: JSON.stringify({
          data: {
            type: 'subscription',
            attributes: {
              custom_source: 'Site Footer',
              profile: {
                data: {
                  type: 'profile',
                  attributes: {
                    email: (this.querySelector('input[type="email"]')) ? this.querySelector('input[type="email"]').value : '',
                    properties: {
                      marketingOptIn: (this.querySelector('#newsletter-marketing')) ? this.querySelector('#newsletter-marketing').checked : false
                    }
                  }
                }
              }
            },
            relationships: {list: {data: {type: 'list', id: this.klaviyoListId}}}
          }
        })
      };
    }

    showMessage(type) {
      this.email.classList.add(type);
      document.querySelector('.footer-newsletter__' + type).classList.remove('hide');

      setTimeout(() => {
        this.email.classList.remove(type);
        document.querySelector('.footer-newsletter__' + type).classList.add('hide');
      }, 6000)
    }

    sendForm(event) {
      event.preventDefault();
      const _this = this;

      if (this.emailValidation()) {
        window.dataLayer.push({
          'event': 'form_complete',
          'form': {
            'form_name': 'Newsletter'
          }
        });

        window.dataLayer.push({
          'event': 'generate_lead',
          'customer': {
            'b2b_specialty': '',
            'b2b_role': '',
            'b2b_city': '',
            'b2b_state': '',
            'b2b_registration_reason': ''
          },
          'user': {
            'lead': {
              'lead_type': 'D2C',
              'lead_driver': 'Newsletter'
            }
          }
        });


        fetch(`https://a.klaviyo.com/client/subscriptions/?company_id=${this.companyId}`, this.formData())
          .then(response => {
            if (response.status === 202) {
              _this.showMessage('success');
              this.form.reset();
            } else {
              _this.showMessage('error');
            }
          })
          // .catch(err => {
          //   console.log(err)
          //   _this.showMessage('error');
          // });
      } else {
        this.showMessage('error-email');
        this.sendGAErrorEvent();
      }
    }

    objToStrUrlEncode(obj) {
      const str = [];
      for (let key in obj) {
        if (obj.hasOwnProperty(key) && typeof obj[key] !== 'undefined') {
          str.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]))
        }
      }
      return str.join('&')
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

    sendGAErrorEvent() {
      window.dataLayer.push({
        'event': 'form_error',
        'form': {
          'form_name': 'Newsletter',
          'form_validation_errors': 'Email',
          'error_message': 'Invalid email address',
        },
      });
    }
  }

  customElements.define('newsletter-footer', NewsletterFooter);
}
