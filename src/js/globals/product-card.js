const selectors = {
  swapHandle: '[data-swap-handle]',
  nativeScrollbar: 'native-scrollbar',
  activeSibling: '.sibling__link--current',
  productImage: '[data-product-image]',
};

const attributes = {
  swapHandle: 'data-swap-handle',
  swapUrl: 'data-swap-url',
};

if (!customElements.get('product-card')) {
  customElements.define(
    'product-card',
    class ProductCard extends HTMLElement {
      abortController = undefined;
      pendingSwapHandle = null;
      postProcessHtmlCallbacks = [];

      handleClick = (event) => this.handleChange(event);
      handleKeyup = (event) => {
        if (event.code === theme.keyboardKeys.ENTER || event.code === theme.keyboardKeys.NUMPADENTER) {
          this.handleChange(event);
        }
      };
      onHtmlChange = (event) => this.handleHtmlChange(event);
      onProductCardChange = (event) => this.handleProductCardChange(event);
      onImageLeave = (event) => this.handleImageLeave(event);

      constructor() {
        super();
        this.swapHandles = this.querySelectorAll(selectors.swapHandle);
        this.activeSibling = [...this.swapHandles].find((el) => el.querySelector(selectors.activeSibling));
      }

      connectedCallback() {
        this.scrollIntoView();

        this.swapHandles?.forEach((element) => {
          element.addEventListener('click', this.handleClick);
          element.addEventListener('keyup', this.handleKeyup);
        });

        this.initProductSwapUtility();
        this.initPopoutHandlers();

        this.addEventListener('theme:product-card:change', this.onProductCardChange);

        this.querySelector('[data-product-image-overlay]')?.addEventListener('mouseleave', this.onImageLeave);
      }

      disconnectedCallback() {
        // Abort any pending fetch requests
        this.abortController?.abort();

        // Remove event listeners
        this.swapHandles?.forEach((element) => {
          element.removeEventListener('click', this.handleClick);
          element.removeEventListener('keyup', this.handleKeyup);
        });

        this.removeEventListener('theme:product-card:change', this.onProductCardChange);

        this.querySelector('[data-product-image-overlay]')?.removeEventListener('mouseleave', this.onImageLeave);
      }

      handleProductCardChange(event) {
        if (event.detail && event.detail.url) {
          this.renderProductItem({
            // Fetch the new product's HTML with section rendering API
            requestUrl: event.detail.url,
            // Returns a function that will process and swap the HTML after fetch completes
            callback: this.handleSwapProduct(),
          });
        }
      }

      handleImageLeave(event) {
        const image = event.currentTarget;
        let timeoutDuration = 250;
        if (theme.isMobile) {
          timeoutDuration = 0;
        }
        setTimeout(() => {
          image?.querySelector('[data-quick-add-holder]')?.classList.remove('is-expanded', 'is-visible');
        }, timeoutDuration); // Waiting CSS duration
      }

      initProductSwapUtility() {
        this.postProcessHtmlCallbacks.push(() => {
          document.addEventListener('theme:html:change', this.onHtmlChange);
        });
      }

      handleChange(event) {
        if (!this.contains(event.target)) return;

        const element = event.target.closest(selectors.swapHandle);
        const targetUrl = element.dataset.swapUrl;
        const productUrl = `${window.Shopify.routes.root}products/${element.dataset.swapHandle}`;
        // Store the clicked element's handle to refocus it after swap
        this.pendingSwapHandle = element.dataset.swapHandle;

        const shouldSwapProduct = this.dataset.url !== targetUrl;
        if (!shouldSwapProduct) return;

        this.renderProductItem({
          // Fetch the new product's HTML with section rendering API
          requestUrl: `${productUrl}?section_id=api-product-card`,
          // Returns a function that will process and swap the HTML after fetch completes
          callback: this.handleSwapProduct(),
        });
      }

      handleSwapProduct() {
        return (html) => {
          // Set up animation parameters with the new product-card element's ID
          const aosDelay = 0;
          const productItem = html.querySelector('product-card');
          const aosAnchor = productItem.id ? `#${productItem.id}` : '';

          // Get the raw HTML and replace animation placeholder strings
          let productHTML = productItem.outerHTML;
          productHTML = productHTML.includes('||itemAnimationDelay||') ? productHTML.replaceAll('||itemAnimationDelay||', aosDelay) : productHTML;
          productHTML = productHTML.includes('||itemAnimationAnchor||') ? productHTML.replaceAll('||itemAnimationAnchor||', aosAnchor) : productHTML;

          // Parse the processed HTML back into a DOM element
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = productHTML;
          const processedProductItem = tempDiv.querySelector('product-card');

          HTMLUpdateUtility.viewTransition(
            this, // Current product-card element to be replaced
            processedProductItem, // New product-card element with updated content
            this.postProcessHtmlCallbacks // Run any post-processing after swap (focus, init components)
          );
        };
      }

      renderProductItem({requestUrl, callback}) {
        this.abortController?.abort();
        this.abortController = new AbortController();

        fetch(requestUrl, {signal: this.abortController.signal})
          .then((response) => response.text())
          .then((responseText) => {
            const html = new DOMParser().parseFromString(responseText, 'text/html');
            callback(html);
          })
          .catch((error) => {
            if (error.name === 'AbortError') {
              console.log('Fetch aborted by user');
            } else {
              console.error(error);
            }

            document.removeEventListener('theme:html:change', this.onHtmlChange);
          });
      }

      handleHtmlChange(event) {
        if (!event?.detail?.element) return;
        if (!this.pendingSwapHandle) return;

        const product = event.detail.element;
        const swatch = product.querySelector(`[${attributes.swapHandle}="${this.pendingSwapHandle}"]`);

        // Set focus and scroll into view of the last clicked sibling swatch element
        swatch.focus();
        this.scrollIntoView({product, swatch});

        this.pendingSwapHandle = null;
        document.removeEventListener('theme:html:change', this.onHtmlChange);
      }

      scrollIntoView(elements = false) {
        if (!this.activeSibling) return;

        const swatch = elements ? elements.swatch : this.activeSibling;
        const product = elements ? elements.product : this;

        const nativeScrollbar = product.querySelector(selectors.nativeScrollbar);
        if (!nativeScrollbar || typeof nativeScrollbar.move !== 'function') return;

        const computedStyle = getComputedStyle(swatch);
        const swatchOffset = swatch.offsetLeft + parseFloat(computedStyle.marginLeft) + parseFloat(computedStyle.marginRight);
        requestAnimationFrame(() => nativeScrollbar.move(swatchOffset - swatch.clientWidth, 'instant'));
      }

      initPopoutHandlers() {
        const popoutSelects = this.querySelectorAll('popout-select');

        popoutSelects.forEach((popoutSelect) => {
          const popoutToggle = popoutSelect.querySelector('[data-popout-toggle]');

          // watch for aria-expanded changes
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.type === 'attributes' && mutation.attributeName === 'aria-expanded') {
                const popoutList = popoutSelect.querySelector('[data-popout-list]');
                const ariaExpanded = popoutToggle.getAttribute('aria-expanded') === 'true';
                const productGridItemImage = this.querySelector('[data-product-image]');

                if (productGridItemImage) {
                  productGridItemImage.classList.toggle('is-visible', !ariaExpanded);
                }

                popoutList.style.maxHeight = `${Math.abs(popoutToggle.getBoundingClientRect().bottom - this.getBoundingClientRect().bottom)}px`;
              }
            });
          });

          observer.observe(popoutToggle, {
            attributes: true,
            attributeFilter: ['aria-expanded'],
          });
        });
      }
    }
  );
}
