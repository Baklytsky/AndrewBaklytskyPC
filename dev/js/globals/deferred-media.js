const selectors = {
  deferredMediaButton: '[data-deferred-media-button]',
  media: 'video, model-viewer, iframe',
  youtube: '[data-host="youtube"]',
  vimeo: '[data-host="vimeo"]',
  productGridItem: '[data-grid-item]',
  section: '.shopify-section',
  template: 'template',
  video: 'video',
  productModel: 'product-model',
};

const attributes = {
  loaded: 'loaded',
  autoplay: 'autoplay',
};

export default class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector(selectors.deferredMediaButton);
    poster?.addEventListener('click', this.loadContent.bind(this));
    this.section = this.closest(selectors.section);
    this.productGridItem = this.closest(selectors.productGridItem);
    this.hovered = false;

    this.mouseEnterEvent = () => this.mouseEnterActions();
    this.mouseLeaveEvent = () => this.mouseLeaveActions();
  }

  connectedCallback() {
    if (this.productGridItem) {
      this.section.addEventListener('mouseover', this.mouseOverEvent, {once: true});

      this.addEventListener('mouseenter', this.mouseEnterEvent);

      this.addEventListener('mouseleave', this.mouseLeaveEvent);
    }
  }

  disconnectedCallback() {
    if (this.productGridItem) {
      this.section.removeEventListener('mouseover', this.mouseOverEvent, {once: true});

      this.removeEventListener('mouseenter', this.mouseEnterEvent);

      this.removeEventListener('mouseleave', this.mouseLeaveEvent);
    }
  }

  mouseEnterActions() {
    this.hovered = true;

    this.videoActions();

    if (!this.getAttribute(attributes.loaded)) {
      this.loadContent();
    }
  }

  mouseLeaveActions() {
    this.hovered = false;

    this.videoActions();
  }

  videoActions() {
    if (this.getAttribute(attributes.loaded)) {
      const youtube = this.querySelector(selectors.youtube);
      const vimeo = this.querySelector(selectors.vimeo);
      const mediaExternal = youtube || vimeo;
      const mediaNative = this.querySelector(selectors.video);
      if (mediaExternal) {
        let action = this.hovered ? 'playVideo' : 'pauseVideo';
        let string = `{"event":"command","func":"${action}","args":""}`;

        if (vimeo) {
          action = this.hovered ? 'play' : 'pause';
          string = `{"method":"${action}"}`;
        }

        mediaExternal.contentWindow.postMessage(string, '*');

        mediaExternal.addEventListener('load', (e) => {
          // Call videoActions() again when iframe is loaded to prevent autoplay being triggered if it loads after the "mouseleave" event
          this.videoActions();
        });
      } else if (mediaNative) {
        if (this.hovered) {
          mediaNative.play();
        } else {
          mediaNative.pause();
        }
      }
    }
  }

  loadContent(focus = true) {
    this.pauseAllMedia();

    if (!this.getAttribute(attributes.loaded)) {
      const content = document.createElement('div');
      const templateContent = this.querySelector(selectors.template).content.firstElementChild.cloneNode(true);
      content.appendChild(templateContent);
      this.setAttribute(attributes.loaded, true);

      const mediaElement = this.appendChild(content.querySelector(selectors.media));
      if (focus) mediaElement.focus();
      if (mediaElement.nodeName == 'VIDEO' && mediaElement.getAttribute(attributes.autoplay)) {
        // Force autoplay on Safari browsers
        mediaElement.play();
      }

      if (this.productGridItem) {
        this.videoActions();
      }
    }
  }

  pauseAllMedia() {
    document.querySelectorAll(selectors.youtube).forEach((video) => {
      video.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    });
    document.querySelectorAll(selectors.vimeo).forEach((video) => {
      video.contentWindow.postMessage('{"method":"pause"}', '*');
    });
    document.querySelectorAll(selectors.video).forEach((video) => video.pause());
    document.querySelectorAll(selectors.productModel).forEach((model) => {
      if (model.modelViewerUI) model.modelViewerUI.pause();
    });
  }
}
