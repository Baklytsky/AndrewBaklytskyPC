if (window.AOS) {
  AOS.init({once: true, offset: 50, startEvent: 'DOMContentLoaded'});
  window.addEventListener('load', AOS.refresh)
}

// force an element to top left of the page
const topLeftMarker = document.createElement("span");
topLeftMarker.style.position = "absolute";
topLeftMarker.style.left = "0";
topLeftMarker.style.top = "0";

document.body.appendChild(topLeftMarker)

function setCSSProperties() {
  const announcementBar = document.querySelector('.announcement-bar');
  const header = document.querySelector('.header');

  if (announcementBar) {
    document.documentElement.style.setProperty('--announcement-bar-height',
      announcementBar.getBoundingClientRect().height + 'px');
  }

  if (header) {
    document.documentElement.style.setProperty('--header-height', header.getBoundingClientRect().height + 'px');
    document.documentElement.style.setProperty('--header-bottom', header.getBoundingClientRect().bottom + 'px');
  }
}

function scrollOffset() {
  const rect = topLeftMarker.getBoundingClientRect();
  return { x: rect.left * -1, y: rect.top * -1 }
}

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function handleize(str) {
  return str.toLowerCase().replace(/[^\w\u00C0-\u024f]+/g, "-").replace(/^-+|-+$/g, "");
}

function phoneValidation(phoneNumber) {
  if (!phoneNumber && phoneNumber.length) return false;
  const x = phoneNumber.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
  return !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
}

window.isIosDevice = typeof window !== 'undefined' && window.navigator && window.navigator.platform && (/iP(ad|hone|od)/.test(window.navigator.platform) || window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);

window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('no-outline');
  if (document.body.style.overflow === 'hidden') {
    document.body.style.overflow = null;
  }

  document.addEventListener('mousedown', (e) => {
    if (!document.body.classList.contains('no-outline')) {
      document.body.classList.add('no-outline');
    }
  })

  document.addEventListener('keydown', (e) => {
    if (document.body.classList.contains('no-outline') && (e.keyCode == 13 || e.keyCode == 9 || e.keyCode == 38 || e.keyCode == 40)) {
      document.body.classList.remove('no-outline');
    }
  })
});

function setVw() {
  const vw = document.documentElement.clientWidth
  document.documentElement.style.setProperty('--vw', `${vw}px`);
}

setVw()
window.addEventListener('resize', setVw)

function setAttributes (el, attrObj) {
  Object.keys(attrObj).forEach(key => el.setAttribute(key, attrObj[key]));
}

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function() {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function(event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(":focus-visible");
} catch(e) {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT', 'TAB', 'ENTER', 'SPACE', 'ESCAPE', 'HOME', 'END', 'PAGEUP', 'PAGEDOWN']
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener('keydown', (event) => {
    if(navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener('mousedown', (event) => {
    mouseClick = true;
  });

  window.addEventListener('focus', () => {
    if (currentFocusedElement) currentFocusedElement.classList.remove('focused');

    if (mouseClick) return;

    currentFocusedElement = document.activeElement;
    currentFocusedElement.classList.add('focused');

  }, true);
}

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
  });
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach((video) => video.pause());
  document.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== 'ESCAPE') return;

  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector('summary');
  openDetailsElement.removeAttribute('open');
  summaryElement.setAttribute('aria-expanded', false);
  summaryElement.focus();
}

function formatMoney(cents, format, withoutCurrencyIcon = false) {
  if (typeof cents === 'string') {
    cents = cents.replace('.', '');
  }

  const defaultTo = function(value, defaultValue) {
    return (value == null || value !== value) ? defaultValue : value
  }

  let value = '';
  let currencyIcon = '$';
  const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  const formatString = (format || moneyFormat);

  switch (Shopify.currency.active) {
    case 'GBP':
      currencyIcon = '£';
      break;
  }

  if (withoutCurrencyIcon) currencyIcon = '';

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultTo(precision, 2);
    thousands = defaultTo(thousands, ',');
    decimal = defaultTo(decimal, '.');

    if (isNaN(number) || number == null) {
      return 0;
    }

    number = (number / 100.0).toFixed(precision);

    const parts = number.split('.');
    const thousandsCount = Math.trunc(cents / 100000)
    const dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, `${thousandsCount}` + thousands);
    const centsAmount = parts[1] ? (decimal + parts[1]) : '';

    return dollarsAmount + centsAmount;
  }

  switch (formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_point_separator':
      value = formatWithDelimiters(cents, 2, '.', '.');
      break;
    case 'amount_no_decimals_with_point_separator':
      value = formatWithDelimiters(cents, 0, '.', '.');
      break;
  }

  return currencyIcon + formatString.replace(placeholderRegex, value);
}

function changeContentBySelector(selector, html) {
  const currentContent = document.querySelector(selector);
  const newContent = html.querySelector(selector);
  if (currentContent && newContent) currentContent.innerHTML = newContent.innerHTML;
}


/*
 * Shopify Common JS
 *
 */
if ((typeof window.Shopify) == 'undefined') {
  window.Shopify = {};
}

Shopify.bind = function(fn, scope) {
  return function() {
    return fn.apply(scope, arguments);
  }
};

