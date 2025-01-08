if (sessionStorage.getItem("userUSAState")) {
  sessionStorage.removeItem('userUSAState')
}

window.modalOverlay = document.querySelector("#ModalOverlay")
window.body = document.querySelector("body")
window.megaMenu = document.querySelector("header-mega-menu")
window.headerDrawer = document.querySelector('header-drawer')

window.headerHeight = function () {
  let headerHeight = (document.getElementById('shopify-section-header')) ? document.getElementById('shopify-section-header').offsetHeight : 0;
  let headerBHeight = (document.getElementById('shopify-section-header-b')) ? document.getElementById('shopify-section-header-b').offsetHeight : 0;
  document.documentElement.style.setProperty('--header-height', headerHeight + 'px');
  document.documentElement.style.setProperty('--header-b-height', headerBHeight + 'px');
}

window.slideUp = function (target, duration= 500) {
  target.classList.remove('active')
  target.style.transitionProperty = 'height, margin, padding';
  target.style.transitionDuration = duration + 'ms';
  target.style.boxSizing = 'border-box';
  target.style.height = target.offsetHeight + 'px';
  target.offsetHeight;
  target.style.overflow = 'hidden';
  target.style.height = 0;
  target.style.paddingTop = 0;
  target.style.paddingBottom = 0;
  target.style.marginTop = 0;
  target.style.marginBottom = 0;
  window.setTimeout( () => {
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

window.slideDown = function (target, duration= 500) {

  target.classList.add('active')
  target.style.removeProperty('display');
  let display = window.getComputedStyle(target).display;
  if (display === 'none') display = 'block';
  target.style.display = display;
  let height = target.offsetHeight;
  target.style.overflow = 'hidden';
  target.style.height = 0;
  target.style.paddingTop = 0;
  target.style.paddingBottom = 0;
  target.style.marginTop = 0;
  target.style.marginBottom = 0;
  target.offsetHeight;
  target.style.boxSizing = 'border-box';
  target.style.transitionProperty = "height, margin, padding";
  target.style.transitionDuration = duration + 'ms';
  target.style.height = height + 'px';
  target.style.removeProperty('padding-top');
  target.style.removeProperty('padding-bottom');
  target.style.removeProperty('margin-top');
  target.style.removeProperty('margin-bottom');
  window.setTimeout( () => {
    target.style.removeProperty('height');
    target.style.removeProperty('overflow');
    target.style.removeProperty('transition-duration');
    target.style.removeProperty('transition-property');
  }, duration);
}

window.slideToggle = function (target, duration = 250) {
  if (!target.classList.contains('active')) {
    return window.slideDown(target, duration);
  } else {
    return window.slideUp(target, duration);
  }
}

window.toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

window.checkMobile = function () {
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i
  ];

  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });
}

window.handleize = function (str) {
  return str.toLowerCase().replace(/[^\w\u00C0-\u024f]+/g, "-").replace(/^-+|-+$/g, "");
};

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute('role', 'button');
  summary.setAttribute('aria-expanded', 'false');

  if(summary.nextElementSibling.getAttribute('id')) {
    summary.setAttribute('aria-controls', summary.nextElementSibling.id);
  }

  summary.addEventListener('click', (event) => {
    event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
  });

  if (summary.closest('header-drawer')) return;
  summary.parentElement.addEventListener('keyup', onKeyUpEscape);
});

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
} catch {
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
  document.querySelectorAll('.js-youtube:not(.exclude-pause)').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
  });
  document.querySelectorAll('.js-vimeo:not(.exclude-pause)').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video:not(.exclude-pause)').forEach((video) => video.pause());
  document.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) {
    const preventScroll = elementToFocus.hasAttribute('data-prevent-scroll');
    elementToFocus.focus({preventScroll: preventScroll});
  }
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

class customSelect extends HTMLElement {
  constructor() {
    super();
    this.button = this.querySelector('.form__select-btn');
    this.options = this.querySelectorAll('.form__select-dropdown li');
    this.selectHidden = this.querySelector('.form__select-hidden');
    this.showCountry ()
    this.excludeChangeBubbles = this.dataset?.excludeBubbles !== '';
    this.selectType = this.dataset?.selectType;

    this.button.addEventListener('click',(e) => {
      if (this.classList.contains('open')) {
        this.classList.remove('open');
        e.target.setAttribute('aria-expanded', 'false');
        this.dispatchEvent(new CustomEvent('closeCustomSelect', {bubbles: true, detail: {selectType: this.selectType}}));
      } else {
        this.classList.add('open');
        e.target.setAttribute('aria-expanded', 'true');
        this.dispatchEvent(new CustomEvent('openCustomSelect', {bubbles: true, detail: {selectType: this.selectType}}));
      }
    });

    this.options.forEach(option => {
      const callback = (e) => {

        this.classList.remove('open');
        this.button.setAttribute('aria-expanded', 'false');

        if (e.target.classList.contains('checked')) return false;

        this.options.forEach(option => option.classList.remove('checked'));
        this.classList.add('checked');
        e.target.classList.add('checked');
        this.button.innerHTML = e.target.innerHTML;
        this.selectHidden.value = e.target.getAttribute('data-option-value');

        if (e.type === 'changeValue') return false;

        this.selectHidden.dispatchEvent(new CustomEvent('change', { bubbles: this.excludeChangeBubbles }));
        this.selectHidden.dispatchEvent(new CustomEvent('changeCustomSelect', {bubbles: true, detail: {selectType: this.selectType}}));
      };

      option.addEventListener('click', callback);
      option.addEventListener('changeValue', callback);
    })

    document.addEventListener('click', (e) => {
      let isClickInside = this.contains(e.target);
      if (!isClickInside) {
        this.classList.remove('open');
        e.target.setAttribute('aria-expanded', 'false');
        this.dispatchEvent(new CustomEvent('closeCustomSelect', {bubbles: true, detail: {selectType: this.selectType}}));
      }
    });
  }

  showCountry () {
    if (this.classList.contains('form__select-address')) {
      let currentText = this.selectHidden.getAttribute('data-default');

      this.button.textContent = currentText;
      this.classList.add('checked');
      this.selectHidden.value = this.selectHidden.querySelector(`[data-option-value="${currentText}"]`).value;
    }
  }
}

customElements.define('custom-select', customSelect);

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true })

    this.querySelectorAll('button').forEach(
      (button) => button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }
}

customElements.define('quantity-input', QuantityInput);

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

/*
 * Shopify Common JS
 *
 */
if ((typeof window.Shopify) == 'undefined') {
  window.Shopify = {};
}

function formatMoney(cents, format) {
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
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
  }

  return currencyIcon + formatString.replace(placeholderRegex, value);
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
      this.provinceContainer.style.display = 'none';
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
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

class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector('details');
    this.announcementBar = document.getElementById('shopify-section-announcement-bar') || document.getElementById('shopify-section-announcement-scrolling-bar');

    if (navigator.platform === 'iPhone') document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);

    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach(summary => summary.addEventListener('click', this.onSummaryClick.bind(this)));
    this.querySelectorAll('button').forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
  }

  onKeyUp(event) {
    if(event.code.toUpperCase() !== 'ESCAPE') return;

    const openDetailsElement = event.target.closest('details[open]');
    if(!openDetailsElement) return;

    openDetailsElement === this.mainDetailsToggle ? this.closeMenuDrawer(event, this.mainDetailsToggle.querySelector('summary')) : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const isOpen = detailsElement.hasAttribute('open');

    if (detailsElement === this.mainDetailsToggle) {
      if(isOpen) event.preventDefault();
      isOpen ? this.closeMenuDrawer(event, summaryElement) : this.openMenuDrawer(summaryElement);
    } else {
      setTimeout(() => {
        detailsElement.classList.add('menu-opening');
        summaryElement.setAttribute('aria-expanded', true);
      }, 100);
    }
  }

  openMenuDrawer(summaryElement) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });
    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden`);
    if (this.announcementBar) announcementHeight();
    // bodyScrollLock.disableBodyScroll(this.mainDetailsToggle);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event !== undefined) {
      this.mainDetailsToggle.classList.remove('menu-opening');
      document.querySelector('#shopify-section-header')?.classList.remove('mobile-menu-open');
      document.querySelector('#shopify-section-header-b')?.classList.remove('mobile-menu-open');
      this.mainDetailsToggle.querySelectorAll('details').forEach(details =>  {
        details.removeAttribute('open');
        details.classList.remove('menu-opening');
      });
      document.body.classList.remove(`overflow-hidden`);
      if (this.announcementBar) announcementHeight();
      // bodyScrollLock.clearAllBodyScrollLocks();
      removeTrapFocus(elementToFocus);
      this.closeAnimation(this.mainDetailsToggle);
    }
  }

  onFocusOut(event) {
    setTimeout(() => {
      if (this.mainDetailsToggle.hasAttribute('open') && !this.mainDetailsToggle.contains(document.activeElement)) this.closeMenuDrawer();
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }

  closeSubmenu(detailsElement) {
    detailsElement.classList.remove('menu-opening');
    detailsElement.querySelector('summary').setAttribute('aria-expanded', false);
    removeTrapFocus();
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute('open');
        if (detailsElement.closest('details[open]')) {
          trapFocus(detailsElement.closest('details[open]'), detailsElement.querySelector('summary'));
        }
      }
    }

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define('menu-drawer', MenuDrawer);

class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
    this.details = this.querySelector('details');
    this.tabs = this.querySelectorAll('[role="tab"]');
    this.tabsPanels = this.querySelectorAll('[role="tabpanel"]');
    if (this.tabs) this.tabs.forEach(tab => tab.addEventListener('click', this.activateTab.bind(this)))
  }

  openMenuDrawer(summaryElement) {
    let menuDrawerTabsHeight = (document.getElementById('menu-drawer__tabs')) ? document.getElementById('menu-drawer__tabs').offsetHeight : 0;
    document.documentElement.style.setProperty('--menu-drawer-height', menuDrawerTabsHeight + 'px');
    this.header = document.getElementById('shopify-section-header') ? document.getElementById('shopify-section-header') : document.getElementById('shopify-section-header-b') ;
    this.borderOffset = this.borderOffset || this.closest('.header-wrapper').classList.contains('header-wrapper--border-bottom') ? 1 : 0;
    document.documentElement.style.setProperty('--header-bottom-position', `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`);
    let scrollTopPosition = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTopPosition < 150) {window.scrollTo({top: 0, behavior: "smooth"});}

    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });

    summaryElement.setAttribute('aria-expanded', true);
    this.header.classList.add('mobile-menu-open')
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden`);
    // bodyScrollLock.disableBodyScroll(document.querySelector('.menu-drawer__navigation-container'));
  }

  closeHeaderDrawer() {
    this.details.removeAttribute('open');
    this.details.classList.remove('menu-opening');
    document.querySelector('#shopify-section-header')?.classList.remove('mobile-menu-open');
    document.querySelector('#shopify-section-header-b')?.classList.remove('mobile-menu-open');
    this.details.querySelectorAll('details').forEach(details =>  {
      details.removeAttribute('open');
      details.classList.remove('menu-opening');
    });
    document.body.classList.remove(`overflow-hidden`);
    // bodyScrollLock.clearAllBodyScrollLocks();
  }

  activateTab(e) {
    let tab = e.target,
        controls = tab.getAttribute('aria-controls');
    this.tabs.forEach(tab => {
      tab.setAttribute('tabindex', '-1');
      tab.setAttribute('aria-selected', 'false');
    })
    this.tabsPanels.forEach(panel => panel.classList.add('hidden'));
    tab.removeAttribute('tabindex');
    tab.setAttribute('aria-selected', 'true');
    document.getElementById(controls).classList.remove('hidden');
  }
}

