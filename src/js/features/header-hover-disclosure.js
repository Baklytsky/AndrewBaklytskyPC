const selectors = {
  disclosureWrappper: '[data-hover-disclosure]',
  header: '[data-site-header]',
  link: '[data-top-link]',
  headerBackground: '[data-header-background]',
  navItem: '[data-nav-item]',
};

const classes = {
  isVisible: 'is-visible',
  grandparent: 'grandparent',
  headerMenuOpened: 'site-header--menu-opened',
  hasScrolled: 'has-scrolled',
  headerHovered: 'site-header--hovered',
  searchOpened: 'search-opened',
};

const attributes = {
  disclosureToggle: 'data-hover-disclosure-toggle',
  ariaHasPopup: 'aria-haspopup',
  ariaExpanded: 'aria-expanded',
  ariaControls: 'aria-controls',
};

let sections = {};

class HoverDisclosure {
  constructor(el) {
    this.disclosure = el;
    this.header = el.closest(selectors.header);
    this.key = this.disclosure.id;
    this.trigger = document.querySelector(`[${attributes.disclosureToggle}='${this.key}']`);
    this.link = this.trigger.querySelector(selectors.link);
    this.grandparent = this.trigger.classList.contains(classes.grandparent);
    this.background = document.querySelector(selectors.headerBackground);
    this.trigger.setAttribute(attributes.ariaHasPopup, true);
    this.trigger.setAttribute(attributes.ariaExpanded, false);
    this.trigger.setAttribute(attributes.ariaControls, this.key);
    this.dropdown = this.trigger.querySelector(selectors.disclosureWrappper);
    this.setBackgroundHeightEvent = () => this.setBackgroundHeight();

    this.connectHoverToggle();
    this.handleTablets();
  }

  setBackgroundHeight() {
    this.hasScrolled = document.body.classList.contains(classes.hasScrolled);
    this.headerHeight = this.hasScrolled ? window.stickyHeaderHeight : this.header.offsetHeight;

    if (this.grandparent) {
      this.dropdown.style.height = 'auto';
      this.dropdownHeight = this.dropdown.offsetHeight + this.headerHeight;
    } else {
      this.dropdownHeight = this.headerHeight;
    }

    this.background.style.setProperty('--header-background-height', `${this.dropdownHeight}px`);

    // Hide header dropdowns on mobile
    if (window.innerWidth < theme.sizes.small) {
      this.hideDisclosure();
    }
  }

  showDisclosure() {
    this.setBackgroundHeight();
    document.addEventListener('theme:resize', this.setBackgroundHeightEvent);

    // Set accessibility and classes
    this.trigger.setAttribute(attributes.ariaExpanded, true);
    this.trigger.classList.add(classes.isVisible);
    this.header.classList.add(classes.headerMenuOpened);
    if (this.trigger.classList.contains(classes.grandparent)) {
      document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: this.header}));
    }
    this.updateHeaderHover();
  }

  hideDisclosure() {
    this.background.style.removeProperty('--header-background-height');
    document.removeEventListener('theme:resize', this.setBackgroundHeightEvent);

    this.trigger.classList.remove(classes.isVisible);
    this.trigger.setAttribute(attributes.ariaExpanded, false);
    this.header.classList.remove(classes.headerMenuOpened);
    if (!document.body.classList.contains(classes.searchOpened)) {
      document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
    }
  }

  updateHeaderHover() {
    requestAnimationFrame(() => {
      const isHovered = this.header.matches(':hover');
      const hasHoveredClass = this.header.classList.contains(classes.headerHovered);

      if (isHovered && !hasHoveredClass) this.header.classList.add(classes.headerHovered);
    });
  }

  handleTablets() {
    // first click opens the popup, second click opens the link
    this.trigger.addEventListener('touchstart', (e) => {
      const isOpen = this.trigger.classList.contains(classes.isVisible);
      if (!isOpen) {
        e.preventDefault();

        // Hide the rest of the active nav items
        const activeNavItems = this.header.querySelectorAll(`.${classes.isVisible}${selectors.navItem}`);

        if (activeNavItems.length > 0) {
          activeNavItems.forEach((item) => {
            if (item !== this.trigger) {
              item.dispatchEvent(new Event('mouseleave', {bubbles: true}));

              const onTransitionEnd = () => {
                requestAnimationFrame(() => {
                  this.showDisclosure();
                });

                item.removeEventListener('transitionend', onTransitionEnd);
              };

              item.addEventListener('transitionend', onTransitionEnd);
            }
          });

          return;
        }

        this.showDisclosure();
      }
    });
  }

  connectHoverToggle() {
    this.trigger.addEventListener('mouseenter', () => this.showDisclosure());
    this.link.addEventListener('focus', () => this.showDisclosure());

    this.trigger.addEventListener('mouseleave', () => this.hideDisclosure());
    this.trigger.addEventListener('focusout', (event) => {
      const inMenu = this.trigger.contains(event.relatedTarget);

      if (!inMenu) {
        this.hideDisclosure();
      }
    });
    this.disclosure.addEventListener('keyup', (event) => {
      if (event.code !== theme.keyboardKeys.ESCAPE) {
        return;
      }
      this.hideDisclosure();
    });
  }

  onBlockSelect(event) {
    if (this.disclosure.contains(event.target)) {
      this.showDisclosure(event);
    }
  }

  onBlockDeselect(event) {
    if (this.disclosure.contains(event.target)) {
      this.hideDisclosure();
    }
  }
}

const hoverDisclosure = {
  onLoad() {
    sections[this.id] = [];
    const disclosures = this.container.querySelectorAll(selectors.disclosureWrappper);

    disclosures.forEach((el) => {
      sections[this.id].push(new HoverDisclosure(el));
    });
  },
  onBlockSelect(evt) {
    sections[this.id].forEach((el) => {
      if (typeof el.onBlockSelect === 'function') {
        el.onBlockSelect(evt);
      }
    });
  },
  onBlockDeselect(evt) {
    sections[this.id].forEach((el) => {
      if (typeof el.onBlockDeselect === 'function') {
        el.onBlockDeselect(evt);
      }
    });
  },
};

export {hoverDisclosure};