Shopify.setSelectorByValue = function(selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function(target, eventName, callback) {
  target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on'+eventName, callback);
};

Shopify.postLink = function(path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for(var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function(country_domid, province_domid, options) {
  this.countryEl         = document.getElementById(country_domid);
  this.provinceEl        = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

  Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler,this));

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function() {
    var value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function() {
    var value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function(e) {
    var opt       = this.countryEl.options[this.countryEl.selectedIndex];
    var raw       = opt.getAttribute('data-provinces');
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.parentElement.style.display = 'none';
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }
      this.provinceContainer.parentElement.style.display = "";
    }
  },

  clearOptions: function(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function(selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  }
};

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.popup = this.querySelector('[data-popup]');
    this.overlay = document.querySelector('.page-overlay');
    this.closeBtn = this.querySelectorAll('[data-close-popup]');
    this.header = document.querySelector('.header-section');
    this.announcementBar = document.querySelector('.announcement-bar');

    this.closeBtn.forEach(btn => btn.addEventListener('click', this.hide.bind(this)))

    this.addEventListener('keyup', (event) => {
      if (event.code?.toUpperCase() === 'ESCAPE') this.hide();
    });

    this.addEventListener('click', (event) => {
      if (event.target.nodeName === 'MODAL-DIALOG') this.hide();
    });

    this.overlay.addEventListener('click', (e) => {
      const isClickInside = this.contains(e.target);

      if (!isClickInside) this.hide();
    })
  }

  resetNavHeight() {
    setTimeout(()=> {
      setHeaderHeightVar();
      if (scrollOffset().y > 0) {
        this.header.classList.add('shopify-section-header-sticky');
        if (this.announcementBar) document.documentElement.style.setProperty('--announcement-bar-height', '0px');
      }
    }, 0)
  }

  show(opener) {
    this.openedBy = opener;
    this.overlay.setAttribute('aria-hidden', 'false');
    this.popup.setAttribute('aria-hidden', 'false');
    if (this.openedBy) this.openedBy.setAttribute('aria-expanded', 'true');
    trapFocus(this, this.querySelector('[role="dialog"]'));
    window.pauseAllMedia();
    if (this.popup.classList.contains('menu-drawer') || this.popup.classList.contains('search-modal')) {
      this.header.classList.add('menu-opened');

      if (window.scrollY < this.header?.offsetHeight + this.announcementBar?.offsetHeight || 0) {
        window.scrollTo(0, 0);
      }
    }

    this.resetNavHeight();

    const scrollElement = this.querySelector('.hide-scrollbar') || this;
    bodyScrollLock.disableBodyScroll(scrollElement, {
      allowTouchMove: el => {
        while (el && el !== document.body) {
          if (el.getAttribute('body-scroll-lock-ignore') !== null) {
            return true;
          }

          el = el.parentElement;
        }
      },
    });

    if (this.popup.querySelector('.cart-view-event')) {
      this.popup.querySelector('.cart-view-event').classList.remove('hide')
    }

    if (this.popup.classList.contains('subs-info__modal')) {
      window.dataLayer.push({
      'event': 'see_details',
        'click': {
          'see_details_type': 'Subscription Details'
        }
      })
    }
  }

  hide() {
    this.popup.setAttribute('aria-hidden', 'true');
    if (!this.popup.classList.contains('submenu-drawer')) {
      bodyScrollLock.clearAllBodyScrollLocks();
      this.overlay.setAttribute('aria-hidden', 'true');

      if (this.popup.classList.contains('menu-drawer')) {
        this.header.classList.remove('menu-opened');
      }
    }

    if (this.openedBy) this.openedBy.setAttribute('aria-expanded', 'false');
    window.pauseAllMedia();

    if (this.popup.querySelector('.cart-view-event')) {
      this.popup.querySelector('.cart-view-event').classList.add('hide');
    }
  }
}
customElements.define('modal-dialog', ModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('[aria-controls]');

    if (!button) return;

    const modalElement = document.querySelector(button.getAttribute('aria-controls'));

    if (!modalElement) return;

    const modal = modalElement.querySelector('[data-popup]');
    button.addEventListener('click', (e) => {
      e.preventDefault();

      if(modal.getAttribute('aria-hidden') === 'false') {
        if (button.classList.contains('close-all-drawers')) {
          document.querySelectorAll('modal-dialog [data-popup][aria-hidden=false]').forEach(popup => {
            popup.closest('modal-dialog').hide()
          })
        } else {
          modalElement.hide();
        }
      } else {
        modalElement.show(button);
      }
    });
  }
}
customElements.define('modal-opener', ModalOpener);

class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener('click', this.loadContent.bind(this));
  }

  loadContent(focus = true) {
    window.pauseAllMedia();
    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div');
      content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));

      this.setAttribute('loaded', true);
      const deferredElement = this.appendChild(content.querySelector('video, model-viewer, iframe'));
      if (focus) deferredElement.focus();
    }
  }
}

customElements.define('deferred-media', DeferredMedia);

function buttonLoadOff (btn) {
  const spinner = btn.querySelector('.loading-overlay__spinner');
  btn.classList.remove('loading');
  btn.removeAttribute('aria-disabled');
  if (spinner) spinner.classList.add('hidden');
}

function buttonLoadOn (btn) {
  const spinner = btn.querySelector('.loading-overlay__spinner');
  if (btn.classList.contains('loading')) return;
  btn.setAttribute('aria-disabled', 'true');
  btn.classList.add('loading');
  if (spinner) spinner.classList.remove('hidden');
}

function slideDown(target, duration = 300, showDisplay = 'block', checkHidden = true) {
  let display = window.getComputedStyle(target).display;
  if (checkHidden && display !== 'none') {
    return;
  }
  target.style.removeProperty('display');
  if (display === 'none') display = showDisplay;
  target.style.display = display;
  let height = target.offsetHeight;
  target.style.overflow = 'hidden';
  target.style.height = 0;
  target.style.paddingTop = 0;
  target.style.paddingBottom = 0;
  target.style.marginTop = 0;
  target.style.marginBottom = 0;
  target.offsetHeight;
  target.style.transitionProperty = 'height, margin, padding';
  target.style.transitionDuration = duration + 'ms';
  target.style.height = height + 'px';
  target.style.removeProperty('padding-top');
  target.style.removeProperty('padding-bottom');
  target.style.removeProperty('margin-top');
  target.style.removeProperty('margin-bottom');
  window.setTimeout(() => {
    target.style.removeProperty('height');
    target.style.removeProperty('overflow');
    target.style.removeProperty('transition-duration');
    target.style.removeProperty('transition-property');
  }, duration);
}

function slideUp(target, duration = 300) {
  target.style.transitionProperty = 'height, margin, padding';
  target.style.transitionDuration = duration + 'ms';
  target.style.height = target.offsetHeight + 'px';
  target.offsetHeight;
  target.style.overflow = 'hidden';
  target.style.height = 0;
  target.style.paddingTop = 0;
  target.style.paddingBottom = 0;
  target.style.marginTop = 0;
  target.style.marginBottom = 0;
  window.setTimeout(() => {
    target.style.display = 'none';
    target.style.removeProperty('height');
    target.style.removeProperty('padding-top');
    target.style.removeProperty('padding-bottom');
    target.style.removeProperty('margin-top');
    target.style.removeProperty('margin-bottom');
    target.style.removeProperty('overflow');
    target.style.removeProperty('transition-duration');
    target.style.removeProperty('transition-property');
  }, duration);
}

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.singleStepper = this.hasAttribute('data-single-stepper');
    this.changeEvent = new Event('change', { bubbles: true });

    this.querySelectorAll('button').forEach(
      (button) => button.addEventListener('click', this.onButtonClick.bind(this))
    );

    this.addEventListener('focusout', ()=> {
      if (this.input.value === '' || this.input.value <= 0) {
        this.input.value = '1';
        this.input.dispatchEvent(this.changeEvent);
      }
    })
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    this.dataset.quantityValue = this.input.value
    if (this.singleStepper) this.setAttribute('disabled', 'true')
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }
}