customElements.define('header-drawer', HeaderDrawer);

class HeaderMegaMenuOpener extends HTMLElement {
  constructor() {
    super();
    this.headerMegaMenu = document.querySelector('header-mega-menu');
    this.menuItems = document.querySelectorAll('.list-menu--disclosure');
    this.menuNavigation = document.querySelector('.header__main-navigation');
    this.addEventListener('click', this.openMegaMenu.bind(this))
    this.addEventListener('mouseover', () => {
      window.headerHeight()
      if (!this.hasAttribute('active')) this.openMegaMenu()
    })
  }

  openMegaMenu() {
    let megaMenuWrapper = document.querySelector('.header-b-inner');
    let listWrapper = document.querySelectorAll('.header__submenu--list-wrapper');
    let selectedMenu = document.querySelector(`#${this.getAttribute('aria-controls')}`),
        scrollTopPosition = window.pageYOffset || document.documentElement.scrollTop;
    if (!selectedMenu) {
      //window.slideUp(this.headerMegaMenu, 0)
      // this.headerMegaMenu.removeAttribute('open')
      // this.resetMegaMenuAttr()
      this.headerMegaMenu.closeMegaMenu();
      return
    }
    listWrapper.forEach((list) => {
      list.querySelector('collapse-link')?.setAttribute('active', '')
    })
    this.resetMegaMenuAttr()
    this.setAttribute('active', '')
    if (scrollTopPosition < 150) {window.scrollTo({top: 0, behavior: "smooth"});}
    if (!this.headerMegaMenu.hasAttribute('open')) {
      this.headerMegaMenu.setAttribute('open', '')
    }
    if (modalOverlay.getAttribute('aria-hidden') === 'true') {
      modalOverlay.setAttribute('aria-hidden', 'false');
      modalOverlay.style.zIndex = 4;
    }
    if (body.getAttribute('data-header-menu') === 'false') {
      body.setAttribute('data-header-menu', 'true')
    }
    document.body.classList.add('overflow-hidden')
    // bodyScrollLock.disableBodyScroll(selectedMenu);
    // window.pauseAllMedia()
    if (megaMenuWrapper) {megaMenuWrapper.classList.add('active-header-b-inner')}

    this.menuItems.forEach(item => item.setAttribute('aria-hidden', 'true'))
    selectedMenu.setAttribute('aria-hidden', 'false')

    if (!this.headerMegaMenu.hasAttribute('open')) this.headerMegaMenu.removeAttribute('open')
  }

  resetMegaMenuAttr() {
    document.querySelectorAll('header-mega-menu-opener').forEach(item => item.removeAttribute('active'))
    document.querySelectorAll('header-mega-menu details').forEach(item => item.removeAttribute('open'))
    document.querySelectorAll('header-mega-menu summary').forEach(item => item.setAttribute('aria-expanded', 'false'))
  }
}

customElements.define('header-mega-menu-opener', HeaderMegaMenuOpener);

class headerMegaMenu extends HTMLElement {
  constructor() {
    super();
    this.details = this.querySelectorAll('details');
    this.menuItems = this.querySelectorAll('.header__main-link');
    var headerMegaMenu  = this;

    document.addEventListener('click', function(e) {
      var e_path = e.composedPath ? e.composedPath() : e.path;
      var isClickInside = false;
      if (e_path) e_path.forEach((path) => {
        if (path.nodeName === 'HEADER-MEGA-MENU') isClickInside = true;
      })
      if (body.getAttribute('data-header-menu') === 'true' && !isClickInside && e.target.nodeName !== 'HEADER-MEGA-MENU-OPENER') {
        headerMegaMenu.closeMegaMenu()
      }
    });

    this.menuItems.forEach((target) => {
      target.addEventListener("mouseover", (e) => {
        if (target.tagName === 'SUMMARY') {
          this.details.forEach(item => item.removeAttribute('open'));
          this.details.forEach(item => item.querySelector('summary').setAttribute('aria-expanded', 'false'));
          target.parentElement.setAttribute("open", '');
          target.setAttribute('aria-expanded', 'true');
        } else {
          this.details.forEach(item => item.removeAttribute('open'));
          this.details.forEach(item => item.querySelector('summary').setAttribute('aria-expanded', 'false'));
        }
      });
    });
  }

  closeMegaMenu() {
    let megaMenuWrapper = document.querySelector('.header-b-inner');
    let searchOpener = document.querySelector('details-modal details');
    let collapseLinks = document.querySelectorAll('collapse-link');
    if (megaMenuWrapper) {megaMenuWrapper.classList.remove('active-header-b-inner')};

    collapseLinks?.forEach(link => link.removeAttribute('active'));

    // bodyScrollLock.clearAllBodyScrollLocks();
    //window.slideUp(this, 0)
    body.setAttribute('data-header-menu', 'false');
    if (modalOverlay.getAttribute('aria-hidden') === 'false' && !(searchOpener.hasAttribute('open'))) {
      modalOverlay.setAttribute('aria-hidden', 'true');
      modalOverlay.style.zIndex = 6;
      document.body.classList.remove('overflow-hidden');
    }
    this.details.forEach(item => item.removeAttribute('open'));
    this.details.forEach(item => item.querySelector('summary').setAttribute('aria-expanded', 'false'));
    document.querySelectorAll('header-mega-menu-opener').forEach(item => item.removeAttribute('active'))
    this.removeAttribute('open');
    // window.pauseAllMedia();
  }
}
customElements.define('header-mega-menu', headerMegaMenu);

class ModalDialog extends HTMLElement {
  constructor() {
    super();

    this.openWithParent = this.dataset.openWithParent === 'true';
    this.openChildModal = false;
    this.offsetValue = 0;
    this.direction = this.dataset.direction;
    this.connectionChildModal = null;
    this.connectedParentModal = document.querySelector(`${this.dataset.connectedParentModal}`);
    this.modalOverlay = document.querySelector(`${this.dataset.modalOverlay}`) || window.modalOverlay;
    this.mobileSubmenuCloseBtns = this.querySelectorAll('.menu-drawer__close-button');
    this.cartPopup = document.querySelector('#cart-popup')

    if (this.connectedParentModal) {
      this.connectedParentModal.connectionChildModal = this;
      this.offsetValue = this.connectedParentModal.offsetWidth;
      this.modalOverlay = this.connectedParentModal.modalOverlay || window.modalOverlay;

      if (this.openWithParent) {
        this.connectedParentModal.openChildModal = true;
      }
    }

    this.querySelector('[id^="ModalClose-"]')?.addEventListener(
      'click',
      this.hide.bind(this)
    );
    this.addEventListener('keyup', (event) => {
      if (event.code?.toUpperCase() === 'ESCAPE') this.hide();
    });

    if (this.classList.contains('media-modal')) {
      this.addEventListener('pointerup', (event) => {
        if (event.pointerType === 'mouse' && !event.target.closest('product-model')) this.hide();
      });
    }

    document.addEventListener('clickByModalOverlay', () => {
      this.hide();
    });

    if (this.mobileSubmenuCloseBtns) {
      this.mobileSubmenuCloseBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          btn.closest('details').removeAttribute('open');
        })
      })
    }
  }

  show(opener) {
    if (this.classList.contains('mobile__menu--modal')) {
      document.getElementById('shopify-section-header-b').classList.add('open-menu-modal');
    }
    if (this.classList.contains('account__modal')) this.modalOverlay.style.zIndex = 12;
    if (document.querySelector("body").getAttribute('data-header-menu') === 'true' ) megaMenu.closeMegaMenu()
    if (document.getElementById('shopify-section-header')?.classList.contains('mobile-menu-open')) headerDrawer.closeHeaderDrawer()
    if (document.getElementById('shopify-section-header-b')?.classList.contains('mobile-menu-open')) headerDrawer.closeHeaderDrawer()
    //

    this.dispatchEvent(new CustomEvent('ModalDialogOpen', { detail: { opener: opener } }));
    if (this.connectedParentModal)  this.offsetValue = this.connectedParentModal.offsetWidth;

    (this.direction && window.screen.width >= 1024) ? this.style[this.direction] = `${this.offsetValue}px` : this.style[this.direction] = '';
    if (navigator.platform === 'iPhone') document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
    this.openedBy = opener;
    const popup = this.querySelector('.template-popup');

    // if (this.modalOverlay.getAttribute('aria-hidden') === 'true') {
    //   this.modalOverlay.setAttribute('aria-hidden', 'false');
    // }

    if(opener?.getAttribute('data-quick-view-modal') !== 'true') {
      document.querySelector('#quick-view').scroll({top:0,behavior:'smooth'})
      // if(window.screen.width < 1024) {
      //   document.querySelector('#quick-view').style.overflow = 'hidden';
      // }
      if (this.modalOverlay.getAttribute('aria-hidden') === 'true') {
        this.modalOverlay.setAttribute('aria-hidden', 'false');
      }
    }

    let scrollTarget
    if (opener?.closest('modal-opener')?.classList.contains('header__search--mobile')) {
      scrollTarget = '.predictive-search'
    } else if (opener?.closest('modal-opener')?.getAttribute('data-modal') === '#AccountModal' || this.getAttribute('data-modal') === '#AccountModal') {
      scrollTarget = '.account__modal_block-wrapper'
    } else {
      scrollTarget = '[role="dialog"]'
    }
    console.log(this)
    console.log(opener)
    console.log(scrollTarget)
    bodyScrollLock?.disableBodyScroll(this.querySelector(scrollTarget));
    document.body.classList.add('modal-open');
    this.setAttribute('open', '');
    if (popup) popup.loadContent();
    if (this.classList.contains('search__modal')) {
      this.querySelector('predictive-search')?.setInputFocus();
    }
    // window.pauseAllMedia();

    if (this.openChildModal && this.connectionChildModal && this.hasAttribute('open')) {
      setTimeout(() => {
        this.connectionChildModal.show()
      }, 200);
    }
  }

  hide() {
    if (this.classList.contains('mobile__menu--modal')) {
      document.getElementById('shopify-section-header-b').classList.remove('open-menu-modal');
    }
    if (this.classList.contains('account__modal')) this.modalOverlay.style.zIndex = 6;
    if (document.querySelector("body").getAttribute('data-header-menu') === 'true' ) megaMenu.closeMegaMenu()
    if (document.getElementById('shopify-section-header')?.classList.contains('mobile-menu-open')) headerDrawer.closeHeaderDrawer()
    if (document.getElementById('shopify-section-header-b')?.classList.contains('mobile-menu-open')) headerDrawer.closeHeaderDrawer()

    this.querySelectorAll('details')?.forEach(detail => detail.removeAttribute('open'));

    this.onlyHide = !!this.connectedParentModal;
    this.hideConnectionChildModal();
    this.dispatchEvent(new CustomEvent('ModalDialogClose'));
    if(this.getAttribute('data-quick-view-modal') === 'true') {
      document.querySelector('#quick-view').style.overflow = 'auto';
    }

    if (this.onlyHide) {
      this.removeAttribute('open');
      // removeTrapFocus(this.openedBy);
    } else {
      if (this.connectionChildModal) {
        setTimeout(() => {
          this.removeAttribute('open');
          // removeTrapFocus(this.openedBy);
          // window.pauseAllMedia();
          document.body.classList.remove('overflow-hidden', 'modal-open');
          if(this.getAttribute('data-quick-view-modal') !== 'true') {
            this.modalOverlay.setAttribute('aria-hidden', 'true');
          }
        }, 200);
      } else {
        this.removeAttribute('open');
        // removeTrapFocus(this.openedBy);
        // window.pauseAllMedia();

        setTimeout(() => {
          document.body.classList.remove( 'modal-open');
          if(this.getAttribute('data-quick-view-modal') !== 'true') {
            this.modalOverlay.setAttribute('aria-hidden', 'true');
          }
        }, 200);
      }
    }

    this.checkOpenModals()
  }

  checkOpenModals() {
    const modalDialog = document.querySelectorAll('modal-dialog[open]');
    if (modalDialog.length === 0) bodyScrollLock.clearAllBodyScrollLocks();
  }

  hideConnectionChildModal() {
    if (!this.connectionChildModal) {return false}
    this.connectionChildModal.onlyHide = true;
    this.connectionChildModal.hide();
  }
}
customElements.define('modal-dialog', ModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();
    const button = this.querySelector('button');

    if (!button) return;
      button.addEventListener('click', () => {
      const modal = document.querySelector(this.getAttribute('data-modal'));
      if (document.querySelector("body").getAttribute('data-header-menu') === 'true' ) megaMenu.closeMegaMenu()
      if (document.getElementById('shopify-section-header')?.classList.contains('mobile-menu-open')) headerDrawer.closeHeaderDrawer()
      if (document.getElementById('shopify-section-header-b')?.classList.contains('mobile-menu-open')) headerDrawer.closeHeaderDrawer()

      // document.querySelectorAll('modal-dialog[open]').forEach(modal => modal.hide());
      if (modal) modal.show(button);
    });
  }
}
customElements.define('modal-opener', ModalOpener);

