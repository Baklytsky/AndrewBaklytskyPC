import getSearchParams from '../util/get-search-params';

import CustomScrollbar from './custom-scrollbar';
import {Filters} from './filters';
import {Ajaxify} from './ajaxinate';
import {ProductGrid} from './product-grid';
import {Tooltip} from './tooltip';
import debounce from '../util/debounce';

const selectors = {
  aosItem: '[data-aos]',
  tabsLink: '[data-tabs-link]',
  tab: '[data-tab]',
  tabRef: '[data-tab-ref]',
  scrollable: '[data-custom-scrollbar]',
  scrollableHolder: '[data-custom-scrollbar-holder]',
  slider: '[data-slider]',
  tabsContents: '[data-tabs-contents]',
  searchForm: '[data-search-form]',
  allTypesContainer: '[data-all-types-container]',
  filtersForm: '[data-collection-filters-form]',
  currentPage: '[data-current-page]',
  tooltip: '[data-tooltip]',
  productGrid: '[data-collection-products]',
  ajaxinateContainer: '#AjaxinateLoop',
  ajaxinatePagination: '#AjaxinatePagination',
};

const classes = {
  current: 'current',
  hide: 'hide',
  alt: 'alt',
  aosAnimate: 'aos-animate',
  aosInit: 'aos-init',
  isLoaded: 'is-loaded',
};

const attributes = {
  tabsLink: 'data-tabs-link',
  tab: 'data-tab',
  tabRef: 'data-tab-ref',
  tabStartIndex: 'data-start-index',
  searchPerformed: 'data-search-performed',
  type: 'data-type',
  currentType: 'data-current-type',
  allTypes: 'data-all-types',
  currentPage: 'data-current-page',
  ajaxinateId: 'data-ajaxinate-id',
};

const sections = {};

class Tabs {
  constructor(container) {
    this.container = container;
    this.tabsContents = container.querySelector(selectors.tabsContents);
    this.animateElementsTimer = null;
    this.isSearchPage = container.closest(`[${attributes.searchPerformed}="true"]`) != null;

    if (this.container) {
      this.scrollable = this.container.querySelector(selectors.scrollable);
      this.tabRef = this.container.querySelectorAll(selectors.tabRef);
      this.tabsLink = this.container.querySelectorAll(selectors.tabsLink);
      this.tab = this.container.querySelectorAll(selectors.tab);

      this.assignSearchPageArguments();

      this.init();
      this.initCustomScrollbar();

      if (!this.isSearchPage) {
        this.initTooltips();
      }

      this.inactiveTabsAnimationsCallback = debounce(() => this.handleInactiveTabsAnimations(), 200);
      document.addEventListener('theme:scroll', this.inactiveTabsAnimationsCallback);

      this.container.addEventListener('mouseenter', () => {
        this.handleInactiveTabsAnimations();
      });
    }
  }

  /**
   * Arguments and methods related specifically to Search page tabs
   */
  assignSearchPageArguments() {
    if (!this.isSearchPage) return;

    this.searchForm = this.container.querySelector(selectors.searchForm);
    this.searchFormData = new FormData(this.searchForm);
    this.searchTerm = encodeURIComponent(this.searchFormData.get('q'));
    this.currentType = this.container.getAttribute(attributes.currentType);
    this.sectionId = this.container.dataset.sectionId;
    this.searchForAllTypes = this.container.getAttribute(attributes.allTypes) === 'true';
    this.fetchURL = '';
    this.searchParams = '';
    this.cachedResults = {};

    this.handleTabsHistory();

    this.infiniteScrollListener();
    this.initInfinityScroll(this.currentType);
  }

  /**
   * Initialise
   */
  init() {
    const tabsNavList = this.container.querySelectorAll(selectors.tabsLink);
    const firstTabsLink = this.container.querySelector(
      `[${attributes.tabsLink}="${this.container.hasAttribute(attributes.tabStartIndex) ? this.container.getAttribute(attributes.tabStartIndex) : 0}"]`
    );
    const firstTab = this.container.querySelector(`[${attributes.tab}="${this.container.hasAttribute(attributes.tabStartIndex) ? this.container.getAttribute(attributes.tabStartIndex) : 0}"]`);

    firstTab?.classList.add(classes.current);
    firstTabsLink?.classList.add(classes.current);

    this.checkVisibleTabsLinks();

    tabsNavList.forEach((element) => {
      this.handleTabsNavListeners(element);
    });
  }

