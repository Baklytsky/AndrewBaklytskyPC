import appendCartItems from '../globals/append-cart-items';

if (!customElements.get('cart-drawer')) {
  customElements.define(
    'cart-drawer',

    class CartDrawer extends HTMLElement {
      constructor() {
        super();

        this.cartDrawerIsOpen = false;

        this.cartDrawerClose = this.querySelector('[data-cart-drawer-close]');
        this.cartDrawerInner = this.querySelector('[data-cart-drawer-inner]');
        this.openCartDrawer = this.openCartDrawer.bind(this);
        this.closeCartDrawer = this.closeCartDrawer.bind(this);
        this.toggleCartDrawer = this.toggleCartDrawer.bind(this);
        this.openCartDrawerOnProductAdded = this.openCartDrawerOnProductAdded.bind(this);
        this.openCartDrawerOnSelect = this.openCartDrawerOnSelect.bind(this);
        this.closeCartDrawerOnDeselect = this.closeCartDrawerOnDeselect.bind(this);
        this.cartDrawerSection = this.closest('.shopify-section');
        this.a11y = window.theme.a11y;

        this.closeCartEvents();
      }

      connectedCallback() {
        const drawerSection = this.closest('.shopify-section');

        /* Prevent duplicated cart drawers */
        if (window.theme.hasCartDrawer) {
          if (!window.Shopify.designMode) {
            drawerSection.remove();
            return;
          } else {
            const errorMessage = document.createElement('div');
            errorMessage.classList.add('drawer-editor-error');
            errorMessage.innerText = 'Cart drawer section already exists.';

            if (!this.querySelector(`.${'drawer-editor-error'}`)) {
              this.querySelector('[data-cart-drawer-inner]').append(errorMessage);
            }

            this.classList.add('drawer--duplicate');
          }
        }

        window.theme.hasCartDrawer = true;

        this.addEventListener('theme:cart-drawer:show', this.openCartDrawer);
        document.addEventListener('theme:cart:toggle', this.toggleCartDrawer);
        document.addEventListener('theme:quick-add:open', this.closeCartDrawer);
        document.addEventListener('theme:product:added', this.openCartDrawerOnProductAdded);
        document.addEventListener('shopify:block:select', this.openCartDrawerOnSelect);
        document.addEventListener('shopify:section:select', this.openCartDrawerOnSelect);
        document.addEventListener('shopify:section:deselect', this.closeCartDrawerOnDeselect);
      }

      disconnectedCallback() {
        document.removeEventListener('theme:product:added', this.openCartDrawerOnProductAdded);
        document.removeEventListener('theme:cart:toggle', this.toggleCartDrawer);
        document.removeEventListener('theme:quick-add:open', this.closeCartDrawer);
        document.removeEventListener('shopify:block:select', this.openCartDrawerOnSelect);
        document.removeEventListener('shopify:section:select', this.openCartDrawerOnSelect);
        document.removeEventListener('shopify:section:deselect', this.closeCartDrawerOnDeselect);

        if (document.querySelectorAll('cart-drawer').length <= 1) {
          window.theme.hasCartDrawer = false;
        }

        appendCartItems();
      }

      /**
       * Open cart drawer when product is added to cart
       *
       * @return  {Void}
       */
      openCartDrawerOnProductAdded() {
        if (theme.settings.cartType !== 'drawer') return;
        if (!this.cartDrawerIsOpen) {
          this.openCartDrawer();
        }
      }

      /**
       * Open cart drawer on block or section select
       *
       * @return  {Void}
       */
      openCartDrawerOnSelect(e) {
        const cartDrawerSection = e.target.querySelector('.shopify-section') || e.target.closest('.shopify-section') || e.target;

        if (cartDrawerSection === this.cartDrawerSection) {
          this.openCartDrawer(true);
        }
      }

      /**
       * Close cart drawer on section deselect
       *
       * @return  {Void}
       */
      closeCartDrawerOnDeselect() {
        if (this.cartDrawerIsOpen) {
          this.closeCartDrawer();
        }
      }

      /**
       * Open cart drawer and add class on body
       *
       * @return  {Void}
       */

      openCartDrawer(forceOpen = false) {
        if (!forceOpen && this.classList.contains('drawer--duplicate')) return;

        this.cartDrawerIsOpen = true;
        this.onBodyClickEvent = this.onBodyClickEvent || this.onBodyClick.bind(this);
        document.body.addEventListener('click', this.onBodyClickEvent);

        document.dispatchEvent(
          new CustomEvent('theme:cart-drawer:open', {
            detail: {
              target: this,
            },
            bubbles: true,
          })
        );
        document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));

        this.classList.add('is-open');

        // Load images instantly when open Cart drawer
        for (const img of this.querySelectorAll('img[loading="lazy"]')) img.removeAttribute('loading');

        // Observe Additional Checkout Buttons
        this.observeAdditionalCheckoutButtons();

        window.theme.waitForAnimationEnd(this.cartDrawerInner).then(() => {
          this.a11y.trapFocus(this, {
            elementToFocus: this.querySelector('[data-cart-drawer-close]'),
          });
        });
      }

      /**
       * Close cart drawer and remove class on body
       *
       * @return  {Void}
       */

      closeCartDrawer() {
        if (!this.classList.contains('is-open')) return;

        this.classList.add('is-closing');
        this.classList.remove('is-open');

        this.cartDrawerIsOpen = false;

        document.dispatchEvent(
          new CustomEvent('theme:cart-drawer:close', {
            bubbles: true,
          })
        );

        this.a11y.removeTrapFocus();
        this.a11y.autoFocusLastElement();

        document.body.removeEventListener('click', this.onBodyClickEvent);
        document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));

        window.theme.waitForAnimationEnd(this.cartDrawerInner).then(() => {
          this.classList.remove('is-closing');
        });
      }

      /**
       * Toggle cart drawer
       *
       * @return  {Void}
       */

      toggleCartDrawer() {
        if (!this.cartDrawerIsOpen) {
          this.openCartDrawer();
        } else {
          this.closeCartDrawer();
        }
      }

      /**
       * Event click to element to close cart drawer
       *
       * @return  {Void}
       */

      closeCartEvents() {
        this.cartDrawerClose.addEventListener('click', (e) => {
          e.preventDefault();
          this.closeCartDrawer();
        });

        this.addEventListener('keyup', (e) => {
          if (e.code === 'Escape') {
            this.closeCartDrawer();
          }
        });
      }

      onBodyClick(e) {
        if (e.target.hasAttribute('data-drawer-underlay')) this.closeCartDrawer();
      }

      observeAdditionalCheckoutButtons() {
        // identify an element to observe
        const additionalCheckoutButtons = this.querySelector('.additional-checkout-buttons');
        if (additionalCheckoutButtons) {
          // create a new instance of `MutationObserver` named `observer`,
          // passing it a callback function
          const observer = new MutationObserver(() => {
            this.a11y.trapFocus(this, {
              elementToFocus: this.querySelector('[data-cart-drawer-close]'),
            });
            observer.disconnect();
          });

          // call `observe()` on that MutationObserver instance,
          // passing it the element to observe, and the options object
          observer.observe(additionalCheckoutButtons, {subtree: true, childList: true});
        }
      }
    }
  );
}
