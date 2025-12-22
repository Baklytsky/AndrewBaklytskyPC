import FetchError from '../util/fetch-error';

const classes = {
  animated: 'is-animated',
  active: 'is-active',
  added: 'is-added',
  disabled: 'is-disabled',
  empty: 'is-empty',
  error: 'has-error',
  headerStuck: 'js__header__stuck',
  hidden: 'is-hidden',
  hiding: 'is-hiding',
  loading: 'is-loading',
  open: 'is-open',
  removed: 'is-removed',
  success: 'is-success',
  visible: 'is-visible',
  expanded: 'is-expanded',
  updated: 'is-updated',
  variantSoldOut: 'variant--soldout',
  variantUnavailable: 'variant--unavailable',
};

const selectors = {
  apiContent: '[data-api-content]',
  apiLineItems: '[data-api-line-items]',
  apiBundleItems: '[data-api-bundle-items]',
  apiCartPrice: '[data-api-cart-price]',
  animation: '[data-animation]',
  cartBarAdd: '[data-cart-bar-add-to-cart]',
  cartCloseError: '[data-cart-error-close]',
  cartDrawer: 'cart-drawer',
  cartDrawerClose: '[data-cart-drawer-close]',
  cartEmpty: '[data-cart-empty]',
  cartErrors: '[data-cart-errors]',
  cartItemRemove: '[data-item-remove]',
  cartPage: '[data-cart-page]',
  cartForm: '[data-cart-form]',
  cartTermsCheckbox: '[data-cart-acceptance-checkbox]',
  cartCheckoutButtonWrapper: '[data-cart-checkout-buttons]',
  cartCheckoutButton: '[data-cart-checkout-button]',
  cartTotal: '[data-cart-total]',
  checkoutButtons: '[data-checkout-buttons]',
  errorMessage: '[data-error-message]',
  formCloseError: '[data-close-error]',
  formErrorsContainer: '[data-cart-errors-container]',
  formWrapper: '[data-form-wrapper]',
  freeShipping: '[data-free-shipping]',
  headerWrapper: '[data-header-wrapper]',
  item: '[data-item]',
  itemsHolder: '[data-items-holder]',
  navDrawer: '[data-drawer]',
  outerSection: '[data-section-id]',
  priceHolder: '[data-cart-price-holder]',
  quickAddHolder: '[data-quick-add-holder]',
  quickAddModal: '[data-quick-add-modal]',
  qtyInput: 'input[name="updates[]"]',
  bundleProductsHolder: '[data-bundle-products]',
  bundleWidget: '[data-bundle-widget]',
  termsErrorMessage: '[data-terms-error-message]',
  collapsibleBody: '[data-collapsible-body]',
  discountInput: '[data-discount-input]',
  discountField: '[data-discount-field]',
  discountButton: '[data-apply-discount]',
  discountBody: '[data-discount-body]',
  discountCode: '[data-discount-code]',
  discountErrorMessage: '[data-discount-error-message]',
  removeDiscount: '[data-remove-discount]',
};

const attributes = {
  cartTotal: 'data-cart-total',
  disabled: 'disabled',
  freeShipping: 'data-free-shipping',
  freeShippingLimit: 'data-free-shipping-limit',
  item: 'data-item',
  itemIndex: 'data-item-index',
  itemTitle: 'data-item-title',
  open: 'open',
  quickAddHolder: 'data-quick-add-holder',
  quickAddVariant: 'data-quick-add-variant',
  scrollLocked: 'data-scroll-locked',
  name: 'name',
  maxInventoryReached: 'data-max-inventory-reached',
  errorMessagePosition: 'data-error-message-position',
  discountButton: 'data-cart-discount-button',
};

class CartItems extends HTMLElement {
  constructor() {
    super();

    this.a11y = window.theme.a11y;
  }

