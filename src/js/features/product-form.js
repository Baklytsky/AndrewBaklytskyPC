import {formatMoney} from '@shopify/theme-currency';
import Flickity from 'flickity';

import showElement from '../util/show-element';
import hideElement from '../util/hide-element';
import scrollTo from '../util/scroll-to';
import debounce from '../util/debounce';
import {ProductForm} from '../vendor/theme-scripts/theme-product-form';

import {StoreAvailability} from './store-availability';
import QuantityCounter from './quantity-handle';
import {SelloutVariants} from './product-form-sellout';
import {NotificationPopup} from './notification-popup';

const selectors = {
  product: '[data-product]',
  productForm: '[data-product-form]',
  addToCart: '[data-add-to-cart]',
  addToCartText: '[data-add-to-cart-text]',
  buyItNow: '[data-buy-it-now]',
  comparePrice: '[data-compare-price]',
  formWrapper: '[data-form-wrapper]',
  header: '[data-site-header]',
  originalSelectorId: '[data-product-select]',
  preOrderTag: '_preorder',
  priceWrapper: '[data-price-wrapper]',
  priceOffWrap: '[data-price-off]',
  priceOffType: '[data-price-off-type]',
  priceOffAmount: '[data-price-off-amount]',
  productSlide: '[data-product-slide]',
  productImage: '[data-product-image]',
  productMediaSlider: '[data-product-single-media-slider]',
  productJson: '[data-product-json]',
  productPrice: '[data-product-price]',
  unitPrice: '[data-product-unit-price]',
  unitBase: '[data-product-base]',
  unitWrapper: '[data-product-unit]',
  subPrices: '[data-subscription-watch-price]',
  subSelectors: '[data-subscription-selectors]',
  subsToggle: '[data-toggles-group]',
  subsChild: 'data-group-toggle',
  subDescription: '[data-plan-description]',
  remainingCount: '[data-remaining-count]',
  remainingWrapper: '[data-remaining-wrapper]',
  remainingJSON: '[data-product-remaining-json]',
  idInput: '[name="id"]',
  storeAvailabilityContainer: '[data-store-availability-container]',
  upsellButton: '[data-upsell-btn]',
  sectionNode: '.shopify-section',
  quickViewItem: '[data-quick-view-item]',
  notificationButtonText: '[data-notification-button-text]',
  swatchesContainer: '[data-swatches-container]',
  swatchesMore: '[data-swatches-more]',
  selectorWrapper: '[data-option-position]',
  shopifyPaymentButton: '.shopify-payment-button__button',
  paymentButton: '[role="button"], [type="submit"], form',
  disabled: '[disabled]',
};

const classes = {
  hidden: 'hidden',
  variantSoldOut: 'variant--soldout',
  variantUnavailable: 'variant--unavailabe',
  productPriceSale: 'product__price--sale',
  priceWrapperHidden: 'product__price--hidden',
  remainingLow: 'count-is-low',
  remainingIn: 'count-is-in',
  remainingOut: 'count-is-out',
  remainingUnavailable: 'count-is-unavailable',
  selectorVisible: 'selector-wrapper--visible',
};

const attributes = {
  productImageId: 'data-image-id',
  tallLayout: 'data-tall-layout',
  dataEnableHistoryState: 'data-enable-history-state',
  notificationPopup: 'data-notification-popup',
  swatchVariant: 'data-swatch-variant',
  disabled: 'disabled',
};

let sections = {};

