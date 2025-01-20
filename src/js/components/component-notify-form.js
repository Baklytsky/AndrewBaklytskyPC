if (!customElements.get('notify-form')) {
  class NotifyForm extends HTMLElement {
    constructor() {
      super();
      this.form = this.querySelector('form')
      this.emailInput = this.form.querySelector('[type=email]')
      this.submitBtn = this.form.querySelector('[type=submit]')
      this.spinner = this.submitBtn.querySelector('.loading-overlay__spinner');
      this.successMessage = this.submitBtn.getAttribute('data-success-message')
      this.originMessage = this.submitBtn.getAttribute('data-origin-message')
      this.productData = JSON.parse(this.querySelector('[data-notify-product]').textContent)
      if (this.productData) {
        if (!window.SwymCallbacks) window.SwymCallbacks = []
        window.SwymCallbacks.push(this.initEvents.bind(this));
      }
    }

    initEvents() {
      this.submitBtn.removeAttribute('disabled')
      this.form.addEventListener('submit', (e)=> this.sendToWatchlist(e))
      this.emailInput.addEventListener('keyup', ()=> {
        this.form.classList.remove('error')

        if (this.form.classList.contains('success')) {
          this.form.classList.remove('success')
          this.submitBtn.querySelector('span').textContent = this.originMessage
          this.changeBtnState()
        }

      })
    }


    emailValidation() {
      if (this.emailInput) {
        const emailValue = this.emailInput.value;
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const result = re.test(emailValue);

        return result && result !== ''
      } else {
        return true
      }
    }

    sendToWatchlist(e) {
      e.preventDefault()

      window.dataLayer.push({
        'event': 'notify_me_start'
      });

      this.changeBtnState('disabled')
      if (!this.emailValidation()) {
        this.onError()
        return
      }
      window._swat.sendWatchlist(
        this.emailInput.value,
        "email",
        this.productData,
        (response) => {this.onSuccess()},
        (error) => {this.onError()},
        1
      )
    }

    onSuccess() {
      this.form.classList.add('success')
      this.submitBtn.querySelector('span').textContent = this.successMessage
      this.changeBtnState()

      window.dataLayer.push({
        'event': 'notify_me_complete'
      })
    }

    onError() {
      this.form.classList.add('error')
      this.changeBtnState()

      window.dataLayer.push({
        'event': 'notify_me_error'
      })
    }

    changeBtnState(state) {
      if (state === 'disabled') {
        this.submitBtn.setAttribute('disabled', '')
        if (this.spinner) {
          this.submitBtn.classList.add('loading')
          this.spinner.classList.remove('hidden');
        }
      } else {
        this.submitBtn.removeAttribute('disabled')
        if (this.spinner) {
          this.submitBtn.classList.remove('loading')
          if (this.spinner) this.spinner.classList.add('hidden');
        }
      }
    }
  }

  customElements.define('notify-form', NotifyForm);
}
