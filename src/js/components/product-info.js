import {ProductModel} from '../features/product-model';

if (!customElements.get('product-info')) {
  customElements.define(
    'product-info',
    class ProductInfo extends HTMLElement {
      quantityInput = undefined;
      quantityForm = undefined;
      onVariantChangeUnsubscriber = undefined;
      cartUpdateUnsubscriber = undefined;
      abortController = undefined;
      pendingRequestUrl = null;
      preProcessHtmlCallbacks = [];
      postProcessHtmlCallbacks = [];
      currentVariant = null;

      constructor() {
        super();

        this.quantityInput = this.querySelector('[data-quantity-input]');
        this.productImages = this.querySelector('product-images');
        this.productMediaList = this.querySelector('[data-product-media-list]');
        this.variantImageScroll = this.getAttribute('data-variant-image-scroll') === 'true';
        this.productFormWrapper = this.querySelector('[data-form-wrapper]');
        this.productForm = this.querySelector('product-form');
      }

      connectedCallback() {
        this.initializeProductSwapUtility();

        // Record recently viewed products on initial load
        try {
          const handle = this.dataset.productHandle;
          if (window.Shopify?.Products?.recordRecentlyViewed) {
            if (handle) {
              window.Shopify.Products.recordRecentlyViewed({handle});
            } else {
              window.Shopify.Products.recordRecentlyViewed();
            }
          }
        } catch (e) {
          // Silently handle recently viewed recording errors - not critical for user experience
          console.warn('Recently viewed recording error:', e);
        }

        this.onVariantChangeUnsubscriber = subscribe(theme.PUB_SUB_EVENTS.optionValueSelectionChange, this.handleOptionValueChange.bind(this));

        this.initQuantityHandlers();
        this.initProductNotificationHandlers();
        this.dispatchEvent(new CustomEvent('theme:product-info:loaded', {bubbles: true}));

        this.variantOptionImages = this.querySelectorAll('[data-variant-option-image]');
        if (this.variantOptionImages.length > 1) {
          this.optionImagesWidth();
        }

        this.updatePreorderState();

        this.checkLiveCartInfo();
        this.checkLiveCartInfoCallback = () => this.checkLiveCartInfo();
        document.addEventListener('theme:cart-drawer:close', this.checkLiveCartInfoCallback);
      }

      checkLiveCartInfo() {
        const variantIdInput = this.productForm?.variantIdInput;
        const variantId = variantIdInput ? variantIdInput.value : null;

        if (!variantId) return;

        // Get quantity directly from the quantity input
        const quantity = this.quantityInput ? parseInt(this.quantityInput.value, 10) : 1;

        const productUrl = `${theme.routes.root}products/${this.dataset.productHandle}?section_id=api-live-cart-info&variant=${variantId}`;

        fetch(productUrl)
          .then((response) => response.text())
          .then((data) => {
            const markup = new DOMParser().parseFromString(data, 'text/html');

            const itemCountForVariant = Number(markup.querySelector('[data-item-count-for-variant]').innerHTML);
            const maxInventory = markup.querySelector('[data-max-inventory]').innerHTML;

            const maxInventoryCount = Number(maxInventory);
            const addingMoreThanAvailable = Boolean(quantity + itemCountForVariant > maxInventoryCount);

            const maxInventoryReached = maxInventory !== '' ? addingMoreThanAvailable : false;
            const errorMessagePosition = maxInventory !== '' && itemCountForVariant === maxInventoryCount ? 'form' : 'cart';

            const form = this.querySelector('[data-product-form]');
            if (!form) return;

            form.setAttribute('data-max-inventory-reached', maxInventoryReached);
            form.setAttribute('data-error-message-position', errorMessagePosition);
          })
          .catch((error) => {
            console.warn('Failed to check live cart info:', error);
            // Could show a subtle error message to user if needed
          });
      }

      addPreProcessCallback(callback) {
        this.preProcessHtmlCallbacks.push(callback);
      }

      initQuantityHandlers() {
        if (!this.quantityInput) return;

        this.quantityForm = this.querySelector('.product-form__quantity');
        if (!this.quantityForm) return;

        this.setQuantityBoundaries();
        // Update button price when quantity changes
        this.quantityInput.addEventListener('change', () => this.updateButtonPrice());
        this.quantityInput.addEventListener('change', () => this.checkLiveCartInfo());
        if (!this.dataset.originalSection) {
          this.cartUpdateUnsubscriber = subscribe(theme.PUB_SUB_EVENTS.cartUpdate, this.fetchQuantityRules.bind(this));
        }
      }

      disconnectedCallback() {
        this.onVariantChangeUnsubscriber();
        this.cartUpdateUnsubscriber?.();
        document.removeEventListener('theme:cart-drawer:close', this.checkLiveCartInfoCallback);
      }

      initializeProductSwapUtility() {
        this.postProcessHtmlCallbacks.push((newNode) => {
          window?.Shopify?.PaymentButton?.init();
          window?.ProductModel?.loadShopifyXR();
          // Call optionImagesWidth after variant change HTML updates
          this.optionImagesWidth(newNode);
        });
      }

      optionImagesWidth(container = this) {
        const variantOptionImages = container.querySelectorAll('[data-variant-option-image]');

        if (variantOptionImages.length > 1) {
          let maxItemWidth = 0;

          requestAnimationFrame(() => {
            variantOptionImages.forEach((item) => {
              const itemWidth = item.clientWidth;
              if (itemWidth > maxItemWidth) {
                maxItemWidth = itemWidth;
              }
            });

            // Only apply styling to buttons that contain variant option images
            variantOptionImages.forEach((image) => {
              const button = image.closest('[data-variant-buttons]');
              if (button) {
                button.style?.setProperty('--option-image-width', maxItemWidth + 'px');
              }
            });
          });
        }
      }

      handleOptionValueChange({data: {event, target, selectedOptionValues}}) {
        if (!this.contains(event.target)) return;

        this.resetProductFormState();

        const productUrl = target.dataset.productUrl || this.pendingRequestUrl || this.dataset.url;
        this.pendingRequestUrl = productUrl;
        const shouldSwapProduct = this.dataset.url !== productUrl;
        const shouldFetchFullPage = this.dataset.updateUrl === 'true' && shouldSwapProduct;
        this.renderProductInfo({
          requestUrl: this.buildRequestUrlWithParams(productUrl, selectedOptionValues, shouldFetchFullPage),
          targetId: target.id,
          callback: shouldSwapProduct ? this.handleSwapProduct(productUrl, shouldFetchFullPage) : this.handleUpdateProductInfo(productUrl),
        });
      }

      resetProductFormState() {
        const productForm = this.productForm;
        productForm?.toggleSubmitButton(true);
      }

      handleSwapProduct(productUrl, updateFullPage) {
        return (html) => {
          this.productModal?.remove();

          const selector = updateFullPage ? "product-info[id^='MainProduct']" : 'product-info';
          const variant = this.getSelectedVariant(html.querySelector(selector));
          this.updateURL(productUrl, variant?.id);

          if (updateFullPage) {
            document.querySelector('head title').innerHTML = html.querySelector('head title').innerHTML;

            HTMLUpdateUtility.viewTransition(document.querySelector('main'), html.querySelector('main'), this.preProcessHtmlCallbacks, this.postProcessHtmlCallbacks);
          } else {
            HTMLUpdateUtility.viewTransition(this, html.querySelector('product-info'), this.preProcessHtmlCallbacks, this.postProcessHtmlCallbacks);
          }

          // Ensure optionImagesWidth is called after the swap
          requestAnimationFrame(() => this.optionImagesWidth());
        };
      }

      renderProductInfo({requestUrl, targetId, callback}) {
        this.abortController?.abort();
        this.abortController = new AbortController();

        fetch(requestUrl, {signal: this.abortController.signal})
          .then((response) => response.text())
          .then((responseText) => {
            this.pendingRequestUrl = null;
            const html = new DOMParser().parseFromString(responseText, 'text/html');
            callback(html);
          })
          .then(() => {
            // set focus to last clicked option value
            document.querySelector(`#${targetId}`)?.focus();
          })
          .catch((error) => {
            if (error.name === 'AbortError') {
              console.log('Fetch aborted by user');
            } else {
              console.error(error);
            }
          });
      }

      getSelectedVariant(productInfoNode) {
        const selectedVariant = productInfoNode.querySelector('variant-selects [data-selected-variant]')?.innerHTML;
        return !!selectedVariant ? JSON.parse(selectedVariant) : null;
      }

      buildRequestUrlWithParams(url, optionValues, shouldFetchFullPage = false) {
        const params = [];

        !shouldFetchFullPage && params.push(`section_id=${this.sectionId}`);

        if (optionValues.length) {
          params.push(`option_values=${optionValues.join(',')}`);
        }

        return `${url}?${params.join('&')}`;
      }

      updateOptionValues(html) {
        const variantSelects = html.querySelector('variant-selects');
        if (variantSelects) {
          HTMLUpdateUtility.viewTransition(this.variantSelectors, variantSelects, this.preProcessHtmlCallbacks);
        }
      }

      showSoldoutNotificationButton(isSoldOut) {
        if (!this.productFormWrapper.classList.contains('show-product-notification')) return;

        if (isSoldOut) {
          this.productFormWrapper.classList.add('variant--soldout');
        } else {
          this.productFormWrapper.classList.remove('variant--soldout');
        }
      }

      updatePreorderState(container = this) {
        this.submitButton = container.querySelector(`#ProductSubmitButton-${this.sectionId}`);
        this.isPreorder = this.submitButton?.dataset.preorder === 'true';
        this.preorderInput = this.querySelector('[data-product-preorder]');

        if (this.preorderInput) {
          this.preorderInput.disabled = !this.isPreorder;
        }
      }

      handleUpdateProductInfo(productUrl) {
        return (html) => {
          const variant = this.getSelectedVariant(html);

          this.pickupAvailability?.update(variant);
          this.updateOptionValues(html);
          this.updateURL(productUrl, variant?.id);
          this.updateVariantInputs(variant?.id);

          if (!variant) {
            this.setUnavailable();
            return;
          }

          this.updatePreorderState(html);
          const isSoldOut = !this.submitButton || this.submitButton.hasAttribute('disabled');

          if (this.isPreorder && !isSoldOut) {
            this.productForm?.toggleSubmitButton(false, window.theme.strings.preOrder);
            this.showSoldoutNotificationButton(false);
          } else if (isSoldOut) {
            this.productForm?.toggleSubmitButton(true, window.theme.strings.soldOut);
            this.showSoldoutNotificationButton(true);
          } else {
            this.productForm?.toggleSubmitButton(false, window.theme.strings.addToCart);
            this.showSoldoutNotificationButton(false);
          }

          this.updateMedia(variant?.featured_media?.id);

          const updateSourceFromDestination = (id, shouldHide = (source) => false) => {
            const source = html.getElementById(`${id}-${this.sectionId}`);

            const destination = this.querySelector(`#${id}-${this.dataset.sectionId}`);
            if (source && destination) {
              destination.innerHTML = source.innerHTML;
              destination.classList.toggle('hidden', shouldHide(source));
            }
          };

          updateSourceFromDestination('Price');
          updateSourceFromDestination('Sku', ({classList}) => classList.contains('hidden'));
          updateSourceFromDestination('Inventory');
          updateSourceFromDestination('Volume');
          updateSourceFromDestination('Price-Per-Item', ({classList}) => classList.contains('hidden'));
          updateSourceFromDestination('CartBar');
          updateSourceFromDestination('Preorder');
          updateSourceFromDestination('Badges');

          this.updateQuantityRules(this.sectionId, html);
          this.querySelector(`#Quantity-Rules-${this.dataset.sectionId}`)?.classList.remove('hidden');

          // Recalculate button price after DOM updates
          this.updateButtonPrice();

          // Update variant option image widths after DOM updates
          this.optionImagesWidth();

          publish(theme.PUB_SUB_EVENTS.variantChange, {
            data: {
              sectionId: this.sectionId,
              html,
              variant,
            },
          });
        };
      }

      updateVariantInputs(variantId) {
        const formSelectors = [
          `#ProductForm-${this.dataset.sectionId}`, // Product form
          `#ProductFormInstallment-${this.dataset.sectionId}`, // Shop Pay Installments
          `[id^="ProductFormModal-${this.dataset.sectionId}"]`, // product-modal form
        ];

        this.querySelectorAll(formSelectors.join(', ')).forEach((productForm) => {
          const input = productForm.querySelector('input[name="id"]');
          if (input) {
            input.value = variantId ?? '';
            input.dispatchEvent(new Event('change', {bubbles: true}));
          }
        });
      }

      updateURL(url, variantId) {
        this.querySelector('share-button')?.updateUrl(`${window.theme.routes.shop_url}${url}${variantId ? `?variant=${variantId}` : ''}`);

        if (this.dataset.updateUrl === 'false') return;
        window.history.replaceState({}, '', `${url}${variantId ? `?variant=${variantId}` : ''}`);
      }

      setUnavailable() {
        this.productForm?.toggleSubmitButton(true, window.theme.strings.unavailable);
        this.showSoldoutNotificationButton(false);

        const selectors = ['price', 'Inventory', 'Sku', 'Price-Per-Item', 'Volume-Note', 'Volume', 'Quantity-Rules'].map((id) => `#${id}-${this.dataset.sectionId}`).join(', ');
        document.querySelectorAll(selectors).forEach(({classList}) => classList.add('hidden'));
      }

      updateMedia(variantFeaturedMediaId) {
        if (!variantFeaturedMediaId) return;

        const selectedImage = this.querySelector(`[data-image-id="${variantFeaturedMediaId}"]`);
        if (!selectedImage) return;

        const selectedImageId = selectedImage.getAttribute('data-media-id');
        const isDesktopView = !window.theme.isMobile();

        // Update image on the desktop slideshow
        selectedImage.dispatchEvent(
          new CustomEvent('theme:media:select', {
            bubbles: true,
            detail: {
              id: selectedImageId,
            },
          })
        );

        requestAnimationFrame(() => {
          if (isDesktopView && !this.productImages.hasAttribute('data-fader-desktop') && this.variantImageScroll) {
            const selectedImageTop = selectedImage.getBoundingClientRect().top;

            document.dispatchEvent(
              new CustomEvent('theme:tooltip:close', {
                bubbles: false,
                detail: {
                  hideTransition: false,
                },
              })
            );

            // Update image on desktop on non slider layout
            window.theme.scrollTo(selectedImageTop);
          }

          // Update image on mobile slider
          if (!isDesktopView && !this.productImages.hasAttribute('data-fader-mobile')) {
            this.productMediaList.scrollTo({
              left: selectedImage.offsetLeft,
            });
          }
        });
      }

      setQuantityBoundaries() {
        const data = {
          cartQuantity: this.quantityInput.dataset.cartQuantity ? parseInt(this.quantityInput.dataset.cartQuantity) : 0,
          min: this.quantityInput.dataset.min ? parseInt(this.quantityInput.dataset.min) : 1,
          max: this.quantityInput.dataset.max ? parseInt(this.quantityInput.dataset.max) : null,
          step: this.quantityInput.step ? parseInt(this.quantityInput.step) : 1,
        };

        let min = data.min;
        const max = data.max === null ? data.max : data.max - data.cartQuantity;
        if (max !== null) min = Math.min(min, max);
        if (data.cartQuantity >= data.min) min = Math.min(min, data.step);

        this.quantityInput.min = min;

        if (max) {
          this.quantityInput.max = max;
        } else {
          this.quantityInput.removeAttribute('max');
        }
        this.quantityInput.value = min;

        publish(theme.PUB_SUB_EVENTS.quantityUpdate, undefined);
        // Ensure button price reflects current quantity boundaries
        this.updateButtonPrice();
      }

      fetchQuantityRules() {
        const currentVariantId = this.productForm?.variantIdInput?.value;
        if (!currentVariantId) return;

        return fetch(`${this.dataset.url}?variant=${currentVariantId}&section_id=${this.dataset.sectionId}`)
          .then((response) => response.text())
          .then((responseText) => {
            const html = new DOMParser().parseFromString(responseText, 'text/html');
            this.updateQuantityRules(this.dataset.sectionId, html);
          })
          .catch((e) => {
            console.warn('Failed to fetch quantity rules:', e);
          });
      }

      updateQuantityRules(sectionId, html) {
        if (!this.quantityInput) return;
        this.setQuantityBoundaries();

        const quantityFormUpdated = html.getElementById(`Quantity-Form-${sectionId}`);
        const selectors = ['[data-quantity-input]', '[data-quantity-rules]', '[data-quantity-label]'];
        for (let selector of selectors) {
          const current = this.quantityForm.querySelector(selector);
          const updated = quantityFormUpdated.querySelector(selector);
          if (!current || !updated) continue;
          if (selector === '[data-quantity-input]') {
            const attributes = ['data-cart-quantity', 'data-min', 'data-max', 'step'];
            for (let attribute of attributes) {
              const valueUpdated = updated.getAttribute(attribute);
              if (valueUpdated !== null) {
                current.setAttribute(attribute, valueUpdated);
              } else {
                current.removeAttribute(attribute);
              }
            }
          } else {
            current.innerHTML = updated.innerHTML;
          }
        }
        // Update price after rules replacement
        this.updateButtonPrice();
      }

      updateButtonPrice() {
        const priceContainer = this.querySelector('[data-product-price]');

        if (!priceContainer) return;

        const variant = this.getSelectedVariant(this) || null;
        if (!variant) return;

        const quantity = this.quantityInput ? parseInt(this.quantityInput.value || '1', 10) || 1 : 1;
        const price = variant.price || 0;
        const compareAt = variant.compare_at_price || 0;

        const total = price * quantity;
        const totalCompare = compareAt > price ? compareAt * quantity : 0;

        const formattedPrice = total === 0 ? window.theme.strings.free : window.theme.formatMoney(total, theme.moneyFormat);
        let html = formattedPrice;
        if (totalCompare) {
          const formattedCompare = window.theme.formatMoney(totalCompare, theme.moneyFormat);
          html = `${formattedPrice} <s>${formattedCompare}</s>`;
        }

        priceContainer.innerHTML = html;
      }

      initProductNotificationHandlers() {
        const productNotification = this.querySelector('product-notification');
        if (!productNotification) return;

        const buttonPopupOpen = productNotification.closest('popup-component')?.querySelector('[data-popup-open]');

        this.querySelectorAll('[data-notification-popup-button]')?.forEach((button) => {
          button.addEventListener('click', (event) => {
            event.preventDefault();
            buttonPopupOpen.dispatchEvent(new Event('click'));
          });
        });
      }

      get productModal() {
        return document.querySelector(`#ProductModal-${this.dataset.sectionId}`);
      }

      get pickupAvailability() {
        return this.querySelector(`pickup-availability`);
      }

      get variantSelectors() {
        return this.querySelector('variant-selects');
      }

      get relatedProducts() {
        const relatedProductsSectionId = SectionId.getIdForSection(SectionId.parseId(this.sectionId), 'related-products');
        return document.querySelector(`product-recommendations[data-section-id^="${relatedProductsSectionId}"]`);
      }

      get quickOrderList() {
        const quickOrderListSectionId = SectionId.getIdForSection(SectionId.parseId(this.sectionId), 'quick_order_list');
        return document.querySelector(`quick-order-list[data-id^="${quickOrderListSectionId}"]`);
      }

      get sectionId() {
        return this.dataset.originalSection || this.dataset.sectionId;
      }
    }
  );
}

if (!customElements.get('product-model')) {
  customElements.define('product-model', ProductModel);
}