class ProductAddForm {
  constructor(container) {
    this.container = container;
    this.product = this.container.querySelector(selectors.product);
    this.productForm = this.container.querySelector(selectors.productForm);
    this.tallLayout = this.container.getAttribute(attributes.tallLayout) === 'true';
    this.addToCartButton = this.container.querySelector(selectors.addToCart);
    this.buyItNow = this.container.querySelector(selectors.buyItNow);
    this.hasPaymentButton = this.buyItNow !== null;

    // Stop parsing if we don't have the product
    if (!this.product || !this.productForm) {
      const counter = new QuantityCounter(this.container);
      counter.init();
      return;
    }

    this.storeAvailabilityContainer = this.container.querySelector(selectors.storeAvailabilityContainer);
    this.enableHistoryState = this.container.getAttribute(attributes.dataEnableHistoryState) === 'true';
    this.hasUnitPricing = this.container.querySelector(selectors.unitWrapper);
    this.subSelectors = this.container.querySelector(selectors.subSelectors);
    this.subPrices = this.container.querySelector(selectors.subPrices);
    this.priceOffWrap = this.container.querySelector(selectors.priceOffWrap);
    this.priceOffAmount = this.container.querySelector(selectors.priceOffAmount);
    this.priceOffType = this.container.querySelector(selectors.priceOffType);
    this.planDecription = this.container.querySelector(selectors.subDescription);
    this.swatchesContainer = this.container.querySelector(selectors.swatchesContainer);
    this.latestVariantId = '';
    this.latestVariantTitle = '';
    this.sellout = null;

    this.sessionStorage = window.sessionStorage;

    this.remainingWrapper = this.container.querySelector(selectors.remainingWrapper);

    if (this.remainingWrapper) {
      this.remainingMaxInt = parseInt(this.remainingWrapper.dataset.remainingMax, 10);
      this.remainingCount = this.container.querySelector(selectors.remainingCount);
      this.remainingJSONWrapper = this.container.querySelector(selectors.remainingJSON);
      this.remainingJSON = null;

      if (this.remainingJSONWrapper && this.remainingJSONWrapper.innerHTML !== '') {
        this.remainingJSON = JSON.parse(this.remainingJSONWrapper.innerHTML);
      }
    }

    if (this.storeAvailabilityContainer) {
      this.storeAvailability = new StoreAvailability(this.storeAvailabilityContainer);
    }

    const counter = new QuantityCounter(this.container);
    counter.init();

    this.init();

    if (this.hasPaymentButton) {
      this.mutationObserver = null;
      this.onResizeCallback = () => this.updateButtonsHeight();
      this.observeContainer();
      window.addEventListener('theme:resize:width', this.onResizeCallback);
    }
  }

  init() {
    let productJSON = null;
    const productElemJSON = this.container.querySelector(selectors.productJson);

    if (productElemJSON) {
      productJSON = productElemJSON.innerHTML;
    }
    if (productJSON) {
      this.productJSON = JSON.parse(productJSON);
      this.linkForm();
      this.sellout = new SelloutVariants(this.container, this.productJSON);
    } else {
      console.error('Missing product JSON');
    }
  }

  observeContainer() {
    // Create a MutationObserver to observe changes in the container
    this.mutationObserver = new MutationObserver((mutationList) => {
      for (const mutation of mutationList) {
        if (mutation.type === 'childList' && mutation.target.closest(selectors.buyItNow)) {
          this.updateButtonsHeight();

          if (!mutation.target.querySelector(selectors.disabled)) {
            this.mutationObserver?.disconnect();
            this.mutationObserver = null;
          }
        }
      }
    });
    this.mutationObserver.observe(this.container, {childList: true, subtree: true});
  }

  updateButtonsHeight() {
    this.shopifyPaymentButton = this.container.querySelector(selectors.shopifyPaymentButton);
    this.paymentButton = this.buyItNow.querySelectorAll(`${selectors.paymentButton}`);

    if (!this.shopifyPaymentButton) return;
    if (this.shopifyPaymentButton.hasAttribute(attributes.disabled)) return;

    // Reset heights to 'auto'
    this.shopifyPaymentButton.setAttribute('style', 'min-height: auto !important;');
    this.addToCartButton.setAttribute('style', 'min-height: auto;');
    this.paymentButton.forEach((element) => element.setAttribute('style', 'min-height: auto !important;'));

    // Gather elements heights for comparison
    requestAnimationFrame(() => {
      this.compareHeights = [];
      this.paymentButton.forEach((element) => this.compareHeights.push(element.offsetHeight));
      this.compareHeights.push(this.shopifyPaymentButton.offsetHeight);
      this.compareHeights.push(this.addToCartButton.offsetHeight);
      debounce(this.setButtonsStyles(), 400);
    });
  }

