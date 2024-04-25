const selectors = {
  notificationForm: '[data-notification-form]',
  notification: '[data-notification]',
  popupClose: '[data-popup-close]',
};

const classes = {
  popupSuccess: 'pswp--success',
  notificationPopupVisible: 'notification-popup-visible',
};

class LoadNotification {
  constructor(popup, pswpElement) {
    this.popup = popup;
    this.pswpElement = pswpElement;
    this.notificationForm = null;
    this.notificationStopSubmit = true;
    this.sessionStorage = window.sessionStorage;
    const notificationWrapper = this.pswpElement.querySelector(selectors.notification);
    this.outerCloseEvent = (e) => {
      if (!notificationWrapper.contains(e.target)) {
        this.popup.close();
      }
    };

    this.init();
  }

  init() {
    this.popup.listen('preventDragEvent', (e, isDown, preventObj) => {
      preventObj.prevent = false;
    });

    const notificationFormSuccess = window.location.search.indexOf('?customer_posted=true') !== -1;
    this.notificationForm = this.pswpElement.querySelector(selectors.notificationForm);
    const closeBtn = this.pswpElement.querySelector(selectors.popupClose);
    document.body.classList.add(classes.notificationPopupVisible);

    this.pswpElement.addEventListener('mousedown', () => {
      this.popup.framework.unbind(window, 'pointermove pointerup pointercancel', this.popup);
    });

    if (notificationFormSuccess) {
      this.pswpElement.classList.add(classes.popupSuccess);
    }

    this.notificationForm.addEventListener('submit', (e) => this.notificationSubmitEvent(e));

    // Custom closing events
    this.pswpElement.addEventListener('click', this.outerCloseEvent);

    closeBtn.addEventListener('click', () => {
      this.popup.close();
    });

    this.popup.listen('destroy', () => {
      this.notificationRemoveStorage();
      this.pswpElement.removeEventListener('click', this.outerCloseEvent);
      document.body.classList.remove(classes.notificationPopupVisible);
    });
  }

  notificationSubmitEvent(e) {
    if (this.notificationStopSubmit) {
      e.preventDefault();

      this.notificationRemoveStorage();
      this.notificationWriteStorage();
      this.notificationStopSubmit = false;
      this.notificationForm.submit();
    }
  }

  notificationWriteStorage() {
    if (this.sessionStorage !== undefined) {
      this.sessionStorage.setItem('notification_form_id', this.notificationForm.id);
    }
  }

  notificationRemoveStorage() {
    this.sessionStorage.removeItem('notification_form_id');
  }
}

export {LoadNotification};
