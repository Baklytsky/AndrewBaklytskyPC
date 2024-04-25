import Flickity from 'flickity';

import flickitySmoothScrolling from '../globals/flickity-smooth-scrolling';
import ProductVideo from '../media/product-video';
import {a11y} from '../vendor/theme-scripts/theme-a11y';
import {Drawer} from '../globals/drawer';
import wrapElements from '../globals/wrap';
import {removeLoadingClassFromLoadedImages} from '../globals/images';

import {ProductAddForm} from './product-form';
import {makeSwatches, SwatchesContainer} from './swatch';
import {Popout} from './popout';
import {Tooltip} from './tooltip';

const selectors = {
  addToCart: '[data-add-to-cart]',
  deferredMedia: '[data-deferred-media]',
  deferredMediaButton: '[data-deferred-media-button]',
  popupClose: '[data-popup-close]',
  popout: '[data-popout]',
  quickViewInner: '[data-quick-view-inner]',
  quickViewItemHolder: '[data-quick-view-item-holder]',
  product: '[data-product]',
  productForm: '[data-product-form]',
  productMediaSlider: '[data-product-single-media-slider]',
  productMediaWrapper: '[data-product-single-media-wrapper]',
  productModel: '[data-model]',
  productJSON: '[data-product-json]',
  quickViewFootInner: '[data-quick-view-foot-inner]',
  shopTheLookThumb: '[data-shop-the-look-thumb]',
  tooltip: '[data-tooltip]',
  drawerToggle: '[data-drawer-toggle]',
};

const classes = {
  hasMediaActive: 'has-media-active',
  isActive: 'is-active',
  isLoading: 'is-loading',
  mediaHidden: 'media--hidden',
  noOutline: 'no-outline',
  notificationPopupVisible: 'notification-popup-visible',
  popupQuickViewAnimateIn: 'popup-quick-view--animate-in',
  popupQuickViewAnimateOut: 'popup-quick-view--animate-out',
  popupQuickViewAnimated: 'popup-quick-view--animated',
  popupQuickView: 'popup-quick-view',
  jsQuickViewVisible: 'js-quick-view-visible',
  jsQuickViewFromCart: 'js-quick-view-from-cart',
  drawerOpen: 'js-drawer-open',
};

const attributes = {
  id: 'id',
  mediaId: 'data-media-id',
  sectionId: 'data-section-id',
  handle: 'data-handle',
  loaded: 'loaded',
  tabindex: 'tabindex',
  quickViewOnboarding: 'data-quick-view-onboarding',
  hotspot: 'data-hotspot',
  hotspotRef: 'data-hotspot-ref',
};

const ids = {
  addToCartFormId: 'AddToCartForm--',
  addToCartId: 'AddToCart--',
};

class LoadQuickview {
  constructor(popup, pswpElement) {
    this.popup = popup;
    this.pswpElement = pswpElement;
    this.quickViewFoot = this.pswpElement.querySelector(selectors.quickViewFootInner);
    this.quickViewInner = this.pswpElement.querySelector(selectors.quickViewInner);
    this.product = this.pswpElement.querySelectorAll(selectors.product);
    this.flkty = [];
    this.videos = [];
    this.productForms = [];
    this.deferredMedias = this.pswpElement.querySelectorAll(selectors.deferredMedia);
    this.buttonsShopTheLookThumb = this.pswpElement.querySelectorAll(selectors.shopTheLookThumb);
    this.quickViewItemHolders = this.pswpElement.querySelectorAll(selectors.quickViewItemHolder);
    this.popupCloseButtons = this.quickViewInner.querySelectorAll(selectors.popupClose);
    this.a11y = a11y;

    this.prevent3dModelSubmitEvent = (event) => this.prevent3dModelSubmit(event);
    this.closeOnAnimationEndEvent = (event) => this.closeOnAnimationEnd(event);
    this.closeOnEscapeEvent = (event) => this.closeOnEscape(event);

    this.outerCloseEvent = (event) => {
      if (!this.quickViewInner.contains(event.target)) {
        // Check if quickview has drawer
        const drawer = this.quickViewInner.nextElementSibling;
        if (drawer && drawer.contains(event.target)) return;

        this.closePopup(event);
      }
    };

    this.product.forEach((item, index) => {
      const isQuickViewOnboarding = item.hasAttribute(attributes.quickViewOnboarding);

      if (!isQuickViewOnboarding) {
        this.initItems(item, index);
      }
    });

    this.init();
    this.initTooltips();
    this.initPopouts();

    // Check swatches containers height
    this.swatchesContainer = new SwatchesContainer(this.pswpElement);
  }

