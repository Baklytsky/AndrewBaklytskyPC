class Accessibility {
  constructor() {
    this.init();
  }

  init() {
    this.a11y = window.theme.a11y;

    // DOM Elements
    this.inPageLink = document.querySelector('[data-skip-content]');
    this.linkesWithOnlyHash = document.querySelectorAll('a[href="#"]');

    // A11Y init methods
    this.a11y.focusHash();
    this.a11y.bindInPageLinks();

    // Events
    this.clickEvents();
    this.focusEvents();
  }

  /**
   * Clicked events accessibility
   *
   * @return  {Void}
   */

  clickEvents() {
    if (this.inPageLink) {
      this.inPageLink.addEventListener('click', (event) => {
        event.preventDefault();
      });
    }

    if (this.linkesWithOnlyHash) {
      this.linkesWithOnlyHash.forEach((item) => {
        item.addEventListener('click', (event) => {
          event.preventDefault();
        });
      });
    }
  }

  /**
   * Focus events
   *
   * @return  {Void}
   */

  focusEvents() {
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('is-focused');
    });

    document.addEventListener('keyup', (event) => {
      if (event.code !== 'Tab') {
        return;
      }

      document.body.classList.add('is-focused');
    });
  }
}

window.theme = window.theme || {};
window.theme.Accessibility = new Accessibility();