  /**
   * Use a `theme:tab:open-from-history` custom event to change the active tab on history change
   */
  handleTabsHistory() {
    window.addEventListener('popstate', this.onHistoryChange.bind(this));

    this.openTabFromHistoryEvent = (event) => this.openTabFromHistory(event);

    this.tabsLink.forEach((element) => {
      element.addEventListener('theme:tab:open-from-history', this.openTabFromHistoryEvent);
    });
  }

  /**
   * Handle tabs navigations listeners
   */
  handleTabsNavListeners(element) {
    const tabId = element.getAttribute(attributes.tabsLink);
    const tab = this.container.querySelector(`[${attributes.tab}="${tabId}"]`);

    if (!tab) return;

    element.addEventListener('click', (event) => {
      if (this.isSearchPage) this.handleURLSearchParams(event, true);
      this.tabChange(element, tab);
    });

    element.addEventListener('keyup', (event) => {
      if (event.code === theme.keyboardKeys.SPACE || event.code === theme.keyboardKeys.ENTER || event.code === theme.keyboardKeys.NUMPADENTER) {
        if (this.isSearchPage) this.handleURLSearchParams(event, true);
        this.tabChange(element, tab);
      }
    });
  }

  /**
   * Open active tab on history change
   */
  openTabFromHistory(event) {
    const target = event.target;
    const element = this.container.querySelector(event.detail.element);
    const tabId = element.getAttribute(attributes.tabsLink);
    const tab = this.container.querySelector(`[${attributes.tab}="${tabId}"]`);

    if (!tab) return;

    this.handleURLSearchParams(event, false);
    this.tabChange(target, tab);
  }

  /**
   * Update URL and Search parameters
   */
  handleURLSearchParams(event, updateHistory = true) {
    const target = event.target.matches(selectors.tabsLink) ? event.target : event.target.closest(selectors.tabsLink);
    const type = target.getAttribute(attributes.type);
    const tabId = target.getAttribute(attributes.tabsLink);
    const tab = this.container.querySelector(`[${attributes.tab}="${tabId}"]`);
    const currentPage = tab.querySelector(selectors.currentPage);
    const filtersForm = document.querySelector(selectors.filtersForm);
    let currentPageStr = currentPage ? `&page=${currentPage.getAttribute(attributes.currentPage)}` : '';

    this.searchParams = getSearchParams(this.searchForm, filtersForm, [], type);
    if (type === 'product') {
      // Remove duplicate parameter if filters have been applied before 'all-search-types' container is removed
      const sanitized = this.searchParams.replace('&type=product', '');
      this.searchParams = `${sanitized}&type=product`;
    } else {
      // Prevent erroneous search results by removing excess filters form's parameters if search filters have already been applied
      this.searchParams = `q=${this.searchTerm}&type=${type}`;
    }
    // Include current page into the URL
    if (!theme.settings.enableInfinityScroll && currentPageStr !== '') {
      this.searchParams += currentPageStr;
    }

    // Build the URL for fetching tab contents
    this.fetchURL = `${theme.routes.searchUrl}?${this.searchParams}&section_id=${this.sectionId}`;

    // Update URL on each tab change
    // Prevented when using the 'theme:tab:open-from-history' custom event to avoid endless cycle of wrong history updates
    if (updateHistory) {
      history.pushState({searchParams: this.searchParams}, '', `${window.location.pathname}${this.searchParams && '?'.concat(this.searchParams)}`);
    }
  }