  setButtonsStyles() {
    if (this.compareHeights.length === 0) return;

    this.maxHeight = Math.max(...this.compareHeights);

    requestAnimationFrame(() => {
      this.addToCartButton.setAttribute('style', `min-height: ${this.maxHeight}px;`);
      this.shopifyPaymentButton.setAttribute('style', `min-height: ${this.maxHeight}px !important; height: auto !important;`);
      this.paymentButton.forEach((element) => element.setAttribute('style', `min-height: ${this.maxHeight}px !important; height: auto !important;`));
    });
  }

  linkForm() {
    this.productForm = new ProductForm(this.productForm, this.productJSON, {
      onOptionChange: this.onOptionChange.bind(this),
      onPlanChange: this.onPlanChange.bind(this),
    });
    const formState = this.productForm.getFormState();
    this.pushState(formState, true);
    this.subsToggleListeners();

    // Swatches show more functionality
    if (this.swatchesContainer) {
      this.observeSwatch(formState);

      const selectorWrapper = this.swatchesContainer.closest(selectors.selectorWrapper);
      const moreLink = selectorWrapper.querySelector(selectors.swatchesMore);
      moreLink?.addEventListener('click', (event) => {
        event.preventDefault();
        if (selectorWrapper.classList.contains(classes.selectorVisible)) {
          selectorWrapper.classList.remove(classes.selectorVisible);
        } else {
          selectorWrapper.classList.add(classes.selectorVisible);
        }
      });
    }
  }

  onOptionChange(evt) {
    this.pushState(evt.dataset);
    this.updateProductImage(evt);
  }

  onPlanChange(evt) {
    if (this.subPrices) {
      this.pushState(evt.dataset);
    }
  }

  pushState(formState, init = false) {
    this.productState = this.setProductState(formState);
    this.updateAddToCartState(formState);
    this.updateProductPrices(formState);
    this.updateSaleText(formState);
    this.updateSubscriptionText(formState);
    this.fireHookEvent(formState);
    this.updateRemaining(formState);
    this.sellout?.update(formState);

    if (this.enableHistoryState && !init) {
      this.updateHistoryState(formState);
    }

    if (this.storeAvailability) {
      if (formState.variant) {
        this.storeAvailability.updateContent(formState.variant.id, this.productForm.product.title);
      } else {
        this.storeAvailability.clearContent();
      }
    }
  }

