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
        this.autoplay = this.hasAttribute('autoplay');
        this.scale = this.querySelector('[data-ticker-scale]');
        this.text = this.querySelector('[data-ticker-text]');
        this.speed = this.hasAttribute('speed') ? this.getAttribute('speed') : this.settings.speed;
        this.comparitor = this.text.cloneNode(true);
        this.comparitor.classList.add('ticker__comparitor');

        // Append the comparitor only if it doesn't exist
        // This prevents duplication when the component is re-initialized
        !this.querySelector('.ticker__comparitor') && this.appendChild(this.comparitor);
        this.scale.classList.remove('ticker--unloaded');

        this.checkWidth();
        this.addEventListener(
          'theme:ticker:refresh',
          window.theme.debounce(() => this.checkWidthEvent(), 50)
        );

        screen.orientation.addEventListener('change', this.checkWidthEvent);
        document.addEventListener('theme:resize:width', this.checkWidthEvent);
      }

      disconnectedCallback() {
        document.removeEventListener('theme:resize:width', this.checkWidthEvent);
      }

      checkWidth() {
        this.text = this.querySelector('[data-ticker-text]');

        const padding = window.getComputedStyle(this).paddingLeft.replace('px', '') * 2;
        const isOverflowing = this.clientWidth - padding < this.comparitor.clientWidth;
        const limitClones = this.autoplay ? parseInt((window.innerWidth - padding) / this.text.clientWidth) : 2;

        if (isOverflowing || this.autoplay) {
          this.text.classList.remove('ticker--animated');

          this.removeClones();

          if (this.autoplay || isOverflowing) {
            for (let index = 0; index <= limitClones; index++) {
              const cloneSecond = this.text.cloneNode(true);
              cloneSecond.setAttribute('data-clone', '');
              this.scale.appendChild(cloneSecond);
            }
          }

          const animationTimeFrame = ((this.text.clientWidth / this.settings.space) * Number(this.speed)).toFixed(2);

          this.scale.style.removeProperty('--animation-time');
          this.scale.style.setProperty('--animation-time', `${animationTimeFrame}s`);
          this.scale.style.setProperty('--animation-speed', this.speed);

          this.scale.querySelectorAll('[data-ticker-text]')?.forEach((text) => {
            text.classList.add('ticker--animated');
          });
        } else {
          this.text.classList.add('ticker--animated');
          this.removeClones();

          this.text.classList.remove('ticker--animated');
        }
      }

      removeClones() {
        const clones = this.scale.querySelectorAll('[data-clone]');

        clones.forEach((clone) => {
          clone.parentNode.removeChild(clone);
        });
      }
    }
  );
}