  connectedCallback() {
    // DOM Elements
    this.cartPage = document.querySelector(selectors.cartPage);
    this.cartForm = document.querySelector(selectors.cartForm);
    this.cartDrawer = document.querySelector(selectors.cartDrawer);
    this.cartEmpty = document.querySelector(selectors.cartEmpty);
    this.cartTermsCheckbox = document.querySelector(selectors.cartTermsCheckbox);
    this.cartCheckoutButtonWrapper = document.querySelector(selectors.cartCheckoutButtonWrapper);
    this.cartCheckoutButton = document.querySelector(selectors.cartCheckoutButton);
    this.checkoutButtons = document.querySelector(selectors.checkoutButtons);
    this.itemsHolder = document.querySelector(selectors.itemsHolder);
    this.priceHolder = document.querySelector(selectors.priceHolder);
    this.items = document.querySelectorAll(selectors.item);
    this.cartTotal = document.querySelector(selectors.cartTotal);
    this.freeShipping = document.querySelectorAll(selectors.freeShipping);
    this.cartErrorHolder = document.querySelector(selectors.cartErrors);
    this.cartCloseErrorMessage = document.querySelector(selectors.cartCloseError);
    this.headerWrapper = document.querySelector(selectors.headerWrapper);
    this.navDrawer = document.querySelector(selectors.navDrawer);
    this.bundleProductsHolder = document.querySelector(selectors.bundleProductsHolder);
    this.subtotal = window.theme.subtotal;
    this.discountInput = document.querySelector(selectors.discountInput);
    this.discountField = document.querySelector(selectors.discountField);
    this.discountButton = document.querySelector(selectors.discountButton);
    this.hasDiscountBlock = !!document.querySelector(selectors.discountButton);
    this.discountErrorMessage = document.querySelector(selectors.discountErrorMessage);
    this.existingDiscountCodes = [];
    this.discounts = document.querySelectorAll(selectors.discountBody);

    // Define Cart object depending on if we have cart drawer or cart page
    this.cart = this.cartDrawer || this.cartPage;

    // Discounts
    if (this.hasDiscountBlock) {
      // Fill existing discount codes and bind event listeners
      this.bindDiscountEventListeners();
    }

    // Cart events
    this.animateItems = this.animateItems.bind(this);
    this.addToCart = this.addToCart.bind(this);
    this.cartAddEvent = this.cartAddEvent.bind(this);
    this.updateProgress = this.updateProgress.bind(this);
    this.onCartDrawerClose = this.onCartDrawerClose.bind(this);
    this.onCartDrawerOpen = this.onCartDrawerOpen.bind(this);

    // Set global event listeners for "Add to cart" and Announcement bar wheel progress
    document.addEventListener('theme:cart:add', this.cartAddEvent);
    document.addEventListener('theme:announcement:init', this.updateProgress);

    if (theme.settings.cartType == 'drawer') {
      document.addEventListener('theme:cart-drawer:open', this.onCartDrawerOpen);
      document.addEventListener('theme:cart-drawer:close', this.onCartDrawerClose);
    }

    // Bundle products
    this.skipBundleProductsArray = [];
    this.skipBundleProductEvent();
    this.checkSkippedBundleProductsFromStorage();
    this.toggleCartBundleWidgetVisibility();

    // Free Shipping values
    this.circumference = 28 * Math.PI; // radius - stroke * 4 * PI
    this.freeShippingLimit = this.freeShipping.length ? Number(this.freeShipping[0].getAttribute(attributes.freeShippingLimit)) * 100 * window.Shopify.currency.rate : 0;

    const currencyRate = window.Shopify && window.Shopify.currency && window.Shopify.currency.rate ? Number(window.Shopify.currency.rate) : 1;
    const promotion1Limit = Number(this.freeShipping[0]?.getAttribute('data-free-shipping-limit'));
    const promotion2Limit = Number(this.freeShipping[0]?.getAttribute('data-promo-center-limit'));
    this.promotion1Enabled = this.freeShipping.length ? this.freeShipping[0].getAttribute('data-free-shipping-primary-promo') === 'true' : false;
    this.promotion2Enabled = this.freeShipping.length ? this.freeShipping[0].getAttribute('data-free-shipping-secondary-promo') === 'true' : false;
    const limitAttr = this.freeShipping.length ? promotion1Limit : 0;
    let centerLimitAttr = this.promotion1Enabled ? promotion2Limit : 0;
    if (!this.promotion1Enabled && this.promotion2Enabled && promotion2Limit > 0) {
      centerLimitAttr = promotion2Limit;
    }
    this.freeShippingLimit = Math.max(0, limitAttr * 100 * currencyRate);
    this.promoCenterLimit = Math.max(0, centerLimitAttr * 100 * currencyRate);

    this.freeShippingMessageHandle(this.subtotal);
    this.updateProgress();

    this.build = this.build.bind(this);
    this.updateCart = this.updateCart.bind(this);
    this.productAddCallback = this.productAddCallback.bind(this);
    this.formSubmitHandler = window.theme.throttle(this.formSubmitHandler.bind(this), 50);

    if (this.cartPage) {
      this.animateItems();
    }

    if (this.cart) {
      // Checking
      this.hasItemsInCart = this.hasItemsInCart.bind(this);
      this.cartCount = this.getCartItemCount();
    }

    // Set classes
    this.toggleClassesOnContainers = this.toggleClassesOnContainers.bind(this);

    // Flags
    this.totalItems = this.items.length;
    this.showCannotAddMoreInCart = false;
    this.cartUpdateFailed = false;
    this.discountError = false;
    this.shippingDiscountError = false;
    this.pendingDiscountCheck = null;
    this.activeDiscountFetch = null;

    // Cart Events
    this.cartEvents();
    this.cartRemoveEvents();
    this.cartUpdateEvents();

    document.addEventListener('theme:product:add', this.productAddCallback);
    document.addEventListener('theme:product:add-error', this.productAddCallback);
    document.addEventListener('theme:cart:refresh', this.getCart.bind(this));
  }

  disconnectedCallback() {
    document.removeEventListener('theme:cart:add', this.cartAddEvent);
    document.removeEventListener('theme:cart:refresh', this.cartAddEvent);
    document.removeEventListener('theme:announcement:init', this.updateProgress);
    document.removeEventListener('theme:product:add', this.productAddCallback);
    document.removeEventListener('theme:product:add-error', this.productAddCallback);

    if (document.documentElement.hasAttribute(attributes.scrollLocked)) {
      document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
    }
  }

  onCartDrawerOpen(e) {
    // Animate items
    this.animateItems(e);
  }

  onCartDrawerClose() {
    this.resetAnimatedItems();

    if (this.cartDrawer?.classList.contains(classes.open)) {
      this.cart.classList.remove(classes.updated);
    }

    this.cartEmpty.classList.remove(classes.updated);
    this.cartErrorHolder.classList.remove(classes.expanded);
    this.cart.querySelectorAll(selectors.animation).forEach((item) => {
      const removeHidingClass = () => {
        item.classList.remove(classes.hiding);
        item.removeEventListener('animationend', removeHidingClass);
      };

      item.classList.add(classes.hiding);
      item.addEventListener('animationend', removeHidingClass);
    });

    if (this.hasDiscountBlock) {
      this.clearDiscountErrors();
    }
  }

  /**
   * Cart update event hook
   *
   * @return  {Void}
   */

  cartUpdateEvents() {
    this.items = document.querySelectorAll(selectors.item);

    this.items.forEach((item) => {
      item.addEventListener('theme:cart:update', (event) => {
        this.updateCart(
          {
            id: event.detail.id,
            quantity: event.detail.quantity,
          },
          item
        );
      });
    });
  }

  /**
   * Cart events
   *
   * @return  {Void}
   */

