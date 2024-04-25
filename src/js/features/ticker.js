import debounce from '../util/debounce';

const selectors = {
  frame: '[data-ticker-frame]',
  scale: '[data-ticker-scale]',
  text: '[data-ticker-text]',
  clone: 'data-clone',
};

const attributes = {
  speed: 'data-marquee-speed',
};

const classes = {
  animationClass: 'ticker--animated',
  unloadedClass: 'ticker--unloaded',
  comparitorClass: 'ticker__comparitor',
};

const settings = {
  moveTime: 1.63, // 100px going to move for 1.63s
  space: 100, // 100px
};

const sections = {};

class Ticker {
  constructor(el, stopClone = false) {
    this.frame = el;
    this.stopClone = stopClone;
    this.scale = this.frame.querySelector(selectors.scale);
    this.text = this.frame.querySelector(selectors.text);

    this.comparitor = this.text.cloneNode(true);
    this.comparitor.classList.add(classes.comparitorClass);
    this.frame.appendChild(this.comparitor);
    this.scale.classList.remove(classes.unloadedClass);
    this.resizeEvent = debounce(() => this.checkWidth(), 100);
    this.listen();
  }

  listen() {
    document.addEventListener('theme:resize:width', this.resizeEvent);
    this.checkWidth();
  }

  checkWidth() {
    const padding = window.getComputedStyle(this.frame).paddingLeft.replace('px', '') * 2;

    if (this.frame.clientWidth - padding < this.comparitor.clientWidth || this.stopClone) {
      if (this.scale.childElementCount === 1) {
        this.text.classList.add(classes.animationClass);
        this.clone = this.text.cloneNode(true);
        this.clone.setAttribute(selectors.clone, '');
        this.scale.appendChild(this.clone);

        if (this.stopClone) {
          for (let index = 0; index < 10; index++) {
            const cloneSecond = this.text.cloneNode(true);
            cloneSecond.setAttribute(selectors.clone, '');
            this.scale.appendChild(cloneSecond);
          }
        }

        let frameSpeed = this.frame.getAttribute(attributes.speed);
        if (frameSpeed === null) {
          frameSpeed = 100;
        }
        const speed = settings.moveTime * (100 / parseInt(frameSpeed, 10));
        const animationTimeFrame = (this.text.clientWidth / settings.space) * speed;

        this.scale.style.setProperty('--animation-time', `${animationTimeFrame}s`);
      }
    } else {
      this.text.classList.add(classes.animationClass);
      let clone = this.scale.querySelector(`[${selectors.clone}]`);
      if (clone) {
        this.scale.removeChild(clone);
      }
      this.text.classList.remove(classes.animationClass);
    }
  }

  unload() {
    document.removeEventListener('theme:resize:width', this.resizeEvent);
  }
}

const ticker = {
  onLoad() {
    sections[this.id] = [];
    const el = this.container.querySelectorAll(selectors.frame);
    el.forEach((el) => {
      sections[this.id].push(new Ticker(el));
    });
  },
  onUnload() {
    sections[this.id].forEach((el) => {
      if (typeof el.unload === 'function') {
        el.unload();
      }
    });
  },
};

export {ticker, Ticker};