class ModalClose extends HTMLElement {
  constructor() {
    super();
      this.addEventListener('click', () => {
        const modal = document.querySelector(this.getAttribute('data-modal'));
        if (modal) modal.hide();
      })
  }
}
customElements.define('modal-close', ModalClose);

class ModalOverlay extends HTMLElement {
  constructor() {
    super();
    const modal = document.querySelectorAll('modal-dialog, product-notify-modal, product-media-zoom');
    let megaMenu = document.querySelector('header-mega-menu');
    const details = document.querySelectorAll('details');
    const cartPopup = document.querySelector('cart-popup')
    const predictiveSearch = document.querySelector('header predictive-search');
    const quickView = document.querySelector('quick-view');
    this.addEventListener('click', () => {
      if (modal) modal.forEach(item => item.hide());
      if (details) details.forEach(item => {
        if (!item.hasAttribute('data-keep-open')) {
          item.removeAttribute('open');
        }
      });
      if (megaMenu.hasAttribute('open')) megaMenu.closeMegaMenu();
      if (cartPopup.hasAttribute('open')) cartPopup.close();
      if (predictiveSearch.hasAttribute('open')) predictiveSearch.close();
      if (quickView.getAttribute('aria-hidden') === 'false') quickView.close();
      document.dispatchEvent(new CustomEvent('clickByModalOverlay'));
    });

    this.addEventListener('mouseover', () => {
      if (megaMenu.hasAttribute('open')) megaMenu.closeMegaMenu()
    })
  }
}
customElements.define('modal-overlay', ModalOverlay);

class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener('click', this.loadContent.bind(this));
  }

  loadContent() {
    window.pauseAllMedia();
    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div');
      content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));

      this.setAttribute('loaded', true);
      this.appendChild(content.querySelector('video, model-viewer, iframe')).focus();
      if (this.querySelector('video')) this.querySelector('video').play()
    }
  }
}

customElements.define('deferred-media', DeferredMedia);

class SliderComponent extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('ul');
    this.sliderItems = this.querySelectorAll('li');
    this.pageCount = this.querySelector('.slider-counter--current');
    this.pageTotal = this.querySelector('.slider-counter--total');
    this.prevButton = this.querySelector('button[name="previous"]');
    this.nextButton = this.querySelector('button[name="next"]');

    if (!this.slider || !this.nextButton) return;

    const resizeObserver = new ResizeObserver(entries => this.initPages());
    resizeObserver.observe(this.slider);

    this.slider.addEventListener('scroll', this.update.bind(this));
    this.prevButton.addEventListener('click', this.onButtonClick.bind(this));
    this.nextButton.addEventListener('click', this.onButtonClick.bind(this));
  }

  initPages() {
    const sliderItemsToShow = Array.from(this.sliderItems).filter(element => element.clientWidth > 0);
    this.sliderLastItem = sliderItemsToShow[sliderItemsToShow.length - 1];
    if (sliderItemsToShow.length === 0) return;
    this.slidesPerPage = Math.floor(this.slider.clientWidth / sliderItemsToShow[0].clientWidth);
    this.totalPages = sliderItemsToShow.length - this.slidesPerPage + 1;
    this.update();
  }

  update() {
    if (!this.pageCount || !this.pageTotal) return;
    this.currentPage = Math.round(this.slider.scrollLeft / this.sliderLastItem.clientWidth) + 1;

    if (this.currentPage === 1) {
      this.prevButton.setAttribute('disabled', 'disabled');
    } else {
      this.prevButton.removeAttribute('disabled');
    }

    if (this.currentPage === this.totalPages) {
      this.nextButton.setAttribute('disabled', 'disabled');
    } else {
      this.nextButton.removeAttribute('disabled');
    }

    this.pageCount.textContent = this.currentPage;
    this.pageTotal.textContent = this.totalPages;
  }

  onButtonClick(event) {
    event.preventDefault();
    const slideScrollPosition = event.currentTarget.name === 'next' ? this.slider.scrollLeft + this.sliderLastItem.clientWidth : this.slider.scrollLeft - this.sliderLastItem.clientWidth;
    this.slider.scrollTo({
      left: slideScrollPosition
    });
  }
}

customElements.define('slider-component', SliderComponent);

class VariantSelects extends HTMLElement {
  constructor() {
    super();

    this.firstRemoveErrorMessage = false;
    this.productMonogram = document.querySelector('product-monogram')

    this.sizesTranslations = 'size,taille,größe,tamanho,tamaño,koko,サイズ';
    this.colorsTranslations = 'color,colour,couleur,colore,farbe,색,色,färg,farve';
    this.styleTranslations = 'style,stile,estilo,styl,stijl,stil,스타일';
    this.colorOptionIndex = this.dataset.colorOptionPosition ? this.dataset.colorOptionPosition : false;

    this.stubVariants = this.dataset.firstVariantsByColor ? this.dataset.firstVariantsByColor.split(';') : false;
    this.useStubId = false;
    this.stubId = false;
    this.addEventListener('change', this.onVariantChange);
    this.onPreorderCheck();
    this.updateOptions();
    if (this.colorOptionIndex) this.checkSelectedColor();
    this.styleOptionCheck();
    this.colorOptionCheck();
    this.sizeOptionCheck();
    this.disableUnavailableVariants();
  }

  onVariantChange(evt) {
    this.updateOptions();
    this.updateMasterId(evt);
    this.setStubId(evt);
    this.removeErrorMessage();
    this.disableUnavailableVariants();

    if (!this.currentVariant && !this.stubId) {
      this.toggleAddButton(true, '', false, true);
      this.setUnavailable();
      this.setProductInfoStyle(1);
      this.checkOOSMessage();
    } else {
      if (!this.useStubId) {
        this.updateVariantInput();
        this.updateURL();
        this.additionalProduct();
      }
      this.renderProductInfo(evt);
      this.updateShareUrl();
    }
  }

  disableUnavailableVariants() {
    this.optionGroups = Array.from(this.querySelectorAll('.product-form__options'));
    this.selectOptions = Array.from(this.querySelectorAll('.form__select-dropdown-option '));

    this.selectOptions.forEach((label) => label.classList.remove('unavailable', 'disabled'))
    for (let i = 0; i < this.options.length; i++) {
      const groupOptions = this.optionGroups[i].querySelectorAll('option');
      groupOptions.forEach(option => {
        const options = [...this.options];
        options.splice(i,1, option.value);
        const variant = this.getVariantByOptions(options);
        let className = !variant ? 'unavailable' : !variant.available ? 'disabled' : null;
        if (className) this.setLabelClassName(className, option);
      })
    }
  }

  setLabelClassName(className, option) {
    const label = this.selectOptions.find(label => label.dataset.optionValue === option.value);
    label?.classList.add(className);
  }

