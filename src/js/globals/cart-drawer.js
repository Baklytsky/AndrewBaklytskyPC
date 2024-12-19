import * as a11y from '../vendor/theme-scripts/theme-a11y';
import appendCartItems from '../globals/append-cart-items';

const classes = {
  open: 'is-open',
  closing: 'is-closing',
  duplicate: 'drawer--duplicate',
  drawerEditorError: 'drawer-editor-error',
};

const selectors = {
  cartDrawer: 'cart-drawer',
  cartDrawerClose: '[data-cart-drawer-close]',
  cartDrawerSection: '[data-section-type="cart-drawer"]',
  cartDrawerInner: '[data-cart-drawer-inner]',
  shopifySection: '.shopify-section',
};

const attributes = {
  drawerUnderlay: 'data-drawer-underlay',
};

class CartDrawer extends HTMLElement {
  constructor() {
    super();

    this.cartDrawerIsOpen = false;

    this.cartDrawerClose = this.querySelector(selectors.cartDrawerClose);
    this.cartDrawerInner = this.querySelector(selectors.cartDrawerInner);
    this.openCartDrawer = this.openCartDrawer.bind(this);
    this.closeCartDrawer = this.closeCartDrawer.bind(this);
    this.toggleCartDrawer = this.toggleCartDrawer.bind(this);
    this.openCartDrawerOnProductAdded = this.openCartDrawerOnProductAdded.bind(this);
    this.openCartDrawerOnSelect = this.openCartDrawerOnSelect.bind(this);
    this.closeCartDrawerOnDeselect = this.closeCartDrawerOnDeselect.bind(this);
    this.cartDrawerSection = this.closest(selectors.shopifySection);

    this.closeCartEvents();
  }

  connectedCallback() {
    const drawerSection = this.closest(selectors.shopifySection);

    /* Prevent duplicated cart drawers */
    if (window.theme.hasCartDrawer) {
      if (!window.Shopify.designMode) {
        drawerSection.remove();
        return;
      } else {
        const errorMessage = document.createElement('div');
        errorMessage.classList.add(classes.drawerEditorError);
        errorMessage.innerText = 'Cart drawer section already exists.';

        if (!this.querySelector(`.${classes.drawerEditorError}`)) {
          this.querySelector(selectors.cartDrawerInner).append(errorMessage);
        }

        this.classList.add(classes.duplicate);
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

    if (document.querySelectorAll(selectors.cartDrawer).length <= 1) {
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
    const cartDrawerSection = e.target.querySelector(selectors.shopifySection) || e.target.closest(selectors.shopifySection) || e.target;

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
    if (!forceOpen && this.classList.contains(classes.duplicate)) return;

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

    this.classList.add(classes.open);

    // Observe Additional Checkout Buttons
    this.observeAdditionalCheckoutButtons();

    window.theme.waitForAnimationEnd(this.cartDrawerInner).then(() => {
      a11y.trapFocus(this, {
        elementToFocus: this.querySelector(selectors.cartDrawerClose),
      });
    });
  }

  /**
   * Close cart drawer and remove class on body
   *
   * @return  {Void}
   */

  closeCartDrawer() {
    if (!this.classList.contains(classes.open)) return;

    this.classList.add(classes.closing);
    this.classList.remove(classes.open);

    this.cartDrawerIsOpen = false;

    document.dispatchEvent(
      new CustomEvent('theme:cart-drawer:close', {
        bubbles: true,
      })
    );

    a11y.removeTrapFocus();
    a11y.autoFocusLastElement();

    document.body.removeEventListener('click', this.onBodyClickEvent);
    document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));

    window.theme.waitForAnimationEnd(this.cartDrawerInner).then(() => {
      this.classList.remove(classes.closing);
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
    if (e.target.hasAttribute(attributes.drawerUnderlay)) this.closeCartDrawer();
  }

  observeAdditionalCheckoutButtons() {
    // identify an element to observe
    const additionalCheckoutButtons = this.querySelector(selectors.additionalCheckoutButtons);
    if (additionalCheckoutButtons) {
      // create a new instance of `MutationObserver` named `observer`,
      // passing it a callback function
      const observer = new MutationObserver(() => {
        a11y.trapFocus(this, {
          elementToFocus: this.querySelector(selectors.cartDrawerClose),
        });
        observer.disconnect();
      });

      // call `observe()` on that MutationObserver instance,
      // passing it the element to observe, and the options object
      observer.observe(additionalCheckoutButtons, {subtree: true, childList: true});
    }
  }
}

if (!customElements.get('cart-drawer')) {
  customElements.define('cart-drawer', CartDrawer);
}
