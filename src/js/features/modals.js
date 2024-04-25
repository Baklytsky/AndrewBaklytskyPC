import {a11y} from '../vendor/theme-scripts/theme-a11y';

const selectors = {
  list: '[data-store-availability-list]',
};

const defaults = {
  close: '.js-modal-close',
  open: '.js-modal-open-store-availability-modal',
  openClass: 'modal--is-active',
  openBodyClass: 'modal--is-visible',
  closeModalOnClick: false,
  scrollIntoView: false,
};

class Modals {
  constructor(id, options) {
    this.modal = document.getElementById(id);

    if (!this.modal) return false;

    this.nodes = {
      parents: [document.querySelector('html'), document.body],
    };
    this.config = Object.assign(defaults, options);
    this.modalIsOpen = false;
    this.focusOnOpen = this.config.focusOnOpen ? document.getElementById(this.config.focusOnOpen) : this.modal;
    this.openElement = document.querySelector(this.config.open);
    this.a11y = a11y;

    this.init();
  }

  init() {
    this.openElement.addEventListener('click', this.open.bind(this));
    this.modal.querySelector(this.config.close).addEventListener('click', this.closeModal.bind(this));
  }

  open(evt) {
    // Keep track if modal was opened from a click, or called by another function
    let externalCall = false;
    // Prevent following href if link is clicked
    if (evt) {
      evt.preventDefault();
    } else {
      externalCall = true;
    }

    if (this.modalIsOpen && !externalCall) {
      this.closeModal();
      return;
    }

    this.modal.classList.add(this.config.openClass);
    this.nodes.parents.forEach((node) => {
      node.classList.add(this.config.openBodyClass);
    });
    this.modalIsOpen = true;

    const scrollableElement = document.querySelector(selectors.list);
    document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: scrollableElement}));

    if (this.config.scrollIntoView) {
      this.scrollIntoView();
    }
    this.bindEvents();

    this.a11y.trapFocus({
      container: this.modal,
    });
  }

  closeModal() {
    if (!this.modalIsOpen) return;
    document.activeElement.blur();
    this.modal.classList.remove(this.config.openClass);
    var self = this;
    this.nodes.parents.forEach(function (node) {
      node.classList.remove(self.config.openBodyClass);
    });
    this.modalIsOpen = false;
    this.openElement.focus();
    this.unbindEvents();

    this.a11y.removeTrapFocus({
      container: this.modal,
    });

    // Enable page scroll right after the closing animation ends
    const timeout = 400;
    document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true, detail: timeout}));
  }

  bindEvents() {
    this.keyupHandler = this.keyupHandler.bind(this);
    this.clickHandler = this.clickHandler.bind(this);
    document.body.addEventListener('keyup', this.keyupHandler);
    document.body.addEventListener('click', this.clickHandler);
  }

  unbindEvents() {
    document.body.removeEventListener('keyup', this.keyupHandler);
    document.body.removeEventListener('click', this.clickHandler);
  }

  keyupHandler(event) {
    if (event.code === theme.keyboardKeys.ESCAPE) {
      this.closeModal();
    }
  }

  clickHandler(event) {
    if (this.config.closeModalOnClick && !this.modal.contains(event.target) && !event.target.matches(this.config.open)) {
      this.closeModal();
    }
  }

  scrollIntoView() {
    this.focusOnOpen.scrollIntoView({
      behavior: 'smooth',
    });
  }
}

export {Modals};