  /**
   * Fetch tab content and handle tab change events
   */
  tabChangeFetchContent(element, tab) {
    const type = element.getAttribute(attributes.type);
    const tabId = element.getAttribute(attributes.tabsLink);
    const tabContainer = this.container.querySelector(`[${attributes.tab}="${tabId}"]`);
    const typeRendered = this.currentType === type;

    if (this.cachedResults[tabId] || typeRendered) {
      if (type === 'product' && !this.searchFilters) {
        this.searchFilters = new Filters(this.container);
      }

      requestAnimationFrame(() => {
        this.handleActiveTabClasses(element, tab);
        this.scrollToCurrentTabLink(element);
        this.triggerTabAnimations(tab);
        this.checkVisibleTabsLinks();
        this.updateAjaxify(tab, type);
      });

      return;
    }

    fetch(this.fetchURL)
      .then((response) => {
        if (!response.ok) {
          const error = new Error(response.status);
          throw error;
        }

        return response.text();
      })
      .then((text) => {
        const parsed = new DOMParser().parseFromString(text, 'text/html');
        const resultsMarkup = parsed.querySelector(`[${attributes.tab}="${tabId}"]`).innerHTML;

        // Remove the container with search results with all search types
        if (this.searchForAllTypes) {
          this.container.querySelector(selectors.allTypesContainer)?.remove();
        }

        // Keep the cache for all tabs
        this.cachedResults[tabId] = resultsMarkup;
        // Render tab contents
        tabContainer.innerHTML = resultsMarkup;

        if (type === 'product' && !this.searchFilters) {
          this.searchFilters = new Filters(this.container);
        }

        requestAnimationFrame(() => {
          this.handleActiveTabClasses(element, tab);
          this.scrollToCurrentTabLink(element);
          this.triggerTabAnimations(tab);
          this.checkVisibleTabsLinks();
          this.initInfinityScroll(type);
        });
      })
      .catch((error) => {
        throw error;
      });
  }

  /**
   * Handle history change using `theme:tab:open-from-history` custom events
   */
  onHistoryChange(event) {
    const searchParams = event.state?.searchParams || window.location.search;
    const productResults = searchParams.indexOf('type=product') > -1;
    const articleResults = searchParams.indexOf('type=article') > -1;
    const pageResults = searchParams.indexOf('type=page') > -1;
    const shouldOpenTab = productResults || articleResults || pageResults;
    const typeProduct = this.container.querySelector(`${selectors.tabsLink}[${attributes.type}="product"]`);
    const typeArticle = this.container.querySelector(`${selectors.tabsLink}[${attributes.type}="article"]`);
    const typePage = this.container.querySelector(`${selectors.tabsLink}[${attributes.type}="page"]`);

    if (!shouldOpenTab) {
      // Go to initial search page results if the 'all-search-types' container is removed
      window.location = searchParams;
      return;
    }

    if (productResults) {
      typeProduct?.dispatchEvent(
        new CustomEvent('theme:tab:open-from-history', {
          bubbles: true,
          detail: {
            element: `[${attributes.type}="product"]`,
          },
        })
      );
    }

    if (articleResults) {
      typeArticle?.dispatchEvent(
        new CustomEvent('theme:tab:open-from-history', {
          bubbles: true,
          detail: {
            element: `[${attributes.type}="article"]`,
          },
        })
      );
    }

    if (pageResults) {
      typePage?.dispatchEvent(
        new CustomEvent('theme:tab:open-from-history', {
          bubbles: true,
          detail: {
            element: `[${attributes.type}="page"]`,
          },
        })
      );
    }
  }

  /**
   * Initialise Custom scrollbar
   */
  initCustomScrollbar() {
    if (!this.scrollable || this.customScrollbar) return;

    this.customScrollbar = new CustomScrollbar(this.container);
  }

  /**
   * Use a `theme:tab:ajaxinate` custom event for Infinity Scroll in Filters
   */
  infiniteScrollListener() {
    if (!theme.settings.enableInfinityScroll) return;

    this.ajaxifyFromFiltersEvent = (event) => this.ajaxifyFromFilters(event);

    document.addEventListener('theme:tab:ajaxinate', this.ajaxifyFromFiltersEvent);
  }

  /**
   * Initialise Infinity Scroll with a custom event from Filters
   */
  ajaxifyFromFilters(event) {
    this.initInfinityScroll(event.detail);
  }

  /**
   * Initialise Infinity Scroll
   */
  initInfinityScroll(type) {
    if (!theme.settings.enableInfinityScroll) return;

    // Find all ajaxinate containers
    const ajaxinateContainer = this.container.querySelectorAll(selectors.ajaxinateContainer);
    if (ajaxinateContainer.length === 0) return;

    // Find the current active tab's ajaxinate container
    const activeTab = this.container.querySelector(`${selectors.tab}.${classes.current}`);
    const tabAjaxinateContainer = activeTab?.querySelector(selectors.ajaxinateContainer);
    const isLoaded = tabAjaxinateContainer?.classList.contains(classes.isLoaded);

    // Whenever the search page with all types is loaded, there is no active tab
    if (!activeTab) {
      this.initAjaxyfy(type);
      return;
    }

    // Fix issues when opening a tab without any results but scrolling still loads more content in other tabs with Ajaxinate
    if (!tabAjaxinateContainer && this.endlessCollection) {
      this.updateAjaxinateInstancesSettings(type);
    }

    // Initialise on load or on tab change events, if the tab content is updated from fetch method
    if (!tabAjaxinateContainer || isLoaded) return;
    this.initAjaxyfy(type);
  }

