import {ProductModel} from '../features/product-model';

const selectors = {
  productComponent: 'product-component',
  addToCart: '[data-add-to-cart]',
  productImage: '[data-product-image]',
  productJson: '[data-product-json]',
  productPage: '.product__page',
  headerSticky: '[data-header-sticky]',
  productMediaList: '[data-product-media-list]',
  form: '[data-product-form]',
  cartBar: '#cart-bar',
  productSubmitAdd: '.product__submit__add',
  formWrapper: '[data-form-wrapper]',
  productVariants: '[data-product-variants]',
  swapUrl: '[data-swap-url]',
  productNotification: 'product-notification',
  notificationPopupButton: '[data-notification-popup-button]',
  popupComponent: 'popup-component',
  popupOpen: '[data-popup-open]',
};

const classes = {
  added: 'is-added',
  expanded: 'is-expanded',
  loading: 'is-loading',
  visible: 'is-visible',
  sticky: 'is-sticky',
};

const attributes = {
  cartBarEnabled: 'data-cart-bar-enabled',
  cartBarAdd: 'data-add-to-cart-bar',
  cartBarScroll: 'data-cart-bar-scroll',
  stickyEnabled: 'data-sticky-enabled',
  swapUrl: 'data-swap-url',
};

if (!customElements.get('product-component')) {
  customElements.define(
    'product-component',
    class ProductComponent extends HTMLElement {
      abortController = undefined;
      pendingRequestUrl = null;
      preProcessHtmlCallbacks = [];
      postProcessHtmlCallbacks = [];

      handleClick = (event) => this.handleChange(event);

      constructor() {
        super();

        this.stickyEnabled = this.getAttribute(attributes.stickyEnabled) === 'true';
        this.formWrapper = this.querySelector(selectors.formWrapper);
        this.productNotification = this.querySelector(selectors.productNotification);
        this.cartBarEnabled = this.hasAttribute(attributes.cartBarEnabled);
        this.cartBar = this.querySelector(selectors.cartBar);
        this.setCartBarHeight = this.setCartBarHeight.bind(this);
        this.scrollToTop = this.scrollToTop.bind(this);
        this.toggleCartBarOnScroll = this.toggleCartBarOnScroll.bind(this);
        this.unlockTimer = 0;
        this.swapElements = this.querySelectorAll(selectors.swapUrl);
        this.sectionId = this.dataset.sectionId;
      }

      connectedCallback() {
        // Stop parsing if we don't have the product json script tag when loading
        // section in the Theme Editor
        const productJson = this.querySelector(selectors.productJson);
        if ((productJson && !productJson.innerHTML) || !productJson) {
          return;
        }

        const productJsonHandle = JSON.parse(productJson.innerHTML).handle;
        let recentObj = {};
        if (productJsonHandle) {
          recentObj = {
            handle: productJsonHandle,
          };
        }

        // Record recently viewed products when the product page is loading
        Shopify.Products.recordRecentlyViewed(recentObj);
        if (Shopify.Products && Shopify.Products.recordRecentlyViewed) {
          Shopify.Products.recordRecentlyViewed(recentObj);
        }

        this.form = this.querySelector(selectors.form);

        this.bindNotificationPopupEvents();

        if (this.swapElements.length > 0) {
          this.initializeProductSwapUtility();
          this.addEventListener('theme:variant:change', (event) => this.storeOptionValues(event));

          this.swapElements?.forEach((element) => {
            element.addEventListener('click', this.handleClick);
            // TODO:
            // element.addEventListener('keyup', this.handleKeyup);
          });

          // TODO:
          // this.dispatchEvent(new CustomEvent('product-component:loaded', { bubbles: true }));
        }

        if (this.cartBarEnabled) {
          // TODO: Fix JS errors here 👇
          // this.initCartBar();
          // this.setCartBarHeight();
          // document.addEventListener('theme:scroll', this.toggleCartBarOnScroll);
          // document.addEventListener('theme:resize', this.setCartBarHeight);
        }
      }

      initializeProductSwapUtility() {
        this.preProcessHtmlCallbacks.push((html) => {
          // console.log('Pre-processing HTML:', html);
          // Add animation or active classes, etc.
        });
        this.postProcessHtmlCallbacks.push((newNode) => {
          window?.Shopify?.PaymentButton?.init();
          window?.ProductModel?.loadShopifyXR();
        });
      }

      storeOptionValues(event) {
        this.selectedOptionValues = '';
        const variant = event.detail.variant;
        const selected = event.detail.selected;

        if (!event || !variant) return;

        if (selected.optionValues?.length) {
          this.selectedOptionValues = selected.optionValues;
        }
      }

      handleChange(event) {
        event.preventDefault();
        if (!this.contains(event.target)) return;

        const element = event.target.closest(selectors.swapUrl);
        const targetUrl = element.dataset.swapUrl;
        const productUrl = targetUrl || this.pendingRequestUrl || this.dataset.url;
        this.pendingRequestUrl = productUrl;

        const shouldSwapProduct = this.dataset.url !== productUrl;
        if (!shouldSwapProduct) return;

        this.renderProductComponent({
          // Fetch the new product's HTML with section rendering API
          requestUrl: `${productUrl}?section_id=${this.sectionId}`,
          // Returns a function that will process and swap the HTML after fetch completes
          callback: this.handleSwapProduct(productUrl),
        });
      }

      renderProductComponent({requestUrl, callback}) {
        this.abortController?.abort();
        this.abortController = new AbortController();

        fetch(requestUrl, {signal: this.abortController.signal})
          .then((response) => response.text())
          .then((responseText) => {
            this.pendingRequestUrl = null;
            const html = new DOMParser().parseFromString(responseText, 'text/html');
            callback(html);
          })
          .catch((error) => {
            if (error.name === 'AbortError') {
              console.log('Fetch aborted by user');
            } else {
              console.error(error);
            }
          });
      }

      handleSwapProduct(productUrl) {
        return (html) => {
          // TODO: remove elements?
          // TODO: update URL
          // const variant = this.getSelectedVariant(html.querySelector(selectors.productComponent));
          // this.updateURL(productUrl, variant?.id);

          window.theme.htmlUpdate.viewTransition(
            this, // Current product-component element to be replaced
            html.querySelector(selectors.productComponent), // New product-component element with updated content
            // this.preProcessHtmlCallbacks, // animations? Toggle active classes for selected options?
            this.postProcessHtmlCallbacks // Run any post-processing after swap (focus, init components)
          );
        };
      }

      bindNotificationPopupEvents() {
        if (!this.productNotification) return;

        this.notificationPopupButtons = this.querySelectorAll(selectors.notificationPopupButton);
        this.notificationPopup = this.productNotification.closest(selectors.popupComponent);
        this.notificationPopupOpen = this.notificationPopup.querySelector(selectors.popupOpen);

        this.notificationPopupButtons.forEach((button) => {
          button.addEventListener('click', (event) => {
            event.preventDefault();
            this.notificationPopupOpen.dispatchEvent(new Event('click'));
          });
        });
      }

      initCartBar() {
        // Submit product form on cart bar button click
        this.cartBarBtns = this.cartBar.querySelectorAll(selectors.productSubmitAdd);

        this.cartBarBtns?.forEach((button) => {
          button.addEventListener('click', (event) => {
            event.preventDefault();

            if (e.currentTarget.hasAttribute(attributes.cartBarAdd)) {
              if (this.cartBarEnabled) {
                e.currentTarget.classList.add(classes.loading);
                e.currentTarget.setAttribute('disabled', 'disabled');
              }

              this.form.querySelector(selectors.addToCart).dispatchEvent(
                new Event('click', {
                  bubbles: true,
                })
              );
            } else if (e.currentTarget.hasAttribute(attributes.cartBarScroll)) {
              this.scrollToTop();
            }
          });

          if (button.hasAttribute(attributes.cartBarAdd)) {
            document.addEventListener('theme:product:add-error', this.scrollToTop);
          }
        });

        this.setCartBarHeight();
      }

      scrollToTop() {
        const productVariants = this.querySelector(selectors.productVariants);
        const scrollTarget = !window.theme.isMobile() ? this : productVariants ? productVariants : this.form;
        const scrollTargetTop = scrollTarget.getBoundingClientRect().top;

        window.theme.scrollTo(!window.theme.isMobile() ? scrollTargetTop : scrollTargetTop - 10);
      }

      toggleCartBarOnScroll() {
        const scrolled = window.scrollY;
        const element = theme.settings.productPageSticky && this.formWrapper ? this.formWrapper : this.form;

        if (element && this.cartBar) {
          const formOffset = element.offsetTop;
          const formHeight = element.offsetHeight;
          const checkPosition = scrolled > formOffset + formHeight;

          this.cartBar.classList.toggle(classes.visible, checkPosition);
        }
      }

      setCartBarHeight() {
        const cartBarHeight = this.cartBar.offsetHeight;

        document.documentElement.style.setProperty('--cart-bar-height', `${cartBarHeight}px`);
      }

      disconnectedCallback() {
        document.removeEventListener('theme:product:add-error', this.scrollToTop);

        if (this.cartBarEnabled) {
          document.removeEventListener('theme:scroll', this.toggleCartBarOnScroll);
          document.removeEventListener('theme:resize', this.setCartBarHeight);
        }
      }
    }
  );
}

if (!customElements.get('product-model')) {
  customElements.define('product-model', ProductModel);
}
