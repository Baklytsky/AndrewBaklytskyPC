const selectors = {
  form: '[data-newsletter-form]',
  heading: '[data-newsletter-heading]',
};

const classes = {
  success: 'has-success',
  error: 'has-error',
  hidden: 'hidden',
};

const attributes = {
  cookieNameAttribute: 'data-cookie-name',
};

if (!customElements.get('newsletter-component')) {
  customElements.define(
    'newsletter-component',
    class NewsletterComponent extends HTMLElement {
      constructor() {
        super();

        this.newsletter = this.querySelector(selectors.form);
        this.sessionStorage = window.sessionStorage;
        this.stopSubmit = true;
        this.formID = null;
      }

      connectedCallback() {
        if (window.location.pathname === '/challenge') {
          return;
        }

        this.newsletterSubmit = (e) => this.newsletterSubmitEvent(e);
        this.newsletter.addEventListener('submit', this.newsletterSubmit);
        this.showMessage();
      }

      newsletterSubmitEvent(e) {
        if (this.stopSubmit) {
          e.preventDefault();
          e.stopImmediatePropagation();

          this.removeStorage();
          this.writeStorage();
          this.stopSubmit = false;
          this.newsletter.submit();
        }
      }

      writeStorage() {
        if (this.sessionStorage !== undefined) {
          this.sessionStorage.setItem('newsletter_form_id', this.newsletter.id);
        }
      }

      readStorage() {
        this.formID = this.sessionStorage.getItem('newsletter_form_id');
      }

      removeStorage() {
        this.sessionStorage.removeItem('newsletter_form_id');
      }

      showMessage() {
        this.readStorage();

        if (this.newsletter.id === this.formID) {
          const newsletter = document.getElementById(this.formID);
          const heading = newsletter.parentElement.querySelector(selectors.heading);
          const submissionSuccess = window.location.search.indexOf('?customer_posted=true') !== -1;
          const submissionFailure = window.location.search.indexOf('accepts_marketing') !== -1;

          if (submissionSuccess) {
            newsletter.classList.remove(classes.error);
            newsletter.classList.add(classes.success);

            if (heading) {
              heading.classList.add(classes.hidden);
              newsletter.classList.remove(classes.hidden);
            }
          } else if (submissionFailure) {
            newsletter.classList.remove(classes.success);
            newsletter.classList.add(classes.error);

            if (heading) {
              heading.classList.add(classes.hidden);
              newsletter.classList.remove(classes.hidden);
            }
          }

          if (submissionSuccess || submissionFailure) {
            window.addEventListener('load', () => {
              this.scrollToForm(newsletter);
            });
          }
        }
      }

      scrollToForm(newsletter) {
        const rect = newsletter.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.theme.getWindowHeight() && rect.right <= window.theme.getWindowWidth();

        if (!isVisible) {
          setTimeout(() => {
            window.theme.scrollTo(newsletter.getBoundingClientRect().top);
          }, 500);
        }
      }
    }
  );
}
