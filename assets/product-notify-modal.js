class ProductNotifyModal extends ModalDialog {
  constructor() {
    super();

    this.form = this.querySelector('form');
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
  }

  onSubmitHandler(evt) {
    evt.preventDefault();

    const formData = new FormData(this.form);
    const email = formData.get('email');
    const variant_id = formData.get('variant');
    const company_id = 'XyRtPP'

    if (!this.validateEmail(email)) {
      this.handleMessage(true);
      return false;
    }

    const config = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        revision: `${this.getFormattedDate()}`,
        'content-type': 'application/json'
      },
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
                id: `$shopify:::$default:::${variant_id}`
              }
            }
          }
        }
      })
    };

    this.sendRequest(company_id, config)
  }

  async sendRequest(company_id, config) {
    try {
      const response = await fetch(`https://a.klaviyo.com/client/back-in-stock-subscriptions/?company_id=${company_id}`, config);
      if (response.status === 202) this.handleMessage(false,false, true);
    } catch (error) {
      this.handleMessage(false,true);
      console.error(error);
    }
  }

  getFormattedDate() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  handleMessage(showEmailInvalid = false, showError = false, showSuccess = false) {
    const messages = this.querySelectorAll('.product-notify-modal-form__error, .product-notify-modal-form__subscription');
    const emailInvalid = this.querySelector('.product-notify-modal-form__email-invalid');
    const error = this.querySelector('.product-notify-modal-form__klaviyo-error');
    const success = this.querySelector('.product-notify-modal-form__subscription');

    messages.forEach((el) => {
      el.style.display = 'none';
    });
    error.parentElement.classList.remove('error');

    if (showEmailInvalid) {emailInvalid.style.display = 'block';}
    if (showError) {error.style.display = 'block';}
    if (showSuccess) {success.style.display = 'block';}

    if (showError || showEmailInvalid) {error.parentNode.classList.add('error')};
  }
}
customElements.define('product-notify-modal', ProductNotifyModal);