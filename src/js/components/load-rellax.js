import loadScript from '../util/loader';

window.theme.LoadRellax = window.theme.LoadRellax || null;

class LoadRellax {
  constructor(frameElement, selector, options = '') {
    const defaultOptions = {
      center: true,
      round: true,
      frame: frameElement,
    };
    this.options = options !== '' ? options : defaultOptions;
    this.selector = selector;

    loadScript({url: window.theme.assets.rellax})
      .then(() => this.init())
      .catch((e) => console.error(e));
  }

  init() {
    const Rellax = window.themeRellax?.Rellax || window.Rellax;

    this.rellaxInstance = new Rellax(this.selector, this.options);
  }

  refresh() {
    if (this.rellaxInstance && typeof this.rellaxInstance.refresh === 'function') {
      this.rellaxInstance.refresh();
    } else {
      console.warn('Rellax instance is not initialized yet.');
    }
  }
}

window.theme.LoadRellax = LoadRellax;
