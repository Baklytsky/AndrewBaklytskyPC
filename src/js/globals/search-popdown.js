import {a11y} from '../vendor/theme-scripts/theme-a11y';

const selectors = {
  details: 'details',
  popdownBody: '[data-popdown-body]',
  popdownClose: '[data-popdown-close]',
  popdownToggle: '[data-popdown-toggle]',
  searchFormInner: '[data-search-form-inner]',
  input: 'input:not([type="hidden"])',
  popularSearchesLink: '[data-popular-searches-link]',
  header: '[data-site-header]',
  nav: '[data-nav]',
  navItemsCompress: '[data-nav-items-compress]',
  navIcons: '[data-nav-icons]',
  mobileMenu: '[data-mobile-menu]',
  predictiveSearch: 'predictive-search',
  searchForm: 'search-form',
};

const attributes = {
  popdownInHeader: 'data-popdown-in-header',
  popdownInPage: 'data-popdown-in-page',
  searchPerformed: 'data-search-performed',
};

const classes = {
  searchOpened: 'search-opened',
  headerMenuOpened: 'site-header--menu-opened',
  headerCompress: 'site-header--compress',
  open: 'is-open',
};

class SearchPopdown extends HTMLElement {
  constructor() {
    super();
    this.isPopdownInHeader = this.hasAttribute(attributes.popdownInHeader);
    this.isPopdownInPage = this.hasAttribute(attributes.popdownInPage);
    this.popdownBody = this.querySelector(selectors.popdownBody);
    this.popdownClose = this.querySelector(selectors.popdownClose);
    this.searchFormInner = this.querySelector(selectors.searchFormInner);
    this.popularSearchesLink = this.querySelectorAll(selectors.popularSearchesLink);
    this.searchFormWrapper = this.querySelector(selectors.searchForm) ? this.querySelector(selectors.searchForm) : this.querySelector(selectors.predictiveSearch);
    this.predictiveSearch = this.searchFormWrapper.matches(selectors.predictiveSearch);
    this.header = document.querySelector(selectors.header);
    this.headerSection = this.header?.parentNode;
    this.nav = this.header?.querySelector(selectors.nav);
    this.mobileMenu = this.headerSection?.querySelector(selectors.mobileMenu);
    this.a11y = a11y;
    this.ensureClosingOnResizeEvent = () => this.ensureClosingOnResize();
    this.popdownTransitionCallbackEvent = (event) => this.popdownTransitionCallback(event);
    this.detailsToggleCallbackEvent = (event) => this.detailsToggleCallback(event);

    if (this.isPopdownInHeader) {
      this.details = this.querySelector(selectors.details);
      this.popdownToggle = this.querySelector(selectors.popdownToggle);
    }
  }

  connectedCallback() {
    if (this.isPopdownInHeader) {
      this.searchFormInner.addEventListener('transitionend', this.popdownTransitionCallbackEvent);
      this.details.addEventListener('keyup', (event) => event.code.toUpperCase() === 'ESCAPE' && this.close());
      this.details.addEventListener('toggle', this.detailsToggleCallbackEvent);
      this.popdownClose.addEventListener('click', () => this.close());
      this.popdownToggle.addEventListener('click', (event) => this.onPopdownToggleClick(event));
      this.popdownToggle.setAttribute('role', 'button');
    }

    if (this.isPopdownInPage) {
      this.popdownClose.addEventListener('click', () => this.triggerPopdownClose());
      this.searchFormWrapper.addEventListener('focusout', () => this.onFocusOut());
      this.searchFormWrapper.input.addEventListener('click', (event) => this.triggerPopdownOpen(event));
    }

    this.popularSearchesLink.forEach((element) => {
      element.addEventListener('click', (event) => {
        event.preventDefault();
        const popularSearchText = event.target.textContent;

        this.searchFormWrapper.input.value = popularSearchText;
        this.searchFormWrapper.submit();
      });
    });
  }

