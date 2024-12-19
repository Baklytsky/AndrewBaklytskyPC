const selectors = {
  apiRelatedProductsTemplate: '[data-api-related-template]',
  productItem: '.product-item',
  relatedProduct: '[data-grid-item]',
  relatedSection: '[data-related-section]',
  recentlyViewed: 'recently-viewed',
  slider: 'grid-slider',
  wrapper: '[data-recently-viewed-wrapper]',
};

const attributes = {
  limit: 'data-limit',
  minimum: 'data-minimum',
  productId: 'data-product-id',
};

const classes = {
  isHidden: 'is-hidden',
  gridMobileSlider: 'grid--mobile-slider',
};

if (!customElements.get('related-products')) {
  customElements.define(
    'related-products',
    class Related extends HTMLElement {
      constructor() {
        super();

        this.sectionId = this.id;
        this.relatedItems = 0;
        this.wrapper = this.querySelector(selectors.wrapper);
        this.recentlyViewed = this.querySelector(selectors.recentlyViewed);
      }

      connectedCallback() {
        this.loadRelatedProducts();
        this.loadRecentlyViewedProducts();
      }

      loadRelatedProducts() {
        const relatedSection = this.querySelector(selectors.relatedSection);
        if (!relatedSection) return;

        const productId = relatedSection.getAttribute(attributes.productId);
        const limit = relatedSection.getAttribute(attributes.limit);
        const requestUrl = `${window.theme.routes.product_recommendations_url}?section_id=api-product-recommendation&limit=${limit}&product_id=${productId}&intent=related`;

        fetch(requestUrl)
          .then((response) => response.text())
          .then((data) => this.handleRelatedProductsResponse(data, relatedSection))
          .catch(() => this.hideSection(relatedSection));
      }

      handleRelatedProductsResponse(data, relatedSection) {
        const relatedContent = document.createElement('div');
        relatedContent.innerHTML = new DOMParser().parseFromString(data, 'text/html').querySelector(selectors.apiRelatedProductsTemplate).innerHTML;
        const relatedProducts = relatedContent.querySelectorAll(selectors.relatedProduct).length;

        if (relatedProducts > 0) {
          relatedSection.innerHTML = relatedContent.innerHTML;
          this.relatedItems = relatedProducts;

          const styleMobile = parseInt(relatedSection.style.getPropertyValue('--COLUMNS-MOBILE'));
          if (styleMobile === 0) {
            const addedProduct = relatedSection.querySelector(selectors.relatedProduct);
            addedProduct.parentElement.classList.add(classes.gridMobileSlider);
          }
        } else {
          this.hideSection(relatedSection);
        }

        this.updateVisibility();
      }

      loadRecentlyViewedProducts() {
        this.recentlyViewed.addEventListener('theme:recently-viewed:loaded', () => {
          this.handleRecentlyViewedResponse();
        });
      }

      handleRecentlyViewedResponse() {
        const minimumNumberProducts = parseInt(this.recentlyViewed.dataset.minimum);
        const recentProducts = this.recentlyViewed.querySelectorAll(selectors.productItem);
        const slider = this.recentlyViewed.querySelector(selectors.slider);
        const checkRecentInRelated = !this.wrapper && recentProducts.length > 0;
        const checkRecentOutsideRelated = this.wrapper && recentProducts.length >= minimumNumberProducts;

        if (checkRecentInRelated || checkRecentOutsideRelated) {
          if (checkRecentOutsideRelated) {
            this.wrapper.classList.remove(classes.isHidden);
          }

          this.recentlyViewed.classList.remove(classes.isHidden);
          this.recentlyViewed.dispatchEvent(new CustomEvent('theme:tab:check', {bubbles: true}));

          if (slider) {
            slider.dispatchEvent(new CustomEvent('theme:grid-slider:init', {bubbles: true}));
          }
        }

        this.updateVisibility();
      }

      hideSection(section) {
        section.dispatchEvent(new CustomEvent('theme:tab:hide', {bubbles: true}));
      }

      updateVisibility() {
        const currentProductsCount = Shopify.Products.getConfig().howManyToShow;
        const shouldHideSection = currentProductsCount < 1 && this.relatedItems < 1;

        this.classList.toggle(classes.isHidden, shouldHideSection);
      }
    }
  );
}
