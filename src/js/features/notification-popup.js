/*
Usage:
  import {NotificationPopup} from '../features/notification-popup';

  if (button.hasAttribute(attributes.notificationPopup) {
    new NotificationPopup(button);
  }

*/

import {a11y} from '../vendor/theme-scripts/theme-a11y';

import {LoadPhotoswipe} from './load-photoswipe';

const settings = {
  templateIndex: 1,
};

const classes = {
  popupNotification: 'pswp--notification pswp--not-close-btn',
};

const attributes = {
  notificationPopup: 'data-notification-popup',
};

const options = {
  history: false,
  focus: false,
  mainClass: classes.popupNotification,
  closeOnVerticalDrag: false,
};

class NotificationPopup {
  constructor(button) {
    this.button = button;
    this.a11y = a11y;
    this.notificationPopupHtml = this.button.getAttribute(attributes.notificationPopup);

    if (this.notificationPopupHtml.trim() !== '') {
      this.init();
    }
  }

  init() {
    const items = [
      {
        html: this.notificationPopupHtml,
      },
    ];

    this.a11y.state.trigger = this.button;

    new LoadPhotoswipe(items, options, settings.templateIndex);
  }
}

export {NotificationPopup};