  updateAddToCartState(formState) {
    const variant = formState.variant;
    const priceWrapper = this.container.querySelectorAll(selectors.priceWrapper);
    const addToCart = this.container.querySelectorAll(selectors.addToCart);
    const addToCartText = this.container.querySelectorAll(selectors.addToCartText);
    const formWrapper = this.container.querySelectorAll(selectors.formWrapper);
    const buyItNow = this.container.querySelector(selectors.buyItNow);
    let addText = theme.strings.add_to_cart;

    if (this.productJSON.tags.includes(selectors.preOrderTag)) {
      addText = theme.strings.preorder;
    }

    // Price wrapper elements
    priceWrapper?.forEach((element) => {
      // Hide price if there is no variant
      element.classList.toggle(classes.priceWrapperHidden, !variant);
    });

    // ATC Button elements
    addToCart?.forEach((element) => {
      // Skip the upsell "add to cart" button
      if (element.matches(selectors.upsellButton)) return;

      element.disabled = true;
      buyItNow?.classList.add(classes.hidden);

      // No variant
      if (!variant) return;

      // Available variant
      element.disabled = false;
      if (variant.available) {
        buyItNow?.classList.remove(classes.hidden);
      }

      // Notification popup
      if (!element.hasAttribute(attributes.notificationPopup)) return;

      const notificationFormId = element.id.replace('AddToCart', 'NotificationForm');
      const formID = this.sessionStorage.getItem('notification_form_id');
      let notificationFormSubmitted = false;
      let variantId = variant.id;
      let variantTitle = variant.title;

      if (formID) {
        const sessionId = formID.substring(0, formID.lastIndexOf('--'));
        const sessionVariantId = formID.split('--').slice(-1)[0];
        notificationFormSubmitted = notificationFormId === sessionId;

        if (notificationFormSubmitted) {
          this.latestVariantId = variantId;
          this.latestVariantTitle = variantTitle;
          variantId = Number(sessionVariantId);

          this.productJSON.variants.forEach((variant) => {
            if (variant.id === variantId) {
              variantTitle = variant.title;
            }
          });
        }
      }

      let notificationPopupHtml = element.getAttribute(attributes.notificationPopup);
      const notificationButtonText = new DOMParser().parseFromString(notificationPopupHtml, 'text/html').querySelector(selectors.notificationButtonText)?.innerHTML;

      if (this.latestVariantId != '' && this.latestVariantTitle != '') {
        notificationPopupHtml = notificationPopupHtml.replaceAll(this.latestVariantId, variantId);
        notificationPopupHtml = notificationPopupHtml.replaceAll(
          `<p class='product__notification__subtitle'>${this.latestVariantTitle}</p>`,
          `<p class='product__notification__subtitle'>${variantTitle}</p>`
        );

        // Prevent updating of the "Notify me" button's text if the variant title matches part of it
        const updatedNotificationButtonText = new DOMParser().parseFromString(notificationPopupHtml, 'text/html').querySelector(selectors.notificationButtonText)?.innerHTML;
        notificationPopupHtml = notificationPopupHtml.replace(updatedNotificationButtonText, notificationButtonText);
      }

      element.setAttribute(attributes.notificationPopup, notificationPopupHtml);

      if (notificationFormSubmitted) {
        this.scrollToForm(this.product.closest(selectors.sectionNode));
        new NotificationPopup(element);
      }

      this.latestVariantId = variantId;
      this.latestVariantTitle = variantTitle;
    });

    // ATC Buttons' text elements
    addToCartText?.forEach((element) => {
      // No variant
      if (!variant) {
        element.innerHTML = theme.strings.unavailable;
        return;
      }

      // Unavailable variant
      if (!variant.available) {
        element.innerHTML = theme.strings.sold_out;

        if (element.parentNode.hasAttribute(attributes.notificationPopup)) {
          if (element.closest(selectors.quickViewItem)) return; // Disable 'notify me' text change for Quickview

          element.innerHTML = `${theme.strings.sold_out} - ${theme.strings.newsletter_product_availability}`;
        }

        return;
      }

      // Available variant
      element.innerHTML = addText;
    });

    // Form wrapper elements
    formWrapper?.forEach((element) => {
      // No variant
      if (!variant) {
        element.classList.add(classes.variantUnavailable);
        element.classList.remove(classes.variantSoldOut);
        return;
      }

      const formSelect = element.querySelector(selectors.originalSelectorId);
      if (formSelect) {
        formSelect.value = variant.id;
      }

      // Unavailable variant
      if (!variant.available) {
        element.classList.add(classes.variantSoldOut);
        element.classList.remove(classes.variantUnavailable);
        return;
      }

      // Available variant
      element.classList.remove(classes.variantSoldOut, classes.variantUnavailable);
    });
  }

  updateHistoryState(formState) {
    const variant = formState.variant;
    const plan = formState.plan;
    const location = window.location.href;
    if (variant && location.includes('/product')) {
      const url = new window.URL(location);
      const params = url.searchParams;
      params.set('variant', variant.id);
      if (plan && plan.detail && plan.detail.id && this.productState.hasPlan) {
        params.set('selling_plan', plan.detail.id);
      } else {
        params.delete('selling_plan');
      }
      url.search = params.toString();
      const urlString = url.toString();
      window.history.replaceState({path: urlString}, '', urlString);
    }
  }

  updateRemaining(formState) {
    const variant = formState.variant;
    const remainingClasses = [classes.remainingIn, classes.remainingOut, classes.remainingUnavailable, classes.remainingLow];

    if (variant && this.remainingWrapper && this.remainingJSON) {
      const remaining = this.remainingJSON[variant.id];

      if (remaining === 'out' || remaining < 1) {
        this.remainingWrapper.classList.remove(...remainingClasses);
        this.remainingWrapper.classList.add(classes.remainingOut);
      }

      if (remaining === 'in' || remaining >= this.remainingMaxInt) {
        this.remainingWrapper.classList.remove(...remainingClasses);
        this.remainingWrapper.classList.add(classes.remainingIn);
      }

      if (remaining === 'low' || (remaining > 0 && remaining < this.remainingMaxInt)) {
        this.remainingWrapper.classList.remove(...remainingClasses);
        this.remainingWrapper.classList.add(classes.remainingLow);

        if (this.remainingCount) {
          this.remainingCount.innerHTML = remaining;
        }
      }
    } else if (!variant && this.remainingWrapper) {
      this.remainingWrapper.classList.remove(...remainingClasses);
      this.remainingWrapper.classList.add(classes.remainingUnavailable);
    }
  }

