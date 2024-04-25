import loadScript from '../util/loader';

const hosts = {
  html5: 'html5',
  youtube: 'youtube',
  vimeo: 'vimeo',
};

const selectors = {
  deferredMedia: '[data-deferred-media]',
  deferredMediaButton: '[data-deferred-media-button]',
  productMediaWrapper: '[data-product-single-media-wrapper]',
  mediaContainer: '[data-video]',
  mediaHidden: '.media--hidden',
};

const classes = {
  mediaHidden: 'media--hidden',
};

const attributes = {
  loaded: 'loaded',
  sectionId: 'data-section-id',
  dataAutoplayVideo: 'data-autoplay-video',
  mediaId: 'data-media-id',
};

class ProductVideo {
  constructor(container) {
    this.container = container;
    this.id = this.container.getAttribute(attributes.sectionId);
    this.autoplayVideo = this.container.getAttribute(attributes.dataAutoplayVideo) === 'true';
    this.players = {};
    this.pauseContainerMedia = (mediaId, container = this.container) => this.pauseOtherMedia(mediaId, container);
    this.init();
  }

  init() {
    const mediaContainers = this.container.querySelectorAll(selectors.mediaContainer);

    mediaContainers.forEach((mediaContainer) => {
      const deferredMediaButton = mediaContainer.querySelector(selectors.deferredMediaButton);

      if (deferredMediaButton) {
        deferredMediaButton.addEventListener('click', this.loadContent.bind(this, mediaContainer));
      }

      if (this.autoplayVideo) {
        this.loadContent(mediaContainer);
      }
    });
  }

  loadContent(mediaContainer) {
    if (mediaContainer.querySelector(selectors.deferredMedia).getAttribute(attributes.loaded)) {
      return;
    }

    const content = document.createElement('div');
    content.appendChild(mediaContainer.querySelector('template').content.firstElementChild.cloneNode(true));
    const mediaId = mediaContainer.dataset.mediaId;
    const element = content.querySelector('video, iframe');
    const host = this.hostFromVideoElement(element);
    const deferredMedia = mediaContainer.querySelector(selectors.deferredMedia);
    deferredMedia.appendChild(element);
    deferredMedia.setAttribute('loaded', true);

    this.players[mediaId] = {
      mediaId: mediaId,
      sectionId: this.id,
      container: mediaContainer,
      element: element,
      host: host,
      ready: () => {
        this.createPlayer(mediaId);
      },
    };

    const video = this.players[mediaId];

    switch (video.host) {
      case hosts.html5:
        this.loadVideo(video, hosts.html5);
        break;
      case hosts.vimeo:
        if (window.isVimeoAPILoaded) {
          this.loadVideo(video, hosts.vimeo);
        } else {
          loadScript({url: 'https://player.vimeo.com/api/player.js'}).then(() => this.loadVideo(video, hosts.vimeo));
        }
        break;
      case hosts.youtube:
        if (window.isYoutubeAPILoaded) {
          this.loadVideo(video, hosts.youtube);
        } else {
          loadScript({url: 'https://www.youtube.com/iframe_api'}).then(() => this.loadVideo(video, hosts.youtube));
        }
        break;
    }
  }

