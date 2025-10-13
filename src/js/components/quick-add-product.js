import FetchError from '../util/fetch-error';
import getScript from '../util/get-script';
import wrapElements from '../globals/wrap';

if (!customElements.get('quick-add-product')) {
  customElements.define(
    'quick-add-product',
    class QuickAddProduct extends HTMLElement {
      constructor() {
        super();

        this.quickAddHolder = this.querySelector('[data-quick-add-holder]');
        this.modal = null;
        this.currentModal = null;
        this.productId = this.quickAddHolder.getAttribute('data-quick-add-holder');
        this.modalButton = this.quickAddHolder.querySelector('[data-quick-add-modal-handle]');
        this.handle = this.modalButton?.getAttribute('data-quick-add-modal-handle');
        this.buttonQuickAdd = this.quickAddHolder.querySelector('[data-quick-add-btn]');
        this.buttonATC = this.quickAddHolder.querySelector('[data-add-to-cart]');
        this.button = this.modalButton || this.buttonATC;
        this.modalClose = this.modalClose.bind(this);
        this.modalCloseOnProductAdded = this.modalCloseOnProductAdded.bind(this);
        this.a11y = window.theme.a11y;
        this.isAnimating = false;

        this.modalButtonClickEvent = this.modalButtonClickEvent.bind(this);
        this.quickAddLoadingToggle = this.quickAddLoadingToggle.bind(this);
        this.handleInstantAddVariantChange = this.handleInstantAddVariantChange.bind(this);
      }

      connectedCallback() {
        /**
         * Modal button works for multiple variants products
         */
        if (this.modalButton) {
          this.modalButton.addEventListener('click', this.modalButtonClickEvent);
        }

        /**
         * Quick add button works for single variant products
         */
        if (this.buttonATC) {
          this.buttonATC.addEventListener('click', (e) => {
            e.preventDefault();

            window.theme.a11y.lastElement = this.buttonATC;

            this.closeAllErrorContainers(this.parentElement);

            document.dispatchEvent(
              new CustomEvent('theme:cart:add', {
                detail: {
                  button: this.buttonATC,
                },
              })
            );
          });
        }

        if (this.quickAddHolder) {
          this.quickAddHolder.addEventListener('animationend', this.quickAddLoadingToggle);
          this.errorHandler();
          this.initInstantAdd();
        }

        // Initialize upsell error handling
        this.setupUpsellErrorHandling();
      }

      modalButtonClickEvent(e) {
        e.preventDefault();

        const isSiblingSwapper = this.modalButton.hasAttribute('data-sibling-swapper');
        const isSiblingLinkCurrent = this.modalButton.classList.contains('sibling__link--current');

        if (isSiblingLinkCurrent) return;

        this.modalButton.classList.add('is-loading');
        this.modalButton.disabled = true;

        // Siblings product modal swapper
        if (isSiblingSwapper && !isSiblingLinkCurrent) {
          this.currentModal = e.target.closest('[data-quick-add-modal]');
          this.currentModal.classList.add('is-loading');
        }

        this.closeAllErrorContainers(this.parentElement);
        this.renderModal();
      }

      modalCreate(response) {
        const cachedModal = document.querySelector(`[data-quick-add-modal][data-product-id="${this.productId}"]`);

        if (cachedModal) {
          this.modal = cachedModal;
          this.modalOpen();
        } else {
          const modalTemplate = this.quickAddHolder.querySelector('[data-quick-add-modal-template]');
          if (!modalTemplate) return;

          const htmlObject = document.createElement('div');
          htmlObject.innerHTML = modalTemplate.innerHTML;

          // Add dialog to the body
          document.body.appendChild(htmlObject.querySelector('[data-quick-add-modal]'));
          modalTemplate.remove();

          const apiContent = new DOMParser().parseFromString(response, 'text/html').querySelector('[data-api-content]');

          // Load scripts from the parsed html
          const scriptTags = apiContent.querySelectorAll('script[src]');
          if (scriptTags.length) {
            scriptTags.forEach((script) => {
              const scriptUrl = script.getAttribute('src');
              getScript(
                scriptUrl,
                () => {
                  console.log('success');
                },
                () => {
                  console.log('error');
                }
              );
            });
          }

          this.modal = document.querySelector(`[data-quick-add-modal][data-product-id="${this.productId}"]`);
          this.modal.querySelector('[data-product-upsell-ajax]').innerHTML = apiContent.innerHTML;

          this.modalCreatedCallback();
        }
      }

      modalOpen() {
        if (this.currentModal) {
          this.currentModal.dispatchEvent(new CustomEvent('theme:modal:close', {bubbles: false}));
        }

        // Check if browser supports Dialog tags
        if (typeof this.modal.show === 'function') {
          this.modal.show();
        }

        this.modal.setAttribute('open', true);
        this.modal.removeAttribute('inert');

        this.quickAddHolder.classList.add('is-disabled');

        if (this.modalButton) {
          this.modalButton.classList.remove('is-loading');
          this.modalButton.disabled = false;
          window.theme.a11y.lastElement = this.modalButton;
        }

        // Animate items
        requestAnimationFrame(() => {
          this.modal.querySelectorAll('[data-animation]').forEach((item) => {
            item.classList.add('is-animated');
          });
        });

        document.dispatchEvent(new CustomEvent('theme:quick-add:open', {bubbles: true}));
        document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
        document.addEventListener('theme:product:added', this.modalCloseOnProductAdded, {once: true});
        document.addEventListener('theme:bundle:added', this.modalCloseOnProductAdded, {once: true});
      }

      modalClose() {
        if (this.isAnimating) {
          return;
        }

        if (!this.modal.hasAttribute('closing')) {
          this.modal.setAttribute('closing', '');
          this.isAnimating = true;
          return;
        }

        // Check if browser supports Dialog tags
        if (typeof this.modal.close === 'function') {
          this.modal.close();
        } else {
          this.modal.removeAttribute('open');
        }

        this.modal.removeAttribute('closing');
        this.modal.setAttribute('inert', '');
        this.modal.classList.remove('is-loading');

        if (this.modalButton && !this.modalButton.hasAttribute('data-bundle-product-button')) {
          this.modalButton.disabled = false;
        }

        if (this.quickAddHolder && this.quickAddHolder.classList.contains('is-disabled')) {
          this.quickAddHolder.classList.remove('is-disabled');
        }

        this.resetAnimatedItems();

        // Unlock scroll if no other drawers & modals are open
        if (!window.theme.hasOpenModals()) {
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
        }

        document.removeEventListener('theme:product:added', this.modalCloseOnProductAdded);
        document.removeEventListener('theme:bundle:added', this.modalCloseOnProductAdded);

        this.a11y.removeTrapFocus();
        this.a11y.autoFocusLastElement();
      }

      modalEvents() {
        // Close button click event
        this.modal.querySelector('[data-quick-add-modal-close]')?.addEventListener('click', (e) => {
          e.preventDefault();
          this.modalClose();
        });

        // Close dialog on click outside content
        this.modal.addEventListener('click', (event) => {
          if (event.target.nodeName === 'DIALOG' && event.type === 'click') {
            this.modalClose();
          }
        });

        // Close dialog on click ESC key pressed
        this.modal.addEventListener('keydown', (event) => {
          if (event.code == 'Escape') {
            event.preventDefault();
            this.modalClose();
          }
        });

        this.modal.addEventListener('theme:modal:close', () => {
          this.modalClose();
        });

        // Close dialog after animation completes
        this.modal.addEventListener('animationend', (event) => {
          if (event.target !== this.modal) return;
          this.isAnimating = false;

          if (this.modal.hasAttribute('closing')) {
            this.modalClose();
          } else {
            setTimeout(() => {
              this.a11y.trapFocus(this.modal);
              const focusTarget = this.modal.querySelector('[autofocus]') || this.modal.querySelector('button, [href], select, textarea, [tabindex]:not([tabindex="-1"])');
              focusTarget?.focus();
            }, 50);
          }
        });
      }

      modalCloseOnProductAdded() {
        this.resetQuickAddButtons();
        if (this.modal && this.modal.hasAttribute('open')) {
          this.modalClose();
        }
      }

      quickAddLoadingToggle(e) {
        if (e.target != this.quickAddHolder) return;

        this.quickAddHolder.classList.remove('is-disabled');
      }

      /**
       * Handle error cart response
       */
      errorHandler() {
        this.quickAddHolder.addEventListener('theme:cart:error', (event) => {
          const holder = event.detail.holder;
          const parentProduct = holder.closest('[data-grid-item]');
          if (!parentProduct) return;

          const errorMessageHolder = holder.querySelector('[data-message-error]');
          const button = holder.querySelector('[data-add-to-cart]');

          if (button) {
            button.classList.remove('is-added', 'is-loading');
            holder.classList.add('has-error');
          }

          if (errorMessageHolder) {
            errorMessageHolder.innerText = event.detail.description;
          }

          setTimeout(() => {
            this.resetQuickAddButtons();
          }, 3000);
        });
      }

      /**
       * Reset buttons to default states
       */
      resetQuickAddButtons() {
        if (this.quickAddHolder) {
          this.quickAddHolder.classList.remove('is-visible', 'has-error');
        }

        if (this.buttonQuickAdd && !this.buttonQuickAdd.hasAttribute('data-bundle-product-button')) {
          this.buttonQuickAdd.classList.remove('is-added');
          this.buttonQuickAdd.disabled = false;
        }
      }

      renderModal() {
        if (this.modal) {
          this.modalOpen();
        } else {
          const apiUrl = this.modalButton.hasAttribute('data-bundle-product-button') ? 'api-product-bundle' : 'api-product-upsell';

          window
            .fetch(`${window.theme.routes.root}products/${this.handle}?section_id=${apiUrl}`)
            .then(this.upsellErrorsHandler)
            .then((response) => {
              return response.text();
            })
            .then((response) => {
              this.modalCreate(response);
            });
        }
      }

      modalCreatedCallback() {
        this.modalEvents();
        this.modalOpen();

        wrapElements(this.modal);
      }

      upsellErrorsHandler(response) {
        if (!response.ok) {
          return response.json().then(function (json) {
            const e = new FetchError({
              status: response.statusText,
              headers: response.headers,
              json: json,
            });
            throw e;
          });
        }
        return response;
      }

      /**
       * Initialize instant add functionality for single option products
       */
      initInstantAdd() {
        this.instantAddForm = this.quickAddHolder.querySelector('[data-instant-add-form]');
        if (!this.instantAddForm) return;

        // Prevent duplicate initialization
        if (this.hasAttribute('data-initialized')) return;
        this.setAttribute('data-initialized', 'true');

        // Handle swatch selection
        const swatchInputs = this.instantAddForm.querySelectorAll('[data-variant-selector] input[type="radio"]');
        swatchInputs.forEach((input) => {
          input.addEventListener('change', this.handleInstantAddVariantChange);
        });

        // Close error containers on dropdown selection
        const dropdownOptions = this.instantAddForm.querySelectorAll('[data-dropdown] [data-popout-option]');
        dropdownOptions.forEach((option) => {
          option.addEventListener('click', () => this.closeAllErrorContainers(this.parentElement));
        });
      }

      /**
       * Handle variant change for instant add (swatches)
       */
      handleInstantAddVariantChange(e) {
        const variantId = e.target.getAttribute('data-variant-id');
        if (!variantId) return;

        const variantIdInput = this.instantAddForm.querySelector('[data-variant-id]');
        if (!variantIdInput) return;

        variantIdInput.value = variantId;
        variantIdInput.dispatchEvent(new Event('change'));
        this.closeAllErrorContainers(this.parentElement);
      }

      resetAnimatedItems() {
        this.modal?.querySelectorAll('[data-animation]').forEach((item) => {
          item.classList.remove('is-animated');
        });
      }

      /**
       * Close all visible error containers in a given container
       * @param {HTMLElement} container - The container to search for error containers
       */
      closeAllErrorContainers(container) {
        const errorContainers = container.querySelectorAll('[data-cart-errors-container].is-visible');
        errorContainers.forEach((errorContainer) => {
          errorContainer.classList.remove('is-visible');
        });
      }

      /**
       * Close all open dropdowns in a given container
       * @param {HTMLElement} container - The container to search for open dropdowns
       */
      closeAllOpenDropdowns(container) {
        const openDropdowns = container.querySelectorAll('popout-select');
        openDropdowns.forEach((dropdown) => {
          if (typeof dropdown._hideList === 'function') {
            dropdown._hideList();
          }
        });
      }

      /**
       * Setup error handling for upsell widgets with swiper
       */
      setupUpsellErrorHandling() {
        const swiperContainer = this.closest('swiper-container');
        if (!swiperContainer) return;

        // Check if listener has already been added to prevent duplicates
        if (swiperContainer.hasAttribute('data-swiper-listener-added')) return;
        swiperContainer.setAttribute('data-swiper-listener-added', 'true');

        swiperContainer.addEventListener('swiperslidechangetransitionend', () => {
          this.closeAllErrorContainers(swiperContainer);
          this.closeAllOpenDropdowns(swiperContainer);
        });
      }
    }
  );
}
