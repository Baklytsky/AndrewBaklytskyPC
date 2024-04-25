const classes = {
  noOutline: 'no-outline',
};

const selectors = {
  inPageLink: '[data-skip-content]',
  linkesWithOnlyHash: 'a[href="#"]',
};

class Accessibility {
  constructor() {
    this.init();
  }

  init() {
    // this.a11y = a11y;

    // DOM Elements
    this.body = document.body;
    this.inPageLink = document.querySelector(selectors.inPageLink);
    this.linkesWithOnlyHash = document.querySelectorAll(selectors.linkesWithOnlyHash);

    // Flags
    this.isFocused = false;

    // A11Y init methods
    this.focusHash();
    this.bindInPageLinks();

    // Events
    this.clickEvents();
    this.focusEvents();
    this.focusEventsOff();
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
    document.addEventListener('keyup', (event) => {
      if (event.code !== theme.keyboardKeys.TAB) {
        return;
      }

      this.body.classList.remove(classes.noOutline);
      this.isFocused = true;
    });
  }

  /**
   * Focus events off
   *
   * @return  {Void}
   */

  focusEventsOff() {
    document.addEventListener('mousedown', () => {
      this.body.classList.add(classes.noOutline);
      this.isFocused = false;
    });
  }

  /**
   * Moves focus to an HTML element
   * eg for In-page links, after scroll, focus shifts to content area so that
   * next `tab` is where user expects. Used in bindInPageLinks()
   * eg move focus to a modal that is opened. Used in trapFocus()
   *
   * @param {Element} container - Container DOM element to trap focus inside of
   * @param {Object} options - Settings unique to your theme
   * @param {string} options.className - Class name to apply to element on focus.
   */

  forceFocus(element, options) {
    options = options || {};

    var savedTabIndex = element.tabIndex;

    element.tabIndex = -1;
    element.dataset.tabIndex = savedTabIndex;
    element.focus();
    if (typeof options.className !== 'undefined') {
      element.classList.add(options.className);
    }
    element.addEventListener('blur', callback);

    function callback(event) {
      event.target.removeEventListener(event.type, callback);

      element.tabIndex = savedTabIndex;
      delete element.dataset.tabIndex;
      if (typeof options.className !== 'undefined') {
        element.classList.remove(options.className);
      }
    }
  }

  /**
   * If there's a hash in the url, focus the appropriate element
   * This compensates for older browsers that do not move keyboard focus to anchor links.
   * Recommendation: To be called once the page in loaded.
   *
   * @param {Object} options - Settings unique to your theme
   * @param {string} options.className - Class name to apply to element on focus.
   * @param {string} options.ignore - Selector for elements to not include.
   */

  focusHash(options) {
    options = options || {};
    let hash = window.location.hash;

    if (typeof theme.settings.newHash !== 'undefined') {
      hash = theme.settings.newHash;
      window.location.hash = `#${hash}`;
    }
    const element = document.getElementById(hash.slice(1));

    // if we are to ignore this element, early return
    if (element && options.ignore && element.matches(options.ignore)) {
      return false;
    }

    if (hash && element) {
      this.forceFocus(element, options);
    }
  }

  /**
   * When an in-page (url w/hash) link is clicked, focus the appropriate element
   * This compensates for older browsers that do not move keyboard focus to anchor links.
   * Recommendation: To be called once the page in loaded.
   *
   * @param {Object} options - Settings unique to your theme
   * @param {string} options.className - Class name to apply to element on focus.
   * @param {string} options.ignore - CSS selector for elements to not include.
   */

  bindInPageLinks(options) {
    options = options || {};
    const links = Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]'));

    function queryCheck(selector) {
      return document.getElementById(selector) !== null;
    }

    return links.filter((link) => {
      if (link.hash === '#' || link.hash === '') {
        return false;
      }

      if (options.ignore && link.matches(options.ignore)) {
        return false;
      }

      if (!queryCheck(link.hash.substr(1))) {
        return false;
      }

      var element = document.querySelector(link.hash);

      if (!element) {
        return false;
      }

      link.addEventListener('click', () => {
        this.forceFocus(element, options);
      });

      return true;
    });
  }
}

export default Accessibility;
