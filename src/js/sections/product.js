import Flickity from 'flickity';

import flickitySmoothScrolling from '../globals/flickity-smooth-scrolling';
import {productFormSection} from '../features/product-form';
import {popoutSection} from '../features/popout';
import {swatchSection, swatchesContainer} from '../features/swatch';
import {shareButton} from '../features/share-button';
import {collapsible} from '../features/collapsible';
import {productStickySection} from '../features/product-sticky';
import {drawer} from '../globals/drawer';
import {tooltip} from '../features/tooltip';
import ProductVideo from '../media/product-video';
import Zoom from '../features/zoom';
import QuickViewPopup from '../features/quick-view-popup';
import {ComplementaryProducts} from '../features/complementary-products';
import {RecipientForm} from '../features/recipient-form';
import {register} from '../vendor/theme-scripts/theme-sections';

const selectors = {
  option: '[data-option]',
  popout: '[data-popout]',
  productMediaSlider: '[data-product-single-media-slider]',
  productMediaThumb: '[data-thumbnail-id]',
  productMediaThumbs: '[data-product-single-media-thumbs]',
  productMediaWrapper: '[data-product-single-media-wrapper]',
  productModel: '[data-model]',
  productSingleThumbnailLink: '.product-single__thumbnail-link',
  deferredMedia: '[data-deferred-media]',
  deferredMediaButton: '[data-deferred-media-button]',
  modalScrollContainer: '[data-tabs-holder]',
  tooltip: '[data-tooltip]',
  productRating: '[data-product-rating]',
  productReviews: '#shopify-product-reviews',
  links: 'a, button',
  upsellProduct: '[data-upsell-holder]',
  upsellProductSlider: '[data-upsell-slider]',
  featureSlider: '[data-slider]',
  productJson: '[data-product-json]',
};

const classes = {
  featuredProduct: 'featured-product',
  featuredProductOnboarding: 'featured-product--onboarding',
  hasMediaActive: 'has-media-active',
  isSelected: 'is-selected',
  mediaHidden: 'media--hidden',
  noOutline: 'no-outline',
  hasPopup: 'has-popup',
  isMoving: 'is-moving',
};

const attributes = {
  mediaId: 'data-media-id',
  sectionId: 'data-section-id',
  thumbId: 'data-thumbnail-id',
  dataTallLayout: 'data-tall-layout',
  loaded: 'loaded',
  tabindex: 'tabindex',
};

const sections = {};

class Product {
  constructor(section) {
    this.container = section.container;
    this.sectionId = this.container.getAttribute(attributes.sectionId);
    this.tallLayout = this.container.getAttribute(attributes.dataTallLayout) === 'true';
    this.featureSliders = this.container.querySelectorAll(selectors.featureSlider);
    this.flkty = null;
    this.flktyNav = null;
    this.isFlickityDragging = false;
    this.enableHistoryState = !this.container.classList.contains(classes.featuredProduct);
    this.checkSliderOnResize = () => this.checkSlider();
    this.flktyNavOnResize = () => this.resizeFlickityNav();

    this.scrollToReviews();
    this.initUpsellSlider();
    this.initFeatureSlider();

    new QuickViewPopup(this.container);

    // Skip initialization of product form, slider and media functions if section has onboarding content only
    if (this.container.classList.contains(classes.featuredProductOnboarding)) {
      return;
    }

    // Record recently viewed products when the product page is loading
    const productJson = this.container.querySelector(selectors.productJson);
    if (productJson && productJson.innerHTML) {
      const productJsonHandle = JSON.parse(productJson.innerHTML).handle;
      let recentObj = {};
      if (productJsonHandle) {
        recentObj = {
          handle: productJsonHandle,
        };
      }
      Shopify.Products.recordRecentlyViewed(recentObj);
    } else {
      Shopify.Products.recordRecentlyViewed();
    }

    new Zoom(this.container);

    this.productSlider();
    this.initMediaSwitch();
    this.initProductVideo();
    this.initProductModel();
    this.initShopifyXrLaunch();
  }

  productSlider() {
    this.checkSlider();
    document.addEventListener('theme:resize:width', this.checkSliderOnResize);
  }

  checkSlider() {
    if (!this.tallLayout || window.innerWidth < theme.sizes.large) {
      this.initProductSlider();
      return;
    }

    this.destroyProductSlider();
  }

  resizeFlickityNav() {
    if (this.flktyNav !== null) {
      this.flktyNav.resize();
    }
  }

