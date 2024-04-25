import showElement from '../util/show-element';
import hideElement from '../util/hide-element';
import {register} from '../vendor/theme-scripts/theme-sections';

const selectors = {
  toggleAdmin: '[data-toggle-admin]',
  toggleNewsletter: '[data-toggle-newsletter]',
  adminForm: '[data-form-admin]',
  newsletterForm: '[data-form-newsletter]',
};

let sections = {};

class Password {
  constructor(section) {
    this.container = section.container;
    this.toggleAdmin = this.container.querySelector(selectors.toggleAdmin);
    this.toggleNewsletter = this.container.querySelector(selectors.toggleNewsletter);
    this.adminForm = this.container.querySelector(selectors.adminForm);
    this.newsletterForm = this.container.querySelector(selectors.newsletterForm);
    this.adminErrors = this.adminForm.querySelector('.errors');
    this.newsletterErrors = this.newsletterForm.querySelector('.errors');

    this.init();
  }

  init() {
    this.toggleAdmin.addEventListener('click', (e) => {
      e.preventDefault();
      this.showPasswordForm();
    });

    this.toggleNewsletter.addEventListener('click', (e) => {
      e.preventDefault();
      this.hidePasswordForm();
    });

    if (window.location.hash == '#login' || this.adminErrors) {
      this.showPasswordForm();
    } else {
      this.hidePasswordForm();
    }
  }

  showPasswordForm() {
    showElement(this.adminForm);
    hideElement(this.newsletterForm);
    window.location.hash = '#login';
  }

  hidePasswordForm() {
    showElement(this.newsletterForm);
    hideElement(this.adminForm);
    window.location.hash = '';
  }
}

const passwordSection = {
  onLoad() {
    sections[this.id] = new Password(this);
  },
};

register('password-template', passwordSection);
