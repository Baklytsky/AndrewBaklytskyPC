import {newsletterSection} from '../globals/newsletter';
import {register} from '../vendor/theme-scripts/theme-sections';
import {PopupCookie} from '../globals/popup-cookie';
import {a11y} from '../vendor/theme-scripts/theme-a11y';

const selectors = {
  largePromo: '[data-large-promo]',
  largePromoInner: '[data-large-promo-inner]',
  tracking: '[data-tracking-consent]',
  trackingInner: '[data-tracking-consent-inner]',
  trackingAccept: '[data-confirm-cookies]',
  popupBar: '[data-popup-bar]',
  popupBarHolder: '[data-popup-bar-holder]',
  popupBarToggle: '[data-popup-bar-toggle]',
  popupBody: '[data-popup-body]',
  popupClose: '[data-popup-close]',
  popupUnderlay: '[data-popup-underlay]',
  newsletterForm: '[data-newsletter-form]',
};

const attributes = {
  cookieName: 'data-cookie-name',
  targetReferrer: 'data-target-referrer',
  preventScrollLock: 'data-prevent-scroll-lock',
};

const classes = {
  success: 'has-success',
  error: 'has-error',
  selected: 'selected',
  hasBlockSelected: 'has-block-selected',
  expanded: 'popup--expanded',
  visible: 'popup--visible',
  mobile: 'mobile',
  desktop: 'desktop',
  popupBar: 'popup--bar',
  barIsVisible: 'popup-bar-is-visible',
};

let sections = {};
let scrollLockTimer = 0;
let activePopups = 0;
let popups = [];

class DelayShow {
  constructor(popupContainer, popup) {
    this.popupContainer = popupContainer;
    this.popup = popup;
    this.popupBody = popup.querySelector(selectors.popupBody);
    this.delay = popupContainer.dataset.popupDelay;
    this.isSubmitted = window.location.href.indexOf('accepts_marketing') !== -1 || window.location.href.indexOf('customer_posted=true') !== -1;
    this.a11y = a11y;
    this.showPopupOnScrollEvent = () => this.showPopupOnScroll();

    if (this.delay === 'always' || this.isSubmitted) {
      this.always();
    }

    if (this.delay && this.delay.includes('delayed') && !this.isSubmitted) {
      const seconds = this.delay.includes('_') ? parseInt(this.delay.split('_')[1]) : 10;
      this.delayed(seconds);
    }

    if (this.delay === 'bottom' && !this.isSubmitted) {
      this.bottom();
    }

    if (this.delay === 'idle' && !this.isSubmitted) {
      this.idle();
    }
  }

  always() {
    this.showPopup();
  }

  delayed(seconds = 10) {
    setTimeout(() => {
      // Show popup after specific seconds
      this.showPopup();
    }, seconds * 1000);
  }

  // Scroll to the bottom of the page
  bottom() {
    document.addEventListener('theme:scroll', this.showPopupOnScrollEvent);
  }

  // Idle for 1 min
  idle() {
    const isTargetValid = this.checkPopupTarget() === true;
    if (!isTargetValid) {
      return;
    }

    let timer = 0;
    let idleTime = 60000;
    const documentEvents = ['mousemove', 'mousedown', 'click', 'touchmove', 'touchstart', 'touchend', 'keydown', 'keypress'];
    const windowEvents = ['load', 'resize', 'scroll'];

    const startTimer = () => {
      timer = setTimeout(() => {
        timer = 0;
        this.showPopup();
      }, idleTime);

      documentEvents.forEach((eventType) => {
        document.addEventListener(eventType, resetTimer);
      });

      windowEvents.forEach((eventType) => {
        window.addEventListener(eventType, resetTimer);
      });
    };

    const resetTimer = () => {
      if (timer) {
        clearTimeout(timer);
      }

      documentEvents.forEach((eventType) => {
        document.removeEventListener(eventType, resetTimer);
      });

      windowEvents.forEach((eventType) => {
        window.removeEventListener(eventType, resetTimer);
      });

      startTimer();
    };

    startTimer();
  }