  getVariantByOptions(options) {
    return this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return options[index] === option;
      }).includes(false);
    });
  }

  checkSelectedColor() {
    if (this.options[Number(this.colorOptionIndex)] === "notSelectedOption") {
      const colorInputs = this.querySelectorAll('input[name=Color], input[name=color]'),
          sortByOrders = Array.from(colorInputs).sort((a, b) => a.dataset.colorOrder - b.dataset.colorOrder),
          colorValue = sortByOrders[0]?.dataset.valueHandle,
          urlParams = new URLSearchParams(window.location.search);
      if (colorValue) {
        urlParams.append('color', colorValue)
        history.pushState(null, '', window.location.pathname + '?' + urlParams.toString());
      }
    }
  }

  sizeOptionCheck() {
    const sizeFieldset = this.querySelector('.product-form__options--size') || null;

    if (!sizeFieldset) return false;

    const sizeOptionSize = parseInt(sizeFieldset.getAttribute('data-options-size'), 10);
    const input = sizeFieldset.querySelector('input') || null;

    if (sizeOptionSize != 1 || input.checked) return false;

    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  styleOptionCheck() {
    const styleSelect = this.querySelector('.product-form__options-style select') || null;

    if (!styleSelect) return false;

    const urlParams = new URLSearchParams(window.location.search)
    if (!urlParams.get('variant')) {
      styleSelect.dispatchEvent(new CustomEvent('change', {bubbles: true, detail: {updateMedia: false}}));
    }
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset, .fieldset'));
    this.options = fieldsets.map((fieldset) => {
      const optionChecked = Array.from(fieldset
          .querySelectorAll(`input[data-variant-option], option[data-variant-option]`))
          .find((option) => option.checked || option.selected)
      return optionChecked ? optionChecked.value : 'notSelectedOption';
    });
  }

  updateMasterId(evt) {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });

    if (evt) {
      const evtOptionName = evt.target.name.toLowerCase();
      if (this.styleTranslations.includes(evtOptionName) && !this.currentVariant) {
        this.updateMasterIdByStyle();
      }
    }

    this.useStubId = this.currentVariant ? this.useStubId = false : this.useStubId = true;
    return this.currentVariant
  }

  updateMasterIdByStyle() {
    const selectedStyle = this.querySelector('select[name=Style]')?.value
    if (!selectedStyle) return
    this.currentVariant = this.variantData.find((variant) => variant.options.includes(selectedStyle));
  }

  setStubId(evt) {
    if (this.useStubId && this.stubVariants) {
      const evtOptionValue = evt.target.value.toLowerCase();
      this.stubId = this.stubVariants.filter(el => el.split('*')[0] === evtOptionValue)[0]?.split('*')[1];
      const urlParams = new URLSearchParams(window.location.search)

      if (urlParams.get('variant') && this.stubId) {
        this.currentVariant = this.getVariantData().find(variant => variant.id == this.stubId)
        this.useStubId = this.currentVariant ? this.useStubId = false : this.useStubId = true;
      }
    }
  }

  updateMedia(newHtml) {
    const mediaContainer = document.querySelector('.product__media-wrapper');
    const mediaUpdate = mediaContainer.getAttribute('data-media-update') === 'true';
    const newMedia = newHtml.querySelector('.product__media-wrapper');

    if (!mediaUpdate) return false;

    if (mediaContainer && newMedia) mediaContainer.innerHTML = newMedia.innerHTML;

    this.stickyHeader = this.stickyHeader || document.querySelector('sticky-header');
    if(this.stickyHeader) {
      this.stickyHeader.dispatchEvent(new Event('preventHeaderReveal'));
    }
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
    const params = new URLSearchParams(window.location.search);

    if (params.has('color')) params.delete('color');
    if (params.has('variant')) params.delete('variant');
    params.set('variant', this.currentVariant.id);
    const newSearchParams = params.toString();

    if(this.getAttribute('data-quick-view-radios') !== 'true') {
      window.history.replaceState({ }, '', `${this.dataset.url}?${newSearchParams}`);
    }
  }

  updateShareUrl() {
    const shareButton = document.getElementById(`Share-${this.dataset.section}`);
    if (!shareButton) return;
    shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name*="items"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  additionalProduct() {
    const additionalProduct = document.querySelector('.product__card-mini');
    if (additionalProduct) additionalProduct.style.display = 'block';
  }

  removeErrorMessage() {
    const section = this.closest('section');
    if (!section) return;

    const productForm = section.querySelector('product-form');
    if (productForm && this.firstRemoveErrorMessage) productForm.handleErrorMessage();
    if (!this.firstRemoveErrorMessage) this.firstRemoveErrorMessage = true;
  }

  checkOOSMessage () {
    const oosMessage = document.getElementById(`ProductOOSMessage-${this.dataset.section}`);
    if (!oosMessage) return;
    oosMessage.classList.add('hidden')
    if (this.currentVariant && !this.currentVariant.available) oosMessage.classList.remove('hidden');
  }

  checkLastChanceMessages () {
    const lastChanceStockMessage = document.querySelector(`.ProductLastChanceMessageStock-${this.dataset.section}`);
    const lastChanceOOSMessage = document.querySelector(`.ProductLastChanceMessageOOS-${this.dataset.section}`);
    if (!lastChanceStockMessage && !lastChanceOOSMessage) return

    if (this.currentVariant && this.currentVariant.available) {
      if (lastChanceOOSMessage) lastChanceOOSMessage.classList.add('hidden');
      if (lastChanceStockMessage) lastChanceStockMessage.classList.remove('hidden');
    } else {
      if (lastChanceOOSMessage) lastChanceOOSMessage.classList.remove('hidden');
      if (lastChanceStockMessage) lastChanceStockMessage.classList.add('hidden');
    }
  }

  renderProductInfo(evt) {
    const fetchVariantId = this.currentVariant?.id || this.stubId;
    if (!fetchVariantId || !evt) return;

    fetch(`${this.dataset.url}?variant=${fetchVariantId}&section_id=${this.dataset.section}`)
      .then((response) => response.text())
      .then((responseText) => {
        const evtOptionName = evt.target.name.toLowerCase();
        const evtOptionValue = evt.target.value;
        const priceId = `price-${this.dataset.section}`;
        const priceMobileId = `price-mobile-${this.dataset.section}`;
        const sizesDialogId = `[id^="SizeModal-${this.dataset.section}"]`;
        const sizeDialogModal = document.querySelector(sizesDialogId);
        const sizeGuideType = sizeDialogModal?.dataset.sizeGuideType;
        const sizesDialogOpenerButton = document.querySelector(`[data-modal="#SizeModal-${this.dataset.section}-${sizeGuideType}"] button`);
        const sizesType = sizeDialogModal?.dataset.sizesType;
        const sizeOptionsSelector = '.product-form__options--size';
        const colorOptionsSelector = '.product-form__options--color';
        const sizeOptions = this.querySelector(sizeOptionsSelector);
        const colorOptions = this.querySelector(colorOptionsSelector);
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        const clickBySizeOption = this.sizesTranslations.includes(evtOptionName);
        const notifyModalContainerSelector = 'notify-modal-container';
        const notifyModalSelector = 'product-notify-modal';
        const notifyModal = document.querySelector(notifyModalSelector);
        const notifyOpener = document.querySelector('.notify-modal-opener');
        const deliveryDates = document.querySelector('#product-delivery');
        const newDeliveryDates = html.querySelector('#product-delivery');
        this.preorder = newDeliveryDates?.querySelector('[data-variant-preorder]')?.getAttribute('data-variant-preorder') === 'true';

        //Last change updates
        this.lastChanceUpdates(html)

        // Delivery dates
        if ((this.currentVariant?.available || this.useStubId) && newDeliveryDates?.hasChildNodes()) {
          if (newDeliveryDates.innerHTML.trim() && deliveryDates) deliveryDates.innerHTML = newDeliveryDates.innerHTML
        } else {
          if (deliveryDates) deliveryDates.innerHTML = '';
        }

        // Change Color Option
        if (this.colorsTranslations.includes(evtOptionName)) {
          this.updateMedia(html);

          // Update URL by query "color" param if not selected variant
          if (this.useStubId) {
            const valueHandle = evt.target.dataset.valueHandle;
            const searchParams = new URLSearchParams(window.location.search);

            if (searchParams.has('color')) searchParams.delete('color');
            searchParams.set('color', valueHandle);

            window.history.replaceState({ }, '', `${this.dataset.url}?${searchParams.toString()}`);
          }

          // Badge
          const badgeContainer = document.querySelector('#product-badge');
          const newBudgeContainer = html.querySelector('#product-badge');
          if (badgeContainer) badgeContainer.innerHTML = newBudgeContainer.innerHTML;

          const badgeContainerMobile = document.querySelector('#product-badge-mobile');
          const newBudgeContainerMobile = html.querySelector('#product-badge-mobile');
          if (badgeContainerMobile) badgeContainerMobile.innerHTML = newBudgeContainerMobile.innerHTML;

          // Description
          const descriptionContainer = document.querySelector('#product-description');
          const newDescriptionContainer = html.querySelector('#product-description');
          if (descriptionContainer) descriptionContainer.innerHTML = newDescriptionContainer.innerHTML;
        }

        // Change Size option
        if (sizesDialogOpenerButton && clickBySizeOption) {
          if (sizesDialogOpenerButton.dataset.changeLabel === 'true') {
            sizesDialogOpenerButton.innerHTML = `Size ${evtOptionValue}`;

            if (sizesDialogOpenerButton.classList.contains('button--primary')) {
              sizesDialogOpenerButton.classList.remove('button--primary');
              sizesDialogOpenerButton.classList.add('button--secondary-border');
            }
          }

          if (sizeGuideType === 'version_1') {
            if (sizesType === 'inline' && this.currentVariant) sizeDialogModal.hide();
            if (sizesType === 'modal' && this.currentVariant?.available) sizeDialogModal.hide();
          }
        }

          // if (!clickBySizeOption && sizeOptions) {
          //   const newSizesOptions = html.querySelector(sizeOptionsSelector);
          //   const sizeInputChecked = newSizesOptions?.querySelector('input:checked');
          //
          //   if (this.useStubId && sizeInputChecked) {
          //     sizeInputChecked.removeAttribute('checked');
          //   }
          //
          //   if (newSizesOptions) sizeOptions.innerHTML = newSizesOptions.innerHTML;
          // }

        //Style Option
        if (this.styleTranslations.includes(evtOptionName)) {
          if (!evt.detail && !evt.detail?.updateMedia) {
            this.updateMedia(html);
            const newColorOptions = html.querySelector(colorOptionsSelector);
            if (newColorOptions) colorOptions.innerHTML = newColorOptions.innerHTML;
          }
        }

        //Notify Modal
        if (notifyModal && notifyModal.hasAttribute('open')) {
          notifyModal.hide();
        }

        if (!this.useStubId) {
          document.getElementById(notifyModalContainerSelector).innerHTML = html.getElementById(notifyModalContainerSelector).innerHTML;
        }

        if (notifyOpener) {
          const notifyOpenerButton = notifyOpener.querySelector('button');
          const lastChanceConfig = document.querySelector(`#LastChangeConfig-${this.dataset.section}`) ? JSON.parse(document.querySelector(`#LastChangeConfig-${this.dataset.section}`).textContent) : {};

          if (this.currentVariant?.available || this.useStubId || lastChanceConfig.lastChance === 'true') {
            notifyOpener.style.display = 'none';
            if (!notifyOpenerButton.hasAttribute('disabled')) notifyOpenerButton.setAttribute('disabled', '');
          } else {
            notifyOpenerButton.removeAttribute('disabled');
            notifyOpener.style.display = 'block';
          }
        }

        const newNotifyModal = document.querySelector(notifyModalSelector);
        if (newNotifyModal
          && !this.useStubId
          && newNotifyModal.connectedParentModal
          && newNotifyModal.connectedParentModal.hasAttribute('open')) {
          newNotifyModal.show();
        }

        //OOSMessage
        this.checkOOSMessage();

        //Last Chance Message
        this.checkLastChanceMessages();

        //Price
        const currentPriceContainer = document.getElementById(priceId);
        const newPriceContainer = html.getElementById(priceId);
        if (newPriceContainer && currentPriceContainer) currentPriceContainer.innerHTML = newPriceContainer.innerHTML;

        const price = document.getElementById(priceId);
        if (price) price.classList.remove('visibility-hidden');

        const currentPriceContainerMobile = document.getElementById(priceMobileId);
        const newPriceContainerMobile = html.getElementById(priceMobileId);
        if (newPriceContainerMobile && currentPriceContainerMobile) currentPriceContainerMobile.innerHTML = newPriceContainerMobile.innerHTML;

        const priceMobile = document.getElementById(priceMobileId);
        if (priceMobile) priceMobile.classList.remove('visibility-hidden');

        if (document.querySelector('cart-items')) {
          document.querySelector('cart-items').scriptDiscountCheck(true, false);
        }

        //Add button
        if (!this.useStubId) this.toggleAddButton(!this.currentVariant.available, window.variantStrings.soldOut);

        this.setProductInfoStyle(1);

        //Customizer
        if (this.productMonogram) {
          this.productMonogram.setPatch();
        }
      });
  }

  lastChanceUpdates(html) {
    const oldLastChanceConfig = document.getElementById(`LastChangeConfig-${this.dataset.section}`);
    const newLastChanceConfig = html.getElementById(`LastChangeConfig-${this.dataset.section}`);
    const oldMessages = document.getElementById(`LastChanceMessages-${this.dataset.section}`);
    const newMessages = html.getElementById(`LastChanceMessages-${this.dataset.section}`);

    if (oldLastChanceConfig && newLastChanceConfig) oldLastChanceConfig.innerHTML = newLastChanceConfig.innerHTML;
    if (oldMessages && newMessages) oldMessages.innerHTML = newMessages.innerHTML;
  }

  toggleAddButton(disable = true, text, hide = false, unavailable = false) {
    const section = document.getElementById(`shopify-section-${this.dataset.section}`);
    const quickView = document.getElementById(`quick-view`);
    const productForm = document.getElementById(`product-form-${this.dataset.section}`);
    if (!productForm) return;

    const productFormParent = productForm.parentNode;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');
    const lastChanceConfig = productForm.querySelector(`#LastChangeConfig-${this.dataset.section}`) ? JSON.parse(productForm.querySelector(`#LastChangeConfig-${this.dataset.section}`).textContent) : {}

    if (!addButton) return;

    if (disable) {
      addButton.setAttribute('disabled', 'disabled');
      if (text) addButtonText.textContent = lastChanceConfig.lastChance === 'true' ? lastChanceConfig.buttonLabel || window.variantStrings.lastChance : text;
    } else {
      if (this.preorder) {
        addButton.setAttribute('disabled', 'disabled');
        addButtonText.textContent = window.variantStrings.preorder;
        this.onPreorderCheck();
      } else {
        addButton.removeAttribute('disabled');
        addButtonText.textContent = window.variantStrings.atc;
      }
    }

    if (section) section.toggleAttribute("data-unavailable", unavailable)
    if (quickView) quickView.toggleAttribute("data-unavailable", unavailable)
    if (hide) {
      productFormParent.style.display = 'none'
    } else {
      productFormParent.style.display = 'block'
    }
  }

  setUnavailable() {
    const button = document.getElementById(`product-form-${this.dataset.section}`);
    const addButton = button.querySelector('[name="add"]');
    const addButtonText = button.querySelector('[name="add"] > span');
    const price = document.getElementById(`price-${this.dataset.section}`);
    if (!addButton) return;
    addButtonText.textContent = window.variantStrings.unavailable;
    if (price) price.classList.add('visibility-hidden');
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }

  onPreorderCheck() {
    const preorderCheckbox = document.querySelector('#enablePreorder');
    if (!preorderCheckbox) return false;

    const productForm = document.getElementById(`product-form-${this.dataset.section}`);
    const button = productForm.querySelector('button[type="submit"]');

    preorderCheckbox.addEventListener('change', function() {
      this.checked ? button.removeAttribute('disabled') : button.setAttribute('disabled', '');
    });
  }

  colorOptionCheck() {
    const searchParams = new URLSearchParams(window.location.search);
    if (!searchParams.has('color')) {
      this.setProductInfoStyle(1);
      return false;
    }

    const color = searchParams.get('color');
    const currentInput = this.querySelector(`input[name="color" i][data-value-handle="${color}"]`);
    const inputs = this.querySelectorAll(`input[name="color" i]`);
    const mediaContainer = document.querySelector('.product__media-wrapper');
    const mediaUpdate = mediaContainer.getAttribute('data-media-update') === 'true';

    if (!currentInput || !inputs.length) {
      this.setProductInfoStyle(1);
      return false;
    }

    if (mediaUpdate) {
      document.querySelectorAll('.product__media-item img').forEach(el => {
        el.classList.remove('lazyload');
        el.style.opacity = 0;
      });
    }

    inputs.forEach(el => {
      if (el.isEqualNode(currentInput)) {
        el.checked = true;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      } else el.checked = false;
    });
  }

  setProductInfoStyle(opacity) {
    document.querySelectorAll('.product__info-wrapper').forEach(el => {
      el.style.opacity = opacity;
    });
  }
}

