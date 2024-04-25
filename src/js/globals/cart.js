import Flickity from 'flickity';
import {formatMoney} from '@shopify/theme-currency';

import {register} from '../vendor/theme-scripts/theme-sections';
import throttle from '../util/throttle';
import FetchError from '../util/fetch-error';
import {Collapsible} from '../features/collapsible';
import QuantityCounter from '../features/quantity-handle';
import QuickViewPopup from '../features/quick-view-popup';
import {NotificationPopup} from '../features/notification-popup';
import {a11y} from '../vendor/theme-scripts/theme-a11y';

const settings = {
  cartDrawerEnabled: window.theme.settings.cartType === 'drawer',
  timers: {
    addProductTimeout: 1000,
  },
  animations: {
    data: 'data-aos',
    method: 'fade-up',
  },
};

const selectors = {
  outerSection: '[data-section-id]',
  aos: '[data-aos]',
  additionalCheckoutButtons: '[data-additional-checkout-button]',
  apiContent: '[data-api-content]',
  apiLineItems: '[data-api-line-items]',
  apiUpsellItems: '[data-api-upsell-items]',
  apiCartPrice: '[data-api-cart-price]',
  buttonAddToCart: '[data-add-to-cart]',
  upsellButtonByHandle: '[data-handle]',
  cartCloseError: '[data-cart-error-close]',
  cartDrawer: '[data-cart-drawer]',
  cartDrawerTemplate: '[data-cart-drawer-template]',
  cartDrawerToggle: '[data-cart-drawer-toggle]',
  cartDrawerBody: '[data-cart-drawer-body]',
  cartErrors: '[data-cart-errors]',
  cartForm: '[data-cart-form]',
  cartTermsCheckbox: '[data-cart-acceptance-checkbox]',
  cartCheckoutButtonWrapper: '[data-cart-checkout-buttons]',
  cartCheckoutButton: '[data-cart-checkout-button]',
  cartItemRemove: '[data-item-remove]',
  cartItemsQty: '[data-cart-items-qty]',
  cartTotal: '[data-cart-total]',
  cartTotalPrice: '[data-cart-total-price]',
  cartMessage: '[data-cart-message]',
  cartMessageDefault: '[data-message-default]',
  cartPage: '[data-cart-page]',
  cartProgress: '[data-cart-message-progress]',
  emptyMessage: '[data-empty-message]',
  buttonHolder: '[data-foot-holder]',
  item: '[data-cart-item]',
  itemsHolder: '[data-items-holder]',
  itemsWrapper: '[data-items-wrapper]',
  formCloseError: '[data-close-error]',
  formErrorsContainer: '[data-cart-errors-container]',
  upsellHolder: '[data-upsell-holder]',
  errorMessage: '[data-error-message]',
  termsErrorMessage: '[data-terms-error-message]',
  pairProductsHolder: '[data-pair-products-holder]',
  pairProducts: '[data-pair-products]',
  priceHolder: '[data-cart-price-holder]',
  leftToSpend: '[data-left-to-spend]',
  quickBuyForm: '[data-quickbuy-form]',
  qtyInput: '[data-quantity-field]',
  productMediaContainer: '[data-product-media-container]',
  formWrapper: '[data-form-wrapper]',
  productForm: '[data-product-form]',
  popupQuickView: '.popup-quick-view',
  popupClose: '[data-popup-close]',
  error: '[data-error]',
  quickViewOnboarding: '[data-quick-view-onboarding]',
  flickityEnabled: '.flickity-enabled',
};

const classes = {
  hidden: 'hidden',
  added: 'is-added',
  isHidden: 'is-hidden',
  cartDrawerOpen: 'js-drawer-open-cart',
  open: 'is-open',
  visible: 'is-visible',
  expanded: 'is-expanded',
  loading: 'is-loading',
  disabled: 'is-disabled',
  success: 'is-success',
  error: 'has-error',
  cartItems: 'cart__toggle--has-items',
  variantSoldOut: 'variant--soldout',
  removed: 'is-removed',
  aosAnimate: 'aos-animate',
  updated: 'is-updated',
  noOutline: 'no-outline',
  productGridImageError: 'product-grid-item__image--error',
  contentVisibilityHidden: 'cv-h',
};

const attributes = {
  shippingMessageLimit: 'data-limit',
  cartMessageValue: 'data-cart-message',
  cartTotal: 'data-cart-total',
  ariaExpanded: 'aria-expanded',
  disabled: 'disabled',
  value: 'value',
  dataId: 'data-id',
  item: 'data-item',
  itemIndex: 'data-item-index',
  itemTitle: 'data-item-title',
  atcTrigger: 'data-atc-trigger',
  upsellButton: 'data-upsell-btn',
  notificationPopup: 'data-notification-popup',
  sectionId: 'data-section-id',
  recipientError: 'data-recipient-errors',
};

