import * as a11y from '../vendor/theme-scripts/theme-a11y';

const selectors = {
  drawerInner: '[data-drawer-inner]',
  drawerClose: '[data-drawer-close]',
  underlay: '[data-drawer-underlay]',
  stagger: '[data-stagger-animation]',
  wrapper: '[data-header-wrapper]',
  focusable: 'button, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
};

const classes = {
  animated: 'drawer--animated',
  open: 'is-open',
  closing: 'is-closing',
  isFocused: 'is-focused',
  headerStuck: 'js__header__stuck',
};

class HeaderDrawer extends HTMLElement {
  constructor() {
    super();

    this.isAnimating = false;
    this.drawer = this;
    this.drawerInner = this.querySelector(selectors.drawerInner);
    this.underlay = this.querySelector(selectors.underlay);
    this.triggerButton = null;

    this.staggers = this.querySelectorAll(selectors.stagger);
    this.showDrawer = this.showDrawer.bind(this);
    this.hideDrawer = this.hideDrawer.bind(this);

    this.connectDrawer();
    this.closers();
  }

  connectDrawer() {
    this.addEventListener('theme:drawer:toggle', (e) => {
      this.triggerButton = e.detail?.button;

      if (this.classList.contains(classes.open)) {
        this.dispatchEvent(
          new CustomEvent('theme:drawer:close', {
            bubbles: true,
          })
        );
      } else {
        this.dispatchEvent(
          new CustomEvent('theme:drawer:open', {
            bubbles: true,
          })
        );
      }
    });

    this.addEventListener('theme:drawer:close', this.hideDrawer);
    this.addEventListener('theme:drawer:open', this.showDrawer);

    document.addEventListener('theme:cart-drawer:open', this.hideDrawer);
  }

  closers() {
    this.querySelectorAll(selectors.drawerClose)?.forEach((button) => {
      button.addEventListener('click', () => {
        this.hideDrawer();
      });
    });

    document.addEventListener('keyup', (event) => {
      if (event.code !== 'Escape') {
        return;
      }

      this.hideDrawer();
    });

    this.underlay.addEventListener('click', () => {
      this.hideDrawer();
    });
  }

  showDrawer() {
    if (this.isAnimating) return;

    this.isAnimating = true;

    this.triggerButton?.setAttribute('aria-expanded', true);
    this.classList.add(classes.open, classes.animated);

    document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));

    if (this.drawerInner) {
      a11y.removeTrapFocus();

      window.theme.waitForAnimationEnd(this.drawerInner).then(() => {
        this.isAnimating = false;

        a11y.trapFocus(this.drawerInner, {
          elementToFocus: this.querySelector(selectors.focusable),
        });
      });
    }
  }

  hideDrawer() {
    if (this.isAnimating || !this.classList.contains(classes.open)) return;

    this.isAnimating = true;

    this.classList.add(classes.closing);
    this.classList.remove(classes.open);

    a11y.removeTrapFocus();

    if (this.triggerButton) {
      this.triggerButton.setAttribute('aria-expanded', false);

      if (document.body.classList.contains(classes.isFocused)) {
        this.triggerButton.focus();
      }
    }

    document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));

    window.theme.waitForAnimationEnd(this.drawerInner).then(() => {
      this.classList.remove(classes.closing, classes.animated);

      this.isAnimating = false;

      // Reset menu items state after drawer hiding animation completes
      document.dispatchEvent(new CustomEvent('theme:sliderule:close', {bubbles: false}));
    });
  }

  disconnectedCallback() {
    document.removeEventListener('theme:cart-drawer:open', this.hideDrawer);
  }
}

export {HeaderDrawer};
