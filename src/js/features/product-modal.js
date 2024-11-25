import {PopupActions} from '../features/popup-actions';

const selectors = {
  dialog: 'dialog',
};

class ProductModal extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    new PopupActions(this.querySelector(selectors.dialog), this, true, true);
  }
}

export {ProductModal};
