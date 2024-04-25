import CartDrawer from '../globals/cart';
import {drawer} from '../globals/drawer';
import initTransparentHeader from '../globals/init-transparent-header';
import {hoverDisclosure} from '../features/header-hover-disclosure';
import {register} from '../vendor/theme-scripts/theme-sections';

const selectors = {
  header: '[data-site-header]',
  announcementBar: '[data-announcement-wrapper]',
  collectionFilters: '[data-collection-filters]',
  logoTextLink: '[data-logo-text-link]',
  mobileNavDropdownTrigger: '[data-collapsible-trigger]',
  navDrawer: '#nav-drawer',
  drawer: '[data-drawer]',
  drawerToggle: '[data-drawer-toggle]',
  popdownToggle: '[data-popdown-toggle]',
  mobileMenu: '[data-mobile-menu]',
  nav: '[data-nav]',
  navIcons: '[data-nav-icons]',
  navItem: '[data-nav-item]',
  navLinkMobile: '[data-nav-link-mobile]',
  navSearchOpen: '[data-nav-search-open]',
  wrapper: '[data-wrapper]',
  headerBackground: '[data-header-background]',
  cartPage: '[data-cart-page]',
  widthContent: '[data-takes-space]',
};

const classes = {
  jsDrawerOpenAll: ['js-drawer-open', 'js-drawer-open-cart', 'js-quick-view-visible', 'js-quick-view-from-cart'],
  headerTransparent: 'site-header--transparent',
  headerHovered: 'site-header--hovered',
  headerMenuOpened: 'site-header--menu-opened',
  hasScrolled: 'has-scrolled',
  hasStickyHeader: 'has-sticky-header',
  hideHeader: 'hide-header',
  headerCompress: 'site-header--compress',
  isVisible: 'is-visible',
  isOpen: 'is-open',
  searchOpened: 'search-opened',
  noOutline: 'no-outline',
  cloneClass: 'js__header__clone',
};

const attributes = {
  navAlignment: 'data-nav-alignment',
  headerSticky: 'data-header-sticky',
};

const sections = {};

class Header {
  constructor(container) {
    this.container = container;
    this.background = document.querySelector(selectors.headerBackground);
    this.header = container;
    this.headerSection = container.parentNode;
    this.headerWrapper = container.querySelector(selectors.wrapper);
    this.logoTextLink = container.querySelector(selectors.logoTextLink);
    this.nav = container.querySelector(selectors.nav);
    this.navIcons = container.querySelector(selectors.navIcons);
    this.headerStateEvent = (event) => this.headerState(event);
    this.handleTouchstartEvent = (event) => this.handleTouchstart(event);
    this.updateBackgroundHeightEvent = (event) => this.updateBackgroundHeight(event);

    initTransparentHeader();

    this.minWidth = this.getMinWidth();
    this.checkWidthEvent = () => this.checkWidth();
    this.listenWidth();
    this.initMobileNav();
    this.handleTextLinkLogos();
    this.initStickyHeader();
    this.handleBackgroundEvents();

    if (!document.querySelector(selectors.cartPage)) {
      window.cart = new CartDrawer();
    }

    document.body.addEventListener('touchstart', this.handleTouchstartEvent, {passive: true});
    this.updateHeaderHover();
  }

  updateHeaderHover() {
    requestAnimationFrame(() => {
      const isHovered = this.header.matches(':hover');
      const hasHoveredClass = this.header.classList.contains(classes.headerHovered);

      if (isHovered && !hasHoveredClass) this.header.classList.add(classes.headerHovered);
    });
  }

  handleTouchstart(event) {
    const isInHeader = this.header.contains(event.target);
    const activeNavItem = this.header.querySelector(`.${classes.isVisible}${selectors.navItem}`);

    if (!isInHeader && activeNavItem) {
      activeNavItem.dispatchEvent(new Event('mouseleave', {bubbles: true}));
    }
  }

  handleTextLinkLogos() {
    if (this.logoTextLink === null) return;

    const headerHeight = this.header.offsetHeight;
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    document.documentElement.style.setProperty('--header-sticky-height', `${headerHeight}px`);
  }

  initStickyHeader() {
    this.headerSticky = this.header.hasAttribute(attributes.headerSticky);
    if (!CSS.supports('(selector(:has(*)))')) {
      document.body.classList.toggle(classes.hasStickyHeader, this.headerSticky);
    }

    this.hasScrolled = false;
    this.hasCollectionFilters = document.querySelector(selectors.collectionFilters);
    this.position = this.header.dataset.position;

    const shouldShowCompactHeader = this.position === 'fixed' && !this.hasCollectionFilters;
    if (shouldShowCompactHeader) {
      this.headerState();
      document.addEventListener('theme:scroll', this.headerStateEvent);
      return;
    }

    document.body.classList.remove(classes.hasScrolled);
    if (window.isHeaderTransparent) {
      this.header.classList.add(classes.headerTransparent);
    }
  }

