import {a11y} from '../vendor/theme-scripts/theme-a11y';

import {LoadPhotoswipe} from './load-photoswipe';

const settings = {
  templateIndex: 0,
};

const selectors = {
  buttonQuickView: '[data-button-quick-view]',
  quickViewItemsTemplate: '[data-quick-view-items-template]',
  cartDrawer: '[data-cart-drawer]',
  shopTheLookQuickViewButton: '[data-shop-the-look-quick-view-button]',
  shopTheLookThumb: '[data-shop-the-look-thumb]',
  quickViewItemHolder: '[data-quick-view-item-holder]',
};

const classes = {
  loading: 'is-loading',
  isActive: 'is-active',
  quickViewFromCart: 'js-quick-view-from-cart',
  mainClass: 'popup-quick-view pswp--not-close-btn',
  shopTheLookPopupClass: 'popup-quick-view popup-quick-view--shop-the-look pswp--not-close-btn',
};

const attributes = {
  loaded: 'data-loaded',
  handle: 'data-handle',
  variantId: 'data-variant-id',
  shopTheLookQuickView: 'data-shop-the-look-quick-view',
  hotspot: 'data-hotspot',
  quickButtonInit: 'data-initialized',
};

const options = {
  history: false,
  focus: false,
  mainClass: classes.mainClass,
  showHideOpacity: false, // we need that off to control the animation ourselves
  closeOnVerticalDrag: false,
  closeOnScroll: false,
  modal: false,
  escKey: false,
};

class QuickViewPopup {
  constructor(container) {
    this.container = container;
    this.a11y = a11y;
    this.buttonsQuickView = this.container.querySelectorAll(selectors.buttonQuickView);
    this.buttonsShopTheLookQuickView = this.container.querySelectorAll(selectors.shopTheLookQuickViewButton);
    this.popupInitCallback = (trigger) => this.popupInit(trigger);

    this.buttonsQuickView?.forEach((button) => {
      if (!button.hasAttribute(attributes.quickButtonInit)) {
        button.addEventListener('click', (event) => this.initPhotoswipe(event));
        button.addEventListener('theme:popup:init', () => {
          button.classList.remove(classes.loading);

          if (button.hasAttribute(attributes.shopTheLookQuickView)) {
            this.popupInitCallback(button);
          }
        });
        button.setAttribute(attributes.quickButtonInit, '');
      }
    });

    this.buttonsShopTheLookQuickView?.forEach((button) => {
      button.addEventListener('click', () => {
        this.buttonsQuickView[0]?.dispatchEvent(new Event('click'));
      });
    });
  }

  popupInit(trigger) {
    // Handle active Quick View item
    const holder = this.loadPhotoswipe.pswpElement.querySelector(`[${attributes.hotspot}="${trigger.getAttribute(attributes.hotspot)}"]`);
    const quickViewItemHolders = this.loadPhotoswipe.pswpElement.querySelectorAll(selectors.quickViewItemHolder);

    holder.classList.add(classes.isActive);

    quickViewItemHolders.forEach((element) => {
      if (element !== holder) {
        element.classList.remove(classes.isActive);
      }
    });

    // Handle pointer events
    this.toggleQuickViewButtonsLoadingClasses(true);
    this.toggleQuickViewThumbsLoadingClasses(true);

    const onAnimationInEnd = (event) => {
      // Animation on open
      if (event.animationName === 'quickViewAnimateInUp') {
        requestAnimationFrame(() => {
          this.toggleQuickViewThumbsLoadingClasses(false);
        });
      }

      // Animation on close
      if (event.animationName === 'quickViewAnimateOutDown') {
        this.loadPhotoswipe.pswpElement.removeEventListener('animationend', onAnimationInEnd);
      }
    };

    this.loadPhotoswipe.pswpElement.addEventListener('animationend', onAnimationInEnd);

    this.loadPhotoswipe?.popup?.listen('destroy', () => {
      this.toggleQuickViewButtonsLoadingClasses(false);
      this.toggleQuickViewThumbsLoadingClasses(false);
    });
  }

  toggleQuickViewButtonsLoadingClasses(isLoading = true) {
    if (isLoading) {
      this.buttonsQuickView?.forEach((element) => {
        element.classList.add(classes.loading);
      });
      return;
    }

    this.buttonsQuickView?.forEach((element) => {
      element.classList.remove(classes.loading);
    });
  }

  toggleQuickViewThumbsLoadingClasses(isLoading = true) {
    this.buttonsShopTheLookThumb = this.loadPhotoswipe?.pswpElement.querySelectorAll(selectors.shopTheLookThumb);

    if (isLoading) {
      this.buttonsShopTheLookThumb?.forEach((element) => {
        element.classList.add(classes.loading);
      });
      return;
    }

    this.buttonsShopTheLookThumb?.forEach((element) => {
      element.classList.remove(classes.loading);
    });
  }

  initPhotoswipe(event) {
    event.preventDefault();

    const button = event.target.matches(selectors.buttonQuickView) ? event.target : event.target.closest(selectors.buttonQuickView);
    const isMobile = window.innerWidth < theme.sizes.small;
    let quickViewVariant = '';
    let isShopTheLookPopupTrigger = false;

    if (button.hasAttribute(attributes.shopTheLookQuickView)) {
      if (!isMobile) return;
      isShopTheLookPopupTrigger = true;
    }

    options.mainClass = classes.mainClass;
    button.classList.add(classes.loading);

    // Add class js-quick-view-from-cart to change the default Quick view animation
    if (button.closest(selectors.cartDrawer)) {
      document.body.classList.add(classes.quickViewFromCart);
    }

    // Set the trigger element before calling trapFocus
    this.a11y.state.trigger = button;

    if (button.hasAttribute(attributes.variantId)) {
      quickViewVariant = `&variant=${button.getAttribute(attributes.variantId)}`;
    }

    const productUrl = `${theme.routes.root}products/${button.getAttribute(attributes.handle)}?section_id=api-quickview${quickViewVariant}`;

    if (isShopTheLookPopupTrigger) {
      options.mainClass = classes.shopTheLookPopupClass;

      this.buttonsQuickView.forEach((element) => {
        element.classList.add(classes.loading);
      });

      const XMLS = new XMLSerializer();
      const quickViewItemsTemplate = this.container.querySelector(selectors.quickViewItemsTemplate).content.firstElementChild.cloneNode(true);

      const itemsData = XMLS.serializeToString(quickViewItemsTemplate);

      this.loadPhotoswipeWithTemplate(itemsData, button);
    } else {
      this.loadPhotoswipeFromFetch(productUrl, button);
    }
  }

  loadPhotoswipeWithTemplate(data, button) {
    const items = [
      {
        html: data,
      },
    ];

    this.loadPhotoswipe = new LoadPhotoswipe(items, options, settings.templateIndex, button);
  }

  loadPhotoswipeFromFetch(url, button) {
    fetch(url)
      .then((response) => {
        return response.text();
      })
      .then((data) => {
        const items = [
          {
            html: data,
          },
        ];

        this.loadPhotoswipe = new LoadPhotoswipe(items, options, settings.templateIndex, button);
      })
      .catch((error) => console.log('error: ', error));
  }
}

export default QuickViewPopup;
