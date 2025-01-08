if (!customElements.get('viewport-action')) {
  class ViewportAction extends HTMLElement {
    constructor() {
      super();
      this.config = this.dataset.config ? JSON.parse(this.dataset.config) : false;
      if (!this.config || !this.config.enabled) return
      this.init();
    }

    init() {
      const threshold = this.config['threshold'] ? this.config['threshold'] : .5;
      const classToggle = this.config['classToggle'] ? this.config['classToggle'] : 'is-inViewport';
      const observer = new IntersectionObserver(onIntersection, {
        root: null,
        threshold: threshold
      })
      function onIntersection(entries, opts){
        entries.forEach(entry => entry.target.classList.toggle(classToggle, entry.isIntersecting))
      }
      observer.observe(this)
    }
  }

  customElements.define('viewport-action', ViewportAction);
}