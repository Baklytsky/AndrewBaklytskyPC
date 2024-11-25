import * as a11y from '../vendor/theme-scripts/theme-a11y';
import {newsletterCheckForResultSection} from '../globals/newsletter';
import {register} from '../vendor/theme-scripts/theme-sections';
import {PopupCookie} from '../globals/popup-cookie';
import {PopupActions} from '../features/popup-actions';
import {isDesktop} from '../util/media-query';

const selectors = {
  largePromo: '[data-large-promo]',
  largePromoInner: '[data-large-promo-inner]',
  cartBar: 'cart-bar',
  newsletterPopup: '[data-newsletter]',
  newsletterPopupHolder: '[data-newsletter-holder]',
  newsletterHeading: '[data-newsletter-heading]',
  newsletterField: '[data-newsletter-field]',
  promoPopup: '[data-promo-text]',
  newsletterForm: '[data-newsletter-form]',
  delayAttribite: 'data-popup-delay',
  cookieNameAttribute: 'data-cookie-name',
  dataTargetReferrer: 'data-target-referrer',
};

const classes = {
  hidden: 'hidden',
  hasValue: 'has-value',
  cartBarVisible: 'cart-bar-visible',
  isVisible: 'is-visible',
  success: 'has-success',
  selected: 'selected',
  hasBlockSelected: 'has-block-selected',
  mobile: 'mobile',
  desktop: 'desktop',
  bottom: 'bottom',
};

let sections = {};

class DelayShow {
  constructor(holder, element, popupEvents) {
    this.element = element;
    this.delay = holder.getAttribute(selectors.delayAttribite);
    this.isSubmitted = window.location.href.indexOf('accepts_marketing') !== -1 || window.location.href.indexOf('customer_posted=true') !== -1;
    this.popupActions = popupEvents;
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
    this.popupActions.popupOpen();
  }

  delayed(seconds = 10) {
    // Show popup after specific seconds
    setTimeout(() => {
      this.popupActions.popupOpen();
    }, seconds * 1000);
  }