customElements.define('quantity-input', QuantityInput);

class Accordion extends HTMLElement {
  constructor() {
    super();
    this.button = this.querySelector('.accordion__button');
    this.targetName = this.button.getAttribute('aria-controls');
    this.target = this.querySelector(`#${this.targetName}`)

    this.accordionGroup = this.dataset.accordionGroup;
    this.matchMedia = this.dataset.matchMedia;

    if (this.target) {
      this.button.addEventListener('click', (e) => {
        e.preventDefault()
        if (this.button.hasAttribute('data-inactive')) return
        this.onButtonClick()
        if (this.accordionGroup) this.closeAccordionGroup()
      });
    }

    if (this.matchMedia) {
      document.addEventListener("shopify:section:load", ()=> this.checkMatchMedia());
      this.checkMatchMedia()
    }
  }

  checkMatchMedia () {
    const breakpoint = window.matchMedia(`(${this.matchMedia})`),
      breakpointChecker = () => {
        if (breakpoint.matches) {
          this.close()
          this.button.removeAttribute('data-inactive')
        } else {
          this.open()
          this.button.setAttribute('data-inactive', 'true')
        }
      };
    breakpoint.addEventListener('change', () => breakpointChecker());
    breakpointChecker();
  }

  closeAccordionGroup () {
    const accordionGroups = document.querySelectorAll(`[data-accordion-group=${this.accordionGroup}]`)
    accordionGroups.forEach(group => {
      if (group !== this) group.close()
    })
  }

  onButtonClick() {
    const expanded = this.button.getAttribute('aria-expanded');
    (expanded === 'true') ? this.close() : this.open();
  }

  open() {
    this.button.setAttribute('aria-expanded', 'true');
    this.button.style.pointerEvents = 'none'
    slideDown(this.target)
    setTimeout(() => this.button.style.pointerEvents = 'auto', 300)
  }

  close() {
    this.button.setAttribute('aria-expanded', 'false');
    this.button.style.pointerEvents = 'none'
    slideUp(this.target)
    setTimeout(() => this.button.style.pointerEvents = 'auto', 300)
  }
}

customElements.define('accordion-element', Accordion);

class ProductCard extends HTMLElement {
  constructor() {
    super();

    this.url = String(window.location.href);
    this.productForm = this.querySelector('product-form') || null;
    this.button = this.querySelector('button[type="submit"]') || null;
    this.eventData = JSON.parse(this.querySelector('[data-select-item-event]').textContent);

    if(this.productForm) this.btnLink = this.querySelector('.product-card__btn-wrapper a') || null;

    this.init();
  }

  init() {
    const params = new URLSearchParams(window.location.search);
    const physicianParam = params.get('physician');

    if (physicianParam && physicianParam === 'true' && this.btnLink) {
      this.productForm.classList.add('hidden');
      this.btnLink.classList.remove('hidden');
    }

    if(this.button) {
      this.button.addEventListener('mousedown mouseup', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
      })
    }

    this.endLoadBtn();

    // GA Analytics
    if (this.eventData) {
      const links = this.querySelectorAll('[href*="products/"]');
      let data = this.eventData;
      if (links.length) {
        links.forEach((link) => {link.addEventListener('click', () => {
          const selectPromotionStorage = this.getAttribute('data-promotion');
          const selectPromotion = selectPromotionStorage?.split('|');
          const searchDataElem = document.querySelector('[data-event-search]');

          if (searchDataElem) {
            const searchData = JSON.parse(searchDataElem.textContent);
            sessionStorage.setItem('ga_search_results_total', searchData.search_results_total);
            sessionStorage.setItem('ga_search_term', searchData.search_term);
          }

          if (selectPromotion) {
            sessionStorage.setItem('ga_select_promoted_product', selectPromotionStorage);

            data.ecommerce.items[0].promotion_id = selectPromotion[1].trim();
            data.ecommerce.items[0].promotion_name = selectPromotion[0].trim();
          }

          const refineByAction = sessionStorage.getItem('ga_select_item_refine_by_action');

          if (refineByAction && document.body.classList.contains('template-collection')) data.search.refine.refine_by_action = refineByAction;
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ ecommerce: null });
          window.dataLayer.push(data);

          sessionStorage.removeItem('ga_select_item_refine_by_action');
        })})
      }
    }
  }

  endLoadBtn() {
    if(this.productForm === null) return;

    const btn = this.productForm.querySelector('.btn');
    const spinner = this.productForm.querySelector('.btn .loading-overlay__spinner');

    btn.classList.remove('loading');
    btn.removeAttribute('aria-disabled');
    if (spinner) spinner.classList.add('hidden');
  }
}

customElements.define('product-card', ProductCard);

if (!customElements.get('slideshow-swiper')) {
  class Slideshow extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.config = this.dataset.config ? JSON.parse(this.dataset.config) : false;
      this.slideShow = this.querySelector('.swiper');
      this.breakpoint = this.dataset.breakpoint;

      if (!this.config) return

      const thumbnailsElementSibling = this.config['thumbnailsElement'];

      (thumbnailsElementSibling)
        ? this.addSliderThumbs(thumbnailsElementSibling)
        : this.sliderSwiper = new Swiper(this.slideShow, this.config)

      if (this.breakpoint) this.checkBreakpoint()
      if (this.config['analyticEvent']) this.addAnalyticEventListener();
    }

    addSliderThumbs (thumbnailsElementSibling) {
      const waitThumbsSliderInit = setInterval(() => {
        const thumbnailSwiper = document.querySelector(thumbnailsElementSibling);
        if (thumbnailSwiper.sliderSwiper) {
          this.config['thumbs'] = {'swiper': thumbnailSwiper.sliderSwiper}
          this.sliderSwiper = new Swiper(this.slideShow, this.config)
          clearInterval(waitThumbsSliderInit)
        }
      }, 50);
    }

    checkBreakpoint () {
      const breakpoint = window.matchMedia(`(${this.breakpoint})`),
        breakpointChecker = () => {
          if (breakpoint.matches) {
            if (this.slideShow.swiper) this.slideShow.swiper.destroy(true, true)
          } else {
            this.sliderSwiper = new Swiper(this.slideShow, this.config)
          }
        };
      breakpoint.addEventListener('change', () => breakpointChecker());
      breakpointChecker();
    }

    destroySwiper() {
      this.slideShow.swiper.destroy(true, true)
    }

    addAnalyticEventListener() {
      const _this = this;
      const eventType = this.config['analyticEvent'];
      this.sliderSwiper.on('slideChange', function () {
        console.log(_this.sliderSwiper.activeIndex)
        window.dataLayer.push({
          'event': `${eventType}`,
            'click': {
            'show_more_type': `${_this.sliderSwiper.activeIndex}`,
          }
        });
      });
    }
  }

  customElements.define('slideshow-swiper', Slideshow);
}

