import * as a11y from '../vendor/theme-scripts/theme-a11y';
import waitForAnimationEnd from './animation-end-promise';

const selectors = {
  open: '[data-popup-open]',
  close: '[data-popup-close]',
  dialog: 'dialog',
  focusable: 'button, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
};

const attributes = {
  closing: 'closing',
};

if (!customElements.get('popup-component')) {
  customElements.define(
    'popup-component',
    class PopupComponent extends HTMLElement {
      constructor() {
        super();

        this.popup = this.querySelector(selectors.dialog);
        this.a11y = a11y;
        this.isAnimating = false;
        this.showPopup = true;
        this.enableScrollLock = true;
        this.buttonPopupOpen = this.querySelector(selectors.open);
      }

      connectedCallback() {
        if (!this.popup) return;

        if (this.popup.hasAttribute('open') && this.popup.getAttribute('open') == true) {
          this.popupOpen();
        }

        // Open button click event
        this.buttonPopupOpen?.addEventListener('click', (e) => {
          e.preventDefault();
          this.popupOpen();
          window.a11y.lastElement = this.buttonPopupOpen;
        });

        // Close button click event
        const closeButtons = this.popup.querySelectorAll(selectors.close);
        if (closeButtons.length) {
          closeButtons.forEach((closeButton) => {
            closeButton.addEventListener('click', (e) => {
              e.preventDefault();
              this.popupClose();
            });
          });
        }

        // Close dialog on click outside content
        if (this.showPopup) {
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

      popupOpen() {
        if (!this.popup) return;

        this.isAnimating = true;

        // Check if browser supports Dialog tags
        if (this.showPopup && typeof this.popup.showPopup === 'function') {
          this.popup.showPopup();
        } else if (!this.showPopup && typeof this.popup.show === 'function') {
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

          const focusTarget = this.popup.querySelector('[autofocus]') || this.popup.querySelector(selectors.focusable);
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
        if (!window.theme.hasOpenModals() && this.enableScrollLock) {
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
        }

        this.popup.dispatchEvent(new CustomEvent('theme:popup:onclose', {bubbles: false}));

        if (this.enableScrollLock) {
          this.a11y.removeTrapFocus();
          this.a11y.autoFocusLastElement();
        }
      }
    }
  );
}
