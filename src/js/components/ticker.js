if (!customElements.get('ticker-bar')) {
  customElements.define(
    'ticker-bar',

    class Ticker extends HTMLElement {
      constructor() {
        super();

        this.checkWidthEvent = this.checkWidth.bind(this);
        this.settings = {
          speed: 1.63, // 100px going to move for 1.63s
          space: 100, // 100px
        };
      }

      connectedCallback() {
        this.slider = this.closest('swiper-container');
        this.autoplay = this.hasAttribute('autoplay');
        this.scale = this.querySelector('[data-ticker-scale]');
        this.speed = this.hasAttribute('speed') ? this.getAttribute('speed') : this.settings.speed;
        this.scale.classList.remove('ticker--unloaded');

        if (!this.slider) this.checkWidth();

        this.addEventListener('theme:ticker:refresh', this.checkWidthEvent);

        screen.orientation.addEventListener('change', this.checkWidthEvent);
        document.addEventListener('theme:resize:width', this.checkWidthEvent);
      }

      disconnectedCallback() {
        screen.orientation.removeEventListener('change', this.checkWidthEvent);
        document.removeEventListener('theme:resize:width', this.checkWidthEvent);
        this.removeEventListener('theme:ticker:refresh', this.checkWidthEvent);
      }

      checkWidth() {
        this.text = this.querySelector('[data-ticker-text]');
        this.text.classList.remove('ticker--animated');
        this.comparitor && this.comparitor.remove();
        this.comparitor = this.text.cloneNode(true);
        this.comparitor.classList.add('ticker__comparitor');
        this.appendChild(this.comparitor);
        this.removeClones();

        const isOverflowing = this.clientWidth < this.comparitor.clientWidth;
        const limitClones = this.autoplay ? parseInt(theme.windowWidth / this.text.clientWidth) : 2;

        if (isOverflowing || this.autoplay) {
          for (let index = 0; index <= limitClones; index++) {
            const cloneSecond = this.text.cloneNode(true);
            cloneSecond.setAttribute('data-clone', '');
            this.scale.appendChild(cloneSecond);
          }

          const animationTimeFrame = ((this.text.clientWidth / this.settings.space) * Number(this.speed)).toFixed(2);

          this.scale.style.removeProperty('--animation-time');
          this.scale.style.setProperty('--animation-time', `${animationTimeFrame}s`);
          this.scale.style.setProperty('--animation-speed', this.speed);

          this.scale.querySelectorAll('[data-ticker-text]')?.forEach((text) => {
            text.classList.add('ticker--animated');
          });
        }
      }

      removeClones() {
        const clones = this.scale.querySelectorAll('[data-clone]');

        clones.forEach((clone) => {
          clone.remove();
        });
      }
    }
  );
}