let sections = {};

class CartDrawer {
  constructor() {
    if (window.location.pathname === '/password') {
      return;
    }

    this.init();
  }

  init() {
    // DOM Elements
    this.cartToggleButtons = document.querySelectorAll(selectors.cartDrawerToggle);
    this.cartPage = document.querySelector(selectors.cartPage);
    this.cartDrawer = document.querySelector(selectors.cartDrawer);
    this.cart = this.cartDrawer || this.cartPage;

    this.cartCount = this.getCartItemCount();

    this.assignArguments();

    this.recipientErrors = this.form?.getAttribute(attributes.recipientError) === 'true';
    this.flktyUpsell = null;
    this.form = null;
    this.collapsible = null;
    this.a11y = a11y;

    this.build = this.build.bind(this);

    // AJAX request
    this.addToCart = this.addToCart.bind(this);
    this.updateCart = this.updateCart.bind(this);

    // Cart events
    this.openCartDrawer = this.openCartDrawer.bind(this);
    this.closeCartDrawer = this.closeCartDrawer.bind(this);
    this.toggleCartDrawer = this.toggleCartDrawer.bind(this);
    this.formSubmitHandler = throttle(this.formSubmitHandler.bind(this), 50);
    this.closeCartError = () => {
      this.cartErrorHolder.classList.remove(classes.expanded);
    };
    this.cartDrawerCloseEvent = null;

    // Checking
    this.hasItemsInCart = this.hasItemsInCart.bind(this);
    this.isCartPage = Boolean(this.cart && this.cartDrawer === null);
    this.showAnimations = Boolean(document.body.dataset.animations === 'true');

    // Set classes
    this.toggleClassesOnContainers = this.toggleClassesOnContainers.bind(this);

    // Flags
    this.totalItems = 0;
    this.isCartDrawerOpen = false;
    this.isCartDrawerLoaded = false;
    this.cartDiscounts = 0;
    this.cartDrawerEnabled = settings.cartDrawerEnabled;
    this.cartAnimationTimer = 0;
    this.cartUpdateFailed = false;

    // Cart Events
    this.cartEvents();
    this.cartAddEvent();
    this.cartDrawerToggleEvents();

    // Init quantity for fields
    this.initQuantity();

    // Init collapsible function for the cart accordions
    if (this.buttonHolder) {
      this.collapsible = new Collapsible(this.buttonHolder);
    }

    if (this.isCartPage) {
      this.renderPairProducts();
    }

    document.addEventListener('theme:popup:open', this.closeCartDrawer);
  }

  /**
   * Assign cart constructor arguments on page load or after cart drawer is loaded
   *
   * @return  {Void}
   */
  assignArguments() {
    this.cartDrawerBody = document.querySelector(selectors.cartDrawerBody);
    this.emptyMessage = document.querySelector(selectors.emptyMessage);
    this.buttonHolder = document.querySelector(selectors.buttonHolder);
    this.itemsHolder = document.querySelector(selectors.itemsHolder);
    this.cartItemsQty = document.querySelector(selectors.cartItemsQty);
    this.itemsWrapper = document.querySelector(selectors.itemsWrapper);
    this.items = document.querySelectorAll(selectors.item);
    this.cartTotal = document.querySelector(selectors.cartTotal);
    this.cartTotalPrice = document.querySelector(selectors.cartTotalPrice);
    this.cartMessage = document.querySelectorAll(selectors.cartMessage);
    this.cartOriginalTotal = document.querySelector(selectors.cartOriginalTotal);
    this.cartErrorHolder = document.querySelector(selectors.cartErrors);
    this.cartCloseErrorMessage = document.querySelector(selectors.cartCloseError);
    this.pairProductsHolder = document.querySelector(selectors.pairProductsHolder);
    this.pairProducts = document.querySelector(selectors.pairProducts);
    this.priceHolder = document.querySelector(selectors.priceHolder);
    this.upsellHolders = document.querySelectorAll(selectors.upsellHolder);
    this.cartTermsCheckbox = document.querySelector(selectors.cartTermsCheckbox);
    this.cartCheckoutButtonWrapper = document.querySelector(selectors.cartCheckoutButtonWrapper);
    this.cartCheckoutButton = document.querySelector(selectors.cartCheckoutButton);
    this.cartForm = document.querySelector(selectors.cartForm);
    this.cartItemCount = 0;
    this.subtotal = window.theme.subtotal;
    this.button = null;

    if (this.cartMessage.length > 0) {
      this.cartFreeLimitShipping = Number(this.cartMessage[0].getAttribute(attributes.shippingMessageLimit)) * 100 * window.Shopify.currency.rate;
    }

    this.updateProgress();
  }

