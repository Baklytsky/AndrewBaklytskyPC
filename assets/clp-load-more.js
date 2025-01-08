if (!customElements.get('clp-load-more')) {
  customElements.define('clp-load-more', class ClpLoadMore extends HTMLElement {
    constructor() {
      super();

      this.selectors = {
        hiddenItems: '.grid__item.grid__item--hidden'
      }

      this.productsPerPage = Number(this.dataset.productsPerPage);
      this.target = this.dataset.targetWrapper;
      this.container = document.querySelector(`${this.target}`);

      if (isNaN(this.productsPerPage) || !this.target || !this.container) return;
      this.hiddenCards = this.container.querySelectorAll(this.selectors.hiddenItems);

      if (!this.hiddenCards.length) return;
      this.init();
    }

    sortHiddenCards() {
      this.hiddenCards = [...this.hiddenCards].sort((a, b) => {
        return Number(a.dataset.order) - Number(b.dataset.order);
      })
    }

    init() {
      this.sortHiddenCards()
      const options = {
        root: null,
        threshold: .01
      }

      const observer = new IntersectionObserver((entries) => {

        if (!this.hiddenCards.length) {
          observer.disconnect();
          this.classList.remove('is-visible');
          return false;
        }

        entries.forEach(entry => {
          if (entry.isIntersecting) this.loadMore();
        })
      }, options)

      observer.observe(this);
    }

    loadMore() {
      this.classList.add('is-visible');
      const elToShow = Array.from(this.hiddenCards).slice(0, this.productsPerPage);
      elToShow.forEach((item) => item.classList.remove('grid__item--hidden'));
      this.hiddenCards = this.container.querySelectorAll(this.selectors.hiddenItems);
      this.sortHiddenCards()
      this.classList.remove('is-visible');
    }
  })
}