  // Prevent the default details toggle and close manually the popdown
  onPopdownToggleClick(event) {
    const isChrome = navigator.userAgent.includes('Chrome');
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isChrome && !isIOS) {
      event.target.closest(selectors.details).setAttribute('open', '');
    }
    if (event.target.closest(selectors.details).hasAttribute('open')) {
      event.preventDefault();
      this.close();
    }
  }

  // Use default details toggle to open the search popdown
  detailsToggleCallback(event) {
    if (event.target.hasAttribute('open')) {
      this.open();
    }
  }

  popdownTransitionCallback(event) {
    if (event.target !== this.searchFormInner) return;

    if (!this.details.classList.contains(classes.open)) {
      this.onClose();
    } else if (event.propertyName === 'transform') {
      // Wait for the 'transform' transition to complete in order to prevent jumping content issues because of the trapFocus
      this.a11y.trapFocus({
        container: this.searchFormInner,
      });
    }
  }

  onBodyClick(event) {
    const isTargetInPopdown = this.contains(event.target);
    const isHeaderMenuOpened = this.header?.classList.contains(classes.headerMenuOpened);

    if (isHeaderMenuOpened || isTargetInPopdown) return;
    if (!isTargetInPopdown) this.close();
  }

  onFocusOut() {
    if (!this.predictiveSearch) return;

    requestAnimationFrame(() => {
      if (!this.searchFormWrapper.contains(document.activeElement)) {
        this.searchFormWrapper.close();
      }
    });
  }

  triggerPopdownOpen(event) {
    const isSearchPageWithoutTerms = this.closest(`[${attributes.searchPerformed}="false"]`);
    let isTouch = matchMedia('(pointer:coarse)').matches;
    const viewportMobile = window.innerWidth < theme.sizes.small;
    const shouldOpenPopdownOnTouchDevice = isTouch || viewportMobile;
    const shouldOpenPopdownOnNoTerms = isSearchPageWithoutTerms != null;

    if (viewportMobile && window.Shopify.designMode) {
      isTouch = true;
    }

    if (!this.nav || !this.mobileMenu) return;

    if (shouldOpenPopdownOnTouchDevice || shouldOpenPopdownOnNoTerms) {
      event.preventDefault();

      const isHeaderCompressed = this.header.classList.contains(classes.headerCompress);
      let popdownToggle = this.mobileMenu.querySelector(selectors.popdownToggle);

      if (!isTouch) {
        popdownToggle = isHeaderCompressed
          ? this.nav.querySelector(`${selectors.navItemsCompress} ${selectors.popdownToggle}`)
          : this.nav.querySelector(`${selectors.navIcons} ${selectors.popdownToggle}`);
      }

      setTimeout(() => {
        popdownToggle?.dispatchEvent(new Event('click', {bubbles: true}));
      }, 300);
    }
  }

  open() {
    this.onBodyClickEvent = (event) => this.onBodyClick(event);
    this.searchFormWrapper.input.setAttribute('aria-expanded', true);

    document.body.classList.add(classes.searchOpened);
    document.body.addEventListener('click', this.onBodyClickEvent);
    document.addEventListener('theme:resize', this.ensureClosingOnResizeEvent);
    document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));

    // Safari opening transition fix
    requestAnimationFrame(() => {
      this.details.classList.add(classes.open);
    });
  }

  close() {
    this.a11y.removeTrapFocus();
    this.details.classList.remove(classes.open);
    if (this.predictiveSearch) this.searchFormWrapper.close();
    this.searchFormWrapper.handleFocusableDescendants(true);
  }

  triggerPopdownClose() {
    if (this.predictiveSearch) this.searchFormWrapper.close();

    if (this.searchFormWrapper.popularSearches) {
      requestAnimationFrame(() => document.activeElement.blur());
    }
  }

  onClose() {
    this.details.removeAttribute('open');
    document.dispatchEvent(new CustomEvent('theme:search:close', {bubbles: true}));
    document.body.classList.remove(classes.searchOpened);
    document.body.removeEventListener('click', this.onBodyClickEvent);
    document.removeEventListener('theme:resize', this.ensureClosingOnResizeEvent);
    document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
  }

  ensureClosingOnResize() {
    // Due to having multiple <search-popdown> elements in `.mobile-menu`, `.nav--default` or `.menu__item--compress` parents,
    // the element can become hidden when the browser is resized
    // `transitionend` event is then not fired and the closing methods are not finished properly
    const isElementHiddenFromView = this.offsetParent === null;
    if (!isElementHiddenFromView) return;

    this.onClose();
  }
}

customElements.define('search-popdown', SearchPopdown);