class ToggleTabs extends HTMLElement {
  // Required button element: aria-selected='true/false'; aria-controls='TAB_ID'; tabindex='0/-1' data-action='toggle-tab'
  // Required tab element: aria-selected='true/false'; aria-labelledby='TAB_ID' id='TAB_ID'
  constructor() {
    super();
    this.buttons = this.querySelectorAll('[data-action=toggle-tab]')
    this.tabs = this.querySelectorAll('[data-tab]')

    this.buttons.forEach(button => {
      button.addEventListener('click', ()=> this.toggleTab(button))
    })
  }

  toggleTab(button) {
    if (button.dataset.selected === 'true') return
    const tabId = button.getAttribute('aria-controls'),
      tabToShow = Array.from(this.tabs).find(tab => tab.id === tabId),
      hideAttributes = {'tabindex': '-1', 'aria-selected': 'false'},
      showAttributes = {'tabindex': '0', 'aria-selected': 'true'};
    this.buttons.forEach(el => setAttributes(el, hideAttributes))
    this.tabs.forEach(tab => setAttributes(tab, hideAttributes))
    setAttributes(button, showAttributes)
    setAttributes(tabToShow, showAttributes)
  }
}

customElements.define('toggle-tabs', ToggleTabs);

class ScrollingTabs extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.tabBtns = this.querySelectorAll('[role="tab"]')

    this.tabBtns.forEach(btn => {
      btn.addEventListener('click', ()=> this.scrollToTab(btn))
    })
  }

  scrollToTab (btn) {
    const elementLeftPosition = btn.getBoundingClientRect().left,
      elementRightPosition = btn.getBoundingClientRect().right;
    if (elementLeftPosition < 20) {
      this.scrollLeft += elementLeftPosition - 20
    }

    if (elementRightPosition > window.innerWidth) {
      this.scrollLeft += elementRightPosition - window.innerWidth + 20
    }
  }

}

customElements.define('scrolling-tabs', ScrollingTabs);

class PdpDetails extends HTMLElement {
  constructor() {
    super();
    this.checkOrdergrooveSubscription();
  }

  checkOrdergrooveSubscription() {
    const callback = (mutationsList, observer) => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          if (mutation.target.nodeName === 'OG-OFFER') {
            const productForm = this.querySelector('product-form')
            const ogOffer = mutation.target;
            const sellingPlanId =
              ogOffer.hasAttribute('subscribed')
                ? ogOffer.getAttribute('frequency')
                : null;
            productForm?.checkPoints(sellingPlanId, true);
            this.toggleProductFormButton(sellingPlanId, productForm)
          }
        }
      }
    };

    const observer = new MutationObserver(callback);
    const targetNode = this;
    const config = { childList: true, subtree: true, attributes: true };
    observer.observe(targetNode, config);
  }

  toggleProductFormButton (subscribe = false, productForm) {
    if (!productForm) return
    const btnText = subscribe ? window.variantStrings.subscribe : '';
    const currentVariantState = JSON.parse(productForm.querySelector('.current-variant-state').textContent)
    const currentVariant = JSON.parse(productForm.querySelector('.current-variant-json').textContent)
    productForm.toggleAddButton(currentVariant?.available, btnText, false, currentVariantState?.preorder)
  }
}

customElements.define('pdp-details', PdpDetails);

