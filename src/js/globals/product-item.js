const selectors = {
  swapHandle: '[data-swap-handle]',
};

const attributes = {
  swapHandle: 'data-swap-handle',
  swapUrl: 'data-swap-url',
};

if (!customElements.get('product-item')) {
  customElements.define(
    'product-item',
    class ProductItem extends HTMLElement {
      abortController = undefined;
      pendingSwapHandle = null;
      postProcessHtmlCallbacks = [];

      handleClick = (event) => this.handleChange(event);
      handleKeyup = (event) => {
        if (event.code === theme.keyboardKeys.ENTER || event.code === theme.keyboardKeys.NUMPADENTER) {
          this.handleChange(event);
        }
      };

      constructor() {
        super();
        this.swapHandles = this.querySelectorAll(selectors.swapHandle);
      }

      connectedCallback() {
        this.swapHandles?.forEach((element) => {
          element.addEventListener('click', this.handleClick);
          element.addEventListener('keyup', this.handleKeyup);
        });

        this.initProductSwapUtility();
      }

      disconnectedCallback() {
        // Abort any pending fetch requests
        this.abortController?.abort();

        // Remove event listeners
        this.swapHandles?.forEach((element) => {
          element.removeEventListener('click', this.handleClick);
          element.removeEventListener('keyup', this.handleKeyup);
        });
      }

      initProductSwapUtility() {
        this.postProcessHtmlCallbacks.push((newNode) => {
          if (this.pendingSwapHandle) {
            const swapHandle = newNode.querySelector(`[${attributes.swapHandle}="${this.pendingSwapHandle}"]`);
            swapHandle?.focus();
            this.pendingSwapHandle = null;
          }
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
          requestUrl: `${productUrl}?section_id=api-product-grid-item`,
          // Returns a function that will process and swap the HTML after fetch completes
          callback: this.handleSwapProduct(),
        });
      }

      handleSwapProduct() {
        return (html) => {
          // Set up animation parameters with the new product-item element's ID
          const aosDelay = 0;
          const productItem = html.querySelector('product-item');
          const aosAnchor = productItem.id ? `#${productItem.id}` : '';

          // Get the raw HTML and replace animation placeholder strings
          let productHTML = productItem.outerHTML;
          productHTML = productHTML.includes('||itemAnimationDelay||') ? productHTML.replaceAll('||itemAnimationDelay||', aosDelay) : productHTML;
          productHTML = productHTML.includes('||itemAnimationAnchor||') ? productHTML.replaceAll('||itemAnimationAnchor||', aosAnchor) : productHTML;

          // Parse the processed HTML back into a DOM element
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = productHTML;
          const processedProductItem = tempDiv.querySelector('product-item');

          window.theme.htmlUpdate.viewTransition(
            this, // Current product-item element to be replaced
            processedProductItem, // New product-item element with updated content
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
          });
      }
    }
  );
}
