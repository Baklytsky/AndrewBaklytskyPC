class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);
    this.btnSubmit = this.querySelector('.facet__button-mobile-submit') || null;
    this.form = this.querySelector('facet-filters-form form') || null;
    this.modalDialog = this.querySelector('modal-dialog') || null;
    this.windowWidth = window.innerWidth;
    this.showMoreElements = this.querySelectorAll('show-more') || null;
    this.modal = this.querySelector('modal-dialog') || null;
    const facetForm = this.querySelector('form');

    window.addEventListener("resize", () => {
      this.windowWidth = window.innerWidth

      if (window.innerWidth > 1023) {
        this.modal.hide();
      }
    });

    this.showMoreElements.forEach(item => {
      document.addEventListener("expanded", () => {
        setTimeout(FacetFiltersForm.changeGridHeight, 500);
      });
    })

    FacetFiltersForm.changeGridHeight();
    this.scrollToLinkListItem();

    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
      FacetFiltersForm.changeGridHeight();
    }, 500);

    facetForm.addEventListener('input', (event) => {
      if (this.windowWidth <= 749 && event.target.hasAttribute("data-disable-event-mobile")) return;
      this.debouncedOnSubmit.call(this, event)
    });

    facetForm.addEventListener('change', (event) => {
      if (this.windowWidth <= 749 && event.target.hasAttribute("data-disable-event-mobile")) return;
      this.debouncedOnSubmit.call(this, event)
      this.setAnalyticEvent(event);
    });

    if (!this.btnSubmit) return;

    this.btnSubmit.addEventListener('click', (event) => {
      event.preventDefault();

      this.debouncedOnSubmit.call(this, event);
      this.modalDialog.hide();
    });
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state ? event.state.searchParams : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    }
    window.addEventListener('popstate', onHistoryChange);
  }

  static toggleActiveFacets(disable = true) {
    document.querySelectorAll('.js-facet-remove').forEach((element) => {
      element.classList.toggle('disabled', disable);
    });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const section = FacetFiltersForm.getSections();
    const url = `${window.location.pathname}?section_id=${section[0].section}&${searchParams}`;
    const filterDataUrl = element => element.url === url;

    FacetFiltersForm.filterData.some(filterDataUrl) ? FacetFiltersForm.renderSectionFromCache(filterDataUrl, event) : FacetFiltersForm.renderSectionFromFetch(url, event);
    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then(response => response.text())
      .then((responseText) => {
        const html = responseText;
        FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, {html, url}];
        FacetFiltersForm.renderFilters(html, event);
        FacetFiltersForm.renderProductGridContainer(html);
        FacetFiltersForm.renderProductCount(html);
        FacetFiltersForm.renderProductFilterCounter(html);
        FacetFiltersForm.changeGridHeight();

        if(AOS) AOS.refresh();
      });
  }

  static renderSectionFromCache(filterDataUrl, event) {
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    FacetFiltersForm.renderProductCount(html);
    FacetFiltersForm.renderProductFilterCounter(html);
  }

  static renderProductFilterCounter(html) {
    document.getElementById('FilterCount').innerHTML = new DOMParser().parseFromString(html, 'text/html').getElementById('FilterCount').innerHTML;
  }

  static renderProductGridContainer(html) {
    document.getElementById('ProductGridContainer').innerHTML = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductGridContainer').innerHTML;
  }

  static renderProductCount(html) {
    const count = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductCount').innerHTML
    const container = document.getElementById('ProductCount');
    container.innerHTML = count;
  }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
    const facetDetailsElements = parsedHTML.querySelectorAll('#FacetFiltersForm .js-filter');
    const facetsToRender = Array.from(facetDetailsElements);

    facetsToRender.forEach((element) => {
      document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`).innerHTML = element.innerHTML;
    });

    FacetFiltersForm.renderActiveFacets(parsedHTML);
  }

  static renderActiveFacets(html) {
    const activeFacetsElement = html.querySelector('.active-facets');
    if (!activeFacetsElement) return;
    document.querySelector('.active-facets').innerHTML = activeFacetsElement.innerHTML;

    FacetFiltersForm.toggleActiveFacets(false);
  }

  static updateURLHash(searchParams) {
    if (FacetFiltersForm.searchParamsInitial.length) searchParams+=`&${FacetFiltersForm.searchParamsInitial}`
    history.pushState({searchParams}, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  static getSections() {
    return [
      {
        section: document.getElementById('product-grid').dataset.id,
      }
    ]
  }

  static changeGridHeight() {
    const facetsHeight = document.querySelector('.facets__wrapper--vertical') || null;

    if (facetsHeight) {
      document.documentElement.style.setProperty('--facets-height', facetsHeight.getBoundingClientRect().height + 'px');
    }
  }

  scrollToLinkListItem () {
    if (window.location.pathname) {
      const activeLinkItem = document.querySelector('.list-menu__item.facets__item.active') || null;
      const linkList = document.querySelector('.facets-inner--collections-list') || null;

      if (activeLinkItem && linkList) {
        linkList.scrollLeft = activeLinkItem.getBoundingClientRect().left - 20;
      }
    }
  }

  createSearchParams(form) {
    const formData = new FormData(form);
    let newUrl = new URLSearchParams(formData).toString();

    return this.addPhysicianParams(newUrl);
  }

  onSubmitForm(searchParams, event) {
    FacetFiltersForm.renderPage(searchParams, event);
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const sortFilterForms = document.querySelectorAll('facet-filters-form form');
    const forms = [];

    sortFilterForms.forEach((form) => {
      forms.push(this.createSearchParams(form));
    });

    this.onSubmitForm(forms.join('&'), event)
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    let url = event.currentTarget.href.indexOf('?') == -1 ? '' : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);

    FacetFiltersForm.renderPage(this.addPhysicianParams(url));
  }

  addPhysicianParams(url){
    if (window.location.href.includes('physician=true')) {
      return  url + "&physician=true";
    } else {
      return  url
    }
  }

  setAnalyticEvent(event) {
    let eventData = {};

    if (event.target.dataset.sortByInput) {
      eventData = {
        'event': 'sort_by',
        'search': {
          'sort_option': event.target.value
        }
      }
    } else {
      let refineByAction = event.target.checked ? 'Select' : 'De-select';
      sessionStorage.setItem('ga_refine_by_action', refineByAction);
      sessionStorage.setItem('ga_select_item_refine_by_action', refineByAction);
      eventData = {
        'event': 'refine_by',
        'search': {
          'refine': {
            'refine_by_category': event.target.dataset.category ? event.target.dataset.category.trim() : '',
            'refine_by_item': event.target.value || '',
            'refine_by_action': refineByAction
          }
        }
      }
    }
    window.dataLayer.push(eventData);
  }
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);

customElements.define('facet-filters-form', FacetFiltersForm);
FacetFiltersForm.setListeners();

class FacetRemove extends HTMLElement {
  constructor() {
    super();
    const facetLink = this.querySelector('a');

    if (!facetLink) return;

    facetLink.setAttribute('role', 'button');
    facetLink.addEventListener('click', this.closeFilter.bind(this));
    facetLink.addEventListener('keyup', (event) => {
      event.preventDefault();
      if (event.code.toUpperCase() === 'SPACE') this.closeFilter(event);
    });
  }

  changeGridHeight() {
    document.documentElement.style.setProperty('--facets-height', document.querySelector('.facets__wrapper--vertical').getBoundingClientRect().height + 'px');
  }

  closeFilter(event) {
    event.preventDefault();
    this.changeGridHeight()
    const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
    form.onActiveFilterClick(event);
    this.setAnalyticEvent(event);
  }

  setAnalyticEvent(event) {
    let eventData = {};
    let refineByAction = 'Remove Filter';
    if (event.target.classList.contains('facets__clear')) {
      refineByAction = 'Clear All';
      eventData = {
        'event': 'refine_by',
        'search': {
          'refine': {
            'refine_by_category': '',
            'refine_by_item': event.target.dataset.activeFilters || '',
            'refine_by_action': refineByAction
          }
        }
      }
    } else {
      eventData = {
        'event': 'refine_by',
        'search': {
          'refine': {
            'refine_by_category': event.target.closest('facet-remove').getAttribute('data-active-category') || '',
            'refine_by_item': event.target.closest('facet-remove').getAttribute('data-active-value') || '',
            'refine_by_action': refineByAction
          }
        }
      }
    }

    sessionStorage.setItem('ga_refine_by_action', refineByAction);
    sessionStorage.setItem('ga_select_item_refine_by_action', refineByAction);
    window.dataLayer.push(eventData);
  }
}

customElements.define('facet-remove', FacetRemove);
