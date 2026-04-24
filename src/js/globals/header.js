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
          // Apply the initial state synchronously so the correct variant
          // (desktop vs mobile) is visible on the first paint, avoiding
          // the flash of mismatched layout on page load / theme-editor save.
          this.applyCollapseState();
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
        if (!this.minWidth) return;

        // Debounce execution to run at most every 150ms
        if (this._resizeTimeout) cancelAnimationFrame(this._resizeTimeout);

        this._resizeTimeout = requestAnimationFrame(() => {
          clearTimeout(this._resizeDebounce);
          this._resizeDebounce = setTimeout(() => {
            this.applyCollapseState();
          }, 150);
        });
      }

      applyCollapseState() {
        const isHamburgerMenu = this.getAvailableWidth() < this.minWidth;

        this.classList.toggle(classes.showMobileClass, isHamburgerMenu);

        if (isHamburgerMenu) {
          const {headerHeight} = window.theme.readHeights();
          document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
        }

        return isHamburgerMenu;
      }

      getMinWidth() {
        // Measure the bars' intrinsic content width (not their flex-distributed
        // width). Without this, bars with flex-grow would report whatever
        // width the current viewport allocates them, which is equal to the
        // wrapper's inner width — making the comparison in checkWidth()
        // collapse the header unconditionally.
        //
        // The `[data-child-takes-space]` elements that may be flex-grown and
        // therefore need intrinsic measurement are defined in the CSS:
        //   - .header__desktop__bar__l  — `flex: 1 0 0`
        //   - .header__desktop__bar__c  — `flex-grow: 0`
        //   - .header__desktop__bar__r  — `flex: 1 0 0`
        // If any of those flex rules are renamed, removed, or marked
        // `!important`, the inline override below will no longer cancel the
        // grow and the "collapse to hamburger" threshold will be wrong.
        // Keep the rules above flex-based and without `!important`, or update
        // the inline override here accordingly.
        const wrappers = this.querySelectorAll(selectors.widthContentWrapper);
        let minWidth = 0;
        let spacing = 0;
        let widest = null;

        wrappers.forEach((wrapper) => {
          const children = wrapper.querySelectorAll(selectors.widthContent);
          if (!children.length) return;

          // Force intrinsic sizing during measurement, then restore the
          // original inline value (so CSS rules resume controlling the bars).
          // `0 0 auto` = don't grow, don't shrink, basis = content size.
          const originalFlex = [];
          children.forEach((el) => {
            originalFlex.push(el.style.flex);
            el.style.flex = '0 0 auto';
          });

          let total = 0;
          children.forEach((el) => {
            if (el.offsetParent !== null) {
              total += el.offsetWidth;
            }
          });

          children.forEach((el, i) => {
            el.style.flex = originalFlex[i];
          });

          const space = children.length * 20;

          if (total + space > minWidth) {
            minWidth = total;
            spacing = space;
            widest = wrapper;
          }
        });

        this._measuredWrapper = widest;

        return minWidth + spacing;
      }

      // Returns the horizontal space actually available to the bars, which
      // equals the measured wrapper's clientWidth minus its inline padding.
      // This accounts for .header__padded (var(--outer)) and the floating
      // card's inset (which narrows the wrapper via its parent).
      getAvailableWidth() {
        const wrapper = this._measuredWrapper;
        if (!wrapper) return theme.windowWidth;

        const style = getComputedStyle(wrapper);
        const paddingX = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);

        return wrapper.clientWidth - paddingX;
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
        let offset = marginTop + announcementWrapper.offsetHeight + marginBottom;

        if (this.classList.contains('header-floating')) {
          const firstBlock = this.querySelector('.toolbar, .header-floating__card');
          if (firstBlock) {
            const currentMargin = parseFloat(getComputedStyle(firstBlock).marginTop) || 0;
            offset -= marginTop - currentMargin;
          }
        }

        return offset;
      }

      listen() {
        document.addEventListener('theme:scroll', this.scrollEvent);
        document.addEventListener('shopify:section:load', this.updateHeaderOffset);
        document.addEventListener('shopify:section:unload', this.updateHeaderOffset);
      }

      onScroll(e) {
        if (this.headerOffset == null) return;
        if (this.alwaysStuck) return;

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

        requestAnimationFrame(() => {
          this.headerOffset = this.getHeaderOffset();
          this.alwaysStuck = this.headerOffset === 0 && this.classList.contains('header-floating');

          if (this.alwaysStuck) {
            this.stickSimple();
          } else if (window.scrollY <= this.headerOffset) {
            this.unstickSimple();
          }
        });
      }

      stickOnLoad() {
        this.alwaysStuck = this.headerOffset === 0 && this.classList.contains('header-floating');

        if (this.alwaysStuck || window.scrollY > this.headerOffset) {
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
