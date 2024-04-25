import {register} from '../vendor/theme-scripts/theme-sections';
import {videoPlay} from '../features/video-play';
import {zoomAnimation} from '../features/zoom-animation';

const selectors = {
  imageWrapper: '[data-banner-image]',
  lazyImage: '.lazy-image',
};

const classes = {
  bannerNoCachedImages: 'banner--no-cached-images',
  bannerImgLoaded: 'banner--img-loaded',
  imgIn: 'img-in',
};

const sections = {};

class BannerImage {
  constructor(section) {
    this.container = section.container;

    this.init();
  }

  init() {
    this.handleImageAnimation(true);
  }

  /**
   * Handles image animation that would be triggered on page load
   *  - uses a fallback class modifier for Banner image section with no cached hero images
   *  - that class resets the default banner CSS animation so it won't be executed when `.img-in` class is added when `img.complete` is detected
   *  - gets the `.lazy-image` container and listens for `transitionend` event of its `<img>` child element
   *  - adds a class modifier after `<img>` transition has completed, when shimmer effect has been removed, that should trigger the hero image animation
   *  - removes classes on Theme Editor `shopify:section:unload` and `shopify:section:reorder` events
   */
  handleImageAnimation(onLoad = false) {
    if (!onLoad) {
      this.container.classList.remove(classes.bannerNoCachedImages);
      this.container.classList.remove(classes.bannerImgLoaded);
      return;
    }

    const imageWrapper = this.container.querySelector(selectors.imageWrapper);
    const img = imageWrapper.querySelectorAll(selectors.lazyImage);
    const imgComplete = this.container.classList.contains(classes.imgIn);

    if (img.length && !imgComplete) {
      this.container.classList.add(classes.bannerNoCachedImages);

      const onImageTransitionEnd = (event) => {
        requestAnimationFrame(() => this.container.classList.add(classes.bannerImgLoaded));
        img[0].removeEventListener('transitionend', onImageTransitionEnd);
      };

      img[0].addEventListener('transitionend', onImageTransitionEnd);
    }
  }

  onReorder() {
    this.handleImageAnimation(false);
  }

  onUnload() {
    this.handleImageAnimation(false);
  }
}

const bannerImage = {
  onLoad() {
    sections[this.id] = new BannerImage(this);
  },
  onReorder(e) {
    sections[this.id].onReorder(e);
  },
  onUnload(e) {
    sections[this.id].onUnload(e);
  },
};

register('banner-image', [bannerImage, zoomAnimation, videoPlay]);
