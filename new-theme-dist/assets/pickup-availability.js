(function () {
  'use strict';

  function FetchError(object) {
    this.status = object.status || null;
    this.headers = object.headers || null;
    this.json = object.json || null;
    this.body = object.body || null;
  }
  FetchError.prototype = Error.prototype;

  function isVisible(el) {
    var style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  /**
   * A11y Helpers
   * -----------------------------------------------------------------------------
   * A collection of useful functions that help make your theme more accessible
   */

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
  function forceFocus(element, options) {
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

  function focusHash(options) {
    options = options || {};
    var hash = window.location.hash;
    var element = document.getElementById(hash.slice(1));

    // if we are to ignore this element, early return
    if (element && options.ignore && element.matches(options.ignore)) {
      return false;
    }

    if (hash && element) {
      forceFocus(element, options);
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

  function bindInPageLinks(options) {
    options = options || {};
    var links = Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]'));

    function queryCheck(selector) {
      return document.getElementById(selector) !== null;
    }

    return links.filter(function (link) {
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

      link.addEventListener('click', function () {
        forceFocus(element, options);
      });

      return true;
    });
  }

  function focusable(container) {
    var elements = Array.prototype.slice.call(
      container.querySelectorAll('[tabindex],' + '[draggable],' + 'a[href],' + 'area,' + 'button:enabled,' + 'input:not([type=hidden]):enabled,' + 'object,' + 'select:enabled,' + 'textarea:enabled')
    );

    // Filter out elements that are not visible.
    // Copied from jQuery https://github.com/jquery/jquery/blob/2d4f53416e5f74fa98e0c1d66b6f3c285a12f0ce/src/css/hiddenVisibleSelectors.js
    return elements.filter(function (element) {
      return !!((element.offsetWidth || element.offsetHeight || element.getClientRects().length) && isVisible(element));
    });
  }

  /**
   * Traps the focus in a particular container
   *
   * @param {Element} container - Container DOM element to trap focus inside of
   * @param {Element} elementToFocus - Element to be focused on first
   * @param {Object} options - Settings unique to your theme
   * @param {string} options.className - Class name to apply to element on focus.
   */

  var trapFocusHandlers = {};

  function trapFocus(container, options) {
    options = options || {};
    var elements = focusable(container);
    var elementToFocus = options.elementToFocus || container;
    var first = elements[0];
    var last = elements[elements.length - 1];

    removeTrapFocus();

    trapFocusHandlers.focusin = function (event) {
      if (container !== event.target && !container.contains(event.target) && first && first === event.target) {
        first.focus();
      }

      if (event.target !== container && event.target !== last && event.target !== first) return;
      document.addEventListener('keydown', trapFocusHandlers.keydown);
    };

    trapFocusHandlers.focusout = function () {
      document.removeEventListener('keydown', trapFocusHandlers.keydown);
    };

    trapFocusHandlers.keydown = function (event) {
      if (event.code !== 'Tab') return; // If not TAB key

      // On the last focusable element and tab forward, focus the first element.
      if (event.target === last && !event.shiftKey) {
        event.preventDefault();
        first.focus();
      }

      //  On the first focusable element and tab backward, focus the last element.
      if ((event.target === container || event.target === first) && event.shiftKey) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener('focusout', trapFocusHandlers.focusout);
    document.addEventListener('focusin', trapFocusHandlers.focusin);

    forceFocus(elementToFocus, options);
  }

  /**
   * Removes the trap of focus from the page
   */
  function removeTrapFocus() {
    document.removeEventListener('focusin', trapFocusHandlers.focusin);
    document.removeEventListener('focusout', trapFocusHandlers.focusout);
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  }

  /**
   * Auto focus the last element
   */
  function autoFocusLastElement() {
    if (window.a11y.lastElement && document.body.classList.contains('is-focused')) {
      setTimeout(() => {
        window.a11y.lastElement?.focus();
      });
    }
  }

  /**
   * Add a preventive message to external links and links that open to a new window.
   * @param {string} elements - Specific elements to be targeted
   * @param {object} options.messages - Custom messages to overwrite with keys: newWindow, external, newWindowExternal
   * @param {string} options.messages.newWindow - When the link opens in a new window (e.g. target="_blank")
   * @param {string} options.messages.external - When the link is to a different host domain.
   * @param {string} options.messages.newWindowExternal - When the link is to a different host domain and opens in a new window.
   * @param {object} options.prefix - Prefix to namespace "id" of the messages
   */
  function accessibleLinks(elements, options) {
    if (typeof elements !== 'string') {
      throw new TypeError(elements + ' is not a String.');
    }

    elements = document.querySelectorAll(elements);

    if (elements.length === 0) {
      return;
    }

    options = options || {};
    options.messages = options.messages || {};

    var messages = {
      newWindow: options.messages.newWindow || 'Opens in a new window.',
      external: options.messages.external || 'Opens external website.',
      newWindowExternal: options.messages.newWindowExternal || 'Opens external website in a new window.',
    };

    var prefix = options.prefix || 'a11y';

    var messageSelectors = {
      newWindow: prefix + '-new-window-message',
      external: prefix + '-external-message',
      newWindowExternal: prefix + '-new-window-external-message',
    };

    function generateHTML(messages) {
      var container = document.createElement('ul');
      var htmlMessages = Object.keys(messages).reduce(function (html, key) {
        return (html += '<li id=' + messageSelectors[key] + '>' + messages[key] + '</li>');
      }, '');

      container.setAttribute('hidden', true);
      container.innerHTML = htmlMessages;

      document.body.appendChild(container);
    }

    function externalSite(link) {
      return link.hostname !== window.location.hostname;
    }

    elements.forEach(function (link) {
      var target = link.getAttribute('target');
      var rel = link.getAttribute('rel');
      var isExternal = externalSite(link);
      var isTargetBlank = target === '_blank';
      var missingRelNoopener = rel === null || rel.indexOf('noopener') === -1;

      if (isTargetBlank && missingRelNoopener) {
        var relValue = rel === null ? 'noopener' : rel + ' noopener';
        link.setAttribute('rel', relValue);
      }

      if (isExternal && isTargetBlank) {
        link.setAttribute('aria-describedby', messageSelectors.newWindowExternal);
      } else if (isExternal) {
        link.setAttribute('aria-describedby', messageSelectors.external);
      } else if (isTargetBlank) {
        link.setAttribute('aria-describedby', messageSelectors.newWindow);
      }
    });

    generateHTML(messages);
  }

  var a11y = /*#__PURE__*/Object.freeze({
    __proto__: null,
    forceFocus: forceFocus,
    focusHash: focusHash,
    bindInPageLinks: bindInPageLinks,
    focusable: focusable,
    trapFocus: trapFocus,
    removeTrapFocus: removeTrapFocus,
    autoFocusLastElement: autoFocusLastElement,
    accessibleLinks: accessibleLinks
  });

  /*
    Observe whether or not there are open modals that require scroll lock
  */

  function hasOpenModals() {
    const openModals = Boolean(document.querySelectorAll('dialog[open][data-scroll-lock-required]').length);
    const openDrawers = Boolean(document.querySelectorAll('.drawer.is-open').length);

    return openModals || openDrawers;
  }

  /*
    Trigger event after animation completes
  */
  function waitForAnimationEnd(element) {
    return new Promise((resolve) => {
      function onAnimationEnd(event) {
        if (event.target != element) return;

        element.removeEventListener('animationend', onAnimationEnd);
        resolve();
      }

      element?.addEventListener('animationend', onAnimationEnd);
    });
  }

  const selectors$1 = {
    open: '[data-popup-open]',
    close: '[data-popup-close]',
    focusable: 'button, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
  };

  const attributes = {
    closing: 'closing',
  };

  class PopupActions {
    constructor(popup, holder, showModal = true, scrollLock = true) {
      this.popup = popup;
      this.holder = holder;
      this.a11y = a11y;
      this.isAnimating = false;
      this.showModal = showModal;
      this.enableScrollLock = scrollLock;
      this.buttonPopupOpen = this.holder?.querySelector(selectors$1.open);

      this.popupEvents();
    }

    popupOpen() {
      if (!this.popup) return;

      this.isAnimating = true;

      // Check if browser supports Dialog tags
      if (this.showModal && typeof this.popup.showModal === 'function') {
        this.popup.showModal();
      } else if (!this.showModal && typeof this.popup.show === 'function') {
        this.popup.show();
      } else {
        this.popup.setAttribute('open', '');
      }

      this.popup.removeAttribute('inert');
      this.popup.setAttribute('aria-hidden', false);
      this.popup.focus(); // Focus <dialog> tag element to prevent immediate closing on Escape keypress

      if (this.enableScrollLock) {
        document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
      }

      waitForAnimationEnd(this.popup).then(() => {
        this.isAnimating = false;

        if (this.enableScrollLock) {
          this.a11y.trapFocus(this.popup);
        }

        const focusTarget = this.popup.querySelector('[autofocus]') || this.popup.querySelector(selectors$1.focusable);
        focusTarget?.focus();
      });
    }

    popupClose() {
      if (this.isAnimating || !this.popup || this.popup.hasAttribute('inert')) {
        return;
      }

      if (!this.popup.hasAttribute(attributes.closing)) {
        this.popup.setAttribute(attributes.closing, '');
        this.isAnimating = true;

        waitForAnimationEnd(this.popup).then(() => {
          this.isAnimating = false;
          this.popupClose();
        });

        return;
      }

      // Check if browser supports Dialog tags
      if (typeof this.popup.close === 'function') {
        this.popup.close();
      } else {
        this.popup.removeAttribute('open');
        this.popup.setAttribute('aria-hidden', true);
      }

      this.popupCloseActions();
    }

    popupCloseActions() {
      if (this.popup.hasAttribute('inert')) return;

      this.popup.setAttribute('inert', '');
      this.popup.setAttribute('aria-hidden', true);
      this.popup.removeAttribute(attributes.closing);

      // Unlock scroll if no other popups & modals are open
      if (!hasOpenModals() && this.enableScrollLock) {
        document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
      }

      this.popup.dispatchEvent(new CustomEvent('theme:popup:onclose', {bubbles: false}));

      if (this.enableScrollLock) {
        this.a11y.removeTrapFocus();
        this.a11y.autoFocusLastElement();
      }
    }

    popupEvents() {
      if (!this.popup) return;

      // Open button click event
      this.buttonPopupOpen?.addEventListener('click', (e) => {
        e.preventDefault();
        this.popupOpen();
        window.a11y.lastElement = this.buttonPopupOpen;
      });

      // Close button click event
      const closeButtons = this.popup.querySelectorAll(selectors$1.close);
      if (closeButtons.length) {
        closeButtons.forEach((closeButton) => {
          closeButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.popupClose();
          });
        });
      }

      // Close dialog on click outside content
      if (this.showModal) {
        this.popup.addEventListener('click', (event) => {
          if (event.target.nodeName === 'DIALOG' && event.type === 'click') {
            this.popupClose();
          }
        });
      }

      // Close dialog on click ESC key pressed
      this.popup.addEventListener('keydown', (event) => {
        if (event.code === 'Escape') {
          event.preventDefault();
          this.popupClose();
        }
      });

      this.popup.addEventListener('close', () => this.popupCloseActions());
    }
  }

  const selectors = {
    pickupContainer: 'data-store-availability-container',
    shopifySection: '.shopify-section',
    drawer: '[data-pickup-drawer]',
    section: '[data-section-type]',
  };

  const classes = {
    isHidden: 'hidden',
  };

  class PickupAvailability extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.container = this.closest(selectors.section);
      this.drawer = null;
      this.container.addEventListener('theme:variant:change', (event) => this.fetchPickupAvailability(event));
      this.fetchPickupAvailability();
    }

    fetchPickupAvailability(event) {
      if ((event && !event.detail.variant) || (event && event.detail.variant && !event.detail.variant.available)) {
        this.classList.add(classes.isHidden);
        return;
      }

      const variantID = event && event.detail.variant ? event.detail.variant.id : this.getAttribute(selectors.pickupContainer);

      if (variantID) {
        this.popupActions = null;
        fetch(`${window.theme.routes.root}variants/${variantID}/?section_id=api-pickup-availability`)
          .then(this.handleErrors)
          .then((response) => response.text())
          .then((text) => {
            const pickupAvailabilityHTML = new DOMParser().parseFromString(text, 'text/html').querySelector(selectors.shopifySection).innerHTML;
            this.innerHTML = pickupAvailabilityHTML;

            this.drawer = this.querySelector(selectors.drawer);
            if (!this.drawer) {
              this.classList.add(classes.isHidden);
              return;
            }

            this.classList.remove(classes.isHidden);

            this.popupActions = new PopupActions(this.drawer, this, true, true);
          })
          .catch((e) => {
            console.error(e);
          });
      }
    }

    handleErrors(response) {
      if (!response.ok) {
        return response.json().then(function (json) {
          const e = new FetchError({
            status: response.statusText,
            headers: response.headers,
            json: json,
          });
          throw e;
        });
      }
      return response;
    }
  }

  if (!customElements.get('pickup-availability')) {
    customElements.define('pickup-availability', PickupAvailability);
  }

})();
//# sourceMappingURL=pickup-availability.js.map
