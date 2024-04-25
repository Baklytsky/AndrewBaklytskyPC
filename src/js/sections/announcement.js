import Flickity from 'flickity';

import {register} from '../vendor/theme-scripts/theme-sections';
import {Ticker} from '../features/ticker';

const selectors = {
  announcement: '[data-announcement]',
  announcementSlide: '[data-announcement-slide]',
  frame: '[data-ticker-frame]',
  slide: '[data-slide]',
  slider: '[data-slider]',
  tickerScale: '[data-ticker-scale]',
  tickerText: '[data-ticker-text]',
};

const attributes = {
  slide: 'data-slide',
  speed: 'data-slider-speed',
  arrows: 'data-slider-arrows',
  stop: 'data-stop',
  style: 'style',
  targetReferrer: 'data-target-referrer',
  clipPath: 'clip-path',
};

const classes = {
  desktop: 'desktop',
  mobile: 'mobile',
  tickerAnimated: 'ticker--animated',
};

const tags = {
  clipPath: 'clipPath',
};

const sections = {};

class AnnouncementBar {
  constructor(container) {
    this.barHolder = container;
    this.locationPath = location.href;
    this.slides = this.barHolder.querySelectorAll(selectors.slide);
    this.slider = this.barHolder.querySelector(selectors.slider);
    this.tickers = [];
    this.flkty = null;

    this.init();
  }

  init() {
    this.removeAnnouncement();

    if (this.slider) {
      this.initSlider();
      document.addEventListener('theme:resize:width', this.initSlider.bind(this));
    }

    if (!this.slider) {
      this.initTickers(true);
      this.tickerAnimationPause();
    }

    this.updateSVGClipPathIDs();
  }

  /**
   * Delete announcement which has a target referrer attribute and it is not contained in page URL
   */
  removeAnnouncement() {
    for (let i = 0; i < this.slides.length; i++) {
      const element = this.slides[i];

      if (!element.hasAttribute(attributes.targetReferrer)) {
        continue;
      }

      if (this.locationPath.indexOf(element.getAttribute(attributes.targetReferrer)) === -1 && !window.Shopify.designMode) {
        element.parentNode.removeChild(element);
      }
    }
  }

  /**
   * Init slider
   */
  initSlider() {
    const slides = this.slider.querySelectorAll(selectors.slide);
    const sliderArrows = this.slider.hasAttribute(attributes.arrows);

    if (slides) {
      let slideSelector = `${selectors.slide}`;

      if (window.innerWidth < theme.sizes.small) {
        slideSelector = `${selectors.slide}:not(.${classes.desktop})`;
      } else {
        slideSelector = `${selectors.slide}:not(.${classes.mobile})`;
      }

      if (this.flkty != null) {
        this.flkty.destroy();
      }

      this.flkty = new Flickity(this.slider, {
        cellSelector: slideSelector,
        pageDots: false,
        prevNextButtons: sliderArrows,
        wrapAround: true,
        autoPlay: parseInt(this.slider.getAttribute(attributes.speed), 10),
        on: {
          ready: () => {
            setTimeout(() => {
              this.slider.dispatchEvent(
                new CustomEvent('slider-is-loaded', {
                  bubbles: true,
                  detail: {
                    slider: this,
                  },
                })
              );
            }, 10);
          },
        },
      });
      this.flkty.reposition();
    }

    this.slider.addEventListener('slider-is-loaded', () => {
      this.initTickers();
      this.updateSVGClipPathIDs();
    });
  }

  /**
   * Init tickers in sliders
   */
  initTickers(stopClone = false) {
    const frames = this.barHolder.querySelectorAll(selectors.frame);

    frames.forEach((element) => {
      const ticker = new Ticker(element, stopClone);
      this.tickers.push(ticker);

      const slides = element.querySelectorAll(selectors.slide);
      if (slides.length !== 0) {
        const slidesMobile = element.querySelectorAll(`${selectors.slide}.${classes.mobile}`);
        const slidesDesktop = element.querySelectorAll(`${selectors.slide}.${classes.desktop}`);

        if (slides.length === slidesMobile.length) {
          element.parentNode.classList.add(classes.mobile);
        } else if (slides.length === slidesDesktop.length) {
          element.parentNode.classList.add(classes.desktop);
        }
      }
    });
  }

