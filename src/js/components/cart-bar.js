class CartBar extends HTMLElement {
  constructor() {
    super();

    this.section = this.closest('product-info');
    this.form = this.section.querySelector('[data-product-form]');
    this.formWrapper = (theme.settings.productPageSticky && this.section.querySelector('[data-form-wrapper]')) || this.form;
    this.handleProductAddError = this.handleProductAddError.bind(this);
    this.boundToggleCartBarOnScroll = this.toggleCartBarOnScroll.bind(this);
    this.boundSetCartBarHeight = this.setCartBarHeight.bind(this);
  }

  connectedCallback() {
    this.setCartBarHeight();

    this.addEventListener('click', this.handleClick.bind(this));
    document.addEventListener('theme:scroll', this.boundToggleCartBarOnScroll);
    document.addEventListener('theme:resize', this.boundSetCartBarHeight);
    document.addEventListener('theme:product:add-error', this.handleProductAddError);
  }

  handleClick(event) {
    const addToCartButton = event.target.closest('[data-cart-bar-add-to-cart]');
    if (addToCartButton) {
      event.preventDefault();
      addToCartButton.classList.add('is-loading');
      addToCartButton.setAttribute('disabled', 'disabled');

      this.form.querySelector('[data-add-to-cart]').dispatchEvent(new Event('click', {bubbles: true}));
      return;
    }

    const scrollButton = event.target.closest('[data-cart-bar-scroll]');
    if (scrollButton) {
      event.preventDefault();
      this.scrollToTop();
    }
  }

  handleProductAddError() {
    if (this.querySelector('[data-cart-bar-add-to-cart]')) {
      this.scrollToTop();
    }
  }

  scrollToTop() {
    const productOptions = this.section.querySelector('variant-selects');
    const scrollTarget = !theme.isMobile ? this.section : productOptions ? productOptions : this.form;
    const scrollTargetTop = scrollTarget.getBoundingClientRect().top;

    window.theme.scrollTo(!theme.isMobile ? scrollTargetTop : scrollTargetTop - 10);
  }

  toggleCartBarOnScroll() {
    const scrolled = window.scrollY;

    if (this.formWrapper) {
      const formOffset = this.formWrapper.offsetTop;
      const formHeight = this.formWrapper.offsetHeight;
      const checkPosition = scrolled > formOffset + formHeight;

      this.classList.toggle('is-visible', checkPosition);
    }
  }

  setCartBarHeight() {
    const cartBarHeight = this.offsetHeight;

    document.documentElement.style.setProperty('--cart-bar-height', `${cartBarHeight}px`);
  }

  disconnectedCallback() {
    document.removeEventListener('theme:product:add-error', this.handleProductAddError);
    document.removeEventListener('theme:scroll', this.boundToggleCartBarOnScroll);
    document.removeEventListener('theme:resize', this.boundSetCartBarHeight);
  }
}

if (!customElements.get('cart-bar')) {
  customElements.define('cart-bar', CartBar);
}
