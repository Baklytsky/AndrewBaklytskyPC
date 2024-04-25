import debounce from '../util/debounce';
import getSearchParams from '../util/get-search-params';
import {setVars} from '../globals/height';
import {a11y} from '../vendor/theme-scripts/theme-a11y';

import {Tooltip} from './tooltip';
import RangeSlider from './range-slider';
import {makeSwatches} from './swatch';
import {ProductGrid} from './product-grid';
import CustomScrollbar from './custom-scrollbar';
import {Collapsible} from './collapsible';
import {Ajaxify} from './ajaxinate';

const settings = {
  loadingTimeout: 300,
};

const selectors = {
  buttons: 'button',
  toggleFilters: '[data-toggle-filters]',
  closeFilters: '[data-close-filters]',
  openFilters: '[data-open-filters]',
  collectionWrapper: '[data-collection-wrapper]',
  collapsibleTrigger: '[data-collapsible-trigger]',
  sortToggle: '[data-sort-toggle]',
  collectionSortOptions: '[data-collection-sort-options]',
  inputs: 'input, select, label, textarea',
  inputSort: '[data-input-sort]',
  filters: '[data-collection-filters]',
  filtersWrapper: '[data-collection-filters-wrapper]',
  filtersList: '[data-collection-filters-list]',
  filtersStickyBar: '[data-collection-sticky-bar]',
  filter: '[data-collection-filter]',
  filterTag: '[data-collection-filter-tag]',
  filterTagButton: '[data-collection-filter-tag-button]',
  filtersForm: '[data-collection-filters-form]',
  filterResetButton: '[data-filter-reset-button]',
  filterTagClearButton: '[data-filter-tag-reset-button]',
  popupsSection: '[data-section-type="popups"]',
  productGrid: '[data-collection-products]',
  productsCount: '[data-products-count]',
  priceMin: '[data-field-price-min]',
  priceMax: '[data-field-price-max]',
  rangeMin: '[data-se-min-value]',
  rangeMax: '[data-se-max-value]',
  rangeMinValue: 'data-se-min-value',
  rangeMaxValue: 'data-se-max-value',
  rangeMinDefault: 'data-se-min',
  rangeMaxDefault: 'data-se-max',
  tooltip: '[data-tooltip]',
  tooltipContainer: '[data-tooltip-container]',
  showMore: '[data-show-more]',
  showMoreActions: '[data-show-more-actions]',
  showMoreContainer: '[data-show-more-container]',
  showMoreTrigger: '[data-show-more-trigger]',
  searchPerformed: '[data-search-performed]',
  searchForm: '[data-search-form]',
  scrollable: '[data-custom-scrollbar]',
};

const classes = {
  isActive: 'is-active',
  isExpanded: 'is-expanded',
  isVisible: 'is-visible',
  isLoading: 'is-loading',
  popupVisible: 'popup--visible',
  collectionFiltersVisible: 'collection__filters--visible',
  collectionSortOptionWrapperVisible: 'collection__sort__option-wrapper--visible',
  hidden: 'is-hidden',
};

const attributes = {
  filterActive: 'data-filter-active',
  preventScrollLock: 'data-prevent-scroll-lock',
  filtersDefaultState: 'data-filters-default-state',
  tabIndex: 'tabindex',
  ariaExpanded: 'aria-expanded',
  currentType: 'data-current-type',
};

const sections = {};

class Filters {
  constructor(container) {
    this.container = container;
    this.sectionId = container.dataset.sectionId;
    this.enableFilters = container.dataset.enableFilters === 'true';
    this.enableSorting = container.dataset.enableSorting === 'true';
    this.filterMode = container.dataset.filterMode;
    this.collectionHandle = this.container.dataset.collection;
    this.isSearchPage = container.closest(selectors.searchPerformed) != null;
    this.productGrid = this.container.querySelector(selectors.productGrid);
    this.productsCount = this.container.querySelector(selectors.productsCount);
    this.groupTagFilters = this.container.querySelectorAll(selectors.filter);
    this.filters = this.container.querySelector(selectors.filters);
    this.filterTriggers = this.container.querySelectorAll(selectors.collapsibleTrigger);
    this.filtersStickyBar = this.container.querySelector(selectors.filtersStickyBar);
    this.filtersForm = this.container.querySelector(selectors.filtersForm);
    this.inputSort = this.container.querySelectorAll(selectors.inputSort);
    this.sortToggle = this.container.querySelector(selectors.sortToggle);
    this.collectionSortOptions = this.container.querySelector(selectors.collectionSortOptions);
    this.a11y = a11y;
    this.filterData = [];
    this.rangeSlider = null;
    this.sortDropdownEvent = () => this.sortDropdownToggle();
    this.onTabHandlerEvent = (event) => this.onTabHandler(event);
    this.updateCollectionFormSortEvent = (event) => this.updateCollectionFormSort(event);
    this.bodyClickEvent = (event) => this.bodyClick(event);
    this.onFilterResetClick = this.onFilterResetClick.bind(this);
    this.onFilterTagResetClick = this.onFilterTagResetClick.bind(this);
    this.onFilterTagClearClick = this.onFilterTagClearClick.bind(this);
    this.onFilterToggleClick = this.onFilterToggleClick.bind(this);
    this.onKeyUpHandler = this.onKeyUpHandler.bind(this);
    this.updateRangeEvent = this.updateRange.bind(this);
    this.debouncedSubmitEvent = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);
    this.debouncedSortEvent = debounce((event) => {
      this.onSortChange(event);
    }, 500);
    this.productGridEvents = {};

