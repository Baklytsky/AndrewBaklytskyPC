import {ProductGrid} from '../features/product-grid';
import {GridSlider} from '../features/grid-slider';
import {register} from '../vendor/theme-scripts/theme-sections';
import {Tabs} from '../features/tabs';
import CustomScrollbar from '../features/custom-scrollbar';
import {Tooltip} from '../features/tooltip';

const selectors = {
  product: '[data-product-block]',
  relatedProducts: '[data-related-products]',
  recentlyViewed: '[data-recent-wrapper]',
  recentlyViewedWrapper: '[data-recently-viewed-wrapper]',
  slider: '[data-slider]',
  aos: '[data-aos]',
  tabsHolder: '[data-tabs-holder]',
  tabsLink: '[data-tabs-link]',
  tab: '[data-tab]',
  tooltip: '[data-tooltip]',
};

const attributes = {
  sectionId: 'data-section-id',
  productId: 'data-product-id',
  limit: 'data-limit',
  minimum: 'data-minimum',
  tabsLink: 'data-tabs-link',
};

const classes = {
  hidden: 'hidden',
  aosAnimate: 'aos-animate',
  aosInit: 'aos-init',
};

const sections = {};

class RelatedProducts {
  constructor(section) {
    this.section = section;
    this.sectionId = section.id;
    this.container = section.container;

    this.related();
    this.recent();

    this.tabs = new Tabs(this.container);
  }

  related() {
    this.relatedProducts = this.container.querySelector(selectors.relatedProducts);

    if (!this.relatedProducts) {
      return;
    }

    const sectionId = this.container.getAttribute(attributes.sectionId);
    const productId = this.container.getAttribute(attributes.productId);
    const limit = this.container.getAttribute(attributes.limit);
    const requestUrl = `${theme.routes.product_recommendations_url}?section_id=${sectionId}&limit=${limit}&product_id=${productId}`;

    fetch(requestUrl)
      .then((response) => {
        if (!response.ok) {
          const error = new Error(response.status);
          this.hideRelated();
          throw error;
        }
        return response.text();
      })
      .then((data) => {
        const createdElement = document.createElement('div');
        createdElement.innerHTML = data;
        const inner = createdElement.querySelector(selectors.relatedProducts);

        if (inner.querySelectorAll(selectors.product).length) {
          this.relatedProducts.innerHTML = inner.innerHTML;

          this.relatedProductGrid = new ProductGrid(this.relatedProducts);
          this.relatedGridSlider = new GridSlider(this.relatedProducts);
          this.initTooltips(this.relatedProducts);
        }
      });
  }

  recent() {
    const recentlyViewed = this.container.querySelector(selectors.recentlyViewed);
    const howManyToshow = recentlyViewed ? parseInt(recentlyViewed.getAttribute(attributes.limit)) : 4;

    Shopify.Products.showRecentlyViewed({
      howManyToShow: howManyToshow,
      wrapperId: `recently-viewed-products-${this.sectionId}`,
      section: this.section,
      onComplete: (wrapper, section) => {
        const container = section.container;
        const recentlyViewedHolder = container.querySelector(selectors.recentlyViewed);
        const recentlyViewedWrapper = container.querySelector(selectors.recentlyViewedWrapper);
        const recentProducts = wrapper.querySelectorAll(selectors.product);
        const aosItem = container.querySelectorAll(selectors.aos);
        const slider = recentlyViewedHolder.querySelector(selectors.slider);
        const minimumNumberProducts = recentlyViewedHolder.hasAttribute(attributes.minimum) ? parseInt(recentlyViewedHolder.getAttribute(attributes.minimum)) : 1;
        const checkRecentInRelated = !recentlyViewedWrapper && recentProducts.length > 0;
        const checkRecentOutsideRelated = recentlyViewedWrapper && recentProducts.length >= minimumNumberProducts;

        if (checkRecentInRelated || checkRecentOutsideRelated) {
          this.recentProductGrid = new ProductGrid(recentlyViewedHolder);
          this.initTooltips(recentlyViewedHolder);

          if (checkRecentOutsideRelated) {
            aosItem.forEach((item) => item.classList.remove(classes.aosInit, classes.aosAnimate));
            container.classList.remove(classes.hidden);

            requestAnimationFrame(() => aosItem.forEach((item) => item.classList.add(classes.aosInit)));
          }

          if (slider) {
            this.recentGridSlider = new GridSlider(recentlyViewedHolder);

            requestAnimationFrame(() => {
              this.recentGridSlider.sliders.forEach((slider) => {
                slider.dispatchEvent(new CustomEvent('theme:slider:resize', {bubbles: true}));
                this.recentGridSlider.setSliderArrowsPosition(slider);
              });
            });
          }
        }
      },
    });
  }

  hideRelated() {
    const tab = this.relatedProducts.closest(selectors.tab);
    const tabsHolder = this.relatedProducts.closest(selectors.tabsHolder);
    const tabsLink = tabsHolder.querySelector(`[${attributes.tabsLink}="${tab.dataset.tab}"]`);

    tab.remove();

    if (!tabsLink) return;
    tabsLink.remove();
    tabsHolder.querySelector(selectors.tabsLink).dispatchEvent(new Event('click'));
    this.tabs.customScrollbar.unload();
    requestAnimationFrame(() => {
      this.tabs.customScrollbar = new CustomScrollbar(this.tabs.container);
    });
  }

  /**
   * Init tooltips for swatches
   */
  initTooltips(container) {
    this.tooltips = container.querySelectorAll(selectors.tooltip);
    this.tooltips.forEach((tooltip) => {
      new Tooltip(tooltip);
    });
  }

  /**
   * Event callback for Theme Editor `section:deselect` event
   */
  onDeselect() {
    if (this.relatedProductGrid) this.relatedProductGrid.onDeselect();
    if (this.recentProductGrid) this.recentProductGrid.onDeselect();
  }

  /**
   * Event callback for Theme Editor `section:unload` event
   */
  onUnload() {
    if (this.relatedProductGrid) this.relatedProductGrid.onUnload();
    if (this.relatedGridSlider) this.relatedGridSlider.onUnload();
    if (this.recentProductGrid) this.recentProductGrid.onUnload();
    if (this.recentGridSlider) this.recentGridSlider.onUnload();
  }
}

const relatedProductsSection = {
  onLoad() {
    sections[this.id] = new RelatedProducts(this);
  },
  onDeselect() {
    sections[this.id].onDeselect();
  },
  onUnload() {
    sections[this.id].onUnload();
  },
};

register('related-products', relatedProductsSection);
register('recent-products', relatedProductsSection);
