const selectors = {
  slideshow: '[data-product-single-media-slider]',
  productInfo: '[data-product-info]',
  headerSticky: '[data-header-sticky]',
  headerHeight: '[data-header-height]',
};

const classes = {
  sticky: 'is-sticky',
};

const attributes = {
  stickyEnabled: 'data-sticky-enabled',
};

window.theme.variables = {
  productPageSticky: false,
};

const sections = {};

class ProductSticky {
  constructor(section) {
    this.container = section.container;
    this.stickyEnabled = this.container.getAttribute(attributes.stickyEnabled) === 'true';
    this.productInfo = this.container.querySelector(selectors.productInfo);
    this.stickyScrollTop = 0;
    this.scrollLastPosition = 0;
    this.stickyDefaultTop = 0;
    this.currentPoint = 0;
    this.defaultTopBottomSpacings = 30;
    this.scrollTop = window.scrollY;
    this.scrollDirectionDown = true;
    this.requestAnimationSticky = null;
    this.stickyFormLoad = true;
    this.stickyFormLastHeight = null;
    this.onChangeCounter = 0;
    this.scrollEvent = (e) => this.scrollEvents(e);
    this.resizeEvent = (e) => this.resizeEvents(e);

    this.init();
  }

  init() {
    if (this.stickyEnabled) {
      this.stickyScrollCheck();

      document.addEventListener('theme:resize', this.resizeEvent);
    }

    this.initSticky();
  }

  initSticky() {
    if (theme.variables.productPageSticky) {
      this.requestAnimationSticky = requestAnimationFrame(() => this.calculateStickyPosition());

      this.productInfo.addEventListener('theme:form:sticky', (e) => {
        this.removeAnimationFrame();

        this.requestAnimationSticky = requestAnimationFrame(() => this.calculateStickyPosition(e));
      });

      document.addEventListener('theme:scroll', this.scrollEvent);
    }
  }

  scrollEvents(e) {
    if (e.detail !== null) {
      this.scrollTop = e.detail.position;
      this.scrollDirectionDown = e.detail.down;
    }

    if (!this.requestAnimationSticky) {
      this.requestAnimationSticky = requestAnimationFrame(() => this.calculateStickyPosition());
    }
  }

  resizeEvents() {
    this.stickyScrollCheck();

    document.removeEventListener('theme:scroll', this.scrollEvent);

    this.initSticky();
  }

  stickyScrollCheck() {
    const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const isDesktop = windowWidth >= window.theme.sizes.large;
    const targetProductInfo = this.container.querySelector(selectors.productInfo);

    if (!targetProductInfo) return;

    if (isDesktop) {
      const productInfo = this.container.querySelector(selectors.productInfo);
      const slideshow = this.container.querySelector(selectors.slideshow);

      if (!productInfo || !slideshow) return;
      const productCopyHeight = productInfo.offsetHeight;
      const productImagesHeight = slideshow.offsetHeight;

      // Is the product form and description taller than window space
      // Is also shorter than the window and images
      if (productCopyHeight < productImagesHeight) {
        theme.variables.productPageSticky = true;
        targetProductInfo.classList.add(classes.sticky);
      } else {
        theme.variables.productPageSticky = false;
        targetProductInfo.classList.remove(classes.sticky);
      }
    } else {
      theme.variables.productPageSticky = false;
      targetProductInfo.classList.remove(classes.sticky);
    }
  }

  calculateStickyPosition(e = null) {
    const eventExist = Boolean(e && e.detail);
    const isAccordion = Boolean(eventExist && e.detail.element && e.detail.element === 'accordion');
    const productInfoHeight = this.productInfo.offsetHeight;
    const heightDifference = window.innerHeight - productInfoHeight - this.defaultTopBottomSpacings;
    const scrollDifference = Math.abs(this.scrollTop - this.scrollLastPosition);

    if (this.scrollDirectionDown) {
      this.stickyScrollTop -= scrollDifference;
    } else {
      this.stickyScrollTop += scrollDifference;
    }

    if (this.stickyFormLoad) {
      if (document.querySelector(selectors.headerSticky) && document.querySelector(selectors.headerHeight)) {
        this.stickyDefaultTop = parseInt(document.querySelector(selectors.headerHeight).getBoundingClientRect().height);
      } else {
        this.stickyDefaultTop = this.defaultTopBottomSpacings;
      }

      this.stickyScrollTop = this.stickyDefaultTop;
    }

    this.stickyScrollTop = Math.min(Math.max(this.stickyScrollTop, heightDifference), this.stickyDefaultTop);

    const differencePoint = this.stickyScrollTop - this.currentPoint;
    this.currentPoint = this.stickyFormLoad ? this.stickyScrollTop : this.currentPoint + differencePoint * 0.5;

    this.productInfo.style.setProperty('--sticky-top', `${this.currentPoint}px`);

    this.scrollLastPosition = this.scrollTop;
    this.stickyFormLoad = false;

    if (
      (isAccordion && this.onChangeCounter <= 10) ||
      (isAccordion && this.stickyFormLastHeight !== productInfoHeight) ||
      (this.stickyScrollTop !== this.currentPoint && this.requestAnimationSticky)
    ) {
      if (isAccordion) {
        this.onChangeCounter += 1;
      }

      if (isAccordion && this.stickyFormLastHeight !== productInfoHeight) {
        this.onChangeCounter = 11;
      }

      this.requestAnimationSticky = requestAnimationFrame(() => this.calculateStickyPosition(e));
    } else if (this.requestAnimationSticky) {
      this.removeAnimationFrame();
    }

    this.stickyFormLastHeight = productInfoHeight;
  }

  removeAnimationFrame() {
    if (this.requestAnimationSticky) {
      cancelAnimationFrame(this.requestAnimationSticky);
      this.requestAnimationSticky = null;
      this.onChangeCounter = 0;
    }
  }

  onUnload() {
    if (this.stickyEnabled) {
      document.removeEventListener('theme:resize', this.resizeEvent);
    }

    if (theme.variables.productPageSticky) {
      document.removeEventListener('theme:scroll', this.scrollEvent);
    }
  }
}

const productStickySection = {
  onLoad() {
    sections[this.id] = new ProductSticky(this);
  },
  onUnload() {
    sections[this.id].onUnload();
  },
};

export {productStickySection};