  // Idle for 1 min
  idle() {
    let timer = 0;
    let idleTime = 60000;
    const documentEvents = ['mousemove', 'mousedown', 'click', 'touchmove', 'touchstart', 'touchend', 'keydown', 'keypress'];
    const windowEvents = ['load', 'resize', 'scroll'];

    const startTimer = () => {
      timer = setTimeout(() => {
        timer = 0;
        this.popupActions.popupOpen();
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

  // Scroll to the bottom of the page
  bottom() {
    document.addEventListener('theme:scroll', this.showPopupOnScrollEvent);
  }

  showPopupOnScroll() {
    if (window.scrollY + window.innerHeight >= document.body.clientHeight) {
      this.popupActions.popupOpen();
      document.removeEventListener('theme:scroll', this.showPopupOnScrollEvent);
    }
  }

  onUnload() {
    document.removeEventListener('theme:scroll', this.showPopupOnScrollEvent);
  }
}

class TargetReferrer {
  constructor(el) {
    this.el = el;
    this.locationPath = location.href;

    if (!this.el.hasAttribute(selectors.dataTargetReferrer)) {
      return false;
    }

    this.init();
  }

  init() {
    if (this.locationPath.indexOf(this.el.getAttribute(selectors.dataTargetReferrer)) === -1 && !window.Shopify.designMode) {
      this.el.parentNode.removeChild(this.el);
    }
  }
}

class LargePopup {
  constructor(el) {
    this.popup = el;
    this.modal = this.popup.querySelector(selectors.largePromoInner);
    this.form = this.popup.querySelector(selectors.newsletterForm);
    this.cookie = new PopupCookie(this.popup.getAttribute(selectors.cookieNameAttribute), 'user_has_closed');
    this.isTargeted = new TargetReferrer(this.popup);
    this.popupActions = new PopupActions(this.modal, this.modal, true, true);
    this.a11y = a11y;

    this.init();
  }

  init() {
    const cookieExists = this.cookie.read() !== false;
    const targetMobile = this.popup.classList.contains(classes.mobile);
    const targetDesktop = this.popup.classList.contains(classes.desktop);
    const isMobileView = !isDesktop();
    let targetMatches = true;

    if ((targetMobile && !isMobileView) || (targetDesktop && isMobileView)) {
      targetMatches = false;
    }

    if (!targetMatches) {
      this.a11y.removeTrapFocus();
      document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
      return;
    }

    if (!cookieExists || window.Shopify.designMode) {
      if (!window.Shopify.designMode && !window.location.pathname.endsWith('/challenge')) {
        new DelayShow(this.popup, this.modal, this.popupActions);
      }

      if (this.form && this.form.classList.contains(classes.success)) {
        this.checkForSuccess();
      }

      this.modal.addEventListener('theme:popup:onclose', () => this.cookie.write());
    }
  }

  checkForSuccess() {
    this.popupActions.popupOpen();
    this.cookie.write();
  }

  onBlockSelect(evt) {
    if (this.popup.contains(evt.target)) {
      this.popupActions.popupOpen();
      this.popup.classList.add(classes.selected);
      this.popup.parentNode.classList.add(classes.hasBlockSelected);
    }
  }

  onBlockDeselect(evt) {
    if (this.popup.contains(evt.target)) {
      this.popupActions.popupClose();
      this.popup.classList.remove(classes.selected);
      this.popup.parentNode.classList.remove(classes.hasBlockSelected);
    }
  }
}

class PromoText {
  constructor(el) {
    this.popup = el;
    this.cookie = new PopupCookie(this.popup.getAttribute(selectors.cookieNameAttribute), 'user_has_closed');
    this.isTargeted = new TargetReferrer(this.popup);
    this.popupActions = new PopupActions(this.popup, this.popup, false, false);

    this.init();
  }

  init() {
    const cookieExists = this.cookie.read() !== false;

    if (!cookieExists || window.Shopify.designMode) {
      if (!window.Shopify.designMode) {
        new DelayShow(this.popup, this.popup, this.popupActions);
      } else {
        this.popupActions.popupOpen();
      }

      this.popup.addEventListener('theme:popup:onclose', () => this.cookie.write());
    }
  }

  onSelect() {
    this.popupActions.popupOpen();
    this.popup.classList.add(classes.selected);
    this.popup.parentNode.classList.add(classes.hasBlockSelected);
  }

  onDeselect() {
    this.popupActions.popupClose();
    this.popup.classList.remove(classes.selected);
    this.popup.parentNode.classList.remove(classes.hasBlockSelected);
  }
}

class NewsletterPopup {
  constructor(el) {
    this.popup = el;
    this.holder = this.popup.querySelector(selectors.newsletterPopupHolder);
    this.heading = this.popup.querySelector(selectors.newsletterHeading);
    this.newsletterField = this.popup.querySelector(selectors.newsletterField);
    this.cookie = new PopupCookie(this.popup.getAttribute(selectors.cookieNameAttribute), 'newsletter_is_closed');
    this.form = this.popup.querySelector(selectors.newsletterForm);
    this.isTargeted = new TargetReferrer(this.popup);
    this.popupActions = new PopupActions(this.holder, this.holder, false, false);
    this.resetClassTimer = 0;

    this.init();
  }

  init() {
    const cookieExists = this.cookie.read() !== false;
    const submissionSuccess = window.location.search.indexOf('?customer_posted=true') !== -1;
    const classesString = [...this.holder.classList].toString();
    const isPositionBottom = classesString.includes(classes.bottom);

    if (submissionSuccess) {
      this.delay = 0;
    }

    if (!cookieExists || window.Shopify.designMode) {
      this.show();

      if (this.form.classList.contains(classes.success)) {
        this.checkForSuccess();
      }
    }

    if (isPositionBottom) {
      this.observeCartBar();
    }
  }

  show() {
    if (!window.location.pathname.endsWith('/challenge')) {
      if (!window.Shopify.designMode) {
        new DelayShow(this.popup, this.holder, this.popupActions);
      } else {
        this.popupActions.popupOpen();
      }
    }

    this.showForm();
    this.inputField();

    this.holder.addEventListener('theme:popup:onclose', () => this.cookie.write());
  }

  checkForSuccess() {
    this.popupActions.popupOpen();
    this.cookie.write();
  }

  observeCartBar() {
    this.cartBar = document.getElementById(selectors.cartBar);

    if (!this.cartBar) return;

    const config = {attributes: true, childList: false, subtree: false};
    let isVisible = this.cartBar.classList.contains(classes.isVisible);
    document.body.classList.toggle(classes.cartBarVisible, isVisible);

    // Callback function to execute when mutations are observed
    const callback = (mutationList) => {
      for (const mutation of mutationList) {
        if (mutation.type === 'attributes') {
          isVisible = mutation.target.classList.contains(classes.isVisible);
          document.body.classList.toggle(classes.cartBarVisible, isVisible);
        }
      }
    };

    this.observer = new MutationObserver(callback);
    this.observer.observe(this.cartBar, config);
  }

  showForm() {
    this.heading.addEventListener('click', (event) => {
      event.preventDefault();

      this.heading.classList.add(classes.hidden);
      this.form.classList.remove(classes.hidden);
      this.newsletterField.focus();
    });

    this.heading.addEventListener('keyup', (event) => {
      if (event.code === 'Enter') {
        this.heading.dispatchEvent(new Event('click'));
      }
    });
  }

  inputField() {
    const setClass = () => {
      // Reset timer if exists and is active
      if (this.resetClassTimer) {
        clearTimeout(this.resetClassTimer);
      }

      if (this.newsletterField.value !== '') {
        this.holder.classList.add(classes.hasValue);
      }
    };

    const unsetClass = () => {
      // Reset timer if exists and is active
      if (this.resetClassTimer) {
        clearTimeout(this.resetClassTimer);
      }

      // Reset class
      this.resetClassTimer = setTimeout(() => {
        this.holder.classList.remove(classes.hasValue);
      }, 2000);
    };

    this.newsletterField.addEventListener('input', setClass);
    this.newsletterField.addEventListener('focus', setClass);
    this.newsletterField.addEventListener('focusout', unsetClass);
  }

  onBlockSelect(evt) {
    if (this.popup.contains(evt.target)) {
      this.popupActions.popupOpen();
      this.popup.classList.add(classes.selected);
      this.popup.parentNode.classList.add(classes.hasBlockSelected);
    }
  }

  onBlockDeselect(evt) {
    if (this.popup.contains(evt.target)) {
      this.popupActions.popupClose();
      this.popup.classList.remove(classes.selected);
      this.popup.parentNode.classList.remove(classes.hasBlockSelected);
    }
  }

  onUnload() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

const popupSection = {
  onLoad() {
    sections[this.id] = [];

    const newsletters = this.container.querySelectorAll(selectors.largePromo);
    newsletters.forEach((el) => {
      sections[this.id].push(new LargePopup(el));
    });

    const newsletterPopup = this.container.querySelectorAll(selectors.newsletterPopup);
    newsletterPopup.forEach((el) => {
      sections[this.id].push(new NewsletterPopup(el));
    });

    const promoPopup = this.container.querySelectorAll(selectors.promoPopup);
    promoPopup.forEach((el) => {
      sections[this.id].push(new PromoText(el));
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
  onSelect() {
    sections[this.id].forEach((el) => {
      if (typeof el.onSelect === 'function') {
        el.onSelect();
      }
    });
  },
  onDeselect() {
    sections[this.id].forEach((el) => {
      if (typeof el.onDeselect === 'function') {
        el.onDeselect();
      }
    });
  },
  onUnload() {
    sections[this.id].forEach((el) => {
      if (typeof el.onUnload === 'function') {
        el.onUnload();
      }
    });
  },
};

register('popups', [popupSection, newsletterCheckForResultSection]);
