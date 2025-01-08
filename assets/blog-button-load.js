if (!customElements.get('blog-button-load')) {
  customElements.define('blog-button-load', class BlogButtonLoad extends HTMLElement {
    constructor() {
      super();

      this.triggerSelector = 'a';
      this.historyReplaceValue = this.dataset.historyReplace === 'true';
      this.targetContainerSelector = this.dataset.targetContainer;
      this.targetContainerAddSelector = this.dataset.contentAdd;
      this.removeAfter = this.dataset.remove === 'true';
      this.targetContainer = document.querySelector(this.targetContainerSelector);
      this.targetSectionId = this.targetContainer?.dataset.sectionId;
      this.wrapperSiblingsElements = this.dataset.wrapperSiblingsElements;
      this.triggerElement = this.querySelector(this.triggerSelector);
      this.urlQuerySymbol = this.targetContainerAddSelector ? '&' : '?';
      this.url = this.targetSectionId ? `${this.triggerElement.href}${this.urlQuerySymbol}sections=${this.targetSectionId}` : '';

      this.init();
    }

    init() {
      if (!this.triggerElement || !this.url || !this.targetContainer) {this.style.display = 'none'; return false;}

      this.triggerElement.addEventListener('click', (evt) => {
        evt.preventDefault();

        this.getData();
      });
    }

    getData() {
      if (window.location.href === this.triggerElement.href) return false;

      fetch(this.url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        return response.json();
      }).then(data => {
        const newHtml = new DOMParser().parseFromString(data[this.targetSectionId], 'text/html');

        this.changeContent(newHtml);
      })
    }

    changeContent(html) {
      this.siblingsElementsChange();
      this.historyReplace();

      if (this.removeAfter) this.remove();

      if (this.targetContainerAddSelector) {
        const newElements = Array.from(html.querySelectorAll(`${this.targetContainerSelector} ${this.targetContainerAddSelector} > div`));
        const newButton = html.querySelector(`${this.targetContainerSelector} blog-button-load`);

        this.targetContainer.querySelector(this.targetContainerAddSelector).append(...newElements);
        if (newButton) this.targetContainer.append(newButton);

      } else this.targetContainer.innerHTML = html.querySelector(this.targetContainerSelector).innerHTML;

    }

    siblingsElementsChange() {
      if (!this.wrapperSiblingsElements) return false;

      document.querySelectorAll(`${this.wrapperSiblingsElements} ${this.triggerSelector}`).forEach(el => {
        if (el.isEqualNode(this.triggerElement)) {
          el.classList.add('active');
        } else el.classList.remove('active');
      });
    }

    historyReplace() {
      if (!this.historyReplaceValue) return false;

      window.history.pushState(null, null, this.triggerElement.href);
    }
  });
}
