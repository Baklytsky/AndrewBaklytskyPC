import Flickity from 'flickity';

import {register} from '../vendor/theme-scripts/theme-sections';
import flickitySmoothScrolling from '../globals/flickity-smooth-scrolling';
import {isMobile, isDesktop} from '../util/media-query';
import scrollSpy from '../features/scroll-spy';
import scrollTo from '../util/scroll-to';

const selectors = {
  banner: '[data-banner]',
  sliderContent: '[data-slider-content]',
  sliderMedia: '[data-slider-media]',
  links: 'a, button',
};

const attributes = {
  index: 'data-index',
  tabIndex: 'tabindex',
  singleImage: 'data-slider-single-image',
  scrollSpyPrevent: 'data-scroll-spy-prevent',
};

const classes = {
  isSelected: 'is-selected',
};

const settings = {
  row: 'row',
  columns: 'columns',
};

let sections = {};

class BannerWithTextColumns {
  constructor(section) {
    this.container = section.container;
    this.sliderContent = this.container.querySelector(selectors.sliderContent);
    this.singleImageEnabled = this.sliderContent?.hasAttribute(attributes.singleImage);
    this.banners = this.container.querySelectorAll(selectors.banner);
    this.links = this.container.querySelectorAll('a');
    this.sliderMedia = this.container.querySelector(selectors.sliderMedia);
    this.flktyContent = null;
    this.flktyMedia = null;
    this.onResizeCallback = () => this.handleSlidersOnResize();

    // Initialise functionality based on the "Appearance > Row/Columns" section settings
    this.appearance = this.container.dataset.appearance;

    if (this.appearance === settings.columns) {
      this.handleColumnsLayout();
    } else {
      this.handleRowLayout();
    }
  }

  /**
   * Event listeners on hover, touch or keyboard tabbing, that sync the Content and Media items states
   */
  listen() {
    document.addEventListener('theme:resize:width', this.onResizeCallback);

    // A11y focusables event listener
    this.links.forEach((link) => {
      link.addEventListener('focus', () => {
        const selectedIndex = Number(link.closest(selectors.banner).getAttribute(attributes.index));

        if (window.innerWidth >= theme.sizes.small) {
          this.sync(selectedIndex);
        }
      });
    });

    this.banners.forEach((slide) => {
      // Listener for screens with mouse cursors
      slide.addEventListener('mouseenter', () => {
        const selectedIndex = Number(slide.getAttribute(attributes.index));

        if (window.innerWidth >= theme.sizes.small && !window.theme.touch) {
          this.sync(selectedIndex);
        }
      });

      // Listener specifically for touch devices
      slide.addEventListener('pointerup', () => {
        const selectedIndex = Number(slide.getAttribute(attributes.index));

        if (window.innerWidth >= theme.sizes.small && window.theme.touch) {
          this.sync(selectedIndex);
        }
      });
    });
  }

  /**
   * Functionality for "Appearance -> Columns"
   *  - grid with columns count based on section blocks count
   *  - init two sliders, one for Content, another for Media items
   *  - have a distinct flickity slider on mobile
   *  - sync sliders with fade-in/scale animations
   */
  handleColumnsLayout() {
    if (this.sliderContent.children.length <= 1) return;

    let isDraggable = window.innerWidth < window.theme.sizes.small;

    if (this.sliderMedia.children.length > 1) {
      this.flktyMedia = new Flickity(this.sliderMedia, {
        draggable: false,
        wrapAround: false,
        fade: true,
        prevNextButtons: false,
        adaptiveHeight: false,
        pageDots: false,
        setGallerySize: false,
        on: {
          change: (index) => {
            this.handleGroupItemsNavigation(index, this.flktyContent);
          },
        },
      });

      flickitySmoothScrolling(this.sliderMedia);
    }

    this.flktyContent = new Flickity(this.sliderContent, {
      draggable: isDraggable,
      prevNextButtons: false,
      pageDots: true,
      cellAlign: 'left',
      adaptiveHeight: false,
      imagesLoaded: true,
      on: {
        ready: () => {
          this.listen();
          this.slidesTabIndex();
        },
        change: (index) => {
          if (window.innerWidth < theme.sizes.small && !this.singleImageEnabled) {
            this.flktyMedia.select(index);
          }

          this.slidesTabIndex();
          this.handleGroupItemsNavigation(index, this.flktyMedia);
        },
      },
    });

    flickitySmoothScrolling(this.sliderContent);
  }

