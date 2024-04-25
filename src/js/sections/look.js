import Flickity from 'flickity';

import debounce from '../util/debounce';
import QuickViewPopup from '../features/quick-view-popup';
import {register} from '../vendor/theme-scripts/theme-sections';
import {Tooltip} from '../features/tooltip';

const sections = {};

const selectors = {
  slider: '[data-slider]',
  sliderItem: '[data-slide-item]',
  pointer: '[data-pointer]',
  productGridItemImage: '[data-product-media-container]',
  quickViewItemHolder: '[data-quick-view-item-holder]',
  flickityButton: '.flickity-button',
  links: 'a, button',
  tooltip: '[data-tooltip]',
};

const attributes = {
  pointer: 'data-pointer',
  hotspot: 'data-hotspot',
  tabIndex: 'tabindex',
};

const classes = {
  productGridItemImageHover: 'product-grid-item__image--hovered',
  pointerSelected: 'pointer--selected',
  isSelected: 'is-selected',
  isActive: 'is-active',
  popupOpen: 'pswp--open',
};

class Look {
  constructor(container) {
    this.container = container;
    this.slider = this.container.querySelector(selectors.slider);
    this.slides = this.container.querySelectorAll(selectors.sliderItem);
    this.pointers = this.container.querySelectorAll(selectors.pointer);
    this.flkty = null;
    this.observer = null;

    this.checkSlidesSizeOnResize = () => this.checkSlidesSize();
    this.resizeSliderEvent = (event) => this.resizeSlider(event);
    this.pointersInit = (event) => this.dotPointers(event);
    this.pointersOver = (event) => this.dotPointerIn(event);
    this.pointersOut = (event) => this.dotPointerOut(event);

    this.debouncedBlockSelectCallback = debounce((event) => this.debouncedBlockSelect(event), 500);

    this.quickViewPopup = new QuickViewPopup(this.container);
    this.listen();
  }

  listen() {
    if (this.slider) {
      this.checkSlidesSize();
      document.addEventListener('theme:resize:width', this.checkSlidesSizeOnResize);
      this.slider.addEventListener('theme:slider:resize', this.resizeSliderEvent);
    }

    if (this.pointers.length > 0) {
      this.pointers.forEach((pointer) => {
        pointer.addEventListener('click', this.pointersInit);
        pointer.addEventListener('mouseover', this.pointersOver);
        pointer.addEventListener('mouseleave', this.pointersOut);
      });
    }
  }

  checkSlidesSize() {
    const isDesktop = window.innerWidth >= theme.sizes.small;

    this.initTooltips();

    if (isDesktop) {
      if (this.slides.length > 2) {
        this.initSlider();
      } else {
        this.destroySlider();
        this.slidesTabIndex();
      }

      return;
    }

    if (!isDesktop && this.slides.length > 1) {
      this.initSlider();

      return;
    }

    this.destroySlider();
  }

  initTooltips() {
    this.tooltips = this.container.querySelectorAll(selectors.tooltip);
    this.tooltips.forEach((tooltip) => {
      new Tooltip(tooltip);
    });
  }

  initSlider() {
    if (this.flkty === null) {
      this.flkty = new Flickity(this.slider, {
        prevNextButtons: true,
        wrapAround: true,
        adaptiveHeight: false,
        cellAlign: 'left',
        groupCells: false,
        contain: true,
        on: {
          ready: () => {
            this.slidesTabIndex();
            this.setSliderArrowsPosition();
            this.dotPointers();
          },
          change: () => {
            this.slidesTabIndex();
            this.dotPointers();
          },
        },
      });

      return;
    }

    this.setSliderArrowsPosition();
  }

  setSliderArrowsPosition() {
    const isDesktop = window.innerWidth >= theme.sizes.small;

    if (!isDesktop) return;

    const arrows = this.slider.querySelectorAll(selectors.flickityButton);
    const image = this.slider.querySelector(selectors.productGridItemImage);

    if (arrows.length && image) {
      arrows.forEach((arrow) => {
        arrow.style.top = `${image.offsetHeight / 2}px`;
      });
    }
  }

  slidesTabIndex() {
    if (this.slides.length < 3) {
      this.slider.querySelectorAll(selectors.links).forEach((link) => {
        link.setAttribute(attributes.tabIndex, '0');
      });

      return;
    }

    const slider = Flickity.data(this.slider);

    slider.cells.forEach((slide) => {
      let tabIndex = '-1';
      if (slide.element.classList.contains(classes.isSelected)) {
        tabIndex = '0';
      }

      slide.element.querySelectorAll(selectors.links).forEach((link) => {
        link.setAttribute(attributes.tabIndex, tabIndex);
      });
    });
  }