  showPopup() {
    // Push every popup in array, so we can focus the next one, after closing each
    const popupElement = {id: this.popup.id, body: this.popupBody};
    popups.push(popupElement);

    const isTargetValid = this.checkPopupTarget() === true;

    if (isTargetValid) {
      activePopups += 1;
      this.popup.classList.add(classes.visible);
      if (this.popup.classList.contains(classes.popupBar)) {
        document.body.classList.add(classes.barIsVisible);
      }

      this.a11y.trapFocus({
        container: this.popupBody,
      });

      // The scroll is not locking if data-prevent-scroll-lock is added to the Popup container
      if (this.popup.hasAttribute(attributes.preventScrollLock)) {
        return false;
      }

      this.scrollLock();
    }
  }

  checkPopupTarget() {
    const targetMobile = this.popup.parentNode.classList.contains(classes.mobile);
    const targetDesktop = this.popup.parentNode.classList.contains(classes.desktop);

    if ((targetMobile && window.innerWidth >= theme.sizes.small) || (targetDesktop && window.innerWidth < theme.sizes.small)) {
      return false;
    } else {
      return true;
    }
  }

  scrollLock() {
    document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: this.popupBody}));
  }

  showPopupOnScroll() {
    if (window.scrollY + window.innerHeight >= document.body.clientHeight) {
      this.showPopup();
      document.removeEventListener('theme:scroll', this.showPopupOnScrollEvent);
    }
  }

  onUnload() {
    document.removeEventListener('theme:scroll', this.showPopupOnScrollEvent);
  }
}

class TargetReferrer {
  constructor(el) {
    this.popupContainer = el;
    this.locationPath = location.href;

    if (!this.popupContainer.hasAttribute(attributes.targetReferrer)) {
      return false;
    }

    if (this.locationPath.indexOf(this.popupContainer.getAttribute(attributes.targetReferrer)) === -1 && !window.Shopify.designMode) {
      this.popupContainer.parentNode.removeChild(this.popupContainer);
    }
  }
}

class LargePopup {
  constructor(el) {
    this.popupContainer = el;
    this.popup = this.popupContainer.querySelector(selectors.largePromoInner);
    this.popupBody = this.popup.querySelector(selectors.popupBody);
    this.popupId = this.popup.id;
    this.close = this.popup.querySelector(selectors.popupClose);
    this.underlay = this.popup.querySelector(selectors.popupUnderlay);
    this.form = this.popup.querySelector(selectors.newsletterForm);
    this.cookie = new PopupCookie(this.popupContainer.dataset.cookieName, 'user_has_closed');
    this.isTargeted = new TargetReferrer(this.popupContainer);
    this.a11y = a11y;

    this.init();
  }

  init() {
    const cookieExists = this.cookie.read() !== false;

    if (!cookieExists || window.Shopify.designMode) {
      if (!window.Shopify.designMode) {
        new DelayShow(this.popupContainer, this.popup);
      } else {
        this.showPopup();
      }

      if (this.form) {
        setTimeout(() => {
          if (this.form.classList.contains(classes.success)) {
            this.showPopupIfNoCookie();
            activePopups -= 1;
          }
        });
      }

      this.initClosers();
    }
  }

  checkPopupTarget() {
    const targetMobile = this.popup.parentNode.classList.contains(classes.mobile);
    const targetDesktop = this.popup.parentNode.classList.contains(classes.desktop);

    if ((targetMobile && window.innerWidth >= theme.sizes.small) || (targetDesktop && window.innerWidth < theme.sizes.small)) {
      return false;
    } else {
      return true;
    }
  }

  showPopupIfNoCookie() {
    this.showPopup();
  }

  initClosers() {
    this.close.addEventListener('click', this.closePopup.bind(this));
    this.underlay.addEventListener('click', this.closePopup.bind(this));
    this.popupContainer.addEventListener('keyup', (event) => {
      if (event.code === theme.keyboardKeys.ESCAPE) {
        this.closePopup(event);
      }
    });
  }

