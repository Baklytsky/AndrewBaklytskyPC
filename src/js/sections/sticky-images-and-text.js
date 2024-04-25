import {register} from '../vendor/theme-scripts/theme-sections';
import {videoPlay} from '../features/video-play';
import {readHeights} from '../globals/height';
import {isMobile, isDesktop} from '../util/media-query';

const selectors = {
  wrapper: '[data-sticky-wrapper]',
  aside: '[data-sticky-aside]',
  inner: '[data-sticky-inner]',
  content: '[data-sticky-content]',
  text: '[data-sticky-text]',
  textInner: '[data-sticky-text-inner]',
  image: '[data-sticky-image]',
  images: '[data-sticky-images]',
  imageWrapper: '.image-wrapper',
  dot: '[data-sticky-dot]',
};

const attributes = {
  withGaps: 'data-sticky-with-gaps',
  singleText: 'data-sticky-single-text',
  index: 'data-index',
};

const settings = {
  intersectionRatio: 0.5,
  scrollDirection: {
    horizontal: 'horizontal',
    horizontalReversed: 'horizontal-reversed',
    vertical: 'vertical',
    verticalReversed: 'vertical-reversed',
  },
  typeOfIntersecting: {
    maxVisibility: 'maximum-visibility-of-each-image-in-viewport',
    middleOfViewport: 'image-in-the-middle-of-viewport',
  },
};

const classes = {
  isActive: 'is-active',
};

const sections = {};

class StickyImagesAndText {
  constructor(section) {
    this.container = section.container;
    this.scrollDirection = this.container.dataset.scrollDirection;
    this.horizontalScroll = this.scrollDirection === settings.scrollDirection.horizontal || this.scrollDirection === settings.scrollDirection.horizontalReversed;
    this.verticalScroll = this.scrollDirection === settings.scrollDirection.vertical || this.scrollDirection === settings.scrollDirection.verticalReversed;
    this.reverseDirection = this.scrollDirection === settings.scrollDirection.horizontalReversed || this.scrollDirection === settings.scrollDirection.verticalReversed;
    this.direction = this.reverseDirection ? 1 : -1;
    this.withGaps = this.container.hasAttribute(attributes.withGaps);
    this.singleText = this.container.hasAttribute(attributes.singleText);
    this.image = this.container.querySelectorAll(selectors.image);
    this.text = this.container.querySelectorAll(selectors.text);
    this.textInner = this.container.querySelectorAll(selectors.textInner);
    this.images = this.container.querySelector(selectors.images);
    this.dot = this.container.querySelectorAll(selectors.dot);
    this.aside = this.container.querySelector(selectors.aside);
    this.inner = this.container.querySelector(selectors.inner);
    this.content = this.container.querySelector(selectors.content);
    this.wrapper = this.container.querySelector(selectors.wrapper);
    this.performAnimation = null;
    this.lastOffset = 0;
    this.activeIndex = 0;
    this.lastActiveIndex = this.activeIndex;

    if (!this.wrapper) return;

    this.onScrollCallback = () => this.onScroll();
    this.onResizeCallback = () => this.onResize();
    this.calculateImagesOffsetCallback = () => this.calculateImagesOffset();

    this.init();
  }

  init() {
    this.getTypeOfIntersecting();
    this.observeImagesIntersecting();

    this.calculateHeights();
    this.performAnimation = requestAnimationFrame(this.calculateImagesOffsetCallback);
    requestAnimationFrame(() => this.calculateHeights());

    document.addEventListener('theme:scroll', this.onScrollCallback);
    document.addEventListener('theme:resize:width', this.onResizeCallback);

    this.syncDots();
  }

  getTypeOfIntersecting() {
    // Detect the maximum visibility of each image when intersecting with the viewport
    this.typeOfIntersecting = settings.typeOfIntersecting.maxVisibility;
    this.fractionOfViewport = this.image[0].offsetHeight / window.innerHeight;

    if (!this.verticalScroll || isMobile()) return;

    if (this.fractionOfViewport < 0.6) {
      // Detect when each image is in the middle of viewport
      this.typeOfIntersecting = settings.typeOfIntersecting.middleOfViewport;
    }
  }