class ProductForm extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector('[data-type=add-to-cart-form]');
    if (this.form.querySelector('[name=id]')) this.form.querySelector('[name=id]').disabled = false;
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    this.url = String(window.location.href);
    this.btnLinks = this.querySelectorAll('.product-form__btn-link');
    this.analyticAddEventElem = this.querySelector('.pdp-main-add-event');

    this.currentVariant = this.querySelector('.current-variant-json')
      ? JSON.parse(this.querySelector('.current-variant-json').textContent)
      : null;

    this.quantitySelector = this.querySelector('quantity-input')
    this.premierPointsValue = this.querySelectorAll('[data-poins-value]')

    if (this.premierPointsValue.length && this.quantitySelector) {
      this.quantitySelector.addEventListener('change', () => this.checkPoints());
    }

    this.addButtons = new Set([
      ...this.querySelectorAll('[type="submit"][name="add"]'),
      ...document.querySelectorAll(`.pdp-sticky-bar button[form=${this.form.getAttribute('id')}]`)
    ])

    this.init();
  }

  init () {
    if (this.url.includes('physician=true') && this.btnLinks) { //change buttons
      const arrayButtons = Array.from(this.addButtons);

      arrayButtons.forEach((button, index, test) => {
        const i = index || 0;
        const btnLink = this.btnLinks.item(i);

        if(btnLink) {
          button.classList.add('hidden');
          btnLink.classList.remove('hidden');
        }
      })
    }
  }

  successCallback (response) {
    if (response.status) {
      this.addButtons.forEach(btn => this.handleErrorMessage(response.description, btn))
    }
  }

  finallyCallback () {
    this.addButtons.forEach(btn => {
      buttonLoadOff (btn)
    })
  }

  onSubmitHandler(e) {
    e.preventDefault();

    this.addButtons.forEach(btn => {
      buttonLoadOn(btn);
      this.handleErrorMessage(false, btn);
    })

    const items = [];
    const mainItem = this.createFormDataItem(this.form);

    // Add analytic promotion properties
    const selectedPromotion = this.closest('.product-card')?.getAttribute('data-promotion') || this.getAttribute('data-promotion');
    if (selectedPromotion) {
      mainItem.properties ? mainItem.properties._promotion = selectedPromotion
                          : mainItem.properties = {'_promotion': selectedPromotion}
    }

    items.push(mainItem);

    window.cartPopup.addToCart(
      items,
      true,
      true,
      this.successCallback.bind(this),
      null,
      this.finallyCallback.bind(this)
    );

    if (this.analyticAddEventElem) {
      this.setAnalyticEvent(mainItem, selectedPromotion);
    }
  }

  setAnalyticEvent(item, selectedPromotion) {
    if (!item) return

    const eventData = JSON.parse(this.analyticAddEventElem.querySelector('[type="application/ld+json"]').textContent);
    let sellingPlanName = '';
    if (item.selling_plan) {
      sellingPlanName = this.querySelector(`[data-option-value='${item.selling_plan}'] button`).textContent.trim();
    }

    eventData.ecommerce.value = (Number(item.quantity || 1) * Number(eventData.ecommerce.items[0].price)).toFixed(2);
    eventData.ecommerce.items[0].quantity = item.quantity || 1;
    eventData.ecommerce.items[0].subscription_frequency = sellingPlanName;
    eventData.ecommerce.items[0].add_to_bag_type = item.selling_plan ? 'Subscription' : 'Standard';

    if (selectedPromotion) {
      const selected_promotion_arr = selectedPromotion.split('|');
      eventData.ecommerce.items[0].promotion_name = selected_promotion_arr[0].trim();
      eventData.ecommerce.items[0].promotion_id = selected_promotion_arr[1].trim();
    }
    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push(eventData);
  }

  createFormDataItem(form) {
    if (!form) {return false}
    const formData = new FormData(form);
    const item = {}

    formData.forEach((value, key) => {
      const lastStr = key.charAt(key.length - 1)

      if (key.includes('properties') && lastStr === ']') {
        const newKey = key.substring(key.indexOf('[') + 1, key.indexOf(']'));

        if (item['properties']) {
          item['properties'][newKey] = value;
        } else item['properties'] = {[newKey]: value};

      } else item[key] = value;
    });

    if (item?.properties?._is_gift_card) {
      item.properties._timestamp = Date.now();

      if (item.properties.__shopify_send_gift_card_to_recipient) {
        let sendOn = item.properties['Send on'];
        let [month, day, year] = sendOn?.split('-') || null;
        item.properties['Send on'] = sendOn ? `${year}-${month}-${day}` : new Date().toISOString().slice(0, 10);
      }

    }

    return item || false;
  }


  handleErrorMessage(errorMessage = false, btn) {
    const recipientForm = this.querySelector('recipient-form');

    if (typeof errorMessage === "object" && recipientForm) {
      recipientForm.displayErrorMessage(null, errorMessage)
      return false
    }

    this.errorMessageWrapper = btn.closest('form').querySelector('[data-error-wrapper]');
    if (!this.errorMessageWrapper) return
    this.errorMessage = this.errorMessageWrapper.querySelector('[data-error-message]');
    const message = errorMessage ? errorMessage.replace('<sup>','').replace('</sup>','') : errorMessage;
    if (errorMessage) {
      this.errorMessageWrapper.classList.remove('visually-hidden');
      this.errorMessage.textContent = message;
    }

    this.hideErrorMessage (this.errorMessageWrapper, message)
  }

  hideErrorMessage(errorMessageWrapper, errorMessage) {
    setTimeout( () => {
      errorMessageWrapper.classList.add('visually-hidden');
      if (errorMessage) this.errorMessage.textContent = '';
    }, 5000)
  }

  toggleAddButton(available = true, text, hide = false, preorder = false) {
    if (!this.addButtons) return;
    let addButtonStatus = 'enabled';

    if (!available) {
      addButtonStatus = 'disabled'
      if (!text) text = window.variantStrings.soldOut
    } else {
      if (preorder) {
        if (!text) text = window.variantStrings.preorder
      } else {
        if (!text) text = window.variantStrings.addToCart
      }
    }

    this.addButtons.forEach(btn => {
      const textInner = btn.querySelector('span');
      (addButtonStatus === 'enabled')
        ? btn.removeAttribute('disabled')
        : btn.setAttribute('disabled', 'disabled');
      textInner.textContent = text
    })
  }

  getSellingPlanId () {
    const url = new window.URL(window.location.href);
    const params = url.searchParams;
    return params.get('selling_plan')
  }

  checkPoints(sellingPlanId, renderPrise = false, currentVariant = this.currentVariant) {
    this.sellingPlanId = sellingPlanId ? sellingPlanId : this.getSellingPlanId()
    if (this.currentVariant !== currentVariant) this.currentVariant = currentVariant

    const quantity = this.quantitySelector?.querySelector('input')?.value || 1
    let price = this.currentVariant['price']

    if (this.sellingPlanId) {
      const sellingPlan = this.currentVariant['selling_plan_allocations'].find(plan => plan['selling_plan_id'] === Number(this.sellingPlanId))
      price = sellingPlan['price']
    }

    const formattedPrice = formatMoney(price, '{{amount}}', true);
    const pointsValue = quantity * (Math.round(formattedPrice)) * window.premierPoints.coefficient

    this.premierPointsValue.forEach(val => val.textContent = Math.round(pointsValue).toString())

    this.addButtons.forEach(btn => {
      const priceInner = btn.querySelector('.product-form__submit-price');
      if (priceInner) priceInner.textContent = formatMoney(price * quantity, '{{amount}}');
    })

    if (renderPrise) {
      this.renderPriceOnSubscriptionChange()
    }
  }

  renderPriceOnSubscriptionChange() {
    const location = window.location.href;
    const url = new window.URL(location);
    url.searchParams.set('variant', this.currentVariant.id)
    if (this.sellingPlanId)  url.searchParams.set('selling_plan', this.sellingPlanId)
    url.searchParams.set('section_id', this.dataset.section)

    fetch(`${url.toString()}`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        changeContentBySelector(`.price--${this.dataset.section}`, html)
      });
  }
}

customElements.define('product-form', ProductForm);

