if (!customElements.get('product-images')) {
  customElements.define(
    'product-images',
    class ProductImages extends HTMLElement {
      constructor() {
        super();

        this.initialized = false;
        this.buttons = false;
        this.isDown = false;
        this.startX = 0;
        this.startY = 0;
        this.scrollLeft = 0;
        this.onButtonArrowClick = (e) => this.buttonArrowClickEvent(e);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.productMediaItems = this.querySelectorAll('[data-image-id]');
        this.productMediaList = this.querySelector('[data-product-media-list]');
        this.setHeight = this.setHeight.bind(this);
        this.toggleEvents = this.toggleEvents.bind(this);
        this.selectMediaEvent = (e) => this.showMediaOnVariantSelect(e);
      }

      connectedCallback() {
        this.container = this.closest('[data-section-type]');

        if (Object.keys(this.productMediaItems).length <= 1) return;

        this.productMediaObserver();
        this.toggleEvents();
        this.listen();
        requestAnimationFrame(() => {
          this.setHeight();
        });
      }

      disconnectedCallback() {
        this.unlisten();
      }

      listen() {
        document.addEventListener('theme:resize:width', this.toggleEvents);
        document.addEventListener('theme:resize:width', this.setHeight);
        this.addEventListener('theme:media:select', this.selectMediaEvent);
      }

      unlisten() {
        document.removeEventListener('theme:resize:width', this.toggleEvents);
        document.removeEventListener('theme:resize:width', this.setHeight);
        this.removeEventListener('theme:media:select', this.selectMediaEvent);
      }

      toggleEvents() {
        const isMobileView = theme.isMobile;

        if ((isMobileView && this.hasAttribute('data-fader-mobile')) || (!isMobileView && this.hasAttribute('data-fader-desktop'))) {
          this.bindEventListeners();
        } else {
          this.unbindEventListeners();
        }
      }

      bindEventListeners() {
        if (this.initialized) return;

        this.productMediaList.addEventListener('mousedown', this.handleMouseDown);
        this.productMediaList.addEventListener('mouseleave', this.handleMouseLeave);
        this.productMediaList.addEventListener('mouseup', this.handleMouseUp);
        this.productMediaList.addEventListener('mousemove', this.handleMouseMove);
        this.productMediaList.addEventListener('touchstart', this.handleMouseDown, {passive: true});
        this.productMediaList.addEventListener('touchend', this.handleMouseUp, {passive: true});
        this.productMediaList.addEventListener('touchmove', this.handleMouseMove, {passive: true});
        this.productMediaList.addEventListener('keyup', this.handleKeyUp);
        this.initArrows();
        this.resetScrollPosition();

        this.initialized = true;
      }

      unbindEventListeners() {
        if (!this.initialized) return;

        this.productMediaList.removeEventListener('mousedown', this.handleMouseDown);
        this.productMediaList.removeEventListener('mouseleave', this.handleMouseLeave);
        this.productMediaList.removeEventListener('mouseup', this.handleMouseUp);
        this.productMediaList.removeEventListener('mousemove', this.handleMouseMove);
        this.productMediaList.removeEventListener('touchstart', this.handleMouseDown);
        this.productMediaList.removeEventListener('touchend', this.handleMouseUp);
        this.productMediaList.removeEventListener('touchmove', this.handleMouseMove);
        this.productMediaList.removeEventListener('keyup', this.handleKeyUp);
        this.removeArrows();

        this.initialized = false;
      }

      handleMouseDown(e) {
        this.isDown = true;
        this.startX = (e.pageX || e.changedTouches[0].screenX) - this.offsetLeft;
        this.startY = (e.pageY || e.changedTouches[0].screenY) - this.offsetTop;
      }

      handleMouseLeave() {
        if (!this.isDown) return;
        this.isDown = false;
      }

      handleMouseUp(e) {
        const x = (e.pageX || e.changedTouches[0].screenX) - this.offsetLeft;
        const y = (e.pageY || e.changedTouches[0].screenY) - this.offsetTop;
        const distanceX = x - this.startX;
        const distanceY = y - this.startY;
        const swipeDistance = 100;
        const direction = distanceX > 0 ? 1 : -1;
        const isImage = this.getCurrentMedia().hasAttribute('data-type') && this.getCurrentMedia().getAttribute('data-type') === 'image';

        if (Math.abs(distanceX) > swipeDistance && Math.abs(distanceX) > Math.abs(distanceY) && isImage) {
          direction < 0 ? this.showNextImage() : this.showPreviousImage();
        }

        this.isDown = false;

        requestAnimationFrame(() => {
          this.classList.remove('is-dragging');
        });
      }

      handleMouseMove() {
        if (!this.isDown) return;

        this.classList.add('is-dragging');
      }

      handleKeyUp(e) {
        if (e.code === 'ArrowLeft') {
          this.showPreviousImage();
        }

        if (e.code === 'ArrowRight') {
          this.showNextImage();
        }
      }

      handleArrowsClickEvent() {
        this.querySelectorAll('[data-button-arrow]')?.forEach((button) => {
          button.addEventListener('click', (e) => {
            e.preventDefault();

            if (e.target.hasAttribute('data-button-prev')) {
              this.showPreviousImage();
            }

            if (e.target.hasAttribute('data-button-next')) {
              this.showNextImage();
            }
          });
        });
      }

      // When changing from Mobile do Desktop view
      resetScrollPosition() {
        if (this.productMediaList.scrollLeft !== 0) {
          this.productMediaList.scrollLeft = 0;
        }
      }

      initArrows() {
        // Create arrow buttons if don't exist
        if (!this.buttons.length) {
          const buttonsWrap = document.createElement('div');
          buttonsWrap.classList.add('slider__arrows');
          buttonsWrap.innerHTML = theme.sliderArrows.prev + theme.sliderArrows.next;

          // Append buttons outside the slider element
          this.productMediaList.append(buttonsWrap);
          this.buttons = this.querySelectorAll('[data-button-arrow]');
          this.buttonPrev = this.querySelector('[data-button-prev]');
          this.buttonNext = this.querySelector('[data-button-next]');
        }

        this.handleArrowsClickEvent();
        this.preloadImageOnArrowHover();
      }

      removeArrows() {
        this.querySelector('.slider__arrows')?.remove();
      }

      preloadImageOnArrowHover() {
        this.buttonPrev?.addEventListener('mouseover', () => {
          const id = this.getPreviousMediaId();
          this.preloadImage(id);
        });

        this.buttonNext?.addEventListener('mouseover', () => {
          const id = this.getNextMediaId();
          this.preloadImage(id);
        });
      }

      preloadImage(id) {
        this.querySelector(`[data-media-id="${id}"] img`)?.setAttribute('loading', 'eager');
      }

      showMediaOnVariantSelect(e) {
        const id = e.detail.id;
        this.setActiveMedia(id);
      }

      getCurrentMedia() {
        return this.querySelector('[data-image-id].media--active');
      }

      getNextMediaId() {
        const currentMedia = this.getCurrentMedia();
        const nextMedia = currentMedia?.nextElementSibling.hasAttribute('data-image-id') ? currentMedia?.nextElementSibling : this.querySelector('[data-image-id]');

        return nextMedia?.getAttribute('data-media-id');
      }

      getPreviousMediaId() {
        const currentMedia = this.getCurrentMedia();
        const lastIndex = this.productMediaItems.length - 1;
        const previousMedia = currentMedia?.previousElementSibling || this.productMediaItems[lastIndex];

        return previousMedia?.getAttribute('data-media-id');
      }

      showNextImage() {
        const id = this.getNextMediaId();
        this.selectMedia(id);
      }

      showPreviousImage() {
        const id = this.getPreviousMediaId();
        this.selectMedia(id);
      }

      selectMedia(id) {
        this.dispatchEvent(
          new CustomEvent('theme:media:select', {
            detail: {
              id: id,
            },
          })
        );
      }

      setActiveMedia(id) {
        if (!id) return;

        this.setAttribute('data-active-media', id);

        const activeImage = this.querySelector('[data-image-id].media--active');
        const selectedImage = this.querySelector(`[data-media-id="${id}"]`);
        const selectedImageFocus = selectedImage?.querySelector('model-viewer, video, iframe, button, [href], input, [tabindex]');
        const deferredMedia = selectedImage.querySelector('deferred-media');

        activeImage?.classList.add('media--hiding');
        activeImage?.classList.remove('media--active');

        selectedImage?.classList.remove('media--hiding', 'media--hidden');
        selectedImage?.classList.add('media--active');

        // Force media loading if slide becomes visible
        if (deferredMedia && deferredMedia.getAttribute('loaded') !== true) {
          selectedImage.querySelector('[data-deferred-media-button]')?.dispatchEvent(new Event('click', {bubbles: false}));
        }

        requestAnimationFrame(() => {
          this.setHeight();

          // Move focus to the selected media
          if (document.body.classList.contains('is-focused')) {
            selectedImageFocus?.focus();
          }
        });
      }

      // Set current product image height variable to product images container
      setHeight() {
        const mediaHeight = this.querySelector('[data-image-id].media--active')?.offsetHeight || this.productMediaItems[0]?.offsetHeight;
        this.style.setProperty('--height', `${mediaHeight}px`);
      }

      productMediaObserver() {
        this.productMediaItems.forEach((media) => {
          media.addEventListener('transitionend', (e) => {
            if (e.target == media && media.classList.contains('media--hiding')) {
              media.classList.remove('media--hiding');
              media.classList.add('media--hidden');
            }
          });
          media.addEventListener('transitioncancel', (e) => {
            if (e.target == media && media.classList.contains('media--hiding')) {
              media.classList.remove('media--hiding');
              media.classList.add('media--hidden');
            }
          });
        });
      }
    }
  );
}