  observeImagesIntersecting() {
    this.observersCollection = new Set();
    this.compareIntersectionRatio = [];
    this.maxVisibility = 0;

    this.observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          const target = entry.target;
          const targetHeight = target.offsetHeight;
          const intersectionRatio = entry.intersectionRatio;
          const isIntersecting = entry.isIntersecting;
          const currentStats = {
            target: entry.target,
            intersectionRatio: entry.intersectionRatio,
          };
          const checkMaxVisibility = this.typeOfIntersecting === settings.typeOfIntersecting.maxVisibility;

          let intersectAt = settings.intersectionRatio;
          if (this.windowHeight <= targetHeight) {
            intersectAt = 0;
          }

          if (checkMaxVisibility && isIntersecting) {
            this.observersCollection.forEach((item) => {
              if (item.target === entry.target) {
                this.observersCollection.delete(item);
              }
            });
            this.observersCollection.add(currentStats);
            this.compareIntersectionRatio = [...this.observersCollection].map((item) => item.intersectionRatio);
            this.maxVisibility = Math.max(...this.compareIntersectionRatio);
          }

          if (isIntersecting && intersectionRatio > intersectAt) {
            if (checkMaxVisibility && this.maxVisibility === intersectionRatio) {
              this.maxVisibilityItem = [...this.observersCollection].find((item) => item.intersectionRatio === this.maxVisibility);
              this.activeIndex = Number(this.maxVisibilityItem.target.dataset.index);

              if (this.lastActiveIndex !== this.activeIndex) {
                this.sync();
                this.lastActiveIndex = this.activeIndex;
              }
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: [0, 0.15, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.85, 1],
      }
    );

    this.image.forEach((image) => this.observer.observe(image));
  }

  onScroll() {
    if (!this.performAnimation) {
      this.performAnimation = requestAnimationFrame(this.calculateImagesOffsetCallback);
    }

    if (this.typeOfIntersecting === settings.typeOfIntersecting.middleOfViewport) {
      this.image.forEach((image) => this.checkImagePositionInViewport(image));
    }
  }

  removeAnimationFrame() {
    if (this.performAnimation) {
      cancelAnimationFrame(this.performAnimation);
      this.performAnimation = null;
    }
  }

  checkImagePositionInViewport(element) {
    if (!element) return;

    const windowHeight = window.innerHeight;
    const scrollTop = window.scrollY;
    const scrollMiddle = scrollTop + windowHeight / 2;
    const scrollBottom = scrollTop + windowHeight;
    const elementOffsetTopPoint = Math.round(element.getBoundingClientRect().top + scrollTop);
    const elementHeight = element.offsetHeight;
    const elementOffsetBottomPoint = elementOffsetTopPoint + elementHeight;
    const isBottomOfElementPassed = elementOffsetBottomPoint < scrollTop;
    const isTopOfElementReached = elementOffsetTopPoint < scrollBottom;
    const isInView = isTopOfElementReached && !isBottomOfElementPassed;

    if (!isInView) return;

    if (scrollMiddle > elementOffsetTopPoint && elementOffsetBottomPoint > scrollMiddle) {
      this.activeIndex = Number(element.dataset.index);

      if (this.lastActiveIndex !== this.activeIndex) {
        this.sync();
        this.lastActiveIndex = this.activeIndex;
      }
    }
  }