  getBaseUnit(variant) {
    return variant.unit_price_measurement.reference_value === 1
      ? variant.unit_price_measurement.reference_unit
      : variant.unit_price_measurement.reference_value + variant.unit_price_measurement.reference_unit;
  }

  subsToggleListeners() {
    const toggles = this.container.querySelectorAll(selectors.subsToggle);

    toggles.forEach((toggle) => {
      toggle.addEventListener(
        'change',
        function (e) {
          const val = e.target.value.toString();
          const selected = this.container.querySelector(`[${selectors.subsChild}="${val}"]`);
          const groups = this.container.querySelectorAll(`[${selectors.subsChild}]`);
          if (selected) {
            selected.classList.remove(classes.hidden);
            const first = selected.querySelector('[name="selling_plan"]');
            first.checked = true;
            first.dispatchEvent(new Event('change'));
          }
          groups.forEach((group) => {
            if (group !== selected) {
              group.classList.add(classes.hidden);
              const plans = group.querySelectorAll('[name="selling_plan"]');
              plans.forEach((plan) => {
                plan.checked = false;
                plan.dispatchEvent(new Event('change'));
              });
            }
          });
        }.bind(this)
      );
    });
  }

  updateSaleText(formState) {
    if (this.productState.planSale) {
      this.updateSaleTextSubscription(formState);
    } else if (this.productState.onSale) {
      this.updateSaleTextStandard(formState);
    } else if (this.priceOffWrap) {
      this.priceOffWrap.classList.add(classes.hidden);
    }
  }

  updateSaleTextStandard(formState) {
    if (!this.priceOffType) {
      return;
    }
    this.priceOffType.innerHTML = window.theme.strings.sale_badge_text || 'sale';
    const variant = formState.variant;
    if (window.theme.settings.savingBadgeType && window.theme.settings.savingBadgeType === 'percentage') {
      const discountFloat = (variant.compare_at_price - variant.price) / variant.compare_at_price;
      const discountInt = Math.floor(discountFloat * 100);
      this.priceOffAmount.innerHTML = `${discountInt}%`;
    } else {
      const discount = variant.compare_at_price - variant.price;
      this.priceOffAmount.innerHTML = formatMoney(discount, theme.moneyFormat);
    }
    this.priceOffWrap.classList.remove(classes.hidden);
  }

  updateSaleTextSubscription(formState) {
    const variant = formState.variant;
    const variantFirstPlan = this.productForm.product.selling_plan_groups.find((plan) => plan.id === variant.selling_plan_allocations[0].selling_plan_group_id);
    const adjustment = formState.plan ? formState.plan.detail.price_adjustments[0] : variantFirstPlan.selling_plans[0].price_adjustments[0];
    const discount = adjustment.value || 0;
    const saleText = adjustment.value_type === 'percentage' ? `${discount}%` : formatMoney(variant.price - discount, theme.moneyFormat);

    this.priceOffType.innerHTML = window.theme.strings.subscription || 'subscripton';
    this.priceOffAmount.innerHTML = saleText;
    this.priceOffWrap.classList.remove(classes.hidden);
  }

  updateSubscriptionText(formState) {
    if (formState.plan && this.planDecription && formState.plan.detail.description !== null) {
      this.planDecription.innerHTML = formState.plan.detail.description;
      this.planDecription.classList.remove(classes.hidden);
    } else if (this.planDecription) {
      this.planDecription.classList.add(classes.hidden);
    }
  }

