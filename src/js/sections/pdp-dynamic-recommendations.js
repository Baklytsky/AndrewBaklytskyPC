class dynamicRecommendations extends HTMLElement {
  constructor() {
    super();
    this.productId = this.getAttribute('data-product-id');
    this.limit = this.getAttribute('data-product-limit');
    this.sectionId = this.getAttribute('data-section-id');
    this.recommendationContainer = this.querySelector('[data-product-row]');
    this.recommendUrl = `${window.location.origin}/recommendations/products?product_id=${this.productId}&limit=${this.limit}&section_id=${this.sectionId}`;
    this.loadRecommendations();
  }

  loadRecommendations() {
    fetch(this.recommendUrl)
        .then(response => response.text())
        .then((text) => {
          const html = new DOMParser().parseFromString(text, 'text/html'),
              recommendedContent = html.querySelector('[data-product-row]');
          if (recommendedContent) this.recommendationContainer.innerHTML = recommendedContent.innerHTML;
        })
      .then(window.checkPhysicianFinderParam);
  }
}

customElements.define('dynamic-recommendations', dynamicRecommendations);
