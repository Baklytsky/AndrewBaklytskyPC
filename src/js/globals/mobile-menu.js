if (!customElements.get('mobile-menu')) {
  customElements.define(
    'mobile-menu',
    class MobileMenu extends HTMLElement {
      constructor() {
        super();

        this.showDrawerOnSelect = this.showDrawerOnSelect.bind(this);
        this.hideDrawerOnDeselect = this.hideDrawerOnDeselect.bind(this);
      }

      connectedCallback() {
        document.addEventListener('shopify:block:select', this.showDrawerOnSelect);
        document.addEventListener('shopify:section:load', this.showDrawerOnSelect);
        document.addEventListener('shopify:section:select', this.showDrawerOnSelect);
        document.addEventListener('shopify:section:deselect', this.hideDrawerOnDeselect);
      }

      disconnectedCallback() {
        document.removeEventListener('shopify:block:select', this.showDrawerOnSelect);
        document.removeEventListener('shopify:section:load', this.showDrawerOnSelect);
        document.removeEventListener('shopify:section:select', this.showDrawerOnSelect);
        document.removeEventListener('shopify:section:deselect', this.hideDrawerOnDeselect);
      }

      showDrawerOnSelect(e) {
        const mobileMenu = e.target.querySelector('mobile-menu') || e.target.closest('mobile-menu');

        if (!mobileMenu) return;

        mobileMenu.querySelector('header-drawer')?.dispatchEvent(new CustomEvent('theme:drawer:open', {bubbles: true}));
      }

      hideDrawerOnDeselect(e) {
        const mobileMenu = e.target.querySelector('mobile-menu') || e.target.closest('mobile-menu');

        if (!mobileMenu) return;

        mobileMenu.querySelector('header-drawer')?.dispatchEvent(new CustomEvent('theme:drawer:close', {bubbles: true}));
      }
    }
  );
}
