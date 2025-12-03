/**
 * Product Images Swiper Component
 * Replaces product-images and product-thumbs custom elements with Swiper
 */

if (!customElements.get('product-images-swiper')) {
  customElements.define(
    'product-images-swiper',
    class ProductImagesSwiper extends HTMLElement {
      constructor() {
        super();

        this.mainSwiper = null;
        this.thumbsSwiper = null;
        this.mainContainer = null;
        this.thumbsContainer = null;
        this.thumbsArrowPrev = null;
        this.thumbsArrowNext = null;
        this.originalThumbsDirection = null; // Store original direction to restore on resize

        this.handleSlideChange = this.handleSlideChange.bind(this);
        this.handleMediaSelect = this.handleMediaSelect.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleThumbClick = this.handleThumbClick.bind(this);
        this.handleThumbKeyup = this.handleThumbKeyup.bind(this);
        this.handleThumbsArrowClick = this.handleThumbsArrowClick.bind(this);
        this.updateThumbsArrows = this.updateThumbsArrows.bind(this);

        customElements.whenDefined('swiper-container').then(() => {
          this.initSwipers();
        });
      }

      connectedCallback() {
        this.mainContainer = this.querySelector('.product__slides swiper-container');
        this.thumbsContainer = this.querySelector('.product__thumbs swiper-container');
        this.thumbsArrowPrev = this.querySelector('[data-thumbs-arrow-prev]');
        this.thumbsArrowNext = this.querySelector('[data-thumbs-arrow-next]');
        this.sectionId = this.getAttribute('data-section-id');
        this.enableThumbs = this.hasAttribute('data-thumbs-enabled');
        this.enableThumbsMobile = this.hasAttribute('data-thumbs-mobile');
        this.activeMediaId = this.getAttribute('data-active-media');
        this.variantImageScroll = this.getAttribute('data-variant-image-scroll') === 'true';

        this.initSwipers();
        this.listen();
      }

      disconnectedCallback() {
        this.cleanup();
      }

      initSwipers() {
        if (!this.mainContainer?.swiper) return;

        this.mainSwiper = this.mainContainer.swiper;

        // Setup thumbnails if enabled and available
        // Check both enableThumbs and enableThumbsMobile (for mobile)
        const shouldEnableThumbs = this.enableThumbs || (theme.isMobile && this.enableThumbsMobile);

        if (this.thumbsContainer?.swiper && shouldEnableThumbs) {
          this.thumbsSwiper = this.thumbsContainer.swiper;

          // Store original direction from data attribute or swiper params
          const thumbsContainer = this.thumbsContainer?.closest('.product__thumbs');
          const originalDirection = thumbsContainer?.getAttribute('data-direction') || this.thumbsSwiper.params.direction;
          this.originalThumbsDirection = originalDirection;

          // Check if viewport is <469px and change direction to horizontal on initial load
          const currentDirection = this.thumbsSwiper.params.direction;

          if (theme.isMobile && currentDirection === 'vertical') {
            // Change to horizontal on mobile
            this.thumbsSwiper.changeDirection('horizontal');
            if (thumbsContainer) {
              thumbsContainer.setAttribute('data-direction', 'horizontal');
            }
          }

          this.setupThumbnailClicks();
          this.setupThumbsArrows();

          // Update arrows on slide change and swiper updates
          this.thumbsSwiper.on('slideChange', this.updateThumbsArrows);
          this.thumbsSwiper.on('reachBeginning', this.updateThumbsArrows);
          this.thumbsSwiper.on('reachEnd', this.updateThumbsArrows);
          this.thumbsSwiper.on('update', this.updateThumbsArrows);

          // Initial update with a small delay to ensure DOM is ready
          queueMicrotask(() => {
            setTimeout(() => {
              // Force swiper to recalculate dimensions (fixes issue with vertical thumbs)
              if (this.thumbsSwiper && !this.thumbsSwiper.destroyed) {
                this.thumbsSwiper.update();
                // Call updateThumbsArrows after update to ensure it runs
                this.updateThumbsArrows();
              }
            }, 100);
          });

          // Also call immediately to ensure it runs at least once
          // Use requestAnimationFrame to ensure DOM is ready
          requestAnimationFrame(() => {
            if (this.thumbsSwiper && !this.thumbsSwiper.destroyed) {
              this.updateThumbsArrows();
            }
          });
        }

        // Handle slide changes on main slider
        this.mainSwiper.on('slideChange', this.handleSlideChange);

        // Handle media select events (for variant changes)
        this.addEventListener('theme:media:select', this.handleMediaSelect);

        // Setup image preloading
        this.setupImagePreloading();

        // Setup keyboard navigation
        this.setupKeyboardNavigation();

        // Set aria-controls to prev/next buttons
        this.setAriaControls();
      }

      handleSlideChange() {
        if (!this.mainSwiper) return;

        const activeSlide = this.mainSwiper.slides[this.mainSwiper.activeIndex];
        if (!activeSlide) return;

        const mediaId = activeSlide.getAttribute('data-media-id');
        if (mediaId) {
          this.setAttribute('data-active-media', mediaId);
          this.setActiveThumbnail(mediaId);

          // Load deferred media if needed
          const deferredMedia = activeSlide.querySelector('deferred-media');
          if (deferredMedia && deferredMedia.getAttribute('loaded') !== 'true') {
            const button = activeSlide.querySelector('[data-deferred-media-button]');
            if (button) {
              button.dispatchEvent(new Event('click', {bubbles: false}));
            }
          }

          // Focus management
          if (document.body.classList.contains('is-focused')) {
            const focusable = activeSlide.querySelector('model-viewer, video, iframe, button, [href], input, [tabindex]:not([tabindex="-1"])');
            focusable?.focus();
          }
        }
      }

      handleThumbClick(e) {
        const thumbLink = e.target.closest('[data-thumb-link]');
        if (!thumbLink) return;

        e.preventDefault();
        e.stopPropagation();

        const thumbItem = thumbLink.closest('[data-thumb-item]');
        if (!thumbItem) return;

        // Get the media ID from the thumbnail
        const mediaId = thumbItem.getAttribute('data-media-id');
        if (!mediaId) return;

        // Find the corresponding slide in the main slider
        const slides = this.mainSwiper.slides;
        let targetIndex = -1;

        for (let i = 0; i < slides.length; i++) {
          if (slides[i].getAttribute('data-media-id') === mediaId) {
            targetIndex = i;
            break;
          }
        }

        if (targetIndex >= 0) {
          // Update main slider
          this.mainSwiper.slideTo(targetIndex);

          // Update thumbnail slider to match (scroll to show the active thumb)
          const thumbSlide = thumbItem.closest('swiper-slide');
          if (thumbSlide && this.thumbsSwiper) {
            const thumbIndex = Array.from(this.thumbsSwiper.slides).indexOf(thumbSlide);
            if (thumbIndex >= 0) {
              this.thumbsSwiper.slideTo(thumbIndex);
            }
          }

          // Set active thumbnail
          this.setActiveThumbnail(mediaId);
        }
      }

      handleThumbKeyup(e) {
        if (e.code !== 'Enter' && e.code !== 'Space') return;

        const thumbLink = e.target.closest('[data-thumb-link]');
        if (!thumbLink) return;

        e.preventDefault();
        e.stopPropagation();

        const thumbItem = thumbLink.closest('[data-thumb-item]');
        if (!thumbItem) return;

        const mediaId = thumbItem.getAttribute('data-media-id');
        if (!mediaId || !this.mainSwiper) return;

        // Find the corresponding slide in the main slider
        const slides = this.mainSwiper.slides;
        let targetIndex = -1;

        for (let i = 0; i < slides.length; i++) {
          if (slides[i].getAttribute('data-media-id') === mediaId) {
            targetIndex = i;
            break;
          }
        }

        if (targetIndex >= 0) {
          this.mainSwiper.slideTo(targetIndex);

          // Move focus to the main slide after a short delay
          setTimeout(() => {
            const activeSlide = this.mainSwiper.slides[this.mainSwiper.activeIndex];
            if (activeSlide) {
              const focusable = activeSlide.querySelector('model-viewer, video, iframe, button, [href], input, [tabindex]:not([tabindex="-1"])');
              focusable?.focus();
            }
          }, 150);
        }
      }

      setupThumbnailClicks() {
        if (!this.thumbsContainer || !this.thumbsSwiper || !this.mainSwiper) {
          return;
        }

        // Use event delegation on the thumbs container for better reliability
        this.thumbsContainer.addEventListener('click', this.handleThumbClick);
        this.thumbsContainer.addEventListener('keyup', this.handleThumbKeyup);
      }

      handleMediaSelect(e) {
        const mediaId = e.detail?.id;
        if (mediaId) {
          this.selectMedia(mediaId);
        }
      }

      selectMedia(mediaId) {
        if (!mediaId || !this.mainSwiper) return;

        // Find the slide index by media-id
        const slides = this.mainSwiper.slides;
        let targetIndex = 0;

        for (let i = 0; i < slides.length; i++) {
          if (slides[i].getAttribute('data-media-id') === mediaId) {
            targetIndex = i;
            break;
          }
        }

        // Slide to the target slide
        if (this.mainSwiper.activeIndex !== targetIndex) {
          this.mainSwiper.slideTo(targetIndex);
        }

        this.setAttribute('data-active-media', mediaId);
      }

      setActiveThumbnail(mediaId) {
        if (!this.thumbsContainer || !mediaId) return;

        // Remove active class and aria-current from all thumbnails
        this.thumbsContainer.querySelectorAll('.product__thumb').forEach((thumb) => {
          thumb.classList.remove('is-active');
          const thumbButton = thumb.querySelector('[data-thumb-link]');
          if (thumbButton) {
            thumbButton.setAttribute('aria-current', 'false');
          }
        });

        // Add active class and aria-current to the matching thumbnail
        const activeThumb = this.thumbsContainer.querySelector(`[data-media-id="${mediaId}"]`);
        if (activeThumb) {
          activeThumb.classList.add('is-active');
          const activeThumbButton = activeThumb.querySelector('[data-thumb-link]');
          if (activeThumbButton) {
            activeThumbButton.setAttribute('aria-current', 'true');
          }
        }
      }

      setupImagePreloading() {
        if (!this.mainSwiper) return;

        // Preload next/previous images on navigation button hover
        const navigationPrev = this.querySelector('.product__slides .swiper-button-prev');
        const navigationNext = this.querySelector('.product__slides .swiper-button-next');

        if (navigationPrev) {
          navigationPrev.addEventListener('mouseenter', () => {
            const prevIndex = this.mainSwiper.activeIndex > 0 ? this.mainSwiper.activeIndex - 1 : this.mainSwiper.slides.length - 1;
            this.preloadImage(prevIndex);
          });
        }

        if (navigationNext) {
          navigationNext.addEventListener('mouseenter', () => {
            const nextIndex = this.mainSwiper.activeIndex < this.mainSwiper.slides.length - 1 ? this.mainSwiper.activeIndex + 1 : 0;
            this.preloadImage(nextIndex);
          });
        }

        // Preload images on thumbnail hover
        if (this.thumbsContainer) {
          this.thumbsContainer.querySelectorAll('[data-thumb-link]').forEach((thumb) => {
            thumb.addEventListener('mouseenter', () => {
              const mediaId = thumb.closest('[data-thumb-item]')?.getAttribute('data-media-id');
              if (mediaId) {
                const slide = this.mainContainer.querySelector(`[data-media-id="${mediaId}"]`);
                if (slide) {
                  const img = slide.querySelector('img');
                  if (img) {
                    img.setAttribute('loading', 'eager');
                  }
                }
              }
            });
          });
        }
      }

      preloadImage(index) {
        if (!this.mainSwiper || !this.mainSwiper.slides[index]) return;

        const slide = this.mainSwiper.slides[index];
        const img = slide.querySelector('img');
        if (img) {
          img.setAttribute('loading', 'eager');
        }
      }

      setupKeyboardNavigation() {
        // Keyboard navigation is handled by Swiper's keyboard option
        // But we can add additional handling if needed
        this.addEventListener('keyup', (e) => {
          if (!this.mainSwiper) return;

          if (e.code === 'ArrowLeft') {
            this.mainSwiper.slidePrev();
          } else if (e.code === 'ArrowRight') {
            this.mainSwiper.slideNext();
          }
        });
      }

      listen() {
        document.addEventListener('theme:resize:width', this.handleResize);
      }

      handleResize() {
        if (this.thumbsSwiper && !this.thumbsSwiper.destroyed) {
          const currentDirection = this.thumbsSwiper.params.direction;
          const thumbsContainer = this.thumbsContainer?.closest('.product__thumbs');

          if (theme.isMobile && currentDirection === 'vertical') {
            // Change to horizontal on mobile
            this.thumbsSwiper.changeDirection('horizontal');
            if (thumbsContainer) {
              thumbsContainer.setAttribute('data-direction', 'horizontal');
            }
          } else if (!theme.isMobile && currentDirection === 'horizontal' && this.originalThumbsDirection === 'vertical') {
            // Change back to vertical on larger screens if it was originally vertical
            this.thumbsSwiper.changeDirection('vertical');
            if (thumbsContainer) {
              thumbsContainer.setAttribute('data-direction', 'vertical');
            }
          }

          this.thumbsSwiper.update();
          this.updateThumbsArrows();
        }
      }

      setupThumbsArrows() {
        if (!this.thumbsArrowPrev || !this.thumbsArrowNext || !this.thumbsSwiper) {
          return;
        }

        this.thumbsArrowPrev.addEventListener('click', this.handleThumbsArrowClick);
        this.thumbsArrowNext.addEventListener('click', this.handleThumbsArrowClick);
      }

      handleThumbsArrowClick(e) {
        if (!this.thumbsSwiper) return;

        const button = e.currentTarget;
        const isPrev = button === this.thumbsArrowPrev;

        if (isPrev) {
          this.thumbsSwiper.slidePrev();
        } else {
          this.thumbsSwiper.slideNext();
        }
      }

      updateThumbsArrows() {
        if (!this.thumbsSwiper) {
          return;
        }
        if (!this.thumbsArrowPrev || !this.thumbsArrowNext) {
          return;
        }

        const thumbsContainer = this.thumbsContainer?.closest('.product__thumbs');
        if (!thumbsContainer) return;

        const isBeginning = this.thumbsSwiper.isBeginning;
        const isEnd = this.thumbsSwiper.isEnd;
        const slidesCount = this.thumbsSwiper.slides.length;

        // Check if scrolling is needed
        // Check if swiper is locked (can't scroll) or compare container vs wrapper dimensions
        const containerEl = this.thumbsSwiper.el;
        const wrapperEl = this.thumbsSwiper.wrapperEl || this.thumbsContainer?.querySelector('.swiper-wrapper');
        if (!containerEl || !wrapperEl) return;

        const isHorizontal = this.thumbsSwiper.params.direction === 'horizontal';

        // Check if swiper is locked (no scrolling needed)
        const isLocked = this.thumbsSwiper.locked || false;

        // Also check dimensions as fallback
        const needsScrolling = !isLocked && (isHorizontal ? wrapperEl.scrollWidth > containerEl.clientWidth : wrapperEl.scrollHeight > containerEl.clientHeight);

        // Hide arrows and remove padding if scrolling isn't needed
        if (!needsScrolling || slidesCount <= 1) {
          thumbsContainer.classList.add('thumbs-no-scroll');
          this.thumbsArrowPrev?.setAttribute('disabled', 'true');
          this.thumbsArrowNext?.setAttribute('disabled', 'true');
          return;
        }

        // Show arrows and add padding when scrolling is needed
        thumbsContainer.classList.remove('thumbs-no-scroll');

        // Update disabled state based on swiper position
        this.thumbsArrowPrev?.toggleAttribute('disabled', isBeginning);
        this.thumbsArrowNext?.toggleAttribute('disabled', isEnd);
      }

      cleanup() {
        if (this.mainSwiper && !this.mainSwiper.destroyed) {
          this.mainSwiper.off('slideChange', this.handleSlideChange);
        }
        if (this.thumbsSwiper && !this.thumbsSwiper.destroyed) {
          this.thumbsSwiper.off('slideChange', this.updateThumbsArrows);
          this.thumbsSwiper.off('reachBeginning', this.updateThumbsArrows);
          this.thumbsSwiper.off('reachEnd', this.updateThumbsArrows);
          this.thumbsSwiper.off('update', this.updateThumbsArrows);
        }
        if (this.thumbsContainer) {
          this.thumbsContainer.removeEventListener('click', this.handleThumbClick);
          this.thumbsContainer.removeEventListener('keyup', this.handleThumbKeyup);
        }
        if (this.thumbsArrowPrev) {
          this.thumbsArrowPrev.removeEventListener('click', this.handleThumbsArrowClick);
        }
        if (this.thumbsArrowNext) {
          this.thumbsArrowNext.removeEventListener('click', this.handleThumbsArrowClick);
        }
        this.removeEventListener('theme:media:select', this.handleMediaSelect);
        document.removeEventListener('theme:resize:width', this.handleResize);
      }

      // Public method to get current media ID (for product-info.js compatibility)
      getCurrentMediaId() {
        if (!this.mainSwiper) return null;
        const activeSlide = this.mainSwiper.slides[this.mainSwiper.activeIndex];
        if (!activeSlide) return null;
        return activeSlide.getAttribute('data-media-id') || null;
      }

      // Public method to scroll to media (for variant changes)
      scrollToMedia(mediaId) {
        this.selectMedia(mediaId);
      }

      setAriaControls() {
        const buttons = this.querySelectorAll('[aria-controls]');
        buttons.forEach((btn) => {
          btn.setAttribute('aria-controls', btn.getAttribute('data-aria-controls') || '');
          btn.removeAttribute('data-aria-controls');
        });
      }
    }
  );
}
