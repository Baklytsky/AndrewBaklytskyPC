import {register} from '../vendor/theme-scripts/theme-sections';
import {PopupActions} from '../features/popup-actions';

const selectors = {
  modal: '[data-password-modal]',
  loginErrors: '#login_form .errors',
};

class Password {
  constructor(section) {
    this.container = section.container;
    this.popupActions = new PopupActions(this.container.querySelector(selectors.modal), this.container, true, true);

    if (this.container.querySelector(selectors.loginErrors)) {
      this.popupActions.popupOpen();
    }
  }
}

const passwordSection = {
  onLoad() {
    new Password(this);
  },
};

register('password-template', passwordSection);