customElements.define('variant-selects', VariantSelects);

class VariantRadios extends VariantSelects {
  constructor() {
    super();
  }

  disableUnavailableVariants() {
    this.radioGroups = Array.from(this.querySelectorAll('.product-form__options'));
    this.radioLabels = Array.from(this.querySelectorAll('[data-radio-label]'));

    this.radioLabels.forEach((label) => label.classList.remove('unavailable', 'disabled'))
    for (let i = 0; i < this.options.length; i++) {
      const groupRadios = this.radioGroups[i].querySelectorAll('input[type=radio]');
      groupRadios.forEach(radio => {
        const options = [...this.options];
        options.splice(i,1, radio.value);
        const variant = this.getVariantByOptions(options);
        let className = !variant ? 'unavailable' : !variant.available ? 'disabled' : null;
        if (className) this.setLabelClassName(className, radio);
      })
    }
  }

  setLabelClassName(className, radio) {
    const label = this.radioLabels.find(label => label.htmlFor === radio.id);
    label?.classList.add(className);
  }
}

customElements.define('variant-radios', VariantRadios);

class SizeCompared extends HTMLElement {
  constructor() {
    super();
    this.jsonData = JSON.parse(this.querySelector('[data-sizes-json]').textContent);
    this.siblingGroupSelects = this.querySelectorAll('custom-select[data-select-type="sizes-group"]');
    this.siblingGroupValueSelects = this.querySelectorAll('custom-select[data-select-type="sizes-group-value"]');
    this.selectButton = this.querySelector('button');
    this.footer = this.querySelector('.size-compared-v1__footer');

    this.changeSizeGroupSelect();
    this.openSizeGroupSelect();
    this.clickSelectSize();
  }

  changeSizeGroupSelect() {
    this.addEventListener('changeCustomSelect', (evt) => {
      const selectType = evt.detail.selectType;
      const parentCustomSelect = evt.target.closest('custom-select');

      if (!this.siblingGroupSelects.length) return false;

      if (selectType === 'sizes-group') {
        this.groupValue = evt.target.value;

        this.siblingGroupSelects.forEach(el => {
          if (el.isEqualNode(parentCustomSelect)) return false;
          if (el.classList.contains('checked')) {
            el.classList.remove('checked');
            el.querySelector('li.checked').classList.remove('checked');
            evt.target.querySelectorAll('option')[0].selected = 'selected'
          }
        });

        this.siblingGroupValueSelects.forEach(el => {
          if (el.dataset.sizeGroupNameValue === this.groupValue) {
            el.style.display = 'block';
            el.scrollIntoView({
              behavior: 'smooth',
              block: 'end',
              inline: 'nearest'
            });
          } else el.style.display = 'none';
        });
      }

      if (selectType === 'sizes-group-value') {
        this.sizeValue = evt.target.value;

        const currentSizes = this.jsonData.filter(el => el[this.groupValue] == this.sizeValue)[0];
        this.originalSizeValue = currentSizes['Original'];

        Object.entries(currentSizes).forEach(el => {
          const currentCustomSelect = this.querySelector(`[data-size-group-name-value="${el[0] || el['Original']}"]`);
          currentCustomSelect
            ?.querySelector(`li[data-option-value="${el[1]}"]`)
            .dispatchEvent(new Event('changeValue', { bubbles: false }));
        });

        this.selectButton.innerText = `Size ${this.originalSizeValue}`;
        this.footer.style.display = 'block';
      }
    });
  }

  clickSelectSize() {
    this.selectButton.addEventListener('click', () => {
      const currentSizeOptionSelector = document.querySelector(`variant-radios input[name=${"Size" || "size"}][value="${this.originalSizeValue}"]`);
      const sizeOptionSelectors = document.querySelectorAll(`variant-radios input[name=${"Size" || "size"}]`);

      if (currentSizeOptionSelector.checked || !currentSizeOptionSelector || !sizeOptionSelectors.length) return false;

      sizeOptionSelectors.forEach(el => {
        if (el.value == this.originalSizeValue) {
          el.checked = true;
          el.dispatchEvent(new Event('change', { bubbles: true }));
        } else el.checked = false;
      });
    });
  }

  openSizeGroupSelect() {
    this.addEventListener('openCustomSelect', (evt) => {
      const selectType = evt.detail.selectType;
      const scrollableElement = evt.target.closest('custom-select').querySelector('ul');

      if (selectType === 'sizes-group-value') {
        scrollableElement.scrollIntoView({
          behavior: 'smooth',
          block: "end",
          inline: "nearest"
        });
      }
    });
  }
}

customElements.define('size-compared-v1', SizeCompared);

class SizeComparedVersion2 extends HTMLElement {
  constructor() {
    super();
    this.modal = this.closest('modal-dialog');

    this.init();
  }

  init() {
    this.addEventListener('click', this.splitButtonClick.bind(this));
  }

  splitButtonClick(evt) {
    const target = evt.target;

    if (target.closest('[data-original-value]')) this.changeSize(target);
    if (target.closest('[data-select-value]')) this.selectSize();
  }

  changeSize(target) {
    const element = target.closest('[data-original-value]');
    const selectedElement = this.querySelector('.active[data-original-value]');
    this.originalSizeValue = element.dataset.originalValue;

    if (selectedElement) selectedElement.classList.remove('active');
    element.classList.add('active');
    this.querySelector('[data-value-container]').innerHTML = this.originalSizeValue;
    this.querySelector('.size-compared-v2__footer').classList.add('selected');
  }

  selectSize() {
    const currentSizeOptionSelector = document.querySelector(`variant-radios input[name=${"Size" || "size"}][value="${this.originalSizeValue}"]`);
    const sizeOptionSelectors = document.querySelectorAll(`variant-radios input[name=${"Size" || "size"}]`);

    setTimeout(() => {this.modal.hide()}, 300);

    if (currentSizeOptionSelector.checked || !currentSizeOptionSelector || !sizeOptionSelectors.length) return false;

    sizeOptionSelectors.forEach(el => {
      if (el.value == this.originalSizeValue) {
        el.checked = true;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      } else  el.checked = false;
    });
  }
}

customElements.define('size-compared-v2', SizeComparedVersion2);

class ProductCard extends HTMLElement {
  constructor() {
    super();
    this.media = this.querySelector('[data-product-card-media]')
    this.productLink = this.querySelector('.js-product-link');
    this.thumbnails = this.querySelectorAll('.thumbnails-item') || null;
    this.price = this.querySelectorAll('.price:not(.price--with-range)') || null;
    this.exploreBtns = this.querySelectorAll('[data-action="explore"]');
    this.quickViewPopup = document.querySelector('quick-view');

    if (this.thumbnails.length > 1) {
      this.thumbnails.forEach((thumbnail) => {
        thumbnail.addEventListener('click', this.changeColorSwatch.bind(this))
      });
    }

    this.exploreBtns?.forEach((btn) => {
      btn.addEventListener('click', () => {
        const productUrl = btn.getAttribute('data-product');
        btn.setAttribute('aria-disabled', true);
        btn.setAttribute('disabled', '');
        btn.classList.add('loading');
        btn.querySelector('.loading-overlay__spinner')?.classList.remove('hidden')
        this.quickViewPopup.fetchSection(productUrl, btn);
      })
    })
  }

  changeColorSwatch (e) {
    e.preventDefault();

    const currentSwatch = e.target.closest('.thumbnails-item'),
          currentVariant = JSON.parse(currentSwatch.querySelector('[type="application/json"]').textContent),
          currentLink = currentSwatch.getAttribute('data-variant-url'),
          currentMediaUrl = currentSwatch.getAttribute('data-media-url'),
          currentQuickViewUrl = currentSwatch.getAttribute('data-quick-view-url');
    
    this.thumbnails.forEach((item) => item.classList.remove('active'))
    currentSwatch.classList.add('active');
    this.productLink.setAttribute('href', currentLink);
    this.exploreBtns?.forEach((btn) => {
      btn.setAttribute('data-product', currentQuickViewUrl);
    })

    this.changeVariantMedia(currentMediaUrl)
    if (this.price) this.changeVariantPrice(currentVariant.price, currentVariant['compare_at_price'])
  }

  changeVariantMedia(mediaUrl) {
    const url = mediaUrl + '&section_id=ajax-card-media';
    fetch(url).then(response => response.text()).then((data) => {
          const html= new DOMParser().parseFromString(data, 'text/html');
          const newMedia = html.querySelector('[data-product-card-media]')
          this.media.innerHTML = newMedia?.innerHTML
        })
        .catch(error => {
          console.log(error)
        })
  }

  changeVariantPrice (price, compareAtPrice) {
    this.price.forEach((item) => {
      if (compareAtPrice > price) {
        item.classList.add('price--on-sale');
        item.querySelectorAll('.price-item.price-item--sale').forEach((priceSelector) => priceSelector.innerHTML = formatMoney(price, '{{amount_no_decimals}}'))
        item.querySelectorAll('.price-item.price-item--regular.price-item--last').forEach((priceSelector) => priceSelector.innerHTML = formatMoney(compareAtPrice, '{{amount_no_decimals}}'))
      } else {
        item.querySelectorAll('.price-item.price-item--regular').forEach((priceSelector) => priceSelector.innerHTML = formatMoney(price, '{{amount_no_decimals}}'))
        item.classList.remove('price--on-sale');
      }
    })
  }
}

