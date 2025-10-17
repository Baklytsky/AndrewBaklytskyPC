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
  freeShippingGraph: '[data-progress-graph]',
  freeShippingProgress: '[data-progress-bar]',
  headerWrapper: '[data-header-wrapper]',
  item: '[data-item]',
  itemsHolder: '[data-items-holder]',
  leftToSpend: '[data-left-to-spend]',
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
      this.discountButton.addEventListener('click', (event) => {
        event.preventDefault();

        const newDiscountCode = this.discountInput.value.trim();
        this.discountInput.value = '';

        if (newDiscountCode) {
          this.applyDiscount(newDiscountCode);
        }
      });

      // Fill existing discount codes and bind event listeners
      this.bindDiscountEventListeners();
    }

    // Cart events
    this.animateItems = this.animateItems.bind(this);
    this.addToCart = this.addToCart.bind(this);
    this.cartAddEvent = this.cartAddEvent.bind(this);
    this.updateProgress = this.updateProgress.bind(this);
    this.onCartDrawerClose = this.onCartDrawerClose.bind(this);

    // Set global event listeners for "Add to cart" and Announcement bar wheel progress
    document.addEventListener('theme:cart:add', this.cartAddEvent);
    document.addEventListener('theme:announcement:init', this.updateProgress);

    if (theme.settings.cartType == 'drawer') {
      document.addEventListener('theme:cart-drawer:open', this.animateItems);
      document.addEventListener('theme:cart-drawer:close', this.onCartDrawerClose);
    }

    // Upsell or bundle products
    this.skipUpsellProductsArray = [];
    this.skipBundleProductsArray = [];
    this.skipUpsellOrBundleProductEvent();
    this.checkSkippedUpsellOrBundleProductsFromStorage();
    this.toggleCartUpsellOrBundleWidgetVisibility();

    // Free Shipping values
    this.circumference = 28 * Math.PI; // radius - stroke * 4 * PI
    this.freeShippingLimit = this.freeShipping.length ? Number(this.freeShipping[0].getAttribute(attributes.freeShippingLimit)) * 100 * window.Shopify.currency.rate : 0;

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
      this.discountErrorMessage?.classList.add('hidden');
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

    cartItemRemove.forEach((button) => {
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
    let formData = '';
    let button = event.detail.button;

    if (button.hasAttribute('disabled')) return;
    const form = button.form || button.closest('form');
    // Validate form

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    formData = new FormData(form);

    if (form !== null && form.querySelector('[type="file"]')) {
      return;
    }
    if (theme.settings.cartType === 'drawer' && this.cartDrawer) {
      event.preventDefault();
    }

    const maxInventoryReached = form.getAttribute(attributes.maxInventoryReached);
    const errorMessagePosition = form.getAttribute(attributes.errorMessagePosition);
    this.showCannotAddMoreInCart = false;
    if (maxInventoryReached === 'true' && errorMessagePosition === 'cart') {
      this.showCannotAddMoreInCart = true;
    }

    this.addToCart(formData, button);
  }

  /**
   * Bind event listeners for discount elements
   *
   * @return  {Void}
   */
  bindDiscountEventListeners() {
    if (!this.hasDiscountBlock) return;

    this.discounts = document.querySelectorAll(selectors.discountBody);

    this.discounts.forEach((discount) => {
      const discountCode = discount.dataset.discountCode;

      if (!this.existingDiscountCodes.includes(discountCode)) {
        this.existingDiscountCodes.push(discountCode);
      }

      // Add event listener to remove discount
      const removeButton = discount.querySelector(selectors.removeDiscount);
      if (removeButton) {
        // Remove existing listener to prevent duplicates
        removeButton.removeEventListener('click', this.handleRemoveDiscount);

        // Add new listener
        removeButton.addEventListener('click', (event) => {
          event.preventDefault();
          this.removeDiscount(discountCode);
        });
      }
    });
  }

  applyDiscount(discountCode) {
    if (this.existingDiscountCodes.includes(discountCode)) {
      this.discountErrorMessage.classList.remove('hidden');
      this.discountErrorMessage.textContent = window.theme.strings.discount_already_applied;
      return;
    }

    this.existingDiscountCodes.push(discountCode);
    this.updateCartDiscounts(this.existingDiscountCodes.join(','));
  }

  removeDiscount(discountCode) {
    if (!this.existingDiscountCodes.includes(discountCode)) return;

    this.existingDiscountCodes = this.existingDiscountCodes.filter((code) => code !== discountCode);
    this.updateCartDiscounts(this.existingDiscountCodes.join(','));
  }

  updateCartDiscounts(discountString) {
    const lastAttemptedDiscount = discountString
      .split(',')
      .filter((c) => c)
      .pop()
      ?.trim();

    this.disableCartButtons();
    this.discountErrorMessage.classList.add('hidden');

    fetch(window.theme.routes.cart_update_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        discount: discountString,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((text) => {
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse cart update response:', text);
          throw new Error('Invalid JSON response from server.');
        }

        if (lastAttemptedDiscount) {
          const wasApplied = data.discount_codes && Array.isArray(data.discount_codes) && data.discount_codes.some((d) => d.code === lastAttemptedDiscount && d.applicable);

          if (!wasApplied) {
            this.discountError = true;
            this.existingDiscountCodes = this.existingDiscountCodes.filter((code) => code !== lastAttemptedDiscount);
          } else {
            this.discountError = false;
          }
        } else {
          this.discountError = false;
        }

        this.getCart();
      })
      .catch((error) => {
        console.log(error);
      });
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
        const element = document.createElement('div');
        element.innerHTML = response;

        const cleanResponse = element.querySelector(selectors.apiContent);
        this.build(cleanResponse);
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
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/javascript',
      },
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
    item.classList.remove(classes.loading);
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
    const inputs = this.cart.querySelectorAll('input');
    const buttons = this.cart.querySelectorAll(`button, ${selectors.cartItemRemove}`);

    if (inputs.length) {
      inputs.forEach((item) => {
        item.classList.remove(classes.disabled);
        item.disabled = false;
      });
    }

    if (buttons.length) {
      buttons.forEach((item) => {
        item.removeAttribute(attributes.disabled);
      });
    }

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

    this.cartErrorHolder.classList.toggle(classes.expanded, this.cartUpdateFailed || this.showCannotAddMoreInCart);

    // Reset cart error events flag
    this.showCannotAddMoreInCart = false;
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
    const holder = this.button.closest(selectors.upsellHolder) ? this.button.closest(selectors.upsellHolder) : this.button.closest(selectors.productForm);
    const errorContainer = holder?.querySelector(selectors.formErrorsContainer);

    errorContainer?.classList.remove(classes.visible);
  }

  addToCartError(data, button) {
    if (this.showCannotAddMoreInCart) return; // Show error in cart drawer instead of product form

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

        errorContainer.innerHTML = `<div class="errors">${errorMessage}<button type="button" class="errors__close" data-close-error><svg aria-hidden="true" focusable="false" role="presentation" width="24px" height="24px" stroke-width="1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" class="icon icon-cancel"><path d="M6.758 17.243L12.001 12m5.243-5.243L12 12m0 0L6.758 6.757M12.001 12l5.243 5.243" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"></path></svg></button></div>`;
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
   * Build cart depends on results
   *
   * @param   {Object}  data
   *
   * @return  {Void}
   */

  build(data) {
    const cartItemsData = data.querySelector(selectors.apiLineItems);
    const upsellItemsData = data.querySelector(selectors.apiUpsellItems);
    const bundleItemsData = data.querySelector(selectors.apiBundleItems);

    const cartEmptyData = Boolean(cartItemsData === null && upsellItemsData === null && bundleItemsData === null);
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
    } else {
      this.itemsHolder.innerHTML = cartItemsData.innerHTML;

      if (this.upsellProductsHolder) {
        this.upsellProductsHolder.innerHTML = upsellItemsData.innerHTML;
      }

      if (this.bundleProductsHolder) {
        this.bundleProductsHolder.innerHTML = bundleItemsData.innerHTML;
      }

      this.skipUpsellOrBundleProductEvent();
      this.checkSkippedUpsellOrBundleProductsFromStorage();
      this.toggleCartUpsellOrBundleWidgetVisibility();
    }

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

      if (this.discountError) {
        this.discountErrorMessage.textContent = window.theme.strings.discount_not_applicable;
        this.discountErrorMessage.classList.remove('hidden');
      } else {
        this.discountErrorMessage.classList.add('hidden');
      }
    }

    this.freeShippingMessageHandle(this.subtotal);
    this.cartRemoveEvents();
    this.cartUpdateEvents();
    this.toggleErrorMessage();
    this.enableCartButtons();
    this.updateProgress();
    this.animateItems();
    this.bindDiscountEventListeners();

    document.dispatchEvent(
      new CustomEvent('theme:product:added', {
        bubbles: true,
      })
    );
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

    const percentValue = isNaN(this.subtotal / this.freeShippingLimit) ? 100 : this.subtotal / this.freeShippingLimit;
    const percent = Math.min(percentValue * 100, 100);
    const dashoffset = this.circumference - ((percent / 100) * this.circumference) / 2;
    const leftToSpend = window.theme.formatMoney(this.freeShippingLimit - this.subtotal, theme.moneyFormat);

    this.freeShipping.forEach((item) => {
      const progressBar = item.querySelector(selectors.freeShippingProgress);
      const progressGraph = item.querySelector(selectors.freeShippingGraph);
      const leftToSpendMessage = item.querySelector(selectors.leftToSpend);

      if (leftToSpendMessage) {
        leftToSpendMessage.innerHTML = leftToSpend.replace('.00', '');
      }

      // Set progress bar value
      if (progressBar) {
        progressBar.value = percent;
      }

      // Set circle progress
      if (progressGraph) {
        progressGraph.style.setProperty('--stroke-dashoffset', `${dashoffset}`);
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