  /*
   * Init tooltips for swatches
   */
  initTooltips() {
    this.tooltips = this.pswpElement.querySelectorAll(selectors.tooltip);
    this.tooltips.forEach((tooltip) => {
      new Tooltip(tooltip);
    });
  }

  /*
   * Init popouts
   */
  initPopouts() {
    this.popoutElements = this.pswpElement.querySelectorAll(selectors.popout);
    this.popouts = {};

    this.popoutElements?.forEach((popout, index) => {
      this.popouts[index] = new Popout(popout);
    });
  }

  handleDraggable(slider, draggableStatus) {
    if (!slider) return;

    slider.options.draggable = Boolean(draggableStatus);
    slider.updateDraggable();
  }

  initItems(item, index) {
    this.addFormSuffix(item);
    this.initProductSlider(item, index);
    this.initProductVideo(item);
    this.initProductModel(item);
    this.initShopifyXrLaunch(item);

    // Init swatches
    makeSwatches(item);

    // Init drawer
    const drawerToggles = this.pswpElement.querySelectorAll(selectors.drawerToggle);
    if (drawerToggles.length) {
      new Drawer(item);
    }

    // Wrap tables
    wrapElements(item);

    const productForm = new ProductAddForm(item.parentNode);
    this.productForms.push(productForm);

    if (Shopify.PaymentButton) {
      Shopify.PaymentButton.init();
    }

    item.classList.remove(classes.isLoading);
  }

  init() {
    // Prevent 3d models button redirecting to cart page when enabling/disabling the model a couple of times
    document.addEventListener('submit', this.prevent3dModelSubmitEvent);

    // Custom closing events
    this.popupCloseButtons.forEach((popupClose) => {
      popupClose.addEventListener('keyup', (event) => {
        if (event.code === theme.keyboardKeys.ENTER || event.code === theme.keyboardKeys.NUMPADENTER || event.code === theme.keyboardKeys.SPACE) {
          this.closePopup(event);
        }
      });

      popupClose.addEventListener('click', (event) => {
        this.closePopup(event);
      });
    });

    this.pswpElement.addEventListener('click', this.outerCloseEvent);

    document.dispatchEvent(new CustomEvent('theme:popup:open', {bubbles: true}));

    this.popup.listen('preventDragEvent', (e, isDown, preventObj) => {
      preventObj.prevent = false;
    });

    this.pswpElement.addEventListener('mousedown', () => {
      this.popup.framework.unbind(window, 'pointermove pointerup pointercancel', this.popup);
    });

    // Opening event
    this.popup.listen('initialZoomInEnd', () => {
      document.body.classList.add(classes.jsQuickViewVisible);

      this.a11y.trapFocus({
        container: this.quickViewInner,
      });
    });

    this.pswpElement.addEventListener('animationend', this.closeOnAnimationEndEvent);

    this.popup.listen('destroy', () => {
      if (this.flkty.length > 0) {
        requestAnimationFrame(() => {
          this.flkty.forEach((slider) => slider.pausePlayer());
        });
      }
      document.body.classList.remove(classes.jsQuickViewVisible);
      document.removeEventListener('keyup', this.closeOnEscapeEvent);
      document.addEventListener('keyup', this.closeOnEscapeEvent);
      this.pswpElement.removeEventListener('click', this.outerCloseEvent);
      this.pswpElement.removeEventListener('animationend', this.closeOnAnimationEndEvent);
      document.removeEventListener('submit', this.prevent3dModelSubmitEvent);

      this.deferredMedias.forEach((deferredMedia) => {
        // Remove the 'loaded' attribute so the videos will can load properly when we reopening the quickview
        deferredMedia.removeAttribute(attributes.loaded);

        // Pause videos on closing the popup
        const media = deferredMedia.closest(selectors.productMediaWrapper);
        media.dispatchEvent(new CustomEvent('theme:media:hidden'), {bubbles: true});
        media.classList.add(classes.mediaHidden);
      });
    });

    document.addEventListener('keyup', this.closeOnEscapeEvent);
    document.addEventListener('theme:cart:added', () => {
      if (this.pswpElement.classList.contains(classes.popupQuickView)) {
        this.pswpElement.classList.add(classes.popupQuickViewAnimateOut);
      }
    });

    this.animateInQuickview();

    // 'Shop the look' thumbnails nav
    this.initShopTheLookListeners();
  }

