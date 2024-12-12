import {register} from '../vendor/theme-scripts/theme-sections';
import {RadioSwatch} from '../features/swatch';
import {tooltipSection} from '../features/tooltip';
import {productStickySection} from '../features/product-sticky';
import tabs from '../features/tabs';
import * as a11y from '../vendor/theme-scripts/theme-a11y';
import {isDesktop} from '../util/media-query';
import {ProductForm} from '../features/product-form';
import {ProductModal} from '../features/product-modal';
import {ProductModel} from '../features/product-model';

const selectors = {
  addToCart: '[data-add-to-cart]',
  productImage: '[data-product-image]',
  productJson: '[data-product-json]',
  form: '[data-product-form]',
  cartBar: '#cart-bar',
  productNotificationPopupButton: '[data-popup-open]',
  productSubmitAdd: '.product__submit__add',
  formWrapper: '[data-form-wrapper]',
  productVariants: '[data-product-variants]',
};

const classes = {
  expanded: 'is-expanded',
  visible: 'is-visible',
  loading: 'is-loading',
  added: 'is-added',
};

const attributes = {
  cartBarEnabled: 'data-cart-bar-enabled',
  cartBarAdd: 'data-add-to-cart-bar',
  cartBarScroll: 'data-cart-bar-scroll',
  cartBarProductNotification: 'data-cart-bar-product-notification',
  sectionId: 'data-section-id',
};

const sections = {};

/**
 * Product section constructor.
 * @param {string} container - selector for the section container DOM element
 */
class Product {
  constructor(section) {
    this.section = section;
    this.container = section.container;
    this.id = this.container.getAttribute(attributes.sectionId);
    this.formWrapper = this.container.querySelector(selectors.formWrapper);
    this.cartBarEnabled = this.container.hasAttribute(attributes.cartBarEnabled);
    this.cartBar = this.container.querySelector(selectors.cartBar);
    this.setCartBarHeight = this.setCartBarHeight.bind(this);
    this.scrollToTop = this.scrollToTop.bind(this);
    this.toggleCartBarOnScroll = this.toggleCartBarOnScroll.bind(this);
    this.unlockTimer = 0;
    this.accessibility = a11y;

    // Stop parsing if we don't have the product json script tag when loading
    // section in the Theme Editor
    const productJson = this.container.querySelector(selectors.productJson);
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

    this.form = this.container.querySelector(selectors.form);

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
    const productVariants = this.container.querySelector(selectors.productVariants);
    const scrollTarget = isDesktop() ? this.container : productVariants ? productVariants : this.form;
    const scrollTargetTop = scrollTarget.getBoundingClientRect().top;

    window.theme.scrollTo(isDesktop() ? scrollTargetTop : scrollTargetTop - 10);
  }

  toggleCartBarOnScroll() {
    const scrolled = window.scrollY;
    const element = theme.variables.productPageSticky && this.formWrapper ? this.formWrapper : this.form;

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

  onUnload() {
    document.removeEventListener('theme:product:add-error', this.scrollToTop);

    if (this.cartBarEnabled) {
      document.removeEventListener('theme:scroll', this.toggleCartBarOnScroll);
      document.removeEventListener('theme:resize', this.setCartBarHeight);
    }
  }
}

const productSection = {
  onLoad() {
    sections[this.id] = new Product(this);
  },
  onUnload(e) {
    sections[this.id].onUnload(e);
  },
  onBlockSelect(e) {
    sections[this.id].onBlockSelect(e);
  },
  onBlockDeselect(e) {
    sections[this.id].onBlockDeselect(e);
  },
};

register('product', [productSection, tooltipSection, tabs, productStickySection]);

if (!customElements.get('product-form')) {
  customElements.define('product-form', ProductForm);
}

if (!customElements.get('product-modal')) {
  customElements.define('product-modal', ProductModal);
}

if (!customElements.get('product-model')) {
  customElements.define('product-model', ProductModel);
}

if (!customElements.get('radio-swatch')) {
  customElements.define('radio-swatch', RadioSwatch);
}