  cartRemoveEvents() {
    const cartItemRemove = document.querySelectorAll(selectors.cartItemRemove);

    cartItemRemove?.forEach((button) => {
      const item = button.closest(selectors.item);
      button.addEventListener('click', (event) => {
        event.preventDefault();

        if (button.classList.contains(classes.disabled)) return;

        this.updateCart(
          {
            id: button.dataset.id,
            quantity: 0,
          },
          item
        );
      });
    });

    const cartBundleRemove = document.querySelectorAll('[data-bundle-cart-remove]');
    cartBundleRemove?.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();

        if (button.getAttribute('data-bundle-cart-remove') !== '') {
          const lineItemKey = button.getAttribute('data-bundle-cart-remove');
          const lineItemKeyArr = lineItemKey.split(',');

          button.closest('[data-bundle-cart-item]')?.classList.add('is-removed');

          this.removeMultipleProducts(lineItemKeyArr);
        }
      });
    });

    if (this.cartCloseErrorMessage) {
      this.cartCloseErrorMessage.addEventListener('click', (event) => {
        event.preventDefault();

        this.cartErrorHolder.classList.remove(classes.expanded);
      });
    }
  }

  /**
   * Cart event add product to cart
   *
   * @return  {Void}
   */

  cartAddEvent(event) {
    let formData = event.detail.data || '';
    let button = event.detail.button;

    if (button?.hasAttribute('disabled')) return;
    const form = button?.form || button?.closest('form');
    // Validate form

    if (form) {
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      formData = new FormData(form);

      if (form.querySelector('[type="file"]')) {
        return;
      }

      const maxInventoryReached = form.getAttribute(attributes.maxInventoryReached);
      const errorMessagePosition = form.getAttribute(attributes.errorMessagePosition);
      this.showCannotAddMoreInCart = false;
      if (maxInventoryReached === 'true' && errorMessagePosition === 'cart') {
        this.showCannotAddMoreInCart = true;
      }
    }

    if (theme.settings.cartType === 'drawer' && this.cartDrawer) {
      event.preventDefault();
    }

    this.addToCart(formData, button);
  }

  /**
   * Log currently rendered discount codes from the DOM
   * This is the post-render check that shows what discounts are actually visible in the UI
   *
   * @return {Void}
   */
  logRenderedDiscounts() {
    if (!this.cart) return;

    const discountElements = this.cart.querySelectorAll('[data-discount-body],[data-discount-title]');
    if (discountElements.length === 0) {
      console.log(`[Cart discounts] Applied: (none)`);
      return;
    }

    const renderedDiscounts = Array.from(discountElements)
      .map((el) => el?.dataset?.discountTitle || el?.dataset?.discountCode)
      .filter(Boolean);

    if (renderedDiscounts.length > 0) {
      console.log(`[Cart discounts] ✅ Applied: ${renderedDiscounts.map((discount) => `"${discount}"`).join(', ')}`);
    }
  }

  /**
   * Clear discount error message UI
   *
   * @return {Void}
   */
  clearDiscountErrors() {
    if (this.discountErrorMessage) {
      this.discountErrorMessage.classList.add('hidden');
      this.discountErrorMessage.textContent = '';
    }
    this.discountError = false;
    this.shippingDiscountError = false;
    this.pendingDiscountCheck = null;
  }

  /**
   * Bind event listeners for discount elements.
   * This includes applying, removing, and clearing errors on UI interaction.
   *
   * @return  {Void}
   */
  bindDiscountEventListeners() {
    if (!this.hasDiscountBlock) return;

    // Apply new discount
    if (this.discountButton) {
      this.discountButton.addEventListener('click', (event) => {
        event.preventDefault();

        const newDiscountCode = this.discountInput.value.trim();
        this.discountInput.value = '';

        if (newDiscountCode) {
          this.applyDiscount(newDiscountCode);
        }
      });
    }

    // Remove existing discount (bind only; do not mutate local code list)
    document.querySelectorAll(selectors.discountBody)?.forEach((discount) => {
      const discountCode = discount.dataset.discountCode;

      // Add event listener to remove discount
      discount.querySelector(selectors.removeDiscount)?.addEventListener('click', (event) => {
        event.preventDefault();
        this.removeDiscount(discountCode);
      });
    });

    // Clear error messages on user interaction
    if (this.discountInput) {
      if (this.onDiscountInputChange) {
        this.discountInput.removeEventListener('input', this.onDiscountInputChange);
      }
      this.onDiscountInputChange = () => this.clearDiscountErrors();
      this.discountInput.addEventListener('input', this.onDiscountInputChange);
    }
  }

  /**
   * Apply a discount code to the cart.
   * - Reads current applied codes from /cart.js to avoid stale state
   * - Prevents duplicate submissions
   *
   * @param {string} discountCode - The code entered by the customer
   * @return {Promise<void>}
   */
  async applyDiscount(discountCode) {
    const inputCode = String(discountCode || '').trim();
    if (!inputCode) return;

    const currentCodes = await this.getExistingDiscountCodes();
    const lowerInput = inputCode.toLowerCase();
    const hasDuplicate = [...currentCodes, ...this.existingDiscountCodes].some((code) => String(code).toLowerCase() === lowerInput);

    if (hasDuplicate) {
      if (this.discountErrorMessage) {
        this.discountErrorMessage.classList.remove('hidden');
        this.discountErrorMessage.textContent = window.theme.strings.discount_already_applied;
        console.log(`[Cart discounts] ❌ "${inputCode}" already applied`);
      }
      return;
    }

    console.log(`[Cart discounts] Attempting to apply: "${inputCode}"`);

    const proposedCodes = [...currentCodes, inputCode].join(',');
    this.updateCartDiscounts(proposedCodes, inputCode);
  }

  /**
   * Remove a discount code from the cart.
   * - Reads current applied codes from /cart.js
   * - Submits the remaining codes to the cart update endpoint
   *
   * @param {string} discountCode - The code to remove
   * @return {Promise<void>}
   */
  async removeDiscount(discountCode) {
    const currentCodes = await this.getExistingDiscountCodes();
    const target = String(discountCode || '').toLowerCase();
    const canonical = currentCodes.find((code) => String(code).toLowerCase() === target);
    if (!canonical) return;

    console.log(`[Cart discounts] Removing "${discountCode}"`);

    const proposedCodes = currentCodes.filter((code) => code !== canonical).join(',');
    this.updateCartDiscounts(proposedCodes);
  }

  /**
   * Create or replace the AbortController used for discount update requests.
   * Aborts any in-flight submission so the latest attempt is authoritative.
   *
   * @return {AbortController}
   */
  createDiscountAbortController() {
    if (this.activeDiscountFetch) {
      this.activeDiscountFetch.abort();
    }
    this.activeDiscountFetch = new AbortController();
    return this.activeDiscountFetch;
  }

  /**
   * Get currently applied discount codes from the Cart API (GET /cart.js).
   * Returns only codes that Shopify marks as applicable; falls back to in-memory state on error.
   *
   * @return {Promise<string[]>}
   */
  async getExistingDiscountCodes() {
    try {
      const response = await fetch(`${window.Shopify.routes.root}cart.js`, {headers: {Accept: 'application/json'}});
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const cart = await response.json();
      const raw = Array.isArray(cart.discount_codes) ? cart.discount_codes : [];
      return raw.filter((d) => d.applicable).map((d) => d.code);
    } catch (e) {
      return Array.isArray(this.existingDiscountCodes) ? this.existingDiscountCodes.slice() : [];
    }
  }

  /**
   * POST discount update to Shopify's cart update endpoint and parse result.
   *
   * @param {string} discountString - CSV of discount codes to attempt
   * @param {AbortSignal} [signal] - Optional abort signal for in-flight cancellation
   * @return {Promise<{data: any, appliedCodes: string[]}>}
   */
  async updateAndParse(discountString, signal) {
    const response = await fetch(window.theme.routes.cart_update_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        discount: discountString,
      }),
      signal,
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      const rawCodes = Array.isArray(data.discount_codes) ? data.discount_codes : [];
      const appliedCodes = rawCodes.filter((d) => d.applicable).map((d) => d.code);
      return {data, appliedCodes};
    } catch (e) {
      console.error('Failed to parse cart update response:', text);
      throw new Error('Invalid JSON response from server.');
    }
  }

  /**
   * Make a cart discount update and refresh UI.
   * - Disables inputs, shows loading, and uses an AbortController
   * - Sets discountError when attemptedCode is present and not applicable
   * - Syncs local state from server and triggers a cart re-render
   *
   * @param {string} discountString - CSV of codes to set on the cart
   * @param {string|null} attemptedCode - Code the user just tried to add (for UX messaging)
   * @return {Promise<void>}
   */
  async updateCartDiscounts(discountString, attemptedCode = null) {
    this.disableCartButtons();
    this.addLoadingClass();
    this.discountError = false;
    this.shippingDiscountError = false;
    const abortController = this.createDiscountAbortController();

    try {
      // Capture currently visible discount codes rendered by Liquid (shipping codes are not rendered)
      const visibleCodesBefore = Array.from(document.querySelectorAll(selectors.discountBody))
        .map((el) => el?.dataset?.discountCode)
        .filter(Boolean);

      const {data, appliedCodes} = await this.updateAndParse(discountString, abortController.signal);
      if (attemptedCode) {
        const attempted = (Array.isArray(data.discount_codes) ? data.discount_codes : []).find((d) => d.code === attemptedCode);
        this.discountError = Boolean(attempted && attempted.applicable === false);
        const attemptedApplicable = Boolean(attempted && attempted.applicable === true);
        const codeIncluded = appliedCodes.some((c) => String(c).toLowerCase() === String(attemptedCode).toLowerCase());
        // Defer detection to after the UI re-renders
        this.pendingDiscountCheck = {
          attemptedCode,
          attemptedApplicable,
          codeIncluded,
          visibleCodesBefore,
        };
      } else {
        this.discountError = false;
      }

      this.existingDiscountCodes = appliedCodes;
      this.getCart();
    } catch (error) {
      // Silently ignore aborted discount requests to avoid noisy logs and stale refreshes
      const isAbortError = error && (error.name === 'AbortError' || (typeof error.message === 'string' && error.message.toLowerCase().includes('abort')));
      if (!isAbortError) {
        console.log(error);
        this.getCart(); // Sync cart state on non-abort errors
      }
    } finally {
      this.activeDiscountFetch = null;
      this.removeLoadingClass();
      this.enableCartButtons();
    }
  }

  /**
   * Cart events
   *
   * @return  {Void}
   */

  cartEvents() {
    if (this.cartTermsCheckbox) {
      this.cartTermsCheckbox.removeEventListener('change', this.formSubmitHandler);
      this.cartCheckoutButtonWrapper.removeEventListener('click', this.formSubmitHandler);
      this.cartForm.removeEventListener('submit', this.formSubmitHandler);

      this.cartTermsCheckbox.addEventListener('change', this.formSubmitHandler);
      this.cartCheckoutButtonWrapper.addEventListener('click', this.formSubmitHandler);
      this.cartForm.addEventListener('submit', this.formSubmitHandler);
    }
  }

  formSubmitHandler() {
    const termsAccepted = document.querySelector(selectors.cartTermsCheckbox).checked;
    const termsError = document.querySelector(selectors.termsErrorMessage);

    // Disable form submit if terms and conditions are not accepted
    if (!termsAccepted) {
      if (document.querySelector(selectors.termsErrorMessage).length > 0) {
        return;
      }

      termsError.innerText = theme.strings.cartAcceptanceError;
      this.cartCheckoutButton.setAttribute(attributes.disabled, true);
      termsError.classList.add(classes.expanded);
    } else {
      termsError.classList.remove(classes.expanded);
      this.cartCheckoutButton.removeAttribute(attributes.disabled);
    }
  }

  /**
   * Cart event remove out of stock error
   *
   * @return  {Void}
   */

  formErrorsEvents(errorContainer) {
    const buttonErrorClose = errorContainer.querySelector(selectors.formCloseError);
    buttonErrorClose?.addEventListener('click', (e) => {
      e.preventDefault();

      if (errorContainer) {
        errorContainer.classList.remove(classes.visible);
      }
    });
  }

  /**
   * Get response from the cart
   *
   * @return  {Void}
   */

  getCart() {
    fetch(theme.routes.cart_url + '?section_id=api-cart-items')
      .then(this.cartErrorsHandler)
      .then((response) => response.text())
      .then((response) => {
        window.carbon = window.carbon || {};
        let shouldRender = true;

        // Check if GWP/BOGO is active in global config
        const isGwpActive = window.GWP_CART_DRAWER_CONFIG || window.BUY_X_GET_Y_CART_DRAWER_CONFIG;

        // If GWP is active, and the extension has NOT finished processing yet, STOP rendering.
        if (isGwpActive && window.carbon.gwpProcessed === false) {
          shouldRender = false;
        }
        const element = document.createElement('div');
        element.innerHTML = response;

        if (shouldRender) {
          const cleanResponse = element.querySelector(selectors.apiContent);
          this.build(cleanResponse);
          // CRITICAL FIX: Do NOT reset window.carbon.gwpProcessed = false here.
          // Leaving it true prevents the infinite loop when the extension sees the update.
        }
      })
      .catch((error) => console.log(error));
  }

  /**
   * Add item(s) to the cart and show the added item(s)
   *
   * @param   {String}  formData
   * @param   {DOM Element}  button
   *
   * @return  {Void}
   */

  addToCart(formData, button) {
    window.carbon = window.carbon || {};
    window.carbon.gwpProcessed = false;

    let headers = {
      'X-Requested-With': 'XMLHttpRequest',
      Accept: 'application/javascript',
    };

    if (Array.isArray(formData)) {
      headers = {
        'Content-Type': 'application/json',
        Accept: 'application/javascript',
      };
      formData = JSON.stringify({items: formData});
    }

    if (this.cart) {
      this.cart.classList.add(classes.loading);
    }

    const quickAddHolder = button?.closest(selectors.quickAddHolder);

    if (button) {
      button.classList.add(classes.loading);
      button.disabled = true;
    }

    if (quickAddHolder) {
      quickAddHolder.classList.add(classes.visible);
    }

    fetch(theme.routes.cart_add_url, {
      method: 'POST',
      headers: headers,
      body: formData,
    })
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        if (response.status) {
          this.addToCartError(response, button);

          if (button) {
            button.classList.remove(classes.loading);
            button.disabled = false;
          }

          if (!this.showCannotAddMoreInCart) return;
        }

        if (this.cart) {
          if (button) {
            button.classList.remove(classes.loading);
            button.classList.add(classes.added);

            button.dispatchEvent(
              new CustomEvent('theme:product:add', {
                detail: {
                  response: response,
                  button: button,
                },
                bubbles: true,
              })
            );
          }
          if (theme.settings.cartType === 'page') {
            window.location = theme.routes.cart_url;
            return;
          }
          // Check if GWP/BOGO extension is active - if so, let the extension handle the cart refresh
          const isGwpActive = window.GWP_CART_DRAWER_CONFIG || window.BUY_X_GET_Y_CART_DRAWER_CONFIG;
          if (!isGwpActive) {
            this.getCart();
          } else {
            // Trigger GWP extension to process the cart, it will dispatch theme:cart:refresh when done
            document.dispatchEvent(
              new CustomEvent('theme:cart:change', {
                bubbles: true,
                detail: {source: 'theme-add-to-cart'},
              })
            );
          }
        } else {
          // Redirect to cart page if "Add to cart" is successful
          window.location = theme.routes.cart_url;
        }

        if (typeof formData === 'string') return;

        publish(theme.PUB_SUB_EVENTS.cartUpdate, {
          source: 'product-form',
          productVariantId: formData?.get('id'),
          cartData: response,
        });
      })
      .catch((error) => {
        this.addToCartError(error, button);
        this.enableCartButtons();
      });
  }

  /**
   * Update cart
   *
   * @param   {Object}  updateData
   *
   * @return  {Void}
   */

  updateCart(updateData = {}, currentItem = null) {
    window.carbon = window.carbon || {};
    window.carbon.gwpProcessed = false;

    this.cart.classList.add(classes.loading);

    let updatedQuantity = updateData.quantity;
    if (currentItem !== null) {
      if (updatedQuantity) {
        currentItem.classList.add(classes.loading);
      } else {
        currentItem.classList.add(classes.removed);
      }
    }
    this.disableCartButtons();

    const newItem = this.cart.querySelector(`[${attributes.item}="${updateData.id}"]`) || currentItem;
    const lineIndex = newItem?.hasAttribute(attributes.itemIndex) ? parseInt(newItem.getAttribute(attributes.itemIndex)) : 0;
    const itemTitle = newItem?.hasAttribute(attributes.itemTitle) ? newItem.getAttribute(attributes.itemTitle) : null;

    if (lineIndex === 0) return;

    const data = {
      line: lineIndex,
      quantity: updatedQuantity,
    };

    fetch(theme.routes.cart_change_url, {
      method: 'post',
      headers: {'Content-Type': 'application/json', Accept: 'application/json'},
      body: JSON.stringify(data),
    })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);

        if (parsedState.errors) {
          this.cartUpdateFailed = true;
          this.updateErrorText(itemTitle);
          this.toggleErrorMessage();
          this.resetLineItem(currentItem);
          this.enableCartButtons();
          this.bindDiscountEventListeners();

          return;
        }

        this.logDiscountCodes(parsedState);
        // Check if GWP/BOGO extension is active - if so, let the extension handle the cart refresh
        const isGwpActive = window.GWP_CART_DRAWER_CONFIG || window.BUY_X_GET_Y_CART_DRAWER_CONFIG;
        if (!isGwpActive) {
          this.getCart();
        } else {
          // Trigger GWP extension to process the cart, it will dispatch theme:cart:refresh when done
          document.dispatchEvent(
            new CustomEvent('theme:cart:change', {
              bubbles: true,
              detail: {source: 'theme-update-cart'},
            })
          );
        }
      })
      .catch((error) => {
        console.log(error);
        this.enableCartButtons();
      });
  }

  /**
   * Reset line item initial state
   *
   * @return  {Void}
   */
  resetLineItem(item) {
    const qtyInput = item.querySelector(selectors.qtyInput);
    const qty = qtyInput.getAttribute('value');

    qtyInput.value = qty;
    qtyInput
      .closest('quantity-input')
      ?.querySelector('popout-select')
      ?.dispatchEvent(
        new CustomEvent('theme:popout:update', {
          detail: {
            value: qty,
          },
          bubbles: true,
        })
      );

    item.classList.remove(classes.loading);
  }

  /**
   * Add loading class to cart
   *
   * @return  {Void}
   */
  addLoadingClass() {
    if (this.cart) {
      this.cart.classList.add(classes.loading);
    }
  }

  /**
   * Remove loading class from cart
   *
   * @return  {Void}
   */
  removeLoadingClass() {
    if (this.cart) {
      this.cart.classList.remove(classes.loading);
    }
  }

  /**
   * Disable cart buttons and inputs
   *
   * @return  {Void}
   */
  disableCartButtons() {
    const inputs = this.cart.querySelectorAll('input');
    const buttons = this.cart.querySelectorAll(`button, ${selectors.cartItemRemove}`);

    if (inputs.length) {
      inputs.forEach((item) => {
        item.classList.add(classes.disabled);
        item.blur();
        item.disabled = true;
      });
    }

    if (buttons.length) {
      buttons.forEach((item) => {
        item.setAttribute(attributes.disabled, true);
      });
    }
  }

  /**
   * Enable cart buttons and inputs
   *
   * @return  {Void}
   */
  enableCartButtons() {
    const inputs = this.cart.querySelectorAll('input:not([data-bundle-cart-quantity]');
    const buttons = this.cart.querySelectorAll(`button, ${selectors.cartItemRemove}`);

    inputs?.forEach((item) => {
      item.classList.remove(classes.disabled);
      item.disabled = false;
    });

    buttons?.forEach((item) => {
      item.removeAttribute(attributes.disabled);
    });

    this.cart.classList.remove(classes.loading);
  }

  /**
   * Update error text
   *
   * @param   {String}  itemTitle
   *
   * @return  {Void}
   */

  updateErrorText(itemTitle) {
    this.cartErrorHolder.querySelector(selectors.errorMessage).innerText = itemTitle;
  }

  /**
   * Toggle error message
   *
   * @return  {Void}
   */

  toggleErrorMessage() {
    if (!this.cartErrorHolder) return;

    this.cartErrorHolder.classList.toggle(classes.expanded, this.cartUpdateFailed);

    // Reset cart error events flag
    this.cartUpdateFailed = false;
  }

  /**
   * Handle errors
   *
   * @param   {Object}  response
   *
   * @return  {Object}
   */

  cartErrorsHandler(response) {
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

  /**
   * Add to cart error handle
   *
   * @param   {Object}  data
   * @param   {DOM Element/Null} button
   *
   * @return  {Void}
   */

  /**
   * Hide error message container as soon as an item is successfully added to the cart
   */
  hideAddToCartErrorMessage() {
    const holder = document.querySelector(selectors.formWrapper);
    const errorContainer = holder?.querySelector(selectors.formErrorsContainer);

    errorContainer?.classList.remove(classes.visible);
  }

  addToCartError(data, button) {
    if (button !== null) {
      const outerContainer = button.closest(selectors.outerSection) || button.closest(selectors.quickAddHolder) || button.closest(selectors.quickAddModal);
      let errorContainer = outerContainer?.querySelector(selectors.formErrorsContainer);
      const buttonUpsellHolder = button.closest(selectors.quickAddHolder);

      if (buttonUpsellHolder && buttonUpsellHolder.querySelector(selectors.formErrorsContainer)) {
        errorContainer = buttonUpsellHolder.querySelector(selectors.formErrorsContainer);
      }

      if (errorContainer) {
        let errorMessage = `${data.message}: ${data.description}`;

        if (data.message == data.description) {
          errorMessage = data.message;
        }

        errorContainer.innerHTML = `<div class="errors">${errorMessage}<button type="button" class="errors__close" data-close-error><svg aria-hidden="true" focusable="false" role="presentation" width="24px" height="24px" stroke-width="1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" class="icon icon-close"><path d="M6.758 17.243L12.001 12m5.243-5.243L12 12m0 0L6.758 6.757M12.001 12l5.243 5.243" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"></path></svg></button></div>`;
        errorContainer.classList.add(classes.visible);
        this.formErrorsEvents(errorContainer);
      }

      button.dispatchEvent(
        new CustomEvent('theme:product:add-error', {
          detail: {
            response: data,
            button: button,
          },
          bubbles: true,
        })
      );
    }

    const quickAddHolder = button?.closest(selectors.quickAddHolder);

    if (quickAddHolder) {
      quickAddHolder.dispatchEvent(
        new CustomEvent('theme:cart:error', {
          bubbles: true,
          detail: {
            message: data.message,
            description: data.description,
            holder: quickAddHolder,
          },
        })
      );
    }

    this.cart?.classList.remove(classes.loading);
  }

  /**
   * Add product to cart events
   *
   * @return  {Void}
   */
  productAddCallback(event) {
    let buttons = [];
    let quickAddHolder = null;
    const hasError = event.type == 'theme:product:add-error';
    const buttonATC = event.detail.button;
    const cartBarButtonATC = document.querySelector(selectors.cartBarAdd);

    buttons.push(buttonATC);
    quickAddHolder = buttonATC.closest(selectors.quickAddHolder);

    if (cartBarButtonATC) {
      buttons.push(cartBarButtonATC);
    }

    buttons.forEach((button) => {
      button.classList.remove(classes.loading);
      if (!hasError) {
        button.classList.add(classes.added);
      }
    });

    setTimeout(() => {
      buttons.forEach((button) => {
        button.classList.remove(classes.added);
        const isVariantUnavailable =
          button.closest(selectors.formWrapper)?.classList.contains(classes.variantSoldOut) || button.closest(selectors.formWrapper)?.classList.contains(classes.variantUnavailable);

        if (!isVariantUnavailable) {
          button.disabled = false;
        }
      });

      if (quickAddHolder && !quickAddHolder.classList.contains(classes.expanded)) {
        quickAddHolder.classList.remove(classes.visible);
      }
    }, 1000);
  }

  /**
   * Toggle classes on different containers and messages
   *
   * @return  {Void}
   */

  toggleClassesOnContainers() {
    const hasItemsInCart = this.hasItemsInCart();

    this.cart.classList.toggle(classes.empty, !hasItemsInCart);

    if (!hasItemsInCart && this.cartDrawer) {
      setTimeout(() => {
        this.a11y.trapFocus(this.cartDrawer, {
          elementToFocus: this.cartDrawer.querySelector(selectors.cartDrawerClose),
        });
      }, 100);
    }
  }

  /**
   * Build cart depends on results
   *
   * @param   {Object}  data
   *
   * @return  {Void}
   */

  build(data) {
    const cartItemsData = data.querySelector(selectors.apiLineItems);
    const bundleItemsData = data.querySelector(selectors.apiBundleItems);

    const cartEmptyData = Boolean(cartItemsData === null && bundleItemsData === null);
    const priceData = data.querySelector(selectors.apiCartPrice);
    const cartTotal = data.querySelector(selectors.cartTotal);

    if (this.priceHolder && priceData) {
      this.priceHolder.innerHTML = priceData.innerHTML;
    }

    if (cartEmptyData) {
      this.itemsHolder.innerHTML = data.innerHTML;

      if (this.bundleProductsHolder) {
        this.bundleProductsHolder.innerHTML = '';
      }
    } else {
      this.itemsHolder.innerHTML = cartItemsData.innerHTML;

      if (this.bundleProductsHolder && bundleItemsData) {
        this.bundleProductsHolder.innerHTML = bundleItemsData.innerHTML;
      }

      this.skipBundleProductEvent();
      this.checkSkippedBundleProductsFromStorage();
      this.toggleCartBundleWidgetVisibility();
    }

    this.newTotalItems = cartItemsData && cartItemsData.querySelectorAll(selectors.item).length ? cartItemsData.querySelectorAll(selectors.item).length : 0;
    this.subtotal = cartTotal && cartTotal.hasAttribute(attributes.cartTotal) ? parseInt(cartTotal.getAttribute(attributes.cartTotal)) : 0;
    this.cartCount = this.getCartItemCount();

    // Dispatch cart change event with data element for upsell blocks updates
    document.dispatchEvent(
      new CustomEvent('theme:cart:change', {
        bubbles: true,
        detail: {
          cartCount: this.cartCount,
          dataElement: data,
        },
      })
    );

    // Update cart total price
    this.cartTotal.innerHTML = this.subtotal === 0 ? window.theme.strings.free : window.theme.formatMoney(this.subtotal, theme.moneyWithCurrencyFormat);

    if (this.totalItems !== this.newTotalItems) {
      this.totalItems = this.newTotalItems;

      this.toggleClassesOnContainers();
    }

    // Add class "is-updated" line items holder to reduce cart items animation delay via CSS variables
    if (this.cartDrawer?.classList.contains(classes.open)) {
      this.cart.classList.add(classes.updated);
    }

    // Remove cart loading class
    this.cart.classList.remove(classes.loading);

    // Prepare empty cart buttons for animation
    if (!this.hasItemsInCart()) {
      this.cartEmpty.querySelectorAll(selectors.animation).forEach((item) => {
        item.classList.remove(classes.animated);
      });
    }

    if (this.hasDiscountBlock) {
      if (this.discountField) {
        this.discountField.value = this.existingDiscountCodes.join(',');
      }

      // Post-render check for shipping-only discounts based on UI not gaining a new "remove-discount" pill
      if (this.pendingDiscountCheck) {
        const currentVisibleCodes = Array.from(this.cart.querySelectorAll(selectors.discountBody))
          .map((el) => el?.dataset?.discountCode)
          .filter(Boolean)
          .map((c) => String(c).toLowerCase());
        const beforeSet = new Set(this.pendingDiscountCheck.visibleCodesBefore.map((c) => String(c).toLowerCase()));
        const attemptedLower = String(this.pendingDiscountCheck.attemptedCode).toLowerCase();
        const uiGainedAttempted = currentVisibleCodes.includes(attemptedLower) && !beforeSet.has(attemptedLower);

        this.shippingDiscountError = Boolean(this.pendingDiscountCheck.attemptedApplicable && this.pendingDiscountCheck.codeIncluded && !uiGainedAttempted);

        this.pendingDiscountCheck = null;
      }

      if (this.shippingDiscountError) {
        if (this.discountErrorMessage) {
          this.discountErrorMessage.textContent = window.theme.strings.shipping_discounts_at_checkout;
          this.discountErrorMessage.classList.remove('hidden');
          console.log(`[Cart discounts] ❌ ${window.theme.strings.shipping_discounts_at_checkout}`);
        }
      } else if (this.discountError) {
        if (this.discountErrorMessage) {
          this.discountErrorMessage.textContent = window.theme.strings.discount_not_applicable;
          this.discountErrorMessage.classList.remove('hidden');
          console.log(`[Cart discounts] ❌ ${window.theme.strings.discount_not_applicable}`);
        }
      } else {
        this.discountErrorMessage?.classList.add('hidden');
      }
    }

    this.freeShippingMessageHandle(this.subtotal);
    this.cartRemoveEvents();
    this.cartUpdateEvents();
    this.enableCartButtons();
    this.updateProgress();
    this.animateItems();

    document.dispatchEvent(new CustomEvent('theme:cart:built', {bubbles: true}));

    this.bindDiscountEventListeners();
    this.logRenderedDiscounts();

    if (!this.showCannotAddMoreInCart) {
      this.hideAddToCartErrorMessage();
      document.dispatchEvent(
        new CustomEvent('theme:product:added', {
          bubbles: true,
        })
      );
    }

    this.toggleErrorMessage();
  }

  /**
   * Get cart item count
   *
   * @return  {Void}
   */

  getCartItemCount() {
    return Array.from(this.cart.querySelectorAll(selectors.qtyInput)).reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);
  }

  /**
   * Check for items in the cart
   *
   * @return  {Void}
   */

  hasItemsInCart() {
    return this.totalItems > 0;
  }

  /**
   * Show/hide free shipping message
   *
   * @param   {Number}  total
   *
   * @return  {Void}
   */

  freeShippingMessageHandle(total) {
    if (!this.freeShipping.length) return;

    this.freeShipping.forEach((message) => {
      const hasQualifiedShippingMessage = message.hasAttribute(attributes.freeShipping) && message.getAttribute(attributes.freeShipping) === 'true' && total >= 0;
      message.classList.toggle(classes.success, hasQualifiedShippingMessage && total >= this.freeShippingLimit);
    });
  }

  /**
   * Update progress when update cart
   *
   * @return  {Void}
   */

  updateProgress() {
    this.freeShipping = document.querySelectorAll(selectors.freeShipping);

    if (!this.freeShipping.length) return;

    let hasReachedLimit = this.freeShippingLimit > 0 && this.subtotal >= this.freeShippingLimit;
    let forceSuccess = false;

    if (!this.promotion1Enabled && !this.promotion2Enabled) {
      hasReachedLimit = true;
      forceSuccess = true;
    } else if (this.promotion1Enabled && !this.promotion2Enabled && this.freeShippingLimit === 0) {
      hasReachedLimit = true;
      forceSuccess = true;
    } else if (!this.promotion1Enabled && this.promotion2Enabled && this.promoCenterLimit === 0) {
      hasReachedLimit = true;
      forceSuccess = true;
    } else if (this.promotion1Enabled && this.promotion2Enabled && this.freeShippingLimit === 0 && this.promoCenterLimit === 0) {
      hasReachedLimit = true;
      forceSuccess = true;
    }

    const percentValue = this.freeShippingLimit > 0 ? this.subtotal / this.freeShippingLimit : 0;
    const percent = forceSuccess ? 100 : Math.max(0, Math.min(percentValue * 100, 100));

    const dashoffset = this.circumference - ((percent / 100) * this.circumference) / 2;
    const leftToSpendCents = Math.max(0, this.freeShippingLimit - this.subtotal);
    const leftToSpendPromoCents = Math.max(0, this.promoCenterLimit - this.subtotal);
    const leftToSpend = window.theme.formatMoney(leftToSpendCents, theme.moneyFormat);
    const leftToSpendPromoMoney = window.theme.formatMoney(leftToSpendPromoCents, theme.moneyFormat);
    const hasReachedCenterLimit = this.promoCenterLimit > 0 && this.subtotal >= this.promoCenterLimit;

    this.freeShipping.forEach((item) => {
      const progressBar = item.querySelector('[data-progress-bar]');
      const progressGraph = item.querySelector('[data-progress-graph]');
      const leftToSpendMessage = item.querySelector('[data-left-to-spend]');
      const leftToSpendPromo = item.querySelector('[data-left-to-spend-promo]');
      const promoCenter = item.querySelector('[data-promo-center]');
      const isCenterActive = (promoCenter && this.promoCenterLimit === 0) || hasReachedCenterLimit;

      // Update "left to spend" messages
      if (leftToSpendMessage) {
        leftToSpendMessage.innerHTML = leftToSpend.replace('.00', '');
      }

      if (leftToSpendPromo) {
        leftToSpendPromo.innerHTML = leftToSpendPromoMoney.replace('.00', '');
      }

      // Set progress bar value and add animation class
      if (progressBar) {
        progressBar.value = percent;
      }

      // Set circle progress
      if (progressGraph) {
        progressGraph.style.setProperty('--stroke-dashoffset', `${dashoffset}`);
      }

      // Clear all state classes first
      item.classList.remove(classes.success, classes.active);

      // Apply appropriate state class
      if (hasReachedLimit) {
        // Final goal reached - show success
        item.classList.add(classes.success);
      } else if (isCenterActive && !hasReachedLimit) {
        // Center goal reached but not final goal - show active (dual promo)
        item.classList.add(classes.active);
      }
    });
  }

  /**
   * Skip bundle product
   */
  skipBundleProductEvent() {
    if (this.bundleProductsHolder === null) {
      return;
    }

    const bundleSkipButtons = this.bundleProductsHolder?.querySelectorAll('[data-skip-upsell-product]') || [];

    if (bundleSkipButtons.length) {
      bundleSkipButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
          event.preventDefault();

          const productID = button.closest(selectors.quickAddHolder).getAttribute(attributes.quickAddHolder);
          const isBundle = !!button.closest(selectors.bundleWidget);

          if (isBundle && !this.skipBundleProductsArray.includes(productID)) {
            this.skipBundleProductsArray.push(productID);
            window.sessionStorage.setItem('skip_bundle_products', this.skipBundleProductsArray);
            this.removeBundleProduct(productID);
          }

          this.toggleCartBundleWidgetVisibility();
        });
      });
    }
  }

  /**
   * Check for skipped bundle product added to session storage
   */
  checkSkippedBundleProductsFromStorage() {
    const skippedItems = window.sessionStorage.getItem('skip_bundle_products');
    if (skippedItems) {
      skippedItems.split(',').forEach((productID) => {
        if (!this.skipBundleProductsArray.includes(productID)) {
          this.skipBundleProductsArray.push(productID);
        }
        this.removeBundleProduct(productID);
      });
    }
  }

  /**
   * Remove multiple products from cart
   *
   * @param   {Array}  A list of products
   *
   * @return  {Void}
   */
  removeMultipleProducts(productsArr) {
    let formData = new FormData();

    productsArr.forEach((element) => {
      formData.append(`updates[${element}]`, 0);
    });

    this.cart.classList.add(classes.loading);
    this.disableCartButtons();

    fetch(theme.routes.cart_update_url, {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.text())
      .then((state) => {
        try {
          const parsedState = JSON.parse(state);
          if (!parsedState.errors) {
            this.logDiscountCodes(parsedState);
          }
        } catch (e) {
          // If response is not JSON, continue with getCart()
        }
        this.getCart();
      })
      .catch((error) => {
        console.log(error);
        this.enableCartButtons();
      });
  }

  removeBundleProduct(productID) {
    if (!this.bundleProductsHolder) return;

    const product = this.bundleProductsHolder.querySelector(`[${attributes.quickAddHolder}="${productID}"]`);
    if (product && product.parentNode) {
      product.parentNode.remove();
    }
  }

  /**
   * Show or hide cart bundle products widget visibility
   */
  toggleCartBundleWidgetVisibility() {
    if (!this.bundleProductsHolder) return;

    const bundleItems = this.bundleProductsHolder.querySelectorAll(selectors.quickAddHolder);
    const bundleWidget = this.bundleProductsHolder.closest(selectors.bundleWidget);

    if (!bundleWidget) return;

    bundleWidget.classList.toggle(classes.hidden, !bundleItems.length);
    if (bundleItems.length && !bundleWidget.hasAttribute(attributes.open) && bundleWidget.hasAttribute('data-upsell-auto-open')) {
      bundleWidget.setAttribute(attributes.open, true);
      const widgetBody = bundleWidget.querySelector(selectors.collapsibleBody);
      if (widgetBody) {
        widgetBody.style.height = 'auto';
      }
    }
  }

  /**
   * Remove initially added AOS classes to allow animation on cart drawer open
   *
   * @return  {Void}
   */
  resetAnimatedItems() {
    this.cart.querySelectorAll(selectors.animation).forEach((item) => {
      item.classList.remove(classes.animated);
      item.classList.remove(classes.hiding);
    });
  }

  /**
   * Cart elements opening animation
   *
   * @return  {Void}
   */
  animateItems(e) {
    requestAnimationFrame(() => {
      let cart = this.cart;

      if (e && e.detail && e.detail.target) {
        cart = e.detail.target;
      }

      cart?.querySelectorAll(selectors.animation).forEach((item) => {
        item.classList.add(classes.animated);
      });
    });
  }

  /**
   * Collect discount codes from cart state
   * Builds a complete list of discount codes from cart and line items applications
   * Matches the Liquid logic in cart-price.liquid
   *
   * @param   {Object}  parsedState  Parsed cart state from API
   * @return  {Void}
   */
  logDiscountCodes(parsedState) {
    let discountCodes = new Set();
    const discountKeys = new Set();

    // Helper function to check and add unique discounts
    const addDiscount = (title, type) => {
      const key = `${title}|${type}`;
      if (!discountKeys.has(key)) {
        discountKeys.add(key);
        discountCodes.add({title, type});
      }
    };

    // Get cart-level discount codes
    if (parsedState.cart_level_discount_applications.length > 0) {
      parsedState.cart_level_discount_applications.forEach((application) => {
        if (application.discount_application) {
          addDiscount(application.discount_application.title, application.discount_application.type);
        }
      });
    }

    // Get line-level discount codes from all items
    if (parsedState.items.length > 0) {
      parsedState.items.forEach((item) => {
        if (item.line_level_discount_allocations.length > 0) {
          item.line_level_discount_allocations.forEach((allocation) => {
            addDiscount(allocation.discount_application.title, allocation.discount_application.type);
          });
        }
      });
    }

    if (discountCodes.size > 0) {
      console.log('Discount details:', Array.from(discountCodes));
    }
  }
}

if (!customElements.get('cart-items')) {
  customElements.define('cart-items', CartItems);
}
