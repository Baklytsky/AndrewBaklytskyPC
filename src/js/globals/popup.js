import {PopupCookie} from './popup-cookie';

const selectors = {
  open: '[data-popup-open]',
  close: '[data-popup-close]',
  dialog: 'dialog',
  focusable: 'button, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
};

const attributes = {
  closing: 'closing',
  delay: 'data-popup-delay',
  scrollLock: 'data-scroll-lock-required',
  cookieValue: 'data-cookie-value',
};

if (!customElements.get('popup-component')) {
  customElements.define(
    'popup-component',
    class PopupComponent extends HTMLElement {
      constructor() {
        super();

        this.popup = this.querySelector(selectors.dialog);
        this.enableScrollLock = this.popup.hasAttribute(attributes.scrollLock);
        this.buttonPopupOpen = this.querySelector(selectors.open);
      }

      connectedCallback() {
        this.a11y = window.theme.a11y;
        this.isAnimating = false;

        this.cookie = new PopupCookie(this.popup.getAttribute(selectors.cookieNameAttribute), this.popup.getAttribute(selectors.cookieValue));

        this.checkTargetReferrer();
        this.checkCookie();

        this.bindListeners();
      }

      checkTargetReferrer() {
        if (!this.popup.hasAttribute(attributes.referrer)) return;

        if (location.href.indexOf(this.popup.getAttribute(attributes.referrer)) === -1 && !window.Shopify.designMode) {
          this.popup.parentNode.removeChild(this.popup);
        }
      }

      checkCookie() {
        const cookieExists = this.cookie.read() !== false;

        if (!cookieExists || window.Shopify.designMode) {
          if (!window.Shopify.designMode) {
            this.popupOpen();
          } else {
            this.showPopupEvents();
          }

          this.popup.addEventListener('theme:popup:onclose', () => this.cookie.write());
        }
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

        this.delay = this.popup.hasAttribute(attributes.delay) ? this.popup.getAttribute(attributes.delay) : 'always';
        this.isSubmitted = window.location.href.indexOf('accepts_marketing') !== -1 || window.location.href.indexOf('customer_posted=true') !== -1;
        this.showOnScrollEvent = () => this.showOnScroll();

        if (this.delay === 'always' || this.isSubmitted) {
          this.popupOpen();
        }

        if (this.delay && this.delay.includes('delayed') && !this.isSubmitted) {
          const seconds = this.delay.includes('_') ? parseInt(this.delay.split('_')[1]) : 10;
          this.showDelayed(seconds);
        }

        if (this.delay === 'bottom' && !this.isSubmitted) {
          this.showOnBottomReached();
        }

        if (this.delay === 'idle' && !this.isSubmitted) {
          this.showOnIdle();
        }
      }

      showDelayed(seconds = 10) {
        // Show popup after specific seconds
        setTimeout(() => {
          this.popupOpen();
        }, seconds * 1000);
      }

      showOnIdle() {
        let timer = 0;
        let idleTime = 60000;
        const documentEvents = ['mousemove', 'mousedown', 'click', 'touchmove', 'touchstart', 'touchend', 'keydown', 'keypress'];
        const windowEvents = ['load', 'resize', 'scroll'];

        const startTimer = () => {
          timer = setTimeout(() => {
            timer = 0;
            this.popupOpen();
          }, idleTime);

          documentEvents.forEach((eventType) => {
            document.addEventListener(eventType, resetTimer);
          });

          windowEvents.forEach((eventType) => {
            window.addEventListener(eventType, resetTimer);
          });
        };

        const resetTimer = () => {
          if (timer) {
            clearTimeout(timer);
          }

          documentEvents.forEach((eventType) => {
            document.removeEventListener(eventType, resetTimer);
          });

          windowEvents.forEach((eventType) => {
            window.removeEventListener(eventType, resetTimer);
          });

          startTimer();
        };

        startTimer();
      }

      showOnBottomReached() {
        document.addEventListener('theme:scroll', this.showOnScrollEvent);
      }

      showOnScroll() {
        if (window.scrollY + window.innerHeight >= document.body.clientHeight) {
          this.popupOpen();
          document.removeEventListener('theme:scroll', this.showOnScrollEvent);
        }
      }

      disconnectedCallback() {
        document.removeEventListener('theme:scroll', this.showOnScrollEvent);
      }
    }
  );
}
