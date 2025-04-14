const selectors = {
  shopifySection: '.shopify-section',
  headerDrawer: 'header-drawer',
};

const classes = {
  isOpen: 'is-open',
};

if (!customElements.get('mobile-menu')) {
  customElements.define(
    'mobile-menu',
    class MobileMenu extends HTMLElement {
      constructor() {
        super();
        this.isOpen = false;
        this.bindEditorSelect = this.onSelect.bind(this);
        this.bindEditorDeselect = this.onDeselect.bind(this);
      }

      get drawer() {
        return this.querySelector(selectors.headerDrawer);
      }

      connectedCallback() {
        if (Shopify.designMode) {
          const section = this.closest(selectors.shopifySection);
          section.addEventListener('shopify:section:load', this.bindEditorSelect);
          section.addEventListener('shopify:section:select', this.bindEditorSelect);
          section.addEventListener('shopify:section:deselect', this.bindEditorDeselect);

          this.addEventListener('shopify:block:select', this.bindEditorSelect);
        }
      }

      getMobileMenu(event) {
        return event.target.querySelector('mobile-menu') || event.target.closest('mobile-menu');
      }

      onSelect(event) {
        this.isOpen = this.drawer.classList.contains(classes.isOpen);

        if (!this.getMobileMenu(event) || this.isOpen) return;
        if (typeof this.drawer.showDrawer === 'function') this.drawer.showDrawer();
      }

      onDeselect(event) {
        this.isOpen = this.drawer.classList.contains(classes.isOpen);

        if (!this.getMobileMenu(event) || !this.isOpen) return;
        if (typeof this.drawer.hideDrawer === 'function') this.drawer.hideDrawer();
      }
    }
  );
}