  destroySlider() {
    if (typeof this.flkty === 'object' && this.flkty !== null) {
      this.flkty.destroy();
      this.flkty = null;
    }
  }

  resizeSlider(event) {
    const slider = event.target;
    const flkty = Flickity.data(slider) || null;

    if (!flkty) return;
    flkty.resize();
  }

  dotPointers(event) {
    if (this.pointers.length === 0) return;

    this.pointers.forEach((button) => {
      button.classList.remove(classes.pointerSelected);
    });

    if (event) {
      const dotIndex = event.target.getAttribute(attributes.pointer);

      this.flkty?.select(dotIndex);

      return;
    }

    const slideIndex = this.flkty == null ? 0 : this.flkty.selectedIndex;

    if (slideIndex >= 0) {
      this.pointers[slideIndex].classList.add(classes.pointerSelected);
    }
  }

  dotPointerIn(event) {
    const dotIndex = event.target.getAttribute(attributes.pointer);
    const image = this.slides[dotIndex].querySelector(selectors.productGridItemImage);
    const isTouch = matchMedia('(pointer:coarse)').matches;
    const isMobile = window.innerWidth < theme.sizes.small;
    if (!isMobile && !isTouch) {
      this.observeImage(image);
    }

    this.pointers.forEach((pointer) => {
      pointer.style.setProperty('--look-animation', 'none');
    });
  }

  dotPointerOut(event) {
    const dotIndex = event.target.getAttribute(attributes.pointer);
    const image = this.slides[dotIndex].querySelector(selectors.productGridItemImage);
    image.classList.remove(classes.productGridItemImageHover);
    image.dispatchEvent(new Event('mouseleave'));
    if (this.observer) {
      this.observer.disconnect();
    }

    this.pointers.forEach((pointer) => {
      pointer.style.removeProperty('--look-animation');
    });
  }

  observeImage(image) {
    this.observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          const target = entry.target;
          const outsideWrapper = entry.intersectionRatio == 0;

          if (!outsideWrapper) {
            target.dispatchEvent(new Event('mouseenter'));
            target.classList.add(classes.productGridItemImageHover);
          }
        });
      },
      {
        root: this.slider,
        threshold: [0.95, 1],
      }
    );
    this.observer.observe(image);
  }

  triggerClick(target) {
    requestAnimationFrame(() => target.dispatchEvent(new Event('click')));
  }

  destroyQuickViewPopup() {
    const pswpElement = this.quickViewPopup?.loadPhotoswipe?.pswpElement;
    if (!pswpElement) return;
    if (pswpElement.classList.contains(classes.popupOpen)) {
      this.quickViewPopup.loadPhotoswipe.popup.close();
    }
  }

  /**
   * Event callback for Theme Editor `shopify:block:select` event
   * The timeouts here are necessary for issues with selecting blocks from one `Shop the look` section to another
   */
  onBlockSelect(event) {
    this.debouncedBlockSelectCallback(event);
  }

  debouncedBlockSelect(event) {
    const pswpElement = this.quickViewPopup?.loadPhotoswipe?.pswpElement;

    // No popup element
    if (!pswpElement) {
      setTimeout(() => this.triggerClick(event.target), 400);
      return;
    }

    setTimeout(() => {
      // Popup initialized
      if (pswpElement.classList.contains(classes.popupOpen)) {
        // Popup opened
        const holder = this.quickViewPopup.loadPhotoswipe.pswpElement.querySelector(`[${attributes.hotspot}="${event.target.getAttribute(attributes.hotspot)}"]`);
        const quickViewItemHolders = this.quickViewPopup.loadPhotoswipe.pswpElement.querySelectorAll(selectors.quickViewItemHolder);

        holder.classList.add(classes.isActive);

        quickViewItemHolders.forEach((element) => {
          if (element !== holder) {
            element.classList.remove(classes.isActive);
          }
        });
      } else {
        // Popup closed
        this.triggerClick(event.target);
      }
    });
  }

  /**
   * Event callback for Theme Editor `shopify:section:unload` event
   */
  onUnload() {
    this.destroyQuickViewPopup();
    document.removeEventListener('theme:resize:width', this.checkSlidesSizeOnResize);

    if (this.slider) {
      this.slider.removeEventListener('theme:slider:resize', this.resizeSliderEvent);
    }
  }

  /**
   * Event callback for Theme Editor `shopify:section:deselect` event
   */
  onDeselect() {
    this.destroyQuickViewPopup();
  }
}

const lookSection = {
  onLoad() {
    sections[this.id] = new Look(this.container);
  },
  onUnload() {
    sections[this.id].onUnload();
  },
  onBlockSelect(event) {
    sections[this.id].onBlockSelect(event);
  },
  onDeselect() {
    sections[this.id].onDeselect();
  },
};

register('look', [lookSection]);