  calculateImagesOffset() {
    const asideTop = this.aside.getBoundingClientRect().top - this.headerHeight;
    const stickyStartingPoint = asideTop - this.innerStickyTop;
    let percent = 0;
    let offset = 0;
    // Either offset images as soon as viewport top reaches the top point of the section,
    // or start the offset at the point where the inner container, that's holding all of the images, gets sticky
    const triggerPoint = !this.hasShortImages ? asideTop : stickyStartingPoint;

    if (triggerPoint < 0) {
      percent = (triggerPoint / this.bottomEndingPoint) * -1 * 100;
    } else if (triggerPoint >= 0) {
      percent = 0;
    } else {
      percent = 100;
    }

    offset = percent > 100 ? 100 : percent;
    offset *= this.image.length - 1;

    if (isMobile() || this.horizontalScroll) {
      this.aside.style.setProperty('--translateX', `${Number(offset * this.direction).toFixed(2)}%`);
    }

    if (this.lastOffset !== offset) {
      this.performAnimation = requestAnimationFrame(this.calculateImagesOffsetCallback);
    } else if (this.performAnimation) {
      this.removeAnimationFrame();
    }

    this.lastOffset = offset;
  }

  calculateHeights() {
    let {stickyHeaderHeight, windowHeight} = readHeights();
    this.headerHeight = stickyHeaderHeight || 0;
    this.windowHeight = windowHeight || window.innerHeight;

    // Content height variables
    if (this.text.length > 0) {
      const contentPaddingTop = this.content ? parseInt(window.getComputedStyle(this.content).getPropertyValue('padding-top')) : 0;
      const contentPaddingBottom = this.content ? parseInt(window.getComputedStyle(this.content).getPropertyValue('padding-bottom')) : 0;
      const textElementsHeights = [...this.text].map((element) => element.offsetHeight + contentPaddingTop + contentPaddingBottom);
      const textInnerElementsHeights = [...this.textInner].map((element) => element.offsetHeight);
      const maxTextHeight = Math.max(...textElementsHeights);
      const maxTextInnerHeight = Math.max(...textInnerElementsHeights);
      const highestText = isMobile() ? maxTextInnerHeight : maxTextHeight;
      const textElementsHeightsSum = textElementsHeights.reduce((a, b) => a + b, 0);
      const averageTextHeight = Math.floor(textElementsHeightsSum / textElementsHeights.length) || this.text[0].offsetHeight;

      this.container.style.removeProperty('--average-text-height');
      this.container.style.setProperty('--average-text-height', `${averageTextHeight}px`);
      this.container.style.removeProperty('--highest-text');
      this.container.style.setProperty('--highest-text', `${highestText}px`);
    }

    // Images height variables
    this.imagesHeight = this.images.offsetHeight;
    this.hasShortImages = false;

    if (this.image.length > 0) {
      this.imgHeight = this.image[0].querySelector(selectors.imageWrapper).offsetHeight;
      this.imgPadding = parseInt(window.getComputedStyle(this.image[0]).getPropertyValue('padding-top'));

      this.container.style.removeProperty('--images-height');
      this.container.style.setProperty('--images-height', `${this.imagesHeight}px`);
      this.container.style.removeProperty('--img-height');
      this.container.style.setProperty('--img-height', `${this.imgHeight + 2 * this.imgPadding}px`);
    }

    // Variables used in `calculateImagesOffset()` method
    this.asideHeight = this.aside.offsetHeight;
    this.asidePadding = parseInt(window.getComputedStyle(this.aside).getPropertyValue('padding-top'));
    this.breathingSpace = (this.windowHeight - this.imagesHeight) / 2 / 2;
    this.innerStickyTop = parseInt(window.getComputedStyle(this.inner).getPropertyValue('top')) - this.headerHeight - this.breathingSpace;
    this.gutters = this.withGaps || isMobile() ? 2 * this.asidePadding : 0;
    this.minHeightForEndingPoing = this.imagesHeight + this.gutters;
    if (!isMobile() && this.horizontalScroll) {
      this.minHeightForEndingPoing = this.windowHeight - this.headerHeight;

      // Update trigger point for images offset whenever each image height takes up less than 60% of the screen height
      this.hasShortImages = this.fractionOfViewport <= 0.6;
      if (this.hasShortImages) {
        this.minHeightForEndingPoing = this.imagesHeight - this.innerStickyTop + this.breathingSpace * 3;
      }
    }
    this.bottomEndingPoint = this.asideHeight - this.minHeightForEndingPoing;
  }

