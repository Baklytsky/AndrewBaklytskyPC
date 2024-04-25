import Flickity from 'flickity';

import {a11y} from '../vendor/theme-scripts/theme-a11y';
import {register} from '../vendor/theme-scripts/theme-sections';

const sections = {};

const selectors = {
  slider: '[data-slider]',
  sliderItem: '[data-item]',
  buttonProductsShow: '[data-button-show]',
  buttonProductsHide: '[data-button-hide]',
  itemProducts: '[data-item-products]',
  itemProductSlider: '[data-item-products-slider]',
  itemProduct: '[data-item-product]',
  links: 'a, button',
};

const classes = {
  itemActive: 'blog-item--active',
  itemProductsVisible: 'blog-item__products--visible',
  featuredBlogSlider: 'shoppable-blog__slider',
  flickityEnabled: 'flickity-enabled',
  isSelected: 'is-selected',
};

const attributes = {
  slider: 'data-slider',
  slidePosition: 'data-slide-position',
  sectionId: 'data-section-id',
  tabIndex: 'tabindex',
};

class ShoppableBlog {
  constructor(section) {
    this.container = section.container;
    this.flkty = null;
    this.slider = this.container.querySelector(selectors.slider);
    this.checkSlidesSizeOnResize = () => this.checkSlidesSize();
    this.isFullWidth = this.container.hasAttribute(attributes.fullWidth);
    this.gutter = 0;
    this.a11y = a11y;
    this.clickOutsideItemEvent = (e) => {
      const clickOutsideSliderItem = !(e.target.matches(selectors.sliderItem) || e.target.closest(selectors.sliderItem));

      if (clickOutsideSliderItem) {
        const sliderItem = this.container.querySelectorAll(selectors.sliderItem);
        if (sliderItem.length) {
          sliderItem.forEach((item) => {
            const itemProducts = item.querySelector(selectors.itemProducts);
            if (itemProducts) {
              itemProducts.classList.remove(classes.itemProductsVisible);

              this.changeTabIndex(itemProducts);
            }
            item.classList.remove(classes.itemActive);
          });
        }
      }
    };

    this.bindButtons();
    this.listen();
  }

  initSlider() {
    this.flkty = new Flickity(this.slider, {
      prevNextButtons: true,
      pageDots: false,
      cellAlign: 'left',
      wrapAround: false,
      groupCells: true,
      contain: true,
      on: {
        ready: () => {
          this.handleFocus();
        },
      },
    });

    this.flkty.on('change', () => {
      const slides = this.container.querySelectorAll(selectors.sliderItem);

      this.handleFocus();

      if (slides.length) {
        slides.forEach((el) => {
          const itemProducts = el.querySelector(selectors.itemProducts);

          el.classList.remove(classes.itemActive);

          if (itemProducts) {
            el.querySelector(selectors.itemProducts).classList.remove(classes.itemProductsVisible);
          }
        });
      }

      if (this.flkty && !this.flkty.options.draggable) {
        this.flkty.options.draggable = true;
        this.flkty.updateDraggable();
      }
    });
  }

  destroySlider() {
    if (this.flkty !== null) {
      this.flkty.destroy();
      this.flkty = null;
    }
  }

  checkSlidesSize() {
    const sliderItemStyle = this.container.querySelector(selectors.sliderItem).currentStyle || window.getComputedStyle(this.container.querySelector(selectors.sliderItem));
    this.gutter = parseInt(sliderItemStyle.marginRight);
    const containerWidth = this.slider.offsetWidth + this.gutter;
    const itemsWidth = this.getItemsWidth();
    const itemsOverflowViewport = containerWidth < itemsWidth;

    if (window.innerWidth >= theme.sizes.small && itemsOverflowViewport) {
      this.initSlider();
    } else {
      this.destroySlider();
    }
  }

  getItemsWidth() {
    let itemsWidth = 0;
    const slides = this.slider.querySelectorAll(selectors.sliderItem);
    if (slides.length) {
      slides.forEach((item) => {
        itemsWidth += item.offsetWidth + this.gutter;
      });
    }

    return itemsWidth;
  }

