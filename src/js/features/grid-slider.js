import Flickity from 'flickity';

const selectors = {
  slider: '[data-slider]',
  sliderItem: '[data-slide]',
  productGridItemImage: '[data-product-media-container]',
  links: 'a, button',
  flickityButton: '.flickity-button',
  promo: '[data-promo]',
  productGridItems: '[data-product-block]',
};

const classes = {
  carousel: 'carousel',
  carouselInactive: 'carousel--inactive',
  isLastSlideVisible: 'is-last-slide-visible',
  featuredCollection: 'featured-collection',
  promoFullWidth: 'collection-promo--full',
  promoTwoItemsWidth: 'collection-promo--two-columns',
};

const attributes = {
  sliderId: 'data-slider-id',
  showImage: 'data-slider-show-image',
  tabIndex: 'tabindex',
};

const sections = {};

class GridSlider {
  constructor(container) {
    this.container = container;
    this.columns = parseInt(this.container.dataset.columns);
    this.sliders = this.container.querySelectorAll(selectors.slider);
    this.checkSlidesSizeOnResize = () => this.checkSlidesSize();
    this.resetSliderEvent = (e) => this.resetSlider(e);
    this.resizeSliderEvent = (event) => this.resizeSlider(event);
    this.flkty = [];
    this.listen();

    this.handleLastSlideOverlayOnMobile();
  }

  initSlider(slider) {
    const sliderId = slider.getAttribute(attributes.sliderId);
    slider.classList.remove(classes.carouselInactive);

    if (this.flkty[sliderId] === undefined || !this.flkty[sliderId].isActive) {
      this.flkty[sliderId] = new Flickity(slider, {
        pageDots: false,
        cellSelector: selectors.sliderItem,
        cellAlign: 'left',
        groupCells: true,
        contain: true,
        wrapAround: false,
        adaptiveHeight: false,
        on: {
          ready: () => {
            this.setSliderArrowsPosition(slider);
            setTimeout(() => {
              this.changeTabIndex(slider);
            }, 0);
          },
          change: () => {
            this.changeTabIndex(slider);
          },
        },
      });

      this.handleLastSlideOverlayOnTablet(slider);
    } else {
      this.setSliderArrowsPosition(slider);
    }
  }

  destroySlider(slider) {
    const sliderId = slider.getAttribute(attributes.sliderId);

    if (slider.classList.contains(classes.carousel)) {
      slider.classList.add(classes.carouselInactive);
    }

    if (typeof this.flkty[sliderId] === 'object') {
      this.flkty[sliderId].destroy();
    }
  }

  // Move slides to their initial position
  resetSlider(e) {
    const slider = e.target;
    const sliderId = slider.getAttribute(attributes.sliderId);

    if (typeof this.flkty[sliderId] === 'object') {
      this.flkty[sliderId].select(0, false, true);
    } else {
      slider.scrollTo({
        left: 0,
        behavior: 'instant',
      });
    }
  }

  resizeSlider(event) {
    const slider = event.target;
    const flkty = Flickity.data(slider) || null;

    if (!flkty) return;
    flkty.resize();
  }

  checkSlidesSize() {
    if (this.sliders.length) {
      this.sliders.forEach((slider) => {
        const columns = this.columns;
        const isDesktop = window.innerWidth >= theme.sizes.large;
        const isTablet = window.innerWidth >= theme.sizes.small && window.innerWidth < theme.sizes.large;
        const slides = slider.querySelectorAll(selectors.sliderItem);
        let itemsCount = slides.length;
        const promos = slider.querySelectorAll(selectors.promo);

        // If there are promos in the grid with different width
        if (promos.length && isDesktop) {
          promos.forEach((promo) => {
            if (promo.classList.contains(classes.promoFullWidth)) {
              itemsCount += columns - 1;
            } else if (promo.classList.contains(classes.promoTwoItemsWidth)) {
              itemsCount += 1;
            }
          });
        }

        // If tab collection has show image enabled
        if (slider.hasAttribute(attributes.showImage)) {
          itemsCount += 1;
        }

        if ((isDesktop && itemsCount > columns) || (isTablet && itemsCount > 2)) {
          this.initSlider(slider);
          this.getTallestProductGridItem(slider);
        } else {
          this.destroySlider(slider);
        }
      });
    }
  }

  changeTabIndex(slider) {
    const sliderId = slider.getAttribute(attributes.sliderId);
    const selectedElementsIndex = this.flkty[sliderId].selectedIndex;

    this.flkty[sliderId].slides.forEach((slide, index) => {
      slide.cells.forEach((cell) => {
        cell.element.querySelectorAll(selectors.links).forEach((link) => {
          link.setAttribute(attributes.tabIndex, selectedElementsIndex === index ? '0' : '-1');
        });
      });
    });
  }