  /**
   * Init quantity field functionality
   *
   * @return  {Void}
   */

  initQuantity() {
    this.items = document.querySelectorAll(selectors.item);

    this.items?.forEach((item) => {
      const quantity = new QuantityCounter(item, true);

      quantity.init();
      this.cartUpdateEvent(item);
    });
  }

  /**
   * Custom event who change the cart
   *
   * @return  {Void}
   */

  cartUpdateEvent(item) {
    item.addEventListener('theme:cart:update', (event) => {
      this.updateCart(
        {
          id: event.detail.id,
          quantity: event.detail.quantity,
        },
        item
      );
    });
  }

  /**
   * Cart events
   *
   * @return  {Void}
   */

  cartEvents() {
    const cartItemRemove = document.querySelectorAll(selectors.cartItemRemove);
    this.totalItems = cartItemRemove.length;

    cartItemRemove?.forEach((button) => {
      const item = button.closest(selectors.item);
      button.addEventListener('click', (event) => {
        event.preventDefault();

        if (button.classList.contains(classes.disabled)) return;

        this.updateCart(
          {
            id: item.getAttribute(attributes.dataId),
            quantity: 0,
          },
          item
        );
      });
    });

    if (this.cartCloseErrorMessage) {
      this.cartCloseErrorMessage.removeEventListener('click', this.closeCartError);
      this.cartCloseErrorMessage.addEventListener('click', this.closeCartError);
    }

    if (this.cartTermsCheckbox) {
      this.cartTermsCheckbox.removeEventListener('change', this.formSubmitHandler);
      this.cartCheckoutButtonWrapper.removeEventListener('click', this.formSubmitHandler);
      this.cartForm.removeEventListener('submit', this.formSubmitHandler);

      this.cartTermsCheckbox.addEventListener('change', this.formSubmitHandler);
      this.cartCheckoutButtonWrapper.addEventListener('click', this.formSubmitHandler);
      this.cartForm.addEventListener('submit', this.formSubmitHandler);
    }
  }

  /**
   * Cart event add product to cart
   *
   * @return  {Void}
   */

  cartAddEvent() {
    document.addEventListener('click', (event) => {
      const clickedElement = event.target;
      const isButtonATC = clickedElement?.matches(selectors.buttonAddToCart);
      const getButtonATC = clickedElement?.closest(selectors.buttonAddToCart);

      if (isButtonATC || getButtonATC) {
        event.preventDefault();

        this.button = isButtonATC ? clickedElement : getButtonATC;
        this.form = clickedElement.closest('form');
        this.recipientErrors = this.form?.getAttribute(attributes.recipientError) === 'true';
        this.formWrapper = this.button.closest(selectors.formWrapper);
        const isVariantSoldOut = this.formWrapper?.classList.contains(classes.variantSoldOut);
        const isButtonDisabled = this.button.hasAttribute(attributes.disabled);
        const isQuickViewOnboarding = this.button.closest(selectors.quickViewOnboarding);
        const hasDataAtcTrigger = this.button.hasAttribute(attributes.atcTrigger);
        const hasNotificationPopup = this.button.hasAttribute(attributes.notificationPopup);
        const hasFileInput = this.form?.querySelector('[type="file"]');

        if (isButtonDisabled || hasFileInput || isQuickViewOnboarding) return;

        // Notification popup
        if (isVariantSoldOut && hasNotificationPopup) {
          new NotificationPopup(this.button);
          return;
        }

        if (hasDataAtcTrigger) {
          this.a11y.state.trigger = this.button;
        }

        const formData = new FormData(this.form);
        this.addToCart(formData);

        // Hook for cart/add.js event
        document.dispatchEvent(
          new CustomEvent('theme:cart:add', {
            bubbles: true,
            detail: {
              selector: clickedElement,
            },
          })
        );
      }
    });
  }

  /**
   * Get response from the cart
   *
   * @return  {Void}
   */