  /* Product Slider */
  initProductSlider() {
    const slider = this.container.querySelector(selectors.productMediaSlider);
    const thumbs = this.container.querySelector(selectors.productMediaThumbs);
    const media = this.container.querySelectorAll(selectors.productMediaWrapper);

    if (media.length > 1) {
      this.flkty = new Flickity(slider, {
        wrapAround: true,
        pageDots: false,
        adaptiveHeight: true,
        on: {
          ready: () => {
            slider.setAttribute(attributes.tabindex, '-1');

            media.forEach((item) => {
              if (!item.classList.contains(classes.isSelected)) {
                const links = item.querySelectorAll(selectors.links);
                if (links.length) {
                  links.forEach((link) => {
                    link.setAttribute(attributes.tabindex, '-1');
                  });
                }
              }
            });
          },
          dragStart: () => {
            slider.classList.add(classes.isMoving);
          },
          dragMove: () => {
            // Prevent lightbox trigger on dragMove
            this.isFlickityDragging = true;
          },
          staticClick: () => {
            this.isFlickityDragging = false;
          },
          settle: (index) => {
            const currentSlide = this.flkty.selectedElement;
            const mediaId = currentSlide.getAttribute(attributes.mediaId);

            this.flkty.cells.forEach((slide, i) => {
              const links = slide.element.querySelectorAll(selectors.links);
              if (links.length) {
                links.forEach((link) => {
                  link.setAttribute(attributes.tabindex, i === index ? '0' : '-1');
                });
              }
            });
            this.switchMedia(mediaId);
            slider.classList.remove(classes.isMoving);
          },
        },
      });

      // Toggle flickity draggable functionality based on media play/pause state
      if (media.length) {
        media.forEach((el) => {
          el.addEventListener('theme:media:play', () => {
            this.flkty.options.draggable = false;
            this.flkty.updateDraggable();
            el.closest(selectors.productMediaSlider).classList.add(classes.hasMediaActive);
          });

          el.addEventListener('theme:media:pause', () => {
            this.flkty.options.draggable = true;
            this.flkty.updateDraggable();
            el.closest(selectors.productMediaSlider).classList.remove(classes.hasMediaActive);
          });
        });
      }

      // iOS smooth scrolling fix
      flickitySmoothScrolling(slider);

      if (thumbs !== null) {
        this.flktyNav = new Flickity(thumbs, {
          asNavFor: slider,
          contain: true,
          pageDots: false,
          prevNextButtons: false,
          resize: true,
          on: {
            ready: () => {
              thumbs.setAttribute(attributes.tabindex, '-1');
            },
          },
        });

        if (this.flktyNav !== null) {
          document.addEventListener('theme:resize:width', this.flktyNavOnResize);
        }

        // iOS smooth scrolling fix
        flickitySmoothScrolling(thumbs);

        // Disable link click
        const thumbLinks = this.container.querySelectorAll(selectors.productSingleThumbnailLink);
        if (thumbLinks.length) {
          thumbLinks.forEach((el) => {
            el.addEventListener('click', (e) => {
              e.preventDefault();
            });
          });
        }
      }
    }
  }

  destroyProductSlider() {
    if (this.flkty !== null) {
      this.flkty.destroy();
      this.flktyNav.destroy();

      this.flkty = null;
      this.flktyNav = null;
    }
  }

  /* Upsell Products Slider */
  initUpsellSlider() {
    const slider = this.container.querySelector(selectors.upsellProductSlider);
    const items = this.container.querySelectorAll(selectors.upsellProduct);

    if (items.length > 1) {
      const flktyUpsell = new Flickity(slider, {
        wrapAround: true,
        pageDots: true,
        adaptiveHeight: true,
        prevNextButtons: false,
      });

      flktyUpsell.on('change', (index) => {
        flktyUpsell.cells.forEach((slide, i) => {
          const links = slide.element.querySelectorAll(selectors.links);
          if (links.length) {
            links.forEach((link) => {
              link.setAttribute(attributes.tabindex, i === index ? '0' : '-1');
            });
          }
        });
      });
    }
  }

  /* Feature Block Slider */
  initFeatureSlider() {
    this.featureSliders.forEach((featureSliders) => {
      const featureSlideIndex = Array.from(featureSliders.children);

      if (featureSlideIndex.length > 1) {
        this.flktyFeature = new Flickity(featureSliders, {
          wrapAround: true,
          pageDots: true,
          adaptiveHeight: true,
          prevNextButtons: false,
        });
      }
    });
  }

