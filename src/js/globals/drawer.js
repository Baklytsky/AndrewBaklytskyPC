import throttle from '../util/throttle';
import {Collapsible} from '../features/collapsible';
import {Tabs} from '../features/tabs';
import {a11y} from '../vendor/theme-scripts/theme-a11y';

const selectors = {
  drawer: '[data-drawer]',
  drawerToggle: '[data-drawer-toggle]',
  scroller: '[data-scroll]',
  quickviewItem: '[data-quick-view-item]',
  tabsLink: '[data-tabs-link]',
};
const classes = {
  open: 'is-open',
  drawerOpen: 'js-drawer-open',
  contentVisibilityHidden: 'cv-h',
  header: 'site-header',
};
const attributes = {
  ariaExpanded: 'aria-expanded',
  ariaControls: 'aria-controls',
};

let sections = {};

class Drawer {
  constructor(container) {
    this.container = container;
    this.drawers = this.container.querySelectorAll(selectors.drawer);
    this.drawerToggleButtons = this.container.querySelectorAll(selectors.drawerToggle);
    this.a11y = a11y;

    this.drawerToggleEvent = throttle((event) => {
      this.toggle(event);
    }, 150);

    this.keyPressCloseEvent = throttle((event) => {
      if (event.code === theme.keyboardKeys.ESCAPE) {
        this.close(event);
      }
    }, 150);

    // Define drawer close event
    this.drawerCloseEvent = (event) => {
      const activeDrawer = document.querySelector(`${selectors.drawer}.${classes.open}`);
      let isDrawerToggle = false;

      if (!activeDrawer) {
        return;
      }

      if (event.type === 'click') {
        isDrawerToggle = event.target.matches(selectors.drawerToggle);
      }
      const isDrawerChild = activeDrawer ? activeDrawer.contains(event.target) : false;
      const quickviewItem = activeDrawer.closest(selectors.quickviewItem);
      const isQuickviewChild = quickviewItem ? quickviewItem.contains(event.target) : false;

      if (!isDrawerToggle && !isDrawerChild && !isQuickviewChild) {
        this.close();
      }
    };

    this.initListeners();
  }

  initListeners() {
    // Toggle event for each drawer button
    this.drawerToggleButtons.forEach((button) => {
      button.addEventListener('click', this.drawerToggleEvent);
    });

    // Close drawers if escape key pressed
    this.drawers.forEach((drawer) => {
      drawer.addEventListener('keyup', this.keyPressCloseEvent);

      // Init collapsible mobile dropdowns
      this.collapsible = new Collapsible(drawer);
      this.tabs = new Tabs(drawer);
    });

    // Close drawers on click outside
    document.addEventListener('click', this.drawerCloseEvent);

    // Close drawers on closing event
    document.addEventListener('theme:drawer:closing', this.drawerCloseEvent);
  }

  toggle(e) {
    e.preventDefault();
    const drawer = document.querySelector(`#${e.target.getAttribute(attributes.ariaControls)}`);
    if (!drawer) {
      return;
    }

    const isDrawerOpen = drawer.classList.contains(classes.open);

    if (isDrawerOpen) {
      this.close();
    } else {
      this.open(e);
    }
  }

  open(e) {
    const drawerOpenButton = e.target;
    const drawer = document.querySelector(`#${e.target.getAttribute(attributes.ariaControls)}`);

    if (!drawer) {
      return;
    }
    const drawerScroller = drawer.querySelector(selectors.scroller) || drawer;

    // Disable page scroll right away
    document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: drawerScroller}));
    document.dispatchEvent(new CustomEvent('theme:drawer:open'), {bubbles: true});
    document.body.classList.add(classes.drawerOpen);

    drawer.classList.add(classes.open);
    drawer.classList.remove(classes.contentVisibilityHidden);
    drawerOpenButton.setAttribute(attributes.ariaExpanded, true);

    setTimeout(() => {
      this.a11y.state.trigger = drawerOpenButton;
      this.a11y.trapFocus({
        container: drawer,
      });
    });
  }

  close() {
    if (!document.body.classList.contains(classes.drawerOpen)) {
      return;
    }

    const drawer = document.querySelector(`${selectors.drawer}.${classes.open}`);

    this.drawerToggleButtons.forEach((button) => {
      button.setAttribute(attributes.ariaExpanded, false);
    });

    this.a11y.removeTrapFocus({
      container: drawer,
    });

    drawer.classList.remove(classes.open);

    const onDrawerTransitionEnd = (event) => {
      if (event.target !== drawer) return;

      requestAnimationFrame(() => {
        drawer.classList.add(classes.contentVisibilityHidden);
        document.dispatchEvent(new CustomEvent('theme:drawer:close'), {bubbles: true});
        document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
      });

      drawer.removeEventListener('transitionend', onDrawerTransitionEnd);
    };

    drawer.addEventListener('transitionend', onDrawerTransitionEnd);

    document.body.classList.remove(classes.drawerOpen);
  }

  onUnload() {
    // Close drawer
    this.close();

    // Unbind all event listeners for drawers
    this.drawerToggleButtons.forEach((button) => {
      button.removeEventListener('click', this.drawerToggleEvent);
    });
    this.drawers.forEach((drawer) => {
      drawer.removeEventListener('keyup', this.keyPressCloseEvent);
    });
    document.removeEventListener('click', this.drawerCloseEvent);
    document.removeEventListener('theme:drawer:closing', this.drawerCloseEvent);

    if (this.collapsible) {
      this.collapsible.onUnload();
    }

    if (this.tabs) {
      this.tabs.onUnload();
    }
  }
}

const drawer = {
  onLoad() {
    if (this.container.classList.contains(classes.header)) {
      this.container = this.container.parentNode;
    }

    sections[this.id] = new Drawer(this.container);
  },
  onUnload() {
    sections[this.id].onUnload();
  },
};

export {drawer, Drawer};
