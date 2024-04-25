import Flickity from 'flickity';

import {register} from '../vendor/theme-scripts/theme-sections';
import {videoPlay} from '../features/video-play';
import {zoomAnimation} from '../features/zoom-animation';
import flickitySmoothScrolling from '../globals/flickity-smooth-scrolling';

const selectors = {
  arrowScrollDown: '[data-scroll-down]',
  header: '[data-site-header]',
  item: '[data-slide]',
  links: 'a, button',
  slider: '[data-slider]',
  lazyImage: '.lazy-image',
};

const attributes = {
  style: 'data-style',
  currentStyle: 'data-current-style',
  tabIndex: 'tabindex',
  slidePosition: 'data-slide-position',
};

const classes = {
  headerFixed: 'site-header--fixed',
  sliderNoCachedImages: 'slider--no-cached-images',
  sliderImgLoaded: 'slider--img-loaded',
  imgIn: 'img-in',
};

const sections = {};

class Slider {
  constructor(section) {
    this.container = section.container;
    this.header = document.querySelector(selectors.header);
    this.flkty = null;
    this.resizeEvent = () => {
      this.flkty.resize();
    };

    this.initSlider();
    this.bindScrollButton();
  }

  initSlider() {
    const slidesCount = this.container.querySelectorAll(selectors.item).length;
    const duration = parseInt(this.container.dataset.duration);
    const pageDots = this.container.dataset.pageDots === 'true' && slidesCount > 1;
    const prevNextButtons = this.container.dataset.navArrows === 'true' && slidesCount > 1;
    let autoplay = this.container.dataset.autoplay === 'true';

    if (autoplay) {
      autoplay = duration;
    }

    if (slidesCount > 1) {
      this.flkty = new Flickity(this.container, {
        fade: true,
        cellSelector: selectors.item,
        autoPlay: autoplay,
        wrapAround: true,
        adaptiveHeight: true,
        setGallerySize: true,
        imagesLoaded: true,
        pageDots: pageDots,
        prevNextButtons: prevNextButtons,
        on: {
          ready: () => {
            const currentStyle = this.container.querySelector(`${selectors.item}[${attributes.slidePosition}="1"]`).getAttribute(attributes.style);
            this.container.setAttribute(attributes.currentStyle, currentStyle);
            requestAnimationFrame(this.resizeEvent);
            document.addEventListener('theme:vars', this.resizeEvent); // Update slideshow height after height vars init

            this.handleFirstSlideAnimation(true);
          },
          change: (index) => {
            const currentSlide = this.flkty.selectedElement;
            const currentStyle = currentSlide.getAttribute(attributes.style);

            this.container.setAttribute(attributes.currentStyle, currentStyle);
            this.handleFirstSlideAnimation(false);

            this.flkty.cells.forEach((slide, i) => {
              slide.element.querySelectorAll(selectors.links).forEach((link) => {
                link.setAttribute(attributes.tabIndex, i === index ? '0' : '-1');
              });
            });
          },
        },
      });

      // iOS smooth scrolling fix
      flickitySmoothScrolling(this.container);
    } else if (slidesCount === 1) {
      const currentStyle = this.container.querySelector(selectors.item).getAttribute(attributes.style);
      this.container.setAttribute(attributes.currentStyle, currentStyle);
    }
  }

  /**
   * Handles image animation in first slide that would be triggered on page load
   *  - uses a fallback class modifier for sliders that contain a first slide with no cached hero images
   *  - that class resets the default slider CSS animation so it won't be executed when `.img-in` class is added when `img.complete` is detected
   *  - gets the first slide's `.lazy-image` container and listens for `transitionend` event of its `<img>` child element
   *  - adds a class modifier after `<img>` transition has completed, when shimmer effect has been removed, that should trigger the hero image animation
   *  - removes classes on Theme Editor `shopify:section:unload` and `shopify:section:reorder` events
   */
  handleFirstSlideAnimation(onLoad = false) {
    if (!onLoad) {
      this.container.classList.remove(classes.sliderNoCachedImages);
      this.container.classList.remove(classes.sliderImgLoaded);
      return;
    }

    const firstSlide = this.container.querySelectorAll(selectors.item)[0];
    const slideImage = firstSlide.querySelectorAll(selectors.lazyImage);
    const slideImgComplete = this.container.classList.contains(classes.imgIn);

    if (slideImage.length && !slideImgComplete) {
      this.container.classList.add(classes.sliderNoCachedImages);

      const onImageTransitionEnd = (event) => {
        requestAnimationFrame(() => this.container.classList.add(classes.sliderImgLoaded));
        slideImage[0].removeEventListener('transitionend', onImageTransitionEnd);
      };

      slideImage[0].addEventListener('transitionend', onImageTransitionEnd);
    }
  }

  // Scroll down function
  bindScrollButton() {
    const arrowDown = this.container.querySelector(selectors.arrowScrollDown);

    if (arrowDown) {
      arrowDown.addEventListener('click', (e) => {
        e.preventDefault();

        const headerHeight = this.header.classList.contains(classes.headerFixed) ? 60 : 0;
        const scrollToPosition = parseInt(Math.ceil(this.container.offsetTop + this.container.offsetHeight - headerHeight));

        window.scrollTo({
          top: scrollToPosition,
          left: 0,
          behavior: 'smooth',
        });
      });
    }
  }

  onBlockSelect(evt) {
    const index = parseInt([...evt.target.parentNode.children].indexOf(evt.target));

    if (this.flkty !== null) {
      this.flkty.select(index);
      this.flkty.pausePlayer();
    }
  }

  onBlockDeselect(evt) {
    const autoplay = evt.target.closest(selectors.slider).dataset.autoplay === 'true';
    if (autoplay && this.flkty !== null) {
      this.flkty.playPlayer();
    }
  }

  onReorder() {
    this.handleFirstSlideAnimation(false);

    if (this.flkty !== null) {
      this.flkty.resize();
    }
  }

  onUnload() {
    this.handleFirstSlideAnimation(false);

    if (this.flkty !== null) {
      document.removeEventListener('theme:vars', this.resizeEvent);
      this.flkty.destroy();
      this.flkty = null;
    }
  }
}

const slider = {
  onLoad() {
    sections[this.id] = new Slider(this);
  },
  onReorder(e) {
    sections[this.id].onReorder(e);
  },
  onUnload(e) {
    sections[this.id].onUnload(e);
  },
  onBlockSelect(e) {
    sections[this.id].onBlockSelect(e);
  },
  onBlockDeselect(e) {
    sections[this.id].onBlockDeselect(e);
  },
};

register('slider', [slider, videoPlay, zoomAnimation]);
