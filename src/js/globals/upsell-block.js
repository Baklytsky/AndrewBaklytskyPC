/**
 * Custom element for managing upsell product blocks
 * Handles product removal/restoration based on cart state
 */
class UpsellBlock extends HTMLElement {
  constructor() {
    super();

    // Cache for removed products (productId -> HTML)
    this.productCache = new Map();
    this.blockId = this.getAttribute('data-upsell-block-id');
    this.hasSlider = this.hasAttribute('data-upsell-has-slider');
  }

  connectedCallback() {
    // Listen for cart updates
    this.handleCartUpdate = this.handleCartUpdate.bind(this);
    this.handleCartChange = this.handleCartChange.bind(this);

    document.addEventListener('theme:cart:update', this.handleCartUpdate);
    document.addEventListener('theme:cart:refresh', this.handleCartUpdate);
    document.addEventListener('theme:cart:change', this.handleCartChange);
  }

  disconnectedCallback() {
    document.removeEventListener('theme:cart:update', this.handleCartUpdate);
    document.removeEventListener('theme:cart:refresh', this.handleCartUpdate);
    document.removeEventListener('theme:cart:change', this.handleCartChange);
  }

  /**
   * Handle cart update event
   *
   * @param   {Event}  event  Cart update event
   * @return  {Promise<void>}
   */
  async handleCartUpdate(event) {
    // Get cart data from event or fetch it
    const cartData = event?.detail?.cartData;
    if (cartData) {
      await this.updateFromCartData(cartData);
    } else {
      await this.updateFromCartAPI();
    }
  }

  /**
   * Handle cart change event (dispatched from cart.js after build)
   * Updates from the data element passed in the event detail
   *
   * @param   {Event}  event  Cart change event
   * @return  {Promise<void>}
   */
  async handleCartChange(event) {
    const cartCount = event?.detail?.cartCount;
    const dataElement = event?.detail?.dataElement;

    // Clear cache when cart is empty
    if (cartCount === 0) {
      this.productCache.clear();
    }

    // Update from data element if provided
    if (dataElement) {
      await this.updateFromDataElement(dataElement);
    }
  }

  /**
   * Update block from cart API response
   *
   * @return  {Promise<void>}
   */
  async updateFromCartAPI() {
    try {
      const response = await fetch(`${window.Shopify.routes.root}cart.js`, {
        headers: {Accept: 'application/json'},
      });
      if (!response.ok) return;

      const cart = await response.json();
      await this.updateFromCartData(cart);
    } catch (error) {
      console.error('Error fetching cart data:', error);
    }
  }

  /**
   * Update block from cart data object
   *
   * @param   {Object}  cartData  Cart data object
   * @return  {Promise<void>}
   */
  async updateFromCartData(cartData) {
    const cartProductVariants = this.getCartProductVariants(cartData);
    const cartIsEmpty = cartProductVariants.size === 0;

    if (cartIsEmpty) {
      this.productCache.clear();
      // Refresh the block from server when cart is empty
      await this.refreshFromServer();
      return;
    }

    // Process visible products
    const visibleProductIds = await this.processVisibleProducts(cartProductVariants);

    // Process cached products
    await this.processCachedProducts(visibleProductIds, cartProductVariants);

    // Update visibility
    this.updateVisibility();
  }

  /**
   * Get cart product variants from cart data
   *
   * @param   {Object}  cartData  Cart data object
   * @return  {Map}  Map of productId -> Set of variantIds
   */
  getCartProductVariants(cartData) {
    const productVariants = new Map();

    if (cartData.items && Array.isArray(cartData.items)) {
      cartData.items.forEach((item) => {
        const productId = String(item.product_id);
        const variantId = String(item.variant_id);

        if (!productVariants.has(productId)) {
          productVariants.set(productId, new Set());
        }
        productVariants.get(productId).add(variantId);
      });
    }

    return productVariants;
  }

  /**
   * Check if all available variants of a product are in cart
   *
   * @param   {string}  productId      Product ID
   * @param   {Set}     cartVariantIds Set of variant IDs in cart
   * @param   {string}  productHandle  Product handle
   * @return  {Promise<boolean>}
   */
  async areAllVariantsInCart(productId, cartVariantIds, productHandle) {
    if (!productHandle) {
      console.warn(`Product handle not provided for product ${productId}`);
      return false;
    }

    const productUrl = `${window.Shopify.routes.root}products/${productHandle}.js`;

    try {
      const response = await fetch(productUrl, {
        headers: {Accept: 'application/json'},
      });

      if (!response.ok) {
        console.error(`Failed to fetch product ${productHandle}: ${response.status}`);
        return false;
      }

      const product = await response.json();

      // Get all available variant IDs (only count available variants)
      const allAvailableVariantIds = new Set(product.variants.filter((variant) => variant.available).map((variant) => String(variant.id)));

      // If no available variants, don't remove from upsells
      if (allAvailableVariantIds.size === 0) return false;

      // Check if all available variants are in the cart
      const cartVariantIdsStr = new Set(Array.from(cartVariantIds).map((id) => String(id)));
      const allVariantsInCart = Array.from(allAvailableVariantIds).every((variantId) => cartVariantIdsStr.has(variantId));

      return allVariantsInCart;
    } catch (error) {
      console.error(`Error fetching product ${productHandle} data:`, error);
      return false;
    }
  }

