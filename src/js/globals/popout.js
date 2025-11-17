if (!customElements.get('popout-select')) {
  customElements.define(
    'popout-select',
    class Popout extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
        this.popoutList = this.querySelector('[data-popout-list]');
        this.popoutToggle = this.querySelector('[data-popout-toggle]');
        this.popoutToggleText = this.querySelector('[data-popout-toggle-text]');
        this.popoutInput = this.querySelector('[data-popout-input]') || this.parentNode.querySelector('[data-popout-input]') || this.parentNode.parentNode.querySelector('[data-quantity-input]');

        this.popoutOptions = this.querySelectorAll('[data-popout-option]');
        this.productGridItem = this.popoutList.closest('[data-grid-item]');
        this.fireSubmitEvent = this.hasAttribute('submit');
        this.shouldChangeVariant = this.hasAttribute('data-variant-change');

        this.popupToggleFocusoutEvent = (evt) => this.onPopupToggleFocusout(evt);
        this.popupListFocusoutEvent = (evt) => this.onPopupListFocusout(evt);
        this.popupToggleClickEvent = (evt) => this.onPopupToggleClick(evt);
        this.keyUpEvent = (evt) => this.onKeyUp(evt);
        this.bodyClickEvent = (evt) => this.onBodyClick(evt);

        this._connectOptions();
        this._connectToggle();
        this._onFocusOut();
        this.popupListSetDimensions();
      }

      onPopupToggleClick(evt) {
        const button = evt.currentTarget;
        const ariaExpanded = button.getAttribute('aria-expanded') === 'true';

        if (this.productGridItem) {
          const productGridItemImage = this.productGridItem.querySelector('[data-product-image]');

          if (productGridItemImage) {
            productGridItemImage.classList.toggle('is-visible', !ariaExpanded);
          }

          this.popoutList.style.maxHeight = `${Math.abs(this.popoutToggle.getBoundingClientRect().bottom - this.productGridItem.getBoundingClientRect().bottom)}px`;
        }

        evt.currentTarget.setAttribute('aria-expanded', !ariaExpanded);
        this.popoutList.classList.toggle('popout-list--visible');
        this.popupListSetDimensions();
        this.toggleListPosition();

        document.body.addEventListener('click', this.bodyClickEvent);
      }

      onPopupToggleFocusout(evt) {
        const popoutLostFocus = this.contains(evt.relatedTarget);

        if (!popoutLostFocus) {
          this._hideList();
        }
      }

      onPopupListFocusout(evt) {
        const childInFocus = evt.currentTarget.contains(evt.relatedTarget);
        const isVisible = this.popoutList.classList.contains('popout-list--visible');

        if (isVisible && !childInFocus) {
          this._hideList();
        }
      }

      toggleListPosition() {
        const button = this.querySelector('[data-popout-toggle]');
        const popoutTop = this.getBoundingClientRect().top + this.clientHeight;
        const isInDrawer = this.closest('cart-drawer');

        const removeTopClass = () => {
          if (button.getAttribute('aria-expanded') !== 'true') {
            // Don't remove the class if inside the cart drawer to prevent excess scrollbar
            // Even though `select-popout__list`is absolute, it extends the scrollable container and creates a scrollbar inside the drawer body
            if (!isInDrawer) {
              this.popoutList.classList.remove('popout-list--top');
            }
          }

          this.popoutList.removeEventListener('transitionend', removeTopClass);
        };

        if (button.getAttribute('aria-expanded') === 'true') {
          this.popoutList.classList.toggle('popout-list--top', theme.windowHeight / 2 < popoutTop);
        } else {
          this.popoutList.addEventListener('transitionend', removeTopClass);
        }
      }

      popupListSetDimensions() {
        this.popoutList.style.setProperty('--max-width', '100vw');
        this.popoutList.style.setProperty('--max-height', '100vh');

        requestAnimationFrame(() => {
          this.popoutList.style.setProperty('--max-width', `${parseInt(theme.windowWidth - this.popoutList.getBoundingClientRect().left)}px`);
          this.popoutList.style.setProperty('--max-height', `${parseInt(theme.windowHeight - this.popoutList.getBoundingClientRect().top)}px`);
        });
      }

      popupOptionsClick(evt) {
        const link = evt.target.closest('[data-popout-option]');

        if (link && link.attributes.href.value === '#') {
          evt.preventDefault();

          const attrValue = link.hasAttribute('data-value') ? link.getAttribute('data-value') : '';

          this.popoutInput.value = attrValue;

          // Sync option metadata onto the hidden input so downstream logic can read it
          const listItem = link.closest('li');
          if (listItem) {
            const optionValueId = listItem.getAttribute('data-option-value-id');
            const productUrl = listItem.getAttribute('data-product-url');
            if (optionValueId) this.popoutInput.setAttribute('data-option-value-id', optionValueId);
            if (productUrl) this.popoutInput.setAttribute('data-product-url', productUrl);
          }

          if (this.popoutInput.disabled) {
            this.popoutInput.removeAttribute('disabled');
          }

          if (this.fireSubmitEvent) {
            this._submitForm(attrValue);
          } else {
            const currentTarget = link.parentElement;
            const listTargetElement = this.popoutList.querySelector('.is-active');
            const targetAttribute = this.popoutList.querySelector('[aria-current]');

            // Fire a bubbling change event so parent controllers can react
            this.popoutInput.dispatchEvent(new Event('change', {bubbles: true}));

            // Trigger variant change if this is a variant selector
            if (this.shouldChangeVariant) {
              this.triggerVariantChange(link);
            }

            if (listTargetElement) {
              listTargetElement.classList.remove('is-active');
              currentTarget.classList.add('is-active');
            }

            if (this.popoutInput.name == 'quantity' && !currentTarget.nextSibling) {
              this.classList.add('is-hidden');
            }

            if (targetAttribute && targetAttribute.hasAttribute('aria-current')) {
              targetAttribute.removeAttribute('aria-current');
            }
            link.setAttribute('aria-current', 'true');

            if (attrValue !== '') {
              this.popoutToggleText.innerHTML = attrValue;

              if (this.popoutToggleText.hasAttribute('data-popout-toggle-text') && this.popoutToggleText.getAttribute('data-popout-toggle-text') !== '') {
                this.popoutToggleText.setAttribute('data-popout-toggle-text', attrValue);
              }
            }
            this.onPopupToggleFocusout(evt);
            this.onPopupListFocusout(evt);
          }
        }
      }

      onKeyUp(evt) {
        if (evt.code !== 'Escape') {
          return;
        }
        this._hideList();
        this.popoutToggle.focus();
      }

      onBodyClick(evt) {
        const isOption = this.contains(evt.target);
        const isVisible = this.popoutList.classList.contains('popout-list--visible');

        if (isVisible && !isOption) {
          this._hideList();
        }
      }

      _connectToggle() {
        this.popoutToggle.addEventListener('click', this.popupToggleClickEvent);
      }

      _connectOptions() {
        if (this.popoutOptions.length) {
          this.popoutOptions.forEach((element) => {
            element.addEventListener('click', (evt) => this.popupOptionsClick(evt));
          });
        }
      }

      _onFocusOut() {
        this.addEventListener('keyup', this.keyUpEvent);
        this.popoutToggle.addEventListener('focusout', this.popupToggleFocusoutEvent);
        this.popoutList.addEventListener('focusout', this.popupListFocusoutEvent);
      }

      _submitForm() {
        const form = this.closest('form');
        if (form) {
          form.submit();
        }
      }

      _hideList() {
        this.popoutList.classList.remove('popout-list--visible');
        this.popoutToggle.setAttribute('aria-expanded', false);
        this.toggleListPosition();
        document.body.removeEventListener('click', this.bodyClickEvent);
      }

      /**
       * Trigger variant change for popout select
       * @param {HTMLElement} link - The link that was clicked
       */
      triggerVariantChange(link) {
        if (!link) return;
        const variantId = link.getAttribute('data-variant-id');
        const form = this.closest('form');
        if (!variantId || !form) return;
        const variantIdInput = form.querySelector('[name="id"]');
        if (!variantIdInput) return;

        variantIdInput.value = variantId;
        variantIdInput.dispatchEvent(new Event('change'));
      }
    }
  );
}
