class CustomerForm extends HTMLElement {
  constructor() {
    super()
    this.form = this.querySelector('form');
    this.formSubmitBtn = this.querySelector('button[type="submit"]');
    this.passwordInput = this.form.querySelector('input[name="customer[password]"]');
    this.passwordConfirmInput = this.form.querySelector('input[name="customer[password_confirmation]"]');
    this.emailInput = this.form.querySelector('input[type="email"]');

    this.formSubmitBtn.addEventListener('click', this.onSubmitForm.bind(this))

    this.scrollIfInvalid();
  }

  onSubmitForm(e) {
    e.preventDefault();
    if (this.checkFormError()) {
      localStorage.setItem('loggedIn', 'true');
      if (e.target.classList.contains('customer-register__submit')) {
        window.dataLayer.push({
          'event': 'create_account',
          'user': {
            'customer': {
              'b2b_specialty': '',
              'b2b_role': '',
              'b2b_city': '',
              'b2b_state': '',
              'b2b_registration_reason': ''
            }
          }
        });
      }

      window.dataLayer.push({
        'event': 'form_complete',
        'form': {
          'form_name': this.form.getAttribute('data-form-name')
        }
      });

      this.form.submit();
    } else {
      window.dataLayer.push({
        'event': 'user_entry_error'
      });

      const errorMessage = this.querySelector('.form-error:not(.hide)')?.textContent || '';

      window.dataLayer.push({
      'event': 'form_error',
        'form': {
          'form_name': this.form.getAttribute('data-form-name'),
          'form_validation_errors': errorMessage.includes('email') ? 'Email' : 'Password',
          'error_message': errorMessage
        },
      });
    }
  }

  checkFormError() {
    const passwordError = this.form.querySelector('.form-error--password');
    // const passwordLengthError = this.form.querySelector('.form-error--password-length');
    const passwordValidError = this.form.querySelector('.form-error--password-valid');
    const emailError = this.form.querySelector('.form-error--email');
    const successMessage = this.querySelector('.form-success');

    if (!this.checkMathPasswords() && this.passwordConfirmInput && this.passwordInput) {
      passwordError.classList.remove('hide');
      if (successMessage) successMessage.classList.add('hide');
      this.passwordInput.classList.add('error');
      this.passwordConfirmInput.classList.add('error');
    }

    // if (!this.checkLengthPasswords()) {
    //   passwordLengthError.classList.remove('hide');
    //   if (successMessage) successMessage.classList.add('hide');
    // }

   if (this.emailInput && !this.emailValidation()) {
     emailError.classList.remove('hide');
     if (successMessage) successMessage.classList.add('hide');
     this.emailInput.classList.add('error');
   }

   if (!this.validatePassword()) {
     passwordValidError.classList.remove('hide');
     if (successMessage) successMessage.classList.add('hide');
     this.passwordConfirmInput.classList.add('error');
     this.passwordInput.classList.add('error');
   }

    return this.checkMathPasswords() && this.emailValidation() && this.validatePassword()
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

  validatePassword() {
    if (this.passwordConfirmInput && this.passwordInput) {
      const re = /(?=.*[0-9])(?=.*[a-z])[0-9a-zA-Z!@#$%^&*]{7,}/g;
      return re.test(this.passwordInput.value.toLowerCase());
    } else {
      return true
    }
  }

  checkMathPasswords() {
    if (this.passwordConfirmInput && this.passwordInput) {
      return this.passwordInput.value === this.passwordConfirmInput.value
    } else {
      return true
    }
  }

  checkLengthPasswords() {
    if (this.passwordInput) {
      return !(this.passwordInput.value.length < 5)
    } else {
      return true
    }
  }

  scrollIfInvalid() {
    this.form.addEventListener('invalid', (e) => {
      document.querySelector('html').classList.add('html-scroll');

      setTimeout(() => {
        document.querySelector('html').classList.remove('html-scroll');
      }, 2000);
    }, true);
  }

}
customElements.define('customer-form', CustomerForm);
