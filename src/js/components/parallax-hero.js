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

        const Rellax = window.themeRellax?.Rellax || window.Rellax;
        this.rellax = new Rellax(imageSelector, this.defaultOptions);

        window.addEventListener('resize', this.refreshEvent);
      }

      refresh() {
        this.rellax.refresh();
      }

      disconnectedCallback() {
        this.rellax.destroy();
        window.removeEventListener('resize', this.refreshEvent);
      }
    }
  );
}