    if (this.filters) {
      this.hideFiltersDrawer = this.hideFiltersDrawer.bind(this);
      this.showFiltersDrawer = this.showFiltersDrawer.bind(this);
      this.resizeEvent = debounce(() => {
        this.filtersResizeEvents();
      }, 500);
      this.filtersResizeEvents();
      document.addEventListener('theme:resize:width', this.resizeEvent);
    }

    this.initTagFilters();
    this.initFacetedFilters();
    this.bindToggleButtonsEvents();
    this.bindFilterButtonsEvents();
    this.initProductGridEvents(theme.settings.enableInfinityScroll);

    makeSwatches(this.container);
    this.collapsible = new Collapsible(this.container);

    // Update css variable for collection sticky bar height
    setVars();

    window.addEventListener('popstate', this.onHistoryChange.bind(this));

    this.sortToggle?.addEventListener('click', this.sortDropdownEvent);

    document.addEventListener('click', this.bodyClickEvent);

    this.filterShowMore();
  }

  /*
   * Init faceted filters
   */
  initFacetedFilters() {
    if (this.filterMode == 'tag' || this.filterMode == 'group' || !this.enableFilters) {
      return;
    }

    this.rangeSlider = new RangeSlider(this.container);
  }

  /*
   * Init tooltips for swatches
   */
  initTooltips() {
    this.tooltips = this.container.querySelectorAll(selectors.tooltip);

    if (window.innerWidth < theme.sizes.small) {
      this.tooltips = this.productGrid?.querySelectorAll(selectors.tooltip);
    }

    this.tooltips?.forEach((tooltip) => {
      new Tooltip(tooltip);
    });

    this.handleVisibleTooltips();
  }

  handleVisibleTooltips() {
    if (this.tooltips.length > 0) {
      const tooltipTarget = document.querySelector(selectors.tooltipContainer);
      if (tooltipTarget.classList.contains(classes.isVisible)) {
        tooltipTarget.classList.remove(classes.isVisible);
      }
    }
  }

  /*
   * Price range slider update
   */
  updateRange() {
    const rangeMin = this.filtersForm.querySelector(selectors.rangeMin);
    const rangeMax = this.filtersForm.querySelector(selectors.rangeMax);
    const priceMin = this.filtersForm.querySelector(selectors.priceMin);
    const priceMax = this.filtersForm.querySelector(selectors.priceMax);

    if (rangeMin.hasAttribute(selectors.rangeMinValue) && rangeMax.hasAttribute(selectors.rangeMaxValue)) {
      const priceMinValue = parseFloat(priceMin.placeholder, 10);
      const priceMaxValue = parseFloat(priceMax.placeholder, 10);
      const rangeMinValue = parseFloat(rangeMin.getAttribute(selectors.rangeMinValue), 10);
      const rangeMaxValue = parseFloat(rangeMax.getAttribute(selectors.rangeMaxValue), 10);

      if (priceMinValue !== rangeMinValue || priceMaxValue !== rangeMaxValue) {
        priceMin.value = parseInt(rangeMinValue);
        priceMax.value = parseInt(rangeMaxValue);

        this.filtersForm.dispatchEvent(new Event('input', {bubbles: true}));
      }
    }
  }

  /*
   * Render product grid and filters on form submission
   */
  onSubmitHandler(event) {
    event.preventDefault();
    const formData = new FormData(this.filtersForm);
    const searchParams = new URLSearchParams(formData);
    const deleteParams = [];
    let searchParamsString = '';

    if (this.isSearchPage) {
      this.searchForm = this.container.querySelector(selectors.searchForm);
      this.currentType = this.container.getAttribute(attributes.currentType);
    }

    // if submitted price equal to price range min and max remove price parameters
    const rangeMin = this.filtersForm.querySelector(selectors.rangeMin);
    const rangeMax = this.filtersForm.querySelector(selectors.rangeMax);
    const priceMin = this.filtersForm.querySelector(selectors.priceMin);
    const priceMax = this.filtersForm.querySelector(selectors.priceMax);
    const checkElements = rangeMin && rangeMax && priceMin && priceMax;

    if (checkElements && rangeMin.hasAttribute(selectors.rangeMinDefault) && rangeMax.hasAttribute(selectors.rangeMaxDefault)) {
      const rangeMinDefault = parseFloat(rangeMin.getAttribute(selectors.rangeMinDefault), 10);
      const rangeMaxDefault = parseFloat(rangeMax.getAttribute(selectors.rangeMaxDefault), 10);
      const priceMinValue = !priceMin.value ? rangeMinDefault : parseFloat(priceMin.value, 10);
      const priceMaxValue = !priceMax.value ? rangeMaxDefault : parseFloat(priceMax.value, 10);

      if (priceMinValue <= rangeMinDefault && priceMaxValue >= rangeMaxDefault) {
        deleteParams.push('filter.v.price.gte');
        deleteParams.push('filter.v.price.lte');
        searchParams.delete('filter.v.price.gte');
        searchParams.delete('filter.v.price.lte');
      }
    }

    searchParamsString = searchParams.toString();

    if (this.isSearchPage) {
      searchParamsString = getSearchParams(this.searchForm, this.filtersForm, deleteParams);

      let typeString = '';
      if (this.currentType === 'all') typeString = '&type=product';
      if (searchParamsString.indexOf('&type=product') > -1) typeString = '';
      searchParamsString += typeString;
    }

    this.renderSection(searchParamsString, event);
  }

  /*
   * Call renderSection on history change
   */
  onHistoryChange(event) {
    if (!this.filters) return;

    let searchParams = event.state?.searchParams || '';

    if (this.isSearchPage) {
      if (!event.state) searchParams = window.location.search;
      const shouldRenderSearchResults = searchParams.indexOf('type=product') > -1;

      if (!shouldRenderSearchResults) return;
    }

    this.renderSection(searchParams, null, false);
  }

  /*
   * Render section on history change or filter/sort change event
   */
  renderSection(searchParams, event, updateURLHash = true) {
    this.startLoading();
    const url = `${window.location.pathname}?section_id=${this.sectionId}&${searchParams}`;
    const filterDataUrl = (element) => element.url === url;
    this.filterData.some(filterDataUrl) ? this.renderSectionFromCache(filterDataUrl, event) : this.renderSectionFromFetch(url, event);

    if (updateURLHash) {
      this.updateURLHash(searchParams);
    }
  }

  /*
   * Render section from fetch call
   */
  renderSectionFromFetch(url) {
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = responseText;
        this.filterData = [...this.filterData, {html, url}];
        this.inputSort = this.container.querySelectorAll(selectors.inputSort);
        this.renderFilters(html);
        this.bindFilterButtonsEvents();
        this.hideFiltersOnMobile();
        this.renderProductGrid(html);
        this.updateProductsCount(html);
        this.finishLoading();
        this.mobileFiltersScrollLock();
        this.handleSearchPageActiveTab();
      });
  }

  /*
   * Render section from Cache
   */
  renderSectionFromCache(filterDataUrl, event) {
    const html = this.filterData.find(filterDataUrl).html;
    this.renderFilters(html, event);
    this.hideFiltersOnMobile();
    this.renderProductGrid(html);
    this.updateProductsCount(html);
    this.finishLoading();
    this.mobileFiltersScrollLock();
    this.handleSearchPageActiveTab();
  }

  handleSearchPageActiveTab() {
    if (!this.isSearchPage) return;

    this.scrollable = this.container.querySelector(selectors.scrollable);
    if (!this.scrollable || this.customScrollbar) return;
    this.customScrollbar = new CustomScrollbar(this.container);
  }

  /*
   * Render product grid items on fetch call
   */
  renderProductGrid(html) {
    const newProductGrid = new DOMParser().parseFromString(html, 'text/html').querySelector(selectors.productGrid);

    if (!newProductGrid) {
      return;
    }

    this.productGrid.innerHTML = newProductGrid.innerHTML;

    this.initProductGridEvents(theme.settings.enableInfinityScroll);
    this.filterShowMore();
  }

  /*
   * Update total number of products on fetch call
   */
  updateProductsCount(html) {
    const newProductsCount = new DOMParser().parseFromString(html, 'text/html').querySelector(selectors.productsCount);

    if (!newProductsCount) {
      return;
    }

    this.productsCount.innerHTML = newProductsCount.innerHTML;
  }

  /*
   * Render filters on fetch call
   */
  renderFilters(html) {
    const newFilters = new DOMParser().parseFromString(html, 'text/html').querySelector(selectors.filters);

    if (!newFilters) {
      return;
    }

    this.filters.innerHTML = newFilters.innerHTML;
    this.filtersForm = document.querySelector(selectors.filtersForm);
    this.bindFilterButtonsEvents();
    this.bindToggleButtonsEvents();
    makeSwatches(this.container);
    this.collapsible = new Collapsible(this.container);

    // Init price range slider
    document.dispatchEvent(new CustomEvent('theme:filters:init', {bubbles: true}));
  }

  /*
   * Update URL when filter/sort is changed
   */
  updateURLHash(searchParams) {
    history.pushState({searchParams}, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  /*
   * Bind filter buttons events
   */
  bindFilterButtonsEvents() {
    if (this.inputSort.length > 0) {
      this.inputSort.forEach((input) => {
        input.addEventListener('change', this.updateCollectionFormSortEvent);
      });
    }

    if (this.filtersForm) {
      this.filtersForm.addEventListener('input', this.debouncedSubmitEvent.bind(this));

      this.filtersForm.addEventListener('theme:filter:range-update', this.updateRangeEvent);
    }

    if (this.collectionSortOptions) {
      this.collectionSortOptions.addEventListener('keyup', this.onTabHandlerEvent);
    }

    if (this.filterMode == 'tag' || this.filterMode == 'group' || !this.enableFilters) {
      return;
    }

    this.container.querySelectorAll(selectors.filterResetButton).forEach((button) => {
      button.addEventListener('click', this.onFilterResetClick, {once: true});
    });
  }

  /*
   * Render products on specific filter click event
   */
  onFilterResetClick(event) {
    event.preventDefault();
    this.renderSection(new URL(event.currentTarget.href).searchParams.toString());
  }

  /*
   * Bind filter title click events to toggle options visibility
   */
  bindToggleButtonsEvents() {
    this.container.querySelectorAll(selectors.toggleFilters).forEach((button) => {
      button.addEventListener('click', this.onFilterToggleClick);
    });
    this.container.querySelectorAll(selectors.closeFilters).forEach((button) => {
      button.addEventListener('click', this.hideFiltersDrawer);
    });
    this.container.querySelectorAll(selectors.openFilters).forEach((button) => {
      button.addEventListener('click', this.showFiltersDrawer);
    });

    this.container.querySelector(selectors.collectionWrapper)?.addEventListener('keyup', this.onKeyUpHandler);
  }

  onTabHandler(event) {
    if (event.code === theme.keyboardKeys.SPACE || event.code === theme.keyboardKeys.ENTER || event.code === theme.keyboardKeys.NUMPADENTER) {
      const newSortValue = event.target.previousElementSibling.value;

      this.filtersForm.querySelectorAll(selectors.inputSort).forEach((input) => {
        if (input.checked) {
          input.checked = false;
        }
        if (input.value === newSortValue) {
          input.checked = true;
        }
      });

      this.filtersForm.dispatchEvent(new Event('input', {bubbles: true}));
      event.target.dispatchEvent(new Event('click', {bubbles: true}));
    }
  }

  /*
   * Event handler on user ESC key press
   */
  onKeyUpHandler(event) {
    if (event.code === theme.keyboardKeys.ESCAPE) {
      this.hideFiltersDrawer();
    }
  }

  /*
   * Toggle filter options on title click
   */
  onFilterToggleClick(event) {
    event.preventDefault();
    setVars(); // Update css variables for correct filters drawer height

    const filtersVisible = this.filters.classList.contains(classes.collectionFiltersVisible);

    filtersVisible ? this.hideFiltersDrawer() : this.showFiltersDrawer();
  }

  sortDropdownToggle() {
    if (!this.collectionSortOptions) return;

    this.collectionSortOptions.classList.toggle(classes.collectionSortOptionWrapperVisible);
  }

  /*
   * Close the sort dropdown on button click outside the dropdown (for desktop)
   */
  bodyClick(event) {
    if (!this.collectionSortOptions) return;

    const isSortBar = this.sortToggle.contains(event.target);
    const isVisible = this.collectionSortOptions.classList.contains(classes.collectionSortOptionWrapperVisible);

    if (isVisible && !isSortBar) {
      this.sortDropdownToggle();
    }
  }

  updateCollectionFormSort(event) {
    const target = event.target;
    const newSortValue = target.value;
    const secondarySortBy = target.closest(selectors.collectionSortOptions);

    this.container.querySelectorAll(selectors.inputSort).forEach((input) => {
      if (input.value === newSortValue) {
        input.checked = true;
      }
    });

    if (secondarySortBy !== null) {
      this.filtersForm.dispatchEvent(new Event('input', {bubbles: true}));
    }
  }

  /*
   * Scroll down and open collection filters if they are hidden
   */
  showFiltersDrawer() {
    const instance = this;

    this.a11y.state.trigger = document.querySelector(selectors.toggleFilters);

    // Trap focus
    this.a11y.trapFocus({
      container: instance.filters,
    });

    this.mobileFiltersScrollLock();
  }

  /*
   * Scroll lock activation for filters drawer (on mobile)
   */
  mobileFiltersScrollLock() {
    // Open filters and scroll lock if only they are hidden on lower sized screens
    if (window.innerWidth < theme.sizes.small) {
      const scrollableElement = document.querySelector(selectors.filtersList);

      if (!this.filters.classList.contains(classes.collectionFiltersVisible)) {
        this.filters.classList.add(classes.collectionFiltersVisible);
      }

      document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: scrollableElement}));
    }
  }

  /*
   * Hide filter accordion elements on mobile
   */
  hideFiltersOnMobile() {
    const filterTriggers = this.container.querySelectorAll(`${selectors.collapsibleTrigger}:not(${selectors.showMoreTrigger})`);

    if (window.innerWidth < theme.sizes.small) {
      requestAnimationFrame(() => {
        filterTriggers.forEach((element) => {
          const isFilterActive = element.getAttribute(attributes.filterActive) === 'true';

          if (element.classList.contains(classes.isExpanded) && !isFilterActive) {
            element.dispatchEvent(new Event('click'));
          }
        });
      });
    }
  }

  /*
   * Show filter accordion elements on desktop if they should be opened by default
   */
  showFiltersOnDesktop() {
    const filterTriggers = this.container.querySelectorAll(`${selectors.collapsibleTrigger}:not(${selectors.showMoreTrigger})`);

    // "Default filter layout" states
    const filtersDefaultState = this.container.getAttribute(attributes.filtersDefaultState);
    const openFirstFilterOnly = filtersDefaultState === 'first-open';
    const openAllFilters = filtersDefaultState === 'open';
    const closeAllFilters = filtersDefaultState === 'closed';
    // When sorting is enabled the first `${filterTrigger}` element on mobile is a 'Sort by' button
    const firstTriggerIndex = this.enableSorting ? 1 : 0;

    filterTriggers.forEach((element, index) => {
      const isCurrentFilterExpanded = element.classList.contains(classes.isExpanded);
      const isCurrentFilterActive = element.getAttribute(attributes.filterActive) === 'true';
      // 'first-open' state conditions
      const isFirstClosed = !isCurrentFilterExpanded && index === firstTriggerIndex;
      const allElseExpanded = isCurrentFilterExpanded && index !== firstTriggerIndex;
      const shouldOpenFirst = openFirstFilterOnly && isFirstClosed;
      const shouldCloseAllExceptFirst = openFirstFilterOnly && allElseExpanded;
      // 'open' state conditions
      const shouldOpenAllClosedOnes = openAllFilters && !isCurrentFilterExpanded;
      const shouldOpenActiveOnes = isCurrentFilterActive && !isCurrentFilterExpanded && openAllFilters;
      // 'close' state conditions
      const shouldCloseExpandedOnes = closeAllFilters && isCurrentFilterExpanded;

      if (isCurrentFilterActive && !shouldOpenActiveOnes) return;

      if (shouldCloseExpandedOnes || shouldOpenFirst || shouldCloseAllExceptFirst || shouldOpenAllClosedOnes || shouldOpenActiveOnes) {
        element.dispatchEvent(new Event('click'));
      }
    });
  }

  /*
   * Hide filters drawer
   */
  hideFiltersDrawer() {
    let filtersVisible = this.filters.classList.contains(classes.collectionFiltersVisible);
    let loading = this.container.classList.contains(classes.isLoading);

    if (filtersVisible) {
      this.filters.classList.remove(classes.collectionFiltersVisible);
      this.a11y.removeTrapFocus();
    }

    // Enable page scroll if no loading state
    if (!loading) {
      document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true, detail: settings.loadingTimeout}));
    }
  }

  /*
   * Hiding the filters drawer on desktop & hiding the filters on mobile (showing only filter title)
   */
  filtersResizeEvents() {
    if (window.innerWidth >= theme.sizes.small) {
      this.showFiltersOnDesktop();
      this.hideFiltersDrawer();
    } else {
      this.hideFiltersOnMobile();
    }
  }

  /*
   * Show more functionality
   */
  filterShowMore() {
    this.showMore = this.container.querySelectorAll(selectors.showMore);
    if (this.showMore.length === 0) return;

    this.showMore.forEach((element) => {
      const filterCollapsibleTrigger = element.querySelector(selectors.collapsibleTrigger);
      const showMoreActions = element.querySelector(selectors.showMoreActions);

      if (!showMoreActions) return;

      const showMoreTrigger = showMoreActions.querySelector(selectors.showMoreTrigger);
      const showMoreContainer = showMoreActions.querySelector(selectors.showMoreContainer);
      const focusable = showMoreContainer.querySelectorAll(window.theme.focusable);
      const isShowMoreContainerExpanded = showMoreContainer.getAttribute(attributes.ariaExpanded) === 'true';

      if (!isShowMoreContainerExpanded) {
        focusable.forEach((item) => {
          item.setAttribute(attributes.tabIndex, '-1');
        });
      }

      showMoreTrigger.addEventListener('keyup', (event) => {
        if (event.code === theme.keyboardKeys.SPACE || event.code === theme.keyboardKeys.ENTER || event.code === theme.keyboardKeys.NUMPADENTER) {
          this.updateShowMoreFocusableElements(event, focusable);
        }
      });
      showMoreTrigger.addEventListener('click', (event) => {
        this.updateShowMoreFocusableElements(event, focusable);
      });

      filterCollapsibleTrigger.addEventListener('keyup', (event) => {
        if (event.code === theme.keyboardKeys.SPACE || event.code === theme.keyboardKeys.ENTER || event.code === theme.keyboardKeys.NUMPADENTER) {
          this.updateCollapsedContainerFocusableElements(filterCollapsibleTrigger, showMoreTrigger, focusable);
        }
      });
      filterCollapsibleTrigger.addEventListener('click', () => {
        this.updateCollapsedContainerFocusableElements(filterCollapsibleTrigger, showMoreTrigger, focusable);
      });
    });
  }

  /*
   * A11y: Update tabindex for all focusable elements in show-more collapsible containers,
   * on opening and closing events of their parent collapsible container
   * Solves wrongful tabbing in cases where a collapsible content is opened,
   * but it is located in another parent collapsible container that is closed
   */
  updateCollapsedContainerFocusableElements(filterCollapsibleTrigger, showMoreTrigger, focusable) {
    requestAnimationFrame(() => {
      const isFilterExpanded = filterCollapsibleTrigger.getAttribute(attributes.ariaExpanded) === 'true';
      const isShowMoreExpanded = showMoreTrigger.getAttribute(attributes.ariaExpanded) === 'true';

      focusable.forEach((item) => {
        if (!isFilterExpanded && isShowMoreExpanded) {
          item.setAttribute(attributes.tabIndex, '-1');
        }

        if (isFilterExpanded && isShowMoreExpanded) {
          item.removeAttribute(attributes.tabIndex);
        }
      });
    });
  }

  /*
   * A11y: Update tabindex for all focusable elements in show-more collapsible containers on opening and closing events
   * Double requestAnimationFrame method is used to make sure the collapsible content has already been expanded
   */
  updateShowMoreFocusableElements(event, focusable) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const isExpanded = event.target.getAttribute(attributes.ariaExpanded) === 'true';

        focusable.forEach((item, index) => {
          if (isExpanded) {
            item.removeAttribute(attributes.tabIndex);

            if (index === 0) item.focus();
            return;
          }
          item.setAttribute(attributes.tabIndex, '-1');
        });
      });
    });
  }

  /*
   * Init functions required when "Filter by tag/group" is selected from Collection page -> Collection pages -> Filter mode
   */
  initTagFilters() {
    if ((this.filterMode != 'tag' && this.filterMode != 'group') || !this.enableFilters) {
      return;
    }

    this.tags = this.container.dataset.tags.split('+').filter((item) => item);
    this.bindFilterTagButtonsEvents();
    this.bindSortChangeEvent();
  }

  /*
   * Render products when tag filter is selected
   */
  renderTagFiltersProducts(url) {
    this.startLoading();

    if (typeof this.endlessCollection === 'object') {
      this.endlessCollection.unload();
    }

    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = responseText;
        const parsedData = new DOMParser().parseFromString(html, 'text/html');
        const productsHTML = parsedData.querySelector(selectors.productGrid).innerHTML;
        const filtersHTML = parsedData.querySelector(selectors.filters).innerHTML;

        this.productGrid.innerHTML = productsHTML;
        this.filters.innerHTML = filtersHTML;
        this.inputSort = this.container.querySelectorAll(selectors.inputSort);
        this.filtersForm = document.querySelector(selectors.filtersForm);
        this.filterData = [...this.filterData, {html, url}];
        this.alreadyClicked = false;

        this.bindFilterTagButtonsEvents();
        this.bindFilterButtonsEvents();
        this.bindSortChangeEvent();
        this.bindToggleButtonsEvents();
        this.initProductGridEvents(theme.settings.enableInfinityScroll);
        this.updateProductsCount(html);
        this.mobileFiltersScrollLock();
        this.hideFiltersOnMobile();
        makeSwatches(this.container);
        this.collapsible = new Collapsible(this.container);
        this.filterShowMore();

        // Update page URL if supported by the browser
        if (history.replaceState) {
          window.history.pushState({path: url}, '', url);
        }
      })
      .catch((error) => {
        this.finishLoading();
        console.log(`Error: ${error}`);
      });
  }

  /*
   * Bind Filter by tag buttons
   */
  bindFilterTagButtonsEvents() {
    this.container.querySelectorAll(selectors.filterTagButton).forEach((button) => {
      button.addEventListener('click', this.onFilterTagButtonClick.bind(this));
    });

    this.container.querySelectorAll(selectors.filterTagClearButton).forEach((button) => {
      button.addEventListener('click', this.onFilterTagClearClick);
    });

    this.container.querySelectorAll(selectors.filterResetButton).forEach((button) => {
      button.addEventListener('click', this.onFilterTagResetClick);
    });
  }

  /*
   * Bind input Sort by change event for "filters by tag/group" only
   */
  bindSortChangeEvent() {
    this.container.querySelectorAll(selectors.inputSort).forEach((input) => {
      input.addEventListener('input', this.debouncedSortEvent.bind(this));
    });
  }

  /*
   * Filter by tag buttons click event
   */
  onFilterTagButtonClick(event) {
    event.preventDefault();
    if (this.alreadyClicked) {
      return;
    }
    this.alreadyClicked = true;
    const button = event.currentTarget;
    const selectedTag = button.dataset.tag;
    let isTagSelected = button.parentNode.classList.contains(classes.isActive);

    if (isTagSelected) {
      let tagIndex = this.tags.indexOf(selectedTag);

      button.parentNode.classList.remove(classes.isActive);

      if (tagIndex > -1) {
        this.tags.splice(tagIndex, 1);
      }
    } else {
      button.parentNode.classList.add(classes.isActive);

      this.tags.push(selectedTag);
    }

    let url = this.collectionHandle + '/' + this.tags.join('+') + '?sort_by=' + this.getSortValue();

    // Close filters dropdown on tag select
    this.container.querySelector(selectors.filter).classList.remove(classes.isExpanded);
    this.container.querySelector(selectors.filter).setAttribute(attributes.ariaExpanded, false);
    this.container.setAttribute('data-tags', '[' + this.tags + ']');
    this.renderTagFiltersProducts(url);
  }

  /*
   * Remove a specific tag filter
   */
  onFilterTagClearClick(event) {
    event.preventDefault();
    if (this.alreadyClicked) {
      return;
    }
    this.alreadyClicked = true;
    const button = event.currentTarget;
    const selectedTag = button.dataset.tag;
    const tagIndex = this.tags.indexOf(selectedTag);

    if (tagIndex > -1) {
      this.tags.splice(tagIndex, 1);
    }
    const url = this.collectionHandle + '/' + this.tags.join('+') + '?sort_by=' + this.getSortValue();

    this.container.setAttribute('data-tags', '[' + this.tags + ']');
    this.renderTagFiltersProducts(url);
  }

  /*
   * Re-render products with the new sort option selected
   */
  onSortChange() {
    let url = this.collectionHandle + '/' + this.tags.join('+') + '?sort_by=' + this.getSortValue();

    this.renderTagFiltersProducts(url);
  }

  /*
   * Get the selected sort option value
   */
  getSortValue() {
    let sortValue = '';
    this.inputSort.forEach((input) => {
      if (input.checked) {
        sortValue = input.value;
      }
    });

    return sortValue;
  }

  /*
   * Filter by tag reset button click event
   */
  onFilterTagResetClick(event) {
    event?.preventDefault();

    if (this.alreadyClicked) {
      return;
    }
    this.alreadyClicked = true;

    this.container.querySelectorAll(selectors.filterTag).forEach((element) => {
      element.classList.remove(classes.isActive);
    });

    this.container.querySelectorAll(selectors.filter).forEach((element) => {
      element.classList.remove(classes.isExpanded);
      element.setAttribute(attributes.ariaExpanded, false);
    });

    // Reset saved tags
    this.tags = [];
    this.container.setAttribute('data-tags', '');

    let url = this.collectionHandle + '/?sort_by=' + this.getSortValue();

    this.renderTagFiltersProducts(url);
  }

  /*
   * Get products container top position
   */
  getProductsOffsetTop() {
    return this.productGrid.getBoundingClientRect().top - document.body.getBoundingClientRect().top - this.filtersStickyBar.offsetHeight;
  }

  /*
   * Get collection page sticky bar top position
   */
  getStickyBarOffsetTop() {
    return this.filtersStickyBar.getBoundingClientRect().top - document.body.getBoundingClientRect().top;
  }

  /*
   * Init all the events required on product grid items
   */
  initProductGridEvents(infinityScroll) {
    if (infinityScroll) {
      this.initInfinityScroll();
      this.initProductGridEvents(false);
      return;
    }

    this.productGridEvents = new ProductGrid(this.container);

    this.initTooltips();

    // Stop loading animation
    setTimeout(() => {
      this.finishLoading();
    }, settings.loadingTimeout * 1.5);
  }

  /*
   * Init Infinity scroll functionality
   */
  initInfinityScroll() {
    const callback = () => this.initProductGridEvents(false);

    // For Search page filters, infinity scroll is mostly handled in Tabs
    if (this.isSearchPage) {
      if (!this.enableFilters) return;

      document.dispatchEvent(
        new CustomEvent('theme:tab:ajaxinate', {
          bubbles: true,
          detail: 'product',
        })
      );

      return;
    }

    if (typeof this.endlessCollection === 'object') {
      this.endlessCollection.unload();
    }
    this.endlessCollection = new Ajaxify(this.container);

    if (this.endlessCollection.endlessScroll.length === 0) return;
    this.endlessCollection.endlessScroll[0].settings.callback = callback;
  }

  /*
   * Show loading animation and lock body scroll
   */
  startLoading() {
    this.container.classList.add(classes.isLoading);

    if (window.innerWidth >= theme.sizes.small) {
      document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
    }

    let productsTop = this.getProductsOffsetTop();

    window.scrollTo({
      top: productsTop,
      left: 0,
      behavior: 'smooth',
    });
  }

  /*
   * Hide loading animation and unlock body scroll
   */
  finishLoading() {
    const popups = document.querySelectorAll(`${selectors.popupsSection} .${classes.popupVisible}`);
    const isPopupActive = popups.length > 0;

    this.container.classList.remove(classes.isLoading);

    // Unlock the scroll unless there is a visible popup or there are only popups of types 'bar' and 'cookie'
    if (isPopupActive) {
      let preventScrollPopupsCount = 0;
      [...popups].forEach((popup) => {
        if (popup.hasAttribute(attributes.preventScrollLock)) {
          preventScrollPopupsCount += 1;
        }
      });

      if (preventScrollPopupsCount === popups.length) {
        document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true, detail: settings.loadingTimeout}));
      }
    } else if (window.innerWidth >= theme.sizes.small) {
      document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true, detail: settings.loadingTimeout}));
    }
  }

  /*
   * On block:deselect event
   */
  onDeselect() {
    if (this.productGridEvents) {
      this.productGridEvents.onDeselect();
    }
  }

  /*
   * On section:unload event
   */
  onUnload() {
    if (typeof this.endlessCollection === 'object') {
      this.endlessCollection.unload();
    }

    if (this.productGridEvents) {
      this.productGridEvents.onUnload();
    }

    if (this.collapsible) {
      this.collapsible.onUnload();
    }

    if (this.rangeSlider) {
      this.rangeSlider.unload();
    }

    if (this.filters) {
      document.removeEventListener('theme:resize:width', this.resizeEvent);
    }
    document.removeEventListener('click', this.bodyClickEvent);

    if (this.groupTagFilters.length > 0) {
      this.onFilterTagResetClick();
    }

    this.finishLoading();
  }
}

const filters = {
  onLoad() {
    sections[this.id] = new Filters(this.container);
  },
  onDeselect() {
    sections[this.id].onDeselect();
  },
  onUnload() {
    sections[this.id].onUnload();
  },
};

export {filters, Filters};
