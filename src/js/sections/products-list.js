import Flickity from 'flickity';

import ProductVideo from '../media/product-video';
import parallaxSection from '../features/scrollable-parallax';
import {register} from '../vendor/theme-scripts/theme-sections';

const attributes = {
  href: 'href',
  mediaId: 'data-media-id',
  deferredMediaLoaded: 'data-deferred-media-loaded',
};

const selectors = {
  deferredMedia: '[data-deferred-media]',
  deferredMediaButton: '[data-deferred-media-button]',
  productContentWrapper: '[data-product-content-wrapper]',
  productMediaWrapper: '[data-product-single-media-wrapper]',
  productModel: '[data-model]',
  productLink: '[data-product-link]',
  productSingleMediaImage: '[data-product-single-media-image]',
  sliderContents: '[data-slider-contents]',
  sliderImages: '[data-slider-images]',
  tabButton: '[data-tab-button]',
  tabItem: '[data-tab-item]',
  circleText: '[data-circle-text]',
};

const classes = {
  aosAnimate: 'aos-animate',
  tabButtonActive: 'products-list__nav__button--active',
  tabItemActive: 'products-list__item--active',
  mediaHidden: 'media--hidden',
  isDisabled: 'is-disabled',
};

const sections = {};

class ProductsList {
  constructor(section) {
    this.container = section.container;
    this.sectionId = this.container.dataset.sectionId;
    this.tabButtons = this.container.querySelectorAll(selectors.tabButton);
    this.tabItems = this.container.querySelectorAll(selectors.tabItem);
    this.slidersImages = this.container.querySelectorAll(selectors.sliderImages);
    this.slidersContents = this.container.querySelectorAll(selectors.sliderContents);
    this.videos = [];
    this.flktyImages = [];
    this.flktyContent = [];
    this.sliderResizeEvent = () => this.resizeSlider();

    this.initButtons();
    this.initSliders();
    this.initProductVideos();
    this.initProductModel();
    this.initShopifyXrLaunch();
    this.listen();
  }

  listen() {
    if (this.slidersImages.length > 0 || this.slidersContents.length > 0) {
      document.addEventListener('theme:resize', this.sliderResizeEvent);
    }
  }

  resizeSlider() {
    if (this.flktyImages.length > 0) {
      requestAnimationFrame(() => {
        this.flktyImages.forEach((flktyImages) => flktyImages.resize());
      });
    }

    if (this.flktyContent.length > 0) {
      requestAnimationFrame(() => {
        this.flktyContent.forEach((flktyContent) => flktyContent.resize());
      });
    }
  }

  initButtons() {
    if (this.tabButtons.length) {
      this.tabButtons.forEach((tabButton) => {
        tabButton.addEventListener('click', (e) => {
          if (tabButton.classList.contains(classes.tabButtonActive)) {
            return;
          }

          const currentTabAnchor = tabButton.getAttribute(attributes.href);
          const currentTab = this.container.querySelector(currentTabAnchor);
          const currentMedia = currentTab.querySelector(selectors.productMediaWrapper);
          const mediaId = currentMedia ? currentMedia.dataset.mediaId : null;
          const currentCircleText = currentTab.querySelector(selectors.circleText);

          this.tabButtons.forEach((button) => {
            button.classList.remove(classes.tabButtonActive);
          });
          this.tabItems.forEach((item) => {
            const circleText = item.querySelector(selectors.circleText);
            item.classList.remove(classes.tabItemActive);
            circleText?.classList.add(classes.isDisabled);

            if (theme.settings.animations) {
              item.querySelectorAll(`.${classes.aosAnimate}`).forEach((element) => {
                element.classList.remove(classes.aosAnimate);
                setTimeout(() => {
                  element.classList.add(classes.aosAnimate);
                });
              });
            }
          });

          tabButton.classList.add(classes.tabButtonActive);
          currentTab.classList.add(classes.tabItemActive);

          document.dispatchEvent(new CustomEvent('theme:resize')); // Trigger theme:resize event to refresh the slider height

          if (currentCircleText) {
            currentCircleText.classList.remove(classes.isDisabled);
            document.dispatchEvent(new CustomEvent('theme:scroll')); // Trigger theme:scroll event to refresh the circle-text values
          }

          this.handleProductVideos(currentTab, mediaId);

          e.preventDefault();
        });
      });
    }
  }