  closePopup(event) {
    event.preventDefault();
    this.hidePopup();
    this.cookie.write();
  }

  scrollLock() {
    this.resetScrollUnlock();
    this.a11y.trapFocus({
      container: this.popupBody,
    });
    document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: this.popupBody}));
  }

  scrollUnlock() {
    this.resetScrollUnlock();

    // Unlock scrollbar after popup animation completes
    scrollLockTimer = setTimeout(() => {
      document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
    }, 300);
  }

  resetScrollUnlock() {
    if (scrollLockTimer) {
      clearTimeout(scrollLockTimer);
    }
  }

  showPopup() {
    const isTargetValid = this.checkPopupTarget() === true;
    const popupElement = {id: this.popupId, body: this.popup};
    popups.push(popupElement);
    if (isTargetValid) {
      activePopups += 1;
      this.popup.classList.add(classes.visible);
      this.scrollLock();
    }
  }

  hidePopup() {
    this.popup.classList.remove(classes.visible);
    const popupIndex = popups.findIndex((x) => x.id === this.popupId);
    activePopups -= 1;
    popups.splice(popupIndex, 1);

    if (activePopups == 1 && document.body.classList.contains(classes.barIsVisible)) {
      this.scrollUnlock();
    } else if (activePopups < 1) {
      this.scrollUnlock();
      this.a11y.removeTrapFocus();
    } else if (popups.length > 0) {
      const nextPopup = popups[popups.length - 1].body;
      this.a11y.trapFocus({
        container: nextPopup,
      });
    }
  }

  onBlockSelect(evt) {
    if (this.popupContainer.contains(evt.target) && !this.popup.classList.contains(classes.visible)) {
      this.popup.classList.add(classes.selected);
      this.popupContainer.classList.add(classes.hasBlockSelected);
      this.showPopup();
    }
  }

  onBlockDeselect(evt) {
    if (this.popupContainer.contains(evt.target)) {
      this.popup.classList.remove(classes.selected);
      this.popupContainer.classList.remove(classes.hasBlockSelected);
      this.hidePopup();
    }
  }

  onUnload() {
    this.scrollUnlock();
  }

  onDeselect() {
    this.popup.classList.remove(classes.selected);
    this.popupContainer.classList.remove(classes.hasBlockSelected);
    this.hidePopup();
  }
}

class Tracking {
  constructor(el) {
    this.popupContainer = el;
    this.popup = this.popupContainer.querySelector(selectors.trackingInner);
    this.popupId = this.popup.id;
    this.close = this.popup.querySelector(selectors.popupClose);
    this.acceptButton = this.popup.querySelector(selectors.trackingAccept);
    this.enable = this.popupContainer.dataset.enable === 'true';
    this.a11y = a11y;

    window.Shopify.loadFeatures(
      [
        {
          name: 'consent-tracking-api',
          version: '0.1',
        },
      ],
      (error) => {
        if (error) {
          throw error;
        }

        const userCanBeTracked = window.Shopify.customerPrivacy.userCanBeTracked();
        const userTrackingConsent = window.Shopify.customerPrivacy.getTrackingConsent();

        this.enableTracking = !userCanBeTracked && userTrackingConsent === 'no_interaction' && this.enable;

        if (window.Shopify.designMode) {
          this.enableTracking = true;
        }

        this.init();
      }
    );
  }

  init() {
    if (this.enableTracking) {
      this.showPopup();
    }

    this.clickEvents();
  }

  clickEvents() {
    this.close.addEventListener('click', (event) => {
      event.preventDefault();

      window.Shopify.customerPrivacy.setTrackingConsent(false, () => this.hidePopup());
    });

    this.acceptButton.addEventListener('click', (event) => {
      event.preventDefault();

      window.Shopify.customerPrivacy.setTrackingConsent(true, () => this.hidePopup());
    });

    document.addEventListener('trackingConsentAccepted', () => {
      console.log('trackingConsentAccepted event fired');
    });
  }

