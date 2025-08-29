import loadScript from '../util/loader';

window.theme.LoadPhotoswipe = window.theme.LoadPhotoswipe || null;

class LoadPhotoswipe {
  constructor(items, options = '') {
    this.items = items;
    this.pswpElement = document.querySelectorAll('.pswp')[0];
    this.popup = null;
    this.popupThumbs = null;
    this.popupThumbsContainer = this.pswpElement.querySelector('.pswp__thumbs');
    this.closeBtn = this.pswpElement.querySelector('.pswp__custom-close');
    this.keyupCloseEvent = (e) => this.keyupClose(e);
    this.a11y = window.theme.a11y;

    const defaultOptions = {
      history: false,
      focus: false,
      mainClass: '',
    };
    this.options = options !== '' ? options : defaultOptions;

    this.init();
  }

  init() {
    this.pswpElement.classList.add('pswp--custom-opening');

    this.initLoader();

    loadScript({url: window.theme.assets.photoswipe})
      .then(() => this.loadPopup())
      .catch((e) => console.error(e));
  }

  initLoader() {
    if (this.pswpElement.classList.contains('pswp--custom-loader') && this.options !== '' && this.options.mainClass) {
      this.pswpElement.setAttribute('data-pswp-option-classes', this.options.mainClass);
      let loaderElem = document.createElement('div');
      loaderElem.innerHTML = `<div class="pswp__loader"><div class="loader pswp__loader-line"><div class="loader-indeterminate"></div></div></div>`;
      loaderElem = loaderElem.firstChild;
      this.pswpElement.appendChild(loaderElem);
    } else {
      this.pswpElement.setAttribute('data-pswp-option-classes', '');
    }
  }

  loadPopup() {
    const PhotoSwipe = window.themePhotoswipe.PhotoSwipe.default;
    const PhotoSwipeUI = window.themePhotoswipe.PhotoSwipeUI.default;

    if (this.pswpElement.classList.contains('pswp--custom-loader')) {
      this.pswpElement.classList.remove('pswp--custom-loader');
    }

    this.pswpElement.classList.remove('pswp--custom-opening');

    this.popup = new PhotoSwipe(this.pswpElement, PhotoSwipeUI, this.items, this.options);
    this.popup.init();

    this.thumbsActions();

    if (document.body.classList.contains('is-focused')) {
      setTimeout(() => {
        this.a11y.trapFocus(this.pswpElement, {
          elementToFocus: this.closeBtn,
        });
      }, 200);
    }

    this.popup.listen('close', () => this.onClose());

    if (this.options && this.options.closeElClasses && this.options.closeElClasses.length) {
      this.options.closeElClasses.forEach((closeClass) => {
        const closeElement = this.pswpElement.querySelector(`.pswp__${closeClass}`);
        if (closeElement) {
          closeElement.addEventListener('keyup', this.keyupCloseEvent);
        }
      });
    }
  }

  thumbsActions() {
    if (!this.popupThumbsContainer || !this.popupThumbsContainer.children.length) return;

    this.popupThumbsContainer.addEventListener('wheel', (e) => this.stopDisabledScroll(e));
    this.popupThumbsContainer.addEventListener('mousewheel', (e) => this.stopDisabledScroll(e));
    this.popupThumbsContainer.addEventListener('DOMMouseScroll', (e) => this.stopDisabledScroll(e));

    this.popupThumbs = this.pswpElement.querySelectorAll('.pswp__thumbs > *');
    this.popupThumbs.forEach((element, i) => {
      element.addEventListener('click', (e) => {
        e.preventDefault();
        const lastCurrentElement = element.parentElement.querySelector('is-current');
        lastCurrentElement.classList.remove('is-current');
        lastCurrentElement.setAttribute('aria-current', false);
        element.classList.add('is-current');
        element.setAttribute('aria-current', true);
        this.popup.goTo(i);
      });
    });

    this.popup.listen('imageLoadComplete', () => this.setCurrentThumb());
    this.popup.listen('beforeChange', () => this.setCurrentThumb());
  }

  stopDisabledScroll(e) {
    e.stopPropagation();
  }

  keyupClose(e) {
    if (e.code === 'Enter') {
      this.popup.close();
    }
  }

  onClose() {
    const popupIframe = this.pswpElement.querySelector('iframe, video');
    if (popupIframe) {
      popupIframe.parentNode.removeChild(popupIframe);
    }

    if (this.popupThumbsContainer && this.popupThumbsContainer.firstChild) {
      while (this.popupThumbsContainer.firstChild) this.popupThumbsContainer.removeChild(this.popupThumbsContainer.firstChild);
    }

    this.pswpElement.setAttribute('data-pswp-option-classes', '');
    const loaderElem = this.pswpElement.querySelector('.pswp__loader');
    if (loaderElem) {
      this.pswpElement.removeChild(loaderElem);
    }

    if (this.options && this.options.closeElClasses && this.options.closeElClasses.length) {
      this.options.closeElClasses.forEach((closeClass) => {
        const closeElement = this.pswpElement.querySelector(`.pswp__${closeClass}`);
        if (closeElement) {
          closeElement.removeEventListener('keyup', this.keyupCloseEvent);
        }
      });
    }

    this.a11y.removeTrapFocus();
    this.a11y.autoFocusLastElement();
  }

  setCurrentThumb() {
    const lastCurrentThumb = this.pswpElement.querySelector('.pswp__thumbs > .is-current');
    if (lastCurrentThumb) {
      lastCurrentThumb.classList.remove('is-current');
      lastCurrentThumb.setAttribute('aria-current', false);
    }

    if (!this.popupThumbs) return;
    const currentThumb = this.popupThumbs[this.popup.getCurrentIndex()];
    currentThumb.classList.add('is-current');
    currentThumb.setAttribute('aria-current', true);
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

window.theme.LoadPhotoswipe = LoadPhotoswipe;
