import {ProductModel} from '../features/product-model';

const selectors = {
  addToCart: '[data-add-to-cart]',
  productImage: '[data-product-image]',
  productJson: '[data-product-json]',
  productPage: '.product__page',
  headerSticky: '[data-header-sticky]',
  productMediaList: '[data-product-media-list]',
  form: '[data-product-form]',
  cartBar: '#cart-bar',
  productNotificationPopupButton: '[data-popup-open]',
  productSubmitAdd: '.product__submit__add',
  formWrapper: '[data-form-wrapper]',
  productVariants: '[data-product-variants]',
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
  cartBarProductNotification: 'data-cart-bar-product-notification',
  stickyEnabled: 'data-sticky-enabled',
};

if (!customElements.get('product-component')) {
  customElements.define(
    'product-component',
    class ProductComponent extends HTMLElement {
      constructor() {
        super();

        this.stickyEnabled = this.getAttribute(attributes.stickyEnabled) === 'true';
        this.formWrapper = this.querySelector(selectors.formWrapper);
        this.cartBarEnabled = this.hasAttribute(attributes.cartBarEnabled);
        this.cartBar = this.querySelector(selectors.cartBar);
        this.setCartBarHeight = this.setCartBarHeight.bind(this);
        this.scrollToTop = this.scrollToTop.bind(this);
        this.toggleCartBarOnScroll = this.toggleCartBarOnScroll.bind(this);
        this.unlockTimer = 0;
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

        if (this.cartBarEnabled) {
          this.initCartBar();
          this.setCartBarHeight();

          document.addEventListener('theme:scroll', this.toggleCartBarOnScroll);
          document.addEventListener('theme:resize', this.setCartBarHeight);
        }
      }

      initCartBar() {
        // Submit product form on cart bar button click
        this.cartBarBtns = this.cartBar.querySelectorAll(selectors.productSubmitAdd);
        if (this.cartBarBtns.length > 0) {
          this.cartBarBtns.forEach((button) => {
            button.addEventListener('click', (e) => {
              e.preventDefault();

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
              } else if (e.currentTarget.hasAttribute(attributes.cartBarProductNotification)) {
                this.form.querySelector(selectors.productNotificationPopupButton)?.dispatchEvent(new Event('click'));
              }
            });

            if (button.hasAttribute(attributes.cartBarAdd)) {
              document.addEventListener('theme:product:add-error', this.scrollToTop);
            }
          });
        }

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
