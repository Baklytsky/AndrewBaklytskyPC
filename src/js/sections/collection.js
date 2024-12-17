import {register} from '../vendor/theme-scripts/theme-sections';
import * as a11y from '../vendor/theme-scripts/theme-a11y';

const selectors = {
  collectionSidebar: '[data-collection-sidebar]',
  collectionSidebarSlideOut: '[data-collection-sidebar-slide-out]',
  collectionSidebarCloseButton: '[data-collection-sidebar-close]',
  groupTagsButton: '[data-aria-toggle]',
  animation: '[data-animation]',
};

const classes = {
  animated: 'drawer--animated',
  hiding: 'is-hiding',
  expanded: 'expanded',
  noMobileAnimation: 'no-mobile-animation',
  focused: 'is-focused',
};

let sections = {};
class Collection {
  constructor(section) {
    this.container = section.container;
    this.collectionSidebar = this.container.querySelector(selectors.collectionSidebar);
    this.groupTagsButton = this.container.querySelector(selectors.groupTagsButton);
    this.a11y = a11y;

    this.groupTagsButtonClickEvent = (evt) => this.groupTagsButtonClick(evt);
    this.sidebarResizeEvent = () => this.toggleSidebarSlider();
    this.collectionSidebarCloseEvent = (evt) => this.collectionSidebarClose(evt);

    this.init();
  }

  init() {
    if (this.groupTagsButton !== null) {
      document.addEventListener('theme:resize:width', this.sidebarResizeEvent);

      this.groupTagsButton.addEventListener('click', this.groupTagsButtonClickEvent);

      // Prevent filters closing animation on page load
      if (this.collectionSidebar) {
        setTimeout(() => {
          this.collectionSidebar.classList.remove(classes.noMobileAnimation);
        }, 1000);
      }

      const toggleFiltersObserver = new MutationObserver((mutationList) => {
        for (const mutation of mutationList) {
          if (mutation.type === 'attributes') {
            const expanded = mutation.target.getAttribute('aria-expanded') == 'true';

            if (expanded) {
              this.showSidebarCallback();
            }
          }
        }
      });

      toggleFiltersObserver.observe(this.groupTagsButton, {
        attributes: true,
        childList: false,
        subtree: false,
      });
    }

    // Hide filters sidebar on ESC keypress
    this.container.addEventListener(
      'keyup',
      function (evt) {
        if (evt.code !== 'Escape') {
          return;
        }
        this.hideSidebar();
      }.bind(this)
    );

    if (this.collectionSidebar) {
      this.collectionSidebar.addEventListener('transitionend', () => {
        if (!this.collectionSidebar.classList.contains(classes.expanded)) {
          this.collectionSidebar.classList.remove(classes.animated);
        }
      });

      this.toggleSidebarSlider();

      this.container.addEventListener('theme:filter:close', this.collectionSidebarCloseEvent);
    }
  }

  showSidebarCallback() {
    const collectionSidebarSlideOut = this.container.querySelector(selectors.collectionSidebarSlideOut);
    const isScrollLocked = document.documentElement.hasAttribute('data-scroll-locked');

    const isMobileView = window.theme.isMobile();
    this.collectionSidebar.classList.add(classes.animated);

    if (collectionSidebarSlideOut === null) {
      if (!isMobileView && isScrollLocked) {
        this.a11y.removeTrapFocus();
        document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
      }
    }

    if (isMobileView || collectionSidebarSlideOut !== null) {
      if (collectionSidebarSlideOut) {
        this.a11y.trapFocus(this.collectionSidebar, {
          elementToFocus: this.collectionSidebar.querySelector(selectors.collectionSidebarCloseButton),
        });
      }
      document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
    }
  }

  hideSidebar() {
    const collectionSidebarSlideOut = this.container.querySelector(selectors.collectionSidebarSlideOut);
    const isScrollLocked = document.documentElement.hasAttribute('data-scroll-locked');

    this.groupTagsButton.setAttribute('aria-expanded', 'false');
    this.collectionSidebar.classList.remove(classes.expanded);

    if (collectionSidebarSlideOut) {
      this.a11y.removeTrapFocus();
    }

    if (isScrollLocked) {
      document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
    }
  }

  toggleSidebarSlider() {
    if (window.theme.isMobile()) {
      this.hideSidebar();
    } else if (this.collectionSidebar.classList.contains(classes.expanded)) {
      this.showSidebarCallback();
    }
  }

  collectionSidebarClose(evt) {
    evt.preventDefault();
    this.hideSidebar();
    if (document.body.classList.contains(classes.focused) && this.groupTagsButton) {
      this.groupTagsButton.focus();
    }
  }

  groupTagsButtonClick() {
    const isScrollLocked = document.documentElement.hasAttribute('data-scroll-locked');

    if (isScrollLocked) {
      document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
    }
  }

  onUnload() {
    if (this.groupTagsButton !== null) {
      document.removeEventListener('theme:resize:width', this.sidebarResizeEvent);
      this.groupTagsButton.removeEventListener('click', this.groupTagsButtonClickEvent);
    }

    if (this.collectionSidebar) {
      this.container.removeEventListener('theme:filter:close', this.collectionSidebarCloseEvent);
    }
  }
}

const collectionSection = {
  onLoad() {
    sections[this.id] = new Collection(this);
  },
  onUnload() {
    sections[this.id].onUnload();
  },
};

register('collection', [collectionSection]);