  setSliderArrowsPosition(slider) {
    const arrows = slider.querySelectorAll(selectors.flickityButton);
    const image = slider.querySelector(selectors.productGridItemImage);

    if (arrows.length && image) {
      arrows.forEach((arrow) => {
        arrow.style.top = `${image.offsetHeight / 2}px`;
      });
    }
  }

  handleLastSlideOverlayOnTablet(slider) {
    const sliderId = slider.getAttribute(attributes.sliderId);

    this.flkty[sliderId].on('select', () => {
      const isTablet = window.innerWidth >= theme.sizes.small && window.innerWidth < theme.sizes.large;

      if (!isTablet) return;

      const selectedIndex = this.flkty[sliderId].selectedIndex;
      const sliderGroups = this.flkty[sliderId].slides.length - 1;
      const isLastSliderGroup = sliderGroups === selectedIndex;

      slider.parentNode.classList.toggle(classes.isLastSlideVisible, isLastSliderGroup);
    });
  }

  getTallestProductGridItem(slider) {
    const promos = slider.querySelectorAll(selectors.promo);

    if (promos.length) {
      const productGridItems = slider.querySelectorAll(selectors.productGridItems);
      const tallestGridItemHeight = Math.max(...Array.from(productGridItems).map(productGridItem => productGridItem.offsetHeight));

      slider.style.setProperty('--carousel-promo-height', `${tallestGridItemHeight}px`);
    }
  }

  handleLastSlideOverlayOnMobile() {
    this.sliders.forEach((slider) => {
      slider.addEventListener('scroll', (event) => {
        const isMobile = window.innerWidth < theme.sizes.small;

        if (!isMobile) return;

        const offsetWidth = event.target.offsetWidth;
        const lastSlide = Array.from(slider.children).pop();
        const rect = lastSlide.getBoundingClientRect();
        const isLastSlideVisible = rect.left + 80 < offsetWidth; // 80px is enough to negate the small visible part of the slide on the right

        slider.parentNode.classList.toggle(classes.isLastSlideVisible, isLastSlideVisible);
      });
    });
  }

  listen() {
    if (this.sliders.length) {
      this.checkSlidesSize();
      document.addEventListener('theme:resize:width', this.checkSlidesSizeOnResize);

      this.sliders.forEach((slider) => {
        slider.addEventListener('theme:tab:change', this.resetSliderEvent);
        slider.addEventListener('theme:slider:resize', this.resizeSliderEvent);
      });
    }
  }

  /**
   * Event callback for Theme Editor `section:block:select` event
   */
  onBlockSelect(evt) {
    const slider = evt.target.closest(selectors.slider);
    const flkty = Flickity.data(slider) || null;

    if (!slider) {
      return;
    }

    let parent = evt.target.parentNode;
    let target = evt.target;

    if (this.container.classList.contains(classes.featuredCollection)) {
      // In Featured collection section the shopify block attributes are on inner element
      parent = parent.parentNode;
      target = target.parentNode;
    }

    if (flkty !== null && flkty.isActive) {
      const index = parseInt([...parent.children].indexOf(target));
      const slidesPerPage = parseInt(flkty.slides[0].cells.length);
      const groupIndex = Math.floor(index / slidesPerPage);

      flkty.select(groupIndex);
    } else {
      const sliderStyle = slider.currentStyle || window.getComputedStyle(slider);
      const sliderPadding = parseInt(sliderStyle.paddingLeft);
      const blockPositionLeft = target.offsetLeft - sliderPadding;

      // Native scroll to item
      slider.scrollTo({
        top: 0,
        left: blockPositionLeft,
        behavior: 'smooth',
      });
    }
  }

  /**
   * Event callback for Theme Editor `section:unload` event
   */
  onUnload() {
    if (this.flkty) {
      for (const key in this.flkty) {
        if (this.flkty.hasOwnProperty(key)) {
          this.flkty[key].destroy();
        }
      }
    }

    document.removeEventListener('theme:resize:width', this.checkSlidesSizeOnResize);

    if (this.sliders.length) {
      this.sliders.forEach((slider) => {
        slider.removeEventListener('theme:tab:change', this.resetSliderEvent);
        slider.removeEventListener('theme:slider:resize', this.resizeSliderEvent);
      });
    }
  }
}

const gridSlider = {
  onLoad() {
    sections[this.id] = [];
    const els = this.container.querySelectorAll(selectors.slider);
    els.forEach((el) => {
      sections[this.id].push(new GridSlider(this.container));
    });
  },
  onUnload() {
    sections[this.id].forEach((el) => {
      if (typeof el.onUnload === 'function') {
        el.onUnload();
      }
    });
  },
  onBlockSelect(e) {
    sections[this.id].forEach((el) => {
      if (typeof el.onBlockSelect === 'function') {
        el.onBlockSelect(e);
      }
    });
  },
};

export {GridSlider, gridSlider};
