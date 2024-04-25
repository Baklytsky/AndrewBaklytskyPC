import {a11y} from '../vendor/theme-scripts/theme-a11y';

import {LoadPhotoswipe} from './load-photoswipe';

const selectors = {
  videoPlay: '[data-video-play]',
};

const attributes = {
  videoPlayValue: 'data-video-play',
};

class VideoPlay {
  constructor(container) {
    this.container = container;
    this.videoPlay = this.container.querySelectorAll(selectors.videoPlay);
    this.a11y = a11y;

    this.init();
  }

  init() {
    if (this.videoPlay.length) {
      this.videoPlay.forEach((element) => {
        element.addEventListener('click', (e) => {
          if (element.hasAttribute(attributes.videoPlayValue) && element.getAttribute(attributes.videoPlayValue).trim() !== '') {
            e.preventDefault();

            const items = [
              {
                html: element.getAttribute(attributes.videoPlayValue),
              },
            ];
            this.a11y.state.trigger = element;
            new LoadPhotoswipe(items);
          }
        });
      });
    }
  }
}

const videoPlay = {
  onLoad() {
    new VideoPlay(this.container);
  },
};

export {videoPlay, VideoPlay};