  refreshImagesOffsetValues() {
    // Double `requestAnimationFrame()` methods are used to make sure `calculateHeights()` gets executed first
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.dispatchEvent(new CustomEvent('theme:scroll'));
      });
    });
  }

  onResize() {
    this.calculateHeights();
    // Envoke `calculateHeights()` twice due to Theme editor issues
    requestAnimationFrame(() => this.calculateHeights());
    this.getTypeOfIntersecting();
    this.refreshImagesOffsetValues();
  }

  sync() {
    const textsToSync = !this.singleText ? this.text : [];

    [...this.image, ...textsToSync, ...this.dot].forEach((element) => {
      const elementIndex = Number(element.getAttribute(attributes.index));
      element.classList.toggle(classes.isActive, elementIndex === Number(this.activeIndex));
    });
  }

  syncDots() {
    this.dot.forEach((element) => {
      element.addEventListener('click', (event) => {
        event.preventDefault();
        const activeIndex = Number(event.target.dataset.index);
        const imageToScrollTo = this.image[activeIndex];
        const targetOffsetTop = Math.round(imageToScrollTo.getBoundingClientRect().top + window.scrollY);
        const targetHeight = imageToScrollTo.offsetHeight;
        const containerTop = this.wrapper.offsetTop;
        const imagesHeight = this.images.offsetHeight;
        const scrollOffset = containerTop + imagesHeight * activeIndex;

        let distance = scrollOffset - this.headerHeight;
        if (this.verticalScroll && isDesktop()) {
          distance = targetOffsetTop - this.headerHeight;

          if (this.typeOfIntersecting === settings.typeOfIntersecting.middleOfViewport) {
            distance = targetOffsetTop - window.innerHeight / 2 + targetHeight / 2 - this.headerHeight;
          }
        }

        window.scrollTo({
          top: distance,
          left: 0,
          behavior: 'smooth',
        });
      });
    });
  }

  /**
   * Event callback for Theme Editor `shopify:section:unload` event
   */
  onUnload() {
    this.image.forEach((image) => this.observer.unobserve(image));

    document.removeEventListener('theme:scroll', this.onScrollCallback);
    document.removeEventListener('theme:resize:width', this.onResizeCallback);
  }

  /**
   * Event callback for Theme Editor `shopify:block:select` event
   */
  onBlockSelect(event) {
    const activeIndex = Number(event.target.dataset.index);
    const targetOffsetTop = Math.round(event.target.getBoundingClientRect().top + window.scrollY);
    const targetHeight = event.target.offsetHeight;
    const containerTop = this.wrapper.offsetTop;
    const imagesHeight = this.images.offsetHeight;
    const scrollOffset = containerTop + imagesHeight * activeIndex;

    let distance = scrollOffset - this.headerHeight;
    if (this.verticalScroll && isDesktop()) {
      distance = targetOffsetTop - this.headerHeight;

      if (this.typeOfIntersecting === settings.typeOfIntersecting.middleOfViewport) {
        distance = targetOffsetTop - window.innerHeight / 2 + targetHeight / 2 - this.headerHeight;
      }
    }

    setTimeout(() => {
      window.scrollTo({
        top: distance,
        left: 0,
        behavior: 'smooth',
      });
    }, 500);
  }
}

const stickyImagesAndText = {
  onLoad() {
    sections[this.id] = new StickyImagesAndText(this);
  },
  onUnload() {
    sections[this.id].onUnload();
  },
  onBlockSelect(event) {
    sections[this.id].onBlockSelect(event);
  },
};

register('sticky-images-and-text', [stickyImagesAndText, videoPlay]);