  updateProductPrices(formState) {
    const variant = formState.variant;
    const plan = formState.plan;
    const priceWrappers = this.container.querySelectorAll(selectors.priceWrapper);

    priceWrappers.forEach((wrap) => {
      const comparePriceEl = wrap.querySelector(selectors.comparePrice);
      const productPriceEl = wrap.querySelector(selectors.productPrice);

      let comparePrice = '';
      let price = '';

      if (this.productState.available) {
        comparePrice = variant.compare_at_price;
        price = variant.price;
      }

      if (this.productState.hasPlan) {
        const allocationPrice = plan ? plan.allocation.price : variant.selling_plan_allocations[0].per_delivery_price;
        price = allocationPrice;
      }

      if (this.productState.planSale) {
        const allocationPrice = plan ? plan.allocation.price : variant.selling_plan_allocations[0].per_delivery_price;
        const allocationPriceCompare = plan ? plan.allocation.compare_at_price : variant.selling_plan_allocations[0].compare_at_price;
        comparePrice = allocationPriceCompare;
        price = allocationPrice;
      }

      if (comparePriceEl) {
        if (this.productState.onSale || this.productState.planSale) {
          comparePriceEl.classList.remove(classes.hidden);
          productPriceEl.classList.add(classes.productPriceSale);
        } else {
          comparePriceEl.classList.add(classes.hidden);
          productPriceEl.classList.remove(classes.productPriceSale);
        }
        comparePriceEl.innerHTML = theme.settings.currency_code_enable ? formatMoney(comparePrice, theme.moneyWithCurrencyFormat) : formatMoney(comparePrice, theme.moneyFormat);
      }

      if (price === 0) {
        productPriceEl.innerHTML = window.theme.strings.free;
      } else {
        productPriceEl.innerHTML = theme.settings.currency_code_enable ? formatMoney(price, theme.moneyWithCurrencyFormat) : formatMoney(price, theme.moneyFormat);
      }
    });

    if (this.hasUnitPricing) {
      this.updateProductUnits(formState);
    }
  }

  updateProductUnits(formState) {
    const variant = formState.variant;
    const plan = formState.plan;
    let unitPrice = null;

    if (variant && variant.unit_price) {
      unitPrice = variant.unit_price;
    }
    if (plan && plan?.allocation && plan?.allocation.unit_price) {
      unitPrice = plan.allocation.unit_price;
    }
    if (!plan && variant.selling_plan_allocations) {
      if (variant.selling_plan_allocations.length > 0) {
        const allocationUnitPrice = variant.selling_plan_allocations[0].unit_price;
        unitPrice = allocationUnitPrice;
      }
    }

    if (unitPrice) {
      const base = this.getBaseUnit(variant);
      const formattedPrice = unitPrice === 0 ? window.theme.strings.free : formatMoney(unitPrice, theme.moneyFormat);
      this.container.querySelector(selectors.unitPrice).innerHTML = formattedPrice;
      this.container.querySelector(selectors.unitBase).innerHTML = base;
      showElement(this.container.querySelector(selectors.unitWrapper));
    } else {
      hideElement(this.container.querySelector(selectors.unitWrapper));
    }
  }

  fireHookEvent(formState) {
    const variant = formState.variant;

    // Hook for product variant change event
    this.container.dispatchEvent(
      new CustomEvent('theme:variant:change', {
        detail: {
          variant: variant,
        },
        bubbles: true,
      })
    );
  }