  /**
   * Update the callback and method settings in Ajaxinate instances
   * The timeout is used to make sure the Ajaxinate instances are present when callbacks are inserted
   */
  updateAjaxinateInstancesSettings(type) {
    setTimeout(() => {
      if (this.endlessCollection.endlessScroll.length === 0) return;

      // Update method to 'click' instead of 'scroll' to prevent Ajaxinate loading on other closed tabs with more results
      [...this.endlessCollection.endlessScroll].forEach((instance) => {
        const containerElement = instance.containerElement;
        const activeTabPresent = [...this.tab].find((tab) => tab.classList.contains(classes.current));
        const isInActiveTab = containerElement.closest(`${selectors.tab}.${classes.current}`) !== null;

        if (!isInActiveTab && activeTabPresent) instance.settings.method = 'click';
      });

      // Use `initProductGridEvents()` method as a callback when the new pages content is appended
      const callback = () => this.initProductGridEvents();

      if (type === 'product' || type === 'all') {
        const instanceIDCheck = (instance) => {
          return instance.settings.container.indexOf('resultsProducts') > -1 || instance.settings.container.indexOf('allTypes') > -1;
        };
        const productAjaxinateInstance = [...this.endlessCollection.endlessScroll].find(instanceIDCheck);

        if (!productAjaxinateInstance) return;

        productAjaxinateInstance.settings.callback = callback;
      }
    });
  }

  /**
   * Initialise new Ajaxinate instances
   */
  initAjaxyfy(type) {
    if (typeof this.endlessCollection !== 'object') {
      this.endlessCollection = new Ajaxify(this.container);
      this.updateAjaxinateInstancesSettings(type);
      return;
    }

    if (this.endlessCollection.endlessScroll.length > 0) {
      this.endlessCollection.unload();

      this.endlessCollection = new Ajaxify(this.container);
      this.updateAjaxinateInstancesSettings(type);
    }
  }

  /**
   * Update Ajaxinate instances with removing duplicated ones
   */
  updateAjaxify(tab, type) {
    if (this.endlessCollection?.endlessScroll.length === 0) return;

    const ajaxinateContainer = tab.querySelector(selectors.ajaxinateContainer);
    const id = `${selectors.ajaxinateContainer}[${attributes.ajaxinateId}="${ajaxinateContainer?.dataset.ajaxinateId}"]`;

    if (!ajaxinateContainer) return;

    this.endlessCollection.update(id);
    this.updateAjaxinateInstancesSettings(type);
  }

  /**
   * Init all the events required on product grid items
   */
  initProductGridEvents() {
    this.productGridEvents = new ProductGrid(this.container);
    this.initTooltips();
  }

  /**
   * Init tooltips for swatches
   */
  initTooltips() {
    this.tooltips = this.container.querySelectorAll(selectors.tooltip);
    this.productGrid = this.container.querySelector(selectors.productGrid);

    if (window.innerWidth < theme.sizes.small) {
      this.tooltips = this.productGrid?.querySelectorAll(selectors.tooltip);
    }

    this.tooltips?.forEach((tooltip) => {
      new Tooltip(tooltip);
    });
  }

  /**
   * Tab change event
   */
  tabChange(element, tab) {
    if (element.classList.contains(classes.current)) return;

    if (this.isSearchPage) {
      this.tabChangeFetchContent(element, tab);
      return;
    }

    this.handleActiveTabClasses(element, tab);
    this.scrollToCurrentTabLink(element);
    this.triggerTabAnimations(tab);
    this.handleTabSliders(tab);
    this.checkVisibleTabsLinks();
  }

