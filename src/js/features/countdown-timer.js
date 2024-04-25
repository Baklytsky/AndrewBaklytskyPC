const selectors = {
  time: 'time',
  days: '[data-days]',
  hours: '[data-hours]',
  minutes: '[data-minutes]',
  seconds: '[data-seconds]',
  sectionType: '[data-section-type]',
  shopifySection: '.shopify-section',
  aosItem: '[data-aos]',
};

const classes = {
  countdownTimerShowMessage: 'countdown-timer--show-message',
  hideCountdown: 'hide-countdown',
  aosAnimate: 'aos-animate',
  aosLoading: 'aos-loading',
  countdown: 'countdown',
};

const attributes = {
  expirationBehavior: 'data-expiration-behavior',
  leadingZero: 'data-leading-zero',
};

const settings = {
  hide: 'hide',
  showMessage: 'show-message',
};

class CountdownTimer extends HTMLElement {
  constructor() {
    super();

    this.section = this.closest(selectors.sectionType);
    this.shopifySection = this.closest(selectors.shopifySection);
    this.expirationBehavior = this.getAttribute(attributes.expirationBehavior);
    this.leadingZero = this.hasAttribute(attributes.leadingZero);

    this.time = this.querySelector(selectors.time);
    // The string we're passing should be ISO 8601 compliant
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format
    this.endDate = Date.parse(this.time.dateTime);

    this.days = this.querySelector(selectors.days);
    this.hours = this.querySelector(selectors.hours);
    this.minutes = this.querySelector(selectors.minutes);
    this.seconds = this.querySelector(selectors.seconds);

    this.daysInMs = 1000 * 60 * 60 * 24;
    this.hoursInMs = this.daysInMs / 24;
    this.minutesInMs = this.hoursInMs / 60;
    this.secondsInMs = this.minutesInMs / 60;

    this.isLoading = true;
    this.shouldHideOnComplete = this.expirationBehavior === settings.hide;
    this.shouldShowMessage = this.expirationBehavior === settings.showMessage;
    this.isAnimated = false;

    this.update = this.update.bind(this);
  }

  connectedCallback() {
    this.init();
  }

  disconnectedCallback() {
    this.stopTimer();
  }

  init() {
    if (isNaN(this.endDate)) {
      this.onComplete();
      return;
    }

    if (this.endDate <= Date.now()) {
      this.onComplete();
      return;
    }

    if (this.section.classList.contains(classes.countdown)) {
      this.onLoad(true);
    }

    // Update the countdown every second
    this.interval = setInterval(this.update, 1000);
  }

  stopTimer() {
    clearInterval(this.interval);
  }

  convertTime(timeInMs) {
    const days = this.formatDigits(parseInt(timeInMs / this.daysInMs, 10));
    timeInMs -= days * this.daysInMs;
    const hours = this.formatDigits(parseInt(timeInMs / this.hoursInMs, 10));
    timeInMs -= hours * this.hoursInMs;
    const minutes = this.formatDigits(parseInt(timeInMs / this.minutesInMs, 10));
    timeInMs -= minutes * this.minutesInMs;
    const seconds = this.formatDigits(parseInt(timeInMs / this.secondsInMs, 10));

    return {
      days: days,
      hours: hours,
      minutes: minutes,
      seconds: seconds,
    };
  }

  // Make numbers less than 10 to appear with a leading zero like 01, 02, 03
  formatDigits(number) {
    if (number < 10 && this.leadingZero) number = '0' + number;
    return number;
  }

  render(timer) {
    // `textContent` is used instead of `innerText` or `innerHTML` because it doesn't trigger computationally expensive reflows.
    // https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent#differences_from_innertext
    this.days.textContent = timer.days;
    this.hours.textContent = timer.hours;
    this.minutes.textContent = timer.minutes;
    this.seconds.textContent = timer.seconds;
  }

  onComplete() {
    this.render({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });

    if (this.shouldHideOnComplete) {
      this.shopifySection.classList.add(classes.hideCountdown);
    }

    if (this.shouldShowMessage) {
      this.classList.add(classes.countdownTimerShowMessage);
    }
  }

  /**
   * Refresh animated elements when timer loads
   */
  triggerAnimations() {
    if (theme.settings.animations == 'false') return;

    this.section.querySelectorAll(selectors.aosItem).forEach((element) => {
      if (this.isAnimated) element.classList.add(classes.aosAnimate);
    });
  }

  /**
   * Remove all animated classes to reload them after the countdown loads
   */
  removeAnimations() {
    this.section.querySelectorAll(selectors.aosItem).forEach((element) => {
      requestAnimationFrame(() => {
        if (element.classList.contains(classes.aosAnimate)) {
          element.classList.remove(classes.aosAnimate);
          this.isAnimated = true;
        }
      });
    });
  }

  onLoad(init) {
    if (init) {
      // Loading state
      this.removeAnimations();
      return;
    }

    this.isLoading = false;
    this.triggerAnimations();
  }

  update() {
    const currentDate = Date.now();
    const timeDiff = this.endDate - currentDate;

    if (timeDiff <= 0) {
      this.stopTimer();
      this.onComplete();
      return;
    }

    const remainingTime = this.convertTime(timeDiff);

    this.render(remainingTime);

    if (this.isLoading) this.onLoad(false);
  }
}

export {CountdownTimer};