  getCart() {
    // Render cart drawer if it exists but it's not loaded yet
    if (this.cartDrawer && !this.isCartDrawerLoaded) {
      const alwaysOpen = false;
      this.renderCartDrawer(alwaysOpen);
    }

    fetch(theme.routes.cart_url + '?section_id=api-cart-items')
      .then(this.handleErrors)
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
   * @param   {String}  data
   * @param   {DOM Element}  button
   *
   * @return  {Void}
   */

  addToCart(data) {
    if (this.cartDrawerEnabled && this.button) {
      this.button.classList.add(classes.loading);
      this.button.setAttribute(attributes.disabled, true);
    }

    fetch(theme.routes.cart_add_url, {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/javascript',
      },
      body: data,
    })
      .then((response) => response.json())
      .then((response) => {
        this.button.disabled = true;
        this.addLoadingClass();

        if (response.status) {
          this.addToCartError(response);
          this.removeLoadingClass();
          return;
        }

        this.hideAddToCartErrorMessage();

        if (this.cartDrawerEnabled) {
          this.getCart();
        } else {
          window.location = theme.routes.cart_url;
        }
      })
      .catch((error) => console.log(error));
  }

  /**
   * Update cart
   *
   * @param   {Object}  updateData
   *
   * @return  {Void}
   */

  updateCart(updateData = {}, currentItem = null) {
    let updatedQuantity = updateData.quantity;
    if (currentItem !== null) {
      if (updatedQuantity) {
        currentItem.classList.add(classes.loading);
      } else {
        currentItem.classList.add(classes.removed);
      }
    }
    this.disableCartButtons();
    this.addLoadingClass();

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
        if (response.status === 400) {
          const error = new Error(response.status);
          this.cartDrawerEnabled ? this.getCart() : (window.location = theme.routes.cart_url);
          throw error;
        }

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
          this.removeLoadingClass();

          return;
        }

