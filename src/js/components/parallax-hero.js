import {Rellax} from '../rellax';

if (!customElements.get('parallax-hero')) {
  customElements.define(
    'parallax-hero',
    class ParallaxHero extends HTMLElement {
      defaultOptions = {
        center: true,
        round: true,
        frame: this,
      };

      constructor() {
        super();

        this.rellax = null;
        this.refreshEvent = window.theme.debounce(() => {
          this.refresh();
        }, 500);
      }

      connectedCallback() {
        const imageSelector = this.querySelector('[data-parallax-img]');
        if (!imageSelector) return;

        this.rellax = new Rellax(imageSelector, this.defaultOptions);

        document.addEventListener('theme:resize', this.refreshEvent);

        customElements.whenDefined('pre-mix-and-match').then(this.refreshEvent);
      }

      refresh() {
        this.rellax?.refresh();
      }

      disconnectedCallback() {
        this.rellax?.destroy();
        this.rellax = null;
        document.removeEventListener('theme:resize', this.refreshEvent);
      }
    }
  );
}
