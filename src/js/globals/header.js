const selectors = {
  announcementWrapper: '[data-announcement-wrapper]',
  cartDrawer: 'cart-drawer',
  cartToggleButton: '[data-cart-toggle]',
  deadLink: '.navlink[href="#"]',
  desktop: '[data-header-desktop]',
  pageHeader: '.page-header',
  style: 'data-header-style',
  widthContent: '[data-child-takes-space]',
  widthContentWrapper: '[data-takes-space-wrapper]',
  wrapper: '[data-header-wrapper]',
};

const classes = {
  headerGroup: 'shopify-section-header-group-group',
  showMobileClass: 'js__show__mobile',
  sticky: 'has-header-sticky',
  stuck: 'js__header__stuck',
  headerWrapper: 'header-wrapper',
};

const attributes = {
  drawer: 'data-drawer',
  drawerToggle: 'data-drawer-toggle',
  scrollLock: 'data-scroll-locked',
  stickyHeader: 'data-header-sticky',
};

if (!customElements.get('header-component')) {
  customElements.define(
    'header-component',
    class HeaderComponent extends HTMLElement {
      constructor() {
        super();

        this.headerStyle = this.dataset.headerStyle;
        this.desktop = this.querySelector(selectors.desktop);
        this.deadLinks = document.querySelectorAll(selectors.deadLink);
        this.resizeObserver = null;
        this.checkWidth = this.checkWidth.bind(this);
        this.isSticky = this.hasAttribute(attributes.stickyHeader);

        document.body.classList.toggle(classes.sticky, this.isSticky);
      }

      connectedCallback() {
        this.killDeadLinks();
        this.drawerToggleEvent();
        this.cartToggleEvent();
        this.initSticky();

        if (this.headerStyle !== 'drawer' && this.desktop) {
          this.minWidth = this.getMinWidth();
          this.listenWidth();
        }
      }

      listenWidth() {
        if ('ResizeObserver' in window) {
          this.resizeObserver = new ResizeObserver(this.checkWidth);
          this.resizeObserver.observe(this);
        } else {
          document.addEventListener('theme:resize', this.checkWidth);
        }
      }

      drawerToggleEvent() {
        this.querySelectorAll(`[${attributes.drawerToggle}]`)?.forEach((button) => {
          button.addEventListener('click', () => {
            let drawer;
            const key = button.hasAttribute(attributes.drawerToggle) ? button.getAttribute(attributes.drawerToggle) : '';
            const desktopDrawer = document.querySelector(`[${attributes.drawer}="${key}"]`);
            const mobileDrawer = document.querySelector(`mobile-menu > [${attributes.drawer}]`);
            const isDesktopView = !theme.isMobile;

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
        console.log('checkWidth', this.minWidth);
        if (!this.minWidth) return;

        // Debounce execution to run at most every 150ms
        if (this._resizeTimeout) cancelAnimationFrame(this._resizeTimeout);

        this._resizeTimeout = requestAnimationFrame(() => {
          clearTimeout(this._resizeDebounce);
          this._resizeDebounce = setTimeout(() => {
            const isHamburgerMenu = theme.windowWidth < this.minWidth;
            console.log('theme.windowWidth', theme.windowWidth);
            console.log('this.minWidth', this.minWidth);
            console.log('isHamburgerMenu', isHamburgerMenu);

            this.classList.toggle(classes.showMobileClass, isHamburgerMenu);

            if (isHamburgerMenu) {
              const {headerHeight} = window.theme.readHeights();
              document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
            }
          }, 150);
        });
      }

      getMinWidth() {
        // Measure actual visible header content instead of cloning
        const wrappers = this.querySelectorAll(selectors.widthContentWrapper);
        let minWidth = 0;
        let spacing = 0;

        wrappers.forEach((wrapper) => {
          const children = wrapper.querySelectorAll(selectors.widthContent);
          if (!children.length) return;

          let total = 0;
          children.forEach((el) => {
            console.log('el', el);
            console.log('el.offsetWidth', el.offsetWidth);
            // Only include visible elements
            if (el.offsetParent !== null) {
              total += el.offsetWidth;
            }
          });

          const space = children.length * 20;

          if (total + space > minWidth) {
            minWidth = total;
            spacing = space;
          }

          console.log('total', total);
          console.log('space', space);
        });

        return minWidth + spacing;
      }

      cartToggleEvent() {
        if (theme.settings.cartType !== 'drawer') return;

        this.querySelectorAll(selectors.cartToggleButton)?.forEach((button) => {
          button.addEventListener('click', (e) => {
            const cartDrawer = document.querySelector(selectors.cartDrawer);

            if (cartDrawer) {
              e.preventDefault();
              cartDrawer.dispatchEvent(new CustomEvent('theme:cart-drawer:show'));
              window.theme.a11y.lastElement = button;
            }
          });
        });
      }

      toggleButtonClick(e) {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('theme:cart-drawer:toggle', {bubbles: true}));
      }

      initSticky() {
        if (!this.isSticky) return;

        this.isStuck = false;
        this.cls = this.classList;
        this.updateHeaderOffset = this.updateHeaderOffset.bind(this);
        this.scrollEvent = (e) => this.onScroll(e);

        this.listen();

        requestAnimationFrame(() => {
          this.headerOffset = this.getHeaderOffset();
          this.stickOnLoad();
        });
      }

      getHeaderOffset() {
        const announcementWrapper = this.closest(selectors.pageHeader)?.querySelector(selectors.announcementWrapper);
        if (!announcementWrapper) return 0;
        const style = getComputedStyle(announcementWrapper);
        const marginTop = parseFloat(style.marginTop) || 0;
        const marginBottom = parseFloat(style.marginBottom) || 0;
        return marginTop + announcementWrapper.offsetHeight + marginBottom;
      }

      listen() {
        document.addEventListener('theme:scroll', this.scrollEvent);
        document.addEventListener('shopify:section:load', this.updateHeaderOffset);
        document.addEventListener('shopify:section:unload', this.updateHeaderOffset);
      }

      onScroll(e) {
        if (this.headerOffset == null) return;

        if (e.detail.down) {
          if (!this.isStuck && e.detail.position > this.headerOffset) {
            this.stickSimple();
          }
        } else if (e.detail.position <= this.headerOffset) {
          this.unstickSimple();
        }
      }

      updateHeaderOffset(event) {
        if (!event.target.classList.contains(classes.headerGroup)) return;

        // Update header offset after any "Header group" section has been changed
        requestAnimationFrame(() => {
          this.headerOffset = this.getHeaderOffset();
        });
      }

      stickOnLoad() {
        if (window.scrollY > this.headerOffset) {
          this.stickSimple();
        }
      }

      stickSimple() {
        this.cls.add(classes.stuck);
        this.isStuck = true;
      }

      unstickSimple() {
        if (!document.documentElement.hasAttribute(attributes.scrollLock)) {
          // check for scroll lock
          this.cls.remove(classes.stuck);
          this.isStuck = false;
        }
      }

      disconnectedCallback() {
        if ('ResizeObserver' in window) {
          this.resizeObserver?.unobserve(this);
        } else {
          document.removeEventListener('theme:resize', this.checkWidth);
        }

        if (this.isSticky) {
          document.removeEventListener('theme:scroll', this.scrollEvent);
          document.removeEventListener('shopify:section:load', this.updateHeaderOffset);
          document.removeEventListener('shopify:section:unload', this.updateHeaderOffset);
        }
      }
    }
  );
}
