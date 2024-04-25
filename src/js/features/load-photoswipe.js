import loadScript from '../util/loader';
import {a11y} from '../vendor/theme-scripts/theme-a11y';

import {LoadVideoVimeo} from './load-video-vimeo';
import {LoadVideoYT} from './load-video-youtube';
import {LoadNotification} from './load-popup-notification';
import {LoadQuickview} from './load-popup-quickview';

const settings = {
  unlockScrollDelay: 400,
};

const selectors = {
  popupContainer: '.pswp',
  popupCloseBtn: '.pswp__custom-close',
  popupIframe: 'iframe, video',
  popupCustomIframe: '.pswp__custom-iframe',
  popupThumbs: '.pswp__thumbs',
  popupButtons: '.pswp__button, .pswp__caption-close',
  product: '[data-product]',
  productJSON: '[data-product-json]',
};

const classes = {
  current: 'is-current',
  customLoader: 'pswp--custom-loader',
  customOpen: 'pswp--custom-opening',
  loader: 'pswp__loader',
  opened: 'pswp--open',
  popupCloseButton: 'pswp__button--close',
  notificationPopup: 'pswp--notification',
  quickviewPopup: 'popup-quick-view',
  isCartDrawerOpen: 'js-drawer-open-cart',
  quickViewAnimateOut: 'popup-quick-view--animate-out',
};

const attributes = {
  dataOptionClasses: 'data-pswp-option-classes',
  dataVideoType: 'data-video-type',
};

const loaderHTML = `<div class="${classes.loader}"><div class="loader loader--image"><div class="loader__image"></div></div></div>`;

class LoadPhotoswipe {
  constructor(items, options = '', templateIndex = 0, triggerButton = null) {
    this.items = items;
    this.triggerBtn = triggerButton;
    this.pswpElements = document.querySelectorAll(selectors.popupContainer);
    this.pswpElement = this.pswpElements[templateIndex];
    this.popup = null;
    this.popupThumbs = null;
    this.popupThumbsContainer = this.pswpElement.querySelector(selectors.popupThumbs);
    this.closeBtn = this.pswpElement.querySelector(selectors.popupCloseBtn);
    const defaultOptions = {
      history: false,
      focus: false,
      mainClass: '',
    };
    this.options = options !== '' ? options : defaultOptions;
    this.onCloseCallback = () => this.onClose();
    this.dispatchPopupInitEventCallback = () => this.dispatchPopupInitEvent();
    this.setCurrentThumbCallback = () => this.setCurrentThumb();
    this.a11y = a11y;

    this.init();
  }