class VariantRadios extends HTMLElement {
  constructor() {
    super();
    this.section = this.closest('section')
    this.productForm = this.section.querySelector('product-form')
    this.form = this.productForm.querySelector('[data-type=add-to-cart-form]')
    this.preorder = false
    this.preorderMessages = this.form.querySelectorAll('[data-preorder-message]')
    this.stickyBar = document.querySelector('pdp-sticky-bar')
    if (this.productForm) {
      this.addButtons = new Set([
        ...this.productForm.querySelectorAll('[type="submit"][name="add"]'),
        ...document.querySelectorAll(`.pdp-sticky-bar button[form=product-form-${this.dataset.section}]`)
      ])
      this.quantitySelector = this.productForm.querySelector('quantity-input')
      this.subscriptionForm = this.productForm.querySelector('subscription-form')
      this.premierPointsValue = this.productForm.querySelectorAll('[data-poins-value]')
    }

    this.addEventListener('change', this.onVariantChange);
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.removeErrorMessage();

    if (!this.currentVariant) {
      this.setUnavailable();
    } else {
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
      if (this.premierPointsValue.length) {
        this.productForm.checkPoints(this.sellingPlanId, false, this.currentVariant)
      }
    }
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
    });
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
    const url = new window.URL(window.location.href);
    const params = url.searchParams;
    params.set('variant', this.currentVariant.id)
    if (!this.currentVariant['selling_plan_allocations'].length) {
      params.delete('selling_plan')
    }
    this.sellingPlanId = params.get('selling_plan')
    url.search = params.toString();
    this.url = url.toString();
    window.history.replaceState({path: this.url}, '', this.url);
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  removeErrorMessage() {
    if (!this.productForm) return;
    this.addButtons.forEach(btn => this.productForm.handleErrorMessage(false, btn));
    this.preorderMessages.forEach(message => message.setAttribute('hidden', ''))
    if (this.subscriptionForm && this.currentVariant) this.subscriptionForm.removeAttribute('hidden')
  }

  renderProductInfo() {
    fetch(`${this.url}&section_id=${this.dataset.section}`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        const preorderSelector = `.pre-order--${this.currentVariant.id}`
        this.preorder = html.querySelector(preorderSelector)
        if (this.productForm) {
          const notifyMeState = html.querySelector('product-form').getAttribute('data-notify-me')
          this.productForm.setAttribute('data-notify-me', notifyMeState)
          if (this.stickyBar) this.stickyBar.setAttribute('data-notify-me', notifyMeState)
        }
        const change_selectors = [
          'current-variant-state',
          'current-variant-json',
          'media',
          'price',
          'sticky-bar-image',
          'subs',
          'preorder-message',
          'preorder-message-mobile',
          'wishlist-button',
          'notify',
          'pdp-main-event',
          'recipient-form__variant-property'
        ];

        change_selectors.forEach(component => {
          const selector = `.${component}--${this.dataset.section}`;
          changeContentBySelector(selector, html);
        })
      }).then(() => {
        const btnText = this.sellingPlanId ? window.variantStrings.subscribe : ''
        if (this.productForm) this.productForm.toggleAddButton(this.currentVariant.available, btnText, false, this.preorder)
        this.preorderCheck()
        this.subscriptionForm = this.productForm.querySelector('subscription-form')
    });
  }

  setUnavailable() {
    this.sellingPlanId = false
    this.addButtons.forEach(btn => {
      const addButtonText = btn.querySelector('span');
      btn.setAttribute('disabled', 'disabled')
      addButtonText.textContent = window.variantStrings.unavailable;
    });
    if (this.subscriptionForm) this.subscriptionForm.setAttribute('hidden', '')
    if (this.premierPointsValue.length) {
      this.premierPointsValue.forEach(val => val.parentElement.setAttribute('hidden', ''))
    }
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }

  preorderCheck() {
    const oldPreorder = this.form.querySelector('[name="properties[Pre-Order]"]');
    if (oldPreorder) oldPreorder.remove()
    if (this.preorder) {
      this.form.appendChild(this.preorder)
      this.preorderMessages.forEach(message => message.removeAttribute('hidden'))
    }
  }
}

customElements.define('variant-radios', VariantRadios);

class SubscriptionForm extends HTMLElement {
  constructor() {
    super();
    this.productForm = this.closest('product-form')
    this.initSubscriptionForm()
    this.addEventListener('change', ()=> this.initSubscriptionForm())
  }

  initSubscriptionForm () {
    this.getSellingPlanGroupId()
    console.log(this.sellingPlanGroupId, "sellingPlanGroupId")
    this.checkActiveSellingPlanGroup()
    if (this.dataset.updatePrice === 'true') this.renderPrice()
  }

  getSellingPlanGroupId() {
    const inputs = Array.from(this.querySelectorAll('input'));
    this.sellingPlanGroupId = Array.from(inputs).find((radio) => radio.checked).value;
    return this.sellingPlanGroupId
  }

  checkActiveSellingPlanGroup() {
    if (this.productForm) {
      this.currentVariantState = JSON.parse(this.productForm.querySelector('.current-variant-state').textContent)
      this.currentVariant = JSON.parse(this.productForm.querySelector('.current-variant-json').textContent)
    }

    this.setActiveSellingPlan()

    if (this.sellingPlanGroupId) {
      const sellingPlanGroup = this.querySelector(`[data-group-toggle='${this.sellingPlanGroupId}']`)
      const sellingPlanOptions = sellingPlanGroup.querySelectorAll('custom-select [data-option-value]')
      const sellingPlanGroupInput = sellingPlanGroup.querySelector('[name=selling_plan]')

      let planID = sellingPlanOptions[0].dataset.optionValue
      sellingPlanOptions.forEach(option => {
        if (option.getAttribute('aria-selected') === 'true') planID = option.dataset.optionValue
      })

      sellingPlanGroup.classList.remove('hide')
      sellingPlanGroupInput.value = planID;
      sellingPlanGroupInput.removeAttribute('disabled')

      if (this.dataset.updateUrl === 'true') this.updateURL('add', planID)
      this.toggleProductFormButton(true)
    } else {
      this.querySelectorAll('[data-group-toggle]').forEach(group => {
        const sellingPlanGroupInput = group.querySelector('[name=selling_plan]')
        group.classList.add('hide')
        sellingPlanGroupInput.value = ''
        sellingPlanGroupInput.setAttribute('disabled', '')
      })
      if (this.dataset.updateUrl === 'true') this.updateURL('remove')
      this.toggleProductFormButton()
    }
    this.productForm.checkPoints()
  }

  toggleProductFormButton (subscribe = false) {
    if (!this.productForm) return
    const btnText = subscribe ? window.variantStrings.subscribe : '';
    this.productForm.toggleAddButton(this.currentVariant['available'], btnText, false, this.currentVariantState.preorder)
  }

  setActiveSellingPlan () {
    this.querySelectorAll('[name=selling-plan-group]').forEach(radio => {
      (radio.checked)
        ? radio.closest('[data-selling-group]').classList.add('active')
        : radio.closest('[data-selling-group]').classList.remove('active')
    })
  }

