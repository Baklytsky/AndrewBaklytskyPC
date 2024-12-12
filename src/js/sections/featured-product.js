import {register} from '../vendor/theme-scripts/theme-sections';

const selectors = {
  image: '[data-featured-image]',
  imagesHolder: '[data-featured-aside]',
  contentHolder: '[data-featured-content]',
  wrapper: '[data-featured-wrapper]',
};

const attributes = {
  horizontalScroll: 'data-horizontal-scroll',
  horizontalScrollReversed: 'data-horizontal-scroll-reversed',
};

const sections = {};

class FeaturedProduct {
  constructor(section) {
    this.container = section.container;
    this.horizontalScroll = this.container.hasAttribute(attributes.horizontalScroll);
    this.horizontalScrollReversed = this.container.hasAttribute(attributes.horizontalScrollReversed);
    this.images = this.container.querySelectorAll(selectors.image);
    this.imagesHolder = this.container.querySelector(selectors.imagesHolder);
    this.contentHolder = this.container.querySelector(selectors.contentHolder);
    this.wrapper = this.container.querySelector(selectors.wrapper);
    this.requestAnimationSticky = null;
    this.lastPercent = 0;

    this.scrollEvent = () => this.scrollEvents();
    this.calculateHorizontalPositionEvent = () => this.calculateHorizontalPosition();
    this.calculateHeightEvent = () => this.calculateHeight();

    this.init();
  }

  init() {
    if (this.horizontalScroll && this.imagesHolder) {
      this.requestAnimationSticky = requestAnimationFrame(this.calculateHorizontalPositionEvent);
      document.addEventListener('theme:scroll', this.scrollEvent);
    }

    if (this.wrapper && this.contentHolder && this.images.length) {
      this.calculateHeight();

      document.addEventListener('theme:resize:width', this.calculateHeightEvent);
    }
  }

  scrollEvents() {
    if (!this.requestAnimationSticky) {
      this.requestAnimationSticky = requestAnimationFrame(this.calculateHorizontalPositionEvent);
    }
  }

  removeAnimationFrame() {
    if (this.requestAnimationSticky) {
      cancelAnimationFrame(this.requestAnimationSticky);
      this.requestAnimationSticky = null;
    }
  }

  calculateHorizontalPosition() {
    let scrollTop = window.scrollY + this.headerHeight;

    const windowBottom = scrollTop + window.innerHeight;
    const elemTop = this.imagesHolder.offsetTop;
    const elemHeight = this.imagesHolder.offsetHeight;
    const elemBottom = elemTop + elemHeight + this.headerHeight;
    const elemBottomTop = elemHeight - (window.innerHeight - this.headerHeight);
    const direction = this.horizontalScrollReversed ? 1 : -1;
    let percent = 0;

    if (scrollTop >= elemTop && windowBottom <= elemBottom) {
      percent = ((scrollTop - elemTop) / elemBottomTop) * 100;
    } else if (scrollTop < elemTop) {
      percent = 0;
    } else {
      percent = 100;
    }

    percent *= this.images.length - 1;

    this.container.style.setProperty('--translateX', `${percent * direction}%`);

    if (this.lastPercent !== percent) {
      this.requestAnimationSticky = requestAnimationFrame(this.calculateHorizontalPositionEvent);
    } else if (this.requestAnimationSticky) {
      this.removeAnimationFrame();
    }

    this.lastPercent = percent;
  }

  calculateHeight() {
    const {stickyHeaderHeight} = window.theme.readHeights();
    this.container.style.removeProperty('--min-height');
    this.container.style.setProperty('--min-height', `${this.wrapper.offsetHeight + this.contentHolder.offsetHeight}px`);
    this.headerHeight = stickyHeaderHeight;
  }

  onUnload() {
    if (this.horizontalScroll && this.imagesHolder) {
      document.removeEventListener('theme:scroll', this.calculateHorizontalPositionEvent);
    }

    if (this.wrapper && this.contentHolder && this.images.length) {
      document.removeEventListener('theme:resize:width', this.calculateHeightEvent);
    }
  }
}

const featuredProduct = {
  onLoad() {
    sections[this.id] = new FeaturedProduct(this);
  },
  onUnload(e) {
    sections[this.id].onUnload(e);
  },
};

register('featured-product', [featuredProduct]);