customElements.define('product-card', ProductCard);

class QuickView extends HTMLElement {
  constructor() {
    super();
    this.popup = document.getElementById('quick-view');
  }
  open() {
    this.setAttribute('aria-hidden', false);
    if (document.querySelector("body").getAttribute('data-header-menu') === 'true' ) megaMenu.closeMegaMenu()

    if (modalOverlay.getAttribute('aria-hidden') === 'true') {
      modalOverlay.setAttribute('aria-hidden', 'false');
    }
    document.body.classList.add(`overflow-hidden`);
    this.popup.classList.add('animate', 'active');

    this.popup.addEventListener('transitionend', () => {
      this.popup.focus();
      trapFocus(this.popup);
    }, { once: true });

    document.body.addEventListener('click', this.onBodyClick);
    // this.closeBtn = document.querySelector('.quick-view__close-btn');
    document.querySelector('.quick-view__close-btn')?.addEventListener('click', () => this.close())
    this.updateColorLabel();
  }

  close() {
    this.setAttribute('aria-hidden', true);
    this.popup.classList.remove('active', 'animate');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.removeEventListener('click', this.onBodyClick);
    removeTrapFocus(this.activeElement);
    document.body.classList.remove(`overflow-hidden`);
  }

  fetchSection(productUrl, opener) {
    fetch( productUrl +"&section_id=quick-view")
      .then(response => response.text())
      .then((response) => {
        const productHtml = new DOMParser().parseFromString(response, 'text/html').querySelector('.product').innerHTML;
        document.getElementById('quick-view-inner').innerHTML = productHtml;
        this.open()
        opener.classList.remove('loading');
        opener.removeAttribute('aria-disabled', true);
        opener.removeAttribute('disabled', '');
        opener.querySelector('.loading-overlay__spinner')?.classList.add('hidden');
      });
  }

  updateColorLabel() {
    const colorLabel = document.querySelector('.color-additional-label');
    const colorInputs = document.querySelectorAll('.product-form__option-color input');
    colorInputs.forEach((item) => {
      item.addEventListener('change', () => {
        colorLabel.innerHTML = item.value
      })
    })
  }
}

customElements.define('quick-view', QuickView);

class ReadMore extends HTMLElement {
  constructor() {
    super();
    const readMoreWrapper = this.querySelector('.product__description_read-more');
    const readMoreContent = this.querySelector('.product__description_read-more-content');
    const readMoreBtn = this.querySelector('.product__description_read-more-btn');

    readMoreBtn?.addEventListener('click', () => {
      let contentHeight = readMoreContent.offsetHeight;
      let isExpanded = readMoreWrapper.classList.contains('expanded');

      if (!isExpanded) {
        readMoreWrapper.style.maxHeight = contentHeight + 'px';
        readMoreBtn.innerHTML = 'Show less'
      } else {
        readMoreWrapper.style.maxHeight = '5em';
        readMoreBtn.innerHTML = 'Show more'
      }
      readMoreWrapper.classList.toggle('expanded');
    })
  }

}

customElements.define('read-more', ReadMore);

class Accordion {
  constructor(el) {
    this.el = el;
    this.summary = el.querySelector('summary');
    this.content = el.querySelector('[data-accordion-content]');
    this.animation = null;
    this.isClosing = false;
    this.isExpanding = false;

    this.summary.addEventListener('click', (e) => {
      (Array.from(e.target.classList).indexOf('accordion__event-prevent') > 0) ? e.preventDefault() : this.onClick(e)
    });
  }

  onClick(e) {
    e.preventDefault();
    var parent = e.target.closest('[data-accordion-collapseble]');

    if (parent) {
      parent.querySelectorAll('[data-accordion-opener][open]').forEach((el) => {

        if (el != this.el ) {
          const startHeight = `${el.offsetHeight}px`;
          const endHeight = `${el.querySelector('summary').offsetHeight}px`;

          el.animation = el.animate({
            height: [startHeight, endHeight]
          }, {
            duration: 300,
            easing: 'linear'
          });

          el.animation.onfinish = () => el.removeAttribute('open');
        }
      });
    }

    this.el.style.overflow = 'hidden';
    if (this.isClosing || !this.el.open) {
      this.open();
    } else if (this.isExpanding || this.el.open) {
      this.shrink();
    }
  }

  shrink() {
    this.isClosing = true;
    const startHeight = `${this.el.offsetHeight}px`;
    const endHeight = `${this.summary.offsetHeight}px`;

    if (this.animation) this.animation.cancel()

    this.animation = this.el.animate({
      height: [startHeight, endHeight]
    }, {
      duration: 300,
      easing: 'linear'
    });

    this.animation.onfinish = () => this.onAnimationFinish(false);
    this.animation.oncancel = () => this.isClosing = false;
  }

  open() {
    this.el.style.height = `${this.el.offsetHeight}px`;
    this.el.open = true;
    window.requestAnimationFrame(() => this.expand());
  }

  expand() {
    this.isExpanding = true;
    const startHeight = `${this.el.offsetHeight}px`;
    const endHeight = `${this.summary.offsetHeight + this.content.offsetHeight}px`;

    if (this.animation) this.animation.cancel()

    this.animation = this.el.animate({
      height: [startHeight, endHeight]
    }, {
      duration: 300,
      easing: 'linear'
    });
    this.animation.onfinish = () => this.onAnimationFinish(true);
    this.animation.oncancel = () => this.isExpanding = false;
  }

  onAnimationFinish(open) {
    this.el.open = open;
    this.animation = null;
    this.isClosing = false;
    this.isExpanding = false;
    this.el.style.height = this.el.style.overflow = '';
  }
}

document.querySelectorAll('[data-accordion-opener]').forEach((el) => {
  new Accordion(el);
});

class sendFormKlaviyo extends HTMLElement {
  constructor() {
    super();

    this.companyId = 'XyRtPP'
    this.form = this.querySelector('form');
    this.btnSendForm = this.querySelector('[data-email-btn-send]');
    this.first_name = this.querySelector('input[data-field="name"]');
    this.email = this.querySelector('input[data-field="email"]');
    this.phone_number = this.querySelector('input[data-field="phone"]');
    this.reason = this.querySelector('select[data-field="reason"]');
    this.preference = this.querySelector('select[data-field="preference"]');
    this.listSelector = this.querySelector('select[data-field="list-selector"]');
    this.question = this.querySelector('select[data-field="question"]');
    this.birthday = this.querySelector('input[data-field="birthday"]');
    this.order = this.querySelector('input[data-field="order"]');
    this.message = this.querySelector('textarea[data-field="message"]');
    this.klaviyoListId = this.getAttribute('data-klaviyo-list-id');
    this.source = this.getAttribute('data-source');
    this.formMessageSuccess = this.querySelector('.form__message--success');
    this.formMessageError = this.querySelector('.form__message--error');
    this.errorMessage = '';

    this.init()
  }

  init() {
    this.optionalElementsEvents();
    this.sendFormKlaviyo();
  }

  optionalElementsEvents() {
    if (this.birthday) {
      this.birthday.addEventListener('keypress', (e) => {
        if (e.keyCode < 47 || e.keyCode > 57) e.preventDefault();
        let len = this.birthday.value.length;
        if (len !== 1 || len !== 3) {
          if (e.keyCode === 47) e.preventDefault();
        }
        if (len === 2) this.birthday.value += '/';
        if (len === 5) this.birthday.value += '/';
      });
    }

    if (this.listSelector) {
      this.listSelector.addEventListener('change', (e) => {
        this.setAttribute('data-klaviyo-list-id', this.listSelector.value)
        this.klaviyoListId = this.listSelector.value
      })
    }
  }

  sendFormKlaviyo () {
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.sendRequest();
      console.log('Klaviyo form submited!')
    });
  }

  async sendRequest() {

    const profileData = {
      type: 'profile',
      attributes: {
        organization: Shopify.shop,
        properties: this.getProperties(),
      }
    }

    const listOfAttributes = ['first_name', 'email', 'phone_number'];

    for (const attribute of listOfAttributes) {
      if (this[attribute] && this[attribute].value) {
        profileData.attributes[attribute] = this[attribute].value;
      }
    }

    const config = {
      method: 'POST',
      headers: {revision: '2023-10-15', 'content-type': 'application/json'},
      body: JSON.stringify({
        data: {
          type: 'subscription',
          attributes: {
            custom_source: (this.source) ? this.source : 'Klaviyo form',
            profile: {
              data: profileData
            }
          },
          relationships: {list: {data: {type: 'list', id: this.klaviyoListId}}}
        }
      })
    };

    try {
      const response = await fetch(`https://a.klaviyo.com/client/subscriptions/?company_id=${this.companyId}`, config);
      if (response.status === 202) {
        this.showSuccess();
      } else {
        const error = await response.json();
        this.showError(error);
      }
    } catch (error) {
      this.showError(error);
      console.error(error);
    }
  }

  getProperties() {
    const properties = {}
    const propertiesFildList = Array
        .from(this.querySelectorAll('[data-field]'))
        .filter(field => field.dataset.properties === 'true');
    if (!propertiesFildList.length) return properties;

    propertiesFildList.forEach(field => {
      const fieldKey = field.dataset.field;
      const fieldValue = field.value ? field.value : '';
      if (fieldKey !== '') properties[`${fieldKey}`] = fieldValue;
    })
    return properties;
  }

  showSuccess() {
    if (this.formMessageSuccess) {
      this.formMessageSuccess.classList.remove('hidden')
      this.form.reset();

      setTimeout(() => {
        this.formMessageSuccess.classList.add('hidden')
      }, 4500);
    }

    const announcementBar = document.getElementById('shopify-section-announcement-bar') || document.getElementById('shopify-section-announcement-scrolling-bar');

    if (this.form.getAttribute('id') === 'newsletter-form') {
      document.getElementById('NewsletterModal').hide();
      document.getElementById('NewsletterPopup').setAttribute('aria-hidden', 'true');
      if (announcementBar) announcementBar.style.zIndex = '4';
      setTimeout(() => {
        document.querySelector('.newsletter__message--success-wrapper').classList.remove('hidden-success')
      }, 500);

      setTimeout(() => {
        document.querySelector('.newsletter__message--success-wrapper').classList.add('hidden-success');
        if (announcementBar) announcementBar.removeAttribute('style');
      }, 5000);
    }
  }

  showError(error) {
    window.formStrings.errorMessage.includes("&#39;")
        ? this.errorMessage = window.formStrings.errorMessage.replace('&#39;', "'")
        : this.errorMessage = window.formStrings.errorMessage;
    this.btnSendForm.classList.add('error')
    this.btnSendForm.textContent = this.errorMessage;

    if (this.formMessageError) {
      this.formMessageError.classList.remove('hidden');
    }

    setTimeout(() => {
      this.btnSendForm.classList.remove('error')
      if (this.form.getAttribute('id') === 'newsletter-form') {
        this.btnSendForm.textContent = window.formStrings.signUp;
      } else {
        this.btnSendForm.textContent = window.formStrings.sendMessage;
      }
      this.formMessageError.classList.add('hidden');
    }, 4500);
  }
}

customElements.define('form-klaviyo', sendFormKlaviyo);

