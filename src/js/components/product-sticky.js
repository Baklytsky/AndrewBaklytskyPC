if (!customElements.get('product-sticky')) {
  customElements.define(
    'product-sticky',
    class ProductSticky extends HTMLElement {
      constructor() {
        super();

        this.stickyScrollTop = 0;
        this.scrollLastPosition = 0;
        this.stickyDefaultTop = 0;
        this.currentPoint = 0;
        this.defaultTopBottomSpacings = 30;
        this.scrollTopPosition = window.scrollY;
        this.scrollDirectionDown = true;
        this.requestAnimationSticky = null;
        this.stickyFormLoad = true;
        this.stickyFormLastHeight = null;
        this.onChangeCounter = 0;
        this.scrollEvent = (e) => this.scrollEvents(e);
        this.resizeEvent = (e) => this.resizeEvents(e);
        this.stickyFormEvent = (e) => this.stickyFormEvents(e);
      }

      connectedCallback() {
        this.formWrapper = this.querySelector('[data-form-wrapper]');

        if (!this.formWrapper) return;

        this.stickyScrollCheck();
        document.addEventListener('theme:resize', this.resizeEvent);

        if (theme.settings.productPageSticky) {
          this.requestAnimationSticky = requestAnimationFrame(() => this.calculateStickyPosition());

          this.formWrapper.addEventListener('theme:form:sticky', this.stickyFormEvent);

          document.addEventListener('theme:scroll', this.scrollEvent);
        }
      }

      stickyFormEvents(e) {
        this.removeAnimationFrameSticky();

        this.requestAnimationSticky = requestAnimationFrame(() => this.calculateStickyPosition(e));
      }

      scrollEvents(e) {
        this.scrollTopPosition = e.detail.position;
        this.scrollDirectionDown = e.detail.down;

        if (!this.requestAnimationSticky) {
          this.requestAnimationSticky = requestAnimationFrame(() => this.calculateStickyPosition());
        }
      }

      resizeEvents(e) {
        this.removeAnimationFrameSticky();

        // Re-query formWrapper in case DOM changed
        this.formWrapper = this.querySelector('[data-form-wrapper]');
        if (!this.formWrapper) return;

        this.stickyScrollCheck();

        // Remove existing listeners before re-adding
        document.removeEventListener('theme:scroll', this.scrollEvent);
        if (this.formWrapper) {
          this.formWrapper.removeEventListener('theme:form:sticky', this.stickyFormEvent);
        }

        // Re-add listeners if sticky is enabled
        if (theme.settings.productPageSticky) {
          this.formWrapper.addEventListener('theme:form:sticky', this.stickyFormEvent);
          document.addEventListener('theme:scroll', this.scrollEvent);
        }
      }

      stickyScrollCheck() {
        if (!theme.isMobile) {
          // Look for product-images-swiper or .product__slides as the media container
          const productMediaList = this.querySelector('product-images-swiper .product__slides') ||
                                   this.querySelector('.product__slides') ||
                                   this.querySelector('product-images-swiper');

          if (!this.formWrapper || !productMediaList) return;

          const productCopyHeight = this.formWrapper.offsetHeight;
          const productImagesHeight = productMediaList.offsetHeight;

          // Is the product description and form taller than window space
          // Is also shorter than the window and images
          if (productCopyHeight < productImagesHeight) {
            theme.settings.productPageSticky = true;
            this.formWrapper.classList.add('is-sticky');
          } else {
            theme.settings.productPageSticky = false;
            this.formWrapper.classList.remove('is-sticky');
          }
        } else {
          theme.settings.productPageSticky = false;
          this.formWrapper.classList.remove('is-sticky');
        }
      }

      calculateStickyPosition(e = null) {
        const isScrollLocked = document.documentElement.hasAttribute('data-scroll-locked');
        if (isScrollLocked) {
          this.removeAnimationFrameSticky();
          return;
        }

        if (!this.formWrapper) {
          this.removeAnimationFrameSticky();
          return;
        }

        const eventExist = Boolean(e && e.detail);
        const isAccordion = Boolean(eventExist && e.detail.element && e.detail.element === 'accordion');
        const formWrapperHeight = this.formWrapper.offsetHeight;
        const heightDifference = theme.windowHeight - formWrapperHeight - this.defaultTopBottomSpacings;
        const scrollDifference = Math.abs(this.scrollTopPosition - this.scrollLastPosition);

        if (this.scrollDirectionDown) {
          this.stickyScrollTop -= scrollDifference;
        } else {
          this.stickyScrollTop += scrollDifference;
        }

        if (this.stickyFormLoad) {
          if (document.querySelector('[data-header-sticky]')) {
            const {headerHeight} = window.theme.readHeights();
            this.stickyDefaultTop = headerHeight;
          } else {
            this.stickyDefaultTop = this.defaultTopBottomSpacings;
          }

          this.stickyScrollTop = this.stickyDefaultTop;
        }

        this.stickyScrollTop = Math.min(Math.max(this.stickyScrollTop, heightDifference), this.stickyDefaultTop);

        const differencePoint = this.stickyScrollTop - this.currentPoint;
        this.currentPoint = this.stickyFormLoad ? this.stickyScrollTop : this.currentPoint + differencePoint * 0.5;

        this.formWrapper.style.setProperty('--sticky-top', `${this.currentPoint}px`);

        this.scrollLastPosition = this.scrollTopPosition;
        this.stickyFormLoad = false;

        if (
          (isAccordion && this.onChangeCounter <= 10) ||
          (isAccordion && this.stickyFormLastHeight !== formWrapperHeight) ||
          (this.stickyScrollTop !== this.currentPoint && this.requestAnimationSticky)
        ) {
          if (isAccordion) {
            this.onChangeCounter += 1;
          }

          if (isAccordion && this.stickyFormLastHeight !== formWrapperHeight) {
            this.onChangeCounter = 11;
          }

          this.requestAnimationSticky = requestAnimationFrame(() => this.calculateStickyPosition(e));
        } else if (this.requestAnimationSticky) {
          this.removeAnimationFrameSticky();
        }

        this.stickyFormLastHeight = formWrapperHeight;
      }

      removeAnimationFrameSticky() {
        if (this.requestAnimationSticky) {
          cancelAnimationFrame(this.requestAnimationSticky);
          this.requestAnimationSticky = null;
          this.onChangeCounter = 0;
        }
      }

      disconnectedCallback() {
        this.removeAnimationFrameSticky();
        document.removeEventListener('theme:resize', this.resizeEvent);

        if (theme.settings.productPageSticky) {
          document.removeEventListener('theme:scroll', this.scrollEvent);
        }

        if (this.formWrapper) {
          this.formWrapper.removeEventListener('theme:form:sticky', this.stickyFormEvent);
        }
      }
    }
  );
}