  init() {
    document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));

    this.pswpElement.classList.add(classes.customOpen);

    this.initLoader();

    loadScript({url: window.theme.assets.photoswipe})
      .then(() => this.loadPopup())
      .catch((e) => console.error(e));
  }

  initLoader() {
    if (this.pswpElement.classList.contains(classes.customLoader) && this.options !== '' && this.options.mainClass) {
      this.pswpElement.setAttribute(attributes.dataOptionClasses, this.options.mainClass);
      let loaderElem = document.createElement('div');
      loaderElem.innerHTML = loaderHTML;
      loaderElem = loaderElem.firstChild;
      this.pswpElement.appendChild(loaderElem);
    } else {
      this.pswpElement.setAttribute(attributes.dataOptionClasses, '');
    }
  }

  loadPopup() {
    const PhotoSwipe = window.themePhotoswipe.PhotoSwipe.default;
    const PhotoSwipeUI = window.themePhotoswipe.PhotoSwipeUI.default;

    if (this.pswpElement.classList.contains(classes.customLoader)) {
      this.pswpElement.classList.remove(classes.customLoader);
    }

    this.pswpElement.classList.remove(classes.customOpen);

    this.popup = new PhotoSwipe(this.pswpElement, PhotoSwipeUI, this.items, this.options);

    this.popup.listen('afterInit', this.dispatchPopupInitEventCallback);
    this.popup.listen('imageLoadComplete', this.setCurrentThumbCallback);
    this.popup.listen('beforeChange', this.setCurrentThumbCallback);
    this.popup.listen('close', this.onCloseCallback);

    this.popup.init();

    this.initPopupCallback();
  }

  initPopupCallback() {
    if (this.isVideo) {
      this.hideUnusedButtons();
    }

    this.initVideo();
    this.thumbsActions();

    this.a11y.trapFocus({
      container: this.pswpElement,
    });

    if (this.pswpElement.classList.contains(classes.quickviewPopup)) {
      new LoadQuickview(this.popup, this.pswpElement);
    }

    if (this.pswpElement.classList.contains(classes.notificationPopup)) {
      new LoadNotification(this.popup, this.pswpElement);
    }

    this.closePopup = () => {
      if (this.pswpElement.classList.contains(classes.quickviewPopup)) {
        this.pswpElement.classList.add(classes.quickViewAnimateOut); // Close the Quickview popup accordingly
      } else {
        this.popup.close();
      }
    };

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', this.closePopup);
    }

    // Close Quick view popup when product added to cart
    document.addEventListener('theme:cart:added', this.closePopup);
  }

  dispatchPopupInitEvent() {
    if (this.triggerBtn) {
      this.triggerBtn.dispatchEvent(new CustomEvent('theme:popup:init', {bubbles: true}));
    }
  }

  initVideo() {
    const videoContainer = this.pswpElement.querySelector(selectors.popupCustomIframe);
    if (videoContainer) {
      const videoType = videoContainer.getAttribute(attributes.dataVideoType);
      this.isVideo = true;

      if (videoType == 'youtube') {
        new LoadVideoYT(videoContainer.parentElement);
      } else if (videoType == 'vimeo') {
        new LoadVideoVimeo(videoContainer.parentElement);
      }
    }
  }

  thumbsActions() {
    if (this.popupThumbsContainer && this.popupThumbsContainer.firstChild) {
      this.popupThumbsContainer.addEventListener('wheel', (e) => this.stopDisabledScroll(e));
      this.popupThumbsContainer.addEventListener('mousewheel', (e) => this.stopDisabledScroll(e));
      this.popupThumbsContainer.addEventListener('DOMMouseScroll', (e) => this.stopDisabledScroll(e));

      this.popupThumbs = this.pswpElement.querySelectorAll(`${selectors.popupThumbs} > *`);
      this.popupThumbs.forEach((element, i) => {
        element.addEventListener('click', (e) => {
          e.preventDefault();
          element.parentElement.querySelector(`.${classes.current}`).classList.remove(classes.current);
          element.classList.add(classes.current);
          this.popup.goTo(i);
        });
      });
    }
  }

  hideUnusedButtons() {
    const buttons = this.pswpElement.querySelectorAll(selectors.popupButtons);
    buttons.forEach((element) => {
      if (!element.classList.contains(classes.popupCloseButton)) {
        element.style.display = 'none';
      }
    });
  }

  stopDisabledScroll(e) {
    e.stopPropagation();
  }

  onClose() {
    const popupIframe = this.pswpElement.querySelector(selectors.popupIframe);
    if (popupIframe) {
      popupIframe.parentNode.removeChild(popupIframe);
    }

    if (this.popupThumbsContainer && this.popupThumbsContainer.firstChild) {
      while (this.popupThumbsContainer.firstChild) {
        this.popupThumbsContainer.removeChild(this.popupThumbsContainer.firstChild);
      }
    }

    this.pswpElement.setAttribute(attributes.dataOptionClasses, '');
    const loaderElem = this.pswpElement.querySelector(`.${classes.loader}`);
    if (loaderElem) {
      this.pswpElement.removeChild(loaderElem);
    }

    if (!document.body.classList.contains(classes.isCartDrawerOpen)) {
      this.a11y.removeTrapFocus();
    }

    document.removeEventListener('theme:cart:added', this.closePopup);

    // Unlock scroll if only cart drawer is closed and there are no more popups opened
    setTimeout(() => {
      const recentlyOpenedPopups = this.recentlyOpenedPopupsCount();
      const isCartDrawerOpen = document.body.classList.contains(classes.isCartDrawerOpen);

      if (recentlyOpenedPopups === 0 && !isCartDrawerOpen) {
        document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
      }
    }, settings.unlockScrollDelay);
  }

  recentlyOpenedPopupsCount() {
    let count = 0;

    this.pswpElements.forEach((popup) => {
      const isOpened = popup.classList.contains(classes.opened);

      if (isOpened) {
        count += 1;
      }
    });

    return count;
  }

  setCurrentThumb() {
    const hasThumbnails = this.popupThumbsContainer && this.popupThumbsContainer.firstChild;

    if (hasThumbnails) return;

    const lastCurrentThumb = this.pswpElement.querySelector(`${selectors.popupThumbs} > .${classes.current}`);
    if (lastCurrentThumb) {
      lastCurrentThumb.classList.remove(classes.current);
    }

    if (!this.popupThumbs) {
      return;
    }
    const currentThumb = this.popupThumbs[this.popup.getCurrentIndex()];
    currentThumb.classList.add(classes.current);
    this.scrollThumbs(currentThumb);
  }

  scrollThumbs(currentThumb) {
    const thumbsContainerLeft = this.popupThumbsContainer.scrollLeft;
    const thumbsContainerWidth = this.popupThumbsContainer.offsetWidth;
    const thumbsContainerPos = thumbsContainerLeft + thumbsContainerWidth;
    const currentThumbLeft = currentThumb.offsetLeft;
    const currentThumbWidth = currentThumb.offsetWidth;
    const currentThumbPos = currentThumbLeft + currentThumbWidth;

    if (thumbsContainerPos <= currentThumbPos || thumbsContainerPos > currentThumbLeft) {
      const currentThumbMarginLeft = parseInt(window.getComputedStyle(currentThumb).marginLeft);
      this.popupThumbsContainer.scrollTo({
        top: 0,
        left: currentThumbLeft - currentThumbMarginLeft,
        behavior: 'smooth',
      });
    }
  }
}

export {LoadPhotoswipe};