  initSliders() {
    this.slidersImages.forEach((sliderImages, idx) => {
      const contentsElement = sliderImages.closest(selectors.tabItem).querySelector(selectors.sliderContents);

      const flktyImages = new Flickity(sliderImages, {
        fade: true,
        pageDots: false,
        prevNextButtons: true,
        wrapAround: true,
        adaptiveHeight: true,
        asNavFor: contentsElement,
        on: {
          change: (index) => {
            if (this.flktyContent.length > 0) {
              this.flktyContent[idx].select(index);
            }
          },
        },
      });

      flktyImages.on('settle', (index) => {
        const elements = sliderImages.querySelectorAll(selectors.productMediaWrapper);

        for (let i = 0; i < elements.length; i++) {
          if (i === index) {
            elements[i].querySelector(selectors.productSingleMediaImage).removeAttribute('tabindex');
          } else {
            elements[i].querySelector(selectors.productSingleMediaImage).setAttribute('tabindex', '-1');
          }
        }
      });

      this.flktyImages.push(flktyImages);
    });

    this.slidersContents.forEach((sliderContent) => {
      const flktyContent = new Flickity(sliderContent, {
        fade: true,
        pageDots: false,
        prevNextButtons: false,
        wrapAround: true,
        adaptiveHeight: true,
      });

      flktyContent.on('settle', (index) => {
        const elements = sliderContent.querySelectorAll(selectors.productContentWrapper);

        for (let i = 0; i < elements.length; i++) {
          if (i === index) {
            elements[i].querySelectorAll(selectors.productLink).forEach((element) => {
              element.removeAttribute('tabindex');
            });
          } else {
            elements[i].querySelectorAll(selectors.productLink).forEach((element) => {
              element.setAttribute('tabindex', '-1');
            });
          }
        }
      });

      this.flktyContent.push(flktyContent);
    });
  }

  initProductVideos() {
    this.tabItems.forEach((item) => {
      if (item.classList.contains(classes.tabItemActive)) {
        this.handleProductVideos(item);
      }
    });
  }

  loadVideos(container, mediaId = null) {
    const videoObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const productVideo = new ProductVideo(container);

            this.videos.push(productVideo);
            container.setAttribute(attributes.deferredMediaLoaded, '');
            this.playToggle(mediaId);

            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '300px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    videoObserver.observe(container);
  }

  handleProductVideos(container, mediaId = null) {
    if (!container.hasAttribute(attributes.deferredMediaLoaded)) {
      this.loadVideos(container, mediaId);
      return;
    }

    this.playToggle(mediaId);
  }

  playToggle(mediaId) {
    this.videos.forEach((element) => {
      if (typeof element.pauseContainerMedia === 'function' && mediaId) {
        element.pauseContainerMedia(mediaId, this.container);
        this.switchMedia(mediaId);
      }

      if (!mediaId && Object.keys(element.players).length === 0) {
        this.pauseContainerMedia(this.container);
      }
    });
  }

  switchMedia(mediaId) {
    const selectedMedia = this.container.querySelector(`${selectors.productMediaWrapper}[${attributes.mediaId}="${mediaId}"]`);
    const isFocusEnabled = !document.body.classList.contains(classes.noOutline);

    if (isFocusEnabled) {
      selectedMedia.focus();
    }

    selectedMedia.classList.remove(classes.mediaHidden);
    selectedMedia.dispatchEvent(new CustomEvent('theme:media:visible'), {bubbles: true});
  }

  pauseContainerMedia(container) {
    const mediaItems = container.querySelectorAll(selectors.productMediaWrapper);

    if (mediaItems.length === 0) return;

    mediaItems.forEach((media) => {
      media.dispatchEvent(new CustomEvent('theme:media:hidden'), {bubbles: true});
      media.classList.add(classes.mediaHidden);
    });
  }

  initProductModel() {
    const modelItems = this.container.querySelectorAll(selectors.productModel);
    if (modelItems.length) {
      modelItems.forEach((element) => {
        theme.ProductModel.init(element, this.sectionId);
      });
    }
  }

  initShopifyXrLaunch() {
    document.addEventListener('shopify_xr_launch', () => {
      const currentMedia = this.container.querySelector(`${selectors.productModel}:not(.${classes.mediaHidden})`);
      currentMedia.dispatchEvent(new CustomEvent('xrLaunch'));
    });
  }

  onBlockSelect(evt) {
    // Show selected tab
    evt.target.dispatchEvent(new Event('click'));
  }

  onUnload() {
    if (this.slidersImages.length > 0 || this.slidersContents.length > 0) {
      document.removeEventListener('theme:resize', this.sliderResizeEvent);
    }
  }
}

const productsListSection = {
  onLoad() {
    sections[this.id] = new ProductsList(this);
  },
  onUnload() {
    sections[this.id].onUnload();
  },
  onBlockSelect(e) {
    sections[this.id].onBlockSelect(e);
  },
};

register('products-list', [productsListSection, parallaxSection]);
