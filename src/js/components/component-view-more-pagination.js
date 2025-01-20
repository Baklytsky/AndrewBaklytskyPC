class ViewMore extends HTMLElement {
  constructor() {
    super();
    this.container = document.querySelector(`${this.dataset.targetWrapper}`);
    this.url = this.getAttribute('data-next-page-url');

    this.init();
  }

  init() {
    if (!this.container || !this.url) return;

    this.addEventListener('click',  (event) => {
      this.getData(this, event);
    });
  }

  getData() {
    fetch(this.url)
      .then(response => response.text())
      .then((responseText) => {
        const parsedHTML = new DOMParser().parseFromString(responseText, 'text/html');

        this.addProducts(parsedHTML);
        this.changeUrl(parsedHTML);
      });
  }

  showElements() {
    this.elments = this.container.querySelectorAll(`.grid__item`);

    if (this.elments.length > 0) {
      this.elments.forEach((element) => {
        element.classList.remove('visually-hidden');
      })
    }
  }

  addProducts(html) {
    const productCards = html.querySelectorAll('.collection__content-grid-list-item');
    const analyticsCustomElem = html.querySelector('ga-product-list-event');
    let productCardsToRender = Array.from(productCards);
    const firstProductCard = productCardsToRender[0];

    if (analyticsCustomElem && productCardsToRender.length > 0 ){
      firstProductCard.prepend(analyticsCustomElem);
      productCardsToRender[0] = firstProductCard;
    }

    this.showElements();

    productCardsToRender.forEach((element) => {
      this.container.append(element);
    });
  }

  changeUrl(html) {
    const btn = html.querySelector('[data-next-page-url]') || null;

    this.url = btn ? btn.getAttribute('data-next-page-url') :  null;

    if (!this.url) {
      this.setAttribute('aria-hidden', 'true');
      return false;
    }

    this.setAttribute('data-next-page-url', this.url);
  }
}
customElements.define('view-more', ViewMore);
