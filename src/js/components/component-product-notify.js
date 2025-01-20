if (!customElements.get('notify-me-form')) {
  class NotifyMe extends HTMLElement {
    constructor() {
      super();

      this.form = this.querySelector('form');
      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
      this.companyId = 'SJacsh'
    }

    onSubmitHandler(e) {
      e.preventDefault();

      const formData = new FormData(this.form);
      const email = formData.get('email');
      const variantId = formData.get('variant');

      if (!this.validateEmail(email)) {
        this.showMessage('error-email');
        return false;
      }

      const config = {
        method: 'POST',
        headers: {accept: 'application/json', revision: '2024-02-15', 'content-type': 'application/json'},
        body: JSON.stringify({
          data: {
            type: 'back-in-stock-subscription',
            attributes: {
              profile: {
                data: {
                  type: 'profile',
                  attributes: {
                    email: `${email}`
                  }
                }
              },
              channels: ['EMAIL'],
            },
            relationships: {
              variant: {
                data: {
                  type: 'catalog-variant',
                  id: `$shopify:::$default:::${variantId}`
                }
              }
            }
          }
        })
      };

      fetch(`https://a.klaviyo.com/client/back-in-stock-subscriptions/?company_id=${this.companyId}`, config)
        .then((response) => {
          if (response.status === 202) {
            this.showMessage('success');
          } else {
            console.error('Error Klaviyo: ', response.errors);
            this.showMessage('error');
          }
        })
        // .catch((e) => {
        //   console.error(e);
        //   this.showMessage('error');
        // });
    }

    validateEmail(email) {
      let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }

    showMessage(type) {
      document.querySelector('.notify-message__' + type).classList.remove('hide');

      setTimeout(() => {
        document.querySelector('.notify-message__' + type).classList.add('hide');
      }, 6000)
    }
  }

  customElements.define('notify-me-form', NotifyMe);
}