  /**
   * Handle active tab classes
   */
  handleActiveTabClasses(element, tab) {
    const lastActiveTab = this.container.querySelector(`${selectors.tab}.${classes.current}`);
    const lastActiveTabsLink = this.container.querySelector(`${selectors.tabsLink}.${classes.current}`);

    // Update active tab's classes
    lastActiveTab?.classList.remove(classes.current);
    lastActiveTabsLink?.classList.remove(classes.current);
    element.classList.add(classes.current);
    tab.classList.add(classes.current);

    if (element.classList.contains(classes.hide)) {
      tab.classList.add(classes.hide);
    }

    // Update tab's referenced elements' classes
    this.tabRef?.forEach((refElement) => {
      const isActive = refElement.classList.contains(classes.current);
      const shouldBeActive = refElement.getAttribute(attributes.tabRef) === tab.getAttribute(attributes.tab);

      refElement.classList.toggle(classes.current, !isActive && shouldBeActive);
    });
  }

  /**
   * Scroll to current tab link
   */
  scrollToCurrentTabLink(element) {
    const parent = element.closest(selectors.scrollableHolder) ? element.closest(selectors.scrollableHolder) : element.parentElement;
    const parentPadding = parseInt(window.getComputedStyle(parent).getPropertyValue('padding-left'));

    parent.scrollTo({
      top: 0,
      left: element.offsetLeft - parent.offsetWidth / 2 + element.offsetWidth / 2 + parentPadding,
      behavior: 'smooth',
    });

    element.dispatchEvent(
      new CustomEvent('theme:custom-scrollbar:change', {
        bubbles: true,
        detail: {
          element: element,
        },
      })
    );
  }

  /**
   * Refresh animations if they are enabled
   */
  triggerTabAnimations(tab) {
    if (theme.settings.animations == 'false') return;

    this.tabsContents.querySelectorAll(selectors.aosItem).forEach((element) => {
      element.classList.remove(classes.aosAnimate);
    });

    if (this.animateElementsTimer) {
      clearTimeout(this.animateElementsTimer);
    }

    this.animateElementsTimer = setTimeout(() => {
      tab.querySelectorAll(selectors.aosItem).forEach((element) => {
        element.classList.add(classes.aosAnimate);
      });
    }, 150);
  }

  /**
   * When the page is scrolled AOS classes are auto updated regardless of each tab visibility
   * Removing them for inactive tabs solves issues with animations refresh on tab opening
   */
  handleInactiveTabsAnimations() {
    this.tab.forEach((tab) => {
      if (!tab.classList.contains(classes.current)) {
        tab.querySelectorAll(selectors.aosItem).forEach((element) => {
          requestAnimationFrame(() => element.classList.remove(classes.aosAnimate));
        });
      }
    });
  }

  /**
   * Trigger `theme:tab:change` custom event to reset the selected tab slider position
   */
  handleTabSliders(tab) {
    const slider = tab.querySelector(selectors.slider);
    if (slider) slider.dispatchEvent(new CustomEvent('theme:tab:change', {bubbles: false}));
  }

  /**
   * Check visible tab links
   */
  checkVisibleTabsLinks() {
    const tabsNavList = this.container.querySelectorAll(selectors.tabsLink);
    const tabsNavListHidden = this.container.querySelectorAll(`${selectors.tabsLink}.${classes.hide}`);
    const difference = tabsNavList.length - tabsNavListHidden.length;

    if (difference < 2) {
      this.container.classList.add(classes.alt);
    } else {
      this.container.classList.remove(classes.alt);
    }
  }

  /**
   * Event callback for Theme Editor `shopify:block:select` event
   */
  onBlockSelect(event) {
    const element = event.target;
    if (element) {
      element.dispatchEvent(new Event('click'));

      element.parentNode.scrollTo({
        top: 0,
        left: element.offsetLeft - element.clientWidth,
        behavior: 'smooth',
      });
    }
  }

  /**
   * Event callback for Theme Editor `shopify:section:unload` event
   */
  onUnload() {
    if (this.customScrollbar) {
      this.customScrollbar.unload();
    }

    if (this.isSearchPage && theme.settings.enableInfinityScroll) {
      document.removeEventListener('theme:tab:ajaxinate', this.ajaxifyFromFiltersEvent);
    }

    document.removeEventListener('theme:scroll', this.inactiveTabsAnimationsCallback);
  }
}

const tabs = {
  onLoad() {
    sections[this.id] = new Tabs(this.container);
  },
  onBlockSelect(e) {
    sections[this.id].onBlockSelect(e);
  },
  onUnload() {
    sections[this.id].onUnload();
  },
};

export {tabs, Tabs};
