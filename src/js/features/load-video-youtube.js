import loadScript from '../util/loader';
import throttle from '../util/throttle';

const sections = {};

const selectors = {
  videoIframe: '[data-video-id]',
  videoWrapper: '.video-wrapper',
  youtubeWrapper: '[data-youtube-wrapper]',
};

const attributes = {
  dataSectionId: 'data-section-id',
  dataEnableSound: 'data-enable-sound',
  dataHideOptions: 'data-hide-options',
  dataCheckPlayerVisibility: 'data-check-player-visibility',
  dataVideoId: 'data-video-id',
  dataVideoType: 'data-video-type',
};

const classes = {
  loaded: 'loaded',
};

const players = [];

class LoadVideoYT {
  constructor(container) {
    this.container = container;
    this.player = this.container.querySelector(selectors.videoIframe);

    if (this.player) {
      this.videoOptionsVars = {};
      this.videoID = this.player.getAttribute(attributes.dataVideoId);
      this.videoType = this.player.getAttribute(attributes.dataVideoType);
      if (this.videoType == 'youtube') {
        this.checkPlayerVisibilityFlag = this.player.getAttribute(attributes.dataCheckPlayerVisibility) === 'true';
        this.playerID = this.player.querySelector(selectors.youtubeWrapper) ? this.player.querySelector(selectors.youtubeWrapper).id : this.player.id;
        if (this.player.hasAttribute(selectors.dataHideOptions)) {
          this.videoOptionsVars = {
            cc_load_policy: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            autohide: 0,
            controls: 0,
            branding: 0,
            showinfo: 0,
            rel: 0,
            fs: 0,
            wmode: 'opaque',
          };
        }

        this.init();

        this.container.addEventListener(
          'touchstart',
          function (e) {
            if (e.target.matches(selectors.videoWrapper) || e.target.closest(selectors.videoWrapper)) {
              const playerID = e.target.querySelector(selectors.videoIframe).id;
              players[playerID].playVideo();
            }
          },
          {passive: true}
        );
      }
    }
  }

  init() {
    if (window.isYoutubeAPILoaded) {
      this.loadYoutubePlayer();
    } else {
      // Load Youtube API if not loaded yet
      loadScript({url: 'https://www.youtube.com/iframe_api'}).then(() => this.loadYoutubePlayer());
    }
  }

  loadYoutubePlayer() {
    const defaultYoutubeOptions = {
      height: '720',
      width: '1280',
      playerVars: this.videoOptionsVars,
      events: {
        onReady: (event) => {
          const eventIframe = event.target.getIframe();
          const id = eventIframe.id;
          const enableSound = document.querySelector(`#${id}`).getAttribute(attributes.dataEnableSound) === 'true';

          eventIframe.setAttribute('tabindex', '-1');

          if (enableSound) {
            event.target.unMute();
          } else {
            event.target.mute();
          }
          event.target.playVideo();

          if (this.checkPlayerVisibilityFlag) {
            this.checkPlayerVisibility(id);

            window.addEventListener(
              'scroll',
              throttle(() => {
                this.checkPlayerVisibility(id);
              }, 150)
            );
          }
        },
        onStateChange: (event) => {
          // Loop video if state is ended
          if (event.data == 0) {
            event.target.playVideo();
          }
          if (event.data == 1) {
            // video is playing
            event.target.getIframe().parentElement.classList.add(classes.loaded);
          }
        },
      },
    };

    const currentYoutubeOptions = {...defaultYoutubeOptions};
    currentYoutubeOptions.videoId = this.videoID;
    if (this.videoID.length) {
      YT.ready(() => {
        players[this.playerID] = new YT.Player(this.playerID, currentYoutubeOptions);
      });
    }
    window.isYoutubeAPILoaded = true;
  }

  checkPlayerVisibility(id) {
    let playerID;
    if (typeof id === 'string') {
      playerID = id;
    } else if (id.data != undefined) {
      playerID = id.data.id;
    } else {
      return;
    }

    const playerElement = document.getElementById(playerID + '-container');
    if (!playerElement) {
      return;
    }
    const player = players[playerID];
    const box = playerElement.getBoundingClientRect();
    let isVisible = visibilityHelper.isElementPartiallyVisible(playerElement) || visibilityHelper.isElementTotallyVisible(playerElement);

    // Fix the issue when element height is bigger than the viewport height
    if (box.top < 0 && playerElement.clientHeight + box.top >= 0) {
      isVisible = true;
    }

    if (isVisible && player && typeof player.playVideo === 'function') {
      player.playVideo();
    } else if (!isVisible && player && typeof player.pauseVideo === 'function') {
      player.pauseVideo();
    }
  }

  onUnload() {
    const playerID = 'youtube-' + this.container.getAttribute(attributes.dataSectionId);
    if (!players[playerID]) {
      return;
    }
    players[playerID].destroy();
  }
}

const loadVideoYT = {
  onLoad() {
    sections[this.id] = new LoadVideoYT(this.container);
  },
  onUnload(e) {
    sections[this.id].onUnload(e);
  },
};

export {loadVideoYT, LoadVideoYT};
