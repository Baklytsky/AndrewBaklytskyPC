if (!customElements.get('product-thumbs')) {
  customElements.define(
    'product-thumbs',
    class ProductThumbs extends HTMLElement {
      constructor() {
        super();

        this.container = this.closest('[data-section-id]');
        this.productImages = this.container.querySelectorAll('[data-image-id]');
        this.productImagesContainer = this.container.querySelector('product-images');
        this.productThumbs = this.container.querySelectorAll('[data-thumb-item]');
        this.thumbSlider = this.querySelector('[data-thumbs-slider]');
        this.thumbLinks = this.querySelectorAll('[data-thumb-link]');
      }

      connectedCallback() {
        this.handleEvents();
        this.preloadImagesOnHover();
        this.activeMediaObserver();
      }

      disconnectedCallback() {
        if (this.observer) {
          this.observer.disconnect();
        }
      }

      activeMediaObserver() {
        const config = {attributes: true, childList: false, subtree: false};

        // Callback function to execute when mutations are observed
        const callback = (mutationList) => {
          for (const mutation of mutationList) {
            if (mutation.type === 'attributes' && mutation.attributeName == 'data-active-media') {
              this.setActiveThumb();
            }
          }
        };

        this.observer = new MutationObserver(callback);
        this.observer.observe(this.productImagesContainer, config);
      }

      handleEvents() {
        this.thumbLinks.forEach((thumb) => {
          thumb.addEventListener('click', (e) => {
            e.preventDefault();
            const thumbItem = thumb.closest('[data-thumb-item]');
            const id = thumb.getAttribute('data-media-id');

            // Do nothing if clicked on the active thumbnail
            if (thumbItem.classList.contains('is-active')) return;

            // Dispatch media select event to show the related product image
            this.dispatchEvent(
              new CustomEvent('theme:media:select', {
                bubbles: true,
                detail: {
                  id: id,
                },
              })
            );
          });

          thumb.addEventListener('keyup', (e) => {
            // On keypress Enter move the focus to the first focusable element in the related slide
            if (e.code === 'Enter') {
              const mediaId = thumb.getAttribute('data-media-id');
              const mediaElem = this.productImagesContainer
                .querySelector(`[data-media-id="${mediaId}"]`)
                ?.querySelectorAll('model-viewer, video, iframe, button, [href], input, [tabindex]:not([tabindex="-1"])')[0];
              if (mediaElem) {
                mediaElem.dispatchEvent(new Event('focus'));
                mediaElem.dispatchEvent(new Event('select'));
              }
            }
          });
        });
      }

      // Preload product images when hover on a related thumbnail
      preloadImagesOnHover() {
        this.thumbLinks.forEach((thumb) => {
          thumb.addEventListener('mouseover', () => {
            const id = thumb.getAttribute('data-media-id');
            const productImage = this.productImagesContainer.querySelector(`[data-media-id="${id}"] img`);
            productImage?.setAttribute('loading', 'eager');
          });
        });
      }

      setActiveThumb() {
        const id = this.productImagesContainer.getAttribute('data-active-media');
        const selectedThumb = this.querySelector(`[data-media-id="${id}"]`);

        // Remove class active from the previously selected thumbnail
        this.querySelector('[data-thumb-item].is-active')?.classList.remove('is-active');

        // Add class active to the selected thumbnail
        selectedThumb?.parentNode.classList.add('is-active');

        requestAnimationFrame(() => {
          this.scrollToThumb();
        });
      }

      scrollToThumb() {
        const thumbs = this.thumbSlider;

        if (thumbs) {
          const thumb = thumbs.querySelector('.is-active');
          if (!thumb) return;
          const thumbsScrollTop = thumbs.scrollTop;
          const thumbsScrollLeft = thumbs.scrollLeft;
          const thumbsWidth = thumbs.offsetWidth;
          const thumbsHeight = thumbs.offsetHeight;
          const thumbsPositionBottom = thumbsScrollTop + thumbsHeight;
          const thumbsPositionRight = thumbsScrollLeft + thumbsWidth;
          const thumbPosTop = thumb.offsetTop;
          const thumbPosLeft = thumb.offsetLeft;
          const thumbWidth = thumb.offsetWidth;
          const thumbHeight = thumb.offsetHeight;
          const thumbRightPos = thumbPosLeft + thumbWidth;
          const thumbBottomPos = thumbPosTop + thumbHeight;
          const topCheck = thumbsScrollTop > thumbPosTop;
          const bottomCheck = thumbBottomPos > thumbsPositionBottom;
          const leftCheck = thumbsScrollLeft > thumbPosLeft;
          const rightCheck = thumbRightPos > thumbsPositionRight;
          const verticalCheck = bottomCheck || topCheck;
          const horizontalCheck = rightCheck || leftCheck;
          const isMobileView = window.theme.isMobile();

          if (verticalCheck || horizontalCheck) {
            let scrollTopPosition = thumbPosTop - thumbsHeight + thumbHeight;
            let scrollLeftPosition = thumbPosLeft - thumbsWidth + thumbWidth;

            if (topCheck) {
              scrollTopPosition = thumbPosTop;
            }

            if (rightCheck && isMobileView) {
              scrollLeftPosition += parseInt(window.getComputedStyle(thumbs).paddingRight);
            }

            if (leftCheck) {
              scrollLeftPosition = thumbPosLeft;

              if (isMobileView) {
                scrollLeftPosition -= parseInt(window.getComputedStyle(thumbs).paddingLeft);
              }
            }

            thumbs.scrollTo({
              top: scrollTopPosition,
              left: scrollLeftPosition,
              behavior: 'smooth',
            });
          }
        }
      }
    }
  );
}
