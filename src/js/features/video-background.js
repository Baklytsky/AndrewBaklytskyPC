const selectors = {
  videoId: '[data-video-id]',
  videoPlayer: '[data-video-player]',
  videoTemplate: '[data-video-template]',
  videoAutoplay: '[data-video-autoplay]',
  videoWrapper: '[data-video-wrapper]',
  videoPlayButton: '[data-video-bg-play]',
};

const classes = {
  loading: 'is-loading',
  paused: 'is-paused',
};

const sections = {};

class VideoBackground {
  constructor(container) {
    this.container = container;
    this.videoId = this.container.querySelector(selectors.videoId);
    this.videoPlayer = this.container.querySelector(selectors.videoPlayer);
    this.videoTemplate = this.container.querySelector(selectors.videoTemplate);
    this.videoPlayButton = this.container.querySelector(selectors.videoPlayButton);
    this.init();
  }

  init() {
    if (!this.videoId) return;

    /*
      Observe video element and pull it out from its template tag
    */
    const videoObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const videoMarkup = this.videoTemplate.innerHTML;
            this.videoPlayer.innerHTML = videoMarkup;
            this.video = this.container.querySelector(selectors.videoAutoplay);
            this.videoPlayer.classList.remove(classes.loading);
            this.container.classList.add(classes.paused);

            this.listen();

            // Stop observing element after it was animated
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '300px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    videoObserver.observe(this.videoPlayer);

    // Force video autoplay button
    this.videoPlayButton.addEventListener('click', (event) => {
      event.preventDefault();
      this.video?.play();
    });
  }

  listen() {
    this.video.addEventListener('play', () => {
      this.container.classList.remove(classes.paused);
    });

    // Force video autoplay on iOS when Low Power Mode is On
    this.container.addEventListener(
      'touchstart',
      () => {
        this.video.play();
      },
      {passive: true}
    );
  }
}

const videoBackground = {
  onLoad() {
    sections[this.id] = [];
    const videoWrappers = this.container.querySelectorAll(selectors.videoWrapper);
    videoWrappers.forEach((videoWrapper) => {
      sections[this.id].push(new VideoBackground(videoWrapper));
    });
  },
};

export default videoBackground;
