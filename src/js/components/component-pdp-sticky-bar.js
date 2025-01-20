if (!customElements.get('pdp-sticky-bar')) {
  class PdpStickyBar extends HTMLElement {
    constructor() {
      super();
      this.productForm = this.closest('product-form') ||  this.closest('.product-form');
      this.notifyButton = this.querySelector('[data-notify-button]')
      this.hideAttributes = {'tabindex': '-1', 'aria-hidden': 'true'}
      this.showAttributes = {'tabindex': '0', 'aria-hidden': 'false'}

      if (!this.productForm) return

      this.toggleStickyBar()
      window.addEventListener('scroll', ()=> this.toggleStickyBar());

      if (this.notifyButton) this.notifyButton.addEventListener('click', ()=> this.scrollToForm())
    }

    toggleStickyBar () {
      const productFormBottom = this.productForm.getBoundingClientRect().bottom;
      const scrollToBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight;

      (productFormBottom < 0 && !scrollToBottom)
        ? setAttributes(this, this.showAttributes)
        : setAttributes(this, this.hideAttributes)
    }

    scrollToForm() {
      window.scroll({
        top: this.productForm.getBoundingClientRect().top + window.scrollY - 300,
        behavior: 'smooth'
      });
    }
  }

  customElements.define('pdp-sticky-bar', PdpStickyBar);
}