  showPopup() {
    const popupElement = {id: this.popupId, body: this.popup};
    popups.push(popupElement);
    this.popup.classList.add(classes.visible);
    this.a11y.trapFocus({
      container: this.popup,
    });
  }

  hidePopup() {
    this.popup.classList.remove(classes.visible);
    const popupIndex = popups.findIndex((x) => x.id === this.popupId);
    popups.splice(popupIndex, 1);

    if (activePopups < 1) {
      this.a11y.removeTrapFocus();
    } else if (popups.length > 0) {
      const nextPopup = popups[popups.length - 1].body;
      this.a11y.trapFocus({
        container: nextPopup,
      });
    }
  }

  onBlockSelect(evt) {
    if (this.popupContainer.contains(evt.target) && this.enableTracking && !this.popup.classList.contains(classes.visible)) {
      this.showPopup();
      this.popup.classList.add(classes.selected);
      this.popup.parentNode.classList.add(classes.hasBlockSelected);
    }
  }

  onBlockDeselect(evt) {
    if (this.popupContainer.contains(evt.target)) {
      this.popup.classList.remove(classes.selected);
      this.popupContainer.classList.remove(classes.hasBlockSelected);
      this.hidePopup();
    }
  }

  onDeselect() {
    this.popup.classList.remove(classes.selected);
    this.popupContainer.classList.remove(classes.hasBlockSelected);
    this.hidePopup();
  }
}

class PopupBar {
  constructor(el) {
    this.popupContainer = el;
    this.popup = this.popupContainer.querySelector(selectors.popupBarHolder);
    this.popupBody = this.popup.querySelector(selectors.popupBody);
    this.popupId = this.popup.id;
    this.close = this.popup.querySelector(selectors.popupClose);
    this.underlay = this.popup.querySelector(selectors.popupUnderlay);
    this.toggle = this.popup.querySelector(selectors.popupBarToggle);
    this.cookie = new PopupCookie(this.popupContainer.dataset.cookieName, 'user_has_closed');
    this.form = this.popup.querySelector(selectors.newsletterForm);
    this.isTargeted = new TargetReferrer(this.popupContainer);
    this.a11y = a11y;

    this.init();
  }

  init() {
    const cookieExists = this.cookie.read() !== false;

    if (!cookieExists || window.Shopify.designMode) {
      if (!window.Shopify.designMode) {
        new DelayShow(this.popupContainer, this.popup);
      } else {
        this.showPopup();
      }

      this.initPopupToggleButton();
      this.initClosers();

      if (this.form) {
        setTimeout(() => {
          if (this.form.classList.contains(classes.success)) {
            this.showPopupIfNoCookie();
          }

          if (this.form.classList.contains(classes.error)) {
            // Expand popup if form has error
            this.toggle.dispatchEvent(new Event('click'));
          }
        });
      }
    }
  }

  checkPopupTarget() {
    const targetMobile = this.popup.parentNode.classList.contains(classes.mobile);
    const targetDesktop = this.popup.parentNode.classList.contains(classes.desktop);

    if ((targetMobile && window.innerWidth >= theme.sizes.small) || (targetDesktop && window.innerWidth < theme.sizes.small)) {
      return false;
    } else {
      return true;
    }
  }

  showPopupIfNoCookie() {
    this.showPopup();
    this.toggle.dispatchEvent(new Event('click'));
  }

  initPopupToggleButton() {
    this.toggle.addEventListener('click', (event) => {
      event.preventDefault();

      this.popup.classList.toggle(classes.expanded);

      if (this.popup.classList.contains(classes.expanded)) {
        this.scrollLock();
      } else {
        this.scrollUnlock();
      }
    });
  }

  showPopup() {
    const popupElement = {id: this.popupId, body: this.popup};
    popups.push(popupElement);
    this.a11y.trapFocus({
      container: this.popupBody,
    });
    const isTargetValid = this.checkPopupTarget() === true;
    if (isTargetValid) {
      activePopups += 1;
      document.body.classList.add(classes.barIsVisible);
      this.popup.classList.add(classes.visible);
    }
  }

