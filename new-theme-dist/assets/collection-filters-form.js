(function () {
  'use strict';

  function isVisible(el) {
    var style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  /**
   * A11y Helpers
   * -----------------------------------------------------------------------------
   * A collection of useful functions that help make your theme more accessible
   */

  /**
   * Moves focus to an HTML element
   * eg for In-page links, after scroll, focus shifts to content area so that
   * next `tab` is where user expects. Used in bindInPageLinks()
   * eg move focus to a modal that is opened. Used in trapFocus()
   *
   * @param {Element} container - Container DOM element to trap focus inside of
   * @param {Object} options - Settings unique to your theme
   * @param {string} options.className - Class name to apply to element on focus.
   */
  function forceFocus(element, options) {
    options = options || {};

    var savedTabIndex = element.tabIndex;

    element.tabIndex = -1;
    element.dataset.tabIndex = savedTabIndex;
    element.focus();
    if (typeof options.className !== 'undefined') {
      element.classList.add(options.className);
    }
    element.addEventListener('blur', callback);

    function callback(event) {
      event.target.removeEventListener(event.type, callback);

      element.tabIndex = savedTabIndex;
      delete element.dataset.tabIndex;
      if (typeof options.className !== 'undefined') {
        element.classList.remove(options.className);
      }
    }
  }

  /**
   * If there's a hash in the url, focus the appropriate element
   * This compensates for older browsers that do not move keyboard focus to anchor links.
   * Recommendation: To be called once the page in loaded.
   *
   * @param {Object} options - Settings unique to your theme
   * @param {string} options.className - Class name to apply to element on focus.
   * @param {string} options.ignore - Selector for elements to not include.
   */

  function focusHash(options) {
    options = options || {};
    var hash = window.location.hash;
    var element = document.getElementById(hash.slice(1));

    // if we are to ignore this element, early return
    if (element && options.ignore && element.matches(options.ignore)) {
      return false;
    }

    if (hash && element) {
      forceFocus(element, options);
    }
  }

  /**
   * When an in-page (url w/hash) link is clicked, focus the appropriate element
   * This compensates for older browsers that do not move keyboard focus to anchor links.
   * Recommendation: To be called once the page in loaded.
   *
   * @param {Object} options - Settings unique to your theme
   * @param {string} options.className - Class name to apply to element on focus.
   * @param {string} options.ignore - CSS selector for elements to not include.
   */

  function bindInPageLinks(options) {
    options = options || {};
    var links = Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]'));

    function queryCheck(selector) {
      return document.getElementById(selector) !== null;
    }

    return links.filter(function (link) {
      if (link.hash === '#' || link.hash === '') {
        return false;
      }

      if (options.ignore && link.matches(options.ignore)) {
        return false;
      }

      if (!queryCheck(link.hash.substr(1))) {
        return false;
      }

      var element = document.querySelector(link.hash);

      if (!element) {
        return false;
      }

      link.addEventListener('click', function () {
        forceFocus(element, options);
      });

      return true;
    });
  }

  function focusable(container) {
    var elements = Array.prototype.slice.call(
      container.querySelectorAll('[tabindex],' + '[draggable],' + 'a[href],' + 'area,' + 'button:enabled,' + 'input:not([type=hidden]):enabled,' + 'object,' + 'select:enabled,' + 'textarea:enabled')
    );

    // Filter out elements that are not visible.
    // Copied from jQuery https://github.com/jquery/jquery/blob/2d4f53416e5f74fa98e0c1d66b6f3c285a12f0ce/src/css/hiddenVisibleSelectors.js
    return elements.filter(function (element) {
      return !!((element.offsetWidth || element.offsetHeight || element.getClientRects().length) && isVisible(element));
    });
  }

  /**
   * Traps the focus in a particular container
   *
   * @param {Element} container - Container DOM element to trap focus inside of
   * @param {Element} elementToFocus - Element to be focused on first
   * @param {Object} options - Settings unique to your theme
   * @param {string} options.className - Class name to apply to element on focus.
   */

  var trapFocusHandlers = {};

  function trapFocus(container, options) {
    options = options || {};
    var elements = focusable(container);
    var elementToFocus = options.elementToFocus || container;
    var first = elements[0];
    var last = elements[elements.length - 1];

    removeTrapFocus();

    trapFocusHandlers.focusin = function (event) {
      if (container !== event.target && !container.contains(event.target) && first && first === event.target) {
        first.focus();
      }

      if (event.target !== container && event.target !== last && event.target !== first) return;
      document.addEventListener('keydown', trapFocusHandlers.keydown);
    };

    trapFocusHandlers.focusout = function () {
      document.removeEventListener('keydown', trapFocusHandlers.keydown);
    };

    trapFocusHandlers.keydown = function (event) {
      if (event.code !== 'Tab') return; // If not TAB key

      // On the last focusable element and tab forward, focus the first element.
      if (event.target === last && !event.shiftKey) {
        event.preventDefault();
        first.focus();
      }

      //  On the first focusable element and tab backward, focus the last element.
      if ((event.target === container || event.target === first) && event.shiftKey) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener('focusout', trapFocusHandlers.focusout);
    document.addEventListener('focusin', trapFocusHandlers.focusin);

    forceFocus(elementToFocus, options);
  }

  /**
   * Removes the trap of focus from the page
   */
  function removeTrapFocus() {
    document.removeEventListener('focusin', trapFocusHandlers.focusin);
    document.removeEventListener('focusout', trapFocusHandlers.focusout);
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  }

  /**
   * Auto focus the last element
   */
  function autoFocusLastElement() {
    if (window.a11y.lastElement && document.body.classList.contains('is-focused')) {
      setTimeout(() => {
        window.a11y.lastElement?.focus();
      });
    }
  }

  /**
   * Add a preventive message to external links and links that open to a new window.
   * @param {string} elements - Specific elements to be targeted
   * @param {object} options.messages - Custom messages to overwrite with keys: newWindow, external, newWindowExternal
   * @param {string} options.messages.newWindow - When the link opens in a new window (e.g. target="_blank")
   * @param {string} options.messages.external - When the link is to a different host domain.
   * @param {string} options.messages.newWindowExternal - When the link is to a different host domain and opens in a new window.
   * @param {object} options.prefix - Prefix to namespace "id" of the messages
   */
  function accessibleLinks(elements, options) {
    if (typeof elements !== 'string') {
      throw new TypeError(elements + ' is not a String.');
    }

    elements = document.querySelectorAll(elements);

    if (elements.length === 0) {
      return;
    }

    options = options || {};
    options.messages = options.messages || {};

    var messages = {
      newWindow: options.messages.newWindow || 'Opens in a new window.',
      external: options.messages.external || 'Opens external website.',
      newWindowExternal: options.messages.newWindowExternal || 'Opens external website in a new window.',
    };

    var prefix = options.prefix || 'a11y';

    var messageSelectors = {
      newWindow: prefix + '-new-window-message',
      external: prefix + '-external-message',
      newWindowExternal: prefix + '-new-window-external-message',
    };

    function generateHTML(messages) {
      var container = document.createElement('ul');
      var htmlMessages = Object.keys(messages).reduce(function (html, key) {
        return (html += '<li id=' + messageSelectors[key] + '>' + messages[key] + '</li>');
      }, '');

      container.setAttribute('hidden', true);
      container.innerHTML = htmlMessages;

      document.body.appendChild(container);
    }

    function externalSite(link) {
      return link.hostname !== window.location.hostname;
    }

    elements.forEach(function (link) {
      var target = link.getAttribute('target');
      var rel = link.getAttribute('rel');
      var isExternal = externalSite(link);
      var isTargetBlank = target === '_blank';
      var missingRelNoopener = rel === null || rel.indexOf('noopener') === -1;

      if (isTargetBlank && missingRelNoopener) {
        var relValue = rel === null ? 'noopener' : rel + ' noopener';
        link.setAttribute('rel', relValue);
      }

      if (isExternal && isTargetBlank) {
        link.setAttribute('aria-describedby', messageSelectors.newWindowExternal);
      } else if (isExternal) {
        link.setAttribute('aria-describedby', messageSelectors.external);
      } else if (isTargetBlank) {
        link.setAttribute('aria-describedby', messageSelectors.newWindow);
      }
    });

    generateHTML(messages);
  }

  var a11y = /*#__PURE__*/Object.freeze({
    __proto__: null,
    forceFocus: forceFocus,
    focusHash: focusHash,
    bindInPageLinks: bindInPageLinks,
    focusable: focusable,
    trapFocus: trapFocus,
    removeTrapFocus: removeTrapFocus,
    autoFocusLastElement: autoFocusLastElement,
    accessibleLinks: accessibleLinks
  });

  function debounce(fn, time) {
    let timeout;
    return function () {
      // eslint-disable-next-line prefer-rest-params
      if (fn) {
        const functionCall = () => fn.apply(this, arguments);
        clearTimeout(timeout);
        timeout = setTimeout(functionCall, time);
      }
    };
  }

  function getWindowWidth() {
    return document.documentElement.clientWidth || document.body.clientWidth || window.innerWidth;
  }

  function isMobile() {
    return getWindowWidth() < window.theme.sizes.small;
  }

  getScreenOrientation();
  window.initialWindowHeight = Math.min(window.screen.height, window.innerHeight);

  function readHeights() {
    const h = {};
    h.windowHeight = Math.min(window.screen.height, window.innerHeight);
    h.footerHeight = getHeight('[data-section-type*="footer"]');
    h.headerHeight = getHeight('[data-header-height]');
    h.stickyHeaderHeight = document.querySelector('[data-header-sticky]') ? h.headerHeight : 0;
    h.collectionNavHeight = getHeight('[data-collection-nav]');
    h.logoHeight = getFooterLogoWithPadding();

    return h;
  }

  function getScreenOrientation() {
    if (window.matchMedia('(orientation: portrait)').matches) {
      return 'portrait';
    }

    if (window.matchMedia('(orientation: landscape)').matches) {
      return 'landscape';
    }
  }

  function getHeight(selector) {
    const el = document.querySelector(selector);
    if (el) {
      return el.offsetHeight;
    } else {
      return 0;
    }
  }

  function getFooterLogoWithPadding() {
    const height = getHeight('[data-footer-logo]');
    if (height > 0) {
      return height + 20;
    } else {
      return 0;
    }
  }

  const scrollTo = (elementTop) => {
    /* Sticky header check */
    let {stickyHeaderHeight} = readHeights();

    window.scrollTo({
      top: elementTop + window.scrollY - stickyHeaderHeight,
      left: 0,
      behavior: 'smooth',
    });
  };

  const selectors = {
    section: '[data-section-type]',
    collectionSidebar: '[data-collection-sidebar]',
    collectionSidebarSlideOut: '[data-collection-sidebar-slide-out]',
    collectionSidebarCloseButton: '[data-collection-sidebar-close]',
    form: '[data-collection-filters-form]',
    input: 'input',
    select: 'select',
    label: 'label',
    textarea: 'textarea',
    priceMin: '[data-field-price-min]',
    priceMax: '[data-field-price-max]',
    priceMinValue: 'data-field-price-min',
    priceMaxValue: 'data-field-price-max',
    rangeMin: '[data-se-min-value]',
    rangeMax: '[data-se-max-value]',
    rangeMinValue: 'data-se-min-value',
    rangeMaxValue: 'data-se-max-value',
    rangeMinDefault: 'data-se-min',
    rangeMaxDefault: 'data-se-max',
    showMore: '[data-show-more]',
    linkHidden: '[data-link-hidden]',
    collectionNav: '[data-collection-nav]',
    productsContainer: '[data-products-grid]',
    activeFilters: '[data-active-filters]',
    activeFiltersCount: 'data-active-filters-count',
    filterUpdateUrlButton: '[data-filter-update-url]',
    dataSort: '[data-sort-enabled]',
    sortLinks: '[data-sort-link]',
    sortValue: 'data-value',
    sortButton: '[data-popout-toggle]',
    sortButtonText: '[data-sort-button-text]',
    resultsCount: '[data-results-count]',
  };

  const classes = {
    hidden: 'hidden',
    focused: 'is-focused',
    loading: 'is-loading',
    active: 'is-active',
  };

  class CollectionFiltersForm extends HTMLElement {
    constructor() {
      super();

      this.container = this.closest(selectors.section);
      this.collectionSidebar = this.container.querySelector(selectors.collectionSidebar);
      this.collectionSidebarSlideOut = this.container.querySelector(selectors.collectionSidebarSlideOut);
      this.form = this.querySelector(selectors.form);
      this.productsContainer = this.container.querySelector(selectors.productsContainer);
      this.collectionNav = this.container.querySelector(selectors.collectionNav);
      this.sort = this.container.querySelector(selectors.dataSort);
      this.sortButton = this.container.querySelector(selectors.sortButton);
      this.sortLinks = this.container.querySelectorAll(selectors.sortLinks);
      this.filterUrlButtons = this.container.querySelectorAll(selectors.filterUpdateUrlButton);
      this.collectionSidebarCloseButtons = this.container.querySelectorAll(selectors.collectionSidebarCloseButton);
      this.showMoreOptions = this.querySelectorAll(selectors.showMore);
      this.a11y = a11y;

      this.updatePriceEvent = debounce((e) => this.updatePrice(e), 500);
      this.updateRangeEvent = (e) => this.updateRange(e);
      this.showMoreEvent = (e) => this.showMore(e);
      this.onSortButtonClickEvent = (e) => this.onSortButtonClick(e);
      this.submitFormEvent = (e) => this.submitForm(e);
      this.collectionSidebarCloseEvent = (e) => this.collectionSidebarClose(e);
      this.filterUpdateFromUrlEvent = (e) => this.filterUpdateFromUrl(e);
    }

    connectedCallback() {
      if (this.sort && this.sortLinks.length) {
        this.sortLinks.forEach((link) => {
          link.addEventListener('click', this.onSortButtonClickEvent);
        });
      }

      if (this.collectionSidebar && this.form) {
        this.collectionSidebar.addEventListener('input', this.updatePriceEvent);

        this.collectionSidebar.addEventListener('theme:range:update', this.updateRangeEvent);
      }

      if (this.showMoreOptions.length) {
        // Show more options from the group
        this.showMoreOptions.forEach((element) => {
          element.addEventListener('click', this.showMoreEvent);
        });
      }

      if (this.collectionSidebar || this.sort) {
        window.addEventListener('popstate', this.submitFormEvent);
      }

      if (this.filterUrlButtons.length) {
        this.filterUrlButtons.forEach((filterUrlButton) => {
          filterUrlButton.addEventListener('click', this.filterUpdateFromUrlEvent);
        });
      }

      if (this.collectionSidebarCloseButtons.length) {
        this.collectionSidebarCloseButtons.forEach((button) => {
          button.addEventListener('click', this.collectionSidebarCloseEvent);
        });
      }
    }

    collectionSidebarClose(e) {
      e.preventDefault();
      this.container.dispatchEvent(new CustomEvent('theme:filter:close', {bubbles: false}));
    }

    onSortButtonClick(e) {
      e.preventDefault();

      if (this.sortButton) {
        this.sortButton.dispatchEvent(new Event('click'));
      }

      this.sortActions(e, e.currentTarget);
    }

    sortActions(e, link, submitForm = true) {
      const sortButtonText = this.sort.querySelector(selectors.sortButtonText);
      const sortActive = this.sort.querySelector(`.${classes.active}`);

      if (sortButtonText) {
        const linkText = link ? link.textContent.trim() : '';
        sortButtonText.textContent = linkText;
      }

      if (sortActive) {
        sortActive.classList.remove(classes.active);
      }

      this.sort.classList.toggle(classes.active, link);

      if (link) {
        link.parentElement.classList.add(classes.active);

        if (submitForm) {
          this.submitForm(e);
        }
      }
    }

    onSortCheck(e) {
      let link = null;
      if (window.location.search.includes('sort_by')) {
        const url = new window.URL(window.location.href);
        const urlParams = url.searchParams;

        for (const [key, val] of urlParams.entries()) {
          const linkSort = this.sort.querySelector(`[${selectors.sortValue}="${val}"]`);
          if (key.includes('sort_by') && linkSort) {
            link = linkSort;
            break;
          }
        }
      }

      this.sortActions(e, link, false);
    }

    showMore(e) {
      e.preventDefault();
      const target = e.target.matches(selectors.showMore) ? e.target : e.target.closest(selectors.showMore);

      target.parentElement.classList.add(classes.hidden);
      target.parentElement.previousElementSibling.querySelectorAll(selectors.linkHidden).forEach((link, index) => {
        link.classList.remove(classes.hidden);
        const input = link.querySelector(selectors.input);
        if (index === 0 && document.body.classList.contains(classes.focused) && input) {
          if (this.collectionSidebarSlideOut || isMobile()) {
            this.a11y.removeTrapFocus();
            this.a11y.trapFocus(this.collectionSidebar, {
              elementToFocus: input,
            });
          } else {
            input.focus();
          }
        }
      });
    }

    updatePrice(e) {
      const type = e.type;
      const target = e.target;

      if (type === selectors.input || type === selectors.select || type === selectors.label || type === selectors.textarea) {
        if (this.form && typeof this.form.submit === 'function') {
          const priceMin = this.form.querySelector(selectors.priceMin);
          const priceMax = this.form.querySelector(selectors.priceMax);
          if (priceMin && priceMax) {
            if (target.hasAttribute(selectors.priceMinValue) && !priceMax.value) {
              priceMax.value = priceMax.placeholder;
            } else if (target.hasAttribute(selectors.priceMaxValue) && !priceMin.value) {
              priceMin.value = priceMin.placeholder;
            }
          }

          this.submitForm(e);
        }
      }
    }

    updateRange(e) {
      if (this.form && typeof this.form.submit === 'function') {
        const rangeMin = this.form.querySelector(selectors.rangeMin);
        const rangeMax = this.form.querySelector(selectors.rangeMax);
        const priceMin = this.form.querySelector(selectors.priceMin);
        const priceMax = this.form.querySelector(selectors.priceMax);
        const checkElements = rangeMin && rangeMax && priceMin && priceMax;

        if (checkElements && rangeMin.hasAttribute(selectors.rangeMinValue) && rangeMax.hasAttribute(selectors.rangeMaxValue)) {
          const priceMinValue = parseInt(priceMin.placeholder);
          const priceMaxValue = parseInt(priceMax.placeholder);
          const rangeMinValue = parseInt(rangeMin.getAttribute(selectors.rangeMinValue));
          const rangeMaxValue = parseInt(rangeMax.getAttribute(selectors.rangeMaxValue));

          if (priceMinValue !== rangeMinValue || priceMaxValue !== rangeMaxValue) {
            priceMin.value = rangeMinValue;
            priceMax.value = rangeMaxValue;

            this.submitForm(e);
          }
        }
      }
    }

    filterUpdateFromUrl(e) {
      e.preventDefault();
      this.submitForm(e, e.currentTarget.getAttribute('href'));
    }

    submitForm(e, replaceHref = '') {
      if (!e || (e && e.type !== 'popstate')) {
        if (replaceHref === '') {
          const url = new window.URL(window.location.href);
          let filterUrl = url.searchParams;
          const filterUrlEntries = filterUrl;
          const filterUrlParams = Object.fromEntries(filterUrlEntries);
          const filterUrlRemoveString = filterUrl.toString();

          if (filterUrlRemoveString.includes('filter.') || filterUrlRemoveString.includes('page=') || filterUrlRemoveString.includes('sort_by=')) {
            for (const key in filterUrlParams) {
              if (key.includes('filter.') || key === 'page' || key === 'sort_by') {
                filterUrl.delete(key);
              }
            }
          }

          if (this.form) {
            const formData = new FormData(this.form);
            const formParams = new URLSearchParams(formData);
            const rangeMin = this.form.querySelector(selectors.rangeMin);
            const rangeMax = this.form.querySelector(selectors.rangeMax);
            const rangeMinDefaultValue = rangeMin && rangeMin.hasAttribute(selectors.rangeMinDefault) ? rangeMin.getAttribute(selectors.rangeMinDefault) : '';
            const rangeMaxDefaultValue = rangeMax && rangeMax.hasAttribute(selectors.rangeMaxDefault) ? rangeMax.getAttribute(selectors.rangeMaxDefault) : '';
            let priceFilterDefaultCounter = 0;

            for (let [key, val] of formParams.entries()) {
              if ((key.includes('filter.') && val) || (key.includes('sort_by') && val)) {
                filterUrl.append(key, val);

                if ((val === rangeMinDefaultValue && key === 'filter.v.price.gte') || (val === rangeMaxDefaultValue && key === 'filter.v.price.lte')) {
                  priceFilterDefaultCounter += 1;
                }
              }
            }

            if (priceFilterDefaultCounter === 2) {
              filterUrl.delete('filter.v.price.gte');
              filterUrl.delete('filter.v.price.lte');
            }
          }

          const filterUrlString = filterUrl.toString();
          const filterNewParams = filterUrlString ? `?${filterUrlString}` : location.pathname;
          window.history.pushState(null, '', filterNewParams);
        } else {
          window.history.pushState(null, '', replaceHref);
        }
      } else if (this.sort) {
        this.onSortCheck(e);
      }

      if (this.productsContainer) {
        this.productsContainer.classList.add(classes.loading);
        fetch(`${window.location.pathname}${window.location.search}`)
          .then((response) => response.text())
          .then((data) => {
            const dataHtml = new DOMParser().parseFromString(data, 'text/html');

            // Update results count on search page
            const resultsCountContainer = this.container.querySelector(selectors.resultsCount);
            if (resultsCountContainer) {
              const newResultsCount = dataHtml.querySelector(selectors.resultsCount);

              resultsCountContainer.innerHTML = newResultsCount.innerHTML;
            }

            this.productsContainer.innerHTML = dataHtml.querySelector(selectors.productsContainer).innerHTML;

            if (this.collectionSidebar) {
              this.collectionSidebar.innerHTML = dataHtml.querySelector(selectors.collectionSidebar).innerHTML;

              const activeFiltersCountContainer = this.collectionSidebar.querySelector(`[${selectors.activeFiltersCount}]`);
              const activeFiltersContainer = this.container.querySelectorAll(selectors.activeFilters);
              if (activeFiltersCountContainer && activeFiltersContainer.length) {
                const activeFiltersCount = parseInt(activeFiltersCountContainer.getAttribute(selectors.activeFiltersCount));

                activeFiltersContainer.forEach((counter) => {
                  counter.textContent = activeFiltersCount;
                  counter.classList.toggle(classes.hidden, activeFiltersCount < 1);
                });
              }
            }

            if (this.collectionNav) {
              scrollTo(this.productsContainer.getBoundingClientRect().top - this.collectionNav.offsetHeight);
            }

            setTimeout(() => {
              this.productsContainer.classList.remove(classes.loading);
            }, 500);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }

    disconnectedCallback() {
      if (this.collectionSidebar && this.form) {
        this.collectionSidebar.removeEventListener('input', this.updatePriceEvent);

        this.collectionSidebar.removeEventListener('theme:range:update', this.updateRangeEvent);
      }

      if (this.showMoreOptions.length) {
        this.showMoreOptions.forEach((element) => {
          element.removeEventListener('click', this.showMoreEvent);
        });
      }

      if (this.sort && this.sortLinks.length) {
        this.sortLinks.forEach((link) => {
          link.removeEventListener('click', this.onSortButtonClickEvent);
        });
      }

      if (this.collectionSidebar || this.sort) {
        window.removeEventListener('popstate', this.submitFormEvent);
      }

      if (this.filterUrlButtons.length) {
        this.filterUrlButtons.forEach((filterUrlButton) => {
          filterUrlButton.removeEventListener('click', this.filterUpdateFromUrlEvent);
        });
      }

      if (this.collectionSidebarCloseButtons.length) {
        this.collectionSidebarCloseButtons.forEach((button) => {
          button.removeEventListener('click', this.collectionSidebarCloseEvent);
        });
      }
    }
  }

  if (!customElements.get('collection-filters-form')) {
    customElements.define('collection-filters-form', CollectionFiltersForm);
  }

})();
//# sourceMappingURL=collection-filters-form.js.map
