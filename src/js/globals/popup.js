if (!customElements.get('popup-component')) {
  customElements.define(
    'popup-component',
    class PopupComponent extends HTMLElement {
      constructor() {
        super();

        this.a11y = window.theme.a11y;
        this.isAnimating = false;

        this.popupOpenEvent = this.popupOpen.bind(this);
        this.popupCloseEvent = this.popupClose.bind(this);
      }

      connectedCallback() {
        this.popup = this.querySelector('dialog');
        this.preventTopLayer = this.popup.hasAttribute('data-prevent-top-layer');
        this.enableScrollLock = this.popup.hasAttribute('data-scroll-lock-required');
        // Only look for button within this popup-component or with matching ID
        // Don't fallback to global query if no ID is set to avoid matching wrong buttons
        this.buttonOpen = this.querySelector('[data-popup-open]') || (this.id ? document.querySelector(`[data-popup-open="${this.id}"]`) : null);
        this.buttonPrev = this.querySelector('[data-popup-prev]');
        this.buttonNext = this.querySelector('[data-popup-next]');

        this.bindListeners();
      }

      bindListeners() {
        // Open button click event
        this.buttonOpen?.addEventListener('click', (e) => {
          e.preventDefault();
          this.popupOpen();
          window.theme.a11y.lastElement = this.buttonOpen;
        });

        this.buttonPrev?.addEventListener('click', (e) => {
          e.preventDefault();
          this.openOtherPopup(this.buttonPrev.dataset.popupPrev);
          this.popupClose();
        });

        this.buttonNext?.addEventListener('click', (e) => {
          e.preventDefault();
          this.openOtherPopup(this.buttonNext.dataset.popupNext);
          this.popupClose();
        });

        // Close button click event
        this.popup.querySelectorAll('[data-popup-close]')?.forEach((closeButton) => {
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

        if (this.buttonPrev || this.buttonNext) {
          let touchStartX = 0;
          let touchStartY = 0;
          let touchEndX = 0;
          let touchEndY = 0;
          const horizontalThreshold = 40; // px

          const onTouchStart = (e) => {
            if (!e.touches || e.touches.length === 0) return;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchEndX = touchStartX;
            touchEndY = touchStartY;
          };

          const onTouchMove = (e) => {
            if (!e.touches || e.touches.length === 0) return;
            touchEndX = e.touches[0].clientX;
            touchEndY = e.touches[0].clientY;
          };

          const onTouchEnd = () => {
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            // Only act on mostly-horizontal swipes
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > horizontalThreshold) {
              if (deltaX < 0) {
                // Swipe left -> go to next
                this.buttonNext?.dispatchEvent(new Event('click'));
              } else {
                // Swipe right -> go to prev
                this.buttonPrev?.dispatchEvent(new Event('click'));
              }
            }
          };

          // Attach to the dialog for swipe interactions
          this.popup.addEventListener('touchstart', onTouchStart, {passive: true});
          this.popup.addEventListener('touchmove', onTouchMove, {passive: true});
          this.popup.addEventListener('touchend', onTouchEnd);
        }

        this.popup.addEventListener('close', () => this.popupCloseActions());
        document.addEventListener('theme:quick-add:open', this.popupCloseEvent);
        document.addEventListener('theme:product:added', this.popupCloseEvent);
        this.addEventListener('theme:popup:open', this.popupOpenEvent);
      }

      popupOpen() {
        this.isAnimating = true;

        // Check if browser supports Dialog tags
        if (typeof this.popup.showModal === 'function' && !this.preventTopLayer) {
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

          const focusTarget = this.popup.querySelector('[autofocus]') || this.popup.querySelector('button, [href], select, textarea, [tabindex]:not([tabindex="-1"])');
          focusTarget?.focus();
        });
      }

      openOtherPopup(id) {
        const popup = document.getElementById(id);

        // Check if it's animating to prevent multiple rapid popup openings
        if (popup && !this.isAnimating) {
          popup.querySelector('[data-popup-open]')?.dispatchEvent(new Event('click'));
        }
      }

      popupClose() {
        if (this.isAnimating || this.popup.hasAttribute('inert')) {
          return;
        }

        if (!this.popup.hasAttribute('closing')) {
          this.popup.setAttribute('closing', '');
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
        this.popup.removeAttribute('closing');

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

      disconnectedCallback() {
        document.removeEventListener('theme:quick-add:open', this.popupCloseEvent);
        document.removeEventListener('theme:product:added', this.popupCloseEvent);
        this.removeEventListener('theme:popup:open', this.popupOpenEvent);
      }
    }
  );
}