  initShopTheLookListeners() {
    this.buttonsShopTheLookThumb?.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();

        const thumb = event.target.matches(selectors.shopTheLookThumb) ? event.target : event.target.closest(selectors.shopTheLookThumb);
        const holder = this.pswpElement.querySelector(`[${attributes.hotspot}="${thumb.getAttribute(attributes.hotspotRef)}"]`);

        if (thumb.classList.contains(classes.isActive) || !holder) return;

        // Handle sliders
        if (this.flkty.length > 0) {
          requestAnimationFrame(() => {
            this.flkty.forEach((slider) => {
              slider.resize();

              const allMediaItems = this.quickViewInner.querySelectorAll(selectors.productMediaWrapper);

              // Pause all media
              if (allMediaItems.length) {
                allMediaItems.forEach((media) => {
                  media.dispatchEvent(new CustomEvent('theme:media:hidden'), {bubbles: true});
                  media.classList.add(classes.mediaHidden);
                });
              }
            });
          });
        }

        // Active Quick View item class toggle
        holder.classList.add(classes.isActive);

        this.quickViewItemHolders.forEach((element) => {
          if (element !== holder) {
            element.classList.remove(classes.isActive);
          }
        });
      });
    });
  }

  // Prevents the 3d model buttons submitting the form
  prevent3dModelSubmit(event) {
    if (event.submitter.closest(selectors.deferredMedia) && event.submitter.closest(selectors.productForm)) {
      event.preventDefault();
    }
  }

  closeQuickviewOnMobile() {
    if (window.innerWidth < window.theme.sizes.large && document.body.classList.contains(classes.jsQuickViewVisible)) {
      this.popup.close();
    }
  }

  animateInQuickview() {
    this.pswpElement.classList.add(classes.popupQuickViewAnimateIn);

    this.quickViewFoot.addEventListener('animationend', (event) => {
      this.handleAnimatedState(event);
    });

    // Mobile
    this.pswpElement.addEventListener('animationend', (event) => {
      this.handleAnimatedState(event, true);
    });
  }

  handleAnimatedState(event, isMobileAnimation = false) {
    if (event.animationName == 'quickViewAnimateInUp') {
      if (isMobileAnimation && window.innerWidth >= window.theme.sizes.small) {
        // Checks mobile animation but it's not mobile screen size
        return;
      }

      this.pswpElement.classList.add(classes.popupQuickViewAnimated);
      this.pswpElement.classList.remove(classes.popupQuickViewAnimateIn);
      document.body.classList.remove(classes.jsQuickViewFromCart); // Clear the class that we are adding in quick-view-popup.js when the animation ends

      removeLoadingClassFromLoadedImages(this.pswpElement); // Remove loading class from images
    }
  }

  closePopup(event) {
    event?.preventDefault();
    const isNavDrawerOpen = document.body.classList.contains(classes.drawerOpen);

    if (isNavDrawerOpen) {
      document.dispatchEvent(new CustomEvent('theme:drawer:closing', {bubbles: true}));
    }

    this.pswpElement.classList.add(classes.popupQuickViewAnimateOut); // Adding this class triggers the 'animationend' event which calls closeOnAnimationEndEvent()

    this.swatchesContainer.onUnload();
  }

  closeOnAnimationEnd(event) {
    if (event.animationName == 'quickViewAnimateOutRight' || event.animationName == 'quickViewAnimateOutDown') {
      this.popup.template.classList.remove(classes.popupQuickViewAnimateOut, classes.popupQuickViewAnimated);
      this.popup.close();

      if (this.productForms.length > 0) {
        this.productForms.forEach((form) => form.onUnload());
      }
    }
  }

  closeOnEscape(event) {
    const isQuickViewVisible = document.body.classList.contains(classes.jsQuickViewVisible);
    const isNotificationVisible = document.body.classList.contains(classes.notificationPopupVisible);

    if (event.code === theme.keyboardKeys.ESCAPE && isQuickViewVisible && !isNotificationVisible) {
      this.closePopup(event);
    }
  }

  initProductSlider(item, index) {
    const slider = item.querySelector(selectors.productMediaSlider);
    const mediaItems = item.querySelectorAll(selectors.productMediaWrapper);

    if (mediaItems.length > 1) {
      const itemSlider = new Flickity(slider, {
        wrapAround: true,
        cellAlign: 'left',
        pageDots: false,
        prevNextButtons: true,
        adaptiveHeight: false,
        pauseAutoPlayOnHover: false,
        selectedAttraction: 0.2,
        friction: 1,
        autoPlay: false,
        on: {
          ready: () => {
            slider.setAttribute(attributes.tabindex, '-1');

            // This resize should happen when the show animation of the PhotoSwipe starts and after PhotoSwipe adds the custom 'popup--quickview' class with the mainClass option.
            // This class is changing the slider width with CSS and looks like this is happening after the slider loads which is breaking it. That's why we need to call the resize() method here.
            requestAnimationFrame(() => {
              itemSlider.resize();
            });
          },
          settle: () => {
            const currentSlide = itemSlider.selectedElement;
            const mediaId = currentSlide.getAttribute(attributes.mediaId);

            currentSlide.setAttribute(attributes.tabindex, '0');

            itemSlider.cells.forEach((slide) => {
              if (slide.element === currentSlide) {
                return;
              }

              slide.element.setAttribute(attributes.tabindex, '-1');
            });

            this.switchMedia(item, mediaId);
          },
        },
      });

      this.flkty.push(itemSlider);

      // Toggle flickity draggable functionality based on media play/pause state
      if (mediaItems.length) {
        mediaItems.forEach((element) => {
          element.addEventListener('theme:media:play', () => {
            this.handleDraggable(this.flkty[index], false);
            element.closest(selectors.productMediaSlider).classList.add(classes.hasMediaActive);
          });

          element.addEventListener('theme:media:pause', () => {
            this.handleDraggable(this.flkty[index], true);
            element.closest(selectors.productMediaSlider).classList.remove(classes.hasMediaActive);
          });
        });
      }

      // iOS smooth scrolling fix
      flickitySmoothScrolling(slider);
    }
  }

  switchMedia(item, mediaId) {
    const allMediaItems = this.quickViewInner.querySelectorAll(selectors.productMediaWrapper);
    const selectedMedia = item.querySelector(`${selectors.productMediaWrapper}[${attributes.mediaId}="${mediaId}"]`);
    const isFocusEnabled = !document.body.classList.contains(classes.noOutline);

    // Pause other media
    if (allMediaItems.length) {
      allMediaItems.forEach((media) => {
        media.dispatchEvent(new CustomEvent('theme:media:hidden'), {bubbles: true});
        media.classList.add(classes.mediaHidden);
      });
    }

    if (isFocusEnabled) {
      selectedMedia.focus();
    }

    selectedMedia.closest(selectors.productMediaSlider).classList.remove(classes.hasMediaActive);
    selectedMedia.classList.remove(classes.mediaHidden);
    selectedMedia.dispatchEvent(new CustomEvent('theme:media:visible'), {bubbles: true});

    // If media is not loaded, trigger poster button click to load it
    const deferredMedia = selectedMedia.querySelector(selectors.deferredMedia);
    if (deferredMedia && deferredMedia.getAttribute(attributes.loaded) !== 'true') {
      selectedMedia.querySelector(selectors.deferredMediaButton).dispatchEvent(new Event('click'));
    }
  }

  initProductVideo(item) {
    const videos = new ProductVideo(item);

    this.videos.push(videos);
  }

  initProductModel(item) {
    const sectionId = item.getAttribute(attributes.sectionId);
    const modelItems = item.querySelectorAll(selectors.productModel);

    if (modelItems.length) {
      modelItems.forEach((element) => {
        theme.ProductModel.init(element, sectionId);
      });
    }
  }

  initShopifyXrLaunch(item) {
    document.addEventListener('shopify_xr_launch', () => {
      const currentMedia = item.querySelector(`${selectors.productModel}:not(.${classes.mediaHidden})`);
      currentMedia.dispatchEvent(new CustomEvent('xrLaunch'));
    });
  }

  addFormSuffix(item) {
    const sectionId = item.getAttribute(attributes.sectionId);
    const productObject = JSON.parse(item.querySelector(selectors.productJSON).innerHTML);

    const formSuffix = `${sectionId}-${productObject.handle}`;
    const productForm = item.querySelector(selectors.productForm);
    const addToCart = item.querySelector(selectors.addToCart);

    productForm.setAttribute(attributes.id, ids.addToCartFormId + formSuffix);
    addToCart.setAttribute(attributes.id, ids.addToCartId + formSuffix);
  }
}

export {LoadQuickview};