class imagesWithFeatures extends HTMLElement {
  constructor() {
    super();
    this.container = this.querySelector("#features-images");
    this.draggableElement = this.querySelector("#draggable-element");
    this.draggableBlock  = this.querySelector('[data-draggable-image]');
    this.draggableImage  = this.draggableBlock.querySelector('img');
    this.contentFirst = this.querySelector("[data-content-position='1']");
    this.contentSecond = this.querySelector("[data-content-position='2']");

    this.x = 0;
    this.pressed = false;
    this.elementOffsetX = 0;
    this.containerWidth = this.container.offsetWidth;
    this.percentLeftPos = 50;

    if (this.draggableBlock) {
      this.draggableElement.addEventListener("mousedown", this.handleMouseDown.bind(this));
      document.addEventListener("mouseup", this.handleMouseUp.bind(this));
      document.addEventListener("mousemove", this.handleMouseMove.bind(this));

      this.draggableElement.addEventListener("touchend", this.handleMouseUp.bind(this));
      this.draggableElement.addEventListener("touchmove", this.handleMouseMove.bind(this));
    }
  }

  showHideContent(draggablePosition) {
    if (draggablePosition >= 50) {
      this.contentFirst.classList.add('flip-in-hor-top')
      this.contentSecond.classList.remove('flip-in-hor-top')
    } else {
      this.contentSecond.classList.add('flip-in-hor-top')
      this.contentFirst.classList.remove('flip-in-hor-top')
    }
  }

  handleMouseDown() {
    this.containerWidth = this.container.offsetWidth;
    this.pressed = true;
    this.elementOffsetX = this.x - this.draggableElement.offsetLeft;
    this.percentLeftPos = ((this.x - this.elementOffsetX) * 100) / this.containerWidth;
    this.draggableElement.style.left = this.percentLeftPos + "%";
    this.draggableBlock.style.transform = `translateX(${this.percentLeftPos}%)`;
    this.draggableImage.style.transform = `translateX(-${this.percentLeftPos}%)`;
  }

  handleMouseUp() {
    this.pressed = false;
  }

  handleMouseMove(event) {
    this.x = (window.checkMobile()) ? event.targetTouches[0].clientX : event.clientX;
    if (window.checkMobile()) this.pressed = true;
    this.containerWidth = this.container.offsetWidth;
    this.percentLeftPos = ((this.x - this.elementOffsetX) * 100) / this.containerWidth;

    if (this.pressed) {

      if (this.percentLeftPos > 100) {
        this.percentLeftPos = 100
      } else if (this.percentLeftPos < 0) {
        this.percentLeftPos = 0
      }

      this.draggableElement.style.left = this.percentLeftPos + "%";
      this.draggableBlock.style.transform = `translateX(${this.percentLeftPos}%)`;
      this.draggableImage.style.transform = `translateX(-${this.percentLeftPos}%)`;
      if (this.contentSecond) setTimeout(() => this.showHideContent(this.percentLeftPos), 1000)
    }

  }
}

customElements.define('images-with-features', imagesWithFeatures);

class modalBlock extends HTMLElement {
  constructor() {
    super();
    this.buttons = this.querySelectorAll('[data-btn-opener]');
    this.inputs = this.querySelectorAll('.form__input');
    this.parentModat = document.querySelector('#AccountModal');
    this.modalBlockToggle();
    this.checkingResponse();
    this.inputsEvents();
  }

  modalBlockToggle () {
    this.buttons.forEach(element => {
      element.addEventListener('click',(e) => {
        e.target.closest('[data-btn-content]').classList.add('hidden-block');
        e.target.closest('[data-btn-content]').setAttribute('aria-hidden', 'true');
        this.querySelector(`${e.target.getAttribute('data-block')}[data-btn-content]`).classList.remove('hidden-block')
        this.querySelector(`${e.target.getAttribute('data-block')}[data-btn-content]`).setAttribute('aria-hidden', 'false');
        this.clearResponse();
      });
    });
  }

  checkingResponse (searchParams = null) {
    let params = new URLSearchParams(searchParams || window.location.search);
    
    let hideModalBlockLogIn = () => {
      this.querySelector('#account__modal--login')?.classList.add('hidden-block');
      this.querySelector('#account__modal--login')?.setAttribute('aria-hidden', 'true');
    }

    let hideModalBlockCreate = () => {
      this.querySelector('#account__modal--create')?.classList.add('hidden-block');
      this.querySelector('#account__modal--create')?.setAttribute('aria-hidden', 'true');
    }

    let showModalBlock = (elementName) => {
      this.querySelector(`${elementName}`)?.classList.remove('hidden-block');
      this.querySelector(`${elementName}`)?.setAttribute('aria-hidden', 'false');
    }

    let showErrorMassage = (elementName) => {
      this.querySelector(`${elementName} .form__message--error`)?.classList.add('show');
      this.querySelector(`${elementName} .form__message--error`)?.append(`${params.get('form-message')}`);
      this.querySelector(`${elementName} button[type="submit"]`)?.classList.add('error');
    }

    let showSuccessMassage = (elementName) => {
      this.querySelector(`${elementName} .form__message--success`).classList.add('show');
    }

    if (params.get('redirect-from') === 'login' ) {
      this.parentModat.show();
      params.delete('redirect-from');
      const paramString = params.toString();
      const checkoutUrl = params.get('checkout_url') || '';
      const newParams = paramString.length ? `${checkoutUrl}/?${paramString}` : '/';
      //window.history.pushState({}, document.title, newParams);
    }
    
    if (params.get('login') === 'false' ) {
      this.parentModat.show();
      showErrorMassage('#account__modal--login');
      this.setCheckoutLoginParams();
    } else if (params.get('login') === 'true' ) {
      this.setCheckoutLoginParams();
      this.parentModat.show();
      hideModalBlockCreate();
      showModalBlock('.account__modal_block#account__modal--login');
    } else if (params.get('recover') === 'true' ) {
      this.parentModat.show();
      showSuccessMassage('#account__modal--login');
    } else if (params.get('recover') === 'false' ) {
      this.parentModat.show();
      hideModalBlockLogIn();
      showModalBlock('.account__modal_block#account__modal--recover');
      showErrorMassage('#account__modal--recover');
    }  else if (params.get('create') === 'true' ) {
      this.parentModat.show();
      hideModalBlockLogIn();
      showModalBlock('.account__modal_block#account__modal--create');
    }  else if (params.get('create') === 'false' ) {
      this.setCheckoutLoginParams();
      this.parentModat.show();
      hideModalBlockLogIn();
      showModalBlock('.account__modal_block#account__modal--create');
      showErrorMassage('#account__modal--create');
    }
  }

  setCheckoutLoginParams() {
    if (sessionStorage.getItem('checkout_login_url')) {
      const form = this.querySelector('#account__modal--login').querySelector('#customer_login[action="/account/login"]');
      form.setAttribute('action', `/account/login?checkout_url=${sessionStorage.getItem('checkout_login_url')}`);
      console.log(`set -- ${window.location.href}`)
      sessionStorage.removeItem('checkout_login_url')
    }
  }

  clearResponse () {
    if (!this.querySelector(`.form__message.show`) && !this.querySelector(`button[type="submit"].error`)) return false;

    this.querySelector(`.form__message.show`).classList.remove('show');
    this.querySelector(`button[type="submit"].error`).classList.remove('error');
  }

  inputsEvents() {
    this.inputs.forEach(element => {
      element.addEventListener('input', (e) => {
        if (!e.target.closest('.account__modal_block').classList.contains('hidden-block')) {
          this.clearResponse();
        }
      });
    });
  }
}

customElements.define('modal-block', modalBlock);

class InstaFeed extends HTMLElement {
  constructor() {
    super();
    this.instaFeed = this.querySelector('#insta-feed');
    this.progressBar = this.querySelector('#bar');
    this.instaFeed.addEventListener('scroll', this.instaFeedScroll.bind(this));
  }

  instaFeedScroll () {
    let instaScrollPosition = this.instaFeed.scrollLeft,
        instaWight = this.instaFeed.clientHeight,
        instaScrollWight = this.instaFeed.scrollWidth - instaWight,
        scrolled = (instaScrollPosition * 100) / instaScrollWight,
        progressWight = (scrolled < 10) ? 10 : scrolled;
    this.progressBar.style.width = progressWight + "%";
  }
}

customElements.define('insta-feed', InstaFeed);

class FindStore extends HTMLElement {
  constructor() {
    super();
    this.allStores = this.querySelectorAll('.find-store__item');
    this.allZipCodes = window.allStoresZipCodes;
    this.zipSelector = this.querySelector('.find-store__by-zip');
    this.citySelector = this.querySelector('.find-store__by-city');
    this.firstZipPoint = this.zipSelector.getAttribute('data-first-zip-point') || null;

    if (this.firstZipPoint) {
      if (!sessionStorage.getItem('defaultZipCodeApi')) {
        this.zipCodeApiCall(this.firstZipPoint, true)
      } else {
        let find_location = (this.firstZipPoint.length <= 5) ? 'usa' : 'canada';
        this.filterStoresByZipCode(sessionStorage.getItem('defaultZipCodeApi'), find_location)
      }
    }
  }

  zipCodeApiCall (zipCode, saveDefaultZipApi) {
    let url = `https://www.zipcodeapi.com/rest/js-xkdfVfPmMcOVhsCuym3bgcIj2yTfYr21tH65pAsZJlFA2E92ND0d4zygm5HVtjBD/radius.json/${zipCode}/25/mile`,
        location = 'usa';

    if (zipCode.length > 5) {
      url = `http://www.zipcodeapi.com/rest/v2/CA/js-xkdfVfPmMcOVhsCuym3bgcIj2yTfYr21tH65pAsZJlFA2E92ND0d4zygm5HVtjBD/radius.json/${zipCode}/25/mile`;
      location = 'canada';
    }

    if (sessionStorage.getItem('ZipCode') === zipCode && sessionStorage.getItem('ZipCodeApiJson')) {
      this.filterStoresByZipCode(sessionStorage.getItem('ZipCodeApiJson'), location)
      return
    }

    fetch(url, {
      "method": "GET"
    }).then(response => {
      return response.text();
    }).then(data => {
      sessionStorage.setItem('ZipCodeApiJson', data)
      sessionStorage.setItem('ZipCode', zipCode)
      this.filterStoresByZipCode(data, location)
      if (saveDefaultZipApi) sessionStorage.setItem('defaultZipCodeApi', data);
    })
  }

  filterStoresByZipCode(data, location) {
    const responseJson = JSON.parse(data);
    let responseZipArray, nearestZipStores;

    if (location === 'usa') {
      responseZipArray = responseJson.zip_codes.map(item => item.zip_code);
      nearestZipStores = responseZipArray.filter(item => this.allZipCodes.includes(item));
    } else if (location === 'canada') {
      responseZipArray = responseJson.postal_codes.map(item => item.postal_code.replace(/\s/g, ''));
      nearestZipStores = responseZipArray.filter(item => this.allZipCodes.includes(item));
    }

    this.allStores.forEach((item, index) => {
      const itemZip = item.getAttribute('data-zip');
      if (nearestZipStores.includes(itemZip)) {
        item.classList.add('is-visible');
        item.setAttribute('data-show-by-zip', 'true');
      } else {
        item.classList.remove('is-visible');
        item.setAttribute('data-show-by-zip', 'false');
      }
    })
    if (this.citySelector) {
      this.citySelector.querySelector('input').value = ''
      this.citySelector.querySelector('input-autocomplete').inputWidth()
    }
  }

  filterStoresByCity(city) {
    this.allStores.forEach((item, index) => {
      const itemCity = item.getAttribute('data-city');
      if (itemCity === city) {
        item.classList.add('is-visible');
        item.setAttribute('data-show-by-city', 'true');
      } else {
        item.classList.remove('is-visible');
        item.setAttribute('data-show-by-city', 'false');
      }
    })
    if (this.zipSelector) {
      this.zipSelector.querySelector('input').value = ''
      this.zipSelector.querySelector('input-autocomplete').inputWidth()
    }
  }
}

