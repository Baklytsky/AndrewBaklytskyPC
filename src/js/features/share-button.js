const selectors = {
  button: '[data-share-button]',
  tooltip: '[data-share-button-tooltip]',
};

const classes = {
  visible: 'is-visible',
  hiding: 'is-hiding',
};

const sections = {};

class ShareButton {
  constructor(container) {
    this.container = container;
    this.button = this.container.querySelector(selectors.button);
    this.tooltip = this.container.querySelector(selectors.tooltip);
    this.transitionSpeed = 200;
    this.hideTransitionTimeout = 0;
    this.init();
  }

  init() {
    if (this.button) {
      this.button.addEventListener('click', () => {
        let targetUrl = window.location.href;
        if (this.button.dataset.shareLink) {
          targetUrl = this.button.dataset.shareLink;
        }

        if (!this.tooltip.classList.contains(classes.visible)) {
          navigator.clipboard.writeText(targetUrl).then(() => {
            this.tooltip.classList.add(classes.visible);
            setTimeout(() => {
              this.tooltip.classList.add(classes.hiding);
              this.tooltip.classList.remove(classes.visible);

              if (this.hideTransitionTimeout) {
                clearTimeout(this.hideTransitionTimeout);
              }

              this.hideTransitionTimeout = setTimeout(() => {
                this.tooltip.classList.remove(classes.hiding);
              }, this.transitionSpeed);
            }, 1500);
          });
        }
      });
    }
  }
}

const shareButton = {
  onLoad() {
    sections[this.id] = new ShareButton(this.container);
  },
};

export {shareButton};
