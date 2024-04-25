const selectors = {
  form: '[data-account-form]',
  showReset: '[data-show-reset]',
  hideReset: '[data-hide-reset]',
  recover: '[data-recover-password]',
  login: '[data-login-form]',
  recoverSuccess: '[data-recover-success]',
  recoverSuccessText: '[data-recover-success-text]',
  recoverHash: '#recover',
};

const classes = {
  hidden: 'is-hidden',
};

class Login {
  constructor(form) {
    this.form = form;
    this.showButton = form.querySelector(selectors.showReset);
    this.hideButton = form.querySelector(selectors.hideReset);
    this.recover = form.querySelector(selectors.recover);
    this.login = form.querySelector(selectors.login);
    this.success = form.querySelector(selectors.recoverSuccess);
    this.successText = form.querySelector(selectors.recoverSuccessText);
    this.init();
  }

  init() {
    if (window.location.hash == selectors.recoverHash) {
      this.showRecoverPasswordForm();
    } else {
      this.hideRecoverPasswordForm();
    }

    if (this.success) {
      this.successText.classList.remove(classes.hidden);
    }

    this.showButton.addEventListener(
      'click',
      (e) => {
        e.preventDefault();
        this.showRecoverPasswordForm();
      },
      false
    );
    this.hideButton.addEventListener(
      'click',
      (e) => {
        e.preventDefault();
        this.hideRecoverPasswordForm();
      },
      false
    );
  }

  showRecoverPasswordForm() {
    this.recover.classList.remove(classes.hidden);
    this.login.classList.add(classes.hidden);
    window.location.hash = selectors.recoverHash;
    return false;
  }

  hideRecoverPasswordForm() {
    this.login.classList.remove(classes.hidden);
    this.recover.classList.add(classes.hidden);
    window.location.hash = '';
    return false;
  }
}

const loginForm = document.querySelector(selectors.form);
if (loginForm) {
  new Login(loginForm);
}
