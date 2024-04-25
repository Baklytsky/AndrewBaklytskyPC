import {PopupCookie} from './popup-cookie';

const selectors = {
  newsletterForm: '[data-newsletter-form]',
  popup: '[data-popup]',
};

const classes = {
  success: 'has-success',
  error: 'has-error',
};

const attributes = {
  storageNewsletterFormId: 'newsletter_form_id',
};

const sections = {};

class Newsletter {
  constructor(newsletter) {
    this.newsletter = newsletter;
    this.sessionStorage = window.sessionStorage;
    this.popup = this.newsletter.closest(selectors.popup);
    this.stopSubmit = true;
    this.isChallengePage = false;
    this.formID = null;
    this.formIdSuccess = null;

    this.checkForChallengePage();

    this.newsletterSubmit = (e) => this.newsletterSubmitEvent(e);

    if (!this.isChallengePage) {
      this.init();
    }
  }

  init() {
    this.newsletter.addEventListener('submit', this.newsletterSubmit);

    this.showMessage();
  }

  newsletterSubmitEvent(e) {
    if (this.stopSubmit) {
      e.preventDefault();

      this.removeStorage();
      this.writeStorage();
      this.stopSubmit = false;
      this.newsletter.submit();
    }
  }

  checkForChallengePage() {
    this.isChallengePage = window.location.pathname === theme.routes.root + 'challenge';
  }

  writeStorage() {
    if (this.sessionStorage !== undefined) {
      this.sessionStorage.setItem(attributes.storageNewsletterFormId, this.newsletter.id);
    }
  }

  readStorage() {
    this.formID = this.sessionStorage.getItem(attributes.storageNewsletterFormId);
  }

  removeStorage() {
    this.sessionStorage.removeItem(attributes.storageNewsletterFormId);
  }

  showMessage() {
    this.readStorage();

    if (this.newsletter.id === this.formID) {
      const newsletter = document.getElementById(this.formID);
      const submissionSuccess = window.location.search.indexOf('?customer_posted=true') !== -1;
      const submissionFailure = window.location.search.indexOf('accepts_marketing') !== -1;

      if (submissionSuccess) {
        newsletter.classList.remove(classes.error);
        newsletter.classList.add(classes.success);

        if (this.popup) {
          this.cookie = new PopupCookie(this.popup.dataset.cookieName, 'user_has_closed');
          this.cookie.write();
        }
      } else if (submissionFailure) {
        newsletter.classList.remove(classes.success);
        newsletter.classList.add(classes.error);
      }

      if (submissionSuccess || submissionFailure) {
        this.scrollToForm(newsletter);
      }
    }
  }

  /**
   * Scroll to the last submitted newsletter form
   */
  scrollToForm(newsletter) {
    const rect = newsletter.getBoundingClientRect();
    const isVisible = visibilityHelper.isElementPartiallyVisible(newsletter) || visibilityHelper.isElementTotallyVisible(newsletter);

    if (!isVisible) {
      setTimeout(() => {
        window.scrollTo({
          top: rect.top,
          left: 0,
          behavior: 'smooth',
        });
      }, 400);
    }
  }

  /**
   * Event callback for Theme Editor `section:unload` event
   */
  onUnload() {
    this.newsletter.removeEventListener('submit', this.newsletterSubmit);
  }
}

const newsletterSection = {
  onLoad() {
    sections[this.id] = [];
    const newsletters = this.container.querySelectorAll(selectors.newsletterForm);
    newsletters.forEach((form) => {
      sections[this.id].push(new Newsletter(form));
    });
  },
  onUnload() {
    sections[this.id].forEach((form) => {
      if (typeof form.onUnload === 'function') {
        form.onUnload();
      }
    });
  },
};

export {newsletterSection};
