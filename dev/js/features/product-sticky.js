import {isDesktop} from '../util/media-query';
import {readHeights} from '../globals/height';

const selectors = {
  productPage: '.product__page',
  formWrapper: '[data-form-wrapper]',
  headerSticky: '[data-header-sticky]',
  productMediaList: '[data-product-media-list]',
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
    this.section = section;
    this.container = section.container;
    this.stickyEnabled = this.container.getAttribute(attributes.stickyEnabled) === 'true';
    this.formWrapper = this.container.querySelector(selectors.formWrapper);
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
    this.stickyFormEvent = (e) => this.stickyFormEvents(e);

    // The code should execute after truncate text in product.js - 50ms
    setTimeout(() => {
      this.init();
    }, 50);
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

      this.formWrapper.addEventListener('theme:form:sticky', this.stickyFormEvent);

      document.addEventListener('theme:scroll', this.scrollEvent);
    }
  }

  stickyFormEvents(e) {
    this.removeAnimationFrameSticky();

    this.requestAnimationSticky = requestAnimationFrame(() => this.calculateStickyPosition(e));
  }

  scrollEvents(e) {
    this.scrollTop = e.detail.position;
    this.scrollDirectionDown = e.detail.down;

    if (!this.requestAnimationSticky) {
      this.requestAnimationSticky = requestAnimationFrame(() => this.calculateStickyPosition());
    }
  }

  resizeEvents(e) {
    this.stickyScrollCheck();

    document.removeEventListener('theme:scroll', this.scrollEvent);

    this.formWrapper.removeEventListener('theme:form:sticky', this.stickyFormEvent);

    this.initSticky();
  }

  stickyScrollCheck() {
    const targetFormWrapper = this.container.querySelector(`${selectors.productPage} ${selectors.formWrapper}`);

    if (!targetFormWrapper) return;

    if (isDesktop()) {
      const form = this.container.querySelector(selectors.formWrapper);
      const productMediaList = this.container.querySelector(selectors.productMediaList);

      if (!form || !productMediaList) return;

      const productCopyHeight = form.offsetHeight;
      const productImagesHeight = productMediaList.offsetHeight;

      // Is the product description and form taller than window space
      // Is also shorter than the window and images
      if (productCopyHeight < productImagesHeight) {
        theme.variables.productPageSticky = true;
        targetFormWrapper.classList.add(classes.sticky);
      } else {
        theme.variables.productPageSticky = false;
        targetFormWrapper.classList.remove(classes.sticky);
      }
    } else {
      theme.variables.productPageSticky = false;
      targetFormWrapper.classList.remove(classes.sticky);
    }
  }

  calculateStickyPosition(e = null) {
    const isScrollLocked = document.documentElement.hasAttribute('data-scroll-locked');
    if (isScrollLocked) {
      this.removeAnimationFrameSticky();
      return;
    }

    const eventExist = Boolean(e && e.detail);
    const isAccordion = Boolean(eventExist && e.detail.element && e.detail.element === 'accordion');
    const formWrapperHeight = this.formWrapper.offsetHeight;
    const heightDifference = window.innerHeight - formWrapperHeight - this.defaultTopBottomSpacings;
    const scrollDifference = Math.abs(this.scrollTop - this.scrollLastPosition);

    if (this.scrollDirectionDown) {
      this.stickyScrollTop -= scrollDifference;
    } else {
      this.stickyScrollTop += scrollDifference;
    }

    if (this.stickyFormLoad) {
      if (document.querySelector(selectors.headerSticky)) {
        let {headerHeight} = readHeights();
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

    this.scrollLastPosition = this.scrollTop;
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
