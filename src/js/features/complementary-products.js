import QuickViewPopup from './quick-view-popup';

const selectors = {
  complementaryProducts: '[data-complementary-products]',
  buttonQuickView: '[data-button-quick-view]',
};

const attributes = {
  url: 'data-url',
};

class ComplementaryProducts extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);

      if (this.hasAttribute(attributes.url) && this.getAttribute(attributes.url) !== '') {
        fetch(this.getAttribute(attributes.url))
          .then((response) => response.text())
          .then((text) => {
            const html = document.createElement('div');
            html.innerHTML = text;
            const recommendations = html.querySelector(selectors.complementaryProducts);

            if (recommendations && recommendations.innerHTML.trim().length) {
              this.innerHTML = recommendations.innerHTML;
            }

            if (html.querySelector(selectors.buttonQuickView)) {
              new QuickViewPopup(this);
            }
          })
          .catch((e) => {
            console.error(e);
          });
      }
    };

    new IntersectionObserver(handleIntersection.bind(this), {rootMargin: '0px 0px 400px 0px'}).observe(this);
  }
}

export {ComplementaryProducts};
