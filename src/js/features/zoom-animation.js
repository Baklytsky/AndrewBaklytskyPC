import throttle from '../util/throttle';

const selectors = {
  header: '[data-site-header]',
  main: '[data-main]',
};

let sections = {};

class ZoomAnimation {
  constructor(container) {
    this.container = container;
    this.header = document.querySelector(selectors.header);

    this.init();
  }

  init() {
    if (this.container.dataset.zoomAnimation !== 'true') {
      return;
    }

    // Target element to be observed.
    const observedElement = this.container;
    const firstSection = document.body.querySelector(selectors.main).children[0];
    const isFirstSection = this.container.parentNode === firstSection;
    const hasTransparentHeader = this.header?.dataset.transparent == 'true';

    const renderZoomEffect = () => {
      const headerHeight = isFirstSection & hasTransparentHeader ? 0 : parseInt(this.header?.dataset.height || this.header?.offsetHeight);
      const rect = observedElement.getBoundingClientRect();
      const sectionHeight = observedElement.offsetHeight;
      const scrolled = isFirstSection ? headerHeight - rect.top : headerHeight - rect.top + window.innerHeight;
      const scrolledPercentage = scrolled / sectionHeight;
      let transitionSpeed = 0.1; // Set value between 0 and 1. Bigger value will make the zoom more aggressive
      if (isFirstSection) {
        transitionSpeed *= 1.5;
      }

      let scale = 1 + scrolledPercentage * transitionSpeed;

      // Prevent image scale down under 100%
      scale = scale > 1 ? scale : 1;
      observedElement.style.setProperty('--scale', scale);
    };

    renderZoomEffect();

    this.zoomOnScrollEvent = throttle(renderZoomEffect, 5);

    // Intersection Observer Configuration
    const observerOptions = {
      root: null,
      rootMargin: '0px', // important: needs units on all values
      threshold: 0,
    };

    // Intersection Observer Callback Function
    const intersectionCallback = (entry) => {
      if (entry[0].isIntersecting) {
        window.addEventListener('scroll', this.zoomOnScrollEvent);
      } else {
        window.removeEventListener('scroll', this.zoomOnScrollEvent);
      }
    };

    // Intersection Observer Constructor.
    const observer = new IntersectionObserver(intersectionCallback, observerOptions);

    observer.observe(observedElement);
  }

  onUnload() {
    if (this.zoomOnScrollEvent !== null) {
      window.removeEventListener('scroll', this.zoomOnScrollEvent);
    }
  }
}

const zoomAnimation = {
  onLoad() {
    sections[this.id] = new ZoomAnimation(this.container);
  },
  onUnload() {
    sections[this.id].onUnload();
  },
};

export {zoomAnimation, ZoomAnimation};
