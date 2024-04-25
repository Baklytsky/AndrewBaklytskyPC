import {isMobile, isDesktop} from '../util/media-query';

const selectors = {
  scrollSpy: '[data-scroll-spy]',
};

const classes = {
  selected: 'is-selected',
  isFullHeight: 'is-full-height',
};

const attributes = {
  scrollSpy: 'data-scroll-spy',
  scrollSpyPrevent: 'data-scroll-spy-prevent',
  mobile: 'data-scroll-spy-mobile',
  desktop: 'data-scroll-spy-desktop',
};

const sections = {};

class ScrollSpy {
  constructor(section, element) {
    this.container = section;
    this.element = element;

    if (!this.element) return;

    this.anchorSelector = `[${attributes.scrollSpy}="#${this.element.id}"]`;
    this.anchor = this.container.querySelector(this.anchorSelector);
    this.anchors = this.container.querySelectorAll(`[${attributes.scrollSpy}]`);

    if (!this.anchor) return;

    this.scrollCallback = () => this.onScroll();
    this.init();
  }

  init() {
    this.onScroll();
    document.addEventListener('theme:scroll', this.scrollCallback);
    document.addEventListener('theme:resize:width', this.scrollCallback);
  }

  isEligible() {
    if (this.container.hasAttribute(attributes.scrollSpyPrevent)) return false;

    return (
      (isMobile() && this.anchor.hasAttribute(attributes.mobile)) ||
      (isDesktop() && this.anchor.hasAttribute(attributes.desktop)) ||
      (!this.anchor.hasAttribute(attributes.desktop) && !this.anchor.hasAttribute(attributes.mobile))
    );
  }

  onScroll() {
    // Check eligibility of whether to run `onScroll()` handler
    if (!this.isEligible()) return;

    // Check element's visibility in the viewport
    this.top = this.element.getBoundingClientRect().top;
    this.bottom = this.element.getBoundingClientRect().bottom;
    const windowHeight = Math.round(window.innerHeight);
    const scrollTop = Math.round(window.scrollY);
    const scrollBottom = scrollTop + windowHeight;
    const elementOffsetTopPoint = Math.round(this.top + scrollTop);
    const elementHeight = this.element.offsetHeight;
    const elementOffsetBottomPoint = elementOffsetTopPoint + elementHeight;
    const isBottomOfElementPassed = elementOffsetBottomPoint < scrollTop;
    const isTopOfElementReached = elementOffsetTopPoint < scrollBottom;
    const isInView = isTopOfElementReached && !isBottomOfElementPassed;

    if (!isInView) return;

    // Set container classes or inline styles to help with proper sticky positon of the anchor elements parent container
    if (this.anchor.parentNode.offsetHeight <= elementHeight) {
      this.container.style.setProperty('--sticky-position', `${window.innerHeight / 2 - elementHeight / 2}px`);
    } else {
      this.container.classList.add(classes.isFullHeight);
    }

    // Check anchor's intersection within the element
    this.anchorTop = this.anchor.getBoundingClientRect().top;
    this.anchorBottom = this.anchor.getBoundingClientRect().bottom;
    const anchorTopPassedElementTop = this.top < this.anchorTop;
    const anchorBottomPassedElementBottom = this.bottom < this.anchorBottom;
    const shouldBeActive = anchorTopPassedElementTop && !anchorBottomPassedElementBottom;

    if (!shouldBeActive) return;

    // Update active classes
    this.anchors.forEach((anchor) => {
      if (!anchor.matches(this.anchorSelector)) {
        anchor.classList.remove(classes.selected);
      }
    });

    this.anchor.classList.add(classes.selected);
  }

  onUnload() {
    document.removeEventListener('theme:scroll', this.scrollCallback);
    document.removeEventListener('theme:resize:width', this.scrollCallback);
  }
}

const scrollSpy = {
  onLoad() {
    sections[this.id] = [];
    const elements = this.container.querySelectorAll(selectors.scrollSpy);

    elements.forEach((element) => {
      const scrollSpy = this.container.querySelector(element.getAttribute(attributes.scrollSpy));
      sections[this.id].push(new ScrollSpy(this.container, scrollSpy));
    });
  },
  onUnload() {
    sections[this.id].forEach((element) => {
      if (typeof element.onUnload === 'function') {
        element.onUnload();
      }
    });
  },
};

export default scrollSpy;