  updateURL(action, planID) {
    const location = window.location.href;
    const url = new window.URL(location);
    const params = url.searchParams;
    (action === 'add') ? params.set('selling_plan', planID) : params.delete('selling_plan')
    url.search = params.toString();
    this.url = url;
    window.history.replaceState({path: url.toString()}, '', url.toString());
  }

  renderPrice() {
    this.url.searchParams.set('variant', this.currentVariant.id)
    this.url.searchParams.set('section_id', this.dataset.section)

    fetch(`${this.url.toString()}`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        changeContentBySelector(`.price--${this.dataset.section}`, html)
        const sellingPlanSelectors = ['sub-price', 'subs-save'];

        sellingPlanSelectors.forEach(component => {
          const selector = `.${component}--${this.sellingPlanGroupId}`;
          changeContentBySelector(selector, html);
        })
      });
  }
}

customElements.define('subscription-form', SubscriptionForm);


class GaProductListEvent extends HTMLElement {
  constructor() {
    super();

    this.data = JSON.parse(this.querySelector('[type="application/ld+json"]').textContent);
    this.disableObserve = this.hasAttribute('data-disable-observe');

    if(this.data) {
      this.init();
      this.addEventListeners()
    }

  }
  init() {
    let data = this.data;
    const _this = this;
    window.dataLayer = window.dataLayer || [];

    if (this.disableObserve) {
      window.dataLayer.push({ ecommerce: null });
      window.dataLayer.push(data);
    } else {
      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // set refine by action param in view_item_list event on collection page
            if (document.body.classList.contains('template-collection')) {

              if (data.is_collection) {
                delete data.is_collection
                data = this.checkSelectedPromotion(data);
              }

              const refineByAction = sessionStorage.getItem('ga_refine_by_action');
              if (data.event === 'view_item_list' && refineByAction && data.search.refine.refine_by_action !== undefined) {
                data.search.refine.refine_by_action = refineByAction;
                sessionStorage.removeItem('ga_refine_by_action');
              }
            }

            if (data.event === 'view_item') {
              data = this.checkSelectedProductPromotion(data);
            }

            window.dataLayer.push({ ecommerce: null });
            window.dataLayer.push(data);
            if (!_this.classList.contains('cart-view-event')){
              observer.unobserve(entry.target)
            }
          }
        })
      },{
        root: null,
        threshold: 1.0
      })
      observer.observe(this)
    }
  }

  checkSelectedProductPromotion(data) {
    const promotionSelectedStorage = sessionStorage.getItem('ga_select_promoted_product') || sessionStorage.getItem('ga_select_promotion');
    const searchTerm = sessionStorage.getItem('ga_search_term');
    const searchResultsTotal = sessionStorage.getItem('ga_search_results_total');

    if (searchTerm && searchResultsTotal) {
      data.search.search_term = searchTerm;
      data.search.search_results_total = searchResultsTotal;
      data.search.search_results_total = searchResultsTotal;

      sessionStorage.removeItem('ga_search_term');
      sessionStorage.removeItem('ga_search_results_total');
    }
    if (promotionSelectedStorage) {
      const promotionSelected = promotionSelectedStorage.split('|');
      const pdpMainForm = document.querySelector('.pdp-main .product-form');

      data.ecommerce.items[0].promotion_name = promotionSelected[0].trim();
      data.ecommerce.items[0].promotion_id = promotionSelected[1].trim();

      pdpMainForm.setAttribute('data-promotion', promotionSelectedStorage);
      sessionStorage.removeItem('ga_select_promoted_product');
      sessionStorage.removeItem('ga_select_promotion');
    }

    return data
  }

  checkSelectedPromotion(data) {
    if (sessionStorage.getItem('ga_select_promotion')) window.selected_promotion_storage = sessionStorage.getItem('ga_select_promotion');
    const selected_promotion = sessionStorage.getItem('ga_select_promotion')?.split('|') || window.selected_promotion;

    if (selected_promotion) {
      const selected_promotion_name = selected_promotion[0].trim();
      const selected_promotion_id = selected_promotion[1].trim();

      data.ecommerce.items.forEach(item => {
        item.promotion_name = selected_promotion_name;
        item.promotion_id = selected_promotion_id;
      })

      const productCards = document.querySelectorAll('#ProductGridContainer .product-card');

      productCards.forEach(item => {
        item.setAttribute('data-promotion', window.selected_promotion_storage);
      })

      window.selected_promotion = selected_promotion;
      sessionStorage.removeItem('ga_select_promotion');
    }

    return data
  }

  addEventListeners () {
    // Event listener for "select_promotion" event buttons
    const eventId = this.querySelector('[data-event-id]')?.getAttribute('data-event-id');
    const selectPromotionLink = document.querySelectorAll(`[data-promotion-click-event='${eventId}']`);

    if (selectPromotionLink.length) {
      selectPromotionLink.forEach((item) => {item.addEventListener('click', this.onSelectPromotion.bind(this))})
    }
  }

  onSelectPromotion() {
    const data = this.data;
    let select_promotion = `${data.ecommerce.items[0].promotion_name} | ${data.ecommerce.items[0].promotion_id}`
    sessionStorage.setItem('ga_select_promotion', select_promotion);

    data.event = 'select_promotion'
    window.dataLayer.push(data);
  }
}

customElements.define('ga-product-list-event', GaProductListEvent);

// Set form start event listener
(function setStartFormEvent () {
  const forms = document.querySelectorAll('[data-form-name]');

  forms.forEach((form) => {form.addEventListener('input', (e) => {
    const formName = form.getAttribute('data-form-name');
    const formStarted = form.hasAttribute('data-form-started');

    if (formName && !formStarted) {
      form.setAttribute('data-form-started', 'true');
      window.dataLayer.push({
        'event': 'form_start',
        'form': {
          'form_name': formName,
        }
      })
    }
  })})

// generate lead start GA event
  document.addEventListener('click', (e) => {
    const targetContent = handleize(e.target.textContent);
    const generateLeadBtns = ['physician-finder', 'find-a-physician', 'contact', 'contact-us', 'become-a-partner'];

    if (generateLeadBtns.includes(targetContent)) {
      let leadType = 'B2B';
      if (targetContent === 'physician-finder' || targetContent === 'find-a-physician') {
        leadType = 'B2C'
      }
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'event': 'generate_lead_start',
        'user': {
          'lead': {
            'lead_type': leadType,
            'lead_driver': e.target.textContent.trim()
          }},
      })
    }
  })
})();

