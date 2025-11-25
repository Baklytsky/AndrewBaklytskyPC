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
  apiUpsellItems: '[data-api-upsell-items]',
  apiBundleItems: '[data-api-bundle-items]',
  apiCartPrice: '[data-api-cart-price]',
  animation: '[data-animation]',
  buttonSkipUpsellProduct: '[data-skip-upsell-product]',
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
  upsellProductsHolder: '[data-upsell-products]',
  bundleProductsHolder: '[data-bundle-products]',
  upsellWidget: '[data-upsell-widget]',
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
  upsellAutoOpen: 'data-upsell-auto-open',
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
    this.upsellProductsHolder = document.querySelector(selectors.upsellProductsHolder);
    this.bundleProductsHolder = document.querySelector(selectors.bundleProductsHolder);
    this.subtotal = window.theme.subtotal;
    this.showGetCartResponse = true;
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

    // Upsell or bundle products
    this.skipUpsellProductsArray = [];
    this.skipBundleProductsArray = [];
    this.skipUpsellOrBundleProductEvent();
    this.checkSkippedUpsellOrBundleProductsFromStorage();
    this.toggleCartUpsellOrBundleWidgetVisibility();

    // Upsell product caching system
    this.upsellProductCache = new Map();
    this.cartProductVariants = new Map();

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

    if (button.hasAttribute('disabled')) return;
    const form = button.form || button.closest('form');
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
        this.showGetCartResponse = true;
        const element = document.createElement('div');
        element.innerHTML = response;

        this.toggleAwards(element);

        if (this.showGetCartResponse) {
          const cleanResponse = element.querySelector(selectors.apiContent);
          this.build(cleanResponse);
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
          }
          this.getCart();
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

  /**
   * Update cart
   *
   * @param   {Object}  updateData
   *
   * @return  {Void}
   */

  updateCart(updateData = {}, currentItem = null) {
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
        this.getCart();
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

      quickAddHolder?.classList.remove(classes.visible);
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
   * Refresh cart drawer upsell blocks
   * Used when cart is emptied to restore all products
   *
   * @return  {Promise<void>}
   */
  async refreshCartDrawerUpsells() {
    try {
      // Find the section ID from the cart drawer
      const sectionElement = this.cartDrawer.closest('[data-section-id]');
      const sectionId = sectionElement?.getAttribute('data-section-id');
      if (!sectionId) {
        console.warn('Section ID not found for cart drawer');
        return;
      }

      // Fetch the cart drawer section
      const response = await fetch(`${window.Shopify.routes.root}?section_id=${sectionId}`);
      if (!response.ok) {
        console.error('Failed to fetch cart drawer section:', response.status);
        return;
      }

      const html = await response.text();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      // Find upsell blocks in the fetched HTML using data attribute
      const fetchedUpsellBlocks = tempDiv.querySelectorAll('[data-upsell-block-id]');
      const currentUpsellBlocks = Array.from(this.cartDrawer.querySelectorAll('[data-upsell-block-id]'));

      // Create a map of block IDs to fetched blocks for easier matching
      const fetchedBlocksMap = new Map();
      fetchedUpsellBlocks.forEach((block) => {
        const blockId = block.getAttribute('data-upsell-block-id');
        if (blockId) {
          fetchedBlocksMap.set(blockId, block);
        }
      });

      // Replace each current upsell block with fresh content by matching block IDs
      currentUpsellBlocks.forEach((currentBlock) => {
        const blockId = currentBlock.getAttribute('data-upsell-block-id');
        const fetchedBlock = fetchedBlocksMap.get(blockId);

        if (fetchedBlock) {
          currentBlock.innerHTML = fetchedBlock.innerHTML;
        }
      });
    } catch (error) {
      console.error('Error refreshing cart drawer upsells:', error);
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

      if (this.upsellProductsHolder) {
        this.upsellProductsHolder.innerHTML = '';
      }

      if (this.bundleProductsHolder) {
        this.bundleProductsHolder.innerHTML = '';
      }

      // Clear upsell cache when cart is empty
      this.upsellProductCache.clear();
      this.cartProductVariants.clear();
    } else {
      this.itemsHolder.innerHTML = cartItemsData.innerHTML;

      if (this.bundleProductsHolder && bundleItemsData) {
        this.bundleProductsHolder.innerHTML = bundleItemsData.innerHTML;
      }

      this.skipUpsellOrBundleProductEvent();
      this.checkSkippedUpsellOrBundleProductsFromStorage();
      this.toggleCartUpsellOrBundleWidgetVisibility();
    }

    // Update upsell blocks
    this.updateUpsellBlocks(data).catch((error) => {
      console.error('Error updating upsell blocks:', error);
    });

    this.newTotalItems = cartItemsData && cartItemsData.querySelectorAll(selectors.item).length ? cartItemsData.querySelectorAll(selectors.item).length : 0;
    this.subtotal = cartTotal && cartTotal.hasAttribute(attributes.cartTotal) ? parseInt(cartTotal.getAttribute(attributes.cartTotal)) : 0;
    this.cartCount = this.getCartItemCount();

    document.dispatchEvent(
      new CustomEvent('theme:cart:change', {
        bubbles: true,
        detail: {
          cartCount: this.cartCount,
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
   * Update upsell blocks based on cart state
   * Removes products that have all variants in cart
   * Caches products when removed for future restoration
   *
   * @param   {HTMLElement}  [dataElement]  Element containing cart data from api-cart-items
   * @return  {Promise<void>}
   */
  /**
   * Remove product from upsell block and cache it
   *
   * @param   {HTMLElement}  blockElement  The upsell block element
   * @param   {HTMLElement}  productHolder  The product holder element
   * @param   {string}       productIdStr  Product ID as string
   * @param   {Map}          blockCache     Cache for this block
   * @return  {void}
   */
  removeProductFromUpsell(blockElement, productHolder, productIdStr, blockCache) {
    const hasSlider = blockElement.hasAttribute('data-upsell-has-slider');
    const productElement = hasSlider ? productHolder.closest('swiper-slide') : productHolder.parentElement;

    if (productElement && productElement !== blockElement) {
      blockCache.set(productIdStr, productElement.outerHTML);
      productElement.remove();

      if (hasSlider) {
        this.updateSwiperSlider(blockElement);
      }
    }
  }

  /**
   * Restore product to upsell block from cache
   *
   * @param   {HTMLElement}  blockElement  The upsell block element
   * @param   {HTMLElement}  restoredElement  The element to restore
   * @param   {string}       blockId      Block ID for error messages
   * @return  {boolean}  True if restored successfully, false otherwise
   */
  restoreProductToUpsell(blockElement, restoredElement, blockId) {
    const itemsContainer = blockElement.querySelector('[data-upsell-block-items]');
    if (!itemsContainer) {
      console.warn('Upsell block items container not found for block:', blockId);
      return false;
    }

    const hasSlider = blockElement.hasAttribute('data-upsell-has-slider');
    if (hasSlider) {
      const swiper = itemsContainer.querySelector('swiper-container');
      if (!swiper) {
        console.warn('Swiper container not found in slider block:', blockId);
        return false;
      }
      swiper.appendChild(restoredElement);
      this.updateSwiperSlider(blockElement);
    } else {
      itemsContainer.appendChild(restoredElement);
    }

    return true;
  }

  /**
   * Process visible products in an upsell block
   *
   * @param   {HTMLElement}  blockElement        The upsell block element
   * @param   {Map}           blockCache          Cache for this block
   * @param   {Map}           cartProductVariants Cart product variants
   * @return  {Promise<Set>}  Set of visible product IDs
   */
  async processVisibleProducts(blockElement, blockCache, cartProductVariants) {
    const productHolders = blockElement.querySelectorAll('[data-quick-add-holder]');
    const visibleProductIds = new Set();

    for (const productHolder of productHolders) {
      const productId = productHolder.getAttribute('data-quick-add-holder');
      const productHandle = productHolder.getAttribute('data-product-handle');
      if (!productId || !productHandle) continue;

      const productIdStr = productId.toString();
      visibleProductIds.add(productIdStr);

      const cartVariants = cartProductVariants.get(productIdStr) || new Set();
      const allVariantsInCart = await this.areAllVariantsInCart(productIdStr, cartVariants, productHandle);

      if (allVariantsInCart && !blockCache.has(productIdStr)) {
        // Remove product - all variants in cart
        this.removeProductFromUpsell(blockElement, productHolder, productIdStr, blockCache);
      } else if (!allVariantsInCart && blockCache.has(productIdStr)) {
        // Restore product - not all variants in cart
        const cachedHtml = blockCache.get(productIdStr);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cachedHtml;
        const restoredElement = tempDiv.firstElementChild;

        if (restoredElement) {
          const blockId = blockElement.getAttribute('data-upsell-block-id');
          if (this.restoreProductToUpsell(blockElement, restoredElement, blockId)) {
            blockCache.delete(productIdStr);
          }
        }
      }
    }

    return visibleProductIds;
  }

  /**
   * Process cached products that aren't currently visible
   *
   * @param   {HTMLElement}  blockElement        The upsell block element
   * @param   {Map}           blockCache          Cache for this block
   * @param   {Set}           visibleProductIds   Set of visible product IDs
   * @param   {Map}           cartProductVariants Cart product variants
   * @return  {Promise<void>}
   */
  async processCachedProducts(blockElement, blockCache, visibleProductIds, cartProductVariants) {
    const blockId = blockElement.getAttribute('data-upsell-block-id');

    for (const [cachedProductId, cachedHtml] of blockCache.entries()) {
      // Skip if already processed
      if (visibleProductIds.has(cachedProductId)) continue;

      // Get product handle from cached HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = cachedHtml;
      const cachedProductHolder = tempDiv.querySelector('[data-product-handle]');
      if (!cachedProductHolder) continue;

      const productHandle = cachedProductHolder.getAttribute('data-product-handle');
      const cartVariants = cartProductVariants.get(cachedProductId) || new Set();
      const allVariantsInCart = await this.areAllVariantsInCart(cachedProductId, cartVariants, productHandle);

      if (!allVariantsInCart) {
        // Restore product - not all variants in cart
        const restoredElement = tempDiv.firstElementChild;
        if (restoredElement && this.restoreProductToUpsell(blockElement, restoredElement, blockId)) {
          blockCache.delete(cachedProductId);
        }
      }
    }
  }

  /**
   * Update block visibility based on remaining products
   *
   * @param   {HTMLElement}  blockElement  The upsell block element
   * @return  {void}
   */
  updateBlockVisibility(blockElement) {
    const remainingProducts = blockElement.querySelectorAll('[data-quick-add-holder]');
    const cartBlock = blockElement.closest('.cart-block');
    if (cartBlock) {
      cartBlock.style.display = remainingProducts.length > 0 ? '' : 'none';
    }
  }

  /**
   * Update upsell blocks based on cart state
   * Removes products that have all variants in cart, restores cached products when removed
   *
   * @param   {HTMLElement}  [dataElement]  Element containing cart data from api-cart-items
   * @return  {Promise<void>}
   */
  async updateUpsellBlocks(dataElement) {
    const upsellBlocks = Array.from(this.cartDrawer.querySelectorAll('[data-upsell-block-id]'));
    if (upsellBlocks.length === 0) return;

    // Get product variants from the current cart state
    const cartProductVariants = this.getCartProductVariants(dataElement);
    const cartIsEmpty = cartProductVariants.size === 0;

    // If cart is empty, clear cache and restore all products
    if (cartIsEmpty) {
      this.upsellProductCache.clear();
      this.cartProductVariants.clear();
      await this.refreshCartDrawerUpsells();
      return;
    }

    // Process each upsell block
    for (const blockElement of upsellBlocks) {
      const blockId = blockElement.getAttribute('data-upsell-block-id');
      if (!blockId) continue;

      // Initialize cache for this block if needed
      if (!this.upsellProductCache.has(blockId)) {
        this.upsellProductCache.set(blockId, new Map());
      }
      const blockCache = this.upsellProductCache.get(blockId);

      // Process visible products
      const visibleProductIds = await this.processVisibleProducts(blockElement, blockCache, cartProductVariants);

      // Process cached products that aren't visible
      await this.processCachedProducts(blockElement, blockCache, visibleProductIds, cartProductVariants);

      // Update block visibility
      this.updateBlockVisibility(blockElement);
    }

    // Update cart product variants cache
    this.cartProductVariants = cartProductVariants;
  }

  /**
   * Get cart state - product IDs and their variant IDs
   * Extracts data from the api-cart-items response to avoid extra API calls
   *
   * @param   {HTMLElement}  [dataElement]  Optional element containing data-api-cart-items-json
   * @return  {Map}  Map of productId -> Set of variantIds
   */
  getCartProductVariants(dataElement = null) {
    const productVariants = new Map();

    let cartItemsData = null;
    if (!dataElement) return;

    const jsonScript = dataElement.querySelector('[data-api-cart-items-json]');
    if (jsonScript) {
      try {
        cartItemsData = JSON.parse(jsonScript.textContent);
      } catch (e) {
        console.warn('Failed to parse cart items JSON:', e);
      }
    }

    // Process items from the JSON data
    if (cartItemsData.items && Array.isArray(cartItemsData.items)) {
      cartItemsData.items.forEach((item) => {
        const productId = String(item.product_id);
        const variantId = String(item.variant_id);

        if (!productVariants.has(productId)) {
          productVariants.set(productId, new Set());
        }
        productVariants.get(productId).add(variantId);
      });
    }

    return productVariants;
  }

  /**
   * Check if all variants of a product are in cart
   * Uses cached variant counts to avoid repeated API calls
   *
   * @param   {string}  productId  Product ID
   * @param   {Set}     cartVariantIds  Set of variant IDs in cart for this product
   * @return  {Promise<boolean>}
   */
  async areAllVariantsInCart(productId, cartVariantIds, productHandle = null) {
    if (!productHandle) {
      console.warn(`Product handle not provided for product ${productId}, cannot fetch variant data`);
      return false;
    }

    // Fetch fresh product data to check actual variant IDs
    const productUrl = `${window.Shopify.routes.root}products/${productHandle}.js`;

    try {
      const response = await fetch(productUrl, {
        headers: {Accept: 'application/json'},
      });

      if (!response.ok) {
        console.error(`Failed to fetch product ${productHandle}: ${response.status} ${response.statusText}`);
        return false;
      }

      const product = await response.json();

      // Get all available variant IDs from the product (only count available variants)
      const allAvailableVariantIds = new Set(product.variants.filter((variant) => variant.available).map((variant) => String(variant.id)));

      console.log({productHandle}, 'All available product variant IDs:', Array.from(allAvailableVariantIds));
      console.log('Cart variant IDs:', Array.from(cartVariantIds));

      // If no available variants, don't remove from upsells
      if (allAvailableVariantIds.size === 0) return false;

      // Check if all available variants are in the cart
      const cartVariantIdsStr = new Set(Array.from(cartVariantIds).map((id) => String(id)));

      // Check if every available variant from the product is in the cart
      const allVariantsInCart = Array.from(allAvailableVariantIds).every((variantId) => cartVariantIdsStr.has(variantId));

      console.log('All variants in cart:', allVariantsInCart, `(${cartVariantIdsStr.size}/${allAvailableVariantIds.size})`);

      return allVariantsInCart;
    } catch (error) {
      // If we can't fetch product data, don't remove from upsells
      console.error(`Error fetching product ${productHandle} data:`, error);
      return false;
    }
  }

  /**
   * Update/reinitialize swiper slider after slides are added or removed
   *
   * @param   {HTMLElement}  blockElement  The upsell block element
   * @return  {void}
   */
  updateSwiperSlider(blockElement) {
    const swiper = blockElement.querySelector('swiper-container');
    if (!swiper) return;

    if (swiper.swiper) {
      swiper.swiper.update();
      return;
    }

    customElements.whenDefined('swiper-container').then(() => {
      if (swiper.swiper) swiper.swiper.update();
    });
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
   * Skip upsell or bundle product
   */
  skipUpsellOrBundleProductEvent() {
    if (this.upsellProductsHolder === null && this.bundleProductsHolder === null) {
      return;
    }

    const upsellSkipButtons = this.upsellProductsHolder?.querySelectorAll(selectors.buttonSkipUpsellProduct) || [];
    const bundleSkipButtons = this.bundleProductsHolder?.querySelectorAll(selectors.buttonSkipUpsellProduct) || [];
    const allSkipButtons = [...upsellSkipButtons, ...bundleSkipButtons];

    if (allSkipButtons.length) {
      allSkipButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
          event.preventDefault();

          const productID = button.closest(selectors.quickAddHolder).getAttribute(attributes.quickAddHolder);
          const isUpsell = !!button.closest(selectors.upsellWidget);
          const isBundle = !!button.closest(selectors.bundleWidget);

          if (isUpsell && !this.skipUpsellProductsArray.includes(productID)) {
            this.skipUpsellProductsArray.push(productID);
            window.sessionStorage.setItem('skip_upsell_products', this.skipUpsellProductsArray);
            this.removeUpsellOrBundleProduct(productID, 'upsell');
          }

          if (isBundle && !this.skipBundleProductsArray.includes(productID)) {
            this.skipBundleProductsArray.push(productID);
            window.sessionStorage.setItem('skip_bundle_products', this.skipBundleProductsArray);
            this.removeUpsellOrBundleProduct(productID, 'bundle');
          }

          this.toggleCartUpsellOrBundleWidgetVisibility();
        });
      });
    }
  }

  /**
   * Check for skipped upsell or bundle product added to session storage
   */
  checkSkippedUpsellOrBundleProductsFromStorage() {
    const types = [
      {key: 'upsell', storageKey: 'skip_upsell_products', array: this.skipUpsellProductsArray},
      {key: 'bundle', storageKey: 'skip_bundle_products', array: this.skipBundleProductsArray},
    ];

    types.forEach(({key, storageKey, array}) => {
      const skippedItems = window.sessionStorage.getItem(storageKey);
      if (skippedItems) {
        skippedItems.split(',').forEach((productID) => {
          if (!array.includes(productID)) {
            array.push(productID);
          }
          this.removeUpsellOrBundleProduct(productID, key);
        });
      }
    });
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

  /**
   * Converts a user input amount to cents (or the smallest currency unit)
   * @param {string|number} input - entered value (e.g. 25.99 or "500.000")
   * @param {string} currencyCode - the currency code, e.g. "USD", "JPY"
   * @returns {number} - value in cents (or units if it's a zero-decimal currency)
   */
  normalizePriceToMinorUnits(input, currencyCode) {
    const zeroDecimalCurrencies = ['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF'];
    const rawValue = parseFloat(input);
    if (isNaN(rawValue)) {
      throw new Error(input);
    }

    const isZeroDecimal = zeroDecimalCurrencies.includes(currencyCode);

    return isZeroDecimal ? Math.round(rawValue) : Math.round(rawValue * 100);
  }

  checkConditions(condition, data) {
    const value = condition.value;
    switch (condition.type) {
      case 'ORDER_AMOUNT':
        const operator = condition.operator;
        const amount = this.normalizePriceToMinorUnits(value, window.Shopify.currency.active);
        const price = data.price;
        const match = (operator === 'greater_than_or_equal' && price >= amount) || (operator === 'less_than_or_equal' && price <= amount) || (operator === 'equal' && price === amount);
        return match;
        break;

      case 'PRODUCT_TAG':
        return data.tags.includes(value);
        break;

      case 'COLLECTION':
        const collectionsIds = data.collections.map((item) => item.id.toString());
        const collectionId = value.replace('gid://shopify/Collection/', '');
        return collectionsIds.includes(collectionId);
        break;

      case 'SPECIFIC_PRODUCT':
        const productId = value.replace('gid://shopify/Product/', '');
        return data.products.includes(productId);
        break;

      default:
        return false;
    }
  }

  checkActiveReward(config) {
    const startDateString = config['promotion-start-date'];
    const startDate = new Date(startDateString);
    const endDateString = config['promotion-end-date'];
    const endDate = new Date(endDateString);
    const status = config['promotion-status'];
    const timeNow = new Date();
    let checkStartDate = true;
    let checkEndDate = true;

    if (isNaN(startDate) || timeNow <= startDate) {
      checkStartDate = false;
    }

    if (!isNaN(endDate) && timeNow >= endDate) {
      checkEndDate = false;
    }

    return status === 'active' && checkStartDate && checkEndDate;
  }

  toggleReward(data) {
    const conditions = data.functionConfig.conditions;
    const rewards = data.functionConfig.rewards;
    let addItems = [];
    let removeItems = [];

    if (conditions?.length && rewards?.length) {
      const addedRewards = data.metaConfig.rewards;
      let result = false;

      for (let i = 0; i < conditions.length; ) {
        let groupResult = this.checkConditions(conditions[i], data.info);
        i++;

        for (; i < conditions.length && conditions[i - 1].logicalOperator === 'AND'; i++) {
          groupResult = groupResult && this.checkConditions(conditions[i], data.info);
        }

        result = result || groupResult;
      }

      if ((result && !addedRewards.length) || (!result && addedRewards.length)) {
        if (result && !addedRewards.length) {
          rewards.forEach((reward) => {
            addItems.push({
              id: parseInt(reward.variantId.replace('gid://shopify/ProductVariant/', '')),
              quantity: reward.quantity ?? 1,
              properties: {
                _reward: `reward`,
              },
            });
          });
        } else {
          removeItems = addedRewards;
        }
      }
    }

    return {addItems, removeItems};
  }

  toggleTier(data) {
    const tierVariants = data.functionConfig.tiers;
    let addItems = [];
    let removeItems = [];

    if (tierVariants?.length) {
      const tierMode = data.functionConfig.cumulative;
      const addedGifts = data.metaConfig.gifts;

      tierVariants.sort((a, b) => b.threshold - a.threshold);

      for (let index = 0; index < tierVariants.length; index++) {
        const tier = tierVariants[index];
        let addVariant = true;
        const variantId = tier.variantId.replace('gid://shopify/ProductVariant/', '');
        const condition = {
          type: 'ORDER_AMOUNT',
          value: tier.threshold,
          operator: 'greater_than_or_equal',
        };
        const resultCondition = this.checkConditions(condition, data.info);

        if (addedGifts.length) {
          addedGifts.forEach((addedReward) => {
            const addedRewardVariantId = addedReward.split(':')[0];

            if (resultCondition && addedRewardVariantId === variantId) {
              addVariant = false;

              if (!tierMode && addItems.length > 0) {
                removeItems.push(addedReward);
              }
            }

            if (!resultCondition && addedRewardVariantId === variantId) {
              removeItems.push(addedReward);
            }
          });
        }

        if (resultCondition && addVariant && addItems.length < 1) {
          addItems.push({
            id: variantId,
            quantity: 1,
            properties: {
              _gift: `gift`,
            },
          });
        }

        if (!tierMode && index === 0 && !addVariant) {
          break;
        }
      }
    }

    return {addItems, removeItems};
  }

  toggleAwards(response) {
    const cartJson = response.querySelector('[data-cart-json]');
    if (cartJson) {
      const info = JSON.parse(cartJson.innerHTML);
      const meta = info.meta;
      let addItems = [];
      let removeItems = [];

      for (const property in meta) {
        const metaConfig = meta[property];
        const config = metaConfig.config;
        const isRewardActive = this.checkActiveReward(config);

        if (isRewardActive) {
          const functionConfig = config['function-configuration'];
          const data = {functionConfig, metaConfig, info};
          const toggleRewardObj = this.toggleReward(data);
          const toggleTierObj = this.toggleTier(data);

          addItems.push(...toggleRewardObj.addItems, ...toggleTierObj.addItems);
          removeItems.push(...toggleRewardObj.removeItems, ...toggleTierObj.removeItems);
        }
      }

      if (addItems.length || removeItems.length) {
        this.showGetCartResponse = false;
        let addItemsSkip = true;

        if (removeItems.length) {
          this.removeMultipleProducts(removeItems);
          addItemsSkip = false;
        }

        if (addItems.length && addItemsSkip) {
          this.addToCart(addItems);
        }
      }
    }
  }

  removeUpsellOrBundleProduct(productID, type = 'upsell') {
    const holders = {
      upsell: this.upsellProductsHolder,
      bundle: this.bundleProductsHolder,
    };
    const holder = holders[type];
    if (!holder) return;

    const product = holder.querySelector(`[${attributes.quickAddHolder}="${productID}"]`);
    if (product && product.parentNode) {
      product.parentNode.remove();
    }
  }

  /**
   * Show or hide cart upsell or bundle products widget visibility
   */
  toggleCartUpsellOrBundleWidgetVisibility() {
    if (!this.upsellProductsHolder && !this.bundleProductsHolder) return;

    const upsellItems = this.upsellProductsHolder?.querySelectorAll(selectors.quickAddHolder);
    const bundleItems = this.bundleProductsHolder?.querySelectorAll(selectors.quickAddHolder);
    const upsellWidget = this.upsellProductsHolder?.closest(selectors.upsellWidget);
    const bundleWidget = this.bundleProductsHolder?.closest(selectors.bundleWidget);

    if (!upsellWidget && !bundleWidget) return;

    // Helper to toggle and auto-open widget
    const toggleWidget = (widget, items, autoOpenAttr) => {
      if (!widget) return;
      widget.classList.toggle(classes.hidden, !items.length);
      if (items.length && !widget.hasAttribute(attributes.open) && widget.hasAttribute(autoOpenAttr)) {
        widget.setAttribute(attributes.open, true);
        const widgetBody = widget.querySelector(selectors.collapsibleBody);
        if (widgetBody) {
          widgetBody.style.height = 'auto';
        }
      }
    };

    toggleWidget(upsellWidget, upsellItems, attributes.upsellAutoOpen);
    toggleWidget(bundleWidget, bundleItems, attributes.upsellAutoOpen);
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
}

if (!customElements.get('cart-items')) {
  customElements.define('cart-items', CartItems);
}