  hidePopup() {
    this.popup.classList.remove(classes.visible);
    document.body.classList.remove(classes.barIsVisible);
    const popupIndex = popups.findIndex((x) => x.id === this.popupId);
    popups.splice(popupIndex, 1);

    if (activePopups >= 1) {
      activePopups -= 1;
    }

    if (activePopups < 1) {
      this.scrollUnlock();
      this.a11y.removeTrapFocus();
    } else if (popups.length > 0) {
      const nextPopup = popups[popups.length - 1].body;
      this.a11y.trapFocus({
        container: nextPopup,
      });
    }
  }

  initClosers() {
    this.close.addEventListener('click', this.closePopup.bind(this));
    this.underlay.addEventListener('click', () => this.toggle.dispatchEvent(new Event('click')));
    this.popupContainer.addEventListener('keyup', (event) => {
      if (event.code === theme.keyboardKeys.ESCAPE) {
        this.popup.classList.remove(classes.expanded);
        this.scrollUnlock();
      }
    });
  }

  closePopup(event) {
    event.preventDefault();

    this.cookie.write();
    this.hidePopup();
  }

  scrollLock() {
    document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: this.popupBody}));
  }

  scrollUnlock() {
    this.resetScrollUnlock();

    // Unlock scrollbar after popup animation completes
    scrollLockTimer = setTimeout(() => {
      document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
    }, 300);
  }

  resetScrollUnlock() {
    if (scrollLockTimer) {
      clearTimeout(scrollLockTimer);
    }
  }

  onBlockSelect(evt) {
    if (this.popupContainer.contains(evt.target) && !this.popup.classList.contains(classes.visible)) {
      this.showPopup();
      this.popup.classList.add(classes.expanded);
      this.popup.classList.add(classes.selected);
      this.popup.parentNode.classList.add(classes.hasBlockSelected);
      this.resetScrollUnlock();
      this.scrollLock();
    }
  }

  onBlockDeselect(evt) {
    if (this.popupContainer.contains(evt.target)) {
      this.popup.classList.remove(classes.expanded);
      this.popup.classList.remove(classes.selected);
      this.popup.parentNode.classList.remove(classes.hasBlockSelected);
      this.hidePopup();
    }
  }

  onUnload() {
    this.scrollUnlock();
  }

  onDeselect() {
    this.popup.classList.remove(classes.expanded);
    this.popup.classList.remove(classes.selected);
    this.popup.parentNode.classList.remove(classes.hasBlockSelected);
    this.hidePopup();
  }
}

const popupSection = {
  onLoad() {
    sections[this.id] = [];

    if (window.Shopify.designMode) {
      activePopups = 0;
    }

    const popupsLarge = this.container.querySelectorAll(selectors.largePromo);
    if (popupsLarge.length) {
      popupsLarge.forEach((el) => {
        sections[this.id].push(new LargePopup(el));
      });
    }

    const popupBars = this.container.querySelectorAll(selectors.popupBar);
    if (popupBars.length) {
      popupBars.forEach((el) => {
        sections[this.id].push(new PopupBar(el));
      });
    }

    const cookiesPopups = this.container.querySelectorAll(selectors.tracking);
    if (cookiesPopups.length) {
      cookiesPopups.forEach((el) => {
        sections[this.id].push(new Tracking(el));
      });
    }
  },
  onDeselect() {
    sections[this.id].forEach((el) => {
      if (typeof el.onDeselect === 'function') {
        el.onDeselect();
      }
    });
  },
  onBlockSelect(evt) {
    sections[this.id].forEach((el) => {
      if (typeof el.onBlockSelect === 'function') {
        el.onBlockSelect(evt);
      }
    });
  },
  onBlockDeselect(evt) {
    sections[this.id].forEach((el) => {
      if (typeof el.onBlockDeselect === 'function') {
        el.onBlockDeselect(evt);
      }
    });
  },
  onUnload(evt) {
    sections[this.id].forEach((el) => {
      if (typeof el.onUnload === 'function') {
        el.onUnload(evt);
      }
    });
  },
};

register('popups', [popupSection, newsletterSection]);