(window.checkPhysicianFinderParam = () => {
  const params = new URLSearchParams(window.location.search);
  const physicianParam = params.get('physician');

  if (physicianParam && physicianParam === 'true') {
    const physicianBtns = document.querySelectorAll('.btn--physician-finder')
    physicianBtns.forEach(btn => {
      btn.textContent = window.physicianFinderBtn.label;
      btn.href = window.physicianFinderBtn.url;
    })
  }
})();

window.isYoutubeAPILoaded = false;
function loadYoutubeAPI() {
  if (!window.isYoutubeAPILoaded) {
    let tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    let firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }
}

function onYouTubeIframeAPIReady() {
  document.dispatchEvent(new Event('youtubeAPIReady'));
  window.isYoutubeAPILoaded = true;
}

class YoutubeVimeoVideo extends HTMLElement {
  constructor() {
    super();
    this.options = JSON.parse(this.dataset.videoOptions);
    if (!this.options['videoType']) return

    this.playBtn = this.querySelector('.js-video-play-button')
    this.pauseBtn = this.querySelector('.js-video-pause-button')
    this.muteBtn = this.querySelector('.js-video-mute-button')
    this.unMuteBtn = this.querySelector('.js-video-unmute-button')
    this.customVideo = this.querySelector('video')
    this.parent = this.parentElement;
    this.poster = this.querySelector('.js-video-poster');
    if (this.poster) this.posterBtn = this.poster.querySelector('svg');
    this.getAspectRatio();

    if (this.options['videoType'] === 'youtube') this.initYoutube()
    if (this.options['videoType'] === 'vimeo') this.initVimeo()
    if (this.customVideo) this.onPlayerReady()

    this.initEvents();
  }

  initEvents() {
    if (this.playBtn) this.playBtn.addEventListener('click', () => this.playerPlay())
    if (this.pauseBtn) this.pauseBtn.addEventListener('click', () => this.playerPause())
    if (this.muteBtn) this.muteBtn.addEventListener('click', () => this.playerMute())
    if (this.unMuteBtn) this.unMuteBtn.addEventListener('click', () => this.playerUnMute())
    if (this.poster) this.posterBtn.addEventListener('click', () => {
      this.playerPlay()
      this.playerUnMute()
    })
  }

  initYoutube() {
    if (window.isYoutubeAPILoaded) {
      this.youtubeSetup();
    } else {
      document.addEventListener('youtubeAPIReady', () => {
        setTimeout(() => {
          this.youtubeSetup();
        }, 1000);
      });
      window.loadYoutubeAPI();
    }
  }

  initVimeo() {
    this.loadVimeoScript()
      .then(() => {
        const playerLoadingInterval = setInterval(() => this.vimeoSetup(playerLoadingInterval), 200)
      })
      .catch(()=> {
        console.log('video player error')
      });
  }

  loadVimeoScript() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      document.body.appendChild(script);
      script.async = true;
      script.src = '//player.vimeo.com/api/player.js';
      script.onload = resolve;
      script.onerror = reject;
    });
  }

  async getAspectRatio() {
    if (this.customVideo) return;

    let url = '';

    if (this.options['videoType'] === 'youtube') {
      url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${this.options['videoId']}`
    } else {
      url = `https://vimeo.com/api/oembed.json?url=https%3A//vimeo.com/${this.options['videoId']}`
    }

    try {
      const response = await fetch(url)
      if (!response.ok) return
      const data = await response.json();
      if (!data) return
      const aspectRatio = data.width / data.height;
      if (this.parent) this.parent.style.setProperty('--aspect-ratio', `${aspectRatio}`);
    } catch (e) {
      console.log(e)
    }
  }

  youtubeSetup() {
    this.player = new YT.Player(this.options['videoId'], {
      videoId: this.options['videoId'],
      playerVars: {
        enablejsapi: 1,
        autoplay: this.options['autoplay'],
        controls: this.options['controls'],
        rel: 0,
        height: '100%',
        width: '100%',
        iv_load_policy: 3,
        loop: 1,
        playsinline: 1,
        modestbranding: 1,
        showinfo: 0,
        origin: window.location.origin
      },
      events: {
        onReady: () => this.onPlayerReady(),
        onStateChange: (e) => {
          if (e.data === window.YT.PlayerState.ENDED) e.target.seekTo(0);
          if (e.data === window.YT.PlayerState.PLAYING) {
            this.classList.add('is-playing')
            if (this.poster) this.poster.classList.add('visually-hidden')
          }
          if (e.data === window.YT.PlayerState.PAUSED) this.classList.remove('is-playing')
        },
      }
    });
  }

  vimeoSetup(playerLoadingInterval) {
    if (window.Vimeo) {
      this.player = new Vimeo.Player(this.options['videoId'], {
        id: this.options['videoId'],
        controls: this.options['controls'],
        muted: true,
        loop: true
      });

      this.player.ready().then(() => {
        this.onPlayerReady()
        this.player.on('pause', (data) => this.classList.remove('is-playing'))
        this.player.on('play', (data) => {
          this.classList.add('is-playing')
          if (this.poster) this.poster.classList.add('visually-hidden')
        })
      })
      clearInterval(playerLoadingInterval);
    }
  }

  onPlayerReady() {
    if (this.options['autoplay']) this.autoPlay()
    this.classList.add('is-loaded')
  }

  autoPlay() {
    this.playerMute()
    this.playerPlay()
    this.classList.add('is-playing')
  }

  playerPlay() {
    if (this.customVideo) {
      this.customVideo.play()
    } else {
      (this.options['videoType'] === 'youtube') ? this.player.playVideo() : this.player.play()
    }

    this.classList.add('is-playing')

    if (this.poster) {
      this.poster.classList.add('visually-hidden');
      this.posterBtn.removeEventListener('click', () => this.playerPlay());
    }
  }

  playerPause() {
    if (this.customVideo) {
      this.customVideo.pause()
    } else {
      (this.options['videoType'] === 'youtube') ? this.player.pauseVideo() : this.player.pause()
    }
    this.classList.remove('is-playing')
  }

  playerMute() {
    if (this.customVideo) {
      this.customVideo.muted = true;
    } else {
      (this.options['videoType'] === 'youtube') ? this.player.mute() : this.player.setMuted(true)
    }
    this.classList.add('is-muted')
  }

  playerUnMute() {
    if (this.customVideo) {
      this.customVideo.muted = false;
    } else {
      (this.options['videoType'] === 'youtube') ? this.player.unMute() : this.player.setMuted(false)
    }
    this.classList.remove('is-muted')
  }
}

customElements.define('video-component', YoutubeVimeoVideo);
