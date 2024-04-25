import debounce from '../util/debounce';

const selectors = {
  inputSearch: 'input[type="search"]',
  inputType: 'input[name="type"]',
  form: 'form',
  allVisibleElements: '[role="option"]',
  ariaSelected: '[aria-selected="true"]',
  selectedOption: '[aria-selected="true"] a, button[aria-selected="true"]',
  popularSearches: '[data-popular-searches]',
  popdownBody: '[data-popdown-body]',
  mainInputSearch: '[data-main-input-search]',
  predictiveSearchResults: '[data-predictive-search-results]',
  predictiveSearch: 'predictive-search',
  searchForm: 'search-form',
};

const classes = {
  isSearched: 'is-searched',
  templateSearch: 'template-search',
};

export default class SearchForm extends HTMLElement {
  constructor() {
    super();

    this.input = this.querySelector(selectors.inputSearch);
    this.form = this.querySelector(selectors.form);
    this.popdownBody = this.closest(selectors.popdownBody);
    this.popularSearches = this.popdownBody?.querySelector(selectors.popularSearches);
    this.predictiveSearchResults = this.querySelector(selectors.predictiveSearchResults);
    this.predictiveSearch = this.matches(selectors.predictiveSearch);
    this.searchForm = this.matches(selectors.searchForm);
    this.selectedElement = null;
    this.activeElement = null;
    this.searchTerm = '';
    this.currentSearchTerm = '';
    this.isSearchPage = document.body.classList.contains(classes.templateSearch);

    this.input.addEventListener(
      'input',
      debounce((event) => {
        this.onChange(event);
      }, 300).bind(this)
    );

    this.input.addEventListener('focus', this.onFocus.bind(this));
    this.input.form.addEventListener('submit', this.onFormSubmit.bind(this));
    this.addEventListener('keyup', this.onKeyup.bind(this));
    this.addEventListener('keydown', this.onKeydown.bind(this));

    if (this.isSearchPage) {
      this.mainInputType = document.querySelector(`${selectors.mainInputSearch} ${selectors.inputType}`);
      this.inputType = this.querySelector(selectors.inputType);
      this.inputType.value = this.mainInputType.value;
    }
  }

  getQuery() {
    return this.input.value.trim();
  }

  onFocus() {
    this.currentSearchTerm = this.getQuery();
  }

  onChange() {
    this.classList.toggle(classes.isSearched, !this.isFormCleared());
    this.searchTerm = this.getQuery();
  }

  isFormCleared() {
    return this.input.value.length === 0;
  }

  submit() {
    this.form.submit();
  }

  reset() {
    this.input.val = '';
  }

  onFormSubmit(event) {
    if (!this.getQuery().length || this.querySelector(selectors.selectedLink)) event.preventDefault();
  }

  onKeydown(event) {
    // Prevent the cursor from moving in the input when using the up and down arrow keys
    if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
      event.preventDefault();
    }
  }

  onKeyup(event) {
    if (!this.getQuery().length && this.predictiveSearch) {
      this.close(true);
    }
    event.preventDefault();

    switch (event.code) {
      case 'ArrowUp':
        this.switchOption('up');
        break;
      case 'ArrowDown':
        this.switchOption('down');
        break;
      case 'Enter':
        this.selectOption();
        break;
    }
  }

  switchOption(direction) {
    const moveUp = direction === 'up';
    const predictiveSearchOpened = this.classList.contains(classes.isSearched) && this.predictiveSearchResults;

    const visibleElementsContainer = predictiveSearchOpened ? this.predictiveSearchResults : this.popularSearches;

    if (!visibleElementsContainer) return;
    this.selectedElement = visibleElementsContainer.querySelector(selectors.ariaSelected);

    // Filter out hidden elements
    const allVisibleElements = Array.from(visibleElementsContainer.querySelectorAll(selectors.allVisibleElements)).filter((element) => element.offsetParent !== null);

    let activeElementIndex = 0;

    if (moveUp && !this.selectedElement) return;

    let selectedElementIndex = -1;
    let i = 0;

    while (selectedElementIndex === -1 && i <= allVisibleElements.length) {
      if (allVisibleElements[i] === this.selectedElement) {
        selectedElementIndex = i;
      }
      i++;
    }

    if (!moveUp && this.selectedElement) {
      activeElementIndex = selectedElementIndex === allVisibleElements.length - 1 ? 0 : selectedElementIndex + 1;
    } else if (moveUp) {
      activeElementIndex = selectedElementIndex === 0 ? allVisibleElements.length - 1 : selectedElementIndex - 1;
    }

    if (activeElementIndex === selectedElementIndex) return;

    this.activeElement = allVisibleElements[activeElementIndex];
    this.handleFocusableDescendants();
  }

  selectOption() {
    const selectedOption = this.querySelector(selectors.selectedOption);

    if (selectedOption) selectedOption.click();
  }

  handleFocusableDescendants(reset = false) {
    const selected = this.selectedElement ? this.selectedElement : this.querySelector(selectors.ariaSelected);
    if (selected) selected.setAttribute('aria-selected', false);

    if (!this.activeElement || reset) {
      this.selectedElement = null;
      this.activeElement?.setAttribute('aria-selected', false);
      this.input.setAttribute('aria-expanded', false);
      this.input.setAttribute('aria-activedescendant', '');
      return;
    }

    this.activeElement.setAttribute('aria-selected', true);
    this.input.setAttribute('aria-activedescendant', this.activeElement.id);
  }
}

customElements.define('search-form', SearchForm);
