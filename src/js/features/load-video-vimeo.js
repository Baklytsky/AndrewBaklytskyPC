const sections = {};

const selectors = {
  videoIframe: '[data-video-id]',
};

const classes = {
  loaded: 'loaded',
};

const attributes = {
  dataEnableSound: 'data-enable-sound',
  dataEnableBackground: 'data-enable-background',
  dataEnableAutoplay: 'data-enable-autoplay',
  dataEnableLoop: 'data-enable-loop',
  dataVideoId: 'data-video-id',
  dataVideoType: 'data-video-type',
};

class LoadVideoVimeo {
  constructor(container) {
    this.container = container;
    this.player = this.container.querySelector(selectors.videoIframe);

    if (this.player) {
      this.videoID = this.player.getAttribute(attributes.dataVideoId);
      this.videoType = this.player.getAttribute(attributes.dataVideoType);
      this.enableBackground = this.player.getAttribute(attributes.dataEnableBackground) === 'true';
      this.disableSound = this.player.getAttribute(attributes.dataEnableSound) === 'false';
      this.enableAutoplay = this.player.getAttribute(attributes.dataEnableAutoplay) !== 'false';
      this.enableLoop = this.player.getAttribute(attributes.dataEnableLoop) !== 'false';

      if (this.videoType == 'vimeo') {
        this.init();
      }
    }
  }

  init() {
    this.loadVimeoPlayer();
  }

  loadVimeoPlayer() {
    const oembedUrl = 'https://vimeo.com/api/oembed.json';
    const vimeoUrl = 'https://vimeo.com/' + this.videoID;
    let paramsString = '';
    const state = this.player;

    const params = {
      url: vimeoUrl,
      background: this.enableBackground,
      muted: this.disableSound,
      autoplay: this.enableAutoplay,
      loop: this.enableLoop,
    };

    for (let key in params) {
      paramsString += encodeURIComponent(key) + '=' + encodeURIComponent(params[key]) + '&';
    }

    fetch(`${oembedUrl}?${paramsString}`)
      .then((response) => response.json())
      .then(function (data) {
        state.innerHTML = data.html;

        setTimeout(function () {
          state.parentElement.classList.add(classes.loaded);
        }, 1000);
      })
      .catch(function () {
        console.log('error');
      });
  }
}

const loadVideoVimeo = {
  onLoad() {
    sections[this.id] = new LoadVideoVimeo(this.container);
  },
};

export {loadVideoVimeo, LoadVideoVimeo};
