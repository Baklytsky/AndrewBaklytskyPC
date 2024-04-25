import SearchForm from './search-form';

const selectors = {
  predictiveSearch: 'predictive-search',
  sectionPredictiveSearch: '#shopify-section-api-predictive-search',
  predictiveSearchResults: '[data-predictive-search-results]',
  predictiveSearchStatus: '[data-predictive-search-status]',
  searchResultsLiveRegion: '[data-predictive-search-live-region-count-value]',
  searchResultsWrapper: '[data-search-results-wrapper]',
};

const classes = {
  reset: 'reset',
};

class PredictiveSearch extends SearchForm {
  constructor() {
    super();

    this.abortController = new AbortController();
    this.allPredictiveSearchInstances = document.querySelectorAll(selectors.predictiveSearch);
    this.predictiveSearchResults = this.querySelector(selectors.predictiveSearchResults);
    this.cachedResults = {};
  }

  connectedCallback() {
    this.predictiveSearchResults.addEventListener('transitionend', (event) => {
      if (event.target === this.predictiveSearchResults && !this.getQuery().length) {
        this.classList.remove(classes.reset);
        requestAnimationFrame(() => this.clearResultsHTML());
      }
    });
  }

  onChange() {
    super.onChange();
    this.classList.remove(classes.reset);

    if (!this.searchTerm.length) {
      this.classList.add(classes.reset);
      return;
    }

    requestAnimationFrame(() => this.getSearchResults(this.searchTerm));
  }

  onFocus() {
    super.onFocus();

    if (!this.currentSearchTerm.length) return;

    if (this.searchTerm !== this.currentSearchTerm) {
      // Search term was changed from other search input, treat it as a user change
      this.onChange();
    } else if (this.getAttribute('results') === 'true') {
      this.open();
    } else {
      this.getSearchResults(this.searchTerm);
    }
  }

  getSearchResults(searchTerm) {
    const queryKey = searchTerm.replace(' ', '-').toLowerCase();
    const suggestionsResultsLimit = parseInt(window.theme.settings.suggestionsResultsLimit);
    let resources = 'query';
    resources += window.theme.settings.suggestArticles ? ',article' : '';
    resources += window.theme.settings.suggestCollections ? ',collection' : '';
    resources += window.theme.settings.suggestProducts ? ',product' : '';
    resources += window.theme.settings.suggestPages ? ',page' : '';

    this.setLiveRegionLoadingState();

    if (this.cachedResults[queryKey]) {
      this.renderSearchResults(this.cachedResults[queryKey]);
      return;
    }

    fetch(`${theme.routes.predictiveSearchUrl}?q=${encodeURIComponent(searchTerm)}&resources[type]=${resources}&resources[limit]=${suggestionsResultsLimit}&section_id=api-predictive-search`, {
      signal: this.abortController.signal,
    })
      .then((response) => {
        if (!response.ok) {
          var error = new Error(response.status);
          this.close();
          throw error;
        }

        return response.text();
      })
      .then((text) => {
        const resultsMarkup = new DOMParser().parseFromString(text, 'text/html').querySelector(selectors.sectionPredictiveSearch).innerHTML;
        // Save bandwidth keeping the cache in all instances synced
        this.allPredictiveSearchInstances.forEach((predictiveSearchInstance) => {
          predictiveSearchInstance.cachedResults[queryKey] = resultsMarkup;
        });
        this.renderSearchResults(resultsMarkup);
      })
      .catch((error) => {
        if (error?.code === 20) {
          // Code 20 means the call was aborted
          return;
        }
        this.close();
        throw error;
      });
  }

  switchOption(direction) {
    super.switchOption(direction);

    if (this.statusElement) this.statusElement.textContent = '';
  }

  setLiveRegionLoadingState() {
    this.statusElement = this.statusElement || this.querySelector(selectors.predictiveSearchStatus);
    this.loadingText = this.loadingText || this.getAttribute('data-loading-text');

    this.setLiveRegionText(this.loadingText);
    this.setAttribute('loading', true);
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

    this.setAttribute('results', true);

    this.setLiveRegionResults();
    this.open();
  }

  setLiveRegionResults() {
    this.removeAttribute('loading');
    this.setLiveRegionText(this.querySelector(selectors.searchResultsLiveRegion).textContent);
  }

  open() {
    this.setAttribute('open', true);
  }

  close(clearSearchTerm = false) {
    this.closeResults(clearSearchTerm);
  }

  closeResults(clearSearchTerm = false) {
    if (clearSearchTerm) {
      this.reset();
      this.removeAttribute('results');
      this.classList.remove(classes.reset);
    }

    this.removeAttribute('loading');
    this.removeAttribute('open');
  }

  clearResultsHTML() {
    this.predictiveSearchResults.innerHTML = '';
  }
}

customElements.define('predictive-search', PredictiveSearch);
