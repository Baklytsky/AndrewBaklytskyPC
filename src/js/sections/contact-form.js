import {register} from '../vendor/theme-scripts/theme-sections';

const selectors = {
  formMessageClose: '[data-form-message-close]',
  formMessageWrapper: '[data-form-message]',
};

const classes = {
  hideDown: 'hide-down',
  notificationVisible: 'notification-visible',
};

let sections = {};

class ContactForm {
  constructor(section) {
    this.container = section.container;
    this.closeButton = this.container.querySelector(selectors.formMessageClose);
    this.messageWrapper = this.container.querySelector(selectors.formMessageWrapper);

    if (this.messageWrapper) {
      this.hidePopups();
      this.closeFormMessage();
      this.autoHideMessage();
    }
  }

  hidePopups() {
    document.body.classList.add(classes.notificationVisible);
  }

  showPopups() {
    document.body.classList.remove(classes.notificationVisible);
  }

  closeFormMessage() {
    this.closeButton.addEventListener('click', this.closeMessage.bind(this));
  }

  closeMessage(e) {
    e.preventDefault();
    this.messageWrapper.classList.add(classes.hideDown);
    this.showPopups();
  }

  autoHideMessage() {
    setTimeout(() => {
      this.messageWrapper.classList.add(classes.hideDown);
      this.showPopups();
    }, 10000);
  }
}

const contactFormSection = {
  onLoad() {
    sections[this.id] = new ContactForm(this);
  },
};

register('contact-form', contactFormSection);
