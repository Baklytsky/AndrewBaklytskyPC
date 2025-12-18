/**
 * Custom element for managing product recommendations in cart upsell blocks
 * Fetches recommendations from Shopify's Recommendations API based on cart items
 */
class CartUpsellRecommendations extends HTMLElement {
  constructor() {
    super();

    this.blockId = this.getAttribute('data-block-id');
    this.limit = parseInt(this.getAttribute('data-limit')) || 4;
    this.intent = this.getAttribute('data-intent') || 'related';
    this.upsellStyle = this.getAttribute('data-upsell-style') || 'horizontal';
    this.hasSlider = this.hasAttribute('data-has-slider');
    this.swiperContainer = null;

    // Track fetched recommendations to avoid duplicate requests
    this.currentCartProductIds = [];
    this.fetchedRecommendations = [];
    this.isLoading = false;
    this.fetchAbortController = null;
  }

  connectedCallback() {
    this.swiperContainer = this.querySelector('swiper-container');

    // Initial fetch on connection
    this.fetchRecommendations();

    // Listen for cart updates
    this.handleCartChange = this.handleCartChange.bind(this);
    this.handleCartBuilt = this.handleCartBuilt.bind(this);

    document.addEventListener('theme:cart:change', this.handleCartChange);
    document.addEventListener('theme:cart:built', this.handleCartBuilt);
  }

  disconnectedCallback() {
    document.removeEventListener('theme:cart:change', this.handleCartChange);
    document.removeEventListener('theme:cart:built', this.handleCartBuilt);

    // Abort any pending fetches
    if (this.fetchAbortController) {
      this.fetchAbortController.abort();
    }
  }

  /**
   * Handle cart change event
   * Triggered when cart items are added/removed
   */
  handleCartChange(event) {
    const cartCount = event?.detail?.cartCount;

    // Clear recommendations if cart is empty
    if (cartCount === 0) {
      this.clearRecommendations();
      return;
    }

    // Fetch new recommendations
    this.fetchRecommendations();
  }

  /**
   * Handle cart built event
   * Triggered after cart HTML is rebuilt
   */
  handleCartBuilt() {
    // Re-fetch recommendations after cart rebuild
    this.fetchRecommendations();
  }

  /**
   * Fetch recommendations from Shopify's Recommendations API
   * Uses a single API endpoint that returns both recommendation data and rendered upsell products
   */
  async fetchRecommendations() {
    if (this.isLoading) return;

    // Abort previous fetch if any
    if (this.fetchAbortController) {
      this.fetchAbortController.abort();
    }
    this.fetchAbortController = new AbortController();

    try {
      this.isLoading = true;
      this.classList.add('is-loading');

      // Get cart data to get product IDs
      const cartResponse = await fetch(`${window.Shopify.routes.root}cart.js`, {
        headers: {Accept: 'application/json'},
        signal: this.fetchAbortController.signal,
      });

      if (!cartResponse.ok) {
        throw new Error('Failed to fetch cart');
      }

      const cart = await cartResponse.json();

      // Extract unique product IDs from cart items
      const cartProductIds = [...new Set(cart.items.map((item) => String(item.product_id)))];

      // If cart is empty, clear recommendations
      if (cartProductIds.length === 0) {
        this.clearRecommendations();
        return;
      }

      // Check if cart products have changed
      const idsChanged = JSON.stringify(cartProductIds.sort()) !== JSON.stringify(this.currentCartProductIds.sort());
      if (!idsChanged && this.fetchedRecommendations.length > 0) {
        // No change in cart products, skip fetch
        return;
      }

      this.currentCartProductIds = cartProductIds;

      // Fetch recommendations with rendered upsell products for each cart product
      const allUpsellProducts = [];
      const seenProductIds = new Set(cartProductIds); // Exclude products already in cart

      for (const productId of cartProductIds) {
        try {
          // Use style-specific section to get correctly rendered upsell HTML
          const sectionId = `api-upsell-recommendations-${this.upsellStyle}`;
          const recommendationsUrl = `${window.theme.routes.product_recommendations_url}?product_id=${productId}&limit=${this.limit * 2}&intent=${this.intent}&section_id=${sectionId}`;

          const response = await fetch(recommendationsUrl, {
            signal: this.fetchAbortController.signal,
          });
          if (!response.ok) continue;

          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const template = doc.querySelector('[data-api-upsell-recommendations]');

          if (!template) continue;

          // Extract rendered upsell products directly
          const upsellItems = template.querySelectorAll('[data-upsell-item]');

          upsellItems.forEach((item) => {
            const itemProductId = item.getAttribute('data-product-id');
            if (itemProductId && !seenProductIds.has(itemProductId)) {
              seenProductIds.add(itemProductId);

              // Get the rendered upsell product HTML
              const productHtml = item.querySelector('quick-add-product')?.outerHTML || item.querySelector('.product-upsell__holder')?.outerHTML;
              if (productHtml) {
                allUpsellProducts.push(productHtml);
              }
            }
          });
        } catch (error) {
          if (error.name === 'AbortError') throw error;
          console.warn(`Failed to fetch recommendations for product ${productId}:`, error);
        }

        // Stop if we've reached the limit
        if (allUpsellProducts.length >= this.limit) break;
      }

      // Apply limit and store
      this.fetchedRecommendations = allUpsellProducts.slice(0, this.limit);

      // Render recommendations
      this.renderRecommendations();
    } catch (error) {
      if (error.name === 'AbortError') return; // Silently ignore aborted requests
      console.error('Error fetching cart recommendations:', error);
    } finally {
      this.isLoading = false;
      this.classList.remove('is-loading');
    }
  }

  /**
   * Render fetched recommendations as upsell products
   * Products are already rendered from the API, just need to insert into DOM
   */
  renderRecommendations() {
    // If no recommendations, hide the block
    if (this.fetchedRecommendations.length === 0) {
      this.clearRecommendations();
      return;
    }

    // Build HTML based on slider or non-slider mode
    let productsHtml = '';

    if (this.hasSlider) {
      productsHtml = this.fetchedRecommendations.map((html) => `<swiper-slide>${html}</swiper-slide>`).join('');
    } else {
      productsHtml = this.fetchedRecommendations.join('');
    }

    // Update the container
    if (this.swiperContainer) {
      this.swiperContainer.innerHTML = productsHtml;
      this.updateSwiperSlider();
    } else {
      this.innerHTML = productsHtml;
    }

    // Show the block
    this.classList.remove('is-hidden');
    this.style.display = '';
    const cartBlock = this.closest('.cart-block');
    if (cartBlock) {
      cartBlock.style.display = '';
    }
  }

  /**
   * Clear all recommendations
   */
  clearRecommendations() {
    this.fetchedRecommendations = [];
    this.currentCartProductIds = [];

    if (this.swiperContainer) {
      this.swiperContainer.innerHTML = '';
    }

    // Hide the block when empty
    this.classList.add('is-hidden');
    const cartBlock = this.closest('.cart-block');
    if (cartBlock) {
      cartBlock.style.display = 'none';
    }
  }

  /**
   * Update swiper slider after content changes
   */
  updateSwiperSlider() {
    const swiper = this.querySelector('swiper-container');
    if (!swiper) return;

    if (swiper.swiper) {
      swiper.swiper.update();
      return;
    }

    customElements.whenDefined('swiper-container').then(() => {
      if (swiper.swiper) swiper.swiper.update();
    });
  }
}

if (!customElements.get('cart-upsell-recommendations')) {
  customElements.define('cart-upsell-recommendations', CartUpsellRecommendations);
}
