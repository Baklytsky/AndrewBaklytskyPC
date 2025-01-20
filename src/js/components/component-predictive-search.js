class PredictiveSearch extends HTMLElement {
  constructor() {
    super();
    this.cachedResults = {};
    this.input = this.querySelector('input[type="search"]');
    this.predictiveSearchResults = this.querySelector('[data-predictive-search]');
    this.openModalBtn = document.querySelector('.header__icon--search');
    this.closeModalBtn = document.querySelectorAll('[data-close-search]');
    this.modal = document.querySelector('.search-modal');
    this.headerOverlay = document.querySelector('.header-overlay');
    this.header = document.querySelector('.header-section');
    this.announcementBar = document.querySelector('.announcement-bar');
    this.isOpenResults = false;
    this.searchByParameter = this.classList.contains('search-modal__form--blog') ? 'article' : 'product';

    this.eventListeners();
  }

  eventListeners() {
    const form = this.querySelector('form.search');
    form.addEventListener('submit', this.onFormSubmit.bind(this));

    this.openModalBtn.addEventListener('click', this.openModal.bind(this));

    this.closeModalBtn.forEach((btn) => {
      btn.addEventListener('click', this.closeModal.bind(this));
    })

    this.input.addEventListener('input', debounce((event) => {
      this.onChange(event);
    }, 300).bind(this));

    this.input.addEventListener('focus', this.onFocus.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.predictiveSearchResults.addEventListener('click', this.clearResults.bind(this));
    this.modal.addEventListener('scroll', this.unFocusInput.bind(this));
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

  isModalOpen() {
    return this.modal.getAttribute('aria-expanded') === 'true';
  }

  onBodyClick(event) {
    if (!this.modal.contains(event.target) && !this.openModalBtn.contains(event.target)) this.closeModal();
  }

  setInputFocus() {
    if (window.isIosDevice) {
      const hiddenInput = document.createElement('input');
      hiddenInput.style.position = 'fixed';
      hiddenInput.style.top = '0';
      hiddenInput.style.left = '0';
      hiddenInput.style.opacity = '0';
      hiddenInput.style.height = '0';

      document.body.appendChild(hiddenInput);
      hiddenInput.focus();
      setTimeout(()=> {
        this.input.focus()
        this.input.click()
        hiddenInput.remove();
      }, 300);
    } else {
      setTimeout(()=>{this.input.focus()}, 300)
    }
  }

  openModal() {
    this.onBodyClickEvent = this.onBodyClickEvent || this.onBodyClick.bind(this);
    document.body.classList.add('search-opened');
    document.body.addEventListener('click', this.onBodyClickEvent);
    document.querySelector('.mobile-menu-opener').classList.add('hidden');
    document.querySelector('.header-menu .search-modal__close').classList.remove('hidden');
    this.setInputFocus();
    this.resetNavHeight();
  }

  closeModal() {
    document.querySelectorAll('modal-dialog [data-popup][aria-hidden=false]').forEach(popup => {
      popup.closest('modal-dialog').hide()
    })
    document.body.classList.remove('search-opened');
    document.body.removeEventListener('click', this.onBodyClickEvent);
    document.querySelector('.mobile-menu-opener').classList.remove('hidden');
    document.querySelector('.header-menu .search-modal__close').classList.add('hidden');
    this.hideResults(true);
  }

  getQuery() {
    return this.input.value.trim();
  }

  onChange() {
    const searchTerm = this.getQuery();

    if (!searchTerm.length) {
      this.hideResults(true);
      return;
    }

    this.getSearchResults(searchTerm, this.searchByParameter);
  }

  onFormSubmit(event) {
    if (!this.getQuery().length || this.querySelector('[aria-selected="true"] a')) event.preventDefault();
  }

  onFocus() {
    const searchTerm = this.getQuery();

    if (!searchTerm.length) return;

    if (this.getAttribute('results') === 'true') {
      this.showResults();
    } else {
      this.getSearchResults(searchTerm, this.searchByParameter);
    }
  }

  onFocusOut() {
    setTimeout(() => {
      if (!this.contains(document.activeElement)) this.hideResults();
    })
  }

  getSearchResults(searchTerm, searchParam) {
    const queryKey = searchTerm.replace(" ", "-").toLowerCase();
    const encodeSearchTerm = encodeURIComponent(searchTerm);
    const encodeResourcesType = `${encodeURIComponent('resources[type]')}=${searchParam}`;
    const encodeResourcesLimit = `${encodeURIComponent('resources[limit]')}=8`;
    this.setLiveRegionLoadingState();

    if (this.cachedResults[queryKey]) {
      this.renderSearchResults(this.cachedResults[queryKey]);
      return;
    }

    fetch(`${routes.predictive_search_url}?q=${encodeSearchTerm}&${encodeResourcesType}&${encodeResourcesLimit}&section_id=predictive-search`)
      .then((response) => {
        if (!response.ok) {
          var error = new Error(response.status);
          this.hideResults();
          throw error;
        }

        return response.text();
      })
      .then((text) => {
        const resultsMarkup = new DOMParser().parseFromString(text, 'text/html').querySelector('#shopify-section-predictive-search').innerHTML;
        this.cachedResults[queryKey] = resultsMarkup;
        this.renderSearchResults(resultsMarkup);
      })
      .catch((error) => {
        this.hideResults();
        throw error;
      });
  }

  setLiveRegionLoadingState() {
    this.statusElement = this.statusElement || this.querySelector('.predictive-search-status');
    this.loadingText = this.loadingText || this.getAttribute('data-loading-text');

    this.setLiveRegionText(this.loadingText);
    this.setAttribute('loading', 'true');
  }

  setLiveRegionText(statusText) {
    this.statusElement.setAttribute('aria-hidden', 'false');
    this.statusElement.textContent = statusText;

    setTimeout(() => {
      this.statusElement.setAttribute('aria-hidden', 'true');
    }, 1000);
  }

  renderSearchResults(resultsMarkup) {
    this.predictiveSearchResults.innerHTML = resultsMarkup;
    this.setAttribute('results', 'true');

    this.setLiveRegionResults();
    this.showResults();
  }

  setLiveRegionResults() {
    this.removeAttribute('loading');
    this.setLiveRegionText(this.querySelector('[data-predictive-search-live-region-count-value]').textContent);
  }

  showResults() {
    this.setAttribute('open', 'true');
    this.input.setAttribute('aria-expanded', 'true');
    this.isOpenResults = true;
  }

  hideResults(clearSearchTerm = false) {
    if (clearSearchTerm) {
      this.input.value = '';
      this.removeAttribute('results');
    }

    const selected = this.querySelector('[aria-selected="true"]');

    if (selected) selected.setAttribute('aria-selected', 'false');

    this.input.setAttribute('aria-activedescendant', '');
    this.removeAttribute('open');
    this.input.setAttribute('aria-expanded', 'false');
    this.resultsMaxHeight = false
    this.predictiveSearchResults.removeAttribute('style');

    this.isOpenResults = false;
  }

  clearResults(e) {
    if (e.target.classList.contains('predictive-search-results__clear')) {
      this.hideResults(true)
      this.setInputFocus();
    }
  }

  unFocusInput() {
    this.input.blur();
  }
}

customElements.define('predictive-search', PredictiveSearch);