  /**
   * Process visible products in the block
   *
   * @param   {Map}  cartProductVariants  Cart product variants
   * @return  {Promise<Set>}  Set of visible product IDs
   */
  async processVisibleProducts(cartProductVariants) {
    const productHolders = this.querySelectorAll('[data-quick-add-holder]');
    const visibleProductIds = new Set();

    for (const productHolder of productHolders) {
      const productId = productHolder.getAttribute('data-quick-add-holder');
      const productHandle = productHolder.getAttribute('data-product-handle');
      if (!productId || !productHandle) continue;

      const productIdStr = productId.toString();
      visibleProductIds.add(productIdStr);

      const cartVariants = cartProductVariants.get(productIdStr) || new Set();
      const allVariantsInCart = await this.areAllVariantsInCart(productIdStr, cartVariants, productHandle);

      if (allVariantsInCart && !this.productCache.has(productIdStr)) {
        // Remove product - all variants in cart
        this.removeProduct(productHolder, productIdStr);
      } else if (!allVariantsInCart && this.productCache.has(productIdStr)) {
        // Restore product - not all variants in cart
        this.restoreProduct(productIdStr);
      }
    }

    return visibleProductIds;
  }

  /**
   * Process cached products that aren't currently visible
   *
   * @param   {Set}  visibleProductIds   Set of visible product IDs
   * @param   {Map}  cartProductVariants Cart product variants
   * @return  {Promise<void>}
   */
  async processCachedProducts(visibleProductIds, cartProductVariants) {
    for (const [cachedProductId, cachedHtml] of this.productCache.entries()) {
      // Skip if already processed
      if (visibleProductIds.has(cachedProductId)) continue;

      // Get product handle from cached HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = cachedHtml;
      const cachedProductHolder = tempDiv.querySelector('[data-product-handle]');
      if (!cachedProductHolder) continue;

      const productHandle = cachedProductHolder.getAttribute('data-product-handle');
      const cartVariants = cartProductVariants.get(cachedProductId) || new Set();
      const allVariantsInCart = await this.areAllVariantsInCart(cachedProductId, cartVariants, productHandle);

      if (!allVariantsInCart) {
        // Restore product - not all variants in cart
        this.restoreProduct(cachedProductId);
      }
    }
  }

  /**
   * Remove product from block and cache it
   *
   * @param   {HTMLElement}  productHolder  The product holder element
   * @param   {string}       productIdStr    Product ID as string
   * @return  {void}
   */
  removeProduct(productHolder, productIdStr) {
    const productElement = this.hasSlider ? productHolder.closest('swiper-slide') : productHolder.parentElement;

    if (productElement && productElement !== this) {
      this.productCache.set(productIdStr, productElement.outerHTML);
      productElement.remove();

      if (this.hasSlider) {
        this.updateSwiperSlider();
      }
    }
  }

  /**
   * Restore product from cache
   *
   * @param   {string}  productIdStr  Product ID as string
   * @return  {boolean}  True if restored successfully
   */
  restoreProduct(productIdStr) {
    const cachedHtml = this.productCache.get(productIdStr);
    if (!cachedHtml) return false;

    // Use DocumentFragment to properly parse and insert HTML
    // This ensures custom elements are properly recognized by the browser
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cachedHtml;
    const restoredElement = tempDiv.firstElementChild;

    if (!restoredElement) {
      this.productCache.delete(productIdStr);
      return false;
    }

    // Reset state classes on restored element (buttons, forms, etc.)
    // Do this before inserting into DOM
    this.resetElementState(restoredElement);

    // Find the correct container - for sliders, it's inside swiper-container
    if (this.hasSlider) {
      const swiper = this.querySelector('swiper-container');
      if (!swiper) {
        console.warn('Swiper container not found in slider block:', this.blockId);
        this.productCache.delete(productIdStr);
        return false;
      }
      swiper.appendChild(restoredElement);
      this.updateSwiperSlider();
    } else {
      // For non-slider blocks, append directly to the element
      this.appendChild(restoredElement);
    }

    this.productCache.delete(productIdStr);
    return true;
  }