  /**
   * Tracks aspects of the product state that are relevant to UI updates
   * @param {object} evt - variant change event
   * @return {object} productState - represents state of variant + plans
   *  productState.available - current variant and selling plan options result in valid offer
   *  productState.soldOut - variant is sold out
   *  productState.onSale - variant is on sale
   *  productState.showUnitPrice - variant has unit price
   *  productState.requiresPlan - all the product variants requires a selling plan
   *  productState.hasPlan - there is a valid selling plan
   *  productState.planSale - plan has a discount to show next to price
   *  productState.planPerDelivery - plan price does not equal per_delivery_price - a prepaid subscribtion
   */
  setProductState(dataset) {
    const variant = dataset.variant;
    const plan = dataset.plan;

    const productState = {
      available: true,
      soldOut: false,
      onSale: false,
      showUnitPrice: false,
      requiresPlan: false,
      hasPlan: false,
      planPerDelivery: false,
      planSale: false,
    };

    if (!variant) {
      productState.available = false;
    } else {
      const requiresPlan = variant.requires_selling_plan || false;

      if (!variant.available) {
        productState.soldOut = true;
      }

      if (variant.compare_at_price > variant.price) {
        productState.onSale = true;
      }

      if (variant.unit_price) {
        productState.showUnitPrice = true;
      }

      if (this.product && this.product.requires_selling_plan) {
        productState.requiresPlan = true;
      }

      if (plan && this.subPrices) {
        productState.hasPlan = true;
        if (plan.allocation.per_delivery_price !== plan.allocation.price) {
          productState.planPerDelivery = true;
        }
        if (variant.price > plan.allocation.price) {
          productState.planSale = true;
        }
      }

      if (!plan && requiresPlan) {
        productState.hasPlan = true;
        if (variant.selling_plan_allocations[0].per_delivery_price !== variant.selling_plan_allocations[0].price) {
          productState.planPerDelivery = true;
        }
        if (variant.price > variant.selling_plan_allocations[0].price) {
          productState.planSale = true;
        }
      }
    }
    return productState;
  }

  updateProductImage(evt) {
    const variant = evt.dataset.variant;

    if (!variant || !variant?.featured_media) {
      return;
    }

    // Update variant image, if one is set
    const newImg = this.container.querySelector(`${selectors.productImage}[${attributes.productImageId}="${variant.featured_media.id}"]`);
    const newImageParent = newImg?.closest(selectors.productSlide);

    if (newImageParent) {
      const newImagePos = parseInt([...newImageParent.parentElement.children].indexOf(newImageParent));
      const imgSlider = this.container.querySelector(selectors.productMediaSlider);
      const flkty = Flickity.data(imgSlider);

      // Activate image slide in mobile view
      if (flkty && flkty.isActive) {
        const variantSlide = imgSlider.querySelector(`[data-id="${variant.featured_media.id}"]`);

        if (variantSlide) {
          const slideIndex = parseInt([...variantSlide.parentNode.children].indexOf(variantSlide));
          flkty.select(slideIndex);
        }
        return;
      }

      if (this.tallLayout) {
        // We know its a tall layout, if it's sticky
        // scroll to the images
        // Scroll to/reorder image unless it's the first photo on load
        const newImgTop = newImg.getBoundingClientRect().top;

        if (newImagePos === 0 && newImgTop + window.scrollY > window.pageYOffset) return;

        // Scroll to variant image
        document.dispatchEvent(
          new CustomEvent('theme:tooltip:close', {
            bubbles: false,
            detail: {
              hideTransition: false,
            },
          })
        );

        scrollTo(newImgTop);
      }
    }
  }

  observeSwatch(formState) {
    const swatch = this.swatchesContainer.querySelector(`[${attributes.swatchVariant}*="${formState.variant.id}"]`);
    this.swatchesContainer.closest(selectors.selectorWrapper).classList.remove(classes.selectorVisible);

    let observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          const notVisible = entry.intersectionRatio == 0;

          if (notVisible) {
            this.swatchesContainer.closest(selectors.selectorWrapper).classList.add(classes.selectorVisible);
          }
        });
      },
      {
        root: this.container,
        threshold: [0.95, 1],
      }
    );
    observer.observe(swatch);
  }

  /**
   * Scroll to the last submitted notification form
   */
  scrollToForm(section) {
    const headerHeight = document.querySelector(selectors.header)?.dataset.height;
    const isVisible = visibilityHelper.isElementPartiallyVisible(section) || visibilityHelper.isElementTotallyVisible(section);

    if (!isVisible) {
      setTimeout(() => {
        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top - headerHeight;

        window.scrollTo({
          top: sectionTop,
          left: 0,
          behavior: 'smooth',
        });
      }, 400);
    }
  }

  onUnload() {
    if (this.productForm) this.productForm.destroy();
    if (this.hasPaymentButton) window.removeEventListener('theme:resize:width', this.onResizeCallback);
  }
}

const productFormSection = {
  onLoad() {
    sections[this.id] = new ProductAddForm(this.container);
  },
  onUnload() {
    sections[this.id].onUnload();
  },
};

export {ProductAddForm, productFormSection};