customElements.define('find-store', FindStore);

class InputAutocomplete extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.searchTerms = window[this.getAttribute('data-search-terms')];
    this.results = this.querySelector('.result');
    this.fakeEl = this.querySelector('.fake-element');
    this.input.addEventListener('keyup', (e) => {
      this.inputWidth()
      this.showResults()
      if (e.which === 13) {
        if (e.target.closest('input-autocomplete').getAttribute('data-find-by') === 'city') {
          e.target.closest('find-store').filterStoresByCity(window.handleize(this.input.value))
        } else {
          e.target.closest('find-store').zipCodeApiCall(window.handleize(this.input.value), false)
        }
      }
    });
    document.addEventListener('click', (e) => {
      (e.target.offsetParent !== this) ? this.hideResults() : this.showResults()
    })
    this.inputWidth()
  }

  inputWidth() {
    let string = '';
    if (this.input.value.length < this.input.getAttribute('placeholder').length) {
      string = this.input.getAttribute('placeholder');
    } else {
      string = this.input.value;
    }
    this.fakeEl.innerHTML = string.replace(/\s/g, '&' + 'nbsp;');
    this.input.style.width = this.fakeEl.offsetWidth + 5 + 'px';
  }

  autocompleteMatch() {
    if (this.input.value === '') {
      return [];
    }
    var searchValue = this.input.value.toLocaleLowerCase();
    return this.searchTerms.filter(function(term) {
      if (term.toLowerCase().indexOf(searchValue) !== -1) {
        return term;
      }
    });
  }

  showResults() {
    this.inputWidth()
    this.results.innerHTML = '';
    let list = '';
    let terms = this.autocompleteMatch();
    for (let i=0; i<terms.length; i++) {
      list += `<li data-option-value="${window.handleize(terms[i])}">${terms[i]}</li>`;
    }
    this.results.innerHTML = '<ul>' + list + '</ul>';
    this.results.classList.add('show-results');
    if (terms.length) this.findStores()
  }

  findStores() {
    let resultItem = this.results.querySelectorAll('li');
    resultItem.forEach((item) => {
      item.addEventListener('click', (e) => {
        let searchValue = item.getAttribute('data-option-value')
        this.input.value = searchValue;
        this.inputWidth()
        if (e.target.closest('input-autocomplete').getAttribute('data-find-by') === 'city') {
          e.target.closest('find-store').filterStoresByCity(searchValue)
        } else {
          e.target.closest('find-store').zipCodeApiCall(searchValue, false)
        }
      })
    })
  }

  hideResults() {
    this.results.classList.remove('show-results');
  }
}

customElements.define('input-autocomplete', InputAutocomplete);

class ToggleTabs extends HTMLElement {
  // Required button element: data-selected='true/false'; aria-controls='TAB_ID'; data-action='toggle-tab'
  // Required tab element: data-selected='true/false'; data-tab='TAB_ID'
  constructor() {
    super();
    this.buttons = this.querySelectorAll('[data-action="toggle-tab"]')
    this.tabs = this.querySelectorAll('[data-tab]')

    this.buttons.forEach(button => {
      button.addEventListener('click', ()=> this.toggleTab(button))
    })
  }

  toggleTab(button) {
    if (button.dataset.selected === 'true') return
    const tabId = button.getAttribute('aria-controls'),
        tabToShow = Array.from(this.tabs).find(tab => tab.id === tabId);
    this.buttons.forEach(el => el.dataset.selected = 'false')
    this.tabs.forEach(tab => tab.dataset.selected = 'false')
    button.dataset.selected = 'true'
    tabToShow.dataset.selected = 'true'
  }
}

customElements.define('toggle-tabs', ToggleTabs);

class Countdown extends HTMLElement {
  constructor() {
    super();
    this.days = this.querySelector('.countdown__timer-days');
    this.hours = this.querySelector('.countdown__timer-hours');
    this.minutes = this.querySelector('.countdown__timer-minutes');
    this.seconds = this.querySelector('.countdown__timer-seconds');
    this.countdownTimer()
  }

  timerText(period, periodName) {
    const number = (period < 10) ? '0' + period : period,
        separator = (periodName !== 'sec') ? ' :' : '',
        text = number + ' ' + periodName + separator;
    return ((number === '00' && periodName === 'days') ? '' : text)
  }

  countdownTimer() {
    const second = 1000,
        minute = second * 60,
        hour = minute * 60,
        day = hour * 24;

    const endDate = this.dataset.endDate,
        countDown = new Date(endDate).getTime(),
        x = setInterval(() => {

          const now = new Date().getTime(),
              distance = countDown - now,
              days = Math.floor(distance / (day)),
              hours = Math.floor((distance % (day)) / (hour)),
              minutes = Math.floor((distance % (hour)) / (minute)),
              seconds = Math.floor((distance % (minute)) / second);

          this.querySelector('.days').innerHTML = this.timerText(days, 'days')
          this.querySelector('.hours').innerHTML = this.timerText(hours, 'hrs')
          this.querySelector('.minutes').innerHTML = this.timerText(minutes, 'min')
          this.querySelector('.seconds').innerHTML = this.timerText(seconds, 'sec')

          //do something later when date is reached
          if (distance < 0) {
            this.style.display = 'none';
            clearInterval(x);
          }
          //seconds
        }, 1000)
    this.style.display = 'block'
  }
}

customElements.define('countdown-timer', Countdown);

class ActiveLink extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('mouseover', () => {
      if (!this.hasAttribute('active')) this.addActiveClass();
    })
    if (this.hasAttribute('remove-after-out')) {
      this.addEventListener('mouseout', () => this.removeActiveClass());
    }
  }

  addActiveClass () {
    this.removeActiveClass();
    this.setAttribute('active', '')
  }

  removeActiveClass () {
    document.querySelectorAll('active-link')?.forEach(item => item.removeAttribute('active'))
  }
}

customElements.define('active-link', ActiveLink);

class CollapseLink extends HTMLElement {
  constructor() {
    super();
    const linkOpener = this.querySelector('.header__menu-item');
    let timeoutId;
    if (window.innerWidth > 1024) {
      this.addEventListener('mouseover', this.addClassWithTimeOut);
      this.addEventListener('mouseout', this.removeClassAndClearTimeout);
    } else if (window.innerWidth <= 1024) {
      linkOpener.addEventListener('click', () => {
        if (this.hasAttribute('active')) {
          this.removeAttribute('active');
        } else {
          this.addActiveClass()
        }
      })
    }
  }

  addClassWithTimeOut () {
    this.timeoutId = setTimeout(() => {
      if (!this.hasAttribute('active')) {
        this.addActiveClass()
      }
    }, 350);
  }

  removeClassAndClearTimeout () {
    clearTimeout(this.timeoutId);
    if (!this.hasAttribute('active')) {
      this.removeAttribute('active')
    }
  }

  addActiveClass () {
    this.removeActiveClass();
    this.setAttribute('active', '')
  }

  removeActiveClass () {
    document.querySelectorAll('collapse-link')?.forEach(item => item.removeAttribute('active'))
  }
}

customElements.define('collapse-link', CollapseLink);

class ShopableSection extends HTMLElement {
  constructor() {
    super();
    this.pointerBtns = this.querySelectorAll('.shopoble-image__btn');
    this.pointerMobileBtns = this.querySelectorAll('.shopoble-image__mobile-btn');
    this.slider = this.querySelector('slideshow-swiper .swiper');
    this.quickViewPopup = document.querySelector('quick-view');

    this.pointerBtns?.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        this.removeActiveClass();
        btn.classList.add('shopoble-image__btn-selected');
        this.slider.swiper.slideTo(index, 300, false)
      })
    })

    this.pointerMobileBtns?.forEach((btn) => {
      btn.addEventListener('click', () => {
        const productUrl = btn.getAttribute('data-product');
        btn.setAttribute('aria-disabled', true);
        btn.setAttribute('disabled', '');
        this.quickViewPopup.fetchSection(productUrl, btn);
      })
    })
  }

  removeActiveClass () {
    this.pointerBtns?.forEach(btn => btn.classList.remove('shopoble-image__btn-selected'))
  }
}

customElements.define('shopable-section', ShopableSection);


if (!customElements.get('product-model')) {
  customElements.define(
    'product-model',
    class ProductModel extends DeferredMedia {
      constructor() {
        super();

        console.log(this)
      }

      loadContent() {
        super.loadContent();

        Shopify.loadFeatures([
          {
            name: 'model-viewer-ui',
            version: '1.0',
            onLoad: this.setupModelViewerUI.bind(this),
          },
        ]);
      }

      setupModelViewerUI(errors) {
        if (errors) return;

        this.modelViewerUI = new Shopify.ModelViewerUI(this.querySelector('model-viewer'));
      }
    }
  );
}

window.ProductModel = {
  loadShopifyXR() {
    Shopify.loadFeatures([
      {
        name: 'shopify-xr',
        version: '1.0',
        onLoad: this.setupShopifyXR.bind(this),
      },
    ]);
  },

  setupShopifyXR(errors) {
    if (errors) return;

    if (!window.ShopifyXR) {
      document.addEventListener('shopify_xr_initialized', () => this.setupShopifyXR());
      return;
    }

    document.querySelectorAll('[id^="ProductJSON-"]').forEach((modelJSON) => {
      window.ShopifyXR.addModels(JSON.parse(modelJSON.textContent));
      modelJSON.remove();
    });
    window.ShopifyXR.setupXRElements();
  },
};

window.addEventListener('DOMContentLoaded', () => {
  if (window.ProductModel) window.ProductModel.loadShopifyXR();
});


class VideoComponent extends HTMLElement {
  constructor() {
    super();
    this.options = JSON.parse(this.dataset.videoOptions);
    if (!this.options['videoType']) return

    this.playBtn = this.querySelector('.js-video-play-button')
    this.pauseBtn = this.querySelector('.js-video-pause-button')
    this.muteBtn = this.querySelector('.js-video-mute-button')
    this.unMuteBtn = this.querySelector('.js-video-unmute-button')
    this.customVideo = this.querySelector('video')

    if (this.customVideo) this.onPlayerReady()

    this.initEvents();
  }

  initEvents() {
    if (this.playBtn) this.playBtn.addEventListener('click', () => this.playerPlay())
    if (this.pauseBtn) this.pauseBtn.addEventListener('click', () => this.playerPause())
    if (this.muteBtn) this.muteBtn.addEventListener('click', () => this.playerMute())
    if (this.unMuteBtn) this.unMuteBtn.addEventListener('click', () => this.playerUnMute())
  }

  onPlayerReady() {
    if (this.options['autoplay']) this.autoPlay()
    this.classList.add('is-loaded');
  }

  autoPlay() {
    this.playerMute()
    this.playerPlay()
    this.classList.add('is-playing')
  }

  playerPlay() {
    if (this.customVideo) {
      this.customVideo.play()
    }
    this.classList.add('is-playing')
  }

  playerPause() {
    if (this.customVideo) {
      this.customVideo.pause()
    }
    this.classList.remove('is-playing')
  }

  playerMute() {
    if (this.customVideo) {
      this.customVideo.muted = true;
    }
    this.classList.add('is-muted')
  }

  playerUnMute() {
    if (this.customVideo) {
      this.customVideo.muted = false;
    }
    this.classList.remove('is-muted')
  }
}

customElements.define('video-component', VideoComponent);


