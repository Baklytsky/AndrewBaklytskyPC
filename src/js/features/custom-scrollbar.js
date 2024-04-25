const selectors = {
  scrollbar: '[data-custom-scrollbar]',
  scrollbarItems: '[data-custom-scrollbar-items]',
  scrollbarThumb: '[data-custom-scrollbar-thumb]',
  current: '.current',
};

class CustomScrollbar {
  constructor(container) {
    this.container = container;
    this.scrollbarItems = container.querySelector(selectors.scrollbarItems);
    this.scrollbar = container.querySelector(selectors.scrollbar);
    this.scrollbarThumb = container.querySelector(selectors.scrollbarThumb);
    this.trackWidth = 0;
    this.calcScrollbarEvent = () => this.calculateScrollbar();
    this.onScrollbarChangeEvent = (e) => this.onScrollbarChange(e);

    if (this.scrollbar && this.scrollbarItems) {
      this.events();
      this.calculateScrollbar();
      if (this.scrollbarItems.children.length) {
        this.calculateTrack(this.scrollbarItems.querySelector(selectors.current));
      }
    }
  }

  calculateTrack(element) {
    if (!element) {
      this.scrollbar.style.setProperty('--thumb-scale', 0);
      this.scrollbar.style.setProperty('--thumb-position', '0px');
      return;
    }

    const thumbScale = element.clientWidth / this.scrollbarThumb.parentElement.clientWidth;
    const thumbPosition = element.offsetLeft / this.scrollbarThumb.parentElement.clientWidth;
    this.scrollbar.style.setProperty('--thumb-scale', thumbScale);
    this.scrollbar.style.setProperty('--thumb-position', `${this.trackWidth * thumbPosition}px`);
  }

  calculateScrollbar() {
    if (this.scrollbarItems.children.length) {
      const childrenArr = [...this.scrollbarItems.children];
      this.trackWidth = 0;

      childrenArr.forEach((element) => {
        this.trackWidth += element.getBoundingClientRect().width + parseInt(window.getComputedStyle(element).marginRight);
      });
      this.scrollbar.style.setProperty('--track-width', `${this.trackWidth}px`);
    }
  }

  onScrollbarChange(e) {
    if (e && e.detail && e.detail.element && this.container.contains(e.detail.element)) {
      this.calculateTrack(e.detail.element);
    }
  }

  events() {
    document.addEventListener('theme:resize:width', this.calcScrollbarEvent);
    document.addEventListener('theme:custom-scrollbar:change', this.onScrollbarChangeEvent);
  }

  unload() {
    document.removeEventListener('theme:resize:width', this.calcScrollbarEvent);
    document.removeEventListener('theme:custom-scrollbar:change', this.onScrollbarChangeEvent);
  }
}

export default CustomScrollbar;
