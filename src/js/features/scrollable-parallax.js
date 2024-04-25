import {getScreenOrientation} from '../globals/height';

const selectors = {
  parallaxElement: '[data-parallax]',
};

const classes = {
  isDisabled: 'is-disabled',
};

const attributes = {
  parallaxAnimation: 'data-parallax',
  parallaxIntensity: 'data-parallax-intensity',
  singleElement: 'data-parallax-single',
};

const sections = {};

class ParallaxElement {
  constructor(el) {
    this.container = el;
    this.percentage = 0;
    this.animation = this.container.getAttribute(attributes.parallaxAnimation);
    this.viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    this.orientation = getScreenOrientation();
    this.scrollEvent = () => this.updateParallax();
    this.resizeEvent = () => this.updateHeight();

    this.init();
  }

  init() {
    this.updateParallax();
    document.addEventListener('theme:scroll', this.scrollEvent);
    document.addEventListener('theme:resize', this.resizeEvent);
  }

  updateParallax() {
    if (this.container.classList.contains(classes.isDisabled)) return;

    const scrollTop = Math.round(window.scrollY);
    const scrollBottom = scrollTop + this.viewportHeight;
    const elementOffsetTopPoint = Math.round(this.container.getBoundingClientRect().top + scrollTop);
    const elementHeight = this.container.offsetHeight;
    const elementOffsetBottomPoint = elementOffsetTopPoint + elementHeight;
    const isBottomOfElementPassed = elementOffsetBottomPoint < scrollTop;
    const isTopOfElementReached = elementOffsetTopPoint < scrollBottom;
    const isInView = isTopOfElementReached && !isBottomOfElementPassed;

    if (isInView) {
      const scrollProgress = scrollBottom - elementOffsetTopPoint - elementHeight / 2;
      this.percentage = Number(((scrollProgress * 100) / this.viewportHeight).toFixed(2));

      if (this.animation === 'circle') {
        this.animateCircleText();
      } else if (this.animation === 'horizontal' || this.animation === 'vertical' || this.animation === 'diagonal') {
        this.animateOverlappingImages();
      }
    }
  }

  updateHeight() {
    const isDesktop = matchMedia('(min-width: 1024px)').matches;

    if (this.orientation !== getScreenOrientation() || isDesktop) {
      this.viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      this.orientation = getScreenOrientation();
    }
  }

  animateCircleText() {
    const rotateDegree = 70;
    const angle = ((rotateDegree * this.percentage) / 100) * -1; // The -1 negates the value to have it rotate counterclockwise
    const adjustRotateDegree = rotateDegree / 2; // We use this to keep the image upright when scrolling and it gets to the middle of the page

    if (this.percentage > 0) {
      this.container.style.setProperty(`--rotate`, `${adjustRotateDegree + angle}deg`);
    }
  }

  animateOverlappingImages() {
    const intensity = this.container.getAttribute(attributes.parallaxIntensity);
    const offsetRange = 0.25 * intensity;
    const offsetRangeHalf = offsetRange / 2;
    const singleElement = this.container.hasAttribute(attributes.singleElement);
    const offset = (offsetRange * this.percentage) / 100;

    let offsetXPrimary = 0;
    let offsetYPrimary = 0;
    let offsetXSecondary = 0;
    let offsetYSecondary = 0;

    if (this.animation === 'horizontal' || this.animation === 'diagonal') {
      offsetXPrimary = -1 * offsetRangeHalf + offset;
      offsetXSecondary = offsetRangeHalf - offset;
    }

    if (this.animation === 'vertical' || this.animation === 'diagonal') {
      offsetYPrimary = offsetRangeHalf - offset;
      offsetYSecondary = -1 * offsetRangeHalf + offset;
    }

    this.container.style.setProperty('--transformX-primary', `${offsetXPrimary}%`);
    this.container.style.setProperty('--transformY-primary', `${offsetYPrimary}%`);

    if (!singleElement) {
      this.container.style.setProperty('--transformX-secondary', `${offsetXSecondary}%`);
      this.container.style.setProperty('--transformY-secondary', `${offsetYSecondary}%`);
    }
  }

  unload() {
    document.removeEventListener('theme:scroll', this.scrollEvent);
    document.removeEventListener('theme:resize', this.resizeEvent);
  }
}

const parallaxSection = {
  onLoad() {
    sections[this.id] = [];
    const elements = this.container.querySelectorAll(selectors.parallaxElement);
    elements.forEach((element) => {
      sections[this.id].push(new ParallaxElement(element));
    });
  },
  onUnload() {
    sections[this.id].forEach((element) => {
      if (typeof element.unload === 'function') {
        element.unload();
      }
    });
  },
};

export default parallaxSection;