  handleMediaFocus(event) {
    // Do nothing unless ENTER or TAB key are pressed
    if (event.code !== theme.keyboardKeys.ENTER && event.code !== theme.keyboardKeys.TAB) {
      return;
    }

    const mediaId = event.currentTarget.getAttribute(attributes.thumbId);
    const activeSlide = this.container.querySelector(`[${attributes.mediaId}="${mediaId}"]`);
    const slideIndex = parseInt([...activeSlide.parentNode.children].indexOf(activeSlide));
    const slider = this.container.querySelector(selectors.productMediaSlider);
    const sliderNav = this.container.querySelector(selectors.productMediaThumbs);
    const flkty = Flickity.data(slider) || null;
    const flktyNav = Flickity.data(sliderNav) || null;

    // Go to the related slide media
    if (flkty && flkty.isActive && slideIndex > -1 && (event.code === theme.keyboardKeys.ENTER || event.code === theme.keyboardKeys.NUMPADENTER)) {
      flkty.select(slideIndex);
    }

    // Move thumbs to the selected one
    if (flktyNav && flktyNav.isActive && slideIndex > -1) {
      flktyNav.select(slideIndex);
    }
  }

  switchMedia(mediaId) {
    const mediaItems = document.querySelectorAll(`${selectors.productMediaWrapper}`);
    const selectedMedia = this.container.querySelector(`${selectors.productMediaWrapper}[${attributes.mediaId}="${mediaId}"]`);
    const isFocusEnabled = !document.body.classList.contains(classes.noOutline);

    // Pause other media
    if (mediaItems.length) {
      mediaItems.forEach((media) => {
        media.dispatchEvent(new CustomEvent('theme:media:hidden'), {bubbles: true});
        media.classList.add(classes.mediaHidden);
      });
    }

    if (isFocusEnabled) {
      selectedMedia.focus();
    }

    selectedMedia.closest(selectors.productMediaSlider).classList.remove(classes.hasMediaActive);
    selectedMedia.classList.remove(classes.mediaHidden);
    selectedMedia.dispatchEvent(new CustomEvent('theme:media:visible'), {bubbles: true});

    // If media is not loaded, trigger poster button click to load it
    const deferredMedia = selectedMedia.querySelector(selectors.deferredMedia);
    if (deferredMedia && deferredMedia.getAttribute(attributes.loaded) !== 'true') {
      selectedMedia.querySelector(selectors.deferredMediaButton).dispatchEvent(new Event('click'));
    }
  }

  initMediaSwitch() {
    const productThumbImages = this.container.querySelectorAll(selectors.productMediaThumb);
    if (productThumbImages.length) {
      productThumbImages.forEach((el) => {
        el.addEventListener('keyup', this.handleMediaFocus.bind(this));
        el.addEventListener('click', (e) => {
          e.preventDefault();
        });
      });
    }
  }

  initProductVideo() {
    this.videos = new ProductVideo(this.container);
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

  onUnload() {
    if (this.flktyNav !== null) {
      document.removeEventListener('theme:resize:width', this.flktyNavOnResize);
    }

    document.removeEventListener('theme:resize:width', this.checkSliderOnResize);
  }

  scrollToReviews() {
    const productRating = this.container.querySelector(selectors.productRating);
    const events = ['click', 'keydown'];

    if (!productRating) {
      return;
    }

    events.forEach((eventName) => {
      productRating.addEventListener(eventName, (event) => {
        if ((event.code !== theme.keyboardKeys.ENTER && event.code !== theme.keyboardKeys.NUMPADENTER) || event.type != 'click') {
          const reviewsContainer = document.querySelector(selectors.productReviews);

          if (!reviewsContainer) {
            return;
          }

          reviewsContainer.scrollIntoView({behavior: 'smooth'});
        }
      });
    });
  }

  onBlockSelect(event) {
    const flkty = Flickity.data(event.target.closest(selectors.featureSlider));
    const index = parseInt([...event.target.parentNode.children].indexOf(event.target));

    if (flkty) {
      flkty.select(index);
    }
  }
}

const productSection = {
  onLoad() {
    sections[this.id] = new Product(this);
  },
  onUnload: function () {
    sections[this.id].onUnload();
  },
  onBlockSelect(event) {
    sections[this.id].onBlockSelect(event);
  },
};

register('product-template', [productFormSection, productSection, swatchSection, swatchesContainer, shareButton, collapsible, tooltip, popoutSection, drawer, productStickySection]);
register('featured-product', [productFormSection, productSection, swatchSection, swatchesContainer, shareButton, collapsible, tooltip, popoutSection, drawer, productStickySection]);

if (!customElements.get('complementary-products')) {
  customElements.define('complementary-products', ComplementaryProducts);
}

if (!customElements.get('recipient-form')) {
  customElements.define('recipient-form', RecipientForm);
}