        this.getCart();
      })
      .catch((error) => {
        console.log(error);
        this.enableCartButtons();
        this.removeLoadingClass();
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

    if (this.cartUpdateFailed) {
      const cartCloseError = this.cartErrorHolder.querySelector(selectors.cartCloseError);
      this.focusOnErrorMessage(this.cartErrorHolder, cartCloseError);
    }

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

  handleErrors(response) {
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

  addToCartError(data) {
    const buttonQuickBuyForm = this.button.closest(selectors.quickBuyForm);
    const buttonUpsellHolder = this.button.closest(selectors.upsellHolder);
    const isFocusEnabled = !document.body.classList.contains(classes.noOutline);
    // holder: Product form containers or Upsell products in Cart form
    let holder = this.button.closest(selectors.productForm) ? this.button.closest(selectors.productForm) : this.button.closest(selectors.upsellHolder);
    let errorContainer = holder.querySelector(selectors.formErrorsContainer);

    // Upsell products in Cart form
    if (buttonUpsellHolder) {
      errorContainer = buttonUpsellHolder.querySelector(selectors.formErrorsContainer);
    }

    if (this.cartDrawerEnabled && this.button && this.button.closest(selectors.cartDrawer) !== null && !this.button.closest(selectors.cartDrawer)) {
      this.closeCartDrawer();
    }

    this.button.classList.remove(classes.loading);
    this.button.removeAttribute(attributes.disabled);

    // Error message content
    const closeErrorButton = buttonQuickBuyForm
      ? ''
      : `
      <button type="button" class="errors__button-close" data-close-error>
        ${theme.icons.close}
      </button>
    `;

    let errorMessages = `${data.message}: ${data.description}`;
    if (this.recipientErrors && data.description && typeof data.description === 'object') {
      errorMessages = Object.entries(data.description)
        .map(([key, value]) => `${value}`)
        .join('<br>');
    }

    errorContainer.innerHTML = `
      <div class="errors" data-error autofocus>
        ${errorMessages}
        ${closeErrorButton}
      </div>
    `;

    // Quick buy in PGI errors
    if (buttonQuickBuyForm) {
      const productMediaContainer = errorContainer.closest(selectors.productMediaContainer);
      productMediaContainer.classList.add(classes.productGridImageError);

      errorContainer.querySelector(selectors.error).addEventListener('animationend', () => {
        productMediaContainer.classList.remove(classes.productGridImageError);
        errorContainer.innerHTML = '';

        if (!isFocusEnabled) {
          document.activeElement.blur();
        }
      });
    } else {
      // PDP form, Quick view popup forms and Upsell sliders errors
      errorContainer.classList.add(classes.visible);
      errorContainer.addEventListener('transitionend', () => {
        this.resizeSliders(errorContainer);
      });

      this.handleCloseErrorMessages(errorContainer);
    }
  }

  /**
   * Handle close buttons in error messages containers
   *
   * @param   {Object}  The error container that holds the close button
   * @return  {Void}
   */
  handleCloseErrorMessages(container) {
    const formErrorClose = container.querySelector(selectors.formCloseError);

    formErrorClose?.addEventListener('click', (event) => {
      const clickedElement = event.target;
      const isFormCloseError = clickedElement.matches(selectors.formCloseError) || clickedElement.closest(selectors.formCloseError);

      if (!isFormCloseError) return;

      event.preventDefault();
      container.classList.remove(classes.visible);
      container.querySelector(selectors.error).addEventListener('transitionend', () => {
        container.innerHTML = '';
        this.resizeSliders(clickedElement);
      });
    });

    this.focusOnErrorMessage(container, formErrorClose);
  }

  /**
   * Focus on the error container's close button so that the alert message is read outloud on voiceover assistive technologies
   *
   * @param   {Object}  The error container that holds the error message
   * @param   {Object}  The button that closes the error message
   * @return  {Void}
   */
  focusOnErrorMessage(container, button) {
    const isFocusEnabled = !document.body.classList.contains(classes.noOutline);

    if (!isFocusEnabled) return;

    container.addEventListener('transitionend', () => {
      requestAnimationFrame(() => button?.focus({focusVisible: true}));
    });
  }

  /**
   * Hide error message container as soon as an item is successfully added to the cart
   */
  hideAddToCartErrorMessage() {
    const holder = this.button.closest(selectors.upsellHolder) ? this.button.closest(selectors.upsellHolder) : this.button.closest(selectors.productForm);
    const errorContainer = holder?.querySelector(selectors.formErrorsContainer);
    errorContainer?.classList.remove(classes.visible);
  }

  /**
   * Resize sliders height
   *
   * @param   {Object}  Element within the slider container that would be resized
   * @return  {Void}
   */
  resizeSliders(element) {
    const slider = element.closest(selectors.flickityEnabled);

    if (!slider) return;

    const flkty = Flickity.data(slider);
    requestAnimationFrame(() => flkty.resize());
  }

  /**
   * Render cart and define all elements after cart drawer is open for a first time
   *
   * @return  {Void}
   */
  renderCartDrawer(alwaysOpen = true) {
    const cartDrawerTemplate = document.querySelector(selectors.cartDrawerTemplate);

    if (!cartDrawerTemplate) {
      return;
    }

    // Append cart items HTML to the cart drawer container
    this.cartDrawer.innerHTML = cartDrawerTemplate.innerHTML;
    this.assignArguments();

    // Bind cart quantity events
    this.initQuantity();

    // Bind cart events
    this.cartEvents();

    // Init collapsible function for the cart drawer accordions
    if (this.buttonHolder) {
      this.collapsible = new Collapsible(this.buttonHolder);
    }

    // Bind cart drawer close button event
    this.cartDrawerToggle = this.cartDrawer.querySelector(selectors.cartDrawerToggle);
    this.cartDrawerToggle.addEventListener('click', this.cartDrawerToggleClickEvent);

    this.isCartDrawerLoaded = true;

    this.renderPairProducts();

    // Hook for cart drawer loaded event
    document.dispatchEvent(new CustomEvent('theme:cart:loaded', {bubbles: true}));

    // Open cart drawer after cart items and events are loaded
    if (alwaysOpen) {
      this.openCartDrawer();
    }
  }

  /**
   * Open cart dropdown and add class on body
   *
   * @return  {Void}
   */

  openCartDrawer() {
    if (this.isCartDrawerOpen) {
      return;
    }

    if (!this.isCartDrawerLoaded) {
      this.renderCartDrawer();
      return;
    }

    // Hook for cart drawer open event
    document.dispatchEvent(new CustomEvent('theme:cart:open', {bubbles: true}));
    document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: this.cartDrawer}));
    document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: this.cartDrawerBody}));

    document.body.classList.add(classes.cartDrawerOpen);
    this.cartDrawer.classList.add(classes.open);
    this.cartDrawer.classList.remove(classes.contentVisibilityHidden);

    // Cart elements opening animation
    this.cartDrawer.querySelectorAll(selectors.aos).forEach((item) => {
      requestAnimationFrame(() => {
        item.classList.add(classes.aosAnimate);
      });
    });

    this.cartToggleButtons.forEach((button) => {
      button.setAttribute(attributes.ariaExpanded, true);
    });

    this.a11y.trapFocus({
      container: this.cartDrawer,
    });

    // Observe Additional Checkout Buttons
    this.observeAdditionalCheckoutButtons();
    this.isCartDrawerOpen = true;
  }

  /**
   * Close cart dropdown and remove class on body
   *
   * @return  {Void}
   */

  closeCartDrawer() {
    if (!this.isCartDrawerOpen) {
      return;
    }

    // Hook for cart drawer close event
    document.dispatchEvent(new CustomEvent('theme:cart:close', {bubbles: true}));

    // Cart elements closing animation

    if (this.cartAnimationTimer) {
      clearTimeout(this.cartAnimationTimer);
    }

    this.cartAnimationTimer = setTimeout(() => {
      this.cartDrawer.querySelectorAll(selectors.aos).forEach((item) => {
        item.classList.remove(classes.aosAnimate);
      });
    }, 300);

    this.cartErrorHolder.classList.remove(classes.expanded);

    this.a11y.removeTrapFocus();

    this.cartToggleButtons.forEach((button) => {
      button.setAttribute(attributes.ariaExpanded, false);
    });

    document.body.classList.remove(classes.cartDrawerOpen);
    this.cartDrawer.classList.remove(classes.open);
    this.itemsHolder.classList.remove(classes.updated);

    const onCartDrawerTransitionEnd = (event) => {
      if (event.target !== this.cartDrawer) return;

      requestAnimationFrame(() => {
        this.cartDrawer.classList.add(classes.contentVisibilityHidden);
      });

      this.cartDrawer.removeEventListener('transitionend', onCartDrawerTransitionEnd);
    };

    this.cartDrawer.addEventListener('transitionend', onCartDrawerTransitionEnd);

    // Fixes header background update on cart-drawer close
    const isFocusEnabled = !document.body.classList.contains(classes.noOutline);
    if (!isFocusEnabled) {
      requestAnimationFrame(() => {
        document.activeElement.blur();
      });
    }

    // Enable page scroll right after the closing animation ends
    const timeout = 400;
    document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true, detail: timeout}));

    this.isCartDrawerOpen = false;
  }

  /**
   * Toggle cart dropdown
   *
   * @return  {Void}
   */

  toggleCartDrawer() {
    if (this.isCartDrawerOpen) {
      this.closeCartDrawer();
    } else {
      this.openCartDrawer();
    }
  }

  /**
   * Cart drawer toggle events
   *
   * @return  {Void}
   */

  cartDrawerToggleEvents() {
    if (!this.cartDrawer) return;

    // Close cart drawer on ESC key pressed
    this.cartDrawer.addEventListener('keyup', (event) => {
      if (event.code === theme.keyboardKeys.ESCAPE) {
        this.closeCartDrawer();
      }
    });

    // Define cart drawer toggle button click event
    this.cartDrawerToggleClickEvent = (event) => {
      event.preventDefault();
      const button = event.target;

      if (button.getAttribute(attributes.ariaExpanded) === 'false') {
        this.a11y.state.trigger = button;
      }

      this.toggleCartDrawer();
    };

    // Define cart drawer close event
    this.cartDrawerCloseEvent = (event) => {
      const isCartDrawerToggle = event.target.matches(selectors.cartDrawerToggle);
      const isCartDrawerChild = document.querySelector(selectors.cartDrawer).contains(event.target);
      const isPopupQuickView = event.target.closest(selectors.popupQuickView);

      if (!isCartDrawerToggle && !isCartDrawerChild && !isPopupQuickView) {
        this.closeCartDrawer();
      }
    };

    // Bind cart drawer toggle buttons click event
    this.cartToggleButtons.forEach((button) => {
      button.addEventListener('click', this.cartDrawerToggleClickEvent);
    });

    // Close drawers on click outside
    //   Replaced 'click' with 'mousedown' as a quick and simple fix to the dragging issue on the upsell slider
    //   which was causing the cart-drawer to close when we start dragging the slider and finish our drag outside the cart-drawer
    //   which was triggering the 'click' event
    document.addEventListener('mousedown', this.cartDrawerCloseEvent);
  }

  /**
   * Toggle classes on different containers and messages
   *
   * @return  {Void}
   */

  toggleClassesOnContainers() {
    const that = this;

    this.emptyMessage.classList.toggle(classes.hidden, that.hasItemsInCart());
    this.buttonHolder.classList.toggle(classes.hidden, !that.hasItemsInCart());
    this.itemsHolder.classList.toggle(classes.hidden, !that.hasItemsInCart());
    this.cartItemsQty.classList.toggle(classes.hidden, !that.hasItemsInCart());
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
    const cartEmptyData = Boolean(cartItemsData === null && upsellItemsData === null);
    const priceData = data.querySelector(selectors.apiCartPrice);
    const cartTotal = data.querySelector(selectors.cartTotal);

    if (this.priceHolder && priceData) {
      this.priceHolder.innerHTML = priceData.innerHTML;
    }

    // Cart page empty state animations re-init
    this.emptyMessage.querySelectorAll(selectors.aos).forEach((item) => {
      item.classList.remove(classes.aosAnimate);
    });

    if (cartEmptyData) {
      this.itemsHolder.innerHTML = '';

      if (this.pairProductsHolder) {
        this.pairProductsHolder.innerHTML = '';
      }
    } else {
      this.itemsHolder.innerHTML = cartItemsData.innerHTML;

      if (this.pairProductsHolder) {
        this.pairProductsHolder.innerHTML = upsellItemsData.innerHTML;
      }

      this.renderPairProducts();
    }

    this.newTotalItems = cartItemsData && cartItemsData.querySelectorAll(selectors.item).length ? cartItemsData.querySelectorAll(selectors.item).length : 0;
    this.subtotal = cartTotal && cartTotal.hasAttribute(attributes.cartTotal) ? parseInt(cartTotal.getAttribute(attributes.cartTotal)) : 0;
    this.cartCount = this.getCartItemCount();

    if (this.cartMessage.length > 0) {
      this.updateProgress();
    }

    this.cartToggleButtons.forEach((button) => {
      button.classList.remove(classes.cartItems);

      if (this.newTotalItems > 0) {
        button.classList.add(classes.cartItems);
      }
    });

    this.toggleErrorMessage();
    this.updateItemsQuantity(this.cartCount);

    // Update cart total price
    this.cartTotalPrice.innerHTML = this.subtotal === 0 ? window.theme.strings.free : formatMoney(this.subtotal, theme.moneyWithCurrencyFormat);

    if (this.totalItems !== this.newTotalItems) {
      this.totalItems = this.newTotalItems;

      this.toggleClassesOnContainers();
    }

    // Add class "is-updated" line items holder to reduce cart items animation delay via CSS variables
    if (this.isCartDrawerOpen) {
      this.itemsHolder.classList.add(classes.updated);
    }

    this.cartEvents();
    this.initQuantity();
    this.enableCartButtons();
    this.resetButtonClasses();
    this.removeLoadingClass();

    document.dispatchEvent(new CustomEvent('theme:cart:added', {bubbles: true}));

    if (this.cartDrawer) {
      this.openCartDrawer();
    }
  }

  /**
   * Get cart item count
   *
   * @return  {Void}
   */

  getCartItemCount() {
    // Returning 0 and not the actual cart items count is done only for when "Cart type" settings are set to "Page"
    // The actual count is necessary only when we build and render the cart/cart-drawer after we get a response from the Cart API
    if (!this.cart) return 0;
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
    if (this.cartMessage.length > 0) {
      document.querySelectorAll(selectors.cartMessage).forEach((message) => {
        const hasFreeShipping = message.hasAttribute(attributes.cartMessageValue) && message.getAttribute(attributes.cartMessageValue) === 'true' && total !== 0;
        const cartMessageDefault = message.querySelector(selectors.cartMessageDefault);

        message.classList.toggle(classes.success, total >= this.cartFreeLimitShipping && hasFreeShipping);
        message.classList.toggle(classes.isHidden, total === 0);
        cartMessageDefault.classList.toggle(classes.isHidden, total >= this.cartFreeLimitShipping);
      });
    }
  }

  /**
   * Update progress when update cart
   *
   * @return  {Void}
   */

  updateProgress() {
    const newPercentValue = (this.subtotal / this.cartFreeLimitShipping) * 100;
    const leftToSpend = theme.settings.currency_code_enable
      ? formatMoney(this.cartFreeLimitShipping - this.subtotal, theme.moneyWithCurrencyFormat)
      : formatMoney(this.cartFreeLimitShipping - this.subtotal, theme.moneyFormat);

    if (this.cartMessage.length > 0) {
      document.querySelectorAll(selectors.cartMessage).forEach((message) => {
        const cartMessageProgressItems = message.querySelectorAll(selectors.cartProgress);
        const leftToSpendMessage = message.querySelector(selectors.leftToSpend);

        if (leftToSpendMessage) {
          leftToSpendMessage.innerHTML = leftToSpend.replace('.00', '').replace(',00', '');
        }

        if (cartMessageProgressItems.length) {
          cartMessageProgressItems.forEach((cartMessageProgress, index) => {
            cartMessageProgress.classList.toggle(classes.isHidden, this.subtotal / this.cartFreeLimitShipping >= 1);
            cartMessageProgress.style.setProperty('--progress-width', `${newPercentValue}%`);
            if (index === 0) {
              cartMessageProgress.setAttribute(attributes.value, newPercentValue);
            }
          });
        }

        this.freeShippingMessageHandle(this.subtotal);
      });
    }
  }

  /**
   * Render Upsell Products
   */
  renderPairProducts() {
    this.flktyUpsell = null;
    this.pairProductsHolder = document.querySelector(selectors.pairProductsHolder);
    this.pairProducts = document.querySelector(selectors.pairProducts);
    this.upsellHolders = document.querySelectorAll(selectors.upsellHolder);

    if (this.pairProductsHolder === null || this.pairProductsHolder === undefined) {
      return;
    }

    // Upsell slider
    const that = this;
    if (this.upsellHolders.length > 1) {
      this.flktyUpsell = new Flickity(this.pairProducts, {
        wrapAround: true,
        pageDots: true,
        adaptiveHeight: true,
        prevNextButtons: false,
        on: {
          ready: function () {
            new QuickViewPopup(that.cart);
            this.reloadCells();
            requestAnimationFrame(() => this.resize());
          },
        },
      });

      return;
    }

    // Single upsell item
    new QuickViewPopup(this.cart);
  }

  updateItemsQuantity(itemsQty) {
    let oneItemText = theme.strings.cart_items_one;
    let manyItemsText = theme.strings.cart_items_many;
    oneItemText = oneItemText.split('}}')[1];
    manyItemsText = manyItemsText.split('}}')[1];

    if (this.cartItemsQty) {
      this.cartItemsQty.textContent = itemsQty === 1 ? `${itemsQty} ${oneItemText}` : `${itemsQty} ${manyItemsText}`;
    }
  }

  observeAdditionalCheckoutButtons() {
    // identify an element to observe
    const additionalCheckoutButtons = this.cart.querySelector(selectors.additionalCheckoutButtons);
    if (additionalCheckoutButtons) {
      // create a new instance of `MutationObserver` named `observer`,
      // passing it a callback function
      const observer = new MutationObserver(() => {
        this.a11y.removeTrapFocus();
        this.a11y.trapFocus({
          container: this.cart,
        });
        observer.disconnect();
      });

      // call `observe()` on that MutationObserver instance,
      // passing it the element to observe, and the options object
      observer.observe(additionalCheckoutButtons, {subtree: true, childList: true});
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

      termsError.innerText = theme.strings.cart_acceptance_error;
      this.cartCheckoutButton.setAttribute(attributes.disabled, true);
      termsError.classList.add(classes.expanded);
    } else {
      termsError.classList.remove(classes.expanded);
      this.cartCheckoutButton.removeAttribute(attributes.disabled);
    }
  }

  resetButtonClasses() {
    const buttons = document.querySelectorAll(selectors.buttonAddToCart);
    if (buttons) {
      buttons.forEach((button) => {
        if (button.classList.contains(classes.loading)) {
          button.classList.remove(classes.loading);
          button.classList.add(classes.success);

          setTimeout(() => {
            button.removeAttribute(attributes.disabled);
            button.classList.remove(classes.success);
          }, settings.timers.addProductTimeout);
        }
      });
    }
  }

  addLoadingClass() {
    if (this.cartDrawer) {
      this.cartDrawer.classList.add(classes.loading);
    } else if (this.itemsWrapper) {
      this.itemsWrapper.classList.add(classes.loading);
    }
  }

  removeLoadingClass() {
    if (this.cartDrawer) {
      this.cartDrawer.classList.remove(classes.loading);
    } else if (this.itemsWrapper) {
      this.itemsWrapper.classList.remove(classes.loading);
    }
  }

  unload() {
    if (this.cartDrawerToggle) {
      this.cartDrawerToggle.removeEventListener('click', this.cartDrawerToggleClickEvent);
    }

    this.cartToggleButtons.forEach((button) => {
      button.removeEventListener('click', this.cartDrawerToggleClickEvent);
    });

    // Close drawers on click outside
    document.removeEventListener('mousedown', this.cartDrawerCloseEvent);

    if (this.collapsible !== null) {
      this.collapsible.onUnload();
    }
  }
}

const cartDrawer = {
  onLoad() {
    sections[this.id] = new CartDrawer();
  },
  onUnload() {
    if (typeof sections[this.id].unload === 'function') {
      sections[this.id].unload();
    }
  },
};

export default CartDrawer;
register('cart-template', cartDrawer);