  bindButtons() {
    const itemProductSlider = this.container.querySelectorAll(selectors.itemProductSlider);
    const buttonProductsShow = this.container.querySelectorAll(selectors.buttonProductsShow);
    const buttonProductsHide = this.container.querySelectorAll(selectors.buttonProductsHide);

    if (buttonProductsShow.length) {
      buttonProductsShow.forEach((button) => {
        button.addEventListener('click', (e) => {
          e.preventDefault();

          this.container.querySelectorAll(selectors.sliderItem).forEach((item) => {
            const itemProducts = item.querySelector(selectors.itemProducts);
            item.classList.remove(classes.itemActive);

            if (itemProducts) {
              itemProducts.classList.remove(classes.itemProductsVisible);

              this.changeTabIndex(itemProducts);
            }
          });

          const item = button.closest(selectors.sliderItem);
          const itemProducts = item.querySelector(selectors.itemProducts);
          item.classList.add(classes.itemActive);

          if (itemProducts) {
            itemProducts.classList.add(classes.itemProductsVisible);
            this.changeTabIndex(itemProducts, 'enable');

            const itemProductsSlider = itemProducts.querySelector(selectors.itemProductSlider);
            const allSlides = itemProductsSlider.querySelectorAll(selectors.itemProduct);
            const sliderActive = itemProductsSlider.classList.contains(classes.flickityEnabled);

            if (sliderActive) {
              const currentSlide = itemProductsSlider.querySelector(`.${classes.isSelected}`);
              const currentSlideIndex = currentSlide.getAttribute(attributes.slidePosition);

              allSlides.forEach((slide, i) => {
                slide.setAttribute(attributes.tabIndex, i === currentSlideIndex ? '0' : '-1');
              });
            }
          }

          if (this.flkty !== null) {
            this.flkty.options.draggable = false;
            this.flkty.updateDraggable();
          }

          this.a11y.state.trigger = button;
        });
      });
    }

    if (buttonProductsHide.length) {
      buttonProductsHide.forEach((button) => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const item = button.closest(selectors.sliderItem);
          const itemProducts = item.querySelector(selectors.itemProducts);
          item.classList.remove(classes.itemActive);

          if (itemProducts) {
            itemProducts.classList.remove(classes.itemProductsVisible);

            this.changeTabIndex(itemProducts);
          }

          if (this.flkty !== null) {
            this.flkty.options.draggable = true;
            this.flkty.updateDraggable();
          }

          this.a11y.state.trigger.focus();
        });
      });
    }

    if (itemProductSlider.length) {
      itemProductSlider.forEach((slider) => {
        const countSlides = slider.querySelectorAll(selectors.itemProduct).length;

        if (countSlides > 1) {
          const flktyProducts = new Flickity(slider, {
            prevNextButtons: true,
            contain: true,
            pageDots: false,
            wrapAround: true,
            on: {
              change: (index) => {
                flktyProducts.cells.forEach((slide, i) => {
                  slide.element.querySelectorAll(selectors.links).forEach((link) => {
                    link.setAttribute(attributes.tabIndex, i === index ? '0' : '-1');
                  });
                });
              },
            },
          });
        }
      });
    }

    this.slider.addEventListener('keyup', (event) => {
      if (event.code === theme.keyboardKeys.ESCAPE) {
        const sliderItem = event.target.hasAttribute(attributes.slider)
          ? event.target.querySelectorAll(selectors.sliderItem)
          : event.target.closest(selectors.slider).querySelectorAll(selectors.sliderItem);

        if (sliderItem.length) {
          sliderItem.forEach((item) => {
            const itemProducts = item.querySelector(selectors.itemProducts);
            item.classList.remove(classes.itemActive);
            if (itemProducts) {
              itemProducts.classList.remove(classes.itemProductsVisible);

              this.changeTabIndex(itemProducts);
            }
          });

          if (this.flkty) {
            this.flkty.options.draggable = true;
            this.flkty.updateDraggable();
          }
        }

        this.a11y.state.trigger.focus();
      }
    });
  }

  handleFocus() {
    const sliderItems = this.container.querySelectorAll(selectors.sliderItem);

    if (sliderItems.length) {
      sliderItems.forEach((item) => {
        const selected = item.classList.contains(classes.isSelected);
        const itemProducts = item.querySelector(selectors.itemProducts);

        if (!selected) {
          this.changeTabIndex(item);

          if (itemProducts) {
            itemProducts.classList.remove(classes.itemProductsVisible);
          }
        } else {
          this.changeTabIndex(item, 'enable');

          if (itemProducts) {
            this.changeTabIndex(itemProducts);
          }
        }
      });
    }
  }

  listen() {
    if (this.slider) {
      this.checkSlidesSize();
      document.addEventListener('theme:resize:width', this.checkSlidesSizeOnResize);
    }

    document.addEventListener('mousedown', this.clickOutsideItemEvent);
  }

  changeTabIndex(items, state = '') {
    const tabIndex = state === 'enable' ? '0' : '-1';
    items.querySelectorAll(selectors.links).forEach((link) => {
      link.setAttribute(attributes.tabIndex, tabIndex);
    });
  }

  onBlockSelect(evt) {
    if (this.flkty !== null) {
      const index = parseInt([...evt.target.parentNode.children].indexOf(evt.target));
      const slidesPerPage = parseInt(this.flkty.slides[0].cells.length);
      const groupIndex = Math.floor(index / slidesPerPage);

      this.flkty.select(groupIndex);
    } else {
      const sliderStyle = this.slider.currentStyle || window.getComputedStyle(this.slider);
      const sliderPadding = parseInt(sliderStyle.paddingLeft);
      const blockPositionLeft = evt.target.offsetLeft - sliderPadding;

      // Native scroll to item
      this.slider.scrollTo({
        top: 0,
        left: blockPositionLeft,
        behavior: 'smooth',
      });
    }
  }

  onUnload() {
    document.removeEventListener('theme:resize:width', this.checkSlidesSizeOnResize);
    document.removeEventListener('mousedown', this.clickOutsideItemEvent);
  }
}

const shoppableBlogSection = {
  onLoad() {
    sections[this.id] = new ShoppableBlog(this);
  },
  onUnload(e) {
    sections[this.id].onUnload(e);
  },
  onBlockSelect(e) {
    sections[this.id].onBlockSelect(e);
  },
};

register('shoppable-blog', shoppableBlogSection);