  toggleTicker(e, isStopped) {
    const tickerScale = e.target.closest(selectors.tickerScale);
    const element = document.querySelector(`[${attributes.slide}="${e.detail.blockId}"]`);

    if (isStopped && element) {
      tickerScale.setAttribute(attributes.stop, '');
      tickerScale.querySelectorAll(selectors.tickerText).forEach((textHolder) => {
        textHolder.classList.remove(classes.tickerAnimated);
        textHolder.style.transform = `translate3d(${-(element.offsetLeft - parseInt(getComputedStyle(element).marginLeft, 10))}px, 0, 0)`;
      });
    }

    if (!isStopped && element) {
      tickerScale.querySelectorAll(selectors.tickerText).forEach((textHolder) => {
        textHolder.classList.add(classes.tickerAnimated);
        textHolder.removeAttribute(attributes.style);
      });
      tickerScale.removeAttribute(attributes.stop);
    }
  }

  tickerAnimationPause() {
    let hoverTimer = 0;
    let isHovered = false;
    const tickerContainer = this.barHolder.querySelector(selectors.announcementSlide);

    tickerContainer.addEventListener('mouseenter', () => {
      isHovered = true;

      hoverTimer = setTimeout(() => {
        if (isHovered) {
          tickerContainer.querySelectorAll(selectors.tickerText).forEach((element) => {
            element.style.animationPlayState = 'paused';
          });
        }

        clearTimeout(hoverTimer);
      }, 500);
    });

    tickerContainer.addEventListener('mouseleave', () => {
      isHovered = false;

      tickerContainer.querySelectorAll(selectors.tickerText).forEach((element) => {
        element.style.animationPlayState = 'running';
      });
    });
  }

  updateSVGClipPathIDs() {
    this.barHolder.querySelectorAll(selectors.slide).forEach((svg, index) => {
      const clipPath = svg.querySelector(tags.clipPath);

      if (clipPath) {
        const newclipPathId = `${clipPath.id}_${index}`;

        // Update the clipPath ID
        clipPath.id = newclipPathId;

        // Update the 'clip-path' URL reference in the <g> tag
        const gTag = svg.querySelector(`g[${attributes.clipPath}]`);
        if (gTag) {
          gTag.setAttribute(attributes.clipPath, `url(#${newclipPathId})`);
        }
      }
    });
  }

  onBlockSelect(evt) {
    const index = parseInt([...evt.target.parentNode.children].indexOf(evt.target));

    if (this.slider && this.flkty !== null) {
      this.flkty.select(index);
      this.flkty.pausePlayer();
    }
    if (!this.slider) {
      this.toggleTicker(evt, true);
    }
  }

  onBlockDeselect(evt) {
    if (this.slider && this.flkty !== null) {
      this.flkty.unpausePlayer();
    }
    if (!this.slider) {
      this.toggleTicker(evt, false);
    }
  }

  onUnload() {
    document.removeEventListener('theme:resize:width', this.initSlider.bind(this));

    if (this.tickers.length > 0) {
      this.tickers.forEach((ticker) => {
        ticker.unload();
      });
    }
  }
}

const announcement = {
  onLoad() {
    sections[this.id] = [];
    const element = this.container.querySelector(selectors.announcement);
    if (element) {
      sections[this.id].push(new AnnouncementBar(element));
    }
  },
  onBlockSelect(e) {
    if (sections[this.id].length) {
      sections[this.id].forEach((el) => {
        if (typeof el.onBlockSelect === 'function') {
          el.onBlockSelect(e);
        }
      });
    }
  },
  onBlockDeselect(e) {
    if (sections[this.id].length) {
      sections[this.id].forEach((el) => {
        if (typeof el.onBlockSelect === 'function') {
          el.onBlockDeselect(e);
        }
      });
    }
  },
  onUnload() {
    sections[this.id].forEach((el) => {
      if (typeof el.onUnload === 'function') {
        el.onUnload();
      }
    });
  },
};

register('announcement-bar', announcement);
register('marquee', announcement);
