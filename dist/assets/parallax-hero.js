(function () {
  'use strict';

  if (!customElements.get('parallax-hero')) {
    customElements.define(
      'parallax-hero',
      class ParallaxHero extends HTMLElement {
        constructor() {
          super();
        }

        connectedCallback() {
          const imageSelector = this.querySelector('[data-parallax-img]');
          const frameElement = this;

          if (!imageSelector) return;

          this.rellax = new window.theme.LoadRellax(frameElement, imageSelector);

          window.addEventListener('load', () => {
            if (typeof this.rellax.refresh === 'function') {
              this.rellax.refresh();
            }
          });
        }

        disconnectedCallback() {
          if (typeof this.rellax.refresh === 'function') {
            this.rellax.refresh();
          }
        }
      }
    );
  }

})();
//# sourceMappingURL=parallax-hero.js.map