  /**
   * Functionality for "Appearance -> Row"
   *  - a row of items, spaced as much as their content allows
   *  - init a Media slider and sync Content items with it
   *  - listen for mouseover/touch events to update active states when "Show single image" settings are enabled
   *  - use fade-in and scale animations on states change
   *  - Media slider draggable events are used to change the active states on tablet
   *  - Content items active state is automatically updated based on scroll position and visibility in the viewport
   */
  handleRowLayout() {
    const isSingleMedia = this.sliderMedia.children.length <= 1;

    if (isSingleMedia || isMobile()) {
      this.updateState(0);
      this.listen();

      return;
    }

    this.initMediaSlider();
  }

  /**
   * Initialise media slider with Flickity
   */
  initMediaSlider() {
    this.flktyMedia = new Flickity(this.sliderMedia, {
      draggable: true,
      wrapAround: false,
      fade: true,
      prevNextButtons: false,
      adaptiveHeight: false,
      pageDots: false,
      setGallerySize: false,
      on: {
        ready: () => {
          this.updateState(0);
          this.listen();
        },
        change: (index) => {
          this.updateState(index);
        },
      },
    });

    flickitySmoothScrolling(this.sliderMedia);
  }

  /**
   * Handle slider sync on navigating with tabbing or using arrow keys through flickity's items group
   */
  handleGroupItemsNavigation(index, sliderToSync = null) {
    if (sliderToSync === null) return;

    requestAnimationFrame(() => {
      if (index !== sliderToSync.selectedIndex) {
        sliderToSync.select(index);
      }
    });
  }

  /**
   * Update focusables tab index on slide change
   */
  slidesTabIndex() {
    if (!this.sliderContent) return;

    const slider = Flickity.data(this.sliderContent);
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

  /**
   * Synchronise the Content and Media items states
   */
  sync(index = 0) {
    if (this.appearance === settings.columns) {
      this.flktyContent.selectCell(index);
    } else {
      this.updateState(index);
    }

    if (this.flktyMedia) {
      this.flktyMedia.selectCell(index);
    }
  }

  /**
   * Update the active state, based on a selected item's index
   */
  updateState(index = 0) {
    this.banners.forEach((element) => {
      const elementIndex = Number(element.getAttribute(attributes.index));
      element.classList.toggle(classes.isSelected, elementIndex === index);
    });
  }

  /**
   * Resize or destroy sliders
   */
  handleSlidersOnResize() {
    const isLayoutRow = this.appearance === settings.row;

    if (isLayoutRow) {
      if (isMobile() && this.flktyMedia) {
        this.flktyMedia.destroy();
        this.flktyMedia = null;
        return;
      }

      if (isDesktop() && !this.flktyMedia) {
        this.initMediaSlider();
        return;
      }
    }

    if (this.flktyContent) {
      this.flktyContent.resize();
      this.toggleDraggable();
    }

    if (this.flktyMedia) {
      this.flktyMedia.resize();
    }
  }

  /**
   * Enable or disable dragging and flicking on initialised Flickity instances, depending on screen size
   */
  toggleDraggable() {
    this.flktyContent.options.draggable = window.innerWidth < window.theme.sizes.small;
    this.flktyContent.updateDraggable();
  }

  /**
   * Event callback for Theme Editor `shopify:block:select` event
   */
  onBlockSelect(event) {
    const selectedIndex = parseInt([...event.target.parentNode.children].indexOf(event.target));
    this.sync(selectedIndex);

    if (this.appearance === settings.row) {
      const target = this.sliderMedia.children[selectedIndex];
      const targetOffsetTop = Math.round(target.getBoundingClientRect().top);

      this.container.setAttribute(attributes.scrollSpyPrevent, '');

      setTimeout(() => scrollTo(targetOffsetTop), 400);
      setTimeout(() => this.container.removeAttribute(attributes.scrollSpyPrevent), 1000);
    }
  }

  /**
   * Event callback for Theme Editor `shopify:section:unload` event
   */
  onUnload() {
    document.removeEventListener('theme:resize:width', this.onResizeCallback);
  }
}

const BannerWithTextColumnsSection = {
  onLoad() {
    sections[this.id] = new BannerWithTextColumns(this);
  },
  onBlockSelect(event) {
    sections[this.id].onBlockSelect(event);
  },
};

register('banner-with-text-columns', [BannerWithTextColumnsSection, scrollSpy]);