  hostFromVideoElement(video) {
    if (video.tagName === 'VIDEO') {
      return hosts.html5;
    }

    if (video.tagName === 'IFRAME') {
      if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.?be)\/.+$/.test(video.src)) {
        return hosts.youtube;
      } else if (video.src.includes('vimeo.com')) {
        return hosts.vimeo;
      }
    }

    return null;
  }

  loadVideo(video, host) {
    if (video.host === host) {
      video.ready();
    }
  }

  createPlayer(mediaId) {
    const video = this.players[mediaId];

    switch (video.host) {
      case hosts.html5:
        video.element.addEventListener('play', () => {
          video.container.dispatchEvent(new CustomEvent('theme:media:play'), {bubbles: true});
        });

        video.element.addEventListener('pause', () => {
          video.container.dispatchEvent(new CustomEvent('theme:media:pause'), {bubbles: true});
        });

        if (this.autoplayVideo) {
          this.observeVideo(video, mediaId);
        }

        break;
      case hosts.vimeo:
        video.player = new Vimeo.Player(video.element);
        video.player.play(); // Force video play on iOS
        video.container.dispatchEvent(new CustomEvent('theme:media:play'), {bubbles: true});

        window.isVimeoAPILoaded = true;

        video.player.on('play', () => {
          video.container.dispatchEvent(new CustomEvent('theme:media:play'), {bubbles: true});
        });

        video.player.on('pause', () => {
          video.container.dispatchEvent(new CustomEvent('theme:media:pause'), {bubbles: true});
        });

        if (this.autoplayVideo) {
          this.observeVideo(video, mediaId);
        }

        break;
      case hosts.youtube:
        if (video.host == hosts.youtube && video.player) {
          return;
        }

        YT.ready(() => {
          const videoId = video.container.dataset.videoId;

          video.player = new YT.Player(video.element, {
            videoId: videoId,
            events: {
              onReady: (event) => {
                event.target.playVideo(); // Force video play on iOS
                video.container.dispatchEvent(new CustomEvent('theme:media:play'), {bubbles: true});
              },
              onStateChange: (event) => {
                // Playing
                if (event.data == 1) {
                  video.container.dispatchEvent(new CustomEvent('theme:media:play'), {bubbles: true});
                }

                // Paused
                if (event.data == 2) {
                  video.container.dispatchEvent(new CustomEvent('theme:media:pause'), {bubbles: true});
                }

                // Ended
                if (event.data == 0) {
                  video.container.dispatchEvent(new CustomEvent('theme:media:pause'), {bubbles: true});
                }
              },
            },
          });

          window.isYoutubeAPILoaded = true;

          if (this.autoplayVideo) {
            this.observeVideo(video, mediaId);
          }
        });

        break;
    }

    video.container.addEventListener('theme:media:visible', (event) => this.onVisible(event));
    video.container.addEventListener('theme:media:hidden', (event) => this.onHidden(event));
    video.container.addEventListener('xrLaunch', (event) => this.onHidden(event));
  }

  observeVideo(video) {
    let observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          const outsideViewport = entry.intersectionRatio == 0;
          const isVisible = !video.element.closest(selectors.mediaHidden);

          if (outsideViewport) {
            this.pauseVideo(video);
          } else if (isVisible) {
            this.playVideo(video);
          }
        });
      },
      {
        rootMargin: '200px',
        threshold: [0, 0.25, 0.75, 1],
      }
    );
    observer.observe(video.element);
  }

  playVideo(video) {
    if (video.player && video.player.playVideo) {
      video.player.playVideo();
    } else if (video.element && video.element.play) {
      video.element.play();
    } else if (video.player && video.player.play) {
      video.player.play();
    }

    video.container.dispatchEvent(new CustomEvent('theme:media:play'), {bubbles: true});
  }

  pauseVideo(video) {
    if (video.player && video.player.pauseVideo) {
      // Youtube
      if (video.player.playerInfo.playerState == '1') {
        // If Youtube video is playing
        // There is no need to trigger the 'pause' event since we are listening for it when initializing the YT Video
        video.player.pauseVideo();
      }
    } else if (video.player && video.player.pause) {
      // Vimeo
      video.player.pause();
    } else if (video.element && !video.element.paused) {
      // HTML5
      // If HTML5 video is playing (we used .paused because there is no 'playing' property)
      if (typeof video.element.pause === 'function') {
        video.element?.pause();
      }
    }
  }

  onHidden(event) {
    if (typeof event.target.dataset.mediaId !== 'undefined') {
      const mediaId = event.target.dataset.mediaId;
      const video = this.players[mediaId];
      this.pauseVideo(video);
    }
  }

  onVisible(event) {
    if (typeof event.target.dataset.mediaId !== 'undefined') {
      const mediaId = event.target.dataset.mediaId;
      const video = this.players[mediaId];

      // Using a timeout so the video "play" event can triggers after the previous video "pause" event
      // because both events change the "draggable" option of the slider and we need to time it right
      setTimeout(() => {
        this.playVideo(video);
      }, 50);

      this.pauseContainerMedia(mediaId);
    }
  }

  pauseOtherMedia(mediaId, container) {
    const currentMedia = `[${attributes.mediaId}="${mediaId}"]`;
    const otherMedia = container.querySelectorAll(`${selectors.productMediaWrapper}:not(${currentMedia})`);

    if (otherMedia.length) {
      otherMedia.forEach((media) => {
        media.dispatchEvent(new CustomEvent('theme:media:hidden'), {bubbles: true});
        media.classList.add(classes.mediaHidden);
      });
    }
  }
}

export default ProductVideo;
