import {register} from '../vendor/theme-scripts/theme-sections';
import stickyHeader from '../features/header-sticky';
import hoverDisclosure from '../features/header-hover-disclosure';

const selectors = {
  wrapper: '[data-header-wrapper]',
  style: 'data-header-style',
  widthContentWrapper: '[data-takes-space-wrapper]',
  widthContent: '[data-child-takes-space]',
  desktop: '[data-header-desktop]',
  deadLink: '.navlink[href="#"]',
  cartDrawer: 'cart-drawer',
  cartToggleButton: '[data-cart-toggle]',
  firstSectionOverlayHeader: '.main-content > .shopify-section.section-overlay-header:first-of-type',
  preventTransparent: '[data-prevent-transparent-header]',
};

const classes = {
  clone: 'js__header__clone',
  firstSectionOverlayHeader: 'has-first-section-overlay-header',
  showMobileClass: 'js__show__mobile',
  transparent: 'has-header-transparent',
};

const attributes = {
  drawer: 'data-drawer',
  drawerToggle: 'data-drawer-toggle',
  transparent: 'data-header-transparent',
};

let sections = {};

class Header {
  constructor(el) {
    this.wrapper = el;
    this.style = this.wrapper.dataset.style;
    this.desktop = this.wrapper.querySelector(selectors.desktop);
    this.deadLinks = document.querySelectorAll(selectors.deadLink);
    this.resizeObserver = null;
    this.checkWidth = this.checkWidth.bind(this);

    this.killDeadLinks();
    if (this.style !== 'drawer' && this.desktop) {
      this.minWidth = this.getMinWidth();
      this.listenWidth();
    }

    this.drawerToggleEvent();
    this.cartToggleEvent();

    // Fallback for CSS :has() selectors
    let enableTransparentHeader = false;
    const firstSectionOverlayHeader = document.querySelector(selectors.firstSectionOverlayHeader);
    if (firstSectionOverlayHeader && !firstSectionOverlayHeader.querySelector(selectors.preventTransparent)) {
      enableTransparentHeader = true;
    }

    document.body.classList.toggle(classes.transparent, this.wrapper.hasAttribute(attributes.transparent));
    document.body.classList.toggle(classes.firstSectionOverlayHeader, enableTransparentHeader);
  }

  initTicker(stopClone = false) {
    this.tickerFrames.forEach((frame) => {
      new Ticker(frame, stopClone);
    });

    this.tickerResizeEvent = (event) => this.onTickerResize(event);

    document.addEventListener('theme:resize:width', this.tickerResizeEvent);
  }

  listenWidth() {
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(this.checkWidth);
      this.resizeObserver.observe(this.wrapper);
    } else {
      document.addEventListener('theme:resize', this.checkWidth);
    }
  }

  drawerToggleEvent() {
    this.wrapper.querySelectorAll(`[${attributes.drawerToggle}]`)?.forEach((button) => {
      button.addEventListener('click', () => {
        let drawer;
        const key = button.hasAttribute(attributes.drawerToggle) ? button.getAttribute(attributes.drawerToggle) : '';
        const desktopDrawer = document.querySelector(`[${attributes.drawer}="${key}"]`);
        const mobileDrawer = document.querySelector(`mobile-menu > [${attributes.drawer}]`);
        const isDesktopView = !window.theme.isMobile();

        if (isDesktopView) {
          drawer = desktopDrawer;
        } else {
          drawer = theme.settings.mobileMenuType === 'new' ? mobileDrawer || desktopDrawer : desktopDrawer;
        }

        drawer.dispatchEvent(
          new CustomEvent('theme:drawer:toggle', {
            bubbles: false,
            detail: {
              button: button,
            },
          })
        );
      });
    });
  }

  killDeadLinks() {
    this.deadLinks.forEach((el) => {
      el.onclick = (e) => {
        e.preventDefault();
      };
    });
  }

  checkWidth() {
    if (document.body.clientWidth < this.minWidth) {
      this.wrapper.classList.add(classes.showMobileClass);

      // Update --header-height CSS variable when switching to a mobile nav
      const {headerHeight} = window.theme.readHeights();
      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    } else {
      this.wrapper.classList.remove(classes.showMobileClass);
    }
  }

  getMinWidth() {
    const comparitor = this.wrapper.cloneNode(true);
    comparitor.classList.add(classes.clone);
    document.body.appendChild(comparitor);
    const widthWrappers = comparitor.querySelectorAll(selectors.widthContentWrapper);
    let minWidth = 0;
    let spaced = 0;

    widthWrappers.forEach((context) => {
      const wideElements = context.querySelectorAll(selectors.widthContent);
      let thisWidth = 0;
      if (wideElements.length === 3) {
        thisWidth = _sumSplitWidths(wideElements);
      } else {
        thisWidth = _sumWidths(wideElements);
      }
      if (thisWidth > minWidth) {
        minWidth = thisWidth;
        spaced = wideElements.length * 20;
      }
    });

    document.body.removeChild(comparitor);
    return minWidth + spaced;
  }

  cartToggleEvent() {
    if (theme.settings.cartType !== 'drawer') return;

    this.wrapper.querySelectorAll(selectors.cartToggleButton)?.forEach((button) => {
      button.addEventListener('click', (e) => {
        const cartDrawer = document.querySelector(selectors.cartDrawer);

        if (cartDrawer) {
          e.preventDefault();
          cartDrawer.dispatchEvent(new CustomEvent('theme:cart-drawer:show'));
          window.a11y.lastElement = button;
        }
      });
    });
  }

  toggleButtonClick(e) {
    e.preventDefault();
    document.dispatchEvent(new CustomEvent('theme:cart:toggle', {bubbles: true}));
  }

  unload() {
    if ('ResizeObserver' in window) {
      this.resizeObserver?.unobserve(this.wrapper);
    } else {
      document.removeEventListener('theme:resize', this.checkWidth);
    }
  }
}

function _sumSplitWidths(nodes) {
  let arr = [];
  nodes.forEach((el) => {
    if (el.firstElementChild) {
      arr.push(el.firstElementChild.clientWidth);
    }
  });
  if (arr[0] > arr[2]) {
    arr[2] = arr[0];
  } else {
    arr[0] = arr[2];
  }
  const width = arr.reduce((a, b) => a + b);
  return width;
}
function _sumWidths(nodes) {
  let width = 0;
  nodes.forEach((el) => {
    width += el.clientWidth;
  });
  return width;
}

const header = {
  onLoad() {
    sections = new Header(this.container);
  },
  onUnload() {
    if (typeof sections.unload === 'function') {
      sections.unload();
    }
  },
};

register('header', [header, stickyHeader, hoverDisclosure]);
