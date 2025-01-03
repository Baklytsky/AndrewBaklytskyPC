const selectors = {
  popupComponent: 'popup-component',
  close: '[data-popup-close]',
  notificationForm: '[data-notification-form]',
  notificationHeading: '[data-product-notification-heading]',
};
const classes = {
  success: 'has-success',
  hidden: 'hidden',
};

if (!customElements.get('product-notification')) {
  customElements.define(
    'product-notification',
    class ProductNotification extends HTMLElement {
      constructor() {
        super();

        this.notificationForm = this.querySelector(selectors.notificationForm);
        this.preventSubmit = true;
        this.popup = this.closest('dialog');
        this.popupClose = this.popup.querySelector(selectors.close);
      }

      connectedCallback() {
        this.checkState();

        this.notificationForm.addEventListener('submit', (e) => this.notificationSubmitEvent(e));
        this.popupClose.addEventListener('click', () => {
          this.removeStorage();
        });
      }

      checkState() {
        const notificationFormSuccess = window.location.search.indexOf('?contact_posted=true') !== -1;

        if (notificationFormSuccess) {
          const productNotificationHeading = this.querySelector(selectors.notificationHeading);
          productNotificationHeading.classList.add(classes.hidden);

          this.closest(selectors.popupComponent).classList.add(classes.success);
          this.popup.removeAttribute('inert');

          if (typeof this.popup.showModal === 'function') {
            this.popup.showModal();
          } else {
            this.popup.setAttribute('open', '');
          }
        }
      }

      notificationSubmitEvent(e) {
        if (this.preventSubmit) {
          e.preventDefault();

          this.removeStorage();
          this.writeStorage();
          this.preventSubmit = false;
          this.notificationForm.submit();
        }
      }

      writeStorage() {
        if (window.sessionStorage !== undefined) {
          window.sessionStorage.setItem('notification_form_id', this.notificationForm.id);
        }
      }

      removeStorage() {
        window.sessionStorage.removeItem('notification_form_id');
      }
    }
  );
}
