import {register} from '../vendor/theme-scripts/theme-sections';

const selectors = {
  apiRelatedProductsTemplate: '[data-api-related-template]',
  relatedSection: '[data-related-section]',
  relatedProduct: '[data-grid-item]',
  recentlyViewed: '[data-recent-wrapper]',
  recentlyViewedWrapper: '[data-recently-viewed-wrapper]',
  section: '[data-section-type]',
  productItem: '.product-item',
  slider: 'grid-slider',
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

const sections = {};

class Related {
  constructor(section) {
    this.section = section;
    this.sectionId = section.id;
    this.container = section.container;
    this.relatedItems = 0;

    this.init();
  }

  init() {
    this.loadRelatedProducts();
    this.loadRecentlyViewedProducts();
  }

  loadRelatedProducts() {
    const relatedSection = this.container.querySelector(selectors.relatedSection);
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
    const recentlyViewedHolder = this.container.querySelector(selectors.recentlyViewed);
    const howManyToShow = parseInt(recentlyViewedHolder.getAttribute(attributes.limit)) || 4;
    const minimumNumberProducts = parseInt(recentlyViewedHolder.getAttribute(attributes.minimum)) || 4;

    Shopify.Products.showRecentlyViewed({
      howManyToShow,
      wrapperId: `recently-viewed-products-${this.sectionId}`,
      section: this.section,
      target: 'api-product-grid-item',
      onComplete: (wrapper, section) => this.handleRecentlyViewedResponse(wrapper, section, recentlyViewedHolder, minimumNumberProducts),
    });
  }

  handleRecentlyViewedResponse(wrapper, section, recentlyViewedHolder, minimumNumberProducts) {
    const container = section.container;
    if (!container) return;

    const recentlyViewedWrapper = container.querySelector(selectors.recentlyViewedWrapper);
    const recentProducts = wrapper.querySelectorAll(selectors.productItem);
    const slider = recentlyViewedHolder.querySelector(selectors.slider);
    const checkRecentInRelated = !recentlyViewedWrapper && recentProducts.length > 0;
    const checkRecentOutsideRelated = recentlyViewedWrapper && recentProducts.length >= minimumNumberProducts;

    if (checkRecentInRelated || checkRecentOutsideRelated) {
      if (checkRecentOutsideRelated) {
        recentlyViewedWrapper.classList.remove(classes.isHidden);
      }

      recentlyViewedHolder.classList.remove(classes.isHidden);
      recentlyViewedHolder.dispatchEvent(new CustomEvent('theme:tab:check', {bubbles: true}));

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

    this.container.classList.toggle(classes.isHidden, shouldHideSection);
  }
}

const relatedSection = {
  onLoad() {
    sections[this.id] = new Related(this);
  },
};

register('related', [relatedSection]);