  // Switch to "compact" header on scroll
  headerState(event) {
    const headerHeight = parseInt(this.header.dataset.height || this.header.offsetHeight);
    const announcementBar = document.querySelector(selectors.announcementBar);
    const announcementHeight = announcementBar ? announcementBar.offsetHeight : 0;
    const pageOffset = headerHeight + announcementHeight;
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollUp = event && event.detail && event.detail.up;

    // Show compact header when scroll down
    this.hasScrolled = currentScrollTop > pageOffset;
    document.body.classList.toggle(classes.hasScrolled, this.hasScrolled);

    // Hide compact header when scroll back to top
    const hideHeaderThreshold = pageOffset + window.stickyHeaderHeight;
    const bellowThreshold = currentScrollTop < hideHeaderThreshold;
    const shouldHideHeader = bellowThreshold && scrollUp;
    document.body.classList.toggle(classes.hideHeader, shouldHideHeader);

    if (window.isHeaderTransparent) {
      const shouldShowTransparentHeader = !this.hasScrolled || shouldHideHeader;
      this.header.classList.toggle(classes.headerTransparent, shouldShowTransparentHeader);
    }

    // Update header background height if users scroll the page with their mouse over the header or over an opened nav menu
    if (this.header.classList.contains(classes.headerHovered)) {
      const currentHeight = this.hasScrolled ? window.stickyHeaderHeight : headerHeight;
      this.background.style.setProperty('--header-background-height', `${currentHeight}px`);

      const activeNavItem = this.header.querySelector(`.${classes.isVisible}${selectors.navItem}`);
      if (activeNavItem) {
        activeNavItem.dispatchEvent(new Event('mouseenter', {bubbles: true}));
      }
    }
  }

  handleBackgroundEvents() {
    this.headerWrapper.addEventListener('mouseenter', this.updateBackgroundHeightEvent);

    this.headerWrapper.addEventListener('mouseleave', this.updateBackgroundHeightEvent);

    this.header.addEventListener('focusout', this.updateBackgroundHeightEvent);

    document.addEventListener('theme:cart:close', this.updateBackgroundHeightEvent);

    // Helps fixing Safari issues with background not being updated on search close and mouse over the header
    document.addEventListener('theme:search:close', this.updateBackgroundHeightEvent);
  }

  updateBackgroundHeight(event) {
    const isDesktop = matchMedia('(pointer:fine)').matches;
    const isFocusEnabled = !document.body.classList.contains(classes.noOutline);
    const isNotTabbingOnDesktop = isDesktop && !isFocusEnabled;

    if (!event) return;

    let drawersVisible = classes.jsDrawerOpenAll.some((popupClass) => document.body.classList.contains(popupClass));

    // Update header background height on:
    // 'mouseenter' event
    // opened Cart drawer/Quick View/Menu drawers
    if (event.type === 'mouseenter' || drawersVisible) {
      this.headerHeight = this.hasScrolled ? window.stickyHeaderHeight : this.header.offsetHeight;

      this.header.classList.add(classes.headerHovered);

      if (!this.header.classList.contains(classes.headerMenuOpened)) {
        this.background.style.setProperty('--header-background-height', `${this.headerHeight}px`);
      }
    }

    if (event.type === 'mouseenter') return;

    requestAnimationFrame(() => {
      drawersVisible = classes.jsDrawerOpenAll.some((popupClass) => document.body.classList.contains(popupClass));

      if (drawersVisible) return;

      // Remove header background and handle focus on:
      // 'mouseleave' event
      // 'theme:cart:close' event
      // 'theme:search:close' event
      // 'focusout' event
      // closed Cart drawer/Quick View/Menu drawers

      if (event.type === 'focusout' && !isDesktop) return;
      if (event.type === 'theme:search:close' && !isNotTabbingOnDesktop) return;
      if (this.hasScrolled) return;

      const focusOutOfHeader = document.activeElement.closest(selectors.header) === null;
      const isSearchOpened = document.body.classList.contains(classes.searchOpened);
      const headerMenuOpened = this.header.classList.contains(classes.headerMenuOpened);

      if (isSearchOpened || headerMenuOpened) return;

      if (event.type === 'focusout') {
        if (!focusOutOfHeader) return;
      }

      this.header.classList.remove(classes.headerHovered);
      this.background.style.setProperty('--header-background-height', '0px');

      if (!isFocusEnabled) {
        document.activeElement.blur();
      }
    });
  }

