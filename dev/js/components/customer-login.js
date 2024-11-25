if (!customElements.get('login-form')) {
  customElements.define(
    'login-form',
    class LoginForm extends HTMLElement {
      constructor() {
        super();

        this.showButton = this.querySelector('[data-show-reset]');
        this.hideButton = this.querySelector('[data-hide-reset]');
        this.recover = this.querySelector('[data-recover-password]');
        this.recoverSuccess = this.querySelector('[data-recover-success]');
        this.login = this.querySelector('[data-login-form]');
        this.init();
      }

      init() {
        if (window.location.hash == '#recover' || this.recoverSuccess) {
          this.showRecoverPasswordForm();
        } else {
          this.hideRecoverPasswordForm();
        }

        this.showButton.addEventListener('click', (e) => {
          e.preventDefault();
          this.showRecoverPasswordForm();
        });

        this.hideButton.addEventListener('click', (e) => {
          e.preventDefault();
          this.hideRecoverPasswordForm();
        });
      }

      showRecoverPasswordForm() {
        this.login.classList.add('is-hidden');
        this.recover.classList.remove('is-hidden');
        window.location.hash = '#recover';
        return false;
      }

      hideRecoverPasswordForm() {
        this.recover.classList.add('is-hidden');
        this.login.classList.remove('is-hidden');
        window.location.hash = '';
        return false;
      }
    }
  );
}
