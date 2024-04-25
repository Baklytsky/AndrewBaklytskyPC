const a11y = {
  /**
   * A11y Helpers
   * -----------------------------------------------------------------------------
   * A collection of useful functions that help make your theme more accessible
   */

  state: {
    firstFocusable: null,
    lastFocusable: null,
    trigger: null,
  },

  trapFocus: function (options) {
    var focusableElements = Array.from(options.container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex^="-"])')).filter(function (element) {
      var width = element.offsetWidth;
      var height = element.offsetHeight;

      return width !== 0 && height !== 0 && getComputedStyle(element).getPropertyValue('display') !== 'none';
    });

    focusableElements = focusableElements.filter(function (element) {
      return !element.classList.contains('deferred-media__poster');
    });

    this.state.firstFocusable = focusableElements[0];
    this.state.lastFocusable = focusableElements[focusableElements.length - 1];

    if (!options.elementToFocus) {
      options.elementToFocus = this.state.firstFocusable || options.container;
    }
    this._setupHandlers();

    document.addEventListener('focusin', this._onFocusInHandler);
    document.addEventListener('focusout', this._onFocusOutHandler);

    options.container.setAttribute('tabindex', '-1');
    options.elementToFocus.focus();
  },

  removeTrapFocus: function (options) {
    const focusVisible = !document.body.classList.contains('no-outline');
    if (options && options.container) {
      options.container.removeAttribute('tabindex');
    }
    document.removeEventListener('focusin', this._onFocusInHandler);

    if (this.state.trigger && focusVisible) {
      this.state.trigger.focus();
    }
  },

  _manageFocus: function (evt) {
    if (evt.code !== theme.keyboardKeys.TAB) {
      return;
    }

    /**
     * On the last focusable element and tab forward,
     * focus the first element.
     */
    if (evt.target === this.state.lastFocusable && !evt.shiftKey) {
      evt.preventDefault();
      this.state.firstFocusable.focus();
    }

    /**
     * On the first focusable element and tab backward,
     * focus the last element.
     */
    if (evt.target === this.state.firstFocusable && evt.shiftKey) {
      evt.preventDefault();
      this.state.lastFocusable.focus();
    }
  },

  _onFocusOut: function () {
    document.removeEventListener('keydown', this._manageFocusHandler);
  },

  _onFocusIn: function (evt) {
    if (evt.target !== this.state.lastFocusable && evt.target !== this.state.firstFocusable) {
      return;
    }

    document.addEventListener('keydown', this._manageFocusHandler);
  },

  _setupHandlers: function () {
    if (!this._onFocusInHandler) {
      this._onFocusInHandler = this._onFocusIn.bind(this);
    }

    if (!this._onFocusOutHandler) {
      this._onFocusOutHandler = this._onFocusIn.bind(this);
    }

    if (!this._manageFocusHandler) {
      this._manageFocusHandler = this._manageFocus.bind(this);
    }
  },
};

export {a11y};