  listenWidth() {
    document.addEventListener('theme:resize', this.checkWidthEvent);
    this.checkWidth();
  }

  checkWidth() {
    if (window.innerWidth < this.minWidth) {
      this.header.classList.add(classes.headerCompress);
    } else {
      this.header.classList.remove(classes.headerCompress);
    }
  }

  getMinWidth() {
    const headerWrapperStyles = this.headerWrapper.currentStyle || window.getComputedStyle(this.headerWrapper);
    const headerPaddings = parseInt(headerWrapperStyles.paddingLeft) * 2;
    const comparitor = this.header.cloneNode(true);
    comparitor.classList.add(classes.cloneClass);
    document.body.appendChild(comparitor);
    const wideElements = comparitor.querySelectorAll(selectors.widthContent);
    const navAlignment = this.header.getAttribute(attributes.navAlignment);
    const minWidth = _sumSplitWidths(wideElements, navAlignment);

    document.body.removeChild(comparitor);

    return minWidth + wideElements.length * 20 + headerPaddings;
  }

  initMobileNav() {
    // Search popdown link
    this.mobileMenu = this.headerSection.querySelector(selectors.mobileMenu);
    this.navDrawer = this.headerSection.querySelector(selectors.navDrawer);
    this.drawerToggle = this.navDrawer.querySelector(selectors.drawerToggle);
    this.navSearchOpen = this.navDrawer.querySelectorAll(selectors.navSearchOpen);

    this.navSearchOpen?.forEach((element) => {
      element.addEventListener('click', (event) => {
        event.preventDefault();

        const drawer = this.drawerToggle.closest(`${selectors.drawer}.${classes.isOpen}`);
        const isMobile = matchMedia('(pointer:coarse)').matches;
        const popdownToggle = isMobile ? this.mobileMenu.querySelector(selectors.popdownToggle) : this.nav.querySelector(selectors.popdownToggle);

        this.drawerToggle.dispatchEvent(new Event('click', {bubbles: true}));

        const onDrawerTransitionEnd = (e) => {
          if (e.target !== drawer) return;
          requestAnimationFrame(() => popdownToggle.dispatchEvent(new Event('click', {bubbles: true})));
          drawer.removeEventListener('transitionend', onDrawerTransitionEnd);
        };

        drawer.addEventListener('transitionend', onDrawerTransitionEnd);
      });
    });

    // First item in dropdown menu
    if (theme.settings.mobileMenuBehaviour === 'link') {
      return;
    }

    const navMobileLinks = this.headerSection.querySelectorAll(selectors.navLinkMobile);
    if (navMobileLinks.length) {
      navMobileLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
          const hasDropdown = link.parentNode.querySelectorAll(selectors.mobileNavDropdownTrigger).length;
          const dropdownTrigger = link.nextElementSibling;

          if (hasDropdown) {
            e.preventDefault();
            dropdownTrigger.dispatchEvent(new Event('click'), {bubbles: true});
          }
        });
      });
    }
  }

  onUnload() {
    // Reset variables so that the proper ones are applied before saving in the Theme editor
    // Necessary only when they were previously updated in `handleTextLinkLogos()` function
    document.documentElement.style.removeProperty('--header-height');
    document.documentElement.style.removeProperty('--header-sticky-height');

    this.initStickyHeader();
    document.body.classList.remove(...classes.jsDrawerOpenAll);
    document.removeEventListener('theme:scroll', this.headerStateEvent);
    document.removeEventListener('theme:resize', this.checkWidthEvent);
    document.removeEventListener('theme:cart:close', this.updateBackgroundHeightEvent);
    document.removeEventListener('theme:search:close', this.updateBackgroundHeightEvent);
    document.body.removeEventListener('touchstart', this.handleTouchstartEvent);
    document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));

    if (typeof window.cart.unload === 'function') {
      window.cart.unload();
    }
  }
}

function _sumSplitWidths(nodes, alignment) {
  let arr = [];
  nodes.forEach((el) => {
    arr.push(el.clientWidth);
  });
  let [logoWidth, navWidth, iconsWidth] = arr;

  // Check if nav is left and set correct width
  if (alignment === 'left') {
    const tempWidth = logoWidth;
    logoWidth = navWidth;
    navWidth = tempWidth;
  }

  if (alignment !== 'right') {
    if (logoWidth > iconsWidth) {
      iconsWidth = logoWidth;
    } else {
      logoWidth = iconsWidth;
    }
  }

  return logoWidth + navWidth + iconsWidth;
}

const headerSection = {
  onLoad() {
    sections[this.id] = new Header(this.container);
  },
  onUnload() {
    sections[this.id].onUnload();
  },
};

register('header', [headerSection, hoverDisclosure, drawer]);
