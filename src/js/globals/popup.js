const selectors = {
  open: '[data-popup-open]',
  close: '[data-popup-close]',
  dialog: 'dialog',
  focusable: 'button, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
};

const attributes = {
  closing: 'closing',
  scrollLock: 'data-scroll-lock-required',
};

const classes = {
  hidden: 'hidden',
};

class PopupComponent extends HTMLElement {
  constructor() {
    super();

    this.popup = this.querySelector(selectors.dialog);
    this.enableScrollLock = this.popup.hasAttribute(attributes.scrollLock);
    this.buttonPopupOpen = this.querySelector(selectors.open);
    this.a11y = window.theme.a11y;
    this.isAnimating = false;

    this.bindListeners();
  }

  bindListeners() {
    // Open button click event
    this.buttonPopupOpen?.addEventListener('click', (e) => {
      e.preventDefault();
      this.popupOpen();
      window.theme.a11y.lastElement = this.buttonPopupOpen;
    });

    // Close button click event
    this.popup.querySelectorAll(selectors.close)?.forEach((closeButton) => {
      closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.popupClose();
      });
    });

    // Close dialog on click outside content
    this.popup.addEventListener('click', (event) => {
      if (event.target.nodeName === 'DIALOG' && event.type === 'click') {
        this.popupClose();
      }
    });

    // Close dialog on click ESC key pressed
    this.popup.addEventListener('keydown', (event) => {
      if (event.code === 'Escape') {
        event.preventDefault();
        this.popupClose();
      }
    });

    this.popup.addEventListener('close', () => this.popupCloseActions());
  }

  popupOpen() {
    this.isAnimating = true;

    // Check if browser supports Dialog tags
    if (typeof this.popup.showModal === 'function') {
      this.popup.showModal();
    } else if (typeof this.popup.show === 'function') {
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

    window.theme.waitForAnimationEnd(this.popup).then(() => {
      this.isAnimating = false;

      if (this.enableScrollLock) {
        this.a11y.trapFocus(this.popup);
      }

      const focusTarget = this.popup.querySelector('[autofocus]') || this.popup.querySelector(selectors.focusable);
      focusTarget?.focus();
    });
  }

  popupClose() {
    if (this.isAnimating || this.popup.hasAttribute('inert')) {
      return;
    }

    if (!this.popup.hasAttribute(attributes.closing)) {
      this.popup.setAttribute(attributes.closing, '');
      this.isAnimating = true;

      window.theme.waitForAnimationEnd(this.popup).then(() => {
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
    if (!window.theme.hasOpenModals() && this.enableScrollLock) {
      document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
    }

    this.popup.dispatchEvent(new CustomEvent('theme:popup:onclose', {bubbles: false}));

    if (this.enableScrollLock) {
      this.a11y.removeTrapFocus();
      this.a11y.autoFocusLastElement();
    }
  }

  showPopupEvents() {
    // Auto show popup if it has open attribute
    if (this.popup.hasAttribute('open') && this.popup.getAttribute('open') == true) {
      this.popupOpen();
    }
  }
}

if (!customElements.get('popup-component')) {
  customElements.define('popup-component', PopupComponent);
}