  /**
   * Reset state classes on restored elements
   * Removes classes like is-added, is-loading, has-error, etc.
   *
   * @param   {HTMLElement}  element  Element to reset
   * @return  {void}
   */
  resetElementState(element) {
    // State classes to remove from buttons and forms
    const stateClasses = ['is-added', 'is-loading', 'is-disabled', 'has-error', 'is-visible', 'is-animated'];

    // Reset buttons
    element.querySelectorAll('button, [data-quick-add-button]').forEach((button) => {
      stateClasses.forEach((className) => {
        button.classList.remove(className);
      });
      if (button.disabled) {
        button.disabled = false;
      }
    });

    // Reset form containers
    element.querySelectorAll('[data-quick-add-holder], [data-form-wrapper]').forEach((container) => {
      stateClasses.forEach((className) => {
        container.classList.remove(className);
      });
    });

    // Reset error containers
    element.querySelectorAll('[data-cart-errors-container], [data-error-message]').forEach((errorEl) => {
      errorEl.classList.remove('is-visible', 'has-error');
      if (errorEl.innerHTML) {
        errorEl.innerHTML = '';
      }
    });

    // Remove initialization attributes from all custom elements to allow re-initialization
    // This handles any custom element that uses initialization flags
    const initAttributePatterns = ['data-initialized', 'data-popout-initialized'];

    // Build selector to query only elements with these attributes
    const selector = initAttributePatterns.map((attr) => `[${attr}]`).join(', ');
    const elementsWithInitAttrs = element.querySelectorAll(selector);

    elementsWithInitAttrs.forEach((el) => {
      initAttributePatterns.forEach((attr) => {
        if (el.hasAttribute(attr)) {
          el.removeAttribute(attr);
        }
      });
    });
  }

  /**
   * Update/reinitialize swiper slider after slides are added or removed
   *
   * @return  {void}
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

  /**
   * Update block visibility based on remaining products
   *
   * @return  {void}
   */
  updateVisibility() {
    const remainingProducts = this.querySelectorAll('[data-quick-add-holder]');
    const cartBlock = this.closest('.cart-block');
    if (cartBlock) {
      cartBlock.style.display = remainingProducts.length > 0 ? '' : 'none';
    }
  }

  /**
   * Public method to update from external cart data (called from cart.js)
   *
   * @param   {HTMLElement}  [dataElement]  Element containing cart data from api-cart-items
   * @return  {Promise<void>}
   */
  async updateFromDataElement(dataElement) {
    if (!dataElement) return;

    const jsonScript = dataElement.querySelector('[data-api-cart-items-json]');
    if (!jsonScript) return;

    try {
      const cartItemsData = JSON.parse(jsonScript.textContent);
      const cartProductVariants = this.getCartProductVariants(cartItemsData);
      const cartIsEmpty = cartProductVariants.size === 0;

      if (cartIsEmpty) {
        this.productCache.clear();
        // Refresh the block from server when cart is empty
        await this.refreshFromServer();
        return;
      }

      // Process visible products
      const visibleProductIds = await this.processVisibleProducts(cartProductVariants);

      // Process cached products
      await this.processCachedProducts(visibleProductIds, cartProductVariants);

      // Update visibility
      this.updateVisibility();
    } catch (error) {
      console.error('Error updating upsell block from data element:', error);
    }
  }

  /**
   * Refresh block content from server
   * Used when cart is emptied to restore all products
   *
   * @return  {Promise<void>}
   */
  async refreshFromServer() {
    if (!this.blockId) {
      console.warn('Block ID not found for upsell block');
      return;
    }

    try {
      // Find the section ID from the cart drawer or cart page
      const cartDrawer = document.querySelector('cart-drawer');
      const cartPage = document.querySelector('[data-cart-page]');
      const container = cartDrawer || cartPage;

      if (!container) {
        console.warn('Cart container not found');
        return;
      }

      const sectionElement = container.closest('[data-section-id]');
      const sectionId = sectionElement?.getAttribute('data-section-id');
      if (!sectionId) {
        console.warn('Section ID not found for cart');
        return;
      }

      // Fetch the cart section
      const response = await fetch(`${window.Shopify.routes.root}?section_id=${sectionId}`);
      if (!response.ok) {
        console.error('Failed to fetch cart section:', response.status);
        return;
      }

      const html = await response.text();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      // Find this specific upsell block in the fetched HTML
      const fetchedBlock = tempDiv.querySelector(`upsell-block[data-upsell-block-id="${this.blockId}"]`);

      if (fetchedBlock) {
        this.innerHTML = fetchedBlock.innerHTML;
        // Clear cache after refresh
        this.productCache.clear();

        // Reset state for all products in the block
        this.querySelectorAll('[data-quick-add-holder]').forEach((holder) => {
          const productElement = this.hasSlider ? holder.closest('swiper-slide') : holder.parentElement;
          if (productElement) {
            this.resetElementState(productElement);
          }
        });

        // Update visibility
        this.updateVisibility();
      }
    } catch (error) {
      console.error('Error refreshing upsell block from server:', error);
    }
  }
}

if (!customElements.get('upsell-block')) {
  customElements.define('upsell-block', UpsellBlock);
}